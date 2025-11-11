import { showFlow, doaction, redirectWebflow } from "@public/_form.js";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { host } from "../../utils.js";
import Swal from "sweetalert2";
import "@fortawesome/fontawesome-free/css/all.min.css";

$(document).ready(async function () {
  flatpickr("#start-date", { dateFormat: "Y-m-d" });
  flatpickr("#pay_date", { dateFormat: "Y-m-d" });
  toggleFieldsByTime();

  function toggleGuestTypeSection() {
    const val = $("input[name='time']:checked").val();
    console.log(val);
    if (val === "Gift" || val === "Other") {
      $("#guest-type-section").hide();
      $(".guest_type").prop("checked", false);
    } else {
      $("#guest-type-section").show();
    }
  }

  // เวลาเปลี่ยนค่า radio time ให้เรียก toggle
  $("input[name='time']").on("change", toggleGuestTypeSection);

  // โหลดหน้า edit ครั้งแรก ต้องเช็คด้วย
  toggleGuestTypeSection();

  const modal = document.getElementById("my_modal_1");
  if (modal) {
    modal.showModal();
  }

  const formData = $(".form-data").data();
  const { nfrmno, vorgno, cyear, cyear2, nrunno, empno } = formData;

  const flow = await showFlow(nfrmno, vorgno, cyear, cyear2, nrunno, true);
  $(".flow").html(flow.html);

  $(".btn-submit").click(async function () {
    const action = $(this).data("action");
    const remark_approve = $("#remark_approve").val();
    const cstepno = $(".cstepno").val();
    const cstepnextno = $(".cstepnextno").val();
    const $pay = $("#pay_date");

    let approveRemark = "";
    let acceptStatus = "";
    if ($("input[name='accept']").length > 0) {
      const acceptval = $("input[name='accept']:checked").val();
      const acceptStatus = $("input[name='accept']:checked").attr("id");
      const acceptRemark = $("#accept_remark").val();
      const notAcceptRemark = $("#notaccept_remark").val();

      if (!acceptStatus) {
        alert("กรุณาเลือก Accept หรือ Not Accept");
        return;
      }

      if (acceptStatus === "notaccept" && !notAcceptRemark.trim()) {
        alert("กรุณากรอก Remark กรณี Not Accept");
        $("#notaccept_remark").focus();
        return;
      }

      approveRemark = acceptStatus === "accept" ? acceptRemark : notAcceptRemark;

      if (action === "approve") {
        await $.ajax({
          type: "post",
          url: host + "gpform/GP-ENT/main/UpdateApprove",
          data: {
            nfrmno,
            vorgno,
            cyear,
            cyear2,
            nrunno,
            approveRemark,
            acceptval,
          },
          success: function (response) {
            console.log(response);
          },
          error: function (xhr) {
            console.log(xhr);
          },
        });
      }
      // ... และ logic อื่นๆ ต่อได้เลย
    }

    if ($pay.length && !$pay.val() && action === "approve") {
      alert("กรุณาเลือกวันที่ Pay Date");
      $pay.focus();
      return; // ออกจาก handler ไม่เรียก doaction()
    }

    if ($pay.val() && action === "approve") {
      await $.post(host + "gpform/GP-ENT/main/UpdatePayDate", {
        nfrmno,
        vorgno,
        cyear,
        cyear2,
        nrunno,
        pay_date: $pay.val(),
      });
    }

    if (action === "approve" && cstepno === "19" && cstepnextno === "18") {
      $.getJSON(host + "gpform/GP-ENT/main/sendMailToApprover", {
        nfrmno,
        vorgno,
        cyear,
        cyear2,
        nrunno,
      })
        .done(console.log)
        .fail(console.log);
    }

    const confirm = await doaction(nfrmno, vorgno, cyear, cyear2, nrunno, action, empno, remark_approve);
    if (confirm.status) redirectWebflow();
  });

  $("input[name='accept']").on("change", function () {
    console.log($(this).val());
    if ($(this).val() === "1") {
      $("#accept_remark").prop("disabled", false);
      $("#notaccept_remark").prop("disabled", true);
    } else {
      $("#accept_remark").prop("disabled", true);
      $("#notaccept_remark").prop("disabled", false);
    }
  });

  $("#submit-btn-edit").click(async function (e) {
    e.preventDefault();
    let type = $("input[name='time']:checked").val();
    let oldType = $("#old-type").val();
    let guestType = $(".guest_type:checked").val();
    let giftMemo = $("#gift-memo-file")[0].files.length;
    let otherMemo = $("#other-memo-file")[0].files.length;

    // --- Basic info validation ---
    if ($("#input-by").val().trim() === "") return showInputToast("#input-by", "กรุณากรอก Input By");
    if ($("#requested-by").val().trim() === "") return showInputToast("#requested-by", "กรุณากรอก Request By");
    if ($("#entertain-date").val().trim() === "") return showInputToast("#entertain-date", "กรุณากรอก Entertainment Date");
    if ($("#purpose").val().trim() === "") return showInputToast("#purpose", "กรุณาเลือกเหตุผลสำหรับ Entertain");

    if (!$("input[name='time']:checked").val()) return showRadioToast("input[name='time']", "กรุณาเลือกช่วงเวลา");

    if ($("#div_location").is(":visible")) {
      if (!$("input[name='location']:checked").val()) return showRadioToast("input[name='location']", "กรุณาเลือกสถานที่");
      if ($("input[name='location']:checked").val() === "Outside" && $("#location_detail").val().trim() === "") return showInputToast("#location_detail", "กรุณากรอกรายละเอียด Location");
    }
    // if (!$("input[name='location']:checked").val()) return showRadioToast("input[name='location']", "กรุณาเลือกสถานที่");

    // if ($("input[name='location']:checked").val() === "Outside" && $("#location_detail").val().trim() === "") return showInputToast("#location_detail", "กรุณากรอกรายละเอียด Location");

    // --- Memo file required if memo section is visible ---
    if ($("#attach-memo-section").is(":visible")) {
      var memoFileInput = $("#file-memo")[0];
      var hasCurrentMemoFile = $(".current-memo-file").is(":visible") && $(".current-memo-file a").length > 0;
      var hasNewMemoFile = memoFileInput && memoFileInput.files.length > 0;

      if (!hasCurrentMemoFile && !hasNewMemoFile) {
        showInputToast("#file-memo", "กรุณาแนับไฟล์ Memo");
        return;
      }
    }

    // --- Company Validation ---
    let companiesArray = [];
    let companyValid = true,
      companyMsg = "";
    $("#companies-container .company-group").each(function (idx, group) {
      const $g = $(group);
      const name = $g.find(".company-name").val().trim();
      const orgType = $g.find(".org-type:checked").val();
      const fileInput = $g.find('input[type="file"]')[0];

      // << ประกาศตรงนี้เลย ไม่ต้องประกาศใน if
      const hasCurrentFile = $g.find(".current-file").is(":visible") && $g.find(".current-file").html().trim() !== "";
      const hasNewFile = fileInput.files && fileInput.files.length > 0;

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
        if (!hasCurrentFile && !hasNewFile) {
          companyValid = false;
          companyMsg = `กรุณาแนบไฟล์ Appendix A ในชุดที่ ${idx + 1}`;
          $g.find('input[type="file"]').addClass("input-error").focus();
          return false;
        }
      }

      companiesArray.push({
        name: name,
        orgType: orgType,
        fileName: hasNewFile ? fileInput.files[0].name : null,
        current_file: hasCurrentFile ? $g.find(".current-file a").text().trim() : "",
      });
    });

    // ลบ error class เมื่อมีการเปลี่ยนแปลง
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

    if (type === "Gift" && !giftMemo && oldType !== "Gift" && !$("#gift-memo a").length) {
      showInputToast("#gift-memo-file", "Please attach gift memo file");
      return;
    }
    if (type === "Other" && $("#other-details").val().trim() === "") {
      showInputToast("#other-details", "Please enter other details");
      return;
    }
    if (type === "Other" && !otherMemo && oldType !== "Other" && !$("#other-fields a").length) {
      showInputToast("#other-memo-file", "Please attach memo for other");
      return;
    }
    if (type !== "Gift" && type !== "Other" && !guestType) {
      showRadioToast(".guest_type", "Please select guest type");
      return;
    }

    // --- Table estimate validation ---
    let costValid = false;
    let remarkValid = true;
    $("#table_cost tbody tr").each(function () {
      if ($(this).find("td:eq(0) select").val().trim() !== "") costValid = true;
      const $remark = $(this).find("input.remark");
      if (!$remark.is(":disabled") && $remark.val().trim() === "") {
        showInputToast($remark, "กรุณากรอกเหตุ.. กรณีเงินเกินเงื่อนไข");
        remarkValid = false;
        return false; // Break .each loop
      }
    });
    if (!remarkValid) return;
    if (!costValid) {
      showInputToast("#table_cost tbody tr:first td:eq(0) select", "กรุณากรอก Estimate อย่างน้อย 1 ");
      $("#alert-estimate").removeClass("hidden");
      $("#table_cost tbody tr:first td:eq(0) select").focus();
      setTimeout(() => $("#alert-estimate").addClass("hidden"), 5000);
      return;
    }

    // if (!$(".cash_adv:checked").val()) {
    //   showCheckboxToast(".cash_adv", "กรุณาเลือก Cash Advance");
    //   return;
    // }

    // --- Participant validation ---
    if (guestCount() < 1) return showInputToast("#guest-name-input", "กรุณากรอก guest อย่างน้อง 1 คน");
    if (amecCount() < 1) return showInputToast("#amec-name-input", "กรุณากรอกพนักงาน Amec 1 คน");
    if (amecCount() > guestCount() && $("#remark").val() == "") return showInputToast("#remark", "กรณีคน Amec มากกว่ากรุณากรอก Remark");

    // --- Collect Data ---
    let formData = new FormData();

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
    formData.append("guest_type", $(".guest_type:checked").val() || "");
    formData.append("org_type", $("input[name='orgType']:checked").val());
    formData.append("entertain_budget", $("#entertain-budget").val());
    formData.append("total_amount", $("#total-amount").text());
    formData.append("remark", $("textarea[placeholder*='ระบุเหตุผล']").val());
    formData.append("companies", JSON.stringify(companiesArray));
    // formData.append("cash_adv", $(".cash_adv:checked").val());
    companiesArray.forEach((c, i) => {
      let fileInput = $("#companies-container .company-group").eq(i).find('input[type="file"]')[0];
      if (fileInput && fileInput.files.length > 0) {
        formData.append(`company_files[${i}]`, fileInput.files[0]);
      }
    });

    if (type === "Gift") {
      const gf = $("#gift-memo-file")[0];
      if (gf && gf.files.length > 0) {
        formData.append("file_memo_gift", gf.files[0]);
      } else if (oldType === "Gift" && $("#gift-memo a").length) {
        // ใช้ไฟล์เดิมถ้าไม่มีการเปลี่ยน
        formData.append("file_memo_gift_old", $("#gift-memo a").text());
      }
    }

    // --- Other memo ---
    if (type === "Other") {
      const of = $("#other-memo-file")[0];
      if (of && of.files.length > 0) {
        formData.append("file_memo_other", of.files[0]);
      } else if (oldType === "Other" && $("#other-fields a").length) {
        formData.append("file_memo_other_old", $("#other-fields a").text());
      }
    }

    // แนบไฟล์ Memo ถ้ามี
    if ($("#attach-memo-section").is(":visible")) {
      var memoFileInput = $("#file-memo")[0];
      if (memoFileInput && memoFileInput.files.length > 0) {
        formData.append("file_memo", memoFileInput.files[0]);
      }
    }

    // แนบไฟล์
    // if ($("#file-attachment2")[0].files.length > 0) formData.append("file2", $("#file-attachment2")[0].files[0]);

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
    $("#table_cost tbody tr").each(function () {
      let details = $(this).find("td:eq(0) select option:selected").val();
      let qty = $(this).find("td:eq(1) input").val();
      let cost = $(this).find("td:eq(2) input").val();
      let total = $(this).find("td:eq(3) input").val();
      let remark = $(this).find("td:eq(4) input").val();
      console.log(details);
      if (details && qty && cost && total) estimate_items.push({ details, qty, cost, total, remark });
    });
    formData.append("estimate_items", JSON.stringify(estimate_items));

    // const form = await createForm(nfrmno, vorgno, cyear, $("#requested-by").val(), $("#input-by").val(), "");
    // const { runno: NRUNNO, cyear2: CYEAR2 } = form.message;
    formData.append("nrunno", nrunno);
    formData.append("cyear2", cyear2);

    // --- Submit AJAX ---
    $.ajax({
      type: "POST",
      url: host + "gpform/GP-ENT/main/Update",
      data: formData,
      processData: false,
      contentType: false,
      beforeSend: function () {
        $("#loading-overlay").show();
      },
      success: async function (response) {
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

        const action = "approve";

        const confirm = await doaction(nfrmno, vorgno, cyear, cyear2, nrunno, action, empno, "");
        if (confirm.status) redirectWebflow();
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

  function toggleFieldsByTime() {
    const timeVal = $("input[name='time']:checked").val();

    if (timeVal === "Gift") {
      $("#gift-memo").show();
      $("#other-fields").hide();
      $("#div_gt").hide();
      $("#div_location").hide();
    } else if (timeVal === "Other") {
      $("#other-fields").show();
      $("#gift-memo").hide();
      $("#div_gt").hide();
      $("#div_location").hide();
    } else {
      $("#gift-memo").hide();
      $("#other-fields").hide();
      $("#div_gt").show();
      $("#div_location").show();
    }
  }

  // ✅ เรียกใช้เมื่อมีการเปลี่ยนค่า time
  $(document).on("change", "input[name='time']", toggleFieldsByTime);
});
