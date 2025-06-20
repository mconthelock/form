import { selfLocationPath } from "../jFuntion";
import { host, showLoader } from "../utils";

const date = new Date();
const seccond = date.getSeconds();
const minute = date.getMinutes();
const hour = date.getHours();
const day = date.getDay();
const month = date.getMonth();
const year = date.getFullYear();

export const mailsubject = (subject = "WebFlow System JS ERROR 😭 : ") => {
  return `${subject}${day}/${month}/${year} :: ${hour}:${minute}:${seccond}`;
};
export const mailOpt = {
  VIEW: "layouts/mail/mailAlert",
  SUBJECT: mailsubject(),
  TO: process.env.MAIL_ADMIN,
  CC: [],
  BCC: process.env.MAIL_ADMIN,
  BODY: [],
  ENFILE: [],
  PATH: selfLocationPath,
};

export const mailForm = (
  NFRMNO,
  VORGNO,
  CYEAR,
  CYEAR2,
  NRUNNO,
  header = ""
) => {
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
};
/**
 * Sends an email using the specified data.
 * @param {*} data - The data for the email.
 * @returns {Promise} - A Promise that resolves with the server response.
 */
export function sendMail(data = mailOpt) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${host}authen/sendMail/`,
      type: "post",
      dataType: "json",
      data: {
        data: data,
      },
      beforeSend: function () {
        showLoader(true);
      },
      success: function (res) {
        resolve(res);
      },
      error: function (xhr, err) {
        reject(err);
      },
      complete: function (xhr, status) {
        showLoader(false);
      },
    });
  });
}
