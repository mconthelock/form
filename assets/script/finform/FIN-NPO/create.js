import { showLoader } from '@amec/webasset/preloader';
import { requiredForm, showMessage } from '@amec/webasset/utils';

import { setDatePicker } from '@amec/webasset/flatpickr';
import { webflowSubmit } from '@amec/webasset/components/form';
import { fetchUtils } from '@amec/webasset/api/fetch-utils';
import {
    getExtData,
    getFormDetail,
    showflow,
} from '@amec/webasset/api/webform';
import { redirectWebflow } from '@amec/webasset/form';
import select2 from 'select2';
import 'select2/dist/css/select2.min.css';

select2();

const isReturnMode = window.FIN_NPO_RETURN_MODE === true;
const deletedAttachmentIds = [];

$(async function () {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const empno = urlParams.get('empno');
    const getsec = {};
    let prefix = '';
    try {
        prefix = getsec.SSECCODE;
    } catch (error) {
        console.log('Error extracting SSECCODE:', error);
    }

    console.log('Prefix ที่ได้คือ:', prefix);
    const empName = getEmpName(getsec);
    console.log(empName);
    $('#INPUTBY').val(empno);
    $('#INPUTBY_NAME').val(empName);
    console.log(empName);
    setEmpName('.inputby-feedback', empName);

    $('#REQBY').val(empno);
    $('#REQBY_NAME').val(empName);
    setEmpName('.reqby-feedback', empName);

    let options = { request: true, save: false };
    if (isReturnMode) {
        const form = getReturnFormKey();
        const flow = await showflow(form);
        options = {
            request: false,
            save: true,
            flow: true,
            flowhtml: flow.html,
        };
    }

    const action = webflowSubmit(options);

    console.log(action);
    $('#actionform').html(action);
    await Promise.allSettled([
        renderPurpose(),
        renderVendor(),
        setInitialEmployee(empno),
    ]);
    if (isReturnMode) {
        await loadReturnData();
    } else if (typeof createTableStamp === 'function') {
        createTableStamp();
    }
});

async function loadReturnData() {
    const form = getReturnFormKey();
    const parts = [
        form.NFRMNO,
        form.VORGNO,
        form.CYEAR,
        form.CYEAR2,
        form.NRUNNO,
    ].map(encodeURIComponent);
    const [formDetail, response, costCenterResponse] = await Promise.all([
        getFormDetail(form),
        fetchUtils({
            url: `${process.env.APP_API}/finform/fin-npo/show/${parts.join('/')}`,
            method: 'GET',
        }),
        fetchUtils({
            url: `${process.env.APP_API}/finform/fin-npo/costcenter`,
            method: 'GET',
        }),
    ]);
    const data = response?.data || response || {};
    const head = data.head || data.HEAD || {};
    const invoices = data.invoices || data.invoice || [];
    const inputBy = formDetail?.VINPUTER || formDetail?.INPUTBY || form.EMPNO;
    const requestBy = formDetail?.VREQNO || formDetail?.REQBY || form.EMPNO;

    $('#FORMNO').val(formDetail?.FORMNO || formDetail?.VFORMNO || '');
    $('#INPUTBY').val(inputBy);
    $('#REQBY').val(requestBy);
    await Promise.all([
        setInitialEmployee(inputBy),
        setRequesterEmployee(requestBy),
    ]);
    $('#EXPENSE_ID')
        .val(head.EXPENSE_CODE || '')
        .trigger('change');
    $('#VENDOR_CODE')
        .val(String(head.VENDOR_CODE || ''))
        .trigger('change');
    const employeeCodes = normalizeList(costCenterResponse)
        .filter(
            (item) =>
                String(item.CYEAR2 ?? '').slice(-2) ===
                    String(form.CYEAR2 ?? '').slice(-2) &&
                Number(item.NRUNNO) === Number(form.NRUNNO),
        )
        .map((item) => String(item.REQNO || '').trim())
        .filter(Boolean);
    await populateAirSalesEmployees(employeeCodes);
    createTableStamp(
        invoices.map((invoice) => ({
            LINEID: invoice.ID,
            INVOICE_DATE: String(invoice.INVOICE_DATE || '').substring(0, 10),
            INVOICE_NO: invoice.INVOICE_NO || '',
            TOTAL_AMOUNT: invoice.TOTAL_AMT,
            VAT:
                Number(invoice.TOTAL_AMT || 0) - Number(invoice.NET_PRICE || 0),
            NET_PRICE: invoice.NET_PRICE,
            REFERENCE: invoice.REFERENCE ?? invoice.REMARK ?? '',
        })),
    );
    renderExistingAttachments(data.files || data.FILES || []);
    $('#attachfile').prop('required', false);
}

function renderExistingAttachments(files = []) {
    const container = $('#existingAttachmentList');
    if (!container.length) return;

    const attachmentFiles = Array.isArray(files)
        ? files
        : Object.values(files || {});
    container.removeClass('hidden');

    if (!attachmentFiles.length) {
        container.html(
            '<p class="text-xs text-base-content/50">No existing attachment</p>',
        );
        return;
    }

    container.html(
        `<p class="mb-2 text-xs font-semibold text-base-content/60">Existing attachment</p>
        <ul class="space-y-2">${attachmentFiles
            .map((file) => {
                const id = file.FILE_ID || file.id;
                const name =
                    file.FILE_ONAME ||
                    file.FILE_NAME ||
                    file.name ||
                    'Attachment';
                const url = id
                    ? `${process.env.APP_API}/finform/fin-npo/file/${encodeURIComponent(id)}`
                    : '';

                return `<li class="flex items-center justify-between gap-3 rounded-lg border border-info/20 bg-white px-3 py-2">
                    <span class="min-w-0 truncate text-sm font-semibold" title="${escapeHtml(name)}">${escapeHtml(name)}</span>
                    <span class="flex shrink-0 items-center gap-2">
                        ${url ? `<a class="btn btn-xs btn-info" target="_blank" rel="noopener" href="${escapeHtml(url)}">Download</a>` : ''}
                        ${id ? `<button type="button" class="delete-existing-attachment btn btn-xs btn-error" data-file-id="${escapeHtml(id)}">Delete</button>` : ''}
                    </span>
                </li>`;
            })
            .join('')}</ul>`,
    );
}

$(document).on('click', '.delete-existing-attachment', function () {
    if (!confirm('Are you sure you want to delete this attachment?')) return;

    const button = $(this);
    const id = button.attr('data-file-id');
    const list = button.closest('ul');

    deletedAttachmentIds.push(id);
    button.closest('li').remove();
    if (!list.children().length) {
        list.prev('p')
            .attr('class', 'text-xs text-base-content/50')
            .text('No existing attachment');
        list.remove();
    }
});

$(document).on('change', '#attachfile', function () {
    if (!isReturnMode) return;

    const selectedFiles = Array.from(this.files || []);
    const container = $('#existingAttachmentList');
    container.find('.new-attachment-preview').remove();

    if (!selectedFiles.length) return;

    container.removeClass('hidden').append(
        `<div class="new-attachment-preview mt-3">
            <p class="mb-2 text-xs font-semibold text-success">New attachment to be added:</p>
            <ul class="space-y-1">${selectedFiles
                .map(
                    (file) =>
                        `<li class="truncate text-sm font-semibold" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</li>`,
                )
                .join('')}</ul>
        </div>`,
    );
});

async function populateAirSalesEmployees(employeeCodes = []) {
    resetAirFreightSalesEmployeeRows();

    for (const [index, employeeCode] of employeeCodes.entries()) {
        if (index > 0) addAirFreightSalesEmployeeRow();

        const input = $('#airSalesEmployeeRows .air-sales-by').eq(index);
        input.val(employeeCode);
        await setAirFreightSalesEmployee(input[0]);
    }
}

function getReturnFormKey() {
    const params = new URLSearchParams(window.location.search);
    return {
        NFRMNO: params.get('no'),
        VORGNO: params.get('orgNo'),
        CYEAR: params.get('y'),
        CYEAR2: params.get('y2') || params.get('y'),
        NRUNNO: params.get('runNo'),
        EMPNO: params.get('empno'),
    };
}

/*--------------------Change FUNCTION--------------------*/
$(document).on('change', '#REQBY', async function () {
    await setRequesterEmployee($(this).val().trim());
});

$(document).on('keydown', '#REQBY', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        $(this).trigger('change');
    }
});

$(document).on('change', '#EXPENSE_ID', function () {
    toggleAirFreightSalesEmployee();
});

$(document).on('change', '.air-sales-by', async function () {
    await setAirFreightSalesEmployee(this);
});

$(document).on('keydown', '.air-sales-by', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        $(this).trigger('change');
    }
});

$(document).on('click', '#addAirSalesEmployeeRow', function () {
    addAirFreightSalesEmployeeRow();
});

/*--------------------detail FUNCTION--------------------*/

export async function getPurpose() {
    return await fetchUtils({
        url: `${process.env.APP_API}/finform/fin-npo/expense`,
        method: 'GET',
    });
}

export async function getVendor() {
    return await fetchUtils({
        url: `${process.env.APP_API}/finform/fin-npo/vendor`,
        method: 'GET',
    });
}

function normalizeList(response) {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.DATA)) return response.DATA;
    if (Array.isArray(response?.data?.data)) return response.data.data;
    if (Array.isArray(response?.data?.rows)) return response.data.rows;
    if (Array.isArray(response?.DATA?.ROWS)) return response.DATA.ROWS;
    if (Array.isArray(response?.rows)) return response.rows;
    if (Array.isArray(response?.ROWS)) return response.ROWS;
    if (Array.isArray(response?.result)) return response.result;
    if (Array.isArray(response?.RESULT)) return response.RESULT;
    if (Array.isArray(response?.expense)) return response.expense;
    if (Array.isArray(response?.EXPENSE)) return response.EXPENSE;
    if (Array.isArray(response?.list)) return response.list;
    if (Array.isArray(response?.LIST)) return response.LIST;
    return [];
}

function getFirstValue(item, keys, fallback = '') {
    const key = keys.find(
        (name) => item?.[name] !== undefined && item?.[name] !== null,
    );
    return key ? item[key] : fallback;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function initializeSearchableSelect(select, placeholder) {
    if (select.hasClass('select2-hidden-accessible')) {
        select.select2('destroy');
    }

    select.select2({
        width: '100%',
        placeholder,
        minimumResultsForSearch: 0,
    });
}

async function renderPurpose() {
    const purposeSelect = $('#EXPENSE_ID');

    purposeSelect
        .prop('disabled', true)
        .html('<option value="">Loading expense type...</option>');

    try {
        const purpose = normalizeList(await getPurpose());

        if (!purpose.length) {
            purposeSelect.html(
                '<option value="">Expense type data not found.</option>',
            );
            return;
        }

        const purposeOptions = purpose
            .map((item, index) => {
                const id = getFirstValue(
                    item,
                    [
                        'EXPENSE_ID',
                        'EXPENSE_CODE',
                        'EXPENSE_TYPE',
                        'TYPE_ID',
                        'TYPE',
                        'PURPOSE_ID',
                        'ID',
                        'CODE',
                    ],
                    index + 1,
                );
                const textTh = getFirstValue(item, [
                    'EXPENSE_TNAME',
                    'EXPENSE_TH',
                    'PURPOSE_TH',
                    'NAME_TH',
                    'TITLE_TH',
                    'EXPENSE_NAME_TH',
                    'TYPE_TH',
                    'TYPE_NAME_TH',
                ]);
                const textEn = getFirstValue(item, [
                    'EXPENSE_ENAME',
                    'EXPENSE_EN',
                    'PURPOSE_EN',
                    'NAME_EN',
                    'TITLE_EN',
                    'EXPENSE_NAME_EN',
                    'TYPE_EN',
                    'TYPE_NAME_EN',
                ]);
                const fallbackText = getFirstValue(item, [
                    'EXPENSE_NAME',
                    'PURPOSE_NAME',
                    'EXPENSE_DESC',
                    'EXPENSE_DESCRIPTION',
                    'TYPE_NAME',
                    'NAME',
                    'TITLE',
                    'DESCRIPTION',
                ]);
                const label =
                    [textTh, textEn].filter(Boolean).join(' / ') ||
                    fallbackText ||
                    id;

                return `<option value="${escapeHtml(id)}"
                        data-expense-tname="${escapeHtml(textTh)}"
                        data-expense-ename="${escapeHtml(textEn)}"
                        data-expense-label="${escapeHtml(label)}">${escapeHtml(label)}</option>`;
            })
            .join('');

        purposeSelect.html(
            `<option value="">Select expense type...</option>${purposeOptions}`,
        );
        toggleAirFreightSalesEmployee();
    } catch (error) {
        console.error('Failed to load expense type:', error);
        purposeSelect.html(
            '<option value="">Cannot load expense type.</option>',
        );
    } finally {
        purposeSelect.prop('disabled', false);
        initializeSearchableSelect(purposeSelect, 'Select expense type...');
    }
}

async function renderVendor() {
    const vendorSelect = $('#VENDOR_CODE');

    vendorSelect
        .prop('disabled', true)
        .html('<option value="">Loading vendor...</option>');

    try {
        const vendor = normalizeList(await getVendor());

        console.log('Vendor data:', vendor);
        if (!vendor.length) {
            vendorSelect.html(
                '<option value="">Vendor data not found</option>',
            );
            return;
        }

        const vendorOptions = vendor
            .map((item) => {
                const code = getFirstValue(item, ['VENDOR_CODE', 'CODE', 'ID']);
                const name = getFirstValue(item, [
                    'VENDOR_NAME',
                    'NAME',
                    'SUPPLIER_NAME',
                ]);
                const label = [code, name].filter(Boolean).join(' - ') || code;

                if (!code) return '';

                return `<option value="${escapeHtml(code)}" data-vendor-name="${escapeHtml(name)}">${escapeHtml(label)}</option>`;
            })
            .filter(Boolean)
            .join('');

        vendorSelect.html(
            `<option value="">Please select vendor</option>${vendorOptions}`,
        );
    } catch (error) {
        console.error('Failed to load vendor:', error);
        vendorSelect.html('<option value="">Cannot load vendor</option>');
    } finally {
        vendorSelect.prop('disabled', false);
        initializeSearchableSelect(vendorSelect, 'Please select vendor');
    }
}

/*--------------------READY FUNCTION--------------------*/

async function setInitialEmployee(empno) {
    if (!empno) return;

    try {
        const getsec = await getData(empno);
        const empName = getEmpName(getsec);

        $('#INPUTBY_NAME').val(empName);
        setEmpName('.inputby-feedback', empName);
        $('#REQBY_NAME').val(empName);
        setEmpName('.reqby-feedback', empName);
        setRequesterSection(getsec);
    } catch (error) {
        console.error('Failed to load initial employee:', error);
    }
}

async function setRequesterEmployee(empno) {
    const reqbyName = $('#REQBY_NAME');

    reqbyName.val('');
    setEmpName('.reqby-feedback', '');
    setRequesterSection();

    if (!empno) return;

    try {
        const empData = await getData(empno);
        const empName = getEmpName(empData);

        if (!empName) {
            throw new Error('Employee data not found');
        }

        reqbyName.val(empName);
        setEmpName('.reqby-feedback', empName);
        setRequesterSection(empData);
    } catch (error) {
        console.error('Failed to load requester employee:', error);
        reqbyName.val('');
        setEmpName('.reqby-feedback', '');
        setRequesterSection();
        showMessage(error.message || 'Employee data not found', 'error');
    }
}

function setRequesterSection(empData = {}) {
    const section = [empData?.SDIV, empData?.SDEPT, empData?.SSEC]
        .filter(
            (value) => value !== undefined && value !== null && value !== '',
        )
        .join('/');

    $('#FULLDP').val(section);
}

function isTravelingAbroadPurpose(input) {
    const purposeInput = $(input);
    const expenseEname = String(
        purposeInput.data('expense-ename') || '',
    ).trim();
    const expenseLabel = String(
        purposeInput.data('expense-label') ||
            purposeInput.closest('label').text() ||
            '',
    ).trim();

    return (
        expenseEname.toUpperCase() === 'TRAVELLING ABOARD' ||
        expenseLabel.toUpperCase().includes('TRAVELLING ABOARD')
    );
}

function resetAirFreightSalesEmployeeRows() {
    const rows = $('#airSalesEmployeeRows');
    const firstRow = rows.find('.air-sales-employee-row:first');

    firstRow.find('.air-sales-by').val('');
    setEmpName(firstRow.find('.air-sales-feedback'), '');
    rows.find('.air-sales-employee-row:not(:first)').remove();
}

function toggleAirFreightSalesEmployee() {
    const selectedPurpose = $('#EXPENSE_ID option:selected');
    const shouldShow =
        Boolean(selectedPurpose.val()) &&
        isTravelingAbroadPurpose(selectedPurpose[0]);
    const section = $('#airFreightSalesEmployeeSection');

    section.toggleClass('hidden', !shouldShow);
    $('.air-sales-by').toggleClass('req', shouldShow);

    if (!shouldShow) {
        resetAirFreightSalesEmployeeRows();
    }
}

function addAirFreightSalesEmployeeRow() {
    const rows = $('#airSalesEmployeeRows');
    const newRow = rows.find('.air-sales-employee-row:first').clone();

    newRow.find('.air-sales-by').val('');
    setEmpName(newRow.find('.air-sales-feedback'), '');
    rows.append(newRow);
    newRow.find('.air-sales-by').focus();
}

async function setAirFreightSalesEmployee(input) {
    const employeeInput = $(input);
    const empno = employeeInput.val().trim();
    const row = employeeInput.closest('.air-sales-employee-row');
    const employeeName = row.find('.air-sales-feedback');

    setEmpName(employeeName, '');

    if (!empno) return;

    try {
        const empData = await getData(empno);
        const empName = getEmpName(empData);

        if (!empName) {
            throw new Error('Employee data not found');
        }

        setEmpName(employeeName, empName);
    } catch (error) {
        console.error('Failed to load air freight sales employee:', error);
        setEmpName(employeeName, '');
        showMessage(error.message || 'Employee data not found', 'error');
    }
}

//    Gety Employee Name from API response with various possible keys

function getEmpName(empData = {}) {
    return (
        empData?.SNAME ||
        empData?.EMP_NAME ||
        empData?.EMPNAME ||
        empData?.FULLNAME ||
        empData?.NAME ||
        ''
    );
}

function setEmpName(element, name) {
    const nameElement = $(element);
    nameElement.find('.emp-name').text(name);
    nameElement.toggleClass('hidden', !name).toggleClass('flex', Boolean(name));
}

export async function getData(empno) {
    const response = await fetchUtils({
        url: `${process.env.APP_API}/users/${empno}`,
        method: 'GET',
    });

    return response?.data?.data || response?.data || response;
}

async function getStamp() {
    return await fetchUtils({
        url: `${process.env.APP_API}/finform/fin-npo`,
        method: 'GET',
    });
}
var invoiceLineId = 0;

function numberValue(value) {
    if (typeof value === 'string') {
        return Number(value.replace(/[\$,%]/g, '')) || 0;
    }

    return Number(value) || 0;
}

function formatAmount(value) {
    return value === '' || value == null ? '' : Number(value).toFixed(2);
}

function emptyInvoiceRow() {
    return {
        LINEID: ++invoiceLineId,
        INVOICE_DATE: '',
        INVOICE_NO: '',
        TOTAL_AMOUNT: '',
        VAT: '',
        NET_PRICE: '',
        REFERENCE: '',
    };
}

function invoiceRowHtml(row = {}, removable = false) {
    return `<tr data-lineid="${escapeHtml(row.LINEID || ++invoiceLineId)}">
        <td><input type="text" name="INVOICE_DATE[]" value="${escapeHtml(row.INVOICE_DATE)}"
            class="invoice-date input input-sm input-bordered w-full bg-white" required></td>
        <td><input type="text" name="INVOICE_NO[]" value="${escapeHtml(row.INVOICE_NO)}"
            class="invoice-no input input-sm input-bordered w-full bg-white" required></td>
        <td><input type="number" step="0.01" min="0" name="TOTAL_AMOUNT[]" value="${escapeHtml(formatAmount(row.TOTAL_AMOUNT))}"
            class="total-amount input input-sm input-bordered w-full bg-white text-right" required></td>
        <td><input type="number" step="0.01" min="0" name="VAT[]" value="${escapeHtml(formatAmount(row.VAT))}"
            class="vat input input-sm input-bordered w-full bg-white text-right"></td>
        <td><input type="number" step="0.01" name="NET_PRICE[]" value="${escapeHtml(formatAmount(row.NET_PRICE))}"
            class="net-price input input-sm input-bordered w-full bg-base-200/80 text-right" readonly></td>
        <td><input type="text" name="REFERENCE[]" value="${escapeHtml(row.REFERENCE)}" maxlength="255"
            class="reference input input-sm input-bordered w-full bg-white"></td>
        <td>${removable ? `<button type="button" class="remove-invoice-row btn btn-square btn-sm" aria-label="Remove invoice row" title="Remove invoice row">&times;</button>` : ''}</td>
    </tr>`;
}

function setInvoiceDatePicker() {
    setDatePicker({
        element: '#stampTable .invoice-date:not(.flatpickr-input)',
    });
}

function calculateInvoiceRow(row) {
    const rowElement = $(row);
    const totalAmount = numberValue(rowElement.find('.total-amount').val());
    const vat = numberValue(rowElement.find('.vat').val());
    const netPrice = totalAmount - vat;

    rowElement
        .find('.net-price')
        .val(totalAmount || vat ? netPrice.toFixed(2) : '');
}

function createTableStamp(data = []) {
    invoiceLineId = 0;
    const tableData = data.length ? data : [emptyInvoiceRow()];

    $('#stampTable').html(`<thead>
        <tr>
            <th>Invoice Date</th>
            <th>Invoice No.</th>
            <th>Total Amount </th>
            <th>VAT</th>
            <th class="invoice-header-blue">Net Price</th>
            <th>Reference</th>
            <th>Action</th>
        </tr>
    </thead>
    <tbody>${tableData.map((row) => invoiceRowHtml(row)).join('')}</tbody>`);

    $('#stampTable tbody tr').each(function () {
        calculateInvoiceRow(this);
    });
    setInvoiceDatePicker();
}

$(document).on('click', '#addStampRow', function () {
    $('#stampTable tbody').append(invoiceRowHtml(emptyInvoiceRow(), true));
    setInvoiceDatePicker();
});

$(document).on('click', '.remove-invoice-row', function () {
    $(this).closest('tr').remove();
});

$(document).on(
    'input',
    '#stampTable .total-amount, #stampTable .vat',
    function () {
        const [whole, decimals] = this.value.split('.');
        if (decimals?.length > 2) {
            this.value = `${whole}.${decimals.slice(0, 2)}`;
        }
        const row = $(this).closest('tr');
        calculateInvoiceRow(row);
    },
);

$(document).on(
    'blur',
    '#stampTable .total-amount, #stampTable .vat',
    function () {
        if (this.value !== '') this.value = formatAmount(this.value);
        calculateInvoiceRow($(this).closest('tr'));
    },
);

// --------------------Submit FUNCTION--------------------

let isSubmitting = false;

$(document).on(
    'click',
    '#btnRequest, button[name="btnAction"][value="save"]',
    async function (e) {
        e.preventDefault();

        if (isSubmitting) return;

        const requestButton = $(this);

        try {
            const requiredMessage = [
                {
                    element: $('#INPUTBY'),
                    message:
                        'Input employee code is missing. Please open the form again from Webflow.',
                },
                {
                    element: $('#REQBY'),
                    message: 'Please enter requester employee code.',
                },
                {
                    element: $('#FULLDP'),
                    message:
                        'Requester section was not found. Please check the employee code.',
                },
                {
                    element: $('#EXPENSE_ID'),
                    message: 'Please select expense type.',
                },
                {
                    element: $('#VENDOR_CODE'),
                    message: 'Please select vendor.',
                },
            ];

            if (!(await requiredForm('#form', requiredMessage))) return;

            const selectedExpense = $('#EXPENSE_ID');

            if (!selectedExpense.val()) {
                showMessage('Please select expense type.', 'warning');
                return;
            }

            const invoiceList = [];

            $('#stampTable tbody tr').each(function (index) {
                const row = $(this);
                const invoice = {
                    LINE_ID: index + 1,
                    INVOICE_DATE: row.find('.invoice-date').val() || '',
                    INVOICE_NO: row.find('.invoice-no').val()?.trim() || '',
                    TOTAL_AMOUNT: numberValue(row.find('.total-amount').val()),
                    VAT: numberValue(row.find('.vat').val()),
                    NET_PRICE: numberValue(row.find('.net-price').val()),
                    REFERENCE: row.find('.reference').val()?.trim() || '',
                };

                invoiceList.push(invoice);
            });

            const invalidInvoiceIndex = invoiceList.findIndex(
                (invoice) =>
                    !invoice.INVOICE_DATE ||
                    !invoice.INVOICE_NO ||
                    invoice.TOTAL_AMOUNT <= 0,
            );

            if (invalidInvoiceIndex >= 0) {
                showMessage(
                    `Please complete Invoice Date, Invoice No. and Total Amount in row ${invalidInvoiceIndex + 1}.`,
                    'warning',
                );
                return;
            }

            const attachmentInput = document.getElementById('attachfile');

            if (!isReturnMode && !attachmentInput?.files?.length) {
                showMessage('Please attach at least one file.', 'warning');
                attachmentInput?.focus();
                return;
            }

            const airSalesBy = $('.air-sales-by')
                .map((_, input) => $(input).val().trim())
                .get()
                .filter(Boolean);
            const isTravelingAbroad = isTravelingAbroadPurpose(
                selectedExpense.find('option:selected')[0],
            );

            if (isTravelingAbroad && airSalesBy.length === 0) {
                showMessage(
                    'Please enter at least one employee who is traveling abroad.',
                    'warning',
                );
                return;
            }

            const requesterCode = String($('#REQBY').val() || '').trim();
            const costCenterEmployees = isTravelingAbroad
                ? airSalesBy
                : [requesterCode];

            const payload = {
                INPUTBY: String($('#INPUTBY').val() || '').trim(),
                REQBY: requesterCode,
                EXPENSE_CODE: Number(selectedExpense.val()),
                VENDOR_CODE: $('#VENDOR_CODE').val() || '',
                // The API uses AIR_SALES_BY to create rows in the cost center table.
                // Non-travel expenses use the requester as their cost center owner.
                AIR_SALES_BY: costCenterEmployees,
                DATA: invoiceList.map((invoice) => ({
                    LINE_ID: invoice.LINE_ID,
                    INVOICE_DATE: invoice.INVOICE_DATE,
                    INVOICE_NO: invoice.INVOICE_NO,
                    NET_PRICE: invoice.NET_PRICE,
                    REFERENCE: invoice.REFERENCE,
                    VAT_RATE_ID: invoice.NET_PRICE
                        ? Math.round((invoice.VAT / invoice.NET_PRICE) * 100)
                        : 0,
                    TOTAL_AMT: invoice.TOTAL_AMOUNT,
                    SCURCODE: 'THB',
                })),
            };

            console.log(
                'Submitting FIN-NPO payload JSON:\n',
                JSON.stringify(payload, null, 2),
            );

            isSubmitting = true;
            requestButton.prop('disabled', true);

            const res = isReturnMode
                ? await actionReturnForm({
                      ...getReturnFormKey(),
                      ACTION: 'save',
                      REMARK: '',
                      ...payload,
                  })
                : await createForm(payload);

            if (res?.status === false) {
                throw new Error(res?.message || 'Cannot submit request');
            }

            returnToWebflow();
        } catch (error) {
            console.error(error);
            showMessage(error.message || 'Cannot submit request', 'error');
        } finally {
            isSubmitting = false;
            requestButton.prop('disabled', false);
        }
    },
);

export async function createForm(payload) {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
        formData.append(
            key,
            Array.isArray(value) || (value && typeof value === 'object')
                ? JSON.stringify(value)
                : String(value ?? ''),
        );
    });

    Array.from(document.getElementById('attachfile')?.files || []).forEach(
        (file) => formData.append('attachfile', file),
    );

    return await fetchUtils({
        url: `${process.env.APP_API}/finform/fin-npo`,
        method: 'POST',
        data: formData,
    });
}

async function actionReturnForm(payload) {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
        formData.append(
            key,
            Array.isArray(value) || (value && typeof value === 'object')
                ? JSON.stringify(value)
                : String(value ?? ''),
        );
    });

    Array.from(document.getElementById('attachfile')?.files || []).forEach(
        (file) => formData.append('attachfile', file),
    );
    formData.append('DELETE_FILE_IDS', JSON.stringify(deletedAttachmentIds));

    const updateResult = await fetchUtils({
        url: `${process.env.APP_API}/finform/fin-npo/update`,
        method: 'POST',
        data: formData,
    });

    if (updateResult?.status === false) return updateResult;

    const form = getReturnFormKey();
    const actionResult = await fetchUtils({
        url: `${process.env.APP_API}/finform/fin-npo/action`,
        method: 'POST',
        data: {
            ...form,
            ACTION: 'approve',
            REMARK: payload.REMARK || '',
            CEXTDATA: getCextDataValue(await getExtData(form)),
            DATA: [],
        },
    });

    return actionResult?.status === false ? actionResult : updateResult;
}

function returnToWebflow() {
    if (window.opener && !window.opener.closed) {
        window.opener.focus();
        window.close();
        return;
    }

    redirectWebflow();
}

function getCextDataValue(value) {
    if (!value) return '';
    if (typeof value === 'string') return value.trim();
    if (Array.isArray(value)) return getCextDataValue(value[0]);
    if (typeof value === 'object') {
        return getCextDataValue(
            value.CEXTDATA ?? value.cextData ?? value.data ?? value.message,
        );
    }
    return String(value).trim();
}
