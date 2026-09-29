import Swal from 'sweetalert2';
import { getJigMaster, getJigEmployee, getJigLocations } from './data';
import { displayDate } from './payload';

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
    let attachments = [];
    let previews = [];
    let dragDepth = 0;
    let loaded = false;

    const VIEW = {
        async load() {
            loaded = false;
            fields.disabled = true;
            retry.hidden = true;
            status.hidden = false;
            status.textContent = 'กำลังโหลดข้อมูล JIG…';
            try {
                const jig = await getJigMaster(page.dataset.jigno);
                if (!jig?.JIG_NO) throw new Error('ไม่พบข้อมูล JIG');
                page.querySelectorAll('[data-master]').forEach((element) => {
                    const column = element.dataset.master;
                    let value = jig[column];
                    if (column === 'REV' && String(value) === '0') value = '*';
                    if (column === 'START_USE_DATE') value = displayDate(value);
                    if (column === 'INSPEC_PERIOD' && value != null)
                        value = `${value} เดือน`;
                    if (['PRICE', 'JIG_QTY'].includes(column) && value != null)
                        value = Number(value).toLocaleString('th-TH');
                    element.textContent =
                        value == null || value === '' ? '—' : String(value);
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
                    const location = extras[1].value.find(
                        (item) =>
                            String(item.SHOPCODE ?? '').trim() ===
                            String(jig.LOCATION ?? '').trim(),
                    );
                    if (location)
                        page.querySelector(
                            '[data-master="LOCATION"]',
                        ).textContent =
                            `${location.SHOPCODE} - ${location.SHOPDESC}`;
                }
                loaded = true;
                fields.disabled = false;
                status.hidden = true;
            } catch (error) {
                status.textContent =
                    'โหลดข้อมูลไม่สำเร็จ: ' + (error.message || 'กรุณาลองใหม่');
                retry.hidden = false;
            }
        },
        renderFiles() {
            previews.forEach((url) => URL.revokeObjectURL(url));
            previews = [];
            const transfer = new DataTransfer();
            attachments.forEach((file) => transfer.items.add(file));
            picker.files = transfer.files;
            const list = document.querySelector('#delete-file-list');
            list.replaceChildren();
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
        },
        async addFiles(files) {
            if (!loaded) return;
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
                next.length > 5 ||
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
    picker.onchange = () => void VIEW.addFiles(picker.files);
    dropzone.addEventListener('dragenter', (event) => {
        event.preventDefault();
        if (loaded) {
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
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!loaded) return;
        if (!form.elements.delete_reason.value.trim()) {
            await Swal.fire({
                icon: 'warning',
                title: 'กรุณากรอกเหตุผลการลบ',
            });
            form.elements.delete_reason.focus();
            return;
        }

        if (!form.elements.delete_detail.value.trim()) {
            await Swal.fire({
                icon: 'warning',
                title: 'กรุณากรอกรายละเอียดเพิ่มเติม',
            });
            form.elements.delete_detail.focus();
            return;
        }

        await Swal.fire({
            icon: 'info',
            title: 'ข้อมูลครบถ้วน',
            text: 'ยังไม่ได้ส่งคำขอลบหรืออัปโหลดไฟล์ รอเชื่อมต่อ เพื่อบันทึกคำขอลบ',
        });
    });
    window.addEventListener('pagehide', () =>
        previews.forEach((url) => URL.revokeObjectURL(url)),
    );
    void VIEW.load();
});
