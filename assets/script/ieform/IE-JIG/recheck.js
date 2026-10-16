import Swal from 'sweetalert2';
import { setDatePicker } from '@amec/webasset/flatpickr';
import { calendarDate } from './payload';
import { uploadJigFiles, deleteJigFile, jigFileUrl, saveJigRecheck } from './data';

export function initializeRecheck(form) {
    const section = document.querySelector('#jig-recheck');
    const fields = document.querySelector('#recheck-fields');
    const context = document.querySelector('.form-data').dataset;
    const editable = context.mode === '2' && context.cstepno === '19';
    const date = form.elements.namedItem('actual_finnish_date');
    const summary = form.elements.namedItem('summary_detail');
    const groups = ['BEFORE', 'AFTER'];
    let key, stored = [], nextSeq = 1, hasNg = false, deleting = false, saving = false;
    const incoming = { BEFORE: [], AFTER: [] };
    setDatePicker({ element: '[name="actual_finnish_date"]', dateFormat: 'Y-m-d',
        altInput: true, altFormat: 'd/m/Y', disableMobile: true });
    function setNg(value) {
        hasNg = value;
        section.hidden = !value;
        fields.disabled = !editable || !value;
        section.querySelectorAll('[data-recheck-upload]').forEach(el => { el.hidden = !editable; });
    }
    function render() {
        for (const group of groups) {
            const list = section.querySelector(`[data-recheck-list="${group}"]`);
            list.replaceChildren();
            for (const file of stored.filter(f => f.FILE_GROUP === group)) {
                const li = document.createElement('li');
                li.className = 'flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2';
                const link = document.createElement('a');
                link.textContent = file.FILE_NAME; link.href = jigFileUrl(key, file);
                link.target = '_blank'; link.rel = 'noopener noreferrer';
                li.append(link);
                if (editable) {
                    const remove = document.createElement('button'); remove.type = 'button';
                    remove.className = 'btn btn-ghost btn-xs'; remove.textContent = 'ลบ';
                    remove.onclick = async () => {
                        if (saving || deleting || fields.matches(':disabled')) return;
                        const result = await Swal.fire({ icon: 'warning', title: 'ยืนยันลบไฟล์?', text: file.FILE_NAME,
                            showCancelButton: true, confirmButtonText: 'ลบ', cancelButtonText: 'ยกเลิก' });
                        if (!result.isConfirmed || saving || deleting) return;
                        if (file.pending) { stored = stored.filter(f => f !== file); render(); return; }
                        deleting = true;
                        const buttons = [...document.querySelectorAll('#jig-approval button')];
                        const disabled = buttons.map(b => b.disabled); buttons.forEach(b => { b.disabled = true; });
                        try {
                            const response = await deleteJigFile(key, file.FILE_SEQ, context.empno);
                            stored = stored.filter(f => f !== file); render();
                            if (response.warning) await Swal.fire({ icon: 'warning', text: response.warning });
                        } catch (error) { await Swal.fire({ icon: 'error', title: 'ลบไฟล์ไม่สำเร็จ', text: error.message }); }
                        finally { deleting = false; buttons.forEach((b, i) => { b.disabled = disabled[i]; }); }
                    };
                    li.append(remove);
                }
                list.append(li);
            }
            incoming[group].forEach(file => {
                const li = document.createElement('li'); li.className = 'flex justify-between gap-3 px-3 py-2';
                const label = document.createElement('span'); label.textContent = file.name;
                const remove = document.createElement('button'); remove.type = 'button';
                remove.className = 'btn btn-ghost btn-xs'; remove.textContent = 'ลบ';
                remove.onclick = () => { if (saving || fields.matches(':disabled')) return; incoming[group] = incoming[group].filter(f => f !== file); render(); };
                li.append(label, remove); list.append(li);
            });
        }
    }
    async function addFiles(group, files) {
        if (saving || !editable || fields.matches(':disabled') || section.querySelector(`[data-recheck-input="${group}"]`).disabled || deleting) return;
        const next = [...incoming[group]];
        for (const file of files) if (!next.some(f => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified)) next.push(file);
        if (next.length + stored.filter(f => f.FILE_GROUP === group).length > 5 ||
            next.some(f => f.size > 10 * 1024 * 1024 || !/\.(jpe?g|png)$/i.test(f.name))) {
            await Swal.fire({ icon: 'warning', title: 'ตรวจสอบรูปภาพ', text: 'แต่ละช่องแนบ JPG หรือ PNG ได้สูงสุด 5 ไฟล์ ไฟล์ละไม่เกิน 10 MB' });
            return;
        }
        incoming[group] = next; render();
    }
    for (const group of groups) {
        const input = section.querySelector(`[data-recheck-input="${group}"]`);
        const zone = input.closest('[data-recheck-upload]');
        input.onchange = () => { void addFiles(group, [...input.files]); input.value = ''; };
        zone.ondragover = event => event.preventDefault();
        zone.ondrop = event => { event.preventDefault(); void addFiles(group, [...event.dataTransfer.files]); };
    }
    async function validate() {
        if (!editable || !hasNg || deleting) return false;
        const errors = [];
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date.value)) errors.push('กรุณากรอกวันที่แก้ไขเสร็จ');
        if (!summary.value.trim() || summary.value.trim().length > 2000) errors.push('กรุณากรอกสรุปการดำเนินงาน ไม่เกิน 2,000 ตัวอักษร');
        for (const group of groups) if (!incoming[group].length && !stored.some(f => f.FILE_GROUP === group)) errors.push(`กรุณาแนบรูป ${group} อย่างน้อย 1 ไฟล์`);
        if (errors.length) await Swal.fire({ icon: 'warning', title: 'ข้อมูล Recheck ยังไม่ครบถ้วน', text: errors.join('\n') });
        return !errors.length;
    }
    return {
        setNg, validate,
        hydrate(snapshot, formKey) {
            key = formKey;
            stored = (snapshot.FILES || []).filter(f => groups.includes(f.FILE_GROUP));
            nextSeq = Math.max(0, ...(snapshot.FILES || []).map(f => Number(f.FILE_SEQ))) + 1;
            date._flatpickr?.setDate(calendarDate(snapshot.NG?.ACTUAL_FINNISH_DATE), false, 'Y-m-d');
            summary.value = snapshot.NG?.SUMMARY_DETAIL || '';
            setNg(Boolean(snapshot.NG)); render();
        },
        async persist() {
            if (saving || !(await validate())) return false;
            saving = true;
            try {
            // Retain successful upload metadata if a later upload/PATCH fails.
            for (const group of groups) {
                const files = await uploadJigFiles(key, context.empno, incoming[group], group);
                stored.push(...files.map(file => ({ ...file, FILE_GROUP: group, FILE_SEQ: nextSeq++, pending: true })));
                incoming[group] = []; render();
            }
            await saveJigRecheck(key, { UPDATE_BY: context.empno, ACTUAL_FINNISH_DATE: date.value,
                SUMMARY_DETAIL: summary.value.trim(), FILES: stored.map(({ FILE_SEQ, FILE_NAME, FILE_PATH, FILE_TYPE, FILE_SIZE, FILE_GROUP }) =>
                    ({ FILE_SEQ, FILE_NAME, FILE_PATH, FILE_TYPE, FILE_SIZE, FILE_GROUP })) });
            stored.forEach(file => { delete file.pending; });
            return true;
            } finally { saving = false; }
        },
    };
}
