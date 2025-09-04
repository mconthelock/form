import { showAlert } from "./alert.js";
// ฟังก์ชันกลาง validate
function validateForm(requiredSelectors) {
    for (const sel of requiredSelectors) {
        const el = document.querySelector(sel);
        if (el && !el.value.trim()) {
            showAlert("⚠ แจ้งเตือน", el.dataset.alert || "กรุณากรอกข้อมูลให้ครบถ้วน");
            el.focus();
            return false;
        }
    }
    return true;
}
// =====================================================================
// Functional
// =====================================================================
export function validateFunctionalForm() {
    var _a;
    const requiredSelectors = [
        "#funcRequestBy", "#funcTrainingSubject", "#funcDateFrom", "#funcDateTo",
        "#funcLocation", "#funcInstitute", "#funcObjectiveList input[name='funcObjective[]']",
        "#funcExpectationList input[name='funcExpectation[]']", "#funcTraineeCode",
        "#funcJdName", "#funcJdRelation"
    ];
    if (!validateForm(requiredSelectors))
        return false;
    const expense = document.querySelector("input[name='funcExpenseOption']:checked");
    if (!expense) {
        showAlert("⚠ แจ้งเตือน", "กรุณาเลือกวิธีการพิจารณาค่าใช้จ่าย (Part 5)");
        return false;
    }
    if (expense.value === "not_compare") {
        const chk_reason = document.querySelector("input[name='funcReason']:checked");
        const reasonOther = document.querySelector("input[name='funcReason'][value='other']:checked");
        if (!chk_reason) {
            showAlert("⚠ แจ้งเตือน", "กรุณาเลือกเหตุผลของการไม่มีการเปรียบเทียบราคา ค่าฝึกอบรม ");
            return false;
        }
        else if (reasonOther) {
            const txt = document.getElementById("funcReasonOtherText");
            if (!txt.value.trim()) {
                showAlert("⚠ แจ้งเตือน", txt.dataset.alert || "กรุณาระบุเหตุผลอื่น");
                txt.focus();
                return false;
            }
        }
    }
    else if (expense.value === "compare") {
        const files = (_a = document.getElementById("funcCompareFiles")) === null || _a === void 0 ? void 0 : _a.files;
        if (!files || files.length === 0) {
            showAlert("⚠ แจ้งเตือน", "กรุณาแนบไฟล์เปรียบเทียบราคาอย่างน้อย 1 ไฟล์");
            return false;
        }
    }
    const freeSelected = document.querySelector("input[name='funcReason'][value='free']:checked");
    if (!freeSelected) {
        const amount = document.getElementById("funcAmountInput");
        if (amount && amount.value === "") {
            showAlert("⚠ แจ้งเตือน", "กรุณากรอกจำนวนเงิน");
            amount.focus();
            return false;
        }
    }
    return true;
}
// =====================================================================
// Legal
// =====================================================================
export function validateLegalForm() {
    var _a;
    const requiredSelectors = [
        "#legalRequestBy", "#legalSubject", "#legalDateFrom", "#legalDateTo",
        "#legalPlace", "#legalInstitute", "#legalConcernLaw",
        "#legalObjectiveList input[name='legalObjective[]']",
        "#legalExpectationList input[name='legalExpectation[]']",
        "#legalCode"
    ];
    if (!validateForm(requiredSelectors))
        return false;
    const expense = document.querySelector("input[name='legalExpenseOption']:checked");
    if (!expense) {
        showAlert("⚠ แจ้งเตือน", "กรุณาเลือกวิธีการพิจารณาค่าใช้จ่าย (Part 6)");
        return false;
    }
    if (expense.value === "not_compare") {
        const reasonOther = document.querySelector("input[name='legalReason'][value='other']:checked");
        const chk_reason = document.querySelector("input[name='legalReason']:checked");
        if (!chk_reason) {
            showAlert("⚠ แจ้งเตือน", "กรุณาเลือกเหตุผลของการไม่มีการเปรียบเทียบราคา ค่าฝึกอบรม ");
            return false;
        }
        else if (reasonOther) {
            const txt = document.getElementById("legalReasonText");
            if (!txt.value.trim()) {
                showAlert("⚠ แจ้งเตือน", txt.dataset.alert || "กรุณาระบุเหตุผลอื่น");
                txt.focus();
                return false;
            }
        }
    }
    else if (expense.value === "compare") {
        const files = (_a = document.getElementById("legalCompareFiles")) === null || _a === void 0 ? void 0 : _a.files;
        if (!files || files.length === 0) {
            showAlert("⚠ แจ้งเตือน", "กรุณาแนบไฟล์เปรียบเทียบราคา");
            return false;
        }
    }
    const freeSelected = document.querySelector("input[name='legalReason'][value='free']:checked");
    if (!freeSelected) {
        const amount = document.getElementById("legalAmount");
        if (amount && amount.value === "") {
            showAlert("⚠ แจ้งเตือน", "กรุณากรอกจำนวนเงิน");
            amount.focus();
            return false;
        }
    }
    return true;
}
// =====================================================================
// Meth
// =====================================================================
export function validateMethForm() {
    var _a;
    const requiredSelectors = [
        "#methRequestBy", "#methSubject", "#methDateFrom", "#methDateTo",
        "#methPlace", "#methInstitute",
        "#methObjectiveList input[name='methObjective[]']",
        "#methExpectationList input[name='methExpectation[]']",
        "#methCode"
    ];
    if (!validateForm(requiredSelectors))
        return false;
    const expense = document.querySelector("input[name='methExpenseOption']:checked");
    if (!expense) {
        showAlert("⚠ แจ้งเตือน", "กรุณาเลือกวิธีการพิจารณาค่าใช้จ่าย (Part 5)");
        return false;
    }
    if (expense.value === "not_compare") {
        const reasonOther = document.querySelector("input[name='methReason'][value='other']:checked");
        const chk_reason = document.querySelector("input[name='methReason']:checked");
        if (!chk_reason) {
            showAlert("⚠ แจ้งเตือน", "กรุณาเลือกเหตุผลของการไม่มีการเปรียบเทียบราคา ค่าฝึกอบรม ");
            return false;
        }
        else if (reasonOther) {
            const txt = document.getElementById("methReasonText");
            if (!txt.value.trim()) {
                showAlert("⚠ แจ้งเตือน", txt.dataset.alert || "กรุณาระบุเหตุผลอื่น");
                txt.focus();
                return false;
            }
        }
    }
    else if (expense.value === "compare") {
        const files = (_a = document.getElementById("methCompareFiles")) === null || _a === void 0 ? void 0 : _a.files;
        if (!files || files.length === 0) {
            showAlert("⚠ แจ้งเตือน", "กรุณาแนบไฟล์เปรียบเทียบราคา");
            return false;
        }
    }
    const freeSelected = document.querySelector("input[name='methReason'][value='free']:checked");
    if (!freeSelected) {
        const amount = document.getElementById("methAmount");
        if (amount && amount.value === "") {
            showAlert("⚠ แจ้งเตือน", "กรุณากรอกจำนวนเงิน");
            amount.focus();
            return false;
        }
    }
    return true;
}
