import { showFlow, doaction, redirectWebflow } from "../../inc/_form.js";
import { host } from "../../utils.js";

$(document).ready(async function () {
  const formData = $(".form-data").data();
  const { nfrmno, vorgno, cyear, cyear2, nrunno, empno } = formData;
  const flow = await showFlow(nfrmno, vorgno, cyear, cyear2, nrunno);
  $(".flow").html(flow.html);

  $(".btn-submit").on("click", async function (e) {
    e.preventDefault();
    const action = $(this).data("action");

    // ตรวจว่ามีตารางไหนอยู่
    const hasCheckTable = $("#checktable").length > 0;
    const hasMenuTable = $("#menuTable").length > 0;

    let resultData = [];
    let hasError = false;
    let errorMsg = "";

    // --- หน้าที่มี checktable ---
    if (hasCheckTable) {
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
          nfrmno,
          vorgno,
          nrunno,
          cyear,
          cyear2,
        });
      });
    }

    // --- หน้าที่มี menuTable (matchForm) ---
    if (hasMenuTable) {
      const matchStatus = $('input[name="match_status"]:checked').val();
      const comment = $("#comment").val().trim();

      if (!matchStatus) {
        hasError = true;
        errorMsg = "กรุณาเลือก Match หรือ Unmatch";
      } else if (matchStatus === "unmatch" && comment === "") {
        hasError = true;
        errorMsg = "กรุณากรอก Comment เมื่อต้องการเลือก Unmatch";
        $("#comment").addClass("border-red-500");
      }

      if (!hasError) {
        resultData.push({
          usr_login: empno,
          result: matchStatus === "match" ? "1" : "0",
          remark: comment,
          nfrmno,
          vorgno,
          nrunno,
          cyear,
          cyear2,
        });
      }
    }

    if (hasError) {
      alert(errorMsg);
      return;
    }

    // --- ส่งข้อมูล ---
    $.ajax({
      url: host + "isform/IS-RGV/Main/Update_Result",
      method: "POST",
      data: { data: resultData },
      success: async function (response) {
        const confirm = await doaction(nfrmno, vorgno, cyear, cyear2, nrunno, action, empno, "");
        if (confirm.status) redirectWebflow();
        console.log(response);
      },
      error: function () {
        alert("เกิดข้อผิดพลาดในการส่งข้อมูล");
      },
    });
  });

  $(".btn-approve").on("click", async function (e) {
    e.preventDefault();
    const action = $(this).data("action");
    const confirm = await doaction(nfrmno, vorgno, cyear, cyear2, nrunno, action, empno, "");
    if (confirm.status) redirectWebflow();
  });
});
