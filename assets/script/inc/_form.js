import { ajaxOptions, checkAuthen, getData, root } from "../jFuntion";
import { host, showLoader } from "../utils";

const url = root.includes("amecwebtest")
  ? `${root}api-auth/api-dev/`
  : `${root}api-auth/api/`;
console.log(url);

/**
 * check mode for action form
 * @param {string} mode
 */
export function toggleActionForm(mode) {
  if (mode == "2") {
    $(".actions-Form").removeClass("hidden");
  } else {
    $(".actions-Form").addClass("hidden");
  }
}

/**
 * Redirect to wait for approve
 */
export function redirectWebflow() {
  const path = window.location.host.includes("amecwebtest")
    ? "formtest"
    : "form";
  const redirectUrl = `http://webflow.mitsubishielevatorasia.co.th/${path}/workflow/WaitApv.asp`;
  console.log(redirectUrl);
  window.location = redirectUrl;
}

/**
 * Create Form and Flow
 * @param {string} NFRMNO
 * @param {string} VORGNO
 * @param {string} CYEAR
 * @param {string} req
 * @param {string} key
 * @param {string} remark
 * @param {number} mflag
 * @returns
 */
export function createForm(
  NFRMNO,
  VORGNO,
  CYEAR,
  req,
  key,
  remark = "",
  mflag = 1
) {
  return new Promise((resolve) => {
    $.ajax({
      url: `${url}flow/create2`,
      type: "post",
      dataType: "json",
      data: {
        empno: req,
        inputempno: key,
        remark: remark,
        nfrmno: NFRMNO,
        vorgno: VORGNO,
        cyear: CYEAR,
        mflag: mflag,
      },
      beforeSend: function () {
        showLoader(true);
      },
      success: function (res) {
        resolve(res);
      },
      complete: function (xhr, status) {
        checkAuthen(xhr, status);
        showLoader(false);
      },
    });
  });
}
/**
 * Create Form and Flow
 * @param {string} NFRMNO
 * @param {string} VORGNO
 * @param {string} CYEAR
 * @param {string} req
 * @param {string} key
 * @param {string} remark
 * @param {string} draft  0 == under preparation, 1 = wait for approval
 * @returns
 */
export function createForm2(
  NFRMNO,
  VORGNO,
  CYEAR,
  req,
  key,
  remark = "",
  draft = ""
) {
  return new Promise((resolve) => {
    $.ajax({
      url: `${root}webservice/webflow/form/create`,
      type: "post",
      dataType: "json",
      data: {
        empno: req,
        inputempno: key,
        remark: remark,
        nfrmno: NFRMNO,
        vorgno: VORGNO,
        cyear: CYEAR,
        draft: draft,
      },
      beforeSend: function () {
        showLoader(true);
      },
      success: function (res) {
        resolve(res);
      },
      complete: function (xhr, status) {
        checkAuthen(xhr, status);
        showLoader(false);
      },
    });
  });
}

/**
 * Delete Form and Flow
 * @param {string} NFRMNO
 * @param {string} VORGNO
 * @param {string} CYEAR
 * @param {string} CYEAR2
 * @param {string} NRUNNO
 * @return {Promise}
 */
export function deleteForm(NFRMNO, VORGNO, CYEAR, CYEAR2, NRUNNO) {
  return new Promise((resolve) => {
    $.ajax({
      url: `${root}webservice/webflow/form/deleteForm`,
      // url: `${url}flow/deleteForm`,
      type: "post",
      dataType: "json",
      data: {
        nfrmno: NFRMNO,
        vorgno: VORGNO,
        cyear: CYEAR,
        cyear2: CYEAR2,
        runno: NRUNNO,
      },
      beforeSend: function () {
        showLoader(true);
      },
      success: function (res) {
        resolve(res);
      },
      complete: function (xhr, status) {
        checkAuthen(xhr, status);
        showLoader(false);
      },
    });
  });
}

/**
 * Show Flow
 * @param {string} NFRMNO
 * @param {string} VORGNO
 * @param {string} CYEAR
 * @param {string} CYEAR2
 * @param {string} NRUNNO
 * @return {Promise}
 */
export function showFlow(NFRMNO, VORGNO, CYEAR, CYEAR2, NRUNNO) {
  return new Promise((resolve) => {
    $.ajax({
      // url: `${url}flow/showflow`,
      // url: uri.includes('amecwebtest') ? `${url}flow/showflow` : `${uri}/webservice/webflow/Flow/showflow`,
      url: `${root}webservice/webflow/Flow/showflow`,
      type: "post",
      dataType: "json",
      data: {
        nfrmno: NFRMNO,
        vorgno: VORGNO,
        cyear: CYEAR,
        cyear2: CYEAR2,
        runno: NRUNNO,
      },
      beforeSend: function () {
        showLoader(true);
      },
      success: function (res) {
        res.html = res.html.replace(
          /<table style="/g,
          '<table style=" display:block; overflow-x:scroll;'
        );
        $("#flow").html(res.html);
        resolve(res);
      },
      complete: function (xhr, status) {
        checkAuthen(xhr, status);
        showLoader(false);
      },
    });
  });
}

/**
 * Action Flow
 * @param {string} NFRMNO
 * @param {string} VORGNO
 * @param {string} CYEAR
 * @param {string} CYEAR2
 * @param {string} NRUNNO
 * @param {string} action
 * @param {string} empno
 * @param {string} remark
 * @return {Promise}
 */
export function doaction(
  NFRMNO,
  VORGNO,
  CYEAR,
  CYEAR2,
  NRUNNO,
  action,
  empno,
  remark
) {
  return new Promise((resolve) => {
    $.ajax({
      // url: `http://amecwebtest.mitsubishielevatorasia.co.th/api-auth/api-dev/appflow/doaction`,
      url: `${url}appflow/doaction`,
      type: "post",
      dataType: "json",
      data: {
        frmNo: NFRMNO,
        orgNo: VORGNO,
        y: CYEAR,
        y2: CYEAR2,
        runNo: NRUNNO,
        action: action,
        apv: empno,
        remark: remark,
      },
      beforeSend: function () {
        showLoader(true);
      },
      success: function (res) {
        resolve(res);
      },
      complete: function (xhr, status) {
        checkAuthen(xhr, status);
        showLoader(false);
      },
    });
  });
}

/**
 * Action Flow
 * @param {string} NFRMNO
 * @param {string} VORGNO
 * @param {string} CYEAR
 * @param {string} CYEAR2
 * @param {string} NRUNNO
 * @param {string} action
 * @param {string} empno
 * @param {string} remark
 * @return {Promise}
 */
export function doactionWebservice(
  NFRMNO,
  VORGNO,
  CYEAR,
  CYEAR2,
  NRUNNO,
  action,
  empno,
  remark
) {
  return new Promise((resolve) => {
    $.ajax({
      // url: `http://amecwebtest.mitsubishielevatorasia.co.th/api-auth/api-dev/appflow/doaction`,
      url: `${root}webservice/webflow/flow/doaction`,
      type: "post",
      dataType: "json",
      data: {
        frmNo: NFRMNO,
        orgNo: VORGNO,
        y: CYEAR,
        y2: CYEAR2,
        runNo: NRUNNO,
        action: action,
        apv: empno,
        remark: remark,
      },
      beforeSend: function () {
        showLoader(true);
      },
      success: function (res) {
        resolve(res);
      },
      complete: function (xhr, status) {
        checkAuthen(xhr, status);
        showLoader(false);
      },
    });
  });
}

export async function setformDetail(form) {
  const data = await getData({
    ...ajaxOptions,
    url: `${host}Authen/getFormDetail`,
    data: form,
  });
  return `<div class="h-full w-full md:w-fit bg-base-200 border border-base-300 p-4 rounded-box relative">
                <div class="absolute text-lg top-[-13px] font-bold">Form Information</div>
                <table class="table">
                    <tbody>
                        <tr>
                            <td class="text-primary">Form no:</td>
                            <td>${data.FORMNO}</td>
                        </tr>
                        <tr>
                            <td class="text-primary">Input by:</td>
                            <td>(${data.VINPUTER}) ${data.VINPUTNAME}</td>
                        </tr>
                        <tr>
                            <td class="text-primary">Requested by:</td>
                            <td>(${data.VREQNO})  ${data.VREQNAME}</td>
                        </tr>
                    </tbody>
                </table>

            </div>`;
}

// export function convToFormNumber(formtype, owner, cyear, cyear2, runno){
//     return $frmname[0]->VANAME.substr($y2,2,2)."-".str_pad($runNo, 6, "0", STR_PAD_LEFT); // ST-INP24-000001
// }
