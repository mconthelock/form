import { fetchMsgErr } from "../errorMsg";

export async function showflow(form) {
    const res = await fetch(`${process.env.APP_API}/flow/showflow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
    });

    if (!res.ok) {
        return { status: false, message: `Failed to fetch flow : ${await fetchMsgErr(res)}` };
    }

    const data = await res.json();
    // if ($('#flow')) {
    //     $('#flow').html(data.html);
    // }
    return data;
}