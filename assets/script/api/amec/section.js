import { fetchMsgErr } from "../errorMsg";

export async function getAllSection() {
    const res = await fetch(`${process.env.APP_API}/amec/section/`);
    if (!res.ok) {
        await fetchMsgErr(res)
        throw new Error("Failed to fetch sections");
    }
    return res.json();
    // return getData({
    //     type: "get",
    //     url: `${process.env.APP_API}/amec/section/`,
    // });
}

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
export async function getSection(q = {}) {
    const res = await fetch(
        `${process.env.APP_API}/amec/section/getSection`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(q),
        }
    );
    if (!res.ok) {
        await fetchMsgErr(res)
        throw new Error("Failed to fetch sections");
    }
    return res.json();
    // return getData({
    //     url: `${process.env.APP_API}/amec/section/getSection`,
    //     data: q,
    // });
}