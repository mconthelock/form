import { fetchMsgErr } from "../errorMsg";

/**
 * get escs users
 * @param {object} q
 * @returns
 * @example
 * {
 *   USR_ID: 1,         // number
 *   USR_NO: "24008",   // string
 *   GRP_ID: 1,         // number 1:inspector, 2:foreman, 3:qc admin, 4:system admin, 5:leader, 6:manager, 7:viewer
 *   USR_STATUS: 1,     // number
 *   SEC_ID: 1,         // number
 *   fields: array of strings, e.g. ["USR_ID", "USR_NO", "USR_NAME", "USR_EMAIL", "USR_REGISTDATE", "USR_USERUPDATE", "USR_DATEUPDATE", "GRP_ID", "USR_STATUS", "SEC_ID", "SEMPNO", "SNAME", "SRECMAIL", "SSECCODE","SSEC", "SDEPCODE", "SDEPT", "SDIVCODE", "SDIV", "SPOSCODE", "SPOSNAME", "SPASSWORD1", "CSTATUS", "SEMPENCODE", "MEMEML", "STNAME"]
 */
export async function getEscsUsers(q = {}) {
    const res = await fetch(`${process.env.APP_API}/escs/user/getUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(q),
    });
    if (!res.ok) {
        await fetchMsgErr(res)
        throw new Error("Failed to fetch escs users");
    }
    return res.json();

    // return getData({
    //     url: `${process.env.APP_API}/escs/user/getUser`,
    //     data: q,
    // });
}
