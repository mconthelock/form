import { fetchMsgErr } from "../errorMsg";

export async function getNews() {
    const res = await fetch(`${process.env.APP_API}/gpreport/news/`);
    if (!res.ok) {
        return { status: false, message: `Failed to fetch news : ${await fetchMsgErr(res)}` };
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