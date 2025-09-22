import { fetchMsgErr } from "../../api/fetch-utils";

/**
 * Get form data for QA-INS
 * @param {object} form
 * {
 *  "NFRMNO": 13,
 *  "VORGNO": "000101",
 *  "CYEAR" : "25",
 *  "CYEAR2": "2025",
 *  "NRUNNO": 1
 * }
 */
export async function getformData(form) {
    const res = await fetch(
        `${process.env.APP_API}/qaform/qa-ins/getformData`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        }
    );

    if (!res.ok) {
        await fetchMsgErr(res);
        throw new Error("Failed to get form data");
    }

    const data = await res.json();
    return data;
}

/**
 *
 * @param {object} formData
 * @returns
 */

export async function createFormQains(formData) {
    const res = await fetch(`${process.env.APP_API}/qaform/qa-ins/request`, {
        method: "POST",
        body: formData,
    });

    if (!res.ok) {
        await fetchMsgErr(res);
        throw new Error("Failed to Create");
    }

    const data = await res.json();
    return data;
}

export async function qcConfirm(formdata) {
    const res = await fetch(`${process.env.APP_API}/qaform/qa-ins/qcConfirm`, {
        method: "POST",
        body: formdata,
    });

    if (!res.ok) {
        await fetchMsgErr(res);
        throw new Error("Failed to Approve");
    }

    const data = await res.json();
    return data;
}

export async function saveMaster(data) {
    const res = await fetch(
        `${process.env.APP_API}/escs/audit-report-master/save`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        }
    );

    if (!res.ok) {
        await fetchMsgErr(res);
        throw new Error("Failed to Save Master data");
    }

    return await res.json();
}

// {
//     "NFRMNO": 13,
//     "VORGNO": "000101",
//     "CYEAR": "25",
//     "CYEAR2": "2025",
//     "NRUNNO": 1,
// }
export async function getAuditee(q = {}){
    const condition = {...q, QOA_TYPECODE: "ESO"};
    const res = await fetch(`${process.env.APP_API}/qaform/qa-ins/OA/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(condition),
    });
    if (!res.ok) {
        await fetchMsgErr(res);
        throw new Error("Failed to get Auditee");
    }
    return await res.json();
}

export async function saveAudit(data){
    const res = await fetch(`${process.env.APP_API}/qaform/qa-ins/audit/saveAudit`, {
        method: "POST",
        // headers: { "Content-Type": "application/json" },
        // body: JSON.stringify(data),
        body: data
    });
    if (!res.ok) {
        await fetchMsgErr(res);
        throw new Error("Failed to Save Audit");
    }
    return await res.json();
}
