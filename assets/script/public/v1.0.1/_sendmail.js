/**
 * Manage Sendmail
 * @module _sendmail
 * @description This file is used to manage sendmail functionality.
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @since  2025-05-01
 * @requires jQuery npm install jquery
 * @requires jFuntion
 * @version 1.0.1
 */
import { ajaxOptions, ajaxOptionsLoad, getData, selfLocationPath } from "./jFuntion";

const date    = new Date();
const seccond = date.getSeconds();
const minute  = date.getMinutes();
const hour    = date.getHours();
const day     = date.getDay();
const month   = date.getMonth();
const year    = date.getFullYear();

export const mailsubject = (subject = 'ITAdmin System JS ERROR 😭 : ') =>{
    return `${subject}${day}/${month}/${year} :: ${hour}:${minute}:${seccond}`;
} ;
export const mailOpt = {
    view: 'layout/mail/mailAlert',
    subject: mailsubject(),
    // to: process.env.MAIL_ADMIN,
    to: 'sutthipongt@MitsubishiElevatorAsia.co.th',
    cc: [],
    bcc: 'sutthipongt@MitsubishiElevatorAsia.co.th',
    body: [],
    enfile: [],
    path: selfLocationPath,
}

export const mailForm = (NFRMNO, VORGNO, CYEAR, CYEAR2, NRUNNO, header = '') =>{
    return `<div style="font-size:20px; font-weight:bold;">${header}</div>
        <table style="border: 1px solid #333; width: 100%;"> 
            <thead style="background-color: #174cb4; color: #fff;">
                <th>Form No</th>
                <th>ORGNO</th>
                <th>CYear</th>
                <th>CYear2</th>
                <th>Run No</th>
            </thead>
            <tbody>
                <tr  style="padding: 2px 3px;">
                    <td>${NFRMNO}</td>
                    <td>${VORGNO}</td>
                    <td>${CYEAR}</td>
                    <td>${CYEAR2}</td>
                    <td>${NRUNNO}</td>
                </tr>
            </tbody>
        </table>
        `;
}
/**
 * Sends an email using the specified data.
 * @param {*} data - The data for the email.
 * @returns {Promise} - A Promise that resolves with the server response.
 */
export function sendMail(data = mailOpt) {
    return getData({
        ...ajaxOptions,
        url: `${process.env.APP_ENV}/authen/sendMail/`,
        data: { 
            data : data
        }
    });
}