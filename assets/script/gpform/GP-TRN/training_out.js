// =====================================================
// 📦 GP-TRN: Outside Learning Form (jQuery Version)
// =====================================================

import { bindEmpLookup } from "./emp_lookup.js";
import { populateSelect } from "./formUtils.js";

let outInitialized = false;

export function initOutForm() {
  console.log("🚀 init Outside Form");
  if (outInitialized) return;
  outInitialized = true;

  /* =====================================================
     🔹 Helper Functions
     ===================================================== */
  const resetRowIndex = () => {
    $("#out_participants .participant-row").each((i, row) =>
      $(row).find(".row-index").text(i + 1)
    );
  };

  const resetRowDetails = ($row) => {
    $row.find(".emp-name, .emp-pos, .emp-sec, .emp-dept, .emp-div").text("");
  };

  const checkDuplicateEmp = ($input) => {
    const value = $input.val().trim();
    if (!value) return;

    const allCodes = $("#out_participants .outTraineecode-input")
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
    const $empInput = $row.find(".outTraineecode-input");
    if ($empInput.length) {
      bindEmpLookup($empInput, {
        SNAME: $row.find(".emp-name"),
        SPOSITION: $row.find(".emp-pos"),
        SSEC: $row.find(".emp-sec"),
        SDEPT: $row.find(".emp-dept"),
        SDIV: $row.find(".emp-div"),
        SPOSCODE: $empInput.closest("td").find("input[name='outTraineeposcode[]']")
      });

      $empInput.on("blur", () => checkDuplicateEmp($empInput));
    }
  };

  /* =====================================================
     🔹 Time Dropdown (Part 1)
     ===================================================== */
  [
    ["#outTimeFromHour", 0, 23],
    ["#outTimeToHour", 0, 23],
    ["#outTimeFromMin", 0, 59],
    ["#outTimeToMin", 0, 59]
  ].forEach(([sel, s, e]) => populateSelect($(sel), s, e));

  /* =====================================================
     🔹 Objective Section (Part 2)
     ===================================================== */
  $(document).off("click.addObjective").on("click.addObjective", ".add-objective", function () {
    const $clone = $(this).closest(".objective-item").clone();
    $clone.find("input").val("");
    $(this).closest("#outObjectiveList").append($clone);
  });

  /* =====================================================
     🔹 Expectation Section (Part 3)
     ===================================================== */
  $(document).off("click.addExpectation").on("click.addExpectation", ".add-expectation", function () {
    const $clone = $(this).closest(".expectation-item").clone();
    $clone.find("input").val("");
    $(this).closest("#outExpectationList").append($clone);
  });

  /* =====================================================
     🔹 Participants Table (Part 4)
     ===================================================== */
    $("#out_participants .participant-row").each((_, row) => bindRow($(row)));
    /* =====================================================
      🔹 Add Row
      ===================================================== */
    $("#add-out-participant").off("click").on("click", () => {
      const $tbody = $("#out_participants tbody");
      const $firstRow = $tbody.find(".participant-row").first();
      const $newRow = $firstRow.clone();

      $newRow.find("input").val("");
      resetRowDetails($newRow);

      $tbody.append($newRow);
      resetRowIndex();
      bindRow($newRow);
    });


    /* =====================================================
      🔹 Remove Row
      ===================================================== */
    $("#out_participants")
      .off("click.outRemove")
      .on("click.outRemove", ".remove-out-row", function () {
        const $tbody = $("#out_participants tbody");
        const rows = $tbody.find(".participant-row");

        if (rows.length > 1) {
          $(this).closest("tr").remove();
          resetRowIndex();
          updateTotalCost(); // ✅ ถ้ามีฟังก์ชันนี้ใน Out form ด้วย
        } else {
          alert("ต้องมีผู้ขอศึกษาดูงานอย่างน้อย 1 คน");
        }
    });


  /* =====================================================
     🔹 Initial Binding (First Row)
     ===================================================== */
  $("#out_participants .participant-row").each((_, row) => bindRow($(row)));
  resetRowIndex();

  console.log("✅ Outside Form initialized successfully");
}
