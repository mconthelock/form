export async function setFormNo() {
    const path = window.location.pathname.replace(/\/$/, '');
    const pathSegments = path
        .replace('/form/admin/formmaster/', '')
        .split('/')
        .filter((segment) => segment !== '');
    if (pathSegments.length < 4) return null;
    return {
        nno: pathSegments[pathSegments.length - 3],
        orgno: pathSegments[pathSegments.length - 2],
        cyear: pathSegments[pathSegments.length - 1],
    };
}

export async function createReport(data) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/webform/report/master`,
            type: 'post',
            dataType: 'json',
            data: data,
            success: function (res) {
                resolve(res);
            },
            error: function (xhr, err) {
                console.log(err);
                reject(err);
            },
        });
    });
}

export async function updateReport(data, id) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/webform/report/master/${id}`,
            type: 'Patch',
            dataType: 'json',
            data: data,
            success: function (res) {
                resolve(res);
            },
            error: function (xhr, err) {
                console.log(err);
                reject(err);
            },
        });
    });
}

export async function updateReportAuthen(data, id) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/webform/report/auth/${id}`,
            type: 'Patch',
            dataType: 'json',
            data: data,
            success: function (res) {
                resolve(res);
            },
            error: function (xhr, err) {
                console.log(err);
                reject(err);
            },
        });
    });
}
