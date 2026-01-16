// // import { getData, insertData } from "./data";
import {
    addClassError,
    showErrorMessage,
    showMessage,
    getAllAttr,
} from "@amec/webasset/utils";
import { webflowSubmit } from "@amec/webasset/components/form";
import { formSubmitSkeleton } from "@amec/webasset/skeleton";
import { dragDropInit } from "@amec/webasset/dragdrop";
// import { redirectWebflow } from "@public/_form";
// import { showLoader } from "@public/preloader";
import { doaction, showflow } from "@amec/webasset/api/webform";
// import { getIsFile } from "../../api/isform/is-file";
// import { downloadOrOpenFile } from "../../api/file";

var formInfo, empno, mode, form;

//prettier-ignore
$(async function () {
    try {
        const dragdropField = dragDropInit();
        $('#attachFile').html(dragdropField);
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
            const flow = await showflow(form);
            // const file = await getIsFile(form);
            // if(file.length > 0){
            //     let fileLink = "<div class='flex flex-col gap-3 mt-5'>";
            //     file.forEach(f => {
            //         fileLink +=  `<a href="${f.FILE_PATH}" storedName="${f.FILE_FNAME}" class="file-link text-primary flex items-center gap-3 w-full border rounded-lg bg-base-100 p-3"><i class="icofont-file-excel text-success text-4xl"></i><span class="link link-primary">${f.FILE_ONAME}</span></a>`;
            //     });
            //     fileLink += "</div>";
            //     $("#attachFile").html(fileLink);
            // }
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
                flowsubmit = webflowSubmit({ flow: true, flowhtml: flow.html, approve: true });
                break;
            default:
                flowsubmit = webflowSubmit({ flow: true, flowhtml: flow.html, actionsForm: false});
                break;
        }
        $("#btnAction").html(flowsubmit);
    } catch (error) {
        console.error("Error initializing the form:", error);
        showErrorMessage(error.message);
        showMessage("Cannot load form data", "error");
    } 
});

$(document).on('click', 'input[name="invoice-type"]', function(){
    const value = $(this).val();
    if(value == "other"){
        $('#other-invoice').attr('disabled', false);
    } else {
        $('#other-invoice').attr('disabled', true);
        $('#other-invoice').val('');
    }
});

$(document).on('click', 'input[name="accept-po"]', function(){
    const value = $(this).val();
    if(value == "subcon"){
        $('#subcon-detail').attr('disabled', false);
    } else {
        $('#subcon-detail').attr('disabled', true);
        $('#subcon-detail').val('');
    }

    if(value == "other"){
        $('#other-accept').attr('disabled', false);
    } else {
        $('#other-accept').attr('disabled', true);
        $('#other-accept').val('');
    }
});

// //prettier-ignore
// $(document).on('click', '#btnRequest', async function () {
//     try {
//         let isValid = true;

//         const data = table.data().toArray().map((d) => {
//             if(d.DEV_PLAN == 0){
//                 isValid = false;
//             }
//             return {
//                 PLANYEAR: d.PLANYEAR,
//                 REQ_DIV: d.REQ_DIV,
//                 USER_REQ: d.USER_REQ,
//                 DEV_PLAN: d.DEV_PLAN,
//                 MANHOUR: d.MH,
//                 COST: d.COST,
//             }
//         });
//         if(!isValid){
//             addClassError($('.dev-confirm[value=""]'));
//             showMessage("กรุณากรอก Development Plan ให้ครบถ้วน", 'warning');
//             return;
//         }
//         if($('#file')[0].files.length == 0){
//             addClassError($('#file'));
//             showMessage("กรุณาแนบไฟล์ Attachment Annual plan", 'warning');
//             return;
//         }
//         const formData = new FormData($('#form')[0]);
//         formData.append("NFRMNO", formInfo.nfrmno);
//         formData.append("VORGNO", formInfo.vorgno);
//         formData.append("CYEAR", formInfo.cyear);
//         formData.append("REMARK", $('#remark').val());
//         formData.append("REQUESTER", empno);
//         formData.append("CREATEBY", empno);
//         data.forEach((item, i) => {
//             // NestJS จะมองเป็น data[0][field], data[1][field]
//             Object.keys(item).forEach((key) => {
//                 formData.append(`data[${i}][${key}]`, item[key] ?? "");
//             });
//         });

//         const res = await insertData(formData);
//         if (res.status == true) {
//             showMessage(res.message, "success");
//             redirectWebflow();
//         } else {
//             throw new Error(res.message);
//         }

//     } catch (error) {
//         console.error("Error submitting the form:", error);
//         showErrorMessage(error.message);
//     }
// });

// var isButtonProcessing = false;
// $(document).on("click", 'button[name="btnAction"]', async function (e) {
//     try {
//         // ป้องกันการคลิกซ้ำ
//         if (isButtonProcessing) {
//             e.preventDefault();
//             e.stopImmediatePropagation();
//             return;
//         }
//         isButtonProcessing = true;
//         showLoader();
//         let res;
//         const action = $(this).val();
//         res = await doaction({
//             ...form,
//             EMPNO: empno,
//             ACTION: action,
//             REMARK: $("#remark").val(),
//         });

//         if (res.status == true) {
//             showMessage(res.message, "success");
//             redirectWebflow();
//         } else {
//             throw new Error(res.message);
//         }
//     } catch (error) {
//         console.error("Error: " + error);
//         showErrorMessage(error);
//     } finally {
//         showLoader({ show: false });
//         // Reset flag
//         setTimeout(() => {
//             isButtonProcessing = false;
//         }, 2000);
//     }
// });

// $(document).on("click", ".file-link", async function (e) {
//     e.preventDefault();
//     const filePath = $(this).attr("href");
//     const filename = $(this).text();
//     const storedName = $(this).attr("storedName");
//     await downloadOrOpenFile({
//         baseDir: filePath,
//         storedName: storedName,
//         originalName: filename,
//         mode: "download",
//     });
// });

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
