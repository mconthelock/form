/**
 * Manage DataTable
 * @module _dataTable
 * @description This file is used to manage DataTable in the project.
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @since  2025-05-01
 * @note This file includes functions to initialize and configure DataTables.
 * @requires _filter
 * @requires jQuery npm install jquery
 * @requires DataTables
 * npm install datatables.net-dt
 * npm install datatables.net-responsive-dt
 * @version 1.0.2
 * @note ## เพิ่ม sticky column และ btn filter จะจำว่าคลิกปุ่มไหนอยู่
 * @note 2025-06-25 เพิ่ม sticky column
 * @note 2025-06-25 เพิ่ม select column (checkbox)
 * @note 2025-06-25 ปรับปรุง domScroll ให้สามารถกำหนดความสูงได้
 * @note 2025-06-25 เพิ่ม getSelectedData ดึงข้อมูลที่ถูกเลือกจากตาราง
 * @note 2025-06-25 ปรับปรุง initJoin แยก headerSticky ให้กำหนดเพิ่มเอง
 * @note 2025-06-25 เพิ่ม dataTableSm กำหนดให้ขนาดตัวอักษรเล็กลง
 * @note 2025-06-26 ปรับปรุง tableSetup ให้สามารถกำหนดค่าได้ง่ายขึ้น
 * @note 2025-06-26 ปรับปรุง select column ให้เลือกว่าจะ reset ค่า selected หรือไม่เมื่อสร้างตารางใหม่
 * @note 2025-06-27 dataTableSm ปรับปรุงให้สามารถกำหนดขนาดตัวอักษรได้
 * @note 2025-06-28 เปลี่ยนวิธี set id ไว้ที่ setup option
 * @note 2025-06-30 เลือกประเภทของ domScroll เผื่อไม่ได้ใช้ tailwind
 */

import { createColumnFilters } from "./_filter";
import "datatables.net-dt";
import "datatables.net-responsive-dt";
// import "datatables.net-dt/css/dataTables.dataTables.min.css";
import "datatables.net-responsive-dt/css/responsive.dataTables.min.css";

export const domScrollTailwind4 = (opt) =>{ return `<"top flex flex-col gap-2"<"#filterBtnDt.flex flex-wrap gap-2"><"top-menu flex flex-wrap gap-3 mb-2"<"lf-opt flex-1 join gap-3 "lf><"table-option join  items-center">>><"bg-white border border-slate-300 rounded-lg overflow-scroll ${opt.maxHeight || "max-h-['70vh']"}"rt><"bottom flex justify-between mt-5"pi>`};

/**
 * หากจะใช้ต้องมีการ import CSS ด้วย
 * @param {} opt 
 * @returns 
 */
export const domScrollDefault = (opt) =>{ return `<"top domTop"<"#filterBtnDt"><"top-menu"<"lf-opt join "lf><"table-option join">>><"dataTable-body  ${opt.maxHeight || "max-h-['70vh']"}"rt><"bottom"pi>`};
// export const domScroll = '<"top flex flex-wrap gap-3 mb-2"<"lf-opt flex-1 join gap-3 "lf><"table-option join gap-[2px] items-center">><"overflow-scroll max-h-[60vh]"rt><"bottom flex justify-between mt-5"pi>';

export function initJoin(){
    $(".dt-length").find('select').addClass("join-item");
    $(".dt-search").find('input').addClass("join-item");
    $('.lf-opt').removeClass('gap-3');
}

export const headerSticky = (id) => {
    $(id).find('thead').addClass('sticky top-0 bg-white z-10 shadow-button');
}

export const dataTableSm = (option) => {
    $(option.id).find('td').addClass(`!py-[8px] !px-[10px] ${option.sizeTd}`);
    $(option.id).find('th').addClass(option.sizeTh);

}

/**
 * Default datatable
 */
export const tableOption = {
  dom: '<"flex mb-3"<"flex-1"f><"flex items-center table-option"l>><"bg-white border border-slate-300 rounded-lg overflow-hidden my-5"t><"flex mt-5"<"flex-1"p><"flex-none"i>>',
//   dom: '<"flex mb-3"<"table-search flex flex-1 gap-5 "f><"flex items-center table-option"l>><"bg-white border border-slate-300 rounded-lg overflow-hidden my-5"t><"flex mt-5"<"flex-1"p><"table-info flex  flex-none gap-5"i>>',
  pageLength: 15,
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
    infoFiltered: "(กรองข้อมูลจากทั้งหมด _MAX_ รายการ)",

  },
  lengthMenu: [[15, 25, 50, 100, -1], [15, 25, 50, 100, 'All']],
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

// สร้างคอลัมน์ select (checkbox)
export const selectColumn = {
    data: null,
    className: "max-w-[100px] !text-center",
    title: `<div class="w-full text-center"><input type="checkbox" class="checkbox checkbox-primary" id="select-dt-rows-all" /></div>`,
    orderable: false,
    searchable: false,
    sortable: false,
    width: "100px",
    render: (data, type, row) => {
        return `<label>
            <input type="checkbox" class="checkbox checkbox-primary select-dt-row" ${data.selected != undefined ? "checked" : ""} />
        </label>`;
    },
};

export const tableSetup = {
    id: '#table', // id ของตาราง
    join: false,
    headerSticky: true, // ใช้ headerSticky() เพื่อสร้าง sticky header
    dataTableSm : {status: true, sizeTh: '!text-xs', sizeTd: '!text-sm', id: '#table' }, // ใช้ dataTableSm() เพื่อสร้างตารางขนาดเล็ก
    tableGroup  : {status: false, column: '0'}, 
    buttonFilter: {status: false, column: '0', activeFilter: 0 }, 
    columnFilter: {status: false, column: '0'}, 
    columnSelect: {status: false, column: '0', resetOnCreate: true}, // สร้างคอลัมน์ select (checkbox)
    domScroll: {status: false, maxHeight: 'max-h-[70vh]', type: 'default'}, // ใช้ domScroll() เพื่อสร้าง scroll
}

export async function createTable(option = {}, setupOpt = {} ) {
    
    // option.data.map(row => { delete row.selected; }); // ลบ selected ออกจากข้อมูลทั้งหมด
    const opt = { ...tableOption, ...option }; // merge options with default tableOption
    // merge tableSetup with setupOpt
    const setup = { 
        ...tableSetup, 
        ...setupOpt, 
        dataTableSm: {
            ...tableSetup.dataTableSm,
            ...setupOpt.dataTableSm,
        },
        tableGroup: {
            ...tableSetup.tableGroup,
            ...setupOpt.tableGroup,
        },
        buttonFilter: {
            ...tableSetup.buttonFilter,
            ...setupOpt.buttonFilter,
        },
        columnFilter: {
            ...tableSetup.columnFilter,
            ...setupOpt.columnFilter,
        },
        columnSelect: {
            ...tableSetup.columnSelect,
            ...setupOpt.columnSelect,
        },
        domScroll: {
            ...tableSetup.domScroll,
            ...setupOpt.domScroll,
        },
    };
    if (setup.columnSelect && setup.columnSelect.status && Array.isArray(opt.columns)) {
        
        // แทรกคอลัมน์ select ไว้ที่ตำแหน่งที่กำหนด
        opt.columns.splice(setup.columnSelect.column, 0, selectColumn);
        // แทรกไว้ column แรก
        // opt.columns = [selectColumn, ...opt.columns];
    }
    
    if(setup.join || setup.buttonFilter.status || setup.domScroll.status) {
        if(setup.domScroll.type == 'default'){
            opt.dom = domScrollDefault(setup.domScroll);
        }else if(setup.domScroll.type == 'tailwind4'){
            opt.dom = domScrollTailwind4(setup.domScroll);
        }
    } // ถ้าต้องการให้มี scroll ให้ใช้ domScroll

    opt.initComplete = function (settings, json) {
        // ✅ เรียกฟังก์ชันที่ผู้ใช้ส่งมา (ถ้ามี)
        if (typeof option.initComplete === 'function') {
            console.log(1, this, settings, json);
            
            option.initComplete.call(this, settings, json);
        }
        const api = this.api();
        const colspan = api.columns().count(); // จำนวนคอลัมน์ทั้งหมด

        // console.log(api, colspan);
        if(setup.join) initJoin();
        
        // if(setup.tableGroup.status) tableGroup(colspan, api, setup.tableGroup.column); // เรียกใช้ฟังก์ชัน tableGroup
        if(setup.buttonFilter.status) setBtnFilter(api, setup.buttonFilter.column, setup.buttonFilter.activeFilter); // เรียกใช้ฟังก์ชัน setBtnFilter
        if(setup.columnFilter.status) createColumnFilters(api, setup.columnFilter.column); // เรียกใช้ฟังก์ชัน createColumnFilters
    }
    opt.drawCallback = function (settings) {
        if (typeof option.drawCallback === 'function') {
            // console.log(2, this, settings);
            
            option.drawCallback.call(this, settings);
        }
        if(setup.tableGroup.status){
            const api = this.api();
            const colspan = api.columns().count(); // จำนวนคอลัมน์ทั้งหมด
            tableGroup(colspan, api, setup.tableGroup.column);
        }
        
        setStickyColumns(this);
    
    }
    if(setup.columnFilter.status){
        opt.columnDefs = [
            { orderable: false, targets: '_all' } // ปิดการเรียงในคอลัมน์ที่กำหนด
        ]
    }
    const table = $(setup.id).DataTable(opt);
    if(setup.headerSticky) headerSticky(setup.id); // ถ้าต้องการให้ header เป็น sticky ให้ใช้ headerSticky
    if(setup.dataTableSm.status) dataTableSm(setup.dataTableSm); // ถ้าต้องการให้ตารางมีขนาดเล็กให้ใช้ dataTableSm

    
    $("#select-dt-rows-all").on("click", function (e) {
        const check = $(this).is(":checked");
        table.rows({ search: "applied" }).every(function () {
            let data = this.data();
            if (check) {
                if (setup.columnSelect.status && setup.columnSelect.resetOnCreate) {
                    console.log('resetOnCreate',setup.columnSelect.resetOnCreate);
                    data = { ...data, selected: true };
                } else {
                    console.log('notReset',setup,setup.columnSelect.resetOnCreate);
                    data.selected = true;
                }

            } else {
                delete data.selected;
            }
            this.data(data);
        });
        table.draw();
        const allusers = table.rows().data();
        const selected = allusers.filter((el) => el.selected === true);
        if (selected.length != allusers.length && selected.length != 0) {
            $("#select-dt-rows-all").prop("indeterminate", true);
        }
        console.log('selected all',table.rows().data().toArray());
    });

    $(".select-dt-row").on("click", function (e) {
        let data = table.row($(this).parents("tr")).data();
        const check = $(this);
        if (check.is(":checked")) {
            if (setup.columnSelect.status && setup.columnSelect.resetOnCreate) {
                console.log('resetOnCreate',setup.columnSelect.resetOnCreate);
                
                data = { ...data, selected: true };
            } else {
                console.log('notReset',setup,setup.columnSelect.resetOnCreate);
                data.selected = true ;
            }
        } else {
            delete data.selected;
        }
        table.row($(this).parents("tr")).data(data).draw();
        console.log('selected',table.rows().data().toArray());

    });
    return table;
}

export function getSelectedData(table) {
    const data = table.rows().data().toArray(); // ดึงข้อมูลทั้งหมดในตาราง
    const selectedData = data.filter(row => row.selected); // กรองเฉพาะแถวที่ถูกเลือก
    return selectedData; // คืนค่าข้อมูลที่ถูกเลือก
}

/**
 * จำเป็นต้องให้แสดงผลบนหน้าจอไม่อย่างนั้นจะไม่สามารถอ่านค่าขนาดได้เพราะยังถูกซ่อนไว้
 * @param {object} table 
 * @note หากต้องการใช้ให้ add class sticky-column ให้กับคอลัมน์ที่ต้องการให้เป็น sticky
 */
function setStickyColumns(table) {
    // console.log(table,$(table));
    // let left = 0;
    // let index = 0;
    // table.find('thead th').each(function(i) {
    //     if ($(this).hasClass('sticky-column')) {
    //         // console.log(
    //         //     i,
    //         //     $(this).text(),
    //         //     'is visible?', $(this).is(':visible'),
    //         //     'outerWidth', $(this).outerWidth(),
    //         //     'offsetWidth', this.offsetWidth
    //         //     );
    //         console.log($(this).outerWidth());
            
    //         if(index > 0){
    //             left += $(this).outerWidth();
    //         }
    //         // console.log($(this).text(),'left:', left, 'px');
            
    //         $(this).css('left', left + 'px'); // กำหนดตำแหน่งซ้ายของคอลัมน์
    //         index++;
    //     }
    // });

    // left = 0;
    // index = 0;
    // table.find('tbody tr td').each(function(i) {
    //     if ($(this).hasClass('sticky-column')) {
    //         if(index > 0){
    //             left += $(this).outerWidth();
    //         }
    //         index++;
    //     }
    // });
    
    const stickyIndexes = [];
    let left = 0;
    // หา index ของคอลัมน์ sticky
    table.find('thead th').each(function(i) {
        if ($(this).hasClass('sticky-column')) {
            stickyIndexes.push(i);
        }
    });
    // วนแต่ละ sticky column
    stickyIndexes.forEach(function(colIdx, order) {
        // บวกความกว้างคอลัมน์ก่อนหน้า
        if (order > 0) {
            // left = ผลรวมความกว้างคอลัมน์ sticky ก่อนหน้า
            left += table.find('thead th').eq(stickyIndexes[order - 1]).outerWidth();
        }
        
        // set left ให้ทั้ง head, body ของคอลัมน์นี้
        table.find('thead th').eq(colIdx).css('left', left + 'px');
        table.find('tbody tr').each(function() {
            $(this).find('td').eq(colIdx).css('left', left + 'px');
        });
    });
}


/**
 * Create group table
 * @param {number} colspan length of columns e.g. 5
 * @param {object} api is dataTable 
 * @param {number} groupCol is column to create group e.g. 0
 */
function tableGroup(colspan, api, groupCol = 0){
    var rows = api.rows({ page: 'current' }).nodes();
    
    var lastGroup = null;
    // ลบกลุ่มที่มีอยู่เดิม
    $(rows).removeClass('group-row');

    // วนลูปเพื่อสร้างกลุ่ม
    api.column(groupCol, { page: 'current' }).data().each(function (group, i) {
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
    const groupRow = $('.group-row');
    if(groupRow.length > 0){
        groupRow.each(function(index, element){
            const icon = $(element).find('i'); // หาไอคอนใน row นี้
            if (icon.hasClass('icofont-rounded-right')) {
                icon.removeClass('icofont-rounded-right').addClass('icofont-rounded-down');
            } 
        });
    }
    
    // แสดงแถวที่ซ่อนอยู่ทั้งหมด
    api.rows({ page: 'current' }).every(function () {
        $(this.node()).show('-translate-y-6'); // ซ่อนหรือแสดงแถว
    });

    // กำหนดให้แถวกลุ่มสามารถคลิกได้
    const columnName = api.settings().init().columns[groupCol].data; 
    $('tr.group-row').on('click', function(){
        clickTableGroup(api, columnName, $(this));
    })
}

/**
 * Click toggle tr group 
 * @param {object} table is dataTable
 * @param {string} row e.g. 'TYPE_NAME'
 * @param {object} e e.g. $(this)
 */
function clickTableGroup(table, row, e){
    const group = e.data('group'); // รับค่าหมวดหมู่
    console.log(group); 

    const rows = table.rows({ page: 'current' }).data(); // ดึงข้อมูลปัจจุบันทั้งหมด
    console.log(rows);

    const icon = e.find('i'); // หาไอคอนใน row นี้

    // Toggle ไอคอน
    if (icon.hasClass('icofont-rounded-right')) {
        icon.removeClass('icofont-rounded-right').addClass('icofont-rounded-down');
    } else {
        icon.removeClass('icofont-rounded-down').addClass('icofont-rounded-right');
    }

    table.rows({ page: 'current' }).every(function () {
        const rowData = this.data(); // ดึงข้อมูลแถวปัจจุบัน
        if (rowData[row] === group) { // ตรวจสอบค่า Category
            const rowNode = this.node(); // ดึง DOM node ของแถว
            $(rowNode).toggle('-translate-y-6'); // ซ่อนหรือแสดงแถว
        }
    });
}



/**
 * Set filter button
 * @param {object} table 
 * @param {number} col e.g. 0
 */
function setBtnFilter(table, col, active = 0) {

     // เมื่อกดปุ่มให้กรองข้อมูลตามหมวดหมู่
    $('#filterBtnDt').on('click', '.filter-btn-dt', function () {
        var filterValue = $(this).attr('data-filter');
        console.log(`^${$.fn.dataTable.util.escapeRegex(filterValue)}$`);

        tableSetup.buttonFilter.activeFilter = $(this).index(); // เก็บ index ของปุ่มที่ถูกคลิก
        
        // filterValue == '' ? table.column(col).search(filterValue).draw() :
        //                     table.column(col).search(`^${$.fn.dataTable.util.escapeRegex(filterValue)}$`, true, false).draw();
        if(filterValue == ''){
            table.column(col).search(filterValue).draw()

            // เครียร์ค่าทั้งหมดใน filter-menu
            const filterClear = $('.filter-clear');
            if(filterClear.length > 0){
                filterClear.each(function(index, element){
                    // console.log(element, $(element));
                    $('.filter-menu').attr('current-column',index)
                    $(element).trigger('click');
                });
            }
        }else{
            table.column(col).search(`^${$.fn.dataTable.util.escapeRegex(filterValue)}$`, true, false).draw();
                                
        }
        $('.filter-btn-dt.btn-primary').removeClass('btn-primary'); // ลบ class btn-primary
        $(this).addClass('btn-primary'); // เพิ่ม class btn-primary ให้กับปุ่มที่ถูกคลิก
    });

    // ดึงค่าหมวดหมู่จากคอลัมน์ที่กำหนด
    var uniqueCategories = [];

    table.column(col).data().each(function (value) {
        // console.log(uniqueCategories.indexOf(value),value);
        if (uniqueCategories.indexOf(value) === -1) {
            uniqueCategories.push(value);
        }
    });
    console.log(uniqueCategories);
    
    if(uniqueCategories.length > 0){
        // เพิ่มปุ่ม "ทั้งหมด" ไว้ที่จุดเริ่มต้น
        var buttonContainer = $('#filterBtnDt');
        buttonContainer.append('<button class="filter-btn-dt btn btn-sm w-fit" data-filter="">ทั้งหมด</button>');
    
        // สร้างปุ่มสำหรับแต่ละหมวดหมู่
        for (const category of uniqueCategories) {
            buttonContainer.append(
                '<button class="filter-btn-dt btn btn-sm w-fit" data-filter="' +category +'">' +
                    category +
                "</button>"
            );
        }
                // เมื่อสร้างปุ่มเสร็จแล้ว ให้เพิ่ม class btn-primary
        buttonContainer.find(".filter-btn-dt").eq(active).trigger("click"); // กดปุ่มแรกที่มี class btn-primary
    }

   
}

export function destroyTable(id = '#table') {
    id.includes('#') || (id = `#${id}`); // ตรวจสอบว่า id มี # หรือไม่
    console.log('destroyTable', id);
    const table = $(id).DataTable();
    if (table) {
        table.destroy();
        $(id).empty(); // ล้างตาราง
    }
    //  if(table_reSec){
    //         table_reSec.destroy();
    //         $('#table_rebuild_sec').empty()
    //         table_reSec = null;
    //     }
}

