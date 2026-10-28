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
