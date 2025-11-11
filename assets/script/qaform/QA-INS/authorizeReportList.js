import { getEscsItems } from "../../api/escs/item";
import { getEscsUsers } from "../../api/escs/user";
import { getUserAuthorizeView } from "../../api/escs/user_authorize";
import { setStickyColumns } from "@public/_dataTable";
import { setSelect2 } from "@public/_select2";
import { select } from "@public/component/form";
import { skeleton, skeletons } from "@public/component/skeleton";
import { showErrorMessage } from "@public/jFuntion";
import { setMedalReportList } from "./template";
import { defaultExcel, exportExcel, mergeCell, border } from "@public/_excel";

var userID = "",
    user = [],
    item = [],
    authData = [],
    dataExcel = [],
    flagFilter = false;

// prettier-ignore
$(async function () {
    try {
        userID = $(".userid").attr("userid"); // รับค่า user id จาก php
        skeleton({idLoading: "selectSection"}); // Set skeleton for section select
        skeletonTable(); // Set skeleton for table
        // ดึงข้อมูล user, item, authorize จาก api
        user = await getEscsUsers({USR_STATUS: 1});
        item = await getEscsItems({IS_STATUS: 1});
        const auth = await getUserAuthorizeView({USR_STATUS: 1});

        // กรอง user ที่ไม่ใช่กลุ่ม 3,4,6,7 และมีการอนุญาต
        user = await user.filter((u) => {
            if (![3, 4, 6, 7].includes(u.GRP_ID) && auth.find((a) => a.USR_NO == u.USR_NO && a.IT_NO)) return u;
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

        // สร้าง select section
        $("#selectSection").replaceWith(
            select({
                id: "selectSection",
                name: "selectSection",
                data: [{ value: "0", text: "All" }, ...uniqueSections],
                placeholder: "Select section",
                class: "w-40",
            })
        );
        // Set select2
        await setSelect2({
            element: "#selectSection",
            selectionCssClass: "w-40",
        });
        $("#selectSection").val("0").trigger("change"); // เลือก all เป็นค่าเริ่มต้น
        // await setTable("0"); // แสดงตารางเริ่มต้นเป็น all section
    } catch (err) {
        console.log(err);
        showErrorMessage(err.message || err);
    }
});

/**
 * Set skeleton table
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @date 2025-10-24
 * @description แสดง skeleton ขณะโหลดตารางรายงาน
 * @example
 * skeletonTable();
 */
function skeletonTable() {
    skeletons({
        idLoading: "reportList",
        pattern: [
            { width: "w-96", height: "h-11" },
            { width: "w-48", height: "h-11", type: "horizontal", flag: "start"},
            { width: "w-48", height: "h-11", type: "horizontal"},
            { width: "w-24", height: "h-11", type: "horizontal"},
            { width: "w-24", height: "h-11", type: "horizontal", flag: "end"},
            { width: "w-full", height: "h-[70vh]" },
        ],
        count: 6,
    });
}

/**
 * Set data and create table
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @date 2025-10-24
 * @description ดึงข้อมูลและสร้างตารางรายงานตาม section ที่เลือก
 *
 * @param {string | number} section e.g. "0" - section id
 * @returns {Promise<void>}
 * @example
 * await setTable("0");
 */
async function setTable(section) {
    try {
        skeletonTable();
        const { data, allItem, secName, itemList } = await getDataAuthorize(
            section
        );
        authData = data;
        await createReportTable(data, allItem, secName, itemList);
        setStickyColumns($("#tableReport"));
    } catch (err) {
        console.log(err);
        showErrorMessage(err.message || err);
    }
}

/**
 * Get data authorize
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @date 2025-10-24
 * @description ดึงข้อมูล Authorize ตาม section ที่เลือก
 *
 * @typedef {Object} returnData
 * @property {Array} data - user data with authorization
 * @property {Array} allItem - list of all item numbers e.g. ['24008', '24012', ...]
 * @property {string} secName - section name e.g. WSD SEC.
 * @property {Array} itemList - list of authorized item numbers e.g. ['24008', '24012', ...]
 *
 * @param {string | number} section e.g. "0" - section id
 * @returns {Promise<returnData>}
 * @example
 * await getDataAuthorize("0");
 */
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

    // กรองข้อมูล user ตาม section
    const data = user
        .filter((d, index) => {
            if (section == "0") return d;
            if (d.SSECCODE == section) {
                return d;
            }
        })
        // ผูกข้อมูล authorize กับ user
        .map((u) => {
            u.auth = auth.filter((a) => a.USR_NO == u.USR_NO);
            return u;
        });
    // สร้างรายการ item ที่มี authorize ไม่ซ้ำ
    const itemList = data
        .map((d) => d.auth.map((a) => a.IT_NO))
        .flat()
        .filter((item, index, self) => self.indexOf(item) === index)
        .sort();
    return { data, allItem, secName, itemList };
}

/**
 * Create report table
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @date 2025-10-24
 * @description สร้างตาราง
 *
 * @param {Array} data
 * @param {Array} allItem
 * @param {string} secName
 * @param {Array} itemList
 * @returns {Promise<void>}
 * @example
 * await createReportTable(data, allItem, secName, itemList);
 */
// prettier-ignore
async function createReportTable(data, allItem, secName, itemList) {
    dataExcel = [];
    const tr = data
        .map((d, index) => {
            let checkedItems = "";
            // Push data to Excel array
            dataExcel.push({
                EmpNo: d.USR_NO,
                Name: d.USR_NAME,
                Position: d.SPOSITION,
                Items: d.auth.map((a) => a.IT_NO),
                Range: d.auth.map((a) => {
                    return {item: a.IT_NO, range: setMedalReportList(a.PERCENT, a.TEST_DATE).range };
                })
            });
            allItem.forEach((it) => {
                const itemAuth = d.auth.filter((a) => a.IT_NO == it);
                if (itemAuth.length > 0) {
                    const item = itemAuth.find((a) => a.STATION_NO == 0);
                    
                    let medal = "";
                    if (item.TEST_DATE) {
                        medal = setMedalReportList(item.PERCENT, item.TEST_DATE);
                    }
                    checkedItems += `<td class="text-center border-r-1 border-gray-400 showScore cursor-pointer" item="${it}" range="${medal.range || 'none'}">${
                        medal.html
                            ? medal.html
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
        .join("");
    let html = `<div class="text-2xl font-bold mb-3 text-primary">New: Quality built in line (Section) : ${secName}</div>
    <div class="flex gap-3 mb-3">
        <select id="searchItem" class="select w-48" placeholder="Select Item"/></select>
        <select id="searchEmp" class="select w-fit min-w-48" placeholder="Select Employee"/></select>
        <button class="btn btn-error" id="clearFilter">Clear filter</button>
        <button class="btn btn-success" id="exportExcel">Export excel</button>
    </div>
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
                ${tr}
            </tbody>
        </table>
    </div>`;
    $("#reportList").html(html);
    await setSelect2({
        element: "#searchEmp",
        data: data.map((d) => ({
            value: d.USR_NO,
            text: `${d.USR_NAME} (${d.USR_NO})`,
        })),
    });
    await setSelect2({
        element: "#searchItem",
        data: itemList.map((item) => ({
            value: item,
            text: item,
        })),
    });
}

/**
 * Search in table
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @date 2025-11-01
 * @description ค้นหาในตารางรายงาน
 * @typedef {Object} returnFilter
 * @property {Array} emp - list of employee numbers e.g. ['24008', '24012', ...]
 * @property {Array} it - list of item numbers e.g. ['101-01', '102-02', ...]
 *
 * @param {string} empno - '24008'
 * @param {string} item - 101-01
 * @returns {Promise<returnFilter>}
 * @example
 * const { emp, it } = searchInTable("24008", "101-01");
 */
// prettier-ignore
function searchInTable(empno, item) {
    let emp = [],
        it = [];
    dataExcel = [];
    
    $(`#tableReport tbody tr`).each(function () {
        if($(this).hasClass('no-data-row')) return;
        const rowEmpNo = $(this).find("td:nth-child(2)").text();
        const rowEmpName = $(this).find("td:nth-child(3)").text();
        const rowPosition = $(this).find("td:nth-child(4)").text();
        // ดึงรายการ item ในแถว
        const itemList = $(this).find('td').filter(function() {
            return $(this).attr('item') !== undefined;
        }).map(function() {
            return $(this).attr('item');
        }).get();
        const itemRange = $(this).find('td').filter(function() {
            return $(this).attr('range') !== undefined;
        }).map(function() {
            return {item: $(this).attr('item'), range: $(this).attr('range')};
        }).get();

        // กรองข้อมูลตาม empno และ item
        if ((item === null || item === "") && (empno === null || empno === "")) { // ถ้าไม่มีการกรอง
            emp.push(rowEmpNo);
            it.push(itemList);
            dataExcel.push({ EmpNo: rowEmpNo, Name: rowEmpName, Position: rowPosition, Items: itemList, Range: itemRange});
            $(this).show();
            return;
        } else if (item === null || item === "") { // กรองเฉพาะ empno
            if (rowEmpNo === empno) {
                emp.push(rowEmpNo);
                it.push(itemList);
                dataExcel.push({ EmpNo: rowEmpNo, Name: rowEmpName, Position: rowPosition, Items: itemList, Range: itemRange });
                $(this).show();
            } else {
                $(this).hide();
            }
        } else if (empno === null || empno === "") { // กรองเฉพาะ item
            if (itemList.includes(item)) {
                emp.push(rowEmpNo);
                it.push(itemList);
                dataExcel.push({ EmpNo: rowEmpNo, Name: rowEmpName, Position: rowPosition, Items: itemList, Range: itemRange});
                $(this).show();
            } else {
                $(this).hide();
            }
        } else {
            // กรองตามทั้ง empno และ item
            if (
                rowEmpNo.includes(empno) &&
                itemList.includes(item)
            ) {
                emp.push(rowEmpNo);
                it.push(itemList);
                dataExcel.push({ EmpNo: rowEmpNo, Name: rowEmpName, Position: rowPosition, Items: itemList, Range: itemRange});
                $(this).show();
            } else {
                $(this).hide();
            }
        }
    });
    // หากไม่มีข้อมูลเพิ่มแถว No data
    if ($('#tableReport tbody tr:visible:not(.no-data-row)').length === 0) {
        if($('#tableReport tbody').find('.no-data-row').length === 0){
            $('#tableReport tbody').append(`<tr class="no-data-row">
                <td colspan="100%" class="text-center text-gray-500 py-3">
                No data available
                </td>
            </tr>`);
        }
    } else {
        $('#tableReport tbody').find('.no-data-row').remove();
    }
    setStickyColumns($("#tableReport"));
    // ลบรายการซ้ำ
    it = it.flat().filter((item, index, self) => self.indexOf(item) === index).sort();
    return { emp, it };
}

$(document).on("change", "#selectSection", async function () {
    const section = $(this).val();
    await setTable(section);
});

// แสดง modal คะแนน เมื่อทำการคลิกที่ไอคอนเหรียญ
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
                <td class="text-center">${
                    a.GRADE != "C"
                        ? '<i class="icofont-check-circled text-success text-xl"></i>'
                        : '<i class="icofont-close-circled text-error text-xl"></i>'
                }</td>
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

// หากมีการล้างค่า section ให้รีเซ็ตตาราง
$(document).on("select2:clear", "#selectSection", async function () {
    $("#selectSection").val("0").trigger("change");
    setTimeout(() => $("#selectSection").select2("close"), 100);
    await setTable("0");
});

// prettier-ignore
$(document).on("change", "#searchEmp", async function () {
    if(!flagFilter){
        flagFilter = true;
        $(this).prop('disabled', true);
    } 
    const empNo = $(this).val();
    const eIt = $("#searchItem");
    const { emp, it } = searchInTable(empNo, eIt.val());
    if((empNo && eIt.val()) || eIt.val()) return; // ถ้ามีทั้ง 2 ช่องหรือช้องค้นหา item มีค่าไม่ต้องทำอะไร
    // if(eIt.val()) return;
    const { data, allItem, secName, itemList } = await getDataAuthorize($("#selectSection").val());
    let options = itemList.map((item) => ({
        value: item,
        text: item,
    }));
    // หากไม่มีข้อมูลเพิ่มแถว No data
    if (options.length === 0) {
        options.push({ value: "", text: "No data" });
    }
    // หาก ช่องค้นหา empno มีค่า กรองข้อมูล item ตาม empNo
    if(empNo){
        options = options.filter((d) => it.includes(d.value));
    }

    // หากไม่มีค่าในทั้ง 2 ช่อง ให้รีเซ็ต select2
    if(!empNo && !eIt.val()){
        await setSelect2({
            element: "#searchEmp",
            data: data.map((d) => ({
                value: d.USR_NO,
                text: `${d.USR_NAME} (${d.USR_NO})`,
            })),
        });
    }
    
    // สร้าง select2 ใหม่
    await setSelect2({
        element: "#searchItem",
        data: options,
    });
});

// prettier-ignore
$(document).on("change", "#searchItem", async function () {
    if(!flagFilter){
        flagFilter = true;
        $(this).prop('disabled', true);
    }
    const itemNo = $(this).val();
    const eEmp = $("#searchEmp");
    const { emp, it } = searchInTable(eEmp.val(), itemNo);
    if((itemNo && eEmp.val()) || eEmp.val()) return; // ถ้ามีทั้ง 2 ช่องหรือช้องค้นหา empno มีค่าไม่ต้องทำอะไร
    // if(eEmp.val()) return; // ถ้ามีทั้ง 2 ช่องหรือช้องค้นหา empno มีค่าไม่ต้องทำอะไร
    const { data, allItem, secName, itemList } = await getDataAuthorize($("#selectSection").val());
    let options = data.map((d) => ({
        value: d.USR_NO,
        text: `${d.USR_NAME} (${d.USR_NO})`,
    }));
    // หากไม่มีข้อมูลเพิ่มแถว No data
    if (options.length === 0) {
        options = [{ value: "", text: "No data" }];
    }
    // หาก ช่องค้นหา item มีค่า กรองข้อมูล empNo ตาม item
    if(itemNo){
        options = options.filter((d) => emp.includes(d.value));
    }

    // หากไม่มีค่าในทั้ง 2 ช่อง ให้รีเซ็ต select2
    if(!itemNo && !eEmp.val()){
        await setSelect2({
            element: "#searchItem",
            data: itemList.map((item) => ({
                value: item,
                text: item,
            })),
        });
    }
    // สร้าง select2 ใหม่
    await setSelect2({
        element: "#searchEmp",
        data: options,
    });
});

// ล้างการกรอง
$(document).on("click", "#clearFilter", async function () {
    $("#searchEmp").val("").trigger("change");
    $("#searchItem").val("").trigger("change");
    $("#searchEmp").prop("disabled", false);
    $("#searchItem").prop("disabled", false);
    flagFilter = false;
});

$(document).on("click", "#exportExcel", async function () {
    const data = await getDataAuthorize($("#selectSection").val());
    // prettier-ignore
    const excel = await defaultExcel({
        manual: true,
        extraWidth: 5,
        autoWidth: false,
        manualActions: (sheet) => {
            // Set header
            const headerRow = sheet.getRow(1);
            headerRow.font = { size: 16, bold: true };
            headerRow.alignment = { vertical: "center", horizontal: "left" };

            mergeCell(sheet, 1, 1, 1, 4 + data.allItem.length, `New: Quality built in line (Section) : ${data.secName}`);

            // Set table header
            mergeCell(sheet, 2, 1, 3, 1, "No");
            mergeCell(sheet, 2, 2, 3, 2, "Empno");
            mergeCell(sheet, 2, 3, 3, 3, "Name");
            mergeCell(sheet, 2, 4, 3, 4, "Position");
            mergeCell(sheet, 2, 5, 2, 4 + data.allItem.length, "Items");

            // Set font bold and alignment
            sheet.getRow(2).font = { bold: true };
            sheet.getRow(3).font = { bold: true };
            sheet.getRow(2).alignment = {
                vertical: "middle",
                horizontal: "center",
            };
            sheet.getRow(3).alignment = {
                vertical: "middle",
                horizontal: "center",
            };

            // Set column width
            sheet.getColumn(1).width = 5;  // No
            sheet.getColumn(2).width = 10; // Empno
            sheet.getColumn(3).width = 30; // Name
            sheet.getColumn(4).width = 20; // Position

            // Set header item
            const itemRow = sheet.getRow(3);
            data.allItem.forEach((item, index) => {
                itemRow.getCell(5 + index).value = item;
            });

            // Set data
            dataExcel.forEach((d, index) => {
                const itemRow = sheet.getRow(3);
                const row = sheet.getRow(4 + index);
                row.getCell(1).value = index + 1;
                row.getCell(2).value = d.EmpNo;
                row.getCell(3).value = d.Name;
                row.getCell(4).value = d.Position;
                itemRow.eachCell((cell, colNumber) => {
                    const itemNo = cell.value;
                    if (d.Items.includes(itemNo)) {
                        const medal = d.Range.find((r) => r.item === itemNo && r.range != 'Bronze');
                        row.getCell(colNumber).value = medal ? "✔" : "✖";
                        row.getCell(colNumber).alignment = { horizontal: "center" };
                    }
                });
            });
            const startRow = 2;
            const endRow = sheet.lastRow.number;
            const startCol = 1;
            const endCol = sheet.getRow(3).cellCount; // นับจำนวนคอลัมน์จริงใน header

            for (let r = startRow; r <= endRow; r++) {
                for (let c = startCol; c <= endCol; c++) {
                    const cell = sheet.getCell(r, c);
                    cell.border = border();
                }
            }

        },
    });
    exportExcel(excel, `Authorize_Report_${data.secName.replace(/ /g, "_")}`);
});
