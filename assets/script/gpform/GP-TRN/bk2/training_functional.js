import { populateSelect, bindMaxLengthAlert } from "./formUtils.js";
import { bindEmpLookup } from "./emp_lookup.js";

// ✅ ใช้ property ที่ตัว function แทน global variable
export function initFunctionalForm() {
    console.log("🚀 init Functional Form");

    if (initFunctionalForm.initialized) return;
    initFunctionalForm.initialized = true;

    // --- Select Time ---
    populateSelect(document.getElementById("funcTimeFromHour"), 0, 23);
    populateSelect(document.getElementById("funcTimeToHour"), 0, 23);
    populateSelect(document.getElementById("funcTimeFromMin"), 0, 59);
    populateSelect(document.getElementById("funcTimeToMin"), 0, 59);

    // --- Request By ---
    bindEmpLookup(document.getElementById("funcRequestBy"), {
        SNAME: document.getElementById("funcRequestByName")
    });

    // --- Trainee ---
    bindEmpLookup(document.getElementById("funcTraineeCode"), {
        SNAME: document.getElementById("funcTraineeName"),
        SPOSITION: document.getElementById("funcTraineePosition"),
        SSEC: document.getElementById("funcTraineeSec"),
        SDEPT: document.getElementById("funcTraineeDept"),
        SDIV: document.getElementById("funcTraineeDiv")
    });


    // --- Expense toggle ---
    const expenseRadios = document.querySelectorAll("input[name='funcExpenseOption']");
    const reasonBox = document.getElementById("funcReasonBox");
    const compareUpload = document.getElementById("funcCompareUpload");
    const part6 = document.getElementById("func_part6");

    expenseRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            if (radio.value === "0" && radio.checked) {
                reasonBox?.classList.remove("hidden");
                compareUpload?.classList.add("hidden");
            } else if (radio.value === "1" && radio.checked) {
                reasonBox?.classList.add("hidden");
                compareUpload?.classList.remove("hidden");
                part6?.classList.remove("hidden");
            }
        });
    });

    // --- Free reason toggle ---
    const reasonRadios = document.querySelectorAll("input[name='funcReason']");
    reasonRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            if (radio.value === "1" && radio.checked) {
                part6?.classList.add("hidden");
            } else {
                part6?.classList.remove("hidden");
            }
        });
    });

    // --- VAT calculation ---
    const vatResult = document.getElementById("funcVatResult");
    const amountInput = document.getElementById("funcAmountInput");
    if (vatResult) vatResult.classList.add("hidden");

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
            vatResult.textContent =
                `รวมทั้งหมด: ${total.toLocaleString()} บาท (VAT 7%: ${vat.toLocaleString()} บาท)`;
            vatResult.classList.remove("hidden");
        });
    }

}

// ✅ กัน init ซ้ำ
initFunctionalForm.initialized = false;
