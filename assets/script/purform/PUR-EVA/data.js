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
        url: `${process.env.APP_API}/amec/pcurrency/currency`,
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
