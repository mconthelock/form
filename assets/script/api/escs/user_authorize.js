

import { fetchMsgErr } from "../fetch-utils";

/**
 * get escs user section
 * @param {object} q
 * @returns
 * @example
 * optional
 * {
 *  USR_ID // number
    USR_NO // string
    USR_NAME // string
    IT_NO // string
    STATION_NO // number
    SPOSITION // string
    USR_STATUS // number
    SCORE // number
    GRADE // string
    TOTAL // number
    PERCENT // number
    REV // number
    TEST_BY // string
    TEST_DATE // date||string
    TR // number
    SSEC // string
    SSECCODE // string
    SDEPT // string
    SDEPCODE // string
    SDIV // string
    SDIVCODE // string   
 * }
 */
export async function getUserAuthorizeView(q = {}) {
    const res = await fetch(`${process.env.APP_API}/escs/user-authorize-view/getUserAuthorizeView`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(q),
    });
    if (!res.ok) {
        await fetchMsgErr(res)
        throw new Error("Failed to fetch escs user section");
    }
    return res.json();
}