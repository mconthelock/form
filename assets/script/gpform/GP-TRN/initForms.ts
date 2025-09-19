// initForms.ts
import { bindEmpLookup } from "./emp_lookup.js";
import { populateSelect, toggleSubmit } from "./formUtils.js";

//Back Button 
export function initBackButtons(
    trainingType: HTMLSelectElement | null,
    selectCard: HTMLElement | null,
    requestForm: HTMLElement | null,
    detailBox: HTMLElement | null
) {
    const backBtnFunctional = document.getElementById("backBtn_func") as HTMLButtonElement | null;
    backBtnFunctional?.addEventListener("click", () => {
        const form = document.getElementById("form_functional");
        form?.classList.add("hidden");
        requestForm?.classList.add("hidden");
        selectCard?.classList.remove("hidden");

        if (trainingType) trainingType.value = "";
        if (detailBox) detailBox.classList.add("hidden");

        toggleSubmit(trainingType, document.getElementById("submitBtn") as HTMLButtonElement | null);
    });

    const backBtnLegal = document.getElementById("backBtn_legal") as HTMLButtonElement | null;
    backBtnLegal?.addEventListener("click", () => {
        const form = document.getElementById("form_legal");
        form?.classList.add("hidden");
        requestForm?.classList.add("hidden");
        selectCard?.classList.remove("hidden");

        if (trainingType) trainingType.value = "";
        if (detailBox) detailBox.classList.add("hidden");

        toggleSubmit(trainingType, document.getElementById("submitBtn") as HTMLButtonElement | null);
    });

    const backBtnMeth = document.getElementById("backBtn_meth") as HTMLButtonElement | null;
    backBtnMeth?.addEventListener("click", () => {
        const form = document.getElementById("form_meth");
        form?.classList.add("hidden");
        requestForm?.classList.add("hidden");
        selectCard?.classList.remove("hidden");

        if (trainingType) trainingType.value = "";
        if (detailBox) detailBox.classList.add("hidden");

        toggleSubmit(trainingType, document.getElementById("submitBtn") as HTMLButtonElement | null);
    });
}

// =====================
// Functional Form
// =====================
export function initFunctionalForm() {
    console.log("🚀 init Functional Form");

    // Select Time
    populateSelect(document.getElementById("funcTimeFromHour") as HTMLSelectElement, 0, 23);
    populateSelect(document.getElementById("funcTimeToHour") as HTMLSelectElement, 0, 23);
    populateSelect(document.getElementById("funcTimeFromMin") as HTMLSelectElement, 0, 59);
    populateSelect(document.getElementById("funcTimeToMin") as HTMLSelectElement, 0, 59);

    // Request By
    bindEmpLookup(
        document.getElementById("funcRequestBy") as HTMLInputElement,
        { SNAME: document.getElementById("funcRequestByName") }
    );

    // Trainee
    bindEmpLookup(
        document.getElementById("funcTraineeCode") as HTMLInputElement,
        {
            SNAME: document.getElementById("funcTraineeName") as HTMLInputElement,
            SPOSITION: document.getElementById("funcTraineePosition") as HTMLInputElement,
            SSEC: document.getElementById("funcTraineeSec") as HTMLInputElement,
            SDEPT: document.getElementById("funcTraineeDept") as HTMLInputElement,
            SDIV: document.getElementById("funcTraineeDiv") as HTMLInputElement
        }
    );

    // Part 5: Expense toggle
    const expenseRadios = document.querySelectorAll<HTMLInputElement>("input[name='funcExpenseOption']");
    const reasonBox = document.getElementById("funcReasonBox");
    const compareUpload = document.getElementById("funcCompareUpload");
    const part6 = document.getElementById("func_part6");

    expenseRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            if (radio.value === "not_compare" && radio.checked) {
                reasonBox?.classList.remove("hidden");
                compareUpload?.classList.add("hidden");
            } else if (radio.value === "compare" && radio.checked) {
                reasonBox?.classList.add("hidden");
                compareUpload?.classList.remove("hidden");
                part6?.classList.remove("hidden");
            }
        });
    });

    // Part 5: Free reason toggle
    const reasonRadios = document.querySelectorAll<HTMLInputElement>("input[name='funcReason']");
    reasonRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            if (radio.value === "free" && radio.checked) {
                part6?.classList.add("hidden");
            } else {
                part6?.classList.remove("hidden");
            }
        });
    });

    // Part 6: VAT calculation
    const vatResult = document.getElementById("funcVatResult") as HTMLElement | null;
    const amountInput = document.getElementById("funcAmountInput") as HTMLInputElement | null;

    vatResult?.classList.add("hidden");
    if (amountInput) {
        amountInput.value = "";
        amountInput.addEventListener("input", () => {
            if (!amountInput.value || !vatResult) return;
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

    populateSelect(document.getElementById("legalTimeFromHour") as HTMLSelectElement, 0, 23);
    populateSelect(document.getElementById("legalTimeToHour") as HTMLSelectElement, 0, 23);
    populateSelect(document.getElementById("legalTimeFromMin") as HTMLSelectElement, 0, 59);
    populateSelect(document.getElementById("legalTimeToMin") as HTMLSelectElement, 0, 59);

    // Request By
    bindEmpLookup(
        document.getElementById("legalRequestBy") as HTMLInputElement,
        { SNAME: document.getElementById("legalRequestByName") }
    );

    // Trainee
    bindEmpLookup(
        document.getElementById("legalTraineeCode") as HTMLInputElement,
        {
            SNAME: document.getElementById("legalTraineeName") as HTMLInputElement,
            SPOSITION: document.getElementById("legalTraineePosition") as HTMLInputElement,
            SSEC: document.getElementById("legalTraineeSec") as HTMLInputElement,
            SDEPT: document.getElementById("legalTraineeDept") as HTMLInputElement,
            SDIV: document.getElementById("legalTraineeDiv") as HTMLInputElement
        }
    );

    // Part 6: Expense toggle
    const expenseRadios = document.querySelectorAll<HTMLInputElement>("input[name='legalExpenseOption']");
    const reasonBox = document.getElementById("legalReasonBox");
    const compareUpload = document.getElementById("legalCompareUpload");
    const part7 = document.getElementById("legal_part7");

    expenseRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            if (radio.value === "not_compare" && radio.checked) {
                reasonBox?.classList.remove("hidden");
                compareUpload?.classList.add("hidden");
            } else if (radio.value === "compare" && radio.checked) {
                reasonBox?.classList.add("hidden");
                compareUpload?.classList.remove("hidden");
                part7?.classList.remove("hidden");
            }
        });
    });

    // Free toggle
    const reasonRadios = document.querySelectorAll<HTMLInputElement>("input[name='legalReason']");
    reasonRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            if (radio.value === "free" && radio.checked) {
                part7?.classList.add("hidden");
            } else {
                part7?.classList.remove("hidden");
            }
        });
    });

    // Part 7: VAT calculation
    const vatResult = document.getElementById("legalVatResult") as HTMLElement | null;
    const amountInput = document.getElementById("legalAmount") as HTMLInputElement | null;

    vatResult?.classList.add("hidden");
    if (amountInput) {
        amountInput.value = "";
        amountInput.addEventListener("input", () => {
            if (!amountInput.value || !vatResult) return;
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

    populateSelect(document.getElementById("methTimeFromHour") as HTMLSelectElement, 0, 23);
    populateSelect(document.getElementById("methTimeToHour") as HTMLSelectElement, 0, 23);
    populateSelect(document.getElementById("methTimeFromMin") as HTMLSelectElement, 0, 59);
    populateSelect(document.getElementById("methTimeToMin") as HTMLSelectElement, 0, 59);

    // Request By
    bindEmpLookup(
        document.getElementById("methRequestBy") as HTMLInputElement,
        { SNAME: document.getElementById("methRequestByName") }
    );

    // Trainee
    bindEmpLookup(
        document.getElementById("methTraineeCode") as HTMLInputElement,
        {
            SNAME: document.getElementById("methTraineeName") as HTMLInputElement,
            SPOSITION: document.getElementById("methTraineePosition") as HTMLInputElement,
            SSEC: document.getElementById("methTraineeSec") as HTMLInputElement,
            SDEPT: document.getElementById("methTraineeDept") as HTMLInputElement,
            SDIV: document.getElementById("methTraineeDiv") as HTMLInputElement
        }
    );

    // Part 5: Expense toggle
    const expenseRadios = document.querySelectorAll<HTMLInputElement>("input[name='methExpenseOption']");
    const reasonBox = document.getElementById("methReasonBox");
    const compareUpload = document.getElementById("methCompareUpload");
    const part6 = document.getElementById("meth_part6");

    expenseRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            if (radio.value === "not_compare" && radio.checked) {
                reasonBox?.classList.remove("hidden");
                compareUpload?.classList.add("hidden");
            } else if (radio.value === "compare" && radio.checked) {
                reasonBox?.classList.add("hidden");
                compareUpload?.classList.remove("hidden");
                part6?.classList.remove("hidden");
            }
        });
    });

    // Free toggle
    const reasonRadios = document.querySelectorAll<HTMLInputElement>("input[name='methReason']");
    reasonRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            if (radio.value === "free" && radio.checked) {
                part6?.classList.add("hidden");
            } else {
                part6?.classList.remove("hidden");
            }
        });
    });

    // Part 6: VAT calculation
    const vatResult = document.getElementById("methVatResult") as HTMLElement | null;
    const amountInput = document.getElementById("methAmount") as HTMLInputElement | null;

    vatResult?.classList.add("hidden");
    if (amountInput) {
        amountInput.value = "";
        amountInput.addEventListener("input", () => {
            if (!amountInput.value || !vatResult) return;
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
