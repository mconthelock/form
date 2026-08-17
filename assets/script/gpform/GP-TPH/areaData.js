import {
    createArea,
    deleteArea,
    getAreas,
    getLocations,
    updateArea,
} from './data';

let areas = [];
let locations = [];
let editingAreaId = null;

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
        'action-link table-action-button edit-area h-9 w-9';
    editButton.title = 'Edit area';
    editButton.dataset.areaId = areaId;
    editButton.setAttribute('aria-label', 'Edit area');
    editButton.innerHTML =
        '<span class="text-[28px] leading-none text-yellow-400">✎</span>';

    deleteButton.type = 'button';
    deleteButton.className =
        'action-link table-action-button delete-area h-9 w-9';
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
        row.dataset.search = [
            getLocationName(area),
            area.AREA_NAME || area.area,
            area.AREA_LEVEL || area.level,
            area.AREA_OWNER || area.area_owner,
        ]
            .join(' ')
            .toLowerCase();

        addCell(row, index + 1);
        addCell(row, getLocationName(area));
        addCell(row, area.AREA_NAME || area.area);
        addCell(row, area.AREA_LEVEL || area.level);
        addCell(row, area.AREA_OWNER || area.area_owner);
        addActionCell(row, getAreaId(area));
        tableBody.appendChild(row);
    });

    setSummary();
}

function renderLocationOptions() {
    const locationInput = document.getElementById('areaLocation');
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
    editingAreaId = area ? getAreaId(area) : null;

    if (area) {
        form.elements.location_id.value = getLocationId(area) || '';
        form.elements.area.value = area.AREA_NAME || area.area || '';
        form.elements.level.value = area.AREA_LEVEL || area.level || '';
        form.elements.area_owner.value = area.AREA_OWNER || area.area_owner || '';
    }

    form.classList.add('is-visible');
    form.elements.location_id.focus();
}

function closeForm() {
    const form = document.getElementById('areaForm');
    if (form) {
        form.reset();
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
    document.getElementById('cancelAreaButton')?.addEventListener('click', closeForm);

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
                window.alert('ลบข้อมูลไม่สำเร็จ');
                deleteButton.disabled = false;
            }
        }
    });

    form?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const saveButton = form.querySelector('[type="submit"]');
        const data = {
            LOCATION_ID: form.elements.location_id.value,
            AREA_NAME: form.elements.area.value.trim(),
            AREA_LEVEL: form.elements.level.value.trim(),
            AREA_OWNER: form.elements.area_owner.value.trim(),
        };

        saveButton.disabled = true;
        try {
            if (editingAreaId) {
                await updateArea(editingAreaId, data);
            } else {
                await createArea(data);
            }
            closeForm();
            await loadAreaTable();
        } catch (error) {
            console.error('Unable to save GP-TPH area.', error);
            window.alert('บันทึกข้อมูลไม่สำเร็จ');
        } finally {
            saveButton.disabled = false;
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    loadAreaTable();
});
