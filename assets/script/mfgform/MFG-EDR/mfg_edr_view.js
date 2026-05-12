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


$(document).ready(function () {
    const VIEW = {
        async init() {await this.loadData();},
        async loadData() {
            try {
                const payload = {
                    NFRMNO: $('#nfrmno').val(),
                    VORGNO: $('#vorgno').val(),
                    CYEAR: $('#cyear').val(),
                    CYEAR2: $('#cyear2').val(),
                    NRUNNO: $('#nrunno').val(),
                };

                console.log('PAYLOAD =', payload);
                const res = await getmfgedr(payload);
                console.log('GET MFG EDR =', res);

                if (!res?.status) {
                    alert(res?.message || 'Data not found');
                    return;
                }

                this.renderHeader(res.head || {});
                this.renderDetail(res.detail || []);
                this.renderRoot(res.rootcause || []);
                this.renderCorrective(res.corrective || []);
                this.renderPreventive(res.preventive || []);

            } catch (err) {
                console.error(err);
                alert('Load data failed');
            }
        },

        renderHeader(head) {

            $('#v_form_no').text(head.FORM_NO || '-');
            $('#v_create_by').text(head.CREATE_BY || '-');
            $('#v_request_by').text(head.REQUEST_BY || '-');
            $('#v_daily_no').text(head.DAILY_NO || '-');

            $('#v_worktype').text(head.WORKTYPE || '-');
            $('#v_sec_code').text(head.SEC_CODE || '-');

            $('#v_repair_by').text(head.REPAIR_BY || '-');
            $('#v_cause').text(head.CAUSE || '-');

            $('#v_remark').text(head.REMARK || '-');

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
                            <td>${row.PROJECTNO || '-'}</td>
                            <td>${row.PRODJUN || '-'}</td>
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

            const $tbody = $('#v_root_body');

            $tbody.empty();

            if (!list.length) {

                $tbody.html(`
                    <tr>
                        <td colspan="2" class="text-center">No data</td>
                    </tr>
                `);

                return;
            }

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

            const $tbody = $('#v_corrective_body');

            $tbody.empty();

            if (!list.length) {

                $tbody.html(`
                    <tr>
                        <td colspan="3" class="text-center">No data</td>
                    </tr>
                `);

                return;
            }

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

            const $tbody = $('#v_preventive_body');

            $tbody.empty();

            if (!list.length) {

                $tbody.html(`
                    <tr>
                        <td colspan="3" class="text-center">No data</td>
                    </tr>
                `);

                return;
            }

            list.forEach((row, index) => {

                $tbody.append(`
                    <tr>
                        <td class="text-center">${index + 1}</td>
                        <td>${row.ACTION_DETAIL || '-'}</td>
                        <td class="text-center">${row.TARGET_DATE || '-'}</td>
                    </tr>
                `);

            });

        }

    };

    VIEW.init();

});