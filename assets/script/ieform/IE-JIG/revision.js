// Track all six checkpoint inputs, including the measured value.
const fields = {point: 'CHECK_POINT', tool: 'INSPECTION_TOOL', min: 'MIN', max: 'MAX', measured: 'MEASURED_VALUE', unit: 'UNIT'};
const normalize = (field, value) => {
    if (value == null || value === '') return '';
    return ['min', 'max', 'measured'].includes(field) ? String(Number(value)) : String(value);
};

export function nextRevision(value) {
    if (value === '0') return 'A';
    if (!/^[A-Z]+$/.test(value)) throw new Error('รูปแบบ Revision ไม่ถูกต้อง');
    const letters = value.split('');
    for (let i = letters.length - 1; i >= 0; i--) {
        if (letters[i] !== 'Z') {
            letters[i] = String.fromCharCode(letters[i].charCodeAt(0) + 1);
            return letters.join('');
        }
        letters[i] = 'A';
    }
    return 'A' + letters.join('');
}

export function trackInspectionRevision(form, rows, snapshot) {
    const context = document.querySelector('.form-data').dataset;
    const active = String(snapshot.FORM_TYPE).trim() === 'INSPECTION' && context.mode === '2' && context.cstepno === '--';
    const original = String(snapshot.REV_OLD ?? '').trim();
    let current = String(snapshot.REV ?? '').trim();
    const baseline = JSON.stringify((snapshot.DETAILS || []).map(detail =>
        Object.entries(fields).map(([field, column]) => normalize(field, detail[column]))));
    const update = () => {
        if (!active) return;
        if (!original || !current) throw new Error('ไม่พบ REV / REV_OLD สำหรับฟอร์ม INSPECTION');
        const changed = JSON.stringify(Array.from(rows.children, row =>
            Object.keys(fields).map(field => normalize(field, row.querySelector(`[data-field="${field}"]`).value)))) !== baseline;
        // Once advanced, edits and returns must never advance this form again.
        if (current === original && changed) current = nextRevision(current);
        form.elements.namedItem('revision').value = current;
        form.querySelector('[aria-label="Revision"]').value = current === '0' ? '*' : current;
    };
    rows.addEventListener('input', () => { if (original && current) update(); });
    const observer = new MutationObserver(() => { if (original && current) update(); });
    observer.observe(rows, {childList: true});
    return update;
}
