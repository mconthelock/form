import { fetchUtils } from "@amec/webasset/api/fetch-utils";
import { getFormDetail } from "@amec/webasset/api/webform";
import { webflowSubmit } from "@amec/webasset/components/form";
import { redirectWebflow } from "@amec/webasset/form";
import { logFormData, requiredForm, showMessage } from "@amec/webasset/utils";
import { positionCodeMapping, stampConfig, targetPosCodeForCircle2 } from "./stampConfig";

$(async function () {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const empno = urlParams.get("empno");
  $("#INPUTBY").val(empno);

  /*
  const empData = await getEmpData(empno);
  $('#INPUTBY').val(empno + '_' + empData.SNAME);
  $("#empDept").val(empData.SSEC + '/' + empData.SDEPT + '/' + empData.SDIV);
  $("#empPos").val(empData.SPOSITION);
  */

  const purpose = await getData();
  console.log(purpose);
  const sortpurpose = purpose.sort((a, b) => a.PURPOSE_ID - b.PURPOSE_ID);

  const Purposedata = sortpurpose
    .map((a) => {
      const otherSelect = `<input type="text"
        class="input input-sm input-ghost w-full rounded-none border-b border-base-300 focus:border-primary focus:bg-base-200/50 px-1"
        id="otherSelect"
        name="PURPOSE_OTHER"
        placeholder="Please specify other purpose"
        disabled>`;

      return `<label class="flex items-center space-x-2 cursor-pointer">
        <input type="radio"
          name="PURPOSE_ID"
          class="radio radio-xs rounded border-base-content [--chkbg:var(--bc)] [--chkfg:var(--b1)] req"
          value="${a.PURPOSE_ID}"
          id="purpose_${a.PURPOSE_ID}">
        <span>${a.PURPOSE_TH}/${a.PURPOSE_EN}</span>
        ${a.PURPOSE_ID == 5 ? otherSelect : ""}
      </label>`;
    })
    .join("");

  $("#purposeList").html(Purposedata);

  const action = webflowSubmit({ request: true });
  $("#sentRequest").html(action);
});

// ฟังก์ชันจัดการการคลิกปุ่ม Request เพื่อส่งข้อมูลฟอร์ม
$(document).on("click", "#btnRequest", async function () {
  try {
    const requiredMessage = [
      { element: $("#empName"), message: "Please fill the Name" },
      { element: $("#REQBY"), message: "Please fill the Request Code" },
      { element: $("#empDept"), message: "Please fill the SECT/DEPT/DIV" },
      { element: $("#empPos"), message: "Please fill the Position" },
      {
        // แก้ selector เดิมที่ quote ปิดผิด
        element: $('#purposeList input[name="PURPOSE_ID"]'),
        message: "Please select the Purpose",
      },
    ];

    if (!(await requiredForm(`#rbForm`, requiredMessage))) return;

    const formData = new FormData($(`#rbForm`)[0]);
    formData.set("REMARK", $("#remark").val());

    logFormData(formData);

    const res = await createForm(formData);

    if (res.status == true) {
      showMessage(res.message, "success");
      redirectWebflow();
    } else {
      throw new Error(res.message);
    }

    console.log(res);
  } catch (error) {
    console.log(error);
    showMessage(error.message);
  }
});

async function getData() {
  return await fetchUtils({
    url: `${process.env.APP_API}/gpform/gp-rb`,
    method: "GET",
  });
}

async function getEmpData(empno) {
  return await fetchUtils({
    url: `${process.env.APP_API}/users/${empno}`,
    method: "GET",
  });
}

async function createForm(data) {
  return fetchUtils({
    url: `${process.env.APP_API}/gpform/gp-rb`,
    method: "POST",
    data: data,
  });
}

// ฟังก์ชันจัดการตรายาง, สถานะ section, radio, checkbox, input
document.addEventListener("DOMContentLoaded", () => {
  function adjustTextScale(displayId, circleId) {
    const displayEl = document.getElementById(displayId);
    const circleEl = document.getElementById(circleId);

    if (!displayEl || !circleEl) return;

    let circleWidth = 70;

    if (circleEl.style.width) {
      circleWidth = parseInt(circleEl.style.width, 10);
    }

    const maxSafeWidth = circleWidth * 0.75;

    displayEl.style.transform = "none";
    displayEl.style.letterSpacing = "normal";

    const actualWidth = displayEl.scrollWidth;

    if (actualWidth > maxSafeWidth && actualWidth > 0) {
      const scaleRatio = maxSafeWidth / actualWidth;
      displayEl.style.letterSpacing = "-0.5px";
      displayEl.style.transform = `scaleX(${scaleRatio})`;
    }
  }

  function updateStampDisplay(inputId, targetDisplayId, targetCircleId) {
    const inputElement = document.getElementById(inputId);
    const displayElement = document.getElementById(targetDisplayId);

    if (!inputElement || !displayElement) return;

    const fullName = inputElement.value.trim();
    const firstName = fullName.split(/\s+/)[0];

    displayElement.textContent = firstName ? firstName.toUpperCase() : "NAME";

    setTimeout(() => {
      adjustTextScale(targetDisplayId, targetCircleId);
    }, 50);
  }

  const input1 = document.getElementById("nameInput1");
  const input2 = document.getElementById("nameInput2");

  if (input1) {
    input1.addEventListener("input", () => {
      updateStampDisplay("nameInput1", "name", "stampCircle1");
    });
  }

  if (input2) {
    input2.addEventListener("input", () => {
      updateStampDisplay("nameInput2", "name2", "stampCircle2");
    });
  }

  const localStampConfig = {
    // กลุ่มบน ถ้ารูปต้นฉบับของคุณมีขนาดของ P / GM ชัดเจน ให้แก้ sizeMm ตรงนี้ตามจริง
    chkP: { sizeMm: 22, sizePx: 88, target: "stampCircle1" },
    chkGM: { sizeMm: 21, sizePx: 84, target: "stampCircle1" },

    // ตามรูป: DIM / DDIM = 21 mm
    chkDIM: { sizeMm: 21, sizePx: 84, target: "stampCircle1" },
    chkDDIM: { sizeMm: 21, sizePx: 84, target: "stampCircle1" },

    // ตามรูป: DEM / DDEM / ADV / Senior Specialist = 19 mm
    chkDEM: { sizeMm: 19, sizePx: 76, target: "stampCircle1" },
    chkDDEM: { sizeMm: 19, sizePx: 76, target: "stampCircle1" },
    chkADV: { sizeMm: 19, sizePx: 76, target: "stampCircle1" },
    chkSSPE: { sizeMm: 19, sizePx: 76, target: "stampCircle1" },

    // ตามรูป: SEM / Specialist = 17 mm
    chkSEM: { sizeMm: 17, sizePx: 68, target: "stampCircle1" },
    chkSPE: { sizeMm: 17, sizePx: 68, target: "stampCircle1" },

    // ตามรูป: ASM / Supervisor / Foreman / Leader / Engineer / Staff = 15 mm
    chkASM: { sizeMm: 15, sizePx: 60, target: "stampCircle2" },
    chkSUP: { sizeMm: 15, sizePx: 60, target: "stampCircle2" },
    chkFO: { sizeMm: 15, sizePx: 60, target: "stampCircle2" },
    chkLEA: { sizeMm: 15, sizePx: 60, target: "stampCircle2" },
    chkENG: { sizeMm: 15, sizePx: 60, target: "stampCircle2" },
    chkSTAFF: { sizeMm: 15, sizePx: 60, target: "stampCircle2" },
  };

  const localPositionCodeMapping = {
    "02": "chkP",
    "05": "chkGM",
    10: "chkDIM",
    11: "chkDDIM",
    20: "chkDEM",
    21: "chkDDEM",
    90: "chkADV",
    22: "chkSSPE",
    30: "chkSEM",
    32: "chkSPE",
    33: "chkASM",
    49: "chkSUP",
    50: "chkFO",
    55: "chkLEA",
    35: "chkENG",
    40: "chkSTAFF",
  };

  const localTargetPosCodeForCircle2 = ["33", "49", "50", "55", "35", "40"];

  function disableAllStampSections() {
    $("#standardStampSection, #otherStampSection")
      .css({ opacity: "0.4", "pointer-events": "none" })
      .find("input, select, textarea, button")
      .prop("disabled", true);

    // ปิด radio แต่ไม่ล้าง checkbox position
    $("#radioStandard, #radioOther")
      .prop("checked", false)
      .prop("disabled", true);

    // ห้ามล้าง checkbox position เพราะต้องจำตำแหน่งไว้
    // $('input[type="checkbox"][id^="chk"]').prop("checked", false);

    $("#nameInput1, #nameInput2").prop("disabled", true);

    // reset ช่องแสดงขนาด
    $("#stampSize1, #stampSize2").text("-");
  }

  function updateFormState() {
  const purposeSelected = $('input[name="PURPOSE_ID"]:checked').val();

  const input1 = $("#nameInput1");
  const input2 = $("#nameInput2");

  const row1 = $("#rowStamp1");
  const row2 = $("#rowStamp2");

  const circle1 = $("#stampCircle1");
  const circle2 = $("#stampCircle2");

  // ช่องแสดงขนาดจริง mm
  const size1 = $("#stampSize1");
  const size2 = $("#stampSize2");

  // =====================================================
  // 1. ถ้า PURPOSE_ID = 2 ให้ปิดทั้งหมด แต่ไม่ล้าง position
  // =====================================================
  if (purposeSelected == "2") {
    disableAllStampSections();
    return;
  }

  // =====================================================
  // 2. ถ้าไม่ใช่ PURPOSE_ID = 2 ให้เปิด radio กลับมา
  // =====================================================
  $("#radioStandard, #radioOther").prop("disabled", false);

  // ถ้ายังไม่มี radio ถูกเลือก ให้ default กลับเป็น Standard
  if (!$('input[name="stampFormatGroup"]:checked').length) {
    $("#radioStandard").prop("checked", true);
  }

  const isStandard = $("#radioStandard").is(":checked");

  // =====================================================
  // 3. ถ้าเลือก Other Stamp
  // =====================================================
  if (!isStandard) {
    $("#standardStampSection")
      .css({ opacity: "0.4", "pointer-events": "none" })
      .find("input, select, textarea, button")
      .prop("disabled", true);

    $("#otherStampSection")
      .css({ opacity: "1", "pointer-events": "auto" })
      .find("input, select, textarea, button")
      .prop("disabled", false);

    input1.prop("disabled", true);
    input2.prop("disabled", true);

    size1.text("-");
    size2.text("-");

    return;
  }

  // =====================================================
  // 4. ถ้าเลือก Standard Stamp
  // =====================================================
  $("#standardStampSection")
    .css({ opacity: "1", "pointer-events": "auto" });

  $("#otherStampSection")
    .css({ opacity: "0.4", "pointer-events": "none" })
    .find("input, select, textarea, button")
    .prop("disabled", true);

  // เปิดเฉพาะ checkbox position ก่อน
  // ห้ามเปิด input ทั้งหมด เพราะ nameInput ต้องถูกคุมตาม position
  $("#standardStampSection")
    .find('input[type="checkbox"]')
    .prop("disabled", false);

  $("#radioStandard, #radioOther").prop("disabled", false);

  // =====================================================
  // 5. เช็ค position ที่ถูกเลือก แล้วคุม nameInput + size
  // =====================================================
  const checkedCb = $('input[type="checkbox"][id^="chk"]:checked').first();

  if (checkedCb.length > 0) {
    const settings = stampConfig[checkedCb.attr("id")];

    if (settings) {
      // ใช้ sizePx สำหรับ preview บนหน้าเว็บ
      $("#" + settings.target).css({
        width: settings.sizePx + "px",
        height: settings.sizePx + "px",
      });

      if (settings.target === "stampCircle1") {
        row1.css("opacity", "1");
        row2.css("opacity", "0.3");

        // reset อีกวงกลับขนาด default
        circle2.css({
          width: "60px",
          height: "60px",
        });

        // แสดงขนาดจริง mm
        size1.text(`${settings.sizeMm} mm.`);
        size2.text("-");

        input1.prop("disabled", false);
        input2.prop("disabled", true);
      } else {
        row1.css("opacity", "0.3");
        row2.css("opacity", "1");

        // reset อีกวงกลับขนาด default
        circle1.css({
          width: "60px",
          height: "60px",
        });

        // แสดงขนาดจริง mm
        size1.text("-");
        size2.text(`${settings.sizeMm} mm.`);

        input1.prop("disabled", true);
        input2.prop("disabled", false);
      }
    }
  } else {
    // กรณีไม่มี position checkbox ถูกเลือก
    row1.css("opacity", "1");
    row2.css("opacity", "1");

    circle1.css({
      width: "60px",
      height: "60px",
    });

    circle2.css({
      width: "60px",
      height: "60px",
    });

    size1.text("-");
    size2.text("-");

    input1.prop("disabled", false);
    input2.prop("disabled", false);
  }
}

  // เมื่อเปลี่ยน Purpose
  $(document).on("change", "input[name='PURPOSE_ID']", function () {
    const purposeSelected = $('input[name="PURPOSE_ID"]:checked').val();

    console.log("Purpose select:", purposeSelected);

  if (purposeSelected == "5") {
    $("#otherSelect").prop("disabled", false);
  } else {
    $("#otherSelect").prop("disabled", true).val("");
  }

    updateFormState();

    updateStampDisplay("nameInput1", "name", "stampCircle1");
    updateStampDisplay("nameInput2", "name2", "stampCircle2");
  });

  // เมื่อสลับ Standard Stamp / Other Stamp
  $(document).on("change", "input[name='stampFormatGroup']", function () {
    $("#nameInput1, #nameInput2").val("");

    updateFormState();

    updateStampDisplay("nameInput1", "name", "stampCircle1");
    updateStampDisplay("nameInput2", "name2", "stampCircle2");
  });

  // เมื่อเลือก checkbox position
  $(document).on("change", 'input[type="checkbox"][id^="chk"]', function () {
    if (this.checked) {
      // บังคับให้เลือก checkbox position ได้ทีละอัน
      $('input[type="checkbox"][id^="chk"]').not(this).prop("checked", false);
    }

    updateFormState();

    updateStampDisplay("nameInput1", "name", "stampCircle1");
    updateStampDisplay("nameInput2", "name2", "stampCircle2");
  });

  // เมื่อเปลี่ยน REQBY
  $(document).on("change", "#REQBY", async function () {
    const REQBY = $(this).val();

    if (!REQBY) return;

    const empData = await getEmpData(REQBY);

    $("#empName").val(empData.STNAME);
    $("#empDept").val(`${empData.SSEC}/${empData.SDEPT}/${empData.SDIV}`);
    $("#empPos").val(empData.SPOSITION);

    // ล้าง checkbox position ทั้งหมดก่อน
    $('input[type="checkbox"][id^="chk"]').prop("checked", false);

    const PosiCodeArray = Array.isArray(empData.SPOSCODE)
      ? empData.SPOSCODE
      : empData.SPOSCODE
        ? [empData.SPOSCODE]
        : [];

    let firstPosCode =
      PosiCodeArray.length > 0 ? String(PosiCodeArray[0]).trim() : null;

    // กรณีระบบส่งเลขหลักเดียว เช่น 2 ให้แปลงเป็น 02
    if (firstPosCode) {
      firstPosCode = firstPosCode.padStart(2, "0");
    }

    console.log("SPOSCODE:", firstPosCode);

    // แสดง Division เฉพาะตำแหน่งกลุ่มวงกลมที่ 2
    if (firstPosCode && targetPosCodeForCircle2.includes(firstPosCode)) {
      $("#divisionDisplay").html(
        `<span id="divText" class="origin-center whitespace-nowrap inline-block transition-transform duration-300">${empData.SDIV}</span>`,
      );
    } else {
      $("#divisionDisplay").html("DIVISION");
    }

    $("#nameInput1").val("");
    $("#nameInput2").val("");

    // ติ๊ก checkbox ตาม position code
    if (firstPosCode && positionCodeMapping[firstPosCode]) {
      const targetCheckboxId = positionCodeMapping[firstPosCode];
      $(`#${targetCheckboxId}`).prop("checked", true);
    }

    updateFormState();

    updateStampDisplay("nameInput1", "name", "stampCircle1");
    updateStampDisplay("nameInput2", "name2", "stampCircle2");
  });

  // เรียกครั้งแรกตอนโหลดหน้า เพื่อ set state เริ่มต้น
  updateFormState();
});
