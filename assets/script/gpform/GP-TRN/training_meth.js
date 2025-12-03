// =====================================================
// 📦 GP-TRN: Method-Based Training Form (jQuery Version)
// =====================================================

import { bindEmpLookup } from "./emp_lookup.js";
import { populateSelect, bindMaxLengthAlert } from "./formUtils.js";

export function initMethForm() {
  console.log("🚀 init Meth Form");
  if (initMethForm.initialized) return;
  initMethForm.initialized = true;

  /* =====================================================
     🔹 Populate Time Select (ใช้จาก formUtils.js)
     ===================================================== */
  [
    ["#methTimeFromHour", 0, 23],
    ["#methTimeToHour", 0, 23],
    ["#methTimeFromMin", 0, 59],
    ["#methTimeToMin", 0, 59]
  ].forEach(([sel, s, e]) => populateSelect($(sel), s, e));

  /* =====================================================
     🔹 Employee Lookup (Request By + Trainee)
     ===================================================== */
  bindEmpLookup("#methTraineeCode", {
    SNAME: "#methTraineeName",
    SPOSITION: "#methTraineePosition",
    SSEC: "#methTraineeSec",
    SDEPT: "#methTraineeDept",
    SDIV: "#methTraineeDiv",
    SPOSCODE: "input[name='methTraineeposcode']"
  });

  /* =====================================================
     🔹 Expense Toggle
     ===================================================== */
  const $reasonBox = $("#methReasonBox");
  const $compareUpload = $("#methCompareUpload");
  const $part6 = $("#meth_part6");

  $("input[name='methExpenseOption']").on("change", function () {
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
  $("input[name='methReason']").on("change", function () {
    if ($(this).val() === "1") $part6.addClass("hidden");
    else $part6.removeClass("hidden");
  });

  /* =====================================================
     🔹 VAT Calculation (Auto 7%)
     ===================================================== */
  const $vatResult = $("#methVatResult").addClass("hidden").text("");
  const $amountInput = $("#methAmountInput").val("");

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

  console.log("✅ Meth Form initialized successfully");
}

// ✅ Flag กันการ init ซ้ำ
initMethForm.initialized = false;
