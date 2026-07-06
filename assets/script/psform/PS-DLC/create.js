import { webflowSubmit } from "@amec/webasset/components/form";
import { createTable } from "@amec/webasset/dataTable";
import { getEmpData, getSchedule } from "./data";
import { requiredForm, showMessage } from "@amec/webasset/utils";
import ExcelJS from "exceljs";
import { setDatePicker } from "@amec/webasset/flatpickr";
import dayjs from 'dayjs';

var table;
// main function
$(async function () {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const empno = urlParams.get("empno");
  const getName = await getEmpData(empno);
  $("#INPUTBY").val(empno);
  $("#inputName").val(getName.SNAME);

  // ----------JUNG BM-------------------------
        await setDatePicker({
            element: '#selectedDate',
            dateFormat: 'Y-m-d',
            // maxDate: 'today',
            // dayOff: true,
            onChange: async (selectedDates, dateStr) => {
                await setSchedule(dateStr);
            },
        });
// -------------------------------------------------

  table = await createTable(
    {
      responsive: false,
      columns: [
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
        { title: "Remark", className: "min-w-[300px]", width: "300px" },
      ],
      columnDefs: [
        {
          targets: "_all",
          createdCell: function (td) {
            $(td).attr("contenteditable", "true").addClass("dlc-editable-cell");
          },
        },
      ],
      initComplete: function () {
        const $thead = $(this.api().table().header());

        $thead.html(`
                <tr>
                    <th rowspan="2">No</th>
                    <th rowspan="2">Drawing No.</th>
                    <th rowspan="2">Item</th>
                    <th colspan="2">Change To</th>
                    <th colspan="4">Before Change</th>
                    <th rowspan="2">Reference</th>
                    <!-- เพิ่ม style เพื่อกำหนดความกว้างขั้นต่ำที่นี่ -->
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

  const action = webflowSubmit({ request: true });
  $("#sentRequest").html(action);
});

//BM date
$(document).on('click', '#openDatePicker', function (e) {
    e.preventDefault();
    const datePicker = document.querySelector('#selectedDate')?._flatpickr;
    if (datePicker) datePicker.open();
});

async function setSchedule(dateStr) {
    let currentDate = dayjs(dateStr);
    if (!currentDate.isValid()) {
        currentDate = dayjs(String(dateStr), 'YYYYMMDD');
    }

    let res = [];
    const maxLookbackDays = 365;
    for (let i = 0; i < maxLookbackDays; i++) {
        const queryDate = currentDate.format('YYYYMMDD');
        res = await getSchedule({ sdate: queryDate, edate: queryDate });
        if (Array.isArray(res) && res.length > 0 && res[0].SCHDNUMBER != null) {
            break;
        }
        currentDate = currentDate.subtract(1, 'day');
    }

    if (!Array.isArray(res) || res.length === 0) {
        $('#schd_txt').val('');
        $('#schd_number').val('');
        $('#schd_p').val('');
        showMessage('No schedule found.');
        return;
    }

    $('#schd_txt').val(res[0].SCHDMFG);
    $('#schd_number').val(res[0].SCHDNUMBER);
    $('#schd_p').val(res[0].PRIORITY);
    const workId = String(res?.[0]?.WORKID ?? '');
    const formattedWorkId = /^\d{8}$/.test(workId)
        ? `${workId.slice(0, 4)}-${workId.slice(4, 6)}-${workId.slice(6, 8)}`
        : workId;
    $('#selectedDate').val(formattedWorkId);
}

// get name Requester
$(document).on("change", "#REQBY", async function (e) {
  e.preventDefault();
  try {
    const empData = await getEmpData($(this).val());
    $("#reqName").val(empData.SNAME);
  } catch (error) {
    console.log(error);
  }
});

// Request form
$(document).on("click", "#btnRequest", async function () {
  try {
    const requiredMessage = [
      {
        element: $("#REQBY"),
        message: "Please fill in the Request By",
      },
      {
        element: $("#schd_txt"),
        message: "Please select Schedule",
      },
      {
        element: $("#schd_p"),
        message: "Please select Schedule",
      },
      {
        element: $("#fileUpload"),
        message: "Please upload file",
      },
    ];
    if (!(await requiredForm(`#dlcForm`, requiredMessage))) return;
  } catch (error) {
    console.log(error);
    showMessage(error.message);
  }
});

var excelData = [];
const tableKeys = [
  "NO",
  "DRAWING_NO",
  "ITEM",
  "CHANGE_TO_CODE",
  "NEW_FLAG",
  "BEFORE_CODE",
  "BEFORE_FLAG",
  "STATUS",
  "SPEC_MATERIAL",
  "REFERENCE",
  "REMARK",
];

const dlcColumns = [
  { key: "NO", aliases: ["no", "no."] },
  { key: "DRAWING_NO", aliases: ["drawing no", "drawing no.", "drawing"] },
  { key: "ITEM", aliases: ["item"] },
  {
    key: "CHANGE_TO_CODE",
    aliases: ["change to code", "new code", "code"],
  },
  { key: "NEW_FLAG", aliases: ["change to new flag", "new flag"] },
  {
    key: "BEFORE_CODE",
    aliases: ["before change code", "before code", "old code"],
  },
  {
    key: "BEFORE_FLAG",
    aliases: ["before change flag", "before flag", "old flag"],
  },
  { key: "STATUS", aliases: ["before change status", "status"] },
  {
    key: "SPEC_MATERIAL",
    aliases: ["before change spec material", "spec material"],
  },
  { key: "REFERENCE", aliases: ["reference", "ref"] },
  { key: "REMARK", aliases: ["remark", "remarks"] },
];

function syncExcelDataFromTable() {
  excelData = table
    .rows()
    .data()
    .toArray()
    .map((row) => {
      const item = {};
      tableKeys.forEach((key, index) => {
        item[key] = row[index] ?? "";
      });
      return item;
    });
}

function getCellText(cell) {
  const value = cell.value;
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "object") {
    if (value.text) return value.text;
    if (value.result != null) return String(value.result);
    if (value.richText) return value.richText.map((item) => item.text).join("");
  }
  return String(value).trim();
}

async function readExcelToJson(file) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());

  const sheet = workbook.worksheets[0];
  const headerMap = findHeaderMap(sheet);
  const rows = [];

  if (headerMap.count === 0) {
    throw new Error("ไม่พบ header ที่ตรงกับตารางในไฟล์ Excel");
  }

  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber <= headerMap.headerRows) return;

    const item = {};

    dlcColumns.forEach(({ key }) => {
      const colNumber = headerMap.columns[key];
      item[key] = colNumber ? getCellText(row.getCell(colNumber)) : "";
    });

    if (dlcColumns.some(({ key }) => item[key] !== "")) {
      rows.push(item);
    }
  });

  return rows;
}

function normalizeHeader(value) {
  return String(value)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[._-]/g, "")
    .trim();
}

function findHeaderMap(sheet) {
  const maxHeaderRows = Math.min(10, sheet.rowCount);
  let bestMatch = { headerRows: 0, columns: {}, count: 0 };

  for (let headerRows = 1; headerRows <= maxHeaderRows; headerRows++) {
    const columns = {};

    for (let colNumber = 1; colNumber <= sheet.columnCount; colNumber++) {
      const headerParts = [];

      for (let rowNumber = 1; rowNumber <= headerRows; rowNumber++) {
        const text = getCellText(sheet.getRow(rowNumber).getCell(colNumber));
        if (text) headerParts.push(text);
      }

      const fullHeader = normalizeHeader(headerParts.join(" "));
      const lastHeader = normalizeHeader(
        headerParts[headerParts.length - 1] || "",
      );

      dlcColumns.forEach(({ key, aliases }) => {
        if (columns[key]) return;

        const matched = aliases.some((alias) => {
          const normalizedAlias = normalizeHeader(alias);
          return (
            fullHeader === normalizedAlias ||
            fullHeader.includes(normalizedAlias) ||
            lastHeader === normalizedAlias
          );
        });

        if (matched) columns[key] = colNumber;
      });
    }

    const count = Object.keys(columns).length;
    if (count > bestMatch.count) {
      bestMatch = { headerRows, columns, count };
    }
  }

  return bestMatch;
}

$(document).on("change", "#fileUpload", async function () {
  try {
    const file = this.files[0];
    if (!file) return;

    excelData = await readExcelToJson(file);
    console.log(excelData);

    table.clear();
    table.rows.add(
      excelData.map((row) => [
        row.NO,
        row.DRAWING_NO,
        row.ITEM,
        row.CHANGE_TO_CODE,
        row.NEW_FLAG,
        row.BEFORE_CODE,
        row.BEFORE_FLAG,
        row.STATUS,
        row.SPEC_MATERIAL,
        row.REFERENCE,
        // `<textarea class="textarea textarea-bordered textarea-md w-full min-w-[300px] min-h-20 dlc-remark" ></textarea>`,
        row.REMARK,
      ]),
    );
    table.draw(false);
  } catch (error) {
    console.log(error);
    showMessage(error.message);
  }
});

$(document).on("blur", "#Table tbody td.dlc-editable-cell", function () {
  const value = $(this).text().trim();

  table.cell(this).data(value);
  syncExcelDataFromTable();
});
