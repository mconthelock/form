import { handleFiles } from "@amec/webasset/dragdrop";
import {
    acceptPoManager,
    actionFormManager,
    attachTypeManager,
    formManager,
    inVoiceTypeManager,
    paymentNumManager,
    paymentTypeManager,
    reqByManager,
    currencyManager,
} from "./formManager";
import { downloadOrOpenFile } from "@amec/webasset/api/file";

$(async function () {
    formManager.init();
});

$(document).on("change", "#REQBY", function () {
    reqByManager.setEmpRequester(this.value);
});

// Sync value for currency select2
$(document).on("select2:select", ".currency", function () {
    const value = $(this).val();
    currencyManager.syncValue(value, this);
});

$(document).on("change", 'input[name="files"]', async function (e) {
    handleFiles();
});

// เมื่อเลือก Invoice Type เป็น Other ให้เปิดช่องกรอกข้อมูล
$(document).on("change", 'input[name="INVOICE_TYPE"]', async function () {
    await inVoiceTypeManager.change();
});

// เมื่อเลือก Accept PO เป็น Subcon หรือ Other ให้เปิดช่องกรอกข้อมูล
$(document).on("change", 'input[name="ACCEPT_PO"]', function () {
    acceptPoManager.change();
});

// เมื่อเลือก PAYMENT CONDITIONS & TERMS
$(document).on("change", 'input[name="PAYMENT_TYPE"]', function () {
    paymentTypeManager.change();
});

$(document).on("input", "input[name='PAYMENT_NUM']", function () {
    paymentNumManager.onInput(this.value);
});

$(document).on("change", 'input[name="ATTACH_TYPE"]', function () {
    attachTypeManager.change();
});

$(document).on("click", "#btnRequest", async function () {
    await actionFormManager.requestForm();
});

$(document).on("click", 'button[name="btnAction"]', async function (e) {
    await actionFormManager.action(this.value);
});

$(document).on("click", ".file-link", async function (e) {
    e.preventDefault();
    const filePath = $(this).attr("href");
    const filename = $(this).text();
    const storedName = $(this).attr("storedName");
    const ext = filename.split(".").pop();

    await downloadOrOpenFile({
        baseDir: filePath,
        storedName: storedName,
        originalName: filename,
        mode: ext == "pdf" ? "open" : "download",
    });
});
