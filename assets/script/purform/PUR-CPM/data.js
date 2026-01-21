import { fetchMsgErr, serializeRequestBody } from "@amec/webasset/api/fetch-utils";

/**
 * Create PUR-CPM form
 * 
 * @typedef {Object} createPurcpm
 * @property {number} NFRMNO
 * @property {string} VORGNO
 * @property {string} CYEAR
 * @property {string} REQBY
 * @property {string} INPUTBY
 * @property {string} REMARK
 * @property {string} DELIVELY
 * @property {string} INVOICE_TYPE
 * @property {string} [INVOICE_OTHER]
 * @property {string} [THIRD_PARTY]
 * @property {string} SUBJECT
 * @property {string} ACCEPT_PO
 * @property {string} [ACCEPT_SUBCON]
 * @property {string} [ACCEPT_OTHER]
 * @property {string} QUOTATION
 * @property {Date}   [QUOTATION_DATE]
 * @property {string} PONO
 * @property {number} TOTAL_AMOUNT
 * @property {string} [PO_SIGNBY]
 * @property {Date}   [PO_SIGNDATE]
 * @property {string} [FORM_TYPE]
 * @property {string} INVOICE_NO
 * @property {number} INVOICE_AMOUNT
 * @property {string} [PERSON_INCHARGE]
 * @property {Date}   [INVOICE_DATE]
 * @property {string} PAYMENT_TYPE
 * @property {number} [PAYMENT_NUM]
 * @property {number} PAYMENT
 * 
 * @param {createPurcpm} formData 
 * @returns {Promise<ReturnCreate>}
 * @example
 * const create = await create({
 *      NFRMNO: 1,
 *      VORGNO: "120101",
 *      CYEAR: "26",
 *      REQBY: "24008",
 *      INPUTBY: "24008",
 *      REMARK: "Test Create PUR-CPM",
 *      DELIVELY: "internal",
 *      INVOICE_TYPE: "service",
 *      INVOICE_OTHER: "",      // optional
 *      THIRD_PARTY: "02035",   // optional
 *      SUBJECT: "Purchase of Software License",
 *      ACCEPT_PO: "subcon",
 *      ACCEPT_SUBCON: "Details about subcontracting", // optional
 *      ACCEPT_OTHER: "",      // optional
 *      QUOTATION: "QT-2024-001",
 *      QUOTATION_DATE: "2026-01-27", // optional
 *      PONO: "PO-2024-001",
 *      TOTAL_AMOUNT: 47300.00,
 *      PO_SIGNBY: "24008",    // optional
 *      PO_SIGNDATE: "2024-01-28", // optional
 *      FORM_TYPE: "normal",    // optional
 *      INVOICE_NO: "INV-2024-001",
 *      INVOICE_AMOUNT: 47300.00,
 *      PERSON_INCHARGE: "24008", // optional
 *      INVOICE_DATE: "2024-01-29", // optional
 *      PAYMENT_TYPE: "document",
 * });
 */
export async function create(formData) {
    const res = await fetch(
        `${process.env.APP_API}/purform/pur-cpm`,
        serializeRequestBody(formData)
    );
    if (!res.ok) {
        await fetchMsgErr(res);
        throw new Error("Failed to create form");
    }
    const data = await res.json();
    return data;
}