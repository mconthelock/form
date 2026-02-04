import {
    fetchMsgErr,
    serializeRequestBody,
} from "@amec/webasset/api/fetch-utils";

/**
 * Get report IE-BGR
 * @typedef {Object} ReportIeBgrDto
 * @property {string} [FORMNO]
 * @property {string} [DEPT]
 * @property {string} [EMPNO]
 * @property {string} [FORM_STATUS]
 * @property {string} [PONO]
 * @property {string} [PRNO]
 * 
 * @typedef {Object} ReportIeBgr
 * @property {string} FORMNO
 * @property {number} NFRMNO
 * @property {string} VORGNO
 * @property {string} CYEAR
 * @property {string} CYEAR2
 * @property {number} NRUNNO
 * @property {Date}   ISSUE_DATE
 * @property {string} EMPNO
 * @property {string} RESPONSIBLE_PERSON
 * @property {string} DEPT
 * @property {string} BUDGET_YEAR
 * @property {string} INVESTMENT_SN
 * @property {number} RECIVED_BUDGET
 * @property {number} REQUEST_AMOUT
 * @property {Date}   FINDATE
 * @property {string} ITMNAME
 * @property {Date}   PPRESDATE
 * @property {string} GPBID
 * @property {string} FORM_STATUS
 * @property {Date} REQUESTER
 * @property {Date} REQ_SEM_APPDATE
 * @property {Date} REQ_DDEM_APPDATE
 * @property {Date} REQ_DEM_APPDATE
 * @property {Date} REQ_DDIM_APPDATE
 * @property {Date} REQ_DIM_APPDATE
 * @property {Date} IE_DEM_APPDATE
 * @property {Date} EP_DDIM_APPDATE
 * @property {Date} EP_DIM_APPDATE
 * @property {Date} GMFAC_APPDATE
 * @property {Date} CAT_DEM_APPDATE
 * @property {Date} RAF_DIM_APPDATE
 * @property {Date} P_APPDATE
 * @property {Date} ADMIN_APPDATE
 * @property {prpo[]} prpo
 * 
 * @typedef {Object} prpo
 * @property {string} SPRNO
 * @property {string[]} SPONO
 * 
 * @param {ReportIeBgrDto} condition 
 * @returns {Promise<ReportIeBgr[]>}
 * @example
 * const report = await getReport({
 *      FORMNO: "IE-BGR24-000037",
 *      DEPT: "IS DEPT.",
 *      EMPNO: "24008",
 *      FORM_STATUS: "2",
 *      PONO: "AMEC00421937",
 *      PRNO: "PR0001178228"
 * });
 */
export async function getReport(condition) {
    const res = await fetch(
        `${process.env.APP_API}/ieform/ie-bgr/report`,
        serializeRequestBody(condition),
    );
    if (!res.ok) {
        await fetchMsgErr(res);
        throw new Error("Failed to create form");
    }
    const data = await res.json();
    return data;
}
