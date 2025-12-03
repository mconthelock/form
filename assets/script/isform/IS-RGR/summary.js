import { host } from "../../utils.js";
import { createForm, redirectWebflow } from "../../inc/_form.js";
import Swal from "sweetalert2";


$(document).ready(function () {
  const formData = $(".form-data").data();
  const { nfrmno, vorgno, cyear, cyear2, nrunno, empno } = formData;
  function renderTable(systems) {
    let tbody = "";
    // Check if systems is empty or all total_users are 0
    const allTotalUsersZero = systems.length > 0 && systems.every((s) => Number(s.total_users) === 0);
    if (!systems.length || allTotalUsersZero) {
      tbody = `<tr>
          <td colspan="7" class="text-center py-10 text-gray-500">
            <i class="fa-solid fa-circle-info mr-2"></i> No systems found.
          </td>
        </tr>`;
      $("#systemsTable tbody").html(tbody);
      $(".remark-div").hide();
      return;
    }
    systems.forEach(function (system, sysIdx) {
      let programs = system.programs || [];
      let rowspan = programs.length || 1;
      programs.forEach(function (program, progIdx) {
        tbody += `<tr class="program-row group hover:bg-gray-50 transition-colors duration-200${progIdx === 0 && sysIdx !== 0 ? " border-t-8 border-gray-100" : ""}">`;
        if (progIdx === 0) {
          tbody += `<td rowspan="${rowspan}" class="align-top text-center font-extrabold text-2xl pt-4 border-r">${sysIdx + 1}</td>
                    <td rowspan="${rowspan}" class="align-top text-base pt-4 border-r">
                      Check consistency of user IDs and authorizations of user IDs accessible to <span class="text-warning font-semibold">${system.main_system_name}</span>
                    </td>
                    <td rowspan="${rowspan}" class="align-top text-center pt-4 border-r">
                      <span class="badge badge-lg badge-success font-bold text-base">${system.total_users}</span>
                      <input type="hidden" name="">
                    </td>
                    <td rowspan="${rowspan}" class="align-top text-center pt-4 border-r">
                      <span class="badge badge-lg ${system.unmatched > 0 ? "badge-error" : "badge-ghost"} font-bold text-base">${system.unmatched}</span>
                    </td>`;
        }
        tbody += `<td class="text-center align-middle font-bold border-b w-[200px]">
                    <div class="flex flex-col items-center gap-1">
                      <span class="block text-base">${program.name}</span>
                      <div class="flex gap-2 mt-1">
                        <span class="badge badge-outline badge-success text-xs px-2 py-1">
                          Checked: ${parseInt(program.matched) + parseInt(program.unmatched)}
                          <input type="hidden" name="programs[${program.program_id}][${program.name}][match]" value="${parseInt(program.matched)}">
                          <input type="hidden" name="programs[${program.program_id}][${program.name}][unmatch]" value="${parseInt(program.unmatched)}">
                        </span>
                        <span class="badge badge-outline badge-error text-xs px-2 py-1">
                          Uncheck: ${parseInt(program.uncheck)}
                          <input type="hidden" name="programs[${program.program_id}][${program.name}][uncheck]" value="${parseInt(program.uncheck)}">
                        </span>
                      </div>
                    </div>
                  </td>
                  <td class="text-center align-middle border-b">
                    <div class="flex gap-2 justify-center">
                      <input type="number" class="input input-sm input-bordered w-[80px] text-center font-medium action-count" id="" name="programs[${program.program_id}][${program.name}][delete_count]" placeholder="Delete" min="0">
                      <input type="number" class="input input-sm input-bordered w-[80px] text-center font-medium action-count" id="" name="programs[${program.program_id}][${program.name}][change_count]" placeholder="Change" min="0">
                    </div>
                  </td>
                  <td class="align-middle border-b p-2">
                    <textarea class="textarea textarea-bordered textarea-sm w-full h-12 resize-none focus:border-primary detail-remark" id="" name="programs[${program.program_id}][${program.name}][detail_remark]" placeholder="ระบุ User IDs และเหตุผลที่แนบมา..."></textarea>
                  </td>
                </tr>`;
      });
    });
    $("#systemsTable tbody").html(tbody);
    $(".remark-div").show();
  }

  function loadSystemsTable(period = null, year = null) {
    $.ajax({
      url: host + "isform/IS-RGR/Main/getSummaryData",
      method: "POST",
      dataType: "json",
      data: {
        period: period,
        year: year,
      },
      success: function (response) {
        // Assuming response is an array of systems
        renderTable(response.systems || []);
        $("#remark-div").show();
      },
      error: function () {
        $("#systemsTable tbody").html(
          `<tr>
                <td colspan="7" class="text-center py-10 text-red-500">
                    <i class="fa-solid fa-triangle-exclamation mr-2"></i> Failed to load data.
                </td>
            </tr>`
        );
      },
    });
  }

  // Hide remark-div by default
  $(".remark-div").hide();
  // Show initial message in table body
  $("#systemsTable tbody").html(
    `<tr>
      <td colspan="7" class="text-center py-10 text-gray-400">
        <i class="fa-solid fa-hand-pointer mr-2"></i> กรุณาเลือกช่วงเวลาและปีที่ต้องการ
      </td>
    </tr>`
  );
  // Initial load (do not load data until period/year selected)

  // Optionally, reload table on period/year change
  $("#period, #year").on("change", function () {
    const period = $("#period").val();
    const year = $("#year").val();

    loadSystemsTable(period, year);
  });

  $("#reviewForm").on("submit", async function (e) {
    e.preventDefault();

    const formData = $(this).serializeArray();
    const period = $("#period").val();
    const remark = $("#remark").val().trim();
    const result = [];

    let hasUncheck = false;

    formData.forEach(({ name, value }) => {
      const match = name.match(/^programs\[(\d+)\]\[(.+?)\]\[(.+?)\]$/);
      if (match) {
        const [, id, programName, field] = match;

        let program = result.find((p) => p.id === id && p.program_name === programName);
        if (!program) {
          program = { id, program_name: programName };
          result.push(program);
        }

        program[field] = value;

        if (field === "uncheck" && parseInt(value, 10) > 0) {
          hasUncheck = true;
        }
      }
    });

    if (hasUncheck) {
      Swal.fire({
        icon: "warning",
        title: "พบรายการ Uncheck",
        text: "มีโปรแกรมที่ยังไม่ได้ตรวจสอบ (Uncheck) อยู่ กรุณาตรวจสอบข้อมูลให้ครบถ้วนก่อนส่งแบบฟอร์ม",
        confirmButtonText: "ตกลง"
      });
      return;
    }

    const form = await createForm(nfrmno, vorgno, cyear, empno, empno, "");
    const { runno: NRUNNO, cyear2: CYEAR2 } = form.message;

    $.ajax({
      url: host + "isform/IS-RGR/Main/submitReview",
      method: "POST",
      dataType: "json",
      data: {
        nfrmno,
        vorgno,
        cyear,
        cyear2: CYEAR2,
        nrunno: NRUNNO,
        period,
        empno,
        remark,
        data_result: result,
      },
      success: function (response) {
        // Handle success
      },
      error: function () {
        // Handle error
      },
    });
    console.log(result);
  });

  // $("#reviewForm").on("submit", function (e) {
  //   e.preventDefault();
  //   // Get all form data from #reviewForm
  //   const formDataObj = {};
  //   $(this)
  //     .serializeArray()
  //     .forEach(({ name, value }) => {
  //       formDataObj[name] = value;
  //     });

  //   console.log(formDataObj);

  // Transform flat formDataObj to nested structure
  // Example: programs[1][AS400][delete_count] => programs: { 1: { AS400: { delete_count: "" } } }
  // const result = { programs: {} };
  // Object.entries(formDataObj).forEach(([key, value]) => {
  //   const match = key.match(/^programs\[(\d+)\]\[([^\]]+)\]\[([^\]]+)\]$/);
  //   if (match) {
  //     const [, progId, progName, field] = match;
  //     if (!result.programs[progId]) result.programs[progId] = {};
  //     if (!result.programs[progId][progName]) result.programs[progId][progName] = {};
  //     result.programs[progId][progName][field] = value;
  //   } else if (key === "remark") {
  //     result.remark = value;
  //   }
  // });

  // console.log(result);

  // // Send the nested result to the server
  // $.ajax({
  //   url: host + "isform/IS-RGR/Main/submitReview",
  //   method: "POST",
  //   dataType: "json",
  //   data: result,
  //   success: function (response) {
  //     // Handle success
  //   },
  //   error: function () {
  //     // Handle error
  //   },
  // });
  // });
});
