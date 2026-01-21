// =====================================================
// 📦 GP-TRN: Training Form Selector (jQuery Version)
// =====================================================

import { initLegalForm } from "./training_legal.js";
import { initFunctionalForm } from "./training_functional.js";
import { initMethForm } from "./training_meth.js";
import { initPosForm } from "./training_pos.js";
import { initOutForm } from "./training_out.js";
import { showAlert } from "./formUtils.js";
import { initFormButtons } from "./training_main.js";


console.log("✅ training_select.js loaded (jQuery version)");

/* =====================================================
   🔹 Helper: Dynamic Add / Remove List Rows
===================================================== */
function bindDynamicList(containerId, listId, addClass, removeClass) {
  const $container = $("#" + containerId);
  if (!$container.length || $container.data("bound")) return;

  // ➕ Add new row
  $container.on("click", "." + addClass, function () {
    const $list = $("#" + listId);
    if (!$list.length || !$list.children().first().length) return;

    const $newRow = $list.children().first().clone();
    $newRow.find("input").val("");

    const $btn = $newRow.find("button");
    if ($btn.length) {
      $btn.removeClass(`${addClass} bg-green-500`)
          .addClass(`${removeClass} bg-red-500`)
          .text("−");
    }
    $list.append($newRow);
  });

  // ➖ Remove row
  $container.on("click", "." + removeClass, function () {
    $(this).closest(".objective-item, .expectation-item").remove();
  });

  $container.data("bound", 1);
}

/* =====================================================
   🔹 Initialization
===================================================== */
$(function () {
  const $selectCard  = $("#selectCard");
  const $requestForm = $("#requestForm");
  const $listItems   = $(".training-item");

  if (!$selectCard.length || !$requestForm.length || !$listItems.length) {
    console.error("❌ DOM not ready or elements missing");
    return;
  }

  // ----------------------------------------------
  // 🔹 Bind Dynamic Lists (ทุกฟอร์ม)
  // ----------------------------------------------
  [
    ["func_part2", "funcObjectiveList"],
    ["func_part3", "funcExpectationList"],
    ["legal_part3", "legalObjectiveList"],
    ["legal_part4", "legalExpectationList"],
    ["meth_part2", "methObjectiveList"],
    ["meth_part3", "methExpectationList"],
    ["pos_part2", "posObjectiveList"],
    ["pos_part3", "posExpectationList"],
    ["out_part2", "outObjectiveList"],
    ["out_part3", "outExpectationList"]
  ].forEach(([cid, lid], i) => {
    const isExpect = i % 2;
    bindDynamicList(
      cid,
      lid,
      isExpect ? "add-expectation" : "add-objective",
      isExpect ? "remove-expectation" : "remove-objective"
    );
  });

  // ----------------------------------------------
  // 🔹 Card Click → Open Form
  // ----------------------------------------------
  $listItems.on("click", function () {
    const $item = $(this);
    const type  = $item.data("type");
    if (!type) return;

    // highlight active
    $listItems.removeClass("ring-2 ring-indigo-500 bg-indigo-50");
    $item.addClass("ring-2 ring-indigo-500 bg-indigo-50");

    // redirect summary
    if (type === "summary_report") {
      const emp = $("#EMPNO").val();
      location.href = `${window.mainUrl}/show_summary_report?emp=${emp}`;
      return;
    }

    console.log("▶ เปิดฟอร์ม:", type);

    // hide list / show form
    $selectCard.addClass("hidden");
    $("#requestForm > div").addClass("hidden");

    const $form = $("#form_" + type);
    if (!$form.length) {
      console.warn(`⚠️ ไม่พบ #form_${type}`);
      showAlert("ไม่พบแบบฟอร์ม", `ไม่พบ element #form_${type}`);
      return;
    }

    $requestForm.removeClass("hidden");
    $form.removeClass("hidden");

    // init form (ครั้งเดียวต่อ type)
    if (!$form.data("inited")) {
      ({
        functional: initFunctionalForm,
        legal: initLegalForm,
        meth: initMethForm,
        pos: initPosForm,
        out: initOutForm,
        form_report: () => {},
        manage_group: () => {}
      }[type] || (() => {}))();

      $form.data("inited", 1);
    }

    // bind ปุ่ม Back / Send
    initFormButtons(type);
  });
});


/* =====================================================
   🔹 Manage Group → Lazy Load Partial
===================================================== */
function initManageGroup() {
  const base = $("#txt_base_url").val() || "";
  const url  = base + "gpform/GP-TRN/Training_manage";

  const $container = $("#form_manage_group");
  $container.html('<div class="p-6 text-center text-gray-600">กำลังโหลดหน้าจัดการกลุ่ม...</div>');

  // โหลด partial view เข้า div
  $container.load(url, function () {
    console.log("✔ Manage Group view loaded");

    // โหลด JS หลังจาก DOM partial พร้อม
    $.getScript(window.manageGroupJs, function () {
      console.log("✔ manage_group.js loaded");
    });
  });
}
