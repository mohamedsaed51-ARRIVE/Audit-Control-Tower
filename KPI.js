/**
 * ==========================================================
 * ARRIVE Audit Management System (AAMS)
 * File    : KPI.gs
 * Version : 4.1 Enterprise — KPI Engine
 * ==========================================================
 *
 * Builds the "KPIs" sheet from the current operational data
 * (Day sheet, Open Cases, Missing, Repeated, History) and
 * returns a structured object shaped for a future Dashboard API.
 *
 * PUBLIC ENTRY POINT — DO NOT RENAME: buildKPIs()
 * Called from Menu.js ("📊 تحديث KPIs"). No other public symbol
 * is required by the rest of the project.
 *
 * BACKWARD COMPATIBILITY
 * - Every KPI computed by v4.0 is still computed and still written
 *   to the sheet — nothing was removed.
 * - Import.js, OpenCases.js, Missing.js, Repeated.js, History.js,
 *   Menu.js and Config.js are only ever READ by this file, never
 *   written to, and are untouched by this refactor.
 * - Dashboard.js is intentionally not wired up yet. buildKPIs()
 *   now returns a structured object (see buildStructuredResult_)
 *   in the exact shape Dashboard.js will need to expose as JSON.
 *
 * COLUMN-NAME RECONCILIATION (v4.1) — please read
 * This revision was asked to switch two fields to different Arabic
 * headers: shipment reason -> "سبب الحالة", and shipment age ->
 * calculated from a pickup-date column "تاريخ استلام البيك أب".
 * I could not find either header anywhere in the uploaded Import.js /
 * OpenCases.js / Missing.js / Repeated.js / Config.js — only "حالة
 * الشحنة" (CONFIG.COLS.STATUS) and no pickup-date field at all (see
 * the full grep results in the accompanying report). Two of the
 * other names given as examples in the same request — "تعليق
 * الأوديت" and "فرع العضو" — DO already match CONFIG.COLS exactly,
 * so those needed no change.
 *
 * Since I can't inspect the live spreadsheet (only the Apps Script
 * source), I did not blindly swap the column keys — that would risk
 * every dependent KPI silently reading as 0/n/a if these headers
 * turn out not to exist yet. Instead this version tries the
 * requested header FIRST and transparently falls back to the
 * previously-verified one if the sheet doesn't have it yet, via
 * resolveColumn_(). Shipment age now comes directly from the pickup
 * date whenever that column is present (per this request); if it
 * isn't, the file falls back to the same Open-Cases-age proxy v4.0
 * used, so nothing breaks either way. See the report for exactly
 * which path is live in your sheet today.
 * ==========================================================
 */

// ============================================================
// 1. CONFIGURATION — every tunable value lives here, nothing
//    below this block is a magic number.
// ============================================================

// ---- Sheet column headers not yet promoted into Config.js ----
// KPI.js is the only file this task allows us to modify, so these
// stay local rather than joining CONFIG.COLS. Every other backend
// file already writes/reads these exact headers (verified against
// Import.js / OpenCases.js / Missing.js / Repeated.js) — recommend
// promoting them into Config.js in a future pass so there is one
// shared source of truth for column names.
const KPI_LOCAL_COLS = {
  OPEN_CASE_AGE_DAYS: "عدد الأيام",              // Open Cases sheet (OpenCases.js)
  OPEN_CASE_BRANCH: "الفرع",                      // Open Cases sheet (OpenCases.js)
  MISSING_CASE_AGE_DAYS: "عدد الأيام المفقودة",   // Missing sheet (Missing.js)
  MISSING_BRANCH: "آخر فرع",                      // Missing sheet (Missing.js)
  REPEAT_OCCURRENCES: "عدد مرات الظهور",          // Repeated sheet (Repeated.js)
  REPEATED_BRANCH: "آخر فرع",                     // Repeated sheet (Repeated.js)
  LAST_STATUS_DATE: "تاريخ اخر حالة",             // Day sheet — legacy field, see report

  // --- v4.1 requested headers — NOT found in the uploaded backend code.
  //     Tried first; resolveColumn_() falls back to the verified name
  //     on its right if the sheet doesn't have it yet. See header note.
  SHIPMENT_REASON: "سبب الحالة",                  // preferred -> falls back to CONFIG.COLS.STATUS ("حالة الشحنة")
  PICKUP_DATE: "تاريخ استلام البيك أب"            // preferred -> falls back to Open-Cases age proxy (عدد الأيام)
};

// ---- KPI sheet output schema ----
const KPI_OUTPUT_HEADERS = ["Category", "KPI", "Value", "Unit", "Last Update"];

// ---- Enterprise KPI categories (v4 taxonomy) ----
const KPI_CATEGORY = {
  EXECUTIVE: "Executive",
  OPERATIONS: "Operations",
  AUDIT: "Audit",
  QUALITY: "Quality",
  BRANCH: "Branch Performance",
  TIME: "Time"
};

const KPI_UNIT = {
  SHIPMENTS: "Shipments",
  CASES: "Cases",
  DAYS: "Days",
  PERCENT: "%",
  OCCURRENCES: "Occurrences",
  SCORE: "Score",
  STATUS: "Status",
  BRANCH: "Branch",
  TEXT: "Text",
  DELTA: "Delta"
};

// ---- Business thresholds ----
const CRITICAL_SHIPMENT_AGE_DAYS = 25;   // "critical" = open case older than this
const UNKNOWN_BRANCH_LABEL = "غير محدد"; // fallback when a branch cell is blank
const TOP_N_FOR_CHARTS = 5;              // depth of "most common" chart breakdowns

// ---- Health Score engine config (isolated + tunable) ----
// score = closeRate
//         − missingRate  * WEIGHTS.MISSING
//         − repeatedRate * WEIGHTS.REPEATED
//         − criticalRate * WEIGHTS.CRITICAL
//         − max(0, avgOpenAge − OPEN_AGE_GRACE_DAYS) * WEIGHTS.OPEN_AGE
// then clamped to [0, 100]. Same formula is reused for the
// company-wide score and every branch's score — see computeHealthScore_().
const HEALTH_SCORE_CONFIG = {
  BASE_METRIC: "closeRate",
  WEIGHTS: {
    MISSING: 0.6,
    REPEATED: 0.4,
    CRITICAL: 0.8,
    OPEN_AGE: 1.2
  },
  OPEN_AGE_GRACE_DAYS: 10,
  THRESHOLDS: {
    GOOD: 80,
    WARNING: 60
  },
  STATUS: {
    GOOD: "Good",
    WARNING: "Warning",
    CRITICAL: "Critical"
  }
};

const KPI_MS_PER_DAY_ = 1000 * 60 * 60 * 24;

// ============================================================
// 2. PUBLIC ENTRY POINT
// ============================================================

function buildKPIs() {

  const lock = Utils.lock();

  try {

    const now = Utils.today();
    const timestamp = Utils.formatDate(now);

    // ---- Load every source sheet exactly once ----
    const src = loadSourceData_();

    // ---- Capture the previous run's output before we overwrite it ----
    // (used only to compute the Open Case Trend — see computeOpenCaseTrend_)
    const previousValues = readPreviousKpiValues_(src.kpiSheet);

    // ---- Shared branch accumulator ----
    // Every compute*_ function below writes its own metrics into this
    // single map (keyed by branch name) as it makes its one pass over
    // its sheet, so branch aggregation costs zero extra loops.
    const branchIndex = {};

    // ---- Core metric groups (each sheet scanned exactly once) ----
    const shipmentStats = computeShipmentStats_(src.dayData, src.dayMap, branchIndex, now);

    // Critical Shipments: use pickup-date age when the Day sheet has that
    // column (per this revision's request); otherwise fall back to the
    // Open-Cases age proxy used previously. Only one source ever counts
    // toward branchIndex[].critical — see the flag passed below.
    const useOpenCaseAgeProxy = !shipmentStats.shipmentAge.available;
    const openCaseStats = computeOpenCaseStats_(src.openData, src.openMap, branchIndex, useOpenCaseAgeProxy);

    const missingStats = computeMissingStats_(src.missingData, src.missingMap, branchIndex);
    const repeatedStats = computeRepeatedStats_(src.repeatedData, src.repeatedMap, branchIndex);
    const archiveStats = computeArchiveStats_(); // optional / resilient

    const total = shipmentStats.total;
    const closed = shipmentStats.closed;
    const openCases = openCaseStats.count;
    const missing = missingStats.count;
    const repeated = repeatedStats.count;

    const criticalCount = useOpenCaseAgeProxy ? openCaseStats.criticalCount : shipmentStats.shipmentAge.criticalCount;

    const closeRate = percent_(closed, total);
    const missingRate = percent_(missing, total);
    const repeatedRate = percent_(repeated, total);
    const criticalRate = percent_(criticalCount, total);

    // ---- Company-wide Health Score (isolated engine, see below) ----
    const companyHealth = computeHealthScore_({
      closeRate: closeRate,
      missingRate: missingRate,
      repeatedRate: repeatedRate,
      criticalRate: criticalRate,
      avgOpenAge: openCaseStats.avgAge
    });

    // ---- Average Shipment Age ----
    // Authoritative source: pickup date across ALL of today's shipments,
    // when the Day sheet has that column. Fallback: weighted average age
    // across unresolved shipments (open + missing), same as v4.0.
    const unresolvedCount = openCases + missing;
    const avgShipmentAge = shipmentStats.shipmentAge.available
      ? shipmentStats.shipmentAge.avgAge
      : (unresolvedCount > 0
          ? round1_(((openCaseStats.avgAge * openCases) + (missingStats.avgAge * missing)) / unresolvedCount)
          : 0);

    // ---- Branch Ranking Engine ----
    const rankedBranches = rankBranches_(branchIndex);
    const branchLeaders = pickBranchLeaders_(rankedBranches);

    // ---- Reason Analysis Engine ----
    const topReason = topEntry_(shipmentStats.reasonFreq);
    const topComment = topEntry_(shipmentStats.commentFreq);

    // ---- Open Case Trend (compares against the previous run) ----
    const openCaseTrend = computeOpenCaseTrend_(previousValues, openCases);

    // ============================================================
    // 3. Flat rows for the KPIs sheet — Category | KPI | Value | Unit | Last Update
    //    Every v3 metric is preserved below; only its Category label
    //    changes to fit the new taxonomy.
    // ============================================================
    const rows = buildFlatRows_({
      timestamp: timestamp,
      total: total,
      openCases: openCases,
      closed: closed,
      missing: missing,
      repeated: repeated,
      criticalCount: criticalCount,
      companyHealth: companyHealth,
      oldestOpenCase: openCaseStats.maxAge,
      openCaseTrend: openCaseTrend,
      archiveStats: archiveStats,
      topComment: topComment,
      closeRate: closeRate,
      missingRate: missingRate,
      repeatedRate: repeatedRate,
      avgRepeatOccurrences: repeatedStats.avgOccurrences,
      topReason: topReason,
      branchLeaders: branchLeaders,
      avgCloseDays: shipmentStats.avgCloseDays,
      avgBranchResponseDays: shipmentStats.avgBranchResponseDays,
      avgOpenAge: openCaseStats.avgAge,
      avgShipmentAge: avgShipmentAge
    });

    // ---- Persist to the KPIs sheet ----
    const values = [KPI_OUTPUT_HEADERS].concat(rows);
    Utils.write(src.kpiSheet, values);

    Utils.logAction("KPIs", "KPIs Updated (" + rows.length + " metrics, " + rankedBranches.length + " branches)");
    Utils.success("KPIs", "تم تحديث مؤشرات الأداء.");

    // ============================================================
    // 4. Structured result — ready for the future Dashboard API.
    //    Dashboard.js is not wired to this yet (by design), but the
    //    shape below is exactly what it will be able to JSON.stringify.
    // ============================================================
    return buildStructuredResult_({
      timestamp: timestamp,
      total: total,
      openCases: openCases,
      closed: closed,
      missing: missing,
      repeated: repeated,
      criticalCount: criticalCount,
      companyHealth: companyHealth,
      oldestOpenCase: openCaseStats.maxAge,
      openCaseTrend: openCaseTrend,
      archiveStats: archiveStats,
      topComment: topComment,
      topReason: topReason,
      closeRate: closeRate,
      missingRate: missingRate,
      repeatedRate: repeatedRate,
      avgRepeatOccurrences: repeatedStats.avgOccurrences,
      avgCloseDays: shipmentStats.avgCloseDays,
      avgBranchResponseDays: shipmentStats.avgBranchResponseDays,
      avgOpenAge: openCaseStats.avgAge,
      avgShipmentAge: avgShipmentAge,
      shipmentAgeSource: shipmentStats.shipmentAge.available ? "pickupDate" : "openCaseAgeProxy",
      rankedBranches: rankedBranches,
      branchLeaders: branchLeaders,
      reasonFreq: shipmentStats.reasonFreq,
      commentFreq: shipmentStats.commentFreq
    });

  } catch (e) {

    Utils.logError("KPIs", e.toString());
    Utils.error(e.toString());

  } finally {

    Utils.unlock(lock);

  }

}

// ============================================================
// 5. DATA LOADING — every sheet is read exactly once here.
// ============================================================

function loadSourceData_() {

  const daySheet = Utils.currentDaySheet();
  const openSheet = Utils.sheet(CONFIG.SHEETS.OPEN_CASES);
  const missingSheet = Utils.sheet(CONFIG.SHEETS.MISSING);
  const repeatedSheet = Utils.sheet(CONFIG.SHEETS.REPEATED);
  const kpiSheet = Utils.sheet(CONFIG.SHEETS.KPIS);

  return {
    daySheet: daySheet,
    dayData: Utils.read(daySheet),
    dayMap: Utils.headerMap(daySheet),

    openSheet: openSheet,
    openData: Utils.read(openSheet),
    openMap: Utils.headerMap(openSheet),

    missingSheet: missingSheet,
    missingData: Utils.read(missingSheet),
    missingMap: Utils.headerMap(missingSheet),

    repeatedSheet: repeatedSheet,
    repeatedData: Utils.read(repeatedSheet),
    repeatedMap: Utils.headerMap(repeatedSheet),

    kpiSheet: kpiSheet
  };

}

/**
 * Reads whatever is currently on the KPIs sheet BEFORE buildKPIs()
 * overwrites it, so computeOpenCaseTrend_() can compare against the
 * previous run. Returns null if the sheet is empty/new.
 */
function readPreviousKpiValues_(kpiSheet) {

  if (kpiSheet.getLastRow() < 2) return null;

  try {
    return Utils.read(kpiSheet);
  } catch (e) {
    return null;
  }

}

// ============================================================
// 6. CORE METRIC COMPUTATION — one pass per sheet.
// ============================================================

/**
 * Day-sheet pass: shipment totals, close performance, average branch
 * response time, the Reason Analysis Engine's two frequency maps, and
 * — when the pickup-date column is present — true shipment age and
 * Critical Shipments computed directly from "تاريخ استلام البيك أب"
 * (see the v4.1 header note). Also feeds branchIndex.
 */
function computeShipmentStats_(dayData, dayMap, branchIndex, now) {

  const awbCol = dayMap[CONFIG.COLS.AWB];
  const statusCol = dayMap[CONFIG.COLS.AUDIT_STATUS];
  const closeDateCol = dayMap[CONFIG.COLS.CLOSE_DATE];
  const lastStatusDateCol = dayMap[KPI_LOCAL_COLS.LAST_STATUS_DATE];
  const branchCol = dayMap[CONFIG.COLS.BRANCH];
  const replyDateCol = dayMap[CONFIG.COLS.REPLY_DATE];
  const reasonCol = resolveColumn_(dayMap, KPI_LOCAL_COLS.SHIPMENT_REASON, CONFIG.COLS.STATUS);
  const commentCol = dayMap[CONFIG.COLS.AUDIT_COMMENT];
  const pickupDateCol = dayMap[KPI_LOCAL_COLS.PICKUP_DATE];
  const pickupAgeAvailable = pickupDateCol !== undefined;

  let total = 0;
  let closed = 0;
  let totalCloseDays = 0;
  let totalResponseDays = 0;
  let responseSamples = 0;

  let pickupAgeSum = 0;
  let pickupAgeSamples = 0;
  let pickupAgeMax = 0;
  let pickupCriticalCount = 0;

  const reasonFreq = {};
  const commentFreq = {};

  for (let i = 1; i < dayData.length; i++) {

    const row = dayData[i];
    const awb = String(row[awbCol]).trim();
    if (!awb) continue;

    total++;

    const branchName = branchNameOf_(row, branchCol);
    const branch = ensureBranch_(branchIndex, branchName);
    branch.shipments++;

    freqIncrement_(reasonFreq, row[reasonCol]);
    freqIncrement_(commentFreq, row[commentCol]);

    // Shipment age directly from pickup date, per this revision's request.
    // Only runs when the column actually exists on this sheet.
    if (pickupAgeAvailable) {
      const pickupDate = row[pickupDateCol];
      if (pickupDate instanceof Date) {
        const age = Math.floor((now - pickupDate) / KPI_MS_PER_DAY_);
        pickupAgeSum += age;
        pickupAgeSamples++;
        if (age > pickupAgeMax) pickupAgeMax = age;
        if (age > CRITICAL_SHIPMENT_AGE_DAYS) {
          pickupCriticalCount++;
          branch.critical++;
        }
      }
    }

    const lastStatusDate = lastStatusDateCol !== undefined ? row[lastStatusDateCol] : null;

    // Average Branch Response Time = reply date − last status date,
    // for any row that has actually received a branch reply.
    const replyDate = replyDateCol !== undefined ? row[replyDateCol] : null;
    if (lastStatusDate instanceof Date && replyDate instanceof Date) {
      totalResponseDays += Math.floor((replyDate - lastStatusDate) / KPI_MS_PER_DAY_);
      responseSamples++;
    }

    const status = String(row[statusCol]).trim();
    if (status !== CONFIG.AUDIT_STATUS.CLOSED) continue;

    closed++;
    branch.closed++;

    const closeDate = row[closeDateCol];
    if (lastStatusDate instanceof Date && closeDate instanceof Date) {
      totalCloseDays += Math.floor((closeDate - lastStatusDate) / KPI_MS_PER_DAY_);
    }

  }

  return {
    total: total,
    closed: closed,
    avgCloseDays: closed > 0 ? round1_(totalCloseDays / closed) : 0,
    avgBranchResponseDays: responseSamples > 0 ? round1_(totalResponseDays / responseSamples) : 0,
    reasonFreq: reasonFreq,
    commentFreq: commentFreq,
    // Pickup-date-based shipment age — authoritative when available.
    shipmentAge: {
      available: pickupAgeAvailable && pickupAgeSamples > 0,
      avgAge: pickupAgeSamples > 0 ? round1_(pickupAgeSum / pickupAgeSamples) : 0,
      maxAge: pickupAgeMax,
      criticalCount: pickupCriticalCount
    }
  };

}

/**
 * Open Cases pass: count, average age, and oldest open case (still
 * driven by "عدد الأيام" — this is case-management age, a distinct
 * metric from shipment age). Critical Shipments is only counted here
 * as a FALLBACK, when `useAgeProxyForCritical` is true (i.e. the Day
 * sheet has no pickup-date column yet — see computeShipmentStats_).
 * Also feeds branchIndex.
 */
function computeOpenCaseStats_(openData, openMap, branchIndex, useAgeProxyForCritical) {

  const ageCol = openMap[KPI_LOCAL_COLS.OPEN_CASE_AGE_DAYS];
  const branchCol = openMap[KPI_LOCAL_COLS.OPEN_CASE_BRANCH];
  const count = Math.max(openData.length - 1, 0);

  let sum = 0;
  let maxAge = 0;
  let criticalCount = 0;

  if (count > 0) {

    for (let i = 1; i < openData.length; i++) {

      const age = ageCol !== undefined ? (Number(openData[i][ageCol]) || 0) : 0;
      sum += age;
      if (age > maxAge) maxAge = age;

      const branchName = branchNameOf_(openData[i], branchCol);
      const branch = ensureBranch_(branchIndex, branchName);
      branch.openCases++;
      branch.openAgeSum += age;

      if (useAgeProxyForCritical && age > CRITICAL_SHIPMENT_AGE_DAYS) {
        criticalCount++;
        branch.critical++;
      }

    }

  }

  return {
    count: count,
    avgAge: count > 0 && ageCol !== undefined ? round1_(sum / count) : 0,
    maxAge: maxAge,
    criticalCount: criticalCount
  };

}

/**
 * Missing-sheet pass: count and average days missing. Also feeds
 * branchIndex.
 */
function computeMissingStats_(missingData, missingMap, branchIndex) {

  const ageCol = missingMap[KPI_LOCAL_COLS.MISSING_CASE_AGE_DAYS];
  const branchCol = missingMap[KPI_LOCAL_COLS.MISSING_BRANCH];
  const count = Math.max(missingData.length - 1, 0);

  let sum = 0;

  if (count > 0) {

    for (let i = 1; i < missingData.length; i++) {

      const age = ageCol !== undefined ? (Number(missingData[i][ageCol]) || 0) : 0;
      sum += age;

      const branchName = branchNameOf_(missingData[i], branchCol);
      ensureBranch_(branchIndex, branchName).missing++;

    }

  }

  return {
    count: count,
    avgAge: count > 0 && ageCol !== undefined ? round1_(sum / count) : 0
  };

}

/**
 * Repeated-sheet pass: count and average occurrence count. Also
 * feeds branchIndex.
 */
function computeRepeatedStats_(repeatedData, repeatedMap, branchIndex) {

  const occCol = repeatedMap[KPI_LOCAL_COLS.REPEAT_OCCURRENCES];
  const branchCol = repeatedMap[KPI_LOCAL_COLS.REPEATED_BRANCH];
  const count = Math.max(repeatedData.length - 1, 0);

  let sum = 0;

  if (count > 0) {

    for (let i = 1; i < repeatedData.length; i++) {

      sum += occCol !== undefined ? (Number(repeatedData[i][occCol]) || 0) : 0;

      const branchName = branchNameOf_(repeatedData[i], branchCol);
      ensureBranch_(branchIndex, branchName).repeated++;

    }

  }

  return {
    count: count,
    avgOccurrences: count > 0 && occCol !== undefined ? round1_(sum / count) : 0
  };

}

/**
 * History sheet row count (all-time archived/closed cases). Uses
 * getLastRow() instead of a full read — no need to pull the whole
 * archive into memory just to count it. Wrapped defensively: History
 * wasn't part of buildKPIs()'s original dependencies, so if it's ever
 * missing/renamed this KPI is simply omitted rather than failing the
 * whole KPI build.
 */
function computeArchiveStats_() {

  try {
    const historySheet = Utils.sheet(CONFIG.SHEETS.HISTORY);
    return { available: true, count: Math.max(historySheet.getLastRow() - 1, 0) };
  } catch (e) {
    return { available: false, count: 0 };
  }

}

// ============================================================
// 7. HEALTH SCORE ENGINE — isolated, configurable, reused for
//    both the company-wide score and every branch's score.
// ============================================================

function computeHealthScore_(stats) {

  const w = HEALTH_SCORE_CONFIG.WEIGHTS;

  const openAgePenalty = Math.max(0, (stats.avgOpenAge || 0) - HEALTH_SCORE_CONFIG.OPEN_AGE_GRACE_DAYS) * w.OPEN_AGE;

  let score = (stats.closeRate || 0)
    - (stats.missingRate || 0) * w.MISSING
    - (stats.repeatedRate || 0) * w.REPEATED
    - (stats.criticalRate || 0) * w.CRITICAL
    - openAgePenalty;

  score = clamp_(Math.round(score), 0, 100);

  let status = HEALTH_SCORE_CONFIG.STATUS.CRITICAL;
  if (score >= HEALTH_SCORE_CONFIG.THRESHOLDS.GOOD) {
    status = HEALTH_SCORE_CONFIG.STATUS.GOOD;
  } else if (score >= HEALTH_SCORE_CONFIG.THRESHOLDS.WARNING) {
    status = HEALTH_SCORE_CONFIG.STATUS.WARNING;
  }

  return { score: score, status: status };

}

// ============================================================
// 8. BRANCH RANKING ENGINE
// ============================================================

function ensureBranch_(branchIndex, name) {

  if (!branchIndex[name]) {
    branchIndex[name] = {
      shipments: 0,
      closed: 0,
      openCases: 0,
      openAgeSum: 0,
      missing: 0,
      repeated: 0,
      critical: 0
    };
  }

  return branchIndex[name];

}

function branchNameOf_(row, branchCol) {

  if (branchCol === undefined) return UNKNOWN_BRANCH_LABEL;
  const name = String(row[branchCol]).trim();
  return name || UNKNOWN_BRANCH_LABEL;

}

/**
 * Converts the shared branchIndex accumulator into a ranked array:
 * [{ branch, shipments, openCases, missing, repeated, critical,
 *    healthScore, healthStatus }], sorted by healthScore (desc).
 */
function rankBranches_(branchIndex) {

  return Object.keys(branchIndex).map(function (name) {

    const b = branchIndex[name];
    const closeRate = percent_(b.closed, b.shipments);
    const missingRate = percent_(b.missing, b.shipments);
    const repeatedRate = percent_(b.repeated, b.shipments);
    const criticalRate = percent_(b.critical, b.shipments);
    const avgOpenAge = b.openCases > 0 ? round1_(b.openAgeSum / b.openCases) : 0;

    const health = computeHealthScore_({
      closeRate: closeRate,
      missingRate: missingRate,
      repeatedRate: repeatedRate,
      criticalRate: criticalRate,
      avgOpenAge: avgOpenAge
    });

    return {
      branch: name,
      shipments: b.shipments,
      openCases: b.openCases,
      missing: b.missing,
      repeated: b.repeated,
      critical: b.critical,
      healthScore: health.score,
      healthStatus: health.status
    };

  }).sort(function (a, b) {
    return b.healthScore - a.healthScore;
  });

}

/**
 * Picks Top Branch / Worst Branch (ranked among branches that had at
 * least one shipment today, so the comparison is meaningful) plus Top
 * Missing Branch and Top Repeated Branch (ranked across all branches,
 * since a branch can accumulate missing/repeated cases without having
 * a shipment today).
 */
function pickBranchLeaders_(rankedBranches) {

  const withVolume = rankedBranches.filter(function (b) { return b.shipments > 0; });

  const topBranch = withVolume.length > 0 ? withVolume[0] : null;
  const worstBranch = withVolume.length > 0 ? withVolume[withVolume.length - 1] : null;

  const topMissingBranch = maxBy_(rankedBranches, "missing");
  const topRepeatedBranch = maxBy_(rankedBranches, "repeated");

  return {
    topBranch: topBranch,
    worstBranch: worstBranch,
    topMissingBranch: topMissingBranch,
    topRepeatedBranch: topRepeatedBranch
  };

}

function maxBy_(list, field) {

  if (!list || list.length === 0) return null;

  let best = null;
  for (let i = 0; i < list.length; i++) {
    if (list[i][field] > 0 && (best === null || list[i][field] > best[field])) {
      best = list[i];
    }
  }
  return best;

}

// ============================================================
// 9. OPEN CASE TREND — compares this run's Open Cases count to
//    the value stored on the KPIs sheet by the previous run.
//    Handles both this version's 5-column layout and the older
//    2-column ("KPI | Value") layout it may still find on first
//    run after upgrading.
// ============================================================

function computeOpenCaseTrend_(previousValues, currentOpenCases) {

  const OPEN_CASES_LABEL = "الحالات المفتوحة";
  const previous = findPreviousKpiValue_(previousValues, OPEN_CASES_LABEL);

  if (previous === null) {
    return { previous: null, current: currentOpenCases, delta: null, direction: "unknown" };
  }

  const delta = currentOpenCases - previous;
  const direction = delta > 0 ? "up" : (delta < 0 ? "down" : "flat");

  return { previous: previous, current: currentOpenCases, delta: delta, direction: direction };

}

function findPreviousKpiValue_(previousValues, kpiLabel) {

  if (!previousValues || previousValues.length < 2) return null;

  const header = previousValues[0];
  const isNewSchema = String(header[0]).trim() === KPI_OUTPUT_HEADERS[0]; // "Category"
  const kpiCol = isNewSchema ? 1 : 0;
  const valueCol = isNewSchema ? 2 : 1;

  for (let i = 1; i < previousValues.length; i++) {
    if (String(previousValues[i][kpiCol]).trim() === kpiLabel) {
      const value = Number(previousValues[i][valueCol]);
      return isNaN(value) ? null : value;
    }
  }

  return null;

}

// ============================================================
// 10. SHARED HELPERS
// ============================================================

function kpiRow_(category, kpi, value, unit, lastUpdate) {
  return [category, kpi, value, unit, lastUpdate];
}

function round1_(n) {
  return Math.round(n * 10) / 10;
}

function clamp_(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/** Percentage helper shared by every rate calculation — avoids div/0. */
/**
 * Resolves a column index trying `preferredKey` first, falling back to
 * `fallbackKey` if the sheet doesn't have the preferred header. Lets
 * KPI.js adopt a newly-requested header without breaking on sheets
 * that still use the previously-verified one. Returns undefined if
 * neither header exists on this sheet.
 */
function resolveColumn_(headerMap, preferredKey, fallbackKey) {

  if (headerMap[preferredKey] !== undefined) return headerMap[preferredKey];
  if (fallbackKey !== undefined && headerMap[fallbackKey] !== undefined) return headerMap[fallbackKey];
  return undefined;

}

function percent_(part, total) {
  return total > 0 ? round1_((part / total) * 100) : 0;
}

function freqIncrement_(map, rawKey) {

  const key = String(rawKey || "").trim();
  if (!key) return;
  map[key] = (map[key] || 0) + 1;

}

/** Most frequent entry in a frequency map, or null if the map is empty. */
function topEntry_(freqMap) {

  let bestLabel = null;
  let bestCount = 0;

  Object.keys(freqMap).forEach(function (label) {
    if (freqMap[label] > bestCount) {
      bestCount = freqMap[label];
      bestLabel = label;
    }
  });

  return bestLabel === null ? null : { label: bestLabel, count: bestCount };

}

/** Top N entries in a frequency map, sorted descending — used for charts. */
function topNEntries_(freqMap, n) {

  return Object.keys(freqMap)
    .map(function (label) { return { label: label, count: freqMap[label] }; })
    .sort(function (a, b) { return b.count - a.count; })
    .slice(0, n);

}

// ============================================================
// 11. OUTPUT BUILDERS
// ============================================================

/**
 * Assembles the flat [Category, KPI, Value, Unit, Last Update] rows
 * written to the KPIs sheet. Every v3 metric is present; only its
 * Category changed to fit the new taxonomy (see header comment).
 */
function buildFlatRows_(d) {

  const t = d.timestamp;
  const rows = [];

  // ---- Executive ----
  rows.push(kpiRow_(KPI_CATEGORY.EXECUTIVE, "إجمالي الشحنات", d.total, KPI_UNIT.SHIPMENTS, t));
  rows.push(kpiRow_(KPI_CATEGORY.EXECUTIVE, "الحالات المفتوحة", d.openCases, KPI_UNIT.CASES, t));
  rows.push(kpiRow_(KPI_CATEGORY.EXECUTIVE, "الحالات المغلقة", d.closed, KPI_UNIT.CASES, t));
  rows.push(kpiRow_(KPI_CATEGORY.EXECUTIVE, "Critical Shipments (>" + CRITICAL_SHIPMENT_AGE_DAYS + " days)", d.criticalCount, KPI_UNIT.SHIPMENTS, t));
  rows.push(kpiRow_(KPI_CATEGORY.EXECUTIVE, "Company Health Score", d.companyHealth.score, KPI_UNIT.SCORE, t));
  rows.push(kpiRow_(KPI_CATEGORY.EXECUTIVE, "Company Health Status", d.companyHealth.status, KPI_UNIT.STATUS, t));

  // ---- Operations ----
  rows.push(kpiRow_(KPI_CATEGORY.OPERATIONS, "Missing", d.missing, KPI_UNIT.CASES, t));
  rows.push(kpiRow_(KPI_CATEGORY.OPERATIONS, "Repeated", d.repeated, KPI_UNIT.CASES, t));
  rows.push(kpiRow_(KPI_CATEGORY.OPERATIONS, "أقدم حالة مفتوحة", d.oldestOpenCase, KPI_UNIT.DAYS, t));
  rows.push(kpiRow_(
    KPI_CATEGORY.OPERATIONS,
    "Open Case Trend",
    d.openCaseTrend.delta === null ? "n/a" : d.openCaseTrend.delta,
    KPI_UNIT.DELTA,
    t
  ));

  // ---- Audit ----
  rows.push(kpiRow_(KPI_CATEGORY.AUDIT, "Most Common Audit Comment", d.topComment ? d.topComment.label : "n/a", KPI_UNIT.TEXT, t));
  if (d.archiveStats.available) {
    rows.push(kpiRow_(KPI_CATEGORY.AUDIT, "إجمالي الحالات المؤرشفة", d.archiveStats.count, KPI_UNIT.CASES, t));
  }

  // ---- Quality ----
  rows.push(kpiRow_(KPI_CATEGORY.QUALITY, "نسبة الغلق", d.closeRate, KPI_UNIT.PERCENT, t));
  rows.push(kpiRow_(KPI_CATEGORY.QUALITY, "نسبة حالات الفقد", d.missingRate, KPI_UNIT.PERCENT, t));
  rows.push(kpiRow_(KPI_CATEGORY.QUALITY, "نسبة التكرار", d.repeatedRate, KPI_UNIT.PERCENT, t));
  rows.push(kpiRow_(KPI_CATEGORY.QUALITY, "متوسط عدد مرات التكرار", d.avgRepeatOccurrences, KPI_UNIT.OCCURRENCES, t));
  rows.push(kpiRow_(KPI_CATEGORY.QUALITY, "Most Common Shipment Reason", d.topReason ? d.topReason.label : "n/a", KPI_UNIT.TEXT, t));

  // ---- Branch Performance ----
  rows.push(kpiRow_(KPI_CATEGORY.BRANCH, "Top Branch", d.branchLeaders.topBranch ? d.branchLeaders.topBranch.branch : "n/a", KPI_UNIT.BRANCH, t));
  rows.push(kpiRow_(KPI_CATEGORY.BRANCH, "Worst Branch", d.branchLeaders.worstBranch ? d.branchLeaders.worstBranch.branch : "n/a", KPI_UNIT.BRANCH, t));
  rows.push(kpiRow_(KPI_CATEGORY.BRANCH, "Top Missing Branch", d.branchLeaders.topMissingBranch ? d.branchLeaders.topMissingBranch.branch : "n/a", KPI_UNIT.BRANCH, t));
  rows.push(kpiRow_(KPI_CATEGORY.BRANCH, "Top Repeated Branch", d.branchLeaders.topRepeatedBranch ? d.branchLeaders.topRepeatedBranch.branch : "n/a", KPI_UNIT.BRANCH, t));

  // ---- Time ----
  rows.push(kpiRow_(KPI_CATEGORY.TIME, "متوسط أيام الغلق", d.avgCloseDays, KPI_UNIT.DAYS, t));
  rows.push(kpiRow_(KPI_CATEGORY.TIME, "Average Branch Response Time", d.avgBranchResponseDays, KPI_UNIT.DAYS, t));
  rows.push(kpiRow_(KPI_CATEGORY.TIME, "متوسط عمر الحالات المفتوحة", d.avgOpenAge, KPI_UNIT.DAYS, t));
  rows.push(kpiRow_(KPI_CATEGORY.TIME, "Average Shipment Age", d.avgShipmentAge, KPI_UNIT.DAYS, t));

  return rows;

}

/**
 * Builds the structured object returned by buildKPIs(), in the exact
 * shape requested for the future Dashboard API:
 *   { executive, operations, audit, quality, branches, charts, generatedAt }
 */
function buildStructuredResult_(d) {

  return {

    executive: {
      totalShipments: d.total,
      openCases: d.openCases,
      closedToday: d.closed,
      criticalShipments: d.criticalCount,
      healthScore: d.companyHealth.score,
      healthStatus: d.companyHealth.status
    },

    operations: {
      missing: d.missing,
      repeated: d.repeated,
      oldestOpenCaseDays: d.oldestOpenCase,
      openCaseTrend: d.openCaseTrend
    },

    audit: {
      mostCommonAuditComment: d.topComment,
      archivedCases: d.archiveStats.available ? d.archiveStats.count : null
    },

    quality: {
      closeRate: d.closeRate,
      missingRate: d.missingRate,
      repeatedRate: d.repeatedRate,
      avgRepeatOccurrences: d.avgRepeatOccurrences,
      mostCommonShipmentReason: d.topReason
    },

    time: {
      avgCaseClosureDays: d.avgCloseDays,
      avgBranchResponseDays: d.avgBranchResponseDays,
      avgOpenCaseAgeDays: d.avgOpenAge,
      avgShipmentAgeDays: d.avgShipmentAge,
      avgShipmentAgeSource: d.shipmentAgeSource // "pickupDate" | "openCaseAgeProxy" — see v4.1 header note
    },

    branches: d.rankedBranches,

    charts: {
      branchHealthScores: d.rankedBranches.map(function (b) {
        return { branch: b.branch, healthScore: b.healthScore };
      }),
      shipmentReasonBreakdown: topNEntries_(d.reasonFreq, TOP_N_FOR_CHARTS),
      auditCommentBreakdown: topNEntries_(d.commentFreq, TOP_N_FOR_CHARTS),
      openCaseTrend: d.openCaseTrend
    },

    generatedAt: d.timestamp

  };

}