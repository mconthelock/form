"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alert_js_1 = require("./alert.js");
const formUtils_js_1 = require("./formUtils.js");
const validators_js_1 = require("./validators.js");
const initForms_js_1 = require("./initForms.js");
const form_js_1 = require("../../api/webform/form.js");
const _form_js_1 = require("../../inc/_form.js");
// ✅ Loader helper
function showLoader() { var _a; (_a = document.getElementById("loaderOverlay")) === null || _a === void 0 ? void 0 : _a.classList.remove("hidden"); }
function hideLoader() { var _a; (_a = document.getElementById("loaderOverlay")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden"); }
// ✅ ฟังก์ชันรวมใช้ได้ทุกฟอร์ม
function buildFormDataGeneric(headResult, fid, prefix) {
    var _a, _b, _c, _d;
    const fd = new FormData();
    fd.append("PREFIX", prefix);
    fd.append("NFRMNO", headResult.data.NFRMNO);
    fd.append("VORGNO", headResult.data.VORGNO);
    fd.append("CYEAR", headResult.data.CYEAR);
    fd.append("CYEAR2", headResult.data.CYEAR2);
    fd.append("NRUNNO", headResult.data.NRUNNO);
    fd.append("FID", fid);
    // helper get value
    const getVal = (id, def = "") => { var _a; return ((_a = document.getElementById(`${prefix}${id}`)) === null || _a === void 0 ? void 0 : _a.value) || def; };
    // ✅ Mapping field
    fd.append("SUBJECT", getVal("TrainingSubject"));
    const dateFrom = getVal("DateFrom");
    if (dateFrom)
        fd.append("DATE_FROM", dateFrom.replace(/-/g, ""));
    const dateTo = getVal("DateTo");
    if (dateTo)
        fd.append("DATE_TO", dateTo.replace(/-/g, ""));
    const timeFromHour = getVal("TimeFromHour", "00");
    const timeFromMin = getVal("TimeFromMin", "00");
    fd.append("TIME_FROM", timeFromHour + timeFromMin);
    const timeToHour = getVal("TimeToHour", "00");
    const timeToMin = getVal("TimeToMin", "00");
    fd.append("TIME_TO", timeToHour + timeToMin);
    fd.append("PLACE", getVal("Location"));
    fd.append("INSTITUTION", getVal("Institute"));
    fd.append("TRAINEE_ID", getVal("TraineeCode"));
    fd.append("COST", getVal("AmountInput", "0"));
    fd.append("COST_NOTE", getVal("AmountNote"));
    // ✅ Radio
    const expenseOption = ((_a = document.querySelector(`input[name='${prefix}ExpenseOption']:checked`)) === null || _a === void 0 ? void 0 : _a.value) || "";
    fd.append("TRN_EXPENSE_STATUS", expenseOption);
    const reason = ((_b = document.querySelector(`input[name='${prefix}Reason']:checked`)) === null || _b === void 0 ? void 0 : _b.value) || "";
    fd.append("TRN_EXPENSE_REASON", reason);
    fd.append("TRN_EXPENSE_OTHER", getVal("ReasonOtherText"));
    // ✅ Arrays
    document.querySelectorAll(`input[name='${prefix}Objective[]']`).forEach(el => {
        if (el.value.trim())
            fd.append(`${prefix}Objective[]`, el.value.trim());
    });
    document.querySelectorAll(`input[name='${prefix}Expectation[]']`).forEach(el => {
        if (el.value.trim())
            fd.append(`${prefix}Expectation[]`, el.value.trim());
    });
    const compareFiles = (_c = document.getElementById(`${prefix}CompareFiles`)) === null || _c === void 0 ? void 0 : _c.files;
    if (compareFiles) {
        for (let i = 0; i < compareFiles.length; i++) {
            fd.append(`${prefix}CompareFiles[]`, compareFiles[i]);
        }
    }
    //Speical Case By Form
    switch (prefix) {
        case "func":
            fd.append("JD_NAME", getVal("JdName"));
            fd.append("JD_DESC", getVal("JdRelation"));
            const jdFiles = (_d = document.getElementById(`${prefix}JdFiles`)) === null || _d === void 0 ? void 0 : _d.files;
            if (jdFiles) {
                for (let i = 0; i < jdFiles.length; i++) {
                    fd.append(`${prefix}JdFiles[]`, jdFiles[i]);
                }
            }
            break;
        case "legal":
            fd.append("LAWS", getVal("legalConcernLaw"));
            break;
        case "meth":
            //fd.append("METHOD", getVal("methMethod"));
            break;
        default:
            console.warn(`Unhandled prefix: ${prefix}`);
    }
    return fd;
}
async function savedetailForm(formData) {
    const res = await fetch(`${mainUrl}/save_formcreate`, { method: "POST", body: formData });
    const text = await res.text();
    try {
        return JSON.parse(text);
    }
    catch (_a) {
        console.error("❌ Response is not JSON:", text);
        throw new Error("Invalid JSON response");
    }
}
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
    (0, initForms_js_1.initBackButtons)(trainingType, selectCard, requestForm, detailBox);
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
        (0, formUtils_js_1.toggleSubmit)(trainingType, submitBtn);
    });
    // Event ปุ่ม "ไปยังแบบฟอร์ม"
    submitBtn === null || submitBtn === void 0 ? void 0 : submitBtn.addEventListener("click", () => {
        const val = trainingType === null || trainingType === void 0 ? void 0 : trainingType.value;
        if (!val) {
            (0, alert_js_1.showAlert)("⚠ แจ้งเตือน", "กรุณาเลือกประเภทการฝึกอบรมก่อน !!");
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
                (0, initForms_js_1.initFunctionalForm)();
            if (val === "legal")
                (0, initForms_js_1.initLegalForm)();
            if (val === "meth")
                (0, initForms_js_1.initMethForm)();
        }
    });
    // ✅ ฟังก์ชันส่งฟอร์มจริง (เรียก API)
    async function submitForm(formType, reqby, inputby, fid) {
        var _a, _b, _c, _d, _e, _f;
        try {
            showLoader();
            const nfrmno = ((_b = (_a = document.getElementById("NFRMNO")) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.trim()) || "";
            const vorgno = ((_d = (_c = document.getElementById("VORGNO")) === null || _c === void 0 ? void 0 : _c.value) === null || _d === void 0 ? void 0 : _d.trim()) || "";
            const cyear = ((_f = (_e = document.getElementById("CYEAR")) === null || _e === void 0 ? void 0 : _e.value) === null || _f === void 0 ? void 0 : _f.trim()) || "";
            // ✅ ตรวจสอบ required fields
            if (!nfrmno || !vorgno || !cyear || !(reqby === null || reqby === void 0 ? void 0 : reqby.trim()) || !(inputby === null || inputby === void 0 ? void 0 : inputby.trim())) {
                hideLoader();
                (0, alert_js_1.showAlert)("⚠ แจ้งเตือน", "ข้อมูลไม่ครบถ้วน (NFRMNO, VORGNO, CYEAR, Request By, Input By)");
                return;
            }
            const formDatakey = {
                NFRMNO: nfrmno,
                VORGNO: vorgno,
                CYEAR: cyear,
                REQBY: reqby.trim(),
                INPUTBY: inputby.trim(),
                REMARK: "",
                DRAFT: "1", // 0 = เตรียม, 1 = รออนุมัติ
            };
            const headResult = await (0, form_js_1.createForm)(formDatakey);
            console.log(`[${formType}] Form created successfully:`, headResult);
            const formData = buildFormDataGeneric(headResult, fid, formType === "functional" ? "func" : formType);
            const saveResult = await savedetailForm(formData);
            hideLoader();
            if (saveResult.status !== "success") {
                (0, alert_js_1.showAlert)("❌ ล้มเหลว", saveResult.message || "ไม่สามารถบันทึกข้อมูลได้");
                return;
            }
            (0, alert_js_1.showAlert)("✅ สำเร็จ", `ฟอร์ม ${formType} ส่งเรียบร้อยแล้ว`);
            (0, _form_js_1.redirectWebflow)();
        }
        catch (err) {
            hideLoader();
            console.error(`[${formType}] Error creating form:`, err);
            (0, alert_js_1.showAlert)("❌ ล้มเหลว", `ฟอร์ม ${formType} ส่งไม่สำเร็จ`);
        }
    }
    async function handleFormSubmit(formType) {
        var _a, _b, _c, _d, _e, _f;
        let reqby = "";
        let inputby = "";
        let isValid = false;
        let fid = "";
        if (formType === "functional") {
            isValid = (0, validators_js_1.validateFunctionalForm)();
            reqby = ((_a = document.getElementById("funcRequestBy")) === null || _a === void 0 ? void 0 : _a.value) || "";
            inputby = ((_b = document.getElementById("funcInputBy")) === null || _b === void 0 ? void 0 : _b.value) || "";
            fid = '1';
        }
        else if (formType === "legal") {
            isValid = (0, validators_js_1.validateLegalForm)();
            reqby = ((_c = document.getElementById("legalRequestBy")) === null || _c === void 0 ? void 0 : _c.value) || "";
            inputby = ((_d = document.getElementById("legalInputBy")) === null || _d === void 0 ? void 0 : _d.value) || "";
            fid = '2';
        }
        else if (formType === "meth") {
            isValid = (0, validators_js_1.validateMethForm)();
            reqby = ((_e = document.getElementById("methRequestBy")) === null || _e === void 0 ? void 0 : _e.value) || "";
            inputby = ((_f = document.getElementById("methInputBy")) === null || _f === void 0 ? void 0 : _f.value) || "";
            fid = '3';
        }
        if (!isValid)
            return;
        await submitForm(formType, reqby, inputby, fid);
    }
    // Event ปุ่มส่งฟอร์ม
    (_a = document.getElementById("sendFuncFormBtn")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => handleFormSubmit("functional"));
    (_b = document.getElementById("sendLegalFormBtn")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => handleFormSubmit("legal"));
    (_c = document.getElementById("sendMethFormBtn")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => handleFormSubmit("meth"));
    // Initial
    (0, formUtils_js_1.toggleSubmit)(trainingType, submitBtn);
    // ใช้งาน bindDynamicList ได้เหมือนเดิม
    (0, formUtils_js_1.bindDynamicList)("funcObjectiveList", "funcObjective", "ระบุวัตถุประสงค์...", "objective");
    (0, formUtils_js_1.bindDynamicList)("funcExpectationList", "funcExpectation", "ระบุความคาดหวัง / ประโยชน์...", "expectation");
    (0, formUtils_js_1.bindDynamicList)("legalObjectiveList", "legalObjective", "ระบุวัตถุประสงค์...", "objective");
    (0, formUtils_js_1.bindDynamicList)("legalExpectationList", "legalExpectation", "ระบุความคาดหวัง / ประโยชน์...", "expectation");
    (0, formUtils_js_1.bindDynamicList)("methObjectiveList", "methObjective", "ระบุวัตถุประสงค์...", "objective");
    (0, formUtils_js_1.bindDynamicList)("methExpectationList", "methExpectation", "ระบุความคาดหวัง / ประโยชน์...", "expectation");
});
