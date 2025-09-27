"use strict";

/**
 * ใช้สำหรับ bind ปุ่มต่าง ๆ เช่น back, save, submit, add/remove row
 * @param {HTMLElement} trainingType 
 * @param {HTMLElement} selectCard 
 * @param {HTMLElement} requestForm 
 * @param {HTMLElement} detailBox 
 */
function initButtons(trainingType, selectCard, requestForm, detailBox) {

    // =========================
    // 🔙 Back Buttons
    // =========================
    const backBtnFunctional = document.getElementById("backBtn_func");
    if (backBtnFunctional) {
        backBtnFunctional.addEventListener("click", () => {
            console.log("👉 Back from Functional");
            document.getElementById("form_functional")?.classList.add("hidden");
            requestForm?.classList.add("hidden");
            selectCard?.classList.remove("hidden");
            if (trainingType) trainingType.value = "";
            detailBox?.classList.add("hidden");
            toggleSubmit(trainingType, document.getElementById("submitBtn"));
        });
    }

    const backBtnLegal = document.getElementById("backBtn_legal");
    if (backBtnLegal) {
        backBtnLegal.addEventListener("click", () => {
            console.log("👉 Back from Legal");
            document.getElementById("form_legal")?.classList.add("hidden");
            requestForm?.classList.add("hidden");
            selectCard?.classList.remove("hidden");
            if (trainingType) trainingType.value = "";
            detailBox?.classList.add("hidden");
            toggleSubmit(trainingType, document.getElementById("submitBtn"));
        });
    }

    const backBtnMeth = document.getElementById("backBtn_meth");
    if (backBtnMeth) {
        backBtnMeth.addEventListener("click", () => {
            console.log("👉 Back from Meth");
            document.getElementById("form_meth")?.classList.add("hidden");
            requestForm?.classList.add("hidden");
            selectCard?.classList.remove("hidden");
            if (trainingType) trainingType.value = "";
            detailBox?.classList.add("hidden");
            toggleSubmit(trainingType, document.getElementById("submitBtn"));
        });
    }

    // =========================
    // 💾 Save / ❌ Cancel (optional)
    // =========================
    const saveBtn = document.getElementById("saveBtn");
    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            console.log("💾 Save clicked");
            showAlert("💾 บันทึก", "กำลังพัฒนา...");
        });
    }

    const cancelBtn = document.getElementById("cancelBtn");
    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
            console.log("❌ Cancel clicked");
            showAlert("❌ ยกเลิก", "กำลังพัฒนา...");
        });
    }

    // =========================
    // 📤 Submit Buttons
    // =========================
    const sendFuncFormBtn = document.getElementById("sendFuncFormBtn");
    if (sendFuncFormBtn) {
        sendFuncFormBtn.addEventListener("click", () => {
            console.log("📤 Send Functional Form");
            if (validateFunctionalForm()) {
                showAlert("✅ สำเร็จ", "ฟอร์ม Functional กรอกครบแล้ว พร้อมส่ง!");
                // TODO: ส่งข้อมูลไป backend ที่นี่
            }
        });
    }

    const sendLegalFormBtn = document.getElementById("sendLegalFormBtn");
    if (sendLegalFormBtn) {
        sendLegalFormBtn.addEventListener("click", () => {
            console.log("📤 Send Legal Form");
            if (validateLegalForm()) {
                showAlert("✅ สำเร็จ", "ฟอร์ม Legal กรอกครบแล้ว พร้อมส่ง!");
                // TODO: ส่งข้อมูลไป backend ที่นี่
            }
        });
    }

    const sendMethFormBtn = document.getElementById("sendMethFormBtn");
    if (sendMethFormBtn) {
        sendMethFormBtn.addEventListener("click", () => {
            console.log("📤 Send Meth Form");
            if (validateMethForm()) {
                showAlert("✅ สำเร็จ", "ฟอร์ม Meth กรอกครบแล้ว พร้อมส่ง!");
                // TODO: ส่งข้อมูลไป backend ที่นี่
            }
        });
    }

    // =========================
    // ➕➖ Add / Remove Row
    // =========================
    document.body.addEventListener("click", e => {
        // Add Objective
        if (e.target.classList.contains("add-objective")) {
            const container = e.target.closest("div[id$='ObjectiveList']");
            const item = e.target.closest(".objective-item");
            if (!container || !item) return;

            const newItem = item.cloneNode(true);
            newItem.querySelector("input").value = "";

            // ปุ่มใหม่เปลี่ยนเป็นลบ
            const btn = newItem.querySelector("button");
            btn.textContent = "-";
            btn.classList.remove("add-objective");
            btn.classList.add("remove-objective", "bg-red-500");

            container.appendChild(newItem);
        }

        // Remove Objective
        if (e.target.classList.contains("remove-objective")) {
            const container = e.target.closest("div[id$='ObjectiveList']");
            const row = e.target.closest(".objective-item");
            if (!container || !row) return;

            if (container.querySelectorAll(".objective-item").length > 1) {
                row.remove();
            } else {
                console.log("⚠ ต้องมีอย่างน้อย 1 Objective");
            }
        }

        // Add Expectation
        if (e.target.classList.contains("add-expectation")) {
            const container = e.target.closest("div[id$='ExpectationList']");
            const item = e.target.closest(".expectation-item");
            if (!container || !item) return;

            const newItem = item.cloneNode(true);
            newItem.querySelector("input").value = "";

            // ปุ่มใหม่เปลี่ยนเป็นลบ
            const btn = newItem.querySelector("button");
            btn.textContent = "-";
            btn.classList.remove("add-expectation");
            btn.classList.add("remove-expectation", "bg-red-500");

            container.appendChild(newItem);
        }

        // Remove Expectation
        if (e.target.classList.contains("remove-expectation")) {
            const container = e.target.closest("div[id$='ExpectationList']");
            const row = e.target.closest(".expectation-item");
            if (!container || !row) return;

            if (container.querySelectorAll(".expectation-item").length > 1) {
                row.remove();
            } else {
                console.log("⚠ ต้องมีอย่างน้อย 1 Expectation");
            }
        }
    });
}
