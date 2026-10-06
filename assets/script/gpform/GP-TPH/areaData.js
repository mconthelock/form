import { showMessage } from '@amec/webasset/utils';
import {
    getAllDepartment,
    getAllDivision,
    searchUser,
} from '@amec/webasset/api/amec';
import { setSelect2 } from '@amec/webasset/select2';
import select2 from 'select2';
import {
    createArea,
    getAreas,
    getLocations,
    updateArea,
} from './data';

select2();

let areas = [];
let locations = [];

let editingAreaId = null;
let currentPage = 1;
const areasPerPage = 20;
const areaOwnerLabels = new Map();
const departmentNames = new Map();
const divisionNames = new Map();
const positionNames = new Map();
const cancelledDepartmentCodes = new Set();
const cancelledDivisionCodes = new Set();

function getItems(response) {
    if (Array.isArray(response)) {
        return response;
    }

    return Array.isArray(response?.data) ? response.data : [];
}

function getAreaId(area) {
    return area.AREA_ID || area.id;
}

function getAreaOwnerValue(area) {
    const ownerCode = area.AREA_OWNER || area.area_owner || '';
    const positionCode =
        area.AREA_OWNER_POSCODE || area.area_owner_poscode || '';

    return positionCode && ownerCode
        ? `${positionCode}+${ownerCode}`
        : ownerCode;
}

function getLocationId(area) {
    return area.LOCATION_ID || area.location_id || area.LOCATION?.LOCATION_ID;
}

function getLocationName(area) {
    if (area.LOCATION?.LOCATION_NAME) {
        return area.LOCATION.LOCATION_NAME;
    }

    const locationId = getLocationId(area);
    const location = locations.find(
        (item) => String(item.LOCATION_ID || item.id) === String(locationId),
    );

    return location?.LOCATION_NAME || '-';
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

function hasCancelledMarker(...names) {
    return names.some((name) => /\(\s*cancel\s*\)/i.test(String(name || '')));
}

function getOwnerOrg(emp) {
    const deptCode = String(emp.SDEPCODE || emp.SDEPCOD || '').trim();
    if (deptCode && deptCode !== '00') {
        return {
            code: deptCode,
            name:
                departmentNames.get(deptCode) ||
                getShortOrganizationName(emp.SDEPT, emp.SDEPARTMENT),
        };
    }

    const divisionCode = String(emp.SDIVCODE || '').trim();
    return {
        code: divisionCode,
        name:
            divisionNames.get(divisionCode) ||
            getShortOrganizationName(emp.SDIV, emp.SDIVISION),
    };
}

function getOwnerPositionName(emp) {
    const posCode = String(emp.SPOSCODE || '').trim();
    const shortName = String(emp.SPOSNAME || '').trim();

    if (shortName && shortName !== posCode) {
        return shortName;
    }

    return String(emp.SPOSITION || '').trim() || shortName;
}

function getAreaOwnerOption(emp) {
    const posCode = String(emp.SPOSCODE || '').trim();
    const posName =
        positionNames.get(posCode) ||
        getOwnerPositionName(emp) ||
        posCode;
    const org = getOwnerOrg(emp);
    if (!posCode || !org.code) {
        return null;
    }

    return {
        value: `${posCode}+${org.code}`,
        text: `${org.name || '-'} / ${posName}`,
    };
}

function getAreaOwnerLabel(value) {
    const ownerValue = String(value ?? '').trim();
    if (!ownerValue) {
        return '-';
    }

    if (areaOwnerLabels.has(ownerValue)) {
        return areaOwnerLabels.get(ownerValue);
    }

    const [positionCode, organizationCode] = ownerValue.split('+');
    const organizationName =
        departmentNames.get(organizationCode) ||
        divisionNames.get(organizationCode);
    const positionName = positionNames.get(positionCode);

    return organizationName && positionName
        ? `${organizationName} / ${positionName}`
        : ownerValue;
}

function setOwnerSelect(value = '') {
    const $owner = $('#AREA_OWNER');
    if (!$owner.length) {
        return;
    }

    if (value && !$owner.find(`option[value="${value}"]`).length) {
        $owner.append(new Option(getAreaOwnerLabel(value), value, true, true));
    }
    $owner.val(value).trigger('change');
}

function setLocationSelect(value = '') {
    const $location = $('#LOCATION_ID');
    if ($location.length) {
        $location.val(value).trigger('change');
    }
}

function forceSelect2Below(selectElement) {
    const $select = $(selectElement);
    let directionObserver;

    const applyBelowDirection = () => {
        const dialog = document.getElementById('areaFormDialog');
        const dropdown = dialog?.querySelector('.select2-dropdown');
        const dropdownContainer = dropdown?.parentElement;
        const selectionContainer = $select.next('.select2-container')[0];
        if (!dialog || !dropdown || !dropdownContainer || !selectionContainer) {
            return;
        }

        let $positionParent = $(dialog);
        if ($positionParent.css('position') === 'static') {
            $positionParent = $positionParent.offsetParent();
        }

        const selectionOffset = $(selectionContainer).offset();
        const parentOffset = $positionParent.offset() || { top: 0 };
        const top =
            selectionOffset.top +
            $(selectionContainer).outerHeight() -
            parentOffset.top +
            ($positionParent.scrollTop() || 0);
        if (Math.abs((parseFloat(dropdownContainer.style.top) || 0) - top) > 1) {
            dropdownContainer.style.top = `${top}px`;
        }

        if (
            dropdown.classList.contains('select2-dropdown--above') ||
            !dropdown.classList.contains('select2-dropdown--below')
        ) {
            dropdown.classList.remove('select2-dropdown--above');
            dropdown.classList.add('select2-dropdown--below');
        }
        if (
            selectionContainer.classList.contains('select2-container--above') ||
            !selectionContainer.classList.contains('select2-container--below')
        ) {
            selectionContainer.classList.remove('select2-container--above');
            selectionContainer.classList.add('select2-container--below');
        }
    };

    $select.off('select2:open.gpTphBelow select2:close.gpTphBelow');
    $select.on('select2:open.gpTphBelow', () => {
        directionObserver?.disconnect();

        const dialog = document.getElementById('areaFormDialog');
        if (!dialog) {
            return;
        }

        directionObserver = new MutationObserver(applyBelowDirection);
        directionObserver.observe(dialog, {
            attributes: true,
            attributeFilter: ['class', 'style'],
            subtree: true,
        });
        requestAnimationFrame(() =>
            requestAnimationFrame(applyBelowDirection),
        );
    });
    $select.on('select2:close.gpTphBelow', () => {
        directionObserver?.disconnect();
    });
}

async function loadAreaOwners() {
    const ownerInput = document.getElementById('AREA_OWNER');
    if (!ownerInput) {
        return;
    }

    try {
        const [employees, departments, divisions] = await Promise.all([
            searchUser(),
            getAllDepartment(),
            getAllDivision(),
        ]);
        const options = new Map();
        areaOwnerLabels.clear();
        departmentNames.clear();
        divisionNames.clear();
        positionNames.clear();
        cancelledDepartmentCodes.clear();
        cancelledDivisionCodes.clear();

        getItems(departments).forEach((department) => {
            const code = String(department.SDEPCODE || '').trim();
            const name = getShortOrganizationName(
                department.SDEPT,
                department.SDEPARTMENT,
            );
            if (code && name) {
                departmentNames.set(code, name);
            }
            if (
                code &&
                hasCancelledMarker(department.SDEPT, department.SDEPARTMENT)
            ) {
                cancelledDepartmentCodes.add(code);
            }
        });
        getItems(divisions).forEach((division) => {
            const code = String(division.SDIVCODE || '').trim();
            const name = getShortOrganizationName(
                division.SDIV,
                division.SDIVISION,
            );
            if (code && name) {
                divisionNames.set(code, name);
            }
            if (
                code &&
                hasCancelledMarker(division.SDIV, division.SDIVISION)
            ) {
                cancelledDivisionCodes.add(code);
            }
        });

        getItems(employees).forEach((emp) => {
            const posCode = String(emp.SPOSCODE || '').trim();
            const posName = getOwnerPositionName(emp);
            if (posCode && posName && !positionNames.has(posCode)) {
                positionNames.set(posCode, posName);
            }

            const deptCode = String(emp.SDEPCODE || emp.SDEPCOD || '').trim();
            const divisionCode = String(emp.SDIVCODE || '').trim();
            if (
                cancelledDepartmentCodes.has(deptCode) ||
                cancelledDivisionCodes.has(divisionCode)
            ) {
                return;
            }

            const option = getAreaOwnerOption(emp);
            if (option && !options.has(option.value)) {
                options.set(option.value, option.text);
                areaOwnerLabels.set(option.value, option.text);
            }
        });

        ownerInput.replaceChildren(new Option('Select area owner', ''));
        [...options.entries()]
            .sort((a, b) => a[1].localeCompare(b[1]))
            .forEach(([value, text]) =>
                ownerInput.add(new Option(text, value)),
            );

        await setSelect2({
            id: '#AREA_OWNER',
            placeholder: 'Select area owner',
            destroy: true,
            dropdownParent: $('#areaFormDialog'),
        });
        forceSelect2Below(ownerInput);
    } catch (error) {
        console.error('Unable to load GP-TPH area owners.', error);
        showMessage('ไม่สามารถโหลด Area Owner ได้', 'error');
    }
}

function getFilteredAreas() {
    const keyword = document.getElementById('searchArea')?.value
        .trim()
        .toLowerCase();

    if (!keyword) {
        return areas;
    }

    return areas.filter((area) => {
        const ownerValue = getAreaOwnerValue(area);
        return [
            getLocationName(area),
            area.AREA_NAME || area.area,
            area.AREA_LEVEL || area.level,
            getAreaOwnerLabel(ownerValue),
            ownerValue,
        ]
            .join(' ')
            .toLowerCase()
            .includes(keyword);
    });
}

function setPagination(filteredAreas) {
    const totalPages = Math.max(1, Math.ceil(filteredAreas.length / areasPerPage));
    currentPage = Math.min(currentPage, totalPages);

    const pageStatus = document.getElementById('areaPageStatus');
    const previousButton = document.getElementById('previousAreaPage');
    const nextButton = document.getElementById('nextAreaPage');

    if (pageStatus) {
        pageStatus.textContent = `หน้า ${currentPage} / ${totalPages}`;
    }
    if (previousButton) {
        previousButton.disabled = currentPage === 1;
    }
    if (nextButton) {
        nextButton.disabled = currentPage === totalPages;
    }
}

function setSummary(filteredAreas) {
    const summary = document.getElementById('areaTableSummary');
    if (summary) {
        summary.textContent = `${filteredAreas.length} รายการ จากทั้งหมด ${areas.length} รายการ · แสดงหน้าละ ${areasPerPage} รายการ`;
    }
}

function addCell(row, value) {
    const cell = document.createElement('td');
    cell.textContent = value || '-';
    row.appendChild(cell);
}

function addActionCell(row, areaId) {
    const cell = document.createElement('td');
    const editButton = document.createElement('button');

    editButton.type = 'button';
    editButton.className =
        'action-link table-action-button edit-area h-9 w-9 rounded border border-black';
    editButton.title = 'Edit area';
    editButton.dataset.areaId = areaId;
    editButton.setAttribute('aria-label', 'Edit area');
    editButton.innerHTML =
        '<span class="text-[28px] leading-none text-yellow-400">✎</span>';

    cell.append(editButton);
    row.appendChild(cell);
}

function renderTable() {
    const tableBody = document.getElementById('areaTableBody');
    if (!tableBody) {
        return;
    }

    tableBody.replaceChildren();

    const filteredAreas = getFilteredAreas();
    setPagination(filteredAreas);

    if (!filteredAreas.length) {
        tableBody.innerHTML =
            '<tr><td colspan="6" class="empty-row">ไม่พบข้อมูล</td></tr>';
        setSummary(filteredAreas);
        return;
    }

    const startIndex = (currentPage - 1) * areasPerPage;
    filteredAreas
        .slice(startIndex, startIndex + areasPerPage)
        .forEach((area, index) => {
        const row = document.createElement('tr');
        const ownerValue = getAreaOwnerValue(area);
        const ownerLabel = getAreaOwnerLabel(ownerValue);

        addCell(row, startIndex + index + 1);
        addCell(row, getLocationName(area));
        addCell(row, area.AREA_NAME || area.area);
        addCell(row, area.AREA_LEVEL || area.level);
        addCell(row, ownerLabel);
        addActionCell(row, getAreaId(area));
        tableBody.appendChild(row);
        });

    setSummary(filteredAreas);
}

async function renderLocationOptions() {
    const locationInput = document.getElementById('LOCATION_ID');
    if (!locationInput) {
        return;
    }

    const selectedLocationId = locationInput.value;
    locationInput.replaceChildren(new Option('Select location', ''));

    locations.forEach((location) => {
        locationInput.add(
            new Option(
                location.LOCATION_NAME || location.name,
                location.LOCATION_ID || location.id,
            ),
        );
    });

    locationInput.value = selectedLocationId;
    await setSelect2({
        id: '#LOCATION_ID',
        placeholder: 'Select location',
        destroy: true,
        dropdownParent: $('#areaFormDialog'),
    });
    forceSelect2Below(locationInput);
}

function openForm(area = null) {
    const form = document.getElementById('areaForm');
    const dialog = document.getElementById('areaFormDialog');
    const title = document.getElementById('areaFormTitle');
    if (!form || !dialog) {
        return;
    }

    form.reset();
    setLocationSelect();
    setOwnerSelect();
    editingAreaId = area ? getAreaId(area) : null;
    if (title) {
        title.textContent = area ? 'แก้ไขข้อมูลพื้นที่' : 'เพิ่มพื้นที่';
    }

    if (area) {
        const ownerValue = getAreaOwnerValue(area);
        setLocationSelect(getLocationId(area) || '');
        form.elements.AREA_NAME.value = area.AREA_NAME || area.area || '';
        form.elements.AREA_LEVEL.value = area.AREA_LEVEL || area.level || '';
        setOwnerSelect(ownerValue);
    }

    dialog.showModal();
    document
        .querySelector('#LOCATION_ID + .select2-container .select2-selection')
        ?.focus();
}

function closeForm() {
    const form = document.getElementById('areaForm');
    const dialog = document.getElementById('areaFormDialog');
    if (dialog?.open) {
        dialog.close();
    }
    if (form) {
        form.reset();
        setLocationSelect();
        setOwnerSelect();
    }
    editingAreaId = null;
}

async function loadAreaTable() {
    const tableBody = document.getElementById('areaTableBody');
    if (!tableBody) {
        return;
    }

    tableBody.innerHTML =
        '<tr><td colspan="6" class="empty-row">Loading...</td></tr>';

    try {
        const [areaResponse, locationResponse] = await Promise.all([
            getAreas(),
            getLocations(),
        ]);
        areas = getItems(areaResponse);
        locations = getItems(locationResponse);
        await loadAreaOwners();
        await renderLocationOptions();
        renderTable();
    } catch (error) {
        console.error('Unable to load GP-TPH areas.', error);
        tableBody.innerHTML =
            '<tr><td colspan="6" class="empty-row">ไม่สามารถโหลดข้อมูลได้</td></tr>';
        areas = [];
        setSummary([]);
    }
}

function bindEvents() {
    const form = document.getElementById('areaForm');
    const formDialog = document.getElementById('areaFormDialog');
    const tableBody = document.getElementById('areaTableBody');
    const searchInput = document.getElementById('searchArea');

    document.getElementById('newAreaButton')?.addEventListener('click', () => {
        openForm();
    });
    document
        .getElementById('cancelAreaButton')
        ?.addEventListener('click', closeForm);
    document
        .getElementById('closeAreaFormButton')
        ?.addEventListener('click', closeForm);
    formDialog?.addEventListener('click', (event) => {
        if (event.target === formDialog) {
            closeForm();
        }
    });
    formDialog?.addEventListener('close', () => {
        form?.reset();
        setLocationSelect();
        setOwnerSelect();
        editingAreaId = null;
    });

    form?.elements.AREA_LEVEL?.addEventListener('input', (event) => {
        event.target.value = event.target.value.replace(/\D/g, '');
    });

    searchInput?.addEventListener('input', (event) => {
        currentPage = 1;
        renderTable();
    });

    document
        .getElementById('previousAreaPage')
        ?.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage -= 1;
                renderTable();
            }
        });

    document.getElementById('nextAreaPage')?.addEventListener('click', () => {
        const totalPages = Math.ceil(getFilteredAreas().length / areasPerPage);
        if (currentPage < totalPages) {
            currentPage += 1;
            renderTable();
        }
    });

    tableBody?.addEventListener('click', (event) => {
        const editButton = event.target.closest('.edit-area');

        if (editButton) {
            const area = areas.find(
                (item) => String(getAreaId(item)) === editButton.dataset.areaId,
            );
            if (area) {
                openForm(area);
            }
        }
    });

    form?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const saveButton = form.querySelector('[type="submit"]');
        const areaLevel = form.elements.AREA_LEVEL.value.trim();
        if (!/^\d+$/.test(areaLevel)) {
            showMessage('AREA_LEVEL ต้องเป็นตัวเลขเท่านั้น', 'warning');
            form.elements.AREA_LEVEL.focus();
            return;
        }

        const ownerValue = form.elements.AREA_OWNER.value.trim();
        if (!ownerValue) {
            showMessage('กรุณาเลือก Area Owner', 'warning');
            form.elements.AREA_OWNER.focus();
            return;
        }

        const data = {
            LOCATION_ID: form.elements.LOCATION_ID.value,
            AREA_NAME: form.elements.AREA_NAME.value.trim(),
            AREA_LEVEL: areaLevel,
            AREA_OWNER: ownerValue,
        };

        saveButton.disabled = true;
        try {
            const isEditing = Boolean(editingAreaId);
            if (isEditing) {
                await updateArea(editingAreaId, data);
            } else {
                await createArea(data);
            }
            showMessage(
                isEditing ? 'แก้ไขข้อมูลสำเร็จ' : 'บันทึกข้อมูลสำเร็จ',
                'success',
            );
            closeForm();
            await loadAreaTable();
        } catch (error) {
            console.error('Unable to save GP-TPH area.', error);
            showMessage('บันทึกข้อมูลไม่สำเร็จ', 'error');
        } finally {
            saveButton.disabled = false;
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    loadAreaTable();
});
