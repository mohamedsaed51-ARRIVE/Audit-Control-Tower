/**
 * ==========================================================
 * ARRIVE Audit Management System (AAMS)
 * File : Import.gs
 * Version : 1.0
 * ==========================================================
 */

function importReplies() {

  const lock = Utils.lock();

  try {

    const startTime = new Date();

  const daySheet = Utils.currentDaySheet();
  const importSheet = Utils.sheet(CONFIG.SHEETS.IMPORT);
  const errorSheet = Utils.sheet(CONFIG.SHEETS.ERROR_LOG);
  const actionSheet = Utils.sheet(CONFIG.SHEETS.AUDIT_ACTIONS);

  const dayData = Utils.read(daySheet);
  const importData = Utils.read(importSheet);

  if (importData.length <= 1) {

    Utils.success(
      "Import",
      "لا توجد بيانات داخل Import"
    );

    return;

  }

const dayMap = Utils.headerMap(daySheet);
const importMap = Utils.headerMap(importSheet);

  const shipmentMap = {};

  for (let i = 1; i < dayData.length; i++) {

    const awb = String(
      dayData[i][dayMap[CONFIG.COLS.AWB]]
    ).trim();

    if (awb)
      shipmentMap[awb] = i;

  }

  let updated = 0;
  let notFound = 0;
  let skipped = 0;

  let errors = [];
  let actions = [];

  const nowDate = new Date();

  for (let i = 1; i < importData.length; i++) {

    const row = importData[i];

    const awb = String(
      row[
        importMap["رقم البوليصة"]
      ]
    ).trim();

    if (!awb) {

      skipped++;
      continue;

    }

    if (!Object.prototype.hasOwnProperty.call(shipmentMap, awb)) {

      errors.push([
        awb,
        "غير موجود فى جرد اليوم",
        nowDate
      ]);

      notFound++;

      continue;

    }

    const r = shipmentMap[awb];

    dayData[r][dayMap[CONFIG.COLS.BRANCH_REPLY]]
      = row[importMap["رد الفرع"]];

    dayData[r][dayMap[CONFIG.COLS.AUDIT_COMMENT]]
      = row[importMap["تعليق الأوديت"]];

 let auditStatus = String(
  row[importMap["حالة الأوديت"]]
).trim();

if (auditStatus === "مغلق") {
  auditStatus = CONFIG.AUDIT_STATUS.CLOSED;
}

dayData[r][dayMap[CONFIG.COLS.AUDIT_STATUS]] = auditStatus;

if (
  auditStatus === CONFIG.AUDIT_STATUS.CLOSED &&
  !dayData[r][dayMap[CONFIG.COLS.CLOSE_DATE]]
) {

  dayData[r][dayMap[CONFIG.COLS.CLOSE_DATE]] = nowDate;

} {

  dayData[r][dayMap[CONFIG.COLS.CLOSE_DATE]] = nowDate;

}

    dayData[r][dayMap[CONFIG.COLS.REPLY_DATE]]
      = nowDate;

    dayData[r][dayMap[CONFIG.COLS.LAST_UPDATE]]
      = nowDate;

    if (
      importMap["بواسطة"] != null &&
      dayMap[CONFIG.COLS.UPDATED_BY] != null
    ) {

      dayData[r][dayMap[CONFIG.COLS.UPDATED_BY]]
        = Session.getActiveUser().getEmail();

    }

   actions.push([
  nowDate,
  awb,
  "تحديث رد الفرع",
  Session.getActiveUser().getEmail(),
  row[importMap["رد الفرع"]]
]);
    updated++;

  }
    // حفظ تحديثات شيت اليوم
  Utils.write(daySheet, dayData);

  // تسجيل الأخطاء
  if (errors.length > 0) {

    const startRow = errorSheet.getLastRow() + 1;

    errorSheet
      .getRange(
        startRow,
        1,
        errors.length,
        errors[0].length
      )
      .setValues(errors);

  }

  // تسجيل العمليات
  if (actions.length > 0) {

    const startRow = actionSheet.getLastRow() + 1;

    actionSheet
      .getRange(
        startRow,
        1,
        actions.length,
        actions[0].length
      )
      .setValues(actions);

  }

  // تنظيف Import
  if (importSheet.getLastRow() > 1) {

    importSheet
      .getRange(
        2,
        1,
        importSheet.getLastRow() - 1,
        importSheet.getLastColumn()
      )
      .clearContent();

  }

  const seconds =
    (
      (new Date()) - startTime
    ) / 1000;

  const report =
      "تم تحديث : " + updated + " شحنة\n\n" +
      "غير موجود : " + notFound + "\n\n" +
      "بدون رقم بوليصة : " + skipped + "\n\n" +
      "مدة التنفيذ : " +
      seconds.toFixed(2) +
      " ثانية";

  SpreadsheetApp
    .getUi()
    .alert(
      "Import Finished",
      report,
      SpreadsheetApp
        .getUi()
        .ButtonSet.OK
    );
}
finally {

  Utils.unlock(lock);

}
}
