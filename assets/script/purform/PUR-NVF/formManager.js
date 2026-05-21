import select2 from "select2";
import { getUser, searchUser } from "@amec/webasset/api/amec";
import { doaction, showflow } from "@amec/webasset/api/webform";
import { webflowSubmit } from "@amec/webasset/components/form";
import { redirectWebflow, setformDetail } from "@amec/webasset/form";
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
import { approveReturn, create, getCurrency, getData } from "./data";
import { dragDropInit } from "@amec/webasset/dragdrop";
import { setDatefpk, setDatePicker } from "@amec/webasset/flatpickr";
import { setSelect2 } from "@amec/webasset/select2";
import { selectAttachType } from "./function";
import { formatDate } from "@amec/webasset/dayjs";
import { classIcofont } from "@amec/webasset/fileExplorer";
import Swal from "sweetalert2";
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

export const formManager = {
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
                setDatePicker();
                const curr = await getCurrency();
                const currData = curr.map((c) => ({
                    value: c.CCURNAME,
                    text: c.CCURNAME,
                }));
                currencyManager.init(currData);
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
                this.formDetail = await setformDetail(form);
                actionFormManager.init(mode, flow.html);
                attachFileManager.init(data.FILES || []);
                if (state.FormInfo.RETURN) {
                    $("#section-0").addClass("hidden!");
                    setDatePicker();
                    const curr = await getCurrency();
                    const currData = curr.map((c) => ({
                        value: c.CCURNAME,
                        text: c.CCURNAME,
                    }));
                    await currencyManager.init(currData);
                    this.setReturn(data);
                } else {
                    this.setView(data);
                }
                break;
            default:
                throw new Error("Invalid form mode");
        }
    },
    setView(data) {
        // Delivery Location
        deliveryManager.checked(true, data.DELIVELY);
        // Invoice Type
        inVoiceTypeManager.checkbox.each(function () {
            const value = $(this).val();
            const type = $(this).attr("i-type");
            if (data.INVOICE_TYPE.includes(value)) {
                $(this).prop("checked", true);
                if (type == "service") {
                    const thirdParty =
                        state.users
                            .filter((u) => u.SEMPNO == data.THIRD_PARTY)
                            .map((u) => `${u.SNAME} (${u.SEMPNO})`) || null;
                    thirdPartyManager.show();
                    thirdPartyManager.text = thirdParty || "N/A";
                }
                if (type == "other") {
                    inVoiceTypeOtherManager.text = data.INVOICE_OTHER || "-   ";
                }
            }
        });
        // Subject
        subjectManager.text = data.SUBJECT || "-";
        // Accept PO
        acceptPoManager.checked(true, data.ACCEPT_PO);
        acceptSubconManager.text = data.ACCEPT_SUBCON || "-";
        acceptOtherManager.text = data.ACCEPT_OTHER || "-";
        // Quotation
        quotationManager.text = data.QUOTATION || "-";
        quotationDateManager.text = data.QUOTATION_DATE
            ? formatDate(data.QUOTATION_DATE)
            : "-";
        // PR/PO
        poManager.text = data.PONO || "-";
        // Total Amount
        totalAmountManager.text = data.TOTAL_AMOUNT || 0;
        // Currency
        currencyManager.text = data.CURRENCY;
        // Invoice No
        invoiceNoManager.text = data.INVOICE_NO || "-";
        // Invoice Amount
        invoiceAmountManager.text = data.INVOICE_AMOUNT || 0;
        // Person In Charge
        personInChargeManager.text = data.PERSON_INCHARGE || "-";
        // Invoice Date
        invoiceDateManager.text = data.INVOICE_DATE
            ? formatDate(data.INVOICE_DATE)
            : "-";

        // Payment Type
        paymentTypeManager.radio.each(function () {
            const value = $(this).val();
            const type = $(this).attr("p-type");
            if (data.PAYMENT_TYPE == value) {
                $(this).prop("checked", true);
                if (type == "manual") {
                    // Payment Num
                    paymentNumManager.text =
                        ordinalIndicator(data?.PAYMENT_NUM) || "-";
                    selectAttachType(data?.PAYMENT_NUM);
                }
                if (type == "final") {
                    selectAttachType(type);
                }
            }
        });
        // Payment Detail
        paymentDetailManager.text = data.PAYMENT_DETAIL || "-";
        // Payment
        paymentManager.text = data.PAYMENT || 0;
        // Attach Type
        attachTypeManager.show(["other"]);
        attachTypeManager.checkbox.each(function () {
            const value = $(this).val();
            const type = $(this).attr("a-type");
            if (data.ATTACH_TYPE.includes(value)) {
                $(this).prop("checked", true);
                if (type == "other") {
                    // Attach Other
                    attachOtherManager.text = data.ATTACH_OTHER || "-";
                }
            }
        });
        // // Attached Files
        // attachFileManager.showFiles(data.FILES);
    },
    setReturn(data) {
        // Requester
        reqByManager.value = state.FormInfo.EMPNO || "-";
        reqByManager.input.prop("readonly", true);
        // Delivery Location
        deliveryManager.checked(true, data.DELIVELY);
        // Invoice Type
        inVoiceTypeManager.checked = data.INVOICE_TYPE.split("|");
        // Invoice Type Other
        inVoiceTypeOtherManager.value = data.INVOICE_OTHER || "";
        // THIRD PARTY
        if (data.THIRD_PARTY) {
            thirdPartyManager.value =
                state.users.find((u) => u.SEMPNO == data.THIRD_PARTY)?.SEMPNO ||
                "";
        }
        // Subject
        subjectManager.value = data.SUBJECT || "";
        // Accept PO
        acceptPoManager.value = data.ACCEPT_PO || "";
        acceptSubconManager.value = data.ACCEPT_SUBCON || "";
        acceptOtherManager.value = data.ACCEPT_OTHER || "";
        // Quotation
        quotationManager.value = data.QUOTATION || "";
        quotationDateManager.value = formatDate(data.QUOTATION_DATE);
        // PR/PO
        poManager.value = data.PONO || "";
        // Total Amount
        totalAmountManager.value = data.TOTAL_AMOUNT || 0;
        // Currency
        currencyManager.value = data.CURRENCY || "";
        // Invoice No
        invoiceNoManager.value = data.INVOICE_NO || "";
        // Invoice Amount
        invoiceAmountManager.value = data.INVOICE_AMOUNT || 0;
        // Person In Charge
        personInChargeManager.value = data.PERSON_INCHARGE || "";
        // Invoice Date
        invoiceDateManager.value = formatDate(data.INVOICE_DATE);
        // Payment Type
        paymentTypeManager.value = data.PAYMENT_TYPE || "";
        // Payment Num
        paymentNumManager.value = data.PAYMENT_NUM || "";
        // Payment Detail
        paymentDetailManager.value = data.PAYMENT_DETAIL || "";
        // Payment
        paymentManager.value = data.PAYMENT || 0;
        // Attach Type
        attachTypeManager.checked = data.ATTACH_TYPE.split("|");
        // Attach Other
        attachOtherManager.value = data.ATTACH_OTHER || "";
    },
};

export const currencyManager = {
    list: ["curr-total", "curr-invoice", "curr-payment"],
    get select() {
        return $(".currency");
    },
    set text(val) {
        $(".currency").text(val);
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
                placeholder: "BTH",
                search: false,
                clear: false,
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
};

const deliveryManager = {
    get radio() {
        return $('input[name="DELIVELY"]');
    },
    checked(isChecked, value) {
        this.radio.each(function () {
            if ($(this).val() == value) {
                $(this).prop("checked", isChecked);
            }
        });
    },
};

// -------------------------- Invoice Type Manager --------------------------
export const inVoiceTypeManager = {
    get checkbox() {
        return $('input[name="INVOICE_TYPE"]');
    },
    get values() {
        const values = [];
        this.checkbox.each(function () {
            if ($(this).is(":checked")) {
                values.push($(this).val());
            }
        });
        return values;
    },
    get types() {
        const types = [];
        this.checkbox.each(function () {
            if ($(this).is(":checked")) {
                types.push($(this).attr("i-type"));
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
    unchecked(type) {
        this.checkbox.each(function () {
            if ($(this).attr("i-type") == type) {
                $(this).prop("checked", false);
            }
        });
        this.change();
    },
    async change() {
        const types = this.types;
        types.includes("other")
            ? inVoiceTypeOtherManager.disabled(false)
            : inVoiceTypeOtherManager.disabled(true);
        if (types.includes("service")) {
            if (reqByManager.value == "") {
                showMessage("Please input requester", "warning");
                this.unchecked("service");
                return;
            }
            await thirdPartyManager.init(reqByManager.value);
        } else {
            thirdPartyManager.hide();
        }
    },
};

const inVoiceTypeOtherManager = {
    get input() {
        return $("#INVOICE_OTHER");
    },
    get value() {
        return this.input.val();
    },
    set value(val) {
        this.input.val(val);
    },
    set text(val) {
        this.input.text(val);
    },
    disabled(isDisabled) {
        this.input.prop("disabled", isDisabled);
        if (isDisabled) {
            this.value = "";
            this.input.removeClass("req");
        } else {
            this.input.addClass("req");
        }
        removeClassError(this.input);
    },
};

const thirdPartyManager = {
    get select() {
        return $("#THIRD_PARTY");
    },
    get fieldset() {
        return $("#third-party-fieldset");
    },
    set text(val) {
        this.select.text(val);
    },
    set value(val) {
        this.select.val(val).trigger("change");
    },
    async init(requester) {
        const requesterData = state.users.find((u) => u.SEMPNO == requester);
        const thirdParty = state.users
            .filter(
                (u) =>
                    u.SPOSCODE == "30" && u.SSECCODE != requesterData.SSECCODE,
            )
            .sort((a, b) => {
                return a.SNAME.localeCompare(b.SNAME);
            });
        if (!this.select.hasClass("select2-hidden-accessible")) {
            await setSelect2({
                id: "THIRD_PARTY",
                data: thirdParty.map((u) => ({
                    value: u.SEMPNO,
                    text: `${u.SNAME} (${u.SEMPNO})`,
                })),
                width: "24rem",
                size: "sm",
            });
        }
        this.show();
    },
    show() {
        this.fieldset.removeClass("hidden!");
        this.select.addClass("req");
    },
    hide() {
        this.fieldset.addClass("hidden!");
        this.select.removeClass("req");
        this.value = "";
    },
};
// -------------------------- End of Invoice Type Manager --------------------------

const subjectManager = {
    get input() {
        return $("#SUBJECT");
    },
    set text(val) {
        this.input.text(val);
    },
    set value(val) {
        this.input.val(val);
    },
};

// -------------------------- Accept PO Type Manager --------------------------
export const acceptPoManager = {
    get radio() {
        return $('input[name="ACCEPT_PO"]');
    },
    get type() {
        let type = null;
        this.radio.each(function () {
            if ($(this).is(":checked")) {
                type = $(this).attr("a-type");
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
    checked(isChecked, value) {
        this.radio.each(function () {
            if ($(this).val() == value) {
                $(this).prop("checked", isChecked);
            }
        });
    },
    change() {
        const type = this.type;
        if (!type) {
            showMessage("Please select accept type", "warning");
            return;
        }
        switch (type) {
            case "subcon":
                acceptSubconManager.disabled(false);
                acceptOtherManager.disabled(true);
                break;
            case "other":
                acceptOtherManager.disabled(false);
                acceptSubconManager.disabled(true);
                break;
        }
    },
};

const acceptSubconManager = {
    get input() {
        return $("#ACCEPT_SUBCON");
    },
    set value(val) {
        this.input.val(val);
    },
    set text(val) {
        this.input.text(val);
    },
    disabled(isDisabled) {
        this.input.prop("disabled", isDisabled);
        if (isDisabled) {
            this.value = "";
            this.input.removeClass("req");
        } else {
            this.input.addClass("req");
        }
        removeClassError(this.input);
    },
};

const acceptOtherManager = {
    get input() {
        return $("#ACCEPT_OTHER");
    },
    set value(val) {
        this.input.val(val);
    },
    set text(val) {
        this.input.text(val);
    },
    disabled(isDisabled) {
        this.input.prop("disabled", isDisabled);
        if (isDisabled) {
            this.value = "";
            this.input.removeClass("req");
        } else {
            this.input.addClass("req");
        }
        removeClassError(this.input);
    },
};
// -------------------------- End of Accept PO Type Manager --------------------------

const quotationManager = {
    get input() {
        return $("#QUOTATION");
    },
    set text(val) {
        this.input.text(val);
    },
    set value(val) {
        this.input.val(val);
    },
};

const quotationDateManager = {
    get input() {
        return $("#QUOTATION_DATE");
    },
    set text(val) {
        this.input.text(val);
    },
    set value(val) {
        setDatefpk({
            name: "QUOTATION_DATE",
            date: val,
        });
    },
};

const poManager = {
    get input() {
        return $("#PONO");
    },
    set text(val) {
        this.input.text(val);
    },
    set value(val) {
        this.input.val(val);
    },
};

const totalAmountManager = {
    get input() {
        return $("#TOTAL_AMOUNT");
    },
    set text(val) {
        this.input.text(setRound(val) || "0");
    },
    set value(val) {
        this.input.val(val);
    },
};

const invoiceNoManager = {
    get input() {
        return $("#INVOICE_NO");
    },
    set text(val) {
        this.input.text(val);
    },
    set value(val) {
        this.input.val(val);
    },
};

const invoiceAmountManager = {
    get input() {
        return $("#INVOICE_AMOUNT");
    },
    set text(val) {
        this.input.text(setRound(val) || "0");
    },
    set value(val) {
        this.input.val(val);
    },
};

const personInChargeManager = {
    get input() {
        return $("#PERSON_INCHARGE");
    },
    set text(val) {
        this.input.text(val);
    },
    set value(val) {
        this.input.val(val);
    },
};

const invoiceDateManager = {
    get input() {
        return $("#INVOICE_DATE");
    },
    set text(val) {
        this.input.text(val);
    },
    set value(val) {
        setDatefpk({
            name: "INVOICE_DATE",
            date: val,
        });
    },
};

const paymentDetailManager = {
    get input() {
        return $("#PAYMENT_DETAIL");
    },
    set text(val) {
        this.input.text(val);
    },
    set value(val) {
        this.input.val(val);
    },
};

// -------------------------- Vendor Type Manager ------------------------------

export const vendorTypeManager = {
    get radio() {
        return $('input[name="VENDOR_LOCATION"]');
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
    set value(val) {
        this.radio.each(function () {
            if ($(this).val() == val) {
                $(this).prop("checked", true);
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
        selectAttachType(type);
        
    },
};




// -------------------------- End Vendor Type Manager -------------------



// -------------------------- Payment Type Manager --------------------------
export const paymentTypeManager = {
    get radio() {
        return $('input[name="PAYMENT_TYPE"]');
    },
    get type() {
        let type = null;
        this.radio.each(function () {
            if ($(this).is(":checked")) {
                type = $(this).attr("p-type");
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
    change() {
        paymentNumManager.value = "";
        paymentManager.disabled(false);
        attachTypeManager.hide("other");
        attachTypeManager.reset("other");
        const type = this.type;
        if (type == "manual") {
            paymentNumManager.disabled(false);
            paymentNumManager.value = 1;
            paymentNumManager.onInput();
            removeClassError(paymentNumManager.input);
        } else if (type == "final") {
            paymentNumManager.disabled(true);
            selectAttachType(type);
        }
    },
};

export const paymentNumManager = {
    get input() {
        return $("#PAYMENT_NUM");
    },
    set value(val) {
        this.input.val(val);
    },
    set text(val) {
        this.input.text(val);
    },
    disabled(isDisabled) {
        this.input.prop("disabled", isDisabled);
        if (isDisabled) {
            this.value = "";
            this.input.removeClass("req");
        } else {
            this.input.addClass("req");
        }
    },
    onInput(value) {
        const payment = !value ? 1 : Number(value);
        this.value = payment;
        attachTypeManager.hide("other");
        attachTypeManager.reset("other");
        selectAttachType(payment);
    },
};

const paymentManager = {
    get input() {
        return $("#PAYMENT");
    },
    set text(val) {
        this.input.text(setRound(val) || "0");
    },
    set value(val) {
        this.input.val(val);
    },
    disabled(isDisabled) {
        this.input.prop("disabled", isDisabled);
    },
};

// -------------------------- End of Payment Type Manager --------------------------

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
        this.checkbox.each(function () {
            const type = $(this).attr("a-type");
            if (list.includes(type)) {
                $(this).addClass("req");
                $(`#attach-${type}`).removeClass("hidden");
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
        this.input.prop("disabled", isDisabled);
        if (isDisabled) {
            this.input.val("");
            this.input.removeClass("req");
        } else {
            this.input.addClass("req");
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
                        reject: true,
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
                {element: deliveryManager.radio,  message: "Please select Delivery Location."},
                {element: inVoiceTypeManager.checkbox, message: "Please select Invoice Type."},
                !thirdPartyManager.fieldset.hasClass('hidden!') ? {element: thirdPartyManager.select, message: "Please select Third Party."} : null,
                inVoiceTypeOtherManager.input.hasClass('req') ? {element: inVoiceTypeOtherManager.input, message: "Please input other invoice detail."} : null,
                {element: subjectManager.input, message: "Please input subject."},
                {element: invoiceNoManager.input, message: "Please input Invoice No."},
                {element: invoiceAmountManager.input, message: "Please input Invoice Amount."},
                {element: paymentTypeManager.radio, message: "Please select Payment Conditions & Terms."},
                {element: paymentManager.input, message: "Please input Payment Amount."},
                paymentNumManager.input.hasClass('req') ? {element: paymentNumManager.input, message: "Please input Number of Payment."} : null,
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
            formData.set("CURRENCY", currencyManager.getValue("curr-payment"));

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
                    {element: deliveryManager.radio,  message: "Please select Delivery Location."},
                    {element: inVoiceTypeManager.checkbox, message: "Please select Invoice Type."},
                    !thirdPartyManager.fieldset.hasClass('hidden!') ? {element: thirdPartyManager.select, message: "Please select Third Party."} : null,
                    inVoiceTypeOtherManager.input.hasClass('req') ? {element: inVoiceTypeOtherManager.input, message: "Please input other invoice detail."} : null,
                    {element: subjectManager.input, message: "Please input subject."},
                    {element: invoiceNoManager.input, message: "Please input Invoice No."},
                    {element: invoiceAmountManager.input, message: "Please input Invoice Amount."},
                    {element: paymentTypeManager.radio, message: "Please select Payment Conditions & Terms."},
                    {element: paymentManager.input, message: "Please input Payment Amount."},
                    paymentNumManager.input.hasClass('req') ? {element: paymentNumManager.input, message: "Please input Number of Payment."} : null,
                    {element: attachTypeManager.checkbox, message: "Please select Attach Type."},
                ].filter(Boolean);
                if (!(await requiredForm("#form", requiredMessage))) return;
                if (attachFileManager.checkedFilesLength === 0) {
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
                formData.set(
                    "CURRENCY",
                    currencyManager.getValue("curr-payment"),
                );
                // formData.set("DELETE_FILES", state.deleteFiles || "");
                state.deleteFiles.forEach((fileId) => {
                    formData.append("DELETE_FILES[]", String(fileId));
                });

                const filteredFormData = filterFormData(formData);
                logFormData(filteredFormData);

                res = await approveReturn(filteredFormData);
            } else {
                res = await doaction({
                    ...data,
                    ACTION: action,
                    REMARK: this.remark.val(),
                });
            }
            if (res.status == true) {
                showMessage(res.message, "success");
                redirectWebflow();
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
