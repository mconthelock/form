import { fetchUtils } from "@amec/webasset/api/fetch-utils";
import { getFormDetail, getMode, showflow } from "@amec/webasset/api/webform";
import { webflowSubmit } from "@amec/webasset/components/form";
import { getUrlParams } from "@amec/webasset/utils";
import { downloadOrOpenFile, getFileForm } from "@amec/webasset/api/file";

$(async function () {
  const param = getUrlParams();
  console.log(param);

  const form = {
    NFRMNO: param.NFRMNO,
    VORGNO: param.VORGNO,
    CYEAR: param.CYEAR,
    CYEAR2: param.CYEAR2,
    NRUNNO: param.NRUNNO,
  };

  const formDetail = await getFormDetail(form);
  console.log(formDetail);
  $("#INPUTBY").text(formDetail.VINPUTER);
  $("#REQBY").text(formDetail.VREQNO);

  const empData = await getEmpData(formDetail.VREQNO);
  console.log(empData);

  $("#empName").text(empData.STNAME);
  $("#empDept").text(`${empData.SSEC}/${empData.SDEPT}/${empData.SDIV}`);
  $("#empPos").text(empData.SPOSITION);

  /*เอามาจาก bcackend */
  /*เรียกใช้ข้อมูลทีละตัว*/
  /*เอาวัตถุประสงค์ชื่อสแตมป์มาโชว์*/

  const getShowdata = await getShowData(form); //รูปแบบ stamp ปกติ
  const getShowCusdata = await getShowCusData(form); //รูปแบบพิเศษ

  try {
    const fileForm = await getFileForm({
      ...form,
      FORM_TYPE: "GP",
    });
    console.log(fileForm);
    if (!fileForm.status) {
      throw new Error(fileForm.message);
    }
    // แสดงรายการไฟล์ที่แนบมากับฟอร์ม
    $(".file-list").html(
      fileForm.data
        .map(
          (f) => `
                <div class="file-item w-full min-h-[2rem]rounded-md border border-base-300 bg-base-100 px-4 py-2">
                    <span>${f.FILE_FNAME}</span>
                    <button class="download-btn btn btn-primary btn-sm ml-auto shrink-0 " data-stored-name="
                    ${f.FILE_FNAME}" data-original-name="${f.FILE_ONAME}" data-path="${f.FILE_PATH}"
                    >Download</button>
                </div>
            `,
        )
        .join(""),
    );
  } catch (error) {
    console.error("Error fetching file form:", error);
  }

  const purpose = await getData();
  console.log(purpose);
  const Purposedata = purpose
    .map((a) => {
      const otherSelect = `<input type="text"
                            class="input input-sm input-ghost w-full rounded-none border-b border-base-300 focus:border-primary focus:bg-base-200/50 px-1"
                            id="otherSelect" name="PURPOSE_OTHER" placeholder="Please specify other purpose" disabled readonly>`;

      return `<label class="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="PURPOSE_ID" 
                                    class="radio radio-xs rounded border-base-content 
                                    [--chkbg:var(--bc)] [--chkfg:var(--b1)] req" value="${a.PURPOSE_ID}"
                                    id="purpose_${a.PURPOSE_ID}" >
                                <span>${a.PURPOSE_TH}/${a.PURPOSE_EN}</span>
                                ${a.PURPOSE_ID == 4 ? otherSelect : ""}
                            </label>`;
    })
    .join("");

  $("#purposeList").html(Purposedata);

  //ปุม approve กับ reject จะโชว์ก็ต่อเมื่อเป็นผู้อนุมัติเท่านั้น
  const mode = await getMode({ ...form, EMPNO: param.EMPNO });
  const flow = await showflow(form);
  console.log(mode);
  let action = "";
  switch (mode) {
    case "2": // edit
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

  ////////////////////////////////////////////////////////
  if (getShowdata.PURPOSE_ID) {
    $(`#purpose_${getShowdata.PURPOSE_ID}`).prop("checked", true);
    if (getShowdata.PURPOSE_ID == 4) {
      $("#otherSelect")
        .prop("disabled", false)
        .val(getShowdata.PURPOSE_OTHER || "");
    }
  }

  $('input[name="PURPOSE_ID"]').prop("disabled", true);
  console.log(getShowdata.NAME_STAMP);

  // เช็คว่ามีข้อมูล Other Stamp หรือไม่
  const hasCustomStamp =
    getShowCusdata &&
    Object.keys(getShowCusdata).length > 0 &&
    getShowCusdata.NRUNNO;

  // เช็คว่ามีข้อมูล Standard Stamp หรือไม่
  const hasStandardStamp =
    getShowdata &&
    Object.keys(getShowdata).length > 0 &&
    getShowdata.NAME_STAMP;

  const isSameRunNo =
    String(getShowCusdata?.NRUNNO || "").trim() ===
    String(getShowdata?.NRUNNO || "").trim();

  if (hasCustomStamp && isSameRunNo) {
    $("#radioOther").prop({
      checked: true,
      disabled: false,
    });

    $("#radioStandard").prop({
      checked: false,
      disabled: true,
    });

    $("#radioOtherBox").show();
    $("#radioStandardBox").hide();
    // ปิด Standard Stamp Section
    $("#standardStampSection")
      .css({
        opacity: "0.4",
        "pointer-events": "none",
      })
      .find("input, textarea")
      .prop("disabled", false);

    // เปิด Other Stamp Section เพื่อโชว์ข้อมูล แต่ไม่ให้แก้
    $("#otherStampSection")
      .css({
        opacity: "1",
        "pointer-events": "auto",
      })
      .find("input, textarea")
      .prop("disabled", false);

    // เอาข้อมูล Purpose จาก getShowdata มาโชว์
    if (getShowdata.PURPOSE_ID) {
      $(`#purpose_${getShowdata.PURPOSE_ID}`).prop("checked", true);

      if (String(getShowdata.PURPOSE_ID) === "4") {
        $("#otherSelect")
          .prop("disabled", true)
          .prop("readonly", true)
          .val(getShowdata.PURPOSE_OTHER || "");
      }
    }

    // เอาข้อมูล Other Stamp จาก getShowCusdata มาโชว์
    $("#otherQty").text(getShowCusdata.QTY);
    $("#otherRemark").text(getShowCusdata.REMARK);

    $(document).on("click", ".download-btn", async function () {
      try {
        const file = await downloadOrOpenFile({
          baseDir: $(this).data("path"),
          storedName: $(this).data("stored-name"),
          originalName: $(this).data("original-name"),
          mode: "download",
        });
      } catch (error) {
        console.error("Error downloading or opening file:", error);
      }
    });

    return;
  }

  if (hasStandardStamp) {
    $("#radioStandard").prop({
      checked: true,
      disabled: false,
    });

    $("#radioOther").prop({
      checked: false,
      disabled: true,
    });

    // show Standard
    $("#radioStandardBox").show();
    $("#radioOtherBox").hide();

    // เปิด Standard Stamp Section
    $("#standardStampSection").css({
      opacity: "1",
      "pointer-events": "auto",
    });

    // ปิด Other Stamp Section
    $("#otherStampSection")
      .css({
        opacity: "0.4",
        "pointer-events": "none",
      })
      .find("input, textarea")
      .prop("disabled", true);
  }
  // แปลง SPOSCODE ให้เป็น string และเติม 0 ด้านหน้า ถ้าเป็นเลขหลักเดียว เช่น 2 => 02
  const PosiCodeArray = Array.isArray(empData.SPOSCODE)
    ? empData.SPOSCODE
    : empData.SPOSCODE
      ? [empData.SPOSCODE]
      : [];

  let firstPosCode =
    PosiCodeArray.length > 0 ? String(PosiCodeArray[0]).trim() : null;

  if (firstPosCode) firstPosCode = firstPosCode.padStart(2, "0");

  // กลุ่มที่ใช้ nameInput1 / stampCircle1
  const input1PosCodes = [
    "02", // PRESIDENT
    "05", // GENERAL MANAGER
    "10", // DIVISION MANAGER
    "11", // DEPUTY DIVISION MANAGER
    "20", // DEPARTMENT MANAGER
    "21", // DEPUTY DEPARTMENT MANAGER
    "90", // ADVISOR
    "22", // SENIOR SPECIALIST
    "30", // SECTION MANAGER
    "32", // SPECIALIST
  ];

  // กลุ่มที่ใช้ nameInput2 / stampCircle2
  const input2PosCodes = [
    "33", // ASSISTANT MANAGER
    "49", // SUPERVISOR
    "50", // FOREMAN
    "55", // LEADER
    "35", // ENGINEER
    "40", // STAFF
  ];

  // เคลียร์ก่อน
  $("#nameInput1").val("");
  $("#nameInput2").val("");
  $("#name").text("");
  $("#name2").text("");
  $("#divisionDisplay").text("");

  // reset opacity
  $("#rowStamp1").css("opacity", "1");
  $("#rowStamp2").css("opacity", "1");

  if (input1PosCodes.includes(firstPosCode)) {
    $("#nameInput1").val(getShowdata.NAME_STAMP || "");
    $("#name").text(
      getShowdata.NAME_STAMP || "",
    ); /*แสดงชื่อใต้สแตมป์ในวงกลมสีน้ำเงิน*/
    $("#nameInput2").val("");
    // แถวบน active / แถวล่างจาง
    $("#rowStamp1").css("opacity", "1");
    $("#rowStamp2").css("opacity", "0.3");
  } else if (input2PosCodes.includes(firstPosCode)) {
    $("#nameInput1").val("");
    $("#nameInput2").val(getShowdata.NAME_STAMP || "");
    $("#divisionDisplay").text(
      empData.SDIV || "",
    ); /*แสดงชื่อแผนกใต้สแตมป์ในวงกลมสีน้ำเงิน*/
    console.log(empData.SDIV);
    $("#name2").text(getShowdata.NAME_STAMP || "");
    // แถวบนจาง / แถวล่าง active
    $("#rowStamp1").css("opacity", "0.3");
    $("#rowStamp2").css("opacity", "1");
  } else {
    // กรณีไม่เจอ position code จะเลือกให้ใส่ช่องแรกไว้ก่อน
    $("#nameInput1").val(getShowdata.NAME_STAMP || "");
    $("#name").text(getShowdata.NAME_STAMP || "");
    $("#nameInput2").val("");
    $("#rowStamp1").css("opacity", "1");
    $("#rowStamp2").css("opacity", "0.3");
  }
  // ต้องเช็คหลังจาก set ค่าเสร็จแล้ว
  const hasNameInput1 = $("#nameInput1").val().trim() !== "";
  const hasNameInput2 = $("#nameInput2").val().trim() !== "";
  $("#nameInput1").prop("disabled", hasNameInput1);
  $("#nameInput2").prop("disabled", hasNameInput2);

  $("#radioOther").prop("disabled", hasNameInput1 || hasNameInput2);
});

// other stamp

async function getData() {
  return await fetchUtils({
    url: `${process.env.APP_API}/gpform/gp-rb`,
    method: "GET",
  });
}

async function getShowData(form) {
  const url = `${process.env.APP_API}/gpform/showstamp-gp-rb/${form.NFRMNO}/${form.VORGNO}/${form.CYEAR}/${form.CYEAR2}/${form.NRUNNO}`;
  return await fetchUtils({
    url: url,
    method: "GET",
  });
}

async function getShowCusData(form) {
  const url = `${process.env.APP_API}/gpform/showcusstamp-gp-rb/${form.NFRMNO}/${form.VORGNO}/${form.CYEAR}/${form.CYEAR2}/${form.NRUNNO}`;
  return await fetchUtils({
    url: url,
    method: "GET",
  });
}

async function getEmpData(empno) {
  return await fetchUtils({
    url: `${process.env.APP_API}/users/${empno}`,
    method: "GET",
  });
}

async function getFileForm() {
  return await fetchUtils({
    url: `${process.env.APP_API}/webform/file/get-file/`,
    method: "POST",
    data,
  });
}
