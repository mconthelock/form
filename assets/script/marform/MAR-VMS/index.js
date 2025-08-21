import { getAllAttr, logFormData, requiredForm, showMessage } from "../../public/v1.0.3/jFuntion";
import { showLoader } from "../../public/v1.0.3/preloader";
import { host } from "../../utils";
import { createTable, destroyTable} from "../../public/v1.0.3/_dataTable";
import { formatAvatar, s2disableSearch, setSelect2 } from "../../public/v1.0.3/_select2";
import { createForm, redirectWebflow } from "../../inc/_form.js";
import Swal from "sweetalert2";

var formInfo, userIncharge, users, items, qcsection, division, department, section, tablesch , tablevisitor , tableemp , tablesec , tablepro , tablepst , tableist;
$(document).ready(function () {
  $("#salecom").select2();
  /*
  $(".participants-select").select2(
    {
     multiple:true,
     placeholder:'Select Participants',
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

    });*/


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
  const $placeInput = $("#lunchPlace");

  if (value === "I") {
    $placeInput.val("VIPCanteenRoom").prop("readonly", true);
  } else if (value === "outside") {
    $placeInput.val("").prop("readonly", false);
  } else {
    $placeInput.val("").prop("readonly", false);
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
let isValid = (tab === "visitarg") ? validateVisitTab(form)
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

function buildFormData(form, extraData = {}) {
  const formData = new FormData(form[0]);
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