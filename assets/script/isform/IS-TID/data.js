import { fetchUtils } from "@amec/webasset/api/fetch-utils";

/**
 * @typedef {Object} ITGC_SPECIALUSER
 * @property {string} SERVER_NAME
 * @property {string} USER_DOMAIN
 * @property {string} USER_LOGIN
 * @property {string} USER_OWNER
 * @property {string} DESCRIPT
 * @property {string} AUTH_CLASS
 * @property {string} CATEGORY
 * @property {string} AUTH_OGANIZE
 * @property {string} USER_TYPE1
 * @property {string} USER_TYPE2
 * @property {string} SERVER_TITLE
 * @property {number} USER_STATUS
 * @property {string} EMPNO
 * @property {string} ROLE
 * @property {Date}   START_DATE
 * @property {number} ACTIVE_STATUS
 * @property {string} GROUP_NAME
 * 
 * @typedef {Object} FormDto
 * @property {number} NFRMNO
 * @property {string} VORGNO
 * @property {string} CYEAR
 * @property {string} CYEAR2
 * @property {number} NRUNNO
 * 
 * @typedef {Object} ISTID_FORM
 * @property {number} NFRMNO
 * @property {string} VORGNO
 * @property {string} CYEAR
 * @property {string} CYEAR2
 * @property {number} NRUNNO
 * @property {string} TID_REQUESTER
 * @property {string} TID_REQNO
 * @property {Date}   TID_REQ_DATE
 * @property {string} TID_TIMESTART
 * @property {string} TID_TIMEEND
 * @property {string} TID_SERVERNAME
 * @property {string} TID_USERLOGIN
 * @property {string} TID_CONTROLLER
 * @property {string} TID_WORKCONTENT
 * @property {string} TID_REASON
 * @property {Date}   TID_COMP_DATE
 * @property {string} TID_COMP_TIME
 * @property {Date}   TID_DISABLE_DATE
 * @property {string} TID_DISABLE_TIME
 * @property {number} TID_CHANGEDATA
 * @property {number} TID_FORMTYPE
 * @property {Date}   TID_CREATEDATE
 * @property {number} TID_LATE
 * 
 * @typedef {Object} IsTidUserData
 * @property {string} TID_REQUESTER
 * @property {string} [TID_REQNO]
 * @property {Date}   TID_REQ_DATE
 * @property {string} TID_TIMESTART
 * @property {string} TID_TIMEEND
 * @property {string} TID_SERVERNAME
 * @property {string} TID_USERLOGIN
 * @property {string} [TID_CONTROLLER]
 * @property {string} TID_WORKCONTENT
 * @property {string} [TID_REASON]
 * @property {number} TID_CHANGEDATA
 * @property {number} TID_FORMTYPE
 * @property {number} TID_LATE
 * 
 * @typedef {Object} IsTidControllerData
 * @property {string} TID_REQUESTER
 * @property {Date}   TID_REQ_DATE
 * @property {string} TID_TIMESTART
 * @property {string} TID_TIMEEND
 * @property {string} TID_SERVERNAME
 * @property {string} TID_USERLOGIN
 * @property {string} TID_WORKCONTENT
 * @property {number} TID_CHANGEDATA
 * @property {number} TID_FORMTYPE
 * @property {number} TID_LATE
 * 
 * @typedef {Object} CreateIsTidFormDto
 * @property {number} NFRMNO
 * @property {string} VORGNO
 * @property {string} CYEAR
 * @property {string} REQBY
 * @property {string} INPUTBY
 * @property {string} REMARK
 * @property {IsTidUserData} USERDATA
 * @property {IsTidControllerData} [CONTROLLERDATA]
 * @property {number} FORMTYPE
 * @property {number} CHANGEDATA
 * 
 * @typedef {Object} UpdateIsTidDto
 * @property {number} NFRMNO
 * @property {string} VORGNO
 * @property {string} CYEAR
 * @property {string} CYEAR2
 * @property {number} NRUNNO
 * @property {string} TID_REQUESTER
 * @property {string} [TID_REQNO]
 * @property {Date}   TID_REQ_DATE
 * @property {string} TID_TIMESTART
 * @property {string} TID_TIMEEND
 * @property {string} TID_SERVERNAME
 * @property {string} TID_USERLOGIN
 * @property {string} [TID_CONTROLLER]
 * @property {string} TID_WORKCONTENT
 * @property {string} [TID_REASON]
 * @property {number} TID_CHANGEDATA
 * @property {number} TID_FORMTYPE
 * @property {number} TID_LATE
 * @property {Date}   [TID_COMP_DATE]
 * @property {string} [TID_COMP_TIME]
 * @property {Date}   [TID_DISABLE_DATE]
 * @property {string} [TID_DISABLE_TIME]
 * 
 * @typedef {Object} ActionIsTidDto
 * @property {number} NFRMNO
 * @property {string} VORGNO
 * @property {string} CYEAR
 * @property {string} CYEAR2
 * @property {number} NRUNNO
 * @property {string} EMPNO
 * @property {string} ACTION
 * @property {string} REMARK
 * @property {UpdateIsTidDto} data
 */

/**
 * Get user login information
 * @author Sutthipong Tangmonkhoncharoen(24008)
 * @since 2026-04-08
 * @returns {Promise<ITGC_SPECIALUSER[]>}
 * @example 
 * const data = await getUserLogin();
 */
export async function getUserLogin() {
    return await fetchUtils({
        url: `${process.env.APP_API}/itgc/specialuser/getUserLogin`,
        method: "GET",
    });
}

/**
 * Get controller information
 * @author Sutthipong Tangmonkhoncharoen(24008)
 * @since 2026-04-08
 * @returns {Promise<ITGC_SPECIALUSER[]>}
 * @example
 * const data = await getController();
 */
export async function getController() {
    return await fetchUtils({
        url: `${process.env.APP_API}/itgc/specialuser/getController`,
        method: "GET",
    });
}


/**
 * Get server name information
 * @author Sutthipong Tangmonkhoncharoen(24008)
 * @since 2026-04-08
 * @returns {Promise<{SERVER_NAME: string}[]>}
 * @example
 * const data = await getServerName();
 */
export async function getServerName() {
    return await fetchUtils({
        url: `${process.env.APP_API}/itgc/specialuser/getServerName`,
        method: "GET",
    });
}

/**
 * Create TID form
 * @author Sutthipong Tangmonkhoncharoen(24008)
 * @since 2026-04-08
 * @param {CreateIsTidFormDto} data 
 * 
 * @typedef {Object} ReturnCreateIsTid
 * @property {boolean} status
 * @property {string} message
 * @returns {Promise<ReturnCreateIsTid>}
 */
export async function createTid(data) {
    return await fetchUtils({
        url: `${process.env.APP_API}/isform/is-tid`,
        method: "POST",
        data,
    });
}

/**
 * Action TID form approve, reject, cancel
 * @author Sutthipong Tangmonkhoncharoen(24008)
 * @since 2026-04-08
 * @param {ActionIsTidDto} data 
 * @typedef {Object} ReturnActionIsTid
 * @property {boolean} status
 * @property {string} message
 * @returns {Promise<ReturnActionIsTid>}
 */
export async function actionTid(data) {
    return await fetchUtils({
        url: `${process.env.APP_API}/isform/is-tid`,
        method: "PATCH",
        data,
    });
}

/**
 * Get form data
 * @author Sutthipong Tangmonkhoncharoen(24008)
 * @since 2026-04-08
 * @param {FormDto} form 
 * 
 * @typedef {Object} ReturnFindOneIsTid
 * @property {boolean} status
 * @property {string} message
 * @property {ISTID_FORM} data
 * @returns {Promise<ReturnFindOneIsTid>}
 * @example
 * const data = await getFormData({
 *      NFRMNO: 1,
 *      VORGNO: "120101",
 *      CYEAR: "26",
 *      CYEAR2: "2026",
 *      NRUNNO: 9
 * });
 */
export async function getFormData(form) {
    return await fetchUtils({
        url: `${process.env.APP_API}/isform/is-tid/getFormData`,
        method: "POST",
        data: form,
    });
}
