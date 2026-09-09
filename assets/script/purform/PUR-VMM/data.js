import {
    fetchMsgErr,
    fetchUtils,
    serializeRequestBody,
} from '@amec/webasset/api/fetch-utils';

export async function getData(form) {
    return fetchUtils({
        url: `${process.env.APP_API}/purform/purvmm-form/data`,
        method: 'POST',
        data: form,
    });
}

export async function create(form) {
    return fetchUtils({
        url: `${process.env.APP_API}/purform/pur-vmm/create`,
        method: 'POST',
        data: form,
    });
}

export async function update(form) {
    return fetchUtils({
        url: `${process.env.APP_API}/purform/pur-vmm/update`,
        method: 'PATCH',
        data: form,
    });
}

export async function approve(form) {
    return fetchUtils({
        url: `${process.env.APP_API}/purform/pur-vmm/approve`,
        method: 'PATCH',
        data: form,
    });
}
