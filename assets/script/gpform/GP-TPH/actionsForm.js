import { createTable } from '@amec/webasset/dataTable';
import { getEmpData, getAreas, getLocations } from './data';
import { data } from 'jquery';

(function () {
    const areaStorageKey = 'gp-tph-photo-permission-areas';

    function getStoredAreas() {
        try {
            return JSON.parse(localStorage.getItem(areaStorageKey)) || [];
        } catch (error) {
            return [];
        }
    }

    function saveStoredAreas(areas) {
        localStorage.setItem(areaStorageKey, JSON.stringify(areas));
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
            'input[name="reqtype"]',
        );
        const requestSubTypeRadios = document.querySelectorAll(
            'input[name="req_subtype"]',
        );
        const permitOptionRadios = document.querySelectorAll(
            'input[name="permit_option"]',
        );
        const hostExternalRadio = document.querySelector(
            'input[name="reqtype"][value="host_external"]',
        );
        const employeeRadio = document.querySelector(
            'input[name="reqtype"][value="employee"]',
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
        // ฟังก์ชันหลักที่ทำงานเมื่อโหลดหน้า
        $(async function () {
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            const empno = urlParams.get('empno');
            const getareas = await getAreas();
            const getlocations = await getLocations();

            var mockupTable = await createTable(
                {
                    data: getareas,
                    getLocations,
                    responsive: false,
                    columns: [
                        {
                            title: 'Sel',
                            data: null,
                            orderable: false,
                            searchable: false,
                            render: function (data, type, row) {
                                return `
                        <input
                            type="checkbox"
                            class="row-select-area"
                            value="${row.AREA_ID || row.id || row.LOCATION_NAME || ''}"
                        />
                    `;
                            },
                        },
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
                },
            );

            const getName = await getEmpData(empno);
            $('#INPUTBY').val(empno);
        });

        $(document).on('change', '#REQBY', async function (e) {
            e.preventDefault();

            try {
                const empData = await getEmpData($(this).val());
                if (!empData || !empData.SNAME) {
                    showMessage('Employee data not found', 'error');
                    $(this).val('');
                    $(this).focus();
                    s;
                    return;
                }
                $('#empName').val(empData.SNAME);
                $('#empDiv').val(
                    `${empData.SSEC}/${empData.SDEPT}/${empData.SDIV}`,
                );
                $('#host_name').val(empData.SNAME);
            } catch (error) {
                console.log(error);
            }
        });

        $(document).on(
            'change',
            '#visitor_empcode',
            '#REQBY',
            async function (e) {
                e.preventDefault();
                try {
                    const empData = await getEmpData($(this).val());
                    if (!empData || !empData.SNAME) {
                        showMessage('Employee data not found', 'error');
                        $(this).val('');
                        $(this).focus();
                        return;
                    }
                    $('#visitor_name').val(empData.SNAME);
                    $('#visitor_div').val(empData.SDIV);
                    $('#visitor_dept').val(empData.SDEPT);
                    $('#visitor_sec').val(empData.SSEC);
                } catch (error) {
                    console.log(error);
                }
            },
        );

        $(document).on('click', '#btnaddDatarow', function (e) {
            e.preventDefault();

            const location = $('#LOCATION').val();
            const area = $('#AREANAME').val();
            const level = $('#AREALEVEL').val();
            const areaOwner = $('#AREAOWNER').val();

            $('#modal-add').prop('checked', true);
        });

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

                        if (callback) {
                            callback();
                        }
                    }
                });
            });
        }

        function clearRequestTypeRelatedFields() {
            const isHostExternal = hostExternalRadio
                ? hostExternalRadio.checked
                : false;

            document
                .querySelectorAll('input[name="req_subtype"]')
                .forEach(function (radio) {
                    if (isHostExternal) {
                        radio.checked = false;
                    }
                });

            // Don't clear values from the hidden section when switching request type.
            // Keep the user's input so it remains visible when they switch back.
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

        function toggleHostExternalSection() {
            const isHostExternal = hostExternalRadio
                ? hostExternalRadio.checked
                : false;
            const isEmployee = employeeRadio ? employeeRadio.checked : false;
            const employeeRequestLabels = document.querySelectorAll(
                '.employee-request-group',
            );
            const hostRequestLabel = document.querySelector(
                '.host-request-group',
            );

            if (isHostExternal) {
                applicantVisitorSection.classList.add('hidden');
                hostExternalSection.classList.remove('hidden');
                employeeRequestLabels.forEach(function (label) {
                    label.classList.add('opacity-50');
                    label.setAttribute('aria-disabled', 'true');
                });
                if (hostRequestLabel) {
                    hostRequestLabel.classList.remove('opacity-50');
                    hostRequestLabel.removeAttribute('aria-disabled');
                }
            } else if (isEmployee) {
                applicantVisitorSection.classList.remove('hidden');
                hostExternalSection.classList.add('hidden');
                employeeRequestLabels.forEach(function (label) {
                    label.classList.remove('opacity-50');
                    label.removeAttribute('aria-disabled');
                });
                if (hostRequestLabel) {
                    hostRequestLabel.classList.add('opacity-50');
                    hostRequestLabel.setAttribute('aria-disabled', 'true');
                }
            } else {
                applicantVisitorSection.classList.remove('hidden');
                hostExternalSection.classList.add('hidden');
                employeeRequestLabels.forEach(function (label) {
                    label.classList.remove('opacity-50');
                    label.removeAttribute('aria-disabled');
                });
                if (hostRequestLabel) {
                    hostRequestLabel.classList.remove('opacity-50');
                    hostRequestLabel.removeAttribute('aria-disabled');
                }
            }

            clearRequestTypeRelatedFields();
            updatePermitTypeRestrictions();
        }

        function togglePermitOptionFields() {
            const selectedPermitOption = document.querySelector(
                'input[name="permit_option"]:checked',
            );
            const longTermYearsInput = document.querySelector(
                'input[name="permit_long_term_years"]',
            );
            const startDateInput = document.querySelector(
                'input[name="permit_start_date"]',
            );
            const validUntilInput = document.querySelector(
                'input[name="permit_valid_until"]',
            );

            if (!longTermYearsInput || !startDateInput || !validUntilInput) {
                return;
            }

            const isLongTerm = selectedPermitOption?.value === 'long_term';
            const isPeriod = selectedPermitOption?.value === 'period';

            longTermYearsInput.disabled = !isLongTerm;
            startDateInput.disabled = !isPeriod;
            validUntilInput.disabled = !isPeriod;
        }

        function updatePermitTypeRestrictions() {
            const isHostExternal = hostExternalRadio
                ? hostExternalRadio.checked
                : false;
            const longTermRadio = document.querySelector(
                'input[name="permit_option"][value="long_term"]',
            );
            const periodRadio = document.querySelector(
                'input[name="permit_option"][value="period"]',
            );
            const permitTypeInputs = document.querySelectorAll(
                'input[name="permit_type[]"], input[name="permit_halmet"], input[name="permit_photo"]',
            );
            const photoPermitBadgeInput = document.querySelector(
                'input[value="photo_permit_badge"], input[name="permit_photo"]',
            );

            if (isHostExternal) {
                if (periodRadio) {
                    periodRadio.checked = true;
                }
                if (longTermRadio) {
                    longTermRadio.disabled = true;
                }
                if (periodRadio) {
                    periodRadio.disabled = false;
                }

                permitTypeInputs.forEach(function (field) {
                    const isPhotoPermit =
                        field.value === 'photo_permit_badge' ||
                        field.name === 'permit_photo';

                    if (isPhotoPermit) {
                        field.disabled = false;
                        if (!field.checked) {
                            field.checked = true;
                        }
                    } else {
                        field.disabled = true;
                        field.checked = false;
                    }
                });
            } else {
                if (longTermRadio) {
                    longTermRadio.disabled = false;
                }
                if (periodRadio) {
                    periodRadio.disabled = false;
                }

                permitTypeInputs.forEach(function (field) {
                    field.disabled = false;
                });
            }

            if (photoPermitBadgeInput) {
                photoPermitBadgeInput.checked = isHostExternal;
            }

            togglePermitOptionFields();
        }

        addVisitorBtn.addEventListener('click', function () {
            const clone = visitorTemplate.content.cloneNode(true);
            visitorBody.appendChild(clone);
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

        toggleHostExternalSection();
        togglePermitOptionFields();
        updatePermitTypeRestrictions();

        document.addEventListener('click', function (event) {
            if (event.target.closest('.remove-row')) {
                const row = event.target.closest('tr');
                if (row && visitorBody.contains(row)) {
                    if (visitorBody.rows.length > 1) {
                        row.remove();
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

        updateAreaIndexes();
        toggleHostExternalSection();
    }

    function initAreaPage() {
        const searchArea = document.getElementById('searchArea');
        const newAreaButton = document.getElementById('newAreaButton');
        const cancelAreaButton = document.getElementById('cancelAreaButton');
        const areaForm = document.getElementById('areaForm');
        const areaTableBody = document.getElementById('areaTableBody');

        if (
            !searchArea ||
            !newAreaButton ||
            !cancelAreaButton ||
            !areaForm ||
            !areaTableBody
        ) {
            return;
        }

        const serverAreas = Array.isArray(window.gpTPHServerAreas)
            ? window.gpTPHServerAreas
            : [];
        let editingRow = null;

        function syncServerAreas() {
            const storedAreas = getStoredAreas();
            const storedIds = new Set(
                storedAreas.map((area) => String(area.id)),
            );
            const mergedAreas = storedAreas.slice();

            serverAreas.forEach(function (area) {
                if (!storedIds.has(String(area.id))) {
                    mergedAreas.push({
                        id: String(area.id),
                        location: area.location || '',
                        area: area.area || '',
                        level: area.level || '',
                        area_owner: area.area_owner || '',
                    });
                }
            });

            saveStoredAreas(mergedAreas);
        }

        function addStoredAreaRow(area) {
            const row = document.createElement('tr');
            row.dataset.localId = area.id;
            row.innerHTML = `
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>
                    <button type="button" class="action-link table-action-button edit-row" title="แก้ไขข้อมูล">
                        <span class="edit-icon">✎</span>
                    </button>
                    <button type="button" class="action-link table-action-button delete-row" title="ลบข้อมูล">
                        <span class="delete-icon">🗑</span>
                    </button>
                </td>
            `;

            row.cells[1].textContent = area.location;
            row.cells[2].textContent = area.area;
            row.cells[3].textContent = area.level;
            row.cells[4].textContent = area.area_owner;
            areaTableBody.appendChild(row);
        }

        function renderStoredAreas() {
            const areas = getStoredAreas();

            if (areas.length > 0) {
                const emptyRow = areaTableBody.querySelector('.empty-row');
                if (emptyRow) {
                    emptyRow.closest('tr').remove();
                }
            }

            areas.forEach(function (area) {
                addStoredAreaRow(area);
            });
            updateRowNumbers();
        }

        function updateRowNumbers() {
            areaTableBody
                .querySelectorAll('tr:not(.empty-row)')
                .forEach(function (row, index) {
                    row.cells[0].textContent = index + 1;
                });
        }

        function closeAreaForm() {
            areaForm.reset();
            editingRow = null;
            areaForm.classList.remove('is-visible');
        }

        syncServerAreas();
        renderStoredAreas();

        searchArea.addEventListener('input', function () {
            const keyword = this.value.toLowerCase();
            const rows = areaTableBody.querySelectorAll('tr');

            rows.forEach(function (row) {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(keyword) ? '' : 'none';
            });
        });

        newAreaButton.addEventListener('click', function () {
            areaForm.classList.add('is-visible');
            areaForm.querySelector('input').focus();
        });

        cancelAreaButton.addEventListener('click', function () {
            closeAreaForm();
        });

        areaForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const formData = new FormData(areaForm);
            const emptyRow = areaTableBody.querySelector('.empty-row');

            if (emptyRow) {
                emptyRow.closest('tr').remove();
            }

            const areas = getStoredAreas();
            const area = {
                id: editingRow?.dataset.localId || Date.now().toString(),
                location: formData.get('location'),
                area: formData.get('area'),
                level: formData.get('level'),
                area_owner: formData.get('area_owner'),
            };

            if (editingRow?.dataset.localId) {
                const index = areas.findIndex((item) => item.id === area.id);
                if (index !== -1) {
                    areas[index] = area;
                }
                editingRow.remove();
            } else {
                areas.push(area);
            }

            saveStoredAreas(areas);
            addStoredAreaRow(area);

            updateRowNumbers();
            closeAreaForm();
        });

        areaTableBody.addEventListener('click', function (event) {
            const editButton = event.target.closest('.edit-row');
            const deleteButton = event.target.closest('.delete-row');

            if (editButton) {
                editingRow = editButton.closest('tr');
                areaForm.elements.location.value =
                    editingRow.cells[1].textContent;
                areaForm.elements.area.value = editingRow.cells[2].textContent;
                areaForm.elements.level.value = editingRow.cells[3].textContent;
                areaForm.elements.area_owner.value =
                    editingRow.cells[4].textContent;
                areaForm.classList.add('is-visible');
                areaForm.elements.location.focus();
            }

            if (deleteButton && confirm('ยืนยันการลบข้อมูลนี้หรือไม่?')) {
                const row = deleteButton.closest('tr');
                const localId = row.dataset.localId;

                if (localId) {
                    saveStoredAreas(
                        getStoredAreas().filter((area) => area.id !== localId),
                    );
                }

                row.remove();
                updateRowNumbers();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initCreatePage();
        initAreaPage();
    });
})();
