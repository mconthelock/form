
import { toggleSubmit } from "./formUtils.js";
import { validateFunctionalForm, validateLegalForm, validateMethForm } from "./validators.js";
import { submitFunctionalForm } from "./formHandlers.js";

/**
 * ผูกปุ่ม Back / Send ของแต่ละฟอร์ม
 */
export function initButtons(trainingType, selectCard, requestForm, detailBox) {
    // ==============================
    // 🔙 Back Button - Functional
    // ==============================
    const backBtnFunctional = document.getElementById("backBtn_func");
    if (backBtnFunctional && !backBtnFunctional.dataset.bound) {
        backBtnFunctional.addEventListener("click", () => {
            const form = document.getElementById("form_functional");
            form?.classList.add("hidden");
            if (form) delete form.dataset.inited; // reset init flag

            requestForm?.classList.add("hidden");
            selectCard?.classList.remove("hidden");
            if (trainingType) trainingType.value = "";
            detailBox?.classList.add("hidden");
            toggleSubmit(trainingType, document.getElementById("submitBtn"));
        });
        backBtnFunctional.dataset.bound = "1";
    }

    // ==============================
    // 🔙 Back Button - Legal
    // ==============================
    const backBtnLegal = document.getElementById("backBtn_legal");
    if (backBtnLegal && !backBtnLegal.dataset.bound) {
        backBtnLegal.addEventListener("click", () => {
            const form = document.getElementById("form_legal");
            form?.classList.add("hidden");
            if (form) delete form.dataset.inited;

            requestForm?.classList.add("hidden");
            selectCard?.classList.remove("hidden");
            if (trainingType) trainingType.value = "";
            detailBox?.classList.add("hidden");
            toggleSubmit(trainingType, document.getElementById("submitBtn"));
        });
        backBtnLegal.dataset.bound = "1";
    }

    // ==============================
    // 🔙 Back Button - Meth
    // ==============================
    const backBtnMeth = document.getElementById("backBtn_meth");
    if (backBtnMeth && !backBtnMeth.dataset.bound) {
        backBtnMeth.addEventListener("click", () => {
            const form = document.getElementById("form_meth");
            form?.classList.add("hidden");
            if (form) delete form.dataset.inited;

            requestForm?.classList.add("hidden");
            selectCard?.classList.remove("hidden");
            if (trainingType) trainingType.value = "";
            detailBox?.classList.add("hidden");
            toggleSubmit(trainingType, document.getElementById("submitBtn"));
        });
        backBtnMeth.dataset.bound = "1";
    }

    // ==============================
    // 📤 Send Button - Functional
    // ==============================
    const sendFuncFormBtn = document.getElementById("sendFuncFormBtn");
    if (sendFuncFormBtn && !sendFuncFormBtn.dataset.bound) {
        sendFuncFormBtn.addEventListener("click", () => {
            if (validateFunctionalForm()) {
                submitFunctionalForm();
            }
        });
        sendFuncFormBtn.dataset.bound = "1";
    }

    // ==============================
    // 📤 Send Button - Legal
    // ==============================
    const sendLegalFormBtn = document.getElementById("sendLegalFormBtn");
    if (sendLegalFormBtn && !sendLegalFormBtn.dataset.bound) {
        sendLegalFormBtn.addEventListener("click", () => {
            if (validateLegalForm()) {
                submitLegalForm();
            }
        });
        sendLegalFormBtn.dataset.bound = "1";
    }

    // ==============================
    // 📤 Send Button - Meth
    // ==============================
    const sendMethFormBtn = document.getElementById("sendMethFormBtn");
    if (sendMethFormBtn && !sendMethFormBtn.dataset.bound) {
        sendMethFormBtn.addEventListener("click", () => {
            if (validateMethForm()) {
                submitMethForm();
            }
        });
        sendMethFormBtn.dataset.bound = "1";
    }
}
