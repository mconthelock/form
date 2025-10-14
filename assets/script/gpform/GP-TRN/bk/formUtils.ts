// Toggle ปุ่ม submit
export function toggleSubmit(trainingType: HTMLSelectElement | null, submitBtn: HTMLButtonElement | null) {
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
export function populateSelect(selectEl: HTMLSelectElement | null, start: number, end: number) {
    if (!selectEl) return;
    selectEl.innerHTML = "";
    for (let i = start; i <= end; i++) {
        const opt = document.createElement("option");
        opt.value = i.toString().padStart(2, "0");
        opt.textContent = i.toString().padStart(2, "0");
        selectEl.appendChild(opt);
    }
}

// Dynamic list objective/expectation
export function bindDynamicList(
    listId: string, 
    inputName: string, 
    placeholder: string, 
    type: "objective" | "expectation"
) {
    const list = document.getElementById(listId);

    list?.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;

        if (target.classList.contains(`add-${type}`)) {
            const newRow = document.createElement("div");
            newRow.className = `flex items-center gap-2 ${type}-item`;
            newRow.innerHTML = `
                <input type="text" name="${inputName}[]" 
                       placeholder="${placeholder}" 
                       class="input input-bordered w-full"
                       data-alert="กรุณากรอก${type === "objective" ? "วัตถุประสงค์" : "ความคาดหวัง"}">
                <button type="button" class="btn btn-sm bg-red-500 text-white remove-${type}">–</button>
            `;
            list.appendChild(newRow);
        } 
        
        else if (target.classList.contains(`remove-${type}`)) {
            target.closest(`.${type}-item`)?.remove();
        }
    });
}
