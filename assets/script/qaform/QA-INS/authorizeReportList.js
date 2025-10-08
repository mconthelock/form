import { getEscsItems } from "../../api/escs/item";
import { getEscsUsers } from "../../api/escs/user";
import { getUserAuthorizeView } from "../../api/escs/user_authorize";
import { setStickyColumns } from "../../public/v1.0.3/_dataTable";
import { setSelect2 } from "../../public/v1.0.3/_select2";
import { select } from "../../public/v1.0.3/component/form";
import { skeleton } from "../../public/v1.0.3/component/skeleton";

var userID = "",
    user = [],
    item = [];
$(async function () {
    userID = $(".userid").attr("userid");
    skeleton({
        idLoading: "selectSection",
    });
    // user = await getEscsUsers({
    //     USR_STATUS: 1,
    // });
    item = await getEscsItems({
        IS_STATUS: 1,
    });
    user = await getUserAuthorizeView({
        USR_STATUS: 1,
    });

    // กรองและลบตัวซ้ำของ section
    const uniqueSections = user
        .map((u) => ({
            value: u.SSECCODE,
            text: u.SSEC,
        }))
        .filter(
            (section, index, arr) =>
                arr.findIndex((s) => s.value === section.value) === index &&
                section.value != "00"
        )
        .sort((a, b) => a.text.localeCompare(b.text)); // เรียงลำดับตามชื่อ section

    $("#selectSection").replaceWith(
        select({
            id: "selectSection",
            name: "selectSection",
            data: [{ value: "0", text: "All" }, ...uniqueSections],
            placeholder: "Select section",
            class: "w-40",
        })
    );
    await setSelect2({
        element: "#selectSection",
        selectionCssClass: "w-40",
    });
    $("#selectSection").val("0").trigger("change");

    await createReportTable();
    setStickyColumns($("#tableReport"));

});

async function createReportTable(section = "0") {
    const allItem = item.map((i) => i.IT_NO);
    const secName =
        section == "0"
            ? "All Sections"
            : user.find((u) => u.SSECCODE == section)?.SSEC || "";

    const data = user.filter((d, index) => {
        if (section == "0") return d;
        if (d.SSECCODE == section) {
            return d;
        }
    });
    let html = `<div class="text-2xl font-bold mb-3 text-primary">New: Quality built in line (Section)</div>
    <div class="max-h-[70vh] overflow-auto border">
        <table class="table table-zebra dataTable" id="tableReport">
            <thead>
                <tr class="border border-black">
                    <th colspan="10" class="text-xl font-bold sticky left-0 no-border">List quality built in line : ${secName}</th>
                </tr>
                <tr class="bg-white">
                    <th rowspan="2" class="text-center sticky-column">No</th>
                    <th rowspan="2" class="text-center sticky-column">Empno</th>
                    <th rowspan="2" class="text-center sticky-column">Name</th>
                    <th rowspan="2" class="text-center sticky-column">Position</th>
                    <th colspan="${item.length}" class="text-center">Item</th>
                </tr>
                <tr>
                    ${item
                        .map(
                            (i) =>
                                `<th class="text-center text-nowrap">${i.IT_NO}</th>`
                        )
                        .join("")}
                </tr>
            </thead>
            <tbody>
                ${data.map((d, index) => {
                    let checkedItems = "";
                    allItem.forEach((it) => {
                        if(d.IT_NO && d.IT_NO.includes(it)){
                            checkedItems += `<td class="text-center">✓</td>`;
                        }else{
                            checkedItems += `<td class="text-center"></td>`;
                        }
                    });
                    let html = `<tr>
                        <td class="text-center sticky-column">${index + 1}</td>
                        <td class="text-center sticky-column">${d.USR_NO || ""}</td>
                        <td class="text-left sticky-column">${d.USR_NAME || ""}</td>
                        <td class="text-left sticky-column">${d.SPOSITION || ""}</td>
                        ${checkedItems}
                    </tr>`
                    return html;
                })}
            </tbody>
        </table>
    </div>`;
    $("#reportList").html(html);
}
