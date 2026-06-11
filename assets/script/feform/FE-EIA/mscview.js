import { redirectWebflow } from '@amec/webasset/form';
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
        mims_year,
        mims_month,
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

    const currentMode = String(
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
    } else if (currentMode === '2') {
        const requesterValue = $('#REQUEST_BYTxt').val() || '';

        // แนะนำให้ใช้ .includes(empno) ตามเดิมเพื่อความแม่นยำในการตรวจจับข้อความยาว
        if (requesterValue.includes(empno)) {
            $('#ApproveBtn').removeClass('hidden'); // โชว์
            $('#DeleteBtn').removeClass('hidden'); // โชว์
            $('#ReturnBtn').addClass('hidden'); // ซ่อน
            $('#RejectBtn').addClass('hidden'); // ซ่อน
        } else {
            $('#ApproveBtn').removeClass('hidden'); // โชว์
            $('#ReturnBtn').removeClass('hidden'); // โชว์
            $('#RejectBtn').removeClass('hidden'); // โชว์
        }
    } else if (currentMode === '3') {
        // โหมดดูอย่างเดียว (View Mode) -> บังคับซ่อนทุกปุ่ม
        $('#ApproveBtn').addClass('hidden');
        $('#ReturnBtn').addClass('hidden');
    }

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
});

function search() {
    var YEAR = $('#YEARDrp').val();
    var MONTH = $('#MONTHDrp').val();

    // 1. สั่งเปิดสปินเนอร์เพื่อแสดงสถานะการดึงข้อมูล
    $('#loading').show();

    $.ajax({
        // ตรวจเช็คชื่อ Segment (main หรือ form) ให้ตรงตามโครงสร้าง Routing จริงหลังบ้านของคุณครับ
        url: host + 'feform/FE-EIA/form/GetStockCost',
        type: 'POST',
        dataType: 'json',
        data: {
            YEAR: YEAR,
            MONTH: MONTH,
        },
        success: function (response) {
            // ดักจับและคัดกรองค่าว่างป้องกันลูปฟังก์ชันพังกลางคัน
            var dataOnhand = response.dataOnhand || [];
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
            });

            // 2. สั่งวาดและพ่นตารางลงหน้าเว็บ
            buildDataTable(dataOnhand);

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
        order: [[0, 'asc']],
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
    deleteFlowandForm(payload);
});

async function actionFlow(actionType) {
    const formData = $('.form-info').data();

    const { nfrmno, vorgno, cyear, cyear2, nrunno, empno } = formData;

    try {
        // 1. ดึงค่าข้อความหมายเหตุจริงจากหน้าจอขึ้นมาคำนวณก่อนสร้าง Object
        // ค้นหาผ่านไอดี #txtRemark (อัปเดตตาม Textarea ตัวใหม่ล่าสุดที่เราเพิ่งจัดหน้าจอกันไปครับ)
        const remarkTxt = $('#txtRemark').val();

        const payload = {
            NFRMNO: nfrmno ? Number(nfrmno) : 0,
            VORGNO: vorgno ? vorgno.toString() : '',
            CYEAR: cyear ? cyear.toString() : '',
            CYEAR2: cyear2 ? cyear2.toString() : '',
            NRUNNO: nrunno ? Number(nrunno) : 0,
            ACTION: actionType ? actionType.toString() : '', // 'approve', 'returnass', 'reject'
            EMPNO: empno ? empno.toString() : '',
            REMARK: remarkTxt.toString(),
        };

        const res = await doaction(payload);
        // 4. ตรวจสอบสถานะและ Redirect เมื่อสำเร็จ
        if (res?.status || res?.status === 'true' || res?.status === true) {
            // alert('ดำเนินการเปลี่ยนสถานะฟอร์มเรียบร้อยแล้ว');
            redirectWebflow();
        } else {
            alert(
                'ไม่สามารถส่งฟอร์มได้: ' +
                    (res?.message || 'โปรดตรวจสอบข้อผิดพลาดในระบบ'),
            );
        }
    } catch (error) {
        console.error('Webflow Action Error:', error);
        alert('เกิดข้อผิดพลาดในการส่ง Action: ' + error.message);
    }
}

function submitWebflowAction(actionType) {
    alert('ระบบ Webflow กำลังประมวลผลสถานะ: ' + actionType);
}
