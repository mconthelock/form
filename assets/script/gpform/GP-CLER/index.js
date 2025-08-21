import "select2";
import "select2/dist/css/select2.min.css";
import { host } from "../../utils.js";
import { createForm, redirectWebflow } from "../../inc/_form.js";
import Swal from "sweetalert2";
$(document).ready(function () {
  $("#entertain-form-no").select2();
  const formData = $(".form-data").data();
  let nfrmno, vorgno, cyear;
  if (formData) {
    ({ nfrmno, vorgno, cyear } = formData);
  }
  $("#no-entertain").change(function () {
    if ($(this).is(":checked")) {
      $("#form-entertain").hide();
      $("#entertain-form-no").val("").trigger("change");
    } else {
      $("#form-entertain").show();
      $("#entertain-form-no").val("").trigger("change");
    }
  });

  let searchTimeout;
  $("#input-empcode").on("input", function () {
    const empcode = $(this).val().trim();

    // Clear previous timeout
    clearTimeout(searchTimeout);

    // If empty, clear the dropdown
    if (empcode === "") {
      $("#entertain-form-no").empty();
      $("#entertain-form-no").append($("<option>").val("").text("กรุณาใส่รหัสพนักงาน"));
      return;
    }

    // Set timeout to avoid too many requests
    searchTimeout = setTimeout(function () {
      $.ajax({
        type: "POST",
        url: host + "gpform/GP-CLER/main/getformEmp",
        data: {
          empno: empcode,
          orgNo: vorgno,
          y: cyear,
        },
        dataType: "json",
        beforeSend: function () {
          $("#entertain-form-no").empty();
          $("#entertain-form-no").append($("<option>").val("").text("กำลังโหลด..."));
        },
        success: function (response) {
          $("#entertain-form-no").empty();
          if (response.length > 0) {
            $("#entertain-form-no").append($("<option>").val("").text("เลือก Entertainment Form No."));
            response.forEach((item) => {
              console.log(item);
              $("#entertain-form-no").append(
                $("<option>")
                  .val(item.CYEAR2 + "/" + item.NRUNNO)
                  .text(item.form_number)
              );
            });
          } else {
            $("#entertain-form-no").append($("<option>").val("").text("ไม่พบข้อมูล Entertainment Form"));
          }
        },
        error: function () {
          $("#entertain-form-no").empty();
          $("#entertain-form-no").append($("<option>").val("").text("เกิดข้อผิดพลาดในการโหลดข้อมูล"));
        },
      });
    }, 500); // Wait 500ms after user stops typing
  });

  $("#file_group").on("change", function () {
    const fileList = $(this)[0].files;
    const $list = $("#file-list");
    $list.empty();
    if (fileList.length === 0) {
      $list.append("<li>ไม่พบไฟล์ที่เลือก</li>");
    } else {
      Array.from(fileList).forEach((file) => {
        $list.append(`<li>- ${file.name}</li>`);
      });
    }
  });

  $("#btn-submit").on("click", async function (e) {
    e.preventDefault();

    // Get values
    const p_join = $("input[name='president_join']:checked").val();
    const actual_cost = $("#actual-cost").val().trim();
    const remain = $("#remain").val().trim();
    const remark = $("#remark").val().trim();
    const formnumber = $("#formnumber").val();
    const fileInput = $("#receipt")[0];
    const file = fileInput.files[0];

    const ent = $(".form-ent").data();
    const ent_nfrmno = ent.nfrmno;
    const ent_vorgno = ent.vorgno;
    const ent_cyear = ent.cyear;
    const ent_cyear2 = ent.cyear2;
    const ent_nrunno = ent.nrunno;

    // Validate president_join
    if (!p_join) {
      Swal.fire({
        icon: "warning",
        title: "กรุณาเลือก President Join",
        toast: true,
        position: "top-end",
        timer: 3000,
        showConfirmButton: false,
        background: "#FBF6D9",
      });
      return;
    }

    // Validate actual_cost (required & number & >= 0)
    if (!actual_cost || isNaN(actual_cost) || parseFloat(actual_cost) < 0) {
      Swal.fire({
        icon: "warning",
        title: "กรุณาระบุ Actual Cost",
        toast: true,
        position: "top-end",
        timer: 3000,
        showConfirmButton: false,
        background: "#FBF6D9",
      });
      $("#actual-cost").focus();
      return;
    }

    // Validate file
    if (!file) {
      Swal.fire({
        icon: "warning",
        title: "กรุณาแนบไฟล์ใบเสร็จรับเงิน",
        toast: true,
        position: "top-end",
        timer: 3000,
        showConfirmButton: false,
        background: "#FBF6D9",
      });
      $("#receipt").addClass("input-error").focus();
      return;
    }

    // If file-group-section is visible, require at least one file in #file_group
    if (parseFloat(remain) < 0) {
      const fileGroupInput = $("#file_group")[0];
      if (!fileGroupInput || fileGroupInput.files.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "กรุณาแนบไฟล์ใน Attach File อย่างน้อย 1 ไฟล์",
          toast: true,
          position: "top-end",
          timer: 3000,
          showConfirmButton: false,
          background: "#FBF6D9",
        });
        $("#file_group").addClass("input-error").focus();
        return;
      }
    }

    // ถ้า remain < 0 ต้องมี remark
    if (parseFloat(remain) < 0 && remark === "") {
      Swal.fire({
        icon: "warning",
        title: "กรุณาระบุเหตุผลใน Remark กรณีค่าใช้จ่ายจริงเกินประมาณการ",
        toast: true,
        position: "top-end",
        timer: 3000,
        showConfirmButton: false,
        background: "#FBF6D9",
      });
      $("#remark").focus();
      return;
    }

    // Prepare FormData for file upload
    let formData = new FormData();
    formData.append("p_join", p_join);
    formData.append("actual_cost", actual_cost);
    formData.append("remain", parseFloat(remain));
    formData.append("remark", remark);
    formData.append("receipt", file);
    // แนบไฟล์กลุ่ม
    const fileGroupInput = $("#file_group")[0];
    if (fileGroupInput && fileGroupInput.files.length > 0) {
      Array.from(fileGroupInput.files).forEach((f, idx) => {
        formData.append(`file_group[]`, f);
      });
    }
    formData.append("nfrmno", nfrmno);
    formData.append("vorgno", vorgno);
    formData.append("cyear", cyear);
    // formData.append("empcode", $("#empcode").val());
    formData.append("inputer", $("#inputer").val());
    formData.append("requester", $("#requester").val());
    formData.append("formnumber", formnumber);
    formData.append("ent_nfrmno", ent_nfrmno);
    formData.append("ent_vorgno", ent_vorgno);
    formData.append("ent_cyear", ent_cyear);
    formData.append("ent_cyear2", ent_cyear2);
    formData.append("ent_nrunno", ent_nrunno);
    const form = await createForm(nfrmno, vorgno, cyear, $("#requester").val(), $("#inputer").val(), "", 1);
    const { runno: NRUNNO, cyear2: CYEAR2 } = form.message;
    formData.append("nrunno", NRUNNO);
    formData.append("cyear2", CYEAR2);
    const expense = [];
    $("#expense-table tbody tr").each(function () {
      expense.push({
        receipt_no: $(this).find("td:eq(1) input").val().trim(),
        cost: parseFloat($(this).find("td:eq(2) input").val().trim()) || 0,
      });
    });
    formData.append("expense", JSON.stringify(expense));

    // Send AJAX request

    $.ajax({
      type: "POST",
      url: host + "gpform/GP-CLER/main/insert",
      data: formData,
      processData: false,
      contentType: false,
      beforeSend: function () {
        $("#loading-overlay").show();
      },
      success: function (response) {
        Swal.fire({
          icon: "success",
          title: "ส่งข้อมูลสำเร็จ",
          showConfirmButton: false,
          timer: 2000,
        });
        // location.reload();
        redirectWebflow();
      },
      complete: function () {
        $("#loading-overlay").hide();
      },
      error: function (xhr, status, error) {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: error,
          showConfirmButton: true,
        });
      },
    });
  });

  $("#receipt").on("change", function () {
    $("#receipt").removeClass("input-error");
  });

  $(function () {
    // เพิ่มแถว
    $("#add-row").click(function () {
      var table = $("#expense-table tbody");
      var rowCount = table.find("tr").length + 1;
      var newRow = `<tr>
            <td class="py-2 px-4 text-center">${rowCount}</td>
            <td class="py-2 px-4">
                <input type="text" class="input input-sm border rounded-lg px-3 py-1 w-full focus:ring-2 bg-white focus:ring-green-400 transition" placeholder="Receipt No.">
            </td>
            <td class="py-2 px-4"> 
                <input type="text" class=" input input-sm border rounded-lg px-3 py-1 w-full focus:ring-2 bg-white focus:ring-green-400 transition" placeholder="Cost">
            </td>
            <td class="py-2 px-4 text-center">
                <button type="button"class="remove-row bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center cursor-pointer justify-center shadow transition" title="Remove row"> &times; </button>
            </td>
        </tr>`;
      table.append(newRow);
      updateRowNumbers();
    });

    // ลบแถว
    $("#expense-table").on("click", ".remove-row", function () {
      $(this).closest("tr").remove();
      updateRowNumbers();
      calculateTotals();
    });

    // ลำดับแถว
    function updateRowNumbers() {
      $("#expense-table tbody tr").each(function (index) {
        $(this)
          .find("td:first")
          .text(index + 1);
      });
    }

    $("#expense-table").on("input", "tbody input", calculateTotals);

    function calculateTotals() {
      let totalAmount = 0;
      $("#expense-table tbody tr").each(function () {
        const cost = parseFloat($(this).find("td:eq(2) input").val()) || 0;
        totalAmount += cost;
      });
      console.log(totalAmount);
      $("#actual-cost").val(totalAmount).trigger("input");
      // $("#total-amount").text(totalAmount.toLocaleString());
    }

    calculateTotals();
  });

  $("#test-submit").on("click", function () {
    const expense = [];
    $("#expense-table tbody tr").each(function () {
      expense.push({
        receipt_no: $(this).find("td:eq(1) input").val().trim(),
        cost: parseFloat($(this).find("td:eq(2) input").val().trim()) || 0,
      });
    });

    console.log("Expense Data:", expense);
  });

  // Clearance_form.blade.js logic for file_group visibility
  // ดึง estimate ให้ชัวร์ (ตัดทุกอย่างที่ไม่ใช่ตัวเลข จุด ลบ)
  function getEstimate() {
    const raw = $("#total_amount").text();
    const num = Number(String(raw).replace(/[^\d.-]/g, "")) || 0;
    return num;
  }

  const $actualCost = $("#actual-cost");
  const $remain = $("#remain");
  const $remainAlert = $("#remain-alert");
  const $remark = $("#remark");
  const $fileGroupSection = $("#file-group-section");

  // ผูก event ให้มีตัวเดียว
  $actualCost.off("input.fileGroup").on("input.fileGroup", function () {
    const estimate = getEstimate(); // อ่านสดทุกครั้งกันค่าถูกอัปเดต
    const val = Number(this.value) || 0;
    const remain = estimate - val;

    $remain.val(remain);

    console.log({
      val,
      estimate,
      remain,
      shouldShow: remain < 0,
    });

    const shouldShow = remain < 0;
    // สั่งทั้งสองแบบ กันโดน CSS/class อื่นทับ
    $fileGroupSection.toggle(shouldShow).toggleClass("hidden", !shouldShow).attr("aria-hidden", !shouldShow);

    if (remain >= 0) {
      $remark.prop("required", false);
      $remain.css("color", "#16a34a");
      $remainAlert.html('<span class="text-green-700">ค่าใช้จ่ายจริงไม่เกินยอดประมาณการ</span>');
    } else {
      $remark.prop("required", true);
      $remain.css("color", "#dc2626");
      $remainAlert.html('<span class="text-red-600">ค่าใช้จ่ายจริงเกินประมาณการ กรุณาระบุเหตุผลใน Remark</span>');
    }
  });

  // ให้ค่าตั้งต้น
  $actualCost.trigger("input");
});
