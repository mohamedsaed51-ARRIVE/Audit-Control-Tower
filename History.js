/**
 * ==========================================================
 * ARRIVE Audit Management System (AAMS)
 * File : History.gs
 * Version : 2.0 Enterprise
 * ==========================================================
 */

function buildHistory() {

  const lock = Utils.lock();

  try {

    const daySheet = Utils.currentDaySheet();
    const historySheet = Utils.sheet(CONFIG.SHEETS.HISTORY);

    const dayData = Utils.read(daySheet);
    const historyData = Utils.read(historySheet);

    const dayMap = Utils.headerMap(daySheet);
    const historyMap = Utils.headerMap(historySheet);

    const historyShipments = Utils.buildShipmentMap(
      historyData,
      historyMap[CONFIG.COLS.AWB]
    );

    let added = 0;

    for (let i = 1; i < dayData.length; i++) {

      const row = dayData[i];

      const awb = String(
        row[dayMap[CONFIG.COLS.AWB]]
      ).trim();

      if (!awb) continue;

      const auditStatus = String(
        row[dayMap[CONFIG.COLS.AUDIT_STATUS]]
      ).trim();

      if (auditStatus !== CONFIG.AUDIT_STATUS.CLOSED)
        continue;

      if (awb in historyShipments)
        continue;

      const newRow = [];

      historyData[0].forEach(function(header) {

        header = String(header).trim();

        if (dayMap.hasOwnProperty(header)) {

          newRow.push(
            row[dayMap[header]]
          );

        } else {

          newRow.push("");

        }

      });

      historyData.push(newRow);

      added++;

    }

    Utils.write(
      historySheet,
      historyData
    );

    Utils.logAction(
      "History",
      "Added : " + added
    );

    Utils.success(
      "History",
      "تمت إضافة " + added + " شحنة إلى الأرشيف."
    );

  }

  catch (e) {

    Utils.logError(
      "History",
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
