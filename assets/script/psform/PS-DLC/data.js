import { fetchUtils } from "@amec/webasset/api/fetch-utils";


export async function getEmpData(empno) {
    return await fetchUtils({
        url: `${process.env.APP_API}/users/${empno}`,
        method: 'GET',
    });
}

export async function getSchedule(q = {}) {
    return await fetchUtils({
        url: `${process.env.APP_API}/calendar/range/`,
        method: 'POST',
        data: q
    });
}