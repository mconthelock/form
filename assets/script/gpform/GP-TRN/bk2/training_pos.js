
import { bindEmpLookup } from "./emp_lookup.js";  
import { populateSelect , bindMaxLengthAlert } from "./formUtils.js";

// ✅ export ให้ training_select.js import ไปใช้ได้
export function initPosForm() {
    console.log("🚀 init Position Base Form");

    // กันไม่ให้ init ซ้ำ
    if (initPosForm.initialized) return;
    initPosForm.initialized = true;

    // =========================
    // 🔹 Populate Time Select (ใช้จาก formUtils.js)
    // =========================
    populateSelect(document.getElementById("posTimeFromHour"), 0, 23);
    populateSelect(document.getElementById("posTimeToHour"), 0, 23);
    populateSelect(document.getElementById("posTimeFromMin"), 0, 59);
    populateSelect(document.getElementById("posTimeToMin"), 0, 59);

    // =========================
    // 🔹 Request By + Trainee
    // =========================
    bindEmpLookup(document.getElementById("posRequestBy"), {
        SNAME: document.getElementById("posRequestByName")
    });

    bindEmpLookup(document.getElementById("posTraineeCode"), {
        SNAME: document.getElementById("posTraineeName"),
        SPOSITION: document.getElementById("posTraineePosition"),
        SSEC: document.getElementById("posTraineeSec"),
        SDEPT: document.getElementById("posTraineeDept"),
        SDIV: document.getElementById("posTraineeDiv")
    });

    // =========================
    // 🔹 Expense toggle
    // =========================
    const expenseRadios = document.querySelectorAll("input[name='posExpenseOption']");
    const reasonBox = document.getElementById("posReasonBox");
    const compareUpload = document.getElementById("posCompareUpload");
    const part6 = document.getElementById("pos_part6");

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
    const reasonRadios = document.querySelectorAll("input[name='posReason']");
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
    const vatResult = document.getElementById("posVatResult");
    const amountInput = document.getElementById("posAmountInput");
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
initPosForm.initialized = false;
