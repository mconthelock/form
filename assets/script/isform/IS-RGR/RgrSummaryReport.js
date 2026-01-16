import { sys } from "typescript";
import { showFlow, doaction, redirectWebflow } from "@public/_form.js";
// 'doaction' และ 'redirectWebflow' ไม่ถูกเรียกใช้ในไฟล์นี้ จึงลบออกเพื่อความกระชับ
import { host } from "../../utils.js";

// ใช้ $(async function() { ... }) ที่สั้นกว่า $(document).ready(async function () { ... })
$(async function () {
  const $tableBody = $("#systemsTable tbody");
  const $flowContainer = $(".flow");

  // 1. เพิ่มสถานะ Loading แบบ matching create page
  $tableBody.html(`
    <tr>
      <td colspan="7" class="text-center py-16">
        <div class="flex flex-col items-center gap-4 opacity-40">
          <div class="loading loading-spinner loading-lg text-primary"></div>
          <p class="text-slate-600 font-medium">Loading report data...</p>
        </div>
      </td>
    </tr>
  `);
  $flowContainer.html(`
    <div class="flex items-center justify-center gap-3 py-6">
      <div class="loading loading-spinner loading-md text-primary"></div>
      <span class="text-slate-600 font-medium">Loading workflow...</span>
    </div>
  `);

  try {
    const formData = $(".form-data").data();
    // Destructure เฉพาะตัวแปรที่จำเป็นต้องใช้
    const { nfrmno, vorgno, cyear, cyear2, nrunno, empno } = formData;

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
    console.log(data); // เก็บไว้สำหรับ debug

    const period = data.period == 1 ? "1st Half" : "2nd Half";
    const year = data.year || "N/A";
    const remark = data.remark || "-";
    const systems = data.systems || [];

    // Set period/year/remark
    $("#period-text").text(period);
    $("#year-text").text(year);
    $("#remark-view").text(remark);

    // 5. Refactor การสร้างตารางโดยใช้ array.map() - matching create page style
    let tbodyHtml;
    if (!systems.length) {
      tbodyHtml = `
        <tr>
          <td colspan="7" class="text-center py-16">
            <div class="flex flex-col items-center opacity-40">
              <i class="fa-solid fa-folder-open text-6xl mb-3 text-slate-300"></i>
              <span class="text-xl font-medium text-slate-600">No systems found.</span>
            </div>
          </td>
        </tr>
      `;
    } else {
      tbodyHtml = systems
        .map((system, sysIdx) => {
          const programs = system.programs || [];
          const rowspan = programs.length || 1;

          const uniqueForms = Array.from(new Map(
            programs.flatMap(p => p.form_unmatch || []).map(f => [f.NRUNNO, f])
          ).values());
          console.log(uniqueForms); // เก็บไว้สำหรับ debug
          // สร้าง helper function สำหรับ render cell ของ system - matching create page
          const systemCells = (rspan) => `
          <td rowspan="${rspan}" class="bg-base-200/50 text-center text-lg font-black border-r border-base-300">${sysIdx + 1}</td>
          <td rowspan="${rspan}" class="align-top p-4 border-r border-base-300">
            <div class="font-bold text-2xl text-primary mb-1">${system.main_system_name || "N/A"}</div>
            <p class="text-xs text-base-content/70 leading-relaxed">Check consistency of user IDs and authorizations of user IDs accessible to ${system.main_system_name}</p>
          </td>
          <td rowspan="${rspan}" class="align-top text-center p-4 border-r border-base-300">
            <div class="stat p-0">
              <div class="stat-value text-2xl">${system.total_users || 0}</div>
              <div class="stat-desc font-bold  uppercase">Users</div>
            </div>
          </td>
          <td rowspan="${rspan}" class="align-top text-center p-4 border-r border-base-300">
            <div class="stat p-0">
              <div class="stat-value ${(system.unmatched || 0) > 0 ? 'text-error' : ''} text-2xl">${system.unmatched || 0}</div>
              <div class="stat-desc font-bold ${(system.unmatched || 0) > 0 ? 'text-error/60' : ''} uppercase">Users</div>
              <div class="flex flex-col mt-2 gap-1 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
              ${uniqueForms.map(form => `
                    <a target="_blank" href="http://amecwebtest.mitsubishielevatorasia.co.th/form/isform/IS-RGV/main/?no=7&orgNo=050601&y=25&y2=2025&runNo=${form.NRUNNO}" 
                        class="btn btn-xs btn-outline btn-info no-underline normal-case justify-start">
                        Form No :  ${form.NRUNNO}
                    </a>
                `).join('')}
              </div>
            </div>
          </td>
        `;

          // กรณี system ไม่มี programs
          if (programs.length === 0) {
            return `
            <tr class="hover transition-all duration-200">
              ${systemCells(1)}
              <td class="p-4 border-b border-base-200">
                <span class="text-slate-400 italic text-sm">No programs</span>
              </td>
              <td class="p-4 border-b border-base-200 text-center">
                <div class="flex items-center justify-center gap-3 text-xs text-slate-400">
                  <span>Delete: <span class="font-semibold">0</span></span>
                  <span class="text-slate-300">|</span>
                  <span>Change: <span class="font-semibold">0</span></span>
                </div>
              </td>
              <td class="p-4 border-b border-base-200">
                <span class="text-slate-400 italic text-sm">-</span>
              </td>
            </tr>`;
          }

          // กรณีปกติ: map program rows
          return programs
            .map((program, progIdx) => {
              const isFirst = progIdx === 0;
              const borderClass = (isFirst && sysIdx !== 0) ? "border-t-4 border-base-300" : "";

              return `
                <tr class="hover ${borderClass} transition-all duration-200">
                  ${isFirst ? systemCells(rowspan) : ""}
                  
                  <td class="p-4 border-b border-base-200">
                    <div class="flex flex-col gap-2">
                      <span class="font-bold text-sm text-base-content/80">${program.name || '-'}</span>
                    </div>
                  </td>

                  <td class="p-4 border-b border-base-200">
                    <div class="flex flex-wrap gap-2 justify-center text-sm">
                      <span class="text-error font-semibold">
                        Delete: ${program.delete_count || 0}
                      </span>
                      <span class="text-slate-300">|</span>
                      <span class="text-warning font-semibold">
                        Change: ${program.change_count || 0}
                      </span>
                    </div>
                  </td>

                  <td class="p-4 border-b border-base-200">
                    <div class="text-sm text-slate-700 leading-relaxed">
                      ${program.detail_remark || "<span class='text-slate-400 italic'>No details provided</span>"}
                    </div>
                  </td>
                </tr>
              `;
            })
            .join("");
        })
        .join("");
    }

    $tableBody.html(tbodyHtml);

    $(".btn-submit").on("click", async function (e) {
      e.preventDefault();
      const action = $(this).data("action");
      const confirm = await doaction(nfrmno, vorgno, cyear, cyear2, nrunno, action, empno, "");
      if (confirm.status) redirectWebflow();
    });
  } catch (error) {
    // 7. Robust Error Handling แบบ matching create page style
    console.error("Failed to load report data:", error);
    $tableBody.html(`
      <tr>
        <td colspan="7" class="text-center py-16">
          <div class="flex flex-col items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
              <i class="fa-solid fa-exclamation-triangle text-4xl text-error"></i>
            </div>
            <div class="space-y-1">
              <p class="text-error font-semibold text-lg">Failed to load report data</p>
              <p class="text-slate-500 text-sm">Please refresh the page or try again later.</p>
            </div>
          </div>
        </td>
      </tr>
    `);
    $flowContainer.html(`
      <div class="alert alert-error shadow-lg">
        <div>
          <i class="fa-solid fa-exclamation-circle"></i>
          <span>Failed to load workflow</span>
        </div>
      </div>
    `);
  }
});
