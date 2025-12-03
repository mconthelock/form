
import { bindEmpLookup } from "./emp_lookup.js";  
import { populateSelect , bindMaxLengthAlert } from "./formUtils.js";

// ✅ export ให้ training_select.js import ไปใช้ได้
export function initMethForm() {
    console.log("🚀 init Meth Form");

    // กันไม่ให้ init ซ้ำ
    if (initMethForm.initialized) return;
    initMethForm.initialized = true;

    // =========================
    // 🔹 Populate Time Select (ใช้จาก formUtils.js)
    // =========================
    populateSelect(document.getElementById("methTimeFromHour"), 0, 23);
    populateSelect(document.getElementById("methTimeToHour"), 0, 23);
    populateSelect(document.getElementById("methTimeFromMin"), 0, 59);
    populateSelect(document.getElementById("methTimeToMin"), 0, 59);

    // =========================
    // 🔹 Request By + Trainee
    // =========================
    bindEmpLookup(document.getElementById("methRequestBy"), {
        SNAME: document.getElementById("methRequestByName")
    });

    bindEmpLookup(document.getElementById("methTraineeCode"), {
        SNAME: document.getElementById("methTraineeName"),
        SPOSITION: document.getElementById("methTraineePosition"),
        SSEC: document.getElementById("methTraineeSec"),
        SDEPT: document.getElementById("methTraineeDept"),
        SDIV: document.getElementById("methTraineeDiv")
    });

    // =========================
    // 🔹 Expense toggle
    // =========================
    const expenseRadios = document.querySelectorAll("input[name='methExpenseOption']");
    const reasonBox = document.getElementById("methReasonBox");
    const compareUpload = document.getElementById("methCompareUpload");
    const part6 = document.getElementById("meth_part6");

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

    // =========================
    // 🔹 Free reason toggle
    // =========================
    const reasonRadios = document.querySelectorAll("input[name='methReason']");
    reasonRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            if (radio.value === "1" && radio.checked) {
                part6?.classList.add("hidden");
            } else {
                part6?.classList.remove("hidden");
            }
        });
    });

    // =========================
    // 🔹 VAT calculation
    // =========================
    const vatResult = document.getElementById("methVatResult");
    const amountInput = document.getElementById("methAmountInput");
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

// ✅ เพิ่ม flag ไว้กันการ init ซ้ำ
initMethForm.initialized = false;
