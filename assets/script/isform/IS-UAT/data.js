import { displayEmpInfo } from '@amec/webasset/indexDB';

export function formatOrg(user) {
    if (!user) return '';
    return (
        `${user.SDIV ?? ''}` +
        (user.SDEPT ? ` - ${user.SDEPT}` : '') +
        (user.SSEC ? ` - ${user.SSEC}` : '')
    );
}

export async function renderEmployeeCard(prefix, empno) {
    if (!empno) return null;
    const user = await displayEmpInfo(empno);
    if (!user) return null;

    $(`#${prefix}-img`).find('img').attr('src', user.image).removeClass('hidden');
    $(`#${prefix}-name`).html(user.SNAME);
    $(`#${prefix}-id`).html(user.SEMPNO);
    $(`#${prefix}-organization`).html(formatOrg(user));
    $(`#${prefix}-info`).find('.skeleton').addClass('hidden');
    $(`#${prefix}-info`).removeClass('hidden');
    return user;
}

export async function setParticipants() {
    const inputUser = $('#EMPNO').val();
    if (!inputUser) return;
    await renderEmployeeCard('tester-by', inputUser);
    await renderEmployeeCard('input-by', inputUser);
}

export async function getFormIsUat(data) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/form/is/is-uat/search`,
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

export async function createFormIsUat(data) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/form/is/is-uat/create`,
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

export async function updateFormIsUat(data) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/form/is/is-uat/update`,
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

export async function saveTestResultIsUat(data) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/form/is/is-uat/test-result`,
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
