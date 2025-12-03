import { getAllAttr , getData , ajaxOptions, logFormData, requiredForm, showMessage } from "@public/jFuntion";
import { showLoader } from "@public/preloader";
import { host } from "../../utils";
import { createTable, destroyTable} from "@public/_dataTable";
import { formatAvatar, s2disableSearch, setSelect2 } from "@public/_select2";
import { createForm, redirectWebflow } from "../../inc/_form.js";
import Swal from "sweetalert2";

var table;
var grpData;
const columns = [
  {
    data: null, // ใช้ null เพราะเราจะไม่เอาข้อมูลจาก JSON
    title: "No.",
    width: "10%",
    render: function (data, type, row, meta) {
      return meta.row + 1; // meta.row เริ่มจาก 0 ดังนั้น +1
    },
  },
  {
    data: "GNAME",
    title: "Group Name",
    width: "20%",
  },
  {
    data: "GDETAIL",
    title: "Detail",
    width: "40%",
  },
  {
    data: "GSTATUS",
    title: "Status",
    render: function (data, type, row) {
      const checked = data == 1 ? "bg-green-500 translate-x-6" : "bg-gray-400 translate-x-0";
      return `
      <div 
        class="toggle-btn w-8 h-4 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 ${data == 1 ? 'bg-green-500' : 'bg-gray-400'}"
        data-id="${row.GID}"
      >
        <div class="toggle-circle bg-white w-3 h-3 rounded-full shadow-md transform transition-transform duration-300 ${data == 1 ? 'translate-x-4' : 'translate-x-0'}" data-id="${row.GID}"></div>
      </div>
    `;
    },
  },
  {
    data: "GID",
    title: "Action",
    width: "5%",
    render: function (data, type, row, meta) {
                    return `
                    <div class="flex items-center justify-center gap-3">
                      <button 
                        type="button"
                        class="btn btn-sm btn-ghost btn-circle edit-dwg tooltip flex items-center"  
                        data-id="${row.GID}"
                        title="Edit">
                        <i class="icofont-ui-edit text-base"></i>
                      </button>
                    </div>`;
    },
  },
];
$(document).ready(async function () {
  table = await createTableGrp();
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
});

$(document).on("click", ".toggle-btn", function () {
  const id = $(this).data("id");
  const isOn = $(this).hasClass("bg-green-500");

  // toggle class
  $(this).toggleClass("bg-green-500 bg-gray-400");
  $(this).find(".toggle-circle").toggleClass("translate-x-6 translate-x-0");

  // TODO: ส่งค่าไป backend ว่าเปิด/ปิด
  console.log("ID:", id, "New status:", !isOn ? 1 : 0);
  $.ajax({
    url: host + "marform/MAR-VMS/master/update_status_group",   // endpoint backend update status group
    type: "POST",
    data: {
      GID: id,
      GSTATUS:  !isOn ? 1 : 0
    },
    success: function (res) {
      if (res.status) {
        console.log("✅ สำเร็จ:", res.message);
      } else {
        console.error("❌ ไม่สำเร็จ:", res.message);
        $btn.toggleClass("bg-green-500 bg-gray-400");
        $btn.find(".toggle-circle").toggleClass("translate-x-4 translate-x-0");
      }
    },
    error: function (xhr) {
      console.error("Update Failed:", xhr.responseText);
      // rollback UI ถ้า error
      $btn.toggleClass("bg-green-500 bg-gray-400");
      $btn.find(".toggle-circle").toggleClass("translate-x-4 translate-x-0");
    }
  });
});


// เปิด modal add group  
$(document).on("click", "#btnAddGroup", function () {
    clearGroupModal();
    // เปิด modal
    $("#modalAddGroup").removeClass("hidden").addClass("flex");
});
// ปิด modal add group 
$(document).on("click", ".close-modal", function () {
  $("#modalAddGroup").removeClass("flex").addClass("hidden");
});

$(document).on("click", "#saveGroup", async function () {
     
    if($("#groupName").val() == "")
    {
      Swal.fire({
        icon: "warning",
        title: "Please enter Group Name",
        toast: true,
        position: "top-end",
        timer: 3000,
        showConfirmButton: false,
        background: "#FBF6D9",
      });
      return false;
    }
    if($("#groupDetail").val() == "")
    {
      Swal.fire({
        icon: "warning",
        title: "Please enter Detail",
        toast: true,
        position: "top-end",
        timer: 3000,
        showConfirmButton: false,
        background: "#FBF6D9",
      });
      return false;
    }
    const formData = new FormData( $("#form-group")[0]);
    try {
      const rssave = await saveGroup(formData);
      if (rssave.status == true) { 
        Swal.fire({
          icon: "success",
          title: "Data saved successfully",
          showConfirmButton: false,
          timer: 2000,
        });
        table = await createTableGrp();
        $("#modalAddGroup").removeClass("flex").addClass("hidden");
        
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


$(document).on('click', '#addPstBtn', function () {
  const $tableBody = $('#tablepstModal tbody');
  const $firstRow = $tableBody.find('tr:first');

  $firstRow.find('.pst-select').select2('destroy');
  const $newRow = $firstRow.clone();

  // เคลียร์ค่าภายใน input และ select
  $newRow.find('input, select').each(function () {
    $(this).val('');
  });

  $newRow.find('.pos-col, .dds-col').text('');

  initSelect2(".pst-select",$firstRow);
  initSelect2(".pst-select",$newRow);

  const rowCount = $tableBody.find('tr').length + 1;
  $newRow.find('td:first').text(rowCount);

    // เพิ่มแถวใหม่ลงใน tbody
    $tableBody.append($newRow);
  //tablesch.row.add($(newRow)[0]).draw(false); // ใช้ [0] เพื่อใส่ element raw HTML
});



$(document).on("click", ".edit-dwg", function () {
  const gid = $(this).data("id"); // เอา GID ที่ส่งมา
  // เรียก API หรือหาข้อมูลจาก datatable row
  $.ajax({
    url: host + "marform/MAR-VMS/master/get_group_empno",
    type: "POST",
    data: { GID: gid },
    dataType: "json",
    success: function (res) {
      console.log(res);
      if (res.status) {
        console.log("if");
        const group = res.data;
        $("#GID").val(group.GID);
        $("#groupName").val(group.GNAME);
        $("#groupDetail").val(group.GDETAIL);
        $("#modalAddGroup h3").text("Edit Group");
        const $tbody = $("#tbodyModal").empty();

        if (!group.participants || group.participants.length === 0) {
          const emptyRowHtml = `
          <tr class="hover:bg-gray-50">
            <td class="px-3 py-2">1</td>
            <td class="px-3 py-2">
              <select class="pst-select w-80 px-2 py-1 border rounded-lg" name="pst[]">
                <option value=""></option>
                ${allParticipants.map(pt => `
                  <option value="${pt.SEMPNO}" 
                          data-div="${pt.SDIV}" 
                          data-dep="${pt.SDEPT}" 
                          data-sec="${pt.SSEC}" 
                          data-pos="${pt.SPOSNAME}">
                    ${pt.SNAME}
                  </option>
                `).join("")}
              </select>
            </td>
            <td class="px-3 py-2 pos-col"></td>
            <td class="px-3 py-2 dds-col"></td>
          </tr>`;
          $tbody.append(emptyRowHtml);
        } else {
        group.participants.forEach((p, idx) => {
          const rowHtml = `
          <tr class="hover:bg-gray-50">
            <td class="px-3 py-2">${idx + 1}</td>
            <td class="px-3 py-2">
              <select class="pst-select w-80 px-2 py-1 border rounded-lg" name="pst[]">
                <option value=""></option>
                ${allParticipants.map(pt => `
                  <option value="${pt.SEMPNO}" 
                          data-div="${pt.SDIV}" 
                          data-dep="${pt.SDEPT}" 
                          data-sec="${pt.SSEC}" 
                          data-pos="${pt.SPOSNAME}"
                          ${pt.SEMPNO == p.SEMPNO ? "selected" : ""}>
                    ${pt.SNAME}
                  </option>
                `).join("")}
              </select>
            </td>
            <td class="px-3 py-2 pos-col">${p.SPOSNAME || ""}</td>
            <td class="px-3 py-2 dds-col">${[p.SDIV, p.SDEPT, p.SSEC].filter(Boolean).join("/")}</td>
          </tr>`;
        $tbody.append(rowHtml);
        });
      }
        initSelect2(".pst-select", $("#tbodyModal"));
        $("#modalAddGroup").removeClass("hidden").addClass("flex");
        /*
         group.participants.forEach((p, idx) => {
          console.log(idx, p.SEMPNO, p.SNAME);
        });*/
      
      }
    }
  });
});


/**
 * Create table
 * @param {array} data
 * @returns
 */
 async function createTableGrp() {
  var gtable;
  grpData = await getData({
    ...ajaxOptions,
    url: host + "marform/MAR-VMS/master/get_group_master",
    data: {},
  });
  gtable =  createTable({
    data : grpData,
    columns:columns,
    ordering: false,
    paging: false,
    searching: false,
    info: false
  },{
    id: '#table',
    columnSelect:{status: false},
    domScroll: {status: true, maxHeight: '21rem', type: 'tailwind4'},
    join: true
  });


  return gtable;
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

function saveGroup(data) {
  return new Promise((resolve) => {
    $.ajax({
      url: host + "marform/MAR-VMS/master/save_group",
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

function clearGroupModal()
{
  // ล้างค่าฟอร์ม
  $("#GID").val("");                 // hidden input
  $("#groupName").val("");           
  $("#groupDetail").val("");         

  // ล้าง tbody ของ participants
  $("#tbodyModal").empty();

  // เติม row ว่าง 1 แถวสำหรับ Add
  const rowHtml = `
    <tr class="hover:bg-gray-50">
      <td class="px-3 py-2">1</td>
      <td class="px-3 py-2">
        <select class="pst-select w-80 px-2 py-1 border rounded-lg" name="pst[]">
          <option value=""></option>
          ${allParticipants.map(pt => `
            <option value="${pt.SEMPNO}" 
                    data-div="${pt.SDIV}" 
                    data-dep="${pt.SDEPT}" 
                    data-sec="${pt.SSEC}" 
                    data-pos="${pt.SPOSNAME}">
              ${pt.SNAME}
            </option>
          `).join("")}
        </select>
      </td>
      <td class="px-3 py-2 pos-col"></td>
      <td class="px-3 py-2 dds-col"></td>
    </tr>`;
  $("#tbodyModal").append(rowHtml);

  // init select2
  initSelect2(".pst-select", $("#tbodyModal"));

  // ตั้ง header
  $("#modalAddGroup h3").text("Add Group");
}