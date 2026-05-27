import { getmfgedr, updatecause4m } from './data.js';
import { showLoader } from "@amec/webasset/preloader";
import { showMessage, showConfirm } from "@amec/webasset/utils";
import { createTable } from "@amec/webasset/dataTable";
import { downloadOrOpenFile } from "@amec/webasset/api/file";
import { setDatePicker } from "@amec/webasset/flatpickr";
import { createBtn, activatedBtn } from "@amec/webasset/components/buttons";
import { host } from "../../utils";
import { redirectWebflow } from "@amec/webasset/form";
import { doaction, createForm, showflow } from "@amec/webasset/api/webform";
import Swal from "sweetalert2";


$(document).ready(function () {
    const VIEW = {
        canEditCause4M: false,
        showCause4M: false,
        ssec: '',
        cyear2: '',

        async init() {
            await this.loadData();
        },

        async loadData() {
            showLoader({ show: true });
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const getVal = (inputId, paramNames = []) => {
                    const inputVal = $.trim($(inputId).val());
                    if (inputVal) return inputVal;

                    for (const name of paramNames) {
                        const val = $.trim(urlParams.get(name) || '');
                        if (val) return val;
                    }
                    return '';
                };

                const payload = {
                    NFRMNO: getVal('#nfrmno', ['no', 'NFRMNO']),
                    VORGNO: getVal('#vorgno', ['orgNo', 'orgno', 'VORGNO']),
                    CYEAR: getVal('#cyear', ['y', 'CYEAR']),
                    CYEAR2: getVal('#cyear2', ['y2', 'CYEAR2']),
                    NRUNNO: getVal('#nrunno', ['runNo', 'runno', 'NRUNNO']),
                };

                const flow = await showflow(payload);
                $(".flow").html(flow.html);

                console.log('VIEW URL =', window.location.href);
                console.log('PAYLOAD =', payload);

                if (!payload.NFRMNO || !payload.VORGNO || !payload.CYEAR || !payload.CYEAR2 || !payload.NRUNNO) {
                    console.error('MISSING VIEW PARAMS:', payload);
                    alert('ไม่พบข้อมูล key ของฟอร์ม กรุณาตรวจสอบ URL: no, orgNo, y, y2, runNo');
                    return;
                }

                const res = await getmfgedr(payload);
                console.log('GET MFG EDR =', res);

                if (!res?.status) {
                    alert(res?.message || 'Data not found');
                    return;
                }

                const data = res.data || {};
                this.renderForm(data.form || {});
                this.renderHeader(data.head || {});
                this.renderFile(data.att || {});
                this.applyCause4MPermission();
                this.renderDetail(data.list || []);
                this.renderCause4M(data.cause4m || data.CAUSE4M || []);
                initCause4MDatePicker();
            } catch (err) {
                showLoader({ show: false });
                console.error(err);
                alert('Load data failed');
            } finally {
                showLoader({ show: false });
            }
        },

        renderForm(form) {
            $('#v_request_by').text((form.REQ_EMPNO || '-') + '_' + (form.REQ_NAME || '-'));
            $('#v_create_by').text((form.INP_EMPNO || '-') + '_' + (form.INP_NAME || '-'));
            this.ssec = String(form.REQ_SEC || '').trim().substring(0, 3);
            this.cyear2 = String(form.CYEAR2 || '').slice(-2);
        },

        renderHeader(head) {
            const runno = String(head.DAILY_RUNNO || 0).padStart(3, '0');
            const dailyno = this.ssec + '-' + head.DAILY_MONTH + '-' + this.cyear2 + runno;
            this.tid = Number(head.TID || 0);
            $('#v_daily_no').text(dailyno || '-');
            $('#v_worktype').text(head.TYPENAME || '-');
            $('#v_repair_by').text((head.REPAIR_BY || '-') + '_' + (head.REPAIR_BY_NAME || '-'));
            $('#v_cause').text((head.CAUSE || '-') + '_' + (head.CAUSENAME || '-'));
        },

        renderFile(att = []) {
            const formno = $('#v_form_no').data('formno');
            const baseUrl = $('#base_url').val();
            const $fileList = $('#v_file_list').empty();

            console.log('base url =', baseUrl);

            if (!att.length) {
                $fileList.html('-');
                return;
            }

            att.forEach(file => {
                const filename = file.FILENAME;
                const url = `${baseUrl}mfgform/MFG-EDR/main_edr/preview_file/` + formno + '/' + encodeURIComponent(filename);
                console.log('FILE URL =', url);

                $fileList.append(`
                    <div>
                        <a href="${url}" target="_blank" class="text-blue-700 underline btn btn-sm rounded-lg"> ${filename} </a>
                    </div>
                `);
            });
        },

       renderDetail(list) {
            const $colgroup = $('#v_detail_colgroup').empty();
            const $thead = $('#v_detail_head').empty();
            const $tbody = $('#v_detail_body').empty();

            if (!list.length) return;

            const isPCB = this.tid === 4;

            if (isPCB) {
                $colgroup.html(`
                    <col style="width:45px;">
                    <col style="width:14%;">
                    <col style="width:10%;">
                    <col style="width:11%;">
                    <col style="width:10%;">
                    <col style="width:10%;">
                    <col style="width:10%;">
                    <col style="width:6%;">
                    <col style="width:29%;">
                `);

                $thead.html(`
                    <tr class="bg-gradient-to-r from-emerald-900 to-teal-700 text-white">
                        <th>#</th>
                        <th>Drawing No</th>
                        <th>Line</th>
                        <th>Process</th>
                        <th>Lot</th>
                        <th>Serial</th>
                        <th>Prod Jun</th>
                        <th>Qty</th>
                        <th>Detail of problem</th>
                    </tr>
                `);

                list.forEach((row, index) => {
                    $tbody.append(`
                        <tr data-id="${row.ID}">
                            <td class="text-center">${index + 1}</td>
                            <td>${row.DWGNO || '-'}</td>
                            <td>${row.LINE_NAME || row.LINE || '-'}</td>
                            <td>${row.PROCESS_NAME || row.PROCESS || '-'}</td>
                            <td>${row.LOT || '-'}</td>
                            <td>${row.SERIAL || '-'}</td>
                            <td>${row.PRDN_JUN || '-'}</td>
                            <td class="text-center">${row.QTY || '-'}</td>
                            <td class="text-left">${row.DETAIL || '-'}</td>
                        </tr>
                    `);
                });

                return;
            }

            $colgroup.html(`
                <col style="width:45px;">
                <col style="width:12%;">
                <col style="width:14%;">
                <col style="width:13%;">
                <col style="width:10%;">
                <col style="width:7%;">
                <col style="width:10%;">
                <col style="width:6%;">
                <col style="width:28%;">
            `);

            $thead.html(`
                <tr class="bg-gradient-to-r from-emerald-900 to-teal-700 text-white">
                    <th>#</th>
                    <th>Order No</th>
                    <th>Drawing No</th>
                    <th>Project No</th>
                    <th>Prod Jun</th>
                    <th>Item</th>
                    <th>Model</th>
                    <th>Qty</th>
                    <th>Detail of problem</th>
                </tr>
            `);

            list.forEach((row, index) => {
                $tbody.append(`
                    <tr data-id="${row.ID}">
                        <td class="text-center">${index + 1}</td>
                        <td>${row.ORDERNO || '-'}</td>
                        <td>${row.DWGNO || '-'}</td>
                        <td>${row.PRJ_NO || '-'}</td>
                        <td>${row.PRDN_JUN || '-'}</td>
                        <td>${row.ITEM || '-'}</td>
                        <td>${row.MODEL || '-'}</td>
                        <td class="text-center">${row.QTY || '-'}</td>
                        <td class="text-left">${row.DETAIL || '-'}</td>
                    </tr>
                `);
            });
        },

        applyCause4MPermission() {
            const mode = String($('#mode').val() || '');
            const exdata = String($('#txt_exdata').val() || '');

            this.canEditCause4M = mode === '2' && exdata === '01';
            this.showCause4M = exdata === '01';

            console.log('CAN EDIT CAUSE 4M =', this.canEditCause4M);
            console.log('SHOW CAUSE 4M =', this.showCause4M);

            $('.col-action-cause4m').toggle(this.canEditCause4M);
        },

        renderCause4M(list = []) {
            const $zone = $('#zone_cause4m');
            const $tbody = $('#v_cause4m_body').empty();

            if (!list.length && !this.showCause4M) {
                $zone.hide();
                return;
            }

            $zone.show();

            list.forEach((row, index) => {
                $tbody.append(this.cause4MRow({
                    id: row.ID || row.CAUSE4M_ID || '',
                    no: index + 1,
                    cause: row.CAUSE,
                    detail: row.DETAIL,
                    dueDate: row.DUE_DATE || '',
                    pic: row.PIC || row.RESPONSIBLE || '',
                    editable: this.canEditCause4M,
                }));
            });

            if (this.canEditCause4M) {
                if (!list.length) {
                    $tbody.append(this.cause4MRow({
                        id: '',
                        no: 1,
                        editable: true,
                    }));
                }

                $tbody.append(this.addCause4MRow());
            }
        },

        cause4MRow({
            id = '',
            no,
            cause = '',
            detail = '',
            dueDate = '',
            pic = '',
            editable = true,
        }) {
            const dateValue = this.formatDateDMY(dueDate);

            if (!editable) {
                return `
                    <tr class="cause4m-row" data-id="${id}">
                        <td class="text-center align-top w-[60px]">${no}</td>
                        <td class="text-center align-top">${cause || '-'}</td>
                        <td class="align-top text-left whitespace-pre-wrap">${detail || '-'}</td>
                        <td class="text-center align-top">${dateValue || '-'}</td>
                        <td class="align-top">${pic || '-'}</td>
                    </tr>
                `;
            }

            return `
                <tr class="cause4m-row" data-id="${id}">
                    <td class="text-center align-top w-[60px]">${no}</td>
                    <td class="align-top p-2">
                        <select name="CAUSE4M_TYPE[]" class="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100">
                            <option value="" ${cause === '' ? 'selected' : ''}>-- select --</option>
                            <option value="Man" ${cause === 'Man' ? 'selected' : ''}>Man</option>
                            <option value="Machine" ${cause === 'Machine' ? 'selected' : ''}>Machine</option>
                            <option value="Material" ${cause === 'Material' ? 'selected' : ''}>Material</option>
                            <option value="Method" ${cause === 'Method' ? 'selected' : ''}>Method</option>
                        </select>
                    </td>
                    <td class="align-top p-2">
                        <textarea name="CAUSE4M_DETAIL[]" rows="2" class="w-full min-h-[64px] overflow-hidden rounded-lg border border-slate-300 px-3 py-2 text-sm resize-none outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100">${detail || ''}</textarea> </td>
                    <td class="align-top p-2 w-[170px]">
                        <input type="text" name="CAUSE4M_DUE_DATE[]" value="${dateValue}" maxlength="10" placeholder="dd/mm/yyyy" readonly class="cause4m-date w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 cursor-pointer bg-white">
                    </td>
                    <td class="align-top p-2 w-[220px]">
                        <input type="text" name="CAUSE4M_PIC[]" value="${pic || ''}" maxlength="50" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100">
                    </td>
                    <td class="text-center align-top w-[60px] p-2 col-action-cause4m">
                        <button type="button" class="btn-del-cause4m cursor-pointer rounded-full bg-red-500 px-3 py-2 text-xs font-extrabold text-white shadow hover:bg-red-600">🗑</button>
                    </td>
                </tr>
            `;
        },

        addCause4MRow() {
            return `
                <tr class="cause4m-add-row">
                    <td colspan="6" class="text-center py-3">
                        <button type="button" class="btn-add-cause4m inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold shadow hover:bg-emerald-700 transition">
                            <i class="bi bi-plus-circle"></i>Add Row
                        </button>
                    </td>
                </tr>
            `;
        },

        formatDateDMY(value = '') {
            if (!value) return '';

            const text = String(value).trim();
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(text)) return text;

            if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
                const [y, m, d] = text.substring(0, 10).split('-');
                return `${d}/${m}/${y}`;
            }

            return text;
        },

        isValidDateDMY(value = '') {
            const text = String(value).trim();
            if (!/^\d{2}\/\d{2}\/\d{4}$/.test(text)) return false;

            const [d, m, y] = text.split('/').map(Number);
            const date = new Date(y, m - 1, d);

            return date.getFullYear() === y &&
                date.getMonth() === m - 1 &&
                date.getDate() === d;
        },

        getBasePayload() {
            return {
                NFRMNO: $('#nfrmno').val(),
                VORGNO: $('#vorgno').val(),
                CYEAR: $('#cyear').val(),
                CYEAR2: $('#cyear2').val(),
                NRUNNO: $('#nrunno').val(),
            };
        },

        getCause4MPayload() {
            return {
                ...this.getBasePayload(),
                UPDATE_BY: $('#empno').val(),
                CAUSE4M_LIST: $('#v_cause4m_body tr.cause4m-row').map(function () {
                    const $row = $(this);
                    return {
                        ID: $row.data('id') || null,
                        CAUSE: $row.find('[name="CAUSE4M_TYPE[]"]').val() || null,
                        DETAIL: $row.find('[name="CAUSE4M_DETAIL[]"]').val()?.trim() || null,
                        DUE_DATE: $row.find('[name="CAUSE4M_DUE_DATE[]"]').val()?.trim() || null,
                        PIC: $row.find('[name="CAUSE4M_PIC[]"]').val()?.trim() || null,
                    };
                }).get(),
            };
        },

        async validateCause4M() {
            const payload = this.getCause4MPayload();

            if (!payload.CAUSE4M_LIST.length) {
                await Swal.fire({
                    icon: 'warning',
                    title: 'กรุณากรอก Cause 4M อย่างน้อย 1 รายการ',
                    confirmButtonText: 'ตกลง',
                });
                return false;
            }

            const invalidRequired = payload.CAUSE4M_LIST.some(row => {
                return !String(row.CAUSE || '').trim()
                    || !String(row.DETAIL || '').trim()
                    || !String(row.DUE_DATE || '').trim()
                    || !String(row.PIC || '').trim();
            });

            if (invalidRequired) {
                await Swal.fire({
                    icon: 'warning',
                    title: 'กรุณากรอก Cause 4M ให้ครบทุกช่อง',
                    confirmButtonText: 'ตกลง',
                });
                return false;
            }

            const invalidDate = payload.CAUSE4M_LIST.some(row => !this.isValidDateDMY(row.DUE_DATE));

            if (invalidDate) {
                await Swal.fire({
                    icon: 'warning',
                    title: 'กรุณากรอก Due Date เป็นรูปแบบ dd/mm/yyyy',
                    confirmButtonText: 'ตกลง',
                });
                return false;
            }

            return payload;
        },
    };

    let isSubmitting = false;

    VIEW.init().then(() => {
        initCause4MDatePicker();
    });

    $(".btn-submit").on("click", async function () {
        if (isSubmitting) return;

        const $btn = $(this);
        const action = $btn.data("action");
        const empno = $('#empno').val() || '';
        const exdata = $('#txt_exdata').val() || '';
        const remark = $('#remark').val()?.trim() || '';

        if ((action === 'reject' || action === 'returnb') && !remark) {
            await Swal.fire({
                icon: 'warning',
                title: '⚠ กรุณากรอก Remark ก่อนทำรายการ',
                confirmButtonText: 'ตกลง',
            });
            return;
        }

        isSubmitting = true;

        try {
            const confirmResult = await Swal.fire({
                icon: 'question',
                title: 'ยืนยันการทำรายการ',
                html: `ต้องการ ${String(action).toUpperCase()} ใช่หรือไม่ ?`,
                showCancelButton: true,
                confirmButtonText: 'ยืนยัน',
                cancelButtonText: 'ยกเลิก',
            });

            if (!confirmResult.isConfirmed) return;

            let cause4MPayload = null;
            if (VIEW.canEditCause4M && action === 'approve') {
                cause4MPayload = await VIEW.validateCause4M();
                if (!cause4MPayload) return;
            }

            $('.btn-submit').prop('disabled', true).addClass('opacity-50 pointer-events-none');

            showLoader({ show: true });
            if (cause4MPayload) {
                const saveResult = await updatecause4m(cause4MPayload);
                if (!saveResult?.status) {
                    Swal.close();
                    await Swal.fire({
                        icon: 'error',
                        title: saveResult?.message || 'บันทึก Cause 4M ไม่สำเร็จ',
                        confirmButtonText: 'ตกลง',
                    });
                    showLoader({ show: false });
                    return;
                }
            }

            const result = await doaction({
                ...VIEW.getBasePayload(),
                ACTION: action,
                EMPNO: String(empno),
                REMARK: remark,
                CEXTDATA: exdata,
            });

            console.log('DO ACTION RESULT =', result);
            showLoader({ show: false });

            if (result?.status) {
                await Swal.fire({
                    icon: 'success',
                    title: 'ดำเนินการสำเร็จแล้ว',
                    timer: 1500,
                    showConfirmButton: false,
                });
                
                redirectWebflow();
                return;
            } else {
                await Swal.fire({
                    icon: 'error',
                    title: result?.message || 'เกิดข้อผิดพลาด',
                    confirmButtonText: 'ตกลง',
                });
            }
        } catch (err) {
            console.error(err);
            Swal.close();
            await Swal.fire({
                icon: 'error',
                title: 'ไม่สามารถเชื่อมต่อระบบได้',
                text: err?.message || '',
                confirmButtonText: 'ตกลง',
            });
        } finally {
            showLoader({ show: false });
            isSubmitting = false;
            $('.btn-submit').prop('disabled', false).removeClass('opacity-50 pointer-events-none');
        }
    });

    function addCause4MInputRow() {
        const $tbody = $('#v_cause4m_body');
        const index = $tbody.find('tr.cause4m-row').length + 1;

        $tbody.find('tr.cause4m-add-row').before(VIEW.cause4MRow({
            no: index,
            editable: true,
        }));
        initCause4MDatePicker();
    }

    function reIndexCause4MRows() {
        $('#v_cause4m_body').find('tr.cause4m-row').each(function (index) {
            $(this).find('td:first').text(index + 1);
        });
    }

    $(document).on('click', '.btn-add-cause4m', () => addCause4MInputRow());

    $(document).on('click', '.btn-del-cause4m', function () {
        $(this).closest('tr').remove();
        reIndexCause4MRows();
    });

    function initCause4MDatePicker() {
        $('.cause4m-date').each(function () {
            if (this._flatpickr) {
                this._flatpickr.destroy();
            }

            flatpickr(this, {
                dateFormat: 'd/m/Y',
                allowInput: false,
                clickOpens: true,
            });
        });
    }
});