import { showFlow, doaction, redirectWebflow } from "../../inc/_form.js";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { host } from "../../utils.js";

$(document).ready(async function () {
  flatpickr("#start-date", { dateFormat: "Y-m-d" });

  const formData = $(".form-data").data();
  const { nfrmno, vorgno, cyear, cyear2, nrunno, empno } = formData;

  const flow = await showFlow(nfrmno, vorgno, cyear, cyear2, nrunno);
  $(".flow").html(flow.html);

  $(".btn-submit").click(async function () {
    const action = $(this).data("action");
    const extdata = $(".extdata").val();
    if (extdata == "01") {
      if ($(".action_type").val() == "ADD") {
        // alert("กรุณาเลือก Action");
        const username = $("#username").val();
        const password = $("#password").val();
        const date = $("#start-date").val();

        if (!username || !date) {
          alert("กรุณากรอก Username และ Start Date");
          return;
        }
        $.ajax({
          url: `${host}isform/IS-SPC/main/insertID`,
          method: "POST",
          data: {
            NFRMNO: nfrmno,
            VORGNO: vorgno,
            CYEAR: cyear,
            CYEAR2: cyear2,
            NRUNNO: nrunno,
            USERNAME: username,
            PASSWORD: password,
            START_DATE: date,
          },
          dataType: "json",
          success: function (data) {},
          error: function (xhr, status, error) {},
        });
      } else {
        const username = $("#username_del").val();
        const servername = $("#platform").val();
        $.ajax({
          type: "POST",
          url: `${host}isform/IS-SPC/main/Update_status`,
          data: {
            servername: servername,
            username: username,
          },
          dataType: "json",
          success: function (response) {},
        });
      }
    }
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
