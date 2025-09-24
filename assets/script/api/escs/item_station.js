import { fetchMsgErr } from "../fetch-utils";

/**
 * get escs items
 * @param {object} q 
 * @returns 
 * @example
 * {
 *  ITS_ITEM: "121-03",  // string
    ITS_NO: 1,  // number
    ITS_STATION_NAME: "KITTING",  // string
    ITS_USERUPDATE: 23 // number
}
 */
export async function getEscsItemStation(q = {}) {
    const res = await fetch(`${process.env.APP_API}/escs/item-station/searchItemStation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(q),
    });
    if (!res.ok) {
        await fetchMsgErr(res)
        throw new Error("Failed to fetch escs items");
    }
    return res.json();
}
