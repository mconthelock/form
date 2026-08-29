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

export async function getFormMasterGroup() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/formmst/group/all`,
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

export async function getOrganizations(q) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/webform/organizations/search`,
            type: 'POST',
            dataType: 'json',
            data: q,
            success: function (response) {
                resolve(response);
            },
            error: function (error) {
                reject(error);
            },
        });
    });
}

export async function getFormAuthen(nno, vorgno, cyear) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/formmst/auth/${nno}/${vorgno}/${cyear}`,
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

export async function getFormAuthenList(empno) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/formmst/auth/${empno}`,
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

export async function getFlowMaster() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/flowmst`,
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
