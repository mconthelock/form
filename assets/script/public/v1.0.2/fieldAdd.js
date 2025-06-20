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
    const label = option.label == '' ? '' : `<div class="label">
                                                 <span class="label-text">${option.label}</span>
                                             </div>`;
    return `<label class="form-control w-full">
                ${label}
                <div class="flex gap-1">
                    <div class="flex flex-col flex-1 inputGroup gap-1">
                        ${option.element}
                    </div>
                    <div class="btn btn-danger tooltip" data-tip="ลบรายการ"><i class="icofont-ui-delete"></i></div>
                </div>
            </label>`;
}
