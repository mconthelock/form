import $ from 'jquery';
import { showLoader } from '@amec/webasset/preloader';
import {
    showMessage,
    showErrorMessage,
    showConfirm,
} from '@amec/webasset/utils';
import { host } from '../../utils';

import 'datatables.net-dt';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';
import 'datatables.net-buttons-dt';
import 'datatables.net-buttons/js/buttons.html5.mjs';

$(document).ready(function () {
    let dataTableInstance = null;
    let masterData = Array.isArray(window.MASTER_CONTROLS)
        ? window.MASTER_CONTROLS
        : [];
    const adminEmpNo = $('#EMPNOHid').val() || '';

    // ----------------------------------------------------
    // คำสั่งสร้าง DataTable จาก JavaScript 100%
    // ----------------------------------------------------
    function initMasterDataTable(dataset) {
        if ($.fn.DataTable.isDataTable('#ctrlMstTable')) {
            $('#ctrlMstTable').DataTable().destroy();
            $('#ctrlMstTable').empty();
        }

        dataTableInstance = $('#ctrlMstTable').DataTable({
            data: dataset,
            responsive: true,
            pageLength: 10,
            lengthMenu: [10, 25, 50, 100],
            order: [[0, 'asc']],
            columns: [
                {
                    title: 'Control No.',
                    data: 'CONTROL_NO',
                    className:
                        'font-bold text-emerald-700 whitespace-nowrap align-middle',
                },
                {
                    title: 'Control Name',
                    data: 'CONTROL_NAME',
                    className: 'font-medium align-middle',
                },
                {
                    title: 'Division',
                    data: null,
                    className: 'whitespace-nowrap align-middle',
                    render: function (data, type, row) {
                        return `${row.SDIVCODE || ''} : ${row.DIV_NAME || '-'}`;
                    },
                },
                {
                    title: 'Department',
                    data: null,
                    className: 'whitespace-nowrap align-middle',
                    render: function (data, type, row) {
                        return `${row.SDEPCODE || ''} : ${row.DEPT_NAME || '-'}`;
                    },
                },
                {
                    title: 'Section',
                    data: null,
                    className: 'whitespace-nowrap align-middle',
                    render: function (data, type, row) {
                        return `${row.SSECCODE || '00'} : ${row.SEC_NAME || 'No Section'}`;
                    },
                },
                {
                    title: 'ผู้รับผิดชอบ (PIC)',
                    data: null,
                    className: 'whitespace-nowrap align-middle',
                    render: function (data, type, row) {
                        if (!row.RESP_EMPNO) {
                            return '<span class="text-slate-400 italic">ยังไม่ได้ระบุ</span>';
                        }
                        return `
                            <span class="font-semibold text-slate-800">${row.RESP_EMPNO}</span>
                            <span class="text-slate-500 text-[11px] block">${row.RESP_NAME || '-'}</span>
                        `;
                    },
                },
                {
                    title: 'สถานะ',
                    data: 'ACTIVE_FLAG',
                    className: 'text-center whitespace-nowrap align-middle',
                    render: function (data) {
                        return (data || 'Y') === 'Y'
                            ? '<span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Active</span>'
                            : '<span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">Inactive</span>';
                    },
                },
                {
                    title: 'จัดการ',
                    data: null,
                    orderable: false,
                    className: 'text-center whitespace-nowrap align-middle',
                    render: function (data, type, row, meta) {
                        const hasPic = Boolean(
                            row.RESP_EMPNO && row.RESP_EMPNO.trim() !== '',
                        );
                        const isActive = (row.ACTIVE_FLAG || 'Y') === 'Y';

                        let yearlyBtn = '';
                        let resendBtn = '';

                        if (hasPic && isActive) {
                            yearlyBtn = `
                                <button type="button" class="btn-yearly-single px-2 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg cursor-pointer transition-colors"
                                        data-row-index="${meta.row}" title="สร้างเอกสาร Yearly Draft">
                                    ⚡ Yearly
                                </button>
                            `;
                            resendBtn = `
                                <button type="button" class="btn-resend-single px-2 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg cursor-pointer transition-colors"
                                        data-row-index="${meta.row}" title="ส่ง Email แจ้งเตือน PIC ซ้ำเฉพาะรายการนี้">
                                    📩 ส่งเมลซ้ำ
                                </button>
                            `;
                        }

                        return `
                            <div class="inline-flex items-center gap-1">
                                ${yearlyBtn}
                                ${resendBtn}
                                <button type="button" class="btn-edit-row px-2 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg cursor-pointer"
                                        data-row-index="${meta.row}">
                                    ✏️ แก้ไข
                                </button>
                                <button type="button" class="btn-delete-row px-2 py-1 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg cursor-pointer"
                                        data-row-index="${meta.row}">
                                    🗑️ ลบ
                                </button>
                            </div>
                        `;
                    },
                },
            ],
            language: {
                search: 'ค้นหา:',
                lengthMenu: 'แสดง _MENU_ รายการ',
                info: 'แสดง _START_ ถึง _END_ จากทั้งหมด _TOTAL_ รายการ',
                infoEmpty: 'ไม่พบข้อมูล',
                infoFiltered: '(กรองจากทั้งหมด _MAX_ รายการ)',
                zeroRecords: 'ไม่พบข้อมูลที่ตรงกับการค้นหา',
                paginate: {
                    first: 'แรก',
                    last: 'ท้ายสุด',
                    next: 'ถัดไป',
                    previous: 'ก่อนหน้า',
                },
            },
        });
    }

    initMasterDataTable(masterData);

    // ----------------------------------------------------
    // ฟังก์ชัน Cascading Dropdown
    // ----------------------------------------------------
    async function loadDepartmentsByDiv(divCode, selectedDept = '') {
        const $dept = $('#modal_SDEPCODE')
            .empty()
            .append('<option value="">-- เลือก Department --</option>');
        $('#modal_SSECCODE')
            .empty()
            .append('<option value="00">00 : No Section / ทั้งแผนก</option>');
        $('#modal_RESP_EMPNO')
            .empty()
            .append(
                '<option value="">-- กรุณาเลือก Department ก่อน --</option>',
            );

        if (!divCode) return;

        try {
            await showLoader({ show: true });
            const res = await $.getJSON(
                `${host}feform/FE-ASP/control_mst/ajaxGetDepartmentsByDiv?divCode=${encodeURIComponent(divCode)}`,
            );
            if (res && res.status && res.departments) {
                res.departments.forEach((d) => {
                    const isSel = d.SDEPCODE === selectedDept ? 'selected' : '';
                    $dept.append(
                        `<option value="${d.SDEPCODE}" ${isSel}>${d.SDEPCODE} : ${d.DEPT_NAME}</option>`,
                    );
                });
                if (selectedDept) $dept.val(selectedDept);
            }
        } catch (e) {
            console.error('loadDepartmentsByDiv error:', e);
        } finally {
            await showLoader({ show: false });
        }
    }

    async function loadDeptContext(
        depCode,
        selectedSec = '00',
        selectedResp = '',
    ) {
        const $sec = $('#modal_SSECCODE')
            .empty()
            .append('<option value="00">00 : No Section / ทั้งแผนก</option>');
        const $emp = $('#modal_RESP_EMPNO')
            .empty()
            .append(
                '<option value="">-- เลือกผู้รับผิดชอบ (เฉพาะคนใน Department) --</option>',
            );

        if (!depCode) return;

        try {
            await showLoader({ show: true });
            const res = await $.getJSON(
                `${host}feform/FE-ASP/control_mst/ajaxGetDeptDetails?depCode=${encodeURIComponent(depCode)}`,
            );
            if (res && res.status) {
                if (res.sections && res.sections.length > 0) {
                    $sec.empty();
                    res.sections.forEach((s) => {
                        const isSel =
                            s.SSECCODE === selectedSec ? 'selected' : '';
                        $sec.append(
                            `<option value="${s.SSECCODE}" ${isSel}>${s.SEC_NAME || s.SSECCODE}</option>`,
                        );
                    });
                }
                if (selectedSec) $sec.val(selectedSec);

                if (res.employees && res.employees.length > 0) {
                    res.employees.forEach((e) => {
                        const isSel =
                            String(e.SEMPNO).trim() ===
                            String(selectedResp).trim()
                                ? 'selected'
                                : '';
                        $emp.append(
                            `<option value="${e.SEMPNO}" ${isSel}>${e.SEMPNO} : ${e.SNAME} (${e.SPOSNAME || ''}) [${e.SSEC || 'แผนก'}]</option>`,
                        );
                    });
                }
                if (selectedResp) $emp.val(selectedResp);
            }
        } catch (e) {
            console.error('loadDeptContext error:', e);
        } finally {
            await showLoader({ show: false });
        }
    }

    // ----------------------------------------------------
    // Dropdown Change Events
    // ----------------------------------------------------
    $('#modal_SDIVCODE').on('change', async function () {
        await loadDepartmentsByDiv($(this).val());
    });

    $('#modal_SDEPCODE').on('change', async function () {
        await loadDeptContext($(this).val());
    });

    // ----------------------------------------------------
    // Modal Open & Action Events
    // ----------------------------------------------------
    $('#btnOpenAddModal').on('click', function () {
        $('#formSaveControl')[0].reset();
        $('#isEdit').val('0');
        $('#modalTitle').text('➕ เพิ่ม Master Control Number');
        $('#modal_CONTROL_NO')
            .prop('readonly', false)
            .removeClass('bg-slate-100 cursor-not-allowed');

        $('#modal_SDEPCODE')
            .empty()
            .append('<option value="">-- กรุณาเลือก Division ก่อน --</option>');
        $('#modal_SSECCODE')
            .empty()
            .append('<option value="00">00 : No Section / ทั้งแผนก</option>');
        $('#modal_RESP_EMPNO')
            .empty()
            .append(
                '<option value="">-- กรุณาเลือก Department ก่อน --</option>',
            );

        $('#modalForm').removeClass('hidden');
    });

    $('#btnCloseModal, #btnCancelModal').on('click', function () {
        $('#modalForm').addClass('hidden');
    });

    // ปุ่มแก้ไขแถว
    $(document).on('click', '.btn-edit-row', async function () {
        const rowIdx = $(this).data('row-index');
        const row = dataTableInstance.row(rowIdx).data();
        if (!row) return;

        $('#isEdit').val('1');
        $('#modalTitle').text('✏️ แก้ไข Master Control Number');

        $('#OLD_CONTROL_NO').val(row.CONTROL_NO);
        $('#OLD_SDIVCODE').val(row.SDIVCODE);
        $('#OLD_SDEPCODE').val(row.SDEPCODE);
        $('#OLD_SSECCODE').val(row.SSECCODE);

        $('#modal_CONTROL_NO').val(row.CONTROL_NO);
        $('#modal_CONTROL_NAME').val(row.CONTROL_NAME);
        $('#modal_SDIVCODE').val(row.SDIVCODE);

        $(`input[name="ACTIVE_FLAG"][value="${row.ACTIVE_FLAG || 'Y'}"]`).prop(
            'checked',
            true,
        );

        await loadDepartmentsByDiv(row.SDIVCODE, row.SDEPCODE);
        await loadDeptContext(row.SDEPCODE, row.SSECCODE, row.RESP_EMPNO);

        $('#modalForm').removeClass('hidden');
    });

    // ----------------------------------------------------
    // ⚡ ปุ่มสร้างเอกสาร Yearly Review (ราย Control No.)
    // ----------------------------------------------------
    $(document).on('click', '.btn-yearly-single', async function () {
        const rowIdx = $(this).data('row-index');
        const row = dataTableInstance.row(rowIdx).data();
        if (!row) return;

        const isConfirm = await showConfirm({
            title: 'ยืนยันสร้างเอกสาร Yearly Draft',
            message: `ต้องการสร้างแบบร่างเอกสาร Yearly Review สำหรับ:\nControl: ${row.CONTROL_NO}\nแผนก: ${row.SDEPCODE}\nผู้จัดทำ (PIC): ${row.RESP_EMPNO} (${row.RESP_NAME || ''}) ใช่หรือไม่?`,
            acceptText: 'สร้างเอกสาร',
            cancelText: 'ยกเลิก',
        });
        if (!isConfirm) return;

        try {
            await showLoader({ show: true });
            const res = await $.ajax({
                url: `${host}feform/FE-ASP/batch/manual_generate_yearly`,
                type: 'POST',
                data: {
                    controlNo: row.CONTROL_NO,
                    empno: row.RESP_EMPNO,
                    admin_empno: adminEmpNo,
                },
                dataType: 'json',
            });

            if (res && res.status) {
                showMessage(
                    `สร้างแบบร่างเอกสารสำเร็จ!\nเลขที่: ${res.data.doc_no}`,
                    'success',
                );
                if (res.redirect_url) {
                    setTimeout(() => {
                        window.open(res.redirect_url, '_blank');
                    }, 800);
                }
            } else {
                showErrorMessage(res?.message || 'ไม่สามารถสร้างเอกสารได้');
            }
        } catch (err) {
            showErrorMessage(
                'เกิดข้อผิดพลาด: ' +
                    (err.responseJSON?.message || err.statusText),
            );
        } finally {
            await showLoader({ show: false });
        }
    });

    // ----------------------------------------------------
    // ⚡ ปุ่มสร้างเอกสาร Yearly Review ทั้งหมด (ทุก Control No.)
    // ----------------------------------------------------
    $('#btnRunYearlyAll').on('click', async function () {
        const isConfirm = await showConfirm({
            title: '⚡ รันสร้างเอกสาร Yearly Review ทั้งหมด',
            message:
                'ระบบจะทำการสร้างแบบร่าง (Draft) เอกสาร Yearly Review ประจำปี ให้แก่ทุกแผนกที่มีการกำหนดผู้รับผิดชอบ (PIC) ไว้\n\nต้องการดำเนินการทันทีใช่หรือไม่?',
            acceptText: 'เริ่มรันงาน',
            cancelText: 'ยกเลิก',
        });
        if (!isConfirm) return;

        try {
            await showLoader({ show: true });
            const res = await $.ajax({
                url: `${host}feform/FE-ASP/batch/run_yearly_cron`,
                type: 'POST',
                data: {
                    empno: adminEmpNo,
                },
                dataType: 'json',
            });

            if (res && res.status) {
                const createdCount = res.created ? res.created.length : 0;
                const skippedCount = res.skipped ? res.skipped.length : 0;
                showMessage(
                    `ประมวลผลเสร็จสิ้น!\n- สร้างสำเร็จ: ${createdCount} รายการ\n- ข้าม (มีอยู่แล้ว/ติดปัญหา): ${skippedCount} รายการ`,
                    'success',
                );
            } else {
                showErrorMessage(res?.message || 'การประมวลผลไม่สำเร็จ');
            }
        } catch (err) {
            showErrorMessage(
                'เกิดข้อผิดพลาดในการประมวลผล: ' +
                    (err.responseJSON?.message || err.statusText),
            );
        } finally {
            await showLoader({ show: false });
        }
    });

    // ลบแถวข้อมูล
    $(document).on('click', '.btn-delete-row', async function () {
        const rowIdx = $(this).data('row-index');
        const row = dataTableInstance.row(rowIdx).data();
        if (!row) return;

        const isConfirm = await showConfirm({
            title: 'ยืนยันการลบ',
            message: `ต้องการลบ Control No. "${row.CONTROL_NO}" (แผนก ${row.SDEPCODE}) ใช่หรือไม่?`,
            acceptText: 'ยืนยันลบ',
            cancelText: 'ยกเลิก',
        });
        if (!isConfirm) return;

        try {
            await showLoader({ show: true });
            const res = await $.ajax({
                url: `${host}feform/FE-ASP/control_mst/ajaxDelete`,
                type: 'POST',
                data: {
                    CONTROL_NO: row.CONTROL_NO,
                    SDIVCODE: row.SDIVCODE,
                    SDEPCODE: row.SDEPCODE,
                    SSECCODE: row.SSECCODE,
                },
                dataType: 'json',
            });

            if (res && res.status) {
                showMessage(res.message, 'success');
                setTimeout(() => location.reload(), 1000);
            } else {
                showErrorMessage(res?.message || 'ไม่สามารถลบได้');
            }
        } catch (err) {
            showErrorMessage('ลบไม่สำเร็จ: ' + err.statusText);
        } finally {
            await showLoader({ show: false });
        }
    });

    // บันทึกฟอร์ม Modal
    $('#formSaveControl').on('submit', async function (e) {
        e.preventDefault();
        const formData = $(this).serialize();

        try {
            await showLoader({ show: true });
            const res = await $.ajax({
                url: `${host}feform/FE-ASP/control_mst/ajaxSave`,
                type: 'POST',
                data: formData,
                dataType: 'json',
            });

            if (res && res.status) {
                showMessage(res.message, 'success');
                setTimeout(() => location.reload(), 1000);
            } else {
                showErrorMessage(res?.message || 'ไม่สามารถบันทึกได้');
            }
        } catch (err) {
            showErrorMessage('บันทึกไม่สำเร็จ: ' + err.statusText);
        } finally {
            await showLoader({ show: false });
        }
    });

    // ----------------------------------------------------
    // 📩 ปุ่มส่ง Email แจ้งเตือนซ้ำ (รายแถว)
    // ----------------------------------------------------
    $(document).on('click', '.btn-resend-single', async function () {
        const rowIdx = $(this).data('row-index');
        const row = dataTableInstance.row(rowIdx).data();
        if (!row) return;

        const isConfirm = await showConfirm({
            title: '📩 ส่งอีเมลแจ้งเตือนซ้ำ',
            message: `ต้องการส่งอีเมลแจ้งเตือน PIC ซ้ำสำหรับ:\nControl No: ${row.CONTROL_NO}\nผู้รับ: ${row.RESP_EMPNO} (${row.RESP_NAME || ''}) ใช่หรือไม่?`,
            acceptText: 'ส่งอีเมล',
            cancelText: 'ยกเลิก',
        });
        if (!isConfirm) return;

        try {
            await showLoader({ show: true });
            const res = await $.ajax({
                url: `${host}feform/FE-ASP/batch/resend_yearly_email`,
                type: 'POST',
                data: {
                    controlNo: row.CONTROL_NO,
                    admin_empno: adminEmpNo,
                },
                dataType: 'json',
            });

            if (res && res.status) {
                showMessage(res.message, 'success');
            } else {
                showErrorMessage(res?.message || 'ส่งอีเมลไม่สำเร็จ');
            }
        } catch (err) {
            showErrorMessage(
                'เกิดข้อผิดพลาด: ' +
                    (err.responseJSON?.message || err.statusText),
            );
        } finally {
            await showLoader({ show: false });
        }
    });

    // ----------------------------------------------------
    // 📩 ปุ่มส่ง Email แจ้งเตือนซ้ำทั้งหมด
    // ----------------------------------------------------
    $('#btnResendEmailAll').on('click', async function () {
        const isConfirm = await showConfirm({
            title: '📩 ส่งอีเมลแจ้งเตือนซ้ำทั้งหมด',
            message:
                'ระบบจะทำการส่ง Email แจ้งเตือนไปยัง PIC ของทุกแผนกที่มีเอกสาร Yearly ประจำปีนี้อยู่แล้ว\n\nต้องการดำเนินการใช่หรือไม่?',
            acceptText: 'ส่งอีเมลทั้งหมด',
            cancelText: 'ยกเลิก',
        });
        if (!isConfirm) return;

        try {
            await showLoader({ show: true });
            const res = await $.ajax({
                url: `${host}feform/FE-ASP/batch/resend_yearly_email`,
                type: 'POST',
                data: {
                    controlNo: '', // ว่าง = ส่งทุก Control No.
                    admin_empno: adminEmpNo,
                },
                dataType: 'json',
            });

            if (res && res.status) {
                showMessage(res.message, 'success');
            } else {
                showErrorMessage(res?.message || 'ส่งอีเมลไม่สำเร็จ');
            }
        } catch (err) {
            showErrorMessage(
                'เกิดข้อผิดพลาด: ' +
                    (err.responseJSON?.message || err.statusText),
            );
        } finally {
            await showLoader({ show: false });
        }
    });
});
