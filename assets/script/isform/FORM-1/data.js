import { displayEmpInfo, fillImages } from '@amec/webasset/indexDB';
import { showMessage, intVal, showDigits } from '@amec/webasset/utils';

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

    $('#table-benefit tfoot .total-present').val(
        showDigits(totalPresentCost, 2),
    );
    $('#table-benefit tfoot .total-future').val(showDigits(totalFutureCost, 2));
    $('#table-benefit tfoot .total-benefit').val(showDigits(total, 2));
    $('#roi-total-kb').html(showDigits(total, 2));
    $('#roi-total-full').html(showDigits(total * 1000, 0));
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
