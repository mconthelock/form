import { showMessage } from '@amec/webasset/utils';
import { searchUser } from '@amec/webasset/api/amec';
import { setSelect2 } from '@amec/webasset/select2';
import select2 from 'select2';
import {
    createArea,
    deleteArea,
    getAreas,
    getLocations,
    updateArea,
} from './data';

select2();

let areas = [];
let locations = [];

let editingAreaId = null;
const areaOwnerLabels = new Map();

function getItems(response) {
    if (Array.isArray(response)) {
        return response;
    }

    return Array.isArray(response?.data) ? response.data : [];
}

function getAreaId(area) {
    return area.AREA_ID || area.id;
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

function getOwnerOrg(emp) {
    const deptCode = emp.SDEPCODE || emp.SDEPCOD || '';
    if (deptCode) {
        return { code: deptCode, name: emp.SDEPT || emp.SDIV || '' };
    }

    return {
        code: emp.SDIVCODE || '',
        name: emp.SDIV || emp.SDEPT || '',
    };
}

function getAreaOwnerOption(emp) {
    const posCode = String(emp.SPOSCODE || '').trim();
    const posName = emp.SPOSNAME || posCode;
    const org = getOwnerOrg(emp);
    if (!posCode || !org.code) {
        return null;
    }

    return {
        value: `${posCode}+${org.code}`,
        text: `${posName} / ${org.name || '-'}`,
    };
}

function getAreaOwnerLabel(value) {
    const ownerValue = String(value ?? '').trim();
    if (!ownerValue) {
        return '-';
    }

    return areaOwnerLabels.get(ownerValue) || ownerValue;
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

async function loadAreaOwners() {
    const ownerInput = document.getElementById('AREA_OWNER');
    if (!ownerInput) {
        return;
    }

    try {
        const employees = await searchUser({ CSTATUS: '1' });
        const options = new Map();
        areaOwnerLabels.clear();

        getItems(employees).forEach((emp) => {
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
        });
    } catch (error) {
        console.error('Unable to load GP-TPH area owners.', error);
        showMessage('ไม่สามารถโหลด Area Owner ได้', 'error');
    }
}

function setSummary() {
    const summary = document.getElementById('areaTableSummary');
    if (summary) {
        summary.textContent = `${areas.length} row(s)`;
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
    const deleteButton = document.createElement('button');

    editButton.type = 'button';
    editButton.className =
        'action-link table-action-button edit-area h-9 w-9 rounded border border-black';
    editButton.title = 'Edit area';
    editButton.dataset.areaId = areaId;
    editButton.setAttribute('aria-label', 'Edit area');
    editButton.innerHTML =
        '<span class="text-[28px] leading-none text-yellow-400">✎</span>';

    deleteButton.type = 'button';
    deleteButton.className =
        'action-link table-action-button delete-area h-9 w-9 rounded border border-black';
    deleteButton.title = 'Delete area';
    deleteButton.dataset.areaId = areaId;
    deleteButton.setAttribute('aria-label', 'Delete area');
    deleteButton.innerHTML =
        '<span class="text-[28px] leading-none text-red-600">🗑</span>';

    cell.append(editButton, deleteButton);
    row.appendChild(cell);
}

function renderTable() {
    const tableBody = document.getElementById('areaTableBody');
    if (!tableBody) {
        return;
    }

    tableBody.replaceChildren();

    if (!areas.length) {
        tableBody.innerHTML =
            '<tr><td colspan="6" class="empty-row">ไม่พบข้อมูล</td></tr>';
        setSummary();
        return;
    }

    areas.forEach((area, index) => {
        const row = document.createElement('tr');
        const ownerValue = area.AREA_OWNER || area.area_owner;
        const ownerLabel = getAreaOwnerLabel(ownerValue);
        row.dataset.search = [
            getLocationName(area),
            area.AREA_NAME || area.area,
            area.AREA_LEVEL || area.level,
            ownerLabel,
            ownerValue,
        ]
            .join(' ')
            .toLowerCase();

        addCell(row, index + 1);
        addCell(row, getLocationName(area));
        addCell(row, area.AREA_NAME || area.area);
        addCell(row, area.AREA_LEVEL || area.level);
        addCell(row, ownerLabel);
        addActionCell(row, getAreaId(area));
        tableBody.appendChild(row);
    });

    setSummary();
}

function renderLocationOptions() {
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
}

function openForm(area = null) {
    const form = document.getElementById('areaForm');
    if (!form) {
        return;
    }

    form.reset();
    setOwnerSelect();
    editingAreaId = area ? getAreaId(area) : null;

    if (area) {
        const ownerValue = area.AREA_OWNER || area.area_owner || '';
        form.elements.LOCATION_ID.value = getLocationId(area) || '';
        form.elements.AREA_NAME.value = area.AREA_NAME || area.area || '';
        form.elements.AREA_LEVEL.value = area.AREA_LEVEL || area.level || '';
        setOwnerSelect(ownerValue);
    }

    form.classList.add('is-visible');
    form.elements.LOCATION_ID.focus();
}

function closeForm() {
    const form = document.getElementById('areaForm');
    if (form) {
        form.reset();
        setOwnerSelect();
        form.classList.remove('is-visible');
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
        renderLocationOptions();
        renderTable();
    } catch (error) {
        console.error('Unable to load GP-TPH areas.', error);
        tableBody.innerHTML =
            '<tr><td colspan="6" class="empty-row">ไม่สามารถโหลดข้อมูลได้</td></tr>';
        areas = [];
        setSummary();
    }
}

function bindEvents() {
    const form = document.getElementById('areaForm');
    const tableBody = document.getElementById('areaTableBody');
    const searchInput = document.getElementById('searchArea');

    document.getElementById('newAreaButton')?.addEventListener('click', () => {
        openForm();
    });
    document
        .getElementById('cancelAreaButton')
        ?.addEventListener('click', closeForm);

    form?.elements.AREA_LEVEL?.addEventListener('input', (event) => {
        event.target.value = event.target.value.replace(/\D/g, '');
    });

    searchInput?.addEventListener('input', (event) => {
        const keyword = event.target.value.trim().toLowerCase();
        tableBody?.querySelectorAll('tr[data-search]').forEach((row) => {
            row.hidden = !row.dataset.search.includes(keyword);
        });
    });

    tableBody?.addEventListener('click', async (event) => {
        const editButton = event.target.closest('.edit-area');
        const deleteButton = event.target.closest('.delete-area');

        if (editButton) {
            const area = areas.find(
                (item) => String(getAreaId(item)) === editButton.dataset.areaId,
            );
            if (area) {
                openForm(area);
            }
            return;
        }

        if (deleteButton) {
            const areaId = deleteButton.dataset.areaId;
            if (!window.confirm('ยืนยันการลบข้อมูลนี้หรือไม่?')) {
                return;
            }

            deleteButton.disabled = true;
            try {
                await deleteArea(areaId);
                await loadAreaTable();
            } catch (error) {
                console.error('Unable to delete GP-TPH area.', error);
                showMessage('ลบข้อมูลไม่สำเร็จ', 'error');
                deleteButton.disabled = false;
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
