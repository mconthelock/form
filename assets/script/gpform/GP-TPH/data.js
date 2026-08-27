import { fetchUtils } from '@amec/webasset/api/fetch-utils';

export async function getEmpData(empno) {
    return await fetchUtils({
        url: `${process.env.APP_API}/users/${empno}`,
        method: 'GET',
    });
}

export async function getAreas() {
    return await fetchUtils({
        url: `${process.env.APP_API}/gpform/gp-tph/areas`,
        method: 'GET',
    });
}

export async function getLocations() {
    return await fetchUtils({
        url: `${process.env.APP_API}/gpform/gp-tph/locations`,
        method: 'GET',
    });
}

export async function getFormData(nfrno, vorgno, cyear, cyear2, runno) {
    return await fetchUtils({
        url: `${process.env.APP_API}/gpform/gp-tph/${nfrno}/${vorgno}/${cyear}/${cyear2}/${runno}`,
        method: 'GET',
    });
}

export async function createForm(data) {
    return fetchUtils({
        url: `${process.env.APP_API}/gpform/gp-tph`,
        method: 'POST',
        data: data,
    });
}
export async function createArea(data) {
    return fetchUtils({
        url: `${process.env.APP_API}/gpform/gp-tph/areas`,
        method: 'POST',
        data,
    });
}
export async function updateArea(areaId, data) {
    return fetchUtils({
        url: `${process.env.APP_API}/gpform/gp-tph/areas/${encodeURIComponent(areaId)}`,
        method: 'PATCH',
        data,
    });
}

export async function deleteArea(areaId) {
    return fetchUtils({
        url: `${process.env.APP_API}/gpform/gp-tph/areas/${encodeURIComponent(areaId)}`,
        method: 'DELETE',
    });
}
