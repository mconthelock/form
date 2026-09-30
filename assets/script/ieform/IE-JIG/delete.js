import Swal from 'sweetalert2';
import { getFormDetail, showflow } from '@amec/webasset/api/webform';
import {
    getJigMaster,
    getJigMasterCheckpoints,
    getJigMasterDefect,
    getJigEmployee,
    getJigLocations,
    loadJigDeleteForm,
    createJigDeleteForm,
    saveJigDeleteForm,
    uploadJigFiles,
    deleteJigFile,
    jigFileUrl,
} from './data';
import { displayDate } from './payload';
import { deleteFormKey, checkDeleteResponse, initializeDeleteCreation, initializeDeleteApproval } from './delete-workflow';

$(document).ready(function () {
    const page = document.querySelector('#jig-delete-page');
    if (!page) return;
    document.querySelector('#loading-box').checked = false;
    const form = document.querySelector('#jig-delete-form');
    const fields = document.querySelector('#delete-fields');
    const status = document.querySelector('#delete-load-status');
    const retry = document.querySelector('#delete-retry');
    const picker = document.querySelector('#delete-files');
    const dropzone = document.querySelector('#delete-dropzone');
    const creating = page.dataset.pageMode === 'create';
    let editable = creating || (page.dataset.mode === '2' && page.dataset.cstepno?.trim() === '--');
    const key = deleteFormKey(Object.fromEntries(
        ['NFRMNO', 'VORGNO', 'CYEAR', 'CYEAR2', 'NRUNNO'].map((name) => [name, page.dataset[name.toLowerCase()]]),
    ));
    dropzone.hidden = !editable;
    let attachments = [];
    let storedFiles = [];
    let fileBusy = false;
    let approvalInitialized = false;
    let previews = [];
    let dragDepth = 0;
    let loaded = false;
    let locations = [];
    let defect = null;
    const displayValue = (value) =>
        value == null || value === '' ? '—' : String(value);
    const locationLabel = (code) => {
        const location = locations.find(
            (item) => String(item.SHOPCODE ?? '').trim() === String(code ?? '').trim(),
        );
        return location ? `${location.SHOPCODE} - ${location.SHOPDESC}` : code;
    };

    const VIEW = {
        async loadRequesterNames() {
            const empno = String(page.dataset.empno ?? '').trim();
            let name;
            try {
                const user = await getJigEmployee(empno);
                name = user?.SNAME || 'ไม่พบข้อมูลพนักงาน';
            } catch {
                name = 'โหลดชื่อพนักงานไม่สำเร็จ';
            }
            // Create uses the same employee for INPUTBY and REQBY.
            for (const id of ['#delete-input-by', '#delete-requested-by']) {
                page.querySelector(id).textContent = `${empno} ${name}`;
            }
        },
        async load() {
            if (creating) void VIEW.loadRequesterNames();
            loaded = false;
            fields.disabled = true;
            retry.hidden = true;
            status.hidden = false;
            status.textContent = 'กำลังโหลดข้อมูล JIG…';
            try {
                let webform;
                if (!creating) {
                    const [snapshot, detail, flow] = await Promise.all([
                        loadJigDeleteForm(key), getFormDetail(key), showflow(key),
                    ]);
                    webform = detail;
                    if (['2', '3'].includes(String(webform.CST).trim())) editable = false;
                    if (!snapshot?.JIG_NO) throw new Error('ไม่พบข้อมูลคำขอลบ JIG');
                    if (!Array.isArray(snapshot.FILES)) throw new Error('API ยังไม่ส่งรายการไฟล์แนบของคำขอลบ กรุณาอัปเดต API');
                    page.dataset.jigno = snapshot.JIG_NO;
                    storedFiles = snapshot.FILES;
                    form.elements.delete_reason.value = snapshot.REASON ?? '';
                    form.elements.delete_detail.value = snapshot.DETAIL ?? '';
                    document.querySelector('#delete-formno').textContent = webform.FORMNO || document.querySelector('#delete-formno').textContent;
                    document.querySelector('#delete-input-by').textContent = `${webform.VINPUTER ?? ''} ${webform.VINPUTNAME ?? ''}`.trim();
                    document.querySelector('#delete-requested-by').textContent = `${webform.VREQNO ?? ''} ${webform.VREQNAME ?? ''}`.trim();
                    document.querySelector('#delete-flow').innerHTML = flow.html || '';
                }
                const jig = await getJigMaster(page.dataset.jigno);
                if (!jig?.JIG_NO) throw new Error('ไม่พบข้อมูล JIG');
                void VIEW.loadCheckpoints();
                void VIEW.loadDefect();
                page.querySelectorAll('[data-master]').forEach((element) => {
                    const column = element.dataset.master;
                    let value = jig[column];
                    if (column === 'REV' && String(value) === '0') value = '*';
                    if (column === 'START_USE_DATE') value = displayDate(value);
                    if (column === 'INSPEC_PERIOD' && value != null)
                        value = `${value} เดือน`;
                    if (['PRICE', 'JIG_QTY'].includes(column) && value != null)
                        value = Number(value).toLocaleString('th-TH');
                    element.textContent = displayValue(value);
                });
                // Optional display names must not block the master information.
                const extras = await Promise.allSettled([
                    jig.PIC_EMPNO
                        ? getJigEmployee(String(jig.PIC_EMPNO).trim())
                        : Promise.resolve(null),
                    getJigLocations(),
                ]);
                if (extras[0].status === 'fulfilled' && extras[0].value) {
                    page.querySelector(
                        '[data-master="PIC_EMPNO"]',
                    ).textContent =
                        `(${jig.PIC_EMPNO}) ${extras[0].value.SNAME}`;
                }
                if (
                    extras[1].status === 'fulfilled' &&
                    Array.isArray(extras[1].value)
                ) {
                    locations = extras[1].value;
                    page.querySelector('[data-master="LOCATION"]').textContent =
                        displayValue(locationLabel(jig.LOCATION));
                    if (defect) VIEW.renderDefect(defect);
                }
                loaded = true;
                fields.disabled = !editable;
                dropzone.hidden = !editable;
                VIEW.renderFiles();
                status.hidden = true;
                if (!creating && !approvalInitialized) {
                    initializeDeleteApproval({
                        page, context: page.dataset, key, webform,
                        validate: () => VIEW.validate(), persist: () => VIEW.persist(),
                        onIdle: (acted) => {
                            if (acted) { editable = false; fields.disabled = true; dropzone.hidden = true; }
                            VIEW.renderFiles();
                        },
                    });
                    approvalInitialized = true;
                }
            } catch (error) {
                status.textContent =
                    'โหลดข้อมูลไม่สำเร็จ: ' + (error.message || 'กรุณาลองใหม่');
                retry.hidden = false;
            }
        },
        async loadCheckpoints() {
            const message = document.querySelector('#delete-checkpoint-status');
            const retryButton = document.querySelector('#delete-checkpoint-retry');
            const table = document.querySelector('#delete-checkpoint-table');
            const rows = document.querySelector('#delete-checkpoint-rows');
            const count = document.querySelector('#delete-checkpoint-count');
            retryButton.hidden = true;
            table.hidden = true;
            rows.replaceChildren();
            count.textContent = '—';
            message.hidden = false;
            message.classList.remove('is-error');
            message.textContent = 'กำลังโหลดข้อมูล Checkpoint…';
            try {
                const checkpoints = await getJigMasterCheckpoints(page.dataset.jigno);
                if (!Array.isArray(checkpoints))
                    throw new Error('รูปแบบข้อมูล Checkpoint ไม่ถูกต้อง');
                count.textContent = `${checkpoints.length} รายการ`;
                checkpoints.forEach((checkpoint) => {
                    const row = document.createElement('tr');
                    ['CHECK_SEQ', 'CHECK_POINT', 'INSPECTION_TOOL', 'MIN', 'MAX', 'MEASURED_VALUE', 'UNIT'].forEach((column) => {
                        const cell = document.createElement('td');
                        cell.textContent = displayValue(checkpoint[column]);
                        if (['MIN', 'MAX', 'MEASURED_VALUE'].includes(column))
                            cell.className = 'numeric';
                        row.append(cell);
                    });
                    rows.append(row);
                });
                table.hidden = checkpoints.length === 0;
                message.hidden = checkpoints.length > 0;
                message.textContent = 'ยังไม่มีข้อมูล Checkpoint';
            } catch (error) {
                message.classList.add('is-error');
                message.textContent = 'โหลด Checkpoint ไม่สำเร็จ: ' + (error.message || 'กรุณาลองใหม่');
                retryButton.hidden = false;
            }
        },
        async loadDefect() {
            const section = document.querySelector('#delete-defect-section');
            const message = document.querySelector('#delete-defect-status');
            const retryButton = document.querySelector('#delete-defect-retry');
            const count = document.querySelector('#delete-defect-count');
            section.hidden = false;
            retryButton.hidden = true;
            defect = null;
            document.querySelector('#delete-defect-list').replaceChildren();
            count.textContent = '—';
            message.hidden = false;
            message.classList.remove('is-error');
            message.textContent = 'กำลังโหลดข้อมูล NG…';
            try {
                // The master endpoint returns { NG: object | null }.
                const response = await getJigMasterDefect(page.dataset.jigno);
                if (!response || !Object.prototype.hasOwnProperty.call(response, 'NG') ||
                    (response.NG !== null && (!response.NG?.JIG_NO || Array.isArray(response.NG))))
                    throw new Error('รูปแบบข้อมูล NG ไม่ถูกต้อง');
                defect = response.NG;
                section.hidden = defect === null;
                message.hidden = true;
                count.textContent = defect ? 'พบ NG' : 'ไม่มี NG';
                if (defect) VIEW.renderDefect(defect);
            } catch (error) {
                message.classList.add('is-error');
                message.textContent = 'โหลดข้อมูล NG ไม่สำเร็จ: ' + (error.message || 'กรุณาลองใหม่');
                retryButton.hidden = false;
            }
        },
        renderDefect(ng) {
            const list = document.querySelector('#delete-defect-list');
            const card = document.createElement('div');
            card.className = 'defect-card';
            const grid = document.createElement('dl');
            grid.className = 'defect-grid';
            const details = [
                ['Defect Detail · รายละเอียดข้อบกพร่อง', ng.DEFECT_DETAIL, true],
                ['Action · วิธีดำเนินการ', String(ng.ACTION ?? '').split(',').map((value) => value.trim()).filter(Boolean).join(', ')],
                ['Plan Date · กำหนดดำเนินการ', displayDate(ng.PLAN_DATE)],
                ['Corrective Action · การแก้ไข', ng.CORRECTIVE, true],
                ['Location · สถานที่', locationLabel(ng.LOCATION), true],
            ];
            details.forEach(([label, value, wide]) => {
                const field = document.createElement('div');
                if (wide) field.className = 'master-wide';
                const title = document.createElement('dt');
                title.className = 'master-label';
                title.textContent = label;
                const content = document.createElement('dd');
                content.className = 'defect-value';
                content.textContent = displayValue(value);
                field.append(title, content);
                grid.append(field);
            });
            card.append(grid);
            list.replaceChildren(card);
        },
        renderFiles() {
            previews.forEach((url) => URL.revokeObjectURL(url));
            previews = [];
            const transfer = new DataTransfer();
            attachments.forEach((file) => transfer.items.add(file));
            picker.files = transfer.files;
            const list = document.querySelector('#delete-file-list');
            list.replaceChildren();
            storedFiles.forEach((file) => {
                const row = document.createElement('li');
                const link = document.createElement('a');
                link.className = 'file-name text-blue-700 underline';
                link.textContent = file.FILE_NAME;
                link.href = jigFileUrl(key, file);
                link.target = '_blank';
                link.rel = 'noopener';
                const download = document.createElement('a');
                download.className = 'btn btn-ghost btn-xs';
                download.textContent = 'ดาวน์โหลด';
                download.href = jigFileUrl(key, file, { download: true });
                row.append(link, download);
                if (editable) {
                    const remove = document.createElement('button');
                    remove.type = 'button';
                    remove.className = 'btn btn-ghost btn-xs text-red-700';
                    remove.textContent = 'ลบ';
                    remove.onclick = async () => {
                        if (fileBusy) return;
                        fileBusy = true;
                        const controls = [...page.querySelectorAll('button,input,textarea')];
                        const disabled = controls.map(control => control.disabled);
                        try {
                            controls.forEach(control => { control.disabled = true; });
                            const confirmation = await Swal.fire({ icon: 'warning', title: 'ยืนยันลบไฟล์?', text: file.FILE_NAME,
                                showCancelButton: true, confirmButtonText: 'ลบไฟล์', cancelButtonText: 'ยกเลิก' });
                            if (!confirmation.isConfirmed) return;
                            const result = await deleteJigFile(key, file.FILE_SEQ, page.dataset.empno);
                            storedFiles = storedFiles.filter(item => item.FILE_SEQ !== file.FILE_SEQ);
                            if (result.warning) await Swal.fire({ icon: 'warning', title: 'ลบรายการไฟล์แล้ว', text: result.warning });
                        } catch (error) {
                            await Swal.fire({ icon: 'error', title: 'ลบไฟล์ไม่สำเร็จ', text: error.message });
                        } finally {
                            controls.forEach((control, i) => { control.disabled = disabled[i]; });
                            fileBusy = false;
                            VIEW.renderFiles();
                        }
                    };
                    row.append(remove);
                }
                list.append(row);
            });
            attachments.forEach((file, index) => {
                const row = document.createElement('li');
                if (['image/jpeg', 'image/png'].includes(file.type)) {
                    const preview = document.createElement('img');
                    preview.src = URL.createObjectURL(file);
                    previews.push(preview.src);
                    preview.alt = file.name;
                    row.append(preview);
                }
                const name = document.createElement('span');
                name.className = 'file-name';
                name.textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
                const remove = document.createElement('button');
                remove.type = 'button';
                remove.className = 'btn btn-ghost btn-xs text-red-700';
                remove.textContent = 'ลบ';
                remove.setAttribute('aria-label', `ลบ ${file.name}`);
                remove.onclick = () => {
                    attachments.splice(index, 1);
                    VIEW.renderFiles();
                };
                row.append(name, remove);
                list.append(row);
            });
            if (!storedFiles.length && !attachments.length) {
                const empty = document.createElement('li');
                empty.textContent = 'ไม่มีไฟล์แนบ';
                list.append(empty);
            }
        },
        async validate() {
            if (!loaded || !editable || fileBusy) return false;
            for (const [name, label] of [['delete_reason', 'เหตุผลการลบ'], ['delete_detail', 'รายละเอียดเพิ่มเติม']]) {
                const input = form.elements.namedItem(name);
                if (!input.value.trim() || input.value.trim().length > 1000) {
                    await Swal.fire({ icon: 'warning', title: `กรุณากรอก${label}`, text: 'กรอกข้อมูลไม่เกิน 1,000 ตัวอักษร' });
                    input.focus();
                    return false;
                }
            }
            return true;
        },
        async payload(formKey) {
            const incoming = await uploadJigFiles(formKey, page.dataset.empno, attachments);
            const next = Math.max(0, ...storedFiles.map(file => Number(file.FILE_SEQ))) + 1;
            return {
                REASON: form.elements.delete_reason.value.trim(),
                DETAIL: form.elements.delete_detail.value.trim(),
                FILES: [...storedFiles, ...incoming.map((file, i) => ({ ...file, FILE_SEQ: next + i, CREATE_BY: page.dataset.empno }))]
                    .map(file => Object.fromEntries(['FILE_SEQ', 'FILE_NAME', 'FILE_PATH', 'FILE_TYPE', 'FILE_SIZE', 'CREATE_BY']
                        .filter(name => file[name] != null).map(name => [name, file[name]]))),
            };
        },
        async persist() {
            const payload = await VIEW.payload(key);
            const snapshot = checkDeleteResponse(await saveJigDeleteForm(key, { ...payload, UPDATE_BY: page.dataset.empno }));
            storedFiles = snapshot.FILES;
            attachments = [];
        },
        async persistCreation(formKey) {
            const payload = await VIEW.payload(formKey);
            checkDeleteResponse(await createJigDeleteForm({ ...formKey, JIG_NO: page.dataset.jigno, ...payload }));
        },
        async addFiles(files) {
            if (!loaded || !editable || fileBusy || fields.disabled || picker.disabled) return;
            const next = [...attachments];
            Array.from(files).forEach((file) => {
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
                storedFiles.length + next.length > 5 ||
                next.some(
                    (file) =>
                        !/\.(jpe?g|png|pdf)$/i.test(file.name) ||
                        file.size > 10 * 1024 * 1024 ||
                        !file.size,
                )
            ) {
                VIEW.renderFiles();
                await Swal.fire({
                    icon: 'warning',
                    title: 'ไฟล์แนบไม่ถูกต้อง',
                    text: 'ใช้ JPG, PNG หรือ PDF สูงสุด 5 ไฟล์ ขนาดไม่เกิน 10 MB ต่อไฟล์ และไฟล์ต้องไม่ว่าง',
                });
                return;
            }
            attachments = next;
            VIEW.renderFiles();
        },
    };
    retry.onclick = () => void VIEW.load();
    document.querySelector('#delete-checkpoint-retry').onclick = () => void VIEW.loadCheckpoints();
    document.querySelector('#delete-defect-retry').onclick = () => void VIEW.loadDefect();
    picker.onchange = () => void VIEW.addFiles(picker.files);
    dropzone.addEventListener('dragenter', (event) => {
        event.preventDefault();
        if (loaded && editable && !picker.disabled && !fields.disabled) {
            dragDepth++;
            dropzone.classList.add('dragging');
        }
    });
    dropzone.addEventListener('dragover', (event) => event.preventDefault());
    dropzone.addEventListener('dragleave', (event) => {
        event.preventDefault();
        if (--dragDepth <= 0) dropzone.classList.remove('dragging');
    });
    dropzone.addEventListener('drop', (event) => {
        event.preventDefault();
        dragDepth = 0;
        dropzone.classList.remove('dragging');
        void VIEW.addFiles(event.dataTransfer.files);
    });
    const send = initializeDeleteCreation({
        page, context: page.dataset, validate: () => VIEW.validate(),
        persistCreation: (formKey) => VIEW.persistCreation(formKey),
    });
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (loaded && creating && !fileBusy) void send();
    });
    window.addEventListener('pagehide', () =>
        previews.forEach((url) => URL.revokeObjectURL(url)),
    );
    void VIEW.load();
});
