import {
    showErrorMessage,
    showMessage,
    getAllAttr,
    removeClassError,
    requiredForm,
    logFormData,
    ordinalIndicator,
} from "@amec/webasset/utils";
import { webflowSubmit } from "@amec/webasset/components/form";
import { formSubmitSkeleton } from "@amec/webasset/skeleton";
import { dragDropInit, handleFiles } from "@amec/webasset/dragdrop";
import { redirectWebflow, setformDetail } from "@amec/webasset/form";
import { showLoader } from "@amec/webasset/preloader";
import { doaction, showflow } from "@amec/webasset/api/webform";
import { setDatePicker } from "@amec/webasset/flatpickr";
import { searchUser, getUser } from "@amec/webasset/api/amec";

import select2 from "select2";

import { setSelect2 } from "@amec/webasset/select2";
import { create, getData } from "./data";
import { formatDate } from "@amec/webasset/dayjs";
import { downloadOrOpenFile } from "@amec/webasset/api/file";
import { classIcofont } from "@amec/webasset/fileExplorer";

var formInfo,
    empno,
    mode,
    form,
    allUser,
    requiredMessage = [];

//prettier-ignore
$(async function () {
    try {
        select2();
        let flow = {};

        formInfo = await getAllAttr(".form-info");  // get form info from html attribute
        mode = Number(formInfo.mode); // get mode
        empno = $(".apv-data").attr("empno"); // get employee number
        if(mode != 1){
            form = {
                NFRMNO: formInfo.nfrmno,
                VORGNO: formInfo.vorgno,
                CYEAR: formInfo.cyear,
                CYEAR2: formInfo.cyear2,
                NRUNNO: formInfo.nrunno,
            };
            flow = await showflow(form);
            const formDetailHtml = await setformDetail(form);
            $('#section-0').html(formDetailHtml);
            await setView(flow);
        }else{
            const dragdropField = dragDropInit({
                class: 'req'
            });
            setDatePicker();
            $('#attachFile').html(dragdropField);
            $('#INPUTBY').val(empno);
        }
        // set skeleton
        await setSkeleton(mode);
        // create button submit form
        let flowsubmit = "";
        switch (mode) {
            case 1:
                flowsubmit = webflowSubmit({ request: true })
                break;
            case 2:
                flowsubmit = webflowSubmit({ flow: true, flowhtml: flow.html, approve: true, reject: true });
                break;
            default:
                flowsubmit = webflowSubmit({ flow: true, flowhtml: flow.html, actionsForm: false});
                break;
        }
        $("#btnAction").html(flowsubmit);
        allUser = await searchUser({CSTATUS: '1'});
    } catch (error) {
        console.error("Error initializing the form:", error);
        showErrorMessage(error.message);
        showMessage("Cannot load form data", "error");
    }
});

$(document).on("change", 'input[name="files"]', async function (e) {
    handleFiles();
});

$(document).on("change", "#REQBY", async function () {
    try {
        const empno = $(this).val();
        await getUser(empno);
    } catch (error) {
        $(this).val("");
        console.error("Empno not found:", error);
        showErrorMessage(`Empno not found: ${error.message}`);
    }
});

// เมื่อเลือก Invoice Type เป็น Other ให้เปิดช่องกรอกข้อมูล
$(document).on("change", 'input[name="INVOICE_TYPE"]', async function () {
    const type = getCheckboxValues("INVOICE_TYPE", "i-type");
    if (type.includes("other")) {
        $("#INVOICE_OTHER").attr("disabled", false);
        $("#INVOICE_OTHER").addClass("req");
        removeClassError($("#INVOICE_OTHER"));
    } else {
        $("#INVOICE_OTHER").attr("disabled", true);
        $("#INVOICE_OTHER").val("");
        $("#INVOICE_OTHER").removeClass("req");
    }

    if (type.includes("service")) {
        if ($("#REQBY").val() == "") {
            showMessage("Please input requester", "warning");
            $('input[name="INVOICE_TYPE"][i-type="service"]').prop(
                "checked",
                false,
            );
            return;
        }
        const requester = allUser.find((u) => u.SEMPNO == empno);
        const thirdParty = allUser
            .filter(
                (u) => u.SPOSCODE == "30" && u.SSECCODE != requester.SSECCODE,
            )
            .sort((a, b) => {
                return a.SNAME.localeCompare(b.SNAME);
            });
        if (!$("#THIRD_PARTY").hasClass("select2-hidden-accessible")) {
            await setSelect2({
                id: "THIRD_PARTY",
                data: thirdParty.map((u) => ({
                    value: u.SEMPNO,
                    text: `${u.SNAME} (${u.SEMPNO})`,
                })),
                width: "24rem",
                size: "sm",
            });
        }
        $("#THIRD_PARTY").addClass("req");
        $("#THIRD_PARTY").closest("fieldset").removeClass("hidden!");
    } else {
        $("#THIRD_PARTY").removeClass("req");
        $("#THIRD_PARTY").closest("fieldset").addClass("hidden!");
    }
});

// เมื่อเลือก Accept PO เป็น Subcon หรือ Other ให้เปิดช่องกรอกข้อมูล
$(document).on("change", 'input[name="ACCEPT_PO"]', function () {
    const type = $(this).attr("a-type");
    switch (type) {
        case "subcon":
            $("#ACCEPT_SUBCON").attr("disabled", false);
            $("#ACCEPT_SUBCON").addClass("req");
            removeClassError($("#ACCEPT_SUBCON"));
            $("#ACCEPT_OTHER").attr("disabled", true);
            $("#ACCEPT_OTHER").val("");
            $("#ACCEPT_OTHER").removeClass("req");
            break;

        case "other":
            $("#ACCEPT_OTHER").attr("disabled", false);
            $("#ACCEPT_OTHER").addClass("req");
            removeClassError($("#ACCEPT_OTHER"));
            $("#ACCEPT_SUBCON").attr("disabled", true);
            $("#ACCEPT_SUBCON").val("");
            $("#ACCEPT_SUBCON").removeClass("req");
            break;
    }
});

// เมื่อเลือก PAYMENT CONDITIONS & TERMS
$(document).on("change", 'input[name="PAYMENT_TYPE"]', function () {
    const type = $(this).attr("p-type");
    $('input[name="PAYMENT_NUM"]').val("");
    $("#PAYMENT").attr("disabled", false);
    // แสดงตัวเลือกการแนบไฟล์
    $(".attach-file:not(#attach-other)").addClass("hidden");
    $('input[name="ATTACH_TYPE"]:not([a-type="other"])').prop("checked", false);
    $('input[name="ATTACH_TYPE"]').trigger("change");
    $("#attach-other").removeClass("hidden");
    switch (type) {
        case "manual":
            $('input[name="PAYMENT_NUM"]').attr("disabled", false);
            $('input[name="PAYMENT_NUM"]').addClass("req");
            $('input[name="PAYMENT_NUM"]').val(1);
            $('input[name="PAYMENT_NUM"]').trigger("input");
            removeClassError($('input[name="PAYMENT_NUM"]'));
            break;
        case "final":
            $('input[name="PAYMENT_NUM"]').attr("disabled", true);
            $('input[name="PAYMENT_NUM"]').removeClass("req");
            // แสดงตัวเลือกการแนบไฟล์
            $("#attach-part").removeClass("hidden");
            $("#attach-thirdparty").removeClass("hidden");
            $("#attach-delivery").removeClass("hidden");
            $("#attach-asset").removeClass("hidden");
            break;
    }
});

$(document).on("input", "input[name='PAYMENT_NUM']", function () {
    const value = $(this)
        .val()
        .replace(/[^0-9]/g, "");
    const payment = !value ? 1 : Number(value);
    $(this).val(payment);
    $(".attach-file:not(#attach-other)").addClass("hidden");
    $('input[name="ATTACH_TYPE"]:not([a-type="other"])').prop("checked", false);
    $('input[name="ATTACH_TYPE"]').trigger("change");

    selectAttachType(payment);
});

$(document).on("change", 'input[name="ATTACH_TYPE"]', function () {
    const type = getCheckboxValues("ATTACH_TYPE", "a-type");
    if (type.includes("other")) {
        $("#ATTACH_OTHER").attr("disabled", false);
        $("#ATTACH_OTHER").addClass("req");
        removeClassError($("#ATTACH_OTHER"));
    } else {
        $("#ATTACH_OTHER").attr("disabled", true);
        $("#ATTACH_OTHER").val("");
        $("#ATTACH_OTHER").removeClass("req");
    }
});

//prettier-ignore
$(document).on('click', '#btnRequest', async function () {
    try {
        showLoader();
        const requester = $('#REQBY');
        const delivery = $('input[name="DELIVELY"]')
        const invoiceType = $('input[name="INVOICE_TYPE"]');
        const otherInvoice = $('#INVOICE_OTHER');
        const subject = $('#SUBJECT');
        const acceptPO = $('input[name="ACCEPT_PO"]');
        const otherAccept = $('#ACCEPT_OTHER');
        const subconDetail = $('#ACCEPT_SUBCON');
        const thirdParty = $('#THIRD_PARTY');
        const quotation = $('#QUOTATION');
        const prpo = $('#PONO');
        const totalAmount = $('#TOTAL_AMOUNT');
        const invoiceNo = $('#INVOICE_NO');
        const invoiceAmount = $('#INVOICE_AMOUNT');
        const paymentType = $('input[name="PAYMENT_TYPE"]');
        const payment = $('#PAYMENT');
        const numPayment = $('#PAYMENT_NUM');
        const files = $('#files');
        requiredMessage = [
            {element: requester, message: "Please input requester."},
            {element: delivery,  message: "Please select Delivery Location."},
            {element: invoiceType, message: "Please select Invoice Type."},
            !thirdParty.closest('fieldset').hasClass('hidden!') ? {element: thirdParty, message: "Please select Third Party."} : null,
            otherInvoice.hasClass('req') ? {element: otherInvoice, message: "Please input other invoice detail."} : null,
            {element: subject, message: "Please input subject."},
            // {element: acceptPO, message: "Please select Accept PO."},
            // subconDetail.hasClass('req') ? {element: subconDetail, message: "Please input subcon detail."} : null,
            // otherAccept.hasClass('req') ? {element: otherAccept, message: "Please input other accept PO detail."} : null,
            // {element: quotation, message: "Please input Quotation No."},
            // {element: prpo, message: "Please input PR/PO No."},
            // {element: totalAmount, message: "Please input Total Amount."},
            {element: invoiceNo, message: "Please input Invoice No."},
            {element: invoiceAmount, message: "Please input Invoice Amount."},
            {element: paymentType, message: "Please select Payment Conditions & Terms."},
            {element: payment, message: "Please input Payment Amount."},
            numPayment.hasClass('req') ? {element: numPayment, message: "Please input Number of Payment."} : null,
            {element: files, message: "Please attach files."},
        ].filter(Boolean);
        
        // if (!(await requiredForm("#form"))) return;
        if(!(await requiredForm('#form', requiredMessage))) return;

        const formData = new FormData($('#form')[0]);
        formData.append("NFRMNO", formInfo.nfrmno);
        formData.append("VORGNO", formInfo.vorgno);
        formData.append("CYEAR", formInfo.cyear);
        formData.append("REMARK", $('#remark').val());
        
        // กรองเฉพาะ field ที่มีค่า
        const filteredFormData = new FormData();
        for (let [key, value] of formData.entries()) {
            if (value !== undefined && value !== null && value !== "") {
                filteredFormData.append(key, value);
            }
        }
        logFormData(filteredFormData);

        const res = await create(filteredFormData);

        if (res.status == true) {
            showMessage(res.message, "success");
            redirectWebflow();
        } else {
            throw new Error(res.message);
        }

    } catch (error) {
        console.error("Error submitting the form:", error);
        showErrorMessage(error.message);
    } finally {
        showLoader({show: false});
    }
});

var isButtonProcessing = false;
$(document).on("click", 'button[name="btnAction"]', async function (e) {
    try {
        // ป้องกันการคลิกซ้ำ
        if (isButtonProcessing) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return;
        }
        isButtonProcessing = true;
        showLoader();
        let res;
        const action = $(this).val();
        res = await doaction({
            ...form,
            EMPNO: empno,
            ACTION: action,
            REMARK: $("#remark").val(),
        });

        if (res.status == true) {
            showMessage(res.message, "success");
            redirectWebflow();
        } else {
            throw new Error(res.message);
        }
    } catch (error) {
        console.error("Error: " + error);
        showErrorMessage(error.message);
    } finally {
        showLoader({ show: false });
        // Reset flag
        setTimeout(() => {
            isButtonProcessing = false;
        }, 2000);
    }
});

$(document).on("click", ".file-link", async function (e) {
    e.preventDefault();
    const filePath = $(this).attr("href");
    const filename = $(this).text();
    const storedName = $(this).attr("storedName");
    const ext = filename.split(".").pop();

    await downloadOrOpenFile({
        baseDir: filePath,
        storedName: storedName,
        originalName: filename,
        mode: ext == "pdf" ? "open" : "download",
    });
});

async function setSkeleton(mode) {
    switch (mode) {
        case 1:
            formSubmitSkeleton({
                count: 2,
                element: "#btnAction",
                mode: "create",
            });
            break;
        case 2:
            formSubmitSkeleton({
                count: 2,
                element: "#btnAction",
                mode: "edit",
            });
            break;
        default:
            formSubmitSkeleton({
                element: "#btnAction",
                mode: "view",
            });
            break;
    }
}

function getCheckboxValues(name, attr = "value") {
    const checked = $(`input[name="${name}"]:checked`)
        .map(function () {
            if (attr === "value") {
                return $(this).val();
            } else {
                return $(this).attr(attr);
            }
        })
        .get();
    return checked;
}

function selectAttachType(type) {
    switch (type) {
        case 1:
            $("#attach-po").removeClass("hidden");
            break;
        default:
            $("#attach-equipment").removeClass("hidden");
            $("#attach-thirdparty").removeClass("hidden");
            $("#attach-delivery").removeClass("hidden");
            break;
    }
}

//prettier-ignore
async function setView(flow) {
    try{
        showLoader();
        const data = await getData(form);
        setFile(data.FILES);
        $('input[name="DELIVELY"][value="' + data.DELIVELY + '"]').prop("checked",true,);
        $('input[name="INVOICE_TYPE"]').each(function(){
            const value = $(this).val();
            const type = $(this).attr('i-type');
            if(data.INVOICE_TYPE.includes(value)){
                $(this).prop("checked", true);
                if(type == 'service'){
                    const thirdParty = flow.data.filter(f => f.CSTEPNO == '40')
                    .map(f => f.SNAME + '(' + f.VAPVNO + ')');
                    $("#THIRD_PARTY").closest("fieldset").removeClass("hidden!");
                    $("#THIRD_PARTY").text(thirdParty || 'N/A');
                }
                if(type == 'other'){
                    $('#INVOICE_OTHER').text(data.INVOICE_OTHER || '-   ');
                }
            }
        });
        $('#SUBJECT').text(data.SUBJECT || '-');
        $('input[name="ACCEPT_PO"][value="' + data.ACCEPT_PO + '"]').prop("checked",true);
        $('#ACCEPT_SUBCON').text(data.ACCEPT_SUBCON || '-');
        $('#ACCEPT_OTHER').text(data.ACCEPT_OTHER || '-');
        $('#QUOTATION').text(data.QUOTATION || '-');
        $('#PONO').text(data.PONO || '-');
        // $('#PO_SIGNBY').text(data.PO_SIGNBY || '-');
        $('#QUOTATION_DATE').text(data.QUOTATION_DATE ? formatDate(data.QUOTATION_DATE) : '-');
        $('#TOTAL_AMOUNT').text(data.TOTAL_AMOUNT || '0');
        // $('#PO_SIGNDATE').text(data.PO_SIGNDATE ? formatDate(data.PO_SIGNDATE) : '-');
        // $('input[name="FORM_TYPE"][value="' + data.FORM_TYPE + '"]').prop("checked",true,);
        $('#INVOICE_NO').text(data.INVOICE_NO || '-');
        $('#INVOICE_AMOUNT').text(data.INVOICE_AMOUNT || '0');
        $('#PERSON_INCHARGE').text(data.PERSON_INCHARGE || '-');
        $('#INVOICE_DATE').text(data.INVOICE_DATE ? formatDate(data.INVOICE_DATE) : '-');
        $('#PAYMENT').text(data.PAYMENT || '0');
        $('#PAYMENT_DETAIL').text(data.PAYMENT_DETAIL || '-');
        $('#attach-other').removeClass('hidden');
        $('input[name="PAYMENT_TYPE"]').each(function(){
            const value = $(this).val();
            const type = $(this).attr('p-type');
            if(data.PAYMENT_TYPE == value){
                $(this).prop("checked", true);
                if(type == 'manual'){
                    $('#PAYMENT_NUM').html(ordinalIndicator(data.PAYMENT_NUM) || '-');
                    selectAttachType(data.PAYMENT_NUM);
                }
                if(type == 'final'){
                    // แสดงตัวเลือกการแนบไฟล์
                    $("#attach-part").removeClass("hidden");
                    $("#attach-thirdparty").removeClass("hidden");
                    $("#attach-delivery").removeClass("hidden");
                    $("#attach-asset").removeClass("hidden");
                }
            }
        });
        $('input[name="ATTACH_TYPE"]').each(function(){
            const value = $(this).val();
            const type = $(this).attr('a-type');
            if(data.ATTACH_TYPE.includes(value)){
                $(this).prop("checked", true);
                if(type == 'other'){
                    $('#ATTACH_OTHER').text(data.ATTACH_OTHER || '-');
                }
            }
        });
    } catch(error){
        console.error("Error setting view data:", error);
        showErrorMessage(error.message);
    } finally {
        showLoader({show: false});
    }
}

function setFile(files) {
    let html = "";
    if (files.length > 0) {
        html = "<div class='flex flex-col gap-3 mt-5'>";
        files.forEach((f) => {
            html += `<a href="${f.FILE_PATH}" storedName="${f.FILE_FNAME}" class="file-link text-primary flex items-center gap-3 w-full border rounded-lg bg-base-100 p-3"><i class="${classIcofont(f.FILE_ONAME.split(".").pop())} text-4xl"></i><span class="link link-primary">${f.FILE_ONAME}</span></a>`;
        });
        html += "</div>";
    } else {
        html = `<div class="mt-5">No attached files. </div>`;
    }
    $("#attachFile").html(html);
}
