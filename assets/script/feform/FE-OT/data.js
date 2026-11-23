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
export async function getdatOT(planYear, planMonth, sEmpno) {
    return await fetchUtils({
        url: `${process.env.APP_API}/feform/fe-ot/${planYear}/${planMonth}/${sEmpno}`,
        method: 'GET',
    });
}

// delete data ot
export async function deletedataOT(planYear, planMonth, sEmpno, wdate) {
    return await fetchUtils({
        url: `${process.env.APP_API}/feform/fe-ot/${planYear}/${planMonth}/${sEmpno}/${wdate}`,
        method: 'DELETE',
    });
    
}

// update data ot 
export async function updatedataOT(data) {
    return await fetchUtils({
        url: `${process.env.APP_API}/feform/fe-ot/update`,
        method: 'PATCH',
        data: data,
    });
}
