import { fetchMsgErr } from "../fetch-utils";

/**
 * get escs items
 * @param {object} q 
 * @returns 
 * @example
 * {
    "ARM_REV": number,
}
 */
export async function getAuditMasterAll(q = {}) {
    const res = await fetch(
        `${process.env.APP_API}/escs/audit-report-master-all/getAuditReportMaster`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(q),
        }
    );
    if (!res.ok) {
        await fetchMsgErr(res);
        throw new Error("Failed to fetch escs audit master");
    }
    return res.json();
}
