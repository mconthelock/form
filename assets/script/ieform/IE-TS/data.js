import {
    fetchMsgErr,
    fetchUtils,
    serializeRequestBody,
} from '@amec/webasset/api/fetch-utils';

export async function getTsAdjustData(con) {
    return fetchUtils({
        url: `${process.env.APP_API}/f001kp/ts-adjust`,
        method: 'POST',
        data: con,
    });
}

export async function create(form) {
    return fetchUtils({
        url: `${process.env.APP_API}/ieform/ie-ts/create`,
        method: 'POST',
        data: form,
    });
}

export async function update(form) {
    return fetchUtils({
        url: `${process.env.APP_API}/ieform/ie-ts/update`,
        method: 'PATCH',
        data: form,
    });
}

export async function approve(form) {
    return fetchUtils({
        url: `${process.env.APP_API}/ieform/ie-ts/approve`,
        method: 'PATCH',
        data: form,
    });
}

export async function getData(form) {
    return fetchUtils({
        url: `${process.env.APP_API}/ieform/iets-form/data`,
        method: 'POST',
        data: form,
    });
}

export async function getOrgMfg() {
    return fetchUtils({
        url: `${process.env.APP_API}/ieform/ie-ts/orgmfg`,
        method: 'GET',
    });
}

export const getTemplate = async (filename) => {
    const data = {
        path: `${process.env.AMEC_FILE_PATH}${process.env.STATE == 'production' ? 'production' : 'development'}/Form/IE/IETS/TEMPLATE/${filename}`,
        name: filename,
    };
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/files/template/read/`,
            type: 'POST',
            dataType: 'json',
            data: data,
            success: function (res) {
                const binaryData = atob(res.content);
                const buffer = new Uint8Array(binaryData.length);
                for (let i = 0; i < binaryData.length; i++) {
                    buffer[i] = binaryData.charCodeAt(i);
                }
                res.buffer = buffer;
                resolve(res);
            },
            error: function (error) {
                reject(error);
            },
        });
    });
};
