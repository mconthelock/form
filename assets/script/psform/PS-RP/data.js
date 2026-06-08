import { fetchUtils } from "@amec/webasset/api/fetch-utils";

export async function getEmpData(empno) {
    return await fetchUtils({
        url: `${process.env.APP_API}/users/${empno}`,
        method: 'GET',
    });
}
