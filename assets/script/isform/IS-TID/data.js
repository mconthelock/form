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
