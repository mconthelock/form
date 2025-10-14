import { fetchMsgErr } from "../fetch-utils";

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
        await fetchMsgErr(res)
        throw new Error("Failed to fetch search user");
    }
    return res.json();
}


export async function getUser(empno) {
    const res = await fetch(`${process.env.APP_API}/users/${empno}`);
    if (!res.ok) {
        await fetchMsgErr(res)
        throw new Error("Failed to fetch user");
    }
    return res.json();
}

export async function getUserImage(empno) {
     const res = await fetch(`${process.env.APP_API}/users/image/${empno}`);
    if (!res.ok) {
        await fetchMsgErr(res)
        throw new Error("Failed to fetch user image");
    }
    return res.text();
}