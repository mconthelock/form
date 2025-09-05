/**
 * Create a form element
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @since  2025-05-01
 * @version 1.0.2
 * @note 2025-06-19 เพิ่ม attribute สำหรับการกำหนด attribute ของ input, select, radio
 * @note 2025-06-25 เพิ่ม webflowSubmit สำหรับการสร้างปุ่ม submit ใน webflow create, edit, view mode mode 1, 2, 3
 * @note 2025-06-25 เพิ่ม getformDetail สำหรับการดึงข้อมูลฟอร์มมาโชว์เวลา view, edit   mode != 1
 * @note 2025-07-02 เปลี่ยน fieldset ต้อง import css component มาด้วยหากเรียกใช้
 * return = กลับไป requester ไม่ reset
 * returnp = กลับไป requester reset
 * returnb = ย้อนหลัง 1 step
 * @version 1.0.3
 * @note 2025-08-20
 * เปลี่ยน layout getformDetail
 * เปลี่ยนสีปุ่ม return เป็น warning
 * เพิ่มปรับขนาดปุ่ม  webflowSubmit
 */

import { getFormDetail } from "../../../api/webform/form";
import { ajaxOptions, getData, host } from "../jFuntion";

export var btnClass = "btn btn-sm ";
export var inputClass = "input input-bordered input-sm w-full";
export var selectClass = "select select-bordered select-sm ";
export var radioClass = "radio radio-sm ";
export var fieldClass = "w-full max-w-xs";

/**
 * @param {string} id e.g. sdate
 * @param {string} name e.g. sdate
 * @param {string} value e.g. 1
 * @param {array}  data in create select option and set value in radio e.g. [{value: '1', text: 'Reason 1'}, {value: '2', text: 'Reason 2'}]
 * @param {string} class e.g. 'form-control'
 * @param {string} placeholder e.g. 'Select an option'
 * @param {boolean} vertical set vertical on radio e.g. true or false
 * @param {boolean} checked e.g. true or false
 * @param {boolean} disabled e.g. true or false
 * @param {boolean} required e.g. true or false
 * @param {boolean} selected e.g. true or false
 */
export const elementOpt = {
    id: "",
    name: "",
    type: 'text',
    value: "",
    data: [],
    class: "",
    placeholder: "",
    attribute: "",
    vertical: false,
    checked: false,
    disabled: false,
    required: false,
    selected: false,
};

/**
 * @param {string} label e.g. 'Name'
 * @param {string} class e.g. 'form-control'
 * @param {string} element e.g. <input type="text" class="input" />
 */
export const fieldsetOpt = {
    label: "",
    class: fieldClass,
    element: "",
};

/**
 * filedset
 * @description Create a fieldset element with a label and a max width.
 * @param {object} option
 * @returns {string} HTML string for the fieldset element
 * @example
 * const fieldsetHTML = fieldset( 'Name', 'form-control', '<input type="text" class="input" />');
 * // <div class="form-control form-control-sm w-full max-w-xs">
 * //     <div class="label">
 * //         <span class="label-text">Name</span>
 * //     </div>
 * //     <input type="text" class="input" />
 * // </div>
 */
export const fieldset = (option = {}) => {
    const opt = { ...fieldsetOpt, ...option };
    const label =
        opt.label != ""
            ? `<div class="label-text">
                    <span>${opt.label}</span>
                </div>`
            : "";
    return `<div class="field ${opt.class}">
                ${label}
                ${opt.element}
            </div>`;
};

/**
 * Create an input element
 * @param {object} opt
 * @returns {string} HTML string for the input element
 * @example
 * const inputHTML = input({id:'sdate', name:'sdate, placeholder:'Select Date', class:'input-sm');
 * // <input type="text" placeholder="Select Date" class="w-full join-item input input-sm" id="sdate">
 */
export const input = (option = {}) => {
    const opt = inputAttrs({ ...elementOpt, ...option });
    return `<input type="${opt.type}" placeholder="${opt.placeholder}" class="w-full join-item ${opt.class}" id="${opt.id}" name="${opt.name}" value="${opt.value}" ${opt.attribute} ${opt.checked} ${opt.disabled} ${opt.required}> `;
};

/**
 * Create a select element
 * @param {object} option - Options for the select element
 * @returns {string} HTML string for the select element
 * @example
 * const selectHTML = select({id:'reason', data: [{value: '1', text: 'Reason 1'}, {value: '2', text: 'Reason 2'}], placeholder:'Select an option', class:'select select-bordered select-sm');
 * // <select id="reason" name="reason" placeholder="Select an option" class="w-full join-item select select-bordered select-sm">
 * //     <option value=""></option>
 * //     <option value="1">Reason 1</option>
 * //     <option value="2">Reason 2</option>
 * // </select>
 */
export const select = (option = {}) => {
    // console.log('select', option);

    const opt = inputAttrs({ ...elementOpt, ...option });
    // console.log('select opt', opt);

    let options =
        opt.data
            .map((item) => {
                return `<option value="${item.value}">${item.text}</option>`;
            })
            .join("") || "";
    return `<select id="${opt.id}" name="${opt.id}" placeholder="${opt.placeholder}" class="w-full join-item ${opt.class}" ${opt.attribute} ${opt.disabled} ${opt.required}>
                <option value=""></option>
                ${options}
            </select>`;
};

/**
 * Create a radio element
 * @param {object} opt - Options for the radio element
 * @returns {string} HTML string for the radio element
 * @example
 * const radioHTML = radio({
 *      name: 'OFF_REASON_TYPE',
 *      data: [{value: '1', text: 'Option 1'}, {value: '2', text: 'Option 2'}],
 *      vertical: true,
 *      class: 'btn btn-sm'
 * });
 * // <div class="w-fit join my-1 join-vertical">
 * //     <input type="radio" name="OFF_REASON_TYPE" value="1" class="radio w-full join-item btn btn-sm" aria-label="Option 1" />
 * //     <input type="radio" name="OFF_REASON_TYPE" value="2" class="radio w-full join-item btn btn-sm" aria-label="Option 2" />
 * // </div>
 */
export const radio = (option = {}) => {
    const opt = inputAttrs({ ...elementOpt, ...option });
    let radio = opt.data
        .map((item) => {
            return `<input type="radio" name="${opt.name}" value="${item.value}" class="radio w-full join-item ${opt.class}" aria-label="${item.text}" ${opt.attribute} ${opt.checked} ${opt.disabled} ${opt.required}/>`;
        })
        .join("");
    return `<div class="w-full join my-2 ${opt.vertical}">
                ${radio}
            </div>`;
};

/**
 * Create a webflow submit button
 * @param {object} option e.g. {remark: true, request: true}
 * @returns
 */
export const webflowSubmit = (option = {}) => {
    const opt = {
        ...{
            actionsForm: true,
            remark: true,
            request: false,
            approve: false,
            returnb: false,
            returnp: false,
            return: false,
            reject: false,
            flow: false,
            flowhtml: "",
            btnsize: "base",
        },
        ...option,
    };
    let btnSize = "";
    switch (opt.btnsize) {
        case "xs":
            btnSize = "btn-xs";
            break;
        case "sm":
            btnSize = "btn-sm";
            break;
        case "lg":
            btnSize = "btn-lg";
            break;
        case "xl":
            btnSize = "btn-xl";
            break;
        default:
            btnSize = "";
            break;
    }
    return `<div class="card-actions flex-col gap-5 justify-start">
                <div class="actions-Form ${opt.actionsForm ? "" : "hidden"}">
                    <fieldset class="fieldset ${opt.remark ? "" : "hidden"}">
                        <span class="fieldset-label">Remark</span>
                        <textarea class="textarea h-24 w-56" id="remark" ></textarea>
                    </fieldset>
                    <div class="flex gap-3 mt-2">
                        <button type="button" class="btn btn-primary ${
                            opt.request ? "" : "hidden"
                        } ${btnSize}" id="btnRequest">Request</button>
                        <button type="button" class="btn btn-primary ${
                            opt.approve ? "" : "hidden"
                        } ${btnSize}" name="btnAction" value="approve">Approve</button>
                        <button type="button" class="btn btn-error mg-l-12 ${
                            opt.reject ? "" : "hidden"
                        } ${btnSize}" name="btnAction" value="reject">Reject</button>
                        <button type="button" class="btn btn-warning mg-l-12 btnReturn ${
                            opt.return ? "" : "hidden"
                        } ${btnSize}" name="btnAction" value="return">Return</button>
                        <button type="button" class="btn btn-warning mg-l-12 btnReturnb ${
                            opt.returnb ? "" : "hidden"
                        } ${btnSize}" name="btnAction" value="returnb">Return</button>
                        <button type="button" class="btn btn-warning mg-l-12 btnReturnp ${
                            opt.returnp ? "" : "hidden"
                        } ${btnSize}" name="btnAction" value="returnp">Return</button>
                        <button type="button" class="btn btn-neutral mg-l-12" onclick="history.back()">Back</button>
                    </div>
                </div>
            
                <div id="flow" class="w-full mb-5 ${opt.flow ? "" : "hidden"}">
                    ${opt.flow ? opt.flowhtml : ""}
                </div>
            </div>`;
};

/**
 * Get form detail
 * @param {object} form e.g. {
    NFRMNO: NFRMNO,
    VORGNO: VORGNO,
    CYEAR: CYEAR,
    CYEAR2: CYEAR2,
    NRUNNO: NRUNNO,
  }
 * @returns 
 */
export async function getformDetail(form) {
    // const data = await getData({
    //     ...ajaxOptions,
    //     url: `${host}/Authen/getFormDetail`,
    //     data: form,
    // });
    const data = await getFormDetail(form);
    return `<div class="text-xl font-bold mb-5">Form Information</div>
            <div class="h-fit w-fit md:w-fit bg-base-200 border border-base-300 p-4 rounded-box relative">
                <table class="table">
                    <tbody>
                        <tr>
                            <td class="text-primary font-bold">Form no:</td>
                            <td>${data.FORMNO}</td>
                        </tr>
                        <tr>
                            <td class="text-primary font-bold">Input by:</td>
                            <td>${data.VINPUTNAME} (${data.VINPUTER})</td>
                        </tr>
                        <tr>
                            <td class="text-primary font-bold">Requested by:</td>
                            <td>${data.VREQNAME} (${data.VREQNO})</td>
                        </tr>
                    </tbody>
                </table>
            </div>`;
}

function inputAttrs(opt = {}) {
    opt.vertical = opt.vertical ? "join-vertical" : "";
    opt.checked = opt.checked ? "checked" : "";
    opt.disabled = opt.disabled ? "disabled" : "";
    opt.required = opt.required ? "required" : "";
    opt.selected = opt.selected ? "selected" : "";
    return opt;
}
