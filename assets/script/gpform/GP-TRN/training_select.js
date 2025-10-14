
import { initLegalForm } from "./training_legal.js";
import { initFunctionalForm } from "./training_functional.js";
import { initMethForm } from "./training_meth.js";
import { toggleSubmit, showAlert } from "./formUtils.js";
import { initFormButtons } from "./training_main.js";   // ✅ เรียกใช้ปุ่มจาก main.js

console.log(process.env.APP_API);
// ================
// 🔹 Dynamic List
// ================
function bindDynamicList(containerId, listId, addClass, removeClass) {
    const container = document.getElementById(containerId);
    if (!container || container.dataset.bound) return;

    container.addEventListener("click", e => {
        if (e.target.classList.contains(addClass)) {
            const list = document.getElementById(listId);
            if (!list) return;
            const template = list.firstElementChild;
            if (!template) return;

            const newItem = template.cloneNode(true);
            newItem.querySelectorAll("input").forEach(inp => inp.value = "");

            const btn = newItem.querySelector("button");
            if (btn) {
                btn.classList.remove(addClass, "bg-green-500");
                btn.classList.add(removeClass, "bg-red-500");
                btn.textContent = "−";
            }
            list.appendChild(newItem);
        }

        if (e.target.classList.contains(removeClass)) {
            const row = e.target.closest(".objective-item, .expectation-item");
            if (row) row.remove();
        }
    });

    container.dataset.bound = "1";
}

// ================
// 🔹 Main
// ================
document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ training_select.js loaded");

    const trainingType = document.getElementById("trainingType");
    const submitBtn    = document.getElementById("submitBtn");
    const selectCard   = document.getElementById("selectCard");
    const requestForm  = document.getElementById("requestForm");
    const detailBox    = document.getElementById("detailBox");
    const detailTitle  = document.getElementById("detailTitle");
    const detailDesc   = document.getElementById("detailDesc");

    const details = {
        functional: { title: "Support Specific Functional Competency", desc: "ฟอร์ม Functional" },
        legal: { title: "Support Legal Requirement", desc: "ฟอร์ม Legal" },
        meth: { title: "Support ME-TH Training subject", desc: "ฟอร์ม Meth" },
    };

    // 🔹 Bind Dynamic List
    bindDynamicList("func_part2", "funcObjectiveList", "add-objective", "remove-objective");
    bindDynamicList("func_part3", "funcExpectationList", "add-expectation", "remove-expectation");
    bindDynamicList("legal_part3", "legalObjectiveList", "add-objective", "remove-objective");
    bindDynamicList("legal_part4", "legalExpectationList", "add-expectation", "remove-expectation");
    bindDynamicList("meth_part2", "methObjectiveList", "add-objective", "remove-objective");
    bindDynamicList("meth_part3", "methExpectationList", "add-expectation", "remove-expectation");

    // 🔹 เมื่อเปลี่ยน dropdown
    trainingType?.addEventListener("change", () => {
        const val = trainingType.value;
        if (details[val]) {
            detailTitle.textContent = details[val].title;
            detailDesc.textContent  = details[val].desc;
            detailBox.classList.remove("hidden");
        } else {
            detailBox.classList.add("hidden");
        }
        toggleSubmit(trainingType, submitBtn);
    });

    // 🔹 ปุ่ม "ไปยังแบบฟอร์ม"
    submitBtn?.addEventListener("click", () => {
        const val = trainingType.value;
        if (!val) {
            showAlert("⚠ แจ้งเตือน", "กรุณาเลือกประเภทการฝึกอบรมก่อน !!");
            return;
        }

        console.log("▶ เปิดฟอร์ม:", val);

        selectCard.classList.add("hidden");
        document.querySelectorAll("#requestForm > div").forEach(div => div.classList.add("hidden"));

        const selectedForm = document.getElementById("form_" + val);
        if (selectedForm) {
            requestForm.classList.remove("hidden");
            selectedForm.classList.remove("hidden");

            if (val === "functional" && !selectedForm.dataset.inited) {
                initFunctionalForm();
                selectedForm.dataset.inited = "1";
            }
            if (val === "legal" && !selectedForm.dataset.inited) {
                initLegalForm();
                selectedForm.dataset.inited = "1";
            }
            if (val === "meth" && !selectedForm.dataset.inited) {
                initMethForm();
                selectedForm.dataset.inited = "1";
            }

            // ✅ bind ปุ่ม back & send หลังจากฟอร์มแสดงแล้ว
            initFormButtons(val);
        }
    });

    // init
    toggleSubmit(trainingType, submitBtn);
});
