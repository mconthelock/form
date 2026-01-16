import { createTable } from "@amec/webasset/dataTable";
import {
    addClassError,
    showErrorMessage,
    showMessage,
    getAllAttr,
} from "@amec/webasset/utils";
import { webflowSubmit, getformDetail } from "@amec/webasset/components/form";
import {
    dataTableSkeleton,
    formSubmitSkeleton,
} from "@amec/webasset/skeleton";
import { getData, insertData } from "./data";
import { redirectWebflow } from "@amec/webasset/form";
import { showLoader } from "@amec/webasset/preloader";
import { doaction, showflow } from "@amec/webasset/api/webform";
import { getIsFile } from "@amec/webasset/api/isform";
import { downloadOrOpenFile } from "@amec/webasset/api/file";
import { getAnnualFyear } from "@amec/webasset/api/docinv";

var formInfo,
    empno,
    fyear,
    mode,
    form,
    table = null;

//prettier-ignore
const columns = (fyear) => [
    { 
        data: "SDIV", 
        title: "Division", 
        width: "10%" 
    },
    { 
        data: "USER_REQ", 
        title: "Total User Request", 
        width: "20%" 
    },
    {
        data: "DEV_PLAN",
        title: `FY${fyear} Development Plan`,
        width: "20%",
        className: "!text-end",
        render: function (data, type, row) {
            return mode == 1 ?`<input type="number"  class="input req dev-confirm" value="${data == 0 ? '' : data}" min="0" oninput="this.value = this.value.replace(/[^0-9]/g, '');" />` : data;
        },
    },
    { 
        data: "MH", 
        title: "Total MH reduction (Hrs)", 
        width: "25%",
        className: "!text-end", 
        render: function (data, type, row) {
            return Number(data).toLocaleString();
        }
    },
    { 
        data: "COST", 
        title: "Cost reduction (Kbaht)", 
        width: "25%",
        className: "!text-end", 
        render: function (data, type, row) {
            return Number(data).toLocaleString();
        }
    },
];

//prettier-ignore
$(async function () {
    const tableLoading = dataTableSkeleton({
        button: false,
        search: false,
        page: false,
        info: false,
        middleMenu: false,
        idLoading: "table",
        height:"h-[50vh]"
    });
    try {
        formInfo = await getAllAttr(".form-info");  // get form info from html attribute
        const month = new Date().getMonth() + 1; // get month
        const year = new Date().getFullYear(); // get year
        mode = Number(formInfo.mode); // get mode
        empno = $(".apv-data").attr("empno"); // get employee number
        fyear = month <= 4 ? year - 1 : year; 
        
        $(".fyear").text(fyear);
        
        // set skeleton
        await setSkeleton(mode);

        let flow = null;
        if(mode != 1){
            form = {
                NFRMNO: formInfo.nfrmno,
                VORGNO: formInfo.vorgno,
                CYEAR: formInfo.cyear,
                CYEAR2: formInfo.cyear2,
                NRUNNO: formInfo.nrunno,
            };
            flow = await showflow(form);
            const file = await getIsFile(form);
            if(file.length > 0){
                let fileLink = "<div class='flex flex-col gap-3 mt-5'>";
                file.forEach(f => {
                    fileLink +=  `<a href="${f.FILE_PATH}" storedName="${f.FILE_FNAME}" class="file-link text-primary flex items-center gap-3 w-full border rounded-lg bg-base-100 p-3"><i class="icofont-file-excel text-success text-4xl"></i><span class="link link-primary">${f.FILE_ONAME}</span></a>`;
                });
                fileLink += "</div>";
                $("#attachFile").html(fileLink);
            }
            const formdetail = await getformDetail(form);
            $("#form-detail").html(formdetail);
        }
        // create datatable
        table = await createDataTable();
        tableLoading.remove();
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
    } 
});

//prettier-ignore
$(document).on('change', '.dev-confirm', function(){
    const row = $(this).closest('tr');
    const rowIndex = table.row(row).index();
    const value = Number($(this).val()) || 0;
    const rowData = table.row(rowIndex).data();
    if(rowData.USER_REQ < value){
        showMessage(`Development Plan ต้องไม่เกิน User Request (${rowData.USER_REQ})`, 'warning');
        $(this).val(rowData.DEV_PLAN == 0 ? '' : rowData.DEV_PLAN);
        return;
    }
    rowData.DEV_PLAN = value;
    table.row(rowIndex).data(rowData).draw(false);
});

//prettier-ignore
$(document).on('click', '#btnRequest', async function () {
    try {
        let isValid = true;

        const data = table.data().toArray().map((d) => {
            if(d.DEV_PLAN == 0){
                isValid = false;
            }
            return {
                PLANYEAR: d.PLANYEAR,
                REQ_DIV: d.REQ_DIV,
                USER_REQ: d.USER_REQ,
                DEV_PLAN: d.DEV_PLAN,
                MANHOUR: d.MH,
                COST: d.COST,
            }
        });
        if(!isValid){
            addClassError($('.dev-confirm[value=""]'));
            showMessage("กรุณากรอก Development Plan ให้ครบถ้วน", 'warning');
            return;
        }
        if($('#file')[0].files.length == 0){
            addClassError($('#file'));
            showMessage("กรุณาแนบไฟล์ Attachment Annual plan", 'warning');
            return;
        }
        const formData = new FormData($('#form')[0]);
        formData.append("NFRMNO", formInfo.nfrmno);
        formData.append("VORGNO", formInfo.vorgno);
        formData.append("CYEAR", formInfo.cyear);
        formData.append("REMARK", $('#remark').val());
        formData.append("REQUESTER", empno);
        formData.append("CREATEBY", empno);
        data.forEach((item, i) => {
            // NestJS จะมองเป็น data[0][field], data[1][field]
            Object.keys(item).forEach((key) => {
                formData.append(`data[${i}][${key}]`, item[key] ?? "");
            });
        });

        const res = await insertData(formData);
        if (res.status == true) {
            showMessage(res.message, "success");
            redirectWebflow();
        } else {
            throw new Error(res.message);
        }
        
        
    } catch (error) {
        console.error("Error submitting the form:", error);
        showErrorMessage(error.message);
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
        showErrorMessage(error);
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
    await downloadOrOpenFile({
        baseDir: filePath,
        storedName: storedName,
        originalName: filename,
        mode: "download",
    });
});

//prettier-ignore
async function createDataTable(){
    return await createTable(
        {
            data: mode == 1 ? await getAnnualFyear(fyear)
            .then((data) => 
                data.map((item) => ({
                    ...item,
                    DEV_PLAN: 0,
                })
            )) : await getData(form),
            columns: columns(fyear),
            searching: false,
            lengthChange: false,
            paging: false,
            info: false,
            ordering: false,
            footerCallback: function (row, data, start, end, display) {
                let table = this.api();
                let total = 0, totalDev = 0;
                table.columns().every(function (colIndex) {
                    if (colIndex === 0) return; // ข้ามคอลัมน์ชื่อรายการ

                    let sum = this.data().reduce((a, b) => Number(a) + Number(b),0);
                    switch (colIndex) {
                        case 1:
                            total = sum;
                            $('#total').text(total || 0);
                            break;
                        case 2:
                            totalDev = sum;
                            $('#totalDev').text(totalDev || 0);
                            break;
                    }
                    $(table.column(colIndex).footer()).html(sum.toLocaleString() );
                });
                const sub = total - totalDev;
                $('#sub').text(sub)
            },
        },
        {
            dataTableCss: false,
        }
    );
}

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
