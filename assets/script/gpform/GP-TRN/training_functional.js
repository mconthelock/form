"use strict";

let functionalInitialized = false;

function initFunctionalForm() {
    console.log("🚀 init Functional Form");

    if (functionalInitialized) return;
    functionalInitialized = true;

    // Select Time
    populateSelect(document.getElementById("funcTimeFromHour"), 0, 23);
    populateSelect(document.getElementById("funcTimeToHour"), 0, 23);
    populateSelect(document.getElementById("funcTimeFromMin"), 0, 59);
    populateSelect(document.getElementById("funcTimeToMin"), 0, 59);

    // Request By
    bindEmpLookup(document.getElementById("funcRequestBy"), {
        SNAME: document.getElementById("funcRequestByName")
    });

    // Trainee
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

    // --- Free reason toggle ---
    const reasonRadios = document.querySelectorAll("input[name='funcReason']");
    reasonRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            if (radio.value === "free" && radio.checked) {
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
            vatResult.textContent = `รวมทั้งหมด: ${total.toLocaleString()} บาท (VAT 7%: ${vat.toLocaleString()} บาท)`;
            vatResult.classList.remove("hidden");
        });
    }

    // --- Submit button ---
    const sendBtn = document.getElementById("sendFuncFormBtn");
    if (sendBtn) {
        sendBtn.addEventListener("click", () => {
            console.log("👉 Click Send Functional");
            showAlert("📤 ส่งฟอร์ม", "ระบบกำลังพัฒนา...");
        });
    }

    // --- Dynamic Objective & Expectation ---
    document.body.addEventListener("click", e => {
        if (e.target.classList.contains("add-objective")) {
            console.log("🔥 Add Objective");
            const container = document.getElementById("funcObjectiveList");
            const newItem = e.target.closest(".objective-item").cloneNode(true);
            newItem.querySelector("input").value = "";
            container.appendChild(newItem);
        }

        if (e.target.classList.contains("add-expectation")) {
            console.log("🔥 Add Expectation");
            const container = document.getElementById("funcExpectationList");
            const newItem = e.target.closest(".expectation-item").cloneNode(true);
            newItem.querySelector("input").value = "";
            container.appendChild(newItem);
        }
    });
}
