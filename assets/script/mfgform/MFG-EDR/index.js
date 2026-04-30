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

            $('#request_by, #repair_by').on('blur change', function () {
                EDR.checkEmployee($(this));
            });

            $('#btnSaveDraft').on('click', function () {
                EDR.submitForm('save_draft');
            });

            $('#btnSendForm').on('click', function () {
                EDR.submitForm('send_form');
            });
        },

        loadMaster: function () {
            // ตัวอย่าง master data ชั่วคราว
            // ถ้ามี API จริง ค่อยเปลี่ยนตรงนี้จุดเดียว
            const jobTypes = [
                { value: 'NEW', text: 'New Drawing' },
                { value: 'REPAIR', text: 'Repair Drawing' },
                { value: 'CHANGE', text: 'Change Drawing' }
            ];

            const causes = [
                { value: 'DESIGN', text: 'Design Issue' },
                { value: 'MFG', text: 'Manufacturing Issue' },
                { value: 'OTHER', text: 'Other' }
            ];

            this.renderOptions('#job_type', jobTypes);
            this.renderOptions('#cause', causes);
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
                        <input name="project_no[]" class="edr-input">
                    </td>

                    <td class="border border-slate-300 px-2 py-2">
                        <input name="prod_jun[]" class="edr-input">
                    </td>

                    <td class="border border-slate-300 px-2 py-2">
                        <input name="item[]" class="edr-input">
                    </td>

                    <td class="border border-slate-300 px-2 py-2">
                        <input name="model[]" class="edr-input">
                    </td>

                    <td class="border border-slate-300 px-2 py-2">
                        <input name="qty[]" type="number" min="1" class="edr-input">
                    </td>

                    <td class="border border-slate-300 px-2 py-2">
                        <input name="problem_detail[]" class="edr-input">
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

        checkEmployee: function ($input) {
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

            // TODO: เปลี่ยนเป็น API จริง
            // $.get(EDR.baseUrl + 'mfgform/mfg_edaily_report/get_emp/' + empno, function (res) {
            //     $(target)
            //         .removeClass('text-red-500')
            //         .addClass('text-emerald-700')
            //         .text(res.empname || 'ไม่พบข้อมูล');
            // }, 'json');

            $(target)
                .removeClass('text-red-500')
                .addClass('text-emerald-700')
                .text('รอต่อ API employee');
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