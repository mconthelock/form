import { createTable } from "@public/_dataTable";
import { getFyear, insertData } from "./data";
import {
    addClassError,
    showErrorMessage,
    showMessage,
} from "@public/jFuntion";
import { webflowSubmit } from "@public/component/form";
import { dataTableSkeleton, formSubmitSkeleton } from "@public/component/skeleton";
import { redirectWebflow } from "@public/_form";

var nfrmno,
    vorgno,
    cyear,
    empno,
    fyear,
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
            return `<input type="number"  class="input req dev-confirm" value="${data == 0 ? '' : data}" min="0" oninput="this.value = this.value.replace(/[^0-9]/g, '');" />`;
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
        const formInfo = $(".form-info");
        nfrmno = formInfo.attr("nfrmno");
        vorgno = formInfo.attr("vorgno");
        cyear = formInfo.attr("cyear");
        empno = $(".apv-data").attr("empno");

        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();
        fyear = month <= 4 ? year - 1 : year;

        $(".fyear").text(fyear);
        const data = await getFyear(fyear);
        formSubmitSkeleton({
            count: 2,
            element: "#btnAction",
            mode: "create",
        });
        table = await createTable(
            {
                data: data.map((item) => ({
                    ...item,
                    DEV_PLAN: 0,
                })),
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
        tableLoading.remove();
        $("#btnAction").html(webflowSubmit({ request: true }));
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
        formData.append("NFRMNO", nfrmno);
        formData.append("VORGNO", vorgno);
        formData.append("CYEAR", cyear);
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
        console.log(res);
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
