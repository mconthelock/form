import { getmfgedr, updateWhyEffect } from './data.js';
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
        canEditWhy: false,
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
                this.applyWhyPermission(data.flow || []);
                this.renderDetail(data.list || []);
                this.renderRoot(data.why || []);
                this.renderCorrective(data.corrective || []);
                this.renderPreventive(data.preventive || []);
            } catch (err) {
                showLoader({ show: false });
                console.error(err);
                alert('Load data failed');
            }finally {
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
            const commonCols = `<col style="width:50px;"><col style="width:140px;"><col style="width:300px;"><col style="width:140px;"><col style="width:300px;">`;

            if (isPCB) {
                $colgroup.html(`<col style="width:50px;"><col style="width:180px;"><col style="width:120px;"><col style="width:140px;"><col style="width:120px;"><col style="width:120px;"><col style="width:120px;"><col style="width:70px;"><col style="width:300px;"><col style="width:140px;"><col style="width:300px;">`);
                $thead.html(`<tr class="bg-gradient-to-r from-emerald-900 to-teal-700 text-white"><th>#</th><th>Drawing No</th><th>Line</th><th>Process</th><th>Lot</th><th>Serial</th><th>Prod Jun</th><th>Qty</th><th>Detail of problem</th><th>Effect Level</th><th>Effect</th></tr>`);

                list.forEach((row, index) => {
                    $tbody.append(`
                        <tr data-id="${row.ID}">
                            <td class="text-center">${index + 1}</td>
                            <td>${row.DWGNO || '-'}</td>
                            <td>${row.LINE_NAME || row.LINE || '-'}</td>
                            <td>${row.PROCESS_NAME || row.PROCESS || '-'}</td>
                            <td>${row.LOT || '-'}</td>
                            <td>${row.SERIAL || '-'}</td>
                            <td>${row.PROD || '-'}</td>
                            <td class="text-center">${row.QTY || '-'}</td>
                            <td class="text-left">${row.DETAIL || '-'}</td>
                            <td class="text-center">${this.canEditWhy ? this.effectLvInput(row.LV_EFFECT || '') : (row.LV_EFFECT || '-')}</td>
                            <td class="text-left">${this.canEditWhy ? this.effectInput(row.EFFECT || '') : (row.EFFECT || '-')}</td>
                        </tr>
                    `);
                });
                return;
            }

            $colgroup.html(`<col style="width:50px;"><col style="width:140px;"><col style="width:180px;"><col style="width:160px;"><col style="width:120px;"><col style="width:80px;"><col style="width:100px;"><col style="width:70px;"><col style="width:300px;"><col style="width:140px;"><col style="width:300px;">`);
            $thead.html(`<tr class="bg-gradient-to-r from-emerald-900 to-teal-700 text-white"><th>#</th><th>Order No</th><th>Drawing No</th><th>Project No</th><th>Prod Jun</th><th>Item</th><th>Model</th><th>Qty</th><th>Detail of problem</th><th>Effect Level</th><th>Effect</th></tr>`);

            list.forEach((row, index) => {
                $tbody.append(`
                    <tr data-id="${row.ID}">
                        <td class="text-center">${index + 1}</td>
                        <td>${row.ORDERNO || '-'}</td>
                        <td>${row.DWGNO || '-'}</td>
                        <td>${row.PRJ_NO || '-'}</td>
                        <td>${row.PROD || '-'}</td>
                        <td>${row.ITEM || '-'}</td>
                        <td>${row.MODEL || '-'}</td>
                        <td class="text-center">${row.QTY || '-'}</td>
                        <td class="text-left">${row.DETAIL || '-'}</td>
                        <td class="text-center">${this.canEditWhy ? this.effectLvInput(row.LV_EFFECT || '') : (row.LV_EFFECT || '-')}</td>
                        <td class="text-left">${this.canEditWhy ? this.effectInput(row.EFFECT || '') : (row.EFFECT || '-')}</td>
                    </tr>
                `);
            });
        },

        getWhyOwnerFlow(flow = []) {
            const prioritySteps = ['07', '19', '18'];
            return prioritySteps
                .map(step => flow.find(x => String(x.CSTEPNO).padStart(2, '0') === step))
                .find(Boolean) || null;
        },

        canEditWhySection(flow = []) {
            const mode = String($('#mode').val() || '');
            if (mode !== '2') return false;

            const ownerFlow = this.getWhyOwnerFlow(flow);
            const empno = String($('#empno').val() || '');
            if (!ownerFlow || !empno) return false;

            return String(ownerFlow.VAPVNO || '') === empno || String(ownerFlow.VREPNO || '') === empno;
        },

        applyWhyPermission(flow = []) {
            const ownerFlow = this.getWhyOwnerFlow(flow);
            this.canEditWhy = this.canEditWhySection(flow);

            console.log('WHY OWNER FLOW =', ownerFlow);
            console.log('CAN EDIT WHY =', this.canEditWhy);

            const method = this.canEditWhy ? 'show' : 'hide';
            $('.col-action-why')[method]();
            $('.col-action-corrective')[method]();
            $('.col-action-preventive')[method]();
            
            $('[data-action="returnb"]').toggle(!this.canEditWhy);
        },

        renderRoot(list) {
            this.renderTextTable({
                list,
                zone: '#zone_why',
                body: '#v_root_body',
                type: 'why',
                detailKey: 'WHY',
                detailName: 'WHY_DETAIL[]',
            });
        },

        renderCorrective(list) {
            this.renderTextTable({
                list,
                zone: '#zone_corrective',
                body: '#v_corrective_body',
                type: 'corrective',
                detailKey: 'CORRECTIVE',
                detailName: 'CORRECTIVE_DETAIL[]',
                dateKey: 'DUE_DATE',
                dateName: 'CORRECTIVE_TARGET_DATE[]',
                picKey: 'PIC',
                picName: 'CORRECTIVE_PIC[]',
                hasDate: true,
                hasPic: true,
            });
        },

        renderPreventive(list) {
            this.renderTextTable({
                list,
                zone: '#zone_preventive',
                body: '#v_preventive_body',
                type: 'preventive',
                detailKey: 'PREVENTIVE',
                detailName: 'PREVENTIVE_DETAIL[]',
                dateKey: 'DUE_DATE',
                dateName: 'PREVENTIVE_TARGET_DATE[]',
                picKey: 'PIC',
                picName: 'PREVENTIVE_PIC[]',
                hasDate: true,
                hasPic: true,
            });
        },

        renderTextTable({
            list,
            zone,
            body,
            type,
            detailKey,
            detailName,
            dateKey = '',
            dateName = '',
            picKey = '',
            picName = '',
            hasDate = false,
            hasPic = false,
        }) {
            const $zone = $(zone);
            const $tbody = $(body).empty();

            if (!list.length && !this.canEditWhy) {
                $zone.hide();
                return;
            }

            $zone.show();

            list.forEach((row, i) => {
                $tbody.append(this.textRow({
                    type,
                    no: i + 1,
                    detail: row[detailKey] || '',
                    date: dateKey ? (row[dateKey] || '') : '',
                    pic: picKey ? (row[picKey] || '') : '',
                    detailName,
                    dateName,
                    picName,
                    hasDate,
                    hasPic,
                    isNew: this.canEditWhy,
                    editable: this.canEditWhy,
                }));
            });

            if (this.canEditWhy) $tbody.append(this.addRow(type, hasDate, hasPic));
        },

        textRow({
            type,
            no,
            detail = '',
            date = '',
            pic = '',
            detailName,
            dateName = '',
            picName = '',
            hasDate = false,
            hasPic = false,
            isNew = true,
            editable = true,
        }) {
            const detailHtml = editable
                ? `<textarea name="${detailName}" class="w-full min-h-[80px] rounded-lg border border-slate-300 px-3 py-2 text-sm resize-y outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" rows="3">${detail}</textarea>`
                : `<div class="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">${detail || '-'}</div>`;

            const dateHtml = !hasDate ? '' : editable
                ? `<td class="align-top p-2 w-[170px]"><input type="date" name="${dateName}" value="${date ? String(date).substring(0, 10) : ''}" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"></td>`
                : `<td class="align-top p-2 w-[170px] text-center text-sm text-slate-700">${date ? String(date).substring(0, 10) : '-'}</td>`;

            const picHtml = !hasPic ? '' : editable
                ? `<td class="align-top p-2 w-[220px]"><input type="text" name="${picName}" value="${pic || ''}" maxlength="50" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"></td>`
                : `<td class="align-top p-2 w-[220px] text-sm text-slate-700">${pic || '-'}</td>`;

            const actionHtml = editable && isNew
                ? `<button type="button" class="btn-del-${type} rounded-full bg-red-500 px-3 py-2 text-xs font-extrabold text-white shadow hover:bg-red-600">🗑</button>`
                : '';

            return `
                <tr class="${type}-row">
                    <td class="text-center align-top w-[60px]">${no}</td>
                    <td class="align-top p-2">${detailHtml}</td>
                    ${dateHtml}
                    ${picHtml}
                    ${editable
                        ? `<td class="text-center align-top w-[60px] p-2 col-action-${type}">
                                ${actionHtml}
                        </td>`
                        : ''
                    }
                </tr>
            `;
        },

        addRow(type, hasDate = false, hasPic = false) {
            const colspan = 3 + (hasDate ? 1 : 0) + (hasPic ? 1 : 0);
            return `
                <tr class="${type}-add-row">
                    <td colspan="${colspan}" class="text-center py-3">
                        <button type="button" class="btn-add-${type} inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold shadow hover:bg-emerald-700 transition">
                            <i class="bi bi-plus-circle"></i>Add Row
                        </button>
                    </td>
                </tr>
            `;
        },

        effectLvInput(value = '') {
            return `
                <select name="LV_EFFECT[]" class="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm">
                    <option value="" ${value === '' ? 'selected' : ''}>-- select --</option>
                    <option value="Low" ${value === 'Low' ? 'selected' : ''}>Low</option>
                    <option value="Medium" ${value === 'Medium' ? 'selected' : ''}>Medium</option>
                    <option value="High" ${value === 'High' ? 'selected' : ''}>High</option>
                </select>
            `;
        },

        effectInput(value = '') {
            return `<textarea name="EFFECT[]" rows="2" class="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm resize-y">${value}</textarea>`;
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

        getWhyEffectPayload() {
            return {
                ...this.getBasePayload(),
                UPDATE_BY: $('#empno').val(),
                DETAIL_LIST: $('#v_detail_body tr').map(function () {
                    const $tr = $(this);
                    return {
                        ID: Number($tr.data('id')),
                        LV_EFFECT: $tr.find('[name="LV_EFFECT[]"]').val() || null,
                        EFFECT: $tr.find('[name="EFFECT[]"]').val()?.trim() || null,
                    };
                }).get().filter(x => x.ID),

                WHY_LIST: $('#v_root_body tr.why-row').map(function () {
                    return {
                        WHY: $(this).find('[name="WHY_DETAIL[]"]').val()?.trim() || null,
                    };
                }).get().filter(x => x.WHY),

                CORRECTIVE_LIST: $('#v_corrective_body tr.corrective-row').map(function () {
                    return {
                        CORRECTIVE: $(this).find('[name="CORRECTIVE_DETAIL[]"]').val()?.trim() || null,
                        DUE_DATE: $(this).find('[name="CORRECTIVE_TARGET_DATE[]"]').val() || null,
                        PIC: $(this).find('[name="CORRECTIVE_PIC[]"]').val()?.trim() || null,
                    };
                }).get().filter(x => x.CORRECTIVE),

                PREVENTIVE_LIST: $('#v_preventive_body tr.preventive-row').map(function () {
                    return {
                        PREVENTIVE: $(this).find('[name="PREVENTIVE_DETAIL[]"]').val()?.trim() || null,
                        DUE_DATE: $(this).find('[name="PREVENTIVE_TARGET_DATE[]"]').val() || null,
                        PIC: $(this).find('[name="PREVENTIVE_PIC[]"]').val()?.trim() || null,
                    };
                }).get().filter(x => x.PREVENTIVE),
            };
        },

        async validateWhyEffect() {
            const payload = this.getWhyEffectPayload();
            const invalidEffect = payload.DETAIL_LIST.some(x =>!String(x.LV_EFFECT || '').trim() || !String(x.EFFECT || '').trim());

            if (invalidEffect) {
                await Swal.fire({
                    icon: 'warning',
                    title: 'กรุณากรอก Effect Level และ Effect ให้ครบทุกแถว',
                    confirmButtonText: 'ตกลง',
                });
                return false;
            }

            const invalidWhy = $('#v_root_body tr.why-row').toArray().some(row =>!String($(row).find('[name="WHY_DETAIL[]"]').val() || '').trim());
            if (invalidWhy) {
                await Swal.fire({
                    icon: 'warning',
                    title: 'กรุณากรอก Why ให้ครบทุกแถว',
                    confirmButtonText: 'ตกลง',
                });
                return false;
            }

            const invalidCorrective = $('#v_corrective_body tr.corrective-row').toArray().some(row => {
                const $row = $(row);
                return !String($row.find('[name="CORRECTIVE_DETAIL[]"]').val() || '').trim()
                    || !String($row.find('[name="CORRECTIVE_TARGET_DATE[]"]').val() || '').trim()
                    || !String($row.find('[name="CORRECTIVE_PIC[]"]').val() || '').trim();
            });

            if (invalidCorrective) {
                await Swal.fire({
                    icon: 'warning',
                    title: 'กรุณากรอก Corrective, กำหนดเสร็จ และผู้รับผิดชอบ ให้ครบทุกแถว',
                    confirmButtonText: 'ตกลง',
                });
                return false;
            }

            const invalidPreventive = $('#v_preventive_body tr.preventive-row').toArray().some(row => {
                const $row = $(row);
                return !String($row.find('[name="PREVENTIVE_DETAIL[]"]').val() || '').trim()
                    || !String($row.find('[name="PREVENTIVE_TARGET_DATE[]"]').val() || '').trim()
                    || !String($row.find('[name="PREVENTIVE_PIC[]"]').val() || '').trim();
            });

            if (invalidPreventive) {
                await Swal.fire({
                    icon: 'warning',
                    title: 'กรุณากรอก Preventive, กำหนดเสร็จ และผู้รับผิดชอบ ให้ครบทุกแถว',
                    confirmButtonText: 'ตกลง',
                });
                return false;
            }

            const hasAnyAction =
                payload.WHY_LIST.length > 0 ||
                payload.CORRECTIVE_LIST.length > 0 ||
                payload.PREVENTIVE_LIST.length > 0;

            if (!hasAnyAction) {
                await Swal.fire({
                    icon: 'warning',
                    title: 'กรุณากรอก Why / Corrective / Preventive อย่างน้อย 1 รายการ',
                    confirmButtonText: 'ตกลง',
                });
                return false;
            }

            return payload;
        },

        
    };

    const rowConfig = {
        why: {
            body: '#v_root_body',
            detailName: 'WHY_DETAIL[]',
            hasDate: false,
            hasPic: false,
        },
        corrective: {
            body: '#v_corrective_body',
            detailName: 'CORRECTIVE_DETAIL[]',
            dateName: 'CORRECTIVE_TARGET_DATE[]',
            picName: 'CORRECTIVE_PIC[]',
            hasDate: true,
            hasPic: true,
        },
        preventive: {
            body: '#v_preventive_body',
            detailName: 'PREVENTIVE_DETAIL[]',
            dateName: 'PREVENTIVE_TARGET_DATE[]',
            picName: 'PREVENTIVE_PIC[]',
            hasDate: true,
            hasPic: true,
        },
    };

    let isSubmitting = false;

    VIEW.init();

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

            let whyPayload = null;
            if (VIEW.canEditWhy) {
                whyPayload = await VIEW.validateWhyEffect();
                if (!whyPayload) return;
            }

            $('.btn-submit').prop('disabled', true).addClass('opacity-50 pointer-events-none');

            showLoader({ show: true });
            if (whyPayload) {
                const saveResult = await updateWhyEffect(whyPayload);
                if (!saveResult?.status) {
                    Swal.close();
                    await Swal.fire({
                        icon: 'error',
                        title: saveResult?.message || 'บันทึก Why / Effect ไม่สำเร็จ',
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
            Swal.close();

            if (result?.status) {
                await Swal.fire({
                    icon: 'success',
                    title: 'ดำเนินการสำเร็จแล้ว',
                    timer: 1500,
                    showConfirmButton: false,
                });
                
                redirectWebflow();
                showLoader({ show: false });
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

    function addInputRow(type) {
        const cfg = rowConfig[type];
        const $tbody = $(cfg.body);
        const index = $tbody.find(`tr.${type}-row`).length + 1;

        $tbody.find(`tr.${type}-add-row`).before(VIEW.textRow({
            type,
            no: index,
            detailName: cfg.detailName,
            dateName: cfg.dateName,
            picName: cfg.picName,
            hasDate: cfg.hasDate,
            hasPic: cfg.hasPic,
            isNew: true,
        }));
    }

    function reIndexRows(type) {
        const cfg = rowConfig[type];
        $(cfg.body).find(`tr.${type}-row`).each(function (index) {
            $(this).find('td:first').text(index + 1);
        });
    }

    $(document).on('click', '.btn-add-why', () => addInputRow('why'));
    $(document).on('click', '.btn-add-corrective', () => addInputRow('corrective'));
    $(document).on('click', '.btn-add-preventive', () => addInputRow('preventive'));

    $(document).on('click', '.btn-del-why', function () {
        $(this).closest('tr').remove();
        reIndexRows('why');
    });

    $(document).on('click', '.btn-del-corrective', function () {
        $(this).closest('tr').remove();
        reIndexRows('corrective');
    });

    $(document).on('click', '.btn-del-preventive', function () {
        $(this).closest('tr').remove();
        reIndexRows('preventive');
    });
});