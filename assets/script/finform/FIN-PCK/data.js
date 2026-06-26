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
