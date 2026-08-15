/**
 * ==========================================================
 * ARRIVE Audit Management System (AAMS)
 * File : 02_Utils.gs
 * Version : 1.0
 * ==========================================================
 */

const Utils = {

  // =====================================================
  // Spreadsheet
  // =====================================================

  ss() {
    return SpreadsheetApp.getActiveSpreadsheet();
  },

  ui() {
    return SpreadsheetApp.getUi();
  },

  // =====================================================
  // Sheets
  // =====================================================

  sheet(name) {

    const sh = this.ss().getSheetByName(name);

    if (!sh) {
      throw new Error("Sheet not found : " + name);
    }

    return sh;

  },

  settings() {
    return this.sheet(CONFIG.SHEETS.SETTINGS);
  },

  currentDayName() {

    return this
      .settings()
      .getRange("B1")
      .getDisplayValue()
      .trim();

  },

  currentDaySheet() {

    return this.sheet(
      this.currentDayName()
    );

  },

  // =====================================================
  // Read / Write
  // =====================================================

  read(sheet) {

    return sheet
      .getDataRange()
      .getValues();

  },

  write(sheet, values) {

    sheet.clearContents();

    sheet
      .getRange(
        1,
        1,
        values.length,
        values[0].length
      )
      .setValues(values);

  },

  // =====================================================
  // Header Map
  // =====================================================

  headers(sheet) {

    return sheet
      .getRange(
        1,
        1,
        1,
        sheet.getLastColumn()
      )
      .getValues()[0];

  },

  headerMap(sheet) {

    const headers = this.headers(sheet);

    const map = {};

    headers.forEach((h, i) => {

      map[String(h).trim()] = i;

    });

    return map;

  },

  // =====================================================
  // Search
  // =====================================================

  buildShipmentMap(data, colIndex) {

    const map = {};

    for (let i = 1; i < data.length; i++) {

      const awb = String(
        data[i][colIndex]
      ).trim();

      if (awb)
        map[awb] = i;

    }

    return map;

  },
    // =====================================================
  // Date
  // =====================================================

  today() {

    return new Date();

  },

  formatDate(date) {

    return Utilities.formatDate(
      date,
      Session.getScriptTimeZone(),
      "dd-MM-yyyy HH:mm:ss"
    );

  },

  // =====================================================
  // Dialogs
  // =====================================================

  success(title, message) {

    this.ui().alert(
      title,
      message,
      this.ui().ButtonSet.OK
    );

  },

  error(message) {

    this.ui().alert(
      "خطأ",
      message,
      this.ui().ButtonSet.OK
    );

  },

  // =====================================================
  // Lock
  // =====================================================

  lock() {

    const lock = LockService.getDocumentLock();

    lock.waitLock(30000);

    return lock;

  },

  unlock(lock) {

    if (lock)
      lock.releaseLock();

  },

  // =====================================================
  // Logs
  // =====================================================

  logAction(action, details) {

    const sheet = this.sheet(CONFIG.SHEETS.AUDIT_ACTIONS);

    sheet.appendRow([
      new Date(),
      Session.getActiveUser().getEmail(),
      action,
      details
    ]);

  },

  logError(action, details) {

    const sheet = this.sheet(CONFIG.SHEETS.ERROR_LOG);

    sheet.appendRow([
      new Date(),
      action,
      details
    ]);

  }

};