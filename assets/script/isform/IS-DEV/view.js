import '@flaticon/flaticon-uicons/css/all/all.css';
import '@amec/webasset/css/select2.min.css';
import dayjs from 'dayjs';
import select2 from 'select2';
import { displayEmpInfo, fillImages } from '@amec/webasset/indexDB';
import { setSelect2 } from '@amec/webasset/select2';
import { setDatePicker } from '@amec/webasset/flatpickr';
import { showMessage, intVal, showDigits } from '@amec/webasset/utils';
import { getFormIsDev } from './data';

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
    if (!data || !data[0]) return;

    const row = data[0];
    const status = row.STATUS !== undefined ? String(row.STATUS).trim() : null;
    const cst =
        row.form?.CST !== undefined
            ? String(row.form.CST).trim()
            : row.CST !== undefined
              ? String(row.CST).trim()
              : null;
    const isDraft =
        status === '0' ||
        String(status).toLowerCase() === 'draft' ||
        cst === '0';
    const inputBy = String(
        row.INPUTBY ?? row.INPUT_BY ?? row.form?.VINPUTER ?? row.VINPUTER ?? '',
    ).trim();
    const empNo = String($('#EMPNO').val() ?? '').trim();

    if (
        isDraft &&
        empNo !== '' &&
        empNo === inputBy &&
        window.location.pathname.includes('/main')
    ) {
        const url = new URL(window.location.href);
        if (url.searchParams.get('mode') !== '2') {
            url.searchParams.set('mode', '2');
            window.location.replace(url.href);
            return;
        }
    }

    const res = {
        ...row,
        OBJECTIVE_TXT:
            row.OBJECTIVE == '8'
                ? `${row.objective?.OBJ_NAME ?? ''}: ${row.OBJECTIVE_OTHER ?? ''}`
                : row.objective?.OBJ_NAME,
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
