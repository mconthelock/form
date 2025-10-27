import { getEscsItems } from "../../api/escs/item";
import { getEscsUsers } from "../../api/escs/user";
import { getUserAuthorizeView } from "../../api/escs/user_authorize";
import { setStickyColumns } from "@public/_dataTable";
import { setSelect2 } from "@public/_select2";
import { select } from "@public/component/form";
import { skeleton, skeletons } from "@public/component/skeleton";
import { showErrorMessage } from "@public/jFuntion";
import { setMedalReportList } from "./template";

var userID = "",
    user = [],
    item = [],
    authData = [];
$(async function () {
    try {
        userID = $(".userid").attr("userid");
        skeleton({
            idLoading: "selectSection",
        });
        skeletonTable();
        user = await getEscsUsers({
            USR_STATUS: 1,
        });
        item = await getEscsItems({
            IS_STATUS: 1,
        });

        const auth = await getUserAuthorizeView({
            USR_STATUS: 1,
        });
        user = await user.filter((u) => {
            if (
                ![3, 4, 6, 7].includes(u.GRP_ID) &&
                auth.find((a) => a.USR_NO == u.USR_NO && a.IT_NO)
            )
                return u;
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

        await setTable("0");
    } catch (err) {
        console.log(err);
        showErrorMessage(err.message || err);
    }
});

function skeletonTable() {
    skeletons({
        idLoading: "reportList",
        pattern: [
            { width: "w-96", height: "h-11" },
            { width: "w-full", height: "h-[70vh]" },
        ],
        count: 2,
    });
}

async function setTable(section) {
    try {
        skeletonTable();
        const { data, allItem, secName } = await getDataAuthorize(section);
        authData = data;
        await createReportTable(data, allItem, secName);
        setStickyColumns($("#tableReport"));
    } catch (err) {
        console.log(err);
        showErrorMessage(err.message || err);
    }
}

async function getDataAuthorize(section = "0") {
    const condition =
        section == "0"
            ? { USR_STATUS: 1 }
            : { USR_STATUS: 1, SSECCODE: section };
    const auth = await getUserAuthorizeView(condition);
    const allItem = item.map((i) => i.IT_NO);
    const secName =
        section == "0"
            ? "All Sections"
            : user.find((u) => u.SSECCODE == section)?.SSEC || "";

    const data = user
        .filter((d, index) => {
            if (section == "0") return d;
            if (d.SSECCODE == section) {
                return d;
            }
        })
        .map((u) => {
            u.auth = auth.filter((a) => a.USR_NO == u.USR_NO);
            return u;
        });
    return { data, allItem, secName };
}

async function createReportTable(data, allItem, secName) {
    let html = `<div class="text-2xl font-bold mb-3 text-primary">New: Quality built in line (Section) : ${secName}</div>
    <div class="max-h-[70vh] overflow-auto border border-gray-400 rounded-sm">
        <table class="table table-zebra dataTable border-spacing-0 border-separate text-xs" id="tableReport">
            <thead class="sticky top-0 z-20">
                <tr class="bg-[#bdd7ee]">
                    <th rowspan="2" class="text-center sticky-column">No</th>
                    <th rowspan="2" class="text-center sticky-column">Empno</th>
                    <th rowspan="2" class="text-center sticky-column">Name</th>
                    <th rowspan="2" class="text-center sticky-column border-r-1 border-gray-400">Position</th>
                    <th colspan="${
                        allItem.length
                    }" class="text-center">Item</th>
                </tr>
                <tr class="bg-[#bdd7ee]">
                    ${allItem
                        .map(
                            (i) =>
                                `<th class="text-center text-nowrap border-r-1 border-gray-400">${i}</th>`
                        )
                        .join("")}
                </tr>
            </thead>
            <tbody>
                ${data
                    .map((d, index) => {
                        let checkedItems = "";
                        allItem.forEach((it) => {
                            const itemAuth = d.auth.filter(
                                (a) => a.IT_NO == it
                            );
                            if (itemAuth.length > 0) {
                                const item = itemAuth.find(
                                    (a) => a.STATION_NO == 0
                                );
                                // แปลงปีเป็น 2 หลัก
                                let yearText = "",
                                    medal = "";

                                if (item.TEST_DATE) {
                                    const year = new Date(
                                        item.TEST_DATE
                                    ).getFullYear();
                                    yearText = year.toString().slice(-2); // เอา 2 หลักสุดท้าย
                                    medal = setMedalReportList(
                                        item.PERCENT,
                                        yearText
                                    );
                                }
                                checkedItems += `<td class="text-center border-r-1 border-gray-400 showScore cursor-pointer" item="${it}">${
                                    medal
                                        ? medal
                                        : '<i class="icofont-check-circled text-success text-xl"></i>'
                                }</td>`;
                            } else {
                                checkedItems += `<td class="text-center border-r-1 border-gray-400"></td>`;
                            }
                        });
                        let html = `<tr>
                        <td class="text-center text-nowrap sticky-column">${
                            index + 1
                        }</td>
                        <td class="text-center text-nowrap sticky-column">${
                            d.USR_NO || ""
                        }</td>
                        <td class="text-left text-nowrap sticky-column">${
                            d.USR_NAME || ""
                        }</td>
                        <td class="text-left text-nowrap sticky-column border-r-1 border-gray-400">${
                            d.SPOSITION || ""
                        }</td>
                        ${checkedItems}
                    </tr>`;
                        return html;
                    })
                    .join("")}
            </tbody>
        </table>
    </div>`;
    $("#reportList").html(html);
}

$(document).on("change", "#selectSection", async function () {
    const section = $(this).val();
    await setTable(section);
});

$(document).on("click", ".showScore", function () {
    const rowIndex = $(this).closest("tr").index();
    const userData = authData[rowIndex];
    const itemNo = $(this).attr("item");
    const scoreList = userData?.auth
        .filter((u) => u.IT_NO == itemNo)
        .map((a) => {
            return `<tr>
                <td class="text-left">${
                    a.STATION_NO == 0
                        ? "MASTER"
                        : a?.STATION.ITS_STATION_NAME || "-"
                }</td>
                <td class="text-center">${a.GRADE != 'C' ? '<i class="icofont-check-circled text-success text-xl"></i>': '<i class="icofont-close-circled text-error text-xl"></i>'}</td>
                <td class="text-center">${a.SCORE ?? "-"}</td>
                <td class="text-center">${a.GRADE ?? "-"}</td>
            </tr>`;
        })
        .join("");
    const html = `<table class="table table-zebra w-full" id="tableScoreboard">
        <thead>
            <tr class="bg-[#bdd7ee]">
                <th class="text-center">Station</th>
                <th class="text-center">Result</th>
                <th class="text-center">Score</th>
                <th class="text-center">Grade</th>
            </tr>
        </thead>
        <tbody>
            ${scoreList}
        </tbody>
    </table>`;
    $("#itemNo").text(itemNo);
    $("#fullName").text(`${userData?.SEMPPRE || ""} ${userData?.SNAME || ""}`);
    $("#tableScoreboard").html(html);
    $("#scoreBoard").prop("checked", true);
});

$(document).on('select2:clear', '#selectSection', async function () {
    $('#selectSection').val('0').trigger('change');
    setTimeout(() => $('#selectSection').select2('close'), 100); 
    await setTable('0');
});