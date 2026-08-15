// ===== إعدادات النظام =====
const SETTINGS_SHEET = 'Settings';
const IMPORT_SHEET   = 'Import';
const ERROR_SHEET    = 'Error Log';
// يجيب اسم شيت اليوم من Settings!B1
function getCurrentSheetName() {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(SETTINGS_SHEET);
  return sh.getRange('B1').getDisplayValue().trim();
}

// تحديث ردود الفروع داخل شيت اليوم
function updateBranchReplies() {
  const ss = SpreadsheetApp.getActive();

  const currentName = getCurrentSheetName();
  const daySheet    = ss.getSheetByName(currentName);
  const importSheet = ss.getSheetByName(IMPORT_SHEET);
  const errorSheet  = ss.getSheetByName('Error Log');

  if (!daySheet) throw new Error('شيت اليوم غير موجود في Settings!B1');

  // بيانات شيت اليوم
  const dayData = daySheet.getDataRange().getValues();
  const dayHeaders = dayData[0];

  // تحديد الأعمدة بالاسم (مش برقم العمود)
  const idxBolisa   = dayHeaders.indexOf('رقم البوليصة');
  const idxReply    = dayHeaders.indexOf('رد الفرع');
  const idxAudit    = dayHeaders.indexOf('تعليق الأوديت');
  const idxStatus   = dayHeaders.indexOf('حالة الأوديت');
  const idxDate     = dayHeaders.indexOf('تاريخ الرد');

  if ([idxBolisa, idxReply, idxAudit, idxStatus, idxDate].includes(-1)) {
    throw new Error('تأكد من أسماء الأعمدة في شيت اليوم');
  }

  // نبني خريطة: رقم البوليصة -> رقم الصف
  const map = {};
  for (let i = 1; i < dayData.length; i++) {
    const key = String(dayData[i][idxBolisa]).trim();
    if (key) map[key] = i + 1; // +1 لأن الصفوف تبدأ من 1
  }

  // بيانات الاستيراد
  const impData = importSheet.getDataRange().getValues();
  if (impData.length < 2) {
    SpreadsheetApp.getUi().alert('لا توجد بيانات في Branch Update');
    return;
  }

  const impHeaders = impData[0];
  const iBolisa = impHeaders.indexOf('رقم البوليصة');
  const iReply  = impHeaders.indexOf('رد الفرع');
  const iAudit  = impHeaders.indexOf('تعليق الأوديت');
  const iStatus = impHeaders.indexOf('حالة الأوديت');

  let updated = 0;
  let errors  = [];

  // تحديث الصفوف
  for (let i = 1; i < impData.length; i++) {
    const row = impData[i];
    const key = String(row[iBolisa]).trim();

    if (!key) continue;

    if (map[key]) {
      const r = map[key];

      daySheet.getRange(r, idxReply + 1).setValue(row[iReply]);
      daySheet.getRange(r, idxAudit + 1).setValue(row[iAudit]);
      daySheet.getRange(r, idxStatus + 1).setValue(row[iStatus]);
      daySheet.getRange(r, idxDate + 1).setValue(new Date());

      updated++;
    } else {
      errors.push([key, 'غير موجود في جرد اليوم']);
    }
  }

  // تسجيل الأخطاء
  if (errors.length) {
    if (errorSheet.getLastRow() === 0) {
      errorSheet.appendRow(['رقم البوليصة', 'السبب']);
    }
    errorSheet.getRange(
      errorSheet.getLastRow() + 1,
      1,
      errors.length,
      2
    ).setValues(errors);
  }

  // تفريغ شيت الاستيراد بعد النجاح
  importSheet.getRange(2, 1,
    Math.max(importSheet.getLastRow() - 1, 1),
    importSheet.getLastColumn()
  ).clearContent();

  SpreadsheetApp.getUi().alert(
    'تم تحديث ' + updated + ' شحنة\\n' +
    'أخطاء: ' + errors.length
  );
}function testSystem() {
  const ss = SpreadsheetApp.getActive();

  Logger.log(ss.getSheetByName("22-07-2026"));
  Logger.log(ss.getSheetByName("Import"));
  Logger.log(ss.getSheetByName("Error Log"));
}function testHeaders() {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName("22-07-2026");

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  Logger.log(headers);
}function testImportHeaders() {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName("Import");

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  Logger.log(headers);
}function testSearch() {

  const ss = SpreadsheetApp.getActive();

  const day = ss.getSheetByName("22-07-2026");
  const imp = ss.getSheetByName("Import");

  const dayNo = String(day.getRange(2,1).getDisplayValue()).trim();
  const impNo = String(imp.getRange(2,1).getDisplayValue()).trim();

  Logger.log("Day    : " + dayNo);
  Logger.log("Import : " + impNo);
  Logger.log("Equal? : " + (dayNo === impNo));
}function testFindShipment() {

  const ss = SpreadsheetApp.getActive();

  const daySheet = ss.getSheetByName("22-07-2026");
  const importSheet = ss.getSheetByName("Import");

  const dayData = daySheet.getDataRange().getValues();
  const importData = importSheet.getDataRange().getValues();

  const shipment = String(importData[1][0]).trim();

  Logger.log("البوليصة المطلوب البحث عنها: " + shipment);

  let found = false;

  for (let i = 1; i < dayData.length; i++) {

    if (String(dayData[i][0]).trim() === shipment) {
      Logger.log("تم العثور عليها في الصف: " + (i + 1));
      found = true;
      break;
    }

  }

  if (!found) {
    Logger.log("لم يتم العثور على البوليصة");
  }

}