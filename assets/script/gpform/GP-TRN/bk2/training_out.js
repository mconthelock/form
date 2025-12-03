
import { bindEmpLookup } from "./emp_lookup.js";  
import { populateSelect , bindMaxLengthAlert } from "./formUtils.js";

// ✅ export ให้ training_select.js import ไปใช้ได้
export function initOutForm() {
    console.log("🚀 init Outside Form");

    // กันไม่ให้ init ซ้ำ
    if (initOutForm.initialized) return;
    initOutForm.initialized = true;

    // =========================
    // 🔹 Populate Time Select (ใช้จาก formUtils.js)
    // =========================
    populateSelect(document.getElementById("outTimeFromHour"), 0, 23);
    populateSelect(document.getElementById("outTimeToHour"), 0, 23);
    populateSelect(document.getElementById("outTimeFromMin"), 0, 59);
    populateSelect(document.getElementById("outTimeToMin"), 0, 59);

    // =========================
    // 🔹 Request By + Trainee
    // =========================
    bindEmpLookup(document.getElementById("outRequestBy"), {
        SNAME: document.getElementById("outRequestByName")
    });

    bindEmpLookup(document.getElementById("outTraineeCode"), {
        SNAME: document.getElementById("outTraineeName"),
        SPOSITION: document.getElementById("outTraineePosition"),
        SSEC: document.getElementById("outTraineeSec"),
        SDEPT: document.getElementById("outTraineeDept"),
        SDIV: document.getElementById("outTraineeDiv")
    });

    // =========================
    // 🔹 Expense toggle
    // =========================
    const expenseRadios = document.querySelectorAll("input[name='outExpenseOption']");
    const reasonBox = document.getElementById("outReasonBox");
    const compareUpload = document.getElementById("outCompareUpload");
    const part6 = document.getElementById("out_part6");

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


}

// ✅ เพิ่ม flag ไว้กันการ init ซ้ำ
initOutForm.initialized = false;
