import { getUrlParams, showErrorMessage } from "@amec/webasset/utils";
import { getEmpData, getFormData } from "./data";
import { webflowSubmit } from "@amec/webasset/components/form";
import { getExtData, getMode, showflow } from "@amec/webasset/api/webform";
import { setSelect2 } from "@amec/webasset/select2";
import { createTable } from "@amec/webasset/dataTable";

var cextData, data;

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
    const reqData = await getEmpData(data.form.VREQNO);
    const inPuter = await getEmpData(data.form.VINPUTER);
    $("#FORMNO").val(
      `${data.formmaster.VANAME}${data.form.CYEAR2.slice(-2)}-${("000000" + data.form.NRUNNO).slice(-6)}`,
    );
    $("#INPUTBY").val(data.form.VINPUTER);
    $("#inputName").val(inPuter.SNAME);
    $("#REQBY").val(data.form.VREQNO);
    $("#reqName").val(reqData.SNAME);
    $("#schd_txt").val(data.CHANGE_SCHD);

    const tableData = Array.isArray(data.DETAILS)
      ? data.DETAILS
      : JSON.parse(data.DETAILS || "[]");

    const showTable = await createTable(
      {
        responsive: false,
        data: tableData,
        columns: [
          { data: "SEQNO", title: "No" },
          { data: "DRAWING", title: "Drawing No.", className: "text-nowrap" },
          { data: "ITEM", title: "Item" },
          { data: "NEWCODE", title: "Code", className: "text-nowrap" },
          { data: "NEWFLAG", title: "New Flag" },
          { data: "OLDCODE", title: "Code", className: "text-nowrap" },
          { data: "OLDFLAG", title: "Flag" },
          { data: "OLDSTATUS", title: "Status", className: "text-nowrap" },
          { data: "OLDSPEC", title: "Spec Material", className: "text-nowrap" },
          { data: "REFERENCE", title: "Reference", className: "text-nowrap" },
          {
            data: "REMARK",
            title: "Remark",
            className: "min-w-[300px]",
            width: "300px",
          },
        ],
        columnDefs: [
          {
            targets: "_all",
            defaultContent: "",
          },
        ],
        initComplete: function () {
          const $thead = $(this.api().table().header());

          $thead.html(`
        <tr>
          <th rowspan="2">No</th>
          <th rowspan="2">Drawing No.</th>
          <th rowspan="2">Item</th>
          <th colspan="2">Change To</th>
          <th colspan="4">Before Change</th>
          <th rowspan="2">Reference</th>
          <th rowspan="2" style="min-width: 300px;">Remark</th>
        </tr>
        <tr>
          <th>Code</th>
          <th>New Flag</th>
          <th>Code</th>
          <th>Flag</th>
          <th>Status</th>
          <th>Spec Material</th>
        </tr>
      `);
        },
      },
      {
        id: "#Table",
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
          const users = await searchUser({ SSECCODE: "050502", CSTATUS: "1" });
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
