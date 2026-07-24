import { setDatePicker } from "@amec/webasset/flatpickr";
import dayjs from "dayjs";
import { getEmpData, getReport, getSchedule } from "./data";
import { createTable } from "@amec/webasset/dataTable";
import { showMessage } from "@amec/webasset/utils";
import {
  alignment,
  applyStyleToRange,
  border,
  defaultExcel,
  exportExcel,
  fill,
  mergeCell,
} from "@amec/webasset/excel";

var reportTable;
$(async function () {
  try {
    // ----------JUNG BM-------------------------
    await setDatePicker({
      element: "#selectedDate",
      dateFormat: "Y-m-d",
      // maxDate: 'today',
      dayOff: false,
      onChange: async (selectedDates, dateStr) => {
        await setSchedule(dateStr);
      },
    });
    // -------------------------------------------------

    reportTable = await createTable(
      {
        responsive: false,
        columns: [
          { title: "Form No", className: "text-nowrap" },
          { title: "Request By", className: "text-nowrap" },
          { title: "No" },
          { title: "Drawing No.", className: "text-nowrap" },
          { title: "Item" },
          { title: "Code", className: "text-nowrap" },
          { title: "New Flag" },
          { title: "Code", className: "text-nowrap" },
          { title: "Flag" },
          { title: "Status", className: "text-nowrap" },
          { title: "Spec Material", className: "text-nowrap" },
          { title: "Reference", className: "text-nowrap" },
          {
            title: "Remark",
            className: "min-w-[300px]",
            width: "300px",
          },
        ],
        columnDefs: [
          {
            targets: "_all",
            defaultContent: "",
          },
        ],
        initComplete: function () {
          const $thead = $(this.api().table().header());

          $thead.html(`
        <tr>
          <th rowspan="2">Form No</th>
          <th rowspan="2">Request By</th>
          <th rowspan="2">No</th>
          <th rowspan="2">Drawing No.</th>
          <th rowspan="2">Item</th>
          <th colspan="2">Change To</th>
          <th colspan="4">Before Change</th>
          <th rowspan="2">Reference</th>
          <th rowspan="2" style="min-width: 300px;">Remark</th>
        </tr>
        <tr>
          <th>Code</th>
          <th>New Flag</th>
          <th>Code</th>
          <th>Flag</th>
          <th>Status</th>
          <th>Spec Material</th>
        </tr>
      `);
        },
      },
      {
        id: "#Table",
        domScroll: { status: true },
      },
    );
  } catch (error) {
    console.log(error);
  }
});

//BM date
$(document).on("click", "#openDatePicker", function (e) {
  e.preventDefault();
  const datePicker = document.querySelector("#selectedDate")?._flatpickr;
  if (datePicker) datePicker.open();
});

//BM date
async function setSchedule(dateStr) {
  let currentDate = dayjs(dateStr);
  if (!currentDate.isValid()) {
    currentDate = dayjs(String(dateStr), "YYYYMMDD");
  }

  let res = [];
  const maxLookbackDays = 365;
  for (let i = 0; i < maxLookbackDays; i++) {
    const queryDate = currentDate.format("YYYYMMDD");
    res = await getSchedule({ sdate: queryDate, edate: queryDate });
    if (Array.isArray(res) && res.length > 0 && res[0].SCHDNUMBER != null) {
      break;
    }
    currentDate = currentDate.subtract(1, "day");
  }

  if (!Array.isArray(res) || res.length === 0) {
    $("#schd_txt").val("");
    $("#schd_number").val("");
    $("#schd_p").val("");
    showMessage("No schedule found.");
    return;
  }

  $("#schd_txt").val(res[0].SCHDMFG + "-" + res[0].PRIORITY);
  const workId = String(res?.[0]?.WORKID ?? "");
  const formattedWorkId = /^\d{8}$/.test(workId)
    ? `${workId.slice(0, 4)}-${workId.slice(4, 6)}-${workId.slice(6, 8)}`
    : workId;
  console.log(formattedWorkId);
  $("#selectedDate").val(formattedWorkId);
}

$(document).on("click", "#btnSearch", async function () {
  try {
    const searchReport = {
      DRAWING: $("#drawing").val() || null,
      NEWCODE: $("#newcode").val() || null,
      OLDCODE: $("#oldcode").val() || null,
      CHANGE_SCHD: $("#schd_txt").val() || null,
    };
    const isAllNull = Object.values(searchReport).every(
      (value) => value === null,
    );

    if (isAllNull) {
      return showMessage("Cannot search data because there is no data");
    }

    const reportData = await getReport(searchReport);
    const dataArray = Array.isArray(reportData)
      ? reportData
      : Array.isArray(reportData?.data)
        ? reportData.data
        : [];

    const reqNos = [
      ...new Set(dataArray.map((row) => row.VREQNO).filter(Boolean)),
    ];
    const reqDatas = await Promise.all(
      reqNos.map((empno) => getEmpData(empno)),
    );
    const reqMap = reqNos.reduce((acc, empno, index) => {
      acc[empno] = reqDatas[index]?.SNAME || "";
      return acc;
    }, {});

    const reportWithFormNo = dataArray.map((row) => ({
      ...row,
      formNo: `${row.VANAME}${String(row.d_CYEAR2 || "").slice(-2)}-${("000000" + (row.d_NRUNNO || "")).slice(-6)}`,
      reqBy: row.VREQNO ? `${row.VREQNO}_${reqMap[row.VREQNO] || ""}` : "",
    }));

    reportTable.clear();

    reportTable.rows.add(
      reportWithFormNo.map((row) => [
        row.formNo,
        row.reqBy,
        row.d_SEQNO,
        row.d_DRAWING,
        row.d_ITEM,
        row.d_NEWCODE,
        row.d_NEWFLAG,
        row.d_OLDCODE,
        row.d_OLDFLAG,
        row.d_OLDSTATUS,
        row.d_OLDSPEC,
        row.d_REFERENCE,
        row.d_REMARK,
      ]),
    );

    reportTable.draw(false);
  } catch (error) {
    console.log(error);
  }
});

$(document).on("click", "#btnReset", async function () {
  try {
    $("#drawing").val("");
    $("#newcode").val("");
    $("#oldcode").val("");
    $("#schd_txt").val("");
    if (reportTable) {
      reportTable.clear().draw();
    }
  } catch (error) {
    console.log(error);
  }
});

$(document).on("click", "#btnExport", async function () {
  try {
    // ตรวจสอบว่ามีข้อมูลตารางหรือไม่
    if (!reportTable) {
      return showMessage("Cannot export data because the data table is empty");
    }

    // ดึงข้อมูลที่ผ่านการค้นหา/กรอง (จะได้ข้อมูลเป็น Array of Arrays)
    const exportData = reportTable.rows({ search: "applied" }).data().toArray();

    if (exportData.length === 0) {
      return showMessage("Cannot export data because the data table is empty");
    }

    // 3. แมปข้อมูลจริงต่อท้ายหัวตาราง
    const mappedExcelData = [
      ...exportData.map((row) => ({
        formNo: row[0],
        reqBy: row[1],
        no: row[2],
        drawingNo: row[3],
        item: row[4],
        newCode: row[5],
        newFlag: row[6],
        oldCode: row[7],
        oldFlag: row[8],
        oldStatus: row[9],
        oldSpec: row[10],
        reference: row[11],
        remark: row[12],
      })),
    ];

    // สร้าง Excel โดยใช้ key ที่แมปไว้ด้านบน และจัดกลุ่ม Header ให้สอดคล้องกับตารางหน้าเว็บ
    const excel = await defaultExcel({
      data: mappedExcelData,
      column: [
        { key: "formNo", header: "" },
        { key: "reqBy", header: "" },
        { key: "no", header: "" },
        { key: "drawingNo", header: "" },
        { key: "item", header: "" },
        { key: "newCode", header: "" },
        { key: "newFlag", header: "", header: "" },
        { key: "oldCode", header: "" },
        { key: "oldFlag", header: "" },
        { key: "oldStatus", header: "" },
        { key: "oldSpec", header: "" },
        { key: "reference", header: "" },
        { key: "remark", header: "" },
      ],
      sheetName: "PS-DLC Report",
      manual: true,
      manualActions: (sheet) => {
        sheet.spliceRows(
          1,
          1,
          [
            "Form No",
            "Request By",
            "No",
            "Drawing No.",
            "Item",
            "Change To",
            "",
            "Before Change",
            "",
            "",
            "",
            "Reference",
            "Remark",
          ],
          [
            "",
            "",
            "",
            "",
            "",
            "Code",
            "New Flag",
            "Code",
            "Flag",
            "Status",
            "Spec Material",
            "",
            "",
          ],
        );

        mergeCell(sheet, 1, 1, 2, 1);
        mergeCell(sheet, 1, 2, 2, 2);
        mergeCell(sheet, 1, 3, 2, 3);
        mergeCell(sheet, 1, 4, 2, 4);
        mergeCell(sheet, 1, 5, 2, 5);
        mergeCell(sheet, 1, 6, 1, 7);
        mergeCell(sheet, 1, 8, 1, 11);
        mergeCell(sheet, 1, 12, 2, 12);
        mergeCell(sheet, 1, 13, 2, 13);

        sheet.eachRow((row) => {
          row.eachCell({ includeEmpty: true }, (cell) => {
            cell.border = border("thin");
            cell.alignment = {
              vertical: "middle",
              horizontal: "center",
              wrapText: true,
            };
          });
        });

        [1, 2].forEach((rowNumber) => {
          sheet.getRow(rowNumber).font = { bold: true };
          sheet.getRow(rowNumber).alignment = {
            vertical: "middle",
            horizontal: "center",
            wrapText: true,
          };
        });

        sheet.getRow(1).height = 24;
        sheet.getRow(2).height = 24;
      },
    });

    // สั่งดาวน์โหลดไฟล์ Excel
    exportExcel(excel, "Change PN Production Report");
  } catch (error) {
    console.log(error);
  }
});
