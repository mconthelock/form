import '@amec/webasset/css/select2.min.css';
import dayjs from 'dayjs';
import select2 from 'select2';
import { displayEmpInfo, fillImages } from '@amec/webasset/indexDB';
import { setSelect2 } from '@amec/webasset/select2';
import { showMessage } from '@amec/webasset/utils';
import {
    setRequester,
    getObjectiveMst,
    getDeviceMst,
    getPositionMst,
} from '../FORM-1/data.js';
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
});

$(document).on('click', '#change-req-employee', async function (e) {
    e.preventDefault();
    $('#req-by-input').removeClass('hidden');
    $('#req-by-info').addClass('hidden');
    $('#req-by-input').focus();
});

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

$(document).on('change', '.request-type', async function () {
    const val = $(this).val();
    if (val >= '3') $('.form-roi').addClass('hidden');
    else $('.form-roi').removeClass('hidden');
});

$(document).on('click', '#add-file', async function (e) {
    e.preventDefault();
    const wrap = $('.file-input-wrap');
    const newInput = $(
        '<input type="file" class="file-input file-input-sm w-full" />',
    );
    wrap.append(newInput);
});

$(document).on('click', '#add-row-labor', async function (e) {
    e.preventDefault();
    const positionMst = await getPositionMst();
    let positionSelect = `<select class="select select-bordered select-sm w-full select-position">
        <option value="">Select Position</option>
    </select>`;
    positionMst.forEach((position) => {
        positionSelect = positionSelect.replace(
            '</select>',
            `<option value="${position.SPOSCODE}">${position.SPOSITION}</option></select>`,
        );
    });
    const table = $('#table-labor tbody');
    const newRow = $(
        `<tr>
            <td>${positionSelect}</td>
            <td><input type="text" class="input-number input-labor" readonly></td>
            <td class="bg-primary-content"><input type="text" class="input-number input-labor"></td>
            <td class="bg-primary-content"><input type="text" class="input-number input-labor"></td>
            <td><input type="text" class="input-number input-labor" readonly></td>
            <td><input type="text" class="input-number input-labor" readonly></td>
            <td></td>
        </tr>`,
    );
    table.append(newRow);
});

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
            <td class="bg-primary-content"><input type="text" value="1"></td>
            <td><input type="text" readonly></td>
            <td><input type="text" readonly></td>
            <td class="text-center"><button type="button" class="btn btn-sm btn-error remove-row">X</button></td>
        </tr>
    `);
    table.append(newRow);
});
