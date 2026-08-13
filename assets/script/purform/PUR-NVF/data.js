import {
    fetchMsgErr,
    fetchUtils,
    serializeRequestBody,
} from '@amec/webasset/api/fetch-utils';

export async function create(formData) {
    return fetchUtils({
        url: `${process.env.APP_API}/purform/pur-nvf`,
        method: 'POST',
        data: formData,
    });
}

export async function approveReturn(formData) {
    return fetchUtils({
        url: `${process.env.APP_API}/purform/pur-nvf`,
        method: 'PATCH',
        data: formData,
    });
}

export async function getData(form) {
    return fetchUtils({
        url: `${process.env.APP_API}/purform/purnvf-form/data`,
        method: 'POST',
        data: form,
    });
}

export async function getTermcode() {
    return fetchUtils({
        url: `${process.env.APP_API}/pursys/termcode`,
        method: 'GET',
    });
}

export async function getCountries() {
    return fetchUtils({
        url: `${process.env.APP_API}/purform/purnvf-location/countries`,
        method: 'GET',
    });
}

export async function getProvinces() {
    return fetchUtils({
        url: `${process.env.APP_API}/purform/purnvf-location/provinces`,
        method: 'GET',
    });
}

export async function getDistricts() {
    return fetchUtils({
        url: `${process.env.APP_API}/purform/purnvf-location/districts`,
        method: 'GET',
    });
}

export async function getSubDistricts() {
    return fetchUtils({
        url: `${process.env.APP_API}/purform/purnvf-location/sub-districts`,
        method: 'GET',
    });
}

export async function getVendor(searchParams) {
    const query = new URLSearchParams();

    if (searchParams) {
        // วนลูปคีย์ทั้งหมดใน searchParams ถ้ามีค่า (ไม่เป็น undefined หรือค่าว่าง) ให้ใส่ใน query
        Object.entries(searchParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                query.append(key, String(value));
            }
        });
    }

    const queryString = query.toString() ? `?${query.toString()}` : '';

    return fetchUtils({
        url: `${process.env.APP_API}/pursys/pur_vendors/search${queryString}`,
        method: 'GET',
    });
}
