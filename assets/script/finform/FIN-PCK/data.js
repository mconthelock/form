import {
    fetchMsgErr,
    fetchUtils,
    serializeRequestBody,
} from '@amec/webasset/api/fetch-utils';

export async function createpck(formData) {
    return fetchUtils({
        url: `${process.env.APP_API}/finform/fin-pck`,
        method: 'POST',
        data: formData,
    });
}

export async function getData(form) {
    return fetchUtils({
        url: `${process.env.APP_API}/finform/finpck-form/data`,
        method: 'POST',
        data: form,
    });
}

export async function updatepck(formData) {
    return fetchUtils({
        url: `${process.env.APP_API}/finform/finpck-asset/updateasset`,
        method: 'PATCH',
        data: formData,
    });
}

export async function getGrpmst() {
    return fetchUtils({
        url: `${process.env.APP_API}/finform/fxa-grpmst`,
        method: 'GET',
    });
}

export async function getRptDetail(formData) {
    return fetchUtils({
        url: `${process.env.APP_API}/finform/fin-pck/finpck-vwdetail/search`,
        method: 'POST',
        data: formData,
    });
}

export async function getRptStatus(formData) {
    return fetchUtils({
        url: `${process.env.APP_API}/finform/fin-pck/finpck-vwstatus/search`,
        method: 'POST',
        data: formData,
    });
}
