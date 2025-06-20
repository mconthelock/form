import {
  carousel,
  carouselAuto,
  carouselAutoOption,
  carouselNavOpt,
  fancybox,
} from "../../inc/_fancyBox";
import {
  toggleActionForm,
  doactionWebservice,
  redirectWebflow,
  showFlow,
  setformDetail,
} from "../../inc/_form";
import { mailForm, mailOpt, sendMail } from "../../inc/_sendmail";
import { autosizeTextarea, showMessage } from "../../jFuntion";
import { showLoader } from "../../utils";

var NFRMNO,
  VORGNO,
  CYEAR,
  CYEAR2,
  NRUNNO,
  empno,
  apv,
  mode,
  cextData,
  firstStep; //openModal = true ;//,module,;
$(async function () {
  showLoader(true);
  NFRMNO = $(".form-info").attr("NFRMNO");
  VORGNO = $(".form-info").attr("VORGNO");
  CYEAR = $(".form-info").attr("CYEAR");
  empno = $(".form-info").attr("empno");
  mode = $(".form-info").attr("mode");
  CYEAR2 = $(".form-info").attr("CYEAR2");
  NRUNNO = $(".form-info").attr("NRUNNO");
  apv = $(".apv-data").attr("apv");
  cextData = $(".apv-data").attr("cextData");
  firstStep = $(".apv-data").attr("firstStep");
  const form = {
    NFRMNO: NFRMNO,
    VORGNO: VORGNO,
    CYEAR: CYEAR,
    CYEAR2: CYEAR2,
    NRUNNO: NRUNNO,
  };

  $(".form-info").html(await setformDetail(form));
  await showFlow(NFRMNO, VORGNO, CYEAR, CYEAR2, NRUNNO);
  toggleActionForm(mode);

  $("#form").removeClass("hidden");
  $(".load").addClass("hidden");
  showLoader(false);
  const before = carouselAuto("fileBefore", {
    ...carouselAutoOption,
    Dots: false,
  });
  const result = carouselAuto("fileResult", {
    ...carouselAutoOption,
    Dots: false,
  });
  const navBefore = carousel("navBefore", {
    ...carouselNavOpt,
    Sync: { target: before },
  });
  const navResult = carousel("navResult", {
    ...carouselNavOpt,
    Sync: { target: result },
  });
  fancybox("fileBefore");
  fancybox("fileResult");
  autosizeTextarea(document.getElementById("workcontent"));
});

$(document).on("click", "button[name='btnAction']", async function () {
  try {
    const action = $(this).val();
    const remark = $("#remark").val();

    const formStatus = await doactionWebservice(
      NFRMNO,
      VORGNO,
      CYEAR,
      CYEAR2,
      NRUNNO,
      action,
      apv,
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
