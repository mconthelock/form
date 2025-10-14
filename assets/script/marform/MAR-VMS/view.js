import { showLoader } from "../../public/v1.0.3/preloader";
import { host } from "../../utils";
import Swal from "sweetalert2";

$(document).on("click", ".export-btn", async function () {
  const vmscyear2 = $("#cyear2").val();
  const vmsnrunno = $("#nrunno").val();
  $.ajax({
    type: "POST",
    url: host + "marform/MAR-VMS/form/exportexcel",
    data: {vmscyear2: vmscyear2, vmsnrunno:vmsnrunno},
    dataType: 'json',
    beforeSend: function () {
      showLoader({ show: true });
    },
    success: function (res) {
             openExcel(res.filename, res.content);
    },
    complete: function (xhr, status) {
      showLoader({ show: false });
    },
    error: function (xhr) {
      Swal.fire({
        icon: "error",
        title: "Failed to export file.",
        text: xhr.responseText || "Failed to export file.",
      });
      
    },
  });

});

function openExcel(fileName, dataBase64){
  var fileType = fileName.split('.').pop();
  fileType = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,";
  var $a = $("<a>");
  $a.attr("href", fileType + dataBase64);
  $("body").append($a);
  $a.attr("download", fileName);
  $a[0].click();
  $a.remove();
  
 }
























