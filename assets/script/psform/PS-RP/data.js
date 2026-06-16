import { fetchUtils } from "@amec/webasset/api/fetch-utils";

export async function getEmpData(empno) {
    return await fetchUtils({
        url: `${process.env.APP_API}/users/${empno}`,
        method: 'GET',
    });
}

export async function searchData(data) {
  return fetchUtils({
    url: `${process.env.APP_API}/J002mp`,
    method: "POST",
    data,
  });
}

export async function getFormData(nfrno, vorgno, cyear, cyear2, runno) {
    return await fetchUtils({
        url: `${process.env.APP_API}/psform/ps-rp/${nfrno}/${vorgno}/${cyear}/${cyear2}/${runno}`,
        method: 'GET',
    });
}


