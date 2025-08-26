import { fetchMsgErr } from "../errorMsg";

export async function getEmployee(empno = "") {
    const res = await fetch(`${process.env.APP_API}/amec/employee/${empno}`);
    if (!res.ok) {
        await fetchMsgErr(res)
        throw new Error("Failed to fetch employee");
    }
    return res.json();
    // return new Promise((resolve) => {
    //     $.ajax({
    //         type: "get",
    //         url: `${process.env.APP_API}/amec/employee/${empno}`,
    //         dataType: "json",
    //         success: function (response) {
    //             resolve(response);
    //         },
    //     });
    // });
}
