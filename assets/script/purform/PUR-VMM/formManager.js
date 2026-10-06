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
                clear: true,
                width: '60%',
                emptyValue: true,
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

export const secManager = {
    list: ['SECTION'],
    get select() {
        return $('.sec');
    },
    set text(val) {
        $('.sec').text(val);
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
                placeholder: '-- Select --',
                search: true,
                clear: true,
                emptyValue: true,
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

export const deptManager = {
    list: ['DEPARTMENT'],
    get select() {
        return $('.dept');
    },
    set text(val) {
        $('.dept').text(val);
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
                placeholder: '-- Select --',
                search: true,
                clear: true,
                emptyValue: true,
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

export const divManager = {
    list: ['DIVISION'],
    get select() {
        return $('.div');
    },
    set text(val) {
        $('.div').text(val);
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
                placeholder: '-- Select --',
                search: true,
                clear: true,
                emptyValue: true,
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
