import { showAlert } from "./alert.js";
import { toggleSubmit, bindDynamicList } from "./formUtils.js";
import { validateFunctionalForm, validateLegalForm, validateMethForm } from "./validators.js";
import { initFunctionalForm, initLegalForm, initMethForm, initBackButtons } from "./initForms.js";
import { createForm } from "../../api/webform/form.js";
document.addEventListener("DOMContentLoaded", () => {
    var _a, _b, _c;
    const trainingType = document.getElementById("trainingType");
    const submitBtn = document.getElementById("submitBtn");
    const selectCard = document.getElementById("selectCard");
    const requestForm = document.getElementById("requestForm");
    const detailBox = document.getElementById("detailBox");
    const detailTitle = document.getElementById("detailTitle");
    const detailDesc = document.getElementById("detailDesc");
    // 👉 ส่ง element เข้าไปให้ initForms ใช้
    initBackButtons(trainingType, selectCard, requestForm, detailBox);
    const details = {
        functional: { title: "Support Specific Functional Competency", desc: "ฟอร์มสำหรับฝึกอบรมเพื่อพัฒนาสมรรถนะเฉพาะทาง" },
        legal: { title: "Support Legal Requirement", desc: "ฟอร์มสำหรับฝึกอบรมที่เกี่ยวข้องกับข้อกำหนดทางกฎหมาย" },
        meth: { title: "Support ME-TH Training subject", desc: "ฟอร์มสำหรับหัวข้อการฝึกอบรม ME-TH" },
    };
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
        toggleSubmit(trainingType, submitBtn);
    });
    // Event ปุ่ม "ไปยังแบบฟอร์ม"
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
            if (val === "functional")
                initFunctionalForm();
            if (val === "legal")
                initLegalForm();
            if (val === "meth")
                initMethForm();
        }
    });
    // ✅ ฟังก์ชันส่งฟอร์มจริง (เรียก API)
    async function submitForm(formType, reqby, inputby) {
        var _a, _b, _c, _d, _e, _f;
        try {
            const nfrmno = ((_b = (_a = document.getElementById("NFRMNO")) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.trim()) || "";
            const vorgno = ((_d = (_c = document.getElementById("VORGNO")) === null || _c === void 0 ? void 0 : _c.value) === null || _d === void 0 ? void 0 : _d.trim()) || "";
            const cyear = ((_f = (_e = document.getElementById("CYEAR")) === null || _e === void 0 ? void 0 : _e.value) === null || _f === void 0 ? void 0 : _f.trim()) || "";
            // ✅ ตรวจสอบ required fields
            if (!nfrmno || !vorgno || !cyear || !(reqby === null || reqby === void 0 ? void 0 : reqby.trim()) || !(inputby === null || inputby === void 0 ? void 0 : inputby.trim())) {
                showAlert("⚠ แจ้งเตือน", "กรุณากรอกข้อมูลให้ครบถ้วน (NFRMNO, VORGNO, CYEAR, Request By, Input By)");
                return;
            }
            const formData = {
                NFRMNO: nfrmno,
                VORGNO: vorgno,
                CYEAR: cyear,
                REQBY: reqby.trim(),
                INPUTBY: inputby.trim(),
                REMARK: "",
                DRAFT: "0", // 0 = เตรียม, 1 = รออนุมัติ
            };
            const result = await createForm(formData);
            console.log(`[${formType}] Form created successfully:`, result);
            showAlert("✅ สำเร็จ", `ฟอร์ม ${formType} ส่งเรียบร้อยแล้ว`);
        }
        catch (err) {
            console.error(`[${formType}] Error creating form:`, err);
            showAlert("❌ ล้มเหลว", `ฟอร์ม ${formType} ส่งไม่สำเร็จ`);
        }
    }
    // Event ปุ่มส่งฟอร์ม
    (_a = document.getElementById("sendFuncFormBtn")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
        var _a, _b;
        if (validateFunctionalForm()) {
            const reqby = ((_a = document.getElementById("funcRequestBy")) === null || _a === void 0 ? void 0 : _a.value) || "";
            const inputby = ((_b = document.getElementById("funcInputBy")) === null || _b === void 0 ? void 0 : _b.value) || "";
            submitForm("functional", reqby, inputby);
        }
    });
    (_b = document.getElementById("sendLegalFormBtn")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
        var _a, _b;
        if (validateLegalForm()) {
            const reqby = ((_a = document.getElementById("legalRequestBy")) === null || _a === void 0 ? void 0 : _a.value) || "";
            const inputby = ((_b = document.getElementById("legalInputBy")) === null || _b === void 0 ? void 0 : _b.value) || "";
            submitForm("legal", reqby, inputby);
        }
    });
    (_c = document.getElementById("sendMethFormBtn")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => {
        var _a, _b;
        if (validateMethForm()) {
            const reqby = ((_a = document.getElementById("methRequestBy")) === null || _a === void 0 ? void 0 : _a.value) || "";
            const inputby = ((_b = document.getElementById("methInputBy")) === null || _b === void 0 ? void 0 : _b.value) || "";
            submitForm("meth", reqby, inputby);
        }
    });
    // Initial
    toggleSubmit(trainingType, submitBtn);
    // ใช้งาน bindDynamicList ได้เหมือนเดิม
    bindDynamicList("funcObjectiveList", "funcObjective", "ระบุวัตถุประสงค์...", "objective");
    bindDynamicList("funcExpectationList", "funcExpectation", "ระบุความคาดหวัง / ประโยชน์...", "expectation");
    bindDynamicList("legalObjectiveList", "legalObjective", "ระบุวัตถุประสงค์...", "objective");
    bindDynamicList("legalExpectationList", "legalExpectation", "ระบุความคาดหวัง / ประโยชน์...", "expectation");
    bindDynamicList("methObjectiveList", "methObjective", "ระบุวัตถุประสงค์...", "objective");
    bindDynamicList("methExpectationList", "methExpectation", "ระบุความคาดหวัง / ประโยชน์...", "expectation");
});
