// =====================================================
// 📦 GP-TRN: Training Form Main Controller (jQuery Version)
// =====================================================

import { showAlert, toggleSubmit, bindMaxLengthAlert } from "./formUtils.js";
import { validateFunctionalForm, validateLegalForm, validateMethForm, validatePosForm, validateOutForm, validateDateRange } from "./validators.js";
import { createForm } from "../../api/webform/form.js";
import { redirectWebflow } from "../../inc/_form.js";
import { buildFormDataGeneric, savedetailForm, createReportForm, createClearanceForm } from "./manage_data.js";
console.log("training_main.js : version =",'OMG V1');
/* =====================================================
   🔹 Loader Control
   ===================================================== */
const showLoader = () => $("#loaderOverlay").removeClass("hidden");
const hideLoader = () => $("#loaderOverlay").addClass("hidden");

/* =====================================================
   🔹 Init Buttons per Form Type
   ===================================================== */
export function initFormButtons(formType) {
  console.log("⚡ initFormButtons:", formType);

  const map = {
    functional: { back: "#backBtn_func", send: "#sendFuncFormBtn", fid: "1" },
    legal:      { back: "#backBtn_legal", send: "#sendLegalFormBtn", fid: "2" },
    meth:       { back: "#backBtn_meth", send: "#sendMethFormBtn", fid: "3" },
    pos:        { back: "#backBtn_pos",  send: "#sendPosFormBtn",  fid: "4" },
    out:        { back: "#backBtn_out",  send: "#sendOutFormBtn",  fid: "5" },
  };

  const cfg = map[formType];
  if (!cfg) return;

  bindBackButton(cfg.back, `form_${formType}`);
  bindSendButton(cfg.send, formType, cfg.fid);
  const prefix_type = formType === "functional" ? "func" : formType;
  validateDateRange(prefix_type);
}

/* =====================================================
   🔹 ปุ่ม Back
   ===================================================== */
function bindBackButton(btnSel, formId) {
  const $btn = $(btnSel);
  if (!$btn.length || $btn.data("bound")) return;

  $btn.on("click", () => {
    console.log("⬅ Back clicked:", formId);

    const $form = $(`#${formId}`);
    $form.addClass("hidden").removeData("inited");

    $("#requestForm").addClass("hidden");
    $("#selectCard").removeClass("hidden");

    $("#trainingType").val("");
    $("#detailBox").addClass("hidden");
  });

  $btn.data("bound", 1);
}

/* =====================================================
   🔹 ปุ่ม Send
   ===================================================== */
function bindSendButton(btnSel, formType, fid) {
  const $btn = $(btnSel);
  if (!$btn.length || $btn.data("bound")) return;

  $btn.on("click", async () => await handleFormSubmit(formType, fid));
  $btn.data("bound", 1);
}

/* =====================================================
   🔹 Handle Form Submit
   ===================================================== */
async function handleFormSubmit(formType, fid) {
  let isValid = false, reqby = "", inputby = "";

  const getVal = id => $(`#${id}`).val()?.trim() || "";

  switch (formType) {
    case "functional":
      isValid = validateFunctionalForm();
      reqby = [{ 
        code: getVal("funcTraineeCode"), 
        pos: getVal("funcTraineeposcode") || "" 
      }];
      inputby = getVal("funcInputBy");
      break;

    case "legal":
      isValid = validateLegalForm();
      const traineeList = [];
      let hasError = false;

      $("#legal_participants tbody tr").each(function () {
        const $row = $(this);
        const code = $row.find("input[name='legalTraineecode[]']").val()?.trim();
        const pos  = $row.find("input[name='legalTraineeposcode[]']").val()?.trim();
        const cost = $row.find("input[name='legalTraineecost[]']").val()?.trim();

        if (!code || !cost) {
          alert("⚠ กรุณากรอกรหัสพนักงานและค่าใช้จ่ายให้ครบทุกแถว");
          $row.find("input").addClass("border-red-500");
          setTimeout(() => $row.find("input").removeClass("border-red-500"), 2000);
          hasError = true;
          return false; // break loop
        }

        traineeList.push({ code, pos, cost });
      });

      if (hasError) return; // ❌ หยุดการส่ง

      reqby = traineeList;
      inputby = getVal("legalInputBy");
      break;
    case "meth":
      isValid = validateMethForm();
      reqby = [{ 
        code: getVal("methTraineeCode"), 
        pos: getVal("methTraineeposcode") || "" 
      }];
      inputby = getVal("methInputBy");
      break;

    case "pos":
      isValid = validatePosForm();
      reqby = [{ 
        code: getVal("posTraineeCode"), 
        pos: getVal("posTraineeposcode") || "" 
      }];
      inputby = getVal("posInputBy");
      break;

    case "out":
      isValid = validateOutForm();
      const traineeList_out = [];
      let hasError_out = false;
      $("#out_participants tbody tr").each(function () {
        const $row = $(this);
        const code = $row.find("input[name='outTraineecode[]']").val()?.trim();
        const pos  = $row.find("input[name='outTraineeposcode[]']").val()?.trim();

        if (!code) {
          alert("⚠ กรุณากรอกรหัสพนักงานให้ครบทุกแถว");
          $row.find("input").addClass("border-red-500");
          setTimeout(() => $row.find("input").removeClass("border-red-500"), 2000);
          hasError_out = true;
          return false; // break loop
        }

        traineeList_out.push({ code, pos });
      });

      if (hasError_out) return; // ❌ หยุดการส่ง

      reqby = traineeList_out;
      inputby = getVal("outInputBy");
      break;
  }

  if (!isValid) return;
  await submitForm(formType, reqby, inputby, fid);
}



/* =====================================================
   🔹 Submit Form (API call)
   ===================================================== */
async function submitForm(formType, reqby, inputby, fid) {
  try {
    showLoader();
    const getVal = id => $(`#${id}`).val()?.trim() || "";
    const nfrmno = getVal("NFRMNO");
    const vorgno = getVal("VORGNO");
    const cyear  = getVal("CYEAR");

    // 🔹 ตรวจสอบข้อมูลพื้นฐาน
    if (!nfrmno || !vorgno || !cyear || !reqby || !inputby) {
      hideLoader();
      showAlert("⚠ แจ้งเตือน", "ข้อมูลไม่ครบถ้วน");
      return;
    }

    const traineeList = Array.isArray(reqby) ? reqby : [reqby];
    const results = [];
    console.log("📦 traineeList =", traineeList);

    // 🔁 Loop ผู้เข้าอบรมทั้งหมด
    for (const traineeCode of traineeList) {
      const trainee_req = typeof traineeCode === "object" ? traineeCode.code : traineeCode;
      const poscode = typeof traineeCode === "object" ? traineeCode.pos : "";
      const cost = typeof traineeCode === "object" ? traineeCode.cost || "0" : "0";

      /* =====================================================
         🔹 Create Form & Flow
         ===================================================== */
      const payload = {
        NFRMNO: nfrmno,
        VORGNO: vorgno,
        CYEAR: cyear,
        REQBY: trainee_req,
        INPUTBY: inputby,
        REMARK: ""
      };

      console.log("📤 payload:", payload);
      const headResult = await createForm(payload);
      console.log("🟢 headResult:", headResult);
      const ref_cyear2 = headResult?.data?.CYEAR2;
      const ref_nrunno = headResult?.data?.NRUNNO;

      if (!headResult || headResult.status === "error") {
        console.warn(`❌ createForm ล้มเหลว (${trainee_req})`);
        results.push({ traineeCode: trainee_req, status: "error" });
        continue;
      }

      /* =====================================================
         🔹 Create Detail (FormData)
         ===================================================== */
      const prefix = formType === "functional" ? "func" : formType;
      const fd = buildFormDataGeneric(headResult, fid, prefix);

      if (poscode) fd.append("SPOSCODE", poscode);
      fd.append("TRAINEE_ID", trainee_req);
      fd.append("INPUTBY", inputby);
      fd.append("COST_PERSON", cost);
      console.log("📝 FormData built:", [...fd.entries()]);

      /* =====================================================
         🔹 Save Detail
         ===================================================== */
      const saveResult = await savedetailForm(fd);
      console.log(`📌 saveResult (${trainee_req}):`, saveResult);

      const status = saveResult?.status || "error";
      results.push({ traineeCode: trainee_req, status });


      /* =====================================================
         🔹 Create Clearance Training Report Form
         ===================================================== */
      /*
      if (status === "success") {
        console.log("status Create Clearance Training Report Form =>", status);
        const payload_clrtrn = {
          NFRMNO: "18",
          VORGNO: "030101",
          CYEAR: "25",
          REQBY: trainee_req,
          INPUTBY: trainee_req,
          REMARK: "",
          DRAFT: "1"
        };
        const headResult_clrtrn = await createForm(payload_clrtrn);
        console.log("✅ headResult_clrtrn =", headResult_clrtrn);

        const fd_clr = new FormData();
        const base_clr = headResult_clrtrn?.data || {};
        ["NFRMNO", "VORGNO", "CYEAR", "CYEAR2", "NRUNNO"].forEach(k => fd_clr.append(k, base_clr[k] || ""));
        fd_clr.append("REF_CYEAR2", ref_cyear2);
        fd_clr.append("REF_NRUNNO", ref_nrunno);

        const saveResult_clrtrn = await createClearanceForm(fd_clr);
        console.log("📗 saveResult_trnrp =", saveResult_clrtrn);
      }
      */

      /* =====================================================
         🔹 Create Training Report Form
         ===================================================== */
      if (status === "success") {
        console.log("status Create Training Report Form =>", status);

        const payload_report = {
          NFRMNO: "19",
          VORGNO: "030101",
          CYEAR: "25",
          REQBY: saveResult?.req_by,
          INPUTBY: saveResult?.req_by,
          REMARK: "",
          DRAFT: "1"
        };

        const headResult_trnrp = await createForm(payload_report);
        console.log("✅ headResult_trnrp =", headResult_trnrp);

        const fd_report = new FormData();
        const base_report = headResult_trnrp?.data || {};
        ["NFRMNO", "VORGNO", "CYEAR", "CYEAR2", "NRUNNO"].forEach(k => fd_report.append(k, base_report[k] || ""));
        fd_report.append("REF_CYEAR2", ref_cyear2);
        fd_report.append("REF_NRUNNO", ref_nrunno);
        fd_report.append("REQBY", saveResult?.req_by);

        const saveResult_trnrp = await createReportForm(fd_report);
        console.log("📗 saveResult_trnrp =", saveResult_trnrp);
      }
    } // 🔚 End loop traineeCode


    /* =====================================================
       🔹 Summary
       ===================================================== */
    hideLoader();

    const failCount = results.filter(r => r.status !== "success").length;
    const successCount = results.length - failCount;

    if (failCount > 0) {
      showAlert("⚠ บางรายการไม่สำเร็จ", `สำเร็จ ${successCount} / ${results.length} รายการ`);
    } else {
      showAlert("✅ สำเร็จ", `บันทึกข้อมูลผู้เข้าอบรมทั้งหมด ${successCount} รายการเรียบร้อยแล้ว`);
    }

    // redirectWebflow(); // ปิดไว้ตอน debug

  } catch (err) {
    hideLoader();
    console.error(`[${formType}] error:`, err);
    showAlert("❌ ล้มเหลว", `ฟอร์ม ${formType} ส่งไม่สำเร็จ`);
  }
}
