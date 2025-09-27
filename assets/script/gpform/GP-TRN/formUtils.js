"use strict";

// เปิด/ปิดปุ่ม submit
function toggleSubmit(trainingType, submitBtn) {
    if (!trainingType || !submitBtn) return;
    if (trainingType.value === "") {
        submitBtn.disabled = true;
        submitBtn.classList.remove("bg-indigo-600", "hover:bg-indigo-700", "cursor-pointer");
        submitBtn.classList.add("bg-indigo-400", "cursor-not-allowed");
    } else {
        submitBtn.disabled = false;
        submitBtn.classList.remove("bg-indigo-400", "cursor-not-allowed");
        submitBtn.classList.add("bg-indigo-600", "hover:bg-indigo-700", "cursor-pointer");
    }
}

// เติม select option
function populateSelect(selectEl, start, end) {
    if (!selectEl) return;
    selectEl.innerHTML = "";
    for (let i = start; i <= end; i++) {
        const opt = document.createElement("option");
        opt.value = i.toString().padStart(2, "0");
        opt.textContent = i.toString().padStart(2, "0");
        selectEl.appendChild(opt);
    }
}

// Alert Modal
function showAlert(title, message) {
    const modal = document.getElementById("alertModal");
    if (!modal) return;

    document.getElementById("alertTitle").textContent = title;
    document.getElementById("alertMessage").textContent = message;
    modal.showModal();
}
