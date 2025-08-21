import { fetchMsgErr } from "../errorMsg";

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
export async function searchUser(q = {}) {
    const res = await fetch(`${process.env.APP_API}/users/search/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(q),
    });
    if (!res.ok) {
        return {status: false, message: `Failed to fetch search user : ${await fetchMsgErr(res)}`};
        
    }
    return res.json();
    // return getData({
    //     url: `${process.env.APP_API}/users/search/`,
    //     data: q,
    // });
}


export async function getUser(empno) {
    const res = await fetch(`${process.env.APP_API}/users/${empno}`);
    if (!res.ok) {
        return {status: false, message: `Failed to fetch user : ${await fetchMsgErr(res)}`};
    }
    return res.json();

    // return new Promise((resolve) => {
    //     $.ajax({
    //         type: "get",
    //         url: `${process.env.APP_API}/users/${empno}`,
    //         dataType: "json",
    //         success: function (response) {
    //             resolve(response);
    //         },
    //         error: function (xhr, status, error) {
    //             console.error(
    //                 `Error fetching user data for ${empno}:`,
    //                 status,
    //                 error
    //             );
    //             resolve(null); // Return null if there's an error
    //         },
    //     });
    // });
}

export async function getUserImage(empno) {
     const res = await fetch(`${process.env.APP_API}/users/image/${empno}`);
    if (!res.ok) {
        return {status: false, message: `Failed to fetch user image : ${await fetchMsgErr(res)}`}
    }
    return res.text();

    // return new Promise((resolve) => {
    //     $.ajax({
    //         type: "get",
    //         url: `${process.env.APP_API}/users/image/${empno}`,
    //         dataType: "text",
    //         success: function (response) {
    //             resolve(response);
    //         },
    //         error: function (xhr, status, error) {
    //             console.log(
    //                 `Error fetching image for ID ${empno}: ${xhr.statusText}`
    //             );
    //             resolve(`${process.env.APP_IMG}/Avatar.png`); // Return default avatar if there's an error
    //         },
    //     });
    // });
}