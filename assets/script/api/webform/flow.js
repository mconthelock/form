import { fetchMsgErr, serializeRequestBody } from "../fetch-utils";

/**
 * Show Flow
 * @typedef {object} showflow
 * @property {number} NFRMNO
 * @property {string} VORGNO
 * @property {string} CYEAR
 * @property {string} CYEAR2
 * @property {number} NRUNNO
 * @property {boolean} showStep default false
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
    // if ($('#flow')) {
    //     $('#flow').html(data.html);
    // }
    return data;
}

/**
 *
 * @param {object} formData
 * {
 *     NFRMNO: number,
 *     VORGNO: string,
 *     CYEAR: string,
 *     CYEAR2: string,
 *     NRUNNO: number,
 *     ACTION: string, e.g. approve || return || returnb || returnp || reject
 *     EMPNO: string,
 *     REMARK: string
 * }
 * @returns
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
 *
 * @param {object} formData
 * {
 *     NFRMNO: number,
 *     VORGNO: string,
 *     CYEAR: string,
 *     CYEAR2: string,
 *     NRUNNO: number,
 *     EMPNO: string
 * }
 * @returns
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
 *
 * @param {object} formData
 *  {
 *     NFRMNO: number,
 *     VORGNO: string,
 *     CYEAR: string,
 *     CYEAR2: string,
 *     NRUNNO: number,
 *     EMPNO: string
 * }
 * @returns boolean
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
 *
 * @param {object} formData
 *  {
 *     NFRMNO: number,
 *     VORGNO: string,
 *     CYEAR: string,
 *     CYEAR2: string,
 *     NRUNNO: number,
 *     EMPNO: string
 * }
 * @returns boolean
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
 * @param {object} formData
 * {
 *    condition: object
 *    **column ที่จะทำการ update ในตาราง flow**
 * }
 * @returns
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
