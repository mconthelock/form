//import { initializeJigWorkflow } from './workflow';
import {
    calendarDate,
    displayDate,
    headerFields,
    parseActions,
} from './payload';
import { jigFileUrl } from './data';
import Swal from 'sweetalert2';
import { setDatePicker } from '@amec/webasset/flatpickr';
import { evaluateCheckpoint } from './checkpoint';
import {
    getJigProcesses,
    getJigLocations,
    getJigEmployee,
    getJigPics,
} from './data';

$(function () {
    const form = document.querySelector('#jig-form');
    const rows = document.querySelector('#checkpoint-rows');
    if (!form) return;
    $('#loading-box').prop('checked', false);
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(new Date());
    const part = (type) => parts.find((p) => p.type === type).value;
    const pageMode = document.querySelector('#jig-page').dataset.mode;
    let storedFiles = [];
    let storedKey;
    let workflow;
    const today = part('year') + '-' + part('month') + '-' + part('day');
    form.elements.start_use_date.value =
        part('year') + '-' + part('month') + '-01';
    form.elements.start_use_display.value =
        '01/' + part('month') + '/' + part('year');
    setDatePicker({
        element: '[name="reg_date"]',
        defaultDate: calendarDate(today, true),
        clickOpens: false,
        allowInput: false,
        dateFormat: 'Y-m-d',
        altInput: true,
        altFormat: 'd/m/Y',
        disableMobile: true,
        onReady: (_dates, _value, instance) => {
            instance.set('altFormat', 'd/m/Y');
            instance.set('clickOpens', false);
        },
    });
    setDatePicker({
        element: '[name="ng_plan_date"]',
        dateFormat: 'Y-m-d',
        altInput: true,
        altFormat: 'd/m/Y',
        disableMobile: true,
        onReady: (_dates, _value, instance) =>
            instance.set('altFormat', 'd/m/Y'),
    });
    const ngActions = Array.from(form.querySelectorAll('[name="ng_action[]"]'));
    const validateNgActions = () =>
        ngActions[0].setCustomValidity(
            ngActions.some((input) => input.checked)
                ? ''
                : 'กรุณาเลือกวิธีแก้ไขอย่างน้อย 1 วิธี',
        );
    ngActions.forEach((input) =>
        input.addEventListener('change', validateNgActions),
    );
    validateNgActions();
    async function validate() {
        const errors = [];
        const hasNg = Array.from(rows.querySelectorAll('.result')).some(
            (cell) => cell.textContent === 'NG',
        );
        const labelOf = (input) =>
            input.closest('label')?.firstChild?.textContent.trim() ||
            input.getAttribute('aria-label') ||
            input.name;
        for (const input of form.querySelectorAll('input, select, textarea')) {
            if (input.closest('#ng-fields') && !hasNg) continue;
            if (input.required && (input.disabled || !input.value.trim()))
                errors.push('กรุณากรอก/เลือก ' + labelOf(input));
            else if (
                !input.matches(':disabled') &&
                input.willValidate &&
                !input.checkValidity()
            )
                errors.push(labelOf(input) + ': ' + input.validationMessage);
            if (input.maxLength > 0 && input.value.length > input.maxLength)
                errors.push(
                    labelOf(input) +
                        ' ยาวเกิน ' +
                        input.maxLength +
                        ' ตัวอักษร',
                );
        }
        if (!requester.value || requester.dataset.verified !== requester.value)
            errors.push(
                'กรุณารอผลตรวจสอบ Requested By และใช้พนักงานที่ Active',
            );
        if (rows.children.length < 1)
            errors.push('ต้องมี Check Points อย่างน้อย 1 รายการ');
        if (!attachments.length && !storedFiles.length)
            errors.push('กรุณาแนบรูปภาพ / DWG อ้างอิงอย่างน้อย 1 ไฟล์');
        Array.from(rows.children).forEach((row, index) => {
            const value = (name) =>
                row.querySelector('[data-field="' + name + '"]').value;
            if (!value('point').trim())
                errors.push(
                    'Check Point แถว ' + (index + 1) + ': กรุณากรอกชื่อจุดตรวจ',
                );
            if (
                !['OK', 'NG'].includes(
                    evaluateCheckpoint(
                        value('min'),
                        value('max'),
                        value('measured'),
                    ),
                )
            )
                errors.push(
                    'Check Point แถว ' +
                        (index + 1) +
                        ': กรุณากรอก MIN, MAX และ Measured ให้ถูกต้อง',
                );
        });
        if (hasNg && !ngActions.some((input) => input.checked))
            errors.push('NG Detail: กรุณาเลือกวิธีแก้ไขอย่างน้อย 1 วิธี');
        if (errors.length) {
            await Swal.fire({
                icon: 'warning',
                title: 'ข้อมูลยังไม่ครบถ้วน',
                text: [...new Set(errors)].join('\n'),
                confirmButtonText: 'ตกลง',
            });
            return false;
        }
        return true;
    }
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (workflow) void workflow.save();
    });

    async function loadSelect(name, loader, mapOptions) {
        const select = form.elements[name];
        try {
            const data = await loader();
            if (!Array.isArray(data)) throw new Error('Invalid API response');
            const options = mapOptions(data);
            select.replaceChildren(
                new Option(options.length ? 'เลือกข้อมูล' : 'ไม่พบข้อมูล', ''),
            );
            options.forEach(({ value, label }) =>
                select.add(new Option(label, value)),
            );
            select.disabled = options.length === 0;
            if (name === 'location') {
                const ngLocation = form.elements.ng_location;
                ngLocation.replaceChildren(
                    ...Array.from(select.options, (option) =>
                        option.cloneNode(true),
                    ),
                );
                ngLocation.disabled = select.disabled;
            }
        } catch (error) {
            select.replaceChildren(
                new Option('โหลดข้อมูลไม่สำเร็จ กรุณาโหลดหน้าใหม่', ''),
            );
            select.disabled = true;
            await Swal.fire({
                icon: 'error',
                title: 'โหลดข้อมูลไม่สำเร็จ',
                text:
                    name === 'location'
                        ? 'ไม่สามารถโหลด Location ได้ กรุณาลองใหม่'
                        : name === 'pic_empno'
                          ? 'ไม่สามารถโหลดรายชื่อ PIC ได้ กรุณาลองใหม่'
                          : 'ไม่สามารถโหลด MFG Process Code ได้ กรุณาลองใหม่',
            });
        }
    }
    // ie-pics applies department, active status and position filters on the server.
    // Its response contains SEMPNO/SNAME/SPOSNAME, not CSTATUS.
    const picReady = loadSelect('pic_empno', getJigPics, (data) =>
        data.map((u) => ({
            value: String(u.SEMPNO).trim(),
            label: '(' + String(u.SEMPNO).trim() + ') ' + (u.SNAME || ''),
        })),
    );
    const processReady = loadSelect('process_code', getJigProcesses, (data) =>
        [
            ...new Set(
                data
                    .map((item) => String(item.PROCESS ?? '').trim())
                    .filter(Boolean),
            ),
        ]
            .sort((a, b) => a.localeCompare(b))
            .map((value) => ({ value, label: value })),
    );
    const locationReady = loadSelect('location', getJigLocations, (data) =>
        data
            .filter((item) => item.SHOPCODE)
            .sort((a, b) => a.SHOPCODE.localeCompare(b.SHOPCODE))
            .map((item) => ({
                value: item.SHOPCODE.trim(),
                label: `${item.SHOPCODE.trim()}-${(item.SHOPDESC ?? '').trim()}`,
            })),
    );

    const inputName = document.querySelector('#input-by-name');
    if (pageMode === 'create')
        getJigEmployee(form.elements.input_by.value)
            .then((user) => {
                inputName.textContent = user?.SNAME || 'ไม่พบข้อมูลพนักงาน';
            })
            .catch(() => {
                inputName.textContent = 'โหลดชื่อพนักงานไม่สำเร็จ';
            });

    const requester = form.elements.requested_by;
    const requesterName = document.querySelector('#requested-by-name');
    let lookupVersion = 0;
    requester.addEventListener('input', async () => {
        delete requester.dataset.verified;
        const version = ++lookupVersion;
        requester.value = requester.value.replace(/\D/g, '').slice(0, 5);
        const empno = requester.value;
        requesterName.textContent = '';
        requester.setCustomValidity('');
        if (empno.length !== 5) return;
        requesterName.textContent = 'กำลังค้นหา…';
        requester.setCustomValidity('กรุณารอผลค้นหาพนักงาน');
        try {
            const user = await getJigEmployee(empno);
            if (version !== lookupVersion) return;
            if (!user?.SNAME || String(user.SEMPNO).trim() !== empno) {
                requesterName.textContent = 'ไม่พบข้อมูลพนักงาน';
                requester.setCustomValidity('ไม่พบรหัสพนักงานนี้');
                await Swal.fire({
                    icon: 'warning',
                    title: 'ไม่พบข้อมูลพนักงาน',
                    text: `ไม่พบรหัส ${empno} ในระบบ`,
                    confirmButtonText: 'ตกลง',
                });
                requester.value = '';
                return;
            }
            requesterName.textContent = user.SNAME;
            requester.dataset.verified = empno;
            requester.setCustomValidity('');
        } catch (error) {
            if (version !== lookupVersion) return;
            requesterName.textContent = 'ค้นหาพนักงานไม่สำเร็จ';
            requester.setCustomValidity('กรุณาค้นหาพนักงานใหม่');
            await Swal.fire({
                icon: 'error',
                title: 'ค้นหาพนักงานไม่สำเร็จ',
                text: 'กรุณาตรวจสอบการเชื่อมต่อ แล้วกรอกรหัสอีกครั้ง',
                confirmButtonText: 'ตกลง',
            });
        }
    });

    function summarize() {
        Array.from(rows.children).forEach((row, index) => {
            row.querySelector('.row-number').textContent = index + 1;
        });
        const results = Array.from(rows.querySelectorAll('.result')).map(
            (cell) => cell.textContent,
        );
        const hasNg = results.includes('NG');
        document.querySelector('#ng-detail').hidden = !hasNg;
        document.querySelector('#ng-fields').disabled = !hasNg;
        document.querySelector('#checkpoint-summary').textContent =
            `${rows.children.length} จุดตรวจ · OK ${results.filter((x) => x === 'OK').length} · NG ${results.filter((x) => x === 'NG').length}`;
    }

    function renderResult(row, result = '') {
        const cell = row.querySelector('.result');
        cell.textContent = result || '—';
        cell.className = `result inline-flex rounded-full px-3 py-1 text-xs font-semibold ${result === 'NG' ? 'bg-red-100 text-red-700' : result === 'OK' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-400'}`;
        row.classList.toggle('bg-red-50', result === 'NG');
        summarize();
    }

    function addRow() {
        const row = document.createElement('tr');
        row.className = 'border-t border-slate-100';
        const field = (name, label, numeric = false, width = 'w-24') =>
            `<td class="p-2"><input aria-label="${label}" data-field="${name}" type="${numeric ? 'number' : 'text'}" ${numeric ? 'min="-99999999.9999" max="99999999.9999" step="0.0001"' : `maxlength="${{ point: 200, tool: 100, unit: 20 }[name]}"`} class="input input-sm w-full min-w-0 border-slate-200 bg-white text-sm" autocomplete="off"></td>`;
        row.innerHTML = `<td class="row-number p-3 text-center text-xs text-slate-400"></td>${field('point', 'Check Point', false, 'w-52')}${field('tool', 'Inspection Tool', false, 'w-32')}${field('min', 'MIN', true)}${field('max', 'MAX', true)}${field('measured', 'Measured', true)}${field('unit', 'Unit', false, 'w-16')}<td class="p-2 text-center"><span class="result" role="status">—</span></td><td class="p-2"><button type="button" class="remove-row btn btn-ghost btn-xs text-slate-400" aria-label="ลบ Check Point">×</button></td>`;
        rows.append(row);
        renderResult(row);
        return row;
    }

    async function warnBounds(row, state) {
        if (Swal.isVisible()) return;
        await Swal.fire({
            icon: 'warning',
            title:
                state === 'missing'
                    ? 'กรอก MIN / MAX ก่อน'
                    : 'ตรวจสอบ MIN / MAX',
            text:
                state === 'missing'
                    ? 'ต้องกรอก MIN และ MAX ให้เรียบร้อยก่อนกรอก Measured'
                    : 'MIN ต้องไม่มากกว่า MAX และต้องเป็นตัวเลขที่ถูกต้อง',
            confirmButtonText: 'ตกลง',
        });
        row.querySelector('[data-field="min"]').focus();
    }

    rows.addEventListener('input', (event) => {
        const field = event.target.dataset.field;
        const row = event.target.closest('tr');
        if (!row) return;
        const measured = row.querySelector('[data-field="measured"]');
        if (field === 'min' || field === 'max') {
            measured.value = '';
            renderResult(row);
        } else if (field === 'measured') {
            const result = evaluateCheckpoint(
                row.querySelector('[data-field="min"]').value,
                row.querySelector('[data-field="max"]').value,
                measured.value,
            );
            if (result === 'missing' || result === 'invalid') {
                measured.value = '';
                renderResult(row);
                void warnBounds(row, result);
            } else renderResult(row, result);
        }
    });
    rows.addEventListener('click', (event) => {
        if (event.target.closest('.remove-row')) {
            event.target.closest('tr').remove();
            summarize();
        }
    });
    document
        .querySelector('#add-checkpoint')
        .addEventListener('click', () =>
            addRow()?.querySelector('input').focus(),
        );
    addRow();

    const fileInput = document.querySelector('#jig-files');
    const dropzone = document.querySelector('#jig-file-dropzone');
    let attachments = [];
    function renderFiles() {
        const transfer = new DataTransfer();
        attachments.forEach((file) => transfer.items.add(file));
        fileInput.files = transfer.files;
        const list = document.querySelector('#file-list');
        list.replaceChildren();
        storedFiles.forEach((file, index) => {
            const item = document.createElement('li');
            const link = document.createElement('a');
            link.textContent = file.FILE_NAME;
            link.href = jigFileUrl(storedKey, file);
            link.target = '_blank';
            link.rel = 'noopener';
            link.className = 'text-indigo-700 underline';
            item.append(link);
            if (pageMode === 'edit') {
                const remove = document.createElement('button');
                remove.type = 'button';
                remove.className = 'btn btn-ghost btn-xs';
                remove.textContent = 'ลบ';
                remove.onclick = () => {
                    storedFiles.splice(index, 1);
                    renderFiles();
                };
                item.append(remove);
            }
            list.append(item);
        });
        attachments.forEach((file, index) => {
            const item = document.createElement('li');
            item.className =
                'flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-slate-600';
            const name = document.createElement('span');
            name.className = 'min-w-0 break-all';
            name.textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'btn btn-ghost btn-xs shrink-0';
            remove.textContent = 'ลบ';
            remove.setAttribute('aria-label', `ลบ ${file.name}`);
            remove.addEventListener('click', () => {
                attachments.splice(index, 1);
                renderFiles();
            });
            item.append(name, remove);
            list.append(item);
        });
    }
    async function addFiles(incoming) {
        if (fileInput.matches(':disabled')) return;
        const next = [...attachments];
        Array.from(incoming).forEach((file) => {
            if (
                !next.some(
                    (old) =>
                        old.name === file.name &&
                        old.size === file.size &&
                        old.lastModified === file.lastModified,
                )
            )
                next.push(file);
        });
        if (
            next.length + storedFiles.length > 5 ||
            next.some(
                (file) =>
                    file.size > 10 * 1024 * 1024 ||
                    !/\.(jpe?g|png|pdf)$/i.test(file.name),
            )
        ) {
            renderFiles(); // Keep previously accepted files when a new selection is invalid.
            await Swal.fire({
                icon: 'warning',
                title: 'ตรวจสอบไฟล์แนบ',
                text: 'เลือก JPG, PNG หรือ PDF สูงสุด 5 ไฟล์ ขนาดไม่เกิน 10 MB ต่อไฟล์',
                confirmButtonText: 'ตกลง',
            });
            return;
        }
        attachments = next;
        renderFiles();
    }
    fileInput.addEventListener('change', () => void addFiles(fileInput.files));
    let dragDepth = 0;
    const highlight = (active) => {
        dropzone.classList.toggle('ring-2', active);
        dropzone.classList.toggle('ring-indigo-400', active);
    };
    dropzone.addEventListener('dragenter', (event) => {
        event.preventDefault();
        if (fileInput.matches(':disabled')) return;
        dragDepth++;
        highlight(true);
    });
    dropzone.addEventListener('dragover', (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = fileInput.matches(':disabled')
            ? 'none'
            : 'copy';
    });
    dropzone.addEventListener('dragleave', (event) => {
        event.preventDefault();
        dragDepth = Math.max(0, dragDepth - 1);
        if (!dragDepth) highlight(false);
    });
    dropzone.addEventListener('drop', (event) => {
        event.preventDefault();
        dragDepth = 0;
        highlight(false);
        void addFiles(event.dataTransfer.files);
    });
    form.elements.price.addEventListener('input', (event) => {
        const input = event.target;
        input.setCustomValidity(
            input.value &&
                (!Number.isInteger(Number(input.value)) ||
                    Number(input.value) < 0)
                ? 'กรุณากรอกราคาเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป'
                : '',
        );
        if (!input.checkValidity()) input.reportValidity();
    });
    async function hydrate(snapshot, webform, key) {
        await Promise.all([picReady, processReady, locationReady]);
        const setValue = (name, value) => {
            const input = form.elements[name];
            const text = value == null ? '' : String(value).trim();
            if (
                input.tagName === 'SELECT' &&
                text &&
                !Array.from(input.options).some((o) => o.value === text)
            )
                input.add(new Option(text, text));
            if (input._flatpickr)
                input._flatpickr.setDate(text, false, 'Y-m-d');
            else input.value = text;
        };
        for (const [name, column] of Object.entries(headerFields))
            setValue(name, snapshot[column]);
        setValue('input_by', webform.VINPUTER);
        setValue('requested_by', webform.VREQNO);
        requester.dataset.verified = requester.value;
        requester.readOnly = true;
        inputName.textContent = webform.VINPUTNAME || '';
        requesterName.textContent = webform.VREQNAME || '';
        setValue('form_no', webform.FORMNO);
        setValue('jig_no', snapshot.JIG_NO);
        setValue('reg_date', calendarDate(webform.DREQDATE, true));
        setValue('start_use_date', calendarDate(snapshot.START_USE_DATE));
        setValue('start_use_display', displayDate(snapshot.START_USE_DATE));
        form.querySelector('[aria-label="Revision"]').value =
            Number(snapshot.REV) === 0 ? '*' : snapshot.REV;
        rows.replaceChildren();
        for (const detail of snapshot.DETAILS || []) {
            const row = addRow();
            for (const [field, column] of Object.entries({
                point: 'CHECK_POINT',
                tool: 'INSPECTION_TOOL',
                min: 'MIN',
                max: 'MAX',
                measured: 'MEASURED_VALUE',
                unit: 'UNIT',
            }))
                row.querySelector('[data-field="' + field + '"]').value =
                    detail[column] ?? '';
            renderResult(
                row,
                evaluateCheckpoint(
                    detail.MIN,
                    detail.MAX,
                    detail.MEASURED_VALUE,
                ),
            );
        }
        const ng = snapshot.NG || {};
        setValue('ng_defect_detail', ng.DEFECT_DETAIL);
        setValue('ng_corrective_action', ng.CORRECTIVE);
        setValue('ng_plan_date', calendarDate(ng.PLAN_DATE));
        setValue('ng_location', ng.LOCATION);
        const actions = parseActions(ng.ACTION);
        ngActions.forEach((input) => {
            input.checked = actions.includes(input.value);
        });
        validateNgActions();
        summarize();
        storedKey = key;
        storedFiles = snapshot.FILES || [];
        renderFiles();
        document.querySelector('#jig-fields').disabled = pageMode !== 'edit';
        if (pageMode === 'view') {
            form.querySelectorAll(
                '.remove-row, #add-checkpoint, #validate-jig, #jig-file-dropzone, #generate-ng-pdf',
            ).forEach((el) => {
                el.hidden = true;
            });
        }
        document.querySelector('#jig-load-status').hidden = true;
    }
    /* workflow = initializeJigWorkflow({form, rows, pageMode, validate, hydrate,
        files: () => ({stored: storedFiles, incoming: attachments}),
        ready: Promise.all([picReady,processReady,locationReady])});
*/
});
