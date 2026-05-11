import {
    getcause,
    getworktype,
    getUserbyemp,
    getprocess,
    getline,
    getamecorderdetail,
    createMfgEdr,
    updateMfgEdrDetail
} from "./data.js";
import { showLoader } from "@amec/webasset/preloader";
import { showMessage, showConfirm } from "@amec/webasset/utils";
import { createTable } from "@amec/webasset/dataTable";
import { downloadOrOpenFile } from "@amec/webasset/api/file";
import { setDatePicker } from "@amec/webasset/flatpickr";
import { createBtn, activatedBtn } from "@amec/webasset/components/buttons";
import { createForm } from "@amec/webasset/api/webform";

$(document).ready(function () {
    const EDR = {
        rowIndex: 0,
        currentTableType: null,
        baseUrl: $('#base_url').val() || '',

        init: function () {
            this.bindEvents();
            this.currentTableType = this.getCurrentTableType();
            this.renderTableHeader();
            this.addRow();
            this.loadMaster();
            this.initReqno();
        },

        initReqno: function () {
            const empno = $.trim($('#inputBy').val());
            const $target = $('#input_name');
            getUserbyemp(empno).then(function (user) {
                const empName = user?.SEMPNO + ' - ' + user?.SNAME;
                $target.removeClass('text-red-500 text-slate-500').addClass('text-emerald-700').text(empName);
            });
        },

        bindEvents: function () {
            $('#btnAddRow').on('click', function (e) {
                e.preventDefault();
                EDR.addRow();
            });

            $(document).on('click', '.btnDeleteRow', function (e) {
                e.preventDefault();
                EDR.deleteRow($(this));
            });

            $('#request_by, #repair_by').on('input', function () {
                const val = $(this).val();
                if (val.length === 5) {
                    EDR.checkEmployee($(this));
                } else {
                    const target = $(this).attr('id') === 'request_by'
                        ? '#request_by_name'
                        : '#repair_by_name';
                    $(target).text('');
                }
            });

            $('#job_type').on('change', function () {
                EDR.loadCauseByWorkType($(this).val());
                const newTableType = EDR.getCurrentTableType();

                if (EDR.currentTableType === newTableType) {
                    return;
                }

                EDR.currentTableType = newTableType;
                EDR.renderTableHeader();
                EDR.rebuildDetailRows();
            });

            $('#btnSaveDraft').on('click', function () {
                EDR.submitForm('save_draft');
            });

            $('#btnSendForm').on('click', function () {
                EDR.submitForm('send_form');
            });

            $(document).on('input', 'input[name="order_no[]"]', function () {
                EDR.checkOrderDetail($(this));
            });

            $(document).on('click', '.btnCopyRow', function (e) {
                e.preventDefault();
                EDR.copyRow($(this));
            });
        },

        loadMaster: async function () {
            try {
                const jobTypes = await getworktype();
                const lines = await getline();
                const processes = await getprocess();

                const worktypeOptions = jobTypes.map(function (item) {
                    return {
                        value: item.TID,
                        text: item.TYPENAME
                    };
                });

                this.lineOptions = lines.map(function (item) {
                    return {
                        value: item.LINE_ID || item.LID || item.LINE || item.LINE_CODE,
                        text: item.LINE_NAME || item.LINENAME || item.LINE
                    };
                });

                this.processOptions = processes.map(function (item) {
                    return {
                        value: item.PROCESS_ID || item.PID || item.PROCESS || item.PROCESS_CODE,
                        text: item.PROCESS_NAME || item.PROCESSNAME || item.PROCESS
                    };
                });

                this.renderOptions('#job_type', worktypeOptions);
                this.renderOptions('#cause', []);
            } catch (error) {
                console.error('LOAD MASTER ERROR:', error);
                alert('โหลดข้อมูล Master ไม่สำเร็จ');
            }
        },

        loadCauseByWorkType: async function (tid) {
            const causeGroup = String(tid) === '4' ? 'PCB' : 'ALL';
            try {
                const causes = await getcause({
                    CAUSE_GROUP: causeGroup
                });

                const causeOptions = causes.map(function (item) {
                    return {
                        value: item.CID,
                        text: `(${item.CAUSE}) - ${item.CAUSENAME}`
                    };
                });

                this.renderOptions('#cause', causeOptions);
            } catch (error) {
                console.error('LOAD CAUSE ERROR:', error);
                alert('โหลดข้อมูล Cause ไม่สำเร็จ');
            }
        },

        renderTableHeader: function () {
            const isPCB = this.isPcbWorkType();
            const $table = $('#tblDetail');
            const $thead = $('#tblDetail thead');

            $table.removeClass('tbl-normal tbl-pcb');
            $thead.removeClass('bg-purple-500 bg-purple-600 bg-emerald-700 text-white');

            if (isPCB) {
                $table.addClass('tbl-pcb');
                $thead.addClass('bg-purple-500 text-white');

                $thead.html(`
                    <tr>
                        <th>#</th>
                        <th>Drawing no<span class="req-star">*</span></th>
                        <th>Line<span class="req-star">*</span></th>
                        <th>Process<span class="req-star">*</span></th>
                        <th>Lot<span class="req-star">*</span></th>
                        <th>Serial no<span class="req-star">*</span></th>
                        <th>Prod Jun<span class="req-star">*</span></th>
                        <th>Qty<span class="req-star">*</span></th>
                        <th>Detail of problem</th>
                        <th>Action</th>
                    </tr>
                `);
            } else {
                $table.addClass('tbl-normal');
                $thead.addClass('bg-emerald-700 text-white');

                $thead.html(`
                    <tr>
                        <th>#</th>
                        <th>Order no<span class="req-star">*</span></th>
                        <th>Drawing no<span class="req-star">*</span></th>
                        <th>Project no</th>
                        <th>Prod Jun</th>
                        <th>Item<span class="req-star">*</span></th>
                        <th>Model</th>
                        <th>Qty<span class="req-star">*</span></th>
                        <th>Detail of problem</th>
                        <th>Action</th>
                    </tr>
                `);
            }
        },

        renderOptions: function (selector, data) {
            const $select = $(selector);
            $select.find('option:not(:first)').remove();
            data.forEach(function (item) {
                $select.append(`<option value="${item.value}">${item.text}</option>`);
            });
        },

        addRow: function () {
            this.rowIndex++;
            $('#detailBody').append(this.buildRow(this.rowIndex));
            this.updateTotalRow();
        },

        buildRow: function (index, rowData = {}) {
            if (this.isPcbWorkType()) {
                return this.buildPcbRow(index, rowData);
            }
            return this.buildNormalRow(index, rowData);
        },

        buildNormalRow: function (index, rowData = {}) {
            return `
                <tr class="hover:bg-emerald-50">
                    <td class="row-no border border-slate-300 px-2 py-2 text-center font-bold">${index}</td>

                    <td class="border border-slate-300 px-2 py-2">
                        <input name="order_no[]" class="edr-input" maxlength="9" value="${rowData.order_no || ''}">
                    </td>

                    <td class="border border-slate-300 px-2 py-2">
                        <input name="drawing_no[]" class="edr-input" value="${rowData.drawing_no || ''}">
                    </td>

                    <td class="border border-slate-300 px-2 py-2">
                        <input name="project_no[]" class="edr-input disabled-textbox" readonly value="${rowData.project_no || ''}">
                    </td>

                    <td class="border border-slate-300 px-2 py-2">
                        <input name="prod_jun[]" class="edr-input disabled-textbox" readonly value="${rowData.prod_jun || ''}">
                    </td>

                    <td class="border border-slate-300 px-2 py-2">
                        <input name="item[]" class="edr-input" maxlength="4" value="${rowData.item || ''}">
                    </td>

                    <td class="border border-slate-300 px-2 py-2">
                        <input name="model[]" class="edr-input disabled-textbox" readonly value="${rowData.model || ''}">
                    </td>

                    <td class="border border-slate-300 px-2 py-2">
                        <input name="qty[]" type="number" min="1" class="edr-input" value="${rowData.qty || ''}">
                    </td>

                    <td class="border border-slate-300 px-2 py-2">
                        <textarea name="problem_detail[]" class="edr-input" rows="3">${rowData.problem_detail || ''}</textarea>
                    </td>

                    <td class="border border-slate-300 px-2 py-2 text-center">
                        <button type="button"
                            class="btnDeleteRow rounded-full bg-red-500 px-3 py-2 text-xs font-extrabold text-white shadow hover:bg-red-600">
                            🗑
                        </button>
                    </td>
                </tr>
            `;
        },

        buildPcbRow: function (index, rowData = {}) {
            return `
                <tr class="hover:bg-emerald-50">
                    <td class="row-no border border-slate-300 px-2 py-2 text-center font-bold">${index}</td>

                    <td class="border border-slate-300 px-2 py-2">
                        <input name="drawing_no[]" class="edr-input" value="${rowData.drawing_no || ''}">
                    </td>

                    <td class="border border-slate-300 px-2 py-2">
                        <select name="line[]" class="edr-input">
                            ${this.buildSelectOptionsHtml(this.lineOptions, rowData.line)}
                        </select>
                    </td>

                    <td class="border border-slate-300 px-2 py-2">
                        <select name="process[]" class="edr-input">
                            ${this.buildSelectOptionsHtml(this.processOptions, rowData.process)}
                        </select>
                    </td>

                    <td class="border border-slate-300 px-2 py-2">
                        <input name="lot[]" class="edr-input" value="${rowData.lot || ''}">
                    </td>

                    <td class="border border-slate-300 px-2 py-2">
                        <input name="serial_no[]" class="edr-input" value="${rowData.serial_no || ''}">
                    </td>

                    <td class="border border-slate-300 px-2 py-2">
                        <input name="prod_jun[]" class="edr-input" placeholder="Ex.2501X" value="${rowData.prod_jun || ''}">
                    </td>

                    <td class="border border-slate-300 px-2 py-2">
                        <input name="qty[]" type="number" min="1" class="edr-input" value="${rowData.qty || ''}">
                    </td>

                    <td class="border border-slate-300 px-2 py-2">
                        <textarea name="problem_detail[]" class="edr-input" rows="3">${rowData.problem_detail || ''}</textarea>
                    </td>

                    <td class="border border-slate-300 px-2 py-2 text-center">
                        <button type="button"
                            class="btnCopyRow rounded bg-yellow-300 px-2 py-1 text-xs font-extrabold text-black shadow hover:bg-yellow-400">
                            Copy Row
                        </button>

                        <button type="button"
                            class="btnDeleteRow mt-1 rounded-full bg-red-500 px-3 py-2 text-xs font-extrabold text-white shadow hover:bg-red-600">
                            🗑
                        </button>
                    </td>
                </tr>
            `;
        },

        getRowData: function ($tr) {
            return {
                drawing_no: $tr.find('[name="drawing_no[]"]').val() || '',
                line: $tr.find('[name="line[]"]').val() || '',
                process: $tr.find('[name="process[]"]').val() || '',
                lot: $tr.find('[name="lot[]"]').val() || '',
                serial_no: $tr.find('[name="serial_no[]"]').val() || '',
                prod_jun: $tr.find('[name="prod_jun[]"]').val() || '',
                qty: $tr.find('[name="qty[]"]').val() || '',
                problem_detail: $tr.find('[name="problem_detail[]"]').val() || ''
            };
        },

        copyRow: function ($button) {
            const $tr = $button.closest('tr');
            const rowData = this.getRowData($tr);

            this.rowIndex++;
            $tr.after(this.buildRow(this.rowIndex, rowData));

            this.reorderRowNo();
            this.updateTotalRow();
        },

        deleteRow: function ($button) {
            $button.closest('tr').remove();
            this.reorderRowNo();
            this.updateTotalRow();

            if ($('#detailBody tr').length === 0) {
                this.addRow();
            }
        },

        reorderRowNo: function () {
            $('#detailBody tr').each(function (index) {
                $(this).find('.row-no').text(index + 1);
            });

            this.rowIndex = $('#detailBody tr').length;
        },

        updateTotalRow: function () {
            $('#totalRow').text($('#detailBody tr').length);
        },

        isPcbWorkType: function () {
            return String($('#job_type').val()) === '4';
        },

        getCurrentTableType: function () {
            return this.isPcbWorkType() ? 'pcb' : 'normal';
        },

        isPcbWorkType: function () {
            return String($('#job_type').val()) === '4';
        },

        buildSelectOptionsHtml: function (data, selectedValue = '') {
            let html = '<option value="">-- Select --</option>';

            data.forEach(function (item) {
                const selected = String(item.value) === String(selectedValue) ? 'selected' : '';
                html += `<option value="${item.value}" ${selected}>${item.text}</option>`;
            });

            return html;
        },

        rebuildDetailRows: function () {
            $('#detailBody').empty();
            this.rowIndex = 0;
            this.addRow();
        },

        checkEmployee: async function ($input) {
            const empno = $.trim($input.val());
            const target = $input.attr('id') === 'request_by'
                ? '#request_by_name'
                : '#repair_by_name';

            if (!empno) {
                $(target).text('');
                return;
            }

            if (!/^[0-9]{5}$/.test(empno)) {
                $(target).removeClass('text-emerald-700').addClass('text-red-500');
                $(target).text('กรุณากรอกตรวจสอบ Emp No ');
                return;
            }

            try {
                $(target).removeClass('text-red-500 text-emerald-700').addClass('text-slate-500').text('Checking...');

                const user = await getUserbyemp(empno);
                const empName = user?.SNAME || '';

                if (empName) {
                    $(target)
                        .removeClass('text-red-500 text-slate-500')
                        .addClass('text-emerald-700').text(empName);
                } else {
                    $(target)
                        .removeClass('text-emerald-700 text-slate-500')
                        .addClass('text-red-500')
                        .text('ไม่พบข้อมูลพนักงาน');
                }
            } catch (error) {
                console.error('CHECK EMPLOYEE ERROR:', error);
                $(target)
                    .removeClass('text-emerald-700 text-slate-500')
                    .addClass('text-red-500')
                    .text('ไม่พบข้อมูลพนักงาน');
            }
        },

        clearOrderDetail: function ($tr) {
            $tr.find('input[name="project_no[]"]').val('');
            $tr.find('input[name="prod_jun[]"]').val('');
            $tr.find('input[name="model[]"]').val('');
        },

        checkOrderDetail: async function ($input) {
            const orderNo = $.trim($input.val()).toUpperCase();
            const $tr = $input.closest('tr');

            $input.val(orderNo);
            console.log('ORDER INPUT:', orderNo);

            if (!/^[A-Za-z0-9]{9}$/.test(orderNo)) {
                this.clearOrderDetail($tr);
                return;
            }

            console.log('CALL getamecorderdetail:', orderNo);

            try {
                const data = await getamecorderdetail({
                    MFGNO: orderNo
                });

                console.log('ORDER DETAIL RESULT:', data);

                const row = Array.isArray(data) ? data[0] : data;

                if (row) {
                    $tr.find('input[name="project_no[]"]').val(row.PRJ_NO || '');
                    $tr.find('input[name="prod_jun[]"]').val(row.PROD || '');
                    $tr.find('input[name="model[]"]').val(row.MODEL || '');
                } else {
                    this.clearOrderDetail($tr);
                }
            } catch (error) {
                console.error('CHECK ORDER DETAIL ERROR:', error);
                this.clearOrderDetail($tr);
            }
        },

        validateForm: function () {
            let isValid = true;

            // ===== header =====
            if (!$.trim($('#request_by').val())) isValid = false;
            if (!$.trim($('#repair_by').val())) isValid = false;
            if (!$('#job_type').val()) isValid = false;
            if (!$('#cause').val()) isValid = false;

            const isPCB = this.isPcbWorkType();

            // ===== detail =====
            $('#detailBody tr').each(function () {
                const $tr = $(this);

                if (isPCB) {
                    // ===== PCB =====
                    if (!$.trim($tr.find('[name="drawing_no[]"]').val())) isValid = false;
                    if (!$tr.find('[name="line[]"]').val()) isValid = false;
                    if (!$tr.find('[name="process[]"]').val()) isValid = false;
                    if (!$.trim($tr.find('[name="lot[]"]').val())) isValid = false;
                    if (!$.trim($tr.find('[name="serial_no[]"]').val())) isValid = false;
                    if (!$.trim($tr.find('[name="prod_jun[]"]').val())) isValid = false;
                    if (!$.trim($tr.find('[name="qty[]"]').val())) isValid = false;

                } else {
                    // ===== Normal =====
                    if (!$.trim($tr.find('[name="order_no[]"]').val())) isValid = false;
                    if (!$.trim($tr.find('[name="drawing_no[]"]').val())) isValid = false;
                    if (!$.trim($tr.find('[name="item[]"]').val())) isValid = false;
                    if (!$.trim($tr.find('[name="qty[]"]').val())) isValid = false;
                }
            });

            if (!isValid) {
                showMessage("กรุณากรอกข้อมูลให้ครบถ้วน", "warning");
                return false;
            }

            return true;
        },

        getWebflowParams: function () {
            const inputBy = String($('#inputBy').val() || '');

            return {
                NFRMNO: String($('#nfrmno').val() || ''),
                VORGNO: String($('#vorgno').val() || ''),
                CYEAR: String($('#cyear').val() || ''),
                REQBY: String($('#request_by').val() || inputBy),
                INPUTBY: inputBy
            };
        },

        createWebflowForm: async function () {
            const params = this.getWebflowParams();

            if (!params.NFRMNO || !params.VORGNO || !params.CYEAR) {
                throw new Error('ไม่พบข้อมูล NFRMNO / VORGNO / CYEAR');
            }

            const result = await createForm(params);
            if (!result?.status) {
                throw new Error(result?.message || 'Create form ไม่สำเร็จ');
            }
            return result;
        },

        getFileUploadAtt: function () {
            const ref = $.trim($('#filUpload_ref').val());
            if (!ref) {  return [];}
            return ref.split(',')
                .map(file => $.trim(file))
                .filter(file => file)
                .map(file => ({
                    FILENAME: file
                }));
        },
        getFormPayload: function (webflowData = {}) {
            const isPCB = this.isPcbWorkType();
            const list = $('#detailBody tr').map(function () {
                const $tr = $(this);
                return {
                    ORDERNO: isPCB ? null : ($.trim($tr.find('[name="order_no[]"]').val()) || null),
                    DWGNO: $.trim($tr.find('[name="drawing_no[]"]').val()) || null,
                    ITEM: isPCB ? null : ($.trim($tr.find('[name="item[]"]').val()) || null),
                    QTY: Number($tr.find('[name="qty[]"]').val()) || null,
                    DETAIL: $.trim($tr.find('[name="problem_detail[]"]').val()) || null,
                    LV_EFFECT: null,
                    EFFECT: null,
                    LID: isPCB ? Number($tr.find('[name="line[]"]').val()) || null : null,
                    PID: isPCB ? Number($tr.find('[name="process[]"]').val()) || null : null,
                    LOT: isPCB ? ($.trim($tr.find('[name="lot[]"]').val()) || null) : null,
                    SERIAL: isPCB ? ($.trim($tr.find('[name="serial_no[]"]').val()) || null) : null,
                    PRDN_JUN: (() => {
                        let val = $.trim($tr.find('[name="prod_jun[]"]').val());
                        if (!val) {  return null; }
                        if (val.length > 6) {  val = val.substring(2); }
                        return val;
                    })()
                };
            }).get();

            return {
                NFRMNO: Number(webflowData.NFRMNO || $('#nfrmno').val()),
                VORGNO: String(webflowData.VORGNO || $('#vorgno').val()),
                CYEAR: String(webflowData.CYEAR || $('#cyear').val()),
                CYEAR2: String(webflowData.CYEAR2),
                NRUNNO: Number(webflowData.NRUNNO),

                TID: Number($('#job_type').val()) || null,
                SSECCODE: String($('#sseccode').val() || ''),
                CID: Number($('#cause').val()) || null,
                REPAIR_BY: $.trim($('#repair_by').val()) || null,
                DAILY_MONTH: String($('#daily_month').val() || ''),
                DAILY_RUNNO: Number($('#daily_runno').val()) || null,
                REASON_CAUSE: $.trim($('#reason_cause').val()) || null,

                list,
                att: this.getFileUploadAtt()
            };
        },

        submitForm: async function (actionType) {
            if (!this.validateForm()) {
                return;
            }

            this.setLoading(true);
            try {
               const webflow = await this.createWebflowForm();
                console.log('WEBFLOW RESULT:', webflow);

                const payload = this.getFormPayload(webflow?.data || {});
                console.log('MFG EDR PAYLOAD:', payload);

                if (!payload.NFRMNO || !payload.CYEAR2 || !payload.NRUNNO) {
                    throw new Error('CreateForm response ไม่ครบ NFRMNO / CYEAR2 / NRUNNO');
                }

                const res = await createMfgEdr(payload);
                if (res.status === true || res.status === 'success') {
                    showMessage("บันทึกข้อมูลสำเร็จ !!!", "success");
                } else {
                    showMessage(res.message || "บันทึกข้อมูลไม่สำเร็จ", "error");
                }
            } catch (error) {
                console.error('SUBMIT FORM ERROR:', error);
                showMessage(error?.message || "เกิดข้อผิดพลาดระหว่างบันทึกข้อมูล !!!", "error");
            } finally {
                this.setLoading(false);
            }
        },

        setLoading: function (isLoading) {
            $('#btnSaveDraft, #btnSendForm, #btnAddRow').prop('disabled', isLoading);

            if (isLoading) {
                $('#btnSaveDraft').text('Saving...');
                $('#btnSendForm').text('Sending...');
            } else {
                $('#btnSaveDraft').text('Save Draft');
                $('#btnSendForm').text('Send Form');
            }
        }
    };

    EDR.init();
});