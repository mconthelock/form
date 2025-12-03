import { showAlert } from "./alert.js";

/**
 * 🔹 Bind employee lookup ให้กับ input
 * @param {string|HTMLElement|jQuery} inputSel - selector หรือ element ของช่องรหัสพนักงาน
 * @param {Object<string, string|HTMLElement|jQuery>} outputMap - ช่อง output mapping เช่น { SNAME: '#empName', SPOSITION: '#empPos' }
 * @param {string} getEmpUrl - URL API สำหรับค้นหาพนักงาน
 */
export function bindEmpLookup(inputSel, outputMap, getEmpUrl) {
  const $input = $(inputSel);
  if (!$input.length) {
    console.warn("⚠ bindEmpLookup: input selector not found →", inputSel);
    return;
  }

  let empTimer;

  $input.on("input", function () {
    clearTimeout(empTimer);
    const empno = $.trim($input.val());

    // 🔸 Reset output ถ้าไม่ครบ 5 หลัก
    if (empno.length !== 5) {
      $.each(outputMap, (_, el) => {
        const $el = $(el);
        $el.is("input, textarea") ? $el.val("") : $el.text("");
      });
      return;
    }

    empTimer = setTimeout(() => {
      const apiUrl = getEmpUrl || window.getEmpUrl;

      // 🧱 1. ป้องกัน URL หาย / ไม่ได้ประกาศ
      if (!apiUrl || typeof apiUrl !== "string" || !apiUrl.startsWith("http")) {
        console.error("❌ emp_lookup: getEmpUrl invalid →", apiUrl);
        showAlert(
          "⚠ การตั้งค่าไม่ถูกต้อง",
          "ไม่พบ URL สำหรับค้นหาพนักงาน (getEmpUrl)"
        );
        return;
      }

      // 🔄 2. ปิด readonly/overlay เผื่อเคยค้างจาก error ก่อนหน้า
      $input.prop("readonly", false).prop("disabled", false);
      $("#alertModal")[0]?.close?.();

      // 🚀 3. เริ่มเรียก AJAX
      $.ajax({
        url: apiUrl,
        method: "POST",
        data: { empno },
        dataType: "json",
        timeout: 8000 // 8 วินาที
      })
        .done((data) => {
          if (!data) {
            console.error("❌ emp_lookup: empty response");
            showAlert("⚠ แจ้งเตือน", "ไม่มีข้อมูลตอบกลับจากเซิร์ฟเวอร์");
            return;
          }

          if (data.status === "success") {
            $.each(outputMap, (key, el) => {
              const $el = $(el);
              const val = data[key] ?? "";
              $el.is("input, textarea") ? $el.val(val) : $el.text(val);
            });
          } else {
            console.warn("⚠ emp_lookup: employee not found", data);
            $input.val("");
            $.each(outputMap, (_, el) => {
              const $el = $(el);
              $el.is("input, textarea") ? $el.val("") : $el.text("");
            });
            showAlert("⚠ แจ้งเตือน", data.message || "ไม่พบข้อมูลพนักงาน");
          }
        })
        .fail((xhr, status, err) => {
          console.error("❌ emp_lookup ajax error:", status, err);
          if (status === "timeout") {
            showAlert("⏰ หมดเวลาเชื่อมต่อ", "กรุณาลองใหม่อีกครั้ง");
          } else if (xhr.status === 404) {
            showAlert("⚠ แจ้งเตือน", "ไม่พบปลายทาง API (404)");
          } else if (xhr.status === 500) {
            showAlert("⚠ แจ้งเตือน", "เกิดข้อผิดพลาดในฝั่งเซิร์ฟเวอร์ (500)");
          } else {
            showAlert("⚠ แจ้งเตือน", "เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย");
          }
        })
        .always(() => {
          // ✅ เปิดให้พิมพ์ต่อได้เสมอ
          $input.prop("readonly", false).prop("disabled", false);
        });
    }, 300);
  });

  // 🔹 ป้องกัน Enter ส่งฟอร์มโดยไม่ตั้งใจ
  //$input.on("keypress", (e) => e.key === "Enter" && e.preventDefault());
}
