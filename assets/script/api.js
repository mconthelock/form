import CryptoJS from "crypto-js";
import { getData } from "./public/v1.0.2/jFuntion";
export function getNews() {
  return new Promise((resolve) => {
    $.ajax({
      type: "get",
      url: `${process.env.APP_API}/gpreport/news/`,
      dataType: "json",
      success: function (response) {
        resolve(response);
      },
    });
  });
}

export function passwordLogin(data) {
  return new Promise((resolve) => {
    $.ajax({
      type: "post",
      url: `${process.env.APP_API}/auth/login/`,
      dataType: "json",
      data: data,
      //   xhrFields: {
      //     withCredentials: true,
      //   },
      success: function (response) {
        //resolve({ status: true, data: response });
        resolve(response);
      },
      error: function (xhr, status, error) {
        console.error("Login error:", status, error);
        resolve({ status: false, message: "Login failed. Please try again." });
      },
    });
  });
}

export function directlogin(empno, id) {
  const md5Hash = CryptoJS.MD5(empno).toString().toUpperCase();
  return new Promise((resolve) => {
    $.ajax({
      type: "post",
      url: `${process.env.APP_API}/auth/directlogin/`,
      dataType: "json",
      data: {
        username: md5Hash,
        appid: id,
      },
      success: function (response) {
        resolve(response);
      },
      error: function (xhr, status, error) {
        console.error("Login error:", status, error);
        resolve({ status: false, message: "Login failed. Please try again." });
      },
    });
  });
}

export function getEmployee(empno = '') {
  return new Promise((resolve) => {
    $.ajax({
      type: "get",
      url: `${process.env.APP_API}/amec/employee/${empno}`,
      dataType: "json",
      success: function (response) {
        resolve(response);
      }
    });
  });
}

// --------------- User API Functions ---------------
export function getUserImage(empno) {
    return new Promise((resolve) => {
        $.ajax({
        type: "get",
        url: `${process.env.APP_API}/users/image/${empno}`,
        dataType: "text",
        success: function (response) {
            resolve(response);
        },
        error: function (xhr, status, error) {
            console.log(`Error fetching image for ID ${empno}: ${xhr.statusText}`);
            resolve(`${process.env.APP_IMG}/Avatar.png`); // Return default avatar if there's an error
        }
        });
    });
}

export function getUser(empno) {
    return new Promise((resolve) => {
        $.ajax({
            type: "get",
            url: `${process.env.APP_API}/users/${empno}`,
            dataType: "json",
            success: function (response) {
                resolve(response);
            },
            error: function (xhr, status, error) {
                console.error(`Error fetching user data for ${empno}:`, status, error);
                resolve(null); // Return null if there's an error
            }
        });
    });
}

/**
 * search user by condition
 * @param {object} q 
 * @returns 
 * @example
 * {
 *  SEMPNO: "24008",      // string
 *  SSECCODE: "050604",   // string
 *  SDEPCODE: "050601",   // string
 *  SDIVCODE: "050101",   // string
 *  SPOSCODE: "40"        // string
 *  CSTATUS: "1"          // string
 * }
 */
export function searchUser(q = {}){
    return getData({
        url: `${process.env.APP_API}/users/search/`,
        data: q
    });
}

// --------------- User API Functions End ---------------


// --------------- ESCS API Functions ---------------
/**
 * get escs items
 * @param {object} q 
 * @returns 
 * @example
 * {
    IT_NO: "101-01",  // string
    IT_USERUPDATE: 1, // number
    IT_STATUS: 1,     // number 1:Enable, 2:Disable, 3:Delte
    SEC_ID: 1,        // number 1:qc1, 2:qc2, 3:qic
    IT_QCDATE: 1,     // number 1:Send QCDATE to AS400, 0:Not Send
    IT_MFGDATE: 0     // number 1:Send MFGDATE to AS400, 0:Not Send
}
 */
export function getEscsItems(q = {}) {
  return getData({
    url: `${process.env.APP_API}/escs/item/getItem`,
    data: q
  });
}

/**
 * get escs users
 * @param {object} q 
 * @returns 
 * @example
 * {
 *   USR_ID: 1,         // number
 *   USR_NO: "24008",   // string
 *   GRP_ID: 1,         // number 1:inspector, 2:foreman, 3:qc admin, 4:system admin, 5:leader, 6:manager, 7:viewer
 *   USR_STATUS: 1,     // number
 *   SEC_ID: 1,         // number
 *   fields: array of strings, e.g. ["USR_ID", "USR_NO", "USR_NAME", "USR_EMAIL", "USR_REGISTDATE", "USR_USERUPDATE", "USR_DATEUPDATE", "GRP_ID", "USR_STATUS", "SEC_ID", "SEMPNO", "SNAME", "SRECMAIL", "SSECCODE","SSEC", "SDEPCODE", "SDEPT", "SDIVCODE", "SDIV", "SPOSCODE", "SPOSNAME", "SPASSWORD1", "CSTATUS", "SEMPENCODE", "MEMEML", "STNAME"]
 */
export function getEscsUsers(q = {}) {
  return getData({
    url: `${process.env.APP_API}/escs/user/getUser`,
    data: q
  });
}

/**
 * get escs user section
 * @param {object} q 
 * @returns 
 * @example
 * {
 *   SEC_ID: 1,        // number 1:qc1, 2:qc2, 3:qic
 *   SEC_NAME: "QC1",  // string
 *   SEC_STATUS: 1,    // number
 *   INCHARGE: "04014" // string
 * }
 */
export function getEscsUserSection(q = {}) {
  return getData({
    url: `${process.env.APP_API}/escs/userSection/getSection`,
    data: q
  });
}

// --------------- ESCS API Functions End ---------------

// --------------- Organize API Functions ---------------

/**
 * get section 
 * @param {object} q 
 * @returns 
 * @example 
 * {
 *   fields: ["SDIVCODE", "SDIVISION", "SDIV", "SDEPCODE", "SDEPARTMENT", "SDEPT", "SSECCODE", "SSECTION", "SSEC"], // array
 *   SSECCODE: "050604", // string
 *   SDEPCODE: "050601", // string
 *   SDIVCODE: "050101"  // string
 * }
 */
export function getSection(q = {}) {
  return getData({
    url: `${process.env.APP_API}/amec/section/getSection`,
    data: q
  });
}

/**
 * get department
 * @param {object} q 
 * @returns 
 * @example 
 * {
 *   fields: ["SDIVCODE", "SDIVISION", "SDIV", "SDEPCODE", "SDEPARTMENT", "SDEPT"], // array
 *   SDEPCODE: "050601", // string
 *   SDIVCODE: "050101"  // string
 * }
 */
export function getDepartment(q = {}) {
  return getData({
    url: `${process.env.APP_API}/amec/department/getDepartment`,
    data: q
  });
}

/**
 * get division
 * @param {object} q
 * @returns
 * @example
 * {
 *    fields: ["SDIV", "SDIVISION", "SDIV"], // array
 *    SDIVCODE: "050101" // string
 * }
 */
export function getDivision(q = {}) {
  return getData({
    url: `${process.env.APP_API}/amec/division/getDivision`,
    data: q
  });
}

export function getAllSection(){
    return getData({
        type: 'get',
        url: `${process.env.APP_API}/amec/section/`,
    });
}

export function getAllDepartment(){
    return getData({
        type: 'get',
        url: `${process.env.APP_API}/amec/department/`,
    });
}

export function getAllDivision(){
    return getData({
        type: 'get',
        url: `${process.env.APP_API}/amec/division/`,
    });
}
// ------------- Organize API Functions End -------------

// --------------- Form master API Functions ---------------
export function getFormMasterAll() {
    return getData({
        type: 'get',
        url: `${process.env.APP_APITEST}/formmst/`,
    });
}

export function getFormMasterByVaname(vaname) {
    return getData({
        type: 'get',
        url: `${process.env.APP_APITEST}/formmst/${vaname}`,
    });
}

/**
 * search form master by condition
 * @param {object} q 
 * @returns 
 * @example
 * {
 *   fields: ["NNO", "VORGNO", "CYEAR", "NRUNNO", "VNAME", "VANAME", "VDESC", "DCREDATE", "CCRETIME", "VAUTHPAGE", "VFORMPAGE", "VDIR", "NLIFETIME", "CSTATUS"], // array
 *   NNO: 13, // number
 *   VORGNO: "000101", // string
 *   CYEAR: "25", // string
 *   VANAME: "QA-INS" // string
 * }
 */
export function getFormMaster(q = {}) {
    return getData({
        url: `${process.env.APP_APITEST}/formmst/getFormmst`,
        data: q
    });
}

