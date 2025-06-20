/**
 * Manage DataTable
 * @module inc/_dataTable
 * @description This file is used to manage DataTable in the project.
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @since  2025-05-01
 * @note This file includes functions to initialize and configure DataTables.
 * @requires inc/_filter
 * @requires jQuery
 * @requires DataTables
 * @version 1.0.1
 */

import { createColumnFilters } from "./_filter";

export const domScroll =
    '<"top flex flex-col gap-2"<"#filterBtnDt.flex flex-wrap gap-2"><"top-menu flex flex-wrap gap-3 mb-2"<"lf-opt flex-1 join gap-3 "lf><"table-option join  items-center">>><"bg-white border border-slate-300 rounded-lg overflow-scroll max-h-[60vh]"rt><"bottom flex justify-between mt-5"pi>';
// export const domScroll = '<"top flex flex-wrap gap-3 mb-2"<"lf-opt flex-1 join gap-3 "lf><"table-option join gap-[2px] items-center">><"overflow-scroll max-h-[60vh]"rt><"bottom flex justify-between mt-5"pi>';

export const initJoin = (id) => {
    $(id).find("thead").addClass("sticky top-0 bg-white z-10");
    $(".dt-length").find("select").addClass("join-item");
    $(".dt-search").find("input").addClass("join-item");
    $(".lf-opt").removeClass("gap-3");
};

/**
 * Default datatable
 */
export const tableOption = {
    dom: '<"flex mb-3"<"flex-1"f><"flex items-center table-option"l>><"bg-white border border-slate-300 rounded-lg overflow-hidden my-5"t><"flex mt-5"<"flex-1"p><"flex-none"i>>',
    pageLength: 10,
    autoWidth: false,
    destroy: true,
    responsive: true,
    language: {
        info: "แสดง _START_ ถึง _END_ จาก _TOTAL_ รายการ",
        infoEmpty: "",
        paginate: {
            previous: '<i class="icofont-circled-left"></i>',
            next: '<i class="icofont-circled-right"></i>',
            first: '<i class="icofont-double-left"></i>',
            last: '<i class="icofont-double-right"></i>',
        },
        search: "",
        searchPlaceholder: "ค้นหา",
        loadingRecords: "กำลังโหลดข้อมูล...",
        emptyTable: "ไม่มีข้อมูลในตาราง",
        zeroRecords: "ไม่พบข้อมูลที่ต้องการ",
        lengthMenu: "_MENU_",
    },
    lengthMenu: [
        [10, 25, 50, 100, -1],
        [10, 25, 50, 100, "All"],
    ],
    columnDefs: [
        {
            targets: "action",
            searchable: false,
            orderable: false,
        },
    ],
    //   headerCallback: function(thead, data, start, end, display) {
    //     $(thead).find('th').css({
    //         'background-color': '#000', /* สีพื้นหลัง */
    //         'color': 'white'              /* สีตัวอักษร */
    //     });
    // }
};

export const tableSetup = {
    join: false,
    tableGroup: { status: false, column: "0" },
    buttonFilter: { status: false, column: "0", activeFilter: 0 },
    columnFilter: { status: false, column: "0" },
};

export function createTable(id = "#table", option = {}, setupOpt = {}) {
    const opt = { ...tableOption, ...option };
    const setup = {
        ...tableSetup,
        ...setupOpt,
        buttonFilter: {
            ...tableSetup.buttonFilter,
            ...setupOpt.buttonFilter,
        },
    };

    if (setup.join || setup.buttonFilter.status) opt.dom = domScroll; // ถ้าต้องการให้มี scroll ให้ใช้ domScroll
    opt.initComplete = function (settings, json) {
        // ✅ เรียกฟังก์ชันที่ผู้ใช้ส่งมา (ถ้ามี)
        if (typeof option.initComplete === "function") {
            console.log(1, this, settings, json);

            option.initComplete.call(this, settings, json);
        }

        const api = this.api();
        const colspan = api.columns().count(); // จำนวนคอลัมน์ทั้งหมด

        console.log(api, colspan);
        if (setup.join) initJoin(id);

        // if(setup.tableGroup.status) tableGroup(colspan, api, setup.tableGroup.column); // เรียกใช้ฟังก์ชัน tableGroup
        if (setup.buttonFilter.status)
            setBtnFilter(
                api,
                setup.buttonFilter.column,
                setup.buttonFilter.activeFilter
            ); // เรียกใช้ฟังก์ชัน setBtnFilter
        if (setup.columnFilter.status)
            createColumnFilters(api, setup.columnFilter.column); // เรียกใช้ฟังก์ชัน createColumnFilters
    };
    opt.drawCallback = function (settings) {
        if (typeof option.drawCallback === "function") {
            console.log(2, this, settings);

            option.drawCallback.call(this, settings);
        }
        if (setup.tableGroup.status) {
            const api = this.api();
            const colspan = api.columns().count(); // จำนวนคอลัมน์ทั้งหมด
            tableGroup(colspan, api, setup.tableGroup.column);
        }
    };
    if (setup.columnFilter.status) {
        opt.columnDefs = [
            { orderable: false, targets: "_all" }, // ปิดการเรียงในคอลัมน์ที่กำหนด
        ];
    }
    return $(id).DataTable(opt);
}

/**
 * Create group table
 * @param {number} colspan length of columns e.g. 5
 * @param {object} api is dataTable
 * @param {number} groupCol is column to create group e.g. 0
 */
export function tableGroup(colspan, api, groupCol = 0) {
    var rows = api.rows({ page: "current" }).nodes();

    var lastGroup = null;
    // ลบกลุ่มที่มีอยู่เดิม
    $(rows).removeClass("group-row");

    // วนลูปเพื่อสร้างกลุ่ม
    api.column(groupCol, { page: "current" })
        .data()
        .each(function (group, i) {
            if (lastGroup !== group) {
                $(rows).eq(i).before(`
                <tr class="group-row font-bold" data-group="${group}">
                    <td colspan="${colspan}"><i class="icofont-rounded-down"></i> ${group}</td>
                </tr>
            `);
                lastGroup = group;
            }
        });

    // เปลี่ยนไอค่อนกลับเป็น icofont-rounded-down ชี้ลง
    const groupRow = $(".group-row");
    if (groupRow.length > 0) {
        groupRow.each(function (index, element) {
            const icon = $(element).find("i"); // หาไอคอนใน row นี้
            if (icon.hasClass("icofont-rounded-right")) {
                icon.removeClass("icofont-rounded-right").addClass(
                    "icofont-rounded-down"
                );
            }
        });
    }

    // แสดงแถวที่ซ่อนอยู่ทั้งหมด
    api.rows({ page: "current" }).every(function () {
        $(this.node()).show("-translate-y-6"); // ซ่อนหรือแสดงแถว
    });

    // กำหนดให้แถวกลุ่มสามารถคลิกได้
    const columnName = api.settings().init().columns[groupCol].data;
    $("tr.group-row").on("click", function () {
        clickTableGroup(api, columnName, $(this));
    });
}

/**
 * Click toggle tr group
 * @param {object} table is dataTable
 * @param {string} row e.g. 'TYPE_NAME'
 * @param {object} e e.g. $(this)
 */
export function clickTableGroup(table, row, e) {
    const group = e.data("group"); // รับค่าหมวดหมู่
    console.log(group);

    const rows = table.rows({ page: "current" }).data(); // ดึงข้อมูลปัจจุบันทั้งหมด
    console.log(rows);

    const icon = e.find("i"); // หาไอคอนใน row นี้

    // Toggle ไอคอน
    if (icon.hasClass("icofont-rounded-right")) {
        icon.removeClass("icofont-rounded-right").addClass(
            "icofont-rounded-down"
        );
    } else {
        icon.removeClass("icofont-rounded-down").addClass(
            "icofont-rounded-right"
        );
    }

    table.rows({ page: "current" }).every(function () {
        const rowData = this.data(); // ดึงข้อมูลแถวปัจจุบัน
        if (rowData[row] === group) {
            // ตรวจสอบค่า Category
            const rowNode = this.node(); // ดึง DOM node ของแถว
            $(rowNode).toggle("-translate-y-6"); // ซ่อนหรือแสดงแถว
        }
    });
}

/**
 * Set filter button
 * @param {object} table
 * @param {number} col e.g. 0
 */
export function setBtnFilter(table, col, active = 0) {

    // เมื่อกดปุ่มให้กรองข้อมูลตามหมวดหมู่
    $("#filterBtnDt").on("click", ".filter-btn-dt", function () {
        var filterValue = $(this).attr("data-filter");
        console.log(`^${$.fn.dataTable.util.escapeRegex(filterValue)}$`);

        tableSetup.buttonFilter.activeFilter = $(this).index(); // เก็บ index ของปุ่มที่ถูกคลิก

        // filterValue == '' ? table.column(col).search(filterValue).draw() :
        //                     table.column(col).search(`^${$.fn.dataTable.util.escapeRegex(filterValue)}$`, true, false).draw();
        if (filterValue == "") {
            table.column(col).search(filterValue).draw();
            const filterClear = $(".filter-clear");

            if (filterClear.length > 0) {
                filterClear.each(function (index, element) {
                    // console.log(element, $(element));
                    $(".filter-menu").attr("current-column", index);
                    $(element).trigger("click");
                });
            }
        } else {
            table
                .column(col)
                .search(
                    `^${$.fn.dataTable.util.escapeRegex(filterValue)}$`,
                    true,
                    false
                )
                .draw();
        }
        $(".filter-btn-dt.btn-primary").removeClass("btn-primary"); // ลบ class btn-primary
        $(this).addClass("btn-primary"); // เพิ่ม class btn-primary ให้กับปุ่มที่ถูกคลิก
    });

    // ดึงค่าหมวดหมู่จากคอลัมน์ที่กำหนด
    var uniqueCategories = [];

    table
        .column(col)
        .data()
        .each(function (value) {
            // console.log(uniqueCategories.indexOf(value),value);
            if (uniqueCategories.indexOf(value) === -1) {
                uniqueCategories.push(value);
            }
        });
    console.log(uniqueCategories);

    if (uniqueCategories.length > 0) {
        // เพิ่มปุ่ม "ทั้งหมด" ไว้ที่จุดเริ่มต้น
        var buttonContainer = $("#filterBtnDt");

        buttonContainer.append(
            '<button class="filter-btn-dt btn btn-sm w-fit" data-filter="">ทั้งหมด</button>'
            //   '<button class="filter-btn-dt btn btn-primary btn-sm w-fit" data-filter="">ทั้งหมด</button>'
        );

        // สร้างปุ่มสำหรับแต่ละหมวดหมู่

        for (const category of uniqueCategories) {
            buttonContainer.append(
                '<button class="filter-btn-dt btn btn-sm w-fit" data-filter="' +
                    category +
                    '">' +
                    category +
                    "</button>"
            );
        }

        // เมื่อสร้างปุ่มเสร็จแล้ว ให้เพิ่ม class btn-primary
        buttonContainer.find(".filter-btn-dt").eq(active).trigger("click"); // กดปุ่มแรกที่มี class btn-primary
    }

    
}
