import { showLoader } from '@amec/webasset/preloader';
import { requiredForm, showMessage } from '@amec/webasset/utils';

import { setDatePicker } from '@amec/webasset/flatpickr';
import { webflowSubmit } from '@amec/webasset/components/form';
import { fetchUtils } from '@amec/webasset/api/fetch-utils';

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
    const action = webflowSubmit({ request: true });

    console.log(action);
    $('#actionform').html(action);
    await Promise.allSettled([
        renderPurpose(),
        renderVendor(),
        renderCurrency(),
        setInitialEmployee(empno),
    ]);
    if (typeof createTableStamp === 'function') {
        createTableStamp();
    }
});

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

export async function getCurrency() {
    return await fetchUtils({
        url: `${process.env.APP_API}/finform/fin-npo/currency`,
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
    }
}

let currencyList = [];

async function renderCurrency() {
    try {
        currencyList = normalizeList(await getCurrency());
    } catch (error) {
        console.error('Failed to load currency:', error);
        currencyList = [];
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
    return await fetchUtils({
        url: `${process.env.APP_API}/users/${empno}`,
        method: 'GET',
    });
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

function formatVatPercent(value) {
    if (value === '' || value === null || value === undefined) return '';

    return `${Math.round(numberValue(value))}%`;
}

function currencyOptions(selectedValue = '') {
    const options = currencyList
        .map((item) => {
            const currency = getFirstValue(item, [
                'CURRENCY',
                'SCURCODE',
                'CODE',
            ]);
            const selected =
                String(currency) === String(selectedValue) ? 'selected' : '';

            if (!currency) return '';

            return `<option value="${escapeHtml(currency)}" ${selected}>${escapeHtml(currency)}</option>`;
        })
        .filter(Boolean)
        .join('');

    return `<option value=""></option>${options}`;
}

function emptyInvoiceRow() {
    return {
        LINEID: ++invoiceLineId,
        INVOICE_DATE: '',
        INVOICE_NO: '',
        TOTAL_AMOUNT: '',
        VAT: '',
        NET_PRICE: '',
        CURRENCY: '',
        VAT_PERCENT: '',
    };
}

function invoiceRowHtml(row = {}) {
    return `<tr data-lineid="${escapeHtml(row.LINEID || ++invoiceLineId)}">
        <td><input type="text" name="INVOICE_DATE[]" value="${escapeHtml(row.INVOICE_DATE)}"
            class="invoice-date input input-sm input-bordered w-full bg-white" required></td>
        <td><input type="text" name="INVOICE_NO[]" value="${escapeHtml(row.INVOICE_NO)}"
            class="invoice-no input input-sm input-bordered w-full bg-white" required></td>
        <td><input type="number" step="0.01" min="0" name="TOTAL_AMOUNT[]" value="${escapeHtml(row.TOTAL_AMOUNT)}"
            class="total-amount input input-sm input-bordered w-full bg-white text-right" required></td>
        <td><input type="number" step="0.01" min="0" name="VAT[]" value="${escapeHtml(row.VAT)}"
            class="vat input input-sm input-bordered w-full bg-white text-right"></td>
        <td><input type="number" step="0.01" name="NET_PRICE[]" value="${escapeHtml(row.NET_PRICE)}"
            class="net-price input input-sm input-bordered w-full bg-base-200/80 text-right" readonly></td>
        <td><select name="CURRENCY[]" class="currency select select-sm select-bordered w-full bg-white" required>
            ${currencyOptions(row.CURRENCY)}
        </select></td>
        <td><input type="text" name="VAT_PERCENT[]" value="${escapeHtml(formatVatPercent(row.VAT_PERCENT))}"
            class="vat-percent input input-sm input-bordered w-full bg-base-200/80 text-right" readonly></td>
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
    const vatPercent = netPrice
        ? ((totalAmount - netPrice) / netPrice) * 100
        : null;

    rowElement
        .find('.net-price')
        .val(totalAmount || vat ? netPrice.toFixed(2) : '');
    rowElement
        .find('.vat-percent')
        .val(vatPercent === null ? '' : formatVatPercent(vatPercent));
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
            <th class="invoice-header-orange">Currency</th>
            <th class="invoice-header-blue"> % VAT </th>
        </tr>
    </thead>
    <tbody>${tableData.map(invoiceRowHtml).join('')}</tbody>`);

    $('#stampTable tbody tr').each(function () {
        calculateInvoiceRow(this);
    });
    setInvoiceDatePicker();
}

$(document).on('click', '#addStampRow', function () {
    $('#stampTable tbody').append(invoiceRowHtml(emptyInvoiceRow()));
    setInvoiceDatePicker();
});

$(document).on(
    'input',
    '#stampTable .total-amount, #stampTable .vat',
    function () {
        const row = $(this).closest('tr');
        calculateInvoiceRow(row);
    },
);

// --------------------Submit FUNCTION--------------------

let isSubmitting = false;

$(document).on('click', '#btnRequest', async function (e) {
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
            { element: $('#VENDOR_CODE'), message: 'Please select vendor.' },
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
                CURRENCY: row.find('.currency').val() || '',
                VAT_PERCENT: numberValue(row.find('.vat-percent').val()),
            };

            invoiceList.push(invoice);
        });

        const invalidInvoiceIndex = invoiceList.findIndex(
            (invoice) =>
                !invoice.INVOICE_DATE ||
                !invoice.INVOICE_NO ||
                invoice.TOTAL_AMOUNT <= 0 ||
                !invoice.CURRENCY,
        );

        if (invalidInvoiceIndex >= 0) {
            showMessage(
                `Please complete Invoice Date, Invoice No., Total Amount and Currency in row ${invalidInvoiceIndex + 1}.`,
                'warning',
            );
            return;
        }

        const attachmentInput = document.getElementById('attachfile');

        if (!attachmentInput?.files?.length) {
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
            // FIN-NPO API currently stores this value in the SUBJECT field.
            SUBJECT: String($('#FULLDP').val() || '').trim(),
            EXPENSE_CODE: Number(selectedExpense.val()),
            VENDOR_CODE: $('#VENDOR_CODE').val() || '',
            REMARK: String($('#REMARK').val() || '').trim(),
            // The API uses AIR_SALES_BY to create rows in the cost center table.
            // Non-travel expenses use the requester as their cost center owner.
            AIR_SALES_BY: costCenterEmployees,
            DATA: invoiceList.map((invoice) => ({
                LINE_ID: invoice.LINE_ID,
                INVOICE_DATE: invoice.INVOICE_DATE,
                INVOICE_NO: invoice.INVOICE_NO,
                NET_PRICE: invoice.NET_PRICE,
                VAT_RATE_ID: invoice.VAT_PERCENT,
                TOTAL_AMT: invoice.TOTAL_AMOUNT,
                SCURCODE: invoice.CURRENCY,
            })),
        };

        console.log('Submitting FIN-NPO payload:', payload);

        isSubmitting = true;
        requestButton.prop('disabled', true);

        const res = await createForm(payload);

        if (res?.status === false) {
            throw new Error(res?.message || 'Cannot submit request');
        }

        redirectAfterSubmit();
    } catch (error) {
        console.error(error);
        showMessage(error.message || 'Cannot submit request', 'error');
    } finally {
        isSubmitting = false;
        requestButton.prop('disabled', false);
    }
});

export async function createForm(payload) {
    return await fetchUtils({
        url: `${process.env.APP_API}/finform/fin-npo`,
        method: 'POST',
        data: payload,
    });
}

function redirectAfterSubmit() {
    const params = new URLSearchParams(window.location.search);
    const backPath = params.get('bp');

    if (backPath) {
        window.location.assign(backPath);
        return;
    }

    const webflowPath = window.location.host.includes('amecwebtest')
        ? 'formtest'
        : 'form';
    window.location.assign(
        `http://webflow.mitsubishielevatorasia.co.th/${webflowPath}/workflow/WaitApv.asp`,
    );
}
