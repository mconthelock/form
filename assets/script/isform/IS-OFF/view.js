import { createTable } from "../../inc/_dataTable";
import {
  doactionWebservice,
  redirectWebflow,
  setformDetail,
  showFlow,
  toggleActionForm,
} from "../../inc/_form";
import { mailForm, mailOpt, sendMail } from "../../inc/_sendmail";
import { ajaxOptionsLoad, getData, showMessage } from "../../jFuntion";
import { displayEmpImage, host, showLoader } from "../../utils";

var NFRMNO,
  VORGNO,
  CYEAR,
  CYEAR2,
  NRUNNO,
  empno,
  apv,
  mode,
  cextData,
  firstStep,
  empImage = {};

const column = [
  { data: "OFF_DATE", title: "Date", className: "text-center", width: "130px" },
  { data: "OFF_TIME", title: "Time", className: "text-center" },
  { data: "OFF_DISPLAYNAME", title: "Display Name" },
  {
    data: "OFF_EMPNO",
    title: "User",
    render: function (data, type, row) {
      return `<div class="avatar border-0 tooltip tooltip-primary" data-tip="${row.OFF_USERNAME} (${data})">
                    <div class="w-10 rounded-full border border-slate-300 shadow-md">
                        <img src="${empImage[data]}" class="" />
                        <div class="skeleton h-32 w-32"></div>
                    </div>
                </div>`;
    },
  },
  { data: "ORGANIZE", title: "Organize" },
  {
    data: "REA_TEXT",
    title: "Reason",
    render: function (data, type, row) {
      return row.OFF_REASON_TYPE == 2 ? data : row.REA_TYPE;
    },
  },
  { data: "OFF_USERCODE", title: "User Code" },
  {
    data: "OFF_CONTROLLER",
    title: "Controller",
    render: function (data, type, row) {
      // console.log(empImage[data]);
      return `<div class="avatar border-0 tooltip tooltip-primary" data-tip="${row.CONTROLNAME} (${data})">
                    <div class="w-10 rounded-full border border-slate-300 shadow-md">
                        <img src="${empImage[data]}" class="" />
                        <div class="skeleton h-32 w-32"></div>
                    </div>
                </div>`;
    },
  },
  { data: "OFF_STATUS", title: "Status" },
];

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
  const data = await getData({
    ...ajaxOptionsLoad,
    url: `${host}isform/IS-OFF/form/getData`,
    data: form,
  });
  if (data.length > 0) {
    for (const item of data) {
      empImage[item.OFF_EMPNO] = await displayEmpImage(item.OFF_EMPNO);
      empImage[item.OFF_CONTROLLER] = await displayEmpImage(
        item.OFF_CONTROLLER
      );
    }
  }
  console.log(data);
  const table = createTable("#table", {
    data: data,
    columns: column,
    searching: false,
  });
  await showFlow(NFRMNO, VORGNO, CYEAR, CYEAR2, NRUNNO);
  toggleActionForm(mode);
  $("#form").removeClass("hidden");
  $(".load").addClass("hidden");
  showLoader(false);
});

$(document).on("click", "button[name='btnAction']", async function () {
  try {
    const action = $(this).val();
    const remark = $("#remark").val();

    if (cextData == "01") {
      // const formno = 'IS-OFF' + CYEAR2.substring(2, 4) + '-' + String(NRUNNO).padStart(6, '0');
      // await sendMail({
      //     ...mailOpt,
      //     SUBJECT: `E-Form ${formno}`,
      //     BODY: [
      //         "List for Varied off AS400 display : Please approve/reject",
      //         "1. Get into http://webflow/form",
      //         "2. select 'Electronic forms'",
      //         "3. select 'Waiting for approval'"
      //     ]
      // });
      const res = await getData({
        ...ajaxOptionsLoad,
        url: `${host}isform/IS-OFF/form/sendmailNextApv`,
        data: {
          NFRMNO: NFRMNO,
          VORGNO: VORGNO,
          CYEAR: CYEAR,
          CYEAR2: CYEAR2,
          NRUNNO: NRUNNO,
        },
      });
      if (!res.status) {
        throw new Error(res.message);
      }
    }
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
