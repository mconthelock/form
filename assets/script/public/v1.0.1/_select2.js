/**
 * Manage Select2
 * @module _select2
 * @description This file is used to manage select2 functionality.
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @since  2025-05-01
 * @requires jQuery npm install jquery
 * @requires jFuntion
 * @requires select2 npm install --save @fancyapps/ui
 * @version 1.0.1
 */

import select2      from "select2";
import "select2/dist/css/select2.min.css";
import { RequiredElement } from "./jFuntion";

export const s2opt = {
    allowClear: true,
    width: 'resolve'
}

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

export const s2disableSearch = {minimumResultsForSearch: Infinity};

/**
 * set select2
 * @param {object} options e.g. {allowClear: true, width: 'resolve'}
 * @param {string} e  e.g. '#select2'
 * @param {string} placeholder e.g. 'Select' 
 * @description Create a select2 element with options from data array.
 * @example
 * const selectHTML = setSelect2({allowClear: true, width: 'resolve'}, '#select2', 'Select');
 */
export async function setSelect2(options = s2opt, e = '', placeholder = '') {
    
    const element = e == '' ? '.s2' : e;
    // console.log($(element).attr('placeholder'));
    $(element).select2({
        ...options,
        // containerCssClass: 'test',
        placeholder : placeholder == '' ? $(element).attr('placeholder') : placeholder,
    });
    $(element).on('select2:close', function (){
        $('#custom-tooltip').addClass('hidden');
    })
}

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

// $(document).on('change', 'select.req', async function(){
//     RequiredElement($(this));
// });

