import { host } from "../../utils.js";
import { tableOption } from "../../inc/_dataTable.js";
$(document).ready(async function () {
  const table = $("#inchargeTable").DataTable({
    ...tableOption,
    ajax: {
      url: host + "/isform/IS-RGV/main/getIncharge",
      type: "GET",
      dataSrc: "",
    },
    columns: [
      {
        data: "PROGRAM",
        title: "Program",
        className: "border-2 border-gray-300",
      },
      {
        data: "ORG_CODE",
        title: "Org Code",
        className: "border-2 border-gray-300 text-left",
      },
      {
        data: "ORG_NAME",
        title: "Org Name",
        className: "border-2 border-gray-300 text-left",
      },
      {
        data: "PIC",
        title: "PIC",
        className: "border-2 border-gray-300",
        render: function (data, type, row) {
          const value = data ?? "";
          return `<span class="pic-text">${value}</span>
                      <input class="pic-input input input-sm rounded-xl hidden max-w-[100px] border border-gray-400 px-1" value="${value}" />`;
        },
        createdCell: function (td) {
          td.style.width = "10%"; // จำกัดความกว้างของ td
          td.style.whiteSpace = "nowrap";
        },
      },
      {
        data: null,
        title: "#",
        className: "border-2 border-gray-300 text-center",
        render: function (data, type, row) {
          return `
            <button class="btn btn-sm rounded-lg btn-edit btn-warning">Edit</button>
            <button class="btn btn-sm rounded-lg btn-success hidden btn-save">Save</button>
            <button class="btn btn-sm rounded-lg btn-error hidden btn-cancel">Cancel</button>
            `;
        },
        createdCell: function (td) {
          td.style.width = "15%"; // จำกัดความกว้างของ td
          td.style.whiteSpace = "nowrap";
        },
      },
    ],
    responsive: true,
  });

  // กด Edit -> ซ่อน span แสดง input + ปุ่ม Save
  $("#inchargeTable tbody").on("click", ".btn-edit", function () {
    const row = $(this).closest("tr");
    const span = row.find(".pic-text");
    const input = row.find(".pic-input");

    input.data("old-value", input.val()); // บันทึกค่าเดิมก่อนแก้
    span.addClass("hidden");
    input.removeClass("hidden").focus();

    row.find(".btn-edit").addClass("hidden");
    row.find(".btn-save, .btn-cancel").removeClass("hidden");
  });

  $("#inchargeTable tbody").on("click", ".btn-cancel", function () {
    const row = $(this).closest("tr");
    const span = row.find(".pic-text");
    const input = row.find(".pic-input");

    const oldValue = input.data("old-value");
    input.val(oldValue); // ย้อนกลับค่าเดิม
    span.text(oldValue);

    span.removeClass("hidden");
    input.addClass("hidden");
    row.find(".btn-edit").removeClass("hidden");
    row.find(".btn-save, .btn-cancel").addClass("hidden");
  });

  $("#inchargeTable tbody").on("click", ".btn-save", function () {
    const row = $(this).closest("tr");
    const rowData = table.row(row).data();
    const input = row.find(".pic-input");
    const newPic = input.val();

    $.ajax({
      url: host + "/isform/IS-RGV/main/updatePic",
      type: "POST",
      data: {
        program: rowData.PROGRAM,
        org_code: rowData.ORG_CODE,
        PIC: newPic,
      },
      beforeSend: function () {
        // $(".container").addClass("cursor-wait");
      },
      success: function (res) {
        // console.log(res);
        table.ajax.reload(null, false);
      },
      complete: function () {
        // $(".container").removeClass("cursor-wait");
      },
      error: function () {
        alert("เกิดข้อผิดพลาด");
      },
    });
  });

  $(".filter-btn").on("click", function () {
    const program = $(this).data("filter");

    if (program === "all") {
      table.column(0).search("").draw(); // ล้าง filter
    } else {
      table
        .column(0)
        .search("^" + program + "$", true, false)
        .draw(); // filter แบบ exact match
    }

    $(".filter-btn").removeClass("btn-info"); // ถ้ามี CSS ที่เปลี่ยนสีปุ่ม active
    $(this).addClass("btn-info");
  });
});
