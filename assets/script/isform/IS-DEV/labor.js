import '@amec/webasset/css/dataTable.min.css';
import { createTable } from '@amec/webasset/dataTable';
import { setSelect2 } from '@amec/webasset/select2';
import { intVal, showDigits } from '@amec/webasset/utils';
import { getPositionMst } from './data';

let laborTable = null;
let cachedPositions = null;

const escapeHtml = (value) =>
    $('<div>')
        .text(value ?? '')
        .html();

async function loadPositions() {
    if (cachedPositions) return cachedPositions;
    try {
        const positionMst = await getPositionMst();
        cachedPositions = Array.isArray(positionMst)
            ? positionMst
                  .filter(
                      (pos) =>
                          intVal(pos.SPOSCODE) > 30 &&
                          intVal(pos.SPOSCODE) < 80,
                  )
                  .sort((a, b) => intVal(a.SPOSCODE) - intVal(b.SPOSCODE))
            : [];
    } catch {
        cachedPositions = [];
    }
    return cachedPositions;
}

function buildPositionSelect(positions, selectedCode = '') {
    const options = positions
        .map((pos) => {
            const selected =
                String(pos.SPOSCODE) === String(selectedCode)
                    ? ' selected'
                    : '';
            return `<option value="${escapeHtml(pos.SPOSCODE)}"${selected}>${escapeHtml(pos.SPOSITION)}</option>`;
        })
        .join('');

    return `<select class="select select-bordered select-sm w-full select-position">
        <option value="">Select Position</option>
        ${options}
    </select>`;
}

function normalizeRow(data = null, positions = []) {
    if (!data) {
        return {
            POSITION: '',
            POSITION_NAME: '-',
            COST: '',
            HOURS_PRESENT: '',
            HOURS_AFTER: '',
            TOTAL_TIME: '',
            TOTAL_COST: '',
        };
    }

    const posCode = data.POSITION ?? '';
    const matchedPos = positions.find(
        (p) => String(p.SPOSCODE) === String(posCode),
    );
    const cost = intVal(data.COST) || 0;
    const present = intVal(data.HOURS_PRESENT) || 0;
    const after = intVal(data.HOURS_AFTER) || 0;
    const totalTime = present - after;

    return {
        POSITION: posCode,
        POSITION_NAME:
            data.POSITION_NAME || matchedPos?.SPOSITION || posCode || '-',
        COST: cost,
        HOURS_PRESENT: present,
        HOURS_AFTER: after,
        TOTAL_TIME: totalTime,
        TOTAL_COST: showDigits(totalTime * cost),
    };
}

function getColumns(readonly, positions) {
    if (readonly) {
        return [
            {
                data: 'POSITION_NAME',
                className: 'cell-text',
                render: (val) => escapeHtml(val),
            },
            {
                data: 'COST',
                render: (val) =>
                    `<input type="text" class="input-number labor-cost" value="${escapeHtml(val)}" readonly>`,
            },
            {
                data: 'HOURS_PRESENT',
                render: (val) =>
                    `<input type="text" class="input-number labor-present" value="${escapeHtml(val)}" readonly>`,
            },
            {
                data: 'HOURS_AFTER',
                render: (val) =>
                    `<input type="text" class="input-number labor-future" value="${escapeHtml(val)}" readonly>`,
            },
            {
                data: 'TOTAL_TIME',
                render: (val) =>
                    `<input type="text" class="input-number labor-time" value="${escapeHtml(val)}" readonly>`,
            },
            {
                data: 'TOTAL_COST',
                render: (val) =>
                    `<input type="text" class="input-number labor-total" value="${escapeHtml(val)}" readonly>`,
            },
        ];
    }

    return [
        {
            data: 'POSITION',
            render: (val) => buildPositionSelect(positions, val),
        },
        {
            data: 'COST',
            render: (val) =>
                `<input type="text" class="input-number labor-cost" value="${escapeHtml(val)}" readonly>`,
        },
        {
            data: 'HOURS_PRESENT',
            render: (val) =>
                `<input type="text" class="input-number input-labor labor-present" value="${escapeHtml(val)}">`,
        },
        {
            data: 'HOURS_AFTER',
            render: (val) =>
                `<input type="text" class="input-number input-labor labor-future" value="${escapeHtml(val)}">`,
        },
        {
            data: 'TOTAL_TIME',
            render: (val) =>
                `<input type="text" class="input-number labor-time" value="${escapeHtml(val)}" readonly>`,
        },
        {
            data: 'TOTAL_COST',
            render: (val) =>
                `<input type="text" class="input-number labor-total" value="${escapeHtml(val)}" readonly>`,
        },
        {
            data: null,
            className: 'text-center',
            render: () =>
                `<button type="button" class="btn btn-sm btn-error remove-row-labor">X</button>`,
        },
    ];
}

async function initLaborSelect2($scope = $('#table-labor tbody')) {
    const selects = $scope
        .find('select.select-position')
        .not('.select2-hidden-accessible');
    for (const el of selects) {
        await setSelect2({
            element: $(el),
            placeholder: 'Select Position',
            emptyValue: false,
            width: '100%',
        });
    }
}

export async function initLaborTable({ readonly = false, data = [] } = {}) {
    const positions = await loadPositions();
    const rows = Array.isArray(data)
        ? data.map((row) => normalizeRow(row, positions))
        : [];

    laborTable = await createTable(
        {
            data: rows,
            columns: getColumns(readonly, positions),
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
        { id: '#table-labor' },
    );

    if (!readonly) {
        if (rows.length === 0) {
            $('#table-labor tbody tr:has(.dt-empty)').remove();
        } else {
            await initLaborSelect2();
        }
    }

    return laborTable;
}

export async function addLaborRow(data = null) {
    const positions = await loadPositions();
    if (!laborTable) {
        await initLaborTable({ readonly: false, data: [data] });
        return;
    }
    const rowNode = laborTable.row
        .add(normalizeRow(data, positions))
        .draw(false)
        .node();
    await initLaborSelect2($(rowNode));
}

export function removeLaborRow(rowEl) {
    if (!laborTable) {
        $(rowEl).remove();
        return;
    }
    laborTable.row(rowEl).remove().draw(false);
    $('#table-labor tbody tr:has(.dt-empty)').remove();
}

export function clearLaborTable() {
    if (!laborTable) {
        $('#table-labor tbody').empty();
        return;
    }
    laborTable.clear().draw(false);
    $('#table-labor tbody tr:has(.dt-empty)').remove();
}

export function collectLaborData(formData) {
    let i = 0;
    $('#table-labor tbody tr').each(function () {
        const $row = $(this);
        if (intVal($row.find('.labor-total').val()) <= 0) return;

        formData.append(
            `manhours[${i}][POSITION]`,
            $row.find('.select-position').val(),
        );
        formData.append(
            `manhours[${i}][COST]`,
            intVal($row.find('.labor-cost').val()) || 0,
        );
        formData.append(
            `manhours[${i}][HOURS_PRESENT]`,
            intVal($row.find('.labor-present').val()) || 0,
        );
        formData.append(
            `manhours[${i}][HOURS_AFTER]`,
            intVal($row.find('.labor-future').val()) || 0,
        );
        i++;
    });
}
