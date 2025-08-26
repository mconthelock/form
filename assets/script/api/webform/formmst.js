import { fetchMsgErr } from "../errorMsg";

export async function getFormMasterAll() {

    const res = await fetch(`${process.env.APP_API}/formmst/`);
    if (!res.ok) {
        await fetchMsgErr(res)
        throw new Error("Failed to fetch form master all");
    }
    return res.json();
    // return getData({
    //     type: "get",
    //     url: `${process.env.APP_API}/formmst/`,
    // });
}

export async function getFormMasterByVaname(vaname) {
    const res = await fetch(`${process.env.APP_API}/formmst/${vaname}`);
    if (!res.ok) {
        await fetchMsgErr(res)
        throw new Error("Failed to fetch form master by vaname");
    }
    return res.json();
    // return getData({
    //     type: "get",
    //     url: `${process.env.APP_API}/formmst/${vaname}`,
    // });
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
export async function getFormMaster(q = {}) {
    const res = await fetch(`${process.env.APP_API}/formmst/getFormmst`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(q),
    });
    if (!res.ok) {
        await fetchMsgErr(res)
        throw new Error("Failed to fetch form master");
    }
    return res.json();

    // return getData({
    //     url: `${process.env.APP_API}/formmst/getFormmst`,
    //     data: q,
    // });
}