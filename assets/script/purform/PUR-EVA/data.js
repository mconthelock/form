import {
    fetchMsgErr,
    fetchUtils,
    serializeRequestBody,
} from '@amec/webasset/api/fetch-utils';
import { logFormData } from '@amec/webasset/utils';

export async function searchNVFForm(keyword) {
    return fetchUtils({
        url: `${process.env.APP_API}/purform/purnvf-form/search?keyword=${encodeURIComponent(keyword)}`,
        method: 'GET',
    });
}

export async function getCurrency() {
    return fetchUtils({
        url: `${process.env.APP_API}/pursys/currency/master`,
        method: 'GET',
    });
}

export async function create(formData) {
    return fetchUtils({
        url: `${process.env.APP_API}/purform/pur-eva`,
        method: 'POST',
        data: formData,
    });
}

export async function update(formData) {
    return fetchUtils({
        url: `${process.env.APP_API}/purform/pur-eva`,
        method: 'PATCH',
        data: formData,
    });
}

export async function updatePurEvaForm(formData) {
    return fetchUtils({
        url: `${process.env.APP_API}/purform/pureva-form`,
        method: 'PATCH',
        data: formData,
    });
}

export async function getData(form) {
    return fetchUtils({
        url: `${process.env.APP_API}/purform/pureva-form/data`,
        method: 'POST',
        data: form,
    });
}

export async function approvePurEvaForm(form) {
    return fetchUtils({
        url: `${process.env.APP_API}/purform/pur-eva/approve`,
        method: 'PATCH',
        data: form,
    });
}

export async function searchrpt(con) {
    return fetchUtils({
        url: `${process.env.APP_API}/purform/pureva-form/search`,
        method: 'POST',
        data: con,
    });
}

// export async function createPurVmmAuto(form) {
//     return fetchUtils({
//         url: `${process.env.APP_API}/purform/pur-vmm/createauto`,
//         method: 'POST',
//         data: form,
//     });
// }

// export async function genVndCode(data) {
//     return fetchUtils({
//         url: `${process.env.APP_API}/pursys/vendors/create`,
//         method: 'POST',
//         data: data,
//     });
// }
