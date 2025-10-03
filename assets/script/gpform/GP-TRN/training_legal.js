import { populateSelect } from "./formUtils.js";
import { bindEmpLookup } from "./emp_lookup.js";

let legalInitialized = false;

export function initLegalForm() {
  console.log("🚀 init Legal Form");
  if (legalInitialized) return;
  legalInitialized = true;

  // =========================
  // 🔹 Reset Row Index
  // =========================
  function resetRowIndex() {
    document.querySelectorAll("#legal_participants .participant-row").forEach((row, i) => {
      row.querySelector(".row-index").textContent = i + 1;
    });
  }

  // =========================
  // 🔹 Reset Row Details
  // =========================
  function resetRowDetails(row) {
    if (!row) return;
    row.querySelectorAll(".emp-name, .emp-pos, .emp-sec, .emp-dept, .emp-div")
       .forEach(td => td.textContent = "");
  }

  // =========================
  // 🔹 Check Duplicate
  // =========================
  function checkDuplicateEmp(empInput) {
    const value = empInput.value.trim();
    if (!value) return;

    const allCodes = [];
    document.querySelectorAll("#legal_participants .legalTraineecode-input").forEach(inp => {
      if (inp.value.trim()) allCodes.push(inp.value.trim());
    });

    const count = allCodes.filter(code => code === value).length;
    if (count > 1) {
      alert("⚠ รหัสพนักงานนี้ถูกใช้ซ้ำแล้ว: " + value);

      empInput.value = "";
      empInput.dataset.cancelLookup = "1"; // 🚩 กัน bindEmpLookup เขียนทับ
      const row = empInput.closest("tr");
      resetRowDetails(row);

      empInput.classList.add("border-red-500");
      setTimeout(() => empInput.classList.remove("border-red-500"), 2000);
    }
  }

  // =========================
  // 🔹 Bind Row
  // =========================
  function bindRow(row) {
    const empInput = row.querySelector(".legalTraineecode-input");
    if (empInput) {
      bindEmpLookup(empInput, {
        SNAME: row.querySelector(".emp-name"),
        SPOSITION: row.querySelector(".emp-pos"),
        SSEC: row.querySelector(".emp-sec"),
        SDEPT: row.querySelector(".emp-dept"),
        SDIV: row.querySelector(".emp-div"),
      });
      empInput.addEventListener("blur", () => checkDuplicateEmp(empInput));
    }
  }

  // =========================
  // 🔹 Bind Request By
  // =========================
  const legalReqInput = document.getElementById("legalRequestBy");
  if (legalReqInput) {
    bindEmpLookup(legalReqInput, {
      SNAME: document.getElementById("legalRequestByName")
    });
  }

  // =========================
  // 🔹 Bind แถวแรก
  // =========================
  document.querySelectorAll("#legal_participants .participant-row").forEach(bindRow);

  // =========================
  // 🔹 Add Row
  // =========================
  const addBtn = document.getElementById("add-participant");
  if (addBtn && !addBtn.dataset.bound) {
    addBtn.addEventListener("click", () => {
      const tbody = document.querySelector("#legal_participants tbody");
      const firstRow = tbody.querySelector(".participant-row");
      const newRow = firstRow.cloneNode(true);

      newRow.querySelectorAll("input").forEach(el => el.value = "");
      resetRowDetails(newRow);

      tbody.appendChild(newRow);
      resetRowIndex();
      bindRow(newRow);
    });
    addBtn.dataset.bound = "1";
  }

  // =========================
  // 🔹 Remove Row
  // =========================
  if (!document.body.dataset.legalRemoveBound) {
    document.body.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-row")) {
        const tbody = document.querySelector("#legal_participants tbody");
        const rows  = tbody.querySelectorAll(".participant-row");
        if (rows.length > 1) {
          e.target.closest("tr").remove();
          resetRowIndex();
        } else {
          alert("ต้องมีผู้เข้าอบรมอย่างน้อย 1 คน");
        }
      }
    });
    document.body.dataset.legalRemoveBound = "1";
  }

  // =========================
  // 🔹 Expense Toggle (Part 6)
  // =========================
  const expenseRadios = document.querySelectorAll("input[name='legalExpenseOption']");
  const reasonBox = document.getElementById("legalReasonBox");
  const compareUpload = document.getElementById("legalCompareUpload");
  const part7 = document.getElementById("legal_part7");

  expenseRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      if (radio.value === "not_compare" && radio.checked) {
        reasonBox?.classList.remove("hidden");
        compareUpload?.classList.add("hidden");
        part7?.classList.add("hidden");   // ถ้า free → ไม่ต้องแสดงค่าใช้จ่าย
      } else if (radio.value === "compare" && radio.checked) {
        reasonBox?.classList.add("hidden");
        compareUpload?.classList.remove("hidden");
        part7?.classList.remove("hidden");
      }
    });
  });

  // Free reason toggle
  const reasonRadios = document.querySelectorAll("input[name='legalReason']");
  reasonRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      if (radio.value === "free" && radio.checked) {
        part7?.classList.add("hidden");
      } else {
        part7?.classList.remove("hidden");
      }
    });
  });

  // =========================
  // 🔹 VAT Calculation (Part 7)
  // =========================
  const vatResult = document.getElementById("legalVatResult");
  const amountInput = document.getElementById("legalAmount");
  if (vatResult) vatResult.classList.add("hidden");

  if (amountInput) {
    amountInput.value = "";
    amountInput.addEventListener("input", () => {
      if (!amountInput.value || !vatResult) return;

      const amount = parseFloat(amountInput.value);
      if (isNaN(amount)) {
        vatResult.textContent = "";
        vatResult.classList.add("hidden");
        return;
      }

      const vat = amount * 0.07;
      const total = amount + vat;
      vatResult.textContent =
        `รวมทั้งหมด: ${total.toLocaleString()} บาท (VAT 7%: ${vat.toLocaleString()} บาท)`;
      vatResult.classList.remove("hidden");
    });
  }

  // =========================
  // 🔹 Time Dropdown
  // =========================
  populateSelect(document.getElementById("legalTimeFromHour"), 0, 23);
  populateSelect(document.getElementById("legalTimeToHour"), 0, 23);
  populateSelect(document.getElementById("legalTimeFromMin"), 0, 59);
  populateSelect(document.getElementById("legalTimeToMin"), 0, 59);

  resetRowIndex();
}
