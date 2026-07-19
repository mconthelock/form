export function getAmecUsers() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/users/search`,
            type: 'POST',
            dataType: 'json',
            data: { CSTATUS: '1' },
            success: function (res) {
                resolve(res);
            },
            error: function (err) {
                reject(err);
            },
        });
    });
}

export async function getFormMaster() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/formmst/`,
            type: 'get',
            dataType: 'json',
            success: function (res) {
                resolve(res);
            },
            error: function (xhr, err) {
                console.log(xhr, err);
                reject(err);
            },
        });
    });
}

export async function getFormDept(id) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_ENV}/webform/form/getFormDept/`,
            type: 'get',
            dataType: 'json',
            success: function (res) {
                resolve(res);
            },
            error: function (xhr, err) {
                console.log(xhr, err);
                reject(err);
            },
        });
    });
}
