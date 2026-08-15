/**
 * ==========================================================
 * ARRIVE Audit Management System (AAMS)
 * Version : 1.0
 * File    : Config.gs
 * ==========================================================
 */

const CONFIG = {

  // ===== أسماء الشيتات =====
  SHEETS: {

    SETTINGS: "Settings",

    IMPORT: "Import",

    HISTORY: "History",

    OPEN_CASES: "Open Cases",

    REPEATED: "Repeated",

    MISSING: "Missing",

    ERROR_LOG: "Error Log",

    LOOKUP: "Lookup",

    KPIS: "KPIs",

    TEMPLATE: "Template",

    DASHBOARD: "Dashboard",

    AUDIT_ACTIONS: "Audit Actions"

  },



  // ===== أسماء الأعمدة =====

  COLS: {

    AWB: "رقم البوليصة",

    BRANCH: "فرع العضو",

    STATUS: "حالة الشحنة",

    BRANCH_REPLY: "رد الفرع",

    AUDIT_COMMENT: "تعليق الأوديت",

    AUDIT_STATUS: "حالة الأوديت",

    REPLY_DATE: "تاريخ الرد",

    LAST_UPDATE: "آخر تعديل",

    CLOSE_DATE: "تاريخ اغلاق الحاله",

    UPDATED_BY: "بواسطة",

    CASE_ID: "معرف"

},



  // ===== حالات الأوديت =====

  AUDIT_STATUS: {

    OPEN: "مفتوح",

    WAITING: "انتظار رد الفرع",

    REVIEW: "تحت المراجعة",

    CLOSED: "تم الغلق"

  }

};