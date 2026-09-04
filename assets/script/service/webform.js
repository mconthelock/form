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

export async function populateOrganizations() {
    const organizations = await getOrganizations();
    var orgData = organizations.data
        .filter((item) => !item.SDIV.includes('Cancel'))
        .filter((item) => !item.SDEPT.includes('Cancel'))
        .filter((item) => !item.SSEC.includes('Cancel'));

    //Division Filter
    const div = [...new Set(orgData.map((item) => item.SDIVCODE))].filter(
        (item) => item,
    );
    const division = div.map((code) => {
        const data = orgData.find((item) => item.SDIVCODE === code);
        return {
            code: code,
            data: data,
        };
    });

    const dept = [...new Set(orgData.map((item) => item.SDEPCODE))].filter(
        (item) => item,
    );
    const department = dept.map((code) => {
        const data = orgData.find((item) => item.SDEPCODE === code);
        return {
            code: code,
            data: data,
        };
    });

    const sec = [...new Set(orgData.map((item) => item.SSECCODE))].filter(
        (item) => item,
    );
    const section = sec.map((code) => {
        const data = orgData.find((item) => item.SSECCODE === code);
        return {
            code: code,
            data: data,
        };
    });
    return {
        division,
        department,
        section,
    };
}

export async function getPositions() {
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

export async function getFlowMaster(no, vorgno, cyear) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/flowmst/find/${no}/${vorgno}/${cyear}`,
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
