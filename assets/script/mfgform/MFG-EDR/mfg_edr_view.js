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
        },
        renderHeader(head) {
            $('#v_daily_no').text(head.DAILY_NO || '-');
            $('#v_worktype').text(head.TYPENAME || '-');
            $('#v_repair_by').text(head.REPAIR_BY  + '_' + head.REPAIR_BY_NAME|| '-');
            $('#v_cause').text(head.CAUSE + '_' + head.CAUSENAME|| '-');
            $('#v_remark').text(head.REMARK || '');

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
                        <th>Detail</th>
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
                        </tr>
                    `);

                });

            } else {

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
                        <th>Detail</th>
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
                        </tr>
                    `);

                });

            }

        },

        renderRoot(list) {
            const $zone = $('#zone_why');
            const $tbody = $('#v_root_body');
            $tbody.empty();
            if (!list.length) {
                $zone.hide();
                return;
            }

            $zone.show();
            list.forEach((row, index) => {
                $tbody.append(`
                    <tr>
                        <td class="text-center">${index + 1}</td>
                        <td>${row.WHY_DETAIL || '-'}</td>
                    </tr>
                `);
            });
        },

        renderCorrective(list) {
            const $zone = $('#zone_corrective');
            const $tbody = $('#v_corrective_body');
            $tbody.empty();
            if (!list.length) {
                $zone.hide();
                return;
            }

            $zone.show();
            list.forEach((row, index) => {
                $tbody.append(`
                    <tr>
                        <td class="text-center">${index + 1}</td>
                        <td>${row.ACTION_DETAIL || '-'}</td>
                        <td class="text-center">${row.TARGET_DATE || '-'}</td>
                    </tr>
                `);
            });
        },

        renderPreventive(list) {
            const $zone = $('#zone_preventive');
            const $tbody = $('#v_preventive_body');

            $tbody.empty();
            if (!list.length) {
                $zone.hide();
                return;
            }

            $zone.show();
            list.forEach((row, index) => {
                $tbody.append(`
                    <tr>
                        <td class="text-center">${index + 1}</td>
                        <td>${row.ACTION_DETAIL || '-'}</td>
                        <td class="text-center">${row.TARGET_DATE || '-'}</td>
                    </tr>
                `);
            });
        },

    };

    VIEW.init();

});