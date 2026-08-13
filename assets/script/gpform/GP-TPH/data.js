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
