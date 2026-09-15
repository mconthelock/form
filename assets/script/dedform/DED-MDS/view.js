import { redirectWebflow } from '@amec/webasset/form';
import {
    getDesTypeMaster,
    processPlanCalculation,
    savePlanMaster,
    getOrInitDraftPlan,
    deleteDraftPlan,
    updateInlineDetail,
    getExportData,
} from './data';
import { exportPlanExcel } from './export.js';
import { host } from '../../utils';
import { showLoader } from '@amec/webasset/preloader';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

import $ from 'jquery';
// import { writeExcelTemp, exportExcel } from '@amec/webasset/excel';
// import ExcelJS from 'exceljs';

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
let currentMode = '1'; // ปรับค่าเริ่มต้นให้เป็น '1' (Create)
let currentExtData = ''; // 🟢 ประกาศตัวแปรระดับโมดูล
let selectedFilesArray = [];
let currentPlanHeaderID = null;
let isMasterAdmin = false;
let currentPlanData = [];

$(document).ready(async function () {
    // 1. ดึงข้อมูลจากก้อนข้อมูลหลักของเบลดฟอร์ม
    const formData = $('.form-info').data();
    // กำหนดค่าตัวแปรระดับโมดูล
    empno = formData.empno ? formData.empno.toString() : '';
    const form = {
        NFRMNO: formData.nfrmno,
        VORGNO: formData.vorgno,
        CYEAR: formData.cyear ? formData.cyear.toString() : '',
        CYEAR2: formData.cyear2 ? formData.cyear2.toString() : '',
        NRUNNO: formData.nrunno,
        EMPNO: empno,
        DOC_NO: formData.doc_no,
        PLAN_YEAR: formData.planyear,
        PERIOD: formData.period,
        REVISION: formData.revision,
        REMARK: formData.remark,
        STATUS: formData.status,
        PLANHEADERID: formData.planheaderid,
    };
    $('#DOC_IDTxt').val(form.DOC_NO);
    $('#REQUEST_BYTxt').val(form.EMPNO);
    $('#INPUT_BYTxt').val(form.EMPNO);
    $('#PlanHeaderIDHid').val(form.PLANHEADERID);
    if (form.DOC_NO == 'Form not found.') {
        alert('ไม่พบข้อมูลเอกสารในระบบ กำลังนำท่านกลับสู่หน้าหลัก Webflow');
        redirectWebflow();
        return;
    }

    if (form.PLAN_YEAR) {
        $('#YearDrp').val(form.PLAN_YEAR);
    }
    if (form.PERIOD) {
        $('#PeriodDrp').val(form.PERIOD);
    }

    if (form.NRUNNO == '') // create
    {
        // โหมดสร้างใหม่ (Create Mode)
        $('#EXTDATAHid').val('');
        $('#MODEHid').val('1');
        $('#PlanHeaderIDHid').val('');
        await applyButtonPermissions('1', '', '');
    } else {
        currentMode = String(await getMode({ ...form, EMPNO: form.EMPNO }));
        currentExtData = String(
            await getExtData({ ...form, EMPNO: form.EMPNO }),
        );
        $('#EXTDATAHid').val(currentExtData);
        $('#MODEHid').val(currentMode);
        $('#PlanHeaderIDHid').val(form.PLANHEADERID);

        // จัดการสิทธิ์การแสดงปุ่มตาม Mode และ ExtData
        await applyButtonPermissions(currentMode, currentExtData, '');

        // loadExistingFiles(); // สั่งเรียกฟังก์ชันดึงรายการไฟล์มาแสดง

        // 3. ยิงคำสั่งประมวลผลดึงรายงานมาพ่นลง DataTable โดยตรงบนหน้าจอ
        await loadDraftPlan();
        // 2. เรียกใช้พ่นสเต็ป Flow ของฝั่ง Webflow
        const flow = await showflow(form);
        $('.flow').html(flow.html);
    }

    $('#MODEHid').val(currentMode);
    // alert(
    //     'MOD:' +
    //         $('#MODEHid').val() +
    //         '|' +
    //         'EXTDATA:' +
    //         $('#EXTDATAHid').val(),
    // );

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
            await loadDraftPlan();
        }
    });

    // Event: กดปุ่ม Search เพื่อดึง Plan / Draft ที่มีอยู่แล้ว
    $(document).on('click', '#SearchBtn', async function () {
        const year = $('#YearDrp').val();
        const period = $('#PeriodDrp').val();

        if (!year || !period) {
            alert('กรุณาเลือก Year และ Period ก่อนทำการค้นหา');
            return;
        }

        await loadDraftPlan();
    });

    // Event: กดปุ่มคำนวณใหม่ (Process Calculation)
    $('#ProcessBtn').on('click', async function () {
        const selectedDesTypes = getSelectedDesTypes();
        const year = $('#YearDrp').val();
        const period = $('#PeriodDrp').val();

        if (!year || !period) {
            alert('กรุณาเลือก Year และ Period');
            return;
        }

        if (selectedDesTypes.length === 0) {
            alert('กรุณาเลือก DesType Target อย่างน้อย 1 รายการ');
            return;
        }
        $('#loading').removeClass('hidden');
        $('#SavePlanBtn').addClass('hidden');
        $('#DeleteBtn').addClass('hidden');
        const payload = {
            YEAR: $('#YearDrp').val(),
            PERIOD: $('#PeriodDrp').val(),
            DESTYPES: getSelectedDesTypes(),
            REVISION: $('#RevisionHid').val(),
            EMPNO: empno,
            MODE: $('#MODEHid').val(), // 🟢 ส่ง MODE ปัจจุบัน
            EXTDATA: $('#EXTDATAHid').val(), // 🟢 ส่ง EXTDATA
            PLANHEADERID: $('#PlanHeaderIDHid').val(),
            REMARK: $('#RemarkTxt').val(),
        };

        try {
            //ProcessPlan
            const res = await processPlanCalculation(payload);
            if (res.status) {
                currentPlanData = res.data;
                currentPlanHeaderID = res.planHeaderID;
                $('#RevBadge').text('Revision: ' + res.revision);
                renderDataTable(res.data);

                $('#PlanHeaderIDHid').val(currentPlanHeaderID);
                $('#SavePlanBtn').removeClass('hidden');
                $('#DeleteBtn').removeClass('hidden');
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

        if ($('#DOC_IDTxt').val() != '') {
            await actionFlow('approve');
        } else {
            const payload = {
                YEAR: $('#YearDrp').val(),
                PERIOD: $('#PeriodDrp').val(),
                DESTYPES: getSelectedDesTypes(),
                REVISION: $('#RevisionHid').val(),
                EMPNO: empno,
                REMARK: $('#RemarkTxt').val(),
                DOC_ID: $('#DOC_IDTxt').val(),
                PLANHEADERID: $('#PlanHeaderIDHid').val(),
            };

            try {
                //SavePlanMaster
                const res = await savePlanMaster(payload);
                if (res.status) {
                    alert(res.message);
                    $('#RevBadge').text('Revision: ' + res.revision);
                    $('#SavePlanBtn').addClass('hidden');

                    redirectWebflow(); // เปลี่ยนหน้าเมื่อ Flow และ Status อัปเดตสมบูรณ์
                } else {
                    alert('เกิดข้อผิดพลาด: ' + res.message);
                }
            } catch (err) {
                alert('ไม่สามารถบันทึกข้อมูลได้');
            }
        }
    });

    // Event: กดปุ่ม Delete Draft
    $(document).on('click', '#DeleteBtn', async function () {
        if (!currentPlanHeaderID) {
            alert('ไม่พบฉบับร่างที่ต้องการลบ');
            return;
        }

        if (!confirm('คุณต้องการลบข้อมูลฉบับร่าง (Draft) นี้ใช่หรือไม่?'))
            return;
        var chk = 1;
        $('#loading').removeClass('hidden');
        if ($('#DOC_IDTxt').val() != '') {
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
            } else {
                chk = 0;
                alert('Failed to Delete Form');
            }
        }
        if (chk == 1) {
            try {
                const payload = {
                    PLAN_HEADER_ID: currentPlanHeaderID,
                    YEAR: $('#YearDrp').val(),
                    PERIOD: $('#PeriodDrp').val(),
                };

                const res = await deleteDraftPlan(payload);
                if (res.status) {
                    alert(res.message);
                    currentPlanHeaderID = null;

                    // เคลียร์ตารางให้เป็นตารางว่าง
                    renderDataTable([]);

                    // ซ่อนปุ่ม Action ทั้งสอง
                    $('#DeleteBtn').addClass('hidden');
                    $('#SavePlanBtn').addClass('hidden');

                    // โหลดสถานะ Revision ถัดไปรอไว้
                    await loadDraftPlan();
                } else {
                    alert('เกิดข้อผิดพลาด: ' + res.message);
                }
            } catch (err) {
                console.error(err);
                alert('ไม่สามารถลบฉบับร่างได้');
            } finally {
                $('#loading').addClass('hidden');
            }
        }
    });

    // Event เมื่อแก้ค่าในตารางแล้วยิง AJAX อัปเดตลงตาราง Tb_Master_DESBM_Detail ทันที
    $(document).on('change', '.inline-edit-date', async function () {
        const $input = $(this);
        const field = $input.data('field');
        const newVal = $input.val();
        const rowIndex = $input.data('row-index');

        const table = $('#table-plan').DataTable();
        const rowData = table.row(rowIndex).data();

        if (!rowData || !rowData.PlanHeaderID) {
            alert('ไม่พบข้อมูล PlanHeaderID ของแถวนี้');
            return;
        }

        $input.addClass('opacity-50 cursor-wait');

        const payload = {
            PlanHeaderID: rowData.PlanHeaderID,
            SeqNo: rowData.SeqNo,
            PROD: rowData.PROD,
            Field: field,
            Value: newVal ? newVal : '',
            EMPNO: empno,
        };

        try {
            const res = await updateInlineDetail(payload);

            if (res.status) {
                // 1. นำข้อมูลแถวปัจจุบันใส่เข้าไป (ยังไม่สั่ง .draw())
                if (res.row) {
                    table.row(rowIndex).data(res.row);

                    // ซิงค์ข้อมูลแถวปัจจุบันลงในตัวแปร currentPlanData สำหรับ Export Excel
                    if (
                        typeof currentPlanData !== 'undefined' &&
                        Array.isArray(currentPlanData)
                    ) {
                        const curIndex = currentPlanData.findIndex(
                            (item) =>
                                (item.DetailID &&
                                    item.DetailID == res.row.DetailID) ||
                                (item.SeqNo && item.SeqNo == res.row.SeqNo),
                        );
                        if (curIndex !== -1) {
                            currentPlanData[curIndex] = Object.assign(
                                {},
                                currentPlanData[curIndex],
                                res.row,
                            );
                        }
                    }
                }

                // 2. ค้นหาแถวถัดไป (nextRow) และใส่ข้อมูลใหม่เข้าไป
                if (res.nextRow && res.nextRow.SeqNo) {
                    const targetSeqNo = parseInt(res.nextRow.SeqNo, 10);

                    table.rows().every(function () {
                        const d = this.data();
                        if (d && parseInt(d.SeqNo, 10) === targetSeqNo) {
                            this.data(res.nextRow); // อัปเดตข้อมูลของแถวถัดไป
                        }
                    });
                    // ซิงค์ข้อมูลแถวถัดไปลงในตัวแปร currentPlanData ด้วย
                    if (
                        typeof currentPlanData !== 'undefined' &&
                        Array.isArray(currentPlanData)
                    ) {
                        const nextIndex = currentPlanData.findIndex(
                            (item) =>
                                (item.DetailID &&
                                    item.DetailID == res.nextRow.DetailID) ||
                                (item.SeqNo && item.SeqNo == res.nextRow.SeqNo),
                        );
                        if (nextIndex !== -1) {
                            currentPlanData[nextIndex] = Object.assign(
                                {},
                                currentPlanData[nextIndex],
                                res.nextRow,
                            );
                        }
                    }
                }

                // 3. วาดตารางใหม่เพียง "ครั้งเดียว" หลังจากอัปเดต Data ครบทั้งสองแถว
                table.draw(false);

                // Effect แจ้งเตือนสำเร็จ
                const $updatedNode = $(table.row(rowIndex).node());
                const $currentInput = $updatedNode.find(
                    `input[data-field="${field}"]`,
                );
                $currentInput
                    .removeClass(
                        'border-warning bg-amber-50 opacity-50 cursor-wait',
                    )
                    .addClass('border-success bg-green-50');

                setTimeout(() => {
                    $currentInput.removeClass('border-success bg-green-50');

                    // กำหนดให้เป็นสีแดงทันทีเมื่อ User มีการแก้ไขค่าใหม่
                    $currentInput
                        .removeClass(
                            'border-warning border-success bg-amber-50 bg-green-50 text-primary opacity-50 cursor-wait',
                        )
                        .addClass(
                            'border-rose-500 bg-rose-50 text-rose-600 font-bold',
                        );
                }, 1500);
            } else {
                alert('บันทึกไม่สำเร็จ: ' + res.message);
                $input
                    .removeClass('opacity-50 cursor-wait')
                    .addClass('border-error');
            }
        } catch (err) {
            console.error('Update inline error details:', err);
            const errorMsg = err.responseJSON
                ? err.responseJSON.message
                : err.responseText || 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
            alert('เกิดข้อผิดพลาด: ' + errorMsg);
            $input
                .removeClass('opacity-50 cursor-wait')
                .addClass('border-error');
        }
    });

    // Event: ยืนยันบันทึก Master Plan (Confirm & Save)
    $('#ReturnBtn').on('click', async function () {
        if (!confirm('ยืนยันการ Return Master DESBM Master ใช่หรือไม่?'))
            return;
        let val = $(this).val();
        await actionFlow('returnp');
    });

    $(document).on('click', '#ApproveBtn', async function () {
        let val = $(this).val();
        // เปิด Loader บังหน้าจอไว้ก่อนถ้าระบบโหลดช้า
        await actionFlow('approve');
    });

    //=======================================================
    //== Modal: Tb_MS_Master_DESBM_Cal Config
    //=======================================================
    // เปิด Modal และโหลดข้อมูล
    $('#btnOpenCalConfig').on('click', function () {
        loadCalConfig();
        $('#calConfigModal').removeClass('hidden');
    });

    // อัปเดต OffsetDays เมื่อหลุด Focus (Blur) หรือกด Enter
    $(document).on('change', '.input-offset-days', function () {
        const input = $(this);
        const targetField = input.data('target');
        const pType = input.data('ptype');
        const newOffset = input.val();

        input.addClass('bg-yellow-100');

        $.ajax({
            url: host + 'dedform/DED-MDS/form/UpdateCalConfigOffset',
            type: 'POST',
            dataType: 'json',
            data: {
                TargetField: targetField,
                P_Type: pType,
                OffsetDays: newOffset,
                EMPNO: typeof empno !== 'undefined' ? empno : 'SYSTEM',
            },
            success: function (res) {
                input.removeClass('bg-yellow-100');
                if (res.status) {
                    input.addClass('bg-green-100');
                    setTimeout(() => input.removeClass('bg-green-100'), 1200);
                } else {
                    alert('บันทึกไม่สำเร็จ: ' + res.message);
                    input.addClass('bg-red-100');
                }
            },
            error: function () {
                input.removeClass('bg-yellow-100').addClass('bg-red-100');
                alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
            },
        });
    });

    // เปิด Modal
    $('#btnOpenCalConfig').on('click', function () {
        loadCalConfig();
        $('#calConfigModal').removeClass('hidden');
    });

    // ปิด Modal เมื่อคลิกปุ่มปิดใดๆ ที่มีคลาส .btn-close-modal
    $(document).on('click', '.btn-close-modal', function () {
        $('#calConfigModal').addClass('hidden');
    });

    // (เสริม) ปิด Modal เมื่อคลิกพื้นที่ว่างข้างนอกกล่อง Modal
    $('#calConfigModal').on('click', function (e) {
        if (e.target === this) {
            $(this).addClass('hidden');
        }
    });

    // ฟังก์ชันโหลดข้อมูล Config
    function loadCalConfig() {
        const tbody = $('#calConfigTbody');
        tbody.html(
            '<tr><td colspan="6" class="text-center py-4 text-gray-500">กำลังโหลดข้อมูล...</td></tr>',
        );

        $.ajax({
            url: host + 'dedform/DED-MDS/form/GetCalConfigMaster',
            type: 'GET',
            dataType: 'json',
            // ส่ง EMPNO ไปตรวจสอบสิทธิ์
            data: {
                EMPNO: typeof empno !== 'undefined' ? empno : 'SYSTEM',
            },
            success: function (res) {
                if (!res.status || !res.data) {
                    tbody.html(
                        '<tr><td colspan="6" class="text-center py-4 text-red-500">ไม่พบข้อมูล</td></tr>',
                    );
                    return;
                }

                // 🟢 อ่านค่าสิทธิ์ ms จาก res.ms
                const canEdit = res.ms === true;
                const disabledAttr = canEdit ? '' : 'disabled';
                const inputStyle = canEdit
                    ? 'background-color: #ffffff; color: #2563eb; cursor: text;'
                    : 'background-color: #f3f4f6; color: #6b7280; cursor: not-allowed; border-color: #e5e7eb;';

                let html = '';
                res.data.forEach((item, index) => {
                    html += `
                    <tr>
                        <td class="text-center align-middle text-gray-500">${index + 1}</td>
                        <td class="align-middle font-semibold text-gray-800">${item.TargetField || '-'}</td>
                        <td class="align-middle text-gray-700">${item.P_Type || '-'}</td>
                        <td class="align-middle text-gray-600">${item.BaseField || '-'}</td>
                        <td class="align-middle text-gray-600">${item.BaseRowType || '-'}</td>
                        <td class="text-center align-middle">
                            <input type="number" 
                                   class="form-control text-center input-offset-days font-bold" 
                                   style="width: 85px; margin: 0 auto; ${inputStyle}" 
                                   data-target="${item.TargetField}" 
                                   data-ptype="${item.P_Type}" 
                                   value="${item.OffsetDays}" 
                                   ${disabledAttr} />
                        </td>
                    </tr>
                    `;
                });
                tbody.html(html);
            },
            error: function () {
                tbody.html(
                    '<tr><td colspan="6" class="text-center py-4 text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>',
                );
            },
        });
    }
    //=======================================================

    // ===================================================================
    // == Export Excel
    // ===================================================================
    $(document).on('click', '#ExportExcelBtn', async function () {
        const year = $('#YearDrp').val();
        const periodVal = $('#PeriodDrp').val();
        const revVal = $('#RevisionHid').val() || '';

        if (!year || !periodVal) {
            alert('กรุณาเลือก Year และ Period ก่อนทำการ Export');
            return;
        }

        const headerId =
            $('#PlanHeaderIDHid').val() || currentPlanHeaderID || '';

        try {
            showLoader();

            // 1. เรียก API ดึงข้อมูลสด (Backend จัดการหา PlanHeaderID และ 2 Records ก่อนหน้าให้)
            const res = await $.ajax({
                url: host + 'dedform/DED-MDS/form/GetExportData',
                type: 'POST',
                dataType: 'json',
                data: {
                    PlanHeaderID: headerId,
                    YEAR: year,
                    PERIOD: periodVal,
                    REV: revVal,
                },
            });

            if (!res.status || !res.data || res.data.length === 0) {
                alert(res.message || 'ไม่พบข้อมูลสำหรับการ Export');
                return;
            }

            // 2. เรียกฟังก์ชัน Export แบบครบกระบวนการ
            await exportPlanExcel({
                dataList: res.data,
                prevRows: res.prevRows || [],
                planHeaderID: res.planHeaderID,
                revision: res.revision,
                revHistory: res.revHistory || [], // 🟢 ส่งจาก response ของ AJAX
                signatures: res.signatures || null,
                planStatus: res.planStatus,
                year: year,
                periodCode: periodVal,
            });
        } catch (err) {
            console.error(err);
            alert('เกิดข้อผิดพลาดในการดึงข้อมูลเพื่อ Export');
        } finally {
            showLoader({ show: false });
        }
    });

    // == Export Excel
    // ===================================================================

    // ===================================================================
    // 1. ตรวจสอบค่า NRUNNO เพื่อแสดง/ซ่อนปุ่ม Send Email
    // ===================================================================
    function checkShowEmailButton() {
        const formData = $('.form-info').data() || {};
        const nrunno = formData.nrunno || $('#NRUNNOHid').val();

        if (
            nrunno &&
            String(nrunno).trim() !== '' &&
            String(nrunno).trim() !== '0'
        ) {
            $('#SentEmailBtn')
                .removeClass('hidden')
                .css('display', 'inline-flex');
        } else {
            $('#SentEmailBtn').addClass('hidden').css('display', 'none');
        }
    }
    $(document).on('click', '#SentEmailBtn', async function () {
        const $btn = $(this);
        const originalHtml = $btn.html();

        const formData = $('.form-info').data() || {};
        const year = $('#YearDrp').val();
        const periodVal = $('#PeriodDrp').val();
        const revVal = $('#RevisionHid').val() || '*';
        const headerId =
            $('#PlanHeaderIDHid').val() ||
            (typeof currentPlanHeaderID !== 'undefined'
                ? currentPlanHeaderID
                : '');
        const status = $('#STATUSHid').val() || '';
        const { nfrmno, vorgno, cyear, cyear2, nrunno } = formData;

        if (!nrunno) {
            alert('ไม่พบเลข NRUNNO ไม่สามารถส่งอีเมลได้');
            return;
        }

        if (
            !confirm(
                'คุณต้องการส่งอีเมลแจ้งเตือน Design Schedule นี้ใช่หรือไม่?',
            )
        ) {
            return;
        }

        $btn.prop('disabled', true).html(
            '<i class="fa fa-spinner fa-spin mr-1"></i> Sending...',
        );
        if (typeof showLoader === 'function') showLoader();

        try {
            let phpData = new FormData();
            phpData.append('NFRMNO', nfrmno);
            phpData.append('VORGNO', vorgno);
            phpData.append('CYEAR', cyear);
            phpData.append('CYEAR2', cyear2);
            phpData.append('NRUNNO', nrunno);
            phpData.append('headerId', headerId);
            phpData.append('YEAR', year);
            phpData.append('PERIOD', periodVal);
            phpData.append('REVISION', revVal);
            phpData.append('STATUS', status);

            const res = await $.ajax({
                url: host + 'dedform/DED-MDS/form/SendEmail',
                type: 'POST',
                data: phpData,
                processData: false,
                contentType: false,
                dataType: 'json',
            });

            if (res && res.status === true) {
                alert('ส่งอีเมลแจ้งเตือนเรียบร้อยแล้ว');
            } else {
                throw new Error(res?.message || 'ไม่สามารถส่งอีเมลได้');
            }
        } catch (error) {
            console.error('Send Email Error:', error);
            alert('เกิดข้อผิดพลาด: ' + (error.message || error));
        } finally {
            $btn.prop('disabled', false).html(originalHtml);
            if (typeof showLoader === 'function') showLoader({ show: false });
            $('#loading').hide();
        }
    });
    // ===================================================================

    // ===================================================================
    // == Action Upload File
    // ===================================================================
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
    // ===================================================================
});

async function loadDraftPlan() {
    const year = $('#YearDrp').val();
    const period = $('#PeriodDrp').val();

    if (!year || !period) return;

    $('#loading').removeClass('hidden');
    const formData = $('.form-info').data() || {};
    // alert(
    //     'MOD:' +
    //         $('#MODEHid').val() +
    //         '|' +
    //         'EXTDATA:' +
    //         $('#EXTDATAHid').val(),
    // );
    const payload = {
        YEAR: year,
        PERIOD: period,
        DESTYPES: getSelectedDesTypes(),
        REVISION: $('#RevisionHid').val(),
        EMPNO: typeof empno !== 'undefined' ? empno : 'SYSTEM',
        MODE: $('#MODEHid').val(), // 🟢 ส่ง MODE ปัจจุบัน
        EXTDATA: $('#EXTDATAHid').val(), // 🟢 ส่ง EXTDATA
        NFRMNO: formData.nfrmno ? Number(formData.nfrmno) : 0,
        VORGNO: formData.vorgno ? formData.vorgno.toString() : '',
        CYEAR: formData.cyear ? formData.cyear.toString() : '',
        CYEAR2: formData.cyear2 ? formData.cyear2.toString() : '',
        NRUNNO: formData.nrunno ? Number(formData.nrunno) : 0,
        PLANHEADERID: formData.planheaderid || '',
    };

    try {
        //GetOrInitDraftPlan

        const res = await getOrInitDraftPlan(payload);
        if (res.statusTb) {
            // 🟢 ถ้าไม่พบฟอร์ม ให้แจ้งเตือนและ Redirect กลับหน้า Webflow ทันที
            if (res.docNo === 'Form not found.') {
                alert(
                    'ไม่พบข้อมูลเอกสารในระบบ กำลังนำท่านกลับสู่หน้าหลัก Webflow',
                );
                redirectWebflow();
                return;
            }

            currentPlanData = res.data;
            currentPlanHeaderID = res.planHeaderID;
            $('#RevisionHid').val(res.revision);
            $('#STATUSHid').val(res.status);
            $('#PlanHeaderIDHid').val(res.planHeaderID);
            // alert(res.docNo);
            if (res.docNo) {
                $('#DOC_IDTxt').val(res.docNo);
            } else {
                $('#DOC_IDTxt').val('');
            }
            // if (res.remark) {
            //     $('#RemarkTxt').val(res.remark);
            // }

            // 1. จัดการ Checkbox
            if (res.desType) {
                setSelectedDesTypes(res.desType);
            } else {
                resetToDefaultDesTypes();
            }

            // 2. วาดตาราง
            renderDataTable(res.data || []);

            // 1. จัดการข้อความ Revision, Alert และ Badge
            updateStatusUI(res.status, res.revision, res.docNo);

            // 2. จัดการสิทธิ์ปุ่ม Action หลักตาม Mode + สถานะจริงของข้อมูล
            applyButtonPermissions(currentMode, currentExtData, res.status);
        } else {
            alert(
                'เกิดข้อผิดพลาด: ' + (res.message || 'ไม่สามารถโหลดข้อมูลได้'),
            );
        }
    } catch (e) {
        console.error('Error loading draft plan', e);
    } finally {
        $('#loading').addClass('hidden');
    }
}

function renderDataTable(data) {
    console.log($('#table-plan').DataTable().row(1).data()); // ดูแถวที่ 2 (202604XT)
    console.log($('#table-plan').DataTable().row(3).data()); // ดูแถวที่ 4 (202604AT)
    if ($.fn.DataTable.isDataTable('#table-plan')) {
        $('#table-plan').DataTable().destroy();
        $('#table-plan').empty();
    }

    $('#table-plan').DataTable({
        data: data || [],
        paging: false,
        ordering: false,
        scrollX: true,
        bAutoWidth: false,
        language: {
            emptyTable:
                '<div class="py-6 text-slate-400 font-semibold text-center text-sm">🔍 ไม่พบข้อมูล Plan หรือ Draft</div>',
            zeroRecords:
                '<div class="py-6 text-slate-400 font-semibold text-center text-sm">🔍 ไม่พบข้อมูล</div>',
        },
        // 🟢 ควบคุมสีระดับแถว (Row Styling)
        createdRow: function (row, data, dataIndex) {
            const userAction = (data.UserAction || 'SYSTEM')
                .toUpperCase()
                .trim();
            const isUserEdited = userAction !== 'SYSTEM';

            // 🟢 ตรวจสอบความแตกต่าง (ใช้ data แทน row)
            const hasDiff =
                data.Diff_MFG_BM == 1 ||
                data.Diff_P_Type == 1 ||
                data.Diff_DES_BM == 1 ||
                data.Diff_Go_DES == 1 ||
                data.IsNewRow == 1;

            if (isUserEdited) {
                $(row).addClass(
                    'bg-rose-50/50 hover:bg-rose-100/60 border-l-4 border-l-rose-500 transition-colors',
                );
                $(row).attr('title', `แก้ไขโดย: ${data.UserAction}`);
            } else if (hasDiff) {
                $(row).addClass(
                    'bg-amber-50/50 hover:bg-amber-100/60 border-l-4 border-l-amber-500 transition-colors',
                );
                $(row).attr(
                    'title',
                    'ข้อมูลเปลี่ยนแปลงเทียบกับ Revision ก่อนหน้า',
                );
            }
        },
        columns: [
            {
                data: 'SeqNo',
                title: 'No.',
                className: 'text-center align-middle',
                render: function (d, type, row) {
                    const userAction = (row.UserAction || 'SYSTEM')
                        .toUpperCase()
                        .trim();
                    if (userAction !== 'SYSTEM') {
                        return `<span class="badge badge-xs badge-error text-white font-bold" title="แก้ไขโดย ${row.UserAction}">${d}*</span>`;
                    }
                    return d;
                },
            },
            {
                data: 'PROD',
                title: 'PROD',
                className: 'text-center font-semibold align-middle',
            },
            // {
            //     data: 'MFG_BM',
            //     title: 'MFG BM',
            //     className: 'text-center font-semibold align-middle',
            // },
            // {
            //     data: 'P_Type',
            //     title: 'P',
            //     className: 'text-center font-semibold align-middle',
            // },
            //  คอลัมน์ MFG BM (แดงเมื่อวันที่เปลี่ยน หรือ UserAction เปลี่ยน)
            // คอลัมน์ MFG BM
            {
                data: 'MFG_BM',
                title: 'MFG BM',
                // ใส่ whitespace-nowrap และ min-w-[110px] ป้องกันข้อความตกบรรทัด
                className:
                    'text-center font-semibold align-middle whitespace-nowrap',
                width: '110px',
                render: function (data, type, row) {
                    if (!data) return '-';
                    const formattedDate = String(data).substring(0, 10);
                    const userAction = String(row.UserAction || 'SYSTEM')
                        .toUpperCase()
                        .trim();

                    const isChanged = Number(row.Diff_MFG_BM) === 1;

                    if (isChanged) {
                        return `<span class="text-rose-600 font-bold underline decoration-dotted inline-block whitespace-nowrap" 
                                      style="color: #e11d48 !important; font-weight: 700 !important; text-decoration: underline !important;" 
                                      title="Update: ${row.UserAction || 'AS400'}">${formattedDate}</span>`;
                    }
                    return `<span class="whitespace-nowrap">${formattedDate}</span>`;
                },
            },

            // 🟢 คอลัมน์ P (P_Type)
            {
                data: 'P_Type',
                title: 'P',
                className: 'text-center font-semibold align-middle',
                render: function (data, type, row) {
                    if (!data) return '-';
                    const userAction = String(row.UserAction || 'SYSTEM')
                        .toUpperCase()
                        .trim();

                    // เช็คว่า User แก้ไข หรือ P เปลี่ยน หรือ วันที่เปลี่ยน
                    const isChanged = Number(row.Diff_P_Type) === 1;

                    if (isChanged) {
                        return `<span class="badge badge-error text-white font-bold" 
                                      style="background-color: #ffe4e6 !important; color: #e11d48 !important; border: 1px solid #fda4af !important; padding: 2px 6px; border-radius: 4px; font-weight: 700;" 
                                      title="Update: ${row.UserAction || 'AS400'}">${data}</span>`;
                    }
                    return data;
                },
            },
            {
                data: 'DES_BM',
                title: 'DES BM ✏️',
                className: 'text-center align-middle',
                render: function (d, type, row, meta) {
                    const dateVal = d ? d.substring(0, 10) : '';
                    const isChanged = Number(row.Diff_DES_BM) === 1;

                    // สไตล์สีแดงเมื่อมีการเปลี่ยนแปลง (ขอบแดง, พื้นชมพูอ่อน, ตัวอักษรแดง)
                    const highlightClass = isChanged
                        ? 'border-rose-400 bg-rose-50 text-rose-600 ring-1 ring-rose-300'
                        : 'bg-white text-slate-700 border-slate-300';

                    const tooltip = isChanged
                        ? `title="Update: ${row.UserAction || 'MANUAL'}"`
                        : '';

                    return `
                        <input type="date" 
                               class="input input-bordered input-xs w-36 text-center font-bold inline-edit-date ${highlightClass}" 
                               data-field="DES_BM" 
                               data-row-index="${meta.row}" 
                               ${tooltip}
                               value="${dateVal}">
                    `;
                },
            },
            {
                data: 'Time_DESBM_to_MFGBM',
                title: 'TIME (DES-MFG)',
                className: 'text-center align-middle',
            },
            {
                data: 'Go_DES',
                title: 'Go-DES ✏️',
                className: 'text-center align-middle',
                render: function (d, type, row, meta) {
                    const dateVal = d ? d.substring(0, 10) : '';
                    const isChanged = Number(row.Diff_Go_DES) === 1;

                    // สไตล์สีแดงเมื่อมีการเปลี่ยนแปลง
                    const highlightClass = isChanged
                        ? 'border-rose-400 bg-rose-50 text-rose-600 ring-1 ring-rose-300'
                        : 'bg-white text-slate-700 border-slate-300';

                    const tooltip = isChanged
                        ? `title="Update: ${row.UserAction || 'MANUAL'}"`
                        : '';

                    return `
                        <input type="date" 
                               class="input input-bordered input-xs w-36 text-center font-bold inline-edit-date ${highlightClass}" 
                               data-field="Go_DES" 
                               data-row-index="${meta.row}" 
                               ${tooltip}
                               value="${dateVal}">
                    `;
                },
            },
            {
                data: 'Time_GoDES_to_DESBM',
                title: 'TIME (Go-DES)',
                className: 'text-center align-middle',
            },
            {
                data: 'Confirm_MELINA_Portion',
                title: 'Confirm MELINA',
                className: 'text-center align-middle',
                render: (d) => (d ? d.substring(0, 10) : '-'),
            },
            {
                data: 'Time_Confirm_Melina',
                title: 'TIME (Confirm_MELINA)',
                className: 'text-center align-middle',
            },
            {
                data: 'MSE_to_MELINA',
                title: 'MSE to MELINA',
                className: 'text-center align-middle',
                render: (d) => (d ? d.substring(0, 10) : '-'),
            },
            {
                data: 'Time_MSE_to_MELINA',
                title: 'TIME (MSE_to_MELINA)',
                className: 'text-center align-middle',
            },
            {
                data: 'SW_Assembly',
                title: 'SW.Assembly',
                className: 'text-center align-middle',
                render: (d) => (d ? d.substring(0, 10) : '-'),
            },
            {
                data: 'Time_SW_Assembly',
                title: 'TIME (SW_Assembly)',
                className: 'text-center align-middle',
            },
            {
                data: 'Zero_Level_Check_Temp_DWG',
                title: '0-Level DWG',
                className: 'text-center align-middle',
                render: (d) => (d ? d.substring(0, 10) : '-'),
            },
            {
                data: 'Time_Zero_Level',
                title: 'TIME (Zero_Level)',
                className: 'text-center align-middle',
            },
            {
                data: 'Design_working_day',
                title: 'Design Working Day',
                className: 'text-center font-bold text-amber-600 align-middle',
                render: (d) => (d !== null && d !== undefined ? d : '-'),
            },
            {
                data: 'LeadTime',
                title: 'LeadTime',
                className: 'text-center align-middle',
                render: (d) => (d !== null && d !== undefined ? d : '-'),
            },
            {
                data: 'Time_DESBM_to_MFGBM_2',
                title: 'TIME (DES-MFG 2)',
                className: 'text-center align-middle',
                render: (d) => (d !== null && d !== undefined ? d : '-'),
            },
            {
                data: 'TypeJun',
                title: 'TypeJun',
                className: 'text-center align-middle',
            },
            {
                data: 'UserAction',
                title: 'UserAction',
                className: 'text-center align-middle',
            },
        ],
    });
}

/**
 * ฟังก์ชันจัดการสิทธิ์การแสดงปุ่มตามเงื่อนไข Mode & ExtData
 */
async function applyButtonPermissions(mode, extData, status = '') {
    const rawStatus = (status || '').toUpperCase().trim();
    const isPending = ['PROCESS', 'APPROVE'].includes(rawStatus);

    // 1. ซ่อนปุ่ม Action ทั้งหมดก่อนเสมอ
    const allButtons = [
        '#SearchBtn',
        '#ProcessBtn',
        '#SavePlanBtn',
        '#DeleteBtn',
        '#ApproveBtn',
        '#ReturnBtn',
    ];
    $(allButtons.join(', ')).addClass('hidden');

    // 2. ตรวจสอบ NRUNNO เพื่อแสดงปุ่ม Send Email เฉพาะเอกสารที่เดิน Flow แล้ว
    const formData = $('.form-info').data() || {};
    const nrunno = formData.nrunno || $('#NRUNNOHid').val();
    const hasTicket =
        nrunno && String(nrunno).trim() !== '' && String(nrunno).trim() !== '0';
    // alert(hasTicket);
    if (hasTicket) {
        $('#SentEmailBtn').removeClass('hidden');
    }

    // แปลง mode ให้อยู่ในรูป String เสมอ
    const currentMode = String(mode || '1').trim();

    if (currentMode === '1') {
        // 🟡 Mode 1: ผู้จัดทำ (Requester / Creator)
        $('#SearchBtn').removeClass('hidden');

        if (isPending) {
            // อยู่ใน Flow รออนุมัติ หรือ จบ Approve แล้ว -> ห้ามแก้ไข
            if (rawStatus === 'APPROVE') {
                $('#YearDrp, #PeriodDrp').prop('disabled', true);
                $('input[name="DesTypeChk[]"]').prop('disabled', true);
            }
        } else {
            // ยังไม่อนุมัติ
            if (rawStatus === 'DRAFT') {
                $('#SavePlanBtn').removeClass('hidden');
                $('#DeleteBtn').removeClass('hidden');
                $('#ProcessBtn').removeClass('hidden');
            } else if (rawStatus === '' || rawStatus === 'NONE') {
                $('#ProcessBtn').removeClass('hidden');
            }
        }
    } else if (currentMode === '2') {
        // 🟠 Mode 2: ผู้ตรวจสอบ / ผู้อนุมัติในสาย Flow
        $('#YearDrp, #PeriodDrp').prop('disabled', true);
        $('input[name="DesTypeChk[]"]').prop('disabled', true);

        const currentStep = String(extData || '').trim();

        if (currentStep === '01') {
            // CHECKER: ตรวจสอบ/อนุมัติ หรือ ตีกลับ
            $('#ApproveBtn').removeClass('hidden');
            $('#ReturnBtn').removeClass('hidden');
        } else if (currentStep === '02' || currentStep === '03') {
            // ACCEPTOR / APPROVER: อนุมัติ หรือ ตีกลับ
            $('#ApproveBtn').removeClass('hidden');
            $('#ReturnBtn').removeClass('hidden');
        } else if (currentStep === '') {
            if (rawStatus === 'DRAFT' || rawStatus === 'PROCESS') {
                $('#SavePlanBtn').removeClass('hidden');
                $('#DeleteBtn').removeClass('hidden');
            }
        }
    } else if (currentMode === '3') {
        // ⚪ Mode 3: View Only ดูได้อย่างเดียว
        $('#SearchBtn').removeClass('hidden');
        $('#RemarkTxt').prop('disabled', true);
        $('#YearDrp, #PeriodDrp').prop('disabled', true);
        $('input[name="DesTypeChk[]"]').prop('disabled', true);
    }
}

function updateStatusUI(status, revision, docNo = '') {
    const rawStatus = (status || 'NONE').toUpperCase().trim();
    const $statusBadge = $('#StatusBadge');
    const $pendingAlert = $('#PendingAlert');
    const mode = $('#MODEHid').val() || '1';
    const extData = $('#EXTDATAHid').val() || '';
    var step = '';
    if (extData == '01') {
        step = 'PREPARED';
    } else if (extData == '02') {
        step = 'D/E DDEM';
    } else if (extData == '03') {
        step = 'D/E DEM';
    }

    // 1. อัปเดต Revision Badge
    $('#RevBadge').text('Revision: ' + (revision || '*'));

    // 2. 🟢 ล้างสี Badge เดิมออกให้หมด (ทั้ง badge-* ของ DaisyUI และ bg-* ของ Tailwind)
    $statusBadge.removeClass(
        'badge-warning badge-success badge-error badge-ghost bg-orange-600 bg-emerald-600 bg-amber-500 bg-slate-500 text-slate-800 text-white hidden',
    );

    if (rawStatus === 'PROCESS') {
        // 🟠 กำลังเดิน Flow (สีส้ม/เหลือง)
        $statusBadge.addClass('badge-warning text-slate-800').text('PROCESS');

        if (mode === '1') {
            $('#StatusText').html(
                `<strong>แจ้งเตือน:</strong> รอบแผนงานนี้อยู่ในสถานะ <strong>PROCESS</strong> ${docNo ? `[${docNo}]` : ''} กำลังอยู่ระหว่างการอนุมัติ จึงไม่สามารถสร้างหรือคำนวณใหม่ได้ (กรุณาเลือกค้นหารอบอื่น)`,
            );
        } else {
            $('#StatusText').html(
                `<strong>แจ้งเตือน:</strong> เอกสารกำลังอยู่ในขั้นตอนการอนุมัติ (Step: ${step || '-'}) ${docNo ? `[${docNo}]` : ''}`,
            );
        }
        $pendingAlert.removeClass('hidden');

        const canEditInline =
            mode === '2' && (extData === '01' || extData === '');
        $('.inline-edit-date')
            .prop('disabled', !canEditInline)
            .toggleClass('opacity-50 cursor-not-allowed', !canEditInline);
    } else if (rawStatus === 'DRAFT') {
        // ⚪ เพิ่งกดคำนวณแต่ยังไม่ส่งเข้า Flow (สีเทาอ่อน)
        $statusBadge.addClass('badge-ghost text-slate-600').text('DRAFT');
        $pendingAlert.addClass('hidden');

        const isEditable = mode === '1';
        $('.inline-edit-date')
            .prop('disabled', !isEditable)
            .toggleClass('opacity-50 cursor-not-allowed', !isEditable);
    } else if (rawStatus === 'APPROVE' || rawStatus === 'APPROVED') {
        // 🟢 Approved จบแล้ว (สีเขียว)
        $statusBadge.addClass('badge-success text-white').text('APPROVE');
        $pendingAlert.addClass('hidden');

        $('.inline-edit-date')
            .prop('disabled', true)
            .addClass('opacity-50 cursor-not-allowed');
    } else {
        // รอบใหม่ที่ยังไม่มีเอกสารใดๆ
        $statusBadge.addClass('hidden');
        $pendingAlert.addClass('hidden');

        $('.inline-edit-date')
            .prop('disabled', true)
            .addClass('opacity-50 cursor-not-allowed');
    }
}

// ฟังก์ชันอ่านค่า DesType ที่ User ติ๊กเลือกทั้งหมด
function getSelectedDesTypes() {
    let selected = [];
    $('.des-type-checkbox:checked').each(function () {
        selected.push($(this).val());
    });
    return selected;
}

// ฟังก์ชันเซ็ตสถานะ Checkbox ตามค่าที่ได้จาก DB (เช่น "N|T" หรือ ["N", "T"])
function setSelectedDesTypes(desTypeData) {
    if (!desTypeData) return;

    let selectedList = Array.isArray(desTypeData)
        ? desTypeData
        : desTypeData.split('|');

    $('.des-type-checkbox').each(function () {
        let val = $(this).val();
        $(this).prop('checked', selectedList.includes(val));
    });
}
// ฟังก์ชันดึงค่าเริ่มต้นจาก Form Data Attribute
function resetToDefaultDesTypes() {
    const defaultData = $('.form-info').data('default-destypes');
    if (defaultData) {
        setSelectedDesTypes(defaultData);
    } else {
        // Fallback หากไม่มีค่า
        setSelectedDesTypes(['N', 'T']);
    }
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

async function actionFlow(actionType) {
    const remarkTxt = $('#RemarkTxt').val() || '';
    const formData = $('.form-info').data() || {};

    const payload = {
        NFRMNO: formData.nfrmno ? Number(formData.nfrmno) : 0,
        VORGNO: formData.vorgno ? formData.vorgno.toString() : '',
        CYEAR: formData.cyear ? formData.cyear.toString() : '',
        CYEAR2: formData.cyear2 ? formData.cyear2.toString() : '',
        NRUNNO: formData.nrunno ? Number(formData.nrunno) : 0,
        ACTION: actionType ? actionType.toString() : '',
        EMPNO: formData.empno ? formData.empno.toString() : '',
        REMARK: remarkTxt.toString(),
        REVISION: $('#RevisionHid').val(),
    };

    try {
        $('#loading').removeClass('hidden');

        // 1. ดำเนินการ Action กับ Webflow Core Module
        const res = await doaction(payload);
        if (res?.status || res?.status === true || res?.status === 'true') {
            // 2. ส่งข้อมูลมาอัปเดต Status ใน Tb_Master_DESBM_Header
            let EndProcessData = new FormData();
            EndProcessData.append('NFRMNO', formData.nfrmno);
            EndProcessData.append('VORGNO', formData.vorgno);
            EndProcessData.append('CYEAR', formData.cyear);
            EndProcessData.append('CYEAR2', formData.cyear2);
            EndProcessData.append('NRUNNO', formData.nrunno);
            EndProcessData.append(
                'EMPNO',
                formData.empno ? formData.empno.toString() : '',
            ); // 🟢 แก้ไขจุดนี้
            EndProcessData.append('EXTDATA', $('#EXTDATAHid').val() || '');
            EndProcessData.append(
                'ACTION',
                actionType ? actionType.toString() : '',
            );

            const responseEndProcess = await $.ajax({
                url: host + 'dedform/DED-MDS/form/ActionFlow',
                type: 'POST',
                data: EndProcessData,
                processData: false,
                contentType: false,
                dataType: 'json',
            });

            if (responseEndProcess && responseEndProcess.status) {
                redirectWebflow(); // เปลี่ยนหน้าเมื่อ Flow และ Status อัปเดตสมบูรณ์
            } else {
                throw new Error(
                    responseEndProcess?.message ||
                        'การอัปเดตสถานะระบบไม่สำเร็จ',
                );
            }
        } else {
            throw new Error(res?.message || 'ไม่สามารถส่งอนุมัติเอกสารได้');
        }
    } catch (error) {
        console.error('Action Flow Error:', error);
        alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
        $('#loading').addClass('hidden');
    }
}

// ===================================================================
// == Export Excel
// ===================================================================

/**
 * แปลง Index คอลัมน์ตัวเลขเป็นตัวอักษรของ Excel (เช่น 1 -> A, 4 -> D, 27 -> AA, 40 -> AN)
 */
function getExcelColumnLetter(colIndex) {
    let temp,
        letter = '';
    while (colIndex > 0) {
        temp = (colIndex - 1) % 26;
        letter = String.fromCharCode(temp + 65) + letter;
        colIndex = Math.floor((colIndex - temp - 1) / 26);
    }
    return letter;
}

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

// reject
$(document).on('click', '#RejectBtn', async function () {
    let val = $(this).val();
    await actionFlow('reject');
});

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
