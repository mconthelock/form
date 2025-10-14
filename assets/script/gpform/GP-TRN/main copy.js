// "use strict";

import { showAlert, toggleSubmit } from "./formUtils.js";
import { validateFunctionalForm, validateLegalForm, validateMethForm } from "./validators.js";
import { createForm } from "../../api/webform/form.js";
//import { redirectWebflow } from "../../inc/_form.js";
import { buildFormDataGeneric, savedetailForm } from "./manage_data.js";

function showLoader() { document.getElementById("loaderOverlay")?.classList.remove("hidden"); }
function hideLoader() { document.getElementById("loaderOverlay")?.classList.add("hidden"); }

// ✅ ตรวจสอบว่า APP_API ถูกเซ็ตแล้วหรือยัง
//console.log("🌍 process.env.APP_API =", process?.env?.APP_API);


// ======================
// 🔹 export ฟังก์ชัน init ปุ่ม
// ======================
export function initFormButtons(formType) {
    console.log("⚡ initFormButtons called:", formType);

    if (formType === "functional") {
        bindBackButton("backBtn_func", "form_functional");
        bindSendButton("sendFuncFormBtn", "functional");
    }
    if (formType === "legal") {
        bindBackButton("backBtn_legal", "form_legal");
        bindSendButton("sendLegalFormBtn", "legal");
    }
    if (formType === "meth") {
        bindBackButton("backBtn_meth", "form_meth");
        bindSendButton("sendMethFormBtn", "meth");
    }
}

function bindBackButton(btnId, formId) {
    const btn = document.getElementById(btnId);
    if (!btn || btn.dataset.bound) return;

    btn.addEventListener("click", () => {
        console.log("⬅ Back clicked:", formId);
        const form = document.getElementById(formId);
        form?.classList.add("hidden");
        if (form) delete form.dataset.inited;

        document.getElementById("requestForm")?.classList.add("hidden");
        document.getElementById("selectCard")?.classList.remove("hidden");

        const trainingType = document.getElementById("trainingType");
        const submitBtn    = document.getElementById("submitBtn");
        const detailBox    = document.getElementById("detailBox");

        if (trainingType) trainingType.value = "";
        detailBox?.classList.add("hidden");
    });
    btn.dataset.bound = "1";
}

function bindSendButton(btnId, formType) {
    const btn = document.getElementById(btnId);
    if (!btn || btn.dataset.bound) return;
    btn.addEventListener("click", () => handleFormSubmit(formType));
    btn.dataset.bound = "1";
}

// ======================
// ส่งฟอร์ม
// ======================
async function submitForm(formType, reqby, inputby, fid) {
    try {
        showLoader();

        const nfrmno = document.getElementById("NFRMNO")?.value.trim() || "";
        const vorgno = document.getElementById("VORGNO")?.value.trim() || "";
        const cyear  = document.getElementById("CYEAR")?.value.trim() || "";

        if (!nfrmno || !vorgno || !cyear || !reqby?.trim() || !inputby?.trim()) {
            hideLoader();
            showAlert("⚠ แจ้งเตือนx", "ข้อมูลไม่ครบถ้วน");
            return;
        }

        const formDatakey = { 
            NFRMNO: nfrmno, 
            VORGNO: vorgno, 
            CYEAR: cyear, 
            REQBY: reqby, 
            INPUTBY: inputby, 
            REMARK: "", 
            DRAFT: "1" 
        };
        console.log("📤 createForm payload:", formDatakey);


        //if (!process.env) window.process = { env: {} };
        //process.env.APP_API = window.APP_API;
        console.log(process.env.APP_API);

        const headResult  = await createForm(formDatakey);
        console.log("🟢 headResult:", headResult);

        const prefix = formType === "functional" ? "func" : formType;
        const formData = buildFormDataGeneric(headResult, fid, prefix);
        console.log("📝 formData to send:", [...formData.entries()]);

        const saveResult = await savedetailForm(formData);
        console.log("📌 saveResult:", saveResult);

        hideLoader();
        if (saveResult.status !== "success") {
            showAlert("❌ ล้มเหลว", saveResult.message || "ไม่สามารถบันทึกข้อมูลได้");
            return;
        }

        showAlert("✅ สำเร็จ", `ฟอร์ม ${formType} ส่งเรียบร้อยแล้ว`);
        redirectWebflow();
    } catch (err) {
        hideLoader();
        console.error(`[${formType}] error:`, err);
        showAlert("❌ ล้มเหลว", `ฟอร์ม ${formType} ส่งไม่สำเร็จ`);
    }
}


async function handleFormSubmit(formType) {
    let reqby = "", inputby = "", isValid = false, fid = "";

    if (formType === "functional") {
        isValid = validateFunctionalForm();
        reqby   = document.getElementById("funcRequestBy")?.value || "";
        inputby = document.getElementById("funcInputBy")?.value || "";
        fid = "1";
    } else if (formType === "legal") {
        isValid = validateLegalForm();
        reqby   = document.getElementById("legalRequestBy")?.value || "";
        inputby = document.getElementById("legalInputBy")?.value || "";
        fid = "2";
    } else if (formType === "meth") {
        isValid = validateMethForm();
        reqby   = document.getElementById("methRequestBy")?.value || "";
        inputby = document.getElementById("methInputBy")?.value || "";
        fid = "3";
    }

    if (!isValid) return;
    await submitForm(formType, reqby, inputby, fid);
}
