  import { showAlert } from "./formUtils.js";
  console.log("✅ manage_group.js loaded V1");

  $(document).ready(function () {
    const ddl = $("#ddlFormType");
    const tbody = $("#tbodyGroup");
    const groupContainer = $("#groupContainer");
    const baseUrl = $("#txt_base_url").val() || "";

    // โหลด form types
    $.ajax({
      url: baseUrl + "gpform/GP-TRN/Training_manage/get_form_types",
      method: "GET",
      dataType: "json"
    })
    .done(function (res) {
      ddl.empty().append('<option value="">-- เลือกประเภทแบบฟอร์ม --</option>');
      if (res.status === "success") {
        res.data.forEach(ft => {
          ddl.append(`<option value="${ft.FID}">${ft.FORM_NAME_TH} (${ft.FORM_NAME_EN})</option>`);
        });
      }
    });

    // เมื่อเลือกฟอร์ม
    ddl.on("change", function () {
      const fid = $(this).val();
      if (!fid) { groupContainer.addClass("hidden"); tbody.empty(); return; }

      loadFormRunning(fid);
    });

    // โหลดข้อมูล form running
    function loadFormRunning(fid) {
      tbody.html(`
        <tr><td colspan="5" class="p-3 text-center text-gray-500">กำลังโหลดข้อมูล...</td></tr>
      `);
      groupContainer.removeClass("hidden");

      $.ajax({
        url: baseUrl + "gpform/GP-TRN/Training_manage/get_form_running",
        method: "POST",
        data: { FID: fid },
        dataType: "json"
      })
      .done(function (res) {
        if (res.status !== "success" || res.data.length === 0) {
          tbody.html(`<tr><td colspan="5" class="p-3 text-center text-gray-500">ไม่พบข้อมูล</td></tr>`);
          return;
        }

        tbody.empty();

      res.data.forEach((row, idx) => {
        const link = `${baseUrl}gpform/GP-TRN/training?no=${row.NFRMNO}&orgNo=${row.VORGNO}&y=${row.CYEAR}&y2=${row.CYEAR2}&runNo=${row.NRUNNO}`;
        tbody.append(`
            <tr class="hover:bg-gray-50" data-cyear2="${row.CYEAR2}" data-nrunno="${row.NRUNNO}">
              <td class="p-2 text-center">
                <input type="checkbox" class="chkRow" data-formno="${row.FORMNO}">
              </td>

              <td class="p-2 whitespace-nowrap">
                <a href="${link}" target="_blank"
                  class="px-2 py-1 inline-flex items-center bg-blue-50 border border-blue-200 
                        rounded-md font-semibold text-blue-700 hover:bg-blue-100 transition">
                  <i class="bi bi-link-45deg text-blue-600 mr-1"></i>
                  ${row.FORMNO}
                </a>
              </td>

              <td class="p-2 truncate max-w-[200px]">${row.SUBJECT ?? "-"}</td>
              <td class="p-2 whitespace-nowrap">${formatDate(row.DATE_FROM)}</td>
              <td class="p-2 whitespace-nowrap">${formatDate(row.DATE_TO)}</td>
              <td class="p-2 whitespace-nowrap">
                <span>(${row.SEMPNO})</span> ${row.STNAME}
              </td>
            </tr>
          `);
        });
      });
    }

    // Select All
    $("#chkAll").on("change", function () {
      $(".chkRow").prop("checked", $(this).is(":checked"));
    });

    $("#btnUpdateGroup").on("click", function () {
        const checked = $(".chkRow:checked");
        const count = checked.length;
        
        if (count  < 2 ) {
            showAlert("⚠ แจ้งเตือน", "กรุณาเลือกอย่างน้อย 2 รายการ");
            return;
        }

        const list = checked.map(function () {
            const tr = $(this).closest("tr");
            return {
                formno: $(this).data("formno"),
                cyear2: tr.data("cyear2"),
                nrunno: tr.data("nrunno")
            };
        }).get();

        console.log("📦 Update Group →", list);
        $.ajax({
            url: baseUrl + "gpform/GP-TRN/Training/update_group_train",
            method: "POST",
            data: { items: list },
            dataType: "json",
            success: function (res) {
                if (res.status) {
                    showAlert("⚠ แจ้งเตือน", "อัปเดตเรียบร้อย ✔");
                    $("#chkAll").prop("checked", false);
                    loadFormRunning($("#ddlFormType").val());
                } else {
                    showAlert("⚠ แจ้งเตือน", "ไม่สามารถอัปเดตข้อมูลได้");
                }
            }
        });
    });



  });

  function formatDate(yyyymmdd) {
      if (!yyyymmdd || yyyymmdd.length !== 8) return "-";

      const y = yyyymmdd.substring(0, 4);
      const m = yyyymmdd.substring(4, 6);
      const d = yyyymmdd.substring(6, 8);

      return `${d}/${m}/${y}`;
  }