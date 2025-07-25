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
 * @note 2025-06-25
 *  เพิ่ม sticky column
 *  เพิ่ม select column (checkbox)
 *  ปรับปรุง domScroll ให้สามารถกำหนดความสูงได้
 *  เพิ่ม getSelectedData ดึงข้อมูลที่ถูกเลือกจากตาราง
 *  ปรับปรุง initJoin แยก headerSticky ให้กำหนดเพิ่มเอง
 *  เพิ่ม dataTableSm กำหนดให้ขนาดตัวอักษรเล็กลง
 * @note 2025-06-26
 *  ปรับปรุง tableSetup ให้สามารถกำหนดค่าได้ง่ายขึ้น
 *  ปรับปรุง select column ให้เลือกว่าจะ reset ค่า selected หรือไม่เมื่อสร้างตารางใหม่
 * @note 2025-06-27
 *  dataTableSm ปรับปรุงให้สามารถกำหนดขนาดตัวอักษรได้
 * @note 2025-06-28
 *  เปลี่ยนวิธี set id ไว้ที่ setup option
 * @note 2025-06-30
 *  เลือกประเภทของ domScroll เผื่อไม่ได้ใช้ tailwind
 *  เอา _filter มารวมในไฟล์เดียวกัน
 */

// import { createColumnFilters } from "./_filter";
import "datatables.net-dt";
import "datatables.net-responsive-dt";
// import "datatables.net-dt/css/dataTables.dataTables.min.css";
import "datatables.net-responsive-dt/css/responsive.dataTables.min.css";

export const domScrollTailwind4 = `
    <"table-top flex flex-col gap-2 mb-2"
        <"top-menu flex gap-3 items-start"
            <"left-menu flex flex-wrap join gap-3 "
                lf
                <"#filterBtnDt.flex flex-wrap gap-2">
            >
            <"middle-menu flex flex-1 gap-3"
            >
            <"right-menu table-option flex join ml-auto">
        >
        <"top-menu-row2 flex gap-3">
    >
    <"table-body bg-white border border-slate-300 rounded-lg overflow-scroll"rt>
    <"table-bottom flex justify-between mt-5"
        <"table-paging flex gap-3"p>
        <"table-info flex gap-3" i>
    >`;

/**
 * หากจะใช้ต้องมีการ import CSS ด้วย
 */
export const domScrollDefault = `
    <"table-top domTop"
        <"top-menu"
            <"left-menu join"
                lf
                <"#filterBtnDt.filterBtnDt">
            >
            <"middle-menu">
            <"right-menu table-option join">
        >
        <"top-menu-row2">
    >
    <"table-body"rt>
    <"table-bottom"
        <"table-paging"p>
        <"table-info" i>
    >`;

export function initJoin() {
  $(".dt-length").find("select").addClass("join-item");
  $(".dt-search").find("input").addClass("join-item");
  $(".left-menu").removeClass("gap-3");
}

export const headerSticky = (id) => {
  // $(id).find('thead').addClass('sticky top-0 bg-white z-10 shadow-button');
  $(id).find("thead").css({
    position: "sticky",
    top: "0",
    "background-color": "white",
    "z-index": "10",
    "box-shadow":
      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  });
};

export const dataTableSm = (option) => {
  // $(option.id).find('td').addClass(`!py-[8px] !px-[10px] ${option.sizeTd}`);
  // $(option.id).find('th').addClass(option.sizeTh);
  $(option.id).find("th").css({
    padding: option.paddingTh,
    "font-size": option.fontsizeTh,
  });
  $(option.id).find("td").css({
    padding: option.paddingTd,
    "font-size": option.fontsizeTd,
    height: option.height,
    "line-height": option.lineheight,
  });
};

/**
 * Default datatable
 */
export const tableOption = {
  //   dom: '<"flex mb-3"<"flex-1"f><"flex items-center table-option"l>><"bg-white border border-slate-300 rounded-lg overflow-hidden my-5"t><"flex mt-5"<"flex-1"p><"flex-none"i>>',
  dom: '<"flex mb-3"<"table-search flex flex-1 gap-5 "f><"flex items-center table-option"l>><"bg-white border border-slate-300 rounded-lg overflow-hidden my-5"t><"flex mt-5"<"flex-1"p><"table-info flex  flex-none gap-5"i>>',
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
  lengthMenu: [
    [15, 25, 50, 100, -1],
    [15, 25, 50, 100, "All"],
  ],
  columnDefs: [
    {
      targets: "action",
      searchable: false,
      orderable: false,
    },
  ],
};

// สร้างคอลัมน์ select (checkbox)
export const selectColumn = (opt) => {
  return {
    data: null,
    className: `max-w-[100px] !text-center ${opt.class}`,
    title: `<div class="select-dt-all"><input type="checkbox" class="checkbox checkbox-primary" id="select-dt-rows-all" /></div>`,
    orderable: false,
    searchable: false,
    sortable: false,
    width: "100px",
    render: (data, type, row) => {
      return `<label>
                <input type="checkbox" class="checkbox checkbox-primary select-dt-row" ${
                  data.selected ? "checked" : ""
                } />
            </label>`;
    },
  };
};

export const tableSetup = {
  id: "#table", // id ของตาราง
  join: false,
  headerSticky: true, // ใช้ headerSticky() เพื่อสร้าง sticky header
  dataTableSm: {
    status: false,
    fontsizeTh: "0.75rem",
    paddingTh: "0.5rem",
    fontsizeTd: "0.75rem",
    paddingTd: "0.25rem 0.625rem",
    // pTh: '1rem 1.875rem 1rem 0.75rem',
    // sizeTd: '0.875rem',
    // pTd: '0.625rem 0.5rem',
    height: "1rem",
    lineheight: "1",
  }, // ใช้ dataTableSm() เพื่อสร้างตารางขนาดเล็ก
  tableGroup: { status: false, column: "0" },
  buttonFilter: { status: false, column: "0", activeFilter: 0 },
  columnFilter: { status: false, column: "0" },
  columnSelect: {
    status: false,
    column: "0",
    resetOnCreate: true,
    resetOnSearch: false,
    class: "",
  }, // สร้างคอลัมน์ select (checkbox)
  domScroll: {
    status: false,
    maxHeight: "var(--max-h-dataTable-body)",
    type: "default",
  }, // ใช้ domScroll() เพื่อสร้าง scroll
};

export async function createTable(option = {}, setupOpt = {}) {
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
  if (
    setup.columnSelect &&
    setup.columnSelect.status &&
    Array.isArray(opt.columns)
  ) {
    // แทรกคอลัมน์ select ไว้ที่ตำแหน่งที่กำหนด
    opt.columns.splice(
      setup.columnSelect.column,
      0,
      selectColumn(setup.columnSelect)
    );
    // แทรกไว้ column แรก
    // opt.columns = [selectColumn, ...opt.columns];
  }

  if (setup.join || setup.buttonFilter.status || setup.domScroll.status) {
    if (setup.domScroll.type == "default") {
      // opt.dom = domScrollDefault(setup.domScroll);
      opt.dom = domScrollDefault;
    } else if (setup.domScroll.type == "tailwind4") {
      // opt.dom = domScrollTailwind4(setup.domScroll);
      opt.dom = domScrollTailwind4;
    }
  } // ถ้าต้องการให้มี scroll ให้ใช้ domScroll

  opt.initComplete = function (settings, json) {
    // ✅ เรียกฟังก์ชันที่ผู้ใช้ส่งมา (ถ้ามี)
    if (typeof option.initComplete === "function") {
      // console.log(1, this, settings, json);

      option.initComplete.call(this, settings, json);
    }
    const api = this.api();
    const colspan = api.columns().count(); // จำนวนคอลัมน์ทั้งหมด

    // console.log(api, colspan);
    if (setup.join) initJoin();
    if (setup.headerSticky) headerSticky(setup.id); // ถ้าต้องการให้ header เป็น sticky ให้ใช้ headerSticky
    // if(setup.dataTableSm.status) {
    //     setup.dataTableSm.id = setup.id; // กำหนด id ให้กับ dataTableSm
    //     dataTableSm(setup.dataTableSm); // ถ้าต้องการให้ตารางมีขนาดเล็กให้ใช้ dataTableSm
    // }
    if (setup.join || setup.buttonFilter.status || setup.domScroll.status) {
      $("div.dt-container .table-body").css({
        "max-height": setup.domScroll.maxHeight,
      });
    }

    // if(setup.tableGroup.status) tableGroup(colspan, api, setup.tableGroup.column); // เรียกใช้ฟังก์ชัน tableGroup
    if (setup.buttonFilter.status)
      setBtnFilter(
        api,
        setup.buttonFilter.column,
        setup.buttonFilter.activeFilter
      ); // เรียกใช้ฟังก์ชัน setBtnFilter
    if (setup.columnFilter.status)
      createColumnFilters(api, setup.columnFilter.column); // เรียกใช้ฟังก์ชัน createColumnFilters
    setStickyColumns(this);
  };
  opt.drawCallback = function (settings) {
    if (typeof option.drawCallback === "function") {
      // console.log(2, this, settings);

      option.drawCallback.call(this, settings);
    }
    if (setup.tableGroup.status) {
      const api = this.api();
      const colspan = api.columns().count(); // จำนวนคอลัมน์ทั้งหมด
      tableGroup(colspan, api, setup.tableGroup.column);
    }
    if (setup.dataTableSm.status) {
      setup.dataTableSm.id = setup.id; // กำหนด id ให้กับ dataTableSm
      dataTableSm(setup.dataTableSm); // ถ้าต้องการให้ตารางมีขนาดเล็กให้ใช้ dataTableSm
    }

    setStickyColumns(this);
  };
  if (setup.columnFilter.status) {
    opt.columnDefs = [
      { orderable: false, targets: "_all" }, // ปิดการเรียงในคอลัมน์ที่กำหนด
    ];
  }
  const table = $(setup.id).DataTable(opt);
  // if(setup.headerSticky) headerSticky(setup.id); // ถ้าต้องการให้ header เป็น sticky ให้ใช้ headerSticky
  // if(setup.dataTableSm.status) dataTableSm(setup.dataTableSm); // ถ้าต้องการให้ตารางมีขนาดเล็กให้ใช้ dataTableSm
  $(setup.id).on("search.dt", function () {
    // จะทำงานทุกครั้งที่มีการ filter
  });

  $('.dt-search input[type="search"]').on("input", function () {
    if (setup.columnSelect.status && setup.columnSelect.resetOnSearch) {
      table.rows().every(function () {
        let data = this.data();
        if (data.selected) {
          delete data.selected;
          this.data(data);
        }
      });
      const selectAll = $("#select-dt-rows-all");
      if (selectAll[0] && (selectAll[0].indeterminate || selectAll[0].checked))
        selectAll.trigger("click");
    }
  });

  $("#select-dt-rows-all").on("click", function (e) {
    const check = $(this).is(":checked");
    table.rows({ search: "applied" }).every(function () {
      let data = this.data();
      if (check) {
        if (setup.columnSelect.status && setup.columnSelect.resetOnCreate) {
          // console.log('resetOnCreate',setup.columnSelect.resetOnCreate);
          data = { ...data, selected: true };
        } else {
          // console.log('notReset',setup,setup.columnSelect.resetOnCreate);
          data.selected = true;
        }
      } else {
        delete data.selected;
      }
      this.data(data);
    });
    table.draw(false);
    const allusers = table.rows().data();
    const selected = allusers.filter((el) => el.selected === true);
    // console.log('indeterminate', selected.length, allusers.length);
    if (selected.length == 0) {
      $(this).css({ "background-color": "transparent" });
    } else {
      $(this).css({ "background-color": "var(--color-primary)" });
    }
    if (selected.length != allusers.length && selected.length != 0) {
      $(this).prop("indeterminate", true);

      // document.getElementById("select-dt-rows-all").indeterminate = true; // ใช้ indeterminate แทน
    }
    // console.log('selected all',table.rows().data().toArray());
  });
    $(setup.id).off("click", ".select-dt-row");
    $(setup.id).on("click", ".select-dt-row", function (e) {
//   $(document).on("click", ".select-dt-row", function (e) {
    let data = table.row($(this).parents("tr")).data();
    const check = $(this);
    if (check.is(":checked")) {
      if (setup.columnSelect.status && setup.columnSelect.resetOnCreate) {
        // console.log('resetOnCreate',setup.columnSelect.resetOnCreate);

        data = { ...data, selected: true };
      } else {
        // console.log('notReset',setup,setup.columnSelect.resetOnCreate);
        data.selected = true;
      }
    } else {
      delete data.selected;
    }
    table.row($(this).parents("tr")).data(data).draw(false);
    // console.log('selected',table.rows().data().toArray());
  });
  return table;
}

export function getSelectedData(table) {
  const data = table.rows().data().toArray(); // ดึงข้อมูลทั้งหมดในตาราง
  const selectedData = data.filter((row) => row.selected); // กรองเฉพาะแถวที่ถูกเลือก
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
  table.find("thead th").each(function (i) {
    if ($(this).hasClass("sticky-column")) {
      stickyIndexes.push(i);
    }
  });
  // วนแต่ละ sticky column
  stickyIndexes.forEach(function (colIdx, order) {
    // บวกความกว้างคอลัมน์ก่อนหน้า
    if (order > 0) {
      // left = ผลรวมความกว้างคอลัมน์ sticky ก่อนหน้า
      left += table
        .find("thead th")
        .eq(stickyIndexes[order - 1])
        .outerWidth();
    }

    // set left ให้ทั้ง head, body ของคอลัมน์นี้
    table
      .find("thead th")
      .eq(colIdx)
      .css("left", left + "px");
    table.find("tbody tr").each(function () {
      $(this)
        .find("td")
        .eq(colIdx)
        .css("left", left + "px");
    });
  });
}

/**
 * Create group table
 * @param {number} colspan length of columns e.g. 5
 * @param {object} api is dataTable
 * @param {number} groupCol is column to create group e.g. 0
 */
function tableGroup(colspan, api, groupCol = 0) {
  var rows = api.rows({ page: "current" }).nodes();

  var lastGroup = null;
  // ลบกลุ่มที่มีอยู่เดิม
  $(rows).removeClass("group-row");

  // วนลูปเพื่อสร้างกลุ่ม
  api
    .column(groupCol, { page: "current" })
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
        icon
          .removeClass("icofont-rounded-right")
          .addClass("icofont-rounded-down");
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
function clickTableGroup(table, row, e) {
  const group = e.data("group"); // รับค่าหมวดหมู่
  // console.log(group);

  const rows = table.rows({ page: "current" }).data(); // ดึงข้อมูลปัจจุบันทั้งหมด
  // console.log(rows);

  const icon = e.find("i"); // หาไอคอนใน row นี้

  // Toggle ไอคอน
  if (icon.hasClass("icofont-rounded-right")) {
    icon.removeClass("icofont-rounded-right").addClass("icofont-rounded-down");
  } else {
    icon.removeClass("icofont-rounded-down").addClass("icofont-rounded-right");
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
function setBtnFilter(table, col, active = 0) {
  // เมื่อกดปุ่มให้กรองข้อมูลตามหมวดหมู่
  $("#filterBtnDt").on("click", ".filter-btn-dt", function () {
    var filterValue = $(this).attr("data-filter");
    //console.log(`^${$.fn.dataTable.util.escapeRegex(filterValue)}$`);

    tableSetup.buttonFilter.activeFilter = $(this).index(); // เก็บ index ของปุ่มที่ถูกคลิก

    // filterValue == '' ? table.column(col).search(filterValue).draw() :
    //                     table.column(col).search(`^${$.fn.dataTable.util.escapeRegex(filterValue)}$`, true, false).draw();
    if (filterValue == "") {
      table.column(col).search(filterValue).draw();

      // เครียร์ค่าทั้งหมดใน filter-menu
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
  // console.log(uniqueCategories);

  if (uniqueCategories.length > 0) {
    // เพิ่มปุ่ม "ทั้งหมด" ไว้ที่จุดเริ่มต้น
    var buttonContainer = $("#filterBtnDt");
    buttonContainer.append(
      '<button class="filter-btn-dt btn btn-sm w-fit" data-filter="">ทั้งหมด</button>'
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

export function destroyTable(id = "#table") {
  id.includes("#") || (id = `#${id}`); // ตรวจสอบว่า id มี # หรือไม่
  // console.log('destroyTable', id);
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

/**
 * Filter dataTable
 * @description This file is used to manage filtering functionality for data tables.
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @since  2025-05-01
 * @note 2025-07-02 แก้ไขให้ appendTo .dt-column-header แทน header และซ่อน .dt-column-order ทุกคอลัมน์
 */

/**
 * filter table columns
 * @param {object} table
 * @param {string} columnsToFilter e.g. 1 1,3 1-3 1-3,5 1,3-5
 */
export function createColumnFilters(table, columnsToFilter) {
  const tableId = table.table().node().id;
  // Parse column ranges
  const columns = parseColumns(columnsToFilter, table.columns().count());

  /**
   * Create filter menu
   */
  if ($("#filter-menu").length == 0) {
    $("body")
      .append(`<div class="filter-menu absolute bg-white border border-solid border-[#ddd] hidden z-[1000] p-2.5" id="filter-menu">
            <div class="filter-header" id="filter-header"></div>
            <div id="filter-options" class="h-[400px] w-[200px] overflow-scroll"></div>
            <div class="buttons join w-full">
                <button id="cursor: pointer;" class="btn btn-sm btn-primary round-full join-item w-1/2">OK</button>
                <button id="filter-cancel" class="btn btn-sm btn-neutral round-full join-item w-1/2">Cancel</button>
            </div>
        </div>`);
  }
  /* css
      .filter-menu {
        position: absolute;
        background: white;
        border: 1px solid #ddd;
        padding: 10px;
        display: none;
        z-index: 1000;
      }
      #filter-options{
        height: 300px;
        width: 200px;
        overflow: scroll;
      }
      .filter-menu label {
        display: block;
        margin-bottom: 5px;
      }
      .buttons {
        margin-top: 10px;
      }
      .filter-icon {
        cursor: pointer;
      } */

  // Add filter menus
  columns.forEach((columnIndex) => {
    const column = table.column(columnIndex);
    const header = $(column.header());
    const options = $("#filter-options");
    const columnName = `filterHeader-${tableId}-${columnIndex}`;
    const filterOptions = $(`#filter-options .${columnName}`);
    // console.log(filterOptions);
    $(".dt-column-order").addClass("hidden"); // ซ่อนปุ่มเรียงลำดับ
    // Add filter icon
    $(
      '<span class="filter-icon ml-1 cursor-pointer"><i class="icofont-filter text-gray-300 "></i></span>'
    ).appendTo(header.find(".dt-column-header"));

    if (filterOptions.length == 0) {
      options.append(`<div class="${columnName}">
                                <ui class="filter-menu-option menu sticky top-0 bg-white pb-2 pl-1 border-b"></ui>
                                <div class="filter-menu-data border p-2"></div>
                            </div>`);
    }

    const container = $(`.${columnName} .filter-menu-option`);
    // Search
    if (container.find(".filter-search").length == 0) {
      container.prepend(`<div class="!flex justify-center">
                                    <input type="text" name="filter-search" class="input input-xs input-bordered w-full pl-2 mx-1 filter-search" placeholder="Search here">
                                </div>`);
    }
    // Select all
    if (container.find(".filter-select-all").length == 0) {
      container.prepend(`<div class="cursor-pointer block  ">
                                    <label class="text-sm cursor-pointer block mb-[5px]">
                                        <input type="checkbox" name="filter-select-all" class="filter-select-all" checked>
                                        Select All
                                    </label>
                                </div>`);
    }
    // Clear
    if (container.find(".filter-clear").length == 0) {
      container.prepend(`<li class="filter-clear block  cursor-pointer ">
                                    <span class="!pl-0">
                                        <i class="icofont-ui-close text-sm text-red-500"></i>
                                        Clear
                                    </span>
                                </li>`);
    }
    // Sort z-a
    if (container.find(".filter-sortZA").length == 0) {
      container.prepend(`<li class="filter-sortZA cursor-pointer  block ">
                                    <span class="!pl-0">
                                        <i class="icofont-sort-alt "></i>
                                        Sort Z to A
                                    </span>
                                </li>`);
    }
    // Sort a-z
    if (container.find(".filter-sortAZ").length == 0) {
      container.prepend(`<li class="filter-sortAZ cursor-pointer  block ">
                                    <span class="!pl-0">
                                        <i class="icofont-sort-alt "></i>
                                        Sort A to Z
                                    </span>
                                </li>`);
    }
  });

  /**
   * Open filter menu
   */
  $(`#${tableId}`).on("click", ".filter-icon", async function (e) {
    hide();
    const menu = $("#filter-menu");
    const columnIndex = table.column($(this).closest("th")).index();
    const column = table.column(columnIndex);
    const columnName = `filterHeader-${tableId}-${columnIndex}`;
    const filterOptions = $(`#filter-options .${columnName} .filter-menu-data`);

    // console.log('filtername',columnName);

    $(`.${columnName}`).removeClass("hidden");
    $("#filter-menu").attr("current-column", columnIndex);

    const columnData = column
      .data()
      .unique()
      .sort((a, b) => {
        const columnName = column.dataSrc(); // ดึงชื่อ column จาก data attribute
        // console.log('Column Data Name:', columnName, 'header name : ',column.header().textContent.trim(),'a : ', a,'b : ', b);

        if (columnName === "CST") {
          // console.log(true);

          // Map CST values
          const mapCST = {
            1: "Running",
            2: "Approve",
            3: "Reject",
          };
          a = mapCST[a] || a;
          b = mapCST[b] || b;
        }
        if (!isNaN(a) && !isNaN(b)) {
          return a - b; // Sort numerically if both are numbers
        }
        // if (a === null || b === null) {
        //     return 0; // Handle null values
        // }
        if (a === null || a === undefined || a === "") return -1;
        if (b === null || b === undefined || b === "") return 1;
        return a.localeCompare(b); // Sort lexicographically if both are strings
      });
    // console.log(columnData);

    columnData.each(function (value) {
      const columnName = column.dataSrc(); // ดึงชื่อ column จาก data attribute
      // console.log('Column Data Name:', columnName, 'header name : ',column.header().textContent.trim(),'a : ', a,'b : ', b);

      var val = value === null ? "" : value;
      if (columnName === "CST") {
        // console.log(true);

        // Map CST values
        const mapCST = {
          1: "Running",
          2: "Approve",
          3: "Reject",
        };
        val = mapCST[val] || val;
      }
      // console.log(val);

      const displayValue = val ? val : "(Blank)";
      if (filterOptions.find(`input[value="${val}"]`).length === 0) {
        filterOptions.append(
          `<label class="text-sm cursor-pointer filter-list block mb-[5px]"><input type="checkbox" value="${val}" checked> ${displayValue}</label>`
        );
      }
    });

    menu
      .css({
        // top: e.pageY + 5,
        // left: e.pageX
        top: Math.min(
          e.pageY + 5,
          window.innerHeight - menu.outerHeight() - 10
        ),
        left: Math.min(e.pageX, window.innerWidth - menu.outerWidth() - 10),
      })
      .fadeIn();
  });

  /**
   * Filter Search
   */
  $(document).on("keyup", ".filter-search", function () {
    const columnIndex = parseInt($("#filter-menu").attr("current-column"));
    const searchTerm = $(this).val().toLowerCase();
    const columnName = `filterHeader-${tableId}-${columnIndex}`;
    const filterOptions = $(
      `#filter-options .${columnName} .filter-menu-data label`
    );
    const selectAll = $(this)
      .closest(".filter-menu-option")
      .find(".filter-select-all");
    if (selectAll.is(":checked")) {
      selectAll.trigger("click");
      // selectAll.prop('checked', false);
    }
    // $('.filter-select-all').trigger('click');

    filterOptions.each(function () {
      const label = $(this);
      const input = $(this).find("input");

      const text = input.val().toLowerCase();
      // console.log(input, text);
      if (text.includes(searchTerm)) {
        label.show();
      } else {
        label.hide();
      }
    });
  });

  /**
   * Sort A-Z
   */
  $(document).on("click", ".filter-sortAZ", function () {
    const columnIndex = parseInt($("#filter-menu").attr("current-column"));
    table.settings()[0].aoColumns[columnIndex].bSortable = true;
    // console.log('sort AZ',columnIndex, table, table.settings()[0].aoColumns[columnIndex]);

    table.order([columnIndex, "asc"]).draw(); // A-Z
    table.settings()[0].aoColumns[columnIndex].bSortable = false;
    $(".dt-column-order").addClass("hidden"); // ซ่อนปุ่มเรียงลำดับs
    $(".dt-orderable-asc.dt-orderable-desc.dt-ordering-desc").addClass(
      "!pr-2.5"
    ); // ซ่อนปุ่มเรียงลำดับs
  });

  /**
   * Sort Z-A
   */
  $(document).on("click", ".filter-sortZA", function () {
    const columnIndex = parseInt($("#filter-menu").attr("current-column"));
    table.settings()[0].aoColumns[columnIndex].bSortable = true;
    table.order([columnIndex, "desc"]).draw(); // A-Z
    table.settings()[0].aoColumns[columnIndex].bSortable = false;

    $(".dt-column-order").addClass("hidden"); // ซ่อนปุ่มเรียงลำดับs
    $(".dt-orderable-asc.dt-orderable-desc.dt-ordering-desc").addClass(
      "!pr-2.5"
    ); // ซ่อนปุ่มเรียงลำดับs
    // }
  });

  /**
   * Clear filter
   */
  $(document).on("click", ".filter-clear", function () {
    // console.log('clear');

    const columnIndex = $("#filter-menu").attr("current-column");
    const menuOption = $(this).closest(".filter-menu-option");
    const ok = menuOption
      .closest("#filter-options")
      .siblings(".buttons")
      .find("#filter-ok");
    const selectAll = menuOption.find(".filter-select-all");
    if (!selectAll.is(":checked")) {
      selectAll.trigger("click");
      ok.trigger("click");
    }
    $(`th[data-dt-column="${columnIndex}"]`)
      .find(".icofont-filter")
      .removeClass("text-black")
      .addClass("text-gray-300");
  });

  // Apply filter
  $(document).on("click", "#filter-ok", function () {
    // console.log('filter ok');

    const columnIndex = $("#filter-menu").attr("current-column");

    const selectedValues = $(
      `.filterHeader-${tableId}-${columnIndex} input[type="checkbox"]:checked`
    )
      .not(".filter-select-all")
      .map(function () {
        return `^${$.fn.dataTable.util.escapeRegex($(this).val())}$`;
      })
      .get()
      .join("|");
    // console.log(columnIndex, selectedValues);
    table.column(columnIndex).search(selectedValues, true, false).draw();
    $("#filter-menu").fadeOut();
    $(`th[data-dt-column="${columnIndex}"]`)
      .find(".icofont-filter")
      .removeClass("text-gray-300")
      .addClass("text-black");
  });

  /**
   * Select all filter
   */
  $(document).on("click", ".filter-select-all", function () {
    // console.log('select all');

    const columnIndex = $("#filter-menu").attr("current-column");
    const filterData = `.filterHeader-${tableId}-${columnIndex}`;
    const filter = $(this).closest(`${filterData}`);
    // console.log('select all', columnIndex, filter);
    // console.log('filter',`filterHeader-${tableId}-${columnIndex}`);

    const isChecked = filter.find(this).is(":checked");
    if (isChecked) {
      filter.find(".filter-menu-data label").show();
      filter.find(".filter-search").val("");
      $(`th[data-dt-column="${columnIndex}"]`)
        .find(".icofont-filter")
        .removeClass("text-black")
        .addClass("text-gray-300");
    }
    $(`${filterData} input[type="checkbox"]`).prop("checked", isChecked);
  });

  // Uncheck select all when any checkbox is unchecked
  $(document).on("click", '.filter-list input[type="checkbox"]', function () {
    if ($(".filter-select-all").is(":checked")) {
      $(".filter-select-all").prop("checked", false);
    }
  });

  // Cancel filter
  $(document).on("click", "#filter-cancel", function () {
    $("#filter-menu").fadeOut();
    hide();
  });

  // Hide filter menu when clicking outside
  $(document).on("click", function (e) {
    if (!$(e.target).closest("#filter-menu, .filter-icon").length) {
      $("#filter-menu").fadeOut();
      hide();
    }
  });

  /**
   * Hide filter menu
   */
  function hide() {
    columns.forEach((columnIndex) => {
      // console.log(columnIndex);
      if ($(`.filterHeader-${tableId}-${columnIndex}`)) {
        $(`.filterHeader-${tableId}-${columnIndex}`).addClass("hidden");
      }
    });
  }

  /**
   * Helper function to parse column ranges
   * @param {string} columnsToFilter
   * @param {number} totalColumns 10
   * @returns
   */
  function parseColumns(columnsToFilter, totalColumns) {
    const columnSet = new Set();
    const parts = columnsToFilter.split(",");
    parts.forEach((part) => {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map(Number);
        for (let i = start; i <= end; i++) {
          if (i >= 0 && i < totalColumns) {
            columnSet.add(i);
          }
        }
      } else {
        const index = parseInt(part, 10);
        if (index >= 0 && index < totalColumns) {
          columnSet.add(index);
        }
      }
    });
    return [...columnSet];
  }
}

var scrollTimeout;
/**
 * Set scroll
 * @param {string} id ของตาราง e.g. tablelist
 */
function setupScrolling(id) {
  var scrollBody = $("#" + id + "_wrapper .table-body");
  if (scrollBody.length) {
    scrollBody.on("scroll", function () {
      var scrollTop = $(this).scrollTop();
      var scrollLeft = $(this).scrollLeft();
      // Clear the previous timeout
      clearTimeout(scrollTimeout);

      // Set a new timeout to capture the scroll position after scrolling stops
      scrollTimeout = setTimeout(function () {
        // Store the scroll position
        localStorage.setItem("scrollTop", scrollTop);
        localStorage.setItem("scrollLeft", scrollLeft);
      }, 100); // Adjust the timeout as needed
    });
  } else {
    console.error("Scroll body not found");
  }
}

/**
 * ฟังก์ชันเพื่อเลื่อนไปทางขวาสุด
 * @param {string} id ของตาราง e.g. tablelist
 */
export function scrollToRight(id) {
  var scrollBody = $("#" + id + "_wrapper .table-body"); // เลือกส่วนที่ต้องการเลื่อน
  if (scrollBody.length) {
    // var ScrollTop = localStorage.getItem("scrollTop") || 0;
    // scrollBody.scrollLeft(scrollBody[0].scrollWidth); // เลื่อนไปขวาสุด
    // scrollBody.scrollTop(ScrollTop); // เลื่อนกลับมาตำแหน่งเดิมในแนวตั้ง
    scrollBody.animate(
      {
        scrollLeft: scrollBody[0].scrollWidth,
      },
      1000
    );
  } else {
    console.error("Scroll body not found");
  }
}

/**
 * เลื่อนไปยังตำแหน่งล่างสุด
 * @param {string} id ของตาราง e.g. tablelist
 */
export function scrollToBottom(id) {
  var scrollBody = $("#" + id + "_wrapper .table-body");
  if (scrollBody.length) {
    scrollBody.animate(
      {
        scrollTop: scrollBody[0].scrollHeight,
      },
      1000
    );
  } else {
    console.error("Scroll body not found");
  }
}
