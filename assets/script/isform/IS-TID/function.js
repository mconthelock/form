import { getUser } from "@amec/webasset/api/amec";
import { getRequestNo } from "@amec/webasset/api/webform";
import { showLoader } from "@amec/webasset/preloader";
import { clearSelect2, flagSelect, setSelect2 } from "@amec/webasset/select2";
import {
    getAllAttr,
    logFormData,
    removeClassError,
    requiredForm,
    showErrorMessage,
    showMessage,
} from "@amec/webasset/utils";
import { getController, getServerName, getUserLogin } from "./data";
import { setDatePicker } from "@amec/webasset/flatpickr";
import { webflowSubmit } from "@amec/webasset/components/form";

export const state = {
    _formInfo: null,
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
            SERVERNAME: serverNameManager.value,
            USERLOGIN: userLoginManager.value,
            CONTROLLER: controllerManager.value,
            CHANGE_DATA: changeDataManager.value,
            LATE: lateManager.value,
            FORMTYPE: formTypeManager.value,
            REQNO: reqNoManager.list.join("|"),
        };
    },
};

export const formManager = {
    get form() {
        return $("#form");
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
            console.log(state.data);
        } catch (e) {
            console.error(e);
            showErrorMessage(e);
        } finally {
            showLoader({ show: false });
        }
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
            if (!RegExp(/^[A-Za-z]+-[a-zA-Z0-9]+-[0-9]{6}$/).test(reqNo)) {
                this.value = "";
                showMessage(
                    "Please enter a valid request number, e.g., IS-DEV25-000127 (กรุณากรอกเลขที่คำร้องให้ถูกต้อง เช่น IS-DEV25-000127)",
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

export const actionForm = {
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
            const data = state.data;
            console.log(data);

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
                { element: $('#workCon'), message: "Please enter work content (กรุณากรอกเนื้อหางาน)" },
            ]))) return;

            const formData = new FormData(formManager.form[0]);

            logFormData(formData);
        } catch (error) {}
    },
};
