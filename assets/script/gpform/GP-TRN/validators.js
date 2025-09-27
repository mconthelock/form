"use strict";

/**
 * ฟังก์ชันกลาง ใช้ตรวจสอบว่าฟิลด์ที่บังคับต้องมีค่า
 * - รองรับ querySelectorAll (ตรวจสอบหลาย input)
 * - ตรวจว่าอย่างน้อยต้องมี input และต้องไม่ว่าง
 */
function validateForm(requiredSelectors) {
    for (const sel of requiredSelectors) {
        const els = document.querySelectorAll(sel);

        // ถ้าไม่มี element เลย → ผิด
        if (els.length === 0) {
            showAlert("⚠ แจ้งเตือน", "ต้องมีข้อมูลอย่างน้อย 1 รายการ");
            return false;
        }

        // ตรวจว่ามีค่าอย่างน้อย 1 ช่อง
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
function validateFunctionalForm() {
    const requiredSelectors = [
        "#funcRequestBy", "#funcTrainingSubject", "#funcDateFrom", "#funcDateTo",
        "#funcLocation", "#funcInstitute",
        "#funcObjectiveList input[name='funcObjective[]']",
        "#funcExpectationList input[name='funcExpectation[]']",
        "#funcTraineeCode",
        "#funcJdName", "#funcJdRelation", "#funcJdFiles"
    ];
    if (!validateForm(requiredSelectors)) return false;

    // Part 5: Expense
    const expense = document.querySelector("input[name='funcExpenseOption']:checked");
    if (!expense) {
        showAlert("⚠ แจ้งเตือน", "กรุณาเลือกวิธีการพิจารณาค่าใช้จ่าย (Part 5)");
        return false;
    }

    if (expense.value === "not_compare") {
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
    } else if (expense.value === "compare") {
        const files = document.getElementById("funcCompareFiles")?.files;
        if (!files || files.length === 0) {
            showAlert("⚠ แจ้งเตือน", "กรุณาแนบไฟล์เปรียบเทียบราคาอย่างน้อย 1 ไฟล์");
            return false;
        }
    }

    // ถ้าไม่ได้เลือก "อบรมฟรี" ต้องกรอกจำนวนเงิน
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
function validateLegalForm() {
    const requiredSelectors = [
        "#legalRequestBy", "#legalSubject", "#legalDateFrom", "#legalDateTo",
        "#legalPlace", "#legalInstitute", "#legalConcernLaw",
        "#legalObjectiveList input[name='legalObjective[]']",
        "#legalExpectationList input[name='legalExpectation[]']",
        "#legalTraineeCode"
    ];
    if (!validateForm(requiredSelectors)) return false;

    const expense = document.querySelector("input[name='legalExpenseOption']:checked");
    if (!expense) {
        showAlert("⚠ แจ้งเตือน", "กรุณาเลือกวิธีการพิจารณาค่าใช้จ่าย (Part 6)");
        return false;
    }

    if (expense.value === "not_compare") {
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
    } else if (expense.value === "compare") {
        const files = document.getElementById("legalCompareFiles")?.files;
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
function validateMethForm() {
    const requiredSelectors = [
        "#methRequestBy", "#methSubject", "#methDateFrom", "#methDateTo",
        "#methPlace", "#methInstitute",
        "#methObjectiveList input[name='methObjective[]']",
        "#methExpectationList input[name='methExpectation[]']",
        "#methTraineeCode"
    ];
    if (!validateForm(requiredSelectors)) return false;

    const expense = document.querySelector("input[name='methExpenseOption']:checked");
    if (!expense) {
        showAlert("⚠ แจ้งเตือน", "กรุณาเลือกวิธีการพิจารณาค่าใช้จ่าย (Part 5)");
        return false;
    }

    if (expense.value === "not_compare") {
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
    } else if (expense.value === "compare") {
        const files = document.getElementById("methCompareFiles")?.files;
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
