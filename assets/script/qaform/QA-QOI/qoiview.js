import { showFlow, doaction, redirectWebflow } from "../../inc/_form.js";
import { host, showLoader } from "../../utils";
import "select2";
import "select2/dist/css/select2.min.css";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { ajaxOptions, getAllAttr, getData, showMessage , requiredForm} from "../../public/v1.0.2/jFuntion";
$(document).ready(async function () {
  const formData = $(".form-data").data();
  flatpickr("#request_date", { dateFormat: "d/m/Y", defaultDate: $("#request_date").val() });
  flatpickr("#expect_date", { dateFormat: "d/m/Y", defaultDate: $("#expect_date").val() });
  function loadUsersToSelect($select,$type,$empno) {
    $.get(
      host + "qaform/QA-QOI/form/get_list/"+$type+"/"+$empno,
      function (data) {
        $select.empty().append('<option value="">------------Select------------</option>');
        data.forEach(function (user) {
          $select.append(
            `<option value="${user.SEMPNO}">${user.SNAME}</option>`
          );
        });
        $select.select2();
      },
      "json"
    );
  }
  const { nfrmno, vorgno, cyear, cyear2, nrunno, empno } = formData;
  const flow = await showFlow(nfrmno, vorgno, cyear, cyear2, nrunno);
  if($("#cextData").val() == "01") loadUsersToSelect($(".jstaff_select"),'J','');
  if($("#cextData").val() == "04") loadUsersToSelect($(".sem_select"),'S','');
  //loadUsersToSelect($(".eng_select"),'E');
  console.log(empno);
  if($("#cextData").val() == "07") loadUsersToSelect($(".eng_select"),'W',empno);
  $(".flow").html(flow.html);

  $(".btn-submit").click(async function () {
      const action = $(this).data("action");
      const remark = $("#remark").val();
      const cextdata =  $("#cextData").val();
      if((cextdata == "01") && (action == "approve"))
      {
          if(($("#jstaff").val() == "")||($("#enginc").val() == ""))
          {
            showMessage('Please select J-Staff in charge and Engineer in charge', 'warning');
            return false;
          }
      }

      const frm = $("#qoi-form");
      var formData = new FormData(frm[0]);
      formData.append("nfrmno", nfrmno);
      formData.append("vorgno", vorgno);
      formData.append("cyear", cyear);
      formData.append("cyear2", cyear2);
      formData.append("nrunno", nrunno);
      formData.append("action", action);
      formData.append("empno", empno);
      if(action == "reject")
      {
       
        
            if(cextdata == "01")
            {
              if(remark != "")
              {
                const confirm = await doaction(nfrmno, vorgno, cyear, cyear2, nrunno, action, empno, remark);
                if (confirm.status) redirectWebflow();
              }else
              {
                showMessage('Please input remark for reason Reject', 'warning');
              }
            }else
            {
              if (!(await requiredForm("#qoi-form"))) return;
              if(checkData())
              {
                var act = "approve";
                if(cextdata == "13")
                {
                   act = "reject";
                }
                const confirm = await doaction(nfrmno, vorgno, cyear, cyear2, nrunno, act, empno, remark);
                if (confirm.status) 
                {
                  const statusact = await actionfrm(formData);
                  if (statusact.status) redirectWebflow(); 
                }
              }
            }

     
      }else if(action == "returnb")
      {   
          if(remark != "")
          {
              const confirm = await doaction(nfrmno, vorgno, cyear, cyear2, nrunno, action, empno, remark);
              if (confirm.status) redirectWebflow();
          }else
          {
              showMessage('Please input remark for reason Return', 'warning');
          }
      }
      else
      {
        if(checkData())
        {
          if (!(await requiredForm("#qoi-form"))) return;
          const statusact = await actionfrm(formData);
          if (statusact.status)
          {
            const confirm = await doaction(nfrmno, vorgno, cyear, cyear2, nrunno, action, empno, remark);
            if (confirm.status) redirectWebflow();
          }else
          {
            showMessage('An error has occurred. Please contact the administrator(#2034).', 'error');
          }
        }
      }
  });
});

$(document).on("click", ".add-row", function (e) {
  e.preventDefault();
  const var1 = $(this).attr("data-var1");
  const var2 = $(this).attr("data-var2");
  add_more(var1, var2);
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

$(document).on("click", ".add-table-row", function (e) {
  const tableid =  $(this).attr("data-table");
  const lastRow = $("#"+tableid+" tr:last");
  const newRow = lastRow.clone(); 
  newRow.find("textarea").val("");
  $("#"+tableid).append(newRow);
});



$(document).on("change", ".radio-result", function (e) {
  //Result OK
  if($(this).val() == 0)
  {
    $("#btn-approve").removeClass('hidden'); // แสดงปุ่ม
    $("#btn-reject").addClass('hidden');     // ซ่อนปุ่ม
    $('#radio-acceptable').prop('checked', true);
    
  }else{
    //Result NG
    $("#btn-approve").addClass('hidden'); // แสดงปุ่ม
    $("#btn-reject").removeClass('hidden');     // ซ่อนปุ่ม
    $('#radio-notaccept').prop('checked', true);
  }
 // const tableid =  $(this).attr("data-table");
 // const lastRow = $("#"+tableid+" tr:last");
 // const newRow = lastRow.clone(); 
 // newRow.find("input").val("");
 // $("#"+tableid).append(newRow);
});



/**
 * Delete file
 */
 $(document).on("click", ".del-file", async function () {
  const nfrmno =  $(".form-data").attr("data-nfrmno");
  const vorgno =  $(".form-data").attr("data-vorgno");
  const cyear =  $(".form-data").attr("data-cyear");
  const cyear2 = $(".form-data").attr("data-cyear2");
  const nrunno = $(".form-data").attr("data-nrunno");
  $(this).closest('.openfl').remove();
  var itemno = $(this).closest('.openfl').attr("data-id");
  var sfile =  $(this).closest('.openfl').attr("data-filename");
  const data = { nfrmno : nfrmno , vorgno : vorgno , cyear : cyear , cyear2 : cyear2 , nrunno : nrunno , itemno: itemno, sfile: sfile };
  console.log(data);
  const resdel =  await deletefile(data);


});

function add_more(fl, dv) {
  var div = document.createElement("DIV");
  var str =
    '<div class="dvSFile flex items-center justify-between gap-2 mb-2"><input type="file" name="' +
    fl +
    '[]" data-map="' +
    fl +
    '" class="file-input file-input-bordered border-blue-200 w-full" multiple> <button type="button" ';
  str +=
    'class="reset-file btn-square bg-red-200 hover:bg-red-300 text-red-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer" title="Reset file input"> ';
  str +=
    '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg> </button></div>';
  div.innerHTML = str;
  document.getElementById(dv).appendChild(div);
}

function actionfrm(data)
{
 
  return new Promise((resolve) => {
    $.ajax({
      url: host + "qaform/QA-QOI/form/action",
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

function checkData()
{
  const cextdata =  $("#cextData").val();
  if(cextdata == "02")
  {
    if ($('.radio-result:checked').length === 0) 
    {
      showMessage('Please Check result for Drawing', 'warning');
      return false;
    }
    if ($('#dvconchk .openfl').length == 0) {
      let hasFile = false;
      $('input[name="SHEETFILE[]"]').each(function () {
        if (this.files.length > 0) {
          hasFile = true;
          return false; // ออกจาก loop ทันทีเมื่อเจอไฟล์
        }
      });
      if(!hasFile)
      {
        showMessage('Please attach Check sheet', 'warning');
        return false;
      }
    } 
  }else if(cextdata == "08")
  {
     var m = 0;
     var c = 0;
		$('.measure').each(function (){
			if(($(this).find(".m_action").val() != "") && ($(this).find(".m_due_date").val() != "") && ($(this).find(".m_in_charge").val() != ""))
			{
				m++;
        return false;
			}
		});
		$('.correct').each(function (){
			if(($(this).find(".c_action").val() != "") && ($(this).find(".c_due_date").val() != "") && ($(this).find(".c_in_charge").val() != ""))
			{
				c++;
        return false;
			}
		});
    if(m == 0)
    {
        showMessage('Please input Countermeasure', 'warning');
       return false;
    }
     if(c == 0)
     {
        showMessage('Please input Corrective and Preventive Action', 'warning');
        return false;
     }
  }else if(cextdata == "11")
  {
    if ($('input[name="qe_option"]:checked').length === 0) {
        showMessage('Please select an option in the QE section.', 'warning');
        return false;
    }
    var qe = $('input[name="qe_option"]:checked').val();
    var rq = $('input[name="rq_no"]').val();
    var cn = $('input[name="cn_no"]').val();
    if((qe == 1) && (rq == ""))
    {
      showMessage('Please input RQ no.', 'warning');
      return false;
    }
    if((qe == 2) && (cn == ""))
    {
      showMessage('Please input CN no.', 'warning');
      return false;
    }

  }

  return true;
}

/**
 * Delete file
 * @param {array} data
 * @returns
 */
 function deletefile(data) {
  return new Promise((resolve) => {
    $.ajax({
      url: host + "qaform/QA-QOI/form/delfile",
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

