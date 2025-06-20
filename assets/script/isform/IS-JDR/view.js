import { createTable } from "../../inc/_dataTable";
import {
  doactionWebservice,
  redirectWebflow,
  setformDetail,
  showFlow,
  toggleActionForm,
} from "../../inc/_form";
import { mailForm, mailOpt, sendMail } from "../../inc/_sendmail";
import {
  ajaxOptions,
  ajaxOptionsLoad,
  getData,
  showMessage,
} from "../../jFuntion";
import * as tooltip from "../../inc/_tooltip";
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
  { data: "SECTION", title: "Section" },
  { data: "TOTAL", title: "Total" },
  { data: "COMPLETED", title: "Completed" },
  { data: "END_ABNORMAL", title: "End Abnormal" },
  { data: "SKIP", title: "Skipped" },
  { data: "RERUN", title: "Rerunning " },
];

const columnMonthly = [
  {
    data: null,
    // title: 'No.',
    render: function (data, type, row, meta) {
      // console.log(meta, typeof meta.row, meta.row, typeof meta.settings._iDisplayStart,meta.settings._iDisplayStart);
      return meta.row + 1;
    },
  },
  {
    data: "JOBSECTION",
    // title: 'SECTION',
  },
  {
    data: null,
    // title: 'DATE',
    className: "whitespace-nowrap",
    render: function (data, type, row) {
      return row.type === "summary" ? row.LOG_DATE : "";
    },
  },
  {
    data: null,
    // title: 'PLAN',
    render: function (data, type, row, meta) {
      return row.ALLPLAN ? row.ALLPLAN : "";
    },
  },
  {
    data: null,
    // title: 'COMPLETED',
    render: function (data, type, row, meta) {
      return row.COMPLETED ? row.COMPLETED : "";
    },
  },
  {
    data: null,
    // title: 'JOB No.',
    render: function (data, type, row, meta) {
      return row.JOBNO ? row.JOBNO : "";
    },
  },
  {
    data: null,
    // title: 'JOB NAME',
    render: function (data, type, row, meta) {
      return row.JOBNAME ? row.JOBNAME : "";
    },
  },
  {
    data: null,
    // title: 'PLAN TIME',
    render: function (data, type, row, meta) {
      return row.JOBPLAN ? row.JOBPLAN : "";
    },
  },
  {
    data: null,
    // title: 'START TIME',
    className: "whitespace-nowrap",
    render: function (data, type, row, meta) {
      return row.JOBSTART ? row.JOBSTART : "";
    },
  },
  {
    data: null,
    // title: 'END TIME',
    className: "whitespace-nowrap",
    render: function (data, type, row, meta) {
      return row.JOBEND ? row.JOBEND : "";
    },
  },
  {
    data: null,
    // title: 'STANDARD TIME',
    render: function (data, type, row, meta) {
      return row.JOBSTANDARD ? row.JOBSTANDARD : "";
    },
  },
  {
    data: null,
    // title: 'STATUS',
    render: function (data, type, row, meta) {
      return row.JOBSTATUS
        ? row.JOBSTATUS == "END ABNORMAL"
          ? `<div class="text-red-500 font-bold">${row.JOBSTATUS}</div>`
          : row.JOBSTATUS
        : "";
    },
  },
  {
    data: null,
    // title: 'PIC',
    render: function (data, type, row, meta) {
      return row.JOBPIC ? row.JOBPIC : "";
    },
  },
  {
    data: null,
    // title: 'SKIP',
    render: function (data, type, row, meta) {
      return row.RC_ACTION
        ? row.RC_ACTION == 0
          ? `<i class="icofont-check-circled text-green-600 text-3xl"></i>`
          : ""
        : "";
    },
  },
  {
    data: null,
    // title: 'RE-RUN',
    render: function (data, type, row, meta) {
      return row.RC_ACTION
        ? row.RC_ACTION == 1
          ? `<i class="icofont-check-circled text-green-600 text-3xl"></i>`
          : ""
        : "";
    },
  },
  {
    data: null,
    // title: 'CHECKER',
    render: function (data, type, row, meta) {
      return row.RC_CHECKERNAME
        ? `<div class="avatar border-0 tooltip tooltip-primary" data-html="${tableCheck(
            row
          )}">
                    <div class="w-10 rounded-full border border-slate-300 shadow-md">
                        <img src="${empImage[row.RC_CHECKER]}" class="" />
                        <div class="skeleton h-32 w-32"></div>
                    </div>
                </div>`
        : "";
    },
  },
  // {
  //     data: null,
  //     title: 'CONFIRM',
  //     render: function (data, type, row, meta){
  //         return row.JOBNAME ? row.JOBNAME : '';
  //     }
  // },
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
    url: `${host}isform/IS-JDR/form/getData`,
    data: form,
  });

  const monthly = await setData(data);
  console.log(monthly);

  $("#header").html(`List for Job result confirmation in ${data.my}`);
  const table = createTable("#table", {
    data: data.data,
    columns: column,
    searching: false,
    ordering: false,
    lengthChange: false,
    paging: false,
    info: false,
    dom: '<"top flex flex-col"<"table-option join  items-center"><"bg-white border border-slate-300 rounded-lg"rt>',
  });

  createTable(
    "#table1",
    {
      data: monthly,
      columns: columnMonthly,
    },
    {
      buttonFilter: { status: true, column: "1" },
    }
  );

  $("#table1 thead").addClass("text-xs");
  $("#table1 body").addClass("text-xs");

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

async function setData(data) {
  // const monthly = data.monthly.map(d => {
  //     d.endAbNormal = data.endAb.filter(e =>
  //         d.LOG_DATE == e.LOG_DATE && d.JOBSECTION == e.JOBSECTION
  //     )
  //     return d;
  // });
  for (const d of data.endAb) {
    if (d.RC_CHECKER) {
      empImage[d.RC_CHECKER] = await displayEmpImage(d.RC_CHECKER);
    }
  }
  console.log(empImage);

  const summary = data.monthly.map((item) => ({ ...item, type: "summary" }));
  const detail = data.endAb.map((item) => ({ ...item, type: "detail" }));
  const merged = [...summary, ...detail];

  merged.sort((a, b) => {
    // เรียง section
    const sectionOrder = ["AAS", "WSD"];
    const indexA = sectionOrder.indexOf(a.JOBSECTION);
    const indexB = sectionOrder.indexOf(b.JOBSECTION);
    if (indexA !== indexB) {
      return indexA - indexB;
    }
    const dateA = new Date(a.LOG_DATE);
    const dateB = new Date(b.LOG_DATE);

    // ถ้าเท่ากัน ให้เอา summary ก่อน detail
    if (dateA.getTime() === dateB.getTime()) {
      return a.type === "summary" ? -1 : 1;
    }

    return dateA - dateB;
  });

  console.log(typeof merged, merged);

  for (const key in merged) {
    if (Object.prototype.hasOwnProperty.call(merged, key)) {
      const data = merged[key];
      console.log(key, data);
      if (data.type == "detail" && merged[key - 1].type == "summary") {
        data.type = "summary";
        merged[key - 1] = {
          ...merged[key - 1],
          ...data,
        };
        merged.splice(key, 1);
      }
    }
  }

  // merged.map(data, index =>{
  //     if(data.type == 'detail' && merged[index-1].type == 'summary'){
  //         merged[index-1] = {
  //             ...merged[index-1],
  //             data
  //         }
  //         data.splice(index,1);
  //     }
  //     return data;
  // })
  console.log(merged);

  return merged;
}

/**
 * Create table for tooltip
 * @param {object} data
 * @returns
 */
function tableCheck(data) {
  const concern =
    data.RC_CONCERN == 1
      ? "concern"
      : data.RC_CONCERN == 0
      ? "not concern"
      : "-";
  return `<table>
        <thead class='font-bold text-center'>
            <tr>
                <th class='text-center'>Concern</th>
                <th class='text-center'>Checker</th>
                <th class='text-center'>Check date</th>
            </tr>
        </thead>
        <tbody class='text-center'>
            <tr>
                <td>${concern}</td>
                <td class='px-3'>${data.RC_CHECKERNAME} (${data.RC_CHECKER})</td>
                <td class=''>${data.RC_CHECKDATE}</td>
            </tr>
        </tbody>
    </table>`;
}
