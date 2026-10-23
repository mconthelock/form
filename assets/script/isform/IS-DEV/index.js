import '@flaticon/flaticon-uicons/css/all/all.css';
import '@amec/webasset/css/select2.min.css';
import dayjs from 'dayjs';
import select2 from 'select2';
import { displayEmpInfo, fillImages } from '@amec/webasset/indexDB';
import { setSelect2 } from '@amec/webasset/select2';
import { setDatePicker } from '@amec/webasset/flatpickr';
import { showMessage, intVal, showDigits } from '@amec/webasset/utils';
import {
    setRequester,
    getObjectiveMst,
    getDeviceMst,
    getPositionMst,
    getLaborcost,
    totalBenefit,
    totalLabor,
    totalInvestment,
    createFormIsDev,
} from './data.js';
    createFormIsDev,
} from './data.js';
select2();

$(document).ready(async function () {
    await setRequester();
    const objectiveMst = await getObjectiveMst();
    const objectiveSelect = $('#req-objective');
    objectiveMst.forEach((obj) => {
        objectiveSelect.append(
            `<option value="${obj.OBJ_ID}">${obj.OBJ_NAME}</option>`,
        );
    });

    $('#add-row-labor').trigger('click');
    $('#add-row-investment').trigger('click');
    await setSelect2();
    await setDatePicker({
        altInput: true,
        altInput: true,
        mode: 'month',
        //dateFormat: 'Y-M',
        altFormat: 'Y-M',
        dateFormat: 'Y-m-01',
        //dateFormat: 'Y-M',
        altFormat: 'Y-M',
        dateFormat: 'Y-m-01',
        minDate: dayjs().format('YYYY-MM'),
    });
    $('.flatpickr-input').removeClass('input');
});

//General input number formatting
//General input number formatting
$(document).on('keyup', '.input-number', function (e) {
    let value = $(this).val();
    value = value.replace(/[^\d.-]/g, '');
    value = value.replace(/(?!^)-/g, '');
    const parts = value.split('.');
    if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('');
    $(this).val(value);
});

//Requester Information
//Requester Information
$(document).on('change', '#req-by-input', async function (e) {
    e.preventDefault();
    const inputuser = $(this).val();
    const users = await displayEmpInfo(inputuser);
    if (!users) {
        await showMessage('Employee do not found.');
        $(this).val('').focus();
        return;
    }

    $('#req-by-img').find('img').attr('src', users.image);
    $('#req-by-name').html(users.SNAME);
    $('#req-by-id').html(users.SEMPNO);
    $('#req-by-organization').html(
        `${users.SDIV}` +
            (users.SDEPT ? ` - ${users.SDEPT}` : '') +
            (users.SSEC ? ` - ${users.SSEC}` : ''),
    );
    $('#req-by-info').removeClass('hidden');
    $(this).val('').addClass('hidden');
});

$(document).on('click', '#change-req-employee', async function (e) {
    e.preventDefault();
    $('#req-by-input').removeClass('hidden');
    $('#req-by-info').addClass('hidden');
    $('#req-by-input').focus();
});

$(document).on('click', '#change-req-employee', async function (e) {
    e.preventDefault();
    $('#req-by-input').removeClass('hidden');
    $('#req-by-info').addClass('hidden');
    $('#req-by-input').focus();
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
    if (val >= '3') {
        $('.form-roi').addClass('hidden');
        $('.form-roi input').val('');
        $('.form-roi select').val('');
    } else {
        $('.form-roi').removeClass('hidden');
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
        '<input type="file" class="file-input file-input-sm w-full" />',
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
    const positionMst = await getPositionMst();
    let positionSelect = `<select class="select select-bordered select-sm w-full select-position">
        <option value="">Select Position</option>
    </select>`;
    const positionMstFiltered = positionMst
        .filter((pos) => intVal(pos.SPOSCODE) > 30 && intVal(pos.SPOSCODE) < 80)
        .sort((a, b) => intVal(a.SPOSCODE) - intVal(b.SPOSCODE));
    positionMstFiltered.forEach((position) => {
        positionSelect = positionSelect.replace(
            '</select>',
            `<option value="${position.SPOSCODE}">${position.SPOSITION}</option></select>`,
        );
    });
    const table = $('#table-labor tbody');
    const newRow = $(
        `<tr>
            <td>${positionSelect}</td>
            <td>
                <input type="text" class="input-number labor-cost" readonly>
            </td>
            <td class="bg-primary-content">
                <input type="text" class="input-number input-labor labor-present">
            </td>
            <td class="bg-primary-content">
                <input type="text" class="input-number input-labor labor-future">
            </td>
            <td>
                <input type="text" class="input-number labor-time" readonly>
            </td>
            <td>
                <input type="text" class="input-number labor-total" readonly>
            </td>
            <td class="text-center">
                <button type="button" class="btn btn-sm btn-error remove-row-labor">X</button>
            </td>
        </tr>`,
    );
    table.append(newRow);
});

$(document).on('click', '#not-improve-manpower', async function (e) {
    const isChecked = $(this).is(':checked');
    if (isChecked) {
        $('#table-labor tbody tr').remove();
        $('#add-row-labor').prop('disabled', true);
    } else {
        $('#add-row-labor').prop('disabled', false);
        $('#add-row-labor').trigger('click');
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
    $(this).closest('tr').remove();
    await totalLabor();
    await totalBenefit();
});

$(document).on('change', '#req-roi-years', async function (e) {
    await totalBenefit();
});

// Investment Table
$(document).on('click', '#add-row-investment', async function (e) {
    e.preventDefault();
    const deviceMst = await getDeviceMst();
    let deviceSelect = `<select class="select select-bordered select-sm w-full select-device">
        <option value="">Select Device</option>
    </select>`;
    deviceMst.forEach((device) => {
        deviceSelect = deviceSelect.replace(
            '</select>',
            `<option value="${device.DNO}">${device.DEVICE}</option></select>`,
        );
    });
    const table = $('#table-investment tbody');
    const newRow = $(`
        <tr>
            <td>${deviceSelect}</td>
            <td class="bg-primary-content"><input type="text" value="1" class="device-qty"></td>
            <td><input type="text" class="device-cost" readonly></td>
            <td><input type="text" class="device-total" readonly></td>
            <td class="text-center"><button type="button" class="btn btn-sm btn-error remove-row-investment">X</button></td>
        </tr>
    `);
    table.append(newRow);
});

$(document).on('click', '#not-improve-investment', async function (e) {
    const isChecked = $(this).is(':checked');
    if (isChecked) {
        $('#table-investment tbody tr').remove();
        $('#add-row-investment').prop('disabled', true);
    } else {
        $('#add-row-investment').prop('disabled', false);
        $('#add-row-investment').trigger('click');
    }
    await totalInvestment();
    await totalBenefit();
});

$(document).on('click', '.select-device', async function (e) {
    const row = $(this).closest('tr');
    const deviceCode = $(this).val();
    const deviceMst = await getDeviceMst();
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
    $(this).closest('tr').remove();
    await totalInvestment();
    await totalBenefit();
});

//Save Form
$(document).on('click', '#confirm-form', async function (e) {
    e.preventDefault();
    const form = $('#form-is-dev')[0];
    //Verify form
    // const formValid = await verifyForm(form);
    // if (!formValid) {
    //     return;
    // }
    // //Verify ROI form
    // if ($('.request-type:checked').val() < 3) {
    //     const roiValid = await verifyROI(form);
    //     if (!roiValid) {
    //         return;
    //     }
    // }

    const formdata = await formData();
    await createFormIsDev(formdata);
    //const files = $('#form-is-dev input[type="file"]');
});

async function verifyForm(form) {
    // const formValid = await verifyForm(form);
    // if (!formValid) {
    //     return;
    // }
    // //Verify ROI form
    // if ($('.request-type:checked').val() < 3) {
    //     const roiValid = await verifyROI(form);
    //     if (!roiValid) {
    //         return;
    //     }
    // }

    const formdata = await formData();
    await createFormIsDev(formdata);
    //const files = $('#form-is-dev input[type="file"]');
});

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
            `กรุณากรอกรายละเอียดให้ครบถ้วน /Please fill all required fields.`,
        );
        return false;
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
            `กรุณาอธิบายรายละเอียดงานให้ชัดเจนมากขึ้น /Please provide more details about the requirement.`,
        );
        return false;
    }
    return true;
}
        return false;
    }
    return true;
}

async function verifyROI(form) {
    //Verify form with ROI
    let check2 = true;
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
                check2 = false;
            }
        });
async function verifyROI(form) {
    //Verify form with ROI
    let check2 = true;
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
                check2 = false;
            }
        });

    if (!check2) {
        await showMessage(
            'กรุณากรอกรายละเอียดให้ครบถ้วน /Please fill all required fields.',
        );
        return check2;
    }
    if (!check2) {
        await showMessage(
            'กรุณากรอกรายละเอียดให้ครบถ้วน /Please fill all required fields.',
        );
        return check2;
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
            if (map) {
                formData.append(map, $(this).val());
            }
        });
    formData.append('JOBTYPE', $('.request-type:checked').val());
    const requestor = $('#req-by-input').val();
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
    if ($('.total-benefit').val() > 0) setBenefit(formData);
    if ($('.total-labor').val() > 0) setLabor(formData);
    if ($('.total-investment-cost').val() > 0) setInvestmentCost(formData);
    if ($('.attachments').length > 0) setAttachments(formData);
    return formData;
}

function setBenefit(formData) {
    const rows = $('#table-benefit').find('tbody tr');
    let i = 0;
    for (const row of rows) {
        if ($(row).find('.subtotal-cost').val() > 0) {
            formData.append(`benefit[${i}][BENEFIT_TYPE]`, $(row).index());
            formData.append(
                `benefit[${i}][BENEFIT_CURRENT]`,
                $(row).find('.present-cost').val() || 0,
            );
            formData.append(
                `benefit[${i}][BENEFIT_AFTER]`,
                $(row).find('.future-cost').val() || 0,
            );
            i++;
        }
    }
}

function setLabor(formData) {
    const rows = $('#table-labor').find('tbody tr');
    let i = 0;
    for (const row of rows) {
        if ($(row).find('.labor-total').val() > 0) {
            formData.append(
                `manhours[${i}][POSITION]`,
                $(row).find('td:eq(0) select').val(),
            );
            formData.append(
                `manhours[${i}][COST]`,
                $(row).find('td:eq(1) input').val() || 0,
            );
            formData.append(
                `manhours[${i}][HOURS_PRESENT]`,
                $(row).find('td:eq(2) input').val() || 0,
            );
            formData.append(
                `manhours[${i}][HOURS_AFTER]`,
                $(row).find('td:eq(3) input').val() || 0,
            );
            i++;
        }
    }
}

function setInvestmentCost(formData) {
    const rows = $('#table-investment').find('tbody tr');
    let i = 0;
    for (const row of rows) {
        if ($(row).find('.device-total').val() > 0) {
            formData.append(
                `invest[${i}][DEVICE]`,
                $(row).find('td:eq(0) select').val(),
            );
            formData.append(
                `invest[${i}][QTY]`,
                $(row).find('td:eq(1) input').val() || 0,
            );
            formData.append(
                `invest[${i}][PRICE]`,
                $(row).find('td:eq(2) input').val() || 0,
            );
            i++;
        }
    }
}
