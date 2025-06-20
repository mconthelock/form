import { showFlow, doaction, redirectWebflow } from "../../inc/_form.js";
import { host } from "../../utils.js";
$(document).ready(async function () {
  const formData = $(".form-data").data();
  const { nfrmno, vorgno, cyear, cyear2, nrunno, empno } = formData;
  const flow = await showFlow(nfrmno, vorgno, cyear, cyear2, nrunno);
  $(".flow").html(flow.html);

  $(".btn-submit").on("click", function (e) {
    e.preventDefault();

    let errorMsg = "";
    let hasError = false;
    let resultData = [];
    const action = $(this).data("action");

    $("#checktable tbody tr").removeClass("bg-red-100");
    $('input[type="text"]').removeClass("border-red-500");

    $("#checktable tbody tr").each(function () {
      const $row = $(this);
      const $radio = $row.find(".result-radio:checked");
      const $remark = $row.find(".remark-input");

      if ($radio.length === 0) {
        errorMsg = "กรุณาเลือกผล (Match/Unmatch) ให้ครบทุกแถว";
        hasError = true;
        $row.addClass("bg-red-100");
        return false;
      }

      const radioId = $radio.attr("id");
      const usrLogin = radioId.split("-")[1];
      const value = $radio.val();
      const remarkText = $remark.val().trim();

      if (value === "0" && remarkText === "") {
        errorMsg = "กรุณาระบุ Remark ในแถวที่เลือก Unmatch";
        hasError = true;
        $remark.addClass("border-red-500");
        return false;
      }

      resultData.push({
        usr_login: usrLogin,
        result: value,
        remark: remarkText,
        nfrmno: nfrmno,
        vorgno: vorgno,
        nrunno: nrunno,
        cyear: cyear,
        cyear2: cyear2,
      });
    });

    if (hasError) {
      alert(errorMsg);
      return;
    }

    console.log(resultData);

    // // ส่งข้อมูลผ่าน AJAX
    $.ajax({
      url: host + "isform/IS-RGV/Main/Update_Result", // เปลี่ยน URL ตามที่ใช้จริง
      method: "POST",
      data: {
        data: resultData,
      },
      success: async function (response) {
        const confirm = await doaction(
          nfrmno,
          vorgno,
          cyear,
          cyear2,
          nrunno,
          action,
          empno,
          ""
        );
        if (confirm.status) redirectWebflow();
        console.log(response);
        // ทำอย่างอื่น เช่น รีเฟรช, redirect, etc.
      },
      error: function () {
        alert("เกิดข้อผิดพลาดในการส่งข้อมูล");
      },
    });
  });

  $(".btn-approve").on("click", async function (e) {
    const action = $(this).data("action");
    const confirm = await doaction(
      nfrmno,
      vorgno,
      cyear,
      cyear2,
      nrunno,
      action,
      empno,
      ""
    );
    if (confirm.status) redirectWebflow();
  });
});
