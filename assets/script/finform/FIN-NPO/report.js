import { fetchUtils } from '@amec/webasset/api/fetch-utils';
import { createTable } from '@amec/webasset/dataTable';
import { setDatePicker } from '@amec/webasset/flatpickr';
import { defaultExcel, exportExcel } from '@amec/webasset/excel';
import { showMessage } from '@amec/webasset/utils';

let reportTable = null;

const columns = [
    {
        data: 'VENDOR_CODE',
        title: 'Invoice-from Business Partner',
        className: 'text-nowrap',
    },
    {
        data: 'INVOICE_NO',
        title: 'Supplier Invoice Number',
        className: 'text-nowrap',
    },
    { data: 'INVOICE_DATE', title: 'Invoice Date', className: 'text-nowrap' },
    {
        data: 'NET_PRICE',
        title: 'Amount in Invoice Currency',
        className: 'text-right',
        render: renderAmount,
    },
    {
        data: 'VAT_RATE',
        title: 'Tax Code',
        className: 'text-center text-nowrap',
        render: renderVatRate,
    },
    {
        data: 'EXPENSE_CODE',
        title: 'Account (Dr)',
        className: 'text-nowrap',
    },
    {
        data: 'COST_CENTER',
        title: 'Dimension 1',
        className: 'text-nowrap',
        render: renderCostCenters,
    },
    { data: 'REMARK', title: 'Remark' },
];

$(async function () {
    [
        '#formDateFrom',
        '#formDateTo',
        '#invoiceDateFrom',
        '#invoiceDateTo',
    ].forEach((element) => setDatePicker({ element }));

    await Promise.all([loadSelect('expense'), loadSelect('vendor')]);
    await renderTable([]);
});
//--------------------------------------------  for test

async function test() {
    event.preventDefault();
    if (!validateDateRanges()) return;

    const button = $('#btnSearch');
    try {
        button.prop('disabled', true).addClass('loading');
        const response = await fetchUtils({
            url: `${process.env.APP_API}/finform/fin-npo/report`,
            method: 'POST',
            data: getCriteria(),
        });
        await renderTable(normalizeReportRows(response));
    } catch (error) {
        console.error('Cannot load FIN-NPO report', error);
        await renderTable([]);
        showMessage(error?.message || 'Cannot load report data.', 'error');
    } finally {
        button.prop('disabled', false).removeClass('loading');
    }
}
//--------------------------------------------  for test

$(document).on('submit', '#reportSearchForm', async function (event) {
    event.preventDefault();
    if (!validateDateRanges()) return;

    const button = $('#btnSearch');
    try {
        button.prop('disabled', true).addClass('loading');
        const response = await fetchUtils({
            url: `${process.env.APP_API}/finform/fin-npo/report`,
            method: 'POST',
            data: getCriteria(),
        });
        await renderTable(normalizeReportRows(response));
    } catch (error) {
        console.error('Cannot load FIN-NPO report', error);
        await renderTable([]);
        showMessage(error?.message || 'Cannot load report data.', 'error');
    } finally {
        button.prop('disabled', false).removeClass('loading');
    }
});

$(document).on('click', '#btnReset', async function () {
    document.getElementById('reportSearchForm')?.reset();
    $('#reportSearchForm select').val('').trigger('change');
    await renderTable([]);
});

$(document).on('click', '#btnExport', async function () {
    const rows = reportTable?.rows
        ? reportTable.rows({ search: 'applied' }).data().toArray()
        : [];
    if (!rows.length)
        return showMessage(
            'Cannot export because the report is empty.',
            'warning',
        );

    const exportRows = rows.map((row) => ({
        ...row,
        VAT_RATE: formatVatRate(row.VAT_RATE),
        COST_CENTER: splitCostCenters(row.COST_CENTER).join('\n'),
    }));

    const workbook = await defaultExcel({
        data: exportRows,
        column: columns.map(({ data, title }) => ({
            key: data,
            header: title,
        })),
        sheetName: 'FIN-NPO Report',
    });
    exportExcel(
        workbook,
        `FIN-NPO_Report_${new Date().toISOString().slice(0, 10)}`,
    );
});

async function renderTable(data) {
    if (reportTable?.destroy) reportTable.destroy();
    $('#reportTable').empty();
    reportTable = await createTable(
        { data, columns, responsive: false, order: [[2, 'desc']] },
        { id: '#reportTable', domScroll: { status: true } },
    );
}

async function loadSelect(type) {
    const config = {
        expense: {
            selector: '#expenseType',
            value: ['EXPENSE_CODE', 'EXPENSE_ID', 'ID', 'CODE'],
            name: ['EXPENSE_ENAME', 'EXPENSE_NAME', 'ENAME', 'NAME'],
        },
        vendor: {
            selector: '#vendor',
            value: ['VENDOR_CODE', 'CODE', 'ID'],
            name: ['VENDOR_NAME', 'NAME', 'DESCRIPTION'],
        },
    }[type];
    const select = $(config.selector);

    try {
        const rows = normalizeList(
            await fetchUtils({
                url: `${process.env.APP_API}/finform/fin-npo/${type}`,
                method: 'GET',
            }),
        );
        rows.forEach((row) => {
            const value = first(row, config.value);
            const name = first(row, config.name);
            if (value !== '')
                select.append(
                    new Option(
                        [value, name].filter(Boolean).join(' - '),
                        value,
                    ),
                );
        });
    } catch (error) {
        // An unavailable master-data endpoint must not prevent the other criteria working.
        console.warn(`Cannot load ${type} options`, error);
    }
}

function getCriteria() {
    return {
        formDateFrom: $('#formDateFrom').val() || null,
        formDateTo: $('#formDateTo').val() || null,
        invoiceDateFrom: $('#invoiceDateFrom').val() || null,
        invoiceDateTo: $('#invoiceDateTo').val() || null,
        expenseCode: $('#expenseType').val() || null,
        vendorCode: $('#vendor').val() || null,
        costCenter: $('#costCenter').val()?.trim() || null,
    };
}

function validateDateRanges() {
    const ranges = [
        ['#formDateFrom', '#formDateTo', 'Form Date'],
        ['#invoiceDateFrom', '#invoiceDateTo', 'Invoice Date'],
    ];
    for (const [fromId, toId, label] of ranges) {
        const from = $(fromId).val();
        const to = $(toId).val();
        if (from && to && from > to) {
            showMessage(
                `${label}: From Date must not be later than To Date.`,
                'warning',
            );
            return false;
        }
    }
    return true;
}

function normalizeList(response) {
    if (Array.isArray(response)) return response;
    for (const key of [
        'data',
        'DATA',
        'rows',
        'ROWS',
        'result',
        'RESULT',
        'list',
        'LIST',
    ]) {
        if (Array.isArray(response?.[key])) return response[key];
    }
    return [];
}

function normalizeReportRows(response) {
    return normalizeList(response)
        .filter(
            (row) =>
                Number(first(row, ['STATUS', 'FORM_STATUS', 'CSTATUS'])) === 2,
        )
        .flatMap((row) => {
            const normalizedRow = normalizeRow(row);
            const costCenters = String(normalizedRow.COST_CENTER || '')
                .split(',')
                .map((costCenter) => costCenter.trim())
                .filter(Boolean);

            if (!costCenters.length) return [normalizedRow];

            return costCenters.map((costCenter) => ({
                ...normalizedRow,
                COST_CENTER: costCenter,
            }));
        });
}

function normalizeRow(row) {
    const year = String(first(row, ['CYEAR2', 'list_CYEAR2']));
    const runNo = first(row, ['NRUNNO', 'list_NRUNNO']);
    const generatedFormNo = runNo
        ? `FIN-NPO${year.slice(-2)}-${String(runNo).padStart(6, '0')}`
        : '';
    return {
        ...row,
        FORM_NO:
            first(row, ['FORM_NO', 'FORMNO', 'VANAME_FORMNO']) ||
            generatedFormNo,
        FORM_DATE: formatDate(
            first(row, ['FORM_DATE', 'CREATE_DATE', 'DREQDATE', 'CREATED_AT']),
        ),
        REQUEST_BY: first(row, ['REQUEST_BY', 'REQBY_NAME', 'REQBY', 'VREQNO']),
        SUBJECT: first(row, ['SUBJECT', 'VSUBJECT']),
        EXPENSE_TYPE: first(row, [
            'EXPENSE_TYPE',
            'EXPENSE_NAME',
            'EXPENSE_ENAME',
            'EXPENSE_TNAME',
        ]),
        EXPENSE_CODE: first(row, ['EXPENSE_CODE', 'EXPENSE_ID']),
        VENDOR_CODE: first(row, ['VENDOR_CODE', 'VENDOR_ID']),
        VENDOR: first(row, ['VENDOR', 'VENDOR_NAME', 'VENDOR_CODE']),
        COST_CENTER: first(row, [
            'COST_CENTER',
            'COSTCENTER',
            'COST_CENTER_CODE',
        ]),
        REMARK: first(row, ['REMARK', 'VREMARK']),
        INVOICE_DATE: formatDate(first(row, ['INVOICE_DATE', 'DINVOICE_DATE'])),
        INVOICE_NO: first(row, ['INVOICE_NO', 'VINVOICE_NO']),
        NET_PRICE: first(row, ['NET_PRICE', 'NET_AMT']),
        TOTAL_AMOUNT: first(row, ['TOTAL_AMOUNT', 'TOTAL_AMT']),
        VAT_RATE: getVatRate(row),
        CURRENCY: first(row, ['CURRENCY', 'SCURCODE']),
        STATUS: first(row, ['STATUS', 'FORM_STATUS', 'CSTATUS']),
    };
}

function getVatRate(row) {
    const vatRate = first(row, ['VAT_RATE', 'VAT_RATE_ID', 'VAT_PERCENT']);
    if (vatRate !== '') return Number(vatRate) || 0;

    const netPrice = Number(first(row, ['NET_PRICE', 'NET_AMT']));
    const totalAmount = Number(first(row, ['TOTAL_AMOUNT', 'TOTAL_AMT']));

    if (!netPrice || !Number.isFinite(totalAmount)) return 0;

    return Math.round(((totalAmount - netPrice) / netPrice) * 100);
}

function first(object, keys) {
    for (const key of keys) {
        const value = object?.[key];
        if (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ''
        )
            return value;
    }
    return '';
}

function formatDate(value) {
    if (!value) return '';
    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
    return match ? `${match[3]}-${match[2]}-${match[1]}` : String(value);
}

function renderAmount(value, type) {
    if (type !== 'display') return Number(value) || 0;
    return value === '' || value === null || value === undefined
        ? ''
        : Number(value).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });
}

function formatVatRate(value) {
    if (value === '' || value === null || value === undefined) return '';

    return `${Number(value) || 0}%`;
}

function renderVatRate(value, type) {
    return type === 'display' ? formatVatRate(value) : Number(value) || 0;
}

function splitCostCenters(value) {
    return String(value ?? '')
        .split(',')
        .map((costCenter) => costCenter.trim())
        .filter(Boolean);
}

function renderCostCenters(value, type) {
    const costCenters = splitCostCenters(value);

    if (type !== 'display') return costCenters.join(', ');

    return costCenters.map(escapeHtml).join('<br>');
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderStatus(value, type) {
    const status = Number(value);

    if (type !== 'display')
        return Number.isFinite(status) ? status : value || '';

    if (status === 2) {
        return '<span class="fin-npo-status fin-npo-status-approved">Approve</span>';
    }

    if (status === 0 || status === 1) {
        return '<span class="fin-npo-status fin-npo-status-not-approved">Not Approve</span>';
    }

    return value ?? '';
}

function getStatusLabel(value) {
    const status = Number(value);

    if (status === 2) return 'Approve';
    if (status === 0 || status === 1) return 'Not Approve';

    return value ?? '';
}
