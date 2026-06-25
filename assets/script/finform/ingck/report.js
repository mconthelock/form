import { fetchUtils } from "@amec/webasset/api/fetch-utils";
import { createTable } from "@amec/webasset/dataTable";
import ExcelJS from "exceljs";

let table;
let mapColumns = [];
let dutyStampList = [];
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth() + 1;
let currentDivision = "all";
let reportRows = [];

const baseColumns = [
  { data: "DATE_RECEIVE", defaultContent: "", className: "report-date" },
  { data: "DETAIL", defaultContent: "", className: "report-detail" },
  { data: "SECTION", defaultContent: "", className: "report-section" },
];

$(async function () {
  updateYearUI();
  $("#reportMonth").val(String(currentMonth));
  await loadReport(currentYear);
});

$(document).on("click", ".nav-btn", async function () {
  const step = Number($(this).data("step") || 0);

  currentYear += step;
  updateYearUI();
  await loadReport(currentYear);
});

$(document).on("change", "#reportMonth", async function () {
  currentMonth = $(this).val();
  updateYearUI();
  await createReportTable(filterReportRows(reportRows), dutyStampList);
});

$(document).on("change", "#reportDivision", async function () {
  currentDivision = $(this).val() || "all";
  await createReportTable(filterReportRows(reportRows), dutyStampList);
});

$(document).on("change", "#year", async function () {
  const year = Number($(this).val());

  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    updateYearUI();
    return;
  }

  currentYear = year;
  updateYearUI();
  await loadReport(currentYear);
});

$(document).on("click", "#addStampRow", async function () {
  await exportReportToExcel(getCurrentExportRows(), dutyStampList);
});

async function getStamp() {
  return await fetchUtils({
    url: `${process.env.APP_API}/finform/fin-ds`,
    method: "GET",
  });
}

async function getReport(year) {
  return await fetchUtils({
    url: `${process.env.APP_API}/finform/fin-ds/report/${encodeURIComponent(year)}`,
    method: "GET",
  });
}

async function getEmpData(empno) {
  return await fetchUtils({
    url: `${process.env.APP_API}/users/${encodeURIComponent(empno)}`,
    method: "GET",
  });
}

async function loadReport(year) {
  try {
    if (!dutyStampList.length) {
      const stamp = await getStamp();
      dutyStampList = Array.isArray(stamp) ? stamp : [];
    }

    const response = await getReport(year);
    const reportData = normalizeReportData(response);
    reportRows = mapReportToRows(reportData, dutyStampList);
    await enrichRowsWithEmpData(reportRows);
    updateDivisionOptions(reportRows);

    await createReportTable(filterReportRows(reportRows), dutyStampList);
  } catch (error) {
    console.error(error);
    reportRows = [];
    updateDivisionOptions([]);
    await createReportTable([], dutyStampList);
  }
}

async function createReportTable(data = [], stamp = dutyStampList) {
  mapColumns = [...baseColumns];

  const stampCount = Array.isArray(stamp) ? stamp.length : 0;
  const sectionColspan = stampCount * 2;
  const headerRowspan = stampCount > 0 ? 3 : 1;

  let html = `
    <thead>
      <tr>
        <th rowspan="${headerRowspan}" class="report-sticky-date report-meta-header">Date</th>
        <th rowspan="${headerRowspan}" class="report-meta-header">Detail</th>
        <th rowspan="${headerRowspan}" class="report-meta-header">Section</th>
  `;

  if (stampCount > 0) {
    html += `
        <th colspan="${sectionColspan}" class="report-group-header report-buy-header">Buy</th>
        <th colspan="${sectionColspan}" class="report-group-header report-withdraw-header">Withdraw</th>
        <th colspan="${sectionColspan}" class="report-group-header report-remaining-header">Remaining</th>
    `;
  }

  html += `
        <th rowspan="${headerRowspan}" class="report-balance-header">Balance Qty</th>
        <th rowspan="${headerRowspan}" class="report-balance-header">Balance Amount</th>
        <th rowspan="${headerRowspan}" class="report-meta-header">Remark</th>
      </tr>
  `;

  if (stampCount > 0) {
    html += `
      <tr>
    `;

    ["BUY", "WD", "RM"].forEach((section) => {
      stamp.forEach((item) => {
        html += `<th colspan="2" class="${getReportColumnGroupClass(section)} report-denom-header">${escapeHtml(item.DUTY_VALUE)} Baht</th>`;
      });
    });

    html += `
      </tr>
      <tr>
    `;

    ["BUY", "WD", "RM"].forEach((section) => {
      stamp.forEach((_, stampIndex) => {
        const groupClass = getReportColumnGroupClass(section);
        html += `<th class="${groupClass} report-metric-header">QTY</th><th class="${groupClass} report-metric-header">AMT</th>`;

        mapColumns.push({
          data: `${section}_QTY${stampIndex + 1}`,
          defaultContent: "",
          className: `report-qty ${groupClass}`,
        });

        mapColumns.push({
          data: `${section}_AMT${stampIndex + 1}`,
          defaultContent: "",
          className: `report-amt ${groupClass}`,
        });
      });
    });

    html += `
      </tr>
    `;
  }

  mapColumns.push({
    data: "BALANCE_QTY",
    defaultContent: "",
    className: "report-balance report-balance-group",
  });
  mapColumns.push({
    data: "BALANCE_AMT",
    defaultContent: "",
    className: "report-balance report-balance-group",
  });
  mapColumns.push({ data: "REMARK", defaultContent: "", className: "report-remark" });

  html += `
    </thead>
    <tfoot>
      <tr>
  `;

  mapColumns.forEach((column, index) => {
    html += index === 1 ? `<th>Total</th>` : `<th></th>`;
  });

  html += `
      </tr>
    </tfoot>
  `;

  $("#stampTable").html(html);

  if (table) {
    table.destroy();
    $("#stampTable").empty().html(html);
  }

  const secIndex = mapColumns.findIndex((col) => col.data === "SECTION");

  table = await createTable(
    {
      data,
      columns: mapColumns,
      ordering: false,
      // searching: false,
      paging: false,
      info: false,
      autoWidth: false,
      responsive: false,
      columnDefs: [
        {
          targets: "_all",
          orderable: false,
        },
      ],
      footerCallback: function () {
        renderReportFooter(this.api());
      },
      createdRow: function (row, rowData, dataIndex) {
        applyReportRowClasses(row, rowData, dataIndex, data);
      },
      initComplete: function () {
        $('.dt-search').addClass('hidden')
      }
    },
    {
      id: "stampTable",
      buttonFilter: {
        status: true,
        column: secIndex
      },
    },
  );

  if (table?.columns?.adjust) {
    setTimeout(() => {
      $(
        ".dt-container, .dt-scroll, .dt-scroll-head, .dt-scroll-body, .dt-scroll-foot, .dataTables_wrapper, .dataTables_scroll, .dataTables_scrollHead, .dataTables_scrollBody, .dataTables_scrollFoot",
      ).css("width", "100%");
      $(".dt-scroll-body, .dataTables_scrollBody").css("overflow-x", "auto");
      table.columns.adjust().draw(false);
      renderReportFooter(table);
      syncReportTableWidth();
    }, 0);
  }

  return table;
}

function getReportColumnGroupClass(section) {
  return {
    BUY: "report-buy",
    WD: "report-withdraw",
    RM: "report-remaining",
  }[section] || "";
}

function applyReportRowClasses(row, rowData, dataIndex, rows = []) {
  const previousRow = rows[dataIndex - 1];

  if (previousRow && previousRow.DATE_RECEIVE !== rowData.DATE_RECEIVE) {
    $(row).addClass("report-date-boundary");
  }

  mapColumns.forEach((column, index) => {
    if (!/^BALANCE_(QTY|AMT)$/.test(column.data)) return;
    if (numberValue(rowData[column.data]) < 0) {
      $("td", row).eq(index).addClass("report-negative");
    }
  });
}

function renderReportFooter(api) {
  const values = mapColumns.map((column, index) => {
    if (index === 1) return "Total";
    if (!shouldShowReportTotal(column.data)) return "";

    return formatNumber(getReportFooterValue(api, index, column.data));
  });

  const $footerCells = $(api.table().footer()).find("th");
  setFooterCellValues($footerCells, values);
  setFooterCellClasses($footerCells, values);

  const $container = $(api.table().container());
  const $scrollFooterCells = $container.find(
    ".dt-scroll-foot tfoot th, .dataTables_scrollFoot tfoot th",
  );
  setFooterCellValues($scrollFooterCells, values);
  setFooterCellClasses($scrollFooterCells, values);
}

function getReportFooterValue(api, columnIndex, columnName) {
  const columnData = api.column(columnIndex, { search: "applied" }).data();

  if (/^RM_(QTY|AMT)\d+$/.test(columnName)) {
    return numberValue(columnData[columnData.length - 1]);
  }

  return columnData.reduce((sum, value) => sum + numberValue(value), 0);
}

function setFooterCellValues($cells, values) {
  if (!$cells.length) return;

  values.forEach((value, index) => {
    $cells.eq(index).html(value);
  });
}

function setFooterCellClasses($cells, values) {
  if (!$cells.length) return;

  values.forEach((value, index) => {
    const columnName = mapColumns[index]?.data;
    const $cell = $cells.eq(index);

    $cell.removeClass("report-negative");

    if (/^BALANCE_(QTY|AMT)$/.test(columnName) && numberValue(value) < 0) {
      $cell.addClass("report-negative");
    }
  });
}

function syncReportTableWidth() {
  const $bodyTable = $("#stampTable");
  const $container = $bodyTable.closest(".dt-container, .dataTables_wrapper");
  const $headerTable = $container
    .find(".dt-scroll-head table, .dataTables_scrollHead table")
    .first();
  const $footerTable = $container
    .find(".dt-scroll-foot table, .dataTables_scrollFoot table")
    .first();

  const tableWidth = $bodyTable.outerWidth();
  if (tableWidth && $headerTable.length) {
    $headerTable.css("width", `${tableWidth}px`);
  }
  if (tableWidth && $footerTable.length) {
    $footerTable.css("width", `${tableWidth}px`);
  }

  const $bodyCols = $bodyTable.find("colgroup col");
  const $headerCols = $headerTable.find("colgroup col");
  const $footerCols = $footerTable.find("colgroup col");

  if ($bodyCols.length && $bodyCols.length === $headerCols.length) {
    syncColWidths($bodyCols, $headerCols);
  }
  if ($bodyCols.length && $bodyCols.length === $footerCols.length) {
    syncColWidths($bodyCols, $footerCols);
  }
}

function syncColWidths($sourceCols, $targetCols) {
  $sourceCols.each((index, col) => {
    const width = $(col).css("width");
    $targetCols.eq(index).css({ width, minWidth: width });
  });
}

async function exportReportToExcel(data = [], stamp = dutyStampList) {
  const $button = $("#addStampRow");

  try {
    $button.prop("disabled", true).addClass("loading");

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Stamp Report");
    const exportColumns = getExportColumns(stamp);
    const lastColumn = exportColumns.length;

    workbook.creator = "FIN-DS";
    workbook.created = new Date();

    sheet.mergeCells(1, 1, 1, lastColumn);
    sheet.getCell(1, 1).value = `Control Duty Stamp Report - ${formatReportPeriod()}`;
    sheet.getCell(1, 1).font = { bold: true, size: 14 };
    sheet.getCell(1, 1).alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    renderExcelHeader(sheet, stamp, lastColumn);
    renderExcelRows(sheet, data, exportColumns);
    renderExcelTotal(sheet, data, exportColumns);
    styleExcelSheet(sheet, exportColumns);

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = getExportFileName();
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Export report failed", error);
    alert("Cannot export Excel. Please try again.");
  } finally {
    $button.prop("disabled", false).removeClass("loading");
  }
}

function getExportColumns(stamp = []) {
  const columns = [
    { key: "DATE_RECEIVE", width: 12 },
    { key: "DETAIL", width: 34 },
    { key: "SECTION", width: 16 },
  ];

  ["BUY", "WD", "RM"].forEach((section) => {
    stamp.forEach((_, stampIndex) => {
      columns.push({ key: `${section}_QTY${stampIndex + 1}`, width: 10 });
      columns.push({ key: `${section}_AMT${stampIndex + 1}`, width: 12 });
    });
  });

  columns.push({ key: "BALANCE_QTY", width: 14 });
  columns.push({ key: "BALANCE_AMT", width: 16 });
  columns.push({ key: "REMARK", width: 32 });

  return columns;
}

function renderExcelHeader(sheet, stamp = [], lastColumn) {
  const stampCount = Array.isArray(stamp) ? stamp.length : 0;
  const headerRowspanEnd = 4;

  sheet.mergeCells(2, 1, headerRowspanEnd, 1);
  sheet.getCell(2, 1).value = "Date";
  sheet.mergeCells(2, 2, headerRowspanEnd, 2);
  sheet.getCell(2, 2).value = "Detail";
  sheet.mergeCells(2, 3, headerRowspanEnd, 3);
  sheet.getCell(2, 3).value = "Section";

  let column = 4;
  if (stampCount > 0) {
    [
      { key: "BUY", label: "Buy" },
      { key: "WD", label: "Withdraw" },
      { key: "RM", label: "Remaining" },
    ].forEach((section) => {
      const startColumn = column;
      const endColumn = column + stampCount * 2 - 1;

      sheet.mergeCells(2, startColumn, 2, endColumn);
      sheet.getCell(2, startColumn).value = section.label;

      stamp.forEach((item) => {
        sheet.mergeCells(3, column, 3, column + 1);
        sheet.getCell(3, column).value = `${item.DUTY_VALUE} Baht`;
        sheet.getCell(4, column).value = "QTY";
        sheet.getCell(4, column + 1).value = "AMT";
        column += 2;
      });
    });
  }

  [
    "Balance Qty",
    "Balance Amount",
  ].forEach((label, index) => {
    const headerColumn = lastColumn - 2 + index;
    sheet.mergeCells(2, headerColumn, headerRowspanEnd, headerColumn);
    sheet.getCell(2, headerColumn).value = label;
  });

  sheet.mergeCells(2, lastColumn, headerRowspanEnd, lastColumn);
  sheet.getCell(2, lastColumn).value = "Remark";
}

function renderExcelRows(sheet, data = [], exportColumns = []) {
  data.forEach((row, rowIndex) => {
    const excelRow = sheet.getRow(rowIndex + 5);

    exportColumns.forEach((column, columnIndex) => {
      const value = row[column.key];
      excelRow.getCell(columnIndex + 1).value =
        isNumericReportColumn(column.key) ? numberValue(value) : value || "";
    });
  });
}

function renderExcelTotal(sheet, data = [], exportColumns = []) {
  const totalRowNumber = data.length + 5;
  const row = sheet.getRow(totalRowNumber);

  row.getCell(2).value = "Total";

  exportColumns.forEach((column, index) => {
    if (!isNumericReportColumn(column.key)) return;
    if (!shouldShowReportTotal(column.key)) return;

    row.getCell(index + 1).value = getExcelTotalValue(data, column.key);
  });

  row.font = { bold: true };
}

function getExcelTotalValue(data = [], columnName) {
  if (/^RM_(QTY|AMT)\d+$/.test(columnName)) {
    return numberValue(data[data.length - 1]?.[columnName]);
  }

  return data.reduce((sum, item) => {
    return sum + numberValue(item[columnName]);
  }, 0);
}

function styleExcelSheet(sheet, exportColumns = []) {
  const columnCount = exportColumns.length;

  sheet.views = [{ state: "frozen", ySplit: 4 }];

  exportColumns.forEach((column, index) => {
    sheet.getColumn(index + 1).width = column.width || 12;
  });

  for (let rowNumber = 1; rowNumber <= sheet.rowCount; rowNumber++) {
    const row = sheet.getRow(rowNumber);

    for (let columnNumber = 1; columnNumber <= columnCount; columnNumber++) {
      const cell = row.getCell(columnNumber);

      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: columnNumber === 2 || columnNumber === columnCount,
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };

      if (rowNumber >= 2 && rowNumber <= 4) {
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFECFDF5" },
        };
      }

      if (rowNumber === sheet.rowCount) {
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF8FAFC" },
        };
      }
    }
  }

  sheet.getRow(1).height = 24;
  sheet.getRows(2, 3)?.forEach((row) => {
    row.height = 22;
  });
}

function getExportFileName() {
  const period = formatReportPeriod().replace(/\s+/g, "_");

  return `Control_Duty_Stamp_${period}.xlsx`;
}

function getCurrentExportRows() {
  const fallbackRows = filterReportRows(reportRows);

  if (!table?.rows) {
    return fallbackRows;
  }

  try {
    const rows = table.rows({ search: "applied" }).data().toArray();
    return Array.isArray(rows) ? rows : fallbackRows;
  } catch (error) {
    console.error("Cannot read filtered report rows from DataTable", error);
    return fallbackRows;
  }
}

function mapReportToRows(reportData = [], stamp = []) {
  const runningQty = {};
  const sortedReportData = [...reportData].sort((a, b) => {
    return getDateTime(a) - getDateTime(b);
  });

  const rows = sortedReportData.map((item) => {
    const transactionSection = getReportSection(item);
    const reason = getReportRemark(item);
    const row = {
      DATE_RECEIVE: formatDate(getEffectiveDate(item)),
      USER_EMPNO: getReportUserEmpno(item),
      USER: getReportUser(item),
      DIVISION: getReportDivisionName(item),
      SECTION: getReportSectionName(item),
      DETAIL_TYPE: transactionSection,
      DETAIL: getReportDetail(transactionSection, item),
      REMARK: reason,
    };

    stamp.forEach((stampItem, stampIndex) => {
      const dutyValue = stampItem.DUTY_VALUE;
      const dutyKey = normalizeDutyKey(dutyValue);
      const columnIndex = stampIndex + 1;

      const buyQty = numberValue(
        pickDutyValue(item, ["BUY", "PURCHASE"], dutyValue, dutyKey, "QTY"),
      );
      const buyAmt = numberValue(
        pickDutyValue(item, ["BUY", "PURCHASE"], dutyValue, dutyKey, "AMT"),
      );
      const withdrawQty = numberValue(
        pickDutyValue(item, ["WD", "WITHDRAW"], dutyValue, dutyKey, "QTY"),
      );
      const withdrawAmt = numberValue(
        pickDutyValue(item, ["WD", "WITHDRAW"], dutyValue, dutyKey, "AMT"),
      );
      const qtyMovement = buyQty - withdrawQty;

      runningQty[dutyKey] = (runningQty[dutyKey] || 0) + qtyMovement;
      const remainingQty = runningQty[dutyKey];

      row[`BUY_QTY${columnIndex}`] = buyQty;
      row[`BUY_AMT${columnIndex}`] = buyAmt || buyQty * numberValue(dutyValue);
      row[`WD_QTY${columnIndex}`] = withdrawQty;
      row[`WD_AMT${columnIndex}`] =
        withdrawAmt || withdrawQty * numberValue(dutyValue);
      row[`RM_QTY${columnIndex}`] = remainingQty;
      row[`RM_AMT${columnIndex}`] = remainingQty * numberValue(dutyValue);
    });

    row.BALANCE_QTY = stamp.reduce((total, stampItem) => {
      return total + numberValue(runningQty[normalizeDutyKey(stampItem.DUTY_VALUE)]);
    }, 0);

    row.BALANCE_AMT = stamp.reduce((total, stampItem) => {
      const dutyValue = stampItem.DUTY_VALUE;
      const dutyKey = normalizeDutyKey(dutyValue);

      return total + numberValue(runningQty[dutyKey]) * numberValue(dutyValue);
    }, 0);

    return row;
  });

  return rows;
}

function pickDutyValue(item, sections, dutyValue, dutyKey, suffix) {
  const keys = [];

  sections.forEach((section) => {
    keys.push(`${section}_${dutyValue}_${suffix}`);
    keys.push(`${section}_${dutyKey}_${suffix}`);
    keys.push(`${section}_${suffix}_${dutyValue}`);
    keys.push(`${section}_${suffix}_${dutyKey}`);
  });

  for (const key of keys) {
    if (item[key] !== undefined && item[key] !== null) {
      return item[key];
    }
  }

  return 0;
}

function normalizeReportData(response) {
  const data =
    response?.datareport ||
    response?.data?.datareport ||
    response?.data ||
    response?.report ||
    response;

  if (!Array.isArray(data)) return [];

  const hasDetailRows = data.some((item) => {
    return item?.DUTY_VALUE !== undefined && item?.QTY !== undefined;
  });

  if (!hasDetailRows) return data;

  return groupDetailRows(data);
}

function groupDetailRows(data) {
  const rowsByKey = {};

  data.forEach((item) => {
    const date = getEffectiveDate(item);
    const reason = getReportRemark(item);
    const user = getReportUser(item);
    const sectionName = getReportSectionName(item);
    const transactionSection = getReportSection(item);
    const key =
      item.ROW_KEY ||
      item.LINEID ||
      item.LINE_ID ||
      `${date}|${user}|${sectionName}|${reason}|${getReportOptionCode(item) ?? item.TYPE ?? ""}`;

    if (!rowsByKey[key]) {
      rowsByKey[key] = {
        DATE_RECEIVE: date,
        USER_EMPNO: getReportUserEmpno(item),
        USER: user,
        DIVISION: getReportDivisionName(item),
        SECTION: sectionName,
        DETAIL_TYPE: transactionSection,
        DETAIL: getReportDetail(transactionSection, item),
        REMARK: reason,
      };
    }

    const dutyValue = item.DUTY_VALUE;
    const dutyKey = normalizeDutyKey(dutyValue);
    const qty = numberValue(item.QTY);
    const amt = numberValue(
      item.AMT || item.AMOUNT || item.DUTY_AMT || qty * numberValue(dutyValue),
    );
    const section = getReportSection(item);

    rowsByKey[key][`${section}_${dutyValue}_QTY`] =
      numberValue(rowsByKey[key][`${section}_${dutyValue}_QTY`]) + qty;
    rowsByKey[key][`${section}_${dutyKey}_QTY`] =
      numberValue(rowsByKey[key][`${section}_${dutyKey}_QTY`]) + qty;
    rowsByKey[key][`${section}_${dutyValue}_AMT`] =
      numberValue(rowsByKey[key][`${section}_${dutyValue}_AMT`]) + amt;
    rowsByKey[key][`${section}_${dutyKey}_AMT`] =
      numberValue(rowsByKey[key][`${section}_${dutyKey}_AMT`]) + amt;
  });

  return Object.values(rowsByKey);
}

function getReportSection(item) {
  const optionCode = getReportOptionCode(item);
  const type = String(item.TYPE ?? item.TRANS_TYPE ?? item.ACTION ?? "")
    .trim()
    .toUpperCase();

  if (optionCode === "1") {
    return "BUY";
  }

  if (optionCode === "0") {
    return "WD";
  }

  if (["ADD", "BUY", "PURCHASE", "IN"].includes(type)) {
    return "BUY";
  }

  if (hasReportMovement(item, ["BUY", "PURCHASE"])) {
    return "BUY";
  }

  return "WD";
}

function getReportOptionCode(item = {}) {
  const optionCode =
    item.OPTION_CODE ??
    item.HEAD_OPTION_CODE ??
    item.HEADER_OPTION_CODE ??
    item.H_OPTION_CODE ??
    item.OPTION ??
    item.OPT_CODE ??
    null;

  if (optionCode === null || optionCode === undefined) return null;

  return String(optionCode).trim();
}

function hasReportMovement(item = {}, sections = []) {
  return Object.keys(item).some((key) => {
    const normalizedKey = key.toUpperCase();

    return (
      sections.some((section) => normalizedKey.startsWith(`${section}_`)) &&
      numberValue(item[key]) !== 0
    );
  });
}

function getReportUser(item = {}) {
  const name =
    item.USER_NAME ||
    item.VREQNAME ||
    item.REQ_NAME ||
    item.REQUESTER_NAME ||
    item.INPUT_NAME ||
    item.VINPUTNAME ||
    "";
  const empno =
    item.USER ||
    item.USER_ID ||
    item.EMPNO ||
    item.REQBY ||
    item.VREQNO ||
    item.REQUESTER ||
    item.INPUTBY ||
    item.VINPUTER ||
    "";

  if (name && empno) return `${name} (${empno})`;

  return name || empno || "";
}

function getReportUserEmpno(item = {}) {
  return (
    item.USER ||
    item.USER_ID ||
    item.EMPNO ||
    item.REQBY ||
    item.VREQNO ||
    item.REQUESTER ||
    item.INPUTBY ||
    item.VINPUTER ||
    ""
  );
}

function getReportSectionName(item = {}) {
  return (
    item.SECTION ||
    item.SECTION_NAME ||
    item.SSEC ||
    item.SSECCODE ||
    item.DEPT_SECTION ||
    item.FULLDP ||
    [item.SDIV, item.SDEPT, item.SSEC].filter(Boolean).join("/") ||
    ""
  );
}

function getReportDivisionName(item = {}) {
  return (
    item.DIVISION ||
    item.DIVISION_NAME ||
    item.SDIV ||
    item.SDIVCODE ||
    ""
  );
}

async function enrichRowsWithEmpData(rows = []) {
  const empCache = {};
  const empnos = [...new Set(rows.map((row) => row.USER_EMPNO).filter(Boolean))];

  await Promise.all(
    empnos.map(async (empno) => {
      try {
        empCache[empno] = await getEmpData(empno);
      } catch (error) {
        console.error(`Cannot load employee data: ${empno}`, error);
        empCache[empno] = null;
      }
    }),
  );

  rows.forEach((row) => {
    const empData = empCache[row.USER_EMPNO];

    if (!empData) {
      return;
    }

    const empName = getEmpName(empData);

    if (empName) {
      row.USER = formatPerson(empName, row.USER_EMPNO);
    } else {
      row.USER = row.USER || row.USER_EMPNO;
    }

    row.DETAIL = getReportDetail(row.DETAIL_TYPE, {
      USER_NAME: empName || row.USER,
      USER: row.USER_EMPNO,
    });

    row.DIVISION = formatEmpDivision(empData) || row.DIVISION;
    row.SECTION = formatEmpSection(empData) || row.SECTION;
  });
}

function getEmpName(empData = {}) {
  return (
    empData.SNAME ||
    empData.EMP_NAME ||
    empData.EMPNAME ||
    empData.FULLNAME ||
    empData.NAME ||
    ""
  );
}

function formatEmpSection(empData = {}) {
  return empData.SSEC || "";
}

function formatEmpDivision(empData = {}) {
  return empData.SDIV || empData.SDIVCODE || "";
}

function formatPerson(name, empno) {
  if (name && empno) return `${name} (${empno})`;
  return name || empno || "";
}

function formatPersonCodeFirst(name, empno, separator = " ") {
  if (name && empno) return `(${empno})${separator}${name}`;
  return name || empno || "";
}

function updateYearUI() {
  $("#year").val(currentYear);
  $("#reportPeriodInline").text(formatReportPeriod());
}

function filterReportRows(rows = []) {
  return rows.filter((row) => {
    return isRowInSelectedMonth(row) && isRowInSelectedDivision(row);
  });
}

function updateDivisionOptions(rows = []) {
  const divisions = [
    ...new Set(
      rows
        .map((row) => String(row.DIVISION || "").trim())
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));

  if (currentDivision !== "all" && !divisions.includes(currentDivision)) {
    currentDivision = "all";
  }

  const options = [
    '<option value="all">All divisions</option>',
    ...divisions.map(
      (division) =>
        `<option value="${escapeHtml(division)}">${escapeHtml(division)}</option>`,
    ),
  ];

  $("#reportDivision").html(options.join("")).val(currentDivision);
}

function isRowInSelectedDivision(row) {
  if (currentDivision === "all") return true;

  return String(row.DIVISION || "").trim() === currentDivision;
}

function isRowInSelectedMonth(row) {
  if (currentMonth === "all") return true;

  const month = Number(currentMonth);
  const date = parseReportDate(row.DATE_RECEIVE);

  return date && date.getMonth() + 1 === month;
}

function formatReportPeriod() {
  if (currentMonth === "all") {
    return `FY ${currentYear}`;
  }

  const monthName = new Date(currentYear, Number(currentMonth) - 1, 1)
    .toLocaleString("en-US", { month: "long" });

  return `${monthName} ${currentYear}`;
}

function formatDate(value) {
  if (!value) return "";

  const text = String(value);
  const date = parseReportDate(text);

  if (!date) {
    return text;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatNumber(value) {
  return numberValue(value).toLocaleString("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function isNumericReportColumn(columnName) {
  return (
    /_(QTY|AMT)\d+$/.test(columnName) ||
    columnName === "BALANCE_QTY" ||
    columnName === "BALANCE_AMT"
  );
}

function shouldShowReportTotal(columnName) {
  return (
    isNumericReportColumn(columnName) &&
    !/^BALANCE_(QTY|AMT)$/.test(columnName)
  );
}

function getDateTime(item) {
  const date = parseReportDate(getEffectiveDate(item));

  return date ? date.getTime() : 0;
}

function getReportDetail(section, item = {}) {
  const isAdd = section === "BUY";
  const label = isAdd ? "Receive By" : "Issue By";
  const name =
    item.USER_NAME ||
    item.VREQNAME ||
    item.REQ_NAME ||
    item.REQUESTER_NAME ||
    item.INPUT_NAME ||
    item.VINPUTNAME ||
    "";
  const empno = getReportUserEmpno(item);
  const person = formatPersonCodeFirst(name, empno, isAdd ? "  " : " ");

  return `${label} :  ${person || "-"}`;
}

function getReportRemark(item = {}) {
  return item.REMARK || item.REASON || item.DETAIL || "-";
}

function getEffectiveDate(item = {}) {
  return (
    item.DATE_RECEIVE ||
    item.DATE_RECIEVE ||
    item.EFFECTIVE_DATE ||
    item.EFF_DATE ||
    item.DATE_EFFECTIVE ||
    ""
  );
}

function parseReportDate(value) {
  if (!value) return null;

  const text = String(value).trim();
  const isoMatch = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);

  if (isoMatch) {
    return new Date(
      Number(isoMatch[1]),
      Number(isoMatch[2]) - 1,
      Number(isoMatch[3]),
    );
  }

  const slashMatch = text.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);

  if (slashMatch) {
    const year = Number(slashMatch[3]);
    return new Date(
      year < 100 ? year + 2000 : year,
      Number(slashMatch[2]) - 1,
      Number(slashMatch[1]),
    );
  }

  const date = new Date(text);

  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeDutyKey(value) {
  return String(value ?? "").replace(/[^a-zA-Z0-9]/g, "_");
}

function numberValue(value) {
  if (typeof value === "string") {
    return Number(value.replace(/[\$,]/g, "")) || 0;
  }

  return typeof value === "number" ? value : 0;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
