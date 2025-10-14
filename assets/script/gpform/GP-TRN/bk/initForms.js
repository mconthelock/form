"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initBackButtons = initBackButtons;
exports.initFunctionalForm = initFunctionalForm;
exports.initLegalForm = initLegalForm;
exports.initMethForm = initMethForm;
// initForms.ts
const emp_lookup_js_1 = require("./emp_lookup.js");
const formUtils_js_1 = require("./formUtils.js");
//Back Button 
function initBackButtons(trainingType, selectCard, requestForm, detailBox) {
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
        (0, formUtils_js_1.toggleSubmit)(trainingType, document.getElementById("submitBtn"));
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
        (0, formUtils_js_1.toggleSubmit)(trainingType, document.getElementById("submitBtn"));
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
        (0, formUtils_js_1.toggleSubmit)(trainingType, document.getElementById("submitBtn"));
    });
}
// =====================
// Functional Form
// =====================
function initFunctionalForm() {
    console.log("🚀 init Functional Form");
    // Select Time
    (0, formUtils_js_1.populateSelect)(document.getElementById("funcTimeFromHour"), 0, 23);
    (0, formUtils_js_1.populateSelect)(document.getElementById("funcTimeToHour"), 0, 23);
    (0, formUtils_js_1.populateSelect)(document.getElementById("funcTimeFromMin"), 0, 59);
    (0, formUtils_js_1.populateSelect)(document.getElementById("funcTimeToMin"), 0, 59);
    // Request By
    (0, emp_lookup_js_1.bindEmpLookup)(document.getElementById("funcRequestBy"), { SNAME: document.getElementById("funcRequestByName") });
    // Trainee
    (0, emp_lookup_js_1.bindEmpLookup)(document.getElementById("funcTraineeCode"), {
        SNAME: document.getElementById("funcTraineeName"),
        SPOSITION: document.getElementById("funcTraineePosition"),
        SSEC: document.getElementById("funcTraineeSec"),
        SDEPT: document.getElementById("funcTraineeDept"),
        SDIV: document.getElementById("funcTraineeDiv")
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
function initLegalForm() {
    console.log("🚀 init Legal Form");
    (0, formUtils_js_1.populateSelect)(document.getElementById("legalTimeFromHour"), 0, 23);
    (0, formUtils_js_1.populateSelect)(document.getElementById("legalTimeToHour"), 0, 23);
    (0, formUtils_js_1.populateSelect)(document.getElementById("legalTimeFromMin"), 0, 59);
    (0, formUtils_js_1.populateSelect)(document.getElementById("legalTimeToMin"), 0, 59);
    // Request By
    (0, emp_lookup_js_1.bindEmpLookup)(document.getElementById("legalRequestBy"), { SNAME: document.getElementById("legalRequestByName") });
    // Trainee
    (0, emp_lookup_js_1.bindEmpLookup)(document.getElementById("legalTraineeCode"), {
        SNAME: document.getElementById("legalTraineeName"),
        SPOSITION: document.getElementById("legalTraineePosition"),
        SSEC: document.getElementById("legalTraineeSec"),
        SDEPT: document.getElementById("legalTraineeDept"),
        SDIV: document.getElementById("legalTraineeDiv")
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
function initMethForm() {
    console.log("🚀 init Meth Form");
    (0, formUtils_js_1.populateSelect)(document.getElementById("methTimeFromHour"), 0, 23);
    (0, formUtils_js_1.populateSelect)(document.getElementById("methTimeToHour"), 0, 23);
    (0, formUtils_js_1.populateSelect)(document.getElementById("methTimeFromMin"), 0, 59);
    (0, formUtils_js_1.populateSelect)(document.getElementById("methTimeToMin"), 0, 59);
    // Request By
    (0, emp_lookup_js_1.bindEmpLookup)(document.getElementById("methRequestBy"), { SNAME: document.getElementById("methRequestByName") });
    // Trainee
    (0, emp_lookup_js_1.bindEmpLookup)(document.getElementById("methTraineeCode"), {
        SNAME: document.getElementById("methTraineeName"),
        SPOSITION: document.getElementById("methTraineePosition"),
        SSEC: document.getElementById("methTraineeSec"),
        SDEPT: document.getElementById("methTraineeDept"),
        SDIV: document.getElementById("methTraineeDiv")
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
