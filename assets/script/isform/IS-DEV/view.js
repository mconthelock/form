import '@flaticon/flaticon-uicons/css/all/all.css';
import '@amec/webasset/css/select2.min.css';
import dayjs from 'dayjs';
import select2 from 'select2';
import { displayEmpInfo, fillImages } from '@amec/webasset/indexDB';
import { setSelect2 } from '@amec/webasset/select2';
import { setDatePicker } from '@amec/webasset/flatpickr';
import { showMessage, intVal, showDigits } from '@amec/webasset/utils';
import { getFormIsDev } from '../FORM-1/data';

select2();
$(document).ready(async function () {
    await initForm();
});

async function initForm() {
    const data = await getFormIsDev({
        NFRMNO: $('#NFRMNO').val(),
        VORGNO: $('#VORGNO').val(),
        CYEAR: $('#CYEAR').val(),
        CYEAR2: $('#CYEAR2').val(),
        NRUNNO: $('#NRUNNO').val(),
        EMPNO: $('#EMPNO').val(),
    });

    console.log(data);

    const res = {
        ...data[0],
        OBJECTIVE_TXT:
            data[0].OBJECTIVE == '8'
                ? `${data[0].objective.OBJ_NAME}: ${data[0].OBJECTIVE_OTHER}`
                : data[0].objective.OBJ_NAME,
    };

    const element = $('#form-data').find('.map-data');
    for (const el of element) {
        const key = $(el).data('key');
        const group = $(el).data('group');
        const value =
            group == '' ? res[key] : res[group] ? res[group][key] : undefined;
        const escaped = $('<div>')
            .text(value ?? '')
            .html();
        $(el).html(escaped.replace(/\n/g, '<br>'));
    }
}
