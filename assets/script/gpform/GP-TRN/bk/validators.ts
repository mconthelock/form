import { showAlert } from "./alert.js";

// ฟังก์ชันกลาง validate
function validateForm(requiredSelectors: string[]): boolean {
    for (const sel of requiredSelectors) {
        const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(sel);
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
export function validateFunctionalForm(): boolean {
    const requiredSelectors = [
        "#funcRequestBy", "#funcTrainingSubject", "#funcDateFrom", "#funcDateTo",
        "#funcLocation", "#funcInstitute", "#funcObjectiveList input[name='funcObjective[]']",
        "#funcExpectationList input[name='funcExpectation[]']", "#funcTraineeCode",
        "#funcJdName", "#funcJdRelation", "#funcJdFiles"
    ];

    if (!validateForm(requiredSelectors)) return false;

    const expense = document.querySelector<HTMLInputElement>("input[name='funcExpenseOption']:checked");
    if (!expense) {
        showAlert("⚠ แจ้งเตือน", "กรุณาเลือกวิธีการพิจารณาค่าใช้จ่าย (Part 5)");
        return false;
    }

    if(expense.value === "not_compare") {
        const chk_reason = document.querySelector<HTMLInputElement>("input[name='funcReason']:checked");
        const reasonOther = document.querySelector<HTMLInputElement>("input[name='funcReason'][value='other']:checked");
         if (!chk_reason) {
            showAlert("⚠ แจ้งเตือน", "กรุณาเลือกเหตุผลของการไม่มีการเปรียบเทียบราคา ค่าฝึกอบรม ");
            return false;
        }else if (reasonOther) {
            const txt = document.getElementById("funcReasonOtherText") as HTMLInputElement;
            if (!txt.value.trim()) {
                showAlert("⚠ แจ้งเตือน", txt.dataset.alert || "กรุณาระบุเหตุผลอื่น");
                txt.focus();
                return false;
            }
        }
    }else if (expense.value === "compare") {
        const files = (document.getElementById("funcCompareFiles") as HTMLInputElement)?.files;
        if (!files || files.length === 0) {
            showAlert("⚠ แจ้งเตือน", "กรุณาแนบไฟล์เปรียบเทียบราคาอย่างน้อย 1 ไฟล์");
            return false;
        }
    }

    const freeSelected = document.querySelector<HTMLInputElement>("input[name='funcReason'][value='free']:checked");
    if (!freeSelected) {
        const amount = document.getElementById("funcAmountInput") as HTMLInputElement | null;
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
export function validateLegalForm(): boolean {
    const requiredSelectors = [
        "#legalRequestBy","#legalSubject", "#legalDateFrom", "#legalDateTo",
        "#legalPlace", "#legalInstitute", "#legalConcernLaw",
        "#legalObjectiveList input[name='legalObjective[]']",
        "#legalExpectationList input[name='legalExpectation[]']",
        "#legalTraineeCode"
    ];

    if (!validateForm(requiredSelectors)) return false;

    const expense = document.querySelector<HTMLInputElement>("input[name='legalExpenseOption']:checked");
    if (!expense) {
        showAlert("⚠ แจ้งเตือน", "กรุณาเลือกวิธีการพิจารณาค่าใช้จ่าย (Part 6)");
        return false;
    }

    if (expense.value === "not_compare") {
        const reasonOther = document.querySelector<HTMLInputElement>("input[name='legalReason'][value='other']:checked");
        const chk_reason = document.querySelector<HTMLInputElement>("input[name='legalReason']:checked");
        if (!chk_reason) {
            showAlert("⚠ แจ้งเตือน", "กรุณาเลือกเหตุผลของการไม่มีการเปรียบเทียบราคา ค่าฝึกอบรม ");
            return false;
        }else if (reasonOther) {
            const txt = document.getElementById("legalReasonText") as HTMLInputElement;
            if (!txt.value.trim()) {
                showAlert("⚠ แจ้งเตือน", txt.dataset.alert || "กรุณาระบุเหตุผลอื่น");
                txt.focus();
                return false;
            }
        }
    }else if (expense.value === "compare") {
        const files = (document.getElementById("legalCompareFiles") as HTMLInputElement)?.files;
        if (!files || files.length === 0) {
            showAlert("⚠ แจ้งเตือน", "กรุณาแนบไฟล์เปรียบเทียบราคา");
            return false;
        }
    }

    const freeSelected = document.querySelector<HTMLInputElement>("input[name='legalReason'][value='free']:checked");
    if (!freeSelected) {
        const amount = document.getElementById("legalAmount") as HTMLInputElement | null;
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
export function validateMethForm(): boolean {
    const requiredSelectors = [
        "#methRequestBy","#methSubject", "#methDateFrom", "#methDateTo",
        "#methPlace", "#methInstitute",
        "#methObjectiveList input[name='methObjective[]']",
        "#methExpectationList input[name='methExpectation[]']",
        "#methTraineeCode"
    ];

    if (!validateForm(requiredSelectors)) return false;
    const expense = document.querySelector<HTMLInputElement>("input[name='methExpenseOption']:checked");
    if (!expense) {
        showAlert("⚠ แจ้งเตือน", "กรุณาเลือกวิธีการพิจารณาค่าใช้จ่าย (Part 5)");
        return false;
    }

    if (expense.value === "not_compare") {
        const reasonOther = document.querySelector<HTMLInputElement>("input[name='methReason'][value='other']:checked");
        const chk_reason = document.querySelector<HTMLInputElement>("input[name='methReason']:checked");
        if (!chk_reason) {
            showAlert("⚠ แจ้งเตือน", "กรุณาเลือกเหตุผลของการไม่มีการเปรียบเทียบราคา ค่าฝึกอบรม ");
            return false;
        }else if (reasonOther) {
            const txt = document.getElementById("methReasonText") as HTMLInputElement;
            if (!txt.value.trim()) {
                showAlert("⚠ แจ้งเตือน", txt.dataset.alert || "กรุณาระบุเหตุผลอื่น");
                txt.focus();
                return false;
            }
        }
    }else if (expense.value === "compare") {
        const files = (document.getElementById("methCompareFiles") as HTMLInputElement)?.files;
        if (!files || files.length === 0) {
            showAlert("⚠ แจ้งเตือน", "กรุณาแนบไฟล์เปรียบเทียบราคา");
            return false;
        }
    }

    const freeSelected = document.querySelector<HTMLInputElement>("input[name='methReason'][value='free']:checked");
    if (!freeSelected) {
        const amount = document.getElementById("methAmount") as HTMLInputElement | null;
        if (amount && amount.value === "") {
            showAlert("⚠ แจ้งเตือน", "กรุณากรอกจำนวนเงิน");
            amount.focus();
            return false;
        }
    }

    return true;
}
