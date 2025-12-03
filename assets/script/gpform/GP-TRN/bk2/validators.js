
import { showAlert } from "./formUtils.js";  // ✅ ต้อง import มาด้วย

/**
 * ฟังก์ชันกลาง ใช้ตรวจสอบว่าฟิลด์ที่บังคับต้องมีค่า
 * - รองรับ querySelectorAll (ตรวจสอบหลาย input)
 * - ตรวจว่าอย่างน้อยต้องมี input และต้องไม่ว่าง
 */
export function validateForm(requiredSelectors, fid) {
    for (const sel of requiredSelectors) {
        const els = document.querySelectorAll(sel);

        if(fid != '5'){
            if (els.length === 0) {
                showAlert("⚠ แจ้งเตือน", "ต้องมีข้อมูลอย่างน้อย 1 รายการ");
                return false;
            }
        }

        let valid = false;
        els.forEach(el => {
            if (el.value && el.value.trim() !== "") {
                valid = true;
            }
        });

        if (!valid) {
            showAlert("⚠ แจ้งเตือน", els[0].dataset.alert || "กรุณากรอกข้อมูลให้ครบถ้วน");
            els[0].focus();
            return false;
        }
    }
    return true;
}

// =====================================================================
// Functional
// =====================================================================
export function validateFunctionalForm() {
    const requiredSelectors = [
        "#funcRequestBy", "#funcTrainingSubject", "#funcDateFrom", "#funcDateTo",
        "#funcLocation", "#funcInstitute",
        "#funcObjectiveList input[name='funcObjective[]']",
        "#funcExpectationList input[name='funcExpectation[]']",
        "#funcTraineeCode",
        "#funcJdName", "#funcJdRelation", "#funcJdFiles"
    ];
    if (!validateForm(requiredSelectors, 1)) return false;

    const expense = document.querySelector("input[name='funcExpenseOption']:checked");
    if (!expense) {
        showAlert("⚠ แจ้งเตือน", "กรุณาเลือกวิธีการพิจารณาค่าใช้จ่าย (Part 5)");
        return false;
    }

    if (expense.value === "0") {
        const chk_reason = document.querySelector("input[name='funcReason']:checked");
        const reasonOther = document.querySelector("input[name='funcReason'][value='other']:checked");
        if (!chk_reason) {
            showAlert("⚠ แจ้งเตือน", "กรุณาเลือกเหตุผลของการไม่มีการเปรียบเทียบราคา");
            return false;
        } else if (reasonOther) {
            const txt = document.getElementById("funcReasonOtherText");
            if (!txt.value.trim()) {
                showAlert("⚠ แจ้งเตือน", txt.dataset.alert || "กรุณาระบุเหตุผลอื่น");
                txt.focus();
                return false;
            }
        }
    } else if (expense.value === "1") {
        const files = document.getElementById("funcCompareFiles")?.files;
        if (!files || files.length === 0) {
            showAlert("⚠ แจ้งเตือน", "กรุณาแนบไฟล์เปรียบเทียบราคาอย่างน้อย 1 ไฟล์");
            return false;
        }
    }

    const freeSelected = document.querySelector("input[name='funcReason'][value='1']:checked");
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
    const requiredSelectors = [
        "#legalRequestBy", "#legalTrainingSubject", "#legalDateFrom", "#legalDateTo",
        "#legalLocation", "#legalInstitute", "#legalConcernLaw",
        "#legalObjectiveList input[name='legalObjective[]']",
        "#legalExpectationList input[name='legalExpectation[]']"
    ];
    if (!validateForm(requiredSelectors, 2)) return false;

    const expense = document.querySelector("input[name='legalExpenseOption']:checked");
    if (!expense) {
        showAlert("⚠ แจ้งเตือน", "กรุณาเลือกวิธีการพิจารณาค่าใช้จ่าย (Part 6)");
        return false;
    }

    if (expense.value === "0") {
        const chk_reason = document.querySelector("input[name='legalReason']:checked");
        const reasonOther = document.querySelector("input[name='legalReason'][value='other']:checked");
        if (!chk_reason) {
            showAlert("⚠ แจ้งเตือน", "กรุณาเลือกเหตุผลของการไม่มีการเปรียบเทียบราคา");
            return false;
        } else if (reasonOther) {
            const txt = document.getElementById("legalReasonText");
            if (!txt.value.trim()) {
                showAlert("⚠ แจ้งเตือน", txt.dataset.alert || "กรุณาระบุเหตุผลอื่น");
                txt.focus();
                return false;
            }
        }
    } else if (expense.value === "1") {
        const files = document.getElementById("legalCompareFiles")?.files;
        if (!files || files.length === 0) {
            showAlert("⚠ แจ้งเตือน", "กรุณาแนบไฟล์เปรียบเทียบราคา");
            return false;
        }
    }

    const freeSelected = document.querySelector("input[name='legalReason'][value='1']:checked");
    if (!freeSelected) {
        const amount = document.getElementById("legalAmountInput");
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
    const requiredSelectors = [
        "#methRequestBy", "#methTrainingSubject", "#methDateFrom", "#methDateTo",
        "#methLocation", "#methInstitute",
        "#methObjectiveList input[name='methObjective[]']",
        "#methExpectationList input[name='methExpectation[]']",
        "#methTraineeCode"
    ];
    if (!validateForm(requiredSelectors, 3)) return false;

    const expense = document.querySelector("input[name='methExpenseOption']:checked");
    if (!expense) {
        showAlert("⚠ แจ้งเตือน", "กรุณาเลือกวิธีการพิจารณาค่าใช้จ่าย (Part 5)");
        return false;
    }

    if (expense.value === "0") {
        const chk_reason = document.querySelector("input[name='methReason']:checked");
        const reasonOther = document.querySelector("input[name='methReason'][value='other']:checked");
        if (!chk_reason) {
            showAlert("⚠ แจ้งเตือน", "กรุณาเลือกเหตุผลของการไม่มีการเปรียบเทียบราคา");
            return false;
        } else if (reasonOther) {
            const txt = document.getElementById("methReasonText");
            if (!txt.value.trim()) {
                showAlert("⚠ แจ้งเตือน", txt.dataset.alert || "กรุณาระบุเหตุผลอื่น");
                txt.focus();
                return false;
            }
        }
    } else if (expense.value === "1") {
        const files = document.getElementById("methCompareFiles")?.files;
        if (!files || files.length === 0) {
            showAlert("⚠ แจ้งเตือน", "กรุณาแนบไฟล์เปรียบเทียบราคา");
            return false;
        }
    }

    const freeSelected = document.querySelector("input[name='methReason'][value='1']:checked");
    if (!freeSelected) {
        const amount = document.getElementById("methAmountInput");
        if (amount && amount.value === "") {
            showAlert("⚠ แจ้งเตือน", "กรุณากรอกจำนวนเงิน");
            amount.focus();
            return false;
        }
    }

    return true;
}


// =====================================================================
// Position Based
// =====================================================================
export function validatePosForm() {
    const requiredSelectors = [
        "#posRequestBy", "#posTrainingSubject", "#posDateFrom", "#posDateTo",
        "#posLocation", "#posInstitute",
        "#posObjectiveList input[name='posObjective[]']",
        "#posExpectationList input[name='posExpectation[]']",
        "#posTraineeCode"
    ];
    if (!validateForm(requiredSelectors, 4)) return false;

    const expense = document.querySelector("input[name='posExpenseOption']:checked");
    if (!expense) {
        showAlert("⚠ แจ้งเตือน", "กรุณาเลือกวิธีการพิจารณาค่าใช้จ่าย (Part 5)");
        return false;
    }

    if (expense.value === "0") {
        const chk_reason = document.querySelector("input[name='posReason']:checked");
        const reasonOther = document.querySelector("input[name='posReason'][value='other']:checked");
        if (!chk_reason) {
            showAlert("⚠ แจ้งเตือน", "กรุณาเลือกเหตุผลของการไม่มีการเปรียบเทียบราคา");
            return false;
        } else if (reasonOther) {
            const txt = document.getElementById("posReasonText");
            if (!txt.value.trim()) {
                showAlert("⚠ แจ้งเตือน", txt.dataset.alert || "กรุณาระบุเหตุผลอื่น");
                txt.focus();
                return false;
            }
        }
    } else if (expense.value === "1") {
        const files = document.getElementById("posCompareFiles")?.files;
        if (!files || files.length === 0) {
            showAlert("⚠ แจ้งเตือน", "กรุณาแนบไฟล์เปรียบเทียบราคา");
            return false;
        }
    }

    const freeSelected = document.querySelector("input[name='posReason'][value='1']:checked");
    if (!freeSelected) {
        const amount = document.getElementById("posAmountInput");
        if (amount && amount.value === "") {
            showAlert("⚠ แจ้งเตือน", "กรุณากรอกจำนวนเงิน");
            amount.focus();
            return false;
        }
    }

    return true;
}

// =====================================================================
// Outside Learning
// =====================================================================
export function validateOutForm() {
    const requiredSelectors = [
        "#outRequestBy", "#outTrainingSubject", "#outDateFrom", "#outDateTo",
        "#outLocation",
        "#outObjectiveList input[name='outObjective[]']",
        "#outExpectationList input[name='outExpectation[]']",
        "#outTraineeCode"
    ];
    if (!validateForm(requiredSelectors, 5)) return false;
    return true;
}