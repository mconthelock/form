import {
    getcause, getworktype, getUserbyemp
} from "./data.js";

$(document).ready(function () {
    const EDR = {
        rowIndex: 0,
        baseUrl: $('#base_url').val() || '',

        init: function () {
            this.bindEvents();
            this.addRow();
            this.loadMaster();
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
            });

            $('#btnSaveDraft').on('click', function () {
                EDR.submitForm('save_draft');
            });

            $('#btnSendForm').on('click', function () {
                EDR.submitForm('send_form');
            });
        },

        loadMaster: async function () {
            try {
                const jobTypes = await getworktype();

                const worktypeOptions = jobTypes.map(function (item) {
                    return {
                        value: item.TID,
                        text: item.TYPENAME
                    };
                });

                this.renderOptions('#job_type', worktypeOptions);
                this.renderOptions('#cause', []);
            } catch (error) {
                console.error('LOAD MASTER ERROR:', error);
                alert('โหลดข้อมูล Work Type ไม่สำเร็จ');
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

        buildRow: function (index) {
            return `
                <tr class="hover:bg-emerald-50">
                    <td class="row-no border border-slate-300 px-2 py-2 text-center font-bold">${index}</td>

                    <td class="border border-slate-300 px-2 py-2">
                        <input name="order_no[]" class="edr-input">
                    </td>

                    <td class="border border-slate-300 px-2 py-2">
                        <input name="drawing_no[]" class="edr-input">
                    </td>

                    <td class="border border-slate-300 px-2 py-2">
                        <input name="project_no[]" class="edr-input disabled-textbox" readonly>
                    </td>

                    <td class="border border-slate-300 px-2 py-2">
                        <input name="prod_jun[]" class="edr-input disabled-textbox" readonly>
                    </td>

                    <td class="border border-slate-300 px-2 py-2">
                        <input name="item[]" class="edr-input">
                    </td>

                    <td class="border border-slate-300 px-2 py-2">
                        <input name="model[]" class="edr-input disabled-textbox" readonly>
                    </td>

                    <td class="border border-slate-300 px-2 py-2">
                        <input name="qty[]" type="number" min="1" class="edr-input">
                    </td>

                    <td class="border border-slate-300 px-2 py-2">
                        <textarea name="problem_detail[]" class="edr-input" rows="3"></textarea>
                    </td>

                    <td class="border border-slate-300 px-2 py-2 text-center">
                        <button type="button"
                            class="btnDeleteRow rounded-full bg-red-500 px-3 py-2 text-xs font-extrabold text-white shadow hover:bg-red-600"
                            title="Delete">
                            🗑
                        </button>
                    </td>
                </tr>
            `;
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
                $(target).text('กรุณากรอก Emp No 5 หลัก');
                return;
            }

            try {
                $(target)
                    .removeClass('text-red-500 text-emerald-700')
                    .addClass('text-slate-500')
                    .text('Checking...');

                const user = await getUserbyemp(empno);

                const empName = user?.SNAME
                    || user?.EMPNAME
                    || user?.empname
                    || user?.name
                    || '';

                if (empName) {
                    $(target)
                        .removeClass('text-red-500 text-slate-500')
                        .addClass('text-emerald-700')
                        .text(empName);
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

        validateForm: function () {
            let errors = [];

            if (!$.trim($('#request_by').val())) errors.push('กรุณากรอก Request By');
            if (!$.trim($('#repair_by').val())) errors.push('กรุณากรอก Repair By');
            if (!$('#job_type').val()) errors.push('กรุณาเลือกประเภทของงาน');
            if (!$('#cause').val()) errors.push('กรุณาเลือกสาเหตุ');

            $('#detailBody tr').each(function (index) {
                const rowNo = index + 1;

                if (!$.trim($(this).find('input[name="order_no[]"]').val())) {
                    errors.push(`Row ${rowNo}: กรุณากรอก Order no`);
                }

                if (!$.trim($(this).find('input[name="drawing_no[]"]').val())) {
                    errors.push(`Row ${rowNo}: กรุณากรอก Drawing no`);
                }

                if (!$.trim($(this).find('input[name="item[]"]').val())) {
                    errors.push(`Row ${rowNo}: กรุณากรอก Item`);
                }

                if (!$.trim($(this).find('input[name="qty[]"]').val())) {
                    errors.push(`Row ${rowNo}: กรุณากรอก Qty`);
                }
            });

            return errors;
        },

        submitForm: function (actionType) {
            const errors = this.validateForm();

            if (errors.length > 0) {
                alert(errors.join('\n'));
                return;
            }

            const formData = new FormData($('#formMfgEdr')[0]);
            formData.append('form_action', actionType);

            this.setLoading(true);

            $.ajax({
                url: this.baseUrl + 'mfgform/mfg_edaily_report/save_request',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                dataType: 'json',
                success: function (res) {
                    if (res.status === true || res.status === 'success') {
                        alert('บันทึกข้อมูลสำเร็จ');
                    } else {
                        alert(res.message || 'บันทึกไม่สำเร็จ');
                    }
                },
                error: function (xhr) {
                    console.error(xhr.responseText);
                    alert('เกิดข้อผิดพลาดระหว่างบันทึกข้อมูล');
                },
                complete: function () {
                    EDR.setLoading(false);
                }
            });
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