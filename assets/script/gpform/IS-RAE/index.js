import { host } from "../../utils.js";
import Swal from "sweetalert2";
import { createForm, redirectWebflow } from "../../inc/_form.js";

$(function () {
  const formData = $(".form-data").data();
  const { nfrmno, vorgno, cyear } = formData;
  const GUEST_MAX = 100,
    AMEC_MAX = 100;
  const RESTRICTED_TYPES = ["3", "4", "6"];

  // -------- Utility Functions --------
  window.getGuestType = function () {
    return $(".guest_type:checked").val();
  };
  window.guestCount = function () {
    return $("#guest-list li").length;
  };
  window.amecCount = function () {
    return $("#amec-list li").length;
  };

  window.updateCount = function (type) {
    let count = type === "guest" ? guestCount() : amecCount();
    $(`#${type}-count`).text(`(${count}/${type === "guest" ? GUEST_MAX : AMEC_MAX})`);
    $(`#add-${type}-btn`).prop("disabled", count >= (type === "guest" ? GUEST_MAX : AMEC_MAX));
  };

  function validateAmecLimit() {
    const guestType = getGuestType();
    if (RESTRICTED_TYPES.includes(guestType)) {
      $("#add-amec-btn").prop("disabled", amecCount() >= guestCount() && guestCount() > 0);
      if (amecCount() > guestCount()) {
        $("#amec-list li").slice(guestCount()).remove();
        updateCount("amec");
      }
    } else {
      updateCount("amec");
    }
  }

  // -------- Add/Remove Guest/Amec --------
  function addGuest() {
    const name = $("#guest-name-input").val().trim();
    if (!name || guestCount() >= GUEST_MAX) return;
    $("#guest-list").append(
      `<li class="flex items-center justify-between gap-2 border border-blue-200 bg-blue-50 shadow-sm rounded-lg px-3 py-1">
        <span>${name}</span>
        <button type="button" class="remove-li bg-red-200 text-red-700 cursor-pointer rounded px-2 py-0.5 text-xs">ลบ</button>
      </li>`
    );
    $("#guest-name-input").val("");
    updateCount("guest");
    validateAmecLimit();
  }

  async function addAmec() {
    const amecName = $("#amec-name-input").val().trim();
    if (!amecName) return;
    $("#amec-loading").removeClass("hidden");
    $("#add-amec-btn").prop("disabled", true);
    const empData = await getDataEmp(amecName);
    $("#amec-loading").addClass("hidden");
    $("#add-amec-btn").prop("disabled", false);
    if (!empData.length) {
      alert("ไม่พบรหัส พนักงาน");
      return;
    }
    const guestType = getGuestType();
    if ((RESTRICTED_TYPES.includes(guestType) && amecCount() >= guestCount() && guestCount() > 0) || (!RESTRICTED_TYPES.includes(guestType) && amecCount() >= AMEC_MAX)) return;
    $("#amec-list").append(
      `<li class="flex items-center justify-between gap-2 border border-blue-200 bg-blue-50 shadow-sm rounded-lg px-3 py-1">
        <span data-empno="${empData[0].SEMPNO}">${empData[0].SEMPPRE} ${empData[0].SNAME} (${empData[0].SEMPNO})</span>
        <button type="button" class="remove-li bg-red-200 text-red-700 cursor-pointer rounded px-2 py-0.5 text-xs">ลบ</button>
      </li>`
    );
    $("#amec-name-input").val("");
    updateCount("amec");
    validateAmecLimit();
  }

  // -------- Event Bindings --------
  $("#add-guest-btn").click(addGuest);
  $("#add-amec-btn").click(addAmec);

  $("#guest-name-input").keydown((e) => {
    if (e.key === "Enter") addGuest();
  });
  $("#amec-name-input").keydown((e) => {
    if (e.key === "Enter") addAmec();
  });

  // Remove Guest/Amec (event delegation)
  $("#guest-list, #amec-list").on("click", ".remove-li", function () {
    $(this).closest("li").remove();
    updateCount("guest");
    updateCount("amec");
    validateAmecLimit();
  });

  // Guest type change
  $(".guest_type").on("change", validateAmecLimit);

  // Initial
  updateCount("guest");
  updateCount("amec");
  validateAmecLimit();

  // -------- Cost Table Calculation --------
  $("tbody input").on("input", calculateTotals);

  // -------- Form Submit --------
  $("#submit-btn").click(async function (e) {
    e.preventDefault();

    // --- Basic info validation ---
    if ($("#input-by").val().trim() === "") return showInputToast("#input-by", "กรุณากรอก Input By");
    if ($("#requested-by").val().trim() === "") return showInputToast("#requested-by", "กรุณากรอก Request By");
    if ($("#entertain-date").val().trim() === "") return showInputToast("#entertain-date", "กรุณากรอก Entertainment Date");
    if ($("#purpose").val().trim() === "") return showInputToast("#purpose", "กรุณาเลือกเหตุผลสำหรับ Entertain");

    if (!$("input[name='time']:checked").val()) return showRadioToast("input[name='time']", "กรุณาเลือกช่วงเวลา");
    if (!$("input[name='location']:checked").val()) return showRadioToast("input[name='location']", "กรุณาเลือกสถานที่");

    if ($("input[name='location']:checked").val() === "Outside" && $("#location_detail").val().trim() === "") return showInputToast("#location_detail", "กรุณากรอกรายละเอียด Location");

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
        // หากต้องการแนบไฟล์จริงๆ ให้แนบไฟล์แยกใน FormData ด้านล่างนี้ (ไฟล์ใหญ่แนบแบบนี้ไม่ควร base64 ใน json)
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

    if (!$(".guest_type:checked").val()) return showCheckboxToast(".guest_type", "กรุณาเลือก Guest Type");

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

    if (!$(".cash_adv:checked").val()) {
      showCheckboxToast(".cash_adv", "กรุณาเลือก Cash Advance");
      return;
    }

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
    formData.append("guest_type", $(".guest_type:checked").val());
    formData.append("org_type", $("input[name='orgType']:checked").val());
    formData.append("entertain_budget", $("#entertain-budget").val());
    formData.append("total_amount", $("#total-amount").text());
    formData.append("remark", $("textarea[placeholder*='ระบุเหตุผล']").val());
    formData.append("companies", JSON.stringify(companiesArray));
    // formData.append("reimbursement", $("#reimbursement").is(":checked") ? "1" : "0");
    formData.append("cash_adv", $(".cash_adv:checked").val());
    companiesArray.forEach((c, i) => {
      let fileInput = $("#companies-container .company-group").eq(i).find('input[type="file"]')[0];
      if (fileInput && fileInput.files.length > 0) {
        formData.append(`company_files[${i}]`, fileInput.files[0]);
      }
    });

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

    const form = await createForm(nfrmno, vorgno, cyear, $("#requested-by").val(), $("#input-by").val(), "");
    const { runno: NRUNNO, cyear2: CYEAR2 } = form.message;
    formData.append("nrunno", NRUNNO);
    formData.append("cyear2", CYEAR2);

    // --- Submit AJAX ---
    $.ajax({
      type: "POST",
      url: host + "gpform/GP-ENT/main/InsertForm",
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
          // didClose: () => redirectWebflow(),
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

  // ---- Utility functions (Toast Version) ----
  window.showInputToast = function (selector, msg) {
    $(selector).addClass("input-error").focus();
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "warning",
      title: msg,
      showConfirmButton: false,
      timer: 2000,
      background: "#FBF6D9",
    });
  };
  window.showRadioToast = function (selector, msg) {
    $(selector).removeClass("radio-primary radio-success").addClass("radio-error").first().focus();
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "warning",
      title: msg,
      showConfirmButton: false,
      timer: 2000,
    });
  };
  window.showCheckboxToast = function (selector, msg) {
    $(selector).addClass("checkbox-error").removeClass("checkbox-primary").first().focus();
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "warning",
      title: msg,
      showConfirmButton: false,
      timer: 2000,
    });
  };

  $("#input-by, #requested-by, #entertain-date, #purpose, #location_detail, #file-attachment2, #guest-name-input, #amec-name-input, #remark").on("input change", function () {
    clearFieldError(this.id);
  });

  $("#table_cost tbody tr td:eq(0) select").on("change", function () {
    $(this).removeClass("input-error");
  });

  $("input[name='time']").on("change", function () {
    $("input[name='time']").removeClass("radio-error").addClass("radio-primary");

    if ($(this).val() == "Dinner") {
      $("#location-inside").prop("disabled", true); // ปิด (disabled)
      $("#location-outside").prop("checked", true);
      $("#location_detail").focus();
    } else {
      $("#location-inside").prop("disabled", false); // เปิด (ถ้าเลือกอย่างอื่น)
      $("#location-outside").prop("checked", false);
    }
  });

  $("input[name='location']").on("change", function () {
    $("input[name='location']").removeClass("radio-error").addClass("radio-primary");
  });

  $(".guest_type .cash_adv").on("input change", function () {
    $(".guest_type").removeClass("checkbox-error").addClass("checkbox-primary");
  });

  $("#file-attachment2").on("change", function () {
    $("#alert-file2").addClass("hidden");
  });
});

$(document).on("change input", ".estimate-type, .quantity", function () {
  const $row = $(this).closest("tr");
  const etCost = Number($row.find(".estimate-type option:selected").data("cost"));
  const quantity = Number($row.find(".quantity").val());
  const $remark = $row.find(".remark");
  if (quantity > etCost) {
    $remark.prop("disabled", false);
    $remark.addClass("input-error");
  } else {
    $remark.prop("disabled", true);
    $remark.removeClass("input-error");
  }
  console.log(etCost);
  console.log(quantity);
});

window.clearFieldError = function (inputId) {
  console.log(inputId);
  // $("#error-" + inputId).text('');
  $("#" + inputId).removeClass("input-error");
};

// --------- OUTSIDE ASYNC FUNCTIONS ---------
function getDataEmp(empcode) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${host}gpform/GP-ENT/main/getDataEmp`,
      method: "POST",
      data: { empcode },
      dataType: "json",
      success: resolve,
      error: function (_, __, error) {
        reject(error);
      },
    });
  });
}

function calculateTotals() {
  let totalAmount = 0;
  $("#table_cost tbody tr").each(function () {
    const qty = parseFloat($(this).find("td:eq(1) input").val()) || 0;
    const cost = parseFloat($(this).find("td:eq(2) input").val()) || 0;
    const rowTotal = qty * cost;
    $(this).find("td:eq(3) input").val(rowTotal);
    totalAmount += rowTotal;
  });
  $("#total-amount").text(totalAmount);
}
