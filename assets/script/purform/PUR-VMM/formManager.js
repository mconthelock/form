import select2 from 'select2';
import { setSelect2 } from '@amec/webasset/select2';
select2();
export const tradeManager = {
    list: ['TRADE_CODE'],
    get select() {
        return $('.tradecode');
    },
    set text(val) {
        $('.tradecode').text(val);
    },
    set value(val) {
        this.list.forEach((id) => {
            $(`#${id}`).val(val).trigger('change');
            $(`#${id}_HIDDEN`).val(val);
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
                placeholder: '----Select----',
                search: true,
                clear: false,
                width: '60%',
                emptyValue: false,
            });
            $(`#${id}`).on('change', function () {
                $(`#${id}_HIDDEN`).val($(this).val());
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
                $(`#${id}_HIDDEN`).val(value.toUpperCase());
            }
        }
    },
};
