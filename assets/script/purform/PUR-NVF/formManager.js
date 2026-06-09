import select2 from "select2";
import { getUser, searchUser } from "@amec/webasset/api/amec";
import { doaction, showflow ,getFormStatus } from "@amec/webasset/api/webform";
import { webflowSubmit , getformDetail } from "@amec/webasset/components/form";
import { redirectWebflow  } from "@amec/webasset/form";

import { showLoader } from "@amec/webasset/preloader";
import { formSubmitSkeleton } from "@amec/webasset/skeleton";
import {
    filterFormData,
    getAllAttr,
    logFormData,
    ordinalIndicator,
    removeClassError,
    requiredForm,
    setRound,
    showErrorMessage,
    showMessage,
} from "@amec/webasset/utils";
import { approveReturn, create, getData , getTermcode , getCountries, getProvinces ,getDistricts , getSubDistricts , getVendor } from "./data";
import { dragDropInit } from "@amec/webasset/dragdrop";
import { setDatefpk, setDatePicker } from "@amec/webasset/flatpickr";
import { setSelect2 } from "@amec/webasset/select2";
import { selectAttachType , clearaddr } from "./function";
import { formatDate } from "@amec/webasset/dayjs";
import { classIcofont } from "@amec/webasset/fileExplorer";
import Swal from "sweetalert2";
import { get } from "jquery";
select2();

const state = {
    _formInfo: null,
    _users: null,
    _deleteFiles: [],
    // Setter
    set FormInfo(data) {
        this._formInfo = data;
    },
    set users(data) {
        this._users = data;
    },
    set deleteFiles(id) {
        this._deleteFiles.push(id);
    },
    // Getter
    get FormInfo() {
        return this._formInfo;
    },
    get users() {
        return this._users;
    },
    get deleteFiles() {
        return this._deleteFiles;
    },
    get data() {
        return {
            NFRMNO: this.FormInfo?.NFRMNO,
            VORGNO: this.FormInfo?.VORGNO,
            CYEAR: this.FormInfo?.CYEAR,
            CYEAR2: this.FormInfo?.CYEAR2,
            NRUNNO: this.FormInfo?.NRUNNO,
            EMPNO: this.FormInfo?.EMPNO,
            REQBY: reqByManager.value,
            INPUTBY: inputByManager.value,
        };
    },
};

const inputByManager = {
    get input() {
        return $("#INPUTBY");
    },
    get value() {
        return this.input.val();
    },
    set value(val) {
        this.input.val(val);
    },
};

export const reqByManager = {
    get input() {
        return $("#REQBY");
    },
    get value() {
        return this.input.val();
    },
    set value(val) {
        this.input.val(val);
    },
    async setEmpRequester(empno) {
        const checked = await getUser(empno);
        if (!checked) {
            this.value = "";
            inVoiceTypeManager.unchecked("service");
            showMessage(
                "Employee not found. Please enter the information again. (ไม่พบข้อมูลพนักงาน กรุณากรอกใหม่อีกครั้ง)",
                "warning",
            );
            return;
        }
        this.value = empno;
    },
};

export const typejobManager = {
    get input() {
        return $("#TYPEJOB");
    },
    set text(val) {
        this.input.text(val || "");
    },
    get value() {
        return this.input.val();
    },
    set value(val) {
        this.input.val(val);
    },
    addcls(cls) {
        this.input.addClass(cls);
    },
    // เพิ่มฟังก์ชันลบ class 'req'
    removecls(cls) {
        this.input.removeClass(cls);
    }
};

export const serviceManager = {
    get input() {
        return $("#SERVICE");
    },
    set text(val) {
        this.input.text(val || "");
    },
    get value() {
        return this.input.val();
    },
    set value(val) {
        this.input.val(val);
    },
    addcls(cls) {
        this.input.addClass(cls);
    },
    // เพิ่มฟังก์ชันลบ class 'req'
    removecls(cls) {
        this.input.removeClass(cls);
    }
};

export const purposeManager = {
    get input() {
        return $("#PURPOSE");
    },
    set text(val) {
        this.input.text(val || "");
    },
    get value() {
        return this.input.val();
    },
    set value(val) {
        this.input.val(val);
    },
    addcls(cls) {
        this.input.addClass(cls);
    },
    // เพิ่มฟังก์ชันลบ class 'req'
    removecls(cls) {
        this.input.removeClass(cls);
    }
};

export const reasonManager = {
    get input() {
        return $("#REASON");
    },
    set text(val) {
        this.input.text(val || "");
    },
    get value() {
        return this.input.val();
    },
    set value(val) {
        this.input.val(val);
    },
    addcls(cls) {
        this.input.addClass(cls);
    },
    // เพิ่มฟังก์ชันลบ class 'req'
    removecls(cls) {
        this.input.removeClass(cls);
    }
};









export const comnameManager = {
    get input() {
        return $("#COMPANY_NAME");
    },
    set text(val) {
        this.input.text(val || "");
    },
    get value() {
        return this.input.val();
    },
    set value(val) {
        this.input.val(val);
    },
};

// -------------------------- Vendor Type Manager ------------------------------

export const vendorTypeManager = {
    get radio() {
        return $('input[name="VENDOR_LOCATION_SHOW"]');
    },
    get type() {
        let type = null;
        this.radio.each(function () {
            if ($(this).is(":checked")) {
                type = $(this).attr("v-type");
            }
        });
        return type;
    },
    set text(val) {
        $("#VENDOR_LOCATION_SHOW").text(val);
    },
    set value(val) {
        this.radio.each(function () {
            if ($(this).val() == val) {
                $(this).prop("checked", true);
                $("#VENDOR_LOCATION").val(val);
            }
        });
        this.change();
    },
    change() {
       // paymentNumManager.value = "";
       // paymentManager.disabled(false);
        attachTypeManager.hide("other");
        attachTypeManager.reset("other");
        const type = this.type;
        const reqtype = ReqtypeManager.type;
        selectAttachType(reqtype,type);
        clearaddr();
        if (type == "Local") {
            $(".field-local").removeClass("hidden").addClass("req");
            $(".field-oversea").addClass("hidden").removeClass("req");
            $(".field-oversea").val("");
            countryEnManager.value = "Thailand";
            countryThManager.value = "ไทย";
            countryManager.disabled(true);
        }else
        {
            $(".field-oversea").removeClass("hidden").addClass("req");
            $(".field-local").addClass("hidden").removeClass("req");
            $(".field-local").val("");
            countryEnManager.value = "";
            countryThManager.value = "";
            countryManager.disabled(false);
        }
        
        
    },
};

// -------------------------- End Vendor Type Manager -------------------

export const addrEnManager = {
    get input() {
        return $("#ADDRESS_EN");
    },
    get value() {
        return this.input.val();
    },
    set value(val) {
        this.input.val(val);
    },
};

export const provinceEnManager = {
    get input() {       
        return $("#PROVINCE_EN");
    },
    get value() {
        return this.input.val();
    },
    set value(val) {
        this.input.val(val);
    },
    

};

export const districtEnManager = {
    get input() {       
        return $("#DISTRICT_EN");
    },
    get value() {
        return this.input.val();
    },
    set value(val) {
        this.input.val(val);
    },
    

};

export const subDistrictEnManager = {
    get input() {       
        return $("#SUB_DISTRICT_EN");
    },
    get value() {
        return this.input.val();
    },
    set value(val) {
        this.input.val(val);
    },
    

};

export const postcodeEnManager = {
    get input() {       
        return $("#POSTCODE_EN");
    },
    get value() {
        return this.input.val();
    },
    set value(val) {
        this.input.val(val);
    },
    

};

export const countryEnManager = {
    get input() {
        return $("#COUNTRY_EN");
    },
    get value() {
        return this.input.val();
    },
    set value(val) {
        this.input.val(val);
    },
};

export const addrThManager = {
    get input() {
        return $("#ADDRESS_TH");
    },
    get value() {
        return this.input.val();
    },
    set value(val) {
        this.input.val(val);
    },
};

export const provinceThManager = {
    get input() {       
        return $("#PROVINCE_TH");
    },
    get value() {
        return this.input.val();
    },
    set value(val) {
        this.input.val(val);
    },
    

};

export const districtThManager = {
    get input() {       
        return $("#DISTRICT_TH");
    },
    get value() {
        return this.input.val();
    },
    set value(val) {
        this.input.val(val);
    },
    

};

export const subDistrictThManager = {
    get input() {       
        return $("#SUB_DISTRICT_TH");
    },
    get value() {
        return this.input.val();
    },
    set value(val) {
        this.input.val(val);
    },
    

};

export const postcodeThManager = {
    get input() {       
        return $("#POSTCODE_TH");
    },
    get value() {
        return this.input.val();
    },
    set value(val) {
        this.input.val(val);
    },
    

};

export const countryThManager = {
    get input() {
        return $("#COUNTRY_TH");
    },
    get value() {
        return this.input.val();
    },
    set value(val) {
        this.input.val(val);
    },
};

export const vendorCodeManager = {
    get input() {       
        return $("#VENDORCODE");
    },
    get value() {
        return this.input.val();
    },
    set value(val) {
        this.input.val(val);
    },
    async change() {
        const keywordValue = this.value.trim();
        // 1. เช็กความยาวรหัสคู่ค้า (ตามเงื่อนไขเดิมของคุณคือ 5 หลัก)
        if (keywordValue.length === 5) {
            try {
                showLoader(); // เปิด Loader รอระว่างดึงข้อมูล
                
                const searchData = { KEYWORD: keywordValue };
                const vendor = await getVendor(searchData);
                
                console.log("Vendor Data:", vendor);

                if (vendor[0]) {
                    typejobManager.removecls("req");
                   // สมมติว่าได้ Object ข้อมูลคู่ค้ากลับมา
                    comnameManager.value = vendor[0].VND_NAME || ""; 
                    $(`#V-section`).removeClass("hidden");
                    $(`#F-section`).removeClass("hidden");
                    console.log(">>>>>>>>>>"+vendor[0]);
                    
                    $("#CONTACT").val(vendor[0].VND_SALE || "");
                    $("#EMAIL").val(vendor[0].EMAIL || "");
                    $("#WEBSITE").val(vendor[0].ADDR_WEB || "");
                    $("#TELNO").val(vendor[0].ADDR_PHONE || "");
                    $("#FAXNO").val(vendor[0].FAX || "");
                    $("#BANKNAME").val(vendor[0].BANKNAME || "");
                    $("#BRANCH").val(vendor[0].BRANCH || "");
                    $("#ACCNUMBER").val(vendor[0].ACCNUMBER || "");
                    paymentTermManager.value = vendor[0].VENDOR_CODES[0].CODE_PAY;
                    if(vendor[0].VENDOR_ADDRESS)
                    {
                        vendor[0].VENDOR_ADDRESS.forEach(function (address) {
                            // 1. รวมสายอักขระที่อยู่ (Address Line 1 + Line 2) เข้าด้วยกัน
                            const addrLine = `${address.ADDR_LINE1 || ""} ${address.ADDR_LINE2 || ""}`.trim();
                            const province = address.ADDR_STATE || "";       // จังหวัด
                            const district = address.ADDR_CITY || "";      // อำเภอ (เช็กฟิลด์หลังบ้านอีกทีว่าสลับกันไหม)
                            const subDistrict = address.ADDR_SUB_CITY || "";   // ตำบล
                            const postcode = address.ADDR_ZIPCODE || "";    // รหัสไปรษณีย์
                            const country = address.ADDR_COUNTRY || "";     // ประเทศ

                            // 2. แยกจัดการตามประเภทที่อยู่ ADDR_TYPE ('T' = ภาษาไทย, 'E' = ภาษาอังกฤษ)
                            if (address.ADDR_TYPE === "T") {
                                addrThManager.value = addrLine;
                                if(address.ADDR_COUNTRY && address.ADDR_COUNTRY == "ไทย")
                                {
                                    vendorTypeManager.value = 'Local';

                                }else{
                                    vendorTypeManager.value = 'Oversea';
                                }
                               
                                provinceThManager.value = province;
                                districtThManager.value = district;
                                subDistrictThManager.value = subDistrict;
                                postcodeThManager.value = postcode;
                                countryThManager.value = country;
                                
                            } else if (address.ADDR_TYPE === "E") {
                                // แปะลงฟิลด์ภาษาอังกฤษ
                                addrEnManager.value = addrLine;
                                if(address.ADDR_COUNTRY && address.ADDR_COUNTRY.toUpperCase() == "THAILAND")
                                {
                                    vendorTypeManager.value = 'Local';
                                    provinceManager.textToValue = province;
                                    districtManager.textToValue = district;
                                    subDistrictManager.textToValue = subDistrict;
                                }else{
                                    vendorTypeManager.value = 'Oversea';
                                    provinceEnManager.value = province;
                                    districtEnManager.value = district;
                                    subDistrictEnManager.value = subDistrict;
                                }
                                postcodeEnManager.value = postcode;
                                countryEnManager.value = country;
                         
                            }
                        });

                    }

                } else {
                    showMessage("Vendor not found.ไม่พบข้อมูลคู่ค้าสำหรับรหัสนี้","warning",);
                   // this.resetForm(); 
                }

            } catch (err) {
                console.error("Error in vendorCodeManager.change:", err);
                showErrorMessage("เกิดข้อผิดพลาดในการดึงข้อมูลคู่ค้า");
            } finally {
                showLoader({ show: false }); // ปิด Loader
            }
        }    
    },
    

};

export const formManager = {
    provinceData: null,
    districtData: null,
    subDistrictData: null,
    get form() {
        return $("#form");
    },
    get formDetail() {
        return $("#form-detail");
    },
    set formDetail(html) {
        this.formDetail.html(html);
    },
    async init() {
        try {
            showLoader();
            const formInfo = await getAllAttr(".form-info");
            state.FormInfo = {
                NFRMNO: formInfo.nfrmno,
                VORGNO: formInfo.vorgno,
                CYEAR: formInfo.cyear,
                CYEAR2: formInfo.cyear2 ?? null,
                NRUNNO: formInfo.nrunno ?? null,
                MODE: Number(formInfo.mode) ?? null,
                EMPNO: $(".apv-data").attr("empno"),
                RETURN: formInfo.return ?? null,
            };
            state.users = await searchUser({ CSTATUS: "1" });
            await this.setForm(state.FormInfo.MODE);
        } catch (err) {
            console.error(err);
            showErrorMessage(err);
        } finally {
            showLoader({ show: false });
        }
    },
    async setForm(mode) {
        actionFormManager.loading(mode);
        switch (mode) {
            case 1: // create
                attachFileManager.init();
                // setDatePicker();
            //    const curr = await getCurrency();
            //     const currData = curr.map((c) => ({
            //         value: c.CCURNAME,
            //         text: c.CCURNAME,
            //     }));
                const term = await getTermcode();
                const termdata = term.map((t) => ({
                    value: t.TERMCODE,
                    text: t.TERMNAME,
                }));
                const countries = await getCountries();
                const countriesData = countries.map((c) => ({
                    id: c.nameen,
                    value: c.nameen,
                    text:  c.nameen,
                    nameth: c.nameth
                }));
                //console.log(countriesData);
                
                const province = await getProvinces();
                this.provinceData = province.map((p) => ({
                    id: p.id,
                    value: p.nameen,
                    text: p.nameen,
                    nameth: p.nameth
                }));
                const district = await getDistricts();
              
                this.districtData = district.map((d) => ({
                    id: d.id,
                    value: d.nameen,
                    text: d.nameen,
                    nameth: d.nameth,
                    province_id: d.province_id   
                }));
                  
                const subDistrict = await getSubDistricts();
                this.subDistrictData = subDistrict.map((s) => ({
                    id: s.id,
                    value: s.nameen,
                    text: s.nameen,
                    nameth: s.nameth,
                    district_id: s.district_id,
                    postcode: s.postcode
                }));
                console.log( this.subDistrictData );
                
                paymentTermManager.init(termdata);
                countryManager.init(countriesData);
                provinceManager.init(this.provinceData);
                districtManager.init(this.districtData);
                // currencyManager.init(currData);
                subDistrictManager.init(this.subDistrictData);
                actionFormManager.init(mode);
                break;
            case 2: // edit
            case 3: // view
                const form = {
                    NFRMNO: state.FormInfo.NFRMNO,
                    VORGNO: state.FormInfo.VORGNO,
                    CYEAR: state.FormInfo.CYEAR,
                    CYEAR2: state.FormInfo.CYEAR2,
                    NRUNNO: state.FormInfo.NRUNNO,
                };
                const flow = await showflow(form);
                const data = await getData(form);
               // this.formDetail = await setformDetail(form);
                this.formDetail = await getformDetail(form);
                actionFormManager.init(mode, flow.html);
                attachFileManager.init(data.FILES || []);
                if (state.FormInfo.RETURN) {
                    console.log("inter return");
                    //$("#section-0").addClass("hidden!");
                        const term = await getTermcode();
                        const termdata = term.map((t) => ({
                            value: t.TERMCODE,
                            text: t.TERMNAME,
                        }));
                        const countries = await getCountries();
                        const countriesData = countries.map((c) => ({
                            id: c.id,
                            value: c.nameen,
                            text:  c.nameen,
                            nameth: c.nameth
                        }));
                        const province = await getProvinces();
                        this.provinceData = province.map((p) => ({
                            id: p.id,
                            value: p.nameen,
                            text: p.nameen,
                            nameth: p.nameth
                        }));
                        const district = await getDistricts();
                        this.districtData = district.map((d) => ({
                            id: d.id,
                            value: d.nameen,
                            text: d.nameen,
                            nameth: d.nameth,
                            province_id: d.province_id   
                        }));
                        const subDistrict = await getSubDistricts();
                        this.subDistrictData = subDistrict.map((s) => ({
                            id: s.id,
                            value: s.nameen,
                            text: s.nameen,
                            nameth: s.nameth,
                            district_id: s.district_id,
                            postcode: s.postcode
                        }));
                        paymentTermManager.init(termdata);
                        countryManager.init(countriesData);
                        provinceManager.init(this.provinceData);
                        districtManager.init(this.districtData);
                        // currencyManager.init(currData);
                        subDistrictManager.init(this.subDistrictData);
                    this.setReturn(data);
                } else {
                    //console.log(data);
                    this.setView(data);
                }
                break;
            default:
                throw new Error("Invalid form mode");
        }
    },
    setView(data) {
        //Request Type
        ReqtypeManager.value = data.REQTYPE;
        //Type of Job  
        if(data.REQTYPE == "A")
        {
            $('#row-typejob, #row-service, #row-purpose').removeClass('hidden');
            $('#row-reason').addClass('hidden'); 
        }else if(data.REQTYPE == "U")
        {
            $('#row-typejob, #row-service, #row-purpose, #row-reason').addClass('hidden');
        }else if(data.REQTYPE == "D")
        {
            $('#row-typejob, #row-service, #row-purpose').addClass('hidden');
            $('#row-reason').removeClass('hidden');   
        }
        typejobManager.text = data.LISTS[0].TYPEJOB || "-";
        serviceManager.text = data.LISTS[0].SERVICE || "-";
        purposeManager.text = data.LISTS[0].PURPOSE || "-";
        reasonManager.text = data.LISTS[0].REASON || "-";


       // comnameManager.text =  data.LISTS[0].COMNAME || "-";
        comnameManager.text = (data.LISTS[0].VENDCODE ? "("+data.LISTS[0].VENDCODE+")" + " " : "") + (data.LISTS[0].COMNAME || "-");
        vendorTypeManager.text = data.LISTS[0].VENDTYPE || "-";

        $("#CONTACT").text(data.LISTS[0].CONTACT || "-");
        $("#EMAIL").text(data.LISTS[0].EMAIL || "-");
        $("#WEBSITE").text(data.LISTS[0].WEBSITE || "-");
        $("#PHONE_FAX").text(data.LISTS[0].TELNO ? `${data.LISTS[0].TELNO}${data.LISTS[0].FAXNO ? " / " + data.LISTS[0].FAXNO : ""}` : "-");
        $("#ADDRESS_EN").parent().addClass("hidden");
        $("#ADDRESS_TH").parent().addClass("hidden");

        data.ADDRESSES.forEach(function(address) {
            const fullAddress = `${address.ADDR} ${address.SUBDISTRICT} ${address.DISTRICT} ${address.PROVINCE} ${address.POSTCODE} ${address.COUNTRY}`;

            if (address.ADDRTYPE === "E") {
                $("#ADDRESS_EN").text(fullAddress);
                $("#ADDRESS_EN").parent().removeClass("hidden"); // แสดงกล่องอังกฤษเมื่อมีข้อมูล
            } 
            else if (address.ADDRTYPE === "T") {
                $("#ADDRESS_TH").text(fullAddress);
                $("#ADDRESS_TH").parent().removeClass("hidden"); // แสดงกล่องไทยเมื่อมีข้อมูล
            }
        });


        $("#BANKNAME").text(data.LISTS[0].BANKNAME || "-");
        $("#BRANCH").text(data.LISTS[0].BRANCH || "-");
        $("#ACCNUMBER").text(data.LISTS[0].ACCNUMBER || "-");
        $("#PAYMENT_TERM").text(data.LISTS[0].TERM.STERMDESC || "-");
        if(data.ATTACH_TYPE)
        {
            selectAttachType(data.REQTYPE,data.LISTS[0].VENDTYPE);
            // Attach Type
            attachTypeManager.show(["other"]);
            attachTypeManager.checkbox.each(function () {  
                const value = $(this).val();   
                const type = $(this).attr("a-type");
                if (data.ATTACH_TYPE.includes(value)) {
                    console.log("-------------"+value);
                    $(this).prop("checked", true);
                    if (type == "other") {
                        // Attach Other
                        attachOtherManager.text = data.ATTACH_OTHER || "-";
                    }
                }
            });
            
        }

        // // Attached Files
        // attachFileManager.showFiles(data.FILES);
    },
    setReturn(data) {
        // Requester
      
        if(data.REQTYPE == "U" || data.REQTYPE == "D")
        {
            vendorCodeManager.value = data.LISTS[0].VENDCODE;       
            
        }
        reqByManager.value = state.FormInfo.EMPNO;
        reqByManager.input.prop("readonly", true);
        //Request Type
        ReqtypeManager.value = data.REQTYPE;
        ReqtypeManager.disabled(true);
        //Type of Job
        typejobManager.value = data.LISTS[0].TYPEJOB;
        //Service 
        serviceManager.value = data.LISTS[0].SERVICE;
        //Purpose
        purposeManager.value = data.LISTS[0].PURPOSE;
        //Reason
        reasonManager.value = data.LISTS[0].REASON;

        //Company Name
        comnameManager.value = data.LISTS[0].COMNAME;
        //Vendor Type
        vendorTypeManager.value = data.LISTS[0].VENDTYPE;
        if (data.ADDRESSES && data.ADDRESSES.length > 0 && data.LISTS[0].VENDTYPE === "Oversea") {
            countryManager.value = data.ADDRESSES[0].COUNTRY;
        }
        for (const address of data.ADDRESSES) { 
            if (address.ADDRTYPE === "E") {
                if(data.LISTS[0].VENDTYPE === "Local")
                {
                    addrEnManager.value = address.ADDR || "";
                    //provinceManager.value = address.PROVINCE;
                    provinceManager.textToValue = address.PROVINCE;
                    districtManager.textToValue = address.DISTRICT;
                    subDistrictManager.textToValue = address.SUBDISTRICT;
                }else
                {
                    addrEnManager.value = address.ADDR || "";
                    provinceEnManager.value = address.PROVINCE;
                    districtEnManager.value = address.DISTRICT;
                    subDistrictEnManager.value = address.SUBDISTRICT;
                }
                postcodeEnManager.value = address.POSTCODE;
                countryEnManager.value = address.COUNTRY;
            }else{
                addrThManager.value = address.ADDR || "";
                provinceThManager.value = address.PROVINCE;
                districtThManager.value = address.DISTRICT;
                subDistrictThManager.value = address.SUBDISTRICT;
                postcodeThManager.value = address.POSTCODE;
                countryThManager.value = address.COUNTRY;
            }
        }
        $("#CONTACT").val(data.LISTS[0].CONTACT || "");
        $("#EMAIL").val(data.LISTS[0].EMAIL || "");
        $("#WEBSITE").val(data.LISTS[0].WEBSITE || "");
        $("#TELNO").val(data.LISTS[0].TELNO || "");
        $("#FAXNO").val(data.LISTS[0].FAXNO || "");
        $("#BANKNAME").val(data.LISTS[0].BANKNAME || "");
        $("#BRANCH").val(data.LISTS[0].BRANCH || "");
        $("#ACCNUMBER").val(data.LISTS[0].ACCNUMBER || "");
        
        paymentTermManager.value = data.LISTS[0].TERMCODE;
        if(data.ATTACH_TYPE)
        {
            // Attach Type
            attachTypeManager.checked = data.ATTACH_TYPE.split("|");
            // Attach Other
            attachOtherManager.value = data.ATTACH_OTHER || "";
        }
        if(data.REQTYPE == "U" || data.REQTYPE == "D" ) {
        $("[id='V-section']").removeClass("hidden");
        $("[id='F-section']").removeClass("hidden");
   
    }
    },
};




export const paymentTermManager = {
    list: ["TERM_PAYMENT"],
    get select() {
        return $(".termcode");
    },
    set text(val) {
        $(".termcode").text(val);
    },
    set value(val) {
        this.list.forEach((id) => {
            $(`#${id}`).val(val).trigger("change");
            $(`#${id}_HIDDEN`).val(val);
        });
    },
    getValue(id) {
        return $(`#${id}`).val();
    },
    /**
     * Initialize select2 for currency fields
     * @param {{value: string, text: string}[]} data
     */
    async init(data) {
        for (const id of this.list) {
            await setSelect2({
                id: id,
                data: data,
                size: "sm",
                placeholder: "Select Payment Term",
                search: false,
                clear: false,
                width: "60%",
                emptyValue: false,
            });
            $(`#${id}`).on("change", function() {
                $(`#${id}_HIDDEN`).val($(this).val());
            });
        }
    },
    /**
     * Sync value to other select2 element
     * @param {string} value
     * @param {HTMLElement} element
     */
    syncValue(value, element) {
        for (const id of this.list) {
            if (!$("#" + id).is(element)) {
                $("#" + id)
                    .val(value.toUpperCase())
                    .trigger("change");
                $(`#${id}_HIDDEN`).val(value.toUpperCase());
            }
        }
    },
};

export const countryManager = {
    list: ["COUNTRY_SELECT"],
    get select() {
        return $(".country");
    },
    set text(val) {
        $(".country").text(val);
    },
    set value(val) {
       
        this.list.forEach((id) => {
            $(`#${id}`).val(val).trigger("change");
        });
    },
    getValue(id) {
        return $(`#${id}`).val();
    },
    /**
     * Initialize select2 for currency fields
     * @param {{value: string, text: string}[]} data
     */
    async init(data) {
        
        for (const id of this.list) {
            await setSelect2({
                id: id,
                data: data,
                size: "sm",
                placeholder: "Select Country",
                search: true,
                clear: false,
                width: "100%",
                emptyValue: false,
            });
        }
    },
    /**
     * Sync value to other select2 element
     * @param {string} value
     * @param {HTMLElement} element
     */
    syncValue(value, element) {
        for (const id of this.list) {
            if (!$("#" + id).is(element)) {
                $("#" + id)
                    .val(value.toUpperCase())
                    .trigger("change");
            }
        }
    },
async change(e) {
    // 💡 แก้ไขตรงนี้: ใช้คอมมา (,) ห้ามใช้เครื่องหมายบวก (+) เด็ดขาด
    //console.log("Data ทั้งก้อนจาก Select2:", e.params.data);

    if (e && e.params && e.params.data) {
        const selectedCountry = e.params.data;
        countryEnManager.value = selectedCountry.text || "";
        countryThManager.value = selectedCountry.nameth || "";
        
    }
},
disabled(status) {
        this.list.forEach((id) => {
            $(`#${id}`).prop("disabled", status).trigger("change");
           
        });
        if (status) {
            this.value = "";
            
        } else {
           
        }
    }
};


export const provinceManager = {
    list: ["PROVINCE_SELECT"],
    get select() {
        return $(".province");
    },
    set text(val) {
        $(".province").text(val);
    },
    set value(val) {
        this.list.forEach((id) => {
            $(`#${id}`).val(val).trigger("change");
        });
    },
    set textToValue(textName) {
        if (!textName) return;

        const self = this;
        const targetText = textName.toString().trim().toLowerCase();

        self.list.forEach((id) => {
            const $select = $(`#${id}`);
            if ($select.length === 0) return;

            // 1. ค้นหาหาเลข id จาก option บนหน้าจอ
            let targetId = null;
            $select.find('option').each(function() {
                if ($(this).text().trim().toLowerCase() === targetText) {
                    targetId = $(this).val();
                    return false; // เจอแล้วหยุด loop
                }
            });

            if (targetId) {
                $select.val(targetId).trigger('change.select2');
                const select2Options = $select.data('select2').options.options.data;
                const matchedSelect2Data = select2Options.find(item => item.id == targetId);

                if (matchedSelect2Data) {
                    self.change({
                        params: {
                            data: matchedSelect2Data
                        }
                    });
                }
            } else {
                console.warn(`ไม่พบจังหวัดที่ชื่อ: "${textName}" ในดรอปดาวน์`);
            }
        });
    },
    getValue(id) {
        return $(`#${id}`).val();
    },
    /**
     * Initialize select2 for currency fields
     * @param {{value: string, text: string}[]} data
     */
    async init(data) {
        for (const id of this.list) {
            await setSelect2({
                id: id,
                data: data,
                size: "sm",
                placeholder: "Select Province",
                search: true ,
                clear: false,
                width: "60%",
                emptyValue: false,
            });
      
        }
    },
    /**
     * Sync value to other select2 element
     * @param {string} value
     * @param {HTMLElement} element
     */
    syncValue(value, element) {
        for (const id of this.list) {
            if (!$("#" + id).is(element)) {
                $("#" + id)
                    .val(value.toUpperCase())
                    .trigger("change");
            }
        }
    },
    async change(e) {
    if (e && e.params && e.params.data) {
    
        const selectedProvince = e.params.data;
        provinceThManager.value = selectedProvince.nameth || "";
        provinceEnManager.value = selectedProvince.text || "";
       
    }
}
};

export const districtManager = {
    list: ["DISTRICT_SELECT"],
    get select() {
        return $(".district");
    },
    set text(val) {
        $(".district").text(val);
    },
    set value(val) {
        this.list.forEach((id) => {
            $(`#${id}`).val(val).trigger("change");
        });
    },
    set textToValue(textName) {
        if (!textName) return;

        const self = this;
        const targetText = textName.toString().trim().toLowerCase();

        self.list.forEach((id) => {
            const $select = $(`#${id}`);
            if ($select.length === 0) return;

            // 1. ค้นหาหาเลข id จาก option บนหน้าจอ
            let targetId = null;
            $select.find('option').each(function() {
                if ($(this).text().trim().toLowerCase() === targetText) {
                    targetId = $(this).val();
                    return false; // เจอแล้วหยุด loop
                }
            });

            
            if (targetId) {
               
                $select.val(targetId).trigger('change.select2');

                const select2Options = $select.data('select2').options.options.data;
                const matchedSelect2Data = select2Options.find(item => item.id == targetId);

                if (matchedSelect2Data) {
                    self.change({
                        params: {
                            data: matchedSelect2Data
                        }
                    });
                }
            } else {
                console.warn(`ไม่พบจังหวัดที่ชื่อ: "${textName}" ในดรอปดาวน์`);
            }
        });
    },
    getValue(id) {
        return $(`#${id}`).val();
    },
    /**
     * Initialize select2 for currency fields
     * @param {{value: string, text: string}[]} data
     */
    async init(data) {
        for (const id of this.list) {
            await setSelect2({
                id: id,
                data: data,
                size: "sm",
                placeholder: "Select District",
                search: true ,
                clear: false,
                width: "60%",
                emptyValue: false,
            });
        }
    },
    /**
     * Sync value to other select2 element
     * @param {string} value
     * @param {HTMLElement} element
     */
    syncValue(value, element) {
        for (const id of this.list) {
            if (!$("#" + id).is(element)) {
                $("#" + id)
                    .val(value.toUpperCase())
                    .trigger("change");
            }
        }
    },
    async change(e) {
    if (e && e.params && e.params.data) {
        const selectedDistrict = e.params.data;
        districtThManager.value = selectedDistrict.nameth || "";
        districtEnManager.value = selectedDistrict.text || "";
    }
    }
};

export const subDistrictManager = {
    list: ["SUB_DISTRICT_SELECT"],
    get select() {
        return $(".sub-district");
    },
    set text(val) {
        $(".district").text(val);
    },
    set value(val) {
        this.list.forEach((id) => {
            $(`#${id}`).val(val).trigger("change");
        });
    },
  set textToValue(textName) {
        if (!textName) return;

        const self = this;
        const targetText = textName.toString().trim().toLowerCase();

        self.list.forEach((id) => {
            const $select = $(`#${id}`);
            if ($select.length === 0) return;

            // 1. ค้นหาหาเลข id จาก option บนหน้าจอ
            let targetId = null;
            $select.find('option').each(function() {
                if ($(this).text().trim().toLowerCase() === targetText) {
                    targetId = $(this).val();
                    return false; // เจอแล้วหยุด loop
                }
            });

            if (targetId) {
                $select.val(targetId).trigger('change.select2');
                const select2Options = $select.data('select2').options.options.data;
                const matchedSelect2Data = select2Options.find(item => item.id == targetId);

                if (matchedSelect2Data) {
                    self.change({
                        params: {
                            data: matchedSelect2Data
                        }
                    });
                }
            } else {
                console.warn(`ไม่พบตำบลที่ชื่อ: "${textName}" ในดรอปดาวน์`);
            }
        });
    }
    ,
    getValue(id) {
        return $(`#${id}`).val();
    },
    /**
     * Initialize select2 for currency fields
     * @param {{value: string, text: string}[]} data
     */
    async init(data) {
        for (const id of this.list) {
            await setSelect2({
                id: id,
                data: data,
                size: "sm",
                placeholder: "Select Sub-district",
                search: true ,
                clear: false,
                width: "60%",
                emptyValue: false,
            });
        }
    },
    /**
     * Sync value to other select2 element
     * @param {string} value
     * @param {HTMLElement} element
     */
    syncValue(value, element) {
        for (const id of this.list) {
            if (!$("#" + id).is(element)) {
                $("#" + id)
                    .val(value.toUpperCase())
                    .trigger("change");
            }
        }
    },
    async change(e) {
        console.log("ccccccccccccccccchange");
        
    if (e && e.params && e.params.data) {
        const selectedSubDistrict = e.params.data;
        subDistrictThManager.value = selectedSubDistrict.nameth || "";
        subDistrictEnManager.value = selectedSubDistrict.text || "";
        postcodeEnManager.value = selectedSubDistrict.postcode || "";
        postcodeThManager.value = selectedSubDistrict.postcode || "";
    }
    }
};

// -------------------------- Req Type Manager ------------------------------


export const ReqtypeManager = {
    get radio() {
        return $('input[name="REQTYPE_SHOW"]');
    },
    get type() {
        let type = null;
        this.radio.each(function () {
            if ($(this).is(":checked")) {
                type = $(this).attr("r-type");
            }
        });
        return type;
    },
    set value(val) {
        this.radio.each(function () {
            if ($(this).val() == val) {
                $(this).prop("checked", true);
            }
        });
        this.change();
    },
    disabled(isDisabled) {
        this.radio.prop("disabled", isDisabled);
    },
    change() {
        const type = this.type;
        $(`#REQTYPE`).val(type);
        $("#A-section, #U-section, #D-section , #V-section ,#F-section").addClass("hidden");
        $(`#${type}-section`).removeClass("hidden");
        var vSection = $('#V-section');
        var fSection = $('#F-section');
        if(type == "A"){
            $(`#V-section`).removeClass("hidden");
            $(`#F-section`).removeClass("hidden");
            typejobManager.addcls("req");
            serviceManager.addcls("req");
            purposeManager.addcls("req");
            
        }else
        {
            typejobManager.removecls("req");
            serviceManager.removecls("req");
            purposeManager.removecls("req");
            
        }
        if(type=="D")
        {
            $(`#U-section`).removeClass("hidden");
            reasonManager.addcls("req");
            vSection.find('input, textarea, select').removeClass('req');
            vSection.find('input, textarea').prop('readonly', true).addClass('bg-gray-100');
            vSection.find('select, input[type="radio"]').prop('disabled', true);
            vSection.find('.required').removeClass('required').addClass('was-required');
            fSection.find('.required').removeClass('required').addClass('was-required');
            fSection.find('input, textarea, select').removeClass('req');
       
          
            
        }else{
          const ignoredFields = '#FAX, #COUNTRY_SELECT, #ATTACH_OTHER, #ADDRESS_TH, #PROVINCE_TH, #DISTRICT_TH, #SUB_DISTRICT_TH, #POSTCODE_TH, #COUNTRY_TH';
            reasonManager.removecls("req");
            vSection.find('input, textarea, select').not(ignoredFields).addClass('req');
            vSection.find('input, textarea').prop('readonly', false).removeClass('bg-gray-100');
            vSection.find('select, input[type="radio"]').prop('disabled', false);
            vSection.find('.was-required').addClass('required').removeClass('was-required');
            fSection.find('.was-required').addClass('required').removeClass('was-required');
            fSection.find('input, textarea, select').addClass('req');
        
           
        }
    },
};

// -------------------------- End Req Type Manager -------------------



// -------------------------- Attach Type Manager --------------------------

export const attachTypeManager = {
    get label() {
        return $(".attach-file");
    },
    get checkbox() {
        return $('input[name="ATTACH_TYPE"]');
    },
    _list: [
        "cer",
        "vat",
        "book",
        "other",
    ],
    get types() {
        const types = [];
        this.checkbox.each(function () {
            if ($(this).is(":checked")) {
                types.push($(this).attr("a-type"));
            }
        });
        return types;
    },
    set checked(vals) {
        this.checkbox.each(function () {
            if (vals.includes($(this).val())) {
                $(this).prop("checked", true);
            }
        });
        this.change();
    },
    reset(notType = null) {
        this.checkbox.each(function () {
            const type = $(this).attr("a-type");
            if (type != notType) {
                $(this).prop("checked", false);
            }
        });
        this.change();
    },
    hide(notType = null) {
        this.checkbox.each(function () {
            const type = $(this).attr("a-type");
            if (type != notType) {
                $(this).prop("checked", false);
                $(this).removeClass("req");
                $(`#attach-${type}`).addClass("hidden");
            }
        });
    },
    show(list) {
        const isDeleteMode = $('input[name="REQTYPE_SHOW"]:checked').val() === 'D';
        this.checkbox.each(function () {
            const type = $(this).attr("a-type");
            if (list.includes(type)) {
                $(`#attach-${type}`).removeClass("hidden");
                if(!isDeleteMode){
                    $(this).addClass("req");
                }else{
                    $(this).removeClass("req");
                }
            }
        });
    },
    change() {
        const types = this.types;
        types.includes("other")
            ? attachOtherManager.disabled(false)
            : attachOtherManager.disabled(true);
    },
};

const attachOtherManager = {
    get input() {
        return $("#ATTACH_OTHER");
    },
    set text(val) {
        this.input.text(val);
    },
    set value(val) {
        this.input.val(val);
    },
    disabled(isDisabled) {
        const isDeleteMode = $('input[name="REQTYPE_SHOW"]:checked').val() === 'D';
        this.input.prop("disabled", isDisabled);
        if (isDisabled) {
            this.input.val("");
            this.input.removeClass("req");
        } else {
            if (isDeleteMode) {
                this.input.removeClass("req");
            }else{
                this.input.addClass("req");
            }
            
        }
        removeClassError(this.input);
    },
};

// -------------------------- End of Attach Type Manager --------------------------

export const attachFileManager = {
    get input() {
        return $("#files");
    },
    get container() {
        return $("#attachFile");
    },
    get checkedFilesLength() {
        return (
            this.input[0].files.length +
            this.container.find(".file-link").length
        );
    },
    set container(html) {
        this.container.html(html);
    },
    init(files = []) {
        const html =
            files.length > 0 ? this.setFiles(files, state.FormInfo.RETURN) : "";
        this.container =
            html +
            (state.FormInfo.RETURN
                ? dragDropInit()
                : state.FormInfo.MODE == 1
                  ? dragDropInit({
                        class: "req",
                    })
                  : "");
    },
    setFiles(files, isReturn = false) {
        let html = "<div class='flex flex-col gap-3 mt-5'>";
        files.forEach((f) => {
            html += `
            <a 
                href="${f.FILE_PATH}" 
                storedName="${f.FILE_FNAME}" 
                originalName="${f.FILE_ONAME}"
                class="file-link text-primary flex items-center gap-3 w-full border rounded-lg bg-base-100 p-3"
            >
                <i class="${classIcofont(f.FILE_ONAME.split(".").pop())} text-4xl"></i>
                <span class="link link-primary">${f.FILE_ONAME}</span>
                <button 
                    type="button"
                    file-id="${f.FILE_ID}"
                    class="flex items-center justify-center ml-auto p-5 w-6 h-6 rounded hover:bg-red-100 text-red-500 hover:text-red-600 transition remove-file 
                    ${isReturn ? "" : "hidden"}">
                    <i class="icofont-trash text-xl"></i>
                </button>

            </a>`;
        });
        html += "</div>";
        return html;
    },
    deleteFile(tagA, id) {
        Swal.fire({
            title: "Are you sure you want to delete this file?",
            icon: "warning",
            showCancelButton: true,
        }).then((result) => {
            if (result.isConfirmed) {
                tagA.remove();
                state.deleteFiles = id;
            }
        });
    },
};

export const actionFormManager = {
    get remark() {
        return $("#remark");
    },
    get container() {
        return $("#form-action-container");
    },
    init(mode, flow) {
        switch (mode) {
            case 1:
                this.container.html(webflowSubmit({ request: true }));
                break;
            case 2:
                this.container.html(
                    webflowSubmit({
                        flow: true,
                        flowhtml: flow,
                        approve: true,
                        reject: state.FormInfo.RETURN ? false : true,
                        return: state.FormInfo.RETURN ? false : true,
                    }),
                );
                break;
            case 3:
                this.container.html(
                    webflowSubmit({
                        actionsForm: false,
                        remark: false,
                        flow: true,
                        flowhtml: flow,
                    }),
                );
                break;
            default:
                this.container.html("");
                break;
        }
    },
    loading(mode) {
        switch (mode) {
            case 1:
                formSubmitSkeleton({
                    count: 2,
                    element: "#form-action-container",
                    mode: "create",
                });
                break;
            case 2:
                formSubmitSkeleton({
                    count: state.FormInfo.RETURN ? 3 : 4,
                    element: "#form-action-container",
                    mode: "edit",
                });
                break;
            default:
                formSubmitSkeleton({
                    element: "#form-action-container",
                    mode: "view",
                });
                break;
        }
    },
    async requestForm() {
        try {
            showLoader();
            //prettier-ignore
            const requiredMessage = [
                {element: reqByManager.input, message: "Please input requester."},
                {element: ReqtypeManager.radio, message: "Please select Request Type."},
                {element: typejobManager.input, message: "Please input Type of Job."},
                {element: serviceManager.input, message: "Please input Service."},
                {element: purposeManager.input, message: "Please input Purpose."},
                {element: comnameManager.input, message: "Please input Company Name."},
                {element: ReqtypeManager.radio, message: "Please select Request Type."},
                reasonManager.input.hasClass('req') ? {element: reasonManager.input, message: "Please input Reason."} : null,
                {element: vendorTypeManager.radio, message: "Please select Local or Overseas."},
                 countryManager.select.hasClass('req') ? {element: countryManager.select, message: "Please select Country."} : null,
                {element: provinceEnManager.input, message: "Please input Province (English)."},
                {element: districtEnManager.input, message: "Please input District (English)."},
                {element: subDistrictEnManager.input, message: "Please input Sub-District (English)."},
                {element: postcodeEnManager.input, message: "Please input Postcode (English)."},
                {element: attachTypeManager.checkbox, message: "Please select Attach Type."},
                {element: attachFileManager.input, message: "Please attach files."},
            ].filter(Boolean);
            if (!(await requiredForm("#form", requiredMessage))) return;
         
            const formData = new FormData($("#form")[0]);
            const data = state.data;
            formData.set("NFRMNO", data.NFRMNO);
            formData.set("VORGNO", data.VORGNO);
            formData.set("CYEAR", data.CYEAR);
            formData.set("REMARK", this.remark.val());
            const LISTS = [
                {"PURPOSE" : formData.get("PURPOSE") , "TYPEJOB" : formData.get("TYPEJOB") , "SERVICE" : formData.get("SERVICE") , "REASON" : formData.get("REASON")}
            ];
            formData.set("LISTS", JSON.stringify(LISTS));

            const filteredFormData = filterFormData(formData);
            
            logFormData(filteredFormData);
           
            const res = await create(filteredFormData);

            if (res.status == true) {
                showMessage(res.message, "success");
                redirectWebflow();
            } else {
                throw new Error(res.message);
            }
        } catch (err) {
            console.error(err);
            showErrorMessage(err);
        } finally {
            showLoader({ show: false });
        }
    },
    async action(action) {
        try {
            showLoader();
            let res = null;
            const data = state.data;
            if (action === "return" && this.remark.val().trim() === "") {
                showMessage(
                    "Please input remark for return action.",
                    "warning",
                );
                return;
            }
            if (action === "approve" && state.FormInfo.RETURN) {
                //prettier-ignore
                const requiredMessage = [
                    {element: reqByManager.input, message: "Please input requester."},
                    {element: ReqtypeManager.radio, message: "Please select Request Type."},
                    {element: typejobManager.input, message: "Please input Type of Job."},
                    {element: serviceManager.input, message: "Please input Service."},
                    {element: purposeManager.input, message: "Please input Purpose."},
                    reasonManager.input.hasClass('req') ? {element: reasonManager.input, message: "Please input Reason."} : null,
                    {element: comnameManager.input, message: "Please input Company Name."},
                    {element: ReqtypeManager.radio, message: "Please select Request Type."},
                    {element: vendorTypeManager.radio, message: "Please select Local or Overseas."},
                    countryManager.select.hasClass('req') ? {element: countryManager.select, message: "Please select Country."} : null,
                    {element: provinceEnManager.input, message: "Please input Province (English)."},
                    {element: districtEnManager.input, message: "Please input District (English)."},
                    {element: subDistrictEnManager.input, message: "Please input Sub-District (English)."},
                    {element: postcodeEnManager.input, message: "Please input Postcode (English)."},
                    {element: attachTypeManager.checkbox, message: "Please select Attach Type."},
                    {element: attachFileManager.input, message: "Please attach files."},
                ].filter(Boolean);
                if(attachFileManager.checkedFilesLength > 0)
                {
                    $(`#F-section`).find('input, textarea, select').removeClass('req');
                }
                if (!(await requiredForm("#form", requiredMessage))) return;
                console.log(attachFileManager.checkedFilesLength);
                if (attachFileManager.checkedFilesLength === 0 && $("#REQTYPE").val() != "D") {
                    showMessage(
                        "Please upload attached files before approve.",
                        "warning",
                    );
                    return;
                }
                const formData = new FormData($("#form")[0]);
                formData.set("NFRMNO", data.NFRMNO);
                formData.set("VORGNO", data.VORGNO);
                formData.set("CYEAR", data.CYEAR);
                formData.set("CYEAR2", data.CYEAR2);
                formData.set("NRUNNO", data.NRUNNO);
                formData.set("EMPNO", data.EMPNO);
                formData.set("ACTION", action);
                formData.set("REMARK", this.remark.val());
                //formData.set(
                 //   "CURRENCY",
                  //  currencyManager.getValue("curr-payment"),
               // );
                // formData.set("DELETE_FILES", state.deleteFiles || "");
                state.deleteFiles.forEach((fileId) => {
                    formData.append("DELETE_FILES[]", String(fileId));
                });

                const filteredFormData = filterFormData(formData);
                //logFormData(filteredFormData);
               // throw new Error(res.message);
                res = await approveReturn(filteredFormData);
            } else {
                res = await doaction({
                    ...data,
                    ACTION: action,
                    REMARK: this.remark.val(),
                });
            }
            if (res.status == true) {
                //chechk status form
                const rescst = await getFormStatus({...data});
                //console.log(rescst);
                showMessage(res.message, "success");
                
                redirectWebflow();
                // throw new Error("test");
            } else {
                throw new Error(res.message);
            }
        } catch (error) {
            console.error(error);
            showErrorMessage(error);
        } finally {
            showLoader({ show: false });
        }
    },
};
