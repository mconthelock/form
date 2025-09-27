"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const trainingType = document.getElementById("trainingType");
    const submitBtn = document.getElementById("submitBtn");
    const selectCard = document.getElementById("selectCard");
    const requestForm = document.getElementById("requestForm");
    const detailBox = document.getElementById("detailBox");
    const detailTitle = document.getElementById("detailTitle");
    const detailDesc = document.getElementById("detailDesc");

    const details = {
        functional: {
            title: "Support Specific Functional Competency",
            desc: "ฟอร์มสำหรับฝึกอบรมเพื่อพัฒนาสมรรถนะเฉพาะทาง"
        },
        legal: {
            title: "Support Legal Requirement",
            desc: "ฟอร์มสำหรับฝึกอบรมที่เกี่ยวข้องกับข้อกำหนดทางกฎหมาย"
        },
        meth: {
            title: "Support ME-TH Training subject",
            desc: "ฟอร์มสำหรับหัวข้อการฝึกอบรม ME-TH"
        }
    };

    // Dropdown change
    trainingType?.addEventListener("change", () => {
        const val = trainingType.value;
        if (details[val]) {
            detailTitle.textContent = details[val].title;
            detailDesc.textContent = details[val].desc;
            detailBox.classList.remove("hidden");
        } else {
            detailBox.classList.add("hidden");
        }
        toggleSubmit(trainingType, submitBtn);
    });

    // Submit select type
    submitBtn?.addEventListener("click", () => {
        const val = trainingType.value;
        if (!val) {
            showAlert("⚠ แจ้งเตือน", "กรุณาเลือกประเภทการฝึกอบรมก่อน !!");
            return;
        }

        selectCard.classList.add("hidden");
        document.querySelectorAll("#requestForm > div").forEach(div => div.classList.add("hidden"));

        const selectedForm = document.getElementById("form_" + val);
        if (selectedForm) {
            requestForm.classList.remove("hidden");
            selectedForm.classList.remove("hidden");

           // หลังจากเปิดฟอร์ม
            if (val === "functional") initFunctionalForm();
            if (val === "legal") initLegalForm();
            if (val === "meth") initMethForm();

            // ✅ bind ปุ่มต่าง ๆ
            initButtons(trainingType, selectCard, requestForm, detailBox);
        }
    });

    toggleSubmit(trainingType, submitBtn);
});
