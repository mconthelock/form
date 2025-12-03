

export function toggleSubmit(trainingType, submitBtn) {
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

export function populateSelect(selectEl, start, end) {
    if (!selectEl) return;
    selectEl.innerHTML = "";
    for (let i = start; i <= end; i++) {
        const opt = document.createElement("option");
        opt.value = i.toString().padStart(2, "0");
        opt.textContent = i.toString().padStart(2, "0");
        selectEl.appendChild(opt);
    }
}

export function showAlert(title, message) {
    const modal = document.getElementById("alertModal");
    const titleEl = document.getElementById("alertTitle");
    const messageEl = document.getElementById("alertMessage");

    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.textContent = message;

    if (modal && typeof modal.showModal === "function") {
        modal.showModal();
    } else {
        // fallback ถ้า browser ไม่รองรับ <dialog>
        alert(`${title}\n\n${message}`);
    }
}
