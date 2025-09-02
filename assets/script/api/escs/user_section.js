import { fetchMsgErr } from "../fetch-utils";

/**
 * get escs user section
 * @param {object} q
 * @returns
 * @example
 * {
 *   SEC_ID: 1,        // number 1:qc1, 2:qc2, 3:qic
 *   SEC_NAME: "QC1",  // string
 *   SEC_STATUS: 1,    // number
 *   INCHARGE: "04014" // string
 * }
 */
export async function getEscsUserSection(q = {}) {
    const res = await fetch(`${process.env.APP_API}/escs/userSection/getSection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(q),
    });
    if (!res.ok) {
        await fetchMsgErr(res)
        throw new Error("Failed to fetch escs user section");
    }
    return res.json();
    // return getData({
    //     url: `${process.env.APP_API}/escs/userSection/getSection`,
    //     data: q,
    // });
}