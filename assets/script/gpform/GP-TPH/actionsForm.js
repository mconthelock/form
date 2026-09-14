import { createTable, getSelectedData } from '@amec/webasset/dataTable';
import { logFormData, showMessage } from '@amec/webasset/utils';
import { getEmpData, getAreas, getLocations, createForm } from './data';
import { webflowSubmit } from '@amec/webasset/components/form';
import { redirectWebflow } from '@amec/webasset/form';
import { setDatePicker } from '@amec/webasset/flatpickr';

(function () {
    let mockupTable = null;
    let tableArea = null;

    async function modalTable(data) {
        const table = await createTable(
            {
                data: data,
                responsive: false,
                columns: [
                    { title: 'Location', data: 'LOCATION.LOCATION_NAME' },
                    { title: 'Area', data: 'AREA_NAME' },
                    { title: 'Level', data: 'AREA_LEVEL' },
                    { title: 'Area Owner', data: 'AREA_OWNER' },
                ],
            },
            {
                id: '#modalTable',
                domScroll: {
                    status: true,
                },
                columnSelect: {
                    status: true,
                },
            },
        );
        return table;
    }

    function initCreatePage() {
        const visitorBody = document.getElementById('visitor-table-body');
        const addVisitorBtn = document.getElementById('add-visitor-row');
        const visitorTemplate = document.getElementById('visitor-row-template');
        const areaBody = document.getElementById('area-table-body');
        const hostExternalSection = document.getElementById(
            'host-external-section',
        );
        const applicantVisitorSection = document.getElementById(
            'applicant-visitor-section',
        );
        const requestTypeRadios = document.querySelectorAll(
            'input[name="REQUEST_TYPE"]',
        );
        const requestSubTypeRadios = document.querySelectorAll(
            'input[name="REQUEST_SUB_TYPE"]',
        );
        const permitOptionRadios = document.querySelectorAll(
            'input[name="permit_option"]',
        );
        const hostExternalRadio = document.querySelector(
            'input[name="REQUEST_TYPE"][value="H"]',
        );
        const employeeRadio = document.querySelector(
            'input[name="REQUEST_TYPE"][value="E"]',
        );

        if (
            !visitorBody ||
            !addVisitorBtn ||
            !visitorTemplate ||
            !areaBody ||
            !hostExternalSection ||
            !applicantVisitorSection
        ) {
            return;
        }

        function updateAreaIndexes() {
            Array.from(
                areaBody.querySelectorAll('tr:not(#area-empty-row)'),
            ).forEach((row, index) => {
                const cell = row.querySelector('td:first-child');
                if (cell) {
                    cell.textContent = index + 1;
                }
            });
        }

        function updateVisitorIndexes() {
            Array.from(visitorBody.rows).forEach((row, index) => {
                row.querySelector('.visitor-row-number').textContent =
                    index + 1;
            });
        }

        function makeRadioGroupToggleable(selector, callback) {
            const radios = document.querySelectorAll(selector);

            radios.forEach(function (radio) {
                radio.addEventListener('mousedown', function () {
                    this.dataset.wasChecked = this.checked ? 'true' : 'false';
                });

                radio.addEventListener('click', function (event) {
                    if (this.dataset.wasChecked === 'true' && this.checked) {
                        event.preventDefault();
                        radios.forEach(function (item) {
                            item.checked = false;
                        });
                    }

                    if (callback) {
                        callback();
                    }
                });
            });
        }

        function clearRequestTypeRelatedFields() {
            const isHostExternal = hostExternalRadio
                ? hostExternalRadio.checked
                : false;

            document
                .querySelectorAll('input[name="REQUEST_SUB_TYPE"]')
                .forEach(function (radio) {
                    if (isHostExternal) {
                        radio.checked = false;
                    }
                });

            if (!isHostExternal) {
                document
                    .querySelectorAll('#host-external-section input')
                    .forEach(function (field) {
                        if (
                            field.type === 'checkbox' ||
                            field.type === 'radio'
                        ) {
                            field.disabled = true;
                        }
                    });
            } else {
                document
                    .querySelectorAll('#host-external-section input')
                    .forEach(function (field) {
                        if (
                            field.type === 'checkbox' ||
                            field.type === 'radio'
                        ) {
                            field.disabled = false;
                        }
                    });
            }
        }

        function updateAddVisitorButton() {
            const isIndividualRequest =
                employeeRadio?.checked &&
                document.querySelector(
                    'input[name="REQUEST_SUB_TYPE"][value="I"]',
                )?.checked;

            addVisitorBtn.disabled = Boolean(isIndividualRequest);
            addVisitorBtn.classList.toggle(
                'opacity-50',
                Boolean(isIndividualRequest),
            );
            addVisitorBtn.classList.toggle(
                'cursor-not-allowed',
                Boolean(isIndividualRequest),
            );
            addVisitorBtn.setAttribute(
                'aria-disabled',
                String(Boolean(isIndividualRequest)),
            );
        }

        function togglePermitOptionFields() {
            const selectedPermitOption = document.querySelector(
                'input[name="permit_option"]:checked',
            );
            const longTermYearsInput = document.querySelector(
                'input[name="LONGTERM_YEARS"]',
            );
            const startDateInput = document.querySelector(
                'input[name="PERMIT_START_DATE"]',
            );
            const validUntilInput = document.querySelector(
                'input[name="PERMIT_END_DATE"]',
            );

            longTermYearsInput.disabled =
                selectedPermitOption?.value !== 'long_term';
            startDateInput.disabled = selectedPermitOption?.value !== 'period';
            validUntilInput.disabled = selectedPermitOption?.value !== 'period';
        }

        function updatePermitTypeRestrictions() {
            const isHostExternal = hostExternalRadio?.checked;
            const longTermRadio = document.querySelector(
                'input[name="permit_option"][value="long_term"]',
            );
            const periodRadio = document.querySelector(
                'input[name="permit_option"][value="period"]',
            );
            const helmetStickerInput = document.querySelector(
                'input[name="HELMET_STICKER"]',
            );
            const photoPermitBadgeInput = document.querySelector(
                'input[name="PHOTO_PERMIT_BADGE"]',
            );

            longTermRadio.disabled = isHostExternal;
            if (isHostExternal) {
                periodRadio.checked = true;
                helmetStickerInput.disabled = true;
                helmetStickerInput.checked = false;
                photoPermitBadgeInput.disabled = false;
                photoPermitBadgeInput.checked = true;
            } else {
                helmetStickerInput.disabled = false;
                photoPermitBadgeInput.disabled = false;
            }

            togglePermitOptionFields();
        }

        function toggleHostExternalSection() {
            const isHostExternal = hostExternalRadio?.checked;
            const isEmployee = employeeRadio?.checked;
            const employeeRequestLabels = document.querySelectorAll(
                '.employee-request-group',
            );
            const hostRequestLabel = document.querySelector(
                '.host-request-group',
            );
            const requestSubTypeInputs = document.querySelectorAll(
                'input[name="REQUEST_SUB_TYPE"]',
            );

            applicantVisitorSection.classList.toggle('hidden', isHostExternal);
            hostExternalSection.classList.toggle('hidden', !isHostExternal);
            employeeRequestLabels.forEach(function (label) {
                label.classList.toggle('opacity-50', isHostExternal);
                label.toggleAttribute('aria-disabled', isHostExternal);
            });
            if (hostRequestLabel) {
                hostRequestLabel.classList.toggle('opacity-50', isEmployee);
                hostRequestLabel.toggleAttribute('aria-disabled', isEmployee);
            }

            requestSubTypeInputs.forEach(function (radio) {
                radio.disabled = !isEmployee;
                if (!isEmployee) {
                    radio.checked = false;
                }
            });

            clearRequestTypeRelatedFields();
            updateAddVisitorButton();
            updatePermitTypeRestrictions();
        }

        // ฟังก์ชันหลักที่ทำงานเมื่อโหลดหน้า
        $(async function () {
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            const empno = urlParams.get('empno');
            const getareas = await getAreas();
            const getlocations = await getLocations();
            const action = webflowSubmit({ request: true });
            $('#sentRequest').html(action);
            mockupTable = await modalTable(getareas);
            const getName = await getEmpData(empno);
            $('#INPUTBY').val(empno);
            await setDatePicker();
        });

        $(document).on('change', '#select-all-areas', function () {
            $('#modalTable tbody input.row-select-area').prop(
                'checked',
                this.checked,
            );
        });

        $(document).on(
            'change',
            '#modalTable tbody input.row-select-area',
            function () {
                const checkboxes = $('#modalTable tbody input.row-select-area');
                const selectedCount = checkboxes.filter(':checked').length;

                $('#select-all-areas').prop(
                    'checked',
                    checkboxes.length > 0 &&
                        selectedCount === checkboxes.length,
                );
            },
        );

        $(document).on('keydown', '#REQBY', function (e) {
            if (e.key !== 'Enter') {
                return;
            }

            e.preventDefault();
            $(this).trigger('change');
        });

        $(document).on('change', '#REQBY', async function (e) {
            e.preventDefault();

            try {
                const empData = await getEmpData($(this).val());
                if (!empData || !empData.SNAME) {
                    showMessage('Employee data not found', 'error');
                    $(this).val('');
                    $(this).focus();
                    return;
                }
                if (String(empData.CSTATUS) !== '1') {
                    showMessage('Employee has resigned', 'error');
                    $(this).val('');
                    $(this).focus();
                    return;
                }
                $('#empName').val(empData.SNAME);
                $('#empDiv').val(
                    `${empData.SSEC}/${empData.SDEPT}/${empData.SDIV}`,
                );
                $('#EMP_CODE').val(empData.SNAME);
            } catch (error) {
                console.log(error);
            }
        });

        $(document).on(
            'change',
            '#visitor_empcode, input[name="visitor_emp_code[]"]',
            async function (e) {
                e.preventDefault();
                const visitorRow = $(this).closest('tr');

                try {
                    const empData = await getEmpData($(this).val());
                    if (!empData || !empData.SNAME) {
                        showMessage('Employee data not found', 'error');
                        $(this).val('');
                        $(this).focus();
                        return;
                    }
                    if (String(empData.CSTATUS) !== '1') {
                        showMessage('Employee has resigned', 'error');
                        $(this).val('');
                        $(this).focus();
                        return;
                    }
                    visitorRow
                        .find(
                            'input[name="visitor_name"], input[name="visitor_name[]"]',
                        )
                        .val(empData.SNAME);
                    visitorRow
                        .find(
                            'input[name="visitor_div"], input[name="visitor_division[]"]',
                        )
                        .val(empData.SDIV);
                    visitorRow
                        .find(
                            'input[name="visitor_dept"], input[name="visitor_department[]"]',
                        )
                        .val(empData.SDEPT);
                    visitorRow
                        .find(
                            'input[name="visitor_sec"], input[name="visitor_section[]"]',
                        )
                        .val(empData.SSEC);
                } catch (error) {
                    console.log(error);
                }
            },
        );

        // Prevent Enter in any visitor employee-code row from submitting the form.
        $(document).on(
            'keydown',
            '#visitor_empcode, input[name="visitor_emp_code[]"]',
            function (e) {
                if (e.key !== 'Enter') {
                    return;
                }

                e.preventDefault();
                $(this).trigger('change');
            },
        );

        addVisitorBtn.addEventListener('click', function () {
            if (addVisitorBtn.disabled) {
                return;
            }

            const clone = visitorTemplate.content.cloneNode(true);
            visitorBody.appendChild(clone);
            updateVisitorIndexes();
        });

        $(document).on('click', '#btnaddDatarow', async function (e) {
            e.preventDefault();
            const selectData = tableArea?.rows().data().toArray() ?? [];
            const mockData = mockupTable.rows().data().toArray();
            const data = mockData.map((row) => {
                const isDuplicate = selectData.some(
                    (selectedRow) => selectedRow.AREA_ID === row.AREA_ID,
                );
                if (!isDuplicate) {
                    delete row.selected;
                }
                return row;
            });
            console.log('Mock Data:', mockData);
            console.log('Selected Data:', selectData);
            console.log('data:', data);
            mockupTable = await modalTable(data);
            $('#modal-add').prop('checked', true);
        });

        $(document).on('click', '#addData', async function (e) {
            e.preventDefault();

            // if (!mockupTable) {
            //     return;
            // }

            // const rows = mockupTable.rows({ page: 'all' }).data().toArray();
            // const checkboxes = document.querySelectorAll(
            //     '#modalTable tbody input.row-select-area',
            // );
            // const selectedRows = [];

            // checkboxes.forEach(function (checkbox, index) {
            //     if (checkbox.checked) {
            //         selectedRows.push(rows[index]);
            //     }
            // });

            const selectedRows = getSelectedData(mockupTable);
            console.log('Selected Rows:', selectedRows);

            if (!selectedRows.length) {
                alert('กรุณาเลือกข้อมูลก่อน');
                return;
            }

            tableArea = await createTable(
                {
                    data: selectedRows,
                    responsive: false,
                    columns: [
                        {
                            title: 'No.',
                            data: null,
                            render: (data, type, row, meta) => meta.row + 1,
                        },
                        { title: 'Location', data: 'LOCATION.LOCATION_NAME' },
                        { title: 'Area', data: 'AREA_NAME' },
                        { title: 'Level', data: 'AREA_LEVEL' },
                        { title: 'Area Owner', data: 'AREA_OWNER' },
                        {
                            title: 'Action',
                            data: null,
                            render: (data, type, row, meta) =>
                                '<button type="button" class="btn btn-sm btn-error dt-remove-row">×</button>',
                        },
                    ],
                },
                {
                    id: '#table-area',
                    domScroll: {
                        status: true,
                    },
                },
            );

            tableArea.on('click', '.dt-remove-row', function () {
                const row = tableArea.row($(this).closest('tr'));
                row.remove().draw();
            });

            // const areaTemplate = document.getElementById('area-row-template');
            // const emptyRow = document.getElementById('area-empty-row');

            // if (emptyRow) {
            //     emptyRow.remove();
            // }

            // selectedRows.forEach(function (row) {
            //     if (!areaTemplate) {
            //         return;
            //     }

            //     const clone = areaTemplate.content.cloneNode(true);
            //     const rowIndex =
            //         areaBody.querySelectorAll('tr:not(#area-empty-row)')
            //             .length + 1;

            //     clone.querySelector('td:first-child').textContent = rowIndex;
            //     clone.querySelector('input[name="area_location[]"]').value =
            //         row.LOCATION?.LOCATION_NAME || '';
            //     clone.querySelector('input[name="area_name[]"]').value =
            //         row.AREA_NAME || '';
            //     clone.querySelector('input[name="area_level[]"]').value =
            //         row.AREA_LEVEL || '';
            //     clone.querySelector('input[name="area_owner[]"]').value =
            //         row.AREA_OWNER || '';

            //     areaBody.appendChild(clone);
            // });

            $('#modal-add').prop('checked', false);
        });

        makeRadioGroupToggleable(
            'input[name="reqtype"]',
            toggleHostExternalSection,
        );
        makeRadioGroupToggleable(
            'input[name="req_subtype"]',
            toggleHostExternalSection,
        );
        makeRadioGroupToggleable('input[name="permit_option"]', function () {
            togglePermitOptionFields();
            updatePermitTypeRestrictions();
        });
        makeRadioGroupToggleable('#HELMET_STICKER, #PHOTO_PERMIT_BADGE');

        requestTypeRadios.forEach(function (radio) {
            radio.addEventListener('change', toggleHostExternalSection);
        });

        requestSubTypeRadios.forEach(function (radio) {
            radio.addEventListener('change', toggleHostExternalSection);
        });

        permitOptionRadios.forEach(function (radio) {
            radio.addEventListener('change', function () {
                togglePermitOptionFields();
                updatePermitTypeRestrictions();
            });
        });

        document.addEventListener('click', function (event) {
            if (event.target.closest('.remove-row')) {
                const row = event.target.closest('tr');
                if (row && visitorBody.contains(row)) {
                    if (visitorBody.rows.length > 1) {
                        row.remove();
                        updateVisitorIndexes();
                    }
                }
            }

            if (event.target.closest('.remove-area-row')) {
                const row = event.target.closest('tr');
                if (row && areaBody.contains(row)) {
                    row.remove();
                    updateAreaIndexes();

                    if (areaBody.querySelectorAll('tr').length === 0) {
                        areaBody.innerHTML = `
                            <tr id="area-empty-row">
                                <td colspan="6" class="border p-4 text-center text-slate-500">
                                    กรุณากดปุ่ม + เพื่อเลือกพื้นที่
                                </td>
                            </tr>
                        `;
                    }
                }
            }
        });

        toggleHostExternalSection();
        togglePermitOptionFields();
        updatePermitTypeRestrictions();
        updateAreaIndexes();
        updateVisitorIndexes();
        toggleHostExternalSection();
    }

    $(document).on('click', '#btnRequest', async function (event) {
        try {
            event.preventDefault();
            const requestType = $('input[name="REQUEST_TYPE"]:checked').val();
            const permitOption = $('input[name="permit_option"]:checked').val();
            const requiredMessage = [
                {
                    element: $('#REQBY'),
                    message: 'Please fill RequestBy',
                },
                {
                    element: $('input[name="REQUEST_TYPE"]'),
                    message: 'Please select RequestType',
                },
                {
                    element: $('#PURPOSE'),
                    message: 'Please fill Purpose',
                },
                {
                    element: $('input[name="permit_option"]'),
                    message: 'Please select Permit Date',
                },
                {
                    element: $('#HELMET_STICKER, #PHOTO_PERMIT_BADGE').not(
                        ':disabled',
                    ),
                    message: 'Please select Permit Type',
                },
            ];

            if (requestType === 'E') {
                requiredMessage.push({
                    element: $('input[name="REQUEST_SUB_TYPE"]'),
                    message: 'Please select the Request Subtype',
                });

                $('#visitor-table-body tr').each(function (index) {
                    $(this)
                        .find('input')
                        .each(function () {
                            requiredMessage.push({
                                element: $(this),
                                message: `Please fill Visitor row ${index + 1}`,
                            });
                        });
                });
            }

            if (requestType === 'H') {
                requiredMessage.push(
                    {
                        element: $('#APPLICANT_NAME'),
                        message: 'Please fill the Visitor Name',
                    },
                    {
                        element: $('#EMP_CODE'),
                        message: 'Please fill the Host Name',
                    },
                    {
                        element: $('#COMPANY_NAME'),
                        message: 'Please fill the Company Name',
                    },
                );
            }

            if (permitOption === 'long_term') {
                requiredMessage.push({
                    element: $('#LONGTERM_YEARS'),
                    message: 'Please fill the Year(s)',
                });
            }

            if (permitOption === 'period') {
                requiredMessage.push(
                    {
                        element: $('#PERMIT_START_DATE'),
                        message: 'Please fill the Start Date',
                    },
                    {
                        element: $('#PERMIT_END_DATE'),
                        message: 'Please fill the Valid Until',
                    },
                );
            }

            const areaRecords = (tableArea?.rows().data().toArray() ?? []).map(
                (row) => row.AREA_ID,
            );

            console.log('Area Records:', areaRecords);

            const areaRows = $('#area-table-body tr:not(#area-empty-row)');
            if (!areaRecords.length) {
                requiredMessage.push({
                    element: $('#area-table-body'),
                    message: 'Please fill Area to Recorded',
                });
            }

            areaRows.each(function (index) {
                $(this)
                    .find('input')
                    .each(function () {
                        requiredMessage.push({
                            element: $(this),
                            message: `Please fill Area to Recorded row ${index + 1}`,
                        });
                    });
            });

            const errors = requiredMessage
                .filter(({ element }) => {
                    if (!element.length) return true;
                    if (element.is(':radio, :checkbox')) {
                        return !element.is(':checked');
                    }
                    if (element.is('#area-table-body')) {
                        return !areaRows.length;
                    }
                    return !element
                        .toArray()
                        .some((field) => field.value.trim());
                })
                .map(({ message }) =>
                    message.replace(/^Please (fill|select) /, ''),
                );

            if (errors.length) {
                showMessage(
                    `<div>กรุณากรอกข้อมูลให้ครบ:</div>
                     <ul class="list-disc pl-5 mt-1 space-y-1">
                         ${errors.map((error) => `<li>${error}</li>`).join('')}
                     </ul>`,
                    'warning',
                );
                return;
            }

            const details = Array.from($('#visitor-table-body tr')).map(
                (row, index) => ({
                    seqNo: index + 1,
                    empCode: $(row).find('input').eq(0).val(),
                    name: $(row).find('input').eq(1).val(),
                    division: $(row).find('input').eq(2).val(),
                    department: $(row).find('input').eq(3).val(),
                    section: $(row).find('input').eq(4).val(),
                }),
            );

            if (!details.length) {
                showMessage('Please Add Visitor');
                return;
            }

            const submitDetails =
                requestType === 'H'
                    ? [
                          {
                              SEQ_NO: 1,
                              APPLICANT_TYPE: 'H',
                              EMP_CODE: $('#REQBY').val(),
                              APPLICANT_NAME: $('#APPLICANT_NAME').val(),
                              COMPANY_NAME: $('#COMPANY_NAME').val(),
                          },
                      ]
                    : details.map((detail) => ({
                          SEQ_NO: detail.seqNo,
                          APPLICANT_TYPE: 'E',
                          EMP_CODE: detail.empCode,
                          APPLICANT_NAME: detail.name,
                          COMPANY_NAME: '',
                      }));

            const formData = new FormData($('#tphForm')[0]);
            formData.set('REMARK', $('#remark').val());
            formData.set(
                'HELMET_STICKER',
                $('#HELMET_STICKER').is(':checked') ? 'Y' : 'N',
            );
            formData.set(
                'PHOTO_PERMIT_BADGE',
                $('#PHOTO_PERMIT_BADGE').is(':checked') ? 'Y' : 'N',
            );

            submitDetails.forEach((detail, index) => {
                Object.entries(detail).forEach(([key, value]) => {
                    formData.append(`DETAILS[${index}][${key}]`, value);
                });
            });

            areaRecords.forEach((record, index) => {
                formData.append(`AREA_ID[${index}]`, record ?? '');
            });

            console.table(submitDetails);
            console.table(areaRecords);

            logFormData(formData);
            const res = await createForm(formData);
            if (res.status == true) {
                showMessage(res.message, 'success');
                redirectWebflow();
            } else {
                throw new Error(res.message);
            }
        } catch (error) {
            console.error('GP-TPH form submission failed', {
                name: error?.name,
                message: error?.message,
                response: error?.response,
                data: error?.response?.data,
                error,
            });
            showMessage(error?.message || 'Unable to submit the form');
        }
    });

    document.addEventListener('DOMContentLoaded', function () {
        try {
            initCreatePage();
        } catch (error) {
            console.error('Error initializing the create page:', error);
        }
    });
})();
