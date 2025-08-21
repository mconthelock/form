import { fetchMsgErr } from "../errorMsg";

/**
 * get escs items
 * @param {object} q 
 * @returns 
 * @example
 * {
    IT_NO: "101-01",  // string
    IT_USERUPDATE: 1, // number
    IT_STATUS: 1,     // number 1:Enable, 2:Disable, 3:Delte
    SEC_ID: 1,        // number 1:qc1, 2:qc2, 3:qic
    IT_QCDATE: 1,     // number 1:Send QCDATE to AS400, 0:Not Send
    IT_MFGDATE: 0     // number 1:Send MFGDATE to AS400, 0:Not Send
}
 */
export async function getEscsItems(q = {}) {
    const res = await fetch(`${process.env.APP_API}/escs/item/getItem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(q),
    });
    if (!res.ok) {
        return {
            status: false,
            message: `Failed to fetch escs items : ${await fetchMsgErr(res)}`,
        };
    }
    return res.json();
    // return getData({
    //     url: `${process.env.APP_API}/escs/item/getItem`,
    //     data: q,
    // });
}
