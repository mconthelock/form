import { fetchMsgErr } from "../fetch-utils";


/**
 * @typedef {Object} isfileData
 * @property {number} NFRMNO
 * @property {string} VORGNO
 * @property {string} CYEAR
 * @property {string} CYEAR2
 * @property {number} NRUNNO
 * @property {number} FILE_ID
 * @property {string} FILE_ONAME
 * @property {string} FILE_FNAME
 * @property {string} FILE_USERCREATE
 * @property {date} FILE_DATECREATE
 * @property {string} FILE_USERUPDATE
 * @property {date} FILE_DATEUPDATE
 * @property {number} FILE_TYPE
 * @property {number} FILE_STATUS
 * @property {string} FILE_PATH
 * 
 * @typedef {Object} isfileCondition
 * @property {number} NFRMNO
 * @property {string} VORGNO
 * @property {string} CYEAR
 * @property {string} CYEAR2
 * @property {number} NRUNNO
 * @property {number} [FILE_ID] // optional
 *
 * @param {isfileCondition} form
 * @returns {Promise<isfileData[]>}
 * @example
 * const form = {
 *   NFRMNO: 12345,
 *   VORGNO: "67890",
 *   CYEAR: "2024",
 *   CYEAR2: "2025",
 *   NRUNNO: 1
 * }
 * const files = await getIsFile(form);
 */
export async function getIsFile(body) {
    const res = await fetch(`${process.env.APP_API}/isform/is-file/getFile`, {
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
