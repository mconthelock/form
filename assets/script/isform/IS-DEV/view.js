import '@flaticon/flaticon-uicons/css/all/all.css';
import dayjs from 'dayjs';
import { showMessage } from '@amec/webasset/utils';
import { doaction } from '@amec/webasset/api/webform';
import { redirectWebflow } from '@amec/webasset/form';
import {
    formHeader,
    formHeaderInfo,
    formFlowApproval,
    formApprovalBtn,
} from '../../service';
import {
    getFormIsDev,
    renderBenefitTable,
    totalBenefit,
    totalLabor,
    totalInvestment,
} from './data';
import { initLaborTable } from './labor';
import { initInvestmentTable } from './investment';

const REQUEST_TYPE_LABELS = {
    1: 'New Program/Additional Request',
    2: 'Modify Program',
    3: 'Fixed Error Program',
    4: 'Data Change',
    5: 'Search Data',
};

$(document).ready(async function () {
    await initForm();
});

function escapeHtml(value) {
    return $('<div>')
        .text(value ?? '')
        .html();
}

async function handleFormAction({ action, remark }) {
    try {
        const res = await doaction({
            NFRMNO: $('#NFRMNO').val(),
            VORGNO: $('#VORGNO').val(),
            CYEAR: $('#CYEAR').val(),
            CYEAR2: $('#CYEAR2').val(),
            NRUNNO: $('#NRUNNO').val(),
            ACTION: action,
            EMPNO: $('#EMPNO').val(),
            REMARK: remark,
        });

        if (res && res.status) {
            redirectWebflow();
        } else {
            await showMessage(res?.message || 'ไม่สามารถดำเนินการอนุมัติได้');
        }
    } catch (err) {
        console.error('Approval action error:', err);
        await showMessage('เกิดข้อผิดพลาดในการดำเนินการ กรุณาลองใหม่อีกครั้ง');
    }
}

async function initForm() {
    const data = await getFormIsDev({
        NFRMNO: $('#NFRMNO').val(),
        VORGNO: $('#VORGNO').val(),
        CYEAR: $('#CYEAR').val(),
        CYEAR2: $('#CYEAR2').val(),
        NRUNNO: $('#NRUNNO').val(),
        EMPNO: $('#EMPNO').val(),
    });

    console.log(data);

    if (!data || !data[0]) return;

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
    const empNo = String($('#EMPNO').val() ?? '').trim();

    if (
        isDraft &&
        empNo !== '' &&
        empNo === inputBy &&
        window.location.pathname.includes('/main')
    ) {
        const url = new URL(window.location.href);
        if (url.searchParams.get('mode') !== '2') {
            url.searchParams.set('mode', '2');
            window.location.replace(url.href);
            return;
        }
    }

    // Header & Requester Info (View Only)
    await formHeader(
        row.form?.formmst
            ? row.form
            : {
                  CST: row.form?.CST ?? row.STATUS ?? '1',
                  formmst: {
                      VANAME: 'IS-DEV',
                      VNAME: 'Computer Program Requisition Form',
                      VDESC: 'แบบฟอร์มขอพัฒนา / ปรับปรุงโปรแกรมคอมพิวเตอร์',
                  },
              },
    );

    const reqBy =
        row.REQBY || row.REQ_PIC || row.form?.VREQNO || $('#EMPNO').val();
    const inputter =
        row.INPUTBY || row.INPUT_BY || row.form?.VINPUTER || $('#EMPNO').val();
    await formHeaderInfo({
        ...(row.form || {}),
        VREQNO: reqBy,
        VINPUTER: inputter,
    });

    await formApprovalBtn(row.form || null, {
        approve: true,
        reject: true,
        return: true,
        remark: true,
        print: true,
        empno: $('#EMPNO').val(),
        onApprove: handleFormAction,
        onReject: handleFormAction,
        onReturn: handleFormAction,
    });

    if (Array.isArray(row.form?.flow) && row.form.flow.length > 0) {
        $('#form-flow-wrap').removeClass('hidden');
        await formFlowApproval(row.form);
    }

    // Toggle ROI sections based on Request Type
    const jobType =
        row.JOBTYPE ?? row.REQUEST_TYPE ?? row.category?.CATEGORY_ID;
    if (jobType !== undefined && jobType !== null && String(jobType) >= '3') {
        $('.form-roi').addClass('hidden');
    } else {
        $('.form-roi').removeClass('hidden');
    }

    // Prepare mapped view fields
    const roiReturn =
        row.ROI_RETURN !== undefined &&
        row.ROI_RETURN !== null &&
        row.ROI_RETURN !== ''
            ? String(row.ROI_RETURN)
            : '1';
    $('#req-roi-years').val(roiReturn);

    const specConfirmPlanTxt = row.SPEC_CONFIRM_PLAN
        ? dayjs(row.SPEC_CONFIRM_PLAN).isValid()
            ? dayjs(row.SPEC_CONFIRM_PLAN).format('YYYY-MMM')
            : String(row.SPEC_CONFIRM_PLAN)
        : '-';

    const categoryName =
        row.category?.CATEGORY_NAME ??
        REQUEST_TYPE_LABELS[String(jobType)] ??
        '';

    const res = {
        ...row,
        category: {
            ...(row.category || {}),
            CATEGORY_NAME: categoryName,
        },
        OBJECTIVE_TXT:
            String(row.OBJECTIVE) === '8'
                ? `${row.objective?.OBJ_NAME ?? ''}: ${row.OBJECTIVE_OTHER ?? ''}`
                : (row.objective?.OBJ_NAME ?? ''),
        ROI_RETURN: roiReturn,
        SPEC_CONFIRM_PLAN_TXT: specConfirmPlanTxt,
    };

    const element = $('#form-data').find('.map-data');
    for (const el of element) {
        const key = $(el).data('key');
        const group = $(el).data('group');
        const value =
            group == '' ? res[key] : res[group] ? res[group][key] : undefined;
        const escaped = escapeHtml(value ?? '');
        $(el).html(escaped.replace(/\n/g, '<br>'));
    }

    // Attachments
    renderAttachments(row.files || row.attachments || row.file || []);

    // Benefit Table
    await renderBenefitTable({
        readonly: true,
        values: row.benefit || row.benefits || [],
    });

    // Labor Table
    await initLaborTable({
        readonly: true,
        data: row.manhours || row.manhour || row.labor || [],
    });

    // Investment Table
    await initInvestmentTable({
        readonly: true,
        data: row.invest || row.investments || row.investment || [],
    });

    await totalLabor();
    await totalInvestment();
    await totalBenefit();
}

function renderAttachments(files) {
    const $list = $('#attachment-list ul');
    $list.empty();

    if (!Array.isArray(files) || files.length === 0) {
        $list.append('<li class="text-sm text-gray-400">ไม่มีเอกสารแนบ</li>');
        return;
    }

    files.forEach((f) => {
        const name =
            f.FILE_ONAME ||
            f.ORIGINAL_NAME ||
            f.FILE_NAME ||
            f.FILENAME ||
            f.name ||
            'Attachment';
        const url = f.FILE_URL || f.URL || f.url || f.path || '';
        const safeName = escapeHtml(name);
        if (url) {
            $list.append(
                `<li class="flex items-center gap-2 text-sm">
                    <i class="fi fi-rr-clip text-primary"></i>
                    <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="link link-primary hover:underline">${safeName}</a>
                </li>`,
            );
        } else {
            $list.append(
                `<li class="flex items-center gap-2 text-sm text-gray-700">
                    <i class="fi fi-rr-clip text-gray-500"></i>
                    <span>${safeName}</span>
                </li>`,
            );
        }
    });
}
