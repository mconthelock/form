/**
 * Add and remove element fields dynamically in a form.
 * @module addRemoveInput2
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @since  2025-06-20
 * @requires jQuery npm install jquery
 * @version 1.0.1
 */

/**
 * Initialize a new field with a label and an element.
 * @param {object} option 
 * @returns {string} HTML string for the field element
 * @note option = {
 *   label: 'Label text',
 *   element: '<input type="text" class="input" />'
 * }
 */
export const fieldAddInit = (option) => {
    const label = option.label == '' || !option.label ? '' : `<div class="label">
                                                 <span class="label-text">${option.label}</span>
                                             </div>`;
    return `<label class="form-control w-full inputfield-group p-3">
                ${label}
                <div class="flex gap-1 items-center">
                    <div class="flex flex-col flex-1 inputGroup gap-1">
                        ${option.element}
                    </div>
                    <div class="btn btn-sm btn-error tooltip ml-auto remove-inputField" data-tip="Delete"><i class="icofont-ui-delete"></i></div>
                </div>
            </label>`;
}

export const listInit = (option) => {
    return `<li class="list-row w-full listField p-3 flex gap-5 items-center">
            <div class="flex listGroup gap-1">
                ${option.element}
            </div>
            <div class="btn btn-sm btn-error tooltip ml-auto remove-listField" data-tip="Delete"><i class="icofont-ui-delete"></i></div>
    </li>`;
}

$(document).on('click', '.remove-inputField', function(){
    $(this).closest('.inputfield-group').remove();
});

$(document).on('click', '.remove-listField', function(){
    $(this).closest('.listField').remove();
});
