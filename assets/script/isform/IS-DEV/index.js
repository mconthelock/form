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
    const deviceMst = await getDeviceMst();
    const objectiveSelect = $('#req-objective');
    objectiveMst.forEach((obj) => {
        objectiveSelect.append(
            `<option value="${obj.OBJ_ID}">${obj.OBJ_NAME}</option>`,
        );
    });
    const deviceSelect = $('#select-device');
    deviceMst.forEach((device) => {
        deviceSelect.append(
            `<option value="${device.DNO}">${device.DEVICE}</option>`,
        );
    });

    const positionMst = await getPositionMst();
    const positionSelect = $('#select-position');
    positionMst.forEach((position) => {
        positionSelect.append(
            `<option value="${position.SPOSCODE}">${position.SPOSITION}</option>`,
        );
    });
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
