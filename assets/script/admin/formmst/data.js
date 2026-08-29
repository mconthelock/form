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

export async function createFormMasterGroup(data) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/formmst/group/create`,
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

export async function updateFormMasterGroup(data) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/formmst/group/update`,
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

export async function createFormMaster(data) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/formmst/create`,
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

export async function updateFormMaster(data) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/formmst/update`,
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

export async function updateFormAuthen(data) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/formmst/auth/update`,
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
