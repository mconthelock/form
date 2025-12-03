import { initLegalForm } from "./training_legal.js";
import { initFunctionalForm } from "./training_functional.js";
import { initMethForm } from "./training_meth.js";
import { initPosForm } from "./training_pos.js";
import { initOutForm } from "./training_out.js";
import { showAlert } from "./formUtils.js";
import { initFormButtons } from "./training_main.js";

console.log("✅ training_select.js loaded (Auto-Open Final Stable Version)");

/* =====================================================
   🔹 Helper: Dynamic Add / Remove List Rows
   ===================================================== */
function bindDynamicList(containerId, listId, addClass, removeClass) {
  const container = document.getElementById(containerId);
  if (!container || container.dataset.bound) return;

  container.addEventListener("click", (e) => {
    // ➕ Add new row
    if (e.target.classList.contains(addClass)) {
      const list = document.getElementById(listId);
      if (!list || !list.firstElementChild) return;

      const template = list.firstElementChild.cloneNode(true);
      template.querySelectorAll("input").forEach((inp) => (inp.value = ""));

      const btn = template.querySelector("button");
      if (btn) {
        btn.classList.remove(addClass, "bg-green-500");
        btn.classList.add(removeClass, "bg-red-500");
        btn.textContent = "−";
      }
      list.appendChild(template);
    }

    // ➖ Remove row
    if (e.target.classList.contains(removeClass)) {
      const row = e.target.closest(".objective-item, .expectation-item");
      if (row) row.remove();
    }
  });

  container.dataset.bound = "1";
}

/* =====================================================
   🔹 Initialization
   ===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const selectCard  = document.getElementById("selectCard");
  const requestForm = document.getElementById("requestForm");
  const detailBox   = document.getElementById("detailBox");
  const detailTitle = document.getElementById("detailTitle");
  const detailDesc  = document.getElementById("detailDesc");
  const listItems   = document.querySelectorAll(".training-item");

  if (!selectCard || !requestForm || listItems.length === 0) {
    console.error("❌ DOM not ready or elements missing in page");
    return;
  }


  /* ----------------------------------------------
     🔹 Bind Dynamic Lists (ทุกฟอร์ม)
     ---------------------------------------------- */
  bindDynamicList("func_part2", "funcObjectiveList", "add-objective", "remove-objective");
  bindDynamicList("func_part3", "funcExpectationList", "add-expectation", "remove-expectation");
  bindDynamicList("legal_part3", "legalObjectiveList", "add-objective", "remove-objective");
  bindDynamicList("legal_part4", "legalExpectationList", "add-expectation", "remove-expectation");
  bindDynamicList("meth_part2", "methObjectiveList", "add-objective", "remove-objective");
  bindDynamicList("meth_part3", "methExpectationList", "add-expectation", "remove-expectation");
  bindDynamicList("pos_part2", "posObjectiveList", "add-objective", "remove-objective");
  bindDynamicList("pos_part3", "posExpectationList", "add-expectation", "remove-expectation");
  bindDynamicList("out_part2", "outObjectiveList", "add-objective", "remove-objective");
  bindDynamicList("out_part3", "outExpectationList", "add-expectation", "remove-expectation");

  /* ----------------------------------------------
     🔹 Auto-Open Form when Card Clicked
     ---------------------------------------------- */
  listItems.forEach((item) => {
    item.addEventListener("click", () => {
      const selectedType = item.dataset.type;
      if (!selectedType) return;

      // highlight active selection
      listItems.forEach((el) =>
        el.classList.remove("ring-2", "ring-indigo-500", "bg-indigo-50")
      );
      item.classList.add("ring-2", "ring-indigo-500", "bg-indigo-50");


      // redirect summary report
      if (selectedType === "summary") {
        window.location.href = `${window.mainUrl}/summary`;
        return;
      }

      console.log("▶ เปิดฟอร์ม:", selectedType);

      // hide list & show form
      selectCard.classList.add("hidden");
      document.querySelectorAll("#requestForm > div").forEach((div) => div.classList.add("hidden"));

      const selectedForm = document.getElementById("form_" + selectedType);
      if (!selectedForm) {
        console.warn(`⚠️ ไม่พบ element #form_${selectedType}`);
        showAlert("ไม่พบแบบฟอร์ม", `ไม่พบ element #form_${selectedType}`);
        return;
      }

      requestForm.classList.remove("hidden");
      selectedForm.classList.remove("hidden");

      // init form (ครั้งเดียวต่อ type)
      if (!selectedForm.dataset.inited) {
        switch (selectedType) {
          case "functional":
            initFunctionalForm(); break;
          case "legal":
            initLegalForm(); break;
          case "meth":
            initMethForm(); break;
          case "pos":
            initPosForm(); break;
          case "out":
            initOutForm(); break;
        }
        selectedForm.dataset.inited = "1";
      }

      // bind ปุ่ม back / send
      initFormButtons(selectedType);
    });
  });
});
