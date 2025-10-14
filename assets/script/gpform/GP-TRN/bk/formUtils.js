"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleSubmit = toggleSubmit;
exports.populateSelect = populateSelect;
exports.bindDynamicList = bindDynamicList;
// Toggle ปุ่ม submit
function toggleSubmit(trainingType, submitBtn) {
    if (!trainingType || !submitBtn)
        return;
    if (trainingType.value === "") {
        submitBtn.disabled = true;
        submitBtn.classList.remove("bg-indigo-600", "hover:bg-indigo-700", "cursor-pointer");
        submitBtn.classList.add("bg-indigo-400", "cursor-not-allowed");
    }
    else {
        submitBtn.disabled = false;
        submitBtn.classList.remove("bg-indigo-400", "cursor-not-allowed");
        submitBtn.classList.add("bg-indigo-600", "hover:bg-indigo-700", "cursor-pointer");
    }
}
// เติม select option
function populateSelect(selectEl, start, end) {
    if (!selectEl)
        return;
    selectEl.innerHTML = "";
    for (let i = start; i <= end; i++) {
        const opt = document.createElement("option");
        opt.value = i.toString().padStart(2, "0");
        opt.textContent = i.toString().padStart(2, "0");
        selectEl.appendChild(opt);
    }
}
// Dynamic list objective/expectation
function bindDynamicList(listId, inputName, placeholder, type) {
    const list = document.getElementById(listId);
    list === null || list === void 0 ? void 0 : list.addEventListener("click", (e) => {
        var _a;
        const target = e.target;
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
            (_a = target.closest(`.${type}-item`)) === null || _a === void 0 ? void 0 : _a.remove();
        }
    });
}
