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


  const { nfrmno, vorgno, cyear, cyear2, nrunno, empno } = formData;
  const flow = await showflow({
    NFRMNO: nfrmno, 
    VORGNO: vorgno, 
    CYEAR:  cyear.toString(),
    CYEAR2: cyear2.toString(), 
    NRUNNO: nrunno
  });
  

  $(".flow").html(flow.html);

  $(".btn-submit").click(async function () {
      let action = $(this).data("action");
      const baseForm = {
        NFRMNO: nfrmno,
        VORGNO: vorgno,
        CYEAR: cyear,
        CYEAR2: cyear2,
        NRUNNO: nrunno
      };
      if(checkData(action))
      {
          action = (action === "returnrem") ? "return" : action;
        	const frm = $("#cn-form");
          var cnformData = new FormData(frm[0]);
          cnformData.append("nfrmno", nfrmno);
          cnformData.append("vorgno", vorgno);
          cnformData.append("cyear", cyear);
          cnformData.append("cyear2", cyear2);
          cnformData.append("nrunno", nrunno);
          cnformData.append("action", action);
          cnformData.append("empno", empno);
          let mstatus = cnformData.get('mstatus');
          let cextData = parseInt(cnformData.get('cextData'));
          let stepready = cnformData.get('stepready');
      //     for (let pair of cnformData.entries()) {
      //     console.log(pair[0] + ' = ' + pair[1]);
      // }
       
         // console.log(empno);
          
         // return false;
         
         
          if(action == "approve" || action == "reject")
          {
                  let act;
                  //let cextData =  parseInt($("#cextData").val());
                  if(cextData >1 && cextData != 5 && action == "reject")
                  {
                      act = "approve";
                  }else{
                      act = action;
                  }
                  //console.log("action ="+act);
                  
                  const confirm = await doaction({
                       ...baseForm,
                      ACTION: act,
                      EMPNO: empno,
                      REMARK: $("#txtRemark").val()
                    });
                  if (confirm.status) {
                    const statusact = await actionfrm(cnformData);
                    const formStatus = await getFormStatus({
                       ...baseForm
                    });
                    
                      if (formStatus == "2" || formStatus == "3") { 
                                  
                                  let param = {
                                  ...baseForm,                         
                                  FSTATUS: formStatus,
                                  MTYPE : mstatus == "1" ? 'PIC' : 'ALL'
                              };

                              const res = await buildmail(param);

                              if (!res.to || !res.subject || !res.html) {
                                  throw 'Mail data is incomplete';
                              }

                              let objmail = {
                                  from: 'noreplay@MitsubishiElevatorAsia.co.th',
                                  to: res.to,
                                  subject: res.subject,
                                  html: res.html
                              };

                              // รอให้ส่งเมลเสร็จก่อน
                              await sendmail(objmail);
                      }else if((stepready == "06") && (mstatus == "1"))
                      {
                              let param = {
                                  ...baseForm,                        
                                  FSTATUS: formStatus,
                                  MTYPE : 'FOREMAN'
                              };
                                    const res = await buildmail(param);

                              if (!res.to || !res.subject || !res.html) {
                                  throw 'Mail data is incomplete';
                              }

                              let objmail = {
                                  from: 'noreplay@MitsubishiElevatorAsia.co.th',
                                  to: res.to,
                                  subject: res.subject,
                                  html: res.html
                              };

                              // รอให้ส่งเมลเสร็จก่อน
                              await sendmail(objmail);
                      }
                      // แล้วค่อย redirect
                      if (statusact.status) {
                          redirectWebflow();
                      }
                    }
              
          }else
          {
             //console.log(action);
              const statusact = await actionfrm(cnformData);
              if(action == "return")
                {
                           let param = {
                                  ...baseForm,                         
                                  FSTATUS: '1',
                                  MTYPE : 'REQUESTER'
                              };
                                    const res = await buildmail(param);

                              if (!res.to || !res.subject || !res.html) {
                                  throw 'Mail data is incomplete';
                              }
                              let objmail = {
                                  from: 'noreplay@MitsubishiElevatorAsia.co.th',
                                  to: res.to,
                                  subject: res.subject,
                                  html: res.html
                              };
                              // รอให้ส่งเมลเสร็จก่อน
                              await sendmail(objmail);
                }
              if (statusact.status) redirectWebflow();
          }
      }
      
      // console.log($("#chkopr").val() );
      // console.log(">>>"||$("#demapv").val()||"<<<<");
      // if($("#demapv").val()=="1")
      // {
      //   console.log("IF");
      // }else{
      //   console.log("ELSE");
      // }
      
  });
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

$(document).on("click", ".add-table-row", function (e) {
  const tableid =  $(this).attr("data-table");
  const lastRow = $("#"+tableid+" tr:last");
  const newRow = lastRow.clone(); 
  newRow.find("input").val("");
  $("#"+tableid).append(newRow);
});



$(document).on("change", ".radio-result", function (e) {
  //Result OK
  if($(this).val() == 0)
  {
    $("#btn-approve").removeClass('hidden'); // แสดงปุ่ม
    $("#btn-reject").addClass('hidden');     // ซ่อนปุ่ม
    $("#btn-cancel").addClass('hidden');     // ซ่อนปุ่ม
    $('#radio-acceptable').prop('checked', true);
    
  }else{
    //Result NG
    $("#btn-approve").addClass('hidden'); // แสดงปุ่ม
    $("#btn-reject").removeClass('hidden');     // ซ่อนปุ่ม
    $("#btn-cancel").removeClass('hidden');     // ซ่อนปุ่ม
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

$(document).on('click', '.radDwg', function () {
    let val = $(this).val();

    if (val === "0") {
        $('#btnApprove').show();
        $('#btnReject').hide();
         $('#btnReturn').show();
    } else {
        $('#btnApprove').hide();
        $('#btnReject').show();
        $('#btnReturn').hide();
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

 $(document).on("change", ".file-input", async function () {
    const maxKB = parseInt($(this).attr("data-max-kb"), 10);
    const maxSize = maxKB * 1024; // byte

    if (!this.files || this.files.length === 0) return;

    for (let i = 0; i < this.files.length; i++) {
        const file = this.files[i];

        if (file.size > maxSize) {
            showMessage(file.name+" "+(file.size / 1024).toFixed(0) +" KB over "+maxKB+" KB", 'warning');
            $(this).val(''); // ล้างเฉพาะ input นี้
            return;
        }
    }
});

function actionfrm(data)
{
 
  return new Promise((resolve) => {
    $.ajax({
      url: host + "qaform/QA-CN/form/action",
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

function buildmail(formno)
{
    return new Promise((resolve, reject) => { 
          $.ajax({
      url: host + "qaform/QA-CN/form/buildmail",
      type: "post",
      dataType: "json",
      data: formno,
           success: function (res) {
                resolve(res);  
            },
            error: function (xhr, status, error) {
                reject(error);
            }
    });
  });

}

function createcnng(formno)
{
    return new Promise((resolve) => { 
          $.ajax({
      url: host + "qaform/QA-CN/form/createcnng",
      type: "post",
      dataType: "json",
      data: formno,
           success: function (res) {
                resolve(res);  
            },
            error: function (xhr, status, error) {
                reject(error);
            }
    });
  });

}

function checkData(act)
{
  
  
  let cextdata =  parseInt($("#cextData").val());
  const chkopr =  $("#chkopr").val();
  const demapv =  $("#demapv").val();
  if(act == "saveData" || act == "sendApv")
  {
      let reason = $('input[name="radReason"]:checked').val();
      let sample = $('input[name="radSample"]:checked').val();
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

  }else if(act == "change")
  {
      if($("#Foreman").val() == "")
      {
        showMessage('Please select Foreman', 'warning');
        return false;
      }
      return true;
  }else if(act != "")
  {
      if(act =="returnrem")
      {
          if($("#txtRemark").val() == "")
          {
            showMessage('Please input Remark for reason return', 'warning');
            return false;
          }

      }
      if(($("#mstatus").val() == "1") && (act == "approve"))
      {
          if((cextdata == 6) && ($("#Operator").val() == ""))
          {
            showMessage('Please select Operator', 'warning');
            return false;
          }
      }

      const needOther =
      ((chkopr != "1") && (cextdata >= 2 ) && (cextdata < 8 )) ||
      (chkopr == "1" && (((cextdata >= 3) && (cextdata <= 5)) ||(cextdata == 7)));
      if (!needOther) return true;
      let radJudge = $('input[name="radJudge"]:checked').val();
      if((radJudge == "2.5") && ($("#txtJdgOther1").val() == ""))
      {
          showMessage('Please input Judgement for Not Accept', 'warning');
          return false;
      }
      if((radJudge == "4.2") && ($("#txtJdgOther2").val() == ""))
      {
          showMessage('Please input Judgement for Cancel', 'warning');
          return false;
      }
      if(cextdata == 2)
      {
        if (!$('#cn-form').find('[name=radJudge]:checked').length) {
          showMessage('Please select Judgement.', 'warning');
          return false;

        }
        if(chkopr == "1" && act == "approve")
        {
            let hasOldFile = false;
            if ($('#dvmak .openfl').length > 0) {
                hasOldFile = true;
             }
            let hasNewFile = false;
            $('input[type="file"][name="CHKFILE[]"]').each(function () {
                if (this.files && this.files.length > 0) {
                    hasNewFile = true;
                }
            });
            if(!hasOldFile && !hasNewFile)
            {
              showMessage('Please attach Check Sheet.', 'warning');
              return false;
            }
        }

      }
      if(cextdata == 7)
      {
        let count = 0;
        while ($('#cn-form').find(`[name='radDwg${count}']`).length) {

          const rad = $('#cn-form').find(`[name='radDwg${count}']`);
          if (!rad.is(':checked')) {
              alert("Please Check result for Drawing");
              return false;
          }
          count++;
      }
      }
  } // end else
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
      url: host + "qaform/QA-CN/form/delfile",
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

function opendwg(dwg,rev)
{
    //alert("xxx"+dwg);
  if(rev == "*")
  {
    rev = "0";
  }
  if(rev != "")
  {
    window.open("http://amecweb.mitsubishielevatorasia.co.th/pdmopendwg/menu_control/openfile2?dwg="+dwg+"&rev="+rev,"dwg",NOTOP_WIN_CONF);
  }else{
    window.open("http://amecweb.mitsubishielevatorasia.co.th/pdmopendwg/menu_control/openfile2?dwg="+dwg,"dwg",NOTOP_WIN_CONF);
  }
  winAtch.focus(); 
  void(0);
}

