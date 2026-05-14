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
