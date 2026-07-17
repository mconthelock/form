import { showLoader } from "@amec/webasset/preloader";
import { logFormData, requiredForm, showMessage } from "@amec/webasset/utils";
import { createTable, newRow } from "@amec/webasset/dataTable";
import { setDatePicker } from "@amec/webasset/flatpickr";
import { webflowSubmit } from "@amec/webasset/components/form";
import { fetchUtils } from "@amec/webasset/api/fetch-utils";
import { redirectWebflow } from "@amec/webasset/form";

/*--------------------READY FUNCTION--------------------*/

$(async function () {
  setupFieldGuide();
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const empno = urlParams.get("empno");
  let getsec;
  let prefix = "";
  try {
    if (empno) getsec = await getData(empno);
    prefix = getsec?.SSECCODE || "";
  } catch (error) {
    console.error("Cannot load employee data:", error);
  }

  console.log("Prefix ที่ได้คือ:", prefix);
  $("#INPUTBY").val(empno);
  setEmpName("#INPUTBY_NAME", getEmpName(getsec));
  setDatePicker({
    element: "#EffDate",
  });
  setDatePicker({
    element: "#RetDate",
  });
  $("#RetDate").prop("disabled", true);
  const action = webflowSubmit({ request: true });

  console.log(action);
  $("#actionform").html(action);
  syncStampTablePalette();
  await createTableStamp();
});

$(document).on("change", "input[name='OPTION_CODE']", syncStampTablePalette);

function syncStampTablePalette() {
  const isBuy = String($("input[name='OPTION_CODE']:checked").val() || "0") === "1";
  $("#stampTable")
    .toggleClass("stamp-table-buy", isBuy)
    .toggleClass("stamp-table-withdraw", !isBuy);
}

const fieldGuides = [
  ["#INPUTBY", "Requester Information", "Input By", "ผู้สร้างเอกสาร ระบบกรอกให้อัตโนมัติ ไม่ต้องแก้ไข"],
  ["#REQBY", "Requester Information", "Requester By", "กรอกรหัสพนักงานของผู้ขอสร้างรายการ แล้วระบบจะแสดงชื่อและหน่วยงานให้ตรวจสอบ"],
  ["#FULLDP", "Requester Information", "DIV / Dept / Sect", "หน่วยงานของผู้ขอสร้างรายการ ระบบดึงจากรหัสพนักงานให้อัตโนมัติ"],
  ["input[name='OPTION_CODE']", "Request Details", "Option", "เลือก Withdrawal เมื่อต้องการเบิกอากรแสตมป์ หรือ Add สำหรับเจ้าหน้าที่ FIN ที่ต้องการเพิ่มรายการ"],
  ["#EffDate", "Request Details", "Requisition Date", "เลือกวันที่ทำรายการขอเบิกอากรแสตมป์ วันที่ทำการขอเบิกไม่ใช่วันที่ระบุว่าจะได้รับ"],
  ["#location", "Request Details", "Collection Location", "ระบุสถานที่รับอากรแสตมป์ หากไม่เปลี่ยนให้ใช้ Counter FIN Sect."],
  ["#addStampRow", "Purpose & Duty Stamp Detail", "Add Row", "เพิ่มหนึ่งแถวต่อหนึ่งเหตุผลในการขอเบิก"],
  ["#stampTable", "Purpose & Duty Stamp Detail", "รายการอากรแสตมป์", "กรอกเหตุผลใน Reason และจำนวนใน QTY ระบบคำนวณ AMT ให้อัตโนมัติ หรือกดลบเพื่อนำแถวที่ไม่ต้องการออก"],
  ["#attachfile", "Attachment", "Attachment", "แนบหลักฐาน PDF, JPG หรือ PNG ได้หลายไฟล์ หากไม่มีเอกสารประกอบสามารถเว้นว่างได้"],
];

function setupFieldGuide() {
  $("head").append(`<style>
    #fieldGuide {
      position: fixed;
      top: 50%;
      left: 1.5rem;
      transform: translateY(-50%);
      width: 18rem;
      z-index: 100;
      border-color: var(--guide-color);
      border-left-width: 5px;
      background: var(--guide-bg);
      color: #172033;
    }
    #fieldGuideGroup, #fieldGuideTitle { color: var(--guide-color); }
    #fieldGuideToggle { display: none; }
    .guide-progress-dot {
      width: .8rem;
      height: .8rem;
      border: 2px solid #111827;
      border-radius: 9999px;
      background: white;
      cursor: pointer;
    }
    .guide-progress-dot.guide-done { background: #111827; }
    .guide-progress-dot.guide-active {
      border-color: var(--guide-color);
      background: var(--guide-color);
      box-shadow: 0 0 0 3px white, 0 0 0 5px var(--guide-color);
    }
    .guide-target-highlight {
      outline: 3px solid var(--guide-highlight-color) !important;
      outline-offset: 3px;
      animation: guideHighlight 1.1s ease-in-out infinite;
    }
    @keyframes guideHighlight {
      0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--guide-highlight-color) 45%, transparent); }
      50% { box-shadow: 0 0 0 8px transparent; }
    }
    @media (max-width: 1399px) {
      #fieldGuide {
        top: auto;
        right: 1rem;
        bottom: 1rem;
        left: auto;
        width: 3.5rem;
        height: 3.5rem;
        padding: 0;
        border-radius: 9999px;
        overflow: hidden;
        transform: none;
      }
      #fieldGuideToggle {
        display: flex;
        width: 100%;
        height: 100%;
        align-items: center;
        justify-content: center;
        border: 0;
        background: var(--guide-color);
        color: white;
        font-size: 1.5rem;
        font-weight: 900;
      }
      #fieldGuide .field-guide-content { display: none; }
      #fieldGuide.guide-expanded {
        width: min(18rem, calc(100vw - 2rem));
        height: auto;
        padding: 1rem;
        border-radius: .75rem;
        overflow: visible;
      }
      #fieldGuide.guide-expanded #fieldGuideToggle {
        position: absolute;
        top: .5rem;
        right: .5rem;
        width: 2rem;
        height: 2rem;
        border-radius: 9999px;
      }
      #fieldGuide.guide-expanded .field-guide-content {
        display: block;
        padding-right: 1.5rem;
      }
    }
  </style>`);

  const themes = {
    "Requester Information": ["#1d4ed8", "#eff6ff"],
    "Request Details": ["#6d28d9", "#f5f3ff"],
    "Purpose & Duty Stamp Detail": ["#047857", "#ecfdf5"],
    Attachment: ["#0891b2", "#ecfeff"],
  };
  const guide = $(`<aside id="fieldGuide" class="border-2 rounded-xl p-4 shadow-xl" aria-live="polite">
    <button id="fieldGuideToggle" type="button" aria-label="เปิดคู่มือ" aria-expanded="false">?</button>
    <div class="field-guide-content">
    <div class="flex items-center justify-between gap-2 mb-2">
      <div id="fieldGuideGroup" class="text-xs font-extrabold uppercase tracking-wide"></div>
      <div id="fieldGuideCount" class="text-xs font-bold text-slate-500"></div>
    </div>
    <div id="fieldGuideProgress" class="flex flex-wrap gap-2 mb-4"></div>
    <div id="fieldGuideTitle" class="font-extrabold mb-1"></div>
    <div id="fieldGuideText" class="text-sm text-slate-700 min-h-10"></div>
    <div class="flex justify-between gap-2 mt-4">
      <button id="guidePrevious" type="button" class="btn btn-sm btn-ghost">ก่อนหน้า</button>
      <button id="guideNext" type="button" class="btn btn-sm btn-neutral">ถัดไป</button>
    </div>
    </div>
  </aside>`).appendTo("body");
  let activeIndex = 1;

  fieldGuides.forEach((item, index) => {
    guide.find("#fieldGuideProgress").append(
      $(`<button type="button" class="guide-progress-dot" data-guide-index="${index}"></button>`)
        .attr("aria-label", `ขั้น ${index + 1}: ${item[2]}`),
    );
  });

  const getGuideTarget = (index) => {
    const targets = $(fieldGuides[index][0]).filter(":visible");
    const checked = targets.filter(":checked").first();
    return checked.length ? checked : targets.first();
  };

  const highlightTarget = () => {
    $(".guide-target-highlight")
      .removeClass("guide-target-highlight")
      .css("--guide-highlight-color", "");
    const target = getGuideTarget(activeIndex);
    if (!target.length) return;
    target
      .addClass("guide-target-highlight")
      .css("--guide-highlight-color", themes[fieldGuides[activeIndex][1]][0]);
  };

  const activateGuideStep = (index, moveToTarget = false) => {
    activeIndex = Math.max(0, Math.min(index, fieldGuides.length - 1));
    const item = fieldGuides[activeIndex];
    const theme = themes[item[1]];
    guide.css({ "--guide-color": theme[0], "--guide-bg": theme[1] });
    guide.find("#fieldGuideGroup").text(item[1]);
    guide.find("#fieldGuideCount").text(`ขั้น ${activeIndex + 1}/${fieldGuides.length}`);
    guide.find("#fieldGuideTitle").text(item[2]);
    guide.find("#fieldGuideText").text(item[3]);
    guide.find(".guide-progress-dot").each(function (dotIndex) {
      $(this)
        .toggleClass("guide-done", dotIndex < activeIndex)
        .toggleClass("guide-active", dotIndex === activeIndex)
        .attr("aria-current", dotIndex === activeIndex ? "step" : null);
    });
    guide.find("#guidePrevious").prop("disabled", activeIndex === 0);
    guide.find("#guideNext").prop("disabled", activeIndex === fieldGuides.length - 1);

    const target = getGuideTarget(activeIndex);
    if (moveToTarget && target.length) {
      target[0].scrollIntoView({ behavior: "smooth", block: "center" });
      if (!target.prop("disabled") && !target.prop("readonly")) target.trigger("focus");
    }
    requestAnimationFrame(highlightTarget);
  };
  activateGuideStep(activeIndex);

  guide.on("click", "[data-guide-index]", function () {
    activateGuideStep(Number($(this).data("guide-index")), true);
  });
  guide.find("#guidePrevious").on("click", () => activateGuideStep(activeIndex - 1, true));
  guide.find("#guideNext").on("click", () => activateGuideStep(activeIndex + 1, true));
  guide.find("#fieldGuideToggle").on("click", function () {
    const expanded = guide.toggleClass("guide-expanded").hasClass("guide-expanded");
    $(this).attr({ "aria-expanded": expanded, "aria-label": expanded ? "ย่อคู่มือ" : "เปิดคู่มือ" }).text(expanded ? "×" : "?");
  });

  $("#form").on(
    "focusin mouseover",
    fieldGuides.map(([selector]) => selector).join(","),
    function (event) {
      const index = fieldGuides.findIndex(([selector]) =>
        $(event.target).closest(selector).length,
      );
      if (index < 0) return;
      activateGuideStep(index);
    },
  );
}

/*--------------------Change FUNCTION--------------------*/
$(document).on("change", "#REQBY", async function () {
  const empnum = $(this).val().trim();
  setEmpName("#REQBY_NAME", "");

  if (!empnum) {
    $("#FULLDP").val("");
    return;
  }
  try {
    const getsec = await getData(empnum);
    console.log("ข้อมูลที่ได้จาก API:", getsec);

    setEmpName("#REQBY_NAME", getEmpName(getsec));

    if (getsec && getsec.SSECCODE === "040402") {
      console.log("เป็น FIN staff:", getsec.SSECCODE);
      $("#Pos").text("FIN Staff");
      $("#OPT").removeClass("hidden");
    } else {
      console.log("ไม่ใช่ FIN staff:", getsec?.SSECCODE);
      $("#Pos").text("Employee");
      $("#OPT").addClass("hidden");
    }
    $("#FULLDP").val(getsec.SDIV + "/" + getsec.SDEPT + "/" + getsec.SSEC);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดตอนเรียก API:", error);
    setEmpName("#REQBY_NAME", "");
    $("#FULLDP").val("");
    $("#Pos").text("Error");
  }
});

function getEmpName(empData = {}) {
  return (
    empData?.SNAME ||
    empData?.EMP_NAME ||
    empData?.EMPNAME ||
    empData?.FULLNAME ||
    empData?.NAME ||
    ""
  );
}

function setEmpName(element, name) {
  const nameElement = $(element);
  nameElement.find(".emp-name").text(name);
  nameElement.toggleClass("hidden", !name).toggleClass("flex", Boolean(name));
}

export async function getData(empno) {
  return await fetchUtils({
    url: `${process.env.APP_API}/users/${empno}`,
    method: "GET",
  });
}

async function getStamp() {
  return await fetchUtils({
    url: `${process.env.APP_API}/finform/fin-ds`,
    method: "GET",
  });
}

async function getBalance() {
  const response = await fetchUtils({
    url: `${process.env.APP_API}/finform/fin-ds/report/${new Date().getFullYear()}`,
    method: "GET",
  });
  const rows = response?.datareport ?? response?.data?.datareport ?? response?.data ?? response;

  if (!Array.isArray(rows)) throw new Error("Cannot load duty stamp report");

  return dutyStampList.map(({ DUTY_VALUE }) => ({
    DUTY_VALUE: numberValue(DUTY_VALUE),
    BAL_QTY: rows.reduce(
      (total, row) => total + numberValue(row[`BUY_${DUTY_VALUE}_QTY`]) - numberValue(row[`WD_${DUTY_VALUE}_QTY`]),
      0,
    ),
  }));
}
var table, mapColumns;
var dutyStampList = [];
var remainingByDutyValue = new Map();
var balanceLoadError = null;

function numberValue(value) {
  if (typeof value === "string") {
    return Number(value.replace(/[\$,]/g, "")) || 0;
  }

  return Number(value) || 0;
}

async function refreshRemainingBalance() {
  const response = await getBalance();
  const balance = response?.data?.data ?? response?.data ?? response;

  if (!Array.isArray(balance)) {
    throw new Error("Cannot load remaining duty stamp quantity");
  }

  remainingByDutyValue = new Map(
    balance.map((item) => [numberValue(item.DUTY_VALUE), numberValue(item.BAL_QTY)]),
  );
  balanceLoadError = null;
}

function getRemainingStockErrors(rows) {
  if (String($("input[name='OPTION_CODE']:checked").val() || "0") === "1") {
    return [];
  }

  if (balanceLoadError) {
    return [{ message: "ไม่สามารถตรวจสอบยอดคงเหลือได้ กรุณาลองใหม่อีกครั้ง" }];
  }

  const errors = [];
  for (let stampIndex = 0; stampIndex < dutyStampList.length; stampIndex++) {
    const columnName = `DUTY_QTY${stampIndex + 1}`;
    const dutyValue = numberValue(dutyStampList[stampIndex].DUTY_VALUE);
    const requested = rows.reduce((total, row) => total + numberValue(row[columnName]), 0);
    const available = Math.max(0, remainingByDutyValue.get(dutyValue) || 0);

    if (requested > available) {
      errors.push({
        dutyValue,
        available,
        requested,
        shortage: requested - available,
        message: `อากรแสตมป์ ${dutyValue} บาท: คงเหลือ ${available} ดวง, ขอ ${requested} ดวง, ขาด ${requested - available} ดวง`,
      });
    }
  }

  return errors;
}

async function createTableStamp(data = []) {
  mapColumns = [...columns];

  const stamp = await getStamp();
  dutyStampList = stamp;
  try {
    await refreshRemainingBalance();
  } catch (error) {
    balanceLoadError = error;
    console.error("Cannot load remaining duty stamp quantity:", error);
  }
  console.log(stamp);
  console.log(dutyStampList);
  const length = stamp.length * 2;
  console.log(length);

  let html = `<thead>
    <tr>
        <th rowspan="3">No.</th>
        <th rowspan="3">Reason for requisition</th>
        <th colspan="${length}">Duty stamp</th>
        <th rowspan="3">Action</th>
    </tr><tr>`;

  const s = stamp
    .map((a) => {
      return `<th colspan="2">${a.DUTY_VALUE} Baht</th>`;
    })
    .join("");
  html += s + "</tr><tr>";
  const subHeader = ["QTY", "AMT"];
  for (let i = 0; i < length / 2; i++) {
    html += `<th>${subHeader[0]}</th><th>${subHeader[1]}</th>`;
    mapColumns.push({ data: `DUTY_QTY${i + 1}` });
    mapColumns.push({ data: `DUTY_AMT${i + 1}` });
  }
  mapColumns.push({
    data: null,
    orderable: false,
    searchable: false,
    className: "text-center",
    defaultContent: '<button type="button" class="delete-stamp-row btn btn-xs btn-error" aria-label="ลบรายการ">ลบ</button>',
  });

  html += "</tr></thead>";
  html += `<tfoot><tr>`;
  html += `<th colspan="2">Total</th>`; // ควบ No. และ Reason เป็นช่องเดียว
  for (let i = 0; i < length; i++) {
    html += `<th>0</th>`; // สร้าง <th> เปล่าๆ รอรับค่า Total ตามจำนวนคอลัมน์ QTY และ AMT
  }
  html += `<th></th></tr></tfoot>`;
  $("#stampTable").html(html);

  table = await createTable(
    {
      data: data,
      columns: mapColumns,
      searching: false,
      footerCallback: function (row, data, start, end, display) {
        let api = this.api();

        // Helper function สำหรับแปลงค่าเป็นตัวเลข (กัน error กรณีเป็น string หรือค่าว่าง)
        let intVal = function (i) {
          return typeof i === "string"
            ? i.replace(/[\$,]/g, "") * 1
            : typeof i === "number"
              ? i
              : 0;
        };

        // ลูปหาผลรวมของแต่ละคอลัมน์ เริ่มจาก index 2 (คอลัมน์ QTY แรก) ข้าม 0 (No) และ 1 (Reason)
        for (let i = 2; i < mapColumns.length - 1; i++) {
          let total = api
            .column(i)
            .data()
            .reduce(function (a, b) {
              return intVal(a) + intVal(b);
            }, 0);

          // อัปเดตค่าลงใน <tfoot> ของคอลัมน์นั้นๆ
          $(api.column(i).footer()).html(total);
        }
      },
    },
    {
      id: "stampTable",
      inlineEdit: {
        status: true,
        disabledColumns: [0, mapColumns.length - 1],
        matchers: [
          {
            match: { startsWith: "DUTY_QTY" },
            validate: ({ value }) => {
              console.log(typeof +value, Number.isNaN(+value));

              if (isNaN(value) || value < 0 || Number.isNaN(+value)) {
                return "Please enter a valid non-negative number";
              }

              return true;
            },
            async onSuccess({ value, table, cell, rowData }) {
              console.log(value);
              const cellIndex = cell.index();
              const columnName = table.column(cellIndex.column).dataSrc();
              const index = columnName.replace("DUTY_QTY", "");
              const amtColumn = `DUTY_AMT${index}`;
              const dutyValue = stamp[Number(index) - 1].DUTY_VALUE;
              const qty = Number(value);
              const calculatedAmt = qty * dutyValue;
              rowData[columnName] = qty;
              rowData[amtColumn] = calculatedAmt;
              table.row(cell.index().row).data(rowData).draw(false);
            },
          },
          {
            match: { startsWith: "DUTY_AMT" },
            disabled: true,
          },
        ],
        onError: ({ error, table, cell }) => {
          console.error(error);
          showMessage(error.message, "warning");
        },
      },
    },
  );
  console.log(table);
}

const columns = [{ data: "LINEID" }, { data: "REASON" }];

$(document).on("click", "#addStampRow", async function () {
  console.log(table.rows().data().toArray());
  const data = table.rows().data().toArray();
  const newLineId = data.length + 1;
  let emptyData = {};
  mapColumns.forEach((col) => {
    if (!col.data) return;
    if (col.data === "LINEID") {
      emptyData[col.data] = newLineId;
    } else {
      emptyData[col.data] = "";
    }
  });
  newRow(table, emptyData);
});

$(document).on("click", "#stampTable .delete-stamp-row", function () {
  table.row($(this).closest("tr")).remove();
  let lineId = 1;
  table.rows().every(function () {
    const row = this.data();
    row.LINEID = lineId++;
    this.data(row);
  });
  table.draw(false);
});
/*--------------------Check Before Submit--------------------*/

$(document).on("click", "#btnRequest", async function (e) {
  e.preventDefault();

  try {
    const requiredMessage = [
      { element: $("#REQBY"), message: "Please enter your Emp code." },
      { element: $("#FULLDP"), message: "Please enter your Emp code" },
      { element: $("#EffDate"), message: "Please choose Requisition Date" },
      { element: $("#location"), message: "Please enter Collection Location" },
    ];

    if (!(await requiredForm("#form", requiredMessage))) return;

    const rows = table.rows().data().toArray();

    await refreshRemainingBalance();
    const stockErrors = getRemainingStockErrors(rows);

    if (stockErrors.length) {
      showMessage(
        `ไม่สามารถ Request ได้ เนื่องจากยอดคงเหลือไม่เพียงพอ<br><br>${stockErrors.map(({ message }) => message).join("<br>")}`,
        "warning",
        "toast-center",
      );
      return;
    }

    const dataList = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      if (!row.REASON || row.REASON.toString().trim() === "") {
        showMessage(
          `Please enter Reason for requisition in row ${i + 1}`,
          "warning",
        );
        return;
      }

      let hasQty = false;

      dutyStampList.forEach((stampItem, stampIndex) => {
        const index = stampIndex + 1;
        const qty = numberValue(row[`DUTY_QTY${index}`]);

        if (qty > 0) {
          hasQty = true;

          const dutyValue = stampItem?.DUTY_VALUE;

          if (
            dutyValue === undefined ||
            dutyValue === null ||
            dutyValue === ""
          ) {
            throw new Error(`Duty value not found in row ${i + 1}`);
          }

          dataList.push({
            LINE_ID: row.LINEID,
            REASON: row.REASON,
            DUTY_VALUE: dutyValue,
            QTY: qty,
            AMT:
              numberValue(row[`DUTY_AMT${index}`]) ||
              qty * numberValue(dutyValue),
          });
        }
      });

      if (!hasQty) {
        showMessage(
          `Please enter at least one Duty Stamp QTY in row ${i + 1}`,
          "warning",
        );
        return;
      }
    }

    const formData = new FormData();

    formData.set("INPUTBY", $("#INPUTBY").val() || "");
    formData.set("REQBY", $("#REQBY").val() || "");
    formData.set("REMARK", $("#REMARK").val() || "");
    formData.set(
      "OPTION_CODE",
      String($("input[name='OPTION_CODE']:checked").val() || "0"),
    );
    formData.set("EFFECTIVE_DATE", $("#EffDate").val() || "");
    formData.set("LOCATION", $("#location").val() || "");

    formData.set("DATA", JSON.stringify(dataList));

    const files = $("#attachfile")[0]?.files || [];

    for (const file of files) {
      formData.append("attachfile", file);
    }

    logFormData(formData);

    const res = await createForm(formData);
    console.log(res);

    if (res?.status === false) {
      throw new Error(res?.message || "Cannot submit request");
    }

    showMessage(res?.message || "Request submitted successfully", "success");
    redirectWebflow();
  } catch (error) {
    console.error(error);
    showMessage(error.message, "error");
  }
});

export async function createForm(formData) {
  return await fetchUtils({
    url: `${process.env.APP_API}/finform/fin-ds`,
    method: "POST",
    data: formData,
  });
}
