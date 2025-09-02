import { fetchMsgErr } from "../fetch-utils";

/**
 * @param {object} form
 * {
 *     NFRMNO: number,
 *     VORGNO: string,
 *     CYEAR: string,
 *     CYEAR2: string,
 *     NRUNNO: number
 * }
 * @returns
 */
export async function getFormDetail(form) {
    const res = await fetch(`${process.env.APP_API}/form/getFormDetail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
    });

    if (!res.ok) {
        await fetchMsgErr(res)
        throw new Error("Failed to fetch getFormDetail");
    }

    const data = await res.json();
    return data;
}

/**
 * 
 * @param {object} form 
 * {
 *     NFRMNO: number,
 *     VORGNO: string,
 *     CYEAR: string,
 *     REQBY: string, e.g.24008
 *     INPUTBY: string, e.g.24008
 *     REMARK: string,
 *     DRAFT: string e.g. 0 == under preparation, 1 = wait for approval 
 * }
 * @returns 
 */
export async function createForm(form) {
    const res = await fetch(`${process.env.APP_API}/form/createForm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
    });

    if (!res.ok) {
        await fetchMsgErr(res)
        throw new Error("Failed to fetch createForm");
    }

    const data = await res.json();
    return data;
}

/**
 * 
 * @param {object} form 
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
export async function getMode(form){
    const res = await fetch(`${process.env.APP_API}/form/getMode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
    });

    if (!res.ok) {
        await fetchMsgErr(res)
        throw new Error("Failed to fetch getMode");
    }

    const data = await res.json();
    return data;
}

/**
 * 
 * @param {object} form 
 * {
 *     NFRMNO: number,
 *     VORGNO: string,
 *     CYEAR: string,
 *     CYEAR2: string,
 *     NRUNNO: number
 * }
 * @returns string
 */
export async function getFormno(form){
    const res = await fetch(`${process.env.APP_API}/form/getFormno`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
    });

    if (!res.ok) {
        await fetchMsgErr(res)
        throw new Error("Failed to fetch getFormno");
    }

    const data = await res.json();
    return data;
}

/**
 * 
 * @param {object} form 
 * {
 *    condition: object
 * }
 * @returns 
 */
export async function deleteFlowandForm(form){
    const res = await fetch(`${process.env.APP_API}/form/deleteForm`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
    });

    if (!res.ok) {
        await fetchMsgErr(res)
        throw new Error("Failed to fetch deleteFlowandForm");
    }

    const data = await res.json();
    return data;
}