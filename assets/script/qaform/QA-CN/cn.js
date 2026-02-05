import { redirectWebflow } from "@amec/webasset/form";
import { host } from "../../utils";
import {showLoader} from "@amec/webasset/preloader";
import "select2";
import "select2/dist/css/select2.min.css";
import flatpickr from "flatpickr";
//import { setDatePicker } from "@public/_flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { ajaxOptions, getAllAttr, getData, showMessage , requiredForm} from "@amec/webasset/utils";
import { showflow, doaction, getFormStatus , getFormno } from "@amec/webasset/api/webform";
import { sendmail } from "@amec/webasset/api/mail";


$(document).ready(async function () {
  const formData = $(".form-data").data();
  flatpickr("#part_date", { dateFormat: "d/m/Y", defaultDate: $("#part_date").val() });
  flatpickr("#submit_date", { dateFormat: "d/m/Y", defaultDate: $("#submit_date").val() });
  flatpickr("#inspec_date", { dateFormat: "d/m/Y", defaultDate: $("#inspec_date").val() });
  flatpickr("#expchg_date", { dateFormat: "d/m/Y", defaultDate: $("#expchg_date").val() });


  const { nfrmno, vorgno, cyear } = formData;
   $(".btn-submit").click(async function () {
       let action = $(this).data("action");
       if (!await requiredForm("#cn-form")) return;
       if(checkData())
        {
            const frm = $("#cn-form");
            var cnformData = new FormData(frm[0]);
            const status = await insertfrm(cnformData);
            console.log(status);
            
        }
        

    });
 
});

$(document).on('change', '.selsec', function () {
  const val = $(this).val();
  $('.chkn').toggleClass('hidden', val !== '2');
  $('.chky').toggleClass('hidden', val !== '1');
  //console.log(val);
  
  //$('.tr-yes').toggleClass('hidden', val !== '1');
  //$('.tr-no').toggleClass('hidden', val !== '2');
});

$(document).on('change', '.selproc', function () {
  const val = $(this).val();
  $('.chke').toggleClass('hidden', val !== '2');
  //console.log(val);
  
  //$('.tr-yes').toggleClass('hidden', val !== '1');
  //$('.tr-no').toggleClass('hidden', val !== '2');
});



$(document).on("click", ".add-table-row", function (e) {
  const tableid =  $(this).attr("data-table");
  const lastRow = $("#"+tableid+" tr:last");
  const newRow = lastRow.clone(); 
  newRow.find("input").val("");
  $("#"+tableid).append(newRow);
});

$(document).on("click", ".add-row", function (e) {
  e.preventDefault();
  const var1 = $(this).attr("data-var1");
  const var2 = $(this).attr("data-var2");
  const maxsize = $(this).attr("data-var3");

  
  add_more(var1 ,  var2, maxsize);
});

$(document).on("click", ".reset-file", function (e) {
  e.preventDefault();
  const container = $(this).closest(".dvSFile");
  container.find('input[type="file"]').val("");
});


$(document).on("click", ".del-table-row", function (e) {
  const tableid =  $(this).attr("data-table");
  const row = $(this).closest("tr");
  const totalRows = $("#"+tableid+" tr").length;
  console.log(totalRows);
  if(totalRows > 1)
  {
    row.remove();
  }
});

function add_more(fl,dv,s) {
  
  var div = document.createElement("DIV");
  var str =
    '<div class="dvSFile flex items-center justify-between gap-2 mb-2"><input type="file" name="' +
    fl +
    '[]" data-map="' +
    fl +'"'+ 'data-max-kb="'+s+'"' +
    ' class="file-input file-input-bordered border-blue-200 w-full" multiple> <button type="button" ';
  str +=
    'class="reset-file btn-square bg-red-200 hover:bg-red-300 text-red-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer" title="Reset file input"> ';
  str +=
    '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg> </button></div>';
  div.innerHTML = str;
  document.getElementById(dv).appendChild(div);
}

$(document).on('focus click', '#txtOther', function () {
   $('input[name="radReason"][value="5"]')
    .prop('checked', true)
    .trigger('change');
});

$(document).on('focus click', '#txtReturn', function () {
   $('input[name="radSample"][value="2"]')
    .prop('checked', true)
    .trigger('change');
});

$(document).on('focus click', '#txtOth', function () {
   $('input[name="radSample"][value="3"]')
    .prop('checked', true)
    .trigger('change');
});

$(document).on('focus click', '#txtLoc', function () {
   $('input[name="radLoc"][value="2"]')
    .prop('checked', true)
    .trigger('change');
});

 function checkData()
 {

      let reason = $('input[name="radReason"]:checked').val();
      let sample = $('input[name="radSample"]:checked').val();
      let radsec = $('input[name="radsec"]:checked').val();
      let radProc = $('input[name="radProcAMEC"]:checked').val();
      
      if(radsec == "1")
      {
        if($('input[name="Sec"]:checked').val()=="")
        {
             showMessage('Please select section support', 'warning');
              return false;
        }
      }
 
      if(radProc == "2")
        {
          if($('input[name="radobj"]:checked').val()=="")
          {
              showMessage('Please select Evaluation object tivet', 'warning');
                return false;
          }
        }
    
      if(!checkHasDWG())
      {
          showMessage('Please input Drawing', 'warning');
          return false;
      }
      if((reason == "5") && ($("#txtOther").val() == ""))
      {
          showMessage('Please input Reason for others', 'warning');
          return false;
      }
      if((sample == "2")&&($("#txtReturn").val() == ""))
      {
        showMessage('Please input Return to', 'warning');
        return false;
      }
      if((sample == "3")&&($("#txtOth").val() == ""))
      {
        showMessage('Please input Other', 'warning');
        return false;
      }
      return true;
 }

 function checkHasDWG() {
  let hasValue = false;

  $('input[name="txtDwgNo[]"]').each(function () {
    if ($(this).val().trim() !== '') {
      hasValue = true;
      return false; // เจอแล้ว หยุด loop
    }
  });

  return hasValue;
}

function insertfrm(data)
{
 
  return new Promise((resolve) => {
    $.ajax({
      url: host + "qaform/QA-CN/form/insertcn",
      type: "post",
      dataType: "json",
      processData: false,
      contentType: false,
      data: data,
      beforeSend: function () {
        showLoader(true);
        console.log("beforeSend");
        
      },
      success: function (res) {
        resolve(res);
        console.log("success");
      },
      complete: function (xhr, status) {
        showLoader(false);
        console.log("complete");
      },
    });
  });

}