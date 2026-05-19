import { fetchUtils } from "@amec/webasset/api/fetch-utils";
import { doaction, getExtData, getFormDetail, getMode, showflow } from "@amec/webasset/api/webform";
import { webflowSubmit } from "@amec/webasset/components/form";
import { getUrlParams, showErrorMessage, showMessage } from "@amec/webasset/utils";
import { downloadOrOpenFile, getFileForm } from "@amec/webasset/api/file";
import { redirectWebflow } from "@amec/webasset/form";

var cextData;
$(async function () {
  const param = getUrlParams();
  console.log(param);

  const form = {
    NFRMNO: param.NFRMNO,
    VORGNO: param.VORGNO,
    CYEAR: param.CYEAR,
    CYEAR2: param.CYEAR2,
    NRUNNO: param.NRUNNO,
  };


  const formDetail = await getFormDetail(form);
  console.log(formDetail);
  $("#INPUTBY").text(formDetail.VINPUTER);
  $("#REQBY").text(formDetail.VREQNO);

  const empData = await getEmpData(formDetail.VREQNO);
  console.log(empData);

  $("#empName").text(empData.STNAME);
  $("#empDept").text(`${empData.SSEC}/${empData.SDEPT}/${empData.SDIV}`);
  $("#empPos").text(empData.SPOSITION);

  // ดึงข้อมูลจาก backend
  const getShowdata = await getShowData(form); // รูปแบบ stamp ปกติ
  const getShowCusdata = await getShowCusData(form); // รูปแบบพิเศษ

  // แยกส่วนแสดงไฟล์แนบออกเป็นฟังก์ชัน อ่านง่ายขึ้น
  await loadAttachedFiles(form);

  const purpose = await getData();
  console.log(purpose);

  const Purposedata = purpose
    .map((a) => {
      const otherSelect = `<input type="text"
                            class="input input-sm input-ghost w-full rounded-none border-b border-base-300 focus:border-primary focus:bg-base-200/50 px-1"
                            id="otherSelect" name="PURPOSE_OTHER" placeholder="Please specify other purpose" disabled readonly>`;

      return `<label class="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="PURPOSE_ID" 
                                    class="radio radio-xs rounded border-base-content 
                                    [--chkbg:var(--bc)] [--chkfg:var(--b1)] req" value="${a.PURPOSE_ID}"
                                    id="purpose_${a.PURPOSE_ID}" >
                                <span>${a.PURPOSE_TH}/${a.PURPOSE_EN}</span>
                                ${a.PURPOSE_ID == 4 ? otherSelect : ""}
                            </label>`;
    })
    .join("");

  $("#purposeList").html(Purposedata);

  // ปุ่ม approve กับ reject จะโชว์ก็ต่อเมื่อเป็นผู้อนุมัติเท่านั้น
  const mode = await getMode({ ...form, EMPNO: param.EMPNO });
  cextData = await getExtData({ ...form, EMPNO: param.EMPNO });
  const flow = await showflow(form);
  console.log(mode);

  let action = "";
  switch (mode) {
    case "2": // edit
      action = webflowSubmit({
        flow: true,
        flowhtml: flow.html,
        approve: true,
        reject: true,
      });
      break;

    case "3": // view
      action = webflowSubmit({
        flow: true,
        flowhtml: flow.html,
        actionsForm: false,
      });
      break;
  }
  $("#sentApprove").html(action);

  if (getShowdata.PURPOSE_ID) {
    $(`#purpose_${getShowdata.PURPOSE_ID}`).prop("checked", true);

    if (getShowdata.PURPOSE_ID == 4) {
      $("#otherSelect")
        .prop("disabled", false)
        .val(getShowdata.PURPOSE_OTHER || "");
    }
  }

  $('input[name="PURPOSE_ID"]').prop("disabled", true);
  console.log(getShowdata.NAME_STAMP);

  // เช็คว่ามีข้อมูล Other Stamp หรือไม่
  const hasCustomStamp =
    getShowCusdata &&
    Object.keys(getShowCusdata).length > 0 &&
    getShowCusdata.NRUNNO;

  // เช็คว่ามีข้อมูล Standard Stamp หรือไม่
  const hasStandardStamp =
    getShowdata &&
    Object.keys(getShowdata).length > 0 &&
    getShowdata.NAME_STAMP;

  const isSameRunNo =
    String(getShowCusdata?.NRUNNO || "").trim() ===
    String(getShowdata?.NRUNNO || "").trim();

  if (hasCustomStamp && isSameRunNo) {
    showCustomStampSection(getShowdata, getShowCusdata);
    return;
  }

  if (hasStandardStamp) {
    showStandardStampSection();
  }

  renderStandardStampByPosition(empData, getShowdata);
});

function showCustomStampSection(getShowdata, getShowCusdata) {
  $("#radioOther").prop({
    checked: true,
    disabled: false,
  });

  $("#radioStandard").prop({
    checked: false,
    disabled: true,
  });

  $("#radioOtherBox").show();
  $("#radioStandardBox").hide();

  // ปิด Standard Stamp Section
  $("#standardStampSection")
    .css({
      opacity: "0.4",
      "pointer-events": "none",
    })
    .find("input, textarea")
    .prop("disabled", false);

  // เปิด Other Stamp Section เพื่อโชว์ข้อมูล
  $("#otherStampSection")
    .css({
      opacity: "1",
      "pointer-events": "auto",
    })
    .find("input, textarea")
    .prop("disabled", false);

  // เอาข้อมูล Purpose จาก getShowdata มาโชว์
  if (getShowdata.PURPOSE_ID) {
    $(`#purpose_${getShowdata.PURPOSE_ID}`).prop("checked", true);

    if (String(getShowdata.PURPOSE_ID) === "4") {
      $("#otherSelect")
        .prop("disabled", true)
        .prop("readonly", true)
        .val(getShowdata.PURPOSE_OTHER || "");
    }
  }

  // เอาข้อมูล Other Stamp จาก getShowCusdata มาโชว์
  $("#otherQty").text(getShowCusdata.QTY || "");
  $("#otherRemark").text(getShowCusdata.REMARK || "");
}

function showStandardStampSection() {
  $("#radioStandard").prop({
    checked: true,
    disabled: false,
  });

  $("#radioOther").prop({
    checked: false,
    disabled: true,
  });

  $("#radioStandardBox").show();
  $("#radioOtherBox").hide();

  $("#standardStampSection").css({
    opacity: "1",
    "pointer-events": "auto",
  });

  $("#otherStampSection")
    .css({
      opacity: "0.4",
      "pointer-events": "none",
    })
    .find("input, textarea")
    .prop("disabled", true);
}

function renderStandardStampByPosition(empData, getShowdata) {
  const firstPosCode = getFirstPositionCode(empData.SPOSCODE);

  // กลุ่มที่ใช้ nameInput1 / stampCircle1
  const input1PosCodes = [
    "02", // PRESIDENT
    "05", // GENERAL MANAGER
    "10", // DIVISION MANAGER
    "11", // DEPUTY DIVISION MANAGER
    "20", // DEPARTMENT MANAGER
    "21", // DEPUTY DEPARTMENT MANAGER
    "90", // ADVISOR
    "22", // SENIOR SPECIALIST
    "30", // SECTION MANAGER
    "32", // SPECIALIST
  ];

  // กลุ่มที่ใช้ nameInput2 / stampCircle2
  const input2PosCodes = [
    "33", // ASSISTANT MANAGER
    "49", // SUPERVISOR
    "50", // FOREMAN
    "55", // LEADER
    "35", // ENGINEER
    "40", // STAFF
  ];

  resetStandardStampDisplay();

  if (input1PosCodes.includes(firstPosCode)) {
    setStampCircle1(getShowdata.NAME_STAMP || "");
  } else if (input2PosCodes.includes(firstPosCode)) {
    setStampCircle2(getShowdata.NAME_STAMP || "", empData.SDIV || "");
  } else {
    setStampCircle1(getShowdata.NAME_STAMP || "");
  }

  lockNameInputsByValue();
}

function getFirstPositionCode(posCode) {
  const posCodeArray = Array.isArray(posCode) ? posCode : posCode ? [posCode] : [];

  let firstPosCode =
    posCodeArray.length > 0 ? String(posCodeArray[0]).trim() : null;

  if (firstPosCode) {
    firstPosCode = firstPosCode.padStart(2, "0");
  }

  return firstPosCode;
}

function resetStandardStampDisplay() {
  $("#nameInput1").val("");
  $("#nameInput2").val("");
  $("#name").text("");
  $("#name2").text("");
  $("#divisionDisplay").text("");

  $("#rowStamp1").css("opacity", "1");
  $("#rowStamp2").css("opacity", "1");
}

function setStampCircle1(nameStamp) {
  $("#nameInput1").val(nameStamp);
  $("#name").text(nameStamp);
  $("#nameInput2").val("");

  // แถวบน active / แถวล่างจาง
  $("#rowStamp1").css("opacity", "1");
  $("#rowStamp2").css("opacity", "0.3");
}

function setStampCircle2(nameStamp, division) {
  $("#nameInput1").val("");
  $("#nameInput2").val(nameStamp);
  $("#divisionDisplay").text(division);
  $("#name2").text(nameStamp);

  // แถวบนจาง / แถวล่าง active
  $("#rowStamp1").css("opacity", "0.3");
  $("#rowStamp2").css("opacity", "1");
}

function lockNameInputsByValue() {
  const hasNameInput1 = $("#nameInput1").val().trim() !== "";
  const hasNameInput2 = $("#nameInput2").val().trim() !== "";

  $("#nameInput1").prop("disabled", hasNameInput1);
  $("#nameInput2").prop("disabled", hasNameInput2);
  $("#radioOther").prop("disabled", hasNameInput1 || hasNameInput2);
}

async function loadAttachedFiles(form) {
  try {
    const fileForm = await getFileForm({
      ...form,
      FORM_TYPE: "GP",
    });

    console.log("fileForm:", fileForm);

    if (!fileForm.status) {
      throw new Error(fileForm.message || "Cannot get attached files");
    }

    const fileList = Array.isArray(fileForm.data) ? fileForm.data : [];
    renderAttachedFiles(fileList);
  } catch (error) {
    console.error("Error fetching file form:", error);
    renderAttachedFiles([]);
  }
}

function renderAttachedFiles(fileList) {
  if (!fileList.length) {
    $(".file-list").html(`
      <div class="w-full min-h-[2rem] rounded-md border border-base-300 bg-base-100 px-4 py-2 flex items-center">
        <span class="opacity-60">-</span>
      </div>
    `);
    return;
  }

  const fileHtml = fileList
    .map((f) => {
      const originalName = f.FILE_ONAME || f.FILE_FNAME || "-";
      const storedName = f.FILE_FNAME || "";
      const filePath = f.FILE_PATH || "";

      return `
        <div class="file-item flex items-center gap-2 w-full min-w-0 min-h-[2rem] rounded-md border border-base-300 bg-base-100 px-4 py-2">
          <span class="flex-1 min-w-0 truncate">
            ${originalName}
          </span>

          <button
            type="button"
            class="download-btn btn btn-primary btn-sm ml-auto shrink-0"
            data-stored-name="${storedName}"
            data-original-name="${originalName}"
            data-path="${filePath}"
          >
            Download
          </button>
        </div>
      `;
    })
    .join("");

  $(".file-list").html(fileHtml);
}

$(document).on("click", ".download-btn", async function () {
  try {
    const file = await downloadOrOpenFile({
      baseDir: $(this).data("path"),
      storedName: $(this).data("stored-name"),
      originalName: $(this).data("original-name"),
      mode: "download",
    });
  } catch (error) {
    console.error("Error downloading or opening file:", error);
  }
});

// action form approve, reject
$(document).on("click", "button[name='btnAction']", async function () {
  try {
    const param = getUrlParams();
    const form = {
      NFRMNO: param.NFRMNO,
      VORGNO: param.VORGNO,
      CYEAR: param.CYEAR,
      CYEAR2: param.CYEAR2,
      NRUNNO: param.NRUNNO,
    };
    console.log(form)
    const action = $(this).val();
    const remark = $('#remark').val();
    const cextData = '01';
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const empno = urlParams.get("empno");
    const state = {
      ...form,
      user: empno,
      ACTION: action,
      REMARK: remark,
      NAME: "TEST NEW NAME",
    };
    console.log(state.user),
      console.log(action)
    console.log(state.REMARK)
    console.log(state.NAME)

    let res;
    if (cextData == '01') {
      res = await updateStamp(state)
    } else {
      res = await updateStamp(state);

    }

    if (res.status == true) {
      showMessage(res.message, "succcess");
      redirectWebflow();
    } else {
      throw new Error(res.message);
    }
  } catch (error) {
    console.error(error);
    showErrorMessage(error.message);
  }

});
async function getData() {
  return await fetchUtils({
    url: `${process.env.APP_API}/gpform/gp-rb`,
    method: "GET",
  });
}

async function getShowData(form) {
  const url = `${process.env.APP_API}/gpform/showstamp-gp-rb/${form.NFRMNO}/${form.VORGNO}/${form.CYEAR}/${form.CYEAR2}/${form.NRUNNO}`;
  return await fetchUtils({
    url: url,
    method: "GET",
  });
}

async function getShowCusData(form) {
  const url = `${process.env.APP_API}/gpform/showcusstamp-gp-rb/${form.NFRMNO}/${form.VORGNO}/${form.CYEAR}/${form.CYEAR2}/${form.NRUNNO}`;
  return await fetchUtils({
    url: url,
    method: "GET",
  });
}

async function getEmpData(empno) {
  return await fetchUtils({
    url: `${process.env.APP_API}/users/${empno}`,
    method: "GET",
  });
}

async function getFileForm() {
  return await fetchUtils({
    url: `${process.env.APP_API}/webform/file/get-file/`,
    method: "POST",
    data,
  });
}

async function updateStamp(state) {
   const url = `${process.env.APP_API}/gpform/showstamp-gp-rb/${state.NFRMNO}/${state.VORGNO}/${state.CYEAR}/${state.CYEAR2}/${state.NRUNNO}/${state.user}/${state.ACTION}`;
  return await fetchUtils({
    url: url,
    method: "PATCH",

  })
}