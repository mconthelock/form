import { fetchUtils } from '@amec/webasset/api/fetch-utils';

export async function getLocMstData(filters = {}) {
    return await fetchUtils({
        url: `${process.env.APP_API}/finform/fxa-locmst/search`,
        method: 'GET',
        params: filters,
    });
}

export async function getPosition() {
    return fetchUtils({
        url: `${process.env.APP_API}/amec/pposition/filter`,
        method: 'GET',
    });
}

export async function getOrganize() {
    return fetchUtils({
        url: `${process.env.APP_API}/webform/vorgmst/findactive`,
        method: 'GET',
    });
}

export async function createLoc(formData) {
    return fetchUtils({
        url: `${process.env.APP_API}/finform/fxa-locmst/create`,
        method: 'POST',
        data: formData,
    });
}

export async function importLoc(formData) {
    return fetchUtils({
        url: `${process.env.APP_API}/finform/fxa-locmst/import`,
        method: 'POST',
        data: formData,
    });
}

export async function updateLoc(formData) {
    return fetchUtils({
        url: `${process.env.APP_API}/finform/fxa-locmst/update`,
        method: 'POST',
        data: formData,
    });
}
