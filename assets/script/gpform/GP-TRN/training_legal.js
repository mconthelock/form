// =====================================================
// 📦 GP-TRN: Legal Training Form (jQuery Version)
// =====================================================

import { populateSelect, bindMaxLengthAlert } from "./formUtils.js";
import { bindEmpLookup } from "./emp_lookup.js";

let legalInitialized = false;

export function initLegalForm() {
  console.log("🚀 init Legal Form");
  if (legalInitialized) return;
  legalInitialized = true;

  /* =====================================================
     🔹 Helper Functions
     ===================================================== */
  const resetRowIndex = () => {
    $("#legal_participants .participant-row").each((i, row) =>
      $(row).find(".row-index").text(i + 1)
    );
  };

  const resetRowDetails = ($row) => {
    $row.find(".emp-name, .emp-pos, .emp-sec, .emp-dept, .emp-div").text("");
  };

  const checkDuplicateEmp = ($input) => {
    const value = $input.val().trim();
    if (!value) return;

    const allCodes = $("#legal_participants .legalTraineecode-input")
      .map((_, el) => $(el).val().trim())
      .get()
      .filter(v => v);

    const count = allCodes.filter(code => code === value).length;
    if (count > 1) {
      alert("⚠ รหัสพนักงานนี้ถูกใช้ซ้ำแล้ว: " + value);
      $input.val("").data("cancelLookup", "1").addClass("border-red-500");
      const $row = $input.closest("tr");
      resetRowDetails($row);
      setTimeout(() => $input.removeClass("border-red-500"), 2000);
    }
  };

  const bindRow = ($row) => {
    const $empInput = $row.find(".legalTraineecode-input");
    if ($empInput.length) {
      bindEmpLookup($empInput, {
        SNAME: $row.find(".emp-name"),
        SPOSITION: $row.find(".emp-pos"),
        SSEC: $row.find(".emp-sec"),
        SDEPT: $row.find(".emp-dept"),
        SDIV: $row.find(".emp-div"),
        SPOSCODE: $empInput.closest("td").find("input[name='legalTraineeposcode[]']")
      });

      $empInput.on("blur", () => checkDuplicateEmp($empInput));
    }
  };


  /* =====================================================
     🔹 Bind แถวแรกของตาราง
     ===================================================== */
  $("#legal_participants .participant-row").each((_, row) => bindRow($(row)));

  /* =====================================================
     🔹 Add Row
     ===================================================== */
  $("#add-participant").off("click").on("click", () => {
    const $tbody = $("#legal_participants tbody");
    const $firstRow = $tbody.find(".participant-row").first();
    const $newRow = $firstRow.clone();

    $newRow.find("input").val("");
    resetRowDetails($newRow);

    $tbody.append($newRow);
    resetRowIndex();
    bindRow($newRow);
  });


    $("#legal_participants")
    .off("click.legalRemove")
    .on("click.legalRemove", ".remove-legal-row", function () {
      const $tbody = $("#legal_participants tbody");
      const rows = $tbody.find(".participant-row");

      if (rows.length > 1) {
        $(this).closest("tr").remove();
        resetRowIndex();
        updateTotalCost(); // อัปเดตราคารวมใหม่
      } else {
        alert("ต้องมีผู้เข้าอบรมอย่างน้อย 1 คน");
      }
  });


  /* =====================================================
     🔹 Expense Toggle (Part 6)
     ===================================================== */
  const $reasonBox = $("#legalReasonBox");
  const $compareUpload = $("#legalCompareUpload");
  const $part7 = $("#legal_part7");

  $("input[name='legalExpenseOption']").on("change", function () {
    const val = $(this).val();
    if (val === "0") {
      $reasonBox.removeClass("hidden");
      $compareUpload.addClass("hidden");
      $part7.addClass("hidden");
    } else if (val === "1") {
      $reasonBox.addClass("hidden");
      $compareUpload.removeClass("hidden");
      $part7.removeClass("hidden");
    }
  });

  /* =====================================================
   🔹 Validate before selecting Expense Option
   ===================================================== */
  $("input[name='legalExpenseOption']").on("click", function (e) {
    let hasError = false;

    $("#legal_participants tbody tr").each(function () {
      const code = $(this).find("input[name='legalTraineecode[]']").val()?.trim();
      const cost = $(this).find("input[name='legalTraineecost[]']").val()?.trim();
      if (!code || !cost) {
        alert("⚠ กรุณากรอกรหัสพนักงานและค่าใช้จ่ายให้ครบทุกแถว ก่อนเลือกการพิจารณาค่าฝึกอบรม");
        $(this).find("input").addClass("border-red-500");
        setTimeout(() => $(this).find("input").removeClass("border-red-500"), 2000);
        hasError = true;
        return false;
      }
    });

    if (hasError) {
      e.preventDefault();
      return false;
    }

    const total = parseFloat($("#legalAmountInput").val()) || 0;
    if (total === 0) {
      $("input[name='legalExpenseOption'][value='0']").prop("checked", true);
      $("input[name='legalReason'][value='1']").prop("checked", true);
      $("#legalReasonBox").removeClass("hidden");
      $("#legalCompareUpload").addClass("hidden");
      $("#legal_part7").addClass("hidden");
      console.log("💡 ค่า Amount = 0 → เซตเป็น อบรมฟรี อัตโนมัติ");
    }
  });

  /* =====================================================
     🔹 Free Reason Toggle
     ===================================================== */
  $("input[name='legalReason']").on("change", function () {
    if ($(this).val() === "1") $part7.addClass("hidden");
    else $part7.removeClass("hidden");
  });

  /* =====================================================
   🔹 VAT Calculation (Part 7)
   ===================================================== */
  const $vatResult = $("#legalVatResult").addClass("hidden").text("");
  const $amountInput = $("#legalAmountInput");

  if (!$amountInput.val() || $amountInput.val().trim() === "") {
    $amountInput.val(0);
  }

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

  /* =====================================================
   🔹 Total Cost Calculation (auto sum trainee cost)
   ===================================================== */
  function updateTotalCost() {
    let total = 0;
    $("input[name='legalTraineecost[]']").each(function () {
      const val = parseFloat($(this).val());
      if (!isNaN(val)) total += val;
    });

    $("#legalAmountInput").val(total);

    const vat = total * 0.07;
    const grandTotal = total + vat;
    if (total > 0) {
      $("#legalVatResult")
        .text(`รวมทั้งหมด: ${grandTotal.toLocaleString()} บาท (VAT 7%: ${vat.toLocaleString()} บาท)`)
        .removeClass("hidden");
    } else {
      $("#legalVatResult").addClass("hidden").text("");
    }

    // ✅ ตรวจ logic อัตโนมัติสำหรับ อบรมฟรี / disable
    const $expense0 = $("input[name='legalExpenseOption'][value='0']");
    const $reasonFree = $("input[name='legalReason'][value='1']");
    const $reasonOther = $("input[name='legalReason'][value='0']");
    const $reasonBox = $("#legalReasonBox");

    if (total === 0) {
      $expense0.prop("checked", true);
      $reasonFree.prop("checked", true).prop("disabled", false);
      $reasonOther.prop("disabled", false);
      $reasonBox.removeClass("hidden");
      $("#legalCompareUpload").addClass("hidden");
      $("#legal_part7").addClass("hidden");
    } else {
      $reasonFree.prop("checked", false).prop("disabled", true);
      $reasonOther.prop("disabled", false);
      $("#legal_part7").removeClass("hidden");
    }
  }
  $(document).on("input", "input[name='legalTraineecost[]']", updateTotalCost);

  /* =====================================================
     🔹 Time Dropdown
     ===================================================== */
  [
    ["#legalTimeFromHour", 0, 23],
    ["#legalTimeToHour", 0, 23],
    ["#legalTimeFromMin", 0, 59],
    ["#legalTimeToMin", 0, 59]
  ].forEach(([sel, s, e]) => populateSelect($(sel), s, e));

  resetRowIndex();
  console.log("✅ Legal Form initialized successfully");
}
