"use strict";

// ✅ import เดิมเปลี่ยนเป็นการอ้างอิง global function ที่คุณต้อง include แยกไว้ในไฟล์อื่น
// เช่น alert.js, formUtils.js, validators.js, initForms.js, form.js, _form.js
// <script src="alert.js"></script>
// <script src="formUtils.js"></script>
// <script src="validators.js"></script>
// <script src="initForms.js"></script>
// <script src="form.js"></script>
// <script src="_form.js"></script>

// Loader helper
function showLoader() {
    const el = document.getElementById("loaderOverlay");
    if (el) el.classList.remove("hidden");
}
function hideLoader() {
    const el = document.getElementById("loaderOverlay");
    if (el) el.classList.add("hidden");
}

// ฟังก์ชันรวมใช้ได้ทุกฟอร์ม
function buildFormDataGeneric(headResult, fid, prefix) {
    const fd = new FormData();
    fd.append("PREFIX", prefix);
    fd.append("NFRMNO", headResult.data.NFRMNO);
    fd.append("VORGNO", headResult.data.VORGNO);
    fd.append("CYEAR", headResult.data.CYEAR);
    fd.append("CYEAR2", headResult.data.CYEAR2);
    fd.append("NRUNNO", headResult.data.NRUNNO);
    fd.append("FID", fid);

    const getVal = (id, def = "") => {
        const el = document.getElementById(`${prefix}${id}`);
        return (el && el.value) || def;
    };

    fd.append("SUBJECT", getVal("TrainingSubject"));
    const dateFrom = getVal("DateFrom");
    if (dateFrom) fd.append("DATE_FROM", dateFrom.replace(/-/g, ""));
    const dateTo = getVal("DateTo");
    if (dateTo) fd.append("DATE_TO", dateTo.replace(/-/g, ""));

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

    // Radio
    const expenseOption = (document.querySelector(`input[name='${prefix}ExpenseOption']:checked`) || {}).value || "";
    fd.append("TRN_EXPENSE_STATUS", expenseOption);

    const reason = (document.querySelector(`input[name='${prefix}Reason']:checked`) || {}).value || "";
    fd.append("TRN_EXPENSE_REASON", reason);
    fd.append("TRN_EXPENSE_OTHER", getVal("ReasonOtherText"));

    // Arrays
    document.querySelectorAll(`input[name='${prefix}Objective[]']`).forEach(el => {
        if (el.value.trim()) fd.append(`${prefix}Objective[]`, el.value.trim());
    });
    document.querySelectorAll(`input[name='${prefix}Expectation[]']`).forEach(el => {
        if (el.value.trim()) fd.append(`${prefix}Expectation[]`, el.value.trim());
    });

    const compareFiles = document.getElementById(`${prefix}CompareFiles`)?.files;
    if (compareFiles) {
        for (let i = 0; i < compareFiles.length; i++) {
            fd.append(`${prefix}CompareFiles[]`, compareFiles[i]);
        }
    }

    // Special Case By Form
    switch (prefix) {
        case "func":
            fd.append("JD_NAME", getVal("JdName"));
            fd.append("JD_DESC", getVal("JdRelation"));
            const jdFiles = document.getElementById(`${prefix}JdFiles`)?.files;
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
            // fd.append("METHOD", getVal("methMethod"));
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
    } catch {
        console.error("❌ Response is not JSON:", text);
        throw new Error("Invalid JSON response");
    }
}

document.addEventListener("DOMContentLoaded", () => {
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

    trainingType?.addEventListener("change", () => {
        const val = trainingType.value;
        if (details[val]) {
            if (detailTitle) detailTitle.textContent = details[val].title;
            if (detailDesc) detailDesc.textContent = details[val].desc;
            detailBox?.classList.remove("hidden");
        } else {
            detailBox?.classList.add("hidden");
        }
        toggleSubmit(trainingType, submitBtn);
    });

    // ปุ่มไปยังแบบฟอร์ม
    submitBtn?.addEventListener("click", () => {
        const val = trainingType?.value;
        if (!val) {
            showAlert("⚠ แจ้งเตือน", "กรุณาเลือกประเภทการฝึกอบรมก่อน !!");
            return;
        }
        selectCard?.classList.add("hidden");
        document.querySelectorAll("#requestForm > div").forEach(div => div.classList.add("hidden"));

        const selectedForm = document.getElementById("form_" + val);
        if (selectedForm) {
            requestForm?.classList.remove("hidden");
            selectedForm.classList.remove("hidden");
            if (val === "functional") initFunctionalForm();
            if (val === "legal") initLegalForm();
            if (val === "meth") initMethForm();
        }
    });

    // … (โค้ด submitForm, handleFormSubmit และ bindDynamicList เหมือนเดิม แค่ตัด require ออก)
});
