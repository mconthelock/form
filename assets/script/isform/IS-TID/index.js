import select2 from "select2";
import {
    state,
    formTypeManager,
    serverNameManager,
    reqNoManager,
    formManager,
    actionForm,
} from "./function";

select2();

$(async function () {
    formManager.init();
});

$(document).on("blur", "#REQBY", async function () {
    const empno = $(this).val();
    state.setEmpRequester(empno);
});

$(document).on("keydown", 'input[name="reqNo"]', async function (e) {
    if (e.key === "Enter") {
        $(this).trigger("blur");
    }
});

$(document).on("blur", 'input[name="reqNo"]', async function () {
    const reqNo = $(this).val().toUpperCase();
    reqNoManager.addReqNo(reqNo);
});

$(document).on("click", ".remove-reqNo", function () {
    const reqNo = $(this).data("reqno");
    reqNoManager.removeReqNo(reqNo);
});

$(document).on("click", "#late", function () {
    const serverName = $("#serverName").val();
    serverNameManager.handleUsrAndContSelect(serverName);
});

$(document).on("change", 'input[name="formType"]', function () {
    formTypeManager.toggle($(this).val());
});

$(document).on("select2:select", "#serverName", function () {
    const serverName = $(this).val();
    serverNameManager.handleUsrAndContSelect(serverName);
});

$(document).on("click", "#btnRequest", function () {
    actionForm.requestForm();
});