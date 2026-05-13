import {
    getmfgedr
} from './data.js';
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
        async init() {await this.loadData();},
        async loadData() {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const getVal = function (inputId, paramNames = []) {
                    const inputVal = $.trim($(inputId).val());
                    if (inputVal) { return inputVal;}
                    for (const name of paramNames) {
                        const val = $.trim(urlParams.get(name) || '');
                        if (val) {return val; }
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
                this.applyWhyPermission(data.flow || []);
                this.renderDetail(data.list || []);
                this.renderRoot(data.why || []);
                this.renderCorrective(data.corrective || []);
                this.renderPreventive(data.preventive || []);
            } catch (err) {
                console.error(err);
                alert('Load data failed');
            }
        },
        renderForm(form) {
            $('#v_request_by').text(form.REQ_EMPNO  + '_' + form.REQ_NAME );
            $('#v_create_by').text(form.INP_EMPNO  + '_' + form.INP_NAME );
            this.ssec = String(form.REQ_SEC || '').trim().substring(0, 3);
            this.cyear2 = String(form.CYEAR2 || '').slice(-2);
        },
        renderHeader(head) {
            const runno = String(head.DAILY_RUNNO || 0).padStart(3, '0');
            const dailyno = this.ssec + '-' + head.DAILY_MONTH +'-' + this.cyear2 + runno || '-';
            //const dailyno = [this.ssec,head.DAILY_MONTH,`${this.cyear2}${runno}`].join('-');

            $('#v_daily_no').text(dailyno);
            $('#v_worktype').text(head.TYPENAME || '-');
            $('#v_repair_by').text(head.REPAIR_BY  + '_' + head.REPAIR_BY_NAME|| '-');
            $('#v_cause').text(head.CAUSE + '_' + head.CAUSENAME|| '-');

            // ===== FILE =====
            const $fileList = $('#v_file_list');
            $fileList.empty();
            if (head.FILES?.length) {
                head.FILES.forEach(file => {
                    $fileList.append(`
                        <a href="${file.FILE_PATH}" target="_blank">
                            ${file.FILE_NAME}
                        </a>
                    `);
                });

            } else {
                $fileList.html('-');
            }

        },

        renderDetail(list) {
            const $colgroup = $('#v_detail_colgroup');
            $colgroup.empty();
            const $thead = $('#v_detail_head');
            const $tbody = $('#v_detail_body');
            $thead.empty();
            $tbody.empty();
            if (!list.length) {
                return;
            }

            // ===== PCB / NORMAL =====
            const isPCB = !!list[0]?.LINE_NAME;
            if (isPCB) {
                $colgroup.html(`
                    <col style="width: 50px;">
                    <col style="width: 180px;">
                    <col style="width: 120px;">
                    <col style="width: 140px;">
                    <col style="width: 120px;">
                    <col style="width: 120px;">
                    <col style="width: 120px;">
                    <col style="width: 70px;">
                    <col style="width: 300px;">
                    <col style="width: 140px;">
                    <col style="width: 300px;">
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
                        <th>Effect Level</th>
                        <th>Effect</th>
                    </tr>
                `);

                list.forEach((row, index) => {
                    $tbody.append(`
                        <tr>
                            <td class="text-center">${index + 1}</td>
                            <td>${row.DWGNO || '-'}</td>
                            <td>${row.LINE_NAME || '-'}</td>
                            <td>${row.PROCESS_NAME || '-'}</td>
                            <td>${row.LOT || '-'}</td>
                            <td>${row.SERIAL || '-'}</td>
                            <td>${row.PRODJUN || '-'}</td>
                            <td class="text-center">${row.QTY || '-'}</td>
                            <td class="text-left">${row.DETAIL || '-'}</td>
                            <td class="text-center">
                                ${this.canEditWhy ? this.effectLvInput(row.LV_EFFECT || '') : (row.LV_EFFECT || '-')}
                            </td>
                            <td class="text-left">
                                ${this.canEditWhy ? this.effectInput(row.EFFECT || '') : (row.EFFECT || '-')}
                            </td>
                        </tr>
                    `);
                });

            } else {
                $colgroup.html(`
                    <col style="width: 50px;">
                    <col style="width: 140px;">
                    <col style="width: 180px;">
                    <col style="width: 160px;">
                    <col style="width: 120px;">
                    <col style="width: 80px;">
                    <col style="width: 100px;">
                    <col style="width: 70px;">
                    <col style="width: 300px;">
                    <col style="width: 140px;">
                    <col style="width: 300px;">
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
                        <th>Effect Level</th>
                        <th>Effect</th>
                    </tr>
                `);

                list.forEach((row, index) => {

                    $tbody.append(`
                        <tr>
                            <td class="text-center">${index + 1}</td>
                            <td>${row.ORDERNO || '-'}</td>
                            <td>${row.DWGNO || '-'}</td>
                            <td>${row.PRJ_NO || '-'}</td>
                            <td>${row.PROD || '-'}</td>
                            <td>${row.ITEM || '-'}</td>
                            <td>${row.MODEL || '-'}</td>
                            <td class="text-center">${row.QTY || '-'}</td>
                            <td class="text-left">${row.DETAIL || '-'}</td>
                            <td class="text-center">
                                ${this.canEditWhy ? this.effectLvInput(row.LV_EFFECT || '') : (row.LV_EFFECT || '-')}
                            </td>
                            <td class="text-left">
                                ${this.canEditWhy ? this.effectInput(row.EFFECT || '') : (row.EFFECT || '-')}
                            </td>
                        </tr>
                    `);

                });

            }

        },

        getWhyOwnerFlow(flow = []) {
            const prioritySteps = ['07', '19', '18'];
            return prioritySteps.map(step => flow.find(x => String(x.CSTEPNO).padStart(2, '0') === step)).find(Boolean) || null;
        },

        canEditWhySection(flow = []) {
            const ownerFlow = this.getWhyOwnerFlow(flow);
            const empno = String($('#empno').val() || '');

            if (!ownerFlow || !empno) {
                return false;
            }

            const vapvno = String(ownerFlow.VAPVNO || '');
            const vrepno = String(ownerFlow.VREPNO || '');

            return vapvno === empno || vrepno === empno;
        },

        applyWhyPermission(flow = []) {
            const ownerFlow = this.getWhyOwnerFlow(flow);
            const canEdit = this.canEditWhySection(flow);
            this.canEditWhy = canEdit;

            console.log('WHY OWNER FLOW =', ownerFlow);
            console.log('CAN EDIT WHY =', canEdit);
        },

        renderRoot(list) {
            this.renderTextTable({
                list, zone: '#zone_why', body: '#v_root_body',
                type: 'why', detailKey: 'WHY_DETAIL',
                detailName: 'WHY_DETAIL[]', hasDate: false,
            });
        },

        renderCorrective(list) {
            this.renderTextTable({
                list, zone: '#zone_corrective', body: '#v_corrective_body',
                type: 'corrective', detailKey: 'ACTION_DETAIL',
                detailName: 'CORRECTIVE_DETAIL[]',
                dateName: 'CORRECTIVE_TARGET_DATE[]',
                hasDate: true,
            });
        },

        renderPreventive(list) {
            this.renderTextTable({
                list, zone: '#zone_preventive', body: '#v_preventive_body',
                type: 'preventive', detailKey: 'ACTION_DETAIL',
                detailName: 'PREVENTIVE_DETAIL[]',
                dateName: 'PREVENTIVE_TARGET_DATE[]',
                hasDate: true,
            });
        },

        renderTextTable({ list, zone, body, type, detailKey, detailName, dateName = '', hasDate = false }) {
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
                    date: row.TARGET_DATE || '',
                    detailName,
                    dateName,
                    hasDate,
                    isNew: false,
                }));
            });

            if (this.canEditWhy) {
                $tbody.append(this.addRow(type, hasDate));
            }
        },

        textRow({ type, no, detail = '', date = '', detailName, dateName = '', hasDate = false, isNew = true }) {
            return `
                <tr class="${type}-row">
                    <td class="text-center align-top w-[60px]">${no}</td>
                    <td class="align-top p-2">
                        <textarea name="${detailName}"
                            class="w-full min-h-[80px] rounded-lg border border-slate-300 px-3 py-2 text-sm resize-y outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            rows="3">${detail}</textarea>
                    </td>
                    ${hasDate ? `
                        <td class="align-top p-2 w-[170px]">
                            <input type="date" name="${dateName}"
                                value="${date ? String(date).substring(0, 10) : ''}"
                                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100">
                        </td>
                    ` : ''}
                    <td class="text-center align-top w-[60px] p-2">
                        ${isNew ? `
                            <button type="button"
                                class="btn-del-${type} rounded-full bg-red-500 px-3 py-2 text-xs font-extrabold text-white shadow hover:bg-red-600">
                                🗑
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        },

        addRow(type, hasDate = false) {
            return `
                <tr class="${type}-add-row">
                    <td colspan="${hasDate ? 4 : 3}" class="text-center py-3">
                        <button type="button"
                            class="btn-add-${type} inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold shadow hover:bg-emerald-700 transition">
                            <i class="bi bi-plus-circle"></i>
                            Add Row
                        </button>
                    </td>
                </tr>
            `;
        },

        effectLvInput(value = '') {
            return `
                <select name="LV_EFFECT[]"
                    class="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm">
                    <option value="" ${value === '' ? 'selected' : ''}>-- select --</option>
                    <option value="Low" ${value === 'Low' ? 'selected' : ''}>Low</option>
                    <option value="Medium" ${value === 'Medium' ? 'selected' : ''}>Medium</option>
                    <option value="High" ${value === 'High' ? 'selected' : ''}>High</option>
                </select>
            `;
        },

        effectInput(value = '') {
            return `
                <textarea name="EFFECT[]"
                    rows="2"
                    class="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm resize-y">${value}</textarea>
            `;
        },

    };
    VIEW.init();

    $(".btn-submit").on("click", async function () {
        const action = $(this).data("action");
        const payload = {
            NFRMNO: $('#nfrmno').val(),
            VORGNO: $('#vorgno').val(),
            CYEAR: $('#cyear').val(),
            CYEAR2: $('#cyear2').val(),
            NRUNNO: $('#nrunno').val(),
        };

        const empno = $('#empno').val() || '';
        const exdata = $('#txt_exdata').val() || '';
        const remark = $('#remark').val()?.trim() || '';
        if ((action === 'reject' || action === 'returnE') && !remark) {
            Swal.fire({
                icon: 'warning',
                title: '⚠ กรุณากรอก Remark ก่อนทำรายการ',
            });
            return;
        }

        try {
            const confirmResult = await Swal.fire({
                icon: 'question',
                title: 'ยืนยันการทำรายการ',
                html: `ต้องการ ${action.toUpperCase()} ใช่หรือไม่ ?`,
                showCancelButton: true,
                confirmButtonText: 'ยืนยัน',
                cancelButtonText: 'ยกเลิก',
            });

            if (!confirmResult.isConfirmed) {
                return;
            }
            const result = await doaction({
                ...payload,
                ACTION: action,
                EMPNO: String(empno),
                REMARK: remark,
                CEXTDATA: exdata,
            });

            console.log('DO ACTION RESULT =', result);
            if (result?.status) {
                await Swal.fire({
                    icon: 'success',
                    title: 'ดำเนินการสำเร็จแล้ว',
                    timer: 1500,
                    showConfirmButton: false,
                });
                redirectWebflow();

            } else {
                Swal.fire({
                    icon: 'error',
                    title: result?.message || 'เกิดข้อผิดพลาด',
                });
            }

        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'ไม่สามารถเชื่อมต่อระบบได้',
                text: err?.message || '',
            });
        }
    });

    const rowConfig = {
        why: {
            body: '#v_root_body',
            detailName: 'WHY_DETAIL[]',
            hasDate: false,
        },
        corrective: {
            body: '#v_corrective_body',
            detailName: 'CORRECTIVE_DETAIL[]',
            dateName: 'CORRECTIVE_TARGET_DATE[]',
            hasDate: true,
        },
        preventive: {
            body: '#v_preventive_body',
            detailName: 'PREVENTIVE_DETAIL[]',
            dateName: 'PREVENTIVE_TARGET_DATE[]',
            hasDate: true,
        },
    };

    function addInputRow(type) {
        const cfg = rowConfig[type];
        const $tbody = $(cfg.body);
        const index = $tbody.find(`tr.${type}-row`).length + 1;

        $tbody.find(`tr.${type}-add-row`).before(VIEW.textRow({
            type,
            no: index,
            detailName: cfg.detailName,
            dateName: cfg.dateName,
            hasDate: cfg.hasDate,
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