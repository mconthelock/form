import {
  getUrlParams,
  requiredForm,
  showErrorMessage,
  showMessage,
} from "@amec/webasset/utils";
import { getEmpData, getFormData } from "./data";
import {
  doaction,
  getExtData,
  getMode,
  showflow,
} from "@amec/webasset/api/webform";
import { webflowSubmit } from "@amec/webasset/components/form";
import { createTable } from "@amec/webasset/dataTable";
import { redirectWebflow } from "@amec/webasset/form";
import { setSelect2 } from "@amec/webasset/select2";
import { searchUser } from "@amec/webasset/api/amec";
import Select2 from "select2";
import { fetchUtils } from "@amec/webasset/api/fetch-utils";
import { sendmail } from "@amec/webasset/api/mail";

var cextData, data;
Select2();

// main function
$(async function () {
  try {
    const param = getUrlParams();
    data = await getFormData(
      param.NFRMNO,
      param.VORGNO,
      param.CYEAR,
      param.CYEAR2,
      param.NRUNNO,
    );
    console.log(data);
    console.log(
      `${data.formmaster.VANAME}${data.form.CYEAR2.slice(-2)}-${("000000" + data.form.NRUNNO).slice(-6)}`,
    );

    const empData = await getEmpData(data.form.VREQNO);
    const getinputer = await getEmpData(data.form.VINPUTER);
    $("#FORMNO").val(
      `${data.formmaster.VANAME}${data.form.CYEAR2.slice(-2)}-${("000000" + data.form.NRUNNO).slice(-6)}`,
    );
    $("#INPUTBY").val(data.form.VINPUTER);
    $("#inputName").val(getinputer.SNAME);
    $("#REQBY").val(data.form.VREQNO);
    $("#empName").val(empData.SNAME);
    $("#reason").val(data.REMARK);
    $("#REQ_TYPE").val(data.REQ_TYPE);
    if (data.REQ_TYPE == 0) {
      $("#selector2").addClass("hidden");
      $("#option1").prop("checked", true);
    } else {
      $("#selector1").addClass("hidden");
      $("#option2").prop("checked", true);
    }
    const Showtable = await createTable(
      {
        responsive: false,
        data: data.DETAILS,
        columns: [
          { data: "LINEID", title: "NO" },
          { data: "PURCODE", title: "Item PUR" },
          { data: "ISSUESEQ", title: "Seq" },
          {
            data: "DESCRIPTION",
            title: "Description",
            className: "text-nowrap",
          },
          { data: "DRAWING", title: "Drawing No", className: "text-nowrap" },
          { data: "ORDERNO", title: "Order No." },
          { data: "ITEMNO", title: "Item" },
          { data: "ADDREESS", title: "Address" },
          { data: "RETURNTO", title: "Return To" },
          { data: "QTY", title: "Q'ty" },
          { data: "ISSUECARD", title: "Issue Card No" },
          { data: "PRODUCTION", title: "Production" },
          { data: "ISSUETO", title: "Shop" },
          { data: "REMARK", title: "Remark", className: "text-nowrap" },
          // {
          //   data: "REMARK",
          //   title: "Remark",
          //   width: "500px",
          //   render: function (data) {
          //     return `
          //     <textarea
          //       class="textarea textarea-bordered textarea-md w-full min-w-[500px] min-h-20"
          //       placeholder="WHI's reason to revise/return...."
          //       name="REMARKTABLE" readonly
          //     >${data || ""}</textarea>
          //   `;
          //   },
          // },
        ],
      },
      {
        id: "#showTable",
        domScroll: { status: true },
      },
    );

    //ปุ่ม approve กับ reject จะโชว์ก็ต่อเมื่อเป็นผู้อนุมัติเท่านั้น
    const mode = await getMode({ ...data, EMPNO: param.EMPNO });
    cextData = await getExtData({ ...data, EMPNO: param.EMPNO });
    const flow = await showflow(data);
    console.log(mode);

    let action = "";
    switch (mode) {
      case "2": // edit
        if (cextData == "01") {
          const users = await searchUser({ SSECCODE: "050504", CSTATUS: "1" });
          const controller = users
            .filter((a) => {
              return a.SPOSCODE < "55" && a.SPOSCODE > "30";
            })
            .map((c) => {
              return {
                value: c.SEMPNO,
                text: c.SNAME + " " + "(" + c.SEMPNO + ")",
              };
            });
          console.log(users, controller);
          setSelect2({
            id: "#CONTROLLER",
            data: controller,
          });
          $("#controller-section").removeClass("hidden");
        }
        action = webflowSubmit({
          flow: true,
          flowhtml: flow.html,
          approve: true,
          reject: true,
        });
        break;

      case "3": // view
        action = webflowSubmit({
          flow: true,
          flowhtml: flow.html,
          actionsForm: false,
        });
        break;
    }
    $("#sentApprove").html(action);
  } catch (error) {
    console.error("Error in show.js:", error);
    showErrorMessage("เกิดข้อผิดพลาดในการโหลดข้อมูลแบบฟอร์ม");
    return;
  }
});

$(document).on("click", "button[name='btnAction']", async function () {
  try {
    const param = getUrlParams();
    const form = {
      NFRMNO: param.NFRMNO,
      VORGNO: param.VORGNO,
      CYEAR: param.CYEAR,
      CYEAR2: param.CYEAR2,
      NRUNNO: param.NRUNNO,
    };
    const action = $(this).val();
    const remark = $("#remark").val();
    const empno =
      param.EMPNO ||
      param.empno ||
      new URLSearchParams(window.location.search).get("empno");
    const cextData = await getExtData({ ...form, EMPNO: param.EMPNO });
    console.log(cextData);
    const state = {
      ...form,
      EMPNO: empno,
      ACTION: action,
      REMARK: remark,
    };
    let res;
    const requiredmessage = [
      { element: $("#CONTROLLER"), message: "Please select controller." },
    ];
    if (cextData == "01") {
      if (!(await requiredForm("#CONTROLLER", requiredmessage))) return;
      const controller = { ...state, CONTROLLER: $("#CONTROLLER").val() };
      res = await updateController(controller);
    } else if (cextData == "02") {
      res = await doaction(state);
      if (!res.status) {
        throw new Error(res.message);
      }
      data = await getFormData(
        param.NFRMNO,
        param.VORGNO,
        param.CYEAR,
        param.CYEAR2,
        param.NRUNNO,
      );
      const Userreq = await getEmpData(data.form.VREQNO);
      const formNo = `${data.formmaster.VANAME}${data.form.CYEAR2.slice(-2)}-${("000000" + data.form.NRUNNO).slice(-6)}`;
      if (action === "approve") {
        await sendmail({
          to: Userreq.SRECMAIL,
          cc: "viyada@MitsubishiElevatorAsia.co.th",
          subject: "Form Revise/Return WHI Complete",
          html: `<p>Dear PP Sect.</p>
                <p style="text-indent: 2em;">Form No: ${formNo} </p>
                <p style="text-indent: 2em;">WHI Sect. Revise data issue card & Return data issue card finished.</p>
                <p>Please Re-check data again.</p>
                <p>Best Regards,</p>`,
        });
      }else if (action === "reject") {
        await sendmail({
          to: Userreq.SRECMAIL,
          cc: "viyada@MitsubishiElevatorAsia.co.th",
          subject: "Form Revise/Return WHI Reject",
          html: `<p>Dear PP Sect.</p>
                <p style="text-indent: 2em;">Form No: ${formNo} </p>
                <p style="text-indent: 2em;">WHI Sect. Reject data issue card.</p>
                <p>Please Re-check data again.</p>
                <p>Best Regards,</p>`,
        });
      }
    } else {
      res = await doaction(state);
    }

    console.log(res);
    if (res.status) {
      showMessage(res.message, "success");
      redirectWebflow();
    } else {
      throw new Error(res.message);
    }
  } catch (error) {
    console.error(error);
    showMessage(error.message);
  }
});

async function updateController(state) {
  return await fetchUtils({
    url: `${process.env.APP_API}/psform/ps-rp`,
    method: "PATCH",
    data: state,
  });
}
