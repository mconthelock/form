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
 */

import select2      from "select2";
import "select2/dist/css/select2.min.css";
import { RequiredElement } from "./jFuntion";

export const s2disableSearch = {minimumResultsForSearch: Infinity};

export const s2opt = {
    allowClear: true,
    width: 'resolve'
}

/**
 * Format option for select2
 * @param {object} val templateResult: formatUser
 * @returns 
 * @note เป็น object ที่ใช้ใน select2 templateResult
 */
export const formatUser = (val) => {
    // หากจะใช้ tooltip ให้ $('body').append(customTooltip); ก่อนเริ่มใช้งาน
    if (!val.id || val.id == "Select Releaser") return val.text;
    const imgSrc = $(val.element).data("img"); // ดึง data-img
    const html = $(val.element).data("html"); // ดึง data-name
    const tooltip = html ? 'tooltip' : '';
    
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
    const imgSrc = $(val.element).data("img") || `${process.env.APP_IMG}/Avatar.png`; // ดึง data-img
    const hidden = imgSrc ? '' : 'hidden'; // ถ้าไม่มีรูปให้ซ่อน
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
 * @param {object} options e.g. {allowClear: true, width: 'resolve'}
 * @description Create a select2 element with options from data array.
 * @example
 * const selectHTML = setSelect2({...s2disableSearch, element: '.select', data: [{value: '1', text: 'Option 1'}, {value: '2', text: 'Option 2'}]});
 */
export async function setSelect2(options = {}) {
    const opt = {element: '', placeholder: '' , data:'',...options};
    let { element, placeholder, data,...customOpt} = opt; // เอา object ออกเหลือแต่ opject ของ select2
    // console.log(opt);
    
    element = opt.element == '' ? '.s2' : opt.element;
    if( opt.data != '' ){
        await setOption(element, opt.data);
    }

    $(element).select2({
        ...s2opt,
        ...customOpt,
        placeholder : opt.placeholder == '' ? $(element).attr('placeholder') : opt.placeholder,
    });
    $(element).on('select2:close', function (){
        $('#custom-tooltip').addClass('hidden');
    })
}

/**
 * Set options for select2 element
 * @param {string} element 
 * @param {array} data [{value: '1', text: 'Option 1'}, {value: '2', text: 'Option 2'}]
 */
async function setOption(element, data){
    // console.log(data);
    const option = data.map((item) => {
        return `<option value="${item.value}">${item.text}</option>`
    }).join('');
    $(element).append(`<option value=""></option>${option}`);
}

/**
 * Destroy select2 element
 * @param {string} e e.g. '.s2' or '#select2'
 */
export async function destroySelect2(e = '') {
    const element = e == '' ? '.s2' : e;
    if ($(element).hasClass('select2-hidden-accessible') && $(element).is('select')) {
        $(element).select2('destroy');
        // $(element).next('.select2').remove();
    }
}

 /**
 * Required select2
 */
export var flagSelect = false;
$(document).on('change focusout', 'select.req', async function(){
    // console.log(flagSelect);
    if (flagSelect) {
        // หาก trigger มาจากโปรแกรม ไม่ต้องทำอะไร
        flagSelect = false;
        return;
    }
    RequiredElement($(this));
});

$(document).on('select2:close', function (e) {
    // console.log(2, $(e.target));
    RequiredElement($(e.target));
});

// $(document).on('select2:open', function (e){
//     // checkAvatar();
// });




