import Swal from 'sweetalert2';
import { setDatePicker } from '@amec/webasset/flatpickr';
import { evaluateCheckpoint } from './checkpoint';
import { getJigProcesses, getJigLocations, getJigEmployee } from './data';

$(function () {
    const form = document.querySelector('#jig-form');
    const rows = document.querySelector('#checkpoint-rows');
    if (!form) return;
    $('#loading-box').prop('checked', false);
    setDatePicker({ element: '[name="reg_date"]', dateFormat: 'Y-m-d', altInput: true, altFormat: 'd/m/Y' });
    setDatePicker({ element: '[name="ng_plan_date"]', dateFormat: 'Y-m-d', altInput: true, altFormat: 'd/m/Y' });
    const ngActions = Array.from(form.querySelectorAll('[name="ng_action[]"]'));
    const validateNgActions = () => ngActions[0].setCustomValidity(ngActions.some((input) => input.checked) ? '' : 'กรุณาเลือกวิธีแก้ไขอย่างน้อย 1 วิธี');
    ngActions.forEach((input) => input.addEventListener('change', validateNgActions));
    validateNgActions();
    form.addEventListener('submit', (event) => event.preventDefault());

    async function loadSelect(name, loader, mapOptions) {
        const select = form.elements[name];
        try {
            const data = await loader();
            if (!Array.isArray(data)) throw new Error('Invalid API response');
            const options = mapOptions(data);
            select.replaceChildren(new Option(options.length ? 'เลือกข้อมูล' : 'ไม่พบข้อมูล', ''));
            options.forEach(({ value, label }) => select.add(new Option(label, value)));
            select.disabled = options.length === 0;
            if (name === 'location') {
                const ngLocation = form.elements.ng_location;
                ngLocation.replaceChildren(...Array.from(select.options, (option) => option.cloneNode(true)));
                ngLocation.disabled = select.disabled;
            }
        } catch (error) {
            select.replaceChildren(new Option('โหลดข้อมูลไม่สำเร็จ กรุณาโหลดหน้าใหม่', ''));
            select.disabled = true;
            await Swal.fire({ icon: 'error', title: 'โหลดข้อมูลไม่สำเร็จ', text: name === 'location' ? 'ไม่สามารถโหลด Location ได้ กรุณาลองใหม่' : 'ไม่สามารถโหลด MFG Process Code ได้ กรุณาลองใหม่' });
        }
    }
    void loadSelect('process_code', getJigProcesses, (data) => [...new Set(data.map((item) => String(item.PROCESS ?? '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b)).map((value) => ({ value, label: value })));
    void loadSelect('location', getJigLocations, (data) => data.filter((item) => item.SHOPCODE).sort((a, b) => a.SHOPCODE.localeCompare(b.SHOPCODE)).map((item) => ({ value: item.SHOPCODE.trim(), label: `${item.SHOPCODE.trim()}-${(item.SHOPDESC ?? '').trim()}` })));

    const inputName = document.querySelector('#input-by-name');
    getJigEmployee(form.elements.input_by.value).then((user) => {
        inputName.textContent = user?.SNAME || 'ไม่พบข้อมูลพนักงาน';
    }).catch(() => { inputName.textContent = 'โหลดชื่อพนักงานไม่สำเร็จ'; });

    const requester = form.elements.requested_by;
    const requesterName = document.querySelector('#requested-by-name');
    let lookupVersion = 0;
    requester.addEventListener('input', async () => {
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
                await Swal.fire({ icon: 'warning', title: 'ไม่พบข้อมูลพนักงาน', text: `ไม่พบรหัส ${empno} ใน AMECUSERALL`, confirmButtonText: 'ตกลง' });
                return;
            }
            requesterName.textContent = user.SNAME;
            requester.setCustomValidity('');
        } catch (error) {
            if (version !== lookupVersion) return;
            requesterName.textContent = 'ค้นหาพนักงานไม่สำเร็จ';
            requester.setCustomValidity('กรุณาค้นหาพนักงานใหม่');
            await Swal.fire({ icon: 'error', title: 'ค้นหาพนักงานไม่สำเร็จ', text: 'กรุณาตรวจสอบการเชื่อมต่อ แล้วกรอกรหัสอีกครั้ง', confirmButtonText: 'ตกลง' });
        }
    });

    function summarize() {
        document.querySelector('#add-checkpoint').disabled = rows.children.length >= 20;
        Array.from(rows.children).forEach((row, index) => { row.querySelector('.row-number').textContent = index + 1; });
        const results = Array.from(rows.querySelectorAll('.result')).map((cell) => cell.textContent);
        const hasNg = results.includes('NG');
        document.querySelector('#ng-detail').hidden = !hasNg;
        document.querySelector('#ng-fields').disabled = !hasNg;
        document.querySelector('#checkpoint-summary').textContent = `${rows.children.length} จุดตรวจ · OK ${results.filter((x) => x === 'OK').length} · NG ${results.filter((x) => x === 'NG').length}`;
    }

    function renderResult(row, result = '') {
        const cell = row.querySelector('.result');
        cell.textContent = result || '—';
        cell.className = `result inline-flex rounded-full px-3 py-1 text-xs font-semibold ${result === 'NG' ? 'bg-red-100 text-red-700' : result === 'OK' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-400'}`;
        row.classList.toggle('bg-red-50', result === 'NG');
        summarize();
    }

    function addRow() {
        if (rows.children.length >= 20) return null;
        const row = document.createElement('tr');
        row.className = 'border-t border-slate-100';
        const field = (name, label, numeric = false, width = 'w-24') => `<td class="p-2"><input aria-label="${label}" data-field="${name}" type="${numeric ? 'number' : 'text'}" ${numeric ? 'step="any"' : ''} class="input input-sm w-full min-w-0 border-slate-200 bg-white text-sm" autocomplete="off"></td>`;
        row.innerHTML = `<td class="row-number p-3 text-center text-xs text-slate-400"></td>${field('point', 'Check Point', false, 'w-52')}${field('tool', 'Inspection Tool', false, 'w-32')}${field('min', 'MIN', true)}${field('max', 'MAX', true)}${field('measured', 'Measured', true)}${field('unit', 'Unit', false, 'w-16')}<td class="p-2 text-center"><span class="result" role="status">—</span></td><td class="p-2"><button type="button" class="remove-row btn btn-ghost btn-xs text-slate-400" aria-label="ลบ Check Point">×</button></td>`;
        rows.append(row);
        renderResult(row);
        return row;
    }

    async function warnBounds(row, state) {
        if (Swal.isVisible()) return;
        await Swal.fire({ icon: 'warning', title: state === 'missing' ? 'กรอก MIN / MAX ก่อน' : 'ตรวจสอบ MIN / MAX', text: state === 'missing' ? 'ต้องกรอก MIN และ MAX ให้เรียบร้อยก่อนกรอก Measured' : 'MIN ต้องไม่มากกว่า MAX และต้องเป็นตัวเลขที่ถูกต้อง', confirmButtonText: 'ตกลง' });
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
            const result = evaluateCheckpoint(row.querySelector('[data-field="min"]').value, row.querySelector('[data-field="max"]').value, measured.value);
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
    document.querySelector('#add-checkpoint').addEventListener('click', () => addRow()?.querySelector('input').focus());
    addRow();

    const fileInput = document.querySelector('#jig-files');
    fileInput.addEventListener('change', async () => {
        const list = document.querySelector('#file-list');
        list.replaceChildren();
        const files = Array.from(fileInput.files);
        if (files.length > 5 || files.some((file) => file.size > 10 * 1024 * 1024 || !/\.(jpe?g|png|pdf)$/i.test(file.name))) {
            fileInput.value = '';
            await Swal.fire({ icon: 'warning', title: 'ตรวจสอบไฟล์แนบ', text: 'เลือก JPG, PNG หรือ PDF สูงสุด 5 ไฟล์ ขนาดไม่เกิน 10 MB ต่อไฟล์', confirmButtonText: 'ตกลง' });
            return;
        }
        files.forEach((file) => {
            const item = document.createElement('li');
            item.className = 'rounded-lg bg-slate-50 px-3 py-2 text-slate-600';
            item.textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
            list.append(item);
        });
    });
    form.elements.price.addEventListener('input', (event) => {
        const input = event.target;
        input.setCustomValidity(input.value && (!Number.isInteger(Number(input.value)) || Number(input.value) < 0) ? 'กรุณากรอกราคาเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป' : '');
        if (!input.checkValidity()) input.reportValidity();
    });
});
