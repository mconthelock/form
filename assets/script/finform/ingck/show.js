import { fetchUtils } from "@amec/webasset/api/fetch-utils";
import { getFormDetail } from "@amec/webasset/api/webform";
import { showMessage } from "@amec/webasset/utils";
import { createTable } from "@amec/webasset/dataTable";

/*--------------------GLOBAL--------------------*/

let table;
let mapColumns = [];
let dutyStampList = [];

const columns = [
  { data: "LINEID", defaultContent: "" },
  { data: "REASON", defaultContent: "" },
];

/*--------------------READY FUNCTION--------------------*/

$(async function () {
  try {
    lockForm();

    const form = getFormKeyFromUrl();

    console.log("URL:", window.location.href);
    console.log("form key:", form);

    if (!hasFormKey(form)) {
      showMessage("Form key not found in URL", "warning");
      await createTableStamp([]);
      return;
    }

    const formDetail = await getFormDetail(form);
    console.log("formDetail:", formDetail);

    renderFormDetail(formDetail);

    if (formDetail?.VREQNO) {
      const empData = await getEmpData(formDetail.VREQNO);
      console.log("empData:", empData);

      renderEmpData(empData);
    }

    const showData = await getShowData(form);
    console.log("showData:", showData);

    const header = normalizeHeader(showData);
    const detail = normalizeDetail(showData);

    renderFinDsHeader(header);
    renderAttachment(header);
    renderActionStatus(header);

    const stamp = await getStamp();
    console.log("stamp:", stamp);

    dutyStampList = Array.isArray(stamp) ? stamp : [];

    const rows = mapDetailToRows(detail, dutyStampList);
    console.log("table rows:", rows);

    await createTableStamp(rows, dutyStampList);

    lockForm();
  } catch (error) {
    console.error(error);
    showMessage(error.message || "Cannot load form data", "error");

    await createTableStamp([]);
    lockForm();
  }
});

/*--------------------URL PARAM FUNCTION--------------------*/

function getFormKeyFromUrl() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  const form = {
    NFRMNO:
      urlParams.get("no"),

    VORGNO:
      urlParams.get("orgNo"),

    CYEAR:
      urlParams.get("y"),

    CYEAR2:
      urlParams.get("y2"),

    NRUNNO:
      urlParams.get("runNo") ,
  };

  console.log("queryString:", queryString);
  console.log("form from URL:", form);

  return form;
}

function hasFormKey(form) {
  return Boolean(
    form.NFRMNO &&
      form.VORGNO &&
      form.CYEAR &&
      form.NRUNNO,
  );
}

/*--------------------API FUNCTION--------------------*/

async function getStamp() {
  return await fetchUtils({
    url: `${process.env.APP_API}/finform/fin-ds`,
    method: "GET",
  });
}

async function getShowData(form) {
  return await fetchUtils({
    url: `${process.env.APP_API}/finform/fin-ds/show/${encodeURIComponent(form.NFRMNO)}/${encodeURIComponent(form.VORGNO)}/${encodeURIComponent(form.CYEAR)}/${encodeURIComponent(form.NRUNNO)}`,
    method: "GET",
  });
}

async function getEmpData(empno) {
  return await fetchUtils({
    url: `${process.env.APP_API}/users/${empno}`,
    method: "GET",
  });
}

/*--------------------RENDER FUNCTION--------------------*/

function lockForm() {
  $("#form")
    .find("input, select, textarea")
    .not("[type='hidden']")
    .prop("disabled", true)
    .addClass("show-readonly");

  $("#form")
    .find("input[type='text'], input[type='date'], textarea")
    .prop("readonly", true);

  $("#addStampRow, #btnRequest")
    .addClass("hidden")
    .prop("disabled", true);
}

function renderFormDetail(formDetail = {}) {
  $("#FORMNO").val(formDetail.FORMNO || "");

  $("#INPUTBY").val(
    formatPerson(
      formDetail.VINPUTNAME || "",
      formDetail.VINPUTER || "",
    ),
  );

  $("#REQBY").val(
    formatPerson(
      formDetail.VREQNAME || "",
      formDetail.VREQNO || "",
    ),
  );
}

function renderEmpData(empData = {}) {
  if (!empData) return;

  console.log("ข้อมูลที่ได้จาก API:", empData);

  const secCode = String(empData.SSECCODE || "");

  $("#Pos")
    .removeClass("badge-outline badge-info badge-success badge-error badge-warning text-info-content text-success-content")
    .addClass("border-none");

  if (secCode === "040402") {
    console.log("เป็น FIN staff:", secCode);

    $("#Pos")
      .text("FIN Staff")
      .addClass("badge-info text-info-content");

    $("#OPT").removeClass("hidden");
  } else {
    console.log("ไม่ใช่ FIN staff:", secCode);

    $("#Pos")
      .text("Employee")
      .addClass("badge-success text-success-content");

    $("#OPT").addClass("hidden");
  }

  $("#FULLDP").val(
    [
      empData.SDIV,
      empData.SDEPT,
      empData.SSEC,
    ]
      .filter(Boolean)
      .join("/"),
  );
}

function renderFinDsHeader(header = {}) {
  $("#EffDate").val(formatDate(header.EFFECTIVE_DATE));
  $("#RetDate").val(formatDate(header.DATE_RECEIVE));
  $("#location").val(header.LOCATION || "");
  $("#REMARK").val(header.REMARK || "");

  const optionCode = String(header.OPTION_CODE ?? "0");

  $(`input[name='OPTION_CODE'][value='${escapeSelectorValue(optionCode)}']`)
    .prop("checked", true);
}

function renderAttachment(header = {}) {
  const attachmentList = $("#attachmentList");

  if (!attachmentList.length) return;

  const attachments =
    header.ATTACHMENTS ||
    header.attachments ||
    header.FILES ||
    header.files ||
    [];

  if (Array.isArray(attachments) && attachments.length > 0) {
    attachmentList.html(`
      <ul class="space-y-2">
        ${attachments.map(renderAttachmentItem).join("")}
      </ul>
    `);
    return;
  }

  const attachment =
    header.ATTACHMENT ||
    header.ATTACHFILE ||
    header.ATTACH_FILE ||
    header.FILE_URL ||
    header.FILE_NAME ||
    "";

  if (!attachment) {
    attachmentList.text("No attachment");
    return;
  }

  if (typeof attachment === "string" && /^https?:\/\//i.test(attachment)) {
    attachmentList.html(`
      <a
        href="${escapeHtml(attachment)}"
        target="_blank"
        class="link link-info font-extrabold underline-offset-4"
      >
        Open attachment
      </a>
    `);
    return;
  }

  attachmentList.text(attachment);
}

function renderAttachmentItem(file = {}) {
  const fileName =
    file.FILE_NAME ||
    file.filename ||
    file.name ||
    "Attachment";

  const fileUrl =
    file.FILE_URL ||
    file.url ||
    file.path ||
    "";

  if (!fileUrl) {
    return `<li>${escapeHtml(fileName)}</li>`;
  }

  return `
    <li>
      <a
        href="${escapeHtml(fileUrl)}"
        target="_blank"
        class="link link-info font-extrabold underline-offset-4"
      >
        ${escapeHtml(fileName)}
      </a>
    </li>
  `;
}

function renderActionStatus(header = {}) {
  if (!$("#actionform").length) return;

  const status =
    header.STATUS ||
    header.DOC_STATUS ||
    header.WF_STATUS ||
    "";
}

/*--------------------TABLE FUNCTION--------------------*/

async function createTableStamp(data = [], stamp = dutyStampList) {
  mapColumns = [...columns];

  if (!Array.isArray(stamp) || stamp.length === 0) {
    $("#stampTable").html(`
      <thead>
        <tr>
          <th>No.</th>
          <th>Reason for requisition</th>
        </tr>
      </thead>
      <tfoot>
        <tr>
          <th colspan="2" style="text-align:right;">Total:</th>
        </tr>
      </tfoot>
    `);

    table = await createTable(
      {
        data,
        columns: mapColumns,
        ordering: false,
        searching: false,
        paging: false,
        info: false,
        destroy: true,
      },
      {
        id: "stampTable",
        inlineEdit: {
          status: false,
        },
      },
    );

    return table;
  }

  const length = stamp.length * 2;

  let html = `
    <thead>
      <tr>
        <th rowspan="3">No.</th>
        <th rowspan="3">Reason for requisition</th>
        <th colspan="${length}">Duty stamp</th>
      </tr>
      <tr>
  `;

  html += stamp
    .map((item) => `<th colspan="2">${escapeHtml(item.DUTY_VALUE)}</th>`)
    .join("");

  html += `
      </tr>
      <tr>
  `;

  for (let i = 0; i < stamp.length; i++) {
    html += `<th>QTY</th><th>AMT</th>`;

    mapColumns.push({
      data: `DUTY_QTY${i + 1}`,
      defaultContent: "",
    });

    mapColumns.push({
      data: `DUTY_AMT${i + 1}`,
      defaultContent: "",
    });
  }

  html += `
      </tr>
    </thead>
    <tfoot>
      <tr>
        <th colspan="2" style="text-align:right;">Total:</th>
  `;

  for (let i = 0; i < length; i++) {
    html += `<th>0</th>`;
  }

  html += `
      </tr>
    </tfoot>
  `;

  $("#stampTable").html(html);

  table = await createTable(
    {
      data,
      columns: mapColumns,
      ordering: false,
      searching: false,
      paging: false,
      info: false,
      destroy: true,
      footerCallback: function () {
        const api = this.api();

        for (let i = 2; i < mapColumns.length; i++) {
          const total = api
            .column(i)
            .data()
            .reduce((a, b) => {
              return numberValue(a) + numberValue(b);
            }, 0);

          $(api.column(i).footer()).html(formatNumber(total));
        }
      },
    },
    {
      id: "stampTable",
      inlineEdit: {
        status: false,
      },
    },
  );

  return table;
}

/*--------------------MAPPER FUNCTION--------------------*/

function normalizeHeader(showData) {
  if (!showData) return {};

  return (
    showData.data?.head ||
    showData.data?.header ||
    showData.head ||
    showData.header ||
    showData.HEAD ||
    showData.HEADER ||
    {}
  );
}

function normalizeDetail(showData) {
  if (!showData) return [];

  const detail =
    showData.data?.detail ||
    showData.data?.DETAIL ||
    showData.detail ||
    showData.DETAIL ||
    [];

  return Array.isArray(detail) ? detail : [];
}

function mapDetailToRows(detail = [], stamp = []) {
  const rowsByLine = {};

  detail.forEach((item, index) => {
    const lineId =
      item.LINEID ||
      item.LINE_ID ||
      item.LINE ||
      item.SEQ ||
      index + 1;

    const reason = item.REASON || "";

    const dutyValue = Number(
      item.DUTY_VALUE ||
        item.DUTYVALUE ||
        0,
    );

    const qty = Number(item.QTY || 0);

    const amount = Number(
      item.AMT ||
        item.AMOUNT ||
        item.DUTY_AMT ||
        qty * dutyValue ||
        0,
    );

    if (!rowsByLine[lineId]) {
      rowsByLine[lineId] = {
        LINEID: lineId,
        REASON: reason,
      };

      stamp.forEach((_, stampIndex) => {
        rowsByLine[lineId][`DUTY_QTY${stampIndex + 1}`] = "";
        rowsByLine[lineId][`DUTY_AMT${stampIndex + 1}`] = "";
      });
    }

    const stampIndex = stamp.findIndex((stampItem) => {
      return Number(stampItem.DUTY_VALUE) === dutyValue;
    });

    if (stampIndex >= 0) {
      rowsByLine[lineId][`DUTY_QTY${stampIndex + 1}`] = qty;
      rowsByLine[lineId][`DUTY_AMT${stampIndex + 1}`] = amount;
    }
  });

  return Object.values(rowsByLine).sort((a, b) => {
    return Number(a.LINEID || 0) - Number(b.LINEID || 0);
  });
}

/*--------------------HELPER FUNCTION--------------------*/

function formatDate(value) {
  if (!value) return "";

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    return text.substring(0, 10);
  }

  return text;
}

function formatNumber(value) {
  return numberValue(value).toLocaleString("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function numberValue(value) {
  if (typeof value === "string") {
    return Number(value.replace(/[\$,]/g, "")) || 0;
  }

  return typeof value === "number" ? value : 0;
}

function formatPerson(name, empno) {
  if (name && empno) return `${name} (${empno})`;
  return name || empno || "";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeSelectorValue(value) {
  return String(value).replace(/'/g, "\\'");
}
