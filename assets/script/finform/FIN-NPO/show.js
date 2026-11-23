import { fetchUtils } from '@amec/webasset/api/fetch-utils';
import { sendmail } from '@amec/webasset/api/mail';
import {
    getExtData,
    getFormDetail,
    getMode,
    showflow,
} from '@amec/webasset/api/webform';
import { webflowSubmit } from '@amec/webasset/components/form';
import { showMessage } from '@amec/webasset/utils';
import { redirectWebflow } from '@amec/webasset/form';

let isActionProcessing = false;
let cextData = '';
let workflowSteps = [];

$(async function () {
    lockForm();

    const form = getFormKeyFromUrl();

    if (!hasFormKey(form)) {
        showMessage('Form key not found in URL', 'warning');
        await renderInvoiceTable([]);
        return;
    }

    try {
        const [formDetail, showData, modeResponse] = await Promise.all([
            getFormDetail(form),
            getShowData(form),
            getMode(form),
        ]);

        if (showData?.status === false) {
            throw new Error(showData.message || 'FIN-NPO data not found');
        }

        if (shouldOpenReturnForm(form, formDetail, modeResponse)) {
            redirectToReturnForm();
            return;
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
        await renderTravelers(form, data.head, data.expense);
        renderAttachments(data.files);
        let canEditWht = false;

        if (form.EMPNO) {
            try {
                const currentEmployee = await getEmployee(form.EMPNO);
                canEditWht =
                    String(currentEmployee?.SSECCODE || '').trim() === '040403';
            } catch (error) {
                console.error('Cannot verify WHT permission:', error);
            }
        }

        await renderInvoiceTable(data.invoices, canEditWht);
        await renderWorkflowAction(form, modeResponse);
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

    const buttonAction = String($(this).val() || '').toLowerCase();
    const action = buttonAction === 'save' ? 'approve' : buttonAction;
    const remark = String($('#remark').val() || '').trim();
    const invalidTaxCode = $('.wht-input').filter(
        (_, input) => !input.checkValidity(),
    )[0];

    if (invalidTaxCode) {
        showMessage('Tax code must contain 3 or 7 digits.', 'warning');
        invalidTaxCode.focus();
        return;
    }

    const invoiceData = collectInvoiceWht();

    if (['return', 'reject'].includes(action) && !remark) {
        showMessage('Please input remark for return or reject.', 'warning');
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
            DATA: invoiceData,
        });

        if (result?.status === false) {
            throw new Error(result.message || 'Cannot process workflow action');
        }

        showMessage(result?.message || 'Workflow action completed', 'success');
        if (['approve', 'reject', 'return'].includes(action)) {
            try {
                await sendActionEmail(form, action, remark);
            } catch (error) {
                console.error('Cannot send FIN-NPO email:', error);
                showMessage(
                    'Workflow action completed, but notification email could not be sent.',
                    'warning',
                );
            }
        }
        returnToWebflow();
    } catch (error) {
        console.error(error);
        showMessage(error.message || 'Cannot process workflow action', 'error');
    } finally {
        isActionProcessing = false;
        $('button[name="btnAction"]').prop('disabled', false);
    }
});

$(document).on('click', '.fin-npo-back', function (event) {
    event.preventDefault();
    redirectBackToWebflow();
});

function redirectBackToWebflow() {
    const params = new URLSearchParams(window.location.search);
    const backPath = params.get('bp');
    const webflowBase = new URL(
        process.env.APP_WEBFLOW || window.location.origin,
    );

    if (backPath) {
        window.location.assign(new URL(backPath, webflowBase).toString());
        return;
    }

    returnToWebflow();
}

function returnToWebflow() {
    if (window.opener && !window.opener.closed) {
        window.opener.focus();
        window.close();
        return;
    }

    redirectWebflow();
}

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

function shouldOpenReturnForm(form, formDetail = {}, modeResponse) {
    if (normalizeWorkflowMode(modeResponse) !== '2') return false;

    const currentEmployee = String(form.EMPNO || '').trim();
    const firstEmployees = [
        formDetail.VINPUTER,
        formDetail.INPUTBY,
        formDetail.VREQNO,
        formDetail.REQBY,
    ]
        .map((employee) => String(employee || '').trim())
        .filter(Boolean);

    return Boolean(currentEmployee && firstEmployees.includes(currentEmployee));
}

function normalizeWorkflowMode(response) {
    return String(
        response?.data?.mode ??
            response?.data?.MODE ??
            response?.data ??
            response?.mode ??
            response?.MODE ??
            response ??
            '',
    )
        .replace(/^['"]|['"]$/g, '')
        .trim();
}

function redirectToReturnForm() {
    const returnUrl = new URL('returnForm', window.location.href);
    returnUrl.search = window.location.search;
    window.location.replace(returnUrl.toString());
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

async function getCostCenters() {
    return await fetchUtils({
        url: `${process.env.APP_API}/finform/fin-npo/costcenter`,
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

async function sendActionEmail(form, action, remark) {
    const detail = await getFormDetail(form);
    const isCompleted = action === 'approve' && String(detail?.CST).trim() === '2';
    const currentEmployee = String(form.EMPNO || '').trim();
    const dimStep =
        action === 'approve' && !isCompleted && currentEmployee
            ? workflowSteps.find(
                  (step) =>
                      String(step.CSTEPNO).trim() === '02' &&
                      String(step.CSTEPST).trim() === '3' &&
                      [step.VAPVNO, step.VREPNO].some(
                          (empno) =>
                              String(empno || '').trim() === currentEmployee,
                      ),
              )
            : null;
    if (action === 'approve' && !dimStep && !isCompleted) return;

    const controller = dimStep
        ? workflowSteps.find(
              (step) =>
                  String(step.CSTEPNO).trim() === '19' &&
                  String(step.CSTEPNO).trim() ===
                      String(dimStep.CSTEPNEXTNO).trim(),
          )
        : null;
    const recipientCode = dimStep
        ? controller?.VAPVNO
        : detail?.VREQNO || detail?.REQBY;
    if (!recipientCode) {
        throw new Error(
            dimStep ? 'Controller not found' : 'Requester not found',
        );
    }

    const recipient = await getEmployee(recipientCode);
    const to = String(recipient?.SRECMAIL || '').trim();
    if (!to) {
        throw new Error(
            dimStep
                ? 'Controller email not found'
                : 'Requester email not found',
        );
    }

    const recipients = [to];
    if (dimStep) {
        const requesterCode = detail?.VREQNO || detail?.REQBY;
        if (!requesterCode) throw new Error('Requester not found');

        const requester = await getEmployee(requesterCode);
        const requesterEmail = String(requester?.SRECMAIL || '').trim();
        if (!requesterEmail) throw new Error('Requester email not found');

        if (requesterEmail.toLowerCase() !== to.toLowerCase()) {
            recipients.push(requesterEmail);
        }
    }

    const formNo =
        detail.FORMNO ||
        detail.VFORMNO ||
        `FIN-NPO${String(form.CYEAR2).slice(-2)}-${String(form.NRUNNO).padStart(6, '0')}`;
    const status = {
        approve: 'Approved',
        reject: 'Rejected',
        return: 'Returned',
    }[action];

    const result = await sendmail({
        to: dimStep ? recipients : to,
        // to: dimStep ? recipients : 'supakitt@MitsubishiElevatorAsia.co.th',
        subject: `FIN-NPO ${formNo} ${dimStep ? 'Pending Controller Approval' : status}`,
        html: `<p>Dear ${dimStep ? 'Controller and Requester' : escapeHtml(recipient.SNAME || 'Requester')},</p>
            <p>Form No: ${escapeHtml(formNo)}</p>
            <p>${isCompleted ? 'Your FIN-NPO form has been fully approved. The approval workflow is complete.' : dimStep ? 'DIM has approved this FIN-NPO form. The form is pending review by Job Controller.' : `Your FIN-NPO form has been ${status.toLowerCase()} at the current workflow step.`}</p>
            ${remark ? `<p>Remark: ${escapeHtml(remark)}</p>` : ''}
            <p>Please check the form for details.</p>
            <p>Best Regards,</p>`,
    });
    if (result?.status === false) {
        throw new Error(result.message || 'Cannot send FIN-NPO email');
    }
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
}

function normalizeShowData(response) {
    const data = response?.data || response || {};

    return {
        head: data.head || data.HEAD || {},
        invoices: toArray(
            data.invoices || data.invoice || data.detail || data.DETAIL,
        ),
        files: toArray(data.files || data.FILES),
        expense: data.expense || data.EXPENSE || {},
        vendor: data.vendor || data.VENDOR || {},
    };
}

function renderHeader(head = {}, expense = {}, vendor = {}) {
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

async function renderTravelers(form = {}, head = {}, expense = {}) {
    const section = $('#airSalesEmployeeSection');
    const expenseName = String(
        expense.EXPENSE_ENAME || head.EXPENSE_ENAME || head.EXPENSE_NAME || '',
    ).trim();

    if (expenseName.toUpperCase() !== 'TRAVELLING ABOARD') {
        section.addClass('hidden');
        return;
    }

    section.removeClass('hidden');
    let costCenters = [];

    try {
        const response = await getCostCenters();

        if (response?.status === false) {
            throw new Error(response.message || 'Cannot load cost center data');
        }

        costCenters = normalizeCostCenters(response).filter(
            (item) =>
                normalizeYear(item?.CYEAR2) === normalizeYear(form.CYEAR2) &&
                normalizeRunNo(item?.NRUNNO) === normalizeRunNo(form.NRUNNO),
        );
    } catch (error) {
        console.error('Cannot load cost center data:', error);
        $('#airSalesEmployeeList').html('Cannot load employee information');
        return;
    }

    const employees = await Promise.all(
        costCenters.map(async (item) => {
            const code = getEmployeeCode(item);
            let name = getEmployeeName(item);

            if (code && !name) {
                try {
                    name = getEmployeeName(await getEmployee(code));
                } catch (error) {
                    console.error(`Cannot load employee ${code}:`, error);
                }
            }

            return { code, name };
        }),
    );
    const validEmployees = employees.filter(({ code, name }) => code || name);

    if (!validEmployees.length) {
        $('#airSalesEmployeeList').html('No employee information');
        return;
    }

    $('#airSalesEmployeeList').html(
        `<div class="grid grid-cols-[minmax(8rem,0.35fr)_1fr] gap-3 border-b border-violet-100 px-3 pb-2 font-bold">
            <span>Employee Code</span>
            <span>Employee Name</span>
        </div>
        <ul class="mt-2 space-y-2">${validEmployees
            .map(({ code, name }) => {
                return `<li class="grid grid-cols-[minmax(8rem,0.35fr)_1fr] gap-3 rounded border border-violet-100 px-3 py-2">
                    <span class="font-semibold">${escapeHtml(code || '-')}</span>
                    <span>${escapeHtml(name || '-')}</span>
                </li>`;
            })
            .join('')}</ul>`,
    );
}

function normalizeCostCenters(response) {
    const data = response?.data ?? response;

    if (Array.isArray(data)) return data;

    return toArray(
        data?.costCenters ||
            data?.costcenters ||
            data?.costcenter ||
            data?.COST_CENTERS ||
            data?.COSTCENTER ||
            data?.COST_CENTER,
    );
}

function normalizeYear(value) {
    const year = String(value ?? '').trim();

    return year ? year.slice(-2).padStart(2, '0') : '';
}

function normalizeRunNo(value) {
    const runNo = Number(value);

    return Number.isFinite(runNo) ? runNo : null;
}

function getEmployeeCode(item) {
    if (typeof item === 'string' || typeof item === 'number') {
        return String(item).trim();
    }

    return String(
        item?.SEMPNO ||
            item?.REQNO ||
            item?.EMPNO ||
            item?.EMP_CODE ||
            item?.EMPLOYEE_CODE ||
            item?.AIR_SALES_BY ||
            '',
    ).trim();
}

function getEmployeeName(item) {
    if (!item || typeof item !== 'object') return '';

    return String(
        item.SNAME ||
            item.STNAME ||
            item.EMPNAME ||
            item.EMP_NAME ||
            item.EMPLOYEE_NAME ||
            item.FULLNAME ||
            item.NAME ||
            '',
    ).trim();
}

async function renderInvoiceTable(invoices = [], canEditWht = false) {
    const totals = invoices.reduce(
        (sum, invoice) => {
            const netPrice = Number(invoice.NET_PRICE || 0);
            const totalAmount = Number(invoice.TOTAL_AMT || 0);
            sum.netPrice += netPrice;
            sum.vat += totalAmount - netPrice;
            sum.totalAmount += totalAmount;
            return sum;
        },
        { netPrice: 0, vat: 0, totalAmount: 0 },
    );
    const rows = invoices.length
        ? invoices
              .map(
                  (invoice, index) => `<tr>
                    <td>${escapeHtml(index + 1)}</td>
                    <td>${escapeHtml(formatDate(invoice.INVOICE_DATE))}</td>
                    <td>${escapeHtml(invoice.INVOICE_NO || '')}</td>
                    <td>${escapeHtml(formatNumber(invoice.NET_PRICE))}</td>
                    <td>${escapeHtml(formatNumber(Number(invoice.TOTAL_AMT) - Number(invoice.NET_PRICE)))}</td>
                    <td>${escapeHtml(formatNumber(invoice.TOTAL_AMT))}</td>
                    <td>
                        <input type="text" inputmode="numeric" pattern="[0-9]{3}([0-9]{4})?" maxlength="7" required
                            class="wht-input input input-sm input-bordered w-full"
                            data-invoice-id="${escapeHtml(invoice.ID || invoice.LINE_ID || index + 1)}"
                            value="${escapeHtml(formatTaxCode(invoice.WHT))}"
                            ${canEditWht ? '' : 'readonly'}
                            placeholder="3 or 7 digits" />
                    </td>
                    <td>${escapeHtml(invoice.REFERENCE ?? invoice.REMARK ?? '')}</td>
                </tr>`,
              )
              .join('')
        : '<tr><td colspan="8" class="text-center">No invoice information</td></tr>';

    $('#stampTable').html(`<thead><tr>
        <th>No.</th><th>Invoice Date</th><th>Invoice No.</th>
        <th>Net Price</th><th>VAT</th><th>Total Amount</th><th>Tax code</th><th>Reference</th>
    </tr></thead><tbody>${rows}</tbody>
    <tfoot><tr>
        <th colspan="3" scope="row">Total</th>
        <td>${escapeHtml(formatNumber(totals.netPrice))}</td>
        <td>${escapeHtml(formatNumber(totals.vat))}</td>
        <td>${escapeHtml(formatNumber(totals.totalAmount))}</td>
        <td colspan="2"></td>
    </tr></tfoot>`);
}

function collectInvoiceWht() {
    return $('.wht-input')
        .map((_, input) => {
            const value = String($(input).val() || '').trim();

            return {
                ID: $(input).data('invoice-id'),
                LINE_ID: $(input).data('invoice-id'),
                WHT: value === '' ? null : value,
            };
        })
        .get();
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

async function renderWorkflowAction(form, modeResponse) {
    try {
        const mode = normalizeWorkflowMode(modeResponse);
        cextData = getCextDataValue(await getExtData(form));
        const flow = await showflow(form);
        workflowSteps = Array.isArray(flow?.data) ? flow.data : [];
        const action =
            mode === '2'
                ? webflowSubmit({
                      flow: true,
                      flowhtml: flow?.html || flow?.data?.html || '',
                      approve: true,
                      reject: true,
                      return: true,
                  })
                : webflowSubmit({
                      flow: true,
                      flowhtml: flow?.html || flow?.data?.html || '',
                      actionsForm: false,
                  });

        $('#sentApprove').html(action);
        $('#sentApprove button')
            .filter((_, button) => $(button).text().trim() === 'Back')
            .removeAttr('onclick')
            .addClass('fin-npo-back');
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

function formatTaxCode(value) {
    return String(value ?? '').trim();
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
