
// =====================
// Back Button 
// =====================
function initBackButtons(trainingType, selectCard, requestForm, detailBox) {
    const backBtnFunctional = document.getElementById("backBtn_func");
    if (backBtnFunctional) {
        backBtnFunctional.addEventListener("click", () => {
            const form = document.getElementById("form_functional");
            if (form) form.classList.add("hidden");
            if (requestForm) requestForm.classList.add("hidden");
            if (selectCard) selectCard.classList.remove("hidden");
            if (trainingType) trainingType.value = "";
            if (detailBox) detailBox.classList.add("hidden");
            toggleSubmit(trainingType, document.getElementById("submitBtn"));
        });
    }

    const backBtnLegal = document.getElementById("backBtn_legal");
    if (backBtnLegal) {
        backBtnLegal.addEventListener("click", () => {
            const form = document.getElementById("form_legal");
            if (form) form.classList.add("hidden");
            if (requestForm) requestForm.classList.add("hidden");
            if (selectCard) selectCard.classList.remove("hidden");
            if (trainingType) trainingType.value = "";
            if (detailBox) detailBox.classList.add("hidden");
            toggleSubmit(trainingType, document.getElementById("submitBtn"));
        });
    }

    const backBtnMeth = document.getElementById("backBtn_meth");
    if (backBtnMeth) {
        backBtnMeth.addEventListener("click", () => {
            const form = document.getElementById("form_meth");
            if (form) form.classList.add("hidden");
            if (requestForm) requestForm.classList.add("hidden");
            if (selectCard) selectCard.classList.remove("hidden");
            if (trainingType) trainingType.value = "";
            if (detailBox) detailBox.classList.add("hidden");
            toggleSubmit(trainingType, document.getElementById("submitBtn"));
        });
    }
}

// =====================
// Functional Form
// =====================
function initFunctionalForm() {
    console.log("🚀 init Functional Form");

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

    // Part 5: Expense toggle
    const expenseRadios = document.querySelectorAll("input[name='funcExpenseOption']");
    const reasonBox = document.getElementById("funcReasonBox");
    const compareUpload = document.getElementById("funcCompareUpload");
    const part6 = document.getElementById("func_part6");

    expenseRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            if (radio.value === "not_compare" && radio.checked) {
                if (reasonBox) reasonBox.classList.remove("hidden");
                if (compareUpload) compareUpload.classList.add("hidden");
            } else if (radio.value === "compare" && radio.checked) {
                if (reasonBox) reasonBox.classList.add("hidden");
                if (compareUpload) compareUpload.classList.remove("hidden");
                if (part6) part6.classList.remove("hidden");
            }
        });
    });

    // Part 5: Free reason toggle
    const reasonRadios = document.querySelectorAll("input[name='funcReason']");
    reasonRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            if (radio.value === "free" && radio.checked) {
                if (part6) part6.classList.add("hidden");
            } else {
                if (part6) part6.classList.remove("hidden");
            }
        });
    });

    // Part 6: VAT calculation
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
}

// =====================
// Legal Form
// =====================
function initLegalForm() {
    console.log("🚀 init Legal Form");

    populateSelect(document.getElementById("legalTimeFromHour"), 0, 23);
    populateSelect(document.getElementById("legalTimeToHour"), 0, 23);
    populateSelect(document.getElementById("legalTimeFromMin"), 0, 59);
    populateSelect(document.getElementById("legalTimeToMin"), 0, 59);

    // Request By
    bindEmpLookup(document.getElementById("legalRequestBy"), {
        SNAME: document.getElementById("legalRequestByName")
    });

    // Trainee
    bindEmpLookup(document.getElementById("legalTraineeCode"), {
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
                if (reasonBox) reasonBox.classList.remove("hidden");
                if (compareUpload) compareUpload.classList.add("hidden");
            } else if (radio.value === "compare" && radio.checked) {
                if (reasonBox) reasonBox.classList.add("hidden");
                if (compareUpload) compareUpload.classList.remove("hidden");
                if (part7) part7.classList.remove("hidden");
            }
        });
    });

    // Free toggle
    const reasonRadios = document.querySelectorAll("input[name='legalReason']");
    reasonRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            if (radio.value === "free" && radio.checked) {
                if (part7) part7.classList.add("hidden");
            } else {
                if (part7) part7.classList.remove("hidden");
            }
        });
    });

    // Part 7: VAT calculation
    const vatResult = document.getElementById("legalVatResult");
    const amountInput = document.getElementById("legalAmount");
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
}

// =====================
// Meth Form  
// =====================
function initMethForm() {
    console.log("🚀 init Meth Form");

    populateSelect(document.getElementById("methTimeFromHour"), 0, 23);
    populateSelect(document.getElementById("methTimeToHour"), 0, 23);
    populateSelect(document.getElementById("methTimeFromMin"), 0, 59);
    populateSelect(document.getElementById("methTimeToMin"), 0, 59);

    // Request By
    bindEmpLookup(document.getElementById("methRequestBy"), {
        SNAME: document.getElementById("methRequestByName")
    });

    // Trainee
    bindEmpLookup(document.getElementById("methTraineeCode"), {
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
                if (reasonBox) reasonBox.classList.remove("hidden");
                if (compareUpload) compareUpload.classList.add("hidden");
            } else if (radio.value === "compare" && radio.checked) {
                if (reasonBox) reasonBox.classList.add("hidden");
                if (compareUpload) compareUpload.classList.remove("hidden");
                if (part6) part6.classList.remove("hidden");
            }
        });
    });

    // Free toggle
    const reasonRadios = document.querySelectorAll("input[name='methReason']");
    reasonRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            if (radio.value === "free" && radio.checked) {
                if (part6) part6.classList.add("hidden");
            } else {
                if (part6) part6.classList.remove("hidden");
            }
        });
    });

    // Part 6: VAT calculation
    const vatResult = document.getElementById("methVatResult");
    const amountInput = document.getElementById("methAmount");
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
}
