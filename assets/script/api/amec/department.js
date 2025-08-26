import { fetchMsgErr } from "../errorMsg";

export async function getAllDepartment() {
    const res = await fetch(`${process.env.APP_API}/amec/department/`);
    if (!res.ok) {
        await fetchMsgErr(res)
        throw new Error("Failed to fetch departments");
    }
    return res.json();

    // return getData({
    //     type: "get",
    //     url: `${process.env.APP_API}/amec/department/`,
    // });
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
export async function getDepartment(q = {}) {
    const res = await fetch(
        `${process.env.APP_API}/amec/department/getDepartment`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(q),
        }
    );
    if (!res.ok) {
        await fetchMsgErr(res)
        throw new Error("Failed to fetch departments");
    }
    return res.json();
    // return getData({
    //     url: `${process.env.APP_API}/amec/department/getDepartment`,
    //     data: q,
    // });
}
