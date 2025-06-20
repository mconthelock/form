import {
  addInput,
  addMinutesToTime,
  ajaxOptions,
  ajaxOptionsLoad,
  autosizeTextarea,
  getData,
  removeClassError,
  removeInput,
  requiredForm,
  showMessage,
} from "../../jFuntion";
import { fpkTimeOpt, setDatePicker } from "../../inc/_flatpickr";
import { getEmployee } from "../../webservice";
import { displayEmpImage, host, showLoader } from "../../utils";
import {
  flagSelect,
  formatUser,
  s2disableSearch,
  s2opt,
  setSelect2,
} from "../../inc/_select2";
import { mailForm, mailOpt, sendMail } from "../../inc/_sendmail";
import { createForm2, deleteForm, redirectWebflow } from "../../inc/_form";
import { customTooltip } from "../../inc/_tooltip";

var emp,
  ctrl,
  userLogin,
  formType,
  empImage = {};
$(async function () {
  showLoader(true);
  $("body").append(customTooltip);
  emp = await getEmployee({ status: 1 });
  console.log(emp);
  const data = await getData({
    ...ajaxOptions,
    url: `${host}isform/IS-TID/form/getDataOnLoad`,
    // url: `${process.env.APP_ENV}/isform/IS-TID/form/getDataOnLoad`,
  });
  showLoader(false);
  ctrl = data.ctrl;
  userLogin = data.userLogin;
  for (const item of data.ctrl) {
    if (!item.EMPNO || item.EMPNO.trim() == "") continue;
    console.log("controller", item.EMPNO);
    empImage[item.EMPNO] = await displayEmpImage(item.EMPNO);
  }
  for (const item of data.userLogin) {
    if (!item.EMPNO || item.EMPNO.trim() == "") continue;
    console.log("userLogin", item.EMPNO);
    empImage[item.EMPNO] = await displayEmpImage(item.EMPNO);
  }
  setDatePicker({ defaultDate: new Date() });
  setDatePicker(fpkTimeOpt, "#pStart");
  setDatePicker(fpkTimeOpt, "#pEnd");
  await setSelect2({ ...s2opt, ...s2disableSearch }, "#serverName");
  await setSelect2(
    { ...s2opt, ...s2disableSearch, templateResult: formatUser },
    "#userID"
  );
  await setSelect2(
    { ...s2opt, ...s2disableSearch, templateResult: formatUser },
    "#controller"
  );
  $('input[name="formType"][value="1"').prop("checked", true).trigger("change");
  $("#form").removeClass("hidden");
  $(".load").addClass("hidden");
  const wk = document.getElementById("workCon");
  const rs = document.getElementById("reason");
  wk.addEventListener("input", () => autosizeTextarea(wk));
  rs.addEventListener("input", () => autosizeTextarea(rs));
});

$(document).on("blur", "#requester", function () {
  const empid = $(this).val();
  const check = emp.find((el) => el.SEMPNO == empid);
  console.log(check);
  if (!check) {
    $(this).val("");
    // $(this).focus();
    showMessage("ไม่พบข้อมูลพนักงาน กรุณากรอกใหม่อีกครั้ง", "warning");
  }
});

$(document).on("keydown", 'input[name="reqNo[]"]', async function (e) {
  if (e.key === "Enter") {
    $(this).trigger("blur");
  }
});

$(document).on("blur", 'input[name="reqNo[]"]', async function () {
  // $(document).on('blur', '#reqNo', async function(){

  const reqNo = $(this).val().toUpperCase();
  console.log(reqNo);

  if (RegExp(/^[A-Za-z]+-[a-zA-Z0-9]+-[0-9]{6}$/).test(reqNo)) {
    $(this).val(reqNo);
  } else {
    $(this).val("");
    showMessage(
      "กรุณากรอกเลขที่คำร้องให้ถูกต้อง เช่น IS-DEV25-000127",
      "warning"
    );
    return;
  }
  $("#submit").find(".loading").removeClass("hidden");
  $("#submit").addClass("btn-disabled");
  $(this).prop("disabled", true);
  $(this).siblings(".loading").removeClass("hidden");

  const check = await getData({
    ...ajaxOptions,
    url: `${host}isform/IS-TID/form/getRequestNo`,
    // url: `${process.env.APP_ENV}/isform/IS-TID/form/getRequestNo`,
    data: { reqNo: reqNo },
  });

  $("#submit").find(".loading").addClass("hidden");
  $("#submit").removeClass("btn-disabled");
  $(this).prop("disabled", false);
  $(this).siblings(".loading").addClass("hidden");

  if (check.status == 0) {
    showMessage("ไม่พบเลขที่คำร้องนี้ในระบบ", "warning");
    $(this).val("");
    $(this).addClass("!input-error");
    // $('#serverName').prop('disabled', true);
  } else {
    $(this).removeClass("!input-error");
    $("#serverName").prop("disabled", false);
  }
});

$(document).on("change", "#serverName", async function () {
  const serverName = $(this).val();
  const opt = userLogin
    .map((el) => {
      // console.log(el.SERVER_NAME.trim() == serverName.trim(), el.SERVER_NAME, serverName, el.USER_LOGIN);
      return el.SERVER_NAME.trim() == serverName.trim()
        ? `<option value="${
            el.USER_LOGIN
          }" data-html="${el.USER_OWNER.trim()} (${el.EMPNO.trim()})" data-img="${
            empImage[el.EMPNO]
          }">
                ${el.USER_LOGIN}
        </option>`
        : "";
    })
    .join("");
  const ctrlopt = ctrl
    .map((el) => {
      // console.log('ctrl :',el.SERVER_NAME.trim() == serverName.trim(), el.SERVER_NAME, serverName, el.USER_LOGIN);
      return el.SERVER_NAME.trim() == serverName.trim()
        ? `<option value="${
            el.USER_LOGIN
          }" data-html="${el.USER_OWNER.trim()} (${el.EMPNO.trim()})" data-img="${
            empImage[el.EMPNO]
          }">
                ${el.USER_LOGIN}
        </option>`
        : "";
    })
    .join("");

  if (formType == 1) {
    ctrlopt == ""
      ? $("#userID").prop("disabled", true).val(null).trigger("change")
      : $("#userID")
          .html(`<option value=''></option>${ctrlopt}`)
          .prop("disabled", false);
  } else {
    opt == ""
      ? $("#userID").prop("disabled", true).val(null).trigger("change")
      : $("#userID")
          .html(`<option value=''></option>${opt}`)
          .prop("disabled", false);
    ctrlopt == ""
      ? $("#controller").prop("disabled", true).val(null).trigger("change")
      : $("#controller")
          .html(`<option value=''></option>${ctrlopt}`)
          .prop("disabled", false);
  }
  removeClassError($("#userID"));
  removeClassError($("#controller"));
});

$(document).on("change", 'input[name="formType"]', function () {
  console.log($(this).val());
  formType = $(this).val();
  // formType == 1 ? $('.divCon').addClass('hidden') : $('.divCon').removeClass('hidden');
  if (formType == 1) {
    $(".divCon").addClass("hidden");
    $("#controller").removeClass("req");
    $(".changeData").addClass("hidden");
    // $('#controller').removeClass('req').prop('required', false);
  } else {
    // flagSelect = true;
    $(".divCon").removeClass("hidden");
    $("#controller").addClass("req");
    $(".changeData").removeClass("hidden");
    // $('#controller').addClass('req').prop('required', true);
  }
  $("#changeData").prop("checked", false);

  if ($("#serverName option:selected").length != 0) {
    flagSelect = true;
    $("#serverName").val(null).trigger("change");
  }
  if ($("#userID option:selected").length != 0) {
    flagSelect = true;
    $("#userID").val(null).trigger("change");
  }
  if ($("#controller option:selected").length != 0) {
    flagSelect = true;
    $("#controller").val(null).trigger("change");
  }
  // $('#controller').val(null).trigger('change');
  // formType == 1 ? $('#controller').next('.select2-container').addClass('!hidden') : $('#controller').next('.select2-container').removeClass('!hidden');
});

$(document).on("submit", "#form", async function (e) {
  try {
    e.preventDefault();
    console.log("submit");
    const checkReq = $('input[name="reqno[]"]').each(function () {
      const check = $(this).data("check");
      console.log(check, $(this));

      if (check == 0) return false;
    });
    if (!checkReq) return;

    if (!(await requiredForm("#form"))) return;
    const frm = $(this);
    console.log(frm);
    const empno = $("#requester").val().trim();
    const formData = new FormData(frm[0]);
    const changeData = $("#changeData").is(":checked") ? 1 : 0;
    formData.set("controller", $("#controller").val());
    formData.set("userID", $("#userID").val());
    formData.set("changeData", changeData);
    const NFRMNO = $(".form-info").attr("NFRMNO");
    const VORGNO = $(".form-info").attr("VORGNO");
    const CYEAR = $(".form-info").attr("CYEAR");
    console.log(
      "NFRMNO",
      NFRMNO,
      "VORGNO",
      VORGNO,
      "CYEAR",
      CYEAR,
      "userno",
      empno
    );

    console.log(formType);

    var formInfo,
      formCreate = [],
      formCFS;
    for (let round = 1; round <= formType; round++) {
      console.log("test", round, formType);

      if (round == 2) {
        const ctrlRequester = (
          ctrl.find((el) => el.USER_LOGIN == $("#controller").val()) || {}
        ).EMPNO;
        formData.set("ctrlPEnd", addMinutesToTime($("#pEnd").val(), 30));
        formData.set("ctrlUserID", $("#controller").val());
        formData.set("ctrlRequester", ctrlRequester.trim());
        // formData.set('reqNo', formInfo);
        formData.set("ctrlController", "");
        formData.set(
          "ctrlWorkCon",
          `Enable and disable for user : ${$("#userID").val()}`
        );
        formInfo = await createForm2(
          NFRMNO,
          VORGNO,
          CYEAR,
          ctrlRequester.trim(),
          ctrlRequester.trim(),
          ""
        );
        formCreate.push(formInfo.message);
        console.log(formInfo);
        for (const key in formInfo.message) {
          formData.append(`ctrl${key}`, formInfo.message[key]);
        }
      } else {
        formInfo = await createForm2(NFRMNO, VORGNO, CYEAR, empno, empno, "");
        formCreate.push(formInfo.message);
        console.log(formInfo);
        for (const key in formInfo.message) {
          formData.append(key, formInfo.message[key]);
        }
      }
    }

    if (changeData) {
      formCFS = await getData({
        ...ajaxOptionsLoad,
        url: `${host}isform/IS-CFS/form/createForm`,
        data: formData,
        processData: false,
        contentType: false,
      });
      if (!formCFS.status) {
        // formCFS.form.create.forEach((el) => {
        //     deleteForm(el.message.formtype, el.message.owner, el.message.cyear, el.message.cyear2, el.message.runno);
        // });
        // formCreate.forEach((el) => {
        //     deleteForm(el.formtype, el.owner, el.cyear, el.cyear2, el.runno);
        // });
        throw new Error(formCFS.message);
      }
    }
    console.log("formCreate", formCreate);

    for (var pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }
    const res = await getData({
      ...ajaxOptionsLoad,
      url: `${host}isform/IS-TID/form/createForm`,
      data: formData,
      processData: false,
      contentType: false,
    });
    console.log(res);
    if (res.status == true) {
      showMessage("สร้างฟอร์มสำเร็จ", "success");
      redirectWebflow();
      // const path = window.location.host.includes('amecwebtest') ? 'formtest' : 'form';
      // const redirectUrl = `http://webflow.mitsubishielevatorasia.co.th/${path}/workflow/WaitApv.asp`;
      // console.log(redirectUrl);
      // window.location = redirectUrl;
    } else {
      // formCreate.forEach((el) => {
      //     deleteForm(el.formtype, el.owner, el.cyear, el.cyear2, el.runno);
      // });
      throw new Error(res.message);
    }
  } catch (e) {
    formCFS.form.create.forEach((el) => {
      const cond = {
        NFRMNO: el.message.formtype,
        VORGNO: el.message.owner,
        CYEAR: el.message.cyear,
        CYEAR2: el.message.cyear2,
        NRUNNO: el.message.runno,
      };
      getData({
        ...ajaxOptions,
        url: `${host}isform/IS-CFS/form/delete`,
        data: {
          form: cond,
        },
      });
      deleteForm(
        el.message.formtype,
        el.message.owner,
        el.message.cyear,
        el.message.cyear2,
        el.message.runno
      );
    });
    formCreate.forEach((el) => {
      deleteForm(el.formtype, el.owner, el.cyear, el.cyear2, el.runno);
    });
    showMessage(
      `เกิดข้อผิดพลาด: ${e.message} กรุณาลองใหม่อีกครั้งหรือติดต่อ Admin Tel:2038`
    );
    const mail = { ...mailOpt };
    mail.BODY = [
      `IS-TID Form Error : Create Form`,
      // mailForm(NFRMNO, VORGNO, CYEAR, CYEAR2, NRUNNO),
      e,
    ];
    sendMail(mail);
  }
});

/**
 * Add used area
 */
$(document).on("click", ".add-input", function () {
  const html = `<div class="relative w-full">
                    <input type="text" class="input txt-upper validator w-full req" name="reqNo[]" id="reqNo[]" data-check="0" placeholder="e.g. IS-DEV25-000127" required pattern="[A-Za-z]+-[a-zA-Z0-9]+-[0-9]{6}$" autocomplete="off"/>
                    <span class="loading loading-spinner text-primary absolute top-1/2 right-16 -translate-y-1/2 hidden"></span>
                    <span class="badge badge-neutral badge-xs absolute top-1/2 right-2 -translate-y-1/2">Enter</span>
                  </div>`;
  addInput($(this), html, ".inputGroup");
});

/**
 * Remove keeping point
 */
$(document).on("click", ".remove-input", function () {
  removeInput($(this), ".inputGroup", ".relative");
});
