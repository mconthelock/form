import { elementDragDrop, handleFiles } from "../../inc/_dragdrop";
import { fileFormats } from "../../inc/_file";
import {
  toggleActionForm,
  doactionWebservice,
  redirectWebflow,
  showFlow,
} from "../../inc/_form";
import { destroySelect2, s2opt, setSelect2 } from "../../inc/_select2";
import { mailForm, mailOpt, sendMail } from "../../inc/_sendmail";
import {
  ajaxOptions,
  ajaxOptionsLoad,
  autosizeTextarea,
  getData,
  removeClassError,
  requiredForm,
  showMessage,
} from "../../jFuntion";
import { displayEmpImage, host, showLoader } from "../../utils";
import { getAmecusers } from "../../webservice";

var programs,
  NFRMNO,
  VORGNO,
  CYEAR,
  CYEAR2,
  NRUNNO,
  empno,
  apv,
  mode,
  cextData,
  firstStep,
  data; //openModal = true ;//,module,;
$(async function () {
  showLoader(true);
  NFRMNO = $(".form-info").attr("NFRMNO");
  VORGNO = $(".form-info").attr("VORGNO");
  CYEAR = $(".form-info").attr("CYEAR");
  empno = $(".form-info").attr("empno");
  mode = $(".form-info").attr("mode");
  if (mode != "1") {
    CYEAR2 = $(".form-no").attr("CYEAR2");
    NRUNNO = $(".form-no").attr("NRUNNO");
    apv = $(".apv-data").attr("apv");
    cextData = $(".apv-data").attr("cextData");
    firstStep = $(".apv-data").attr("firstStep");
    await showFlow(NFRMNO, VORGNO, CYEAR, CYEAR2, NRUNNO);
    data = await getData({
      ...ajaxOptionsLoad,
      url: `${host}isform/IS-CFS/form/getData`,
      data: {
        NFRMNO: NFRMNO,
        VORGNO: VORGNO,
        CYEAR: CYEAR,
        CYEAR2: CYEAR2,
        NRUNNO: NRUNNO,
      },
    });
    if (data.CFS_REQNO) {
      $("#reqNo")
        .val(data.CFS_REQNO)
        .prop("readonly", true)
        .data("link", data.link)
        .addClass("link link-primary");
    }
  }
  toggleActionForm(mode);

  $("#form").removeClass("hidden");
  $(".load").addClass("hidden");
  await setSelect2(
    {
      ...s2opt,
      templateSelection: function (data) {
        // console.log(data);
        if (data.id == "") {
          return data.text;
        }
        return data.id;
      },
    },
    "#sysCode"
  );
  await setReleaser();
  programs = await getProgramList();
  // module = await getModule();
  await setSelect2({ ...s2opt }, "#program_owner");
  await setSelect2({ ...s2opt }, "#program_type");
  showLoader(false);
  const wk = document.getElementById("workCon");
  wk.addEventListener("input", () => autosizeTextarea(wk));
});

async function getProgramList() {
  return await getData({
    ...ajaxOptionsLoad,
    url: `${host}isform/IS-CFS/form/getProgram`,
  });
}
// async function getModule() {
//     return await getData({
//         ...ajaxOptions,
//         url: `${host}isform/IS-CFS/form/getModule`,
//     });
// }

/**
 * Set releaser
 */
async function setReleaser() {
  const formatUser = (val) => {
    if (!val.id || val.id == "Select Releaser") return val.text;
    const imgSrc = $(val.element).data("img"); // ดึง data-img
    return $(
      `<div class="flex gap-3 items-center">
                    <div class="avatar">
                        <div class="w-8 rounded-full"><img src="${imgSrc}" /></div>
                    </div>
                    <div>${val.text}</div>
                </div>`
    );
  };

  const resusers = await getAmecusers();
  const users = resusers.filter((el) => el.SDEPCODE == "050601");
  users.map(async (el) => {
    const img = await displayEmpImage(el.SEMPNO);
    if (
      el.SPOSCODE < "41" &&
      (el.SSECCODE == "050604" || el.SSECCODE == "050602")
    ) {
      $("#select-developer").append(
        `<option value="${el.SEMPNO}" data-img="${img}">${el.SNAME} (${el.SEMPNO})</option>`
      );
    }
  });

  await setSelect2(
    {
      ...s2opt,
      dropdownParent: $("#newprogram_module"),
      templateResult: formatUser,
      templateSelection: formatUser,
      escapeMarkup: function (markup) {
        return markup; // ปิดการ escape เพื่อแสดง HTML
      },
    },
    "#select-developer"
  );
}

/**
 * set program
 * @param {string} division e.g. DES
 * @param {string} type e.g. P
 */
async function setProgram(division, type) {
  // if(openModal == true) return;
  console.log(division, type);

  const filteredPrograms = programs.filter(
    (p) => p.DIVCODE == division && p.PROTID == type
  );
  console.log(filteredPrograms);

  const uniqueFilteredPrograms = [
    ...new Set(filteredPrograms.map((program) => program.PROMID)),
  ].map((id) => filteredPrograms.find((program) => program.PROMID === id));

  if (uniqueFilteredPrograms.length == 0) {
    setNewProgram();
    $('input[name="programType"][value="1"]').trigger("click");
    $('input[name="programType"][value="2"]').prop("disabled", true);
    return;
  } else {
    $('input[name="programType"][value="2"]')
      .prop("disabled", false)
      .trigger("click");
  }

  $("#program_name").empty();
  $("#program_name").append(`<option value="" ></option>`);
  uniqueFilteredPrograms.forEach((program) => {
    $("#program_name").append(
      `<option value="${program.PROMID}" data-name="${program.PROMNAME}" data-id="${program.PROMID}">${program.TITLE}</option>`
    );
  });
  setSelect2(s2opt, "#program_name");
}

async function setNewProgram() {
  await destroySelect2("#program_name");
  $("#program_name").replaceWith(
    `<input type="text" class="input w-full req" name="program_name" id="program_name" placeholder="e.g. SCM" required />`
  );
}

// /**
//  * set module
//  * @param {string} division e.g. DES
//  * @param {string} type e.g. P
//  * @param {number} program program id e.g. 1
//  * @returns
//  */
// async function setModule(division, type, program) {
//     console.log(division, type, program);
//     console.log(module);
//     const filteredModule = module.filter(
//       (p) => p.DIVCODE == division && p.PROTID == type && p.PROMID == program
//     );

//     $("#program_module").empty();
//     $("#program_module").append(
//         `<option value="" ></option>`
//     );
//     filteredModule.forEach((el) => {
//       $("#program_module").append(
//         `<option value="${el.FUNCCODE}">${el.TITLE}</option>`
//       );
//     });
//     setSelect2(s2opt, '#program_module');
// }

/**
 * open new program modal
 * description: reset value and remove error class
 */
$(document).on("click", "#newProgram", function () {
  // openModal = true;
  $("#program_owner").val(null).trigger("change");
  $("#program_type").val(null).trigger("change");
  $("#program_name").val("");
  $("#program_module").val("");
  $("#select-developer").val(null).trigger("change");
  removeClassError($("#program_owner"));
  removeClassError($("#program_type"));
  removeClassError($("#program_module"));
  removeClassError($("#select-developer"));
  $('input[name="programType"][value="1"]').trigger("click");
  // $('input[name="programType"][value="2"]').prop('disabled', false);
  // openModal = false;
});

/**
 * choose program type
 * description: if program type is 1, set program name to input text and module type to input text
 *              if program type is 2, set program name to select2 and module type to select2
 */
$(document).on("change", 'input[name="programType"]', async function () {
  const type = $(this).val();
  console.log("Program Type : ", type);
  if (type == 1) {
    setNewProgram();
  } else {
    $("#program_name")
      .replaceWith(`<select class="select validator req w-full" name="program_name" id="program_name" placeholder="Select Program Name">
            <option value=''></option>
        </select>`);
    const type = $("#program_type").val();
    const division = $("#program_owner").val();
    setProgram(division, type);
  }
});

// /**
//  * choose module type
//  * description: if module type is 1, set module name to input text and program name to input text
//  *              if module type is 2, set module name to select2 and program name to select2
//  */
// $(document).on('change', 'input[name="moduleType"]', async function(){
//     const type = $(this).val();
//     console.log('Module Type : ', type);
//     if(type == 1){
//         await destroySelect2('#program_module');
//         $('#program_module').replaceWith(`<input type="text" class="input w-full req" name="program_module" id="program_module" placeholder="e.g. Purchase order for Buyer" required />`);
//     }else{
//         $('#program_module').replaceWith(`
//             <select class="select validator req w-full" name="program_module" id="program_module" placeholder="Select Program Module">
//                 <option value=''></option>
//             </select>`);
//         const division = $("#program_owner").val();
//         const type = $("#program_type").val();
//         const program = $("#program_name").val();
//         setModule(division, type, program);
//     }
// });

// Type Change
$(document).on("change", "#program_type", async function () {
  const type = $(this).val();
  const division = $("#program_owner").val();
  const programType = $('input[name="programType"]:checked').val();
  // if (programType == 2) {;
  setProgram(division, type);
  // }
});

// Division Change
$(document).on("change", "#program_owner", async function () {
  const division = $(this).val();
  const type = $("#program_type").val();
  const programType = $('input[name="programType"]:checked').val();
  // if (programType == 2) {;
  setProgram(division, type);
  // setModule(division, type, null);
  // }
});

// Program Change
// $(document).on("change", "#program_name", async function () {
//     const division = $("#program_owner").val();
//     const type = $("#program_type").val();
//     const program = $("#program_name").val();
//     const moduleType = $('input[name="moduleType"]:checked').val();
//     if (moduleType == 2) {;
//         setModule(division, type, program);
//     }
// });

// Save New Program
$(document).on("click", "#savenewprogram", async function () {
  if (!(await requiredForm("#newprogram_module"))) return;
  const data = {
    division: $("#program_owner").val(),
    type: $("#program_type").val(),
    programid: $("#program_name").find(":selected").data("id"),
    // programid   : $("#program_id").val(),
    programname: $("#program_name").val(),
    pic: empno,
    releaser: $("#select-developer").val(),
    module: $("#program_module").val(),
    action: $('input[name="programType"]:checked').val(),
  };
  const res = await getData({
    ...ajaxOptionsLoad,
    url: `${host}/isform/IS-CFS/form/savePrograms`,
    data: data,
  });
  if (res.status) {
    showMessage(res.message, "success");
    $("#sysCode").empty();
    $("#sysCode").append(`<option value="" ></option>`);
    programs = res.program;
    // programs = await getProgramList();
    programs.forEach((program) => {
      $("#sysCode").append(
        `<option value="${program.SYSCODE}" data-name="${program.PROMNAME}"  data-id="${program.PROMID}" data-type="${program.PROTID}" data-code="${program.DIVCODE}">${program.TITLE}</option>`
      );
    });
    // module   = await getModule();
    $("#sysCode").val(res.sysCode).trigger("change");
    $("#newProgram").prop("checked", false); // close modal
  } else {
    showMessage(res.message, "error");
  }
});

$(document).on("change", "#sysCode", async function () {
  const name = $(this).find(":selected").data("name");
  console.log(name);
  if ($(this).val() == "") {
    $("#sysName").val("");
    return;
  } else {
    $("#sysName").val(name);
  }
});

$(document).on("keydown", 'input[name="reqNo"]', async function (e) {
  if (e.key === "Enter") {
    $(this).trigger("blur");
  }
});

$(document).on("click", "#reqNo", async function () {
  if ($(this).attr("readonly")) {
    const link = $(this).data("link");
    window.open(link, "_blank");
  }
});

$(document).on("blur", 'input[name="reqNo"]', async function () {
  // $(document).on('blur', '#reqNo', async function(){
  if ($(this).attr("readonly")) return;
  const reqNo = $(this).val().toUpperCase();
  console.log(reqNo);

  if (RegExp(/^[A-Za-z]+-[a-zA-Z0-9]+-[0-9]+$/).test(reqNo)) {
    $(this).val(reqNo);
  } else {
    $(this).val("");
    showMessage(
      "กรุณากรอกเลขที่คำร้องให้ถูกต้อง เช่น IS-DEV25-000127",
      "warning"
    );
    return;
  }
  $("#submit").find(".loading").removeClass("hidden");
  $("#submit").addClass("btn-disabled");
  $('button[name="btnAction"]').addClass("btn-disabled");
  $(this).prop("disabled", true);
  $(this).siblings(".loading").removeClass("hidden");

  const check = await getData({
    ...ajaxOptions,
    url: `${host}isform/IS-TID/form/getRequestNo`,
    // url: `${process.env.APP_ENV}/isform/IS-TID/form/getRequestNo`,
    data: { reqNo: reqNo },
  });

  $("#submit").find(".loading").addClass("hidden");
  $("#submit").removeClass("btn-disabled");
  $('button[name="btnAction"]').removeClass("btn-disabled");
  $(this).prop("disabled", false);
  $(this).siblings(".loading").addClass("hidden");

  if (check.status == 0) {
    showMessage("ไม่พบเลขที่คำร้องนี้ในระบบ", "warning");
    $(this).addClass("!input-error");
    $(this).val("");
  } else {
    $(this).removeClass("!input-error");
  }
});

$(document).on(
  "change",
  'input[name="fileBefore[]"], input[name="fileResult[]"]',
  async function () {
    const element = elementDragDrop($(this));
    const format = $(this).data("format");
    // console.log(format);

    // handleFiles($(this)[0].files, element, format);
    handleFiles($(this)[0].files, element, fileFormats[format]);
  }
);

$(document).on("click", "button[name='btnAction']", async function () {
  try {
    if (!(await requiredForm("#form"))) return;
    const frm = $("#form");
    const action = $(this).val();
    const remark = $("#remark").val();
    const formData = new FormData(frm[0]);
    formData.append("NFRMNO", NFRMNO);
    formData.append("VORGNO", VORGNO);
    formData.append("CYEAR", CYEAR);
    formData.append("CYEAR2", CYEAR2);
    formData.append("NRUNNO", NRUNNO);
    formData.append("empno", apv);
    formData.append("id", $("#sysCode").find(":selected").data("id"));
    formData.append("type", $("#sysCode").find(":selected").data("type"));
    formData.append("code", $("#sysCode").find(":selected").data("code"));
    if (firstStep) {
      const res = await getData({
        ...ajaxOptionsLoad,
        url: `${host}isform/IS-CFS/form/update`,
        data: formData,
        processData: false,
        contentType: false,
      });
      if (res.status) {
        showMessage(res.message, "success");
      } else {
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

$(document).on("submit", "#form", async function (e) {
  e.preventDefault();
  //     if(!await requiredForm('#form')) return;
  //     const formData = new FormData(this);
  //     formData.append('empno', empno);

  //     const res = await getData({
  //         ...ajaxOptions,
  //         url: `${host}isform/IS-CFS/form/createForm`,
  //         data: formData,
  //         processData: false,
  //         contentType: false,
  //     });

  //     if(res.status){
  //         showMessage(res.message, 'success');

  //     }else{
  //         showMessage(res.message, 'error');
  //     }
});
