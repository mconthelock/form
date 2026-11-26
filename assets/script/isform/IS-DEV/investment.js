import '@amec/webasset/css/dataTable.min.css';
import { createTable } from '@amec/webasset/dataTable';
import { setSelect2 } from '@amec/webasset/select2';
import { intVal, showDigits } from '@amec/webasset/utils';
import { getDeviceMst } from './data';

let investmentTable = null;
let cachedDevices = null;

const escapeHtml = (value) =>
    $('<div>')
        .text(value ?? '')
        .html();

export async function loadDevices() {
    if (cachedDevices) return cachedDevices;
    try {
        const deviceMst = await getDeviceMst();
        cachedDevices = Array.isArray(deviceMst) ? deviceMst : [];
    } catch {
        cachedDevices = [];
    }
    return cachedDevices;
}

function buildDeviceSelect(devices, selectedCode = '') {
    const options = devices
        .map((device) => {
            const selected =
                String(device.DNO) === String(selectedCode) ? ' selected' : '';
            return `<option value="${escapeHtml(device.DNO)}"${selected}>${escapeHtml(device.DEVICE)}</option>`;
        })
        .join('');

    return `<select class="select select-bordered select-sm w-full select-device">
        <option value="">Select Device</option>
        ${options}
    </select>`;
}

function normalizeRow(data = null, devices = []) {
    if (!data) {
        return {
            DEVICE: '',
            DEVICE_NAME: '-',
            QTY: 1,
            PRICE: '',
            TOTAL_COST: '',
        };
    }

    const deviceCode = data.DEVICE ?? data.DNO ?? '';
    const matchedDevice = devices.find(
        (d) => String(d.DNO) === String(deviceCode),
    );
    const qty = intVal(data.QTY) || 1;
    const price =
        intVal(
            data.PRICE ?? data.STANDARD_COST ?? matchedDevice?.STANDARD_COST,
        ) || 0;

    return {
        DEVICE: deviceCode,
        DEVICE_NAME:
            data.DEVICE_NAME || matchedDevice?.DEVICE || deviceCode || '-',
        QTY: qty,
        PRICE: showDigits(price),
        TOTAL_COST: showDigits(qty * price),
    };
}

function getColumns(readonly, devices) {
    if (readonly) {
        return [
            {
                data: 'DEVICE_NAME',
                className: 'cell-text',
                render: (val) => escapeHtml(val),
            },
            {
                data: 'QTY',
                render: (val) =>
                    `<input type="text" class="device-qty" value="${escapeHtml(val)}" readonly>`,
            },
            {
                data: 'PRICE',
                render: (val) =>
                    `<input type="text" class="device-cost" value="${escapeHtml(val)}" readonly>`,
            },
            {
                data: 'TOTAL_COST',
                render: (val) =>
                    `<input type="text" class="device-total" value="${escapeHtml(val)}" readonly>`,
            },
        ];
    }

    return [
        {
            data: 'DEVICE',
            render: (val) => buildDeviceSelect(devices, val),
        },
        {
            data: 'QTY',
            render: (val) =>
                `<input type="text" class="device-qty" value="${escapeHtml(val)}">`,
        },
        {
            data: 'PRICE',
            render: (val) =>
                `<input type="text" class="device-cost" value="${escapeHtml(val)}" readonly>`,
        },
        {
            data: 'TOTAL_COST',
            render: (val) =>
                `<input type="text" class="device-total" value="${escapeHtml(val)}" readonly>`,
        },
        {
            data: null,
            className: 'text-center',
            render: () =>
                `<button type="button" class="btn btn-sm btn-error remove-row-investment">X</button>`,
        },
    ];
}

async function initInvestmentSelect2($scope = $('#table-investment tbody')) {
    const selects = $scope
        .find('select.select-device')
        .not('.select2-hidden-accessible');
    for (const el of selects) {
        await setSelect2({
            element: $(el),
            placeholder: 'Select Device',
            emptyValue: false,
            width: '100%',
        });
    }
}

export async function initInvestmentTable({
    readonly = false,
    data = [],
} = {}) {
    const devices = await loadDevices();
    const rows = Array.isArray(data)
        ? data.map((row) => normalizeRow(row, devices))
        : [];

    investmentTable = await createTable(
        {
            data: rows,
            columns: getColumns(readonly, devices),
            dom: 't',
            searching: false,
            responsive: false,
            lengthChange: false,
            paging: false,
            info: false,
            ordering: false,
            autoWidth: false,
            destroy: true,
            language: {
                emptyTable: 'ไม่มีข้อมูล',
            },
        },
        { id: '#table-investment' },
    );

    if (!readonly) {
        if (rows.length === 0) {
            $('#table-investment tbody tr:has(.dt-empty)').remove();
        } else {
            await initInvestmentSelect2();
        }
    }

    return investmentTable;
}

export async function addInvestmentRow(data = null) {
    const devices = await loadDevices();
    if (!investmentTable) {
        await initInvestmentTable({ readonly: false, data: [data] });
        return;
    }
    const rowNode = investmentTable.row
        .add(normalizeRow(data, devices))
        .draw(false)
        .node();
    await initInvestmentSelect2($(rowNode));
}

export function removeInvestmentRow(rowEl) {
    if (!investmentTable) {
        $(rowEl).remove();
        return;
    }
    investmentTable.row(rowEl).remove().draw(false);
    $('#table-investment tbody tr:has(.dt-empty)').remove();
}

export function clearInvestmentTable() {
    if (!investmentTable) {
        $('#table-investment tbody').empty();
        return;
    }
    investmentTable.clear().draw(false);
    $('#table-investment tbody tr:has(.dt-empty)').remove();
}

export function collectInvestmentData(formData) {
    let i = 0;
    $('#table-investment tbody tr').each(function () {
        const $row = $(this);
        if (intVal($row.find('.device-total').val()) <= 0) return;

        formData.append(
            `invest[${i}][DEVICE]`,
            $row.find('.select-device').val(),
        );
        formData.append(
            `invest[${i}][QTY]`,
            intVal($row.find('.device-qty').val()) || 0,
        );
        formData.append(
            `invest[${i}][PRICE]`,
            intVal($row.find('.device-cost').val()) || 0,
        );
        i++;
    });
}
