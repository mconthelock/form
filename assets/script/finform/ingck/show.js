import { fetchUtils } from "@amec/webasset/api/fetch-utils";
import { getExtData, getFormDetail, getMode, showflow } from "@amec/webasset/api/webform";
import { showMessage } from "@amec/webasset/utils";
import { createTable } from "@amec/webasset/dataTable";
import { webflowSubmit } from "@amec/webasset/components/form";
import { redirectWebflow } from "@amec/webasset/form";
import { setDatePicker } from "@amec/webasset/flatpickr";
/*--------------------GLOBAL--------------------*/

let table;
let mapColumns = [];
let dutyStampList = [];
let isActionProcessing = false;
let cextData = "";
let workflowMode = "";

const columns = [
  { data: "LINEID", defaultContent: "" },
  { data: "REASON", defaultContent: "" },
];

/*--------------------READY FUNCTION--------------------*/

$(async function () {
  try {
    setDatePicker({
      element: "#RetDate",
    });
    

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
    const files = normalizeFiles(showData);

    renderFinDsHeader(header);
    renderAttachment(files);

    const stamp = await getStamp();
    console.log("stamp:", stamp);

    dutyStampList = Array.isArray(stamp) ? stamp : [];

    const rows = mapDetailToRows(detail, dutyStampList);
    console.log("table rows:", rows);

    await createTableStamp(rows, dutyStampList);

    await renderWorkflowAction(form);

    lockForm();
    applyReceiveDateApprovalState();
  } catch (error) {
    console.error(error);
    showMessage(error.message || "Cannot load form data", "error");

    await createTableStamp([]);
    lockForm();
  }
});

/*--------------------APPROVE FLOW FUNCTION--------------------*/

$(document).on("click", 'button[name="btnAction"]', async function (e) {
  e.preventDefault();

  if (isActionProcessing) return;

  const form = getFormKeyFromUrl();
  const action = $(this).val();
  const remark = $("#remark").val() || "";
  const dateReceive = $("#RetDate").val() || "";

  if (action === "reject" && !String(remark).trim()) {
    showMessage("Please input remark for reject.", "warning");
    $("#remark").trigger("focus");
    return;
  }

  if (shouldRequireReceiveDateOnApprove(action) && !dateReceive) {
    showMessage("Please choose Date Receive.", "warning");
    $("#RetDate").trigger("focus");
    return;
  }

  try {
    isActionProcessing = true;
    $('button[name="btnAction"]').prop("disabled", true);

    const actionPayload = {
      NFRMNO: form.NFRMNO,
      VORGNO: form.VORGNO,
      CYEAR: form.CYEAR,
      CYEAR2: form.CYEAR2,
      NRUNNO: form.NRUNNO,
      EMPNO: form.EMPNO,
      ACTION: action,
      REMARK: remark,
      CEXTDATA: getCextDataValue(cextData),
    };

    if (shouldRequireReceiveDateOnApprove(action)) {
      actionPayload.DATE_RECEIVE = dateReceive;
    }

    console.log("FIN-DS approve payload:", actionPayload);

    const result = await approveFinDs(actionPayload);

    if (!result?.status) {
      throw new Error(result?.message || "Cannot process workflow action");
    }

    showMessage(result.message || "Workflow action completed", "success");
    redirectWebflow();
  } catch (error) {
    console.error(error);
    showMessage(error.message || "Cannot process workflow action", "error");
  } finally {
    isActionProcessing = false;
    $('button[name="btnAction"]').prop("disabled", false);
  }
});

/*--------------------URL PARAM FUNCTION--------------------*/

function getFormKeyFromUrl() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  const form = {
    NFRMNO: urlParams.get("no"),

    VORGNO: urlParams.get("orgNo"),

    CYEAR: urlParams.get("y"),

    CYEAR2: urlParams.get("y2"),

    NRUNNO: urlParams.get("runNo"),
    EMPNO: urlParams.get("empno"),
  };

  console.log("queryString:", queryString);
  console.log("form from URL:", form);

  return form;
}

function applyReceiveDateApprovalState() {
  const canInputReceiveDate =
    workflowMode === "2" && getCextDataValue(cextData) === "01";

  $("#RetDate")
    .prop("disabled", !canInputReceiveDate)
    .prop("readonly", !canInputReceiveDate)
    .toggleClass("show-readonly", !canInputReceiveDate);
}

function shouldRequireReceiveDateOnApprove(action) {
  return action === "approve" && getCextDataValue(cextData) === "01";
}

function hasFormKey(form) {
  return Boolean(
    form.NFRMNO &&
      form.VORGNO &&
      form.CYEAR &&
      form.NRUNNO &&
      form.EMPNO,
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
    url: `${process.env.APP_API}/finform/fin-ds/show/${encodeURIComponent(form.NFRMNO)}/${encodeURIComponent(form.VORGNO)}/${encodeURIComponent(form.CYEAR)}/${encodeURIComponent(form.CYEAR2)}/${encodeURIComponent(form.NRUNNO)}`,
    method: "GET",
  });
}

async function getEmpData(empno) {
  return await fetchUtils({
    url: `${process.env.APP_API}/users/${empno}`,
    method: "GET",
  });
}

async function approveFinDs(formData) {
  return await fetchUtils({
    url: `${process.env.APP_API}/finform/fin-ds/action`,
    method: "POST",
    data: formData,
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

  $("#addStampRow, #btnRequest").addClass("hidden").prop("disabled", true);
}

function renderFormDetail(formDetail = {}) {
  $("#FORMNO").val(formDetail.FORMNO || "");

  $("#INPUTBY").val(
    formatPerson(formDetail.VINPUTNAME || "", formDetail.VINPUTER || ""),
  );

  $("#REQBY").val(
    formatPerson(formDetail.VREQNAME || "", formDetail.VREQNO || ""),
  );
}

function renderEmpData(empData = {}) {
  if (!empData) return;

  console.log("ข้อมูลที่ได้จาก API:", empData);

  const secCode = String(empData.SSECCODE || "");

  $("#Pos")
    .removeClass(
      "badge-outline badge-info badge-success badge-error badge-warning text-info-content text-success-content",
    )
    .addClass("border-none");

  if (secCode === "040402") {
    console.log("เป็น FIN staff:", secCode);

    $("#Pos").text("FIN Staff").addClass("badge-info text-info-content");

    $("#OPT").removeClass("hidden");
  } else {
    console.log("ไม่ใช่ FIN staff:", secCode);

    $("#Pos").text("Employee").addClass("badge-success text-success-content");

    $("#OPT").addClass("hidden");
  }

  $("#FULLDP").val(
    [empData.SDIV, empData.SDEPT, empData.SSEC].filter(Boolean).join("/"),
  );
}
async function renderWorkflowAction(form) {
  if (!form?.EMPNO) {
    $("#sentApprove").html(`
      <div class="alert alert-warning shadow-sm mt-5">
        <div>
          <p class="font-bold">Cannot load workflow action</p>
          <p class="text-sm">Employee number not found in URL.</p>
        </div>
      </div>
    `);
    return;
  }

  try {
    const mode = String(
      await getMode({
        ...form,
        EMPNO: form.EMPNO,
      }),
    );

    workflowMode = mode;

    cextData = getCextDataValue(
      await getExtData({
        ...form,
        EMPNO: form.EMPNO,
      }),
    );

    const flow = await showflow(form);

    console.log("mode:", mode);
    console.log("CEXTDATA:", cextData);
    console.log("flow:", flow);

    let action = "";

    switch (mode) {
      case "2":
        action = webflowSubmit({
          flow: true,
          flowhtml: flow?.html || flow?.data?.html || "",
          approve: true,
          reject: true,
        });
        break;

      case "3":
        action = webflowSubmit({
          flow: true,
          flowhtml: flow?.html || flow?.data?.html || "",
          actionsForm: false,
        });
        break;

      default:
        action = `
          <div class="alert alert-warning shadow-sm mt-5">
            <div>
              <p class="font-bold">Unknown workflow mode</p>
              <p class="text-sm">Mode: ${escapeHtml(mode)}</p>
            </div>
          </div>
        `;
        break;
    }

    $("#sentApprove").html(action);
  } catch (error) {
    console.error("Cannot render workflow action:", error);

    $("#sentApprove").html(`
      <div class="alert alert-error shadow-sm mt-5">
        <div>
          <p class="font-bold">Cannot load workflow action</p>
          <p class="text-sm">${escapeHtml(error.message || "Unknown error")}</p>
        </div>
      </div>
    `);
  }
}
function renderFinDsHeader(header = {}) {
  setDateInputValue("#EffDate", formatDate(header.EFFECTIVE_DATE));
  setDateInputValue("#RetDate", formatDate(header.DATE_RECEIVE));
  $("#location").val(header.LOCATION || "");
  $("#REMARK").val(header.REMARK || "");
  const optionCode = String(header.OPTION_CODE ?? "0");

  $(
    `input[name='OPTION_CODE'][value='${escapeSelectorValue(optionCode)}']`,
  ).prop("checked", true);
}

function renderAttachment(files = []) {
  const attachmentList = $("#attachmentList");

  if (!attachmentList.length) return;

  if (!Array.isArray(files) || files.length === 0) {
    attachmentList.html(`
      <div class="alert alert-info shadow-sm">
        <span>No attachment</span>
      </div>
    `);
    return;
  }

  attachmentList.html(`
    <ul class="space-y-2">
      ${files.map(renderAttachmentItem).join("")}
    </ul>
  `);
}
function renderAttachmentItem(file = {}) {
  const fileName =
    file.FILE_ONAME ||
    file.FILE_NAME ||
    file.filename ||
    file.name ||
    "Attachment";

  const fileId =
    file.FILE_ID ||
    file.FILEID ||
    file.fileId ||
    file.id ||
    "";

  if (!fileId) {
    return `
      <li class="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
        ${escapeHtml(fileName)}
      </li>
    `;
  }

  const downloadUrl =
    `${process.env.APP_API}/finform/fin-ds/file/${encodeURIComponent(fileId)}`;

  return `
    <li class="rounded-lg border border-cyan-200 bg-cyan-50/70 px-4 py-3 flex items-center justify-between gap-3">
      <div class="min-w-0">
        <p class="font-bold text-slate-700 truncate">
          ${escapeHtml(fileName)}
        </p>
        <p class="text-xs text-slate-400">
          File ID: ${escapeHtml(fileId)}
        </p>
      </div>

      <a
        href="${escapeHtml(downloadUrl)}"
        target="_blank"
        class="btn btn-xs btn-info"
      >
        Download
      </a>
    </li>
  `;
}
function renderActionStatus(header = {}) {
  if (!$("#actionform").length) return;

  const status = header.STATUS || header.DOC_STATUS || header.WF_STATUS || "";
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

function normalizeFiles(showData) {
  const files =
    showData?.data?.files ||
    showData?.data?.FILES ||
    showData?.files ||
    showData?.FILES ||
    [];

  return Array.isArray(files) ? files : [];
}

function mapDetailToRows(detail = [], stamp = []) {
  const rowsByLine = {};

  detail.forEach((item, index) => {
    const lineId =
      item.LINEID || item.LINE_ID || item.LINE || item.SEQ || index + 1;

    const reason = item.REASON || "";

    const dutyValue = Number(item.DUTY_VALUE || item.DUTYVALUE || 0);

    const qty = Number(item.QTY || 0);

    const amount = Number(
      item.AMT || item.AMOUNT || item.DUTY_AMT || qty * dutyValue || 0,
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

function setDateInputValue(selector, value) {
  const element = $(selector)[0];

  if (element?._flatpickr) {
    if (value) {
      element._flatpickr.setDate(value, false);
    } else {
      element._flatpickr.clear();
    }

    return;
  }

  $(selector).val(value || "");
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

function getCextDataValue(value) {
  if (!value) return "";

  if (typeof value === "string") return value.trim();

  if (Array.isArray(value)) {
    return getCextDataValue(value[0]);
  }

  if (typeof value === "object") {
    return getCextDataValue(
      value.CEXTDATA ??
        value.cextData ??
        value.CEXDATA ??
        value.data ??
        value.message ??
        "",
    );
  }

  return String(value).trim();
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
