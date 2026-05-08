import { fetchUtils } from "@amec/webasset/api/fetch-utils";
import { webflowSubmit } from "@amec/webasset/components/form";
import { logFormData, requiredForm, showMessage } from "@amec/webasset/utils";

$(async function () {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const empno = urlParams.get("empno");
  $("#INPUTBY").val(empno);

  /*const empData = await getEmpData(empno);
    $('#INPUTBY').val(empno +'_'+ empData.SNAME);
    $("#empDept").val(empData.SSEC + '/'  + empData.SDEPT + '/' + empData.SDIV);
    $("#empPos").val(empData.SPOSITION);*/

  const purpose = await getData();
  console.log(purpose);
  const Purposedata = purpose
    .map((a) => {
      const otherSelect = `<input type="text"
                            class="input input-sm input-ghost w-full rounded-none border-b border-base-300 focus:border-primary focus:bg-base-200/50 px-1"
                            id="otherSelect" name="PURPOSE_OTHER" placeholder="Please specify other purpose" disabled>`;

      return `<label class="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="PURPOSE_ID" ห
                                    class="radio radio-xs rounded border-base-content [--chkbg:var(--bc)] [--chkfg:var(--b1)] req" value="${a.PURPOSE_ID}"
                                    id="purpose_${a.PURPOSE_ID}">
                                <span>${a.PURPOSE_TH}/${a.PURPOSE_EN}</span>
                                ${a.PURPOSE_ID == 4 ? otherSelect : ""}
                            </label>`;
    })
    .join("");

  $("#purposeList").html(Purposedata);

  const action = webflowSubmit({ request: true });
  $("#sentRequest").html(action);
});

// ฟังก์ชันจัดการการเปลี่ยนแปลงของช่อง Purpose เพื่อเปิด/ปิดช่องกรอกข้อมูลอื่นๆ เมื่อเลือก Other
$(document).on("change", "input[name='PURPOSE_ID']", async function () {
  const purposeSelected = $(`input[name="PURPOSE_ID"]:checked`).val();
  console.log(purposeSelected);
  if (purposeSelected == 4) {
    console.log("other selected");
    $("#otherSelect").attr("disabled", false);
    /*$('#otherSize').attr("disabled", false);
                $('#otherQty').attr("disabled", false);
                $('#otherRemark').attr("disabled", false);*/
  } else {
    console.log("1");
    $("#otherSelect").attr("disabled", true);
    /*$('#otherSize').attr("disabled", true);
                $('#otherQty').attr("disabled", true);
                $('#otherRemark').attr("disabled", true);*/
  }
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
        element: $('#purposeList input[name="PURPOSE_ID]'),
        message: "Please select the Purpose",
      },
    ];
    if (!(await requiredForm(`#rbForm`, requiredMessage))) return;

    const formData = new FormData($(`#rbForm`)[0]);
    formData.set("REMARK", $("#remark").val());
    logFormData(formData);
    const res = await createForm(formData);
    console.log(res);
  } catch (error) {
    console.log(error);
    showMessage(error.message);
  }
});

// ฟังก์ชันจัดการการเปลี่ยนแปลงของช่อง REQBY เพื่อดึงข้อมูลพนักงานที่ RequestBy และแสดงในฟอร์ม
$(document).on("change", "#REQBY", async function () {
  const REQBY = $(this).val();
  const empData = await getEmpData(REQBY);

  // 1. เติมข้อมูลพื้นฐาน
  $("#empName").val(empData.STNAME);
  $("#empDept").val(`${empData.SSEC}/${empData.SDEPT}/${empData.SDIV}`);
  $("#empPos").val(empData.SPOSITION);

  // 2. ล้างสถานะ Checkbox ทั้งหมดออกแบบ Vanilla JS เพื่อความชัวร์
  document
    .querySelectorAll('input[type="checkbox"][id^="chk"]')
    .forEach((cb) => {
      cb.checked = false;
    });

  // ---------------------------------------------------------
  // 3. จัดการดึง Position Code (SPOSCODE)
  // ---------------------------------------------------------
  const PosiCodeArray = Array.isArray(empData.SPOSCODE)
    ? empData.SPOSCODE
    : empData.SPOSCODE
      ? [empData.SPOSCODE]
      : [];

  // 🔥 แปลงเป็น String และตัดช่องว่าง (Trim) ป้องกันปัญหาข้อมูลจากฐานข้อมูล
  const firstPosCode =
    PosiCodeArray.length > 0 ? String(PosiCodeArray[0]).trim() : null;

  // 4. เช็คว่าต้องแสดง Division ไหม
  const targetPosCodeForCircle2 = ["33", "49", "50", "55", "35", "40"];

  if (firstPosCode && targetPosCodeForCircle2.includes(firstPosCode)) {
    $("#divisionDisplay").html(
      `<span id="divText" class="origin-center whitespace-nowrap inline-block transition-transform duration-300">${empData.SDIV}</span>`,
    );
  } else {
    $("#divisionDisplay").html("DIVISION");
  }
  console.log(empData.SPOSCODE);
  // 5. จับคู่ Position Code
  const positionCodeMapping = {
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

  // ล้างค่าช่องกรอกชื่อ
  $("#nameInput1").val("");
  $("#nameInput2").val("");

  if (firstPosCode) {
    const targetCheckboxId = positionCodeMapping[firstPosCode];

    if (targetCheckboxId) {
      const targetCheckbox = document.getElementById(targetCheckboxId);
      if (targetCheckbox) {
        // 🔥 สั่งติ๊กถูกและยิง Event แบบ Vanilla JS
        // วิธีนี้จะรับประกันว่าโค้ด UI ใน DOMContentLoaded จะทำงานและ Disable ช่องให้ 100%
        targetCheckbox.checked = true;
        targetCheckbox.dispatchEvent(new Event("change"));
      }
    }
  } else {
    // กรณีไม่มี Code หรือรหัสไม่ตรง ให้จำลองการเคลียร์ค่าโดยการยิง change ที่ตัวแรกแบบไม่ได้ติ๊ก
    const anyCb = document.querySelector('input[type="checkbox"][id^="chk"]');
    if (anyCb) anyCb.dispatchEvent(new Event("change"));
  }
});

// ฟังก์ชันจัดการการเปลี่ยนแปลงของช่องวิธีการรับเอกสาร (Standard Stamp หรือ Other Stamp) เพื่อเปิด/ปิดช่องกรอกข้อมูลและปรับแต่งตรายางตามที่เลือก
$(document).on("change", "#radioStandard, #radioOther", async function () {
  const isStandard = $("#radioStandard").is(":checked");

  if (isStandard) {
    // 1. เปิด Section ตารางสแตมป์ให้กลับมาสว่าง และเปิดเฉพาะ checkbox ให้กดได้
    $("#standardStampSection")
      .css({ opacity: "1", "pointer-events": "auto" })
      .find('input[type="checkbox"]')
      .prop("disabled", false);

    // 2. ปิด Section ข้อ 6
    $("#otherStampSection")
      .css({ opacity: "0.4", "pointer-events": "none" })
      .find("input")
      .prop("disabled", true);

    // 3. ค้นหาว่าปัจจุบันมี Checkbox Position ตัวไหนถูกเลือกไว้หรือไม่
    const checkedCb = document.querySelector(
      'input[type="checkbox"][id^="chk"]:checked',
    );

    if (checkedCb) {
      // ถ้ามีตัวที่ถูกเลือกอยู่ ให้จำลองการเกิด Event 'change' เพื่อให้สคริปต์จัดแจงปิดช่อง nameInput ให้ใหม่
      checkedCb.dispatchEvent(new Event("change"));
    } else {
      // ถ้ายังไม่มีการเลือก Position เลย ให้เปิดช่อง nameInput ทั้งคู่ไว้รอ
      $("#nameInput1, #nameInput2").prop("disabled", false);
    }
    $("#nameInput1, #nameInput2").val("");
  } else {
    // กรณีเลือกข้อ 6 (Other Stamp)
    // ปิด Input ทุกอย่างในตาราง Standard
    $("#standardStampSection")
      .css({ opacity: "0.4", "pointer-events": "none" })
      .find("input")
      .prop("disabled", true);

    // เปิด Input ทั้งหมดในข้อ 6
    $("#otherStampSection")
      .css({ opacity: "1", "pointer-events": "auto" })
      .find("input")
      .prop("disabled", false);
    $("#nameInput1, #nameInput2").val("");
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

// ✅ 2. ฟังก์ชันจัดการตรายาง (ย่อขนาด, เปลี่ยนข้อความ, ไฮไลท์และ Disable ช่อง)
document.addEventListener("DOMContentLoaded", () => {
  // 1. ฟังก์ชันปรับขนาดตัวอักษรไม่ให้ล้นขอบ (คงไว้เหมือนเดิม)
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

  // 2. ฟังก์ชันอัปเดตข้อความในตรายาง (ถ้าช่องว่าง ให้แสดงคำว่า NAME)
  function updateStampDisplay(inputId, targetDisplayId, targetCircleId) {
    const inputElement = document.getElementById(inputId);
    const displayElement = document.getElementById(targetDisplayId);

    if (inputElement && displayElement) {
      let fullName = inputElement.value.trim();
      let firstName = fullName.split(/\s+/)[0];

      // ถ้ามีค่าให้พิมพ์ใหญ่ ถ้าไม่มีให้กลับไปเป็น 'NAME'
      displayElement.textContent = firstName ? firstName.toUpperCase() : "NAME";

      // รอให้ DOM เรนเดอร์ข้อความเสร็จแล้วค่อยปรับสเกล
      setTimeout(() => {
        adjustTextScale(targetDisplayId, targetCircleId);
      }, 50);
    }
  }

  // 3. ผูก Event ให้พิมพ์ปุ๊บ ข้อความเปลี่ยนปั๊บ
  const input1 = document.getElementById("nameInput1");
  const input2 = document.getElementById("nameInput2");

  if (input1)
    input1.addEventListener("input", () =>
      updateStampDisplay("nameInput1", "name", "stampCircle1"),
    );
  if (input2)
    input2.addEventListener("input", () =>
      updateStampDisplay("nameInput2", "name2", "stampCircle2"),
    );

  // 4. Config ขนาดตรายางตามตำแหน่ง
  const stampConfig = {
    chkP: { size: 88, target: "stampCircle1" },
    chkGM: { size: 84, target: "stampCircle1" },
    chkDIM: { size: 84, target: "stampCircle1" },
    chkDDIM: { size: 84, target: "stampCircle1" },
    chkDEM: { size: 76, target: "stampCircle1" },
    chkDDEM: { size: 76, target: "stampCircle1" },
    chkADV: { size: 76, target: "stampCircle1" },
    chkSSPE: { size: 76, target: "stampCircle1" },
    chkSEM: { size: 68, target: "stampCircle1" },
    chkSPE: { size: 68, target: "stampCircle1" },
    chkASM: { size: 60, target: "stampCircle2" },
    chkSUP: { size: 60, target: "stampCircle2" },
    chkFO: { size: 60, target: "stampCircle2" },
    chkLEA: { size: 60, target: "stampCircle2" },
    chkENG: { size: 60, target: "stampCircle2" },
    chkSTAFF: { size: 60, target: "stampCircle2" },
  };

  // -----------------------------------------------------------------------------
  // 2. ฟังก์ชันศูนย์กลาง ควบคุมการเปิด/ปิดช่อง Disable อย่างเด็ดขาด
  // -----------------------------------------------------------------------------
  function updateFormState() {
    const isStandard = $("#radioStandard").is(":checked");
    const input1 = $("#nameInput1");
    const input2 = $("#nameInput2");

    // กฎข้อ 1: จัดการ Section หลัก
    if (isStandard) {
      $("#standardStampSection").css({
        opacity: "1",
        "pointer-events": "auto",
      });
      $("#otherStampSection")
        .css({ opacity: "0.4", "pointer-events": "none" })
        .find("input, textarea")
        .prop("disabled", true);
    } else {
      $("#standardStampSection").css({
        opacity: "0.4",
        "pointer-events": "none",
      });
      $("#otherStampSection")
        .css({ opacity: "1", "pointer-events": "auto" })
        .find("input, textarea")
        .prop("disabled", false);

      // ถ้าอยู่โหมด Other Stamp ช่องกรอกมาตรฐานต้องถูก Disable เสมอแล้วจบฟังก์ชันเลย
      input1.prop("disabled", true);
      input2.prop("disabled", true);
      return;
    }

    // กฎข้อ 2: ถ้าอยู่โหมด Standard ให้เช็ค Checkbox Position ต่อ
    const checkedCb = $('input[type="checkbox"][id^="chk"]:checked').first();
    const row1 = $("#rowStamp1");
    const row2 = $("#rowStamp2");
    const circle1 = $("#stampCircle1");
    const circle2 = $("#stampCircle2");

    if (checkedCb.length > 0) {
      const settings = stampConfig[checkedCb.attr("id")];
      if (settings) {
        $("#" + settings.target).css({
          width: settings.size + "px",
          height: settings.size + "px",
        });

        if (settings.target === "stampCircle1") {
          row1.css("opacity", "1");
          row2.css("opacity", "0.3");
          circle2.css({ width: "70px", height: "70px" });

          input1.prop("disabled", false); // เปิดช่อง 1
          input2.prop("disabled", true); // ปิดช่อง 2 (ชัวร์ๆ ตาม Position)
        } else {
          row1.css("opacity", "0.3");
          row2.css("opacity", "1");
          circle1.css({ width: "70px", height: "70px" });

          input1.prop("disabled", true); // ปิดช่อง 1
          input2.prop("disabled", false); // เปิดช่อง 2
        }
      }
    } else {
      // กรณีไม่มีการติ๊ก Position ใดๆ ให้เปิดรอไว้ทั้ง 2 ช่อง
      row1.css("opacity", "1");
      row2.css("opacity", "1");
      circle1.css({ width: "70px", height: "70px" });
      circle2.css({ width: "70px", height: "70px" });

      input1.prop("disabled", false);
      input2.prop("disabled", false);
    }
  }

  // -----------------------------------------------------------------------------
  // 3. จัดการ Event ต่างๆ โดยให้โยนภาระไปให้ updateFormState ตัดสินใจ
  // -----------------------------------------------------------------------------

  // เมื่อสลับ Radio (Standard / Other)
  $(document).on("change", "input[name='stampFormatGroup']", function () {
    $("#nameInput1, #nameInput2").val(""); // สลับโหมดปุ๊บ ล้างค่าเก่าทิ้ง
    updateFormState();
    updateStampDisplay("nameInput1", "name", "stampCircle1");
    updateStampDisplay("nameInput2", "name2", "stampCircle2");
  });

  // เมื่อมีการสลับ Checkbox
  $(document).on("change", 'input[type="checkbox"][id^="chk"]', function () {
    if (this.checked) {
      // บังคับให้เลือกได้อันเดียว
      $('input[type="checkbox"][id^="chk"]').not(this).prop("checked", false);
    }
    updateFormState();
    updateStampDisplay("nameInput1", "name", "stampCircle1");
    updateStampDisplay("nameInput2", "name2", "stampCircle2");
  });

  // เมื่อมีการดึงข้อมูล REQBY
  $(document).on("change", "#REQBY", async function () {
    const REQBY = $(this).val();
    const empData = await getEmpData(REQBY);

    // เติมข้อมูลพื้นฐาน
    $("#empName").val(empData.STNAME);
    $("#empDept").val(`${empData.SSEC}/${empData.SDEPT}/${empData.SDIV}`);
    $("#empPos").val(empData.SPOSITION);

    // ล้างสถานะ Checkbox ทั้งหมดออกก่อน
    $('input[type="checkbox"][id^="chk"]').prop("checked", false);

    // จัดการดึง Position Code (แปลงเป็นข้อความและตัดช่องว่าง)
    const PosiCodeArray = Array.isArray(empData.SPOSCODE)
      ? empData.SPOSCODE
      : empData.SPOSCODE
        ? [empData.SPOSCODE]
        : [];
    let firstPosCode =
      PosiCodeArray.length > 0 ? String(PosiCodeArray[0]).trim() : null;

    // ป้องกันระบบส่งเลขหลักเดียวมา (เช่น "2" ให้แปลงเป็น "02")
    if (firstPosCode) firstPosCode = firstPosCode.padStart(2, "0");

    // เช็คเรื่อง Division
    const targetPosCodeForCircle2 = ["33", "49", "50", "55", "35", "40"];
    if (firstPosCode && targetPosCodeForCircle2.includes(firstPosCode)) {
      $("#divisionDisplay").html(
        `<span id="divText" class="origin-center whitespace-nowrap inline-block transition-transform duration-300">${empData.SDIV}</span>`,
      );
    } else {
      $("#divisionDisplay").html("DIVISION");
    }

    // จับคู่ Position Code
    const positionCodeMapping = {
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

    // ล้างค่าช่องกรอกชื่อ
    $("#nameInput1").val("");
    $("#nameInput2").val("");

    // สั่งติ๊ก Checkbox ตาม Mapping (ไม่ต้องยิง Event ซ้อนแล้ว ปล่อยให้ updateFormState จัดการทีเดียว)
    if (firstPosCode && positionCodeMapping[firstPosCode]) {
      const targetCheckboxId = positionCodeMapping[firstPosCode];
      $(`#${targetCheckboxId}`).prop("checked", true);
    }

    // จบกระบวนการแล้วสั่งอัปเดตสถานะฟอร์มทั้งหมดรวดเดียว
    updateFormState();
    updateStampDisplay("nameInput1", "name", "stampCircle1");
    updateStampDisplay("nameInput2", "name2", "stampCircle2");
  });
});

// ✅ 3. ฟังก์ชันจับคู่ Position เข้ากับ Checkbox อัตโนมัติ
/*   document.addEventListener('DOMContentLoaded', () => {
            const positionMapping = {
                'PRESIDENT': 'chkP',
                'GENERAL MANAGER': 'chkGM',
                'DIVISION MANAGER': 'chkDIM', 
                'DEPUTY DIVISION MANAGER': 'chkDDIM',
                'DEPARTMENT MANAGER': 'chkDEM', 
                'DEPUTY DEPARTMENT MANAGER': 'chkDDEM',
                'ADVISOR': 'chkADV',
                'SENIOR SPECIALIST': 'chkSSPE',
                'SECTION MANAGER': 'chkSEM', 
                'SPECIALIST': 'chkSPE',
                'ASSISTANT MANAGER': 'chkASM', 
                'SUPERVISOR': 'chkSUP',
                'FOREMAN': 'chkFO',
                'LEADER': 'chkLEA', 
                'ENGINEER': 'chkENG',
                'STAFF': 'chkSTAFF'
            };

            const empPosInput = document.getElementById('empPos');

            function triggerPositionMap() {
                if (!empPosInput) return;
                const typedPosition = empPosInput.value.trim().toUpperCase();

                if (positionMapping[typedPosition]) {
                    const targetCheckboxId = positionMapping[typedPosition];
                    const targetCheckbox = document.getElementById(targetCheckboxId);

                    if (targetCheckbox && !targetCheckbox.checked) {
                        targetCheckbox.click();
                    }
                }
            }

            if (empPosInput) {
                ['input', 'change'].forEach(evt => {
                    empPosInput.addEventListener(evt, triggerPositionMap);
                });
            }

            if (empPosInput) {
                const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
                Object.defineProperty(empPosInput, 'value', {
                    set: function(v) {
                        descriptor.set.call(this, v); 
                        triggerPositionMap(); 
                    },
                    get: function() {
                        return descriptor.get.call(this);
                    }
                });
            }
        }); */
