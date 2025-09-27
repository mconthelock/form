"use strict";

document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 init Legal Form");

    // =====================
    // ฟังก์ชันช่วย reset ลำดับแถว
    // =====================
    function resetRowIndex() {
        document.querySelectorAll("#legal_participants .participant-row").forEach((row, i) => {
            const idxEl = row.querySelector(".row-index");
            if (idxEl) idxEl.textContent = i + 1;
        });
    }

    // =====================
    // ฟังก์ชัน bind พนักงาน lookup
    // =====================
    function bindRow(row) {
        const empInput = row.querySelector(".empno-input");
        if (empInput) {
            bindEmpLookup(empInput, {
                SNAME: row.querySelector(".emp-name"),
                SPOSITION: row.querySelector(".emp-pos"),
                SSEC: row.querySelector(".emp-sec"),
                SDEPT: row.querySelector(".emp-dept"),
                SDIV: row.querySelector(".emp-div")
            });
        }
    }

    // =====================
    // bind แถวแรก
    // =====================
    document.querySelectorAll("#legal_participants .participant-row").forEach(row => bindRow(row));

    // =====================
    // ปุ่มเพิ่มผู้เข้าร่วม
    // =====================
    const addBtn = document.getElementById("add-participant");
    if (addBtn) {
        addBtn.addEventListener("click", () => {
            const tbody = document.querySelector("#legal_participants tbody");
            const firstRow = tbody.querySelector(".participant-row");
            if (!firstRow) return;

            const newRow = firstRow.cloneNode(true);

            // reset ค่า input และ text
            newRow.querySelectorAll("input").forEach(el => el.value = "");
            newRow.querySelectorAll("span").forEach(el => el.textContent = "");

            tbody.appendChild(newRow);
            resetRowIndex();
            bindRow(newRow);
        });
    }

    // =====================
    // Back button
    // =====================
    const backBtnLegal = document.getElementById("backBtn_legal");
    if (backBtnLegal) {
        backBtnLegal.addEventListener("click", () => {
            const form = document.getElementById("form_legal");
            if (form) form.classList.add("hidden");

            const requestForm = document.getElementById("requestForm");
            const selectCard = document.getElementById("selectCard");
            const trainingType = document.getElementById("trainingType");
            const detailBox = document.getElementById("detailBox");

            if (requestForm) requestForm.classList.add("hidden");
            if (selectCard) selectCard.classList.remove("hidden");
            if (trainingType) trainingType.value = "";
            if (detailBox) detailBox.classList.add("hidden");

            toggleSubmit(trainingType, document.getElementById("submitBtn"));
        });
    }
});
