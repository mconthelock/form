import { getUser } from "@amec/webasset/api/amec";
import { getRequestNo, showflow } from "@amec/webasset/api/webform";
import { showLoader } from "@amec/webasset/preloader";
import { clearSelect2, setSelect2 } from "@amec/webasset/select2";
import {
    addMinutesToTime,
    getAllAttr,
    removeClassError,
    requiredForm,
    showErrorMessage,
    showMessage,
} from "@amec/webasset/utils";
import {
    actionTid,
    createTid,
    getController,
    getFormData,
    getServerName,
    getUserLogin,
} from "./data";
import { setDatePicker } from "@amec/webasset/flatpickr";
import { getformDetail, webflowSubmit } from "@amec/webasset/components/form";
import "@amec/webasset/tooltip";
import { redirectWebflow } from "@amec/webasset/form";
import { formatDate, isSameDay, parseTimestamp } from "@amec/webasset/dayjs";

export const state = {
    _formInfo: null,
    _formData: null,
    // Setter
    set FormInfo(data) {
        this._formInfo = data;
    },

    // Getter
    get FormInfo() {
        return this._formInfo;
    },
    get data() {
        return {
            NFRMNO: this.FormInfo?.NFRMNO,
            VORGNO: this.FormInfo?.VORGNO,
            CYEAR: this.FormInfo?.CYEAR,
            CYEAR2: this.FormInfo?.CYEAR2,
            NRUNNO: this.FormInfo?.NRUNNO,
            INPUTBY: inputByManager.value,
            REQBY: reqByManager.value,
            EMPNO: this.FormInfo?.EMPNO,
            CEXTDATA: this.FormInfo?.CEXTDATA,
            MODE: this.FormInfo?.MODE,
            SERVERNAME: serverNameManager.value,
            USERLOGIN: userLoginManager.value,
            CONTROLLER: controllerManager.value,
            CHANGE_DATA: changeDataManager.value,
            LATE: lateManager.value,
            FORMTYPE: formTypeManager.value,
            REQNO: reqNoManager.list.join("|"),
        };
    },
    get formData() {
        return this._formData;
    },
    set formData(data) {
        this._formData = data;
    },
};

export const formManager = {
    get form() {
        return $("#form");
    },
    get formInfo() {
        return $("#form-info");
    },
    set formInfo(html) {
        this.formInfo.html(html);
    },
    loading(isLoading) {
        if (isLoading) {
            this.form.addClass("hidden");
            $(".load").removeClass("hidden");
        } else {
            this.form.removeClass("hidden");
            $(".load").addClass("hidden");
        }
    },
    async init() {
        try {
            showLoader();
            const formInfo = await getAllAttr(".form-info");
            state.FormInfo = {
                NFRMNO: formInfo.nfrmno,
                VORGNO: formInfo.vorgno,
                CYEAR: formInfo.cyear,
                MODE: formInfo.mode,
            };
            const empno = $("#INPUTBY").val().trim();
            inputByManager.value = empno;
            await reqByManager.setEmpRequester(empno);
            const controller = await getController();
            const userlogin = await getUserLogin();
            const servername = await getServerName();
            controllerManager.setSelect(controller);
            userLoginManager.setSelect(userlogin);
            serverNameManager.setSelect(servername);

            setDatePicker({ dayOff: true, defaultDate: new Date() });
            setDatePicker({
                element: "#pStart",
                time: true,
            });
            setDatePicker({
                element: "#pEnd",
                time: true,
            });
            formTypeManager.toggle(1);
            this.loading(false);
            actionForm.init(formInfo.mode);
        } catch (e) {
            console.error(e);
            showErrorMessage(e);
        } finally {
            showLoader({ show: false });
        }
    },
    async views() {
        try {
            showLoader();
            const formInfo = await getAllAttr(".form-info");
            const apvData = await getAllAttr(".apv-data");
            state.FormInfo = {
                NFRMNO: formInfo.nfrmno,
                VORGNO: formInfo.vorgno,
                CYEAR: formInfo.cyear,
                CYEAR2: formInfo.cyear2,
                NRUNNO: formInfo.nrunno,
                EMPNO: apvData.apv,
                CEXTDATA: apvData.cextdata,
                MODE: apvData.mode,
            };
            const form = {
                NFRMNO: state.FormInfo.NFRMNO,
                VORGNO: state.FormInfo.VORGNO,
                CYEAR: state.FormInfo.CYEAR,
                CYEAR2: state.FormInfo.CYEAR2,
                NRUNNO: state.FormInfo.NRUNNO,
            };
            this.formInfo = await getformDetail(form, "card-header");
            const flow = await showflow(form);
            actionForm.init(apvData.mode, flow.html);
            this.setData(apvData.mode, form);
            this.loading(false);
        } catch (error) {
            console.error(error);
            showErrorMessage(error);
        } finally {
            showLoader({ show: false });
        }
    },
    async setData(mode, form) {
        if (mode == 1) {
            return;
        }
        const formData = await getFormData(form);
        if (!formData.status) {
            throw new Error(formData.message || "Cannot get form data");
        }
        const data = formData.data;
        state.formData = data;
        reqDateManager.input.text(formatDate(data.TID_REQ_DATE, "DD-MMM-YY"));
        timeStartManager.input.text(data.TID_TIMESTART);
        timeEndManager.input.text(data.TID_TIMEEND);
        data.TID_CHANGEDATA == 1
            ? changeDataManager.show()
            : changeDataManager.hide();
        data.TID_LATE == 1 ? lateManager.show() : lateManager.hide();
        const reqNoList = data.TID_REQNO.includes("|")
            ? data.TID_REQNO.split("|")
            : [data.TID_REQNO];
        for (const reqNo of reqNoList) {
            const d = await getRequestNo(reqNo);
            if (d.status) {
                d.data.forEach((l) => {
                    $("#reqNo-list").append(
                        `<a href="${l.LINK}" class="link link-primary" target="_blank"> ${l.FORMNO}</a><br>`,
                    );
                });
            }
        }
        serverNameManager.select.text(data.TID_SERVERNAME);
        userLoginManager.select.text(data.TID_USERLOGIN);
        data.TID_CONTROLLER
            ? controllerManager.show()
            : controllerManager.hide();
        controllerManager.select.text(data.TID_CONTROLLER);
        workContentManager.value = data.TID_WORKCONTENT ?? "-";
        reasonManager.value = data.TID_REASON ?? "-";

        workCompleteManager.init(state.FormInfo.CEXTDATA, data);
        disableCompleteManager.init(state.FormInfo.CEXTDATA, data);
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

const reqByManager = {
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
            reqByManager.value = "";
            showMessage(
                "Employee not found. Please enter the information again. (ไม่พบข้อมูลพนักงาน กรุณากรอกใหม่อีกครั้ง)",
                "warning",
            );
            return;
        }
        reqByManager.value = empno;
    },
};

const reqDateManager = {
    get input() {
        return $("#reqDate");
    },
    get value() {
        return this.input.val();
    },
    set value(val) {
        this.input.val(val);
    },
    get date(){
        return new Date(this.value+ "00:00:00");
    }
};

const timeStartManager = {
    get input() {
        return $("#pStart");
    },
    get value() {
        return this.input.val();
    },
    set value(val) {
        this.input.val(val);
    },
};

const timeEndManager = {
    get input() {
        return $("#pEnd");
    },
    get value() {
        return this.input.val();
    },
    set value(val) {
        this.input.val(val);
    },
};

export const formTypeManager = {
    get input() {
        return $("input[name='formType']");
    },
    get value() {
        return this.input.filter(":checked").val();
    },
    toggle(formType) {
        this.input.filter(`[value='${formType}']`).prop("checked", true);
        if (formType == 1) {
            controllerManager.hide();
            lateManager.show();
            changeDataManager.hide();
        } else {
            controllerManager.show();
            lateManager.hide();
            changeDataManager.show();
        }
        changeDataManager.checked(false);
        lateManager.checked(false);
        serverNameManager.empty();
        serverNameManager.removeErrCls();
        serverNameManager.handleUsrAndContSelect();
    },
};

export const reqNoManager = {
    _list: [],
    get input() {
        return $("#reqNo");
    },
    get container() {
        return $("#reqNo-container");
    },
    get list() {
        return this._list;
    },
    get value() {
        return this.input.val();
    },
    set value(val) {
        this.input.val(val);
    },
    set List(reqNo) {
        this._list.push(reqNo);
        this.render();
    },
    disabled(isDisabled) {
        this.input.prop("disabled", isDisabled);
    },
    loading(isLoading) {
        this.disabled(isLoading);
        if (isLoading) {
            this.input.siblings(".loading").removeClass("hidden");
        } else {
            this.input.siblings(".loading").addClass("hidden");
        }
    },
    async addReqNo(reqNo) {
        try {
            if (RegExp(/^[0-9]{2}-[0-9]{1,5}$/).test(reqNo)) {
                reqNo =
                    "IS-DEV" +
                    reqNo.split("-")[0] +
                    "-" +
                    reqNo.split("-")[1].padStart(6, "0");
            } else if (RegExp(/^[0-9]{2}-[0-9]{6}$/).test(reqNo)) {
                reqNo = "IS-DEV" + reqNo;
            } else if (
                !RegExp(/^[A-Za-z]+-[a-zA-Z0-9]+-[0-9]{6}$/).test(reqNo)
            ) {
                this.value = "";
                showMessage(
                    "Please enter a valid request number, e.g., IS-DEV25-000127,  (กรุณากรอกเลขที่คำร้องให้ถูกต้อง เช่น IS-DEV25-000127)",
                    "warning",
                );
                return;
            }
            actionForm.disable(true);
            this.loading(true);
            const check = await getRequestNo(reqNo);
            this.value = "";
            if (check.status == 0) {
                showMessage(
                    "Request number not found in the system (ไม่พบเลขที่คำร้องนี้ในระบบ)",
                    "warning",
                );
                return;
            }
            this.List = reqNo;
        } catch (error) {
            console.error(error);
            showErrorMessage(error);
        } finally {
            actionForm.disable(false);
            this.loading(false);
        }
    },
    removeReqNo(reqNo) {
        this._list = this._list.filter((r) => r != reqNo);
        this.render();
    },
    render() {
        if (this._list.length > 0) {
            let html = "";
            this._list.forEach((reqNo) => {
                html += `
                <div class="flex items-center w-fit rounded-md border border-amber-300 bg-amber-100 text-amber-800 text-sm font-medium px-3 h-8 gap-2">
                    <span class="font-semibold reqNo-list">${reqNo}</span>
                    <button 
                        type="button"
                        class="flex items-center justify-center w-6 h-6 rounded hover:bg-red-100 text-red-500 hover:text-red-600 transition remove-reqNo"
                        data-reqno="${reqNo}">
                        <i class="icofont-trash text-sm"></i>
                    </button>
                </div>`;
            });
            $("#reqNo-list").html(html);
            serverNameManager.disabled(false);
        } else {
            $("#reqNo-list").html(
                '<span class="text-gray-500">Request number is not provided (ยังไม่มีเลขที่คำร้อง)</span>',
            );
            serverNameManager.disabled(true);
            serverNameManager.empty();
            serverNameManager.removeErrCls();
            serverNameManager.handleUsrAndContSelect();
        }
    },
};

const lateManager = {
    get checkbox() {
        return $("#late");
    },
    get container() {
        return $("#late-container");
    },
    get value() {
        return this.checkbox.is(":checked") ? 1 : 0;
    },
    show() {
        this.container.removeClass("hidden");
    },
    hide() {
        this.container.addClass("hidden");
    },
    checked(checked) {
        this.checkbox.prop("checked", checked);
    },
};

const changeDataManager = {
    get checkbox() {
        return $("#changeData");
    },
    get container() {
        return $("#changeData-container");
    },
    get value() {
        return this.checkbox.is(":checked") ? 1 : 0;
    },
    show() {
        this.container.removeClass("hidden");
    },
    hide() {
        this.container.addClass("hidden");
    },
    checked(checked) {
        this.checkbox.prop("checked", checked);
    },
};

export const serverNameManager = {
    _data: null,
    set data(data) {
        this._data = data;
    },
    get select() {
        return $("#serverName");
    },
    get selected() {
        return this.select.find("option:selected");
    },
    get value() {
        return this.select.val();
    },
    get data() {
        return this._data;
    },
    reset() {
        this.empty();
        this.removeErrCls();
        this.handleUsrAndContSelect();
        this.disabled(true);
    },
    empty() {
        clearSelect2("#serverName");
    },
    removeErrCls() {
        removeClassError(this.select);
    },
    disabled(isDisabled) {
        this.select.prop("disabled", isDisabled);
    },
    async setSelect(data) {
        if (!this.data && data && data.length > 0) {
            this.data = data;
        }
        await setSelect2({
            element: "#serverName",
            disableSearch: true,
            data: this.data.map((d) => ({
                value: d.SERVER_NAME.trim(),
                text: d.SERVER_NAME.trim(),
            })),
        });
    },
    async handleUsrAndContSelect(serverName) {
        const controls = controllerManager.data.filter(
            (c) => c.SERVER_NAME == serverName,
        );
        const userlogins = userLoginManager.data.filter(
            (c) => c.SERVER_NAME == serverName,
        );
        const merge = [...userlogins, ...controls];

        if (formTypeManager.value == 1) {
            if (lateManager.value == 1) {
                await userLoginManager.setSelect(merge);
                merge.length == 0
                    ? userLoginManager.disabled(true)
                    : userLoginManager.disabled(false);
            } else {
                await userLoginManager.setSelect(controls);
                controls.length == 0
                    ? userLoginManager.disabled(true)
                    : userLoginManager.disabled(false);
            }
        } else {
            await controllerManager.setSelect(controls);
            await userLoginManager.setSelect(userlogins);
            controls.length == 0
                ? controllerManager.disabled(true)
                : controllerManager.disabled(false);
            userlogins.length == 0
                ? userLoginManager.disabled(true)
                : userLoginManager.disabled(false);
        }
        userLoginManager.removeErrCls();
        controllerManager.removeErrCls();
    },
};

export const userLoginManager = {
    _data: null,
    set data(data) {
        this._data = data;
    },
    get select() {
        return $("#userID");
    },
    get selected() {
        return this.select.find("option:selected");
    },
    get value() {
        return this.select.val();
    },
    get text() {
        return this.select.find("option:selected").text().trim();
    },
    get data() {
        return this._data;
    },
    empty() {
        clearSelect2("#userID");
    },
    removeErrCls() {
        removeClassError(this.select);
    },
    async setSelect(data) {
        if (!this.data && data && data.length > 0) {
            this.data = data;
        }
        const avataData = filterEmpno(data);
        const mapData = data.map((d) => ({
            value: d.EMPNO.trim(),
            text: d.USER_LOGIN.trim(),
        }));

        await setSelect2({
            element: "#userID",
            disableSearch: true,
            destroy: true,
            data: mapData,
            avatar: true,
            avatarData: avataData,
        });
    },
    disabled(isDisabled) {
        this.select.prop("disabled", isDisabled);
    },
};

export const controllerManager = {
    _data: null,
    set data(data) {
        this._data = data;
    },
    get select() {
        return $("#controller");
    },
    get container() {
        return $("#controller-container");
    },
    get selected() {
        return this.select.find("option:selected");
    },
    get value() {
        return this.select.val();
    },
    get text() {
        return this.select.find("option:selected").text().trim();
    },
    get data() {
        return this._data;
    },
    empty() {
        clearSelect2("#controller");
    },
    removeErrCls() {
        removeClassError(this.select);
    },
    async setSelect(data) {
        if (!this.data && data && data.length > 0) {
            this.data = data;
        }
        const avataData = filterEmpno(data);
        const mapData = data.map((d) => ({
            value: d.EMPNO.trim(),
            text: d.USER_LOGIN.trim(),
        }));
        await setSelect2({
            element: "#controller",
            disableSearch: true,
            destroy: true,
            data: mapData,
            avatar: true,
            avatarData: avataData,
        });
    },
    show() {
        this.container.removeClass("hidden");
        this.select.addClass("req");
    },
    hide() {
        this.container.addClass("hidden");
        this.select.removeClass("req");
    },
    disabled(isDisabled) {
        this.select.prop("disabled", isDisabled);
    },
};

export function filterEmpno(data) {
    return data
        .filter((c) => c.EMPNO && c.EMPNO.trim() != "")
        .map((c) => c.EMPNO.trim());
}

const workContentManager = {
    get textarea() {
        return $("#workCon");
    },
    get value() {
        return this.textarea.val();
    },
    set value(val) {
        this.textarea.val(val);
    },
};

const reasonManager = {
    get textarea() {
        return $("#reason");
    },
    get value() {
        return this.textarea.val();
    },
    set value(val) {
        this.textarea.val(val);
    },
};

export const workCompleteManager = {
    get container() {
        return $("#complete-container");
    },
    get inputDate() {
        return $("#compDate");
    },
    get inputTime() {
        return $("#compTime");
    },
    get valueDate() {
        return this.inputDate.val();
    },
    set valueDate(val) {
        this.inputDate.val(val);
    },
    get date(){
        return new Date(this.valueDate+ "00:00:00");
    },
    get valueTime() {
        return this.inputTime.val();
    },
    set valueTime(val) {
        this.inputTime.val(val);
    },
    init(cextdata, data) {
        let compDate = "";
        let compTime = "";
        if (cextdata == "03") {
            compDate = `<input type="text" class="input fdate w-full validator req" name="compDate" id="compDate" placeholder="e.g. 03-04-2025" required />`;
            compTime = `<input type="text" class="input w-full validator req" name="compTime" id="compTime" placeholder="e.g. 08:00" required />`;
        }
        if (data.TID_COMP_DATE) {
            compDate = formatDate(data.TID_COMP_DATE);
            compTime = data.TID_COMP_TIME ?? "-";
        }

        if (cextdata == "03" || data.TID_COMP_DATE || data.TID_COMP_TIME) {
            let html = `<div class="divider"></div>
            <fieldset class="fieldset w-full md:w-fit bg-base-200 border border-base-300 p-4 rounded-box">
                <legend class="fieldset-legend text-lg">Production Environment ID work completion report</legend>
                <label class="fieldset-label">Completed date</label>
                ${compDate}

                <fieldset class="fieldset w-full">
                    <label class="fieldset-label">Completed time</label>
                    ${compTime}
                </fieldset>
            </fieldset>`;
            this.container.html(html);
            setDatePicker();
            setDatePicker({ element: "#compTime", time: true });
        }
    },
    change(date, time) {
        try {
            const data = state.formData;
            if (!data) throw new Error("Form data not found");
            checkDiffDate(data.TID_REQ_DATE, date);
            checkRangeTime(data.TID_TIMESTART, data.TID_TIMEEND, time);
        } catch (error) {
            console.error(error);
            showErrorMessage(error);
        }
    },
};

const disableCompleteManager = {
    get container() {
        return $("#disable-container");
    },
    get inputDate() {
        return $("#disDate");
    },
    get inputTime() {
        return $("#disTime");
    },
    get value() {
        return this.inputDate.val();
    },
    set value(val) {
        this.inputDate.val(val);
    },
    get date() {
        return new Date(this.valueDate + "00:00:00");
    },
    get valueTime() {
        return this.inputTime.val();
    },
    set valueTime(val) {
        this.inputTime.val(val);
    },
    init(cextdata, data) {
        if (
            cextdata == "05" ||
            data.TID_DISABLE_DATE ||
            data.TID_DISABLE_TIME
        ) {
            ` <label class="fieldset-label">Disabled date</label>
                {{ convdate($data['TID_DISABLE_DATE'])}}
                <fieldset class="fieldset w-full">
                    <label class="fieldset-label">Disabled time</label>
                    {{$data['TID_DISABLE_TIME']}}
                </fieldset>`;

            const html = `<div class="divider"></div>
                <fieldset class="fieldset w-full md:w-fit bg-base-200 border border-base-300 p-4 rounded-box">
                    <legend class="fieldset-legend text-lg">Production Environment disable completion report</legend>
                    ${
                        cextdata == "05"
                            ? `
                        <p class="label">The requested ID has been disabled.</p>
                        <label class="input">
                            at
                            <input type="text" class="grow validator req" name="disTime" id="disTime" placeholder="e.g. 08:00" required />
                        </label>
                        <label class="input">
                            on
                            <input type="text" class="grow fdate w-full validator req" name="disDate" id="disDate" placeholder="e.g. 03-04-2025" required />
                        </label>
                    `
                            : `
                        <label class="fieldset-label">Disabled date</label>
                        <span>${
                            data.TID_DISABLE_DATE
                                ? formatDate(data.TID_DISABLE_DATE)
                                : "-"
                        }</span>
                        <fieldset class="fieldset w-full">
                            <label class="fieldset-label">Disabled time</label>
                            ${data.TID_DISABLE_TIME ?? "-"}
                        </fieldset>
                    `
                    }
                    
                </fieldset>`;
            this.container.html(html);
            setDatePicker();
            setDatePicker({ element: "#disTime", time: true });
        }
    }
};

/**
 * Check if the date is the same as the request date 
 * @author Sutthipong Tangmonkhoncharoen(24008)
 * @since 2026-04-08
 * @param {string} reqDate
 * @param {string} compDate
 * @returns {boolean}
 * @example 
 * checkDiffDate("2025-04-03", "2025-04-03") // true
 * checkDiffDate("2025-04-03", "2025-04-04") // false
 */
function checkDiffDate(reqDate, compDate) {
    const date1 = parseTimestamp(Number(formatDate(reqDate, "YYYYMMDD")));
    const date2 = parseTimestamp(Number(formatDate(compDate, "YYYYMMDD")));
    // console.log(reqDate, compDate);
    // console.log('is same day', isSameDay(reqDate, compDate));
    return isSameDay(date1, date2);
}

/**
 * Check if the time is in range of start and end time
 * @author Sutthipong Tangmonkhoncharoen(24008)
 * @since 2026-04-08
 * @param {string} start 
 * @param {string} end 
 * @param {string} comp 
 * @returns {boolean}
 * @example
 * checkRangeTime("08:00", "17:00", "12:00") // true
 * checkRangeTime("08:00", "17:00", "07:00") // false
 * checkRangeTime("08:00", "17:00", "18:00") // false
 */
function checkRangeTime(start, end, comp) {
    // console.log(start, end, comp);
    // console.log("check range time", comp >= start && comp <= end);
    return comp >= start && comp <= end;
}

export const actionForm = {
    get remark() {
        return $("#remark");
    },
    get container() {
        return $(".form-action-container");
    },
    disable(isDisabled) {
        if (isDisabled) {
            this.container.find("button").addClass("btn-disabled");
        } else {
            this.container.find("button").removeClass("btn-disabled");
        }
    },
    init(mode, flow) {
        switch (mode) {
            case "1":
                this.container.html(webflowSubmit({ request: true }));
                break;
            case "2":
                this.container.html(
                    webflowSubmit({
                        approve: true,
                        reject: true,
                        flow: true,
                        flowhtml: flow,
                    }),
                );
                break;
            case "3":
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
    async requestForm() {
        try {
            showLoader();
            const data = state.data;
            if (data.REQNO.length == 0) {
                showMessage(
                    "Please add at least 1 request number (กรุณาเพิ่มเลขที่คำร้องอย่างน้อย 1 เลขที่)",
                    "warning",
                );
                return;
            }

            //prettier-ignore
            if (!(await requiredForm("#form", [
                { element: reqByManager.input, message: "Please enter requester employee number (กรุณากรอกเลขพนักงานผู้ร้องขอ)" },
                { element: $("#reqDate"), message: "Please enter request date (กรุณากรอกวันที่คำร้อง)" },
                { element: $("#pStart"), message: "Please enter start date (กรุณากรอกวันที่เริ่มต้น)" },
                { element: $("#pEnd"), message: "Please enter end date (กรุณากรอกวันที่สิ้นสุด)" },
                { element: serverNameManager.select, message: "Please select server name (กรุณาเลือกชื่อเซิร์ฟเวอร์)" },
                { element: userLoginManager.select, message: "Please select user login (กรุณาเลือกผู้ใช้งาน)" },
                { element: controllerManager.select, message: "Please select controller (กรุณาเลือกผู้ควบคุม)" },
                { element: workContentManager.textarea, message: "Please enter work content (กรุณากรอกเนื้อหางาน)" },
            ]))) return;
            const preData = {
                NFRMNO: data.NFRMNO,
                VORGNO: data.VORGNO,
                CYEAR: data.CYEAR,
                REQBY: data.REQBY,
                INPUTBY: data.INPUTBY,
                REMARK: this.remark.val(),
                FORMTYPE: data.FORMTYPE,
                CHANGEDATA: data.CHANGE_DATA,
                USERDATA: {
                    TID_REQUESTER: data.REQBY,
                    TID_REQNO: data.REQNO,
                    TID_REQ_DATE: reqDateManager.date,
                    TID_TIMESTART: timeStartManager.value,
                    TID_TIMEEND: timeEndManager.value,
                    TID_SERVERNAME: serverNameManager.value,
                    TID_USERLOGIN: userLoginManager.text,
                    TID_WORKCONTENT: workContentManager.value,
                    TID_CHANGEDATA: data.CHANGE_DATA,
                    TID_FORMTYPE: data.FORMTYPE,
                    TID_LATE: data.LATE,
                },
            };
            if (controllerManager.value) {
                preData.USERDATA.TID_CONTROLLER = controllerManager.text;
            }
            if (reasonManager.value) {
                preData.USERDATA.TID_REASON = reasonManager.value;
            }
            if (data.FORMTYPE == 2) {
                preData.CONTROLLERDATA = {
                    TID_REQUESTER: controllerManager.value,
                    TID_REQ_DATE: reqDateManager.date,
                    TID_TIMESTART: timeStartManager.value,
                    TID_TIMEEND: addMinutesToTime(timeEndManager.value, 30),
                    TID_SERVERNAME: serverNameManager.value,
                    TID_USERLOGIN: controllerManager.text,
                    TID_WORKCONTENT: `Enable and disable for user : ${userLoginManager.text}`,
                    TID_CHANGEDATA: data.CHANGE_DATA,
                    TID_FORMTYPE: data.FORMTYPE,
                    TID_LATE: data.LATE,
                };
            }
            const res = await createTid(preData);

            if (res.status) {
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
    async approveForm(action) {
        try {
            showLoader();
            const cextData = state.FormInfo.CEXTDATA;
            const data = state.data;
            const formData = {
                NFRMNO: data.NFRMNO,
                VORGNO: data.VORGNO,
                CYEAR: data.CYEAR,
                CYEAR2: data.CYEAR2,
                NRUNNO: data.NRUNNO,
                ACTION: action,
                EMPNO: data.EMPNO,
                REMARK: this.remark.val(),
            };
            if (action == "approve" && (cextData == "03" || cextData == "05")) {
                if (!(await requiredForm("#form"))) return;
                switch (cextData) {
                    case "03":
                        formData.data = {
                            TID_COMP_DATE: workCompleteManager.date,
                            TID_COMP_TIME: workCompleteManager.valueTime,
                        };
                        break;
                    case "05":
                        formData.data = {
                            TID_DISABLE_DATE: disableCompleteManager.date,
                            TID_DISABLE_TIME: disableCompleteManager.valueTime,
                        };
                        break;
                }
            }
            const res = await actionTid(formData);
            if (res.status == true) {
                showMessage(`${action}!`, "success");
                redirectWebflow();
            } else {
                throw new Error("ไม่สามารถ Approve ได้");
            }
        } catch (e) {
            console.error(e);
            showErrorMessage(e);
        } finally {
            showLoader({ show: false });
        }
    },
};
