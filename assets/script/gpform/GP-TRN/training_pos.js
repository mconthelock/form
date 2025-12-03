// =====================================================
// 📦 GP-TRN: Position-Based Training Form (jQuery Version)
// =====================================================

import { bindEmpLookup } from "./emp_lookup.js";
import { populateSelect, bindMaxLengthAlert } from "./formUtils.js";

export function initPosForm() {
  console.log("🚀 init Position-Based Form");

  if (initPosForm.initialized) return;
  initPosForm.initialized = true;

  /* =====================================================
     🔹 Populate Time Select (ใช้จาก formUtils.js)
     ===================================================== */
  [
    ["#posTimeFromHour", 0, 23],
    ["#posTimeToHour", 0, 23],
    ["#posTimeFromMin", 0, 59],
    ["#posTimeToMin", 0, 59]
  ].forEach(([sel, s, e]) => populateSelect($(sel), s, e));

  /* =====================================================
     🔹 Employee Lookup (Request By + Trainee)
     ===================================================== */

  bindEmpLookup("#posTraineeCode", {
    SNAME: "#posTraineeName",
    SPOSITION: "#posTraineePosition",
    SSEC: "#posTraineeSec",
    SDEPT: "#posTraineeDept",
    SDIV: "#posTraineeDiv",
    SPOSCODE: "input[name='posTraineeposcode']"
  });

  /* =====================================================
     🔹 Expense Toggle
     ===================================================== */
  const $reasonBox = $("#posReasonBox");
  const $compareUpload = $("#posCompareUpload");
  const $part6 = $("#pos_part6");

  $("input[name='posExpenseOption']").on("change", function () {
    const val = $(this).val();
    if (val === "0") {
      $reasonBox.removeClass("hidden");
      $compareUpload.addClass("hidden");
    } else if (val === "1") {
      $reasonBox.addClass("hidden");
      $compareUpload.removeClass("hidden");
      $part6.removeClass("hidden");
    }
  });

  /* =====================================================
     🔹 Free Reason Toggle
     ===================================================== */
  $("input[name='posReason']").on("change", function () {
    if ($(this).val() === "1") $part6.addClass("hidden");
    else $part6.removeClass("hidden");
  });

  /* =====================================================
     🔹 VAT Calculation (Auto 7%)
     ===================================================== */
  const $vatResult = $("#posVatResult").addClass("hidden").text("");
  const $amountInput = $("#posAmountInput").val("");

  $amountInput.on("input", function () {
    const val = parseFloat($(this).val());
    if (isNaN(val)) {
      $vatResult.text("").addClass("hidden");
      return;
    }

    const vat = val * 0.07;
    const total = val + vat;
    $vatResult
      .text(`รวมทั้งหมด: ${total.toLocaleString()} บาท (VAT 7%: ${vat.toLocaleString()} บาท)`)
      .removeClass("hidden");
  });

  console.log("✅ Position-Based Form initialized successfully");
}

// ✅ Flag กันการ init ซ้ำ
initPosForm.initialized = false;
