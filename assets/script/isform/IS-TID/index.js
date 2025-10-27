import {
    host,
    showMessage,
    requiredForm,
    removeClassError,
    getData,
    ajaxOptions,
    ajaxOptionsLoad,
    autosizeTextarea,
    addMinutesToTime,
} from "@public/jFuntion";
import { fpkTimeOpt, setDatePicker } from "@public/_flatpickr";
import { mailOpt, sendMail } from "@public/_sendmail";
import { addInput, removeInput } from "@public/addRemoveInput";
import { showLoader } from "@public/preloader";
import "@public/_tooltip";
import { getController, getUserLogin } from "./data";
import { displayEmpImage } from "@public/setIndexDB";
import { searchUser } from "../../api/amec/users";
import { getRequestNo } from "../../api/webform/form";
import {
    createForm2,
    deleteForm,
    redirectWebflow,
} from "@public/_form";

import {
    flagSelect,
    formatUser,
    s2disableSearch,
    s2opt,
    setSelect2,
} from "@public/_select2";

var emp,
    empno,
    ctrl,
    userLogin,
    formType,
    empImage = {};
$(async function () {
    showLoader();
    // emp = await getEmployee({ status: 1 });
    emp = await searchUser({ CSTATUS: 1 });
    empno = $(".apv-data").attr("apv");
    showLoader({ show: false });
    $("#requester").val(empno);
    ctrl = await getController();
    userLogin = await getUserLogin();
    for (const item of ctrl) {
        if (!item.EMPNO || item.EMPNO.trim() == "") continue;
        empImage[item.EMPNO] = await displayEmpImage(item.EMPNO);
    }
    for (const item of userLogin) {
        if (!item.EMPNO || item.EMPNO.trim() == "") continue;
        empImage[item.EMPNO] = await displayEmpImage(item.EMPNO);
    }
    setDatePicker({ dayOff: true, defaultDate: new Date() });
    setDatePicker({
        element: "#pStart",
        ...fpkTimeOpt,
    });
    setDatePicker({
        element: "#pEnd",
        ...fpkTimeOpt,
    });
    await setSelect2({
        element: "#serverName",
        disableSearch: true,
    });
    await setSelect2({
        element: "#userID",
        disableSearch: true,
        templateResult: formatUser,
    });
    await setSelect2({
        element: "#controller",
        disableSearch: true,
        templateResult: formatUser,
    });
    $('input[name="formType"][value="1"]')
        .prop("checked", true)
        .trigger("change");
    $("#form").removeClass("hidden");
    $(".load").addClass("hidden");
    const wk = document.getElementById("workCon");
    const rs = document.getElementById("reason");
    wk.addEventListener("input", () => autosizeTextarea(wk));
    rs.addEventListener("input", () => autosizeTextarea(rs));
});

$(document).on("blur", "#requester", function () {
    const empid = $(this).val();
    const check = emp.find((el) => el.SEMPNO == empid);
    if (!check) {
        $(this).val("");
        showMessage("ไม่พบข้อมูลพนักงาน กรุณากรอกใหม่อีกครั้ง", "warning");
    }
});

$(document).on("keydown", 'input[name="reqNo[]"]', async function (e) {
    if (e.key === "Enter") {
        $(this).trigger("blur");
    }
});

$(document).on("blur", 'input[name="reqNo[]"]', async function () {
    const reqNo = $(this).val().toUpperCase();

    if (RegExp(/^[A-Za-z]+-[a-zA-Z0-9]+-[0-9]{6}$/).test(reqNo)) {
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
    $(this).prop("disabled", true);
    $(this).siblings(".loading").removeClass("hidden");

    const check = await getRequestNo(reqNo);

    $("#submit").find(".loading").addClass("hidden");
    $("#submit").removeClass("btn-disabled");
    $(this).prop("disabled", false);
    $(this).siblings(".loading").addClass("hidden");

    if (check.status == 0) {
        showMessage("ไม่พบเลขที่คำร้องนี้ในระบบ", "warning");
        $(this).val("");
        $(this).addClass("!input-error");
        // $('#serverName').prop('disabled', true);
    } else {
        $(this).removeClass("!input-error");
        $("#serverName").prop("disabled", false);
    }
});

$(document).on("change", "#serverName", async function () {
    const serverName = $(this).val();
    const ctrlopt = optCtrl(serverName);
    const opt = optUserLogin(serverName);

    if (formType == 1) {
        // setUserLogin(ctrlopt);
        setAllUserLogin(serverName);
    } else {
        setUserLogin(opt);
        setCtrl(ctrlopt);
    }
    removeClassError($("#userID"));
    removeClassError($("#controller"));
});

const optUserLogin = (serverName) => {
    return userLogin
        .map((el) => {
            return el.SERVER_NAME.trim() == serverName.trim()
                ? `<option value="${
                      el.USER_LOGIN
                  }" data-html="${el?.USER_OWNER.trim()} (${el?.EMPNO.trim()})" data-img="${
                      empImage[el.EMPNO]
                  }">
                ${el.USER_LOGIN}
        </option>`
                : "";
        })
        .join("");
};

const optCtrl = (serverName) => {
    return ctrl
        .map((el) => {
            return el.SERVER_NAME.trim() == serverName.trim()
                ? `<option value="${
                      el.USER_LOGIN
                  }" data-html="${el?.USER_OWNER.trim()} (${el.EMPNO?.trim()})" data-img="${
                      empImage[el.EMPNO]
                  }">
                ${el.USER_LOGIN}
        </option>`
                : "";
        })
        .join("");
};

function setAllUserLogin(serverName, e = $("#late")) {
    const c = optCtrl(serverName);
    const u = optUserLogin(serverName);
    const merge = c + u;

    if ($("#userID option:selected").length != 0) {
        flagSelect = true;
        $("#userID").val(null).trigger("change");
    }
    if (e.is(":checked")) {
        setUserLogin(merge);
    } else {
        setUserLogin(c);
    }
    removeClassError($("#userID"));
}

function setUserLogin(option) {
    option == ""
        ? $("#userID").prop("disabled", true).val(null).trigger("change")
        : $("#userID")
              .html(`<option value=''></option>${option}`)
              .prop("disabled", false);
}

function setCtrl(option) {
    option == ""
        ? $("#controller").prop("disabled", true).val(null).trigger("change")
        : $("#controller")
              .html(`<option value=''></option>${option}`)
              .prop("disabled", false);
}

$(document).on("click", "#late", function () {
    const serverName = $("#serverName").val();
    setAllUserLogin(serverName);
});

$(document).on("change", 'input[name="formType"]', function () {
    formType = $(this).val();
    if (formType == 1) {
        $(".divCon").addClass("hidden");
        $("#controller").removeClass("req");
        $(".late").removeClass("hidden");
        $(".changeData").addClass("hidden");
    } else {
        $(".divCon").removeClass("hidden");
        $("#controller").addClass("req");
        $(".late").addClass("hidden");
        $(".changeData").removeClass("hidden");
    }
    $("#changeData").prop("checked", false);
    $("#late").prop("checked", false);

    if ($("#serverName option:selected").length != 0) {
        flagSelect = true;
        $("#serverName").val(null).trigger("change");
    }
    if ($("#userID option:selected").length != 0) {
        flagSelect = true;
        $("#userID").val(null).trigger("change");
    }
    if ($("#controller option:selected").length != 0) {
        flagSelect = true;
        $("#controller").val(null).trigger("change");
    }
});

$(document).on("submit", "#form", async function (e) {
    try {
        e.preventDefault();
        const checkReq = $('input[name="reqno[]"]').each(function () {
            const check = $(this).data("check");
            if (check == 0) return false;
        });
        if (!checkReq) return;

        if (!(await requiredForm("#form"))) return;
        const frm = $(this);
        const empno = $("#requester").val().trim();
        const formData = new FormData(frm[0]);
        const changeData = $("#changeData").is(":checked") ? 1 : 0;
        const late = $("#late").is(":checked") ? 1 : 0;
        formData.set("controller", $("#controller").val());
        formData.set("userID", $("#userID").val());
        formData.set("changeData", changeData);
        formData.set("late", late);
        const NFRMNO = $(".form-info").attr("NFRMNO");
        const VORGNO = $(".form-info").attr("VORGNO");
        const CYEAR = $(".form-info").attr("CYEAR");
        var formInfo,
            formCreate = [],
            formCFS;
        for (let round = 1; round <= formType; round++) {
            if (round == 2) {
                const ctrlRequester = (
                    ctrl.find(
                        (el) => el.USER_LOGIN == $("#controller").val()
                    ) || {}
                ).EMPNO;
                formData.set(
                    "ctrlPEnd",
                    addMinutesToTime($("#pEnd").val(), 30)
                );
                formData.set("ctrlUserID", $("#controller").val());
                formData.set("ctrlRequester", ctrlRequester.trim());
                // formData.set('reqNo', formInfo);
                formData.set("ctrlController", "");
                formData.set(
                    "ctrlWorkCon",
                    `Enable and disable for user : ${$("#userID").val()}`
                );
                formInfo = await createForm2(
                    NFRMNO,
                    VORGNO,
                    CYEAR,
                    ctrlRequester.trim(),
                    ctrlRequester.trim(),
                    ""
                );
                formCreate.push(formInfo.message);
                for (const key in formInfo.message) {
                    formData.append(`ctrl${key}`, formInfo.message[key]);
                }
            } else {
                formInfo = await createForm2(
                    NFRMNO,
                    VORGNO,
                    CYEAR,
                    empno,
                    empno,
                    ""
                );
                formCreate.push(formInfo.message);
                for (const key in formInfo.message) {
                    formData.append(key, formInfo.message[key]);
                }
            }
        }

        if (changeData) {
            formCFS = await getData({
                ...ajaxOptionsLoad,
                url: `${host}/isform/IS-CFS/form/createForm`,
                data: formData,
                processData: false,
                contentType: false,
            });
            if (!formCFS.status) {
                throw new Error(formCFS.message);
            }
        }
        for (var pair of formData.entries()) {
            console.log(pair[0] + ": " + pair[1]);
        }
        const res = await getData({
            ...ajaxOptionsLoad,
            url: `${host}/isform/IS-TID/form/createForm`,
            data: formData,
            processData: false,
            contentType: false,
        });
        if (res.status == true) {
            showMessage("สร้างฟอร์มสำเร็จ", "success");
            redirectWebflow();
        } else {
            throw new Error(res.message);
        }
    } catch (e) {
        formCFS.form.create.forEach((el) => {
            const cond = {
                NFRMNO: el.message.formtype,
                VORGNO: el.message.owner,
                CYEAR: el.message.cyear,
                CYEAR2: el.message.cyear2,
                NRUNNO: el.message.runno,
            };
            getData({
                ...ajaxOptions,
                url: `${host}/isform/IS-CFS/form/delete`,
                data: {
                    form: cond,
                },
            });
            deleteForm(
                el.message.formtype,
                el.message.owner,
                el.message.cyear,
                el.message.cyear2,
                el.message.runno
            );
        });
        formCreate.forEach((el) => {
            deleteForm(el.formtype, el.owner, el.cyear, el.cyear2, el.runno);
        });
        showMessage(
            `เกิดข้อผิดพลาด: ${e.message} กรุณาลองใหม่อีกครั้งหรือติดต่อ Admin Tel:2038`
        );
        const mail = { ...mailOpt };
        mail.body = [
            `IS-TID Form Error : Create Form`,
            // mailForm(NFRMNO, VORGNO, CYEAR, CYEAR2, NRUNNO),
            e,
        ];
        sendMail(mail);
    }
});

/**
 * Add used area
 */
$(document).on("click", ".add-input", function () {
    const html = `<div class="relative w-full">
                    <input type="text" class="input txt-upper validator w-full req" name="reqNo[]" id="reqNo[]" data-check="0" placeholder="e.g. IS-DEV25-000127" required pattern="[A-Za-z]+-[a-zA-Z0-9]+-[0-9]{6}$" autocomplete="off"/>
                    <span class="loading loading-spinner text-primary absolute top-1/2 right-16 -translate-y-1/2 hidden"></span>
                    <span class="badge badge-neutral badge-xs absolute top-1/2 right-2 -translate-y-1/2">Enter</span>
                  </div>`;
    addInput($(this), html, ".inputGroup");
});

/**
 * Remove keeping point
 */
$(document).on("click", ".remove-input", function () {
    removeInput($(this), ".inputGroup", ".relative");
});
