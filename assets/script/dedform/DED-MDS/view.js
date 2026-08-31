import { redirectWebflow } from '@amec/webasset/form';
import {
    getDesTypeMaster,
    processPlanCalculation,
    savePlanMaster,
    getOrInitDraftPlan,
} from './data';
import { host } from '../../utils';
import { showLoader } from '@amec/webasset/preloader';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

import $ from 'jquery';

import select2 from 'select2';
import { setSelect2 } from '@amec/webasset/select2';
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

let currentPlanHeaderID = null;
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
        doc_no,
        planyear,
        period,
        revision,
        remark,
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
        DOC_NO: doc_no,
        PLAN_YEAR: planyear,
        PERIOD: period,
        REVISION: revision,
        REMARK: remark,
    };

    // const payload = {
    //     NFRMNO: planyear,
    //     VORGNO: period,
    //     CYEAR: rev ? rev.toString() : '*',
    //     CYEAR2: remark ? remark.toString() : '*',
    //     CYEAR2: cyear2 ? cyear2.toString() : '',
    //     NRUNNO: nrunno,
    //     EMPNO: empno,
    // };

    $('#ApproveBtn').addClass('hidden');
    $('#ReturnBtn').addClass('hidden');
    if (form.NRUNNO == '') // create
    {
        currentMode = '1';
        $('#EXTDATAHid').val('00');
        ProcessCreate();
    } else {
        currentMode = String(
            await getMode({
                ...form,
                EMPNO: form.EMPNO,
            }),
        );
        const currentExtData = await getExtData({ ...form, EMPNO: form.EMPNO });
        $('#EXTDATAHid').val(currentExtData);
        alert(currentMode);

        if (currentMode === '1') {
            // โหมดสร้างฟอร์ม (Create Mode) -> ล็อกการซ่อนปุ่มไว้เหมือนเดิม
            ProcessCreate();
        } else if (currentMode === '2') {
            ProcessEdit(currentMode);
        } else if (currentMode === '3') {
            // โหมดดูอย่างเดียว (View Mode) -> บังคับซ่อนทุกปุ่ม
            ProcessView();
        } else {
            ProcessView();
        }

        loadExistingFiles(); // สั่งเรียกฟังก์ชันดึงรายการไฟล์มาแสดง

        // 2. เรียกใช้พ่นสเต็ป Flow ของฝั่ง Webflow
        const flow = await showflow(form);
        $('.flow').html(flow.html);

        // 3. ยิงคำสั่งประมวลผลดึงรายงานมาพ่นลง DataTable โดยตรงบนหน้าจอ
        await loadDraftPlan();
    }

    $('#MODEHid').val(currentMode);

    // 4. สั่งสลับปิด Skeleton Loading ทันทีเมื่อเตรียมโครงตารางหลักเรียบร้อย
    setTimeout(function () {
        $('.load').addClass('hidden');
        $('#form').removeClass('hidden');
    }, 10);
    // Event: เปลี่ยนปีหรือรอบ Period ให้ดึง Draft ของรอบนั้นมาแสดง
    $(document).on('change', '#YearDrp, #PeriodDrp', async function () {
        const selectedYear = $('#YearDrp').val();
        const selectedPeriod = $('#PeriodDrp').val();

        if (selectedYear && selectedPeriod) {
            alert('Year: ' + selectedYear + ' | Period: ' + selectedPeriod);
            await loadDraftPlan();
        } else {
            alert('Please select YEAR and PERIOD');
        }
    });

    // Event: กดปุ่มคำนวณใหม่ (Process Calculation)
    $('#ProcessBtn').on('click', async function () {
        $('#loading').removeClass('hidden');
        $('#SavePlanBtn').addClass('hidden');
        alert('ProcessBtn');
        const payload = {
            YEAR: $('#YearDrp').val(),
            PERIOD: $('#PeriodDrp').val(),
            DESTYPES: getSelectedDesTypes(),
            REVISION: $('#RevisionHid').val(),
            EMPNO: empno,
        };

        try {
            const res = await processPlanCalculation(payload);
            if (res.status) {
                currentPlanHeaderID = res.planHeaderID;
                $('#RevBadge').text('Revision: ' + res.revision);
                renderDataTable(res.data);
                $('#SavePlanBtn').removeClass('hidden');
            } else {
                alert('เกิดข้อผิดพลาด: ' + res.message);
            }
        } catch (err) {
            console.error(err);
            alert('ไม่สามารถประมวลผลได้');
        } finally {
            $('#loading').addClass('hidden');
        }
    });

    // Event: ยืนยันบันทึก Master Plan (Confirm & Save)
    $('#SavePlanBtn').on('click', async function () {
        if (
            !confirm(
                'ยืนยันการบันทึก Plan Master และอนุมัติเป็น Revision จริงใช่หรือไม่?',
            )
        )
            return;

        const payload = {
            YEAR: $('#YearDrp').val(),
            PERIOD: $('#PeriodDrp').val(),
            DESTYPES: getSelectedDesTypes(),
            REVISION: $('#RevisionHid').val(),
            EMPNO: empno,
        };

        try {
            const res = await savePlanMaster(payload);
            if (res.status) {
                alert(res.message);
                $('#RevBadge').text('Revision: ' + res.revision);
                $('#SavePlanBtn').addClass('hidden');
            } else {
                alert('เกิดข้อผิดพลาด: ' + res.message);
            }
        } catch (err) {
            alert('ไม่สามารถบันทึกข้อมูลได้');
        }
    });

    async function loadDraftPlan() {
        $('#loading').removeClass('hidden');
        const payload = {
            YEAR: $('#YearDrp').val(),
            PERIOD: $('#PeriodDrp').val(),
            DESTYPES: getSelectedDesTypes(),
            REVISION: $('#RevisionHid').val(),
            EMPNO: empno,
        };

        try {
            const res = await getOrInitDraftPlan(payload);
            if (res.status && res.data) {
                currentPlanHeaderID = res.planHeaderID;
                $('#RevBadge').text('Revision: ' + res.revision);
                renderDataTable(res.data);
                $('#SavePlanBtn').removeClass('hidden');
            }
        } catch (e) {
            console.error('Error loading draft plan', e);
        } finally {
            $('#loading').addClass('hidden');
        }
    }

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

    // == Action Upload File
});

function ProcessCreate() {
    // โหมดสร้างฟอร์ม (Create Mode) -> ล็อกการซ่อนปุ่มไว้เหมือนเดิม

    $('#REQUEST_BYTxt').val(form.EMPNO);
    $('#INPUT_BYTxt').val(form.EMPNO);
    $('#ApproveBtn').addClass('hidden');
    $('#ReturnBtn').addClass('hidden');
    $('#DeleteBtn').addClass('hidden'); // โชว์
    $('#upload-zone').removeClass('hidden');
}
function ProcessEdit(currentMode) {
    // PLAN_YEAR: planyear,
    // PERIOD: period,
    // REVISION: revision,
    // REMARK: remark,

    $('#REQUEST_BYTxt').val(form.EMPNO);
    $('#INPUT_BYTxt').val(form.EMPNO);
    $('#YearDrp').val(form.PLAN_YEAR);
    $('#PeriodDrp').val(form.PERIOD);

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
}
function ProcessView() {
    // โหมดดูอย่างเดียว (View Mode) -> บังคับซ่อนทุกปุ่ม
    $('#ApproveBtn').addClass('hidden');
    $('#ReturnBtn').addClass('hidden');

    $('#download-zone').removeClass('hidden'); // ผู้อนุมัติเข้ามาตรวจ ให้โหลดได้อย่างเดียว
}

// ฟังก์ชันสำหรับดึงค่า DesTypes ที่ถูก Checkbox เลือกไว้
function getSelectedDesTypes() {
    let selected = [];
    $('.des-type-checkbox:checked').each(function () {
        selected.push($(this).val());
    });
    // ถ้าไม่ได้ติ๊กเลือกอะไรเลย ให้ Fallback เป็น N และ T
    return selected.length > 0 ? selected : ['N', 'T'];
}

function renderDataTable(data) {
    if ($.fn.DataTable.isDataTable('#table-plan')) {
        $('#table-plan').DataTable().destroy();
        $('#table-plan').empty();
    }

    $('#table-plan').DataTable({
        data: data,
        paging: false,
        ordering: false,
        scrollX: true,
        columns: [
            { data: 'SeqNo', title: 'No.' },
            { data: 'PROD', title: 'PROD' },
            {
                data: 'MFG_BM',
                title: 'MFG BM',
                render: (d) => (d ? d.substring(0, 10) : '-'),
            },
            { data: 'P_Type', title: 'P' },
            {
                data: 'DES_BM',
                title: 'DES BM',
                render: (d) =>
                    d
                        ? `<span class="font-bold text-primary">${d.substring(0, 10)}</span>`
                        : '-',
            },
            { data: 'Time_DESBM_to_MFGBM', title: 'TIME (DES-MFG)' },
            {
                data: 'Go_DES',
                title: 'Go-DES',
                render: (d) => (d ? d.substring(0, 10) : '-'),
            },
            { data: 'Time_GoDES_to_DESBM', title: 'TIME (Go-DES)' },
            {
                data: 'Confirm_MELINA_Portion',
                title: 'Confirm MELINA',
                render: (d) => (d ? d.substring(0, 10) : '-'),
            },
            {
                data: 'MSE_to_MELINA',
                title: 'MSE to MELINA',
                render: (d) => (d ? d.substring(0, 10) : '-'),
            },
            {
                data: 'SW_Assembly',
                title: 'SW.Assembly',
                render: (d) => (d ? d.substring(0, 10) : '-'),
            },
            {
                data: 'Zero_Level_Check_Temp_DWG',
                title: '0-Level DWG',
                render: (d) => (d ? d.substring(0, 10) : '-'),
            },
            { data: 'TypeJun', title: 'TypeJun' },
        ],
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

    // 1. รอให้ฟังก์ชันลบทำงานเสร็จก่อน
    const delform = await deleteFlowandForm(payload);

    if (delform.status) {
        // alert(delform.status);
        // ใช้ Promise เพื่อให้สามารถใช้ await กับ $.ajax ได้
        try {
            const response = await $.ajax({
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
            });

            if (
                response.status === true ||
                response.status === 'true' ||
                response.status
            ) {
                alert('ลบข้อมูลในตารางเรียบร้อยแล้ว');
                await redirectWebflow(); // ตอนนี้ใช้ await ได้แล้ว
            } else {
                alert(
                    'ไม่สามารถลบข้อมูลในตารางได้: ' +
                        (response.message || 'โปรดตรวจสอบข้อผิดพลาดในระบบ'),
                );
            }
        } catch (error) {
            console.error('Ajax Error: ', error);
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล');
            $('#loading').hide();
        }
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Failed to Delete Form',
            text: delform.message || 'Please try again',
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
