import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { host } from "../../utils.js";
import { createForm, redirectWebflow } from "../../inc/_form.js";
import { s2disableSearch, s2opt, setSelect2 } from "../../inc/_select2.js";

$(document).ready(async function () {
  flatpickr("#request-date", { dateFormat: "Y-m-d", defaultDate: "today" });
  // await setSelect2({...s2opt, ...s2disableSearch,}, '#user_del');
  $("#user_del").select2();
  // setSelect2(s2opt, '#user_del');
  const requiredFields = [
    { id: "#request-date" },
    { id: "#requester" },
    { id: "#platform" },
    { id: "#class", invalidVal: "Choose a class" },
    { id: "#category", invalidVal: "Choose a category" },
    { id: "#role" },
    { id: "#reason" },
    { id: "#duration", invalidVal: "Choose a duration" },
    { id: "#user-type", invalidVal: "Choose a User Type" },
    { id: "#admin" },
    { id: "#organizer", invalidVal: "Choose an organizer" },
  ];

  function validateFields() {
    let valid = true;
    let firstInvalid = null;

    if (!$(".action-check:checked").length) {
      alert("กรุณาเลือก Action อย่างน้อย 1 รายการ");
      return false;
    }

    requiredFields.forEach(({ id, invalidVal }) => {
      const el = $(id);
      const value = el.val();
      const isInvalid = !value || value === invalidVal;

      el.toggleClass("border-red-500", isInvalid);
      if (isInvalid) {
        console.log("Field ว่างหรือไม่ถูกต้อง:", id);
        if (!firstInvalid) firstInvalid = el;
        valid = false;
      }
    });

    if (!valid) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      if (firstInvalid) firstInvalid.focus();
    }

    return valid;
  }

  function handleActionChange() {
    const val = $(this).val();
    $(".action-check").not(this).prop("checked", false);

    $(".DEL, .ADD").addClass("hidden");
    if (val === "DELETE") $(".DEL").removeClass("hidden");
    else if (val === "ADD") $(".ADD").removeClass("hidden");
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    if (!validateFields()) return;

    const NFRMNO = $(".form-info").attr("NFRMNO");
    const VORGNO = $(".form-info").attr("VORGNO");
    const CYEAR = $(".form-info").attr("CYEAR");

    const req = $("#requester").val();
    const key = $("#inputer").val();
    const form = await createForm(NFRMNO, VORGNO, CYEAR, req, key, "");
    const { runno: NRUNNO, cyear2: CYEAR2 } = form.message;

    const data = {
      inputer: key,
      requester: req,
      action: $(".action-check:checked").val(),
      requestDate: $("#request-date").val(),
      platform: $("#platform").val(),
      class_auth: $("#class").val(),
      category: $("#category").val(),
      role: $("#role").val(),
      reason: $("#reason").val(),
      duration: $("#duration").val(),
      user_type: $("#user-type").val(),
      owner: $("#owner").val(),
      admin: $("#admin").val(),
      org: $("#organizer").val(),
      NFRMNO,
      VORGNO,
      CYEAR,
      NRUNNO,
      CYEAR2,
    };

    $.ajax({
      url: `${host}isform/IS-SPC/main/insert`,
      method: "POST",
      data: data,
      beforeSend: function () {
        $("#loading-overlay").show();
      },
      success: function (response) {
        redirectWebflow();
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      },
      complete: function () {
        $("#loading-overlay").hide();
      },
    });
  }

  async function fetchAdmins(platform, selector) {
    const response = await $.get(`${host}isform/IS-SPC/main/getController`);
    const admins = JSON.parse(response);
    const select = $(selector)
      .empty()
      .append('<option value="">Choose an admin</option>');

    admins
      .filter((a) => a.SERVER_NAME === platform)
      .forEach((a) =>
        select.append(
          `<option value="${a.EMPNO}">${a.USER_LOGIN} <span class="text-sm">(${a.USER_OWNER})</ห></option>`
        )
      );
  }

  async function fetchUsers(platform) {
    const data = await $.post({
      url: `${host}isform/IS-SPC/main/getUser`,
      data: { platform },
      dataType: "json",
      beforeSend: function () {
        // เช่น ใส่ loading
        $("#user_del").html("<option selected>Loading...</option>");
      },
    });

    const userSelect = $("#user_del")
      .empty()
      .append('<option value="">Choose an User</option>');
    data.forEach((u) => {
      userSelect.append(
        `<option value="${u.USER_LOGIN}">${u.USER_LOGIN}</option>`
      );
    });
  }

  $(".action-check").on("change", handleActionChange);
  $("#submit").on("click", handleFormSubmit);

  $("#platform").on("change", function () {
    const platform = $(this).val();
    if (platform) fetchAdmins(platform, "#admin");
  });

  $("#platform_del").on("change", function () {
    const platform = $(this).val();
    if (platform) {
      fetchAdmins(platform, "#admin_del");
      fetchUsers(platform);
    }
  });

  $("#submit_del").on("click", async function () {
    const platform = $("#platform_del").val();
    const user = $("#user_del").val();
    const admin = $("#admin_del").val();
    const reason = $("#reason_del").val();
    const action = $(".action-check:checked").val();
    const NFRMNO = $(".form-info").attr("NFRMNO");
    const VORGNO = $(".form-info").attr("VORGNO");
    const CYEAR = $(".form-info").attr("CYEAR");
    const req = $("#requester").val();
    const key = $("#inputer").val();
    const form = await createForm(NFRMNO, VORGNO, CYEAR, req, key, "");
    const { runno: NRUNNO, cyear2: CYEAR2 } = form.message;

    const data = {
      inputer: key,
      requester: req,
      requestDate: $("#request-date").val(),
      action,
      platform,
      username: user,
      admin,
      reason,
      NFRMNO,
      VORGNO,
      CYEAR,
      NRUNNO,
      CYEAR2,
    };

    $.post(
      `${host}isform/IS-SPC/main/insert`,
      data,
      function (data, textStatus, jqXHR) {
        console.log(data);
      },
      "json"
    );
  });
});
