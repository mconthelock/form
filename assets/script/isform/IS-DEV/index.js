import '@flaticon/flaticon-uicons/css/all/all.css';
import '@amec/webasset/css/select2.min.css';
import dayjs from 'dayjs';
import select2 from 'select2';
import { displayEmpInfo, fillImages } from '@amec/webasset/indexDB';
import { setSelect2 } from '@amec/webasset/select2';
import { setDatePicker } from '@amec/webasset/flatpickr';
import { showMessage, intVal, showDigits } from '@amec/webasset/utils';
import { formHeader, formHeaderInfo, formApprovalBtn } from '../../service';
import {
    getObjectiveMst,
    getLaborcost,
    renderBenefitTable,
    fillBenefitTable,
    collectBenefitData,
    totalBenefit,
    totalLabor,
    totalInvestment,
    getFormIsDev,
    createFormIsDev,
    updateFormIsDev,
} from './data.js';
import {
    initLaborTable,
    addLaborRow,
    removeLaborRow,
    clearLaborTable,
    collectLaborData,
} from './labor.js';
import {
    initInvestmentTable,
    addInvestmentRow,
    removeInvestmentRow,
    clearInvestmentTable,
    collectInvestmentData,
    loadDevices,
} from './investment.js';
select2();

$(document).ready(async function () {
    const mode = $('#MODE').val();
    const nrunno = intVal($('#NRUNNO').val());

    await formHeader({
        CST: '0',
        formmst: {
            VANAME: 'IS-DEV',
            VNAME: 'Computer Program Requisition Form',
            VDESC: 'แบบฟอร์มขอพัฒนา / ปรับปรุงโปรแกรมคอมพิวเตอร์',
        },
    });
    await formHeaderInfo(
        {
            VREQNO: $('#EMPNO').val(),
            VINPUTER: $('#EMPNO').val(),
        },
        {
            editableReq: true,
        },
    );
    const objectiveMst = await getObjectiveMst();
    const objectiveSelect = $('#req-objective');
    objectiveMst.forEach((obj) => {
        objectiveSelect.append(
            `<option value="${obj.OBJ_ID}">${obj.OBJ_NAME}</option>`,
        );
    });

    await setSelect2();
    await setDatePicker({
        altInput: true,
        mode: 'month',
        altFormat: 'Y-M',
        dateFormat: 'Y-m-01',
        minDate: dayjs().format('YYYY-MM'),
    });
    $('.flatpickr-input').removeClass('input');

    await formApprovalBtn(null, {
        draft: true,
        submit: true,
        print: false,
        onDraft: handleSaveDraft,
        onSubmit: handleSubmitForm,
    });

    await renderBenefitTable({ readonly: false });

    if (mode == '2' || nrunno > 0) {
        await initEditForm();
    } else {
        await initLaborTable({ readonly: false, data: [null] });
        await initInvestmentTable({ readonly: false, data: [null] });
    }
});

//General input number formatting
$(document).on('keyup', '.input-number', function (e) {
    let value = $(this).val();
    value = value.replace(/[^\d.-]/g, '');
    value = value.replace(/(?!^)-/g, '');
    const parts = value.split('.');
    if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('');
    $(this).val(value);
});

$(document).on('click', '.request-type', async function (e) {
    const val = $(this).val();
    if (val >= '3') {
        $('.form-roi').addClass('hidden');
        $('.form-roi input').val('');
        $('.form-roi select').val('');
    } else {
        $('.form-roi').removeClass('hidden');
    }
});

$(document).on('change', '#req-objective', function () {
    if ($(this).val() == '8') {
        $('#req-objective-other').prop('readonly', false);
    } else {
        $('#req-objective-other').prop('readonly', true).val('');
    }
});

$(document).on('keyup', '.text-comment', async function () {
    $(this).removeClass('border-red-500');
    const elErr = $(this).closest('.fieldset').find('.text-comment-err');
    const elCnt = $(this)
        .closest('.fieldset')
        .find('.text-count .text-count-no');
    elErr.html('');
    elCnt.removeClass('text-red-500');

    const txt = $(this)
        .val()
        .replace(/(\r\n|\n|\r)/gm, '');
    let cnt = txt.length;
    if (cnt < 250 || cnt > 1000) {
        elCnt.addClass('text-red-500');
    }
    elCnt.html(cnt);
});

$(document).on('click', '#add-file', async function (e) {
    e.preventDefault();
    const wrap = $('.file-input-wrap');
    const newInput = $(
        '<input type="file" class="file-input file-input-sm w-full attachments" name="attachments[]" />',
    );
    wrap.append(newInput);
});

//Benefit Table
$(document).on('change', '.input-benefit', async function (e) {
    const row = $(this).closest('tr');
    const presentCost = intVal(row.find('.present-cost').val()) || 0;
    const futureCost = intVal(row.find('.future-cost').val()) || 0;
    const totalCost = presentCost - futureCost;
    row.find('.subtotal-cost').val(showDigits(totalCost, 2));
    await totalBenefit();
});

// Labor Table
$(document).on('click', '#add-row-labor', async function (e) {
    e.preventDefault();
    await addLaborRow();
});

$(document).on('click', '#not-improve-manpower', async function (e) {
    const isChecked = $(this).is(':checked');
    if (isChecked) {
        clearLaborTable();
        $('#add-row-labor').prop('disabled', true);
    } else {
        $('#add-row-labor').prop('disabled', false);
        await addLaborRow();
    }
    await totalLabor();
    await totalBenefit();
});

$(document).on('change', '.select-position', async function (e) {
    const row = $(this).closest('tr');
    const positionCode = $(this).val();
    const cost = await getLaborcost();
    const costYear = cost.find(
        (c) => c.FYEAR == dayjs().format('YYYY') && positionCode == c.POSITION,
    );

    if (!costYear) {
        row.find('.labor-cost').val(0);
        return;
    }

    row.find('.labor-cost').val(costYear.COST);
    await totalLabor();
    await totalBenefit();
});

$(document).on('change', '.input-labor', async function (e) {
    const row = $(this).closest('tr');
    const laborCost = intVal(row.find('.labor-cost').val()) || 0;
    const presentCost = intVal(row.find('.labor-present').val()) || 0;
    const futureCost = intVal(row.find('.labor-future').val()) || 0;
    const totalTime = presentCost - futureCost;
    const totalLaborCost = totalTime * laborCost;
    row.find('.labor-time').val(totalTime);
    row.find('.labor-total').val(showDigits(totalLaborCost));
    await totalLabor();
    await totalBenefit();
});

$(document).on('click', '.remove-row-labor', async function (e) {
    e.preventDefault();
    removeLaborRow($(this).closest('tr'));
    await totalLabor();
    await totalBenefit();
});

$(document).on('change', '#req-roi-years', async function (e) {
    await totalBenefit();
});

// Investment Table
$(document).on('click', '#add-row-investment', async function (e) {
    e.preventDefault();
    await addInvestmentRow();
});

$(document).on('click', '#not-improve-investment', async function (e) {
    const isChecked = $(this).is(':checked');
    if (isChecked) {
        clearInvestmentTable();
        $('#add-row-investment').prop('disabled', true);
    } else {
        $('#add-row-investment').prop('disabled', false);
        await addInvestmentRow();
    }
    await totalInvestment();
    await totalBenefit();
});

$(document).on('click change', '.select-device', async function (e) {
    const row = $(this).closest('tr');
    const deviceCode = $(this).val();
    const deviceMst = await loadDevices();
    const device = deviceMst.find((d) => d.DNO == deviceCode);
    if (!device) {
        return;
    }

    row.find('.device-cost').val(showDigits(device.STANDARD_COST));
    row.find('.device-total').val(
        showDigits(
            device.STANDARD_COST * (intVal(row.find('.device-qty').val()) || 0),
        ),
    );
    await totalInvestment();
    await totalBenefit();
});

$(document).on('change', '.device-qty', async function (e) {
    const row = $(this).closest('tr');
    const qty = intVal($(this).val()) || 0;
    const cost = intVal(row.find('.device-cost').val()) || 0;
    row.find('.device-total').val(showDigits(qty * cost));
    await totalInvestment();
    await totalBenefit();
});

$(document).on('click', '.remove-row-investment', async function (e) {
    e.preventDefault();
    removeInvestmentRow($(this).closest('tr'));
    await totalInvestment();
    await totalBenefit();
});

async function initEditForm() {
    const data = await getFormIsDev({
        NFRMNO: $('#NFRMNO').val(),
        VORGNO: $('#VORGNO').val(),
        CYEAR: $('#CYEAR').val(),
        CYEAR2: $('#CYEAR2').val(),
        NRUNNO: $('#NRUNNO').val(),
        EMPNO: $('#EMPNO').val(),
    });

    if (!data || !data[0]) {
        await initLaborTable({ readonly: false, data: [null] });
        await initInvestmentTable({ readonly: false, data: [null] });
        return;
    }

    const res = data[0];

    // Requester & Input By Info
    if (res.form?.formmst) {
        await formHeader(res.form);
    }
    const reqBy =
        res.REQBY || res.REQ_PIC || res.form?.VREQNO || $('#EMPNO').val();
    const inputBy =
        res.INPUTBY || res.INPUT_BY || res.form?.VINPUTER || $('#EMPNO').val();
    await formHeaderInfo(
        {
            ...(res.form || {}),
            VREQNO: reqBy,
            VINPUTER: inputBy,
        },
        {
            editableReq: true,
        },
    );

    if (res.CATEGORY !== undefined) {
        $('[data-map="CATEGORY"]').val(res.CATEGORY);
    }
    if (res.PLANYEAR !== undefined) {
        $('[data-map="PLANYEAR"]').val(res.PLANYEAR);
    }

    // Request Type
    const jobType =
        res.JOBTYPE ?? res.REQUEST_TYPE ?? res.category?.CATEGORY_ID;
    if (jobType !== undefined && jobType !== null && jobType !== '') {
        const radio = $(`.request-type[value="${jobType}"]`);
        if (radio.length) {
            radio.prop('checked', true);
            if (String(jobType) >= '3') {
                $('.form-roi').addClass('hidden');
            } else {
                $('.form-roi').removeClass('hidden');
            }
        }
    }

    // Text & Select Fields
    $('[data-map="SYSTEMNAME"]').val(res.SYSTEMNAME ?? '');
    $('[data-map="TITLE"]').val(res.TITLE ?? '');
    $('[data-map="PURPOSE"]')
        .val(res.PURPOSE ?? '')
        .trigger('keyup');

    if (res.OBJECTIVE !== undefined && res.OBJECTIVE !== null) {
        $('#req-objective').val(String(res.OBJECTIVE)).trigger('change');
        if (String(res.OBJECTIVE) === '8') {
            $('#req-objective-other').prop('readonly', false);
        }
    }
    if (res.OBJECTIVE_OTHER !== undefined && res.OBJECTIVE_OTHER !== null) {
        $('#req-objective-other').val(res.OBJECTIVE_OTHER);
    }
    if (res.ROI_RETURN !== undefined && res.ROI_RETURN !== null) {
        $('#req-roi-years').val(res.ROI_RETURN);
    }
    if (res.SPEC_CONFIRM_PLAN) {
        const planDate = dayjs(res.SPEC_CONFIRM_PLAN).isValid()
            ? dayjs(res.SPEC_CONFIRM_PLAN).format('YYYY-MM-01')
            : res.SPEC_CONFIRM_PLAN;
        const dateInput = $('[data-map="SPEC_CONFIRM_PLAN"]')[0];
        if (dateInput && dateInput._flatpickr) {
            dateInput._flatpickr.setDate(planDate, true);
        } else {
            $('[data-map="SPEC_CONFIRM_PLAN"]').val(planDate);
        }
    }

    $('[data-map="CURRENT_WORKFLOW"]')
        .val(res.CURRENT_WORKFLOW ?? '')
        .trigger('keyup');
    $('[data-map="EXPECTED_WORKFLOW"]')
        .val(res.EXPECTED_WORKFLOW ?? '')
        .trigger('keyup');

    // Benefit Table
    fillBenefitTable(res.benefit || res.benefits || []);

    // Labor Table
    const manhours = res.manhours || res.manhour || res.labor || [];
    await initLaborTable({
        readonly: false,
        data:
            Array.isArray(manhours) && manhours.length > 0 ? manhours : [null],
    });

    // Investment Table
    const invests = res.invest || res.investments || res.investment || [];
    await initInvestmentTable({
        readonly: false,
        data: Array.isArray(invests) && invests.length > 0 ? invests : [null],
    });

    await totalLabor();
    await totalInvestment();
    await totalBenefit();
}

//Save Draft Form
async function handleSaveDraft() {
    $('#STATUS').val('0');
    const formdata = await formData();
    if ($('#MODE').val() == '2' || intVal($('#NRUNNO').val()) > 0) {
        await updateFormIsDev(formdata);
    } else {
        await createFormIsDev(formdata);
    }
}

//Confirm Form
async function handleSubmitForm() {
    const form = $('#form-is-dev')[0];
    //Verify form
    const formValid = await verifyForm(form);
    if (!formValid) {
        return;
    }
    //Verify ROI form
    if ($('.request-type:checked').val() < 3) {
        const roiValid = await verifyROI(form);
        if (!roiValid) {
            return;
        }
    }

    $('#STATUS').val('1');
    const formdata = await formData();
    if ($('#MODE').val() == '2' || intVal($('#NRUNNO').val()) > 0) {
        await updateFormIsDev(formdata);
    } else {
        await createFormIsDev(formdata);
    }
}

async function verifyForm(form) {
    let check = true;
    $(form)
        .find('.req-1')
        .map(function () {
            $(this).removeClass('border-red-500');
            if (!$(this).val()) {
                $(this).addClass('border-red-500');
                check = false;
            }
        });
    if (!check) {
        await showMessage(
            `กรุณากรอกรายละเอียดให้ครบถ้วน /Please fill all required fields.`,
        );
        return false;
    }

    //Check detail must have at least 100 characters
    if ($('#detail-count').html() < 1) {
        $('#detail-count')
            .closest('.fieldset')
            .find('textarea')
            .addClass('text-red-500');
        await showMessage(
            `กรุณาอธิบายรายละเอียดงานให้ชัดเจนมากขึ้น /Please provide more details about the requirement.`,
        );
        return false;
    }
    return true;
}

async function verifyROI(form) {
    //Verify form with ROI
    let check = true;
    if ($('#req-objective').val() == 8) {
        $('#req-objective-other').addClass('req-2');
    } else {
        $('#req-objective-other').removeClass('req-2');
        $('#req-objective-other').removeClass('border-red-500');
    }
    $(form)
        .find('.req-2')
        .map(function () {
            $(this).removeClass('border-red-500');
            $(this).closest('label.input').removeClass('border-red-500');
            if (!$(this).val()) {
                $(this).addClass('border-red-500');
                $(this).closest('label.input').addClass('border-red-500');
                check = false;
            }
        });

    if (!check) {
        await showMessage(
            'กรุณากรอกรายละเอียดให้ครบถ้วน /Please fill all required fields.',
        );
        return check;
    }

    //Check detail must have at least 100 characters
    if ($('#current-workflow-count').html() < 1) {
        $('#current-workflow-count')
            .closest('.fieldset')
            .find('textarea')
            .addClass('text-red-500');
        await showMessage(
            'กรุณาอธิบายรายละเอียดงานให้ชัดเจนมากขึ้น /Please provide more details about the requirement.',
        );
        return false;
    }

    //Check detail must have at least 100 characters
    if ($('#expected-workflow-count').html() < 1) {
        $('#expected-workflow-count')
            .closest('.fieldset')
            .find('textarea')
            .addClass('text-red-500');
        await showMessage(
            'กรุณาอธิบายรายละเอียดงานให้ชัดเจนมากขึ้น /Please provide more details about the requirement.',
        );
        return false;
    }

    if ($('#roi-total-full').html() == 0) {
        await showMessage(
            'กรุณากรอกระบุข้อมูล Benefit/ROI ให้ครบถ้วน / Please fill all required fields for Benefit/ROI.',
        );
        return false;
    }
    return true;
}

async function formData() {
    const formData = new FormData();
    $('#form-is-dev')
        .find('input, textarea, select')
        .each(function () {
            const map = $(this).data('map');
            const val = $(this).val();
            if (map) {
                if (
                    (map === 'SPEC_CONFIRM_PLAN' || map === 'OBJECTIVE') &&
                    !val
                )
                    return;
                formData.append(map, val);
            }
        });
    formData.append('NFRMNO', $('#NFRMNO').val());
    formData.append('VORGNO', $('#VORGNO').val());
    formData.append('CYEAR', $('#CYEAR').val());
    formData.append('INPUTBY', $('#EMPNO').val());
    if ($('#MODE').val() == '2' || intVal($('#NRUNNO').val()) > 0) {
        formData.append('CYEAR2', $('#CYEAR2').val());
        formData.append('NRUNNO', $('#NRUNNO').val());
    }
    formData.append('JOBTYPE', $('.request-type:checked').val());
    const requestor =
        $('#form-header-req-no').val() || $('#EMPNO').val();
    formData.append('REQBY', requestor);
    const remark = ($('#form-header-remark-input').val() || '').trim();
    if (remark) formData.append('VREMARK', remark);
    const user = await displayEmpInfo(requestor);
    const org =
        user.SSECCODE != '00'
            ? user.SSECCODE
            : user.SDEPCODE != '00'
              ? user.SDEPCODE
              : user.SDIVCODE;
    formData.append('REQ_ORG', org);
    formData.append('REQ_PIC', requestor);
    formData.append('REQ_DATE', dayjs().format('YYYY-MM-DD'));
    if (intVal($('.total-benefit').val()) > 0) collectBenefitData(formData);
    if (intVal($('.total-labor').val()) > 0) collectLaborData(formData);
    if (intVal($('#total-investment-cost').val()) > 0)
        collectInvestmentData(formData);
    if ($('.attachments').length > 0) setAttachments(formData);
    return formData;
}

function setAttachments(formData) {
    $('.attachments').each(function () {
        if (this.files && this.files.length > 0) {
            for (const file of this.files) {
                formData.append('files[]', file);
            }
        }
    });
}
