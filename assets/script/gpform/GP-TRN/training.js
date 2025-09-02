// ==================================================
// Training.ts
// รวม logic ของหน้าจอเลือกฟอร์ม + ฟอร์มย่อย (functional, legal, meth)
// ==================================================
document.addEventListener("DOMContentLoaded", () => {
    // =====================
    // ส่วนกลาง: ตัวแปร DOM ที่ใช้ทุกหน้า
    // =====================
    const trainingType = document.getElementById("trainingType");
    const submitBtn = document.getElementById("submitBtn");
    const selectCard = document.getElementById("selectCard");
    const requestForm = document.getElementById("requestForm");
    const detailBox = document.getElementById("detailBox");
    const detailTitle = document.getElementById("detailTitle");
    const detailDesc = document.getElementById("detailDesc");
    const alertModal = document.getElementById("alertModal");
    const alertTitle = document.getElementById("alertTitle");
    const alertMessage = document.getElementById("alertMessage");
    const details = {
        functional: {
            title: "Support Specific Functional Competency",
            desc: "ฟอร์มสำหรับฝึกอบรมเพื่อพัฒนาสมรรถนะเฉพาะทาง",
        },
        legal: {
            title: "Support Legal Requirement",
            desc: "ฟอร์มสำหรับฝึกอบรมที่เกี่ยวข้องกับข้อกำหนดทางกฎหมาย",
        },
        meth: {
            title: "Support ME-TH Training subject",
            desc: "ฟอร์มสำหรับหัวข้อการฝึกอบรม ME-TH",
        },
    };
    // =====================
    // ส่วนกลาง: Modal Alert
    // =====================
    function showAlert(title, message) {
        if (alertModal && typeof alertModal.showModal === "function") {
            if (alertTitle)
                alertTitle.textContent = title;
            if (alertMessage)
                alertMessage.textContent = message;
            alertModal.showModal();
        }
        else {
            alert(message);
        }
    }
    // =====================
    // ส่วนกลาง: Toggle ปุ่ม Submit
    // =====================
    function toggleSubmit() {
        if (!trainingType || !submitBtn)
            return;
        if (trainingType.value === "") {
            submitBtn.disabled = true;
            submitBtn.classList.remove("bg-indigo-600", "hover:bg-indigo-700", "cursor-pointer");
            submitBtn.classList.add("bg-indigo-400", "cursor-not-allowed");
        }
        else {
            submitBtn.disabled = false;
            submitBtn.classList.remove("bg-indigo-400", "cursor-not-allowed");
            submitBtn.classList.add("bg-indigo-600", "hover:bg-indigo-700", "cursor-pointer");
        }
    }
    // =====================
    // ตัวแปรบอกว่าอยู่ฟอร์มไหน
    // =====================
    let currentFormType = null;
    // =====================
    // Event เมื่อ select เปลี่ยนค่า
    // =====================
    trainingType === null || trainingType === void 0 ? void 0 : trainingType.addEventListener("change", () => {
        const val = trainingType.value;
        if (details[val]) {
            if (detailTitle)
                detailTitle.textContent = details[val].title;
            if (detailDesc)
                detailDesc.textContent = details[val].desc;
            detailBox === null || detailBox === void 0 ? void 0 : detailBox.classList.remove("hidden");
        }
        else {
            detailBox === null || detailBox === void 0 ? void 0 : detailBox.classList.add("hidden");
        }
        toggleSubmit();
    });
    // =====================
    // Event เมื่อกดปุ่ม Submit (ไปยังฟอร์ม)
    // =====================
    submitBtn === null || submitBtn === void 0 ? void 0 : submitBtn.addEventListener("click", () => {
        const val = trainingType === null || trainingType === void 0 ? void 0 : trainingType.value;
        if (!val) {
            showAlert("⚠ แจ้งเตือน", "กรุณาเลือกประเภทการฝึกอบรมก่อน !!");
            return;
        }
        // ซ่อน card เลือก
        selectCard === null || selectCard === void 0 ? void 0 : selectCard.classList.add("hidden");
        document.querySelectorAll("#requestForm > div").forEach(div => {
            div.classList.add("hidden");
        });
        const selectedForm = document.getElementById("form_" + val);
        if (selectedForm) {
            requestForm === null || requestForm === void 0 ? void 0 : requestForm.classList.remove("hidden");
            selectedForm.classList.remove("hidden");
            currentFormType = val; // 👉 เก็บว่าฟอร์มไหน active
            // เรียก init เฉพาะฟอร์ม
            if (val === "functional")
                initFunctionalForm();
            else if (val === "legal")
                initLegalForm();
            else if (val === "meth")
                initMethForm();
        }
        else {
            showAlert("⚠ แจ้งเตือน", "ฟอร์มนี้ยังไม่ได้ถูกสร้างครับ");
        }
    });
    // =====================
    // ปุ่มส่งฟอร์มกลาง
    // =====================
    const sendFormBtn = document.getElementById("sendFormBtn");
    sendFormBtn === null || sendFormBtn === void 0 ? void 0 : sendFormBtn.addEventListener("click", () => {
        if (!currentFormType) {
            showAlert("⚠ แจ้งเตือน", "ยังไม่ได้เลือกฟอร์ม");
            return;
        }
        if (currentFormType === "functional") {
            if (validateFunctionalForm()) {
                showAlert("✅ Functional", "ฟอร์ม Functional พร้อมส่ง");
                // TODO: submit functional
            }
        }
        else if (currentFormType === "legal") {
            if (validateLegalForm()) {
                showAlert("✅ Legal", "ฟอร์ม Legal พร้อมส่ง");
                // TODO: submit legal
            }
        }
        else if (currentFormType === "meth") {
            if (validateMethForm()) {
                showAlert("✅ METH", "ฟอร์ม METH พร้อมส่ง");
                // TODO: submit meth
            }
        }
    });
    function bindDynamicList(listId, inputName, placeholder, type) {
        const list = document.getElementById(listId);
        list === null || list === void 0 ? void 0 : list.addEventListener("click", (e) => {
            var _a;
            const target = e.target;
            if (target.classList.contains(`add-${type}`)) {
                const newRow = document.createElement("div");
                newRow.className = `flex items-center gap-2 ${type}-item`;
                newRow.innerHTML = `
                    <input type="text" name="${inputName}[]" placeholder="${placeholder}" class="input input-bordered w-full">
                    <button type="button" class="btn btn-sm bg-red-500 text-white remove-${type}">–</button>
                `;
                list.appendChild(newRow);
            }
            else if (target.classList.contains(`remove-${type}`)) {
                (_a = target.closest(`.${type}-item`)) === null || _a === void 0 ? void 0 : _a.remove();
            }
        });
    }
    // Functional
    bindDynamicList("funcObjectiveList", "funcObjective", "ระบุวัตถุประสงค์...", "objective");
    bindDynamicList("funcExpectationList", "funcExpectation", "ระบุความคาดหวัง / ประโยชน์...", "expectation");
    // Legal
    bindDynamicList("legalObjectiveList", "legalObjective", "ระบุวัตถุประสงค์...", "objective");
    bindDynamicList("legalExpectationList", "legalExpectation", "ระบุความคาดหวัง / ประโยชน์...", "expectation");
    // Meth
    bindDynamicList("methObjectiveList", "methObjective", "ระบุวัตถุประสงค์...", "objective");
    bindDynamicList("methExpectationList", "methExpectation", "ระบุความคาดหวัง / ประโยชน์...", "expectation");
    // ==================================================
    // ฟังก์ชันกลาง: ดึงข้อมูลพนักงาน
    // ==================================================
    async function bindEmpLookup(inputEl, outputMap) {
        inputEl === null || inputEl === void 0 ? void 0 : inputEl.addEventListener("input", async () => {
            const empno = inputEl.value.trim();
            if (empno.length === 5) {
                try {
                    const res = await fetch(getEmpUrl, {
                        method: "POST",
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: "empno=" + encodeURIComponent(empno)
                    });
                    const data = await res.json();
                    if (data.status === "success") {
                        Object.entries(outputMap).forEach(([key, el]) => {
                            var _a, _b;
                            if (!el)
                                return;
                            if ("value" in el) {
                                el.value = (_a = data[key]) !== null && _a !== void 0 ? _a : "";
                            }
                            else {
                                el.textContent = (_b = data[key]) !== null && _b !== void 0 ? _b : "";
                            }
                        });
                    }
                    else {
                        Object.values(outputMap).forEach(el => {
                            if (!el)
                                return;
                            if ("value" in el)
                                el.value = "";
                            else
                                el.textContent = "";
                        });
                        showAlert("⚠ แจ้งเตือน", data.message);
                    }
                }
                catch (err) {
                    console.error(err);
                    showAlert("⚠ แจ้งเตือน", "เกิดข้อผิดพลาดในการเชื่อมต่อ");
                }
            }
            else {
                Object.values(outputMap).forEach(el => {
                    if (!el)
                        return;
                    if ("value" in el)
                        el.value = "";
                    else
                        el.textContent = "";
                });
            }
        });
    }
    // =====================================================================
    // ฟอร์ม Functional
    // =====================================================================
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
        toggleSubmit();
    });
    function initFunctionalForm() {
        console.log("🚀 init Functional Form");
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
        // ================================
        // Part 5 : การพิจารณาค่าใช้จ่าย
        // ================================
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
        // toggle เหตุผล not_compare
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
        // ================================
        // Part 6 : ค่าใช้จ่าย (คำนวณ VAT)
        // ================================
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
    // =====================================================================
    // ฟอร์ม Legal
    // =====================================================================
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
        toggleSubmit();
    });
    function initLegalForm() {
        console.log("🚀 init Legal Form");
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
        // Part 6 : การพิจารณาค่าใช้จ่าย
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
        // toggle เหตุผล not_compare
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
        // Part 7 : ค่าใช้จ่าย (คำนวณ VAT)
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
    // =====================================================================
    // ฟอร์ม METH
    // =====================================================================
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
        toggleSubmit();
    });
    function initMethForm() {
        console.log("🚀 init Meth Form");
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
        // Reset ค่า VAT/Note (Part 6)
        const vatResult = document.getElementById("methVatResult");
        if (vatResult) {
            vatResult.textContent = "";
            vatResult.classList.add("hidden");
        }
        const amountInput = document.getElementById("methAmount");
        amountInput === null || amountInput === void 0 ? void 0 : amountInput.addEventListener("input", () => {
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
        // toggle Expense Option (Part 5)
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
        // toggle เหตุผล not_compare
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
    }
    // =====================
    // Validate Functional Form
    // =====================
    function validateFunctionalForm() {
        var _a, _b;
        // Request By
        const requestBy = (_a = document.getElementById("funcRequestBy")) === null || _a === void 0 ? void 0 : _a.value.trim();
        if (!requestBy) {
            showAlert("⚠ แจ้งเตือน", "กรุณากรอก Request By");
            return false;
        }
        // Part 1
        const part1Fields = ["funcTrainingSubject", "funcDateFrom", "funcDateTo", "funcTimeFrom", "funcTimeTo", "funcLocation", "funcInstitute"];
        for (const id of part1Fields) {
            const el = document.getElementById(id);
            if (!(el === null || el === void 0 ? void 0 : el.value.trim())) {
                showAlert("⚠ แจ้งเตือน", `กรุณากรอกข้อมูล Part 1 (${id})`);
                el === null || el === void 0 ? void 0 : el.focus();
                return false;
            }
        }
        // Part 2
        const objective = document.querySelector("#funcObjectiveList input[name='funcObjective[]']");
        if (!(objective === null || objective === void 0 ? void 0 : objective.value.trim())) {
            showAlert("⚠ แจ้งเตือน", "กรุณากรอกวัตถุประสงค์ (Part 2)");
            objective === null || objective === void 0 ? void 0 : objective.focus();
            return false;
        }
        // Part 3
        const expectation = document.querySelector("#funcExpectationList input[name='funcExpectation[]']");
        if (!(expectation === null || expectation === void 0 ? void 0 : expectation.value.trim())) {
            showAlert("⚠ แจ้งเตือน", "กรุณากรอกความคาดหวัง / ประโยชน์ (Part 3)");
            expectation === null || expectation === void 0 ? void 0 : expectation.focus();
            return false;
        }
        // Part 4
        const part4Fields = ["funcTraineeCode", "funcTraineeName", "funcTraineePosition", "funcSec", "funcDept", "funcDiv", "funcJdName", "funcJdRelation"];
        for (const id of part4Fields) {
            const el = document.getElementById(id);
            if (!(el === null || el === void 0 ? void 0 : el.value.trim())) {
                showAlert("⚠ แจ้งเตือน", `กรุณากรอกข้อมูล Part 4 (${id})`);
                el === null || el === void 0 ? void 0 : el.focus();
                return false;
            }
        }
        // Part 5
        const expenseOption = document.querySelector("input[name='funcExpenseOption']:checked");
        if (!expenseOption) {
            showAlert("⚠ แจ้งเตือน", "กรุณาเลือก Part 5 (ค่าใช้จ่าย)");
            return false;
        }
        if (expenseOption.value === "not_compare") {
            const reason = document.querySelector("input[name='funcReason']:checked");
            if (!reason) {
                showAlert("⚠ แจ้งเตือน", "กรุณาเลือกเหตุผล (Part 5)");
                return false;
            }
            if (reason.value === "other") {
                const reasonText = document.getElementById("funcReasonOtherText");
                if (!(reasonText === null || reasonText === void 0 ? void 0 : reasonText.value.trim())) {
                    showAlert("⚠ แจ้งเตือน", "กรุณาระบุเหตุผลอื่น (Part 5)");
                    reasonText === null || reasonText === void 0 ? void 0 : reasonText.focus();
                    return false;
                }
            }
        }
        else if (expenseOption.value === "compare") {
            const files = (_b = document.getElementById("funcCompareFiles")) === null || _b === void 0 ? void 0 : _b.files;
            if (!files || files.length === 0) {
                showAlert("⚠ แจ้งเตือน", "กรุณาแนบไฟล์เปรียบเทียบราคา (Part 5)");
                return false;
            }
        }
        // Part 6
        const amount = document.getElementById("funcAmountInput");
        if (!(amount === null || amount === void 0 ? void 0 : amount.value.trim())) {
            showAlert("⚠ แจ้งเตือน", "กรุณากรอกจำนวนเงิน (Part 6)");
            amount === null || amount === void 0 ? void 0 : amount.focus();
            return false;
        }
        return true;
    }
    // =====================
    // Validate Legal Form
    // =====================
    function validateLegalForm() {
        var _a, _b;
        // Request By
        const requestBy = (_a = document.getElementById("legalRequestBy")) === null || _a === void 0 ? void 0 : _a.value.trim();
        if (!requestBy) {
            showAlert("⚠ แจ้งเตือน", "กรุณากรอก Request By");
            return false;
        }
        // Part 1
        const part1Fields = ["legalSubject", "legalDateFrom", "legalDateTo", "legalTimeFrom", "legalTimeTo", "legalPlace", "legalInstitute"];
        for (const id of part1Fields) {
            const el = document.getElementById(id);
            if (!(el === null || el === void 0 ? void 0 : el.value.trim())) {
                showAlert("⚠ แจ้งเตือน", `กรุณากรอกข้อมูลให้ครบถ้วน Part 1 `);
                el === null || el === void 0 ? void 0 : el.focus();
                return false;
            }
        }
        // Part 2
        const concernLaw = document.getElementById("legalConcernLaw");
        if (!(concernLaw === null || concernLaw === void 0 ? void 0 : concernLaw.value.trim())) {
            showAlert("⚠ แจ้งเตือน", "กรุณากรอกข้อกฎหมายที่เกี่ยวข้อง (Part 2)");
            concernLaw === null || concernLaw === void 0 ? void 0 : concernLaw.focus();
            return false;
        }
        // Part 3
        const objective = document.querySelector("#legalObjectiveList input[name='legalObjective[]']");
        if (!(objective === null || objective === void 0 ? void 0 : objective.value.trim())) {
            showAlert("⚠ แจ้งเตือน", "กรุณากรอกวัตถุประสงค์ (Part 3)");
            objective === null || objective === void 0 ? void 0 : objective.focus();
            return false;
        }
        // Part 4
        const traineeCode = document.getElementById("legalCode");
        if (!(traineeCode === null || traineeCode === void 0 ? void 0 : traineeCode.value.trim())) {
            showAlert("⚠ แจ้งเตือน", "กรุณากรอกรหัสพนักงาน (Part 4)");
            traineeCode === null || traineeCode === void 0 ? void 0 : traineeCode.focus();
            return false;
        }
        // Part 5
        const part5Fields = ["legalName", "legalPosition", "legalSec", "legalDept", "legalDiv"];
        for (const id of part5Fields) {
            const el = document.getElementById(id);
            if (!(el === null || el === void 0 ? void 0 : el.value.trim())) {
                showAlert("⚠ แจ้งเตือน", `กรุณากรอกข้อมูล Part 5 (${id})`);
                el === null || el === void 0 ? void 0 : el.focus();
                return false;
            }
        }
        // Part 6
        const expenseOption = document.querySelector("input[name='legalExpenseOption']:checked");
        if (!expenseOption) {
            showAlert("⚠ แจ้งเตือน", "กรุณาเลือก Part 6 (ค่าใช้จ่าย)");
            return false;
        }
        if (expenseOption.value === "not_compare") {
            const reason = document.querySelector("input[name='legalReason']:checked");
            if (!reason) {
                showAlert("⚠ แจ้งเตือน", "กรุณาเลือกเหตุผล (Part 6)");
                return false;
            }
            if (reason.value === "other") {
                const reasonText = document.getElementById("legalReasonText");
                if (!(reasonText === null || reasonText === void 0 ? void 0 : reasonText.value.trim())) {
                    showAlert("⚠ แจ้งเตือน", "กรุณาระบุเหตุผลอื่น (Part 6)");
                    reasonText === null || reasonText === void 0 ? void 0 : reasonText.focus();
                    return false;
                }
            }
        }
        else if (expenseOption.value === "compare") {
            const files = (_b = document.getElementById("legalCompareFiles")) === null || _b === void 0 ? void 0 : _b.files;
            if (!files || files.length === 0) {
                showAlert("⚠ แจ้งเตือน", "กรุณาแนบไฟล์เปรียบเทียบราคา (Part 6)");
                return false;
            }
        }
        // Part 7
        const amount = document.getElementById("legalAmount");
        if (!(amount === null || amount === void 0 ? void 0 : amount.value.trim())) {
            showAlert("⚠ แจ้งเตือน", "กรุณากรอกจำนวนเงิน (Part 7)");
            amount === null || amount === void 0 ? void 0 : amount.focus();
            return false;
        }
        return true;
    }
    // =====================
    // Validate Meth Form
    // =====================
    function validateMethForm() {
        var _a, _b;
        // Request By
        const requestBy = (_a = document.getElementById("methRequestBy")) === null || _a === void 0 ? void 0 : _a.value.trim();
        if (!requestBy) {
            showAlert("⚠ แจ้งเตือน", "กรุณากรอก Request By");
            return false;
        }
        // Part 1
        const part1Fields = ["methSubject", "methDateFrom", "methDateTo", "methTimeFrom", "methTimeTo", "methPlace", "methInstitute"];
        for (const id of part1Fields) {
            const el = document.getElementById(id);
            if (!(el === null || el === void 0 ? void 0 : el.value.trim())) {
                showAlert("⚠ แจ้งเตือน", `กรุณากรอกข้อมูลให้ครบถ้วน Part 1 `);
                el === null || el === void 0 ? void 0 : el.focus();
                return false;
            }
        }
        // Part 2
        const objective = document.querySelector("#methObjectiveList input[name='methObjective[]']");
        if (!(objective === null || objective === void 0 ? void 0 : objective.value.trim())) {
            showAlert("⚠ แจ้งเตือน", "กรุณากรอกวัตถุประสงค์ (Part 2)");
            objective === null || objective === void 0 ? void 0 : objective.focus();
            return false;
        }
        // Part 3
        const expectation = document.querySelector("#methExpectationList input[name='methExpectation[]']");
        if (!(expectation === null || expectation === void 0 ? void 0 : expectation.value.trim())) {
            showAlert("⚠ แจ้งเตือน", "กรุณากรอกความคาดหวัง / ประโยชน์ (Part 3)");
            expectation === null || expectation === void 0 ? void 0 : expectation.focus();
            return false;
        }
        // Part 4
        const part4Fields = ["methCode", "methName", "methPosition", "methSec", "methDept", "methDiv"];
        for (const id of part4Fields) {
            const el = document.getElementById(id);
            if (!(el === null || el === void 0 ? void 0 : el.value.trim())) {
                showAlert("⚠ แจ้งเตือน", `กรุณากรอกข้อมูล Part 4 (${id})`);
                el === null || el === void 0 ? void 0 : el.focus();
                return false;
            }
        }
        // Part 5
        const expenseOption = document.querySelector("input[name='methExpenseOption']:checked");
        if (!expenseOption) {
            showAlert("⚠ แจ้งเตือน", "กรุณาเลือก Part 5 (ค่าใช้จ่าย)");
            return false;
        }
        if (expenseOption.value === "not_compare") {
            const reason = document.querySelector("input[name='methReason']:checked");
            if (!reason) {
                showAlert("⚠ แจ้งเตือน", "กรุณาเลือกเหตุผล (Part 5)");
                return false;
            }
            if (reason.value === "other") {
                const reasonText = document.getElementById("methReasonText");
                if (!(reasonText === null || reasonText === void 0 ? void 0 : reasonText.value.trim())) {
                    showAlert("⚠ แจ้งเตือน", "กรุณาระบุเหตุผลอื่น (Part 5)");
                    reasonText === null || reasonText === void 0 ? void 0 : reasonText.focus();
                    return false;
                }
            }
        }
        else if (expenseOption.value === "compare") {
            const files = (_b = document.getElementById("methCompareFiles")) === null || _b === void 0 ? void 0 : _b.files;
            if (!files || files.length === 0) {
                showAlert("⚠ แจ้งเตือน", "กรุณาแนบไฟล์เปรียบเทียบราคา (Part 5)");
                return false;
            }
        }
        // Part 6
        const amount = document.getElementById("methAmount");
        if (!(amount === null || amount === void 0 ? void 0 : amount.value.trim())) {
            showAlert("⚠ แจ้งเตือน", "กรุณากรอกจำนวนเงิน (Part 6)");
            amount === null || amount === void 0 ? void 0 : amount.focus();
            return false;
        }
        return true;
    }
    // =====================
    // เรียกตอนโหลดครั้งแรก
    // =====================
    toggleSubmit();
});
