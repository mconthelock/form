import { host } from "../../utils.js";
import "select2";
import "select2/dist/css/select2.min.css";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { createForm, redirectWebflow } from "../../inc/_form.js";

$(document).ready(async function () {
  const NFRMNO = $(".form-info").attr("NFRMNO");
  const VORGNO = $(".form-info").attr("VORGNO");
  const CYEAR = $(".form-info").attr("CYEAR");

  flatpickr("#request_date", { dateFormat: "Y-m-d", defaultDate: "today" });
  function loadUsersToSelect($select) {
    $.get(
      host + "isform/IS-TRB/main/get_user",
      function (data) {
        $select.empty().append('<option value="">Select a Employee</option>');
        data.forEach(function (user) {
          $select.append(
            `<option value="${user.SEMPNO}">${user.SNAME}</option>`
          );
        });
        $select.select2();
      },
      "json"
    );
  }

  function updateDisabledOptions() {
    const selectedValues = $(".user_select")
      .map(function () {
        return $(this).val();
      })
      .get();

    $(".user_select").each(function () {
      const currentSelect = $(this);
      const currentValue = currentSelect.val();

      currentSelect.find("option").each(function () {
        const optionValue = $(this).val();

        if (optionValue === "" || optionValue === currentValue) {
          $(this).prop("disabled", false); // ค่าว่างหรือค่าที่เลือกอยู่ ให้เปิดไว้
        } else if (selectedValues.includes(optionValue)) {
          $(this).prop("disabled", true);
        } else {
          $(this).prop("disabled", false);
        }
      });
    });

    // ต้อง refresh select2 ด้วย
    $(".user_select").select2();
  }

  // โหลด select แรก
  loadUsersToSelect($(".user_select"));

  // เพิ่มชื่อ
  $("#addPerson").on("click", function () {
    const newPerson = `
        <div class="flex gap-3 items-center person-entry">
          <select name="employee[]" class="select rounded-lg user_select">
            <option value="">Select a Employee</option>
          </select>
          <button type="button" class="btn btn-error btn-sm rounded-xl remove-btn">ลบ</button>
        </div>
      `;
    $("#personList").append(newPerson);
    const newSelect = $("#personList .user_select").last();
    loadUsersToSelect(newSelect);

    // Delay เพื่อให้ select2 โหลดเสร็จแล้วค่อยอัปเดต
    setTimeout(updateDisabledOptions, 500);
  });

  // ลบรายการ
  $(document).on("click", ".remove-btn", function () {
    $(this).closest(".person-entry").remove();
    updateDisabledOptions();
  });

  // อัปเดตเมื่อเลือกชื่อ
  $(document).on("change", ".user_select", function () {
    updateDisabledOptions();
  });

  $(".radio-inform").on("change", function () {
    if ($(this).val() === "1") {
      $("#when").prop("disabled", false);
      $("#reason").prop("disabled", true).val("");
    } else if ($(this).val() === "2") {
      $("#reason").prop("disabled", false);
      $("#when").prop("disabled", true).val("");
    }
  });

  $(".radio_result").on("change", function () {
    console.log($(this).val());
    if ($(this).val() === "1") {
      $("#result_detail").addClass("hidden");
    } else {
      $("#result_detail").removeClass("hidden");
    }
  });

  function validateFields() {
    const name = $("#request_name").val().trim();
    const request_location = $("#request_location").val().trim();
    const employeeSelected = $("select[name='employee[]']").filter(function () {
      return $(this).val() !== "";
    }).length;
    const result = $("input[name='result']:checked").val();
    const inform = $("input[name='inform']:checked").val();
    const troubleType = $("input[name='trouble_type[]']:checked").length;
    const cause_detail = $("#cause_detail").val().trim();
    const fix_detail = $("#fix_detail").val().trim();
    const Prevention = $("#Prevention").val().trim();

    if (!name) {
      alert("กรุณากรอกชื่อผู้แจ้ง");
      $("#request_name").focus();
      return false;
    }
    if (!request_location) {
      alert("กรุณากรอกสถานที่");
      $("#request_location").focus();
      return false;
    }
    if (employeeSelected === 0) {
      alert("กรุณาเลือกพนักงานอย่างน้อย 1 คน");
      return false;
    }
    if (!result) {
      alert("กรุณาเลือกผลการตรวจสอบ");
      return false;
    }
    if (!inform) {
      alert("กรุณาเลือกการแจ้งเตือน");
      return false;
    }
    if (troubleType === 0) {
      alert("กรุณาเลือกประเภทปัญหาอย่างน้อย 1 ประเภท");
      return false;
    }
    if (!cause_detail) {
      alert("กรุณากรอกรายละเอียดสาเหตุ");
      $("#cause_detail").focus();
      return false;
    }
    if (!fix_detail) {
      alert("กรุณากรอกรายละเอียดการแก้ไข");
      $("#fix_detail").focus();
      return false;
    }
    if (!Prevention) {
      alert("กรุณากรอกรายละเอียดการป้องกัน");
      $("#Prevention").focus();
      return false;
    }
    return true;
  }

  $("#btn-submit").on("click", async function (e) {
    e.preventDefault();

    if (!validateFields()) return;

    const formData = new FormData($("#form-trouble")[0]);
    const req = $("#req").val();
    const key = $("#key").val();

    formData.append("NFRMNO", NFRMNO);
    formData.append("VORGNO", VORGNO);
    formData.append("CYEAR", CYEAR);

    const form = await createForm(NFRMNO, VORGNO, CYEAR, req, key, "");
    const { runno: NRUNNO, cyear2: CYEAR2 } = form.message;

    formData.append("NRUNNO", NRUNNO);
    formData.append("CYEAR2", CYEAR2);

    const entries = {};
    for (let [key, value] of formData.entries()) {
      if (entries[key]) {
        // ถ้ามี key นี้อยู่แล้ว ให้ push เข้า array
        if (Array.isArray(entries[key])) {
          entries[key].push(value);
        } else {
          entries[key] = [entries[key], value];
        }
      } else {
        entries[key] = value;
      }
    }

    console.log(entries);

    $.ajax({
      type: "POST",
      url: host + "isform/IS-TRB/main/insert",
      data: formData,
      processData: false,
      contentType: false,
      success: function (response) {
        redirectWebflow();
      },
    });

    // console.log("Form Data:", entries);
  });
});
