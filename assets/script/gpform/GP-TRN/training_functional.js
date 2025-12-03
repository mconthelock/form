// =====================================================
// 📦 GP-TRN: Functional Training Form (jQuery Version)
// =====================================================

import { populateSelect, bindMaxLengthAlert } from "./formUtils.js";
import { bindEmpLookup } from "./emp_lookup.js";

/**
 * 🔹 Initialize Functional Form (init ครั้งเดียว)
 */
export function initFunctionalForm() {
  console.log("🚀 init Functional Form");
  if (initFunctionalForm.initialized) return;
  initFunctionalForm.initialized = true;

  /* --------------------------------------------------
     🔹 Time Selects
     -------------------------------------------------- */
  [["#funcTimeFromHour", 0, 23],
   ["#funcTimeToHour", 0, 23],
   ["#funcTimeFromMin", 0, 59],
   ["#funcTimeToMin", 0, 59]
  ].forEach(([sel, s, e]) => populateSelect($(sel), s, e));

  /* --------------------------------------------------
     🔹 Employee Lookup
     -------------------------------------------------- */
  //bindEmpLookup("#funcRequestBy", { SNAME: "#funcRequestByName" });

  bindEmpLookup("#funcTraineeCode", {
    SNAME: "#funcTraineeName",
    SPOSITION: "#funcTraineePosition",
    SSEC: "#funcTraineeSec",
    SDEPT: "#funcTraineeDept",
    SDIV: "#funcTraineeDiv",
    SPOSCODE: "input[name='funcTraineeposcode']"
  });
//, window.getEmpUrl
  /* --------------------------------------------------
     🔹 Expense Option Toggle
     -------------------------------------------------- */
  const $reasonBox = $("#funcReasonBox");
  const $compareUpload = $("#funcCompareUpload");
  const $part6 = $("#func_part6");

  $("input[name='funcExpenseOption']").on("change", function () {
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

  /* --------------------------------------------------
     🔹 Free Reason Toggle
     -------------------------------------------------- */
  $("input[name='funcReason']").on("change", function () {
    if ($(this).val() === "1") $part6.addClass("hidden");
    else $part6.removeClass("hidden");
  });

  /* --------------------------------------------------
     🔹 VAT Calculation (Auto 7%)
     -------------------------------------------------- */
  const $amountInput = $("#funcAmountInput");
  const $vatResult = $("#funcVatResult").addClass("hidden").text("");

  $amountInput.val("").on("input", function () {
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

  console.log("✅ Functional Form initialized successfully");
}




// ✅ กัน init ซ้ำ
initFunctionalForm.initialized = false;
