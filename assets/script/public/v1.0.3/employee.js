/**
 * Employee Module
 * @module employee
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @since  2025-06-26
 * @requires jQuery npm install jquery
 * @version 1.0.1
 * @version 1.0.3
 * @note 2025-07-17 เปลี่ยนชื่อ function checkEmployeeAndFocus
 */

import { showMessage } from "./jFuntion";
import { displayEmpInfo } from "./setIndexDB";

/**
 * Check if employee exists
 * @param {string} empno e.g. '24008'
 * @returns
 */
export async function checkEmployee(empno) {
    const info = await displayEmpInfo(empno);
    if(!info){
        return {status: false, data: null, message: 'Employee not found'};
    }
    return {status: true, data: info, message: 'Employee found'};
}

/**
 * Check if employee exists and focus input if not found
 * @param {object} element e.g. $('#empno') 
 * @returns
 */
export async function checkEmployeeAndFocus(element) {
    const empno = element.val();
    const checked = await checkEmployee(empno);
    if(!checked.status){
        element.val('').trigger('focus');
        showMessage(checked.message, 'warning');
    }
    return checked.status;
}

