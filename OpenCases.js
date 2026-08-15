/**
 * ==========================================================
 * ARRIVE Audit Management System (AAMS)
 * File : OpenCases.gs
 * Version : 2.0 Enterprise
 * ==========================================================
 */

function buildOpenCases() {

  const lock = Utils.lock();

  try {

    const today = Utils.today();

    const daySheet = Utils.currentDaySheet();
    const openSheet = Utils.sheet(CONFIG.SHEETS.OPEN_CASES);

    const dayData = Utils.read(daySheet);
    const openData = Utils.read(openSheet);

    const dayMap = Utils.headerMap(daySheet);
    const openMap = Utils.headerMap(openSheet);

    const validStatus = [

      CONFIG.AUDIT_STATUS.OPEN,

      CONFIG.AUDIT_STATUS.WAITING,

      CONFIG.AUDIT_STATUS.REVIEW

    ];

    const openCasesMap = Utils.buildShipmentMap(

      openData,

      openMap["رقم البوليصة"]

    );

    let added = 0;
    let updated = 0;

    for (let i = 1; i < dayData.length; i++) {

      const row = dayData[i];

      const auditStatus = String(
        row[
          dayMap[
            CONFIG.COLS.AUDIT_STATUS
          ]
        ]
      ).trim();

      if (!validStatus.includes(auditStatus))
        continue;

      const awb = String(
        row[
          dayMap[
            CONFIG.COLS.AWB
          ]
        ]
      ).trim();

      if (!awb)
        continue;

      if (openCasesMap.hasOwnProperty(awb)) {

        const r = openCasesMap[awb];

        openData[r][openMap["الفرع"]] =
          row[
            dayMap[
              CONFIG.COLS.BRANCH
            ]
          ];

        openData[r][openMap["آخر حالة"]] =
          row[
            dayMap[
              CONFIG.COLS.STATUS
            ]
          ];

        openData[r][openMap["رد الفرع"]] =
          row[
            dayMap[
              CONFIG.COLS.BRANCH_REPLY
            ]
          ];

        openData[r][openMap["تعليق الأوديت"]] =
          row[
            dayMap[
              CONFIG.COLS.AUDIT_COMMENT
            ]
          ];

        openData[r][openMap["حالة الأوديت"]] =
          auditStatus;

        openData[r][openMap["آخر ظهور"]] =
          today;

        openData[r][openMap["آخر تحديث"]] =
          today;

        const firstSeen =
          openData[r][openMap["أول ظهور"]];

        if (firstSeen instanceof Date) {

          const days =
            Math.floor(
              (today - firstSeen) /
              (1000 * 60 * 60 * 24)
            ) + 1;

          openData[r][openMap["عدد الأيام"]] =
            days;

        } else {

          openData[r][openMap["أول ظهور"]] =
            today;

          openData[r][openMap["عدد الأيام"]] =
            1;

        }

        updated++;

      } else {
                openData.push([

          awb,

          row[
            dayMap[
              CONFIG.COLS.BRANCH
            ]
          ],

          row[
            dayMap[
              CONFIG.COLS.STATUS
            ]
          ],

          row[
            dayMap[
              CONFIG.COLS.BRANCH_REPLY
            ]
          ],

          row[
            dayMap[
              CONFIG.COLS.AUDIT_COMMENT
            ]
          ],

          auditStatus,

          today,

          today,

          1,

          today

        ]);

        added++;

      }

    }

    // حذف الحالات المغلقة

    const finalData = [];

    finalData.push(openData[0]);

    for (let i = 1; i < openData.length; i++) {

      const status = String(

        openData[i][
          openMap["حالة الأوديت"]
        ]

      ).trim();

      if (status !== CONFIG.AUDIT_STATUS.CLOSED) {

        finalData.push(openData[i]);

      }

    }

    Utils.write(

      openSheet,

      finalData

    );

    Utils.logAction(

      "Open Cases",

      "Added : " + added +
      " | Updated : " + updated +
      " | Total : " + (finalData.length - 1)

    );

    Utils.success(

      "Open Cases",

      "تمت إضافة : " + added +
      "\nتم تحديث : " + updated +
      "\nإجمالي الحالات المفتوحة : " +
      (finalData.length - 1)

    );

  }

  catch (e) {

    Utils.logError(

      "Open Cases",

      e.toString()

    );

    Utils.error(e.toString());

  }

  finally {

    Utils.unlock(lock);

  }

}