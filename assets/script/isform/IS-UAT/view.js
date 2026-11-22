import '@flaticon/flaticon-uicons/css/all/all.css';
import { displayEmpInfo } from '@amec/webasset/indexDB';
import { showMessage } from '@amec/webasset/utils';
import {
    doaction,
    getFormno,
    getMode,
    showflow,
} from '@amec/webasset/api/webform';
import { redirectWebflow } from '@amec/webasset/form';
import { formatOrg, getFormIsUat, saveTestResultIsUat } from './data.js';

const ENV_LABELS = {
    UAT: 'UAT / Staging',
    DEV: 'Development',
    PROD_PILOT: 'Production (Pilot)',
};

let canEditTest = false;

function escapeHtml(str) {
    return $('<div>')
        .text(str ?? '')
        .html();
}

function formatTextWithBr(str) {
    return escapeHtml(str ?? '').replace(/\n/g, '<br>');
}

$(document).ready(async function () {
    await initViewForm();
});

async function initViewForm() {
    const nfrmno = $('#NFRMNO').val();
    const vorgno = $('#VORGNO').val();
    const cyear = $('#CYEAR').val();
    const cyear2 = $('#CYEAR2').val();
    const nrunno = $('#NRUNNO').val();
    const empno = $('#EMPNO').val();

    // Load form number & approval flow in parallel (non-blocking if API unavailable)
    try {
        const formNoRes = await getFormno(nfrmno, vorgno, cyear, cyear2, nrunno);
        const formNoStr =
            typeof formNoRes === 'string'
                ? formNoRes
                : (formNoRes?.formno ?? formNoRes?.FORMNO ?? '');
        if (formNoStr) {
            $('#view-formno').text(formNoStr);
        }
    } catch (e) {
        $('#view-formno').text(`IS-UAT${cyear2}-${nrunno}`);
    }

    try {
        const flow = await showflow(nfrmno, vorgno, cyear, cyear2, nrunno);
        if (flow?.html) {
            $('.showflow').html(flow.html);
        }
    } catch (e) {
        console.warn('Unable to load approval flow:', e);
    }

    let flowMode = null;
    try {
        flowMode = await getMode(nfrmno, vorgno, cyear, cyear2, nrunno, empno);
    } catch (e) {
        console.warn('Unable to check webflow mode:', e);
    }

    let data = [];
    try {
        data = await getFormIsUat({
            NFRMNO: nfrmno,
            VORGNO: vorgno,
            CYEAR: cyear,
            CYEAR2: cyear2,
            NRUNNO: nrunno,
            EMPNO: empno,
        });
    } catch (e) {
        console.error('Failed to load UAT data:', e);
        $('#table-uat-execution tbody').html(
            '<tr><td colspan="8" class="text-center py-6 text-error">ไม่สามารถโหลดข้อมูล UAT ได้</td></tr>',
        );
        return;
    }

    if (!data || !data[0]) {
        $('#table-uat-execution tbody').html(
            '<tr><td colspan="8" class="text-center py-6 text-gray-400">ไม่พบข้อมูลรายการทดสอบ</td></tr>',
        );
        return;
    }

    const row = data[0];
    const status = row.STATUS !== undefined ? String(row.STATUS).trim() : null;
    const cst =
        row.form?.CST !== undefined
            ? String(row.form.CST).trim()
            : row.CST !== undefined
              ? String(row.CST).trim()
              : null;
    const isDraft =
        status === '0' ||
        String(status).toLowerCase() === 'draft' ||
        cst === '0';
    const inputBy = String(
        row.INPUTBY ?? row.INPUT_BY ?? row.form?.VINPUTER ?? row.VINPUTER ?? '',
    ).trim();
    const empNoStr = String(empno ?? '').trim();

    if (
        isDraft &&
        empNoStr !== '' &&
        empNoStr === inputBy &&
        window.location.pathname.includes('/main')
    ) {
        const url = new URL(window.location.href);
        if (url.searchParams.get('mode') !== '2') {
            url.searchParams.set('mode', '2');
            window.location.replace(url.href);
            return;
        }
    }

    renderStatusBadge(cst ?? status);

    // Map general info
    const res = {
        ...row,
        REF_FORMNO: row.REF_FORMNO || '-',
        ENVIRONMENT_TXT: ENV_LABELS[row.ENVIRONMENT] || row.ENVIRONMENT || '-',
        UAT_PERIOD:
            row.UAT_START || row.UAT_END
                ? `${row.UAT_START || '-'} ถึง ${row.UAT_END || '-'}`
                : '-',
        PREREQUISITE: row.PREREQUISITE || '-',
    };

    $('#form-data')
        .find('.map-data')
        .each(function () {
            const key = $(this).data('key');
            const group = $(this).data('group');
            const value =
                group == '' ? res[key] : res[group] ? res[group][key] : '';
            $(this).html(formatTextWithBr(value || '-'));
        });

    // Test URL
    if (row.TEST_URL) {
        $('#view-test-url').html(
            `<a href="${escapeHtml(row.TEST_URL)}" target="_blank" rel="noopener noreferrer" class="link link-primary break-all">${escapeHtml(row.TEST_URL)}</a>`,
        );
    } else {
        $('#view-test-url').text('-');
    }

    // Participants
    await renderEmployeeText('#view-tester', row.TESTER);
    await renderEmployeeText('#view-inputby', inputBy);

    // Attachments
    const files = row.files || row.attachments || [];
    if (Array.isArray(files) && files.length > 0) {
        const ul = $('#view-attachments').empty();
        files.forEach((f) => {
            const name = f.FILE_NAME || f.FILENAME || f.name || 'Attachment';
            const url = f.FILE_URL || f.URL || f.url || '#';
            ul.append(
                `<li><a href="${escapeHtml(url)}" target="_blank" class="link link-primary">${escapeHtml(name)}</a></li>`,
            );
        });
    }

    // Determine if current user can fill test results / approve
    const isApprover =
        flowMode == 2 ||
        flowMode?.mode == 2 ||
        String(flowMode) === '2';
    const isTester =
        empNoStr !== '' &&
        String(row.TESTER ?? '').trim() === empNoStr &&
        cst !== '2' &&
        cst !== '3';

    canEditTest = isApprover || isTester;

    if (canEditTest) {
        $('#btn-save-test').removeClass('hidden');
    }
    if (isApprover) {
        $('#approval-section').removeClass('hidden');
    }

    // Render Test Cases
    const testcases = row.testcases || row.TESTCASES || row.items || [];
    renderTestCasesTable(testcases, canEditTest);
    updateStats();
}

async function renderEmployeeText(selector, empno) {
    if (!empno) {
        $(selector).text('-');
        return;
    }
    try {
        const user = await displayEmpInfo(empno);
        if (user) {
            const org = formatOrg(user);
            $(selector).html(
                `<div class="font-semibold">${escapeHtml(user.SNAME)} (${escapeHtml(user.SEMPNO)})</div>` +
                    (org
                        ? `<div class="text-xs text-gray-500">${escapeHtml(org)}</div>`
                        : ''),
            );
            return;
        }
    } catch (e) {
        // Fallback to raw empno
    }
    $(selector).text(empno);
}

function renderStatusBadge(status) {
    const map = {
        '0': { text: 'Draft', cls: 'badge-ghost' },
        '1': { text: 'In Progress / Waiting UAT', cls: 'badge-warning' },
        '2': { text: 'Approved / UAT Passed', cls: 'badge-success text-white' },
        '3': { text: 'Rejected / Returned', cls: 'badge-error text-white' },
    };
    const info = map[String(status)] || {
        text: 'In Progress',
        cls: 'badge-info text-white',
    };
    $('#uat-status-badge').html(
        `<span class="badge ${info.cls} badge-lg font-semibold">${info.text}</span>`,
    );
}

function renderTestCasesTable(testcases, editable) {
    const tbody = $('#table-uat-execution tbody').empty();
    if (!Array.isArray(testcases) || testcases.length === 0) {
        tbody.html(
            '<tr><td colspan="8" class="text-center py-6 text-gray-400">ไม่มีรายการ Test Case</td></tr>',
        );
        return;
    }

    testcases.forEach((tc, idx) => {
        const tcId = tc.TC_ID ?? tc.ID ?? '';
        const tcNo = tc.TC_NO || `TC-${String(idx + 1).padStart(2, '0')}`;
        const moduleName = tc.MODULE || '-';
        const scenario = tc.SCENARIO || tc.TEST_CASE || '-';
        const steps = tc.TEST_STEPS || '';
        const expected = tc.EXPECTED_RESULT || '-';
        const actual = tc.ACTUAL_RESULT || '';
        const result = String(tc.RESULT || 'PENDING').toUpperCase();
        const remark = tc.REMARK || '';
        const evidenceUrl = tc.EVIDENCE_URL || tc.EVIDENCE || '';
        const evidenceName = tc.EVIDENCE_NAME || 'ดูไฟล์หลักฐาน';

        const statusBadgeMap = {
            PASS: '<span class="badge badge-success text-white">Pass</span>',
            FAIL: '<span class="badge badge-error text-white">Fail</span>',
            PENDING: '<span class="badge badge-warning">Pending</span>',
        };

        const actualCell = editable
            ? `<textarea class="textarea textarea-bordered textarea-sm w-full tc-actual" rows="2" placeholder="ระบุผลลัพธ์ที่ได้จริง">${escapeHtml(actual)}</textarea>`
            : `<div class="text-sm">${formatTextWithBr(actual || '-')}</div>`;

        const statusCell = editable
            ? `<select class="select select-bordered select-sm w-full tc-result">
                    <option value="PENDING" ${result === 'PENDING' ? 'selected' : ''}>Pending</option>
                    <option value="PASS" ${result === 'PASS' ? 'selected' : ''}>Pass</option>
                    <option value="FAIL" ${result === 'FAIL' ? 'selected' : ''}>Fail</option>
               </select>`
            : `<div class="tc-result-readonly" data-result="${escapeHtml(result)}">${statusBadgeMap[result] || statusBadgeMap.PENDING}</div>`;

        const existingEvidence = evidenceUrl
            ? `<div class="mb-1"><a href="${escapeHtml(evidenceUrl)}" target="_blank" class="link link-primary text-xs">${escapeHtml(evidenceName)}</a></div>`
            : '';

        const evidenceCell = editable
            ? `${existingEvidence}<input type="file" class="file-input file-input-xs w-full tc-evidence" />`
            : existingEvidence || '<span class="text-xs text-gray-400">-</span>';

        const remarkCell = editable
            ? `<textarea class="textarea textarea-bordered textarea-sm w-full tc-remark" rows="2" placeholder="หมายเหตุ / ปัญหาที่พบ">${escapeHtml(remark)}</textarea>`
            : `<div class="text-sm">${formatTextWithBr(remark || '-')}</div>`;

        const row = $(`
            <tr data-tc-id="${escapeHtml(tcId)}" data-tc-no="${escapeHtml(tcNo)}">
                <td class="text-center font-semibold text-primary">${escapeHtml(tcNo)}</td>
                <td class="text-sm">${escapeHtml(moduleName)}</td>
                <td class="text-sm">
                    <div class="font-semibold mb-1">${formatTextWithBr(scenario)}</div>
                    ${steps ? `<div class="text-xs text-gray-500">${formatTextWithBr(steps)}</div>` : ''}
                </td>
                <td class="text-sm">${formatTextWithBr(expected)}</td>
                <td>${actualCell}</td>
                <td class="text-center">${statusCell}</td>
                <td>${evidenceCell}</td>
                <td>${remarkCell}</td>
            </tr>
        `);

        tbody.append(row);
    });
}

function updateStats() {
    const rows = $('#table-uat-execution tbody tr[data-tc-no]');
    const total = rows.length;
    let pass = 0;
    let fail = 0;
    let pending = 0;

    rows.each(function () {
        const val = canEditTest
            ? $(this).find('.tc-result').val()
            : $(this).find('.tc-result-readonly').data('result');
        if (val === 'PASS') pass++;
        else if (val === 'FAIL') fail++;
        else pending++;
    });

    const rate = total > 0 ? Math.round((pass / total) * 100) : 0;
    $('#stat-total').text(total);
    $('#stat-pass').text(pass);
    $('#stat-fail').text(fail);
    $('#stat-pending').text(pending);
    $('#stat-rate').text(`${rate}%`);
    $('#stat-progress').val(rate);
}

$(document).on('change', '.tc-result', function () {
    updateStats();
});

function buildTestResultFormData() {
    const fd = new FormData();
    fd.append('NFRMNO', $('#NFRMNO').val());
    fd.append('VORGNO', $('#VORGNO').val());
    fd.append('CYEAR', $('#CYEAR').val());
    fd.append('CYEAR2', $('#CYEAR2').val());
    fd.append('NRUNNO', $('#NRUNNO').val());
    fd.append('EMPNO', $('#EMPNO').val());

    $('#table-uat-execution tbody tr[data-tc-no]').each(function (i) {
        const tcId = $(this).attr('data-tc-id') || '';
        const tcNo = $(this).attr('data-tc-no') || '';
        if (tcId) fd.append(`testcases[${i}][TC_ID]`, tcId);
        fd.append(`testcases[${i}][TC_NO]`, tcNo);
        fd.append(
            `testcases[${i}][ACTUAL_RESULT]`,
            $(this).find('.tc-actual').val() ?? '',
        );
        fd.append(
            `testcases[${i}][RESULT]`,
            $(this).find('.tc-result').val() ?? 'PENDING',
        );
        fd.append(
            `testcases[${i}][REMARK]`,
            $(this).find('.tc-remark').val() ?? '',
        );

        const fileInput = $(this).find('.tc-evidence')[0];
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
            fd.append(`evidence[${i}]`, fileInput.files[0]);
        }
    });

    return fd;
}

// Save test progress without finalizing approval
$(document).on('click', '#btn-save-test', async function () {
    const btn = $(this);
    const originalHtml = btn.html();
    btn.prop('disabled', true).html(
        '<span class="loading loading-spinner loading-xs"></span> กำลังบันทึก...',
    );

    try {
        const fd = buildTestResultFormData();
        const res = await saveTestResultIsUat(fd);
        if (res && res.status === false) {
            await showMessage(res.message || 'ไม่สามารถบันทึกผลการทดสอบได้');
            return;
        }
        await showMessage('บันทึกผลการทดสอบเรียบร้อยแล้ว', 'success');
    } catch (err) {
        console.error('Save test result error:', err);
        await showMessage('เกิดข้อผิดพลาดในการบันทึกผลการทดสอบ');
    } finally {
        btn.prop('disabled', false).html(originalHtml);
    }
});

// Webflow Approve / Reject
$(document).on('click', '.btn-submit', async function () {
    const action = $(this).data('action');
    const remark = $('#uat-remark').val().trim();

    if (action === 'approve' && canEditTest) {
        let hasPending = false;
        let hasFail = false;
        $('#table-uat-execution tbody tr[data-tc-no]').each(function () {
            const val = $(this).find('.tc-result').val();
            if (val === 'PENDING') hasPending = true;
            if (val === 'FAIL') hasFail = true;
        });

        if (hasPending) {
            await showMessage(
                'ยังมีรายการทดสอบที่สถานะ Pending กรุณาทดสอบให้ครบทุกรายการก่อนอนุมัติ',
            );
            return;
        }
        if (hasFail) {
            await showMessage(
                'มีรายการทดสอบที่ไม่ผ่าน (Fail) กรุณาใช้ปุ่ม Reject เพื่อส่งกลับแก้ไข',
            );
            return;
        }
    }

    if (action === 'reject' && !remark) {
        $('#uat-remark').addClass('border-red-500').focus();
        await showMessage(
            'กรุณาระบุเหตุผลหรือรายละเอียดปัญหาที่พบก่อนส่งกลับแก้ไข',
        );
        return;
    }

    const btn = $(this);
    const originalHtml = btn.html();
    btn.prop('disabled', true).html(
        '<span class="loading loading-spinner loading-xs"></span> กำลังดำเนินการ...',
    );

    try {
        if (canEditTest) {
            const fd = buildTestResultFormData();
            await saveTestResultIsUat(fd);
        }

        const confirm = await doaction({
            NFRMNO: $('#NFRMNO').val(),
            VORGNO: $('#VORGNO').val(),
            CYEAR: $('#CYEAR').val(),
            CYEAR2: $('#CYEAR2').val(),
            NRUNNO: $('#NRUNNO').val(),
            ACTION: action,
            EMPNO: $('#EMPNO').val(),
            REMARK: remark,
        });

        if (confirm && confirm.status) {
            redirectWebflow();
        } else {
            await showMessage(
                confirm?.message || 'ไม่สามารถดำเนินการอนุมัติได้',
            );
        }
    } catch (err) {
        console.error('Approval action error:', err);
        await showMessage('เกิดข้อผิดพลาดในการดำเนินการ กรุณาลองใหม่อีกครั้ง');
    } finally {
        btn.prop('disabled', false).html(originalHtml);
    }
});
