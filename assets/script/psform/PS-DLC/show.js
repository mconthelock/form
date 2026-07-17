import {
  getUrlParams,
  requiredForm,
  showErrorMessage,
  showMessage,
} from "@amec/webasset/utils";
import {
  getDrawingGroups,
  getEmpData,
  getFormData,
  updateController,
  updateDLCform,
  validateDrawingNo,
} from "./data";
import { webflowSubmit } from "@amec/webasset/components/form";
import {
  doaction,
  getExtData,
  getMode,
  showflow,
} from "@amec/webasset/api/webform";
import { setSelect2 } from "@amec/webasset/select2";
import { createTable } from "@amec/webasset/dataTable";
import { redirectWebflow } from "@amec/webasset/form";
import { searchUser } from "@amec/webasset/api/amec";
import Select2 from "select2";
import dayjs from "dayjs";
import { showLoader } from "@amec/webasset/preloader";
import { sendmail } from "@amec/webasset/api/mail";

var cextData, data;
var showTable = null;
Select2();

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

    showTable = await createTable(
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
              return a.SPOSCODE < "50" && a.SPOSCODE > "30";
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
      if (action === "approve") {
        if (!(await requiredForm("#CONTROLLER", requiredmessage))) return;
        const controller = { ...state, CONTROLLER: $("#CONTROLLER").val() };
        res = await updateController(controller);
      } else {
        res = await doaction(state);
      }
    } else if (cextData == "02") {
      showLoader();
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const empnum = urlParams.get("empno");
      const actualDate = dayjs().format("YYYY-MM-DD HH:mm:ss");

      const details = showTable
        .rows()
        .data()
        .toArray()
        .map((row) => {
          const drawing = row.DRAWING ? String(row.DRAWING).trim() : "";
          if (!drawing) return null;

          const validatedDrawing = validateDrawingNo(drawing) || drawing;
          const groups = getDrawingGroups(validatedDrawing);
          console.log(validatedDrawing);
          console.log(groups.pnzuba);
          console.log(groups.pnhing);

          return {
            NEWCODE: row.NEWCODE || null,
            NEWFLAG: row.NEWFLAG || null,
            REFERENCE: row.REFERENCE || null,
            PNZUBA: groups?.pnzuba || null,
            PNHING: groups?.pnhing || null,
          };
        })
        .filter(
          (item) => item && (item.NEWCODE || item.NEWFLAG || item.REFERENCE),
        );

      const updateformData = {
        ...state,
        CHANGE_STATUS: "1",
        ACTUAL_DATE: actualDate,
        ACTUAL_UPDATEBY: empnum,
        DETAILS: details,
      };

      res = await updateDLCform(updateformData);
    } else {
      res = await doaction(state);
    }
    data = await getFormData(
      param.NFRMNO,
      param.VORGNO,
      param.CYEAR,
      param.CYEAR2,
      param.NRUNNO,
    );
    const formNo = `${data.formmaster.VANAME}${data.form.CYEAR2.slice(-2)}-${("000000" + data.form.NRUNNO).slice(-6)}`;
    console.log(res);
    if (res.status) {
      if (cextData == "02") {
        await sendmail({
          to: [
            "viyada@MitsubishiElevatorAsia.co.th",
            "anucha@MitsubishiElevatorAsia.co.th",
            "chatchawarnk@MitsubishiElevatorAsia.co.th",
            "chakkritv@MitsubishiElevatorAsia.co.th",
            // "punnawichs@mitsubishielevatorasia.co.th",
          ],
          subject: "Form Drawing list for change PN Production update Complete",
          html: `<p>Dear PP Sect.</p>
                        <p style="text-indent: 2em;">Form No: ${formNo} </p>
                        <p style="text-indent: 2em;">Drawing List for change PN production (Complete)</p>
                        <p>Please Re-check data again.</p>
                        <p>Best Regards,</p>`,
        });
      }
      showMessage(res.message, "success");
      redirectWebflow();
    } else {
      throw new Error(res.message);
    }
  } catch (error) {
    console.error(error);
    showMessage(error.message);
  } finally {
    showLoader({ show: false });
  }
});
