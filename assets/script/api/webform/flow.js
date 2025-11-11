import { fetchMsgErr, serializeRequestBody } from "../fetch-utils";

/**
 * Show Flow
 * @typedef {object} showflow
 * @property {number} NFRMNO
 * @property {string} VORGNO
 * @property {string} CYEAR
 * @property {string} CYEAR2
 * @property {number} NRUNNO
 * @property {boolean} [showStep] default false
 *
 * @typedef {object} showflowResponse
 * @property {boolean} status true = success, false = failed
 * @property {string} html html flow
 * @property {flowTree} data
 *
 * @typedef {object} flowTree
 * @property {number} LEVEL
 * @property {string} CSTEPNO
 * @property {string} CSTEPNEXTNO
 * @property {string} CSTEPST
 * @property {string} VAPVNO
 * @property {number} NFRMNO
 * @property {string} VORGNO
 * @property {string} CYEAR
 * @property {string} CYEAR2
 * @property {number} NRUNNO
 * @property {string} SNAME
 * @property {string} VNAME
 * @property {date}   DAPVDATE
 * @property {string} CAPVTIME
 * @property {string} VREMARK
 * @property {string} VREPNO
 * @property {string} VREALAPV
 *
 * @param {showflow} form
 * @returns {Promise<showflowResponse>}
 * @example
 * const form = {
 *      NFRMNO: 13,
 *      VORGNO: '030101',
 *      CYEAR: '25',
 *      CYEAR2: '2025',
 *      NRUNNO: 1,
 *      showStep: true // default false (optional)
 * };
 * const flow = await showflow(form);
 */
export async function showflow(form) {
    const res = await fetch(`${process.env.APP_API}/flow/showflow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
    });

    if (!res.ok) {
        return {
            status: false,
            message: `Failed to fetch flow : ${await fetchMsgErr(res)}`,
        };
    }

    const data = await res.json();
    return data;
}

/**
 * Doaction Flow
 * @param {doaction} formData
 *
 * @typedef {object} doaction
 * @property {number} NFRMNO
 * @property {string} VORGNO
 * @property {string} CYEAR
 * @property {string} CYEAR2
 * @property {number} NRUNNO
 * @property {string} ACTION - e.g. approve || return || returnb || returnp || returnE || reject
 * @property {string} EMPNO
 * @property {string} [REMARK]
 * @property {string} [CEXTDATA]
 * @description 
 * - return คือส่งกลับไป requester เมื่อ requester กด approve จะกลับมาอยู่ที่ approver คนเดิม
 * - returnb คือส่งกลับไป approver ก่อนหน้า
 * - returnp คือส่งกลับไป requester และรีเซ็ท flow ทั้งหมดเริ่ม approve ใหม่
 * - returnE คือส่งกลับไป approver ที่ระบุในช่อง CEXTDATA ใน flow step นั้นๆ และดำเนินการ approve ต่อจากที่กำหนด ** จำเป็นต้องส่ง CEXTDATA มาด้วย **
 *
 * @typedef {object} doactionResponse
 * @property {boolean} status true = success, false = failed
 * @property {string} message message response
 *
 * @returns {Promise<doactionResponse>}
 * @example
 * const formData = {
 *     NFRMNO: 13,
 *     VORGNO: '030101',
 *     CYEAR: '25',
 *     CYEAR2: '2025',
 *     NRUNNO: 1,
 *     ACTION: 'approve',
 *     EMPNO: 'E123',
 *     REMARK: 'Approved' // optional
 * };
 * const res = await doaction(formData);
 */
export async function doaction(formData) {
    const res = await fetch(
        `${process.env.APP_API}/flow/doaction`,
        serializeRequestBody(formData)
    );

    if (!res.ok) {
        await fetchMsgErr(res);
        throw new Error("Failed to fetch flow");
    }

    const data = await res.json();
    return data;
}

/**
 * Get Ext Data
 * @param {getExtData} formData
 *
 * @typedef {object} getExtData
 * @property {number} NFRMNO
 * @property {string} VORGNO
 * @property {string} CYEAR
 * @property {string} CYEAR2
 * @property {number} NRUNNO
 * @property {string} EMPNO
 *
 * @returns {Promise<string>}
 * @example
 * const formData = {
 *     NFRMNO: 13,
 *     VORGNO: '030101',
 *     CYEAR: '25',
 *     CYEAR2: '2025',
 *     NRUNNO: 1,
 *     EMPNO: "24008"
 * };
 * const extData = await getExtData(formData);
 */
export async function getExtData(formData) {
    const res = await fetch(`${process.env.APP_API}/flow/getExtData`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
    });

    if (!res.ok) {
        await fetchMsgErr(res);
        throw new Error("Failed to fetch getExtData");
    }

    const data = await res.json();
    return data;
}

/**
 * Check Return
 * @param {checkReturn} formData
 *
 * @typedef {object} checkReturn
 * @property {number} NFRMNO
 * @property {string} VORGNO
 * @property {string} CYEAR
 * @property {string} CYEAR2
 * @property {number} NRUNNO
 * @property {string} EMPNO
 *
 * @example
 * const formData = {
 *     NFRMNO: 13,
 *     VORGNO: '030101',
 *     CYEAR: '25',
 *     CYEAR2: '2025',
 *     NRUNNO: 1,
 *     EMPNO: "24008"
 * };
 * const return = await checkReturn(formData);
 * @returns {Promise<boolean>}
 */
export async function checkReturn(formData) {
    const res = await fetch(`${process.env.APP_API}/flow/checkReturn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
    });

    if (!res.ok) {
        await fetchMsgErr(res);
        throw new Error("Failed to fetch check Return");
    }

    const data = await res.json();
    return data;
}

/**
 * Check Return Back
 * @param {checkReturnb} formData
 *
 * @typedef {object} checkReturnb
 * @property {number} NFRMNO
 * @property {string} VORGNO
 * @property {string} CYEAR
 * @property {string} CYEAR2
 * @property {number} NRUNNO
 * @property {string} EMPNO
 *
 * @example
 * const formData = {
 *     NFRMNO: 13,
 *     VORGNO: '030101',
 *     CYEAR: '25',
 *     CYEAR2: '2025',
 *     NRUNNO: 1,
 *     EMPNO: "24008"
 * };
 * const return = await checkReturn(formData);
 * @returns {Promise<boolean>}
 */
export async function checkReturnb(formData) {
    const res = await fetch(`${process.env.APP_API}/flow/checkReturnb`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
    });

    if (!res.ok) {
        await fetchMsgErr(res);
        throw new Error("Failed to fetch check Return back");
    }

    const data = await res.json();
    return data;
}

/**
 * update flow
 * @param {updateFlow} formData
 *
 * @typedef {object} updateFlow
 * @property {condition} condition
 * @property {number} [NFRMNO]
 * @property {string} [VORGNO]
 * @property {string} [CYEAR]
 * @property {string} [CYEAR2]
 * @property {number} [NRUNNO]
 * @property {string} [CSTEPNO]
 * @property {string} [CSTEPNEXTNO]
 * @property {string} [CSTEPST]
 * @property {string} [CTYPE]
 * @property {string} [VPOSNO]
 * @property {string} [VAPVNO]
 * @property {string} [VREPNO]
 * @property {string} [VREALAPV]
 * @property {string} [CAPVSTNO]
 * @property {Date}   [DAPVDATE]
 * @property {string} [CAPVTIME]
 * @property {string} [CEXTDATA]
 * @property {string} [CAPVTYPE]
 * @property {string} [CREJTYPE]
 * @property {string} [CAPPLYALL]
 * @property {string} [VURL]
 * @property {string} [VREMARK]
 * @property {string} [VREMOTE]
 *
 * @typedef {object} condition
 * @property {number} NFRMNO
 * @property {string} VORGNO
 * @property {string} CYEAR
 * @property {string} CYEAR2
 * @property {number} NRUNNO
 * @property {string} [CSTEPNO]
 * @property {string} [CSTEPNEXTNO]
 * @property {string} [CSTEPST]
 * @property {string} [CTYPE]
 * @property {string} [VPOSNO]
 * @property {string} [VAPVNO]
 * @property {string} [VREPNO]
 * @property {string} [VREALAPV]
 * @property {string} [CAPVSTNO]
 * @property {Date}   [DAPVDATE]
 * @property {string} [CAPVTIME]
 * @property {string} [CEXTDATA]
 * @property {string} [CAPVTYPE]
 * @property {string} [CREJTYPE]
 * @property {string} [CAPPLYALL]
 * @property {string} [VURL]
 * @property {string} [VREMARK]
 * @property {string} [VREMOTE]
 *
 * @returns {Promise<boolean>}
 * @example
 * const formData = {
 *     condition: {
 *         NFRMNO: 13,
 *         VORGNO: '030101',
 *         CYEAR: '25',
 *         CYEAR2: '2025',
 *         NRUNNO: 1,
 *         CSTEPNO: '07'
 *     },
 *     CSTEPNEXTNO: '10'
 * };
 * const update = await updateFlow(formData);
 */

export async function updateFlow(formData) {
    const res = await fetch(`${process.env.APP_API}/flow/updateFlow`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
    });

    if (!res.ok) {
        await fetchMsgErr(res);
        throw new Error("Failed to fetch update Flow");
    }

    const data = await res.json();
    return data;
}
