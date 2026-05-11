import { fetchUtils } from "@amec/webasset/api/fetch-utils";

$(async function () {
    const data = {
        "INPUTBY": "24011",
        "REQBY": "24011",
        "empName": "ชุติพงศ์ พลานนท์",
        "empDept": "AAS SEC./IS DEPT./E/P DIV.",
        "empPos": "STAFF",
        "chkPurpose": 2

    }; /*เอามาจาก bcackend */
    /*เรียกใช้ข้อมูลทีละตัว*/
    const purpose = await getData();
    console.log(purpose);
    const Purposedata = purpose
        .map((a) => {
            const otherSelect = `<input type="text"
                            class="input input-sm input-ghost w-full rounded-none border-b border-base-300 focus:border-primary focus:bg-base-200/50 px-1"
                            id="otherSelect" name="PURPOSE_OTHER" placeholder="Please specify other purpose" disabled readeonly>`;

            return `<label class="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="PURPOSE_ID" 
                                    class="radio radio-xs rounded border-base-content [--chkbg:var(--bc)] [--chkfg:var(--b1)] req" value="${a.PURPOSE_ID}"
                                    id="purpose_${a.PURPOSE_ID}" ${a.PURPOSE_ID==data.chkPurpose ? "checked" : ""}>
                                <span>${a.PURPOSE_TH}/${a.PURPOSE_EN}</span>
                                ${a.PURPOSE_ID == 4 ? otherSelect : ""} 
                            </label>`;
        })
        .join("");

    $('#INPUTBY').val(data.INPUTBY);
    $('#REQBY').val(data.REQBY);
    $('#empName').val(data.empName);
    $('#empDept').val(data.empDept);
    $('#empPos').val(data.empPos);
    $("#purposeList").html(Purposedata);

});

async function getData() {
    return await fetchUtils({
        url: `${process.env.APP_API}/gpform/gp-rb`,
        method: "GET",
    });
}

async function getEmpData(empno) {
    return await fetchUtils({
        url: `${process.env.APP_API}/users/${empno}`,
        method: "GET",
    });
}

async function createForm(data) {
    return fetchUtils({
        url: `${process.env.APP_API}/gpform/gp-rb`,
        method: "POST",
        data: data,
    });
}