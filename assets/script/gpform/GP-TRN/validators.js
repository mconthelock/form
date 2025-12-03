// =====================================================
// 📦 GP-TRN: Form Validators (jQuery Version)
// =====================================================

import { showAlert } from "./formUtils.js";
import Swal from "sweetalert2";
/**
 * 🔹 ฟังก์ชันกลาง ตรวจสอบว่าฟิลด์ที่บังคับต้องมีค่า
 * - รองรับหลาย input/selector
 * - แสดง alert อัตโนมัติเมื่อไม่ครบ
 */
export function validateForm(requiredSelectors, fid) {
  for (const sel of requiredSelectors) {
    const $els = $(sel);


    const valid = $els.toArray().some(el => $(el).val()?.trim());
    if (!valid) {
      const msg = $els.eq(0).data("alert") || "กรุณากรอกข้อมูลให้ครบถ้วน";
      showAlert("⚠ แจ้งเตือน", msg);
      $els.eq(0).focus();
      return false;
    }
  }
  return true;
}

/* =====================================================
   🔹 Common Helper
   ===================================================== */
function checkExpense(prefix, partText) {
  const $exp = $(`input[name='${prefix}ExpenseOption']:checked`);
  if (!$exp.length) {
    showAlert("⚠ แจ้งเตือน", `กรุณาเลือกวิธีการพิจารณาค่าใช้จ่าย (${partText})`);
    return false;
  }

  // ❌ ไม่มีการเปรียบเทียบราคา
  if ($exp.val() === "0") {
    const $reason = $(`input[name='${prefix}Reason']:checked`);
    const $reasonOther = $(`input[name='${prefix}Reason'][value='other']:checked`);

    if (!$reason.length) {
      showAlert("⚠ แจ้งเตือน", "กรุณาเลือกเหตุผลของการไม่มีการเปรียบเทียบราคา");
      return false;
    }
    if ($reasonOther.length) {
      const $txt = $(`#${prefix}ReasonText, #${prefix}ReasonOtherText`);
      if (!$txt.val()?.trim()) {
        showAlert("⚠ แจ้งเตือน", $txt.data("alert") || "กรุณาระบุเหตุผลอื่น");
        $txt.focus();
        return false;
      }
    }
  }

  // ✅ มีการเปรียบเทียบ ต้องแนบไฟล์
  if ($exp.val() === "1") {
    const files = $(`#${prefix}CompareFiles`)[0]?.files;
    if (!files || !files.length) {
      showAlert("⚠ แจ้งเตือน", "กรุณาแนบไฟล์เปรียบเทียบราคาอย่างน้อย 1 ไฟล์");
      return false;
    }
  }

  // ✅ ตรวจกรณีฟรีหรือไม่
  const freeSelected = $(`input[name='${prefix}Reason'][value='1']:checked`);
  if (!freeSelected.length) {
    const $amt = $(`#${prefix}AmountInput`);
    if (!$amt.val()?.trim()) {
      showAlert("⚠ แจ้งเตือน", "กรุณากรอกจำนวนเงิน");
      $amt.focus();
      return false;
    }
  }

  return true;
}

/* =====================================================
   🔹 Functional
   ===================================================== */
export function validateFunctionalForm() {
  const required = [
    "#funcTrainingSubject", "#funcDateFrom", "#funcDateTo",
    "#funcLocation", "#funcInstitute",
    "#funcObjectiveList input[name='funcObjective[]']",
    "#funcExpectationList input[name='funcExpectation[]']",
    "#funcTraineeCode", "#funcJdName", "#funcJdRelation", "#funcJdFiles"
  ];
  if (!validateForm(required, "1")) return false;
  return checkExpense("func", "Part 5");
}

/* =====================================================
   🔹 Legal
   ===================================================== */
export function validateLegalForm() {
  const required = [
    "#legalTrainingSubject", "#legalDateFrom", "#legalDateTo",
    "#legalLocation", "#legalInstitute", "#legalConcernLaw", 
    "#legalObjectiveList input[name='legalObjective[]']",
    "#legalExpectationList input[name='legalExpectation[]']"
  ];
  if (!validateForm(required, "2")) return false;
  return checkExpense("legal", "Part 6");
}

/* =====================================================
   🔹 Method-Based
   ===================================================== */
export function validateMethForm() {
  const required = [
    "#methTrainingSubject", "#methDateFrom", "#methDateTo",
    "#methLocation", "#methInstitute",
    "#methObjectiveList input[name='methObjective[]']",
    "#methExpectationList input[name='methExpectation[]']",
    "#methTraineeCode"
  ];
  if (!validateForm(required, "3")) return false;
  return checkExpense("meth", "Part 5");
}

/* =====================================================
   🔹 Position-Based
   ===================================================== */
export function validatePosForm() {
  const required = [
    "#posTrainingSubject", "#posDateFrom", "#posDateTo",
    "#posLocation", "#posInstitute",
    "#posObjectiveList input[name='posObjective[]']",
    "#posExpectationList input[name='posExpectation[]']",
    "#posTraineeCode"
  ];
  if (!validateForm(required, "4")) return false;
  return checkExpense("pos", "Part 5");
}

/* =====================================================
   🔹 Outside Learning
   ===================================================== */
export function validateOutForm() {
  const required = [
    "#outTrainingSubject", "#outDateFrom", "#outDateTo",
    "#outLocation",
    "#outObjectiveList input[name='outObjective[]']",
    "#outExpectationList input[name='outExpectation[]']"
  ];
  return validateForm(required, "5");
}


/* =====================================================
   🔹 Validate Training Dates (DateTo >= DateFrom)
   ✅ รองรับหลายฟอร์มผ่าน prefix (func / legal / meth / pos / out)
   ===================================================== */
export function validateDateRange(prefix) {
  if (!prefix) return;

  const $from = $(`#${prefix}DateFrom`);
  const $to = $(`#${prefix}DateTo`);

  if (!$from.length || !$to.length) {
    console.warn(`⚠️ validateDateRange: ไม่พบ element สำหรับ prefix "${prefix}"`);
    return;
  }

  const checkDate = () => {
    const dateFrom = $.trim($from.val());
    const dateTo = $.trim($to.val());

    if (dateFrom && dateTo) {
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);

      if (dateTo < dateFrom) {
        Swal.fire({
          icon: "warning",
          title: "⚠ กรุณาเลือกวันที่ให้ถูกต้อง",
          text: "กรุณาเลือกวันที่ให้ถูกต้อง",
          confirmButtonText: "ตกลง",
        });
        // เคลียร์ค่า dateTo และโฟกัสกลับไป
        $(`#${prefix}DateTo`).val("").focus();
      }
    }
  };

  $from.on("change", checkDate);
  $to.on("change", checkDate);

  //console.log(`✅ validateDateRange(${prefix}) พร้อมใช้งาน`);
}
