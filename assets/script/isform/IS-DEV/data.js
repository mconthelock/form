import { displayEmpInfo, fillImages } from '@amec/webasset/indexDB';
import { showMessage, intVal, showDigits } from '@amec/webasset/utils';
import { DEFAULT_BENEFIT_MASTER } from './benefit';

export async function setRequester() {
    const inputuser = $('#EMPNO').val();
    const users = await displayEmpInfo(inputuser);
    //Requester Info
    $('#req-by-img').find('img').attr('src', users.image).removeClass('hidden');
    $('#req-by-name').html(users.SNAME);
    $('#req-by-id').html(users.SEMPNO);
    $('#req-by-organization').html(
        `${users.SDIV}` +
            (users.SDEPT ? ` - ${users.SDEPT}` : '') +
            (users.SSEC ? ` - ${users.SSEC}` : ''),
    );
    $('#req-by-info').find('.skeleton').addClass('hidden');

    // Input Employee Info
    $('#input-by-img')
        .find('img')
        .attr('src', users.image)
        .removeClass('hidden');
    $('#input-by-name').html(users.SNAME);
    $('#input-by-id').html(users.SEMPNO);
    $('#input-by-organization').html(
        `${users.SDIV}` +
            (users.SDEPT ? ` - ${users.SDEPT}` : '') +
            (users.SSEC ? ` - ${users.SSEC}` : ''),
    );
    $('#input-by-info').find('.skeleton').addClass('hidden');
}

export async function getObjectiveMst() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/form/is/is-dev/objective/all`,
            type: 'GET',
            dataType: 'json',
            success: function (response) {
                resolve(response);
            },
            error: function (error) {
                reject(error);
            },
        });
    });
}

export async function getDeviceMst() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/form/is/is-dev/device/all`,
            type: 'GET',
            dataType: 'json',
            success: function (response) {
                resolve(response);
            },
            error: function (error) {
                reject(error);
            },
        });
    });
}

export async function getPositionMst() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/amec/pposition/all`,
            type: 'GET',
            dataType: 'json',
            success: function (response) {
                resolve(response);
            },
            error: function (error) {
                reject(error);
            },
        });
    });
}

export async function getLaborcost() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/form/is/is-dev/laborcost/all`,
            type: 'GET',
            dataType: 'json',
            success: function (response) {
                resolve(response);
            },
            error: function (error) {
                reject(error);
            },
        });
    });
}

const escapeHtml = (value) =>
    $('<div>')
        .text(value ?? '')
        .html();

export function renderBenefitTable({
    readonly = false,
    values = [],
    master = DEFAULT_BENEFIT_MASTER,
} = {}) {
    const items = (master || [])
        .filter((item) => item.STATUS == null || String(item.STATUS) !== '0')
        .sort(
            (a, b) =>
                (intVal(a.SORT_ORDER) || intVal(a.BENEFIT_ID)) -
                (intVal(b.SORT_ORDER) || intVal(b.BENEFIT_ID)),
        );

    const rowsHtml = [];
    for (let i = 0; i < items.length; ) {
        const groupName = String(items[i].GROUP_NAME || '').trim();
        let groupSpan = 1;

        if (groupName) {
            while (
                i + groupSpan < items.length &&
                String(items[i + groupSpan].GROUP_NAME || '').trim() ===
                    groupName
            ) {
                groupSpan++;
            }
        }

        for (let offset = 0; offset < groupSpan; offset++) {
            const cur = items[i + offset];
            const isAuto =
                String(cur.IS_AUTO ?? '0') === '1' ||
                String(cur.SOURCE_TYPE || '').toUpperCase() === 'LABOR';
            const roAttr = readonly || isAuto ? 'readonly' : '';
            const safeItem = escapeHtml(cur.ITEM_NAME);

            const labelCells = !groupName
                ? `<th colspan="2">${safeItem}</th>`
                : offset === 0
                  ? `<th rowspan="${groupSpan}">${escapeHtml(groupName)}</th><th>${safeItem}</th>`
                  : `<th>${safeItem}</th>`;

            const presentId = isAuto ? ' id="labor-present-benefit"' : '';
            const futureId = isAuto ? ' id="labor-future-benefit"' : '';
            const totalId = isAuto ? ' id="labor-total-benefit"' : '';

            rowsHtml.push(
                `<tr data-benefit-id="${cur.BENEFIT_ID}" data-auto="${isAuto ? 1 : 0}">
                    ${labelCells}
                    <td><input type="text" class="input-number input-benefit present-cost"${presentId} ${roAttr}></td>
                    <td><input type="text" class="input-number input-benefit future-cost"${futureId} ${roAttr}></td>
                    <td><input type="text" class="input-number input-benefit subtotal-cost"${totalId} readonly></td>
                </tr>`,
            );
        }

        i += groupSpan;
    }

    $('#table-benefit tbody').html(rowsHtml.join(''));

    if (values.length > 0) {
        fillBenefitTable(values);
    }
}

export function fillBenefitTable(benefits = []) {
    if (!Array.isArray(benefits) || benefits.length === 0) return;

    benefits.forEach((b) => {
        const id = b.BENEFIT ?? b.BENEFIT_TYPE;
        if (id == null) return;

        const row = $(`#table-benefit tbody tr[data-benefit-id="${id}"]`);
        if (!row.length || String(row.data('auto')) === '1') return;

        const present = intVal(b.BENEFIT_CURRENT) || 0;
        const after = intVal(b.BENEFIT_AFTER) || 0;
        row.find('.present-cost').val(present);
        row.find('.future-cost').val(after);
        row.find('.subtotal-cost').val(showDigits(present - after, 2));
    });
}

export function collectBenefitData(formData) {
    let i = 0;
    $('#table-benefit tbody tr').each(function () {
        const $row = $(this);
        if (intVal($row.find('.subtotal-cost').val()) <= 0) return;

        const benefitId = $row.data('benefit-id') ?? $row.index();
        formData.append(`benefit[${i}][BENEFIT]`, benefitId);
        formData.append(
            `benefit[${i}][BENEFIT_CURRENT]`,
            intVal($row.find('.present-cost').val()) || 0,
        );
        formData.append(
            `benefit[${i}][BENEFIT_AFTER]`,
            intVal($row.find('.future-cost').val()) || 0,
        );
        i++;
    });
}

export async function totalBenefit() {
    let total = 0,
        totalPresentCost = 0,
        totalFutureCost = 0;
    $('#table-benefit tbody tr').each(function () {
        const presentCost = intVal($(this).find('.present-cost').val()) || 0;
        const futureCost = intVal($(this).find('.future-cost').val()) || 0;
        totalPresentCost += presentCost;
        totalFutureCost += futureCost;
        total += presentCost - futureCost;
    });

    const invest = (await totalInvestment()) / 1000;
    const roiyears = intVal($('#req-roi-years').val()) || 1;

    const roi = (total - invest) / roiyears;

    $('#table-benefit tfoot .total-present').val(
        showDigits(totalPresentCost, 2),
    );
    $('#table-benefit tfoot .total-future').val(showDigits(totalFutureCost, 2));
    $('#table-benefit tfoot .total-benefit').val(showDigits(total, 2));

    $('#roi-total-kb').html(`${showDigits(roi, 2)} KBath/Year`);
    $('#roi-total-full').html(` (${showDigits(roi * 1000, 0)} Bath/Year) `);

    if (roiyears > 1) {
        $('#roi-total-year').html(
            `or ${showDigits(total - invest, 2)}KBath (${showDigits((total - invest) * 1000, 0)} Bath) with in ${roiyears} Years`,
        );
    }
    return total;
}

export async function totalLabor() {
    let totalTime = 0,
        totalCost = 0,
        totalPresent = 0,
        totalFuture = 0,
        totalPresentCost = 0,
        totalFutureCost = 0;
    $('#table-labor tbody tr').each(function () {
        const cost = intVal($(this).find('.labor-cost').val()) || 0;
        const presentTime = intVal($(this).find('.labor-present').val()) || 0;
        const futureTime = intVal($(this).find('.labor-future').val()) || 0;
        totalPresent += presentTime;
        totalFuture += futureTime;
        totalPresentCost += presentTime * cost;
        totalFutureCost += futureTime * cost;
        totalTime += presentTime - futureTime;
        totalCost += (presentTime - futureTime) * cost;
    });

    $('#table-labor tfoot .total-present').val(showDigits(totalPresent, 2));
    $('#table-labor tfoot .total-future').val(showDigits(totalFuture, 2));
    $('#table-labor tfoot .total-time').val(showDigits(totalTime, 2));
    $('#table-labor tfoot .total-labor').val(showDigits(totalCost, 2));

    $('#labor-present-benefit').val(showDigits(totalPresentCost / 1000, 2));
    $('#labor-future-benefit').val(showDigits(totalFutureCost / 1000, 2));
    $('#labor-total-benefit').val(showDigits(totalCost / 1000, 2));
    await totalBenefit();
    return totalCost;
}

export async function totalInvestment() {
    let totalCost = 0;
    $('#table-investment tbody tr').each(function () {
        const cost = intVal($(this).find('.device-total').val()) || 0;
        totalCost += cost;
    });

    $('#total-investment-cost').val(showDigits(totalCost));
    return totalCost;
}

export async function getFormIsDev(data) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/form/is/is-dev/search`,
            type: 'POST',
            dataType: 'json',
            data: data,
            success: function (response) {
                resolve(response);
            },
            error: function (error) {
                reject(error);
            },
        });
    });
}

export async function createFormIsDev(data) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/form/is/is-dev/create`,
            type: 'POST',
            dataType: 'json',
            data: data,
            processData: false,
            contentType: false,
            success: function (response) {
                resolve(response);
            },
            error: function (error) {
                reject(error);
            },
        });
    });
}

export async function updateFormIsDev(data) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/form/is/is-dev/update`,
            type: 'POST',
            dataType: 'json',
            data: data,
            processData: false,
            contentType: false,
            success: function (response) {
                resolve(response);
            },
            error: function (error) {
                reject(error);
            },
        });
    });
}
