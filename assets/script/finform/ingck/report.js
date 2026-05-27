import { fetchUtils } from "@amec/webasset/api/fetch-utils";
import { getExtData, getFormDetail, getMode, showflow } from "@amec/webasset/api/webform";
import { showMessage } from "@amec/webasset/utils";
import { createTable } from "@amec/webasset/dataTable";
import { webflowSubmit } from "@amec/webasset/components/form";

function renderStampTable(response) {
  const data = response.datareport || [];
  const table = document.getElementById("stampTable");

  table.innerHTML = ""; // เคลียร์ก่อน

  // ✅ Header
  let header = `
    <thead>
      <tr>
        <th rowspan="3">D/M/Y</th>
        <th rowspan="3">Detail</th>
        <th colspan="8">Buy</th>
        <th colspan="8">Withdraw</th>
        <th colspan="8">Remaining</th>
        <th rowspan="3">Balance</th>
      </tr>
      <tr>
        ${[1,5,10,20].map(v => `<th colspan="2">${v}</th>`).join("")}
        ${[1,5,10,20].map(v => `<th colspan="2">${v}</th>`).join("")}
        ${[1,5,10,20].map(v => `<th colspan="2">${v}</th>`).join("")}
      </tr>
      <tr>
        ${Array(12).fill(`<th>Qty</th><th>Amt</th>`).join("")}
      </tr>
    </thead>
    <tbody></tbody>
  `;

  table.innerHTML = header;

  const tbody = table.querySelector("tbody");

  const sizes = [1,5,10,20];

  // ✅ Running balance
  let balance = {1:0,5:0,10:0,20:0};

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
  }

  data.forEach(item => {
    let tr = document.createElement("tr");

    let html = `
      <td>${formatDate(item.DATE_RECEIVE)}</td>
      <td>${item.REASON ?? "-"}</td>
    `;

    // ✅ BUY
    sizes.forEach(s => {
      let qty = item[`BUY_${s}_QTY`] || 0;
      let amt = item[`BUY_${s}_AMT`] || 0;

      balance[s] += qty;

      html += `<td>${qty}</td><td>${amt}</td>`;
    });

    // ✅ WITHDRAW
    sizes.forEach(s => {
      let qty = item[`WD_${s}_QTY`] || 0;
      let amt = item[`WD_${s}_AMT`] || 0;

      balance[s] -= qty;

      html += `<td>${qty}</td><td>${amt}</td>`;
    });

    // ✅ REMAINING
    sizes.forEach(s => {
      html += `<td>${balance[s]}</td><td>-</td>`;
    });

    // ✅ TOTAL BALANCE
    const total =
      balance[1] + balance[5] + balance[10] + balance[20];

    html += `<td>${total}</td>`;

    tr.innerHTML = html;
    tbody.appendChild(tr);
  });
}

// --- Fetch and UI control (load report by year) ---
let currentYear = new Date().getFullYear();

function updateYearUI() {
  const yEl = document.getElementById('year');
  if (yEl) yEl.innerText = currentYear;
  const rEl = document.getElementById('reportYear');
  if (rEl) rEl.innerText = currentYear;
}

async function loadReport(year) {
  try {
    const url = `/finform/fin-ds/form/report/${year}`;

    console.log("URL:", window.location.href);

     const res = await fetch(url, { headers: { Accept: 'application/json' } });

    if (!res.ok) {
      const text = await res.text();
      console.error(`HTTP ${res.status}: ${text}`);
      return;
    }

    const data = await res.json();
    renderStampTable(data);
  } catch (err) {
    console.error('โหลดข้อมูลไม่สำเร็จ:', err);
  }
}

function changeYear(step) {
  currentYear += step;
  updateYearUI();
  loadReport(currentYear);
}

document.addEventListener('DOMContentLoaded', () => {
  updateYearUI();
  loadReport(currentYear);

  // Attach simple handlers to navigation buttons if present
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const text = (e.currentTarget.textContent || '').trim();
      const step = text.includes('<') ? -1 : 1;
      changeYear(step);
    });
  });
});