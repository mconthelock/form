import { fetchMsgErr } from "../fetch-utils";

/**
 * @typedef {Object} annualFyearResponse
 * @property {number} PLANYEAR
 * @property {string} REQ_DIV
 * @property {string} SDIV
 * @property {number} USER_REQ
 * @property {number} MH
 * @property {number} COST
 * 
 * @param {number} fyear 
 * @returns {Promise<annualFyearResponse[]>}
 * @example
 * const fyear = 2025;
 * const data = await getAnnualFyear(fyear);
 */
export async function getAnnualFyear(fyear) {
    const res = await fetch(
        `${process.env.APP_API}/docinv/work-annual-dev-plan/${fyear}`
    );
    if (!res.ok) {
        await fetchMsgErr(res);
        throw new Error("Failed to fetch data");
    }
    return res.json();
}