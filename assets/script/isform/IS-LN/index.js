import { host } from "../../utils.js";
import { showFlow, doaction, redirectWebflow } from "@public/_form.js";
$(document).ready(function () {
  let debounceTimer;
  
  // Validate employee ID on keyup
  $("#request-by, #input-by").on("keyup", function () {
    clearTimeout(debounceTimer);
    const self = this;
    debounceTimer = setTimeout(async () => {
      const val = $(self).val().trim();
      if (val.length === 5) {
        const dataEmp = await $.ajax({
          url: host + "/isform/IS-LN/main/getEmpData",
          method: "POST",
          data: { empId: val },
          dataType: "json",
        });

        if (Array.isArray(dataEmp) && dataEmp.length === 0) {
          alert("ไม่พบข้อมูลพนักงาน กรุณาตรวจสอบรหัสพนักงานอีกครั้ง");
          $(self).val("");
        }
      }
    }, 300);
  });

  // Submit form handler
  $("#submit_del").on("click", async function (e) {
    e.preventDefault();

    // Get form values
    const inputBy = $("#input-by").val().trim();
    const requestBy = $("#request-by").val().trim();
    const action = $("input[name='action']:checked").val();
    const groupCode = $("input[placeholder*='group code']").val().trim();
    const remark = $("textarea[placeholder*='Remark']").val().trim();

    // Validate required fields
    if (!inputBy || !requestBy) {
      alert("กรุณากรอก Input By และ Request By");
      return;
    }

    if (!action) {
      alert("กรุณาเลือก Action");
      return;
    }

    // Collect permissions
    const permissions = {};
    $("input[type='checkbox']:checked").each(function () {
      const name = $(this).attr("name");
      if (name) {
        const moduleId = name.replace("[]", "");
        const roleId = $(this).val();
        
        if (!permissions[moduleId]) {
          permissions[moduleId] = [];
        }
        permissions[moduleId].push(roleId);
      }
    });

    // Prepare data
    const formData = {
      inputBy: inputBy,
      requestBy: requestBy,
      action: action,
      groupCode: groupCode,
      remark: remark,
      permissions: permissions,
    };

    // Show loading
    const $btn = $(this);
    const originalText = $btn.html();
    $btn.prop("disabled", true).html('<span class="loading loading-spinner"></span> Saving...');

    try {
      const response = await $.ajax({
        url: host + "/isform/IS-LN/main/saveForm",
        method: "POST",
        data: formData,
        dataType: "json",
      });

      if (response.success) {
        // alert("บันทึกข้อมูลสำเร็จ\nเลขที่: " + response.formId);
        // Reset form or redirect
        // location.reload();
        redirectWebflow();
      } else {
        alert("เกิดข้อผิดพลาด: " + response.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      $btn.prop("disabled", false).html(originalText);
    }
  });
});
