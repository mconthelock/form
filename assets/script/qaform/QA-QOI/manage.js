import {
  ajaxOptions,
  getData,
  showMessage,
  requiredForm,
} from "../../jFuntion";
import { host, showLoader } from "../../utils";
import { createTable } from "../../inc/_dataTable";
import { createColumnFilters } from "../../inc/_filter.js";
import { excelOptions, exportExcel, defaultExcel } from "../../inc/_excel.js";

var table;
var dwgData;
const columns = [
  {
    data: "MON",
    title: "Month",
    width: "10%",
  },
  {
    data: "DWGNO",
    title: "Drawing No",
    width: "20%",
    render: function (data, type, row, meta) {
      return data == null ? row.SPEC : data;
    },
  },
  {
    data: "ITMNO",
    title: "Item No.",
    width: "10%",
  },
  { data: "PARTNAME", title: "Part Name", width: "25%" },
  { data: "SUBCONNAME", title: "Supplier or Subcontrector Name ", width: "15%" },
  { data: "REMARK", title: "Remark", width: "20%" },
  {
    data: "MID",
    title: "Action",
    width: "5%",
    render: function (data, type, row, meta) {
      return `<div class="flex items-center justify-center gap-3">
            <label for="drawer-master" class="drawer-button btn btn-sm btn-ghost btn-circle edit-dwg tooltip flex items-center "  data-tip="Edit">
                        <i class="icofont-ui-edit text-base"></i>
                    </label>
                    <button class="drawer-button btn btn-sm btn-ghost btn-circle confirm tooltip"  data-tip="Delete" onclick="modal_delete.showModal()">
                        <i class="icofont-ui-delete text-base"></i>
                    </button>
                    </div>`;
    },
  },
];
$(document).ready(async function () {
 /* var monfilter = localStorage.getItem("monfilter");
  if (monfilter === null) {
    localStorage.setItem("monfilter", "");
    monfilter = localStorage.getItem("monfilter");
  }*/
  table = await createTableDwg();
});

$(document).on("click", "#previousFY", async function () {
  showLoader();
  const e = $("#year");
  const year = parseInt(e.html()) - 1;
  e.html(year);
  window.location.assign(host + `qaform/QA-QOI/manage/main/${year}`);
});

$(document).on("click", "#nextFY", async function () {
  showLoader();
  const e = $("#year");
  const year = parseInt(e.html()) + 1;
  e.html(year);
  window.location.assign(host + `qaform/QA-QOI/manage/main/${year}`);
});
/**
 *  select checkbox all
 */
$(document).on("click", "#chkall", async function () {
  $(".sch").prop("checked", this.checked);
});

/**
 * Add drawing
 */
$(document).on("click", "#add-dwg", async function (e) {
  $("#headeritem").text("Add Drawing");
  $("#drawing-form").trigger("reset");
  $('[data-map="ATTFILE"]').empty();
});

/**
 * Edit drawing
 */
$(document).on("click", ".edit-dwg", async function (e) {
  $('[data-map="ATTFILE"]').empty();
  $('#DWGFILE').val('');
  $('#SPECFILE').val('');
  $("#headeritem").text("Edit Drawing");
  const data = table.row($(this).parents("tr")).data();


  const frm = $("#drawing-form");
  for (const [key, value] of Object.entries(data)) {
    const target = frm.find(`[data-map="${key}"]`);

    if (target.is("select")) {
      target.val(value).trigger("change");
    } else if (target.is("input[type='checkbox']")) {

      if (typeof value === "string" && value.includes(",")) {
        const values = value.split(",").map((v) => v.trim());
        frm.find(`[data-map="${key}"]`).each(function () {
          $(this).prop("checked", values.includes($(this).val()));
        });
      } else {
        frm.find(`[data-map="${key}"]`).each(function () {
          $(this).prop("checked", $(this).val() == value);
        });
      }
    }else if(key === "ATTFILE")
    {
        const p = $("#path").val();
        
        const container = frm.find(`[data-map="${key}"]`);
        container.empty();
  
        const files = typeof value === "string" ? value.split(",") : [];
  
        files.forEach((entry) => {
          const [fileId, filename,ofilename,filetype] = entry.split("|");
          const iconClass = filetype === "D" ? "icofont-image" : "icofont-file-document";
          const fileItem = $(`
            <div class="file-item"  data-id="${fileId}" data-filename="${filename}">
              <a href="${host}qaform/QA-QOI/manage/mdownload/${filename}/${ofilename}" target="_blank" class="file-link"><i class="${iconClass}" style="margin-right: 4px;color: #007bff;"></i> ${ofilename}</a>
              <i class="icofont-close-line-circled delete-file" style="color: red; font-size: 20px;  margin-left: 8px; vertical-align: middle; cursor: pointer;"></i>
            </div>
          `);
  
          container.append(fileItem);
        });

    }else {
      target.val(value);
    }
  }
});

/**
 * Cancle drawer
 */
$(document).on("click", "#cancle", function () {
  $("#drawer-master").prop("checked", false);
  $("#drawer-master").trigger("change");
});

/**
 * Set delete
 */
$(document).on("click", ".confirm", function () {
  const data = table.row($(this).parents("tr")).data();
  const mid = data.MID;
  const mon = data.MONNUM;
  $("#del").attr("d-mid", mid);
  $("#del").attr("d-mon", mon);
});

/**
 * Delete Schedule
 */
$(document).on("click", ".del", async function () {
  const mid = $(this).attr("d-mid");
  const mon = $(this).attr("d-mon");
  const data = { mid: mid, mon: mon };
  const dwgmst = await deletesch(data);
  if (dwgmst.status == true) {
     table = await createTableDwg();
    showMessage("Deleted successfully.", "success");
  } else {
    showMessage("Failed to delete data. Please try again.", "error");
  }
});


/**
 * Delete file
 */
 $(document).on("click", ".delete-file", async function () {
  $(this).closest('.file-item').remove();
  var fid = $(this).closest('.file-item').attr("data-id");
  var nfile =  $(this).closest('.file-item').attr("data-filename");
  const data = { fid: fid, nfile: nfile };
  const resdel =  await deletefile(data);
  table = await createTableDwg();
});


/**
 * Save
 */
$(document).on("click", "#save-dwg", async function () {
  const btn = $(this);
  const frm = $("#drawing-form");
  let checkVal = true;
  if (!(await requiredForm("#drawing-form"))) return;
  var formData = new FormData(frm[0]);
  btn.addClass("loaded");
  btn.find(".loading").removeClass("hidden");
  const dwgmst = await save(formData);
  if (dwgmst.status == true) {
    table = await createTableDwg();
    showMessage("Saved successfully.", "success");
  } else {
    showMessage("Failed to save data,Please try again.", "error");
  }

  btn.removeClass("loaded");
  btn.find(".loading").addClass("hidden");
  $("#drawer-master").prop("checked", false);
});


/**
 * Create export excel
 */
$(document).on('click','#exportExcel', function(){
  const year = parseInt($("#year").html());
  var now = new Date();
  var timestamp = 
    ('0' + now.getDate()).slice(-2) +
    ('0' + (now.getMonth() + 1)).slice(-2) +
    now.getFullYear() +
    ('0' + now.getHours()).slice(-2) +
    ('0' + now.getMinutes()).slice(-2) +
    ('0' + now.getSeconds()).slice(-2);
  var fileName = `DrawingMasterFY${year}_${timestamp}`;
  const opt = {...excelOptions};
  opt.sheetName = 'Drawing Master';
  const columns = [
       {header : 'Month' , key : 'MONSTR'},
       {header : 'Drawing' , key : 'DWGNO'},
       {header : 'Spec'    , key : 'SPEC'},
       {header : 'Itemno'     , key : 'ITMNO'},
       {header : 'Supplier or subcontractor name'     , key : 'SUBCONNAME'},
       {header : 'Part Name'     , key : 'PARTNAME'},
       {header : 'Remark'     , key : 'REMARK'},
       {header : 'Path Dwg'     , key : 'PATHDWG'},
       {header : 'Path Spec'     , key : 'PATHSPEC'},
      ];
  const workbook = defaultExcel(dwgData, columns, opt);
  exportExcel(workbook, fileName);
});

//Button fillter 
/*$(document).on('click','.filter-btn-dt', function(){
  var mon = $(this).attr('data-filter');
  localStorage.setItem("monfilter", mon);

});*/

/**
 * Create table
 * @param {array} data
 * @returns
 */
async function createTableDwg() {
  var mtable;
  const year = parseInt($("#year").html());
  dwgData = await getData({
    ...ajaxOptions,
    url: host + "qaform/QA-QOI/manage/get_qoi_schedule",
    data: { year: year },
  });
  mtable = createTable(
    "#table",
    {
      data: dwgData,
      ordering: false,
      columns: columns,
    },
    {
      join: true,
      buttonFilter: { status: true, column: "0" },
    }
  );
  $("#table").find("thead").removeClass("bg-white");
  $("#table").find("thead").addClass("bg-blue-200");
  $(`#table_wrapper .table-option`).append(`
    <label for="" class="btn btn-sm flex items-center max-w-xs tooltip tooltip-left
    bg-transparent text-gray-800 rounded-l-md
    hover:bg-gray-300 hover:text-black
    transition-colors duration-200
" data-tip="Export Excel" id="exportExcel" tableID="#table">
    <i class="icofont-file-excel text-xl"></i>
</label>
<label for="drawer-master" class="btn btn-sm flex items-center max-w-xs tooltip tooltip-left
    bg-transparent text-gray-800 rounded-r-md
    hover:bg-gray-300 hover:text-black
    transition-colors duration-200
" data-tip="Add" id="add-dwg" tableID="#table">
    <i class="icofont-plus-circle text-xl"></i>
</label>
    `);
  return mtable;
}

/**
 * Save Dwg
 * @param {array} data
 * @returns
 */
function save(data) {
  return new Promise((resolve) => {
    $.ajax({
      url: host + "qaform/QA-QOI/manage/save",
      type: "post",
      dataType: "json",
      processData: false,
      contentType: false,
      data: data,
      beforeSend: function () {
        showLoader(true);
      },
      success: function (res) {
        resolve(res);
      },
      complete: function (xhr, status) {
        showLoader(false);
      },
    });
  });
}




/**
 * Delete schedule
 * @param {array} data
 * @returns
 */
function deletesch(data) {
  return new Promise((resolve) => {
    $.ajax({
      url: host + "qaform/QA-QOI/manage/del",
      type: "post",
      dataType: "json",
      data: data,
      beforeSend: function () {
        showLoader(true);
      },
      success: function (res) {
        resolve(res);
      },
      complete: function (xhr, status) {
        showLoader(false);
      },
    });
  });
}

/**
 * Delete file
 * @param {array} data
 * @returns
 */
 function deletefile(data) {
  return new Promise((resolve) => {
    $.ajax({
      url: host + "qaform/QA-QOI/manage/delfile",
      type: "post",
      dataType: "json",
      data: data,
      beforeSend: function () {
        showLoader(true);
      },
      success: function (res) {
        resolve(res);
      },
      complete: function (xhr, status) {
        showLoader(false);
      },
    });
  });
}


