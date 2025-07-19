/**
 * Add and remove input fields dynamically in a form.
 * @module addRemoveInput
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @since  2025-06-20
 * @requires jQuery npm install jquery
 * @version 1.0.1
 */

/**
 * Create a fieldset element with a label and an input element.
 * @param {string} inputElement e.g. <div class="relative w-full">
                    <input type="text" class="input txt-upper validator w-full req" name="reqNo[]" id="reqNo[]" data-check="0" placeholder="e.g. IS-DEV25-000127" required pattern="[A-Za-z]+-[a-zA-Z0-9]+-[0-9]{6}$" autocomplete="off"/>
                    <span class="loading loading-spinner text-primary absolute top-1/2 right-16 -translate-y-1/2 hidden"></span>
                    <span class="badge badge-neutral badge-xs absolute top-1/2 right-2 -translate-y-1/2">Enter</span>
                  </div>
 * @param {string} label e.g. Request No.
 * @returns {string} HTML string for the fieldset element
 * @description Create a fieldset element with a label and an input element.
 * @example
 * const fieldsetHTML = fieldAddInput('<input type="text" class="input" />', 'Name');
 * // <label class="form-control w-full">
 * //     <div class="label">
 * //         <span class="label-text">Name</span>
 * //     </div>
 * //     <div class="flex gap-1">
 * //         <div class="flex flex-col flex-1 inputGroup gap-1">
 * //             <input type="text" class="input" />
 * //         </div>
 * //         <div class="flex flex-col justify-end">
 * //             <i class="icofont-minus-square text-5xl hover:text-gray-400 hover:scale-105 remove-keep hidden"></i>
 * //             <i class="icofont-plus-square text-5xl  hover:text-gray-400 hover:scale-105 add-keep"></i>
 * //         </div>
 * //     </div>
 * // </label>
 
 */
export const fieldAddInput = (inputElement, label = '') => {
    const labelElement = label == '' ? '' : `<div class="label">
                                                <span class="label-text">${label}</span>
                                            </div>`;
    return `<label class="form-control w-full">
                ${labelElement}
                <div class="flex gap-1">
                    <div class="flex flex-col flex-1 inputGroup gap-1">
                        ${inputElement}
                    </div>
                    <div class="flex flex-col justify-end">
                        <i class="icofont-minus-square text-5xl hover:text-gray-400 hover:scale-105 remove-keep hidden"></i>
                        <i class="icofont-plus-square text-5xl  hover:text-gray-400 hover:scale-105 add-keep"></i>
                    </div>
                </div>
            </label>`
}


/**
 * Add input
 * @param {object} e 
 * @param {string} html 
 * @param {string} groupSelector
 */
export function addInput(e, html, groupSelector){
    e.closest('div').siblings(groupSelector).append(html);
    e.siblings('i').removeClass('hidden');
    // console.log(e.siblings('i')); 
}

/**
 * Remove input
 * @param {object} e 
 * @param {string} groupSelector
 * @param {string} itemSelector
 */
export function removeInput(e, groupSelector, itemSelector){
    const input = e.closest('div').siblings(groupSelector).find(itemSelector);
    // console.log(input.length);
    if(input.length == 2){
        input.last().remove();
        e.addClass('hidden');
    }else{
        input.last().remove();
    }
}

/**
 * reset multi input
 * @param {string} input e.g. input[name="reqNo[]"]
 * @param {string} button e.g. .remove-input
 */
export async function resetInput(input, button = '.remove-input', clear = false){
    console.log('reset');
    
    $(input).each(function() {
        console.log('val',$(this).val().trim());
        console.log('length',$(input).length);
        
        if(clear){
            if ($(this).val().trim() === "" && $(input).length > 1) $(this).remove();
        }else{
            if ($(input).length > 1) $(this).remove();
        }
    });

    const updateInput = $(input)

    if(button != '' && updateInput.length == 1) $(button).addClass('hidden');
}

/**
 * set input on select list
 * @param {string} input e.g. input[name="reqNo[]"]
 * @param {string} button e.g. .add-input
 * @param {string} data e.g. Water Water Treatment | aaa | xxx
 */
export function setInput(input, button, data){
    console.log('set');

    console.log(data);
    const arr = data.split('|');
    console.log(arr);
    
    if(arr.length > 1){
        for (let index = 0; index < arr.length-1; index++) {
            $(button).trigger('click');
        }
        $(input).each(function(i, el){
            $(el).val(arr[i]);
        });
    }else{
        $(input).val(data);
    }
}