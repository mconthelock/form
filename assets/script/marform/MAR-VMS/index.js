import { getAllAttr, logFormData, requiredForm, showMessage } from "../../public/v1.0.3/jFuntion";
import { showLoader } from "../../public/v1.0.3/preloader";
import { host } from "../../utils";
import { createTable, destroyTable} from "../../public/v1.0.3/_dataTable";
import { formatAvatar, s2disableSearch, setSelect2 } from "../../public/v1.0.3/_select2";
import { createForm, redirectWebflow } from "../../inc/_form.js";
import Swal from "sweetalert2";

var formInfo, userIncharge, users, items, qcsection, division, department, section, tablesch , tablevisitor , tableemp , tablesec , tablepro , tablepst , tableist;
$(document).ready(function () {
  const $modal = $('#modal');
  const $versionInput = $('#formVersion');
  const $newVersionInput = $('#newVersion');
    $("#salecom").select2();
    $("#receptionRoom").select2();
    $("#lunchPlaceSelect").select2();
    $(".pst-select").select2(
      {
       multiple:false,
       placeholder:'',
       allowClear: true,
       matcher:customMatcher,
       templateResult:function(data)
       {
          if(!data.id) return data.text;
          let div = $(data.element).data('div');
          let dep = $(data.element).data('dep');
          let sec = $(data.element).data('sec');
          let pos = $(data.element).data('pos');
          return $('<span>' + data.text + '</span>');
       },
       templateSelection: function(data) {
        return data.text; // แสดงเฉพาะชื่อหลังเลือก
      }
  
      });
    
      $(".ist-select").select2(
        {
         multiple:false,
         placeholder:'',
         allowClear: true,
         matcher:customMatcher,
         templateResult:function(data)
         {
            if(!data.id) return data.text;
            let div = $(data.element).data('div');
            let dep = $(data.element).data('dep');
            let sec = $(data.element).data('sec');
            let pos = $(data.element).data('pos');
            return $('<span>' + data.text + '</span>');
         },
         templateSelection: function(data) {
          return data.text; // แสดงเฉพาะชื่อหลังเลือก
        }
    
        });
      
        $(".emp-select").select2(
          {
           multiple:false,
           placeholder:'',
           allowClear: true,
           matcher:customMatcher,
           templateResult:function(data)
           {
              if(!data.id) return data.text;
              let div = $(data.element).data('div');
              let dep = $(data.element).data('dep');
              let sec = $(data.element).data('sec');
              let pos = $(data.element).data('pos');
              return $('<span>' + data.text + '</span>');
           },
           templateSelection: function(data) {
            return data.text; // แสดงเฉพาะชื่อหลังเลือก
          }
      
          });

          $('#dietary_require').select2({
            tags: true,               // เปิดให้พิมพ์ค่าใหม่เอง
            placeholder: "",
            allowClear: true
          });
 
       
          $(".dietary_require").on("select2:selecting", function (e) {
            let data = e.params.args.data;
            let $select = $(this);
          
            if (data.id === "Food Allergies") {
              e.preventDefault(); // กันไม่ให้ Food Allergies ถูกเลือกจริง
              let customText = prompt("Please specify your food allergy:");
              if (customText) {
                let newVal = "Food Allergies – " + customText;
                let newOption = new Option(newVal, newVal, true, true);
                $select.append(newOption).trigger("change");
              }
            }
          
            if (data.id === "Other") {
              e.preventDefault(); // กันไม่ให้ Other ถูกเลือกจริง
              let customText = prompt("Please specify:");
              if (customText) {
                let newVal = "Other – " + customText;
                let newOption = new Option(newVal, newVal, true, true);
                $select.append(newOption).trigger("change");
              }
            }
          });
          

         /* $('#dietary_require').on('select2:select', function(e) {
            var data = e.params.data;
            var selected = data.text;
        
            // ถ้าเลือก Food Allergies หรือ Other แล้ว user พิมพ์เพิ่ม
            if (selected !== "Food Allergies" && selected !== "Other") return;
        
            // prompt ให้ user กรอกเพิ่ม
            var extra = prompt("Please specify:"); 
            if (extra) {
              var finalText = selected + " – " + extra;
        
              // เอาค่าใหม่ใส่แทน
              var newOption = new Option(finalText, finalText, true, true);
              $('#dietary_require').append(newOption).trigger('change');
        
              // ลบ option เดิมออก (กันไม่ให้มี "Food Allergies" ลอยๆ)
              $('#dietary_require').find("option[value='" + selected + "']").prop("selected", false);
              $('#dietary_require').trigger('change');
            }
          });*/

        $(document).on('click', '#updateBtn', function() {
            $('#newVersion').val($('#formVersion').val());
            $('#modal').removeClass('hidden').addClass('flex');
        });
        
        $(document).on('click', '#cancelBtn', function() {
            $('#modal').removeClass('flex').addClass('hidden');
        });
        
        $(document).on('click', '#saveBtn', function() {
            const newVersion = $('#newVersion').val();
            $.ajax({
                url: host + "marform/MAR-VMS/form/update_form_version",
                type: "post",
                dataType: "json",
                data: {formVersion:newVersion},
                success: function(data) {
                
                      if(data.status) {
                        $('#formVersion').val(newVersion); // อัปเดต input เฉพาะเมื่อ save สำเร็จ
                        $('#modal').removeClass('flex').addClass('hidden');
                    } else {
                          Swal.fire({
                            icon: "error",
                            title: "Failed to update form version",
                            text: "Please try again",
                          });
                    }
        
                },
                error: function(err) { 
              
                  console.error(err); 
                
                }
            });
        
            $('#modal').removeClass('flex').addClass('hidden');
        });
        


});

$(async function(){
tablesch = await createTable({
  //data:data,
    // columns: [
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    // ],
  ordering: false,
  paging: false,
  searching: false,
  info: false
},{
  id: '#tablesch',
  columnSelect:{status: true},
  domScroll: {status: true, maxHeight: '21rem', type: 'tailwind4'},
  join: true
});

tablevisitor = await createTable({
  //data:data,
    // columns: [
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    // ],
  ordering: false,
  paging: false,
  searching: false,
  info: false
},{
  id: '#tablevisitor',
  columnSelect:{status: true},
  domScroll: {status: true, maxHeight: '21rem', type: 'tailwind4'},
  join: true
});

tableemp = await createTable({
  //data:data,
    // columns: [
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    // ],
  ordering: false,
  paging: false,
  searching: false,
  info: false
},{
  id: '#tableemp',
  columnSelect:{status: true},
  domScroll: {status: true, maxHeight: '21rem', type: 'tailwind4'},
  join: true
});

tablesec = await createTable({
  //data:data,
    // columns: [
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    // ],
  ordering: false,
  paging: false,
  searching: false,
  info: false
},{
  id: '#tablesec',
  columnSelect:{status: true},
  domScroll: {status: true, maxHeight: '21rem', type: 'tailwind4'},
  join: true
});
tablepro = await createTable({
  //data:data,
    // columns: [
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    // ],
  ordering: false,
  paging: false,
  searching: false,
  info: false
},{
  id: '#tablepro',
  columnSelect:{status: true},
  domScroll: {status: true, maxHeight: '21rem', type: 'tailwind4'},
  join: true
});

tablepst = await createTable({
  //data:data,
    // columns: [
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    // ],
  ordering: false,
  paging: false,
  searching: false,
  info: false
},{
  id: '#tablepst',
  columnSelect:{status: true},
  domScroll: {status: true, maxHeight: '21rem', type: 'tailwind4'},
  join: true
});

tableist = await createTable({
  //data:data,
    // columns: [
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    //   {data: null, title:'test'},
    // ],
  ordering: false,
  paging: false,
  searching: false,
  info: false
},{
  id: '#tableist',
  columnSelect:{status: true},
  domScroll: {status: true, maxHeight: '21rem', type: 'tailwind4'},
  join: true
});
toggleAmecTab();
toggleColumnByHeader('tablevisitor','Lunch Provided', $('#hasLunch').is(':checked'));
toggleColumnByHeader('tablevisitor','Dinner Provided', $('#hasDinner').is(':checked'));
toggleColumnByHeader('tableemp','Lunch Provided', $('#hasLunch').is(':checked'));
toggleColumnByHeader('tableemp','Dinner Provided', $('#hasDinner').is(':checked'));
toggleColumnByHeader('tablevisitor', 'Dietary Requirements',  $('#hasLunch').is(':checked') || $('#hasDinner').is(':checked'));
toggleColumnByHeader('tableemp', 'Dietary Requirements',  $('#hasLunch').is(':checked') || $('#hasDinner').is(':checked'));

});



$(document).on('click', '#addRowBtn', function () {
  const $tableBody = $('#tablesch tbody');
  const $firstRow = $tableBody.find('tr:first');

 // $firstRow.find('.participants-select').select2('destroy');
  const $newRow = $firstRow.clone();

  // เคลียร์ค่าภายใน input และ select
  $newRow.find('input, select').each(function () {
    $(this).val('');
  });


  //initSelect2(".participants-select",$firstRow);
  //initSelect2(".participants-select",$newRow);

    // เพิ่มแถวใหม่ลงใน tbody
    $tableBody.append($newRow);
  //tablesch.row.add($(newRow)[0]).draw(false); // ใช้ [0] เพื่อใส่ element raw HTML
});

$(document).on('click', '#addPstBtn', function () {
  const $tableBody = $('#tablepst tbody');
  const $firstRow = $tableBody.find('tr:first');

  $firstRow.find('.pst-select').select2('destroy');
  const $newRow = $firstRow.clone();

  // เคลียร์ค่าภายใน input และ select
  $newRow.find('input, select').each(function () {
    $(this).val('');
  });


  initSelect2(".pst-select",$firstRow);
  initSelect2(".pst-select",$newRow);

  const rowCount = $tableBody.find('tr').length + 1;
  $newRow.find('td:first').text(rowCount);

    // เพิ่มแถวใหม่ลงใน tbody
    $tableBody.append($newRow);
  //tablesch.row.add($(newRow)[0]).draw(false); // ใช้ [0] เพื่อใส่ element raw HTML
});


$(document).on('click', '#addIstBtn', function () {
  const $tableBody = $('#tableist tbody');
  const $firstRow = $tableBody.find('tr:first');

  $firstRow.find('.ist-select').select2('destroy');
  const $newRow = $firstRow.clone();

  // เคลียร์ค่าภายใน input และ select
  $newRow.find('input, select').each(function () {
    $(this).val('');
  });


  initSelect2(".ist-select",$firstRow);
  initSelect2(".ist-select",$newRow);

  const rowCount = $tableBody.find('tr').length + 1;
  $newRow.find('td:first').text(rowCount);

    // เพิ่มแถวใหม่ลงใน tbody
    $tableBody.append($newRow);
  //tablesch.row.add($(newRow)[0]).draw(false); // ใช้ [0] เพื่อใส่ element raw HTML
});




$(document).on('click', '#addVisitorBtn', function () {
  const $tableBody = $('#tablevisitor tbody');
  const $firstRow = $tableBody.find('tr:first');

  $firstRow.find('.dietary_require').select2('destroy');
  const $newRow = $firstRow.clone();

  // เคลียร์ค่าภายใน input และ select
  $newRow.find('input, select').each(function () {
    $(this).val('');
  });

  initSelect2(".dietary_require",$firstRow);
  initSelect2(".dietary_require",$newRow);

    // นับจำนวนแถวเพื่อกำหนดหมายเลข No.
    const rowCount = $tableBody.find('tr').length + 1;
    $newRow.find('td:first').text(rowCount);

  // เพิ่มแถวใหม่ลงใน tbody
  $tableBody.append($newRow);
});


$(document).on('click', '#addEmpBtn', function () {

  const $tableBody = $('#tableemp tbody');
  const $firstRow = $tableBody.find('tr:first');
  $firstRow.find('.emp-select').select2('destroy');
  const $newRow = $firstRow.clone();

  // เคลียร์ค่าภายใน input และ select
  $newRow.find('input, select').each(function () {
    $(this).val('');
  });
  
  initSelect2(".emp-select",$firstRow);
  initSelect2(".emp-select",$newRow);
    // นับจำนวนแถวเพื่อกำหนดหมายเลข No.
    const rowCount = $tableBody.find('tr').length + 1;
    $newRow.find('td:first').text(rowCount);

  // เพิ่มแถวใหม่ลงใน tbody
  $tableBody.append($newRow);

});

$(document).on('click', '#addSecBtn', function () {

  const $tableBody = $('#tablesec tbody');
  const $firstRow = $tableBody.find('tr:first');
  const $newRow = $firstRow.clone();

  // เคลียร์ค่าภายใน input และ select
  $newRow.find('input, select').each(function () {
    $(this).val('');
  });

    // นับจำนวนแถวเพื่อกำหนดหมายเลข No.
    const rowCount = $tableBody.find('tr').length + 1;
    $newRow.find('td:first').text(rowCount);

  // เพิ่มแถวใหม่ลงใน tbody
  $tableBody.append($newRow);

});


$(document).on('click', '#addProBtn', function () {

  const $tableBody = $('#tablepro tbody');
  const $firstRow = $tableBody.find('tr:first');
  const $newRow = $firstRow.clone();

  // เคลียร์ค่าภายใน input และ select
  $newRow.find('input, select').each(function () {
    $(this).val('');
  });

    // นับจำนวนแถวเพื่อกำหนดหมายเลข No.
    const rowCount = $tableBody.find('tr').length + 1;
    $newRow.find('td:first').text(rowCount);

  // เพิ่มแถวใหม่ลงใน tbody
  $tableBody.append($newRow);

});



function toggleColumnByHeader(tableId, headerText, isVisible) {
  const $table = $('#' + tableId);
  const $thead = $table.find('thead tr th');
  const $rows = $table.find('tbody tr');

  // หาดัชนีของคอลัมน์โดยใช้ชื่อหัวตาราง
  const index = $thead.filter(function () {
    return $(this).text().trim() === headerText;
  }).index();

  if (index === -1) return;

  // ซ่อน/แสดงหัวตาราง
  $thead.eq(index).toggle(isVisible);

  // ซ่อน/แสดง td ในแต่ละแถว
  $rows.each(function () {
    $(this).find('td').eq(index).toggle(isVisible);
  });
}

function toggleAmecTab() {
 // console.log("TTTTTTTTTTTTT");
  const hasLunch = $('#hasLunch').is(':checked');
  const hasDinner = $('#hasDinner').is(':checked');

  if (hasLunch || hasDinner) {
   // console.log("Iffffffffffffffff");
    $('button[data-tab="tab-meal"]').removeClass('hidden');
  } else {
    //console.log("Elseeeeeeeeeeeeeee");
    $('button[data-tab="tab-meal"]').addClass('hidden');
    //$('#tab4-btn').addClass('hidden');
   // $('#tab4').addClass('hidden');
  }
}


function customMatcher(params, data) {
  if ($.trim(params.term) === '') return data;

  let searchTerms = params.term.toLowerCase().split(/\s+/);

  // ดึงค่าจาก option
  let name = (data.text || '').toLowerCase();
  let div = ($(data.element).data('div') || '').toLowerCase();
  let dep = ($(data.element).data('dep') || '').toLowerCase();
  let sec = ($(data.element).data('sec') || '').toLowerCase();
  let pos = ($(data.element).data('pos') || '').toLowerCase();

  let isMatch = searchTerms.every(term => {
    return name.includes(term) || div.includes(term) || dep.includes(term) || sec.includes(term) || pos.includes(term);
  });

  return isMatch ? data : null;
}

function initSelect2($cls,$context) {
  $context.find($cls).select2({
    placeholder: "",
    allowClear: true, 
    matcher: customMatcher, // ใช้ฟังก์ชัน matcher ที่เขียนไว้
    width: '100%'
  });
}




$(document).on('change', '#hasLunch', function () {
  const showLunch = $('#hasLunch').is(':checked');
  const showDinner = $('#hasDinner').is(':checked');
  toggleAmecTab();
  toggleColumnByHeader('tablevisitor', 'Lunch Provided', showLunch);
  toggleColumnByHeader('tablevisitor', 'Dietary Requirements', showLunch || showDinner);
  toggleColumnByHeader('tableemp', 'Lunch Provided', showLunch);
  toggleColumnByHeader('tableemp', 'Dietary Requirements', showLunch || showDinner);

 
});

$(document).on('change', '#hasDinner', function () {

  const showLunch = $('#hasLunch').is(':checked');
  const showDinner = $('#hasDinner').is(':checked');
  toggleAmecTab();
  toggleColumnByHeader('tablevisitor', 'Dinner Provided', showDinner);
  toggleColumnByHeader('tableemp', 'Dinner Provided', showDinner);
  toggleColumnByHeader('tablevisitor', 'Dietary Requirements', showLunch || showDinner);
  toggleColumnByHeader('tableemp', 'Dietary Requirements', showLunch || showDinner);

  
});

$(document).on("change", ".lunchSelect", function () {
  const value = $(this).val();
  const lunchPlaceSelectDiv = $("#lunchPlaceSelectDiv");
  const lunchPlaceInputDiv = $("#lunchPlaceInputDiv");
  if (value === "I") {
    lunchPlaceSelectDiv.removeClass('hidden');
    lunchPlaceInputDiv.addClass('hidden');
} else if (value === "O") {
    lunchPlaceInputDiv.removeClass('hidden');
    lunchPlaceSelectDiv.addClass('hidden');
} else {
    lunchPlaceSelectDiv.addClass('hidden');
    lunchPlaceInputDiv.addClass('hidden');
}
});

/**
 * Save
 */

 $(document).on("click", ".save-btn", async function () {
const tab = $(this).data("tab");
const formId = "form-" + tab;   // form ไหนที่ถูกกด
const form = $("#" + formId); // อ้างอิง form
const nfrmno = $("#nfrmno").val();
const vorgno = $("#vorgno").val();
const cyear = $("#cyear").val();
let nrunno =  $("#nrunno").val(); 
let cyear2 =  $("#cyear2").val();
if(tab === "visitarg")
{
    if($("#lunch").val() == "I")
    {
        
    }

}


let isValid = (tab === "visitarg") ? validateVisitTab(form)
              : (tab === "req") ? validateReqItemTab(form)
              : true;
if (!isValid) return;
if(nrunno =="")
{
  const vmsform = await createForm(nfrmno, vorgno, cyear, $("#empno").val(), $("#empno").val(), "", 1);
  const { runno: NRUNNO, cyear2: CYEAR2 } = vmsform.message;
  $("#nrunno").val(NRUNNO);
  $("#cyear2").val(CYEAR2);
  nrunno = NRUNNO;
  cyear2 = CYEAR2;
}

const formData = buildFormData(form, {
  "nfrmno": nfrmno,
  "vorgno": vorgno,
  "cyear": cyear,
  "cyear2": cyear2,
  "nrunno":nrunno,
  "tab": tab 
});

try {
  const rssave = await save(formData);
  if (rssave.status == true) { 
    Swal.fire({
      icon: "success",
      title: "Data saved successfully",
      showConfirmButton: false,
      timer: 2000,
    });
    
  } else {
  
    Swal.fire({
      icon: "error",
      title: "Failed to save data",
      text: rssave.message || "Please try again",
    });
  }
} catch (err) {
  Swal.fire({
    icon: "error",
    title: "Error",
    text: err.message,
  });
}

});


$(document).on('change', '.pst-select', function() {
  let selected = $(this).find(":selected");

  let pos  = selected.data("pos");
  let div  = selected.data("div");
  let dep  = selected.data("dep");
  let sec  = selected.data("sec");

  let row = $(this).closest("tr");
  if($(this).val()=="")
  {
    row.find(".pos-col").text("");
    row.find(".dds-col").text("");
  }else
  {
    row.find(".pos-col").text(pos);
    row.find(".dds-col").text(div + " / " + dep + " / " + sec);
  }

});



$(document).on('change', '.ist-select', function() {
  let selected = $(this).find(":selected");

  let pos  = selected.data("pos");
  let div  = selected.data("div");
  let dep  = selected.data("dep");
  let sec  = selected.data("sec");
  let row = $(this).closest("tr");
  if($(this).val()=="")
  {
    row.find(".pos-col").text("");
    row.find(".dds-col").text("");
  }else
  {
    row.find(".pos-col").text(pos);
    row.find(".dds-col").text(div + " / " + dep + " / " + sec);
  }
});


/**
 * Delete file
 */
 $(document).on("click", ".delete-file", async function () {
  $(this).closest('.file-item').remove();
  var fid = $(this).closest('.file-item').attr("data-id");
  var nfile =  $(this).closest('.file-item').attr("data-filename");
  var fd =  $(this).closest('.file-item').attr("data-folder");
  const data = { fid: fid, nfile: nfile , fd:fd };
  const resdel =  await deletefile(data);
});


function buildFormData(form, extraData = {}) {
  const formData = new FormData(form[0]);
  console.log("form id ="+form.attr("id"));
  if (form.attr("id") === "form-sch") {
 
    formData.append("visitDate", $("#visitDate").val());
  }

  for (const key in extraData) {
    if (extraData.hasOwnProperty(key)) {
      formData.append(key, extraData[key]);
    }
  }
  return formData;
}

function validateVisitTab(form) {
  let isValid = true;
  const shoptour = $("#shoptour").val();
  const newFiles = $("#specificAttachment")[0].files; // FileList ของไฟล์ใหม่
  const existingFiles = $("#attachmentDisplay .file-item"); // element ของไฟล์เดิม
  if (!form.find("[name='formVersion']").val()) {
    Swal.fire({
      icon: "warning",
      title: "Please enter Form Version",
      toast: true,
      position: "top-end",
      timer: 3000,
      showConfirmButton: false,
      background: "#FBF6D9",
    });
    isValid = false;
  }
  if (!form.find("[name='salecom']").val()) {
    Swal.fire({
      icon: "warning",
      title: "Please enter Sale company",
      toast: true,
      position: "top-end",
      timer: 3000,
      showConfirmButton: false,
      background: "#FBF6D9",
    });
    isValid = false;
  }
 
  if (shoptour === "S" && newFiles.length === 0 && existingFiles.length === 0) {
    Swal.fire({
      icon: "warning",
      title: "Please attach at least one file for Specific shop tour",
      toast: true,
      position: "top-end",
      timer: 3000,
      showConfirmButton: false,
      background: "#FBF6D9",
    });
    isValid = false;
  }
  if(($("#carHotel").val()=="Y")&&($("#carHotelNote").val()==""))
  {
    Swal.fire({
      icon: "warning",
      title: "Please enter Additional Notes (Car Reservation Hotel)",
      toast: true,
      position: "top-end",
      timer: 3000,
      showConfirmButton: false,
      background: "#FBF6D9",
    });
    isValid = false;
  }

  if($("#hasLunch").is(":checked")) 
  {
    if($("#lunch").val()=="")
    {
        Swal.fire({
          icon: "warning",
          title: "Please enter Lunch Location",
          toast: true,
          position: "top-end",
          timer: 3000,
          showConfirmButton: false,
          background: "#FBF6D9",
        });
        isValid = false;
    }else
    {
       if($("#lunchPlace").val()=="")
       {
          Swal.fire({
            icon: "warning",
            title: "Please enter Place(for Lunch)",
            toast: true,
            position: "top-end",
            timer: 3000,
            showConfirmButton: false,
            background: "#FBF6D9",
          });
          isValid = false;
       }
    }
  }
  if($("#hasDinner").is(":checked")) 
  {
    if($("#dinnerPlace").val()=="")
    {
       Swal.fire({
         icon: "warning",
         title: "Please enter Place (for Dinner)",
         toast: true,
         position: "top-end",
         timer: 3000,
         showConfirmButton: false,
         background: "#FBF6D9",
       });
       isValid = false;
    }
 }
  
  return isValid;
  }
  
  

  function validateReqItemTab(form) {
    let isValid = true;
    const reqitm = $("#requireWelcomeBoard").val();
    const newFiles = $("#welcomeBoardFile")[0].files; // FileList ของไฟล์ใหม่
    const existingFiles = $("#attachmentreqDisplay .file-item"); // element ของไฟล์เดิม
    if ($("#nrunno").val() =="")
    {
      Swal.fire({
        icon: "warning",
        title: "Please complete and save the information in the Visit Arrangement section first.",
        toast: true,
        position: "top-end",
        timer: 3000,
        showConfirmButton: false,
        background: "#FBF6D9",
      });
      isValid = false;

    }
    if (reqitm === "Y" && newFiles.length === 0 && existingFiles.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Please attach at least one file for Welcome Board",
        toast: true,
        position: "top-end",
        timer: 3000,
        showConfirmButton: false,
        background: "#FBF6D9",
      });
      isValid = false;
    }
    return isValid;
  }


/**
 * Save Dwg
 * @param {array} data
 * @returns
 */
 function save(data) {
return new Promise((resolve) => {
  $.ajax({
    url: host + "marform/MAR-VMS/form/save",
    type: "post",
    dataType: "json",
    processData: false,
    contentType: false,
    data: data,
    beforeSend: function () {
      showLoader({ show: true });
    },
    success: function (res) {
      resolve(res);
    },
    complete: function (xhr, status) {
      showLoader({ show: false });
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
      url: host + "marform/MAR-VMS/form/delfile",
      type: "post",
      dataType: "json",
      data: data,
      beforeSend: function () {
        showLoader({ show: true });
      },
      success: function (res) {
        resolve(res);
      },
      complete: function (xhr, status) {
        showLoader({ show: false });
      },
    });
  });
}