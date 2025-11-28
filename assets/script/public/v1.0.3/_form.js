/**
 * Manage Form and Flow
 * @module _form
 * @description This file is used to manage form and flow functionality.
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @since  2025-05-01
 * @requires jQuery npm install jquery
 * @requires jFuntion
 * @requires utils
 * @version 1.0.1
 * @version 1.0.3 
 * @note 2025-10-31 เปลี่ยนไปยิงที่ API ทั้งหมด
 */

import { getFormDetail } from "../../api/webform/form";
import { checkAuthen, logtest, root } from "./jFuntion";
import { showLoader } from "./preloader";

/**
 * Redirect to wait for approve
 */
export function redirectWebflow(){
    const path = window.location.host.includes('amecwebtest') ? 'formtest' : 'form';
    logtest('path webflow', path);
    const redirectUrl = `http://webflow.mitsubishielevatorasia.co.th/${path}/workflow/WaitApv.asp`;
    window.location = redirectUrl;
}

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

export async function setformDetail(form) {
  const data = await getFormDetail(form);
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
export function createForm(NFRMNO, VORGNO, CYEAR, req, key, remark='', draft=''){
     const form = {
        NFRMNO: NFRMNO,
        VORGNO: VORGNO,
        CYEAR: CYEAR,
        REQBY: req,
        INPUTBY: key,
        REMARK: remark,
    };
    if (draft) form.DRAFT = draft;

    return new Promise((resolve) => {
        $.ajax({
            url: `${process.env.APP_API}/form/createForm`,
            type: "post",
            dataType: "json",
            data: form,
            beforeSend: function (){
                showLoader();
            },
            success: function (res) {
                resolve(res);
            },
            complete: function(xhr, status){
                checkAuthen(xhr, status);
                showLoader({show: false});
            }
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
// prettier-ignore
export function createForm2(NFRMNO, VORGNO, CYEAR, req, key, remark='', draft = ''){
    const form = {
        NFRMNO: NFRMNO,
        VORGNO: VORGNO,
        CYEAR: CYEAR,
        REQBY: req,
        INPUTBY: key,
        REMARK: remark,
    };
    if (draft) form.DRAFT = draft;
    return new Promise((resolve) => {
        $.ajax({
            url: `${process.env.APP_API}/form/createForm`,
            type: "post",
            dataType: "json",
            data: form,
            beforeSend: function (){
                showLoader();
            },
            success: function (res) {
                resolve(res);
            },
            complete: function(xhr, status){
                checkAuthen(xhr, status);
                showLoader({show: false});
            }
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
export function deleteForm(NFRMNO, VORGNO, CYEAR, CYEAR2, NRUNNO){
    return new Promise((resolve) => {
        $.ajax({
            url: `${process.env.APP_API}/form/deleteForm`,
            type: "Delete",
            dataType: "json",
            data: { 
                NFRMNO : NFRMNO,
                VORGNO : VORGNO,
                CYEAR  : CYEAR,
                CYEAR2 : CYEAR2,
                NRUNNO : NRUNNO,
            },
            beforeSend: function (){
                showLoader();
            },
            success: function (res) {
                resolve(res);
            },
            error: function (err) {
                console.log(err);
                
                resolve(err);
            },
            complete: function(xhr, status){
                checkAuthen(xhr, status);
                showLoader({show: false});
            }
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
export function showFlow(NFRMNO, VORGNO, CYEAR, CYEAR2, NRUNNO, showStep=false){
    return new Promise((resolve) => {
        $.ajax({
            url: `${process.env.APP_API}/flow/showflow`,
            type: "post",
            dataType: "json",
            data: { 
                NFRMNO : NFRMNO,
                VORGNO : VORGNO,
                CYEAR  : CYEAR,
                CYEAR2 : CYEAR2,
                NRUNNO  : NRUNNO,
                showStep: showStep
            },
            beforeSend: function (){
                showLoader();
            },
            success: function (res) {
                res.html = res.html.replace(/<table style="/g, '<table style=" display:block; overflow-x:scroll;');
                $("#flow").html(res.html);
                resolve(res);
            },
            complete: function(xhr, status){
                checkAuthen(xhr, status);
                showLoader({show: false});
            }
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
export function doaction(NFRMNO, VORGNO, CYEAR, CYEAR2, NRUNNO, action, empno, remark){
    return new Promise((resolve) => {
        $.ajax({
            url: `${process.env.APP_API}/flow/doaction`,
            type: "post",
            dataType: "json",
            data: { 
                NFRMNO  : NFRMNO,
                VORGNO  : VORGNO,
                CYEAR   : CYEAR,
                CYEAR2  : CYEAR2,
                NRUNNO : NRUNNO,
                ACTION : action,
                EMPNO  : empno,
                REMARK : remark,
            },
            beforeSend: function (){
                showLoader();
            },
            success: function (res) {
                resolve(res);
            },
            complete: function(xhr, status){
                checkAuthen(xhr, status);
                showLoader({show: false});
            }
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
export function doactionWebservice(NFRMNO, VORGNO, CYEAR, CYEAR2, NRUNNO, action, empno, remark){
    return new Promise((resolve) => {
        $.ajax({
            url: `${process.env.APP_API}/flow/doaction`,
            type: "post",
            dataType: "json",
            data: { 
                NFRMNO  : NFRMNO,
                VORGNO  : VORGNO,
                CYEAR  : CYEAR,
                CYEAR2 : CYEAR2,
                NRUNNO : NRUNNO,
                ACTION : action,
                EMPNO  : empno,
                REMARK : remark,
            },
            beforeSend: function (){
                showLoader();
            },
            success: function (res) {
                resolve(res);
            },
            complete: function(xhr, status){
                checkAuthen(xhr, status);
                showLoader({show: false});
            }
        });
    });
}




