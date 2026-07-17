import { fetchUtils } from '@amec/webasset/api/fetch-utils';
import {
    getExtData,
    getFormDetail,
    getMode,
    showflow,
} from '@amec/webasset/api/webform';
import { createTable } from '@amec/webasset/dataTable';
import { webflowSubmit } from '@amec/webasset/components/form';
import { redirectWebflow } from '@amec/webasset/form';
import { showMessage } from '@amec/webasset/utils';

let isActionProcessing = false;
let cextData = '';

$(async function () {
    lockForm();

    const form = getFormKeyFromUrl();

    if (!hasFormKey(form)) {
        showMessage('Form key not found in URL', 'warning');
        await renderInvoiceTable([]);
        return;
    }

    try {
        const [formDetail, showData] = await Promise.all([
            getFormDetail(form),
            getShowData(form),
        ]);

        if (showData?.status === false) {
            throw new Error(showData.message || 'FIN-NPO data not found');
        }

        renderFormDetail(formDetail || {});

        const requesterCode =
            formDetail?.VREQNO || formDetail?.REQBY || form.EMPNO;
        if (requesterCode) {
            try {
                renderEmployee(await getEmployee(requesterCode));
            } catch (error) {
                console.error('Cannot load requester information:', error);
            }
        }

        const data = normalizeShowData(showData);
        renderHeader(data.head, data.expense, data.vendor);
        renderTravelers(data.travelers);
        renderAttachments(data.files);
        await renderInvoiceTable(data.invoices);
        await renderWorkflowAction(form);
    } catch (error) {
        console.error(error);
        showMessage(error.message || 'Cannot load FIN-NPO data', 'error');
        renderLoadError(error);
        renderAttachments([]);
        await renderInvoiceTable([]);
    }
});

$(document).on('click', 'button[name="btnAction"]', async function (event) {
    event.preventDefault();

    if (isActionProcessing) return;

    const action = $(this).val();
    const remark = String($('#remark').val() || '').trim();

    if (action === 'reject' && !remark) {
        showMessage('Please input remark for reject.', 'warning');
        $('#remark').trigger('focus');
        return;
    }

    try {
        isActionProcessing = true;
        $('button[name="btnAction"]').prop('disabled', true);

        const form = getFormKeyFromUrl();
        const result = await actionFinNpo({
            ...form,
            ACTION: action,
            REMARK: remark,
            CEXTDATA: getCextDataValue(cextData),
        });

        if (result?.status === false) {
            throw new Error(result.message || 'Cannot process workflow action');
        }

        showMessage(result?.message || 'Workflow action completed', 'success');
        redirectWebflow();
    } catch (error) {
        console.error(error);
        showMessage(error.message || 'Cannot process workflow action', 'error');
    } finally {
        isActionProcessing = false;
        $('button[name="btnAction"]').prop('disabled', false);
    }
});

function getFormKeyFromUrl() {
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

function hasFormKey(form) {
    return Boolean(
        form.NFRMNO && form.VORGNO && form.CYEAR && form.CYEAR2 && form.NRUNNO,
    );
}

async function getShowData(form) {
    const parts = [
        form.NFRMNO,
        form.VORGNO,
        form.CYEAR,
        form.CYEAR2,
        form.NRUNNO,
    ].map(encodeURIComponent);

    return await fetchUtils({
        url: `${process.env.APP_API}/finform/fin-npo/show/${parts.join('/')}`,
        method: 'GET',
    });
}

async function getEmployee(empno) {
    return await fetchUtils({
        url: `${process.env.APP_API}/users/${encodeURIComponent(empno)}`,
        method: 'GET',
    });
}

async function actionFinNpo(payload) {
    return await fetchUtils({
        url: `${process.env.APP_API}/finform/fin-npo/action`,
        method: 'POST',
        data: payload,
    });
}

function lockForm() {
    $('#form')
        .find('input, select, textarea')
        .not('[type="hidden"]')
        .prop('disabled', true)
        .prop('readonly', true)
        .addClass('show-readonly');
}

function renderFormDetail(detail = {}) {
    $('#FORMNO').val(detail.FORMNO || detail.VFORMNO || '');
    $('#INPUTBY').val(
        formatPerson(
            detail.VINPUTNAME || detail.INPUT_NAME,
            detail.VINPUTER || detail.INPUTBY,
        ),
    );
    $('#REQBY').val(
        formatPerson(
            detail.VREQNAME || detail.REQ_NAME,
            detail.VREQNO || detail.REQBY,
        ),
    );
}

function renderEmployee(employee = {}) {
    $('#FULLDP').val(
        [employee.SDIV, employee.SDEPT, employee.SSEC]
            .filter(Boolean)
            .join(' / '),
    );
    $('#Pos').text(employee.SPOSNAME || employee.POSITION || 'Employee');
}

function normalizeShowData(response) {
    const data = response?.data || response || {};

    return {
        head: data.head || data.HEAD || {},
        invoices: toArray(
            data.invoices || data.invoice || data.detail || data.DETAIL,
        ),
        files: toArray(data.files || data.FILES),
        travelers: toArray(
            data.travelers || data.airSalesBy || data.AIR_SALES_BY,
        ),
        expense: data.expense || data.EXPENSE || {},
        vendor: data.vendor || data.VENDOR || {},
    };
}

function renderHeader(head = {}, expense = {}, vendor = {}) {
    $('#SUBJECT').val(head.SUBJECT || '');
    $('#EXPENSE_CODE').val(head.EXPENSE_CODE || expense.EXPENSE_CODE || '');
    $('#EXPENSE_NAME').val(
        [expense.EXPENSE_TNAME, expense.EXPENSE_ENAME]
            .filter(Boolean)
            .join(' / ') ||
            head.EXPENSE_NAME ||
            '-',
    );
    $('#VENDOR_CODE').val(head.VENDOR_CODE || vendor.VENDOR_CODE || '');
    $('#VENDOR_NAME').val(
        formatVendor(
            head.VENDOR_CODE || vendor.VENDOR_CODE,
            vendor.VENDOR_NAME || head.VENDOR_NAME,
        ),
    );
}

function renderTravelers(travelers = []) {
    const section = $('#airSalesEmployeeSection');

    if (!travelers.length) {
        section.addClass('hidden');
        return;
    }

    section.removeClass('hidden');
    $('#airSalesEmployeeList').html(
        `<ul class="space-y-2">${travelers
            .map((item) => {
                const code =
                    typeof item === 'string'
                        ? item
                        : item.EMPNO ||
                          item.EMP_CODE ||
                          item.AIR_SALES_BY ||
                          '';
                const name =
                    typeof item === 'object'
                        ? item.EMPNAME || item.NAME || ''
                        : '';
                return `<li class="rounded border border-violet-100 px-3 py-2">${escapeHtml(formatPerson(name, code))}</li>`;
            })
            .join('')}</ul>`,
    );
}

async function renderInvoiceTable(invoices = []) {
    $('#stampTable').html(`<thead><tr>
        <th>No.</th><th>Invoice Date</th><th>Invoice No.</th>
        <th>Net Price</th><th>VAT Rate</th><th>Total Amount</th><th>Currency</th>
    </tr></thead>`);

    return await createTable(
        {
            data: invoices,
            columns: [
                { data: 'ID', defaultContent: '' },
                {
                    data: 'INVOICE_DATE',
                    defaultContent: '',
                    render: formatDate,
                },
                { data: 'INVOICE_NO', defaultContent: '' },
                { data: 'NET_PRICE', defaultContent: 0, render: formatNumber },
                { data: 'VAT_RATE_ID', defaultContent: 0, render: formatVat },
                { data: 'TOTAL_AMT', defaultContent: 0, render: formatNumber },
                { data: 'SCURCODE', defaultContent: '' },
            ],
            ordering: false,
            searching: false,
            paging: false,
            info: false,
            destroy: true,
        },
        { id: 'stampTable', inlineEdit: { status: false } },
    );
}

function renderAttachments(files = []) {
    if (!files.length) {
        $('#attachmentList').html('<span>No attachment</span>');
        return;
    }

    $('#attachmentList').html(
        `<ul class="space-y-2">${files
            .map((file) => {
                const id = file.FILE_ID || file.id;
                const name =
                    file.FILE_ONAME ||
                    file.FILE_NAME ||
                    file.name ||
                    'Attachment';
                const url = `${process.env.APP_API}/finform/fin-npo/file/${encodeURIComponent(id)}`;
                return `<li class="flex items-center justify-between gap-3 rounded-lg border border-cyan-200 bg-white px-4 py-3">
                    <span class="truncate font-semibold">${escapeHtml(name)}</span>
                    ${id ? `<a class="btn btn-xs btn-info" target="_blank" href="${escapeHtml(url)}">Download</a>` : ''}
                </li>`;
            })
            .join('')}</ul>`,
    );
}

async function renderWorkflowAction(form) {
    try {
        const mode = String(await getMode(form));
        cextData = getCextDataValue(await getExtData(form));
        const flow = await showflow(form);
        const action =
            mode === '2'
                ? webflowSubmit({
                      flow: true,
                      flowhtml: flow?.html || flow?.data?.html || '',
                      approve: true,
                      reject: true,
                  })
                : webflowSubmit({
                      flow: true,
                      flowhtml: flow?.html || flow?.data?.html || '',
                      actionsForm: false,
                  });

        $('#sentApprove').html(action);
    } catch (error) {
        console.error('Cannot load workflow action:', error);
        $('#sentApprove').html(
            `<div class="alert alert-error mt-5">${escapeHtml(error.message || 'Cannot load workflow action')}</div>`,
        );
    }
}

function renderLoadError(error) {
    $('#actionform').html(
        `<div class="alert alert-error">${escapeHtml(error.message || 'Cannot load FIN-NPO data')}</div>`,
    );
}

function toArray(value) {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    return [];
}

function formatPerson(name, empno) {
    if (name && empno) return `${name} (${empno})`;
    return name || empno || '';
}

function formatVendor(code, name) {
    if (code && name) return `${code} - ${name}`;
    return name || code || '';
}

function formatDate(value) {
    if (!value) return '';
    const text = String(value);
    return /^\d{4}-\d{2}-\d{2}/.test(text) ? text.substring(0, 10) : text;
}

function formatNumber(value) {
    return Number(value || 0).toLocaleString('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function formatVat(value) {
    const text = formatNumber(value);
    return `${text}%`;
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

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
