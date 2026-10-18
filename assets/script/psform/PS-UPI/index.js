import { fetchUtils } from '@amec/webasset/api/fetch-utils';
import { showMessage } from '@amec/webasset/utils';
import { setSelect2 } from '@amec/webasset/select2';
import select2 from 'select2';
import { setDatePicker } from '@amec/webasset/flatpickr';
import { getUser } from '@amec/webasset/api/amec';
import { redirectWebflow } from '@amec/webasset/form';
select2();

$(document).ready(async function () {
    const params = new URLSearchParams(window.location.search);
    const nfrmno = params.get('no');
    const vorgno = params.get('orgNo');
    const cyear = params.get('y');
    const runno = params.get('runNo');
    const cyear2 = params.get('y2');
    const empno = params.get('empno');
    const isEditing = Boolean(cyear2 && runno);
    const formKey = {
        NFRMNO: nfrmno,
        VORGNO: vorgno,
        CYEAR: cyear,
        CYEAR2: cyear2,
        NRUNNO: runno,
        EMPNO: empno,
    };

    const user = await getUser(empno);

    $('#inputBy')
        .val(empno || '')
        .prop('readonly', true);

    $('#DisplayInputBy').text(`(${empno}) ${user?.SNAME || ''}`);

    async function validateRequestBy(requestBy) {
        if (!requestBy) {
            $('#DisplayRequestBy').text('');
            return false;
        }

        const requestUser = await getUser(requestBy);
        if (!requestUser) {
            $('#requestBy').addClass('input-error');
            $('#DisplayRequestBy').text('ไม่พบข้อมูลพนักงาน');
            return false;
        }

        $('#requestBy').removeClass('input-error');
        $('#DisplayRequestBy').text(`(${requestBy}) ${requestUser.SNAME}`);
        return true;
    }

    $('#requestBy').on('blur', async function () {
        const requestBy = String($(this).val() || '').trim();
        if (!(await validateRequestBy(requestBy)) && requestBy) {
            showMessage('ไม่พบข้อมูลพนักงาน', 'error');
        }
    });

    const $tbody = $('#partTableBody');
    const rowTemplate = document.getElementById('rowTemplate');
    // Replace this path when the PS-UPI part-search API is available.
    const selectReason = await fetchUtils({
        url: process.env.APP_API + '/ps-upi/reason',
        method: 'GET',
    });
    const reasonOptions = selectReason.map((reason) => ({
        id: String(reason.REASON_CODE),
        text: reason.REASON_NAME,
        inputLabel: reason.INPUT_LABEL,
        inputRequired: String(reason.INPUT_REQUIRED) === '1',
    }));

    async function addRow(item = null) {
        $tbody.append(rowTemplate.content.cloneNode(true));
        const $newRow = $tbody.find('tr').last();
        await setSelect2({
            element: $newRow.find('.part-reason'),
            placeholder: 'Select reason',
            size: 'sm',
            width: '100%',
            data: reasonOptions,
        });

        if (item) {
            const purCode = item.PUR_CODE ?? item.PURCODE ?? '';
            const reasonValue =
                item.REASON_CODE ??
                item.REASON ??
                reasonOptions.find((reason) => reason.text === item.REASON_NAME)
                    ?.id ??
                '';
            const returnDate = item.PLAN_RETURN_DATE ?? item.RETURN_DATE ?? '';

            $newRow.find('.part-purcode').val(purCode);
            $newRow
                .find('.part-desc')
                .val(item.DESCRIPTION ?? item.DESC ?? '-');
            $newRow
                .find('.part-drawing')
                .val(item.DRAWING_NO ?? item.DRAWING ?? '-');
            $newRow.find('.part-address').val(item.ADDRESS ?? item.ADDR ?? '-');
            $newRow.find('.part-whi').val(item.WHI_USER ?? '-');
            $newRow.find('.part-qty').val(item.QUANTITY ?? item.QTY ?? '');
            $newRow.find('.part-production').val(item.PRODUCTION ?? '');
            $newRow.find('.part-issueto').val(item.ISSUE_TO ?? '');
            $newRow
                .find('.part-reason')
                .val(String(reasonValue))
                .trigger('change');
            $newRow.find('.reason-detail').val(item.REASON_DETAIL ?? '');
            $newRow
                .find('.part-returndate')
                .val(String(returnDate).slice(0, 10));

            if (purCode) $newRow.data('foundPurCode', String(purCode));
        }

        renumberRows();
        setDatePicker({
            element: $newRow.find('.part-returndate'),
        });
    }

    async function loadExistingForm() {
        const response = await fetchUtils({
            url: process.env.APP_API + '/ps-upi/getDataForm',
            method: 'POST',
            data: formKey,
        });
        const payload = response?.data ?? response;
        const header = Array.isArray(payload)
            ? payload[0]
            : (payload?.form ?? payload?.header ?? payload);
        let items = Array.isArray(payload)
            ? payload
            : (payload?.LIST_DATA ??
              payload?.items ??
              payload?.rows ??
              payload?.details ??
              []);

        if (!Array.isArray(items) && items && typeof items === 'object') {
            items = [items];
        }
        if (
            !items.length &&
            payload &&
            !Array.isArray(payload) &&
            payload.PUR_CODE
        ) {
            items = [payload];
        }
        if (!items.length) {
            throw new Error('ไม่พบรายการวัสดุของใบคำขอนี้');
        }

        const requestBy = header?.REQUEST_BY ?? payload?.REQUEST_BY ?? empno;
        $('#requestBy').val(requestBy);
        if (requestBy) await validateRequestBy(requestBy);

        for (const item of items) await addRow(item);
    }

    function renumberRows() {
        const $rows = $tbody.find('tr');

        $rows.each(function (index) {
            $(this)
                .find('.row-no')
                .text(index + 1);
        });

        $('#partRowCount, .part-row-count').text($rows.length);

        const onlyOneRow = $rows.length <= 1;
        $('.btn-remove-row')
            .prop('disabled', onlyOneRow)
            .toggleClass('btn-disabled', onlyOneRow);
    }

    function getSubmittedFormKey(response) {
        const aliases = {
            NFRMNO: ['NFRMNO', 'nfrmno'],
            VORGNO: ['VORGNO', 'vorgno'],
            CYEAR: ['CYEAR', 'cyear'],
            CYEAR2: ['CYEAR2', 'cyear2'],
            NRUNNO: ['NRUNNO', 'nrunno', 'runno'],
        };
        const values = { ...formKey };
        const pending = [response];
        const visited = new Set();

        while (pending.length) {
            const current = pending.shift();
            if (
                !current ||
                typeof current !== 'object' ||
                visited.has(current)
            ) {
                continue;
            }
            visited.add(current);

            for (const [field, names] of Object.entries(aliases)) {
                if (values[field]) continue;
                const matchingKey = names.find((name) => current[name] != null);
                if (matchingKey) values[field] = current[matchingKey];
            }
            pending.push(...Object.values(current));
        }

        return values;
    }

    $('#attachmentInput').on('change', function () {
        const files = Array.from(this.files || []);
        $('#selectedAttachmentList').html(
            files
                .map((file) => $('<li>').text(file.name).prop('outerHTML'))
                .join(''),
        );
    });

    async function uploadAttachments(response) {
        const files = Array.from($('#attachmentInput')[0]?.files || []);
        if (!files.length) return;

        const uploadedFormKey = getSubmittedFormKey(response);
        if (!uploadedFormKey.CYEAR2 || !uploadedFormKey.NRUNNO) {
            throw new Error(
                'ส่งคำขอแล้ว แต่ไม่พบเลขที่ฟอร์มสำหรับบันทึกไฟล์แนบ',
            );
        }

        for (const file of files) {
            const uploadData = new FormData();
            uploadData.append('NFRMNO', uploadedFormKey.NFRMNO);
            uploadData.append('VORGNO', uploadedFormKey.VORGNO);
            uploadData.append('CYEAR', uploadedFormKey.CYEAR);
            uploadData.append('CYEAR2', uploadedFormKey.CYEAR2);
            uploadData.append('NRUNNO', uploadedFormKey.NRUNNO);
            uploadData.append('FORM_TYPE', 'PS');
            uploadData.append('CREATEBY', empno);
            uploadData.append('file', file);

            await fetchUtils({
                url: `${process.env.APP_API}/webform/file`,
                method: 'POST',
                data: uploadData,
            });
        }
    }

    $('#btnAddPart').on('click', addRow);

    $(document).on('blur', '.part-purcode', async function () {
        const $input = $(this);
        const $row = $input.closest('tr');
        const currentPurCode = String($input.val() || '').trim();

        if (!currentPurCode) {
            $input.removeClass('input-error');
            return;
        }
        if (String($row.data('foundPurCode') || '') === currentPurCode) return;

        $input.removeClass('input-error');
        const dataPart = await fetchUtils({
            url: process.env.APP_API + '/warehouse/itemmaster/findall',
            data: { IPROD: currentPurCode },
        });

        const part = dataPart?.[0];
        if (!part) {
            $input.addClass('input-error');
            showMessage('PUR Code not found');
            $row.find(
                '.part-desc, .part-drawing, .part-address, .part-whi',
            ).val('-');
            return;
        }

        $row.find('.part-desc').val(part.IDESC || '-');
        $row.find('.part-drawing').val(part.IDRAW || '-');
        $row.find('.part-address').val(part.IABBT || '-');
        $row.find('.part-whi').val(part.USER_ID || '-');
        $row.data('foundPurCode', currentPurCode);
    });

    $(document).on('input', '.part-purcode', function () {
        $(this).closest('tr').removeData('foundPurCode');
    });

    $(document).on('click', '.btn-remove-row', function () {
        if ($tbody.find('tr').length <= 1) return;
        $(this).closest('tr').remove();
        renumberRows();
    });

    // Show the reason-specific input only when the selected reason requires it.
    $(document).on('change', '.part-reason', function () {
        const selectedReason = reasonOptions.find(
            (reason) => reason.id === String($(this).val()),
        );
        const $reasonInput = $(this).closest('td').find('.reason-detail');
        const isRequired = selectedReason?.inputRequired === true;

        $reasonInput
            .toggleClass('hidden', !isRequired)
            .attr('placeholder', selectedReason?.inputLabel || '')
            .prop('required', isRequired);
        if (!isRequired) $reasonInput.val('');
    });

    if (isEditing) {
        try {
            await loadExistingForm();
        } catch (error) {
            await addRow();
            showMessage(
                error?.message || 'ไม่สามารถโหลดข้อมูลใบคำขอได้',
                'error',
            );
        }
    } else {
        await addRow();
    }

    $(document).on('click', '#btnSubmit', async function () {
        const $requestBy = $('#requestBy');
        const requestBy = String($requestBy.val() || '').trim();
        $requestBy.removeClass('input-error');

        if (!requestBy) {
            $requestBy.addClass('input-error').trigger('focus');
            showMessage('กรุณากรอก Request By', 'warning');
            return;
        }

        if (!(await validateRequestBy(requestBy))) {
            $requestBy.addClass('input-error').trigger('focus');
            showMessage('ไม่พบข้อมูลพนักงาน', 'error');
            return;
        }

        const $rows = $tbody.find('tr');
        let firstInvalidField = null;
        let firstInvalidMessage = '';

        $rows.each(function (index) {
            const $row = $(this);
            const selectedReason = reasonOptions.find(
                (reason) =>
                    reason.id === String($row.find('.part-reason').val()),
            );
            const fields = [
                {
                    selector: '.part-purcode',
                    label: 'PUR Code',
                    valid:
                        String($row.data('foundPurCode') || '') ===
                        String($row.find('.part-purcode').val() || ''),
                },
                { selector: '.part-qty', label: 'Quantity' },
                { selector: '.part-production', label: 'Production' },
                { selector: '.part-issueto', label: 'Issue to' },
                { selector: '.part-reason', label: 'Reason' },
                { selector: '.part-returndate', label: 'Return Date' },
            ];

            if (selectedReason?.inputRequired) {
                fields.push({
                    selector: '.reason-detail',
                    label: selectedReason.inputLabel || 'Reason detail',
                });
            }

            fields.forEach((field) => {
                const $input = $row.find(field.selector);
                const hasValue = String($input.val() || '').trim() !== '';
                const isValid =
                    field.valid === undefined
                        ? hasValue
                        : field.valid && hasValue;
                $input.toggleClass('input-error', !isValid);

                if (!isValid && !firstInvalidField) {
                    firstInvalidField = $input;
                    firstInvalidMessage = `กรุณากรอก ${field.label} ในรายการที่ ${index + 1}`;
                }
            });
        });

        if (firstInvalidField) {
            showMessage(firstInvalidMessage, 'warning');
            firstInvalidField.trigger('focus');
            return;
        }

        const listData = $rows
            .map(function () {
                return {
                    PUR_CODE: $(this).find('.part-purcode').val(),
                    DESC: $(this).find('.part-desc').val(),
                    DRAWING: $(this).find('.part-drawing').val(),
                    ADDR: $(this).find('.part-address').val(),
                    WHI_USER: $(this).find('.part-whi').val(),
                    REASON: $(this).find('.part-reason').val(),
                    REASON_DETAIL: $(this).find('.reason-detail').val(),
                    QTY: $(this).find('.part-qty').val(),
                    PRODUCTION: $(this).find('.part-production').val(),
                    ISSUE_TO: $(this).find('.part-issueto').val(),
                    RETURN_DATE: $(this).find('.part-returndate').val(),
                };
            })
            .get();

        const formData = {
            ...(isEditing ? formKey : {}),
            INPUT_BY: empno,
            REQUEST_BY: requestBy,
            LIST_DATA: listData,
        };

        // console.log('Submitting form data:', formData);
        // return;
        const submitResponse = await fetchUtils({
            url: process.env.APP_API + '/ps-upi/submit',
            method: 'POST',
            data: formData,
        });

        try {
            await uploadAttachments(submitResponse);
        } catch (error) {
            showMessage(
                error?.message || 'ไม่สามารถอัปโหลดไฟล์แนบได้',
                'error',
            );
            return;
        }

        redirectWebflow();
    });
});
