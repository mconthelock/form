import "select2";
import "select2/dist/css/select2.min.css";
import { host } from "../../utils.js";
import { createForm, redirectWebflow } from "../../inc/_form.js";
import Swal from "sweetalert2";
$(document).ready(function () {
  $("#entertain-form-no").select2();
  const formData = $(".form-data").data();
  //   if (formData) {
  const { nfrmno, vorgno, cyear } = formData;
  //   }
  $("#no-entertain").change(function () {
    if ($(this).is(":checked")) {
      $("#form-entertain").hide();
      $("#entertain-form-no").val("").trigger("change");
    } else {
      $("#form-entertain").show();
      $("#entertain-form-no").val("").trigger("change");
    }
  });

  $("#submit-btn-noAdv").click(async function (e) {
    e.preventDefault();

    // --- Basic info validation ---
    if ($("#input-by").val().trim() === "") return showInputToast("#input-by", "กรุณากรอก Input By");
    if ($("#requested-by").val().trim() === "") return showInputToast("#requested-by", "กรุณากรอก Request By");
    if ($("#entertain-date").val().trim() === "") return showInputToast("#entertain-date", "กรุณากรอก Entertainment Date");
    if ($("#purpose").val().trim() === "") return showInputToast("#purpose", "กรุณาเลือกเหตุผลสำหรับ Entertain");

    if (!$("input[name='time']:checked").val()) return showRadioToast("input[name='time']", "กรุณาเลือกช่วงเวลา");
    if (!$("input[name='location']:checked").val()) return showRadioToast("input[name='location']", "กรุณาเลือกสถานที่");
    if ($("input[name='location']:checked").val() === "Outside" && $("#location_detail").val().trim() === "") return showInputToast("#location_detail", "กรุณากรอกรายละเอียด Location");

    // --- เพิ่มส่วน validation แบบเดิม (president_join, actual_cost, remain, remark, receipt) ---
    const p_join = $("input[name='president_join']:checked").val();
    const actual_cost = $("#actual-cost").val()?.trim() || "";
    const remain = $("#remain").val()?.trim() || "";
    const remark = $("#remark").val()?.trim() || "";
    const reason = $("#reason").val()?.trim() || "";
    const fileInput = $("#receipt")[0];
    const fileInputMemo = $("#file-memo")[0];
    const fileReceipt = fileInput?.files?.[0];
    const fileMemo = fileInputMemo?.files?.[0];

    // --- Company Validation ---
    let companiesArray = [];
    let companyValid = true,
      companyMsg = "";
    $("#companies-container .company-group").each(function (idx, group) {
      const $g = $(group);
      const name = $g.find(".company-name").val().trim();
      const orgType = $g.find(".org-type:checked").val();
      const fileInput = $g.find('input[type="file"]')[0];

      if (!name) {
        companyValid = false;
        companyMsg = `กรุณากรอกชื่อบริษัท ในชุดที่ ${idx + 1}`;
        $g.find(".company-name").addClass("input-error").focus();
        return false;
      }
      if (!orgType) {
        companyValid = false;
        companyMsg = `กรุณาเลือกประเภทองค์กร ในชุดที่ ${idx + 1}`;
        $g.find(".org-type").addClass("radio-error").first().focus();
        return false;
      }
      if (orgType === "2") {
        if (!fileInput.files || fileInput.files.length === 0) {
          companyValid = false;
          companyMsg = `กรุณาแนบไฟล์ Appendix A ในชุดที่ ${idx + 1}`;
          $g.find('input[type="file"]').addClass("input-error").focus();
          return false;
        }
      }
      companiesArray.push({
        name: name,
        orgType: orgType,
        fileName: fileInput.files && fileInput.files.length > 0 ? fileInput.files[0].name : null,
      });
    });

    $(".company-name").on("input change", function () {
      $(this).removeClass("input-error");
    });
    $(".org-type").on("change", function () {
      $(".org-type").removeClass("radio-error");
    });

    if (!companyValid)
      return Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: companyMsg,
        showConfirmButton: false,
        timer: 3000,
      });

    if (!$(".guest_type:checked").val()) return showCheckboxToast(".guest_type", "กรุณาเลือก Guest Type");

    // --- Table estimate validation ---
    // let costValid = false;
    let remarkValid = true;
    // $("#table_cost tbody tr").each(function () {
    //   if ($(this).find("td:eq(0) select").val().trim() !== "") costValid = true;
    //   const $remark = $(this).find("input.remark");
    //   if (!$remark.is(":disabled") && $remark.val().trim() === "") {
    //     showInputToast($remark, "กรุณากรอกเหตุ.. กรณีเงินเกินเงื่อนไข");
    //     remarkValid = false;
    //     return false;
    //   }
    // });
    if (!remarkValid) return;
    // if (!costValid) {
    //   showInputToast("#table_cost tbody tr:first td:eq(0) select", "กรุณากรอก Estimate อย่างน้อย 1 ");
    //   $("#alert-estimate").removeClass("hidden");
    //   $("#table_cost tbody tr:first td:eq(0) select").focus();
    //   setTimeout(() => $("#alert-estimate").addClass("hidden"), 5000);
    //   return;
    // }

    // --- Participant validation ---
    if (guestCount() < 1) return showInputToast("#guest-name-input", "กรุณากรอก guest อย่างน้อย 1 คน");
    if (amecCount() < 1) return showInputToast("#amec-name-input", "กรุณากรอกพนักงาน Amec 1 คน");
    if (amecCount() > guestCount() && $("#remark").val() == "") return showInputToast("#remark", "กรณีคน Amec มากกว่ากรุณากรอก Remark");

    // Validate president_join
    if (!p_join) return showRadioToast("input[name='president_join']", "กรุณาเลือก President Join");
    // Validate actual_cost (required & number & >= 0)
    if (!actual_cost || isNaN(actual_cost) || parseFloat(actual_cost) < 0) {
      return showInputToast("#actual-cost", "กรุณากรอก Actual Cost");
    }

    if (!fileMemo) {
      return showInputToast("#file-memo", "กรุณาแนบไฟล์ Memo");
    }
    // Validate file
    if (!fileReceipt) {
      //   $("#receipt").addClass("input-error").focus();
      return showInputToast("#receipt", "กรุณาแนบไฟล์ใบเสร็จรับเงิน");
    }

    if (!reason) {
      return showInputToast("#reason", "กรุณากรอกเหตุผล");
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
    // --- Collect Data ---
    let formData = new FormData();

    // เพิ่ม field ที่จำเป็น
    formData.append("nfrmno", nfrmno);
    formData.append("vorgno", vorgno);
    formData.append("cyear", cyear);
    formData.append("input_by", $("#input-by").val());
    formData.append("requested_by", $("#requested-by").val());
    formData.append("entertain_date", $("#entertain-date").val());
    formData.append("purpose", $("#purpose").val());
    formData.append("time", $("input[name='time']:checked").next("span").text());
    formData.append("location", $("input[name='location']:checked").next("span").text());
    formData.append("location_detail", $("input[placeholder='*Please identify the location.']").val());
    formData.append("guest_type", $(".guest_type:checked").val());
    // formData.append("org_type", $("input[name='orgType']:checked").val());
    // formData.append("entertain_budget", $("#entertain-budget").val());
    formData.append("total_amount", $("#total-amount").text());
    formData.append("remark", $("textarea[placeholder*='ระบุเหตุผล']").val());
    formData.append("companies", JSON.stringify(companiesArray));
    companiesArray.forEach((c, i) => {
      let fileInput = $("#companies-container .company-group").eq(i).find('input[type="file"]')[0];
      if (fileInput && fileInput.files.length > 0) {
        formData.append(`company_files[${i}]`, fileInput.files[0]);
      }
    });

    const expense = [];
    $("#expense-table tbody tr").each(function () {
      expense.push({
        receipt_no: $(this).find("td:eq(1) input").val().trim(),
        cost: parseFloat($(this).find("td:eq(2) input").val().trim()) || 0,
      });
    });
    formData.append("expense", JSON.stringify(expense));

    // ------- ส่วนข้อมูลของ president/receipt/actual_cost/remark/remain ที่เพิ่มมา ---------
    formData.append("p_join", p_join);
    formData.append("actual_cost", actual_cost);
    formData.append("remain", parseFloat(remain));
    formData.append("remark_president", remark); // หรือใช้ชื่อเดิม remark ก็ได้ถ้าไม่ซ้ำ
    formData.append("receipt", fileReceipt);
    formData.append("file_memo", fileMemo);
    formData.append("Reason", reason);

    // guest_list, amec_list, estimate_items เป็น JSON string
    formData.append(
      "guest_list",
      JSON.stringify(
        $("#guest-list li span")
          .map(function () {
            return $(this).text();
          })
          .get()
      )
    );
    formData.append(
      "amec_list",
      JSON.stringify(
        $("#amec-list li span")
          .map(function () {
            return $(this).data("empno");
          })
          .get()
      )
    );
    let estimate_items = [];
    // $("#table_cost tbody tr").each(function () {
    //   let details = $(this).find("td:eq(0) select option:selected").val();
    //   let qty = $(this).find("td:eq(1) input").val();
    //   let cost = $(this).find("td:eq(2) input").val();
    //   let total = $(this).find("td:eq(3) input").val();
    //   let remark = $(this).find("td:eq(4) input").val();
    //   if (details && qty && cost && total) estimate_items.push({ details, qty, cost, total, remark });
    // });
    // formData.append("estimate_items", JSON.stringify(estimate_items));

    const form = await createForm(nfrmno, vorgno, cyear, $("#requested-by").val(), $("#input-by").val(), "");
    const { runno: NRUNNO, cyear2: CYEAR2 } = form.message;
    formData.append("nrunno", NRUNNO);
    formData.append("cyear2", CYEAR2);

    // --- Submit AJAX ---
    $.ajax({
      type: "POST",
      url: host + "gpform/GP-CLER/main/InsertFormNoAdv",
      data: formData,
      processData: false,
      contentType: false,
      beforeSend: function () {
        $("#loading-overlay").show();
      },
      success: function (response) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "บันทึกข้อมูลสำเร็จ!",
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
          // didClose: () => location.reload(),
        });
        redirectWebflow();
      },
      complete: function () {
        $("#loading-overlay").hide();
      },
      error: function (xhr) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: xhr.responseText || "ไม่สามารถบันทึกข้อมูลได้",
          showConfirmButton: false,
          timer: 3000,
        });
      },
    });
  });

  $("input[name='president_join']").on("change", function () {
    $("input[name='president_join']").removeClass("radio-error").addClass("radio-success");
  });

  $("#actual-cost, #receipt, #reason, #file-memo").on("input change", function () {
    clearFieldError(this.id);
  });

  $("#receipt").on("change", function () {
    $("#receipt").removeClass("input-error");
  });
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
