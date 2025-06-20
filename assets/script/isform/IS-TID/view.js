import { fpkTimeOpt, setDatePicker } from "../../inc/_flatpickr";
import {
  toggleActionForm,
  doactionWebservice,
  redirectWebflow,
  showFlow,
  setformDetail,
} from "../../inc/_form";
import { mailForm, mailOpt, sendMail } from "../../inc/_sendmail";
import {
  ajaxOptionsLoad,
  autosizeTextarea,
  getData,
  requiredForm,
  showMessage,
} from "../../jFuntion";
import { host } from "../../utils";

var NFRMNO, VORGNO, CYEAR, CYEAR2, NRUNNO, empno, cextData, mode;
$(async function () {
  NFRMNO = $(".form-info").attr("NFRMNO");
  VORGNO = $(".form-info").attr("VORGNO");
  CYEAR = $(".form-info").attr("CYEAR");
  CYEAR2 = $(".form-info").attr("CYEAR2");
  NRUNNO = $(".form-info").attr("NRUNNO");
  empno = $(".apv-data").attr("apv");
  cextData = $(".apv-data").attr("cextData");
  mode = $(".apv-data").attr("mode");
  // if (mode == "2") {
  //     $(".actions-Form").removeClass("hidden");
  // } else {
  //     $(".actions-Form").addClass("hidden");
  // }

  const form = {
    NFRMNO: NFRMNO,
    VORGNO: VORGNO,
    CYEAR: CYEAR,
    CYEAR2: CYEAR2,
    NRUNNO: NRUNNO,
  };
  $(".form-info").html(await setformDetail(form));
  toggleActionForm(mode);
  if (cextData == "03") {
    setDatePicker();
    setDatePicker(fpkTimeOpt, "#compTime");
  } else if (cextData == "05") {
    setDatePicker();
    setDatePicker(fpkTimeOpt, "#disTime");
  }
  const flow = await showFlow(NFRMNO, VORGNO, CYEAR, CYEAR2, NRUNNO);
  // $("#flow").html(flow.html);
  $("#form").removeClass("hidden");
  $(".load").addClass("hidden");
  autosizeTextarea(document.getElementById("workcontent"));
  autosizeTextarea(document.getElementById("reason"));
});

/**
 * action form  approve, reject form
 */
$(document).on("click", "button[name='btnAction']", async function () {
  try {
    const action = $(this).val();
    const remark = $("#remark").val();

    if (cextData == "03" || cextData == "05") {
      if (!(await requiredForm("#form"))) return;
      const frm = $("#form");
      const formData = new FormData(frm[0]);
      formData.append("NFRMNO", NFRMNO);
      formData.append("VORGNO", VORGNO);
      formData.append("CYEAR", CYEAR);
      formData.append("CYEAR2", CYEAR2);
      formData.append("NRUNNO", NRUNNO);
      switch (cextData) {
        case "03":
          const upComp = await getData({
            ...ajaxOptionsLoad,
            url: `${host}/isform/IS-TID/form/updateCompTime`,
            data: formData,
            processData: false,
            contentType: false,
          });
          if (upComp.status == true) {
            showMessage(upComp.message, "success");
          } else {
            throw new Error(upComp.message);
          }
          break;
        case "05":
          const upDis = await getData({
            ...ajaxOptionsLoad,
            url: `${host}/isform/IS-TID/form/updateDisTime`,
            data: formData,
            processData: false,
            contentType: false,
          });
          if (upDis.status == true) {
            showMessage(upDis.message, "success");
          } else {
            throw new Error(upDis.message);
          }
          break;
      }
    }

    const formStatus = await doactionWebservice(
      NFRMNO,
      VORGNO,
      CYEAR,
      CYEAR2,
      NRUNNO,
      action,
      empno,
      remark
    );

    if (formStatus.status == true) {
      showMessage(`${$(this).text()}!`, "success");
      redirectWebflow();
    } else {
      throw new Error("ไม่สามารถ Approve ได้");
    }
  } catch (e) {
    showMessage(
      `เกิดข้อผิดพลาด: ${e.message} กรุณาลองใหม่อีกครั้งหรือติดต่อ Admin Tel:2038`
    );
    const mail = { ...mailOpt };
    mail.BODY = [
      ` Form Error : do action`,
      mailForm(NFRMNO, VORGNO, CYEAR, CYEAR2, NRUNNO),
      e,
    ];
    sendMail(mail);
  }
});
