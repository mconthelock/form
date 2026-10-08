import { createTable, getSelectedData } from '@amec/webasset/dataTable';
import { logFormData, showMessage } from '@amec/webasset/utils';
import {
    getEmpData,
    getAreas,
    getLocations,
    getFormData,
    createForm,
    updateForm,
} from './data';
import { webflowSubmit } from '@amec/webasset/components/form';
import { redirectWebflow } from '@amec/webasset/form';
import { setDatePicker } from '@amec/webasset/flatpickr';
import {
    getAllDepartment,
    getAllDivision,
    searchUser,
} from '@amec/webasset/api/amec';

(function () {
    let mockupTable = null;
    let tableArea = null;
    let editingForm = null;
    let longTermValidUntil = '';
    const areaOwnerLabels = new Map();

    async function validateGroupApplicants(employeeCodes) {
        const requestBy = $('#REQBY').val().trim();
        if (!requestBy) {
            throw new Error('กรุณาระบุ Request By ก่อนเพิ่มรายชื่อ Group Request');
        }
        const codes = [requestBy, ...employeeCodes];
        const employees = await Promise.all(codes.map(getEmpData));
        const departments = new Set();
        employees.forEach((employee, index) => {
            const department = String(employee?.SDEPCODE || '').trim();
            if (!employee?.SNAME || String(employee.CSTATUS) !== '1' || !department) {
                throw new Error(`ไม่สามารถตรวจสอบ Department ของพนักงาน ${codes[index]} ได้`);
            }
            departments.add(department);
        });
        if (departments.size > 1) {
            throw new Error('รายชื่อใน Group Request ต้องอยู่ใน Department เดียวกับ Request By');
        }
        return employees.slice(1);
    }

    function getItems(response) {
        if (Array.isArray(response)) {
            return response;
        }

        return Array.isArray(response?.data) ? response.data : [];
    }

    function getShortOrganizationName(shortName, fullName) {
        const abbreviation = String(shortName || '').trim();
        if (abbreviation) {
            return abbreviation
                .replace(/\(\s*cancel\s*\)/gi, '')
                .replace(/\s{2,}/g, ' ')
                .trim();
        }

        const name = String(fullName || '').trim();
        const commaIndex = name.lastIndexOf(',');
        return (commaIndex >= 0 ? name.slice(commaIndex + 1).trim() || name : name)
            .replace(/\(\s*cancel\s*\)/gi, '')
            .replace(/\s{2,}/g, ' ')
            .trim();
    }

    async function loadAreaOwnerLabels() {
        const [employees, departments, divisions] = await Promise.all([
            searchUser(),
            getAllDepartment(),
            getAllDivision(),
        ]);
        const departmentNames = new Map(
            getItems(departments)
                .map((department) => [
                    String(department.SDEPCODE || '').trim(),
                    getShortOrganizationName(
                        department.SDEPT,
                        department.SDEPARTMENT,
                    ),
                ])
                .filter(([code, name]) => code && name),
        );
        const divisionNames = new Map(
            getItems(divisions)
                .map((division) => [
                    String(division.SDIVCODE || '').trim(),
                    getShortOrganizationName(
                        division.SDIV,
                        division.SDIVISION,
                    ),
                ])
                .filter(([code, name]) => code && name),
        );
        const positionNames = new Map();

        getItems(employees).forEach((employee) => {
            const positionCode = String(employee.SPOSCODE || '').trim();
            const positionName = String(
                employee.SPOSNAME || employee.SPOSITION || '',
            ).trim();
            if (positionCode && positionName && !positionNames.has(positionCode)) {
                positionNames.set(positionCode, positionName);
            }
        });

        areaOwnerLabels.clear();
        positionNames.forEach((positionName, positionCode) => {
            departmentNames.forEach((departmentName, departmentCode) => {
                areaOwnerLabels.set(
                    `${positionCode}+${departmentCode}`,
                    `${departmentName} / ${positionName}`,
                );
            });
            divisionNames.forEach((divisionName, divisionCode) => {
                areaOwnerLabels.set(
                    `${positionCode}+${divisionCode}`,
                    `${divisionName} / ${positionName}`,
                );
            });
        });
    }

    function getAreaOwnerLabel(area) {
        const organizationCode = String(area.AREA_OWNER || '').trim();
        const positionCode = String(area.AREA_OWNER_POSCODE || '').trim();
        const ownerValue =
            positionCode && organizationCode
                ? `${positionCode}+${organizationCode}`
                : organizationCode;

        return areaOwnerLabels.get(ownerValue) || ownerValue || '-';
    }

    function calculateLongTermValidUntil(yearsValue) {
        const years = Number(yearsValue);
        if (!Number.isSafeInteger(years) || years < 1 || years > 2) {
            return '';
        }

        const validUntil = new Date();
        const originalMonth = validUntil.getMonth();
        validUntil.setFullYear(validUntil.getFullYear() + years);
        if (Number.isNaN(validUntil.getTime())) {
            return '';
        }
        if (validUntil.getMonth() !== originalMonth) {
            validUntil.setDate(0);
        }

        const year = validUntil.getFullYear();
        const month = String(validUntil.getMonth() + 1).padStart(2, '0');
        const day = String(validUntil.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function setLongTermValidUntil(value) {
        longTermValidUntil = value;
        const display = document.getElementById(
            'LONGTERM_VALID_UNTIL_DISPLAY',
        );
        if (display) {
            display.textContent =
                value || 'Enter year(s) to calculate the end date.';
        }
    }

    async function populateRequester(empno) {
        const empData = await getEmpData(empno);
        if (!empData || !empData.SNAME) {
            throw new Error('Employee data not found');
        }
        if (String(empData.CSTATUS) !== '1') {
            throw new Error('Employee has resigned');
        }

        $('#empName').val(empData.SNAME);
        $('#empDiv').val(`${empData.SSEC}/${empData.SDEPT}/${empData.SDIV}`);
        return empData;
    }

    async function modalTable(data) {
        const table = await createTable(
            {
                data: data,
                responsive: false,
                columns: [
                    { title: 'Location', data: 'LOCATION.LOCATION_NAME' },
                    { title: 'Area', data: 'AREA_NAME' },
                    { title: 'Level', data: 'AREA_LEVEL' },
                    {
                        title: 'Area Owner',
                        data: null,
                        render: (data, type, row) => getAreaOwnerLabel(row),
                    },
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

    function filterAreaModal() {
        if (!mockupTable) {
            return;
        }

        mockupTable
            .column(1)
            .search($('#LOCATION').val().trim())
            .column(2)
            .search($('#AREANAME').val().trim())
            .column(3)
            .search($('#AREALEVEL').val().trim())
            .draw();
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

        function populateIndividualRequester(empData) {
            const row = visitorBody.rows[0];
            if (!row) {
                return;
            }

            while (visitorBody.rows.length > 1) {
                visitorBody.deleteRow(1);
            }

            const inputs = row.querySelectorAll('input');
            inputs[0].value = $('#REQBY').val().trim();
            inputs[1].value = empData.SNAME || '';
            inputs[2].value = empData.SDIV || '';
            inputs[3].value = empData.SDEPT || '';
            inputs[4].value = empData.SSEC || '';
        }

        async function populateRequesterForSelectedDesign(defaultToIndividual = false) {
            const requestBy = $('#REQBY').val().trim();
            if (!requestBy) {
                return;
            }

            const empData = await populateRequester(requestBy);
            if (
                defaultToIndividual &&
                requestBy === $('#INPUTBY').val().trim()
            ) {
                employeeRadio.checked = true;
                document.querySelector(
                    'input[name="REQUEST_SUB_TYPE"][value="I"]',
                ).checked = true;
                toggleHostExternalSection();
            }

            const requestType = document.querySelector(
                'input[name="REQUEST_TYPE"]:checked',
            )?.value;
            const requestSubType = document.querySelector(
                'input[name="REQUEST_SUB_TYPE"]:checked',
            )?.value;
            if (requestType === 'E' && requestSubType === 'I') {
                populateIndividualRequester(empData);
            } else if (requestType === 'E' && requestSubType === 'G') {
                const employeeCodes = Array.from(visitorBody.rows)
                    .map((row) => row.querySelector('input').value.trim())
                    .filter(Boolean);
                await validateGroupApplicants(employeeCodes);
            } else if (requestType === 'H') {
                $('#HOST_NAME').val(empData.SNAME);
            }
        }

        async function refreshRequesterForSelectedDesign(defaultToIndividual = false) {
            try {
                await populateRequesterForSelectedDesign(defaultToIndividual);
            } catch (error) {
                console.error(
                    'Unable to load Request By employee data.',
                    error,
                );
                showMessage(error.message, 'error');
            }
        }

        async function setSelectedAreas(selectedRows) {
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
                        {
                            title: 'Area Owner',
                            data: null,
                            render: (data, type, row) =>
                                getAreaOwnerLabel(row),
                        },
                        {
                            title: 'Action',
                            data: null,
                            render: () =>
                                '<button type="button" class="btn btn-sm btn-error dt-remove-row">ร—</button>',
                        },
                    ],
                },
                { id: '#table-area', domScroll: { status: true } },
            );
            tableArea.on('click', '.dt-remove-row', function () {
                tableArea.row($(this).closest('tr')).remove().draw();
            });
        }

        function populateVisitors(details) {
            visitorBody.replaceChildren();
            details.forEach((detail) => {
                const clone = visitorTemplate.content.cloneNode(true);
                const inputs = clone.querySelectorAll('input');
                inputs[0].value = detail.EMP_CODE || '';
                inputs[1].value = detail.APPLICANT_NAME || '';
                visitorBody.appendChild(clone);
            });
            if (!visitorBody.rows.length) {
                visitorBody.appendChild(
                    visitorTemplate.content.cloneNode(true),
                );
            }
            updateVisitorIndexes();
        }

        async function loadExistingRequest(areas) {
            const marker = document.getElementById('gp-tph-form-data');
            if (!marker) return;

            editingForm = {
                NFRMNO: marker.dataset.nfrmno,
                VORGNO: marker.dataset.vorgno,
                CYEAR: marker.dataset.cyear,
                CYEAR2: marker.dataset.cyear2,
                NRUNNO: marker.dataset.nrunno,
            };
            const data = await getFormData(
                editingForm.NFRMNO,
                editingForm.VORGNO,
                editingForm.CYEAR,
                editingForm.CYEAR2,
                editingForm.NRUNNO,
            );
            if (!data) throw new Error('GP-TPH request was not found');

            $('#INPUTBY').val(data.form?.VINPUTER || '');
            $('#REQBY').val(data.form?.VREQNO || '');
            $('#PURPOSE').val(data.PURPOSE || '');
            $('#LONGTERM_YEARS').val(data.LONGTERM_YEARS || '');
            $('#PERMIT_START_DATE').val(
                data.PERMIT_START_DATE?.split('T')[0] || '',
            );
            $('#PERMIT_END_DATE').val(
                data.PERMIT_END_DATE?.split('T')[0] || '',
            );
            $(`input[name="REQUEST_TYPE"][value="${data.REQUEST_TYPE}"]`).prop(
                'checked',
                true,
            );
            $(
                `input[name="REQUEST_SUB_TYPE"][value="${data.REQUEST_SUB_TYPE}"]`,
            ).prop('checked', true);
            $(
                `input[name="permit_option"][value="${data.LONGTERM_YEARS ? 'long_term' : 'period'}"]`,
            ).prop('checked', true);
            $('#HELMET_STICKER').prop('checked', data.HELMET_STICKER === 'Y');
            $('#PHOTO_PERMIT_BADGE').prop(
                'checked',
                data.PHOTO_PERMIT_BADGE === 'Y',
            );
            toggleHostExternalSection();
            togglePermitOptionFields();
            updatePermitTypeRestrictions();
            if (data.LONGTERM_YEARS) {
                setLongTermValidUntil(
                    data.PERMIT_END_DATE?.split('T')[0] ||
                        calculateLongTermValidUntil(data.LONGTERM_YEARS),
                );
            }

            if (data.REQUEST_TYPE === 'H') {
                const applicant = data.DETAILS?.[0] || {};
                $('#APPLICANT_NAME')
                    .last()
                    .val(applicant.APPLICANT_NAME || '');
                const host = await populateRequester($('#REQBY').val().trim());
                $('#HOST_NAME').val(host.SNAME);
                $('#COMPANY_NAME').val(applicant.COMPANY_NAME || '');
            } else {
                populateVisitors(data.DETAILS || []);
            }

            const selectedIds = new Set(
                (data.AREA_RECORDS || []).map((record) =>
                    String(record.AREA_ID),
                ),
            );
            await setSelectedAreas(
                areas.filter((area) => selectedIds.has(String(area.AREA_ID))),
            );
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
            document
                .getElementById('long-term-valid-until')
                ?.classList.toggle(
                    'hidden',
                    selectedPermitOption?.value !== 'long_term',
                );
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
            const [getareas] = await Promise.all([
                getAreas(),
                getLocations(),
                loadAreaOwnerLabels().catch((error) => {
                    console.error('Unable to load GP-TPH area owner labels.', error);
                    showMessage('ไม่สามารถโหลดชื่อ Area Owner ได้', 'error');
                }),
            ]);
            const action = webflowSubmit({ request: true });
            $('#sentRequest').html(action);
            mockupTable = await modalTable(
                getareas.filter(
                    (area) => String(area.AREA_STATUS ?? '1') !== '0',
                ),
            );
            await setDatePicker();
            if (document.getElementById('gp-tph-form-data')) {
                await loadExistingRequest(getareas);
            } else {
                $('#INPUTBY').val(empno || '');
            }
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

        $(document).on('click', '#btnSearch', function () {
            filterAreaModal();
        });

        $(document).on('click', '#btnClear', function () {
            $('#AREANAME, #AREALEVEL, #LOCATION').val('');
            filterAreaModal();
        });

        $(document).on(
            'keydown',
            '#AREANAME, #AREALEVEL, #LOCATION',
            function (event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    filterAreaModal();
                }
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
            await refreshRequesterForSelectedDesign(true);
        });

        $(document).on(
            'change',
            '#visitor_empcode, input[name="visitor_emp_code[]"]',
            async function (e) {
                e.preventDefault();
                const visitorRow = $(this).closest('tr');
                visitorRow.find('input').slice(1).val('');

                try {
                    const employeeCode = $(this).val().trim();
                    if (!employeeCode) return;
                    const isGroup = employeeRadio?.checked &&
                        $('input[name="REQUEST_SUB_TYPE"]:checked').val() === 'G';
                    let empData;
                    if (isGroup) {
                        const employeeCodes = Array.from(visitorBody.rows)
                            .map((row) => row.querySelector('input').value.trim())
                            .filter(Boolean);
                        const employees = await validateGroupApplicants(employeeCodes);
                        empData = employees[employeeCodes.indexOf(employeeCode)];
                    } else {
                        empData = await getEmpData(employeeCode);
                    }
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
                        .find('input[name="APPLICANT_NAME"]')
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
                    console.error('Unable to load visitor employee data.', error);
                    $(this).val('');
                    visitorRow.find('input').slice(1).val('');
                    showMessage(error.message || 'ไม่สามารถตรวจสอบข้อมูลพนักงานได้', 'error');
                    $(this).focus();
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
                        {
                            title: 'Area Owner',
                            data: null,
                            render: (data, type, row) =>
                                getAreaOwnerLabel(row),
                        },
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
        requestTypeRadios.forEach(function (radio) {
            radio.addEventListener('change', async function () {
                toggleHostExternalSection();
                if (this.value === 'H' && this.checked) {
                    await refreshRequesterForSelectedDesign();
                }
            });
        });

        requestSubTypeRadios.forEach(function (radio) {
            radio.addEventListener('change', async function () {
                toggleHostExternalSection();
                if (!this.checked) {
                    return;
                }

                await refreshRequesterForSelectedDesign();
            });
        });

        permitOptionRadios.forEach(function (radio) {
            radio.addEventListener('change', function () {
                $('#PERMIT_START_DATE, #PERMIT_END_DATE').val('');
                setLongTermValidUntil(
                    this.value === 'long_term'
                        ? calculateLongTermValidUntil(
                              $('#LONGTERM_YEARS').val(),
                          )
                        : '',
                );
                togglePermitOptionFields();
                updatePermitTypeRestrictions();
            });
        });

        $('#LONGTERM_YEARS').on('input change', function () {
            if (
                document.querySelector(
                    'input[name="permit_option"][value="long_term"]',
                )?.checked
            ) {
                    setLongTermValidUntil(
                    calculateLongTermValidUntil(this.value),
                );
            }
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
                        element: $('#host-external-section #APPLICANT_NAME'),
                        message: 'Please fill the Visitor Name',
                    },
                    {
                        element: $('#HOST_NAME'),
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

            if (
                permitOption === 'long_term' &&
                (!Number.isSafeInteger(Number($('#LONGTERM_YEARS').val())) ||
                    Number($('#LONGTERM_YEARS').val()) < 1 ||
                    Number($('#LONGTERM_YEARS').val()) > 2)
            ) {
                showMessage('กรุณาระบุจำนวนปีเป็นจำนวนเต็มตั้งแต่ 1 ถึง 2 ปี', 'warning');
                $('#LONGTERM_YEARS').focus();
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

            if (
                requestType === 'E' &&
                $('input[name="REQUEST_SUB_TYPE"]:checked').val() === 'G'
            ) {
                await validateGroupApplicants(details.map((detail) => detail.empCode.trim()));
            }

            const submitDetails =
                requestType === 'H'
                    ? [
                          {
                              SEQ_NO: 1,
                              APPLICANT_TYPE: 'H',
                              EMP_CODE: $('#REQBY').val().trim(),
                              APPLICANT_NAME: $(
                                  '#host-external-section #APPLICANT_NAME',
                              ).val(),
                              COMPANY_NAME: $(
                                  '#host-external-section #COMPANY_NAME',
                              ).val(),
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
            if (permitOption === 'long_term') {
                formData.set('PERMIT_END_DATE', longTermValidUntil);
            }
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
            const res = editingForm
                ? await updateForm(editingForm, formData)
                : await createForm(formData);
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
