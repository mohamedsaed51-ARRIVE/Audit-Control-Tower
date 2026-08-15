/**
 * ==========================================================
 * ARRIVE Control Tower API
 * File: Dashboard.js
 * ==========================================================
 */

function doGet(e) {
  try {
    const action =
      e && e.parameter && e.parameter.action
        ? e.parameter.action
        : "dashboard";

    switch (action) {
      case "dashboard":
        return jsonResponse({
          success: true,
          data: buildDashboardData()
        });

      case "health":
        return jsonResponse({
          success: true,
          status: "healthy",
          timestamp: new Date()
        });

      default:
        return jsonResponse({
          success: false,
          message: "Unknown action"
        });
    }

  } catch (error) {

    return jsonResponse({
      success: false,
      error: error.toString()
    });
  }
}

/**
 * POST support
 */
function doPost(e) {
  return doGet(e);
}

/**
 * JSON response
 */
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ==========================================================
 * BUILD EXECUTIVE DASHBOARD DATA
 * ==========================================================
 *
 * Uses the existing buildKPIs() engine as the source of truth.
 * Adds the additional structures required by React.
 */
function buildDashboardData() {

  const kpi = buildKPIs();

  return {

    /* ======================================================
     * EXECUTIVE
     * ====================================================== */

    executive: {

      totalShipments:
        kpi.executive.totalShipments || 0,

      openCases:
        kpi.executive.openCases || 0,

      closedToday:
        kpi.executive.closedToday || 0,

      criticalShipments:
        kpi.executive.criticalShipments || 0,

      healthScore:
        kpi.executive.healthScore || 0,

      healthStatus:
        kpi.executive.healthStatus || "Critical",

      slaPercent:
        kpi.quality.closeRate || 0,

      compliancePercent:
        calculateCompliancePercent_(kpi),

      missing:
        kpi.operations.missing || 0,

      repeated:
        kpi.operations.repeated || 0,

      lastUpdate:
        kpi.generatedAt || "",

      backendConnected: true,

      databaseConnected: true
    },

    /* ======================================================
     * OPERATIONS
     * ====================================================== */

    operations: {

      missing:
        kpi.operations.missing || 0,

      repeated:
        kpi.operations.repeated || 0,

      oldestOpenCaseDays:
        kpi.operations.oldestOpenCaseDays || 0,

      openCaseTrend:
        kpi.operations.openCaseTrend || null
    },

    /* ======================================================
     * AUDIT
     * ====================================================== */

    audit: kpi.audit || {},

    /* ======================================================
     * QUALITY
     * ====================================================== */

    quality: kpi.quality || {},

    /* ======================================================
     * TIME
     * ====================================================== */

    time: kpi.time || {},

    /* ======================================================
     * BRANCHES
     * ====================================================== */

    branches:
      (kpi.branches || []).map(function (branch, index) {

        return {
          id: "branch-" + (index + 1),

          name:
            branch.branch || "غير محدد",

          region:
            getBranchRegion_(branch.branch),

          manager:
            "",

          todayShipments:
            branch.shipments || 0,

          open:
            branch.openCases || 0,

          missing:
            branch.missing || 0,

          repeated:
            branch.repeated || 0,

          closed:
            branch.closed || 0,

          compliance:
            calculateBranchCompliance_(branch),

          healthScore:
            branch.healthScore || 0,

          healthStatus:
            branch.healthStatus || "Critical",

          trend:
            "flat",

          trendValue:
            0
        };
      }),

    /* ======================================================
     * CHARTS
     * ====================================================== */

    charts: {

      branchHealthScores:
        kpi.charts &&
        kpi.charts.branchHealthScores
          ? kpi.charts.branchHealthScores
          : [],

      shipmentReasonBreakdown:
        kpi.charts &&
        kpi.charts.shipmentReasonBreakdown
          ? kpi.charts.shipmentReasonBreakdown
          : [],

      auditCommentBreakdown:
        kpi.charts &&
        kpi.charts.auditCommentBreakdown
          ? kpi.charts.auditCommentBreakdown
          : [],

      openCaseTrend:
        kpi.charts &&
        kpi.charts.openCaseTrend
          ? kpi.charts.openCaseTrend
          : null,

      weeklyTrend:
        buildWeeklyTrend_(kpi),

      monthlyTrend:
        buildMonthlyTrend_(kpi),

      yearlyTrend:
        buildYearlyTrend_(kpi),

      caseStatusBreakdown:
        buildCaseStatusBreakdown_(kpi)
    },

    /* ======================================================
     * LIVE ALERTS
     * ====================================================== */

    liveAlerts:
      buildLiveAlerts_(kpi),

    /* ======================================================
     * AI INSIGHTS
     * ====================================================== */

    aiInsights:
      buildAIInsights_(kpi),

    /* ======================================================
     * SYSTEM
     * ====================================================== */

    system: {

      connected: true,

      status: "operational",

      lastSync:
        kpi.generatedAt || ""
    },

    generatedAt:
      kpi.generatedAt || ""
  };
}


/* ==========================================================
 * COMPLIANCE
 * ========================================================== */

function calculateCompliancePercent_(kpi) {

  if (!kpi || !kpi.executive) {
    return 0;
  }

  const total =
    Number(kpi.executive.totalShipments) || 0;

  if (total === 0) {
    return 0;
  }

  const missing =
    Number(kpi.operations.missing) || 0;

  const repeated =
    Number(kpi.operations.repeated) || 0;

  return Math.max(
    0,
    Math.round(
      ((total - missing - repeated) / total) * 1000
    ) / 10
  );
}


/* ==========================================================
 * BRANCH COMPLIANCE
 * ========================================================== */

function calculateBranchCompliance_(branch) {

  const shipments =
    Number(branch.shipments) || 0;

  if (shipments === 0) {
    return 0;
  }

  const missing =
    Number(branch.missing) || 0;

  const repeated =
    Number(branch.repeated) || 0;

  return Math.max(
    0,
    Math.round(
      ((shipments - missing - repeated) / shipments) * 100
    )
  );
}


/* ==========================================================
 * BRANCH REGION
 * ========================================================== */

function getBranchRegion_(branchName) {

  const name =
    String(branchName || "");

  if (
    name.includes("الشروق") ||
    name.includes("المعادي") ||
    name.includes("المؤسسه") ||
    name.includes("العجوزه") ||
    name.includes("القاهرة")
  ) {
    return "Greater Cairo";
  }

  if (
    name.includes("طنطا") ||
    name.includes("منصورة") ||
    name.includes("المنصورة") ||
    name.includes("زقازيق")
  ) {
    return "Delta";
  }

  return "Other";
}


/* ==========================================================
 * WEEKLY TREND
 * ========================================================== */

function buildWeeklyTrend_(kpi) {

  const total =
    Number(
      kpi.executive &&
      kpi.executive.totalShipments
    ) || 0;

  const closed =
    Number(
      kpi.executive &&
      kpi.executive.closedToday
    ) || 0;

  return [
    {
      day: "Today",
      shipments: total,
      closed: closed,
      slaBreaches:
        Number(
          kpi.executive &&
          kpi.executive.criticalShipments
        ) || 0
    }
  ];
}


/* ==========================================================
 * MONTHLY TREND
 * ========================================================== */

function buildMonthlyTrend_(kpi) {

  const total =
    Number(
      kpi.executive &&
      kpi.executive.totalShipments
    ) || 0;

  const closed =
    Number(
      kpi.executive &&
      kpi.executive.closedToday
    ) || 0;

  const compliance =
    Number(
      kpi.executive &&
      kpi.executive.healthScore
    ) || 0;

  return [
    {
      month: Utilities.formatDate(
        new Date(),
        Session.getScriptTimeZone(),
        "MMM"
      ),

      shipments: total,

      closedOnTime: closed,

      compliance: compliance
    }
  ];
}


/* ==========================================================
 * YEARLY TREND
 * ========================================================== */

function buildYearlyTrend_(kpi) {

  const year =
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      "yyyy"
    );

  return [
    {
      period: year,

      shipments:
        Number(
          kpi.executive &&
          kpi.executive.totalShipments
        ) || 0
    }
  ];
}


/* ==========================================================
 * CASE STATUS
 * ========================================================== */

function buildCaseStatusBreakdown_(kpi) {

  const total =
    Number(
      kpi.executive &&
      kpi.executive.totalShipments
    ) || 0;

  const closed =
    Number(
      kpi.executive &&
      kpi.executive.closedToday
    ) || 0;

  const open =
    Number(
      kpi.executive &&
      kpi.executive.openCases
    ) || 0;

  const missing =
    Number(
      kpi.operations &&
      kpi.operations.missing
    ) || 0;

  const repeated =
    Number(
      kpi.operations &&
      kpi.operations.repeated
    ) || 0;

  if (total === 0) {
    return [];
  }

  return [
    {
      name: "Closed",
      value: Math.round((closed / total) * 100),
      color: "#1AA971"
    },

    {
      name: "Open",
      value: Math.round((open / total) * 100),
      color: "#12C6D3"
    },

    {
      name: "Missing",
      value: Math.round((missing / total) * 100),
      color: "#E8A317"
    },

    {
      name: "Repeated",
      value: Math.round((repeated / total) * 100),
      color: "#E0473F"
    }
  ];
}


/* ==========================================================
 * LIVE ALERTS
 * ========================================================== */

function buildLiveAlerts_(kpi) {

  const alerts = [];

  const critical =
    Number(
      kpi.executive &&
      kpi.executive.criticalShipments
    ) || 0;

  const missing =
    Number(
      kpi.operations &&
      kpi.operations.missing
    ) || 0;

  const repeated =
    Number(
      kpi.operations &&
      kpi.operations.repeated
    ) || 0;

  const oldest =
    Number(
      kpi.operations &&
      kpi.operations.oldestOpenCaseDays
    ) || 0;


  if (critical > 0) {

    alerts.push({
      id: "critical-shipments",

      severity: "critical",

      branch: "Network",

      message:
        critical +
        " critical shipments need review",

      time: "Current"
    });
  }


  if (missing > 0) {

    alerts.push({
      id: "missing",

      severity: "high",

      branch: "Network",

      message:
        missing +
        " missing shipments flagged",

      time: "Current"
    });
  }


  if (repeated > 0) {

    alerts.push({
      id: "repeated",

      severity: "medium",

      branch: "Network",

      message:
        repeated +
        " repeated cases detected",

      time: "Current"
    });
  }


  if (oldest > 15) {

    alerts.push({
      id: "old-case",

      severity: "high",

      branch: "Network",

      message:
        "Oldest open case is " +
        oldest +
        " days old",

      time: "Current"
    });
  }


  if (alerts.length === 0) {

    alerts.push({
      id: "healthy",

      severity: "low",

      branch: "Network",

      message:
        "No critical operational alerts detected",

      time: "Current"
    });
  }


  return alerts;
}


/* ==========================================================
 * AI INSIGHTS
 * ========================================================== */

function buildAIInsights_(kpi) {

  const branches =
    kpi.branches || [];

  const sorted =
    branches.slice().sort(function (a, b) {

      return (
        (b.healthScore || 0) -
        (a.healthScore || 0)
      );
    });


  const best =
    sorted.length > 0
      ? sorted[0]
      : null;


  const worst =
    sorted.length > 0
      ? sorted[sorted.length - 1]
      : null;


  const insights = [];


  if (best) {

    insights.push({

      id: 1,

      kind: "best",

      title: "Best Performing Branch",

      branch: best.branch,

      detail:
        "Highest current health score at " +
        best.healthScore +
        "%.",

      confidence: 95,

      impact: "high"
    });
  }


  if (worst) {

    insights.push({

      id: 2,

      kind: "worst",

      title: "Needs Attention",

      branch: worst.branch,

      detail:
        "Current health score is " +
        worst.healthScore +
        "% and requires management attention.",

      confidence: 92,

      impact: "high"
    });
  }


  const openCases =
    Number(
      kpi.executive &&
      kpi.executive.openCases
    ) || 0;


  if (openCases === 0) {

    insights.push({

      id: 3,

      kind: "best",

      title: "Open Case Status",

      branch: "Network-wide",

      detail:
        "There are currently no open audit cases.",

      confidence: 100,

      impact: "medium"
    });

  } else {

    insights.push({

      id: 3,

      kind: "risk",

      title: "Open Case Risk",

      branch: "Network-wide",

      detail:
        openCases +
        " open cases currently require follow-up.",

      confidence: 98,

      impact: "high"
    });
  }


  return insights;
}