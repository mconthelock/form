import { showFlow, doaction, redirectWebflow } from "../../inc/_form.js";
// 'doaction' และ 'redirectWebflow' ไม่ถูกเรียกใช้ในไฟล์นี้ จึงลบออกเพื่อความกระชับ
import { host } from "../../utils.js";

// ใช้ $(async function() { ... }) ที่สั้นกว่า $(document).ready(async function () { ... })
$(async function () {
  const $tableBody = $("#systemsTable tbody");
  const $flowContainer = $(".flow");

  // 1. เพิ่มสถานะ Loading เพื่อ UX ที่ดีขึ้น
  $tableBody.html(`<tr><td colspan="7" class="text-center py-10 text-gray-500">Loading data...</td></tr>`);
  $flowContainer.html(`<div class="text-center text-gray-500">Loading flow...</div>`);

  try {
    const formData = $(".form-data").data();
    // Destructure เฉพาะตัวแปรที่จำเป็นต้องใช้
    const { nfrmno, vorgno, cyear, cyear2, nrunno , empno } = formData;

    // 2. เรียก AJAX และ showFlow พร้อมกันด้วย Promise.all เพื่อประสิทธิภาพที่ดีขึ้น
    const [flow, data] = await Promise.all([
      showFlow(nfrmno, vorgno, cyear, cyear2, nrunno),
      $.ajax({
        url: host + "isform/IS-RGR/Main/DataSummaryReport",
        method: "POST",
        data: { nfrmno, vorgno, cyear, cyear2, nrunno },
        dataType: "json",
      }),
    ]);

    // 3. Render Flow
    $flowContainer.html(flow.html);

    // 4. Render Data
    // console.log(data); // เก็บไว้สำหรับ debug

    const period = data.period == 1 ? "1st half" : "2nd half";
    const year = data.year || "N/A"; // ใช้ "N/A" หรือ "-" แทน ""
    const remark = data.remark || "-";
    const systems = data.systems || [];

    // Set period/year/remark
    $("#period-text").text(period);
    $("#year-text").text(year);
    $("#remark-view").text(remark);

    // 5. Refactor การสร้างตารางโดยใช้ array.map()
    let tbodyHtml;
    if (!systems.length) {
      tbodyHtml = `<tr><td colspan="7" class="text-center py-10 text-gray-500">No systems found.</td></tr>`;
    } else {
      tbodyHtml = systems
        .map((system, sysIdx) => {
          const programs = system.programs || [];
          const rowspan = programs.length || 1; // ถ้าไม่มี program ให้ rowspan เป็น 1

          // สร้าง helper function (arrow function) สำหรับ render cell ของ system
          const systemCells = (rspan) => `
          <td rowspan="${rspan}" class="align-top text-center font-bold text-lg pt-4 border-r">${sysIdx + 1}</td>
          <td rowspan="${rspan}" class="align-top text-base pt-4 border-r">
            Check consistency of user IDs and authorizations of user IDs accessible to <span class="font-semibold">${system.main_system_name || "N/A"}</span>
          </td>
          <td rowspan="${rspan}" class="align-top text-center pt-4 border-r">
            <span class="font-bold">${system.total_users || 0}</span>
          </td>
          <td rowspan="${rspan}" class="align-top text-center pt-4 border-r">
            <span class="${(system.unmatched || 0) > 0 ? "text-red-600 font-bold" : "text-gray-500"}">${system.unmatched || 0}</span>
          </td>
        `;

          // [BUG FIX] กรณี system ไม่มี programs
          if (programs.length === 0) {
            return `
            <tr>
              ${systemCells(1)}
              <td class="text-center align-middle border-b w-[200px] text-gray-400 italic">(No programs listed)</td>
              <td class="flex text-center align-middle gap-2 text-gray-400">
                <span>Delete: <span class="font-bold">0</span></span>
                <span>Change: <span class="font-bold">0</span></span>
              </td>
              <td class="align-middle border-b p-2 text-gray-400 italic">-</td>
            </tr>`;
          }

          // กรณีปกติ: map program rows
          return programs
            .map(
              (program, progIdx) => `
          <tr>
            ${progIdx === 0 ? systemCells(rowspan) : ""}
            <td class="text-center align-middle border-b w-[200px]">
              <span class="block text-base font-medium">${program.name || "N/A"}</span>
            </td>
            <td class="text-center align-middle border-b gap-3">
              <span>Delete: <span class="font-bold">${program.delete_count || 0}</span></span>
              <span>Change: <span class="font-bold">${program.change_count || 0}</span></span>
            </td>
            <td class="align-middle border-b p-2">
              <div class="text-left">${program.detail_remark || "-"}</div>
            </td>
          </tr>
        `
            )
            .join(""); // .join() เพื่อรวม array ของ string
        })
        .join("");
    }

    $tableBody.html(tbodyHtml);

    // 6. Add page number/footer
    if ($(".paper-report").length) {
      $(".paper-report").append('<div class="mt-8 text-xs text-gray-400 text-center print:text-black">Page 1 of 1</div>');
    }

    $(".btn-submit").on("click", async function (e) {
      e.preventDefault();
      const action = $(this).data("action");
      const confirm = await doaction(nfrmno, vorgno, cyear, cyear2, nrunno, action, empno, "");
      if (confirm.status) redirectWebflow();
    });
  } catch (error) {
    // 7. Robust Error Handling (สำคัญมาก)
    console.error("Failed to load report data:", error);
    $tableBody.html(`<tr><td colspan="7" class="text-center py-10 text-red-500 font-semibold">Error: Failed to load report data. Please try again.</td></tr>`);
    $flowContainer.html(`<div class="text-center text-red-500 font-semibold">Error: Failed to load flow.</div>`);
  }
});
