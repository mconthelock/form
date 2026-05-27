import { fetchUtils } from "@amec/webasset/api/fetch-utils";
import { createTable } from "@amec/webasset/dataTable";

let table;
let mapColumns = [];
let dutyStampList = [];
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth() + 1;
let reportRows = [];

const baseColumns = [
  { data: "DATE_RECEIVE", defaultContent: "", className: "report-date" },
  { data: "REASON", defaultContent: "", className: "report-detail" },
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
  await createReportTable(filterRowsByMonth(reportRows), dutyStampList);
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

    await createReportTable(filterRowsByMonth(reportRows), dutyStampList);
  } catch (error) {
    console.error(error);
    reportRows = [];
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
        <th rowspan="${headerRowspan}">D/M/Y</th>
        <th rowspan="${headerRowspan}">Detail</th>
  `;

  if (stampCount > 0) {
    html += `
        <th colspan="${sectionColspan}">Buy</th>
        <th colspan="${sectionColspan}">Withdraw</th>
        <th colspan="${sectionColspan}">Remaining</th>
    `;
  }

  html += `
        <th rowspan="${headerRowspan}">Balance Qty</th>
        <th rowspan="${headerRowspan}">Balance Amount</th>
        <th rowspan="${headerRowspan}">User</th>
        <th rowspan="${headerRowspan}">Section</th>
      </tr>
  `;

  if (stampCount > 0) {
    html += `
      <tr>
    `;

    ["BUY", "WD", "RM"].forEach(() => {
      stamp.forEach((item) => {
        html += `<th colspan="2">${escapeHtml(item.DUTY_VALUE)}</th>`;
      });
    });

    html += `
      </tr>
      <tr>
    `;

    ["BUY", "WD", "RM"].forEach((section) => {
      stamp.forEach((_, stampIndex) => {
        html += `<th>QTY</th><th>AMT</th>`;

        mapColumns.push({
          data: `${section}_QTY${stampIndex + 1}`,
          defaultContent: "",
          className: "report-qty",
        });

        mapColumns.push({
          data: `${section}_AMT${stampIndex + 1}`,
          defaultContent: "",
          className: "report-amt",
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
    className: "report-balance",
  });
  mapColumns.push({
    data: "BALANCE_AMT",
    defaultContent: "",
    className: "report-balance",
  });
  mapColumns.push({ data: "USER", defaultContent: "", className: "report-user" });
  mapColumns.push({
    data: "SECTION",
    defaultContent: "",
    className: "report-section",
  });

  html += `
    </thead>
    <tfoot>
      <tr>
  `;

  mapColumns.forEach((column, index) => {
    html += index === 1 ? `<th>Total:</th>` : `<th></th>`;
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

  table = await createTable(
    {
      data,
      columns: mapColumns,
      ordering: false,
      searching: false,
      paging: false,
      info: false,
      autoWidth: false,
      scrollX: true,
      scrollCollapse: true,
      responsive: false,
      destroy: true,
      columnDefs: [
        {
          targets: "_all",
          orderable: false,
        },
      ],
      footerCallback: function () {
        renderReportFooter(this.api());
      },
    },
    {
      id: "stampTable",
      inlineEdit: {
        status: false,
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

function renderReportFooter(api) {
  const values = mapColumns.map((column, index) => {
    if (index === 1) return "Total:";
    if (!isNumericReportColumn(column.data)) return "";

    const total = api
      .column(index)
      .data()
      .reduce((sum, value) => sum + numberValue(value), 0);

    return formatNumber(total);
  });

  const $footerCells = $(api.table().footer()).find("th");
  setFooterCellValues($footerCells, values);

  const $container = $(api.table().container());
  const $scrollFooterCells = $container.find(
    ".dt-scroll-foot tfoot th, .dataTables_scrollFoot tfoot th",
  );
  setFooterCellValues($scrollFooterCells, values);
}

function setFooterCellValues($cells, values) {
  if (!$cells.length) return;

  values.forEach((value, index) => {
    $cells.eq(index).html(value);
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

function mapReportToRows(reportData = [], stamp = []) {
  const runningQty = {};
  const sortedReportData = [...reportData].sort((a, b) => {
    return getDateTime(a) - getDateTime(b);
  });

  const rows = sortedReportData.map((item) => {
    const row = {
      DATE_RECEIVE: formatDate(getEffectiveDate(item)),
      USER_EMPNO: getReportUserEmpno(item),
      USER: getReportUser(item),
      SECTION: getReportSectionName(item),
      REASON: item.REASON || item.DETAIL || "-",
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

      runningQty[dutyKey] = (runningQty[dutyKey] || 0) + buyQty - withdrawQty;

      row[`BUY_QTY${columnIndex}`] = buyQty;
      row[`BUY_AMT${columnIndex}`] = buyAmt || buyQty * numberValue(dutyValue);
      row[`WD_QTY${columnIndex}`] = withdrawQty;
      row[`WD_AMT${columnIndex}`] =
        withdrawAmt || withdrawQty * numberValue(dutyValue);
      row[`RM_QTY${columnIndex}`] = runningQty[dutyKey];
      row[`RM_AMT${columnIndex}`] =
        runningQty[dutyKey] * numberValue(dutyValue);
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
    const reason = item.REASON || item.DETAIL || "-";
    const user = getReportUser(item);
    const sectionName = getReportSectionName(item);
    const key =
      item.ROW_KEY ||
      item.LINEID ||
      item.LINE_ID ||
      `${date}|${user}|${sectionName}|${reason}|${item.OPTION_CODE ?? item.TYPE ?? ""}`;

    if (!rowsByKey[key]) {
      rowsByKey[key] = {
        DATE_RECEIVE: date,
        USER_EMPNO: getReportUserEmpno(item),
        USER: user,
        SECTION: sectionName,
        REASON: reason,
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
  const optionCode = String(item.OPTION_CODE ?? item.OPTION ?? "");
  const type = String(item.TYPE ?? item.TRANS_TYPE ?? item.ACTION ?? "")
    .trim()
    .toUpperCase();

  if (optionCode === "1" || ["ADD", "BUY", "PURCHASE", "IN"].includes(type)) {
    return "BUY";
  }

  return "WD";
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

function formatPerson(name, empno) {
  if (name && empno) return `${name} (${empno})`;
  return name || empno || "";
}

function updateYearUI() {
  $("#year").text(currentYear);
  $("#reportPeriodInline").text(formatReportPeriod());
}

function filterRowsByMonth(rows = []) {
  if (currentMonth === "all") return rows;

  const month = Number(currentMonth);

  return rows.filter((row) => {
    const date = parseReportDate(row.DATE_RECEIVE);

    return date && date.getMonth() + 1 === month;
  });
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

  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
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

function getDateTime(item) {
  const date = parseReportDate(getEffectiveDate(item));

  return date ? date.getTime() : 0;
}

function getEffectiveDate(item = {}) {
  return (
    item.EFFECTIVE_DATE ||
    item.EFF_DATE ||
    item.DATE_EFFECTIVE ||
    item.DATE_RECEIVE ||
    item.DATE_RECIEVE ||
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
