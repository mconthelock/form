// initForms.ts
import { bindEmpLookup } from "./emp_lookup.js";
import { populateSelect } from "./formUtils.js";
import { toggleSubmit } from "./formUtils.js";
//Back Button 
export function initBackButtons(trainingType, selectCard, requestForm, detailBox) {
    const backBtnFunctional = document.getElementById("backBtn_func");
    backBtnFunctional === null || backBtnFunctional === void 0 ? void 0 : backBtnFunctional.addEventListener("click", () => {
        const form = document.getElementById("form_functional");
        form === null || form === void 0 ? void 0 : form.classList.add("hidden");
        requestForm === null || requestForm === void 0 ? void 0 : requestForm.classList.add("hidden");
        selectCard === null || selectCard === void 0 ? void 0 : selectCard.classList.remove("hidden");
        if (trainingType)
            trainingType.value = "";
        if (detailBox)
            detailBox.classList.add("hidden");
        toggleSubmit(trainingType, document.getElementById("submitBtn"));
    });
    const backBtnLegal = document.getElementById("backBtn_legal");
    backBtnLegal === null || backBtnLegal === void 0 ? void 0 : backBtnLegal.addEventListener("click", () => {
        const form = document.getElementById("form_legal");
        form === null || form === void 0 ? void 0 : form.classList.add("hidden");
        requestForm === null || requestForm === void 0 ? void 0 : requestForm.classList.add("hidden");
        selectCard === null || selectCard === void 0 ? void 0 : selectCard.classList.remove("hidden");
        if (trainingType)
            trainingType.value = "";
        if (detailBox)
            detailBox.classList.add("hidden");
        toggleSubmit(trainingType, document.getElementById("submitBtn"));
    });
    const backBtnMeth = document.getElementById("backBtn_meth");
    backBtnMeth === null || backBtnMeth === void 0 ? void 0 : backBtnMeth.addEventListener("click", () => {
        const form = document.getElementById("form_meth");
        form === null || form === void 0 ? void 0 : form.classList.add("hidden");
        requestForm === null || requestForm === void 0 ? void 0 : requestForm.classList.add("hidden");
        selectCard === null || selectCard === void 0 ? void 0 : selectCard.classList.remove("hidden");
        if (trainingType)
            trainingType.value = "";
        if (detailBox)
            detailBox.classList.add("hidden");
        toggleSubmit(trainingType, document.getElementById("submitBtn"));
    });
}
// =====================
// Functional Form
// =====================
export function initFunctionalForm() {
    console.log("🚀 init Functional Form");
    // Select Time
    populateSelect(document.getElementById("funcTimeFromHour"), 0, 23);
    populateSelect(document.getElementById("funcTimeToHour"), 0, 23);
    populateSelect(document.getElementById("funcTimeFromMin"), 0, 59);
    populateSelect(document.getElementById("funcTimeToMin"), 0, 59);
    // Request By
    bindEmpLookup(document.getElementById("funcRequestBy"), { SNAME: document.getElementById("funcRequestByName") });
    // Trainee
    bindEmpLookup(document.getElementById("funcTraineeCode"), {
        SNAME: document.getElementById("funcTraineeName"),
        SPOSITION: document.getElementById("funcTraineePosition"),
        SSEC: document.getElementById("funcSec"),
        SDEPT: document.getElementById("funcDept"),
        SDIV: document.getElementById("funcDiv")
    });
    // Part 5: Expense toggle
    const expenseRadios = document.querySelectorAll("input[name='funcExpenseOption']");
    const reasonBox = document.getElementById("funcReasonBox");
    const compareUpload = document.getElementById("funcCompareUpload");
    const part6 = document.getElementById("func_part6");
    expenseRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            if (radio.value === "not_compare" && radio.checked) {
                reasonBox === null || reasonBox === void 0 ? void 0 : reasonBox.classList.remove("hidden");
                compareUpload === null || compareUpload === void 0 ? void 0 : compareUpload.classList.add("hidden");
            }
            else if (radio.value === "compare" && radio.checked) {
                reasonBox === null || reasonBox === void 0 ? void 0 : reasonBox.classList.add("hidden");
                compareUpload === null || compareUpload === void 0 ? void 0 : compareUpload.classList.remove("hidden");
                part6 === null || part6 === void 0 ? void 0 : part6.classList.remove("hidden");
            }
        });
    });
    // Part 5: Free reason toggle
    const reasonRadios = document.querySelectorAll("input[name='funcReason']");
    reasonRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            if (radio.value === "free" && radio.checked) {
                part6 === null || part6 === void 0 ? void 0 : part6.classList.add("hidden");
            }
            else {
                part6 === null || part6 === void 0 ? void 0 : part6.classList.remove("hidden");
            }
        });
    });
    // Part 6: VAT calculation
    const vatResult = document.getElementById("funcVatResult");
    const amountInput = document.getElementById("funcAmountInput");
    vatResult === null || vatResult === void 0 ? void 0 : vatResult.classList.add("hidden");
    if (amountInput) {
        amountInput.value = "";
        amountInput.addEventListener("input", () => {
            if (!amountInput.value || !vatResult)
                return;
            const amount = parseFloat(amountInput.value);
            if (isNaN(amount)) {
                vatResult.textContent = "";
                vatResult.classList.add("hidden");
                return;
            }
            const vat = amount * 0.07;
            const total = amount + vat;
            vatResult.textContent = `รวมทั้งหมด: ${total.toLocaleString()} บาท (VAT 7%: ${vat.toLocaleString()} บาท)`;
            vatResult.classList.remove("hidden");
        });
    }
}
// =====================
// Legal Form
// =====================
export function initLegalForm() {
    console.log("🚀 init Legal Form");
    populateSelect(document.getElementById("legalTimeFromHour"), 0, 23);
    populateSelect(document.getElementById("legalTimeToHour"), 0, 23);
    populateSelect(document.getElementById("legalTimeFromMin"), 0, 59);
    populateSelect(document.getElementById("legalTimeToMin"), 0, 59);
    // Request By
    bindEmpLookup(document.getElementById("legalRequestBy"), { SNAME: document.getElementById("legalRequestByName") });
    // Trainee
    bindEmpLookup(document.getElementById("legalCode"), {
        SNAME: document.getElementById("legalName"),
        SPOSITION: document.getElementById("legalPosition"),
        SSEC: document.getElementById("legalSec"),
        SDEPT: document.getElementById("legalDept"),
        SDIV: document.getElementById("legalDiv")
    });
    // Part 6: Expense toggle
    const expenseRadios = document.querySelectorAll("input[name='legalExpenseOption']");
    const reasonBox = document.getElementById("legalReasonBox");
    const compareUpload = document.getElementById("legalCompareUpload");
    const part7 = document.getElementById("legal_part7");
    expenseRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            if (radio.value === "not_compare" && radio.checked) {
                reasonBox === null || reasonBox === void 0 ? void 0 : reasonBox.classList.remove("hidden");
                compareUpload === null || compareUpload === void 0 ? void 0 : compareUpload.classList.add("hidden");
            }
            else if (radio.value === "compare" && radio.checked) {
                reasonBox === null || reasonBox === void 0 ? void 0 : reasonBox.classList.add("hidden");
                compareUpload === null || compareUpload === void 0 ? void 0 : compareUpload.classList.remove("hidden");
                part7 === null || part7 === void 0 ? void 0 : part7.classList.remove("hidden");
            }
        });
    });
    // Free toggle
    const reasonRadios = document.querySelectorAll("input[name='legalReason']");
    reasonRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            if (radio.value === "free" && radio.checked) {
                part7 === null || part7 === void 0 ? void 0 : part7.classList.add("hidden");
            }
            else {
                part7 === null || part7 === void 0 ? void 0 : part7.classList.remove("hidden");
            }
        });
    });
    // Part 7: VAT calculation
    const vatResult = document.getElementById("legalVatResult");
    const amountInput = document.getElementById("legalAmount");
    vatResult === null || vatResult === void 0 ? void 0 : vatResult.classList.add("hidden");
    if (amountInput) {
        amountInput.value = "";
        amountInput.addEventListener("input", () => {
            if (!amountInput.value || !vatResult)
                return;
            const amount = parseFloat(amountInput.value);
            if (isNaN(amount)) {
                vatResult.textContent = "";
                vatResult.classList.add("hidden");
                return;
            }
            const vat = amount * 0.07;
            const total = amount + vat;
            vatResult.textContent = `รวมทั้งหมด: ${total.toLocaleString()} บาท (VAT 7%: ${vat.toLocaleString()} บาท)`;
            vatResult.classList.remove("hidden");
        });
    }
}
// =====================
// Meth Form  
// =====================
export function initMethForm() {
    console.log("🚀 init Meth Form");
    populateSelect(document.getElementById("methTimeFromHour"), 0, 23);
    populateSelect(document.getElementById("methTimeToHour"), 0, 23);
    populateSelect(document.getElementById("methTimeFromMin"), 0, 59);
    populateSelect(document.getElementById("methTimeToMin"), 0, 59);
    // Request By
    bindEmpLookup(document.getElementById("methRequestBy"), { SNAME: document.getElementById("methRequestByName") });
    // Trainee
    bindEmpLookup(document.getElementById("methCode"), {
        SNAME: document.getElementById("methName"),
        SPOSITION: document.getElementById("methPosition"),
        SSEC: document.getElementById("methSec"),
        SDEPT: document.getElementById("methDept"),
        SDIV: document.getElementById("methDiv")
    });
    // Part 5: Expense toggle
    const expenseRadios = document.querySelectorAll("input[name='methExpenseOption']");
    const reasonBox = document.getElementById("methReasonBox");
    const compareUpload = document.getElementById("methCompareUpload");
    const part6 = document.getElementById("meth_part6");
    expenseRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            if (radio.value === "not_compare" && radio.checked) {
                reasonBox === null || reasonBox === void 0 ? void 0 : reasonBox.classList.remove("hidden");
                compareUpload === null || compareUpload === void 0 ? void 0 : compareUpload.classList.add("hidden");
            }
            else if (radio.value === "compare" && radio.checked) {
                reasonBox === null || reasonBox === void 0 ? void 0 : reasonBox.classList.add("hidden");
                compareUpload === null || compareUpload === void 0 ? void 0 : compareUpload.classList.remove("hidden");
                part6 === null || part6 === void 0 ? void 0 : part6.classList.remove("hidden");
            }
        });
    });
    // Free toggle
    const reasonRadios = document.querySelectorAll("input[name='methReason']");
    reasonRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            if (radio.value === "free" && radio.checked) {
                part6 === null || part6 === void 0 ? void 0 : part6.classList.add("hidden");
            }
            else {
                part6 === null || part6 === void 0 ? void 0 : part6.classList.remove("hidden");
            }
        });
    });
    // Part 6: VAT calculation
    const vatResult = document.getElementById("methVatResult");
    const amountInput = document.getElementById("methAmount");
    vatResult === null || vatResult === void 0 ? void 0 : vatResult.classList.add("hidden");
    if (amountInput) {
        amountInput.value = "";
        amountInput.addEventListener("input", () => {
            if (!amountInput.value || !vatResult)
                return;
            const amount = parseFloat(amountInput.value);
            if (isNaN(amount)) {
                vatResult.textContent = "";
                vatResult.classList.add("hidden");
                return;
            }
            const vat = amount * 0.07;
            const total = amount + vat;
            vatResult.textContent = `รวมทั้งหมด: ${total.toLocaleString()} บาท (VAT 7%: ${vat.toLocaleString()} บาท)`;
            vatResult.classList.remove("hidden");
        });
    }
}
