import $ from 'jquery';
import { redirectWebflow } from '@amec/webasset/form';
import { showLoader } from '@amec/webasset/preloader';
import {
    downloadOrOpenFile,
    deleteFile,
    getFile,
} from '@amec/webasset/api/file';
import { host } from '../../utils';
import { uploadDocFiles, saveDocMaster, getFilesDisplay } from './data';
import { initFlow, actionFlow } from './flow';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

let empno = '';
let selectedFilesArray = [];

$(document).ready(async function () {
    const formData = $('.form-info').data() || {};
    empno = formData.empno ? formData.empno.toString() : '';

    const form = {
        NFRMNO: formData.nfrmno,
        VORGNO: formData.vorgno,
        CYEAR: formData.cyear ? formData.cyear.toString() : '',
        CYEAR2: formData.cyear2 ? formData.cyear2.toString() : '',
        NRUNNO: formData.nrunno,
        EMPNO: empno,
        DOC_NO: formData.doc_no,
    };

    // Binding ข้อมูลเข้าฟอร์ม
    $('#DOC_IDTxt').val(form.DOC_NO);
    $('#REQUEST_BYTxt').val(formData.reqby || '');
    $('#INPUT_BYTxt').val(formData.inputby || '');
    $('#DocHeaderIDHid').val(formData.doc_header_id || '');
    // alert(formData.inputby);

    // เริ่มต้นระบบ Flow & Permissions จากไฟล์ flow.js
    await initFlow(form, formData.status);

    if (form.NRUNNO) {
        loadExistingFiles();
    }

    setTimeout(function () {
        $('.load').addClass('hidden');
        $('#form').removeClass('hidden');
    }, 10);

    // Event จัดการเลือกไฟล์แนบ
    initFileDropEvents();

    // ปุ่มบันทึกเอกสาร & อัปโหลดไฟล์
    // ปุ่มบันทึกเอกสาร & อัปโหลดไฟล์ / ส่งซ้ำหลังโดน Return
    $('#SaveDocBtn').on('click', async function () {
        const docHeaderId = $('#DocHeaderIDHid').val();
        const isResubmit = !!(docHeaderId && form.NRUNNO); // true = โดน Return มาแล้วส่งซ้ำ

        const docType = $('#DocTypeDrp').val();
        if (!docType) {
            alert('กรุณาเลือก Document Type');
            return;
        }

        const existingFileCount = $('#uploaded-files-list li').length;
        const validFiles = selectedFilesArray.filter((f) => f !== null);

        // ต้องมีไฟล์เดิมหลงเหลืออยู่ หรือมีการแนบไฟล์ใหม่เข้ามาเพิ่ม
        if (existingFileCount === 0 && validFiles.length === 0) {
            alert('กรุณาแนบไฟล์เอกสาร PDF อย่างน้อย 1 ไฟล์');
            return;
        }

        const confirmMsg = isResubmit
            ? 'ยืนยันการส่งเอกสารกลับเข้าระบบพิจารณาอีกครั้งใช่หรือไม่?'
            : 'ยืนยันการบันทึกและสร้างเอกสารใหม่ใช่หรือไม่?';

        if (!confirm(confirmMsg)) return;

        try {
            showLoader();

            let targetForm = { ...form };

            if (!isResubmit) {
                // ========================================================
                // กรณีที่ 1: สร้างเอกสารใหม่ครั้งแรก (DRAFT -> SUBMIT)
                // ========================================================
                let headerPayload = new FormData();
                headerPayload.append('DOC_TYPE_CODE', docType);
                headerPayload.append('REMARK', $('#RemarkTxt').val() || ''); // Remark สำหรับ createForm
                headerPayload.append('EMPNO', empno);

                const resHeader = await saveDocMaster(headerPayload);
                if (!resHeader || !resHeader.status) {
                    throw new Error(
                        resHeader?.message || 'บันทึกข้อมูลเอกสารไม่สำเร็จ',
                    );
                }

                const createdDoc = resHeader.data || {};
                targetForm.NFRMNO = createdDoc.NFRMNO || form.NFRMNO;
                targetForm.VORGNO = createdDoc.VORGNO || form.VORGNO;
                targetForm.CYEAR = createdDoc.CYEAR || form.CYEAR;
                targetForm.CYEAR2 = createdDoc.CYEAR2 || form.CYEAR2;
                targetForm.NRUNNO = createdDoc.NRUNNO || form.NRUNNO;
            }

            // ========================================================
            // อัปโหลดไฟล์ใหม่เข้า Storage เดิม (ถ้ามีการแนบไฟล์เพิ่ม)
            // ========================================================
            if (validFiles.length > 0) {
                let nestJsData = new FormData();
                nestJsData.append('NFRMNO', targetForm.NFRMNO);
                nestJsData.append('VORGNO', targetForm.VORGNO);
                nestJsData.append('CYEAR', targetForm.CYEAR);
                nestJsData.append('CYEAR2', targetForm.CYEAR2);
                nestJsData.append('NRUNNO', targetForm.NRUNNO);
                nestJsData.append('CREATEBY', empno);
                nestJsData.append('FORM_TYPE', 'FE');

                validFiles.forEach((file) => nestJsData.append('files', file));

                const resFile = await uploadDocFiles(nestJsData);
                if (!resFile || !resFile.status) {
                    throw new Error(
                        resFile?.message || 'อัปโหลดไฟล์ผ่าน API ไม่สำเร็จ',
                    );
                }
            }

            // ========================================================
            // กรณี Resubmit: เตะ Flow ต่อด้วย actionFlow ('approve')
            // RemarkTxt จะถูกดึงและแนบลง Flow ในฟังก์ชัน actionFlow เองอัตโนมัติ
            // ========================================================
            if (isResubmit) {
                await actionFlow('approve', targetForm);
                return;
            }

            alert('สร้างและส่งเอกสารเรียบร้อยแล้ว');
            redirectWebflow();
        } catch (err) {
            console.error('Submit Error:', err);
            alert('เกิดข้อผิดพลาด: ' + err.message);
        } finally {
            showLoader({ show: false });
        }
    });

    // Event สำหรับกดดู Preview Stamped PDF รายไฟล์
    $(document).on('click', '.btn-preview-file', async function (e) {
        e.preventDefault();

        const fileObj = {
            FILE_ID: $(this).data('file-id'),
            FILE_PATH: $(this).data('base-dir'),
            FILE_FNAME: $(this).data('stored-name'),
            FILE_ONAME: $(this).data('original-name'),
        };

        // เรียกฟังก์ชัน Stamp ด้วย pdf-lib
        await previewStampedPdfWithPdfLib(fileObj, form);
    });

    // ปุ่ม Preview Stamped PDF
    // $(document).on('click', '#PreviewPdfBtn', function () {
    //     const url =
    //         host +
    //         `feform/FE-DOC/form/PreviewStampedPdf?no=${form.NFRMNO}&orgNo=${form.VORGNO}&y=${form.CYEAR}&y2=${form.CYEAR2}&runNo=${form.NRUNNO}`;
    //     window.open(url, '_blank');
    // });

    $(document).on('click', '.btn-download-file', async function (e) {
        e.preventDefault();
        const baseDir = $(this).data('base-dir');
        const storedName = $(this).data('stored-name');
        const originalName = $(this).data('original-name');

        try {
            showLoader();
            await downloadOrOpenFile({
                baseDir: baseDir,
                storedName: storedName,
                originalName: originalName,
                mode: 'download',
            });
        } catch (err) {
            console.error('Download error:', err);
        } finally {
            showLoader({ show: false });
        }
    });
});

function initFileDropEvents() {
    $('#drop-zone').on('click', function (e) {
        e.preventDefault();
        $('#files').click();
    });

    $('#files').on('click', (e) => e.stopPropagation());

    $(document).on('change', '#files', function () {
        handleFileSelect(this.files);
        $(this).val('');
    });

    $('#drop-zone').on('dragover dragenter', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).addClass('border-blue-500 bg-blue-50/40');
    });

    $('#drop-zone').on('dragleave dragend drop', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass('border-blue-500 bg-blue-50/40');
        if (e.type === 'drop') {
            const dt = e.originalEvent.dataTransfer;
            if (dt && dt.files && dt.files.length > 0)
                handleFileSelect(dt.files);
        }
    });

    $(document).on('click', '.btn-remove-selected-file', function () {
        let idx = $(this).data('index');
        selectedFilesArray[idx] = null;
        $(`#file-item-${idx}`).remove();
        if (selectedFilesArray.filter(Boolean).length === 0) {
            $('#file-list-container').addClass('hidden');
        }
    });
}

function handleFileSelect(files) {
    if (!files || files.length === 0) return;
    let hasInvalid = false;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split('.').pop().toLowerCase();

        if (ext !== 'pdf' && file.type !== 'application/pdf') {
            hasInvalid = true;
            continue;
        }

        selectedFilesArray.push(file);
        let idx = selectedFilesArray.length - 1;
        let fileSize = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

        let html = `
            <li class="flex items-center justify-between py-2 px-3 text-sm" id="file-item-${idx}">
                <div class="flex items-center gap-2 truncate">
                    <span class="text-rose-500 font-bold text-xs bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">PDF</span>
                    <span class="font-medium text-slate-700 truncate">${file.name}</span>
                    <span class="text-xs text-slate-400">(${fileSize})</span>
                </div>
                <button type="button" class="btn-remove-selected-file text-rose-500 font-bold text-xs" data-index="${idx}">Remove</button>
            </li>`;
        $('#selected-files-list').append(html);
    }

    if (hasInvalid) alert('ระบบรองรับเฉพาะไฟล์ PDF เท่านั้น');
    if (selectedFilesArray.filter(Boolean).length > 0)
        $('#file-list-container').removeClass('hidden');
}

function loadExistingFiles() {
    const formData = $('.form-info').data() || {};
    const mode = $('#MODEHid').val() || '1';
    let isRequester = false;

    if (mode === '1' || mode === '2') {
        const reqBy = (
            $('#REQUEST_BYTxt').val() ||
            formData.reqby ||
            ''
        ).toString();
        isRequester = reqBy.includes(empno);
    }

    const $list = $('#uploaded-files-list');

    $.ajax({
        url: host + 'feform/FE-DOC/form/GetFilesDisplay',
        type: 'POST',
        cache: false,
        dataType: 'json',
        data: {
            NFRMNO: formData.nfrmno,
            VORGNO: formData.vorgno,
            CYEAR2: formData.cyear2,
            NRUNNO: formData.nrunno,
        },
        success: function (response) {
            $list.empty();
            if (
                response?.status === true &&
                response.files &&
                response.files.length > 0
            ) {
                $('#download-zone').removeClass('hidden');

                response.files.forEach(function (file) {
                    const formattedBaseDir = (file.FILE_PATH || '').replace(
                        /\\/g,
                        '/',
                    );

                    let fullFilePath = (
                        (file.FILE_PATH || '').replace(/\\/g, '/') +
                        '/' +
                        file.FILE_FNAME
                    ).replace(/\/+/g, '/');
                    if (!fullFilePath.startsWith('//')) {
                        fullFilePath = '/' + fullFilePath;
                    }

                    let deleteBtn = isRequester
                        ? `<button type="button" 
                                   class="btn-delete-file text-rose-500 hover:text-rose-700 font-bold text-xs px-2 cursor-pointer transition-colors" 
                                   data-id="${file.FILE_ID}"
                                   data-path="${fullFilePath}">
                               🗑️ Delete
                           </button>`
                        : '';

                    let itemHtml0 = `
                        <li class="flex items-center justify-between py-2.5 px-3 text-sm hover:bg-slate-50 transition-colors" id="uploaded-file-${file.FILE_ID}">
                            <div class="flex items-center gap-2.5 truncate">
                                <span class="text-rose-500 font-bold text-xs bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">PDF</span>
                                <span class="font-medium text-slate-700 truncate">${file.FILE_ONAME}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <!-- 🟢 ฝังข้อมูลไฟล์ลงในปุ่ม Preview ตรงๆ -->
                                <button type="button" 
                                        class="btn-preview-file bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 font-semibold text-xs px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                                        data-file-id="${file.FILE_ID}"
                                        data-base-dir="${formattedBaseDir}"
                                        data-stored-name="${file.FILE_FNAME}"
                                        data-original-name="${file.FILE_ONAME}">
                                    👁️ Preview
                                </button>
                                <button type="button" 
                                        class="btn-download-file bg-slate-100 hover:bg-primary hover:text-white text-slate-600 font-semibold text-xs px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                                        data-base-dir="${formattedBaseDir}"
                                        data-stored-name="${file.FILE_FNAME}"
                                        data-original-name="${file.FILE_ONAME}">
                                    ⬇️ Download
                                </button>
                                ${deleteBtn}
                            </div>
                        </li>`;
                    let itemHtml = `
                        <li class="flex items-center justify-between py-2.5 px-3 text-sm hover:bg-slate-50 transition-colors" id="uploaded-file-${file.FILE_ID}">
                            <div class="flex items-center gap-2.5 truncate">
                                <span class="text-rose-500 font-bold text-xs bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">PDF</span>
                                <span class="font-medium text-slate-700 truncate">${file.FILE_ONAME}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <!-- 🟢 ฝังข้อมูลไฟล์ลงในปุ่ม Preview ตรงๆ -->
                                <button type="button" 
                                        class="btn-preview-file bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 font-semibold text-xs px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                                        data-file-id="${file.FILE_ID}"
                                        data-base-dir="${formattedBaseDir}"
                                        data-stored-name="${file.FILE_FNAME}"
                                        data-original-name="${file.FILE_ONAME}">
                                    👁️ Preview
                                </button>
                                
                                ${deleteBtn}
                            </div>
                        </li>`;
                    $list.append(itemHtml);
                });
            } else {
                $('#download-zone').addClass('hidden');
            }
        },
    });
}

// Event สำหรับกดปุ่ม Delete ไฟล์แนบเดิม
$(document).on('click', '.btn-delete-file', async function () {
    const fileId = $(this).data('id');
    const filePath = $(this).data('path'); // e.g. //amecnas/AMECWEB/File/development/.../filename.pdf

    if (!confirm('ยืนยันการลบไฟล์แนบนี้ใช่หรือไม่?')) return;

    showLoader();
    try {
        // 🟢 1. สั่ง API NestJS ลบไฟล์จริงบน NAS ผ่านฟังก์ชันกลาง
        try {
            await deleteFile(filePath);
        } catch (apiErr) {
            console.warn('API delete physical file warning:', apiErr);
            // ดำเนินการต่อเพื่อลบ record ในฐานข้อมูลออกด้วย
        }

        // 🟢 2. สั่ง PHP ลบข้อมูล Record ในตาราง FE_FILE
        const res = await $.ajax({
            url: host + 'feform/FE-DOC/form/DeleteFile',
            type: 'POST',
            data: { id: fileId },
            dataType: 'json',
        });

        if (res && res.status) {
            $(`#uploaded-file-${fileId}`).remove();
            if ($('#uploaded-files-list li').length === 0) {
                $('#download-zone').addClass('hidden');
            }
        } else {
            alert('ลบข้อมูลไม่สำเร็จ: ' + (res?.message || ''));
        }
    } catch (e) {
        console.error(e);
        alert('เกิดข้อผิดพลาดในการลบไฟล์');
    } finally {
        showLoader({ show: false });
    }
});

async function previewStampedPdfWithPdfLib(fileObj, form) {
    try {
        showLoader();

        // 1. ดึงข้อมูล Steps ทั้งหมด และ Logs คนที่ Approve แล้ว
        const stampRes = await $.ajax({
            url: host + 'feform/FE-DOC/form/GetStampData',
            type: 'POST',
            data: {
                no: form.NFRMNO,
                orgNo: form.VORGNO,
                y: form.CYEAR,
                y2: form.CYEAR2,
                runNo: form.NRUNNO,
            },
            dataType: 'json',
        });

        if (!stampRes?.status) {
            throw new Error(
                stampRes?.message || 'ไม่สามารถดึงข้อมูล Stamp ได้',
            );
        }

        const steps = stampRes.steps || [];
        const logs = stampRes.logs || [];

        // 2. ดึงไฟล์ PDF ผ่าน API กลาง
        const file = await getFile({
            baseDir: (fileObj.FILE_PATH || '').replace(/\\/g, '/'),
            storedName: fileObj.FILE_FNAME,
            originalName: fileObj.FILE_ONAME,
            mode: 'open',
        });

        const fileArrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(fileArrayBuffer);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0]; // Stamp หน้าแรก
        const { width, height } = firstPage.getSize();

        // 3. เตรียม Fonts
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // 4. ลอจิกวาดตาราง Stamp
        const stepCount = steps.length;
        if (stepCount > 0) {
            const colW = 70; // ความกว้างแต่ละช่อง
            const titleH = 18;
            const boxH = 58; // ความสูงของช่องประทับตรา
            const totalTableW = colW * stepCount;

            const marginX = 20;
            const marginY = 20;
            const startX = width - totalTableW - marginX; // ขอบซ้ายสุดของตารางรวม
            const startY = height - marginY;

            // ทำ Map จับคู่คนที่ Approve แล้ว โดยใช้ CEXTDATA หรือ CSTEPNO
            const appMap = {};
            logs.forEach((l) => {
                const ext = (l.CEXTDATA || '').trim();
                const stepNo = (l.CSTEPNO || '').trim();
                if (ext) appMap[ext] = l;
                if (stepNo) appMap[stepNo] = l;
            });

            // 🟢 วนลูปวาดทุก Step โดยให้ Step แรก (idx 0) อยู่ "ขวาสุด"
            steps.forEach((st, idx) => {
                const colIndexFromRight = stepCount - 1 - idx;
                const cellX = startX + colIndexFromRight * colW;
                const cellY = startY - titleH - boxH;

                // 4.1 วาดช่องว่างรอ Stamp (แสดงทุก Step)
                firstPage.drawRectangle({
                    x: cellX,
                    y: cellY,
                    width: colW,
                    height: boxH,
                    borderColor: rgb(0.2, 0.2, 0.2),
                    borderWidth: 0.8,
                });

                // 4.2 วาดหัวตารางชื่อตำแหน่ง (สีเทาอ่อน)
                firstPage.drawRectangle({
                    x: cellX,
                    y: startY - titleH,
                    width: colW,
                    height: titleH,
                    color: rgb(0.93, 0.94, 0.95),
                    borderColor: rgb(0.2, 0.2, 0.2),
                    borderWidth: 0.8,
                });

                const titleText = (st.POSITION_TITLE || '').trim();
                const titleTextWidth = fontBold.widthOfTextAtSize(
                    titleText,
                    7.5,
                );
                firstPage.drawText(titleText, {
                    x: cellX + Math.max(2, (colW - titleTextWidth) / 2),
                    y: startY - 12,
                    size: 7.5,
                    font: fontBold,
                    color: rgb(0.1, 0.1, 0.1),
                });

                // 4.3 🟢 ตรวจสอบว่า Step นี้มีคนกด Approve หรือยัง?
                // ถ้ามีข้อมูลใน appMap ถึงจะวาดวงกลมสีแดง AMEC ลงไป
                const extKey = (st.CEXTDATA || '').trim();
                const stepKey = (st.CSTEPNO || '').trim();
                const app = appMap[extKey] || appMap[stepKey];

                if (app && app.DAPVDATE_STR) {
                    const centerX = cellX + colW / 2;
                    const centerY = cellY + boxH / 2;

                    // วาดวงกลมสีแดง
                    firstPage.drawEllipse({
                        x: centerX,
                        y: centerY,
                        xScale: 22,
                        yScale: 22,
                        borderColor: rgb(0.9, 0.15, 0.15),
                        borderWidth: 1.2,
                        opacity: 0.9,
                    });

                    // บรรทัดที่ 1: AMEC
                    const orgText = 'AMEC';
                    const orgW = fontBold.widthOfTextAtSize(orgText, 7.5);
                    firstPage.drawText(orgText, {
                        x: centerX - orgW / 2,
                        y: centerY + 9,
                        size: 7.5,
                        font: fontBold,
                        color: rgb(0.9, 0.15, 0.15),
                    });

                    // บรรทัดที่ 2: วันที่อนุมัติ (เช่น 02/10/2026)
                    const dateText = (app.DAPVDATE_STR || '').trim();
                    const dateW = fontRegular.widthOfTextAtSize(dateText, 6.5);
                    firstPage.drawText(dateText, {
                        x: centerX - dateW / 2,
                        y: centerY - 1,
                        size: 6.5,
                        font: fontRegular,
                        color: rgb(0.9, 0.15, 0.15),
                    });

                    // บรรทัดที่ 3: ชื่อผู้อนุมัติ (ตัดเอาเฉพาะชื่อตัวหน้า)
                    const fullName = (app.SNAME || '').trim();
                    const firstName = fullName.split(' ')[0] || fullName;
                    const nameW = fontBold.widthOfTextAtSize(firstName, 7);
                    firstPage.drawText(firstName, {
                        x: centerX - nameW / 2,
                        y: centerY - 11,
                        size: 7,
                        font: fontBold,
                        color: rgb(0.9, 0.15, 0.15),
                    });
                }
            });
        }

        // 5. บันทึกและเปิด Preview ในแท็บใหม่
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
    } catch (err) {
        console.error('Preview Stamped Error:', err);
        const errMsg =
            err?.responseJSON?.message ||
            err?.statusText ||
            err?.message ||
            'เกิดข้อผิดพลาดไม่ทราบสาเหตุ';
        alert('เกิดข้อผิดพลาดในการทำตรายางเอกสาร: ' + errMsg);
    } finally {
        showLoader({ show: false });
    }
}
