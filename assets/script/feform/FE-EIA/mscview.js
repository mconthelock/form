import { redirectWebflow } from '@amec/webasset/form';
import { createFeEia } from './data';
import { host } from '../../utils';
import { showLoader } from '@amec/webasset/preloader';
import 'select2';
import 'select2/dist/css/select2.min.css';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

import $ from 'jquery'; // มั่นใจว่ามี jQuery นำหน้า
import 'datatables.net-dt';
import 'datatables.net-dt/css/dataTables.dataTables.min.css'; // อิมพอร์ต CSS ของมันด้วย
import 'datatables.net-buttons-dt';
import 'datatables.net-buttons/js/buttons.html5.mjs'; // รองรับปุ่ม Excel Html5

import { downloadOrOpenFile, getFile } from '@amec/webasset/api/file';
import {
    ajaxOptions,
    getAllAttr,
    getData,
    showMessage,
    requiredForm,
} from '@amec/webasset/utils';
import {
    showflow,
    doaction,
    getFormStatus,
    getFormno,
    getMode,
    getExtData,
    deleteFlowandForm,
} from '@amec/webasset/api/webform';
import { sendmail } from '@amec/webasset/api/mail';
let empno = '';
let dataOnhand = [];
let currentMode = '3';
let selectedFilesArray = [];
$(document).ready(async function () {
    // 1. ดึงข้อมูลจากก้อนข้อมูลหลักของเบลดฟอร์ม

    const formData = $('.form-info').data();
    const {
        nfrmno,
        vorgno,
        cyear,
        cyear2,
        nrunno,
        empno,
        cost_year,
        cost_month,
        doc_no,
    } = formData;

    // alert(empno);
    // alert(doc_no);

    const form = {
        NFRMNO: nfrmno,
        VORGNO: vorgno,
        CYEAR: cyear ? cyear.toString() : '',
        CYEAR2: cyear2 ? cyear2.toString() : '',
        NRUNNO: nrunno,
        EMPNO: empno,
    };

    currentMode = String(
        await getMode({
            ...form,
            EMPNO: form.EMPNO,
        }),
    );

    const currentExtData = await getExtData({ ...form, EMPNO: form.EMPNO });
    $('#MODEHid').val(currentMode);
    $('#EXTDATAHid').val(currentExtData);
    // alert(currentMode);
    // alert(currentExtData);

    $('#ApproveBtn').addClass('hidden');
    $('#ReturnBtn').addClass('hidden');

    if (currentMode === '1') {
        // โหมดสร้างฟอร์ม (Create Mode) -> ล็อกการซ่อนปุ่มไว้เหมือนเดิม
        $('#ApproveBtn').addClass('hidden');
        $('#ReturnBtn').addClass('hidden');
        $('#DeleteBtn').addClass('hidden'); // โชว์
        $('#upload-zone').removeClass('hidden');
    } else if (currentMode === '2') {
        const requesterValue = $('#REQUEST_BYTxt').val() || '';

        // แนะนำให้ใช้ .includes(empno) ตามเดิมเพื่อความแม่นยำในการตรวจจับข้อความยาว
        if (requesterValue.includes(empno)) {
            // Requester
            $('#ApproveBtn').removeClass('hidden'); // โชว์
            $('#DeleteBtn').removeClass('hidden'); // โชว์
            $('#ReturnBtn').addClass('hidden'); // ซ่อน
            // $('#RejectBtn').addClass('hidden'); // ซ่อน
            $('#upload-zone').removeClass('hidden');
            $('#download-zone').removeClass('hidden'); // ผู้อนุมัติเข้ามาตรวจ ให้โหลดได้อย่างเดียว
        } else {
            //All Approver
            $('#ApproveBtn').removeClass('hidden'); // โชว์
            $('#ReturnBtn').removeClass('hidden'); // โชว์
            // $('#RejectBtn').removeClass('hidden'); // โชว์
            $('#download-zone').removeClass('hidden'); // ผู้อนุมัติเข้ามาตรวจ ให้โหลดได้อย่างเดียว
        }
    } else if (currentMode === '3') {
        // โหมดดูอย่างเดียว (View Mode) -> บังคับซ่อนทุกปุ่ม
        $('#ApproveBtn').addClass('hidden');
        $('#ReturnBtn').addClass('hidden');

        $('#download-zone').removeClass('hidden'); // ผู้อนุมัติเข้ามาตรวจ ให้โหลดได้อย่างเดียว
    }
    loadExistingFiles(); // สั่งเรียกฟังก์ชันดึงรายการไฟล์มาแสดง

    // 2. เรียกใช้พ่นสเต็ป Flow ของฝั่ง Webflow
    const flow = await showflow(form);
    $('.flow').html(flow.html);

    // 3. ยิงคำสั่งประมวลผลดึงรายงานมาพ่นลง DataTable โดยตรงบนหน้าจอ
    search();

    // 4. สั่งสลับปิด Skeleton Loading ทันทีเมื่อเตรียมโครงตารางหลักเรียบร้อย
    setTimeout(function () {
        $('.load').addClass('hidden');
        $('#form').removeClass('hidden');
    }, 10);

    // == Action Upload File
    function loadExistingFiles() {
        console.log('กำลังโหลดรายการไฟล์ใหม่...'); // เพิ่มบรรทัดนี้
        const formData = $('.form-info').data();
        var isRequester = false;
        if (currentMode === '2') {
            isRequester = ($('#REQUEST_BYTxt').val() || '').includes(empno); // เช็คสิทธิ์ที่นี่
        }
        const $list = $('#uploaded-files-list');
        $.ajax({
            url: host + 'feform/FE-EIA/form/GetFilesDisplay',
            type: 'POST',
            cache: false, // 🟢 ป้องกันการจำค่าเก่า
            dataType: 'json',
            data: {
                NFRMNO: formData.nfrmno,
                VORGNO: formData.vorgno,
                CYEAR2: formData.cyear2,
                NRUNNO: formData.nrunno,
            },
            success: function (response) {
                $list.html('');
                if (response?.status === true && response.files.length > 0) {
                    $list.empty();

                    response.files.forEach(function (file) {
                        let downloadUrl =
                            host +
                            'feform/FE-EIA/form/DownloadFile?id=' +
                            file.FILE_ID;

                        // 🟢 ถ้าเป็น Requester ให้โชว์ปุ่มลบ
                        let deleteBtn = isRequester
                            ? `
                        <button type="button" 
                                class="btn-delete-file text-rose-500 hover:text-rose-700 font-bold text-xs px-2 cursor-pointer" 
                                data-id="${file.FILE_ID}">
                            🗑️ Delete
                        </button>`
                            : '';

                        let itemHtml = `
                        <li class="flex items-center justify-between py-2.5 px-3 text-sm hover:bg-slate-50 transition-colors">
                            <div class="flex items-center gap-2.5 truncate">
                                <span>📁</span>
                                <span class="font-medium text-slate-700 truncate">${file.FILE_ONAME}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <a href="${downloadUrl}" target="_blank" class="bg-slate-100 hover:bg-primary hover:text-white text-slate-600 font-semibold text-xs px-2.5 py-1.5 rounded-lg transition-all">
                                    ⬇️ Download
                                </a>
                                ${deleteBtn}
                            </div>
                        </li>`;
                        $list.append(itemHtml);
                    });
                }
            },
        });
    }

    $(document).on('click', '.btn-delete-file', function () {
        const fileId = $(this).data('id');
        if (!confirm('ยืนยันการลบไฟล์นี้ใช่หรือไม่?')) return;

        $.ajax({
            url: host + 'feform/FE-EIA/form/DeleteFile', // สร้าง Controller มาดักลบไฟล์
            type: 'POST',
            data: { id: fileId },
            success: function (response) {
                if (response.status) {
                    alert('ลบไฟล์สำเร็จ');
                    loadExistingFiles(); // โหลด List ใหม่
                } else {
                    alert('ลบไฟล์ไม่สำเร็จ');
                }
            },
        });
    });

    // อีเวนต์เมื่อไฟล์ใน Input มีการเปลี่ยนแปลง (เลือกไฟล์เข้ามา)
    $(document).on('change', '#files', function () {
        handleFileSelect(this.files);
    });

    // ลอจิกจัดการลากวางไฟล์ (Drag & Drop)
    const dropZone = document.getElementById('drop-zone');
    if (dropZone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });
        ['dragenter', 'dragover'].forEach((eventName) => {
            dropZone.addEventListener(
                eventName,
                () =>
                    $('#drop-zone').addClass('border-green-500 bg-green-50/20'),
                false,
            );
        });
        ['dragleave', 'drop'].forEach((eventName) => {
            dropZone.addEventListener(
                eventName,
                () =>
                    $('#drop-zone').removeClass(
                        'border-green-500 bg-green-50/20',
                    ),
                false,
            );
        });
        dropZone.addEventListener(
            'drop',
            (e) => {
                handleFileSelect(e.dataTransfer.files);
            },
            false,
        );
    }

    // $(document).on('click', '#drop-zone', function (e) {
    //     if (!$(e.target).is('input')) {
    //         $('#files').trigger('click');
    //     } else if (!$(e.target).hasClass('btn-remove-file')) {
    //         $('#files').trigger('click');
    //     }
    // });

    // == Action Upload File
});

function search() {
    const formData = $('.form-info').data();
    const {
        nfrmno,
        vorgno,
        cyear,
        cyear2,
        nrunno,
        empno,
        cost_year,
        cost_month,
        doc_no,
    } = formData;
    var YEAR = $('#YEARDrp').val();
    var MONTH = $('#MONTHDrp').val();
    // alert('WW');
    // 1. สั่งเปิดสปินเนอร์เพื่อแสดงสถานะการดึงข้อมูล
    $('#loading').show();
    var func = 'GetStockCostReal';
    if (currentMode === '3') {
        func = 'GetFEEIADetail';
    } else if (($('#REQUEST_BYTxt').val() || '').includes(empno)) {
        func = 'GetStockCostReal';
    } else {
        func = 'GetFEEIADetail';
    }
    // alert(func);
    $.ajax({
        // ตรวจเช็คชื่อ Segment (main หรือ form) ให้ตรงตามโครงสร้าง Routing จริงหลังบ้านของคุณครับ
        url: host + 'feform/FE-EIA/form/' + func,
        type: 'POST',
        dataType: 'json',
        data: {
            NFRMNO: nfrmno,
            VORGNO: vorgno,
            CYEAR: cyear,
            CYEAR2: cyear2,
            NRUNNO: nrunno,
            EMPNO: empno,
            YEAR: YEAR,
            MONTH: MONTH,
        },
        success: function (response) {
            console.log('Ajax Response: ', response);

            if (func === 'GetStockCostReal') {
                // ดักจับและคัดกรองค่าว่างป้องกันลูปฟังก์ชันพังกลางคัน
                dataOnhand = response.dataOnhand || [];
                var dataReceive = response.dataReceive || [];
                var dataIssue = response.dataIssue || [];

                var recvMap = {};
                dataReceive.forEach(function (recv) {
                    if (recv && recv.COSTMONTH) {
                        recvMap[recv.COSTMONTH] = recv.RECEIVE_AMOUNT
                            ? recv.RECEIVE_AMOUNT
                            : 0;
                    }
                });

                dataIssue.forEach(function (issue) {
                    if (issue) {
                        issue.ISSUE_AMOUNT = issue.ISSUE_AMOUNT
                            ? issue.ISSUE_AMOUNT
                            : 0;
                    }
                });

                dataOnhand.forEach(function (onhand) {
                    var recvVal = recvMap[onhand.COSTMONTH]
                        ? parseFloat(recvMap[onhand.COSTMONTH])
                        : 0;
                    onhand.RECEIVED_AMOUNT = recvVal.toFixed(2);

                    var issuedAmount = dataIssue.find(
                        (issue) => issue.COSTMONTH === onhand.COSTMONTH,
                    );
                    var issueVal = issuedAmount
                        ? parseFloat(issuedAmount.ISSUE_AMOUNT)
                        : 0;
                    onhand.ISSUE_AMOUNT = issueVal.toFixed(2);

                    var openingVal = parseFloat(onhand.OPENINGBALANCE) || 0;
                    var onhandVal = parseFloat(onhand.TOTAL_COST_ONHAND) || 0;

                    var calculatedDiff =
                        openingVal + recvVal - issueVal - onhandVal;

                    if (calculatedDiff >= -0.02 && calculatedDiff <= 0.02) {
                        calculatedDiff = 0.0;
                    }

                    onhand.DIFF = calculatedDiff.toFixed(2);
                    if (onhand.DIFF === '-0.00') {
                        onhand.DIFF = '0.00';
                    }
                    var parts = onhand.COSTMONTH.split("'");
                    onhand.COST_YEAR = parts[1] || '';
                    onhand.COST_MONTH = onhand.COST_MONTH || '';
                    onhand.COSTMONTH = onhand.COSTMONTH || '';
                    onhand.TOTAL_PCB_AMOUNT = onhand.TOTAL_PCB_AMOUNT || '';
                    onhand.TOTAL_PART_AMOUNT = onhand.TOTAL_PART_AMOUNT || '';
                });

                // 2. สั่งวาดและพ่นตารางลงหน้าเว็บ
                buildDataTable(dataOnhand);
            } else {
                dataOnhand = response.dataOnhand || [];
                buildDataTable(dataOnhand);
            }

            // 3. 🏁 สั่งปิดตัวหมุนทันทีตรงนี้เพื่อความชัวร์ 100% เมื่อคำนวณและพ่นตารางเสร็จ
            $('#loading').hide();
        },
        error: function (xhr, status, error) {
            console.error('Ajax Error: ', error);
            alert('เกิดข้อผิดพลาดในการดึงข้อมูลจากโมเดลฐานข้อมูล');
            // ถ้าพังหรือหาหน้าไม่เจอก็ต้องดับตัวสปินเนอร์ทิ้งด้วยเช่นกัน
            $('#loading').hide();
        },
    });
}
function convertMonthYearToNumber(str) {
    const months = {
        Jan: 1,
        Feb: 2,
        Mar: 3,
        Apr: 4,
        May: 5,
        Jun: 6,
        Jul: 7,
        Aug: 8,
        Sep: 9,
        Oct: 10,
        Nov: 11,
        Dec: 12,
    };
    const parts = str.split("'"); // เช่น ['Feb', '2026']
    const month = months[parts[0]];
    const year = parts[1];
    return parseInt(year + month.toString().padStart(2, '0')); // ได้ 202602
}
// โค้ดสร้างตารางแบบปลอดภัยและลบตัวแปรซ้อน
function buildDataTable(mergedData) {
    if ($.fn.DataTable.isDataTable('#table-view')) {
        $('#table-view').DataTable().destroy();
        $('#table-view').empty();
    }

    $('#table-view').append(
        '<tfoot class="total-footer-row"><tr><th></th><th>Total</th><th></th><th></th><th></th><th></th><th></th></tr></tfoot>',
    );

    $('#table-view').DataTable({
        data: mergedData,
        // ปรับเปลี่ยนจาก 'Bfrtip' มาใช้โครงสร้างเริ่มต้น 'frtip' หากยังไม่เปิดใช้ชุดปุ่ม Buttons คอนฟิก
        dom: 'frtip',
        bAutoWidth: false,
        sScrollX: true,
        sScrollXInner: '100%',
        paging: false,
        order: [[1, 'asc']],
        columns: [
            {
                data: null,
                title: 'No.',
                className: 'text-center font-weight-bold',
                render: (data, type, row, meta) => meta.row + 1,
            },
            {
                data: 'COSTMONTH',
                title: 'Cost Month',
                className: 'text-center font-weight-bold',
                render: function (data, type, row) {
                    if (type === 'sort' || type === 'type') {
                        return convertMonthYearToNumber(data);
                    }
                    return data;
                },
            },
            {
                data: 'OPENINGBALANCE',
                title: 'Opening Balance',
                className: 'text-right',
                render: $.fn.dataTable.render.number(',', '.', 2),
            },
            {
                data: 'RECEIVED_AMOUNT',
                title: 'Received FY' + ($('#YEARDrp').val() || ''),
                className: 'text-right text-success font-weight-bold',
                render: $.fn.dataTable.render.number(',', '.', 2),
            },
            {
                data: 'ISSUE_AMOUNT',
                title: 'Issued FY' + ($('#YEARDrp').val() || ''),
                className: 'text-right text-danger font-weight-bold',
                defaultContent: '0.00',
                render: $.fn.dataTable.render.number(',', '.', 2),
            },
            {
                data: 'TOTAL_COST_ONHAND',
                title: 'Total Cost',
                className: 'text-right font-weight-bold',
                render: $.fn.dataTable.render.number(',', '.', 2),
            },
            {
                data: 'DIFF',
                title: 'Diff',
                className: 'text-right font-weight-bold',
                render: function (data, type, row) {
                    var num = parseFloat(data) || 0;
                    var formattedNum = $.fn.dataTable.render
                        .number(',', '.', 2)
                        .display(data);
                    return num < 0
                        ? '<span class="text-danger">' +
                              formattedNum +
                              '</span>'
                        : '<span class="text-success">' +
                              formattedNum +
                              '</span>';
                },
            },
        ],
        footerCallback: function (row, data, start, end, display) {
            var api = this.api();
            var intVal = (i) =>
                typeof i === 'string'
                    ? i.replace(/[\$,]/g, '') * 1
                    : typeof i === 'number'
                      ? i
                      : 0;

            var col3Total = api
                .column(3)
                .data()
                .reduce((a, b) => intVal(a) + intVal(b), 0);
            var col4Total = api
                .column(4)
                .data()
                .reduce((a, b) => intVal(a) + intVal(b), 0);
            var col6Total = api
                .column(6)
                .data()
                .reduce((a, b) => intVal(a) + intVal(b), 0);

            var numFormat = $.fn.dataTable.render.number(',', '.', 2).display;

            $(api.column(3).footer())
                .html(numFormat(col3Total))
                .addClass('text-right text-success');
            $(api.column(4).footer())
                .html(numFormat(col4Total))
                .addClass('text-right text-danger');

            var diffFooterCell = $(api.column(6).footer())
                .html(numFormat(col6Total))
                .addClass('text-right');
            if (col6Total < 0) {
                diffFooterCell
                    .addClass('text-danger')
                    .removeClass('text-success');
            } else {
                diffFooterCell
                    .addClass('text-success')
                    .removeClass('text-danger');
            }
        },
    });
}

$(document).on('click', '#SentEmailBtn', async function () {
    const formData = $('.form-info').data();
    const {
        nfrmno,
        vorgno,
        cyear,
        cyear2,
        nrunno,
        empno,
        cost_year,
        cost_month,
        doc_no,
    } = formData;

    try {
        let phpData = new FormData();
        phpData.append('NFRMNO', nfrmno);
        phpData.append('VORGNO', vorgno);
        phpData.append('CYEAR', cyear);
        phpData.append('CYEAR2', cyear2);
        phpData.append('NRUNNO', nrunno);
        phpData.append('COST_MONTH', $('#MONTHDrp').val());
        phpData.append('COST_YEAR', $('#YEARDrp').val());
        phpData.append('DATAONHAND', JSON.stringify(dataOnhand));
        const responseEndProcess = await $.ajax({
            url: host + 'feform/FE-EIA/form/EndpProcess',
            type: 'POST',
            data: phpData,
            processData: false,
            contentType: false,
            dataType: 'json',
        });

        if (
            responseEndProcess &&
            (responseEndProcess.status === true ||
                responseEndProcess.status === 'true')
        ) {
        } else {
            throw new Error(
                responseEndProcess?.message || 'end process not completed',
            );
        }
    } catch (error) {
        console.error('Action Flow Error:', error);
        alert('เกิดข้อผิดพลาด: ' + error.message);
        $('#loading').hide();
    }
});

$(document).on('click', '#PdfBtn', function () {
    // ดักจับ fallback เผื่อก้อนข้อมูลหลักยังโหลดมาไม่สมบูรณ์
    const formData = $('.form-info').data() || {};
    const { nfrmno, vorgno, cyear, cyear2, nrunno } = formData;

    const pdfUrl =
        host +
        'feform/FE-EIA/form/exportPdf?no=' +
        nfrmno +
        '&orgNo=' +
        vorgno +
        '&y=' +
        cyear +
        '&y2=' +
        cyear2 +
        '&runNo=' +
        nrunno;

    // alert(pdfUrl);
    // // เปิดลิงก์หลังบ้านในแท็บใหม่เพื่อประมวลผลไฟล์ PDF ทันที
    window.open(pdfUrl, '_blank');
});

$(document).on('click', '#ApproveBtn', async function () {
    let val = $(this).val();
    // เปิด Loader บังหน้าจอไว้ก่อนถ้าระบบโหลดช้า
    await actionFlow('approve');
});

// 2. อีเวนต์คลิกปุ่ม Return
$(document).on('click', '#ReturnBtn', async function () {
    let val = $(this).val();
    await actionFlow('return');
});
// reject
$(document).on('click', '#RejectBtn', async function () {
    let val = $(this).val();
    await actionFlow('reject');
});

$(document).on('click', '#DeleteBtn', async function () {
    let val = $(this).val();
    const formData = $('.form-info').data();
    const { nfrmno, vorgno, cyear, cyear2, nrunno, empno } = formData;

    const payload = {
        NFRMNO: nfrmno ? Number(nfrmno) : 0,
        VORGNO: vorgno ? vorgno.toString() : '',
        CYEAR: cyear ? cyear.toString() : '',
        CYEAR2: cyear2 ? cyear2.toString() : '',
        NRUNNO: nrunno ? Number(nrunno) : 0,
    };
    const delform = deleteFlowandForm(payload);
    if (delform.status) {
        $.ajax({
            // ตรวจเช็คชื่อ Segment (main หรือ form) ให้ตรงตามโครงสร้าง Routing จริงหลังบ้านของคุณครับ
            url: host + 'feform/FE-EIA/form/DeleteFEEIAForm',
            type: 'POST',
            dataType: 'json',
            data: {
                NFRMNO: nfrmno,
                VORGNO: vorgno,
                CYEAR: cyear,
                CYEAR2: cyear2,
                NRUNNO: nrunno,
                EMPNO: empno,
            },
            success: function (response) {
                response = response || {};
                if (
                    response.status ||
                    response.status === 'true' ||
                    response.status === true
                ) {
                    alert('ลบข้อมูลในตารางเรียบร้อยแล้ว');
                    console.log('Delete Response: ', response);
                    redirectWebflow();
                } else {
                    alert(
                        'ไม่สามารถลบข้อมูลในตารางได้: ' +
                            (response.message || 'โปรดตรวจสอบข้อผิดพลาดในระบบ'),
                    );
                }
            },
            error: function (xhr, status, error) {
                console.error('Ajax Error: ', error);
                alert('เกิดข้อผิดพลาดในการดึงข้อมูลจากโมเดลฐานข้อมูล');
                // ถ้าพังหรือหาหน้าไม่เจอก็ต้องดับตัวสปินเนอร์ทิ้งด้วยเช่นกัน
                $('#loading').hide();
            },
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Failed to Delete Form',
            text: rssave.message || 'Please try again',
        });
    }
});

async function actionFlow(actionType) {
    const formData = $('.form-info').data();
    const {
        nfrmno,
        vorgno,
        cyear,
        cyear2,
        nrunno,
        empno,
        cost_year,
        cost_month,
        doc_no,
    } = formData;

    let result = '0';
    const remarkTxt = $('#txtRemark').val() || '';
    const payload = {
        NFRMNO: nfrmno ? Number(nfrmno) : 0,
        VORGNO: vorgno ? vorgno.toString() : '',
        CYEAR: cyear ? cyear.toString() : '',
        CYEAR2: cyear2 ? cyear2.toString() : '',
        NRUNNO: nrunno ? Number(nrunno) : 0,
        ACTION: actionType ? actionType.toString() : '',
        EMPNO: empno ? empno.toString() : '',
        REMARK: remarkTxt.toString(),
    };

    try {
        // 1. ตรวจสอบว่าผู้ใช้งานคือ Requester หรือไม่
        if (($('#REQUEST_BYTxt').val() || '').includes(empno)) {
            const hasFiles =
                selectedFilesArray.filter((file) => file !== null).length > 0;

            // สมมติว่าต้องการบังคับเฉพาะโหมด Create (currentMode === '1')
            if (currentMode === '2' && !hasFiles) {
                alert('กรุณาเลือกไฟล์แนบรายงานก่อนทำการบันทึกครับ');
                return; // หยุดทำงานทันทีถ้าไม่มีไฟล์
            }
            // --- ขั้นตอนที่ 1: จัดการไฟล์ผ่าน NestJS API ---
            let nestJsData = new FormData();
            nestJsData.append('NFRMNO', nfrmno);
            nestJsData.append('VORGNO', vorgno);
            nestJsData.append('CYEAR', cyear);
            nestJsData.append('CYEAR2', cyear2);
            nestJsData.append('NRUNNO', nrunno);
            nestJsData.append('CREATEBY', empno);
            nestJsData.append('FORM_TYPE', 'FE');

            if (typeof selectedFilesArray !== 'undefined') {
                selectedFilesArray.forEach((file) => {
                    if (file !== null) nestJsData.append('files', file);
                });
            }

            // เรียกผ่าน Service ใน data.js ที่เตรียมไว้
            const responseFile = await createFeEia(nestJsData);
            if (!responseFile || !responseFile.status) {
                throw new Error(
                    responseFile?.message || 'อัปโหลดไฟล์ไป NestJS ไม่สำเร็จ',
                );
            }

            // --- ขั้นตอนที่ 2: จัดการบันทึก Detail ผ่าน PHP AddFEEIADetail ---
            let FEEIADetailData = new FormData();
            FEEIADetailData.append('NFRMNO', nfrmno);
            FEEIADetailData.append('VORGNO', vorgno);
            FEEIADetailData.append('CYEAR', cyear);
            FEEIADetailData.append('CYEAR2', cyear2);
            FEEIADetailData.append('NRUNNO', nrunno);
            FEEIADetailData.append('COST_MONTH', $('#MONTHDrp').val());
            FEEIADetailData.append('COST_YEAR', $('#YEARDrp').val());
            FEEIADetailData.append('DATAONHAND', JSON.stringify(dataOnhand));
            const responsePhp = await $.ajax({
                url: host + 'feform/FE-EIA/form/AddFEEIADetail',
                type: 'POST',
                data: FEEIADetailData,
                processData: false,
                contentType: false,
                dataType: 'json',
            });

            if (
                responsePhp &&
                (responsePhp.status === true || responsePhp.status === 'true')
            ) {
                result = '1'; // ผ่านทั้ง NestJS และ PHP
            } else {
                throw new Error(
                    responsePhp?.message || 'บันทึกข้อมูลตารางไม่สำเร็จ',
                );
            }
        } else {
            // กรณีผู้อนุมัติ (Approver) ไม่ต้องอัปโหลดไฟล์ใหม่
            result = '1';
        }

        // --- ขั้นตอนที่ 3: ดำเนินการ Flow (Action) ---
        if (result === '1') {
            const res = await doaction(payload);
            if (res?.status || res?.status === true || res?.status === 'true') {
                if ($('#EXTDATAHid').val() == '03') {
                    // sent mail

                    let EndProcessData = new FormData();
                    EndProcessData.append('NFRMNO', nfrmno);
                    EndProcessData.append('VORGNO', vorgno);
                    EndProcessData.append('CYEAR', cyear);
                    EndProcessData.append('CYEAR2', cyear2);
                    EndProcessData.append('NRUNNO', nrunno);
                    EndProcessData.append('COST_MONTH', $('#MONTHDrp').val());
                    EndProcessData.append('COST_YEAR', $('#YEARDrp').val());
                    // EndProcessData.append(
                    //     'DATAONHAND',
                    //     JSON.stringify(dataOnhand),
                    // );
                    const responseEndProcess = await $.ajax({
                        url: host + 'feform/FE-EIA/form/EndpProcess',
                        type: 'POST',
                        data: EndProcessData,
                        processData: false,
                        contentType: false,
                        dataType: 'json',
                    });

                    if (
                        responseEndProcess &&
                        (responseEndProcess.status === true ||
                            responseEndProcess.status === 'true')
                    ) {
                    } else {
                        throw new Error(
                            responseEndProcess?.message ||
                                'end process not completed',
                        );
                    }
                }
                redirectWebflow(); // Redirect เมื่อทุกอย่างสำเร็จ
            } else {
                throw new Error(res?.message || 'ไม่สามารถส่งฟอร์มได้');
            }
        }
    } catch (error) {
        console.error('Action Flow Error:', error);
        alert('เกิดข้อผิดพลาด: ' + error.message);
        $('#loading').hide();
    }
}

function submitWebflowAction(actionType) {
    alert('ระบบ Webflow กำลังประมวลผลสถานะ: ' + actionType);
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// == Action Upload File
function handleFileSelect(files) {
    if (files.length === 0) return;

    $('#file-list-container').removeClass('hidden');

    for (let i = 0; i < files.length; i++) {
        selectedFilesArray.push(files[i]);

        // วาด UI แสดงผลไฟล์แต่ละตัว
        let fileId = selectedFilesArray.length - 1;
        let fileSize = (files[i].size / (1024 * 1024)).toFixed(2) + ' MB';

        let itemHtml = `
                    <li class="flex items-center justify-between py-2 px-3 text-sm text-slate-700 font-medium bg-slate-50/50 rounded-lg mb-1" id="file-item-${fileId}">
                        <div class="flex items-center gap-2 truncate">
                            <span class="text-slate-400">📄</span>
                            <span class="truncate">${files[i].name}</span>
                            <span class="text-xs text-slate-400">(${fileSize})</span>
                        </div>
                        <button type="button" class="text-rose-500 hover:text-rose-700 text-xs font-bold px-2 cursor-pointer btn-remove-file" data-id="${fileId}">Remove</button>
                    </li>
                `;
        $('#selected-files-list').append(itemHtml);
    }
}

// อีเวนต์การกดลบไฟล์ที่ไม่เอาออกจากลิสต์
$(document).on('click', '.btn-remove-file', function () {
    let id = $(this).data('id');
    $(`#file-item-${id}`).remove();
    // นำออกจากอาเรย์ชั่วคราว
    selectedFilesArray[id] = null;
    if ($('#selected-files-list li').length === 0) {
        $('#file-list-container').addClass('hidden');
    }
});

// == Action Upload File
