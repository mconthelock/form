import { fetchMsgErr } from "../errorMsg";

export async function getAllDivision() {
    const res = await fetch(`${process.env.APP_API}/amec/division/`);
    if (!res.ok) {
        await fetchMsgErr(res)
        throw new Error("Failed to fetch divisions");
    }
    return res.json();
    // return getData({
    //     type: "get",
    //     url: `${process.env.APP_API}/amec/division/`,
    // });
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
export async function getDivision(q = {}) {
    const res = await fetch(
        `${process.env.APP_API}/amec/division/getDivision`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(q),
        }
    );
    if (!res.ok) {
        await fetchMsgErr(res)
        throw new Error("Failed to fetch divisions");
    }
    return res.json();
    // return getData({
    //     url: `${process.env.APP_API}/amec/division/getDivision`,
    //     data: q,
    // });
}
