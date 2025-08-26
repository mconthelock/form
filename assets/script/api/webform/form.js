import { fetchMsgErr } from "../errorMsg";

export async function getFormDetail(form) {
    const res = await fetch(`${process.env.APP_API}/form/getFormDetail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
    });

    if (!res.ok) {
        await fetchMsgErr(res)
        throw new Error("Failed to fetch getFormDetail");
    }

    const data = await res.json();
    return data;
}