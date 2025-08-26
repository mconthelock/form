import { fetchMsgErr } from "../errorMsg";

export async function getNews() {
    const res = await fetch(`${process.env.APP_API}/gpreport/news/`);
    if (!res.ok) {
        await fetchMsgErr(res)
        throw new Error("Failed to fetch news");
    }
    return res.json();
    // return new Promise((resolve) => {
    //     $.ajax({
    //         type: "get",
    //         url: `${process.env.APP_API}/gpreport/news/`,
    //         dataType: "json",
    //         success: function (response) {
    //             resolve(response);
    //         },
    //     });
    // });
}