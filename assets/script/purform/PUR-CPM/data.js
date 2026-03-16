import { fetchMsgErr, fetchUtils, serializeRequestBody } from "@amec/webasset/api/fetch-utils";

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
 * @property {number} [PAYMENT_DETAIL]
 * @property {number} [ATTACH_TYPE]
 * @property {number} [ATTACH_OTHER]
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
 *      INVOICE_TYPE: "Services / Construction / Building",
 *      INVOICE_OTHER: "",      // optional
 *      THIRD_PARTY: "02035",   // optional
 *      SUBJECT: "Purchase of Software License",
 *      ACCEPT_PO: "Sub-con / Vendor",
 *      ACCEPT_SUBCON: "Details about subcontracting", // optional
 *      ACCEPT_OTHER: "",      // optional
 *      QUOTATION: "QT-2024-001",
 *      QUOTATION_DATE: "2026-01-27", // optional
 *      PONO: "PO-2024-001",
 *      TOTAL_AMOUNT: 47300.00,
 *      PO_SIGNBY: "24008",    // optional
 *      PO_SIGNDATE: "2024-01-28", // optional
 *      FORM_TYPE: "Print out Documents or E-mail",    // optional
 *      INVOICE_NO: "INV-2024-001",
 *      INVOICE_AMOUNT: 47300.00,
 *      PERSON_INCHARGE: "24008", // optional
 *      INVOICE_DATE: "2024-01-29", // optional
 *      PAYMENT_TYPE: "payment condition (If any)",
 *      PAYMENT_NUM: 1,         // optional
 *      PAYMENT: 47300.00
 *      PAYMENT_DETAIL: "...", // optional
 *      ATTACH_TYPE: P/O Confirmation,      // optional
 *      ATTACH_OTHER: "...",      // optional
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

/**
 * Get PUR-CPM form data
 * 
 * @typedef {Object} Form
 * @property {number} NFRMNO
 * @property {string} VORGNO
 * @property {string} CYEAR
 * @property {string} CYEAR2
 * @property {number} NRUNNO
 * 
 * @typedef {Object} ReturnGetData
 * @property {number} NFRMNO  1,
 * @property {string} VORGNO  "120101",
 * @property {string} CYEAR  "26",
 * @property {string} CYEAR2  "2026",
 * @property {number} NRUNNO  9,
 * @property {string} DELIVELY  "Internal AMEC",
 * @property {string} INVOICE_TYPE  "Services / Construction / Building|Other",
 * @property {string} INVOICE_OTHER  "test",
 * @property {string} SUBJECT  "test",
 * @property {string} ACCEPT_PO  "Sub-con / Vendor",
 * @property {string} ACCEPT_SUBCON  "test",
 * @property {string} ACCEPT_OTHER  null,
 * @property {string} QUOTATION  "11",
 * @property {Date}   QUOTATION_DATE  "2026-01-22T00:00:00.000Z",
 * @property {string} PONO  "t3124",
 * @property {number} TOTAL_AMOUNT  1234,
 * @property {string} PO_SIGNBY  "1214",
 * @property {Date}   PO_SIGNDATE  "2026-01-23T00:00:00.000Z",
 * @property {string} FORM_TYPE  "Print out Documents or E-mail",
 * @property {string} INVOICE_NO  "123141qwrqwqffqqwqwqwfqqfqqwqffffqqqwqqwrq",
 * @property {number} INVOICE_AMOUNT  5678,
 * @property {string} PERSON_INCHARGE  "qwqwr123124wqrqrqr",
 * @property {Date}   INVOICE_DATE  "2026-01-24T00:00:00.000Z",
 * @property {string} PAYMENT_TYPE  "Final payment condition (or 100% payment)",
 * @property {number} PAYMENT_NUM  null,
 * @property {number} PAYMENT  9999,
 * @property {string} PAYMENT_DETAIL  "121124124",
 * @property {string} ATTACH_TYPE  "Third Party Confirmation|Delivery Confirmation|Other",
 * @property {string} ATTACH_OTHER  "tqwqwe"
 * 
 * @param {Form} form 
 * @returns {Promise<ReturnGetData>}
 * @example 
 * const data = await getData({
 *      NFRMNO: 1,
 *      VORGNO: "120101",
 *      CYEAR: "26",
 *      CYEAR2: "2026",
 *      NRUNNO: 9
 * });
 */
export async function getData(form) {
     const res = await fetch(
        `${process.env.APP_API}/purform/pur-cpm/data`,
        serializeRequestBody(form)
    );
    if (!res.ok) {
        await fetchMsgErr(res);
        throw new Error("Failed to create form");
    }
    const data = await res.json();
    return data;
}

export async function getCurrency(){
    return fetchUtils({
        url: `${process.env.APP_API}/amec/brcurrency/currency`,
        method: "GET",
    });
}