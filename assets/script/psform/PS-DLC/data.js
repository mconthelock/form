import { fetchUtils } from "@amec/webasset/api/fetch-utils";
import { data } from "jquery";


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

// create form
export async function createdlcForm(data) {
    return await fetchUtils({
        url: `${process.env.APP_API}/psform/ps-dlc`,
        method: "POST",
        data: data,
    });
}

export async function getFormData(nfrno, vorgno, cyear, cyear2, runno) {
    return await fetchUtils({
        url: `${process.env.APP_API}/psform/ps-dlc/${nfrno}/${vorgno}/${cyear}/${cyear2}/${runno}`,
        method: 'GET',
    });

}