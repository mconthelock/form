/**
 * Manage Select2
 * @module _select2
 * @description This file is used to manage select2 functionality.
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @since  2025-05-01
 * @requires jQuery npm install jquery
 * @requires jFuntion
 * @requires select2 npm install --save @fancyapps/ui
 * @version 1.0.2
 * @note 2025-06-19 เปลี่ยนไปใช้เป็น object ในการ set option ของ select2
 * @note 2025-06-19 เพิ่ม option ให้โดยส่ง data มาใน object โดย [{value: '1', text: 'Option 1'}, {value: '2', text: 'Option 2'}]
 * @note 2025-07-09
 *  เพิ่ม avatar สำหรับการแสดงรูปภาพใน select2 โดย ส่ง avatar: true และ avatarData: [24008, 24009, 24010]
 * @note 2025-07-14
 *  เพิ่ม function clearSelect2 เพื่อเคลียร์ค่า select2
 * @version 1.0.3
 * @note 2025-10-29
 *  เพิ่ม function setSelect2Data เพื่อเพิ่ม option ให้ select2 จาก data array แต่แบบนี้มันจะรี select2 ทำให้อันที่สร้างมาก่อนค่าจะหาย ใช้แบบเดิม setSelect2 ก็ได้ส่งมาอีกรอบมันสร้างสร้างใหม่ได้
 *  แก้ setOption ให้ล้างค่าเดิมก่อนเพิ่ม option ใหม่
 */

import select2 from "select2";
import "select2/dist/css/select2.min.css";
import { RequiredElement } from "./jFuntion";
import { setAvatarSelect } from "./setIndexDB";

export const s2disableSearch = { minimumResultsForSearch: Infinity };

export const s2opt = {
    allowClear: true,
    width: "resolve",
};

/**
 * Format option for select2
 * @param {object} val templateResult: formatUser
 * @returns
 * @note เป็น object ที่ใช้ใน select2 templateResult
 */
export const formatUser = (val) => {
    // หากจะใช้ tooltip ให้ $('body').append(customTooltip); ก่อนเริ่มใช้งาน
    if (!val.id || val.id == "Select Releaser") return val.text;
    const imgSrc =
        $(val.element).data("img") || `${process.env.APP_IMG}/Avatar.png`; // ดึง data-img
    const html = $(val.element).data("html"); // ดึง data-name
    const tooltip = html ? "tooltip" : "";

    return $(
        `<div class="flex gap-3 items-center">
            <div class="avatar ${tooltip}" data-html="${html}">
                <div class="w-8 rounded-full"><img src="${imgSrc}" /></div>
            </div>
            <div>${val.text}</div>
        </div>`
    );
};

/**
 * Format option for select2 เพิ่มรูป avatar
 * @param {object} val templateResult: formatAvatar, , templateSelection: formatAvatar
 * @returns
 * @note เป็น object ที่ใช้ใน select2 templateResult
 */
export const formatAvatar = (val) => {
    // console.log($(val.element).data());

    const imgSrc =
        $(val.element).data("img") || `${process.env.APP_IMG}/Avatar.png`; // ดึง data-img
    const hidden = imgSrc ? "" : "hidden"; // ถ้าไม่มีรูปให้ซ่อน
    return $(
        `<div class="flex gap-3 items-center">
            <div class="avatar">
                <div class="w-8 rounded-full border">
                    <img src="${imgSrc}" class="avatar-${val.id} ${hidden}" />
                    <div class="skeleton h-32 w-32"></div>
                </div>
            </div>
            <div class="overflow-hidden text-ellipsis">${val.text}</div>
        </div>`
    );
};

// ไม่รองรับ async เพราะฉนั้นไม่สามารถใช้ await ได้ใน select2 *****
// /**
//  * Format option for select2 เพิ่มรูป avatar
//  * @param {object} val templateResult: formatAvatar, , templateSelection: formatAvatar
//  * @returns
//  * @note เป็น object ที่ใช้ใน select2 templateResult
//  */
// export const formatAvatarIndexdb = async (val) => {
//     const empImage = await getAllImage();
//     let image = empImage.find(img => img.id == val.id);
//     if(!image){
//         image =  await displayEmpImage(val.id);
//     }else{
//         image = image.image; // ดึงเฉพาะ image
//     }

//     const imgSrc = image || `${process.env.APP_IMG}/Avatar.png`; // ดึง data-img
//     console.log(imgSrc);

//     const hidden = imgSrc ? '' : 'hidden'; // ถ้าไม่มีรูปให้ซ่อน
//     return $(
//       `<div class="flex gap-3 items-center">
//             <div class="avatar">
//                 <div class="w-8 rounded-full">
//                     <img src="${imgSrc}" class="avatar-${val.id} ${hidden}" />
//                     <div class="skeleton h-32 w-32"></div>
//                 </div>
//             </div>
//             <div>${val.text}</div>
//         </div>`
//     );
// };

/**
 * set select2
 * @param {Select2Options} params
 *
 * @typedef {Object} Select2Options
 * @property {string} [element=".s2"] - The selector for the select element (e.g., '.s2' or '#select2'). default is '.s2'.
 * @property {string} [id=""] - The ID of the select element (e.g., 'select2').
 * @property {string} [size="base"] - The size of the select2 element ('xs', 'sm', 'base', 'lg', 'xl').
 * @property {string} [placeholder=""] - The placeholder text for the select2 element.
 * @property {data[]} [data=[]] - An array of option objects for the select2 element
 * @property {boolean} [avatar=false] - Whether to display avatars in the select2 options.
 * @property {Array} [avatarData=[]] - An array of IDs for fetching avatar images. e.g., [24008, 24009, 24010].
 * @property {boolean} [disableSearch=false] - Whether to disable the search functionality in the select2 dropdown.
 * @param {...any} [options] - ตัวเลือกเสริมของ select2 (allowClear, width, dropdownParent ฯลฯ)
 *
 * @typedef {Object} data
 * @property {string} value - The value of the option. e.g., '1'.
 * @property {string} text - The display text of the option. e.g., 'Option 1'.
 *
 * @returns {Promise<jQuery<HTMLElement>>}
 *
 * @example
 * const select2 = await setSelect2({
 *      element: '#userSelect', // default '.s2' (optional)
 *      placeholder: 'Select user', // default is element's placeholder attribute (optional)
 *      data: [{ value: '1', text: 'Alice' }, { value: '2', text: 'Bob' }], // ส่ง option data (optional)
 *      size: 'sm', // default 'base' (optional)  'xs' || 'sm' || 'base' || 'lg' || 'xl'
 *      avatar: true, // default false แสดงรูป avatar (optional)
 *      avatarData: [24008, 24009, 24010], // ส่ง id ของพนักงานเพื่อดึงรูป avatar (optional)
 *      disableSearch: true, // default false ปิดการค้นหา (optional)
 *      allowClear: true,
 *      width: 'resolve',
 * });
 */
// selectionCssClass: 'w-full' เพิ่ม class ให้กับ select2
export async function setSelect2({
    element = ".s2",
    id = "",
    size = "base",
    placeholder = "",
    data = [],
    avatar = false,
    avatarData = [],
    disableSearch = false,
    ...options
} = {}) {
    element = id != "" ? (id.startsWith(`#`) ? id : `#${id}`) : element;

    // set size
    let selectClassSize = "";
    switch (size) {
        case "xs":
            selectClassSize = "select2-xs";
            break;
        case "sm":
            selectClassSize = "select2-sm";
            break;
        case "lg":
            selectClassSize = "select2-lg";
            break;
        case "xl":
            selectClassSize = "select2-xl";
            break;
        default:
            break;
    }

    // set option data
    if (data.length > 0 && Array.isArray(data)) {
        await setOption(element, data);
    }

    // create select2 element
    $(element).select2({
        ...s2opt,
        ...(disableSearch ? s2disableSearch : {}),
        ...(avatar ? { templateSelection: formatAvatar } : {}),
        ...(avatar ? { templateResult: formatAvatar } : {}),
        ...(size != "base" ? { selectionCssClass: selectClassSize } : {}),
        ...options,
        placeholder:
            placeholder == "" ? $(element).attr("placeholder") : placeholder,
    });

    $(element).on("select2:close", function (e) {
        RequiredElement($(e.target));
        $("#custom-tooltip").addClass("hidden");
    });

    $(element).on("select2:open", function (e) {
        switch (size) {
            case "xs":
                $(`.select2-results__options`).addClass("select2-xs");
                break;
            case "sm":
                $(`.select2-results__options`).addClass("select2-sm");
                break;
            case "lg":
                $(`.select2-results__options`).addClass("select2-lg");
                break;
            case "xl":
                $(`.select2-results__options`).addClass("select2-xl");
                break;
            default:
                break;
        }
    });
    // set avatar image if avatar is true
    if (avatar) {
        await setAvatarSelect(avatarData, element);
    }

    return $(element);
}

/**
 * Set options for select2 element
 * @param {string} element '#select'
 * @param {OptionData[]} data 
 * 
 * @typedef {Object} OptionData
 * @property {string} value - The value of the option. e.g., '1'.
 * @property {string} text - The display text of the option. e.g., 'Option 1'.
 * 
 * @returns {Promise<void>}
 * @example
 * const data = [
 *      { value: '1', text: 'Option 1' },
 *      { value: '2', text: 'Option 2' }
 * ];
 * await setOption('#select', data);
 */
async function setOption(element, data) {
    const option = data
        .map((item) => {
            return `<option value="${item.value}">${item.text}</option>`;
        })
        .join("");
    $(element).empty().append(`<option value=""></option>${option}`);
}

/**
 * Set data for select2 element
 *
 * @typedef {Object} Select2Data
 * @property {string} id - The value of the option.
 * @property {string} text - The display text of the option.
 *
 * @param {string | object} element e.g. '#select' || $('#select')
 * @param {Select2Data[]} data
 */
export async function setSelect2Data(element, data) {
    $(element).select2({
        data: data,
    });
}

/**
 * Destroy select2 element
 * @param {string} e e.g. '.s2' or '#select2'
 */
export async function destroySelect2(e = "") {
    const element = e == "" ? ".s2" : e;
    if (
        $(element).hasClass("select2-hidden-accessible") &&
        $(element).is("select")
    ) {
        $(element).select2("destroy");
        // $(element).next('.select2').remove();
    }
}

/**
 * Required select2
 */
export var flagSelect = false;
$(document).on("change focusout", "select.req", async function () {
    // console.log(flagSelect);
    if (flagSelect) {
        // หาก trigger มาจากโปรแกรม ไม่ต้องทำอะไร
        flagSelect = false;
        return;
    }
    RequiredElement($(this));
});

// $(document).on('select2:close', function (e) {
//     // console.log(2, $(e.target));
//     RequiredElement($(e.target));
// });

// $(document).on('select2:open', function (e){
//     // checkAvatar();
// });

/**
 * Clear select2 value
 * @param {string} e e.g. '.s2' or '#select2'
 */
export function clearSelect2(e) {
    $(e).val("").trigger("change");
    $(e).select2("close");
}
