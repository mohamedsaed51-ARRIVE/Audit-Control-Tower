/**
 * ==========================================================
 * ARRIVE Audit Management System (AAMS)
 * File : Repeated.gs
 * Version : 3.0 Enterprise
 * ==========================================================
 */

function buildRepeated() {

  const lock = Utils.lock();

  try {

    const today = Utils.today();

    const daySheet = Utils.currentDaySheet();
    const repeatedSheet = Utils.sheet(CONFIG.SHEETS.REPEATED);

    const dayData = Utils.read(daySheet);
    const dayMap = Utils.headerMap(daySheet);

    const repeatedData = [];

    repeatedData.push([

      "رقم البوليصة",

      "أول ظهور",

      "آخر ظهور",

      "عدد مرات الظهور",

      "عدد الأيام",

      "آخر فرع",

      "آخر حالة الشحنة",

      "تعليق الأوديت",

      "حالة الأوديت"

    ]);

    const shipments = {};

    for (let i = 1; i < dayData.length; i++) {

      const awb = String(
        dayData[i][dayMap[CONFIG.COLS.AWB]]
      ).trim();

      if (!awb) continue;

      if (!shipments[awb]) {

        shipments[awb] = {

          count: 0,

          firstSeen: today,

          lastSeen: today,

          branch: "",

          status: "",

          auditComment: "",

          auditStatus: ""

        };

      }

      shipments[awb].count++;

      shipments[awb].lastSeen = today;

      shipments[awb].branch =
        dayData[i][dayMap[CONFIG.COLS.BRANCH]];

      shipments[awb].status =
        dayData[i][dayMap[CONFIG.COLS.STATUS]];

      shipments[awb].auditComment =
        dayData[i][dayMap[CONFIG.COLS.AUDIT_COMMENT]];

      shipments[awb].auditStatus =
        dayData[i][dayMap[CONFIG.COLS.AUDIT_STATUS]];

    }

    let totalRepeated = 0;

    Object.keys(shipments).forEach(function (awb) {

      if (shipments[awb].count > 1) {

        repeatedData.push([

          awb,

          shipments[awb].firstSeen,

          shipments[awb].lastSeen,

          shipments[awb].count,

          1,

          shipments[awb].branch,

          shipments[awb].status,

          shipments[awb].auditComment,

          shipments[awb].auditStatus

        ]);

        totalRepeated++;

      }

    });

    Utils.write(
      repeatedSheet,
      repeatedData
    );

    Utils.logAction(
      "Repeated",
      "Repeated Shipments : " + totalRepeated
    );

    Utils.success(
      "Repeated",
      "إجمالي الشحنات المكررة : " + totalRepeated
    );

  }

  catch (e) {

    Utils.logError(
      "Repeated",
      e.toString()
    );

    Utils.error(
      e.toString()
    );

  }

  finally {

    Utils.unlock(lock);

  }

}
