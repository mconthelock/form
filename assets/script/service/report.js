export async function getReportMaster() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/webform/report/master`,
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

export async function getReportMasterAuthen(id) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/webform/report/auth/${id}`,
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

export async function getReportAuthen(id) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/webform/report/auth/user/${id}`,
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
