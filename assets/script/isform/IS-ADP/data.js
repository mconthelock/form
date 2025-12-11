import { fetchMsgErr } from "../../api/fetch-utils";

/**
 * @typedef {Object} insertData
 * @property {number} NFRMNO
 * @property {number} VORGNO
 * @property {number} CYEAR
 * @property {planData[]} DATA
 *
 * @typedef {Object} planData
 * @property {number} PLANYEAR
 * @property {string} REQ_DIV
 * @property {number} USER_REQ
 * @property {number} DEV_PLAN
 * @property {number} MANHOUR
 * @property {number} COST
 *
 * @param {insertData} data
 * @returns
 * @example
 * const data = {
 *   NFRMNO: 12345,
 *   VORGNO: 67890,
 *   CYEAR: 2024,
 *  DATA: [
 *    { PLANYEAR: 2024, REQ_DIV: "DIV1", USER_REQ: 10, DEV_PLAN: 8, MANHOUR: 160, COST: 50000 },
 *    { PLANYEAR: 2024, REQ_DIV: "DIV2", USER_REQ: 15, DEV_PLAN: 15, MANHOUR: 300, COST: 75000 },
 *   ]
 * };
 * const result = await insertData(data);
 */
export async function insertData(body) {
    const res = await fetch(`${process.env.APP_API}/isform/is-adp/insert`, {
        method: "POST",
        // headers: { "Content-Type": "application/json" },
        // body: JSON.stringify(body),
        body: body,
    });

    if (!res.ok) {
        return {
            status: false,
            message: `Failed to insert data: ${await fetchMsgErr(res)}`,
        };
    }

    const data = await res.json();
    return data;
}


/**
 * @typedef {Object} getDataResponse
 * @property {number} NFRMNO
 * @property {string} VORGNO
 * @property {string} CYEAR
 * @property {string} CYEAR2
 * @property {number} NRUNNO
 * @property {number} PLANYEAR
 * @property {string} REQ_DIV
 * @property {number} USER_REQ
 * @property {number} DEV_PLAN
 * @property {number} MH
 * @property {number} COST
 * @property {string} SDIV
 * 
 * @typedef {Object} form
 * @property {number} NFRMNO
 * @property {string} VORGNO
 * @property {string} CYEAR
 * @property {string} CYEAR2
 * @property {number} NRUNNO
 * 
 * @param {form} body 
 * @returns {Promise<getDataResponse[]>}
 * @example
 * const form = {
 *   NFRMNO: 12345,
 *   VORGNO: "67890",
 *   CYEAR: "2024",
 *   CYEAR2: "2025",
 *   NRUNNO: 1
 * };
 * const data = await getData(form);
 */
export async function getData(body) {
    const res = await fetch(`${process.env.APP_API}/isform/is-adp/getData`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        return {
            status: false,
            message: `Failed to get data: ${await fetchMsgErr(res)}`,
        };
    }

    const data = await res.json();
    return data;
}