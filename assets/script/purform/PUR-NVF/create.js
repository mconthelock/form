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
    countryManager,
    currencyManager,
    attachFileManager,
    vendorTypeManager,
    ReqtypeManager,
    vendorCodeManager,
    provinceManager,
    districtManager,
    subDistrictManager
} from "./formManager";
import { downloadOrOpenFile } from "@amec/webasset/api/file";

$(async function () {
    formManager.init();
});

$(document).on("change", "#REQBY", function () {
    reqByManager.setEmpRequester(this.value);
});




// Sync value for currency select2
// $(document).on("select2:select", ".currency", function () {
//     const value = $(this).val();
//     currencyManager.syncValue(value, this);
// });

$(document).on("change", 'input[name="files"]', async function (e) {
    handleFiles();
});

// เมื่อเลือก Invoice Type เป็น Other ให้เปิดช่องกรอกข้อมูล
// $(document).on("change", 'input[name="INVOICE_TYPE"]', async function () {
//     await inVoiceTypeManager.change();
// });

// เมื่อเลือก Accept PO เป็น Subcon หรือ Other ให้เปิดช่องกรอกข้อมูล
// $(document).on("change", 'input[name="ACCEPT_PO"]', function () {
//     acceptPoManager.change();
// });

$(document).on("change", 'input[name="VENDOR_LOCATION"]', async function () {
    vendorTypeManager.change();
});

// เมื่อเลือก PAYMENT CONDITIONS & TERMS
// $(document).on("change", 'input[name="PAYMENT_TYPE"]', function () {
//     paymentTypeManager.change();
// });




$(document).on("select2:select", ".country",async function (e) {
    countryManager.change(e);
});

$(document).on("select2:select", ".province",async function (e) {
    console.log("province change");
    
    provinceManager.change(e);
    const selectedProvinceId = provinceManager.getValue("PROVINCE_SELECT");
    
    const filteredDistricts = formManager.districtData.filter(
        (d) => d.province_id == selectedProvinceId
    );
    const districtOptions = filteredDistricts.map((d) => ({
        id: d.id,   
        value: d.value,
        text: d.text,
        nameth: d.nameth  
    }));
   
    districtOptions.unshift({
        id: "",
        value: "",
        text: "-- Select District --", // หรือใส่เป็นค่าว่าง "" ก็ได้
        nameth: ""
    });
    
    
    districtManager.select.empty().trigger("change");
    await districtManager.init(districtOptions);
    //const value = $(this).val();
    //currencyManager.syncValue(value, this);
   // countryManager.change(e);
    
});

$(document).on("select2:select", ".district",async function (e) {
    districtManager.change(e);
    const selectedDistrictId = districtManager.getValue("DISTRICT_SELECT");
    const filteredSubDistricts = formManager.subDistrictData.filter(
        (s) => s.district_id == selectedDistrictId
    );
    const subDistrictOptions = filteredSubDistricts.map((s) => ({
        id: s.id,
        value: s.value,
        text: s.text,
        nameth: s.nameth,
        district_id: s.district_id,
        postcode: s.postcode
    }));
   // console.log(subDistrictOptions);
       subDistrictOptions.unshift({
        id: "",
        value: "",
        text: "-- Select Sub-district --", // หรือใส่เป็นค่าว่าง "" ก็ได้
        nameth: "",
        district_id: "",
        postcode: ""
    });
    
    subDistrictManager.select.empty().trigger("change");
    await subDistrictManager.init(subDistrictOptions);

 });

$(document).on("select2:select", ".sub-district",async function (e) {
    subDistrictManager.change(e);
  });

$(document).on("change", 'input[name="REQTYPE"]', function () {
    ReqtypeManager.change();
});

// $(document).on("input", "input[name='PAYMENT_NUM']", function () {
//     paymentNumManager.onInput(this.value);
// });

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
    const filename = $(this).attr("originalName");
    const storedName = $(this).attr("storedName");
    const ext = filename.split(".").pop();

    await downloadOrOpenFile({
        baseDir: filePath,
        storedName: storedName,
        originalName: filename,
        mode: ext == "pdf" ? "open" : "download",
    });
});

$(document).on("click", ".remove-file", async function (e) {
    e.preventDefault();
    e.stopPropagation();
    const id = $(this).attr("file-id");
    const tagA = $(this).closest("a");
    attachFileManager.deleteFile(tagA, id);
});


$(document).on('input', '#VENDORCODE', async function() {
    await vendorCodeManager.change();
});

$(document).on('input', '#TELNO',  function() {
    let val = this.value.replace(/\D/g, ''); // ลบสิ่งที่ไม่ใช่ตัวเลขออกก่อน
    if (val.length > 3 && val.length <= 6) {
        this.value = val.slice(0, 3) + "-" + val.slice(3);
    } else if (val.length > 6) {
        this.value = val.slice(0, 3) + "-" + val.slice(3, 6) + "-" + val.slice(6, 10);
    }
});

$(document).on('input', '#ACCNUMBER',  function() {
    let val = this.value.replace(/\D/g, ''); // ลบสิ่งที่ไม่ใช่ตัวเลขออกก่อน
    if (val.length > 3 && val.length <= 4) {
        this.value = val.slice(0, 3) + "-" + val.slice(3);
    } else if (val.length > 4 && val.length <= 9) {
        this.value = val.slice(0, 3) + "-" + val.slice(3, 4) + "-" + val.slice(4);
    } else if (val.length > 9) {
        this.value = val.slice(0, 3) + "-" + val.slice(3, 4) + "-" + val.slice(4, 9) + "-" + val.slice(9, 10);
    }

    });