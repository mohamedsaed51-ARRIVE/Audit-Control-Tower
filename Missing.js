/**
 * ==========================================================
 * ARRIVE Audit Management System (AAMS)
 * File : Missing.gs
 * Version : 3.0 Enterprise
 * ==========================================================
 */

function buildMissing() {

  const lock = Utils.lock();

  try {

    const today = Utils.today();

    const daySheet = Utils.currentDaySheet();
    const openSheet = Utils.sheet(CONFIG.SHEETS.OPEN_CASES);
    const missingSheet = Utils.sheet(CONFIG.SHEETS.MISSING);

    const dayData = Utils.read(daySheet);
    const openData = Utils.read(openSheet);
    const missingData = Utils.read(missingSheet);

    const dayMap = Utils.headerMap(daySheet);
    const openMap = Utils.headerMap(openSheet);
    const missingMap = Utils.headerMap(missingSheet);

    const dayShipments = Utils.buildShipmentMap(
      dayData,
      dayMap[CONFIG.COLS.AWB]
    );

    const missingShipments = Utils.buildShipmentMap(
      missingData,
      missingMap["رقم البوليصة"]
    );

    let added = 0;
    let updated = 0;
    let removed = 0;

    for (let i = 1; i < openData.length; i++) {

      const awb = String(
        openData[i][openMap["رقم البوليصة"]]
      ).trim();

      if (!awb) continue;

      if (!(awb in dayShipments)) {

        if (awb in missingShipments) {

          const r = missingShipments[awb];

          missingData[r][missingMap["آخر فرع"]] =
            openData[i][openMap["الفرع"]];

          missingData[r][missingMap["آخر حالة"]] =
            openData[i][openMap["آخر حالة"]];

          missingData[r][missingMap["آخر يوم ظهرت"]] =
            today;

          missingData[r][missingMap["تعليق الأوديت"]] =
            openData[i][openMap["تعليق الأوديت"]];

          missingData[r][missingMap["رد الفرع"]] =
            openData[i][openMap["رد الفرع"]];

          missingData[r][missingMap["حالة الأوديت"]] =
            openData[i][openMap["حالة الأوديت"]];

          missingData[r][missingMap["آخر تحديث"]] =
            today;

          const firstMissing =
            missingData[r][missingMap["أول يوم اختفاء"]];

          if (firstMissing instanceof Date) {

            const days =
              Math.floor(
                (today - firstMissing) /
                (1000 * 60 * 60 * 24)
              ) + 1;

            missingData[r][missingMap["عدد الأيام المفقودة"]] =
              days;

          } else {

            missingData[r][missingMap["أول يوم اختفاء"]] =
              today;

            missingData[r][missingMap["عدد الأيام المفقودة"]] =
              1;

          }

          updated++;

        } else {

          missingData.push([

            awb,

            openData[i][openMap["الفرع"]],

            openData[i][openMap["آخر حالة"]],

            today,

            today,

            1,

            openData[i][openMap["تعليق الأوديت"]],

            openData[i][openMap["رد الفرع"]],

            openData[i][openMap["حالة الأوديت"]],

            today

          ]);

          added++;

        }

      }

    }

    const finalData = [];
    finalData.push(missingData[0]);

    for (let i = 1; i < missingData.length; i++) {

      const awb = String(
        missingData[i][missingMap["رقم البوليصة"]]
      ).trim();

      if (awb in dayShipments) {

        removed++;
        continue;

      }

      finalData.push(missingData[i]);

    }

    Utils.write(
      missingSheet,
      finalData
    );

    Utils.logAction(
      "Missing",
      "Added : " + added +
      " | Updated : " + updated +
      " | Removed : " + removed
    );

    Utils.success(
      "Missing",
      "تمت الإضافة : " + added +
      "\nتم التحديث : " + updated +
      "\nتمت الإزالة : " + removed +
      "\nإجمالي الحالات : " +
      (finalData.length - 1)
    );

  }

  catch (e) {

    Utils.logError(
      "Missing",
      e.toString()
    );

    Utils.error(e.toString());

  }

  finally {

    Utils.unlock(lock);

  }

}
