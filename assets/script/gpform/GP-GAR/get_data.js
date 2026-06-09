import { fetchUtils } from "@amec/webasset/api/fetch-utils";
export async function getCategory() {
    return await fetchUtils({
        url: `${process.env.APP_API}/gpform/GP-GAR`,
        method: "GET",
    });
}