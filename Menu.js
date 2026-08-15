/**
 * ==========================================================
 * ARRIVE Audit Management System (AAMS)
 * File : 03_Menu.gs
 * Version : 2.0 Enterprise
 * ==========================================================
 */

function buildMenu() {

  SpreadsheetApp.getUi()

    .createMenu("AAMS")

    .addItem("📅 إنشاء شيت اليوم", "createTodaySheet")

    .addSeparator()

    .addItem("📥 استيراد ردود الفروع", "importReplies")

    .addItem("📂 تحديث Open Cases", "buildOpenCases")

    .addItem("📌 تحديث Missing", "buildMissing")

    .addItem("🔁 تحديث Repeated", "buildRepeated")

    .addItem("🕒 تحديث History", "buildHistory")

    .addItem("📊 تحديث KPIs", "buildKPIs")

    .addSeparator()

    .addItem("🚀 تشغيل النظام بالكامل", "runAll")

    .addSeparator()

    .addItem("📈 تحديث Dashboard", "refreshDashboard")

    .addToUi();

}

function runAll() {

  importReplies();

  buildOpenCases();

  buildMissing();

  buildRepeated();

  buildHistory();

  buildKPIs();

  SpreadsheetApp.getUi().alert(
    "AAMS",
    "تم تحديث النظام بالكامل بنجاح.",
    SpreadsheetApp.getUi().ButtonSet.OK
  );

}
