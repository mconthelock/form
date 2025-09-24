import { fetchMsgErr } from "../fetch-utils";

/**
 * get escs items
 * @param {object} q 
 * @returns 
 * @example
 * {
    "ARR_REV": number,
    "ARR_REV_TEXT": string,
    "ARR_INCHARGE": number
}
 */
export async function getAuditRevision(q = {}) {
    const res = await fetch(
        `${process.env.APP_API}/escs/audit-report-revision/getAuditReportRevision`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(q),
        }
    );
    if (!res.ok) {
        await fetchMsgErr(res);
        throw new Error("Failed to fetch escs audit revision");
    }
    return res.json();
}
