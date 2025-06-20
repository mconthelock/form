/**
 * Flatpickr Date Picker
 * @description This file is used to manage the flatpickr date picker functionality.
 * @module _flatpickr
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @since  2025-05-01
 * @note This file includes functions to handle date.
 * @requires jQuery npm install jquery
 * @requires flatpickr npm i flatpickr --save
 * @requires dayjs npm install dayjs
 * @requires flatpickr/dist/flatpickr.min.css
 * @version 1.0.1
 */

import "flatpickr/dist/flatpickr.min.css";

//JS Loader
import flatpickr    from "flatpickr";
import dayjs        from 'dayjs';
import { btnClass, fieldClass, fieldset, inputClass } from "./component/form";

/**
 * @param {string} id e.g. date
 * @param {string} name e.g. date
 * @param {string} class e.g. btn btn-sm
 */
export const fpkElementOpt = {
    id : '',
    name : '',
    class : '',
    label : '',
    placeholder : 'Select Date'
}
/**
 * @param {string} id e.g. date
 * @param {string} name e.g. date
 * @param {string} label e.g. Start Date
 * @param {string} placeholder e.g. Select Date
 * @param {boolean} join e.g. true or false
 * @param {string} inputClass e.g. input-sm
 * @param {string} btnClass e.g. btn-sm
 * @param {string} feildClass e.g. form-control w-full max-w-xs
 */
export const fpkFieldsetOpt = {
    id : '',
    name : '',
    label : '',
    placeholder : 'Select Date',
    join: true,
    inputClass: inputClass,
    btnClass: btnClass,
    fieldClass: fieldClass,
}

$(document).on('click', '.fpk-clear', function(){
    const target = $(this).data('target');
    if(target){
        const instance = $(`#${target}`)[0]._flatpickr;
        // console.log(target, instance);
        instance.clear();
    }
});
$(document).on('click', '.fpk-toggle', function(){
    const target = $(this).data('target');
    if(target){
        const instance = $(`#${target}`)[0]._flatpickr;
        // console.log(target, instance);
        instance.toggle();
    }
});

/**
 * button clear flatpickr
 * @param {object} option 
 * @returns {string} HTML string for the clear button
 * @description Create a clear button for flatpickr input field.
 * @example
 * const clearButtonHTML = fpkClear({id:'date', class:'btn btn-sm'});
 * // <a class="join-item btn btn-sm fpk-clear" title="clear" data-target="date"></a>
 */
export const fpkClear = (option = {}) => {
    const opt = {...fpkElementOpt, ...option};
    const cls = opt.class == '' ? btnClass : opt.class;
    return `<a class="join-item ${cls} fpk-clear" title="clear" data-target="${opt.id}">
                <i class="icofont-ui-close"></i>
            </a>`
}

/**
 * button toggle flatpickr
 * @param {object} option 
 * @returns {string} HTML string for the toggle button
 * @description Create a toggle button for flatpickr input field.
 * @example
 * const toggleButtonHTML = fpkToggle({id:'date', class:'btn btn-sm'});
 * // <a class="join-item btn btn-sm fpk-toggle" title="toggle" data-target="date"></a>
 */
export const fpkToggle = (option = {}) => {
    const opt = {...fpkElementOpt, ...option};
    const cls = opt.class == '' ? btnClass : opt.class;
    return `<a class="join-item ${cls} fpk-toggle" title="toggle" data-target="${opt.id}">
                <i class="icofont-ui-calendar"></i>
            </a>`;
}

/**
 * input flatpickr
 * @param {object} option 
 * @returns {string} HTML string for the input element
 * @description Create a input element for flatpickr.
 * @example
 * const inputHTML = fpkInput({id:'sdate', placeholder:'Select Date', class:'input-sm');
 * // <input type="text" placeholder="Select Date" class="fdate w-full join-item input input-sm" id="sdate">
 */
export const fpkInput = (option = {}) => {
    const opt = {...fpkElementOpt, ...option};
    const cls = opt.class == '' ? inputClass : opt.class;
    return `<input type="text" placeholder="${opt.placeholder}" class="fdate w-full join-item ${cls}" id="${opt.id}" name="${opt.name}"> `
}

/**
 * Set up the flatpickr input field
 * @param {object} option 
 * @returns 
 * @example
 * const fieldsetHTML = fpkFieldset({id:'sdate', name:'sdate', label:'Start Date', placeholder:'Select Date', join:true, inputClass:'input-sm', btnClass'btn-sm',             
 *                                  feildClass:'form-control w-full max-w-xs'});
 * // <div class="form-control form-control-sm w-full max-w-xs">
 * //     <div class="label">
 * //         <span class="label-text">Start Date</span>
 * //     </div>
 * //     <div class="flatpickr join">
 * //         <input type="text" placeholder="Select Date" class="fdate w-full join-item input input-sm" id="sdate">
 * //         <a class="join-item btn btn-sm fpk-toggle" title="toggle" data-target="sdate">
 * //             <i class="icofont-ui-calendar"></i>
 * //         </a>
 * //         <a class="join-item btn btn-sm fpk-clear" title="clear" data-target="sdate">
 * //             <i class="icofont-ui-close"></i>
 * //         </a>
 * //     </div>
 * // </div>
 */
export const fpkFieldset = (option = {}) => {
    const opt = inputAttrs({...fpkFieldsetOpt, ...option});
    const flatpickr = `<div class="flatpickr ${opt.join}">
                            ${fpkInput({id:opt.id, name:opt.name, placeholder:opt.placeholder, class:opt.inputClass})}
                            ${fpkToggle({id:opt.id, class:opt.btnClass})}
                            ${fpkClear({id:opt.id, class:opt.btnClass})}
                        </div>`
    return fieldset({element:flatpickr, label:opt.label, class:opt.fieldClass});
}


function inputAttrs(opt = {}) {
    opt.join =  opt.join ? 'join' : '';
    return opt;
}


export const fpkTimeOpt = {
    enableTime: true,
    noCalendar: true, // ไม่เอาวัน เอาแต่เวลา
    dateFormat: "H:i", // รูปแบบเวลา (เช่น 13:45)
    time_24hr: true    // ใช้เวลา 24 ชั่วโมง
};

export const fpkOpt = {
    dateFormat: "Y-m-d",
    // allowInput: true,
    // disableMobile: true,
    // disable: storedDayOffs.value,  // disble วันหยุด
}

// flatpickr เป็น readonly อยู่แล้วที่ใส่เพิ่ม เพื่อสามารถ required ใน input ได้นั่นได้ หากไม่ใส่จะข้ามไปถึงแม้จะใส่ก็ตาม
export const fpkReadonly = {
    onReady: function(selectedDates, dateStr, instance) {
         // 1) ปิดคีย์บอร์ดเสมือนบนมือถือ (iOS/Android ใหม่ ๆ รองรับ)
        instance._input.setAttribute('inputmode', 'none');
        // 2) บล็อกทุกช่องทางพิมพ์
        ['beforeinput','keydown','keypress','keyup',
        'input','textInput','paste','drop',
        'compositionstart','compositionupdate','compositionend']
        .forEach(ev => {
        instance._input.addEventListener(ev, e => {
            e.preventDefault();
            // ถ้า event บางตัวเล็ดลอด เผื่อ reset ค่า
            if (ev === 'input') e.target.value = instance.input.value;
        });
        });
        // 3) ซ่อน caret ให้คนไม่งง (CSS)
        instance._input.style.caretColor = 'transparent';
        instance._input.removeAttribute('readonly');
         // แต่กันพิมพ์ด้วย event
        instance._input.addEventListener('keydown', function (e) {
            e.preventDefault();
        });
        instance._input.addEventListener('paste', function (e) {
            e.preventDefault();
        });
    },
}

export const dayOff = JSON.parse(localStorage.getItem("dayoff")) || [];

export const fpkDayOff = (storedDayOffs = dayOff) => {
    return {
        onDayCreate: function (dObj, dStr, fp, dayElem) {
            try {
                const dateStr = dayElem.dateObj.toLocaleDateString().split("T")[0]; // แปลงวันที่เป้นสตริง
                
                const dd = dayjs(dateStr).format("YYYY-M-D"); // แปลงสตริงเป็น fomat วันที่ ที่ต้องการ\

                if (storedDayOffs.value.includes(dd)) {
                dayElem.classList.add("day-offs"); // เพิ่มคลาส
                }
            } catch (error) {
                console.error("Error in onDayCreate:", error);
            }
        },
    }
}
/**
 * Set day off in .fdate
 * @param {object} options 
 * @param {string or object} e string id e.g. #date or element e.g. $('#date') or Class e.g. .fdate
 * @returns 
 */
export const setDatePicker = (options = {...fpkOpt, ...fpkDayOff()}, e = '') => {
    const element = e == '' ? '.fdate' : e;
    const instance = flatpickr(element, {
        ...options,
    });
    return instance;
};

