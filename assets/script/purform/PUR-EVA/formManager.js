import select2 from 'select2';
import { setSelect2 } from '@amec/webasset/select2';
select2();
export const currencyManager = {
    list: ['stdcur'],
    get select() {
        return $('.currency');
    },
    set text(val) {
        $('.currency').text(val);
    },
    set value(val) {
        this.list.forEach((id) => {
            $(`#${id}`).val(val).trigger('change');
        });
    },
    getValue(id) {
        return $(`#${id}`).val();
    },
    /**
     * Initialize select2 for currency fields
     * @param {{value: string, text: string}[]} data
     */
    async init(data) {
        for (const id of this.list) {
            await setSelect2({
                id: id,
                data: data,
                size: 'sm',
                placeholder: 'Select currency',
                search: false,
                clear: false,
                emptyValue: false,
            });
        }
    },
    /**
     * Sync value to other select2 element
     * @param {string} value
     * @param {HTMLElement} element
     */
    syncValue(value, element) {
        for (const id of this.list) {
            if (!$('#' + id).is(element)) {
                $('#' + id)
                    .val(value.toUpperCase())
                    .trigger('change');
            }
        }
    },
};
