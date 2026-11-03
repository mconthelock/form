import { fetchUtils } from '@amec/webasset/api/fetch-utils';

// create form
export async function createFEOTForm(data) {
    return await fetchUtils({
        url: `${process.env.APP_API}/feform/fe-ot`,
        method: 'POST',
        data: data,
    });
}

// get data ot after save plan
export async function getdatOT() {
    return await fetchUtils({
        url: `${process.env.APP_API}/feform/fe-ot`,
        method: 'GET',
    });
}
