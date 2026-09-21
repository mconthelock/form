export const headerFields = {
    jig_name: 'JIG_NAME', drawing_no: 'DWG', revision: 'REV', qty: 'JIG_QTY',
    price: 'PRICE', maker: 'MAKER', start_use_date: 'START_USE_DATE', proc_item: 'ITEMNO',
    item: 'JIG_DESC', process_code: 'PROCESS_CODE', location: 'LOCATION', pic_empno: 'PIC_EMPNO', period: 'INSPEC_PERIOD',
};

// Keep date-only values calendar-based; interpret timestamps in the site's timezone.
export function calendarDate(value, firstDay = false) {
    if (!value) return '';
    let year, month, day;
    const text = String(value);
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) [year, month, day] = text.split('-');
    else if (/^\d{2}\/\d{2}\/\d{4}$/.test(text)) [day, month, year] = text.split('/');
    else {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
        const part = type => parts.find(item => item.type === type).value;
        year = part('year'); month = part('month'); day = part('day');
    }
    return `${year}-${month}-${firstDay ? '01' : day}`;
}
export const displayDate = value => { const iso = calendarDate(value); return iso ? iso.split('-').reverse().join('/') : ''; };
export const actionValues = ['Adjust', 'Modify', 'Replace'];
export const parseActions = value => String(value || '').split(',').map(v => v.trim()).filter(v => actionValues.includes(v));

export function collectJigPayload(form, rows, files, hasNg) {
    const payload = {};
    for (const [name, column] of Object.entries(headerFields)) {
        const value = form.elements[name].value.trim();
        payload[column] = value === '' ? null : ['qty', 'price', 'period'].includes(name) ? Number(value) : value;
    }
    payload.DETAILS = Array.from(rows.children, (row, index) => {
        const val = field => row.querySelector(`[data-field="${field}"]`).value.trim();
        return { CHECK_SEQ: index + 1, CHECK_POINT: val('point'), INSPECTION_TOOL: val('tool') || null,
            MIN: Number(val('min')), MAX: Number(val('max')), MEASURED_VALUE: Number(val('measured')), UNIT: val('unit') || null };
    });
    payload.FILES = files.map((file, index) => ({ FILE_SEQ: index + 1, FILE_NAME: file.FILE_NAME, FILE_PATH: file.FILE_PATH, FILE_TYPE: file.FILE_TYPE, FILE_SIZE: file.FILE_SIZE }));
    payload.NG = hasNg ? {
        DEFECT_DETAIL: form.elements.ng_defect_detail.value.trim(),
        ACTION: Array.from(form.querySelectorAll('[name="ng_action[]"]:checked'), input => input.value).join(','),
        CORRECTIVE: form.elements.ng_corrective_action.value.trim(),
        PLAN_DATE: form.elements.ng_plan_date.value,
        LOCATION: form.elements.ng_location.value,
    } : null;
    return payload;
}
