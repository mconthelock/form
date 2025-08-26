import { fetchMsgErr } from "../../api/errorMsg";

/**
 * Get form data for QA-INS
 * @param {object} form
 * {
 *  "NFRMNO": 13,
 *  "VORGNO": "000101",
 *  "CYEAR" : "25",
 *  "CYEAR2": "2025",
 *  "NRUNNO": 1
 * }
 */
export function getformData(form) {
    return new Promise((resolve) => {
        $.ajax({
            type: "post",
            // url: `${process.env.APP_API}/qaform/qa-ins/getformData`,
            url: `${process.env.APP_API}/qaform/qa-ins/getformData`,
            dataType: "json",
            data: form,
            success: function (response) {
                resolve(response);
            },
            error: function (xhr, status, error) {
                console.error("getformData error:", status, error);
                resolve({
                    status: false,
                    message: "getformData failed. Please try again.",
                });
            },
        });
    });
}

/**
 *
 * @param {object} formData
 * @returns
 */

export function createFormQains(formData) {
    return new Promise((resolve) => {
        $.ajax({
            type: "post",
            // url: `${process.env.APP_API}/qaform/qa-ins/request``,
            url: `${process.env.APP_API}/qaform/qa-ins/request`,
            dataType: "json",
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                resolve(response);
            },
            error: function (xhr, status, error) {
                console.error("create failed:", status, error);
                resolve({
                    status: false,
                    message: "Create failed. Please try again.",
                });
            },
        });
    });
}

export async function qcConfirm(formdata) {
    const res = await fetch(`${process.env.APP_API}/qaform/qa-ins/qcConfirm`, {
        method: "POST",
        body: formdata,
    });

    if (!res.ok) {
        return {
            status: false,
            message: `Failed to confirm : ${await fetchMsgErr(res)}`,
        };
    }

    const data = await res.json();
    return data;
}
