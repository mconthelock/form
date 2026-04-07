import { fetchUtils } from "@amec/webasset/api/fetch-utils";

export async function getUserLogin() {
    return await fetchUtils({
        url: `${process.env.APP_API}/itgc/specialuser/getUserLogin`,
        method: "GET",
    });
}

export async function getController() {
    return await fetchUtils({
        url: `${process.env.APP_API}/itgc/specialuser/getController`,
        method: "GET",
    });
}

export async function getServerName() {
    return await fetchUtils({
        url: `${process.env.APP_API}/itgc/specialuser/getServerName`,
        method: "GET",
    });
}

export async function createTid(data) {
    return await fetchUtils({
        url: `${process.env.APP_API}/isform/is-tid`,
        method: "POST",
        data,
    });
}

export async function actionTid(data) {
    return await fetchUtils({
        url: `${process.env.APP_API}/isform/is-tid`,
        method: "PATCH",
        data,
    });
}

export async function getFormData(form) {
    return await fetchUtils({
        url: `${process.env.APP_API}/isform/is-tid/getFormData`,
        method: "POST",
        data: form,
    });
}
