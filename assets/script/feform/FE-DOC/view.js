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
import { stampPdfDocument } from './pdfStamper';

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
        await previewStampedPdfWithPdfLib(fileObj, form, false);
    });

    // ปุ่ม Preview Stamped PDF
    // $(document).on('click', '#PreviewPdfBtn', function () {
    //     const url =
    //         host +
    //         `feform/FE-DOC/form/PreviewStampedPdf?no=${form.NFRMNO}&orgNo=${form.VORGNO}&y=${form.CYEAR}&y2=${form.CYEAR2}&runNo=${form.NRUNNO}`;
    //     window.open(url, '_blank');
    // });

    // $(document).on('click', '.btn-download-file', async function (e) {
    //     e.preventDefault();
    //     const baseDir = $(this).data('base-dir');
    //     const storedName = $(this).data('stored-name');
    //     const originalName = $(this).data('original-name');

    //     try {
    //         showLoader();
    //         await downloadOrOpenFile({
    //             baseDir: baseDir,
    //             storedName: storedName,
    //             originalName: originalName,
    //             mode: 'download',
    //         });
    //     } catch (err) {
    //         console.error('Download error:', err);
    //     } finally {
    //         showLoader({ show: false });
    //     }
    // });

    $(document).on('click', '.btn-open-file', async function (e) {
        e.preventDefault();
        const baseDir = $(this).data('base-dir');
        const storedName = $(this).data('stored-name');
        const originalName = $(this).data('original-name');

        try {
            showLoader();
            const file = await getFile({
                baseDir: baseDir,
                storedName: storedName,
                originalName: originalName,
                mode: 'open',
            });

            // สร้าง URL และเปิดในแท็บใหม่
            const blobUrl = URL.createObjectURL(file);
            window.open(blobUrl, '_blank');
        } catch (err) {
            console.error('Open file error:', err);
            alert('เกิดข้อผิดพลาดในการเปิดไฟล์: ' + err.message);
        } finally {
            showLoader({ show: false });
        }
    });

    // Event สำหรับ Stamp Excel โดยดึงไฟล์ผ่าน getFile ก่อน
    $(document).on('click', '.btn-stamp-excel', async function (e) {
        e.preventDefault();

        const baseDir = $(this).data('base-dir');
        const storedName = $(this).data('stored-name');
        const originalName = $(this).data('original-name');
        const hasBorder = false; // 🟢 ตั้งค่า default: false = ไม่มีกรอบ

        try {
            showLoader();

            const file = await getFile({
                baseDir: baseDir,
                storedName: storedName,
                originalName: originalName,
                mode: 'open',
            });

            const formData = new FormData();
            formData.append('file', file, originalName);
            formData.append('no', form.NFRMNO);
            formData.append('orgNo', form.VORGNO);
            formData.append('y', form.CYEAR);
            formData.append('y2', form.CYEAR2);
            formData.append('runNo', form.NRUNNO);
            formData.append('origName', originalName);
            formData.append('hasBorder', hasBorder ? '1' : '0');

            const response = await fetch(
                host + 'feform/FE-DOC/form/StampExcelDirect',
                {
                    method: 'POST',
                    body: formData,
                },
            );

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(
                    errData.message ||
                        'เซิร์ฟเวอร์เกิดข้อผิดพลาดในการ Stamp Excel (HTTP ' +
                            response.status +
                            ')',
                );
            }

            const stampedBlob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(stampedBlob);

            // ดาวน์โหลดไฟล์ Excel
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = 'Stamped_' + originalName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (err) {
            console.error('Download Stamped Excel error:', err);
            alert('เกิดข้อผิดพลาดในการทำตรายาง Excel: ' + err.message);
        } finally {
            showLoader({ show: false });
        }
    });

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

    // นามสกุลที่อนุญาต และ MIME Types ของ Excel + PDF
    const allowedExtensions = ['pdf', 'xlsx', 'xls'];
    const allowedMimeTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
    ];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split('.').pop().toLowerCase();

        // ตรวจสอบทั้งนามสกุลไฟล์ และ MIME type
        const isValidExt = allowedExtensions.includes(ext);
        const isValidMime =
            allowedMimeTypes.includes(file.type) || file.type === '';

        if (!isValidExt && !isValidMime) {
            hasInvalid = true;
            continue;
        }

        selectedFilesArray.push(file);
        let idx = selectedFilesArray.length - 1;
        let fileSize = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

        // แยกสี Badge ระหว่าง PDF กับ EXCEL
        const isPdf = ext === 'pdf';
        const badgeColor = isPdf
            ? 'text-rose-500 bg-rose-50 border-rose-200'
            : 'text-emerald-600 bg-emerald-50 border-emerald-200';
        const badgeText = isPdf ? 'PDF' : 'EXCEL';

        let html = `
            <li class="flex items-center justify-between py-2 px-3 text-sm" id="file-item-${idx}">
                <div class="flex items-center gap-2 truncate">
                    <span class="${badgeColor} font-bold text-xs px-1.5 py-0.5 rounded border">${badgeText}</span>
                    <span class="font-medium text-slate-700 truncate">${file.name}</span>
                    <span class="text-xs text-slate-400">(${fileSize})</span>
                </div>
                <button type="button" class="btn-remove-selected-file text-rose-500 font-bold text-xs cursor-pointer" data-index="${idx}">Remove</button>
            </li>`;
        $('#selected-files-list').append(html);
    }

    if (hasInvalid) {
        alert('ระบบรองรับเฉพาะไฟล์ PDF, XLSX และ XLS เท่านั้น');
    }

    if (selectedFilesArray.filter(Boolean).length > 0) {
        $('#file-list-container').removeClass('hidden');
    }
}

// 1. ปรับปรุง loadExistingFiles: เปลี่ยนเป็นปุ่มเปิดดู Preview แท็บใหม่
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
                    if (!fullFilePath.startsWith('//'))
                        fullFilePath = '/' + fullFilePath;

                    const ext = (file.FILE_ONAME || '')
                        .split('.')
                        .pop()
                        .toLowerCase();
                    const isPdf = ext === 'pdf';
                    const isExcel = ext === 'xlsx' || ext === 'xls';

                    const badgeHtml = isPdf
                        ? `<span class="text-rose-500 font-bold text-xs bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">PDF</span>`
                        : `<span class="text-emerald-600 font-bold text-xs bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">EXCEL</span>`;

                    // ปุ่ม Stamp Action
                    const stampBtn = isPdf
                        ? `<button type="button" class="btn-preview-file bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 font-semibold text-xs px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                                data-file-id="${file.FILE_ID}" data-base-dir="${formattedBaseDir}" data-stored-name="${file.FILE_FNAME}" data-original-name="${file.FILE_ONAME}">
                                👁️ Preview Stamp
                           </button>`
                        : `<button type="button" class="btn-stamp-excel bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-semibold text-xs px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                                data-file-id="${file.FILE_ID}" data-base-dir="${formattedBaseDir}" data-stored-name="${file.FILE_FNAME}" data-original-name="${file.FILE_ONAME}">
                                📑 Download Stamped
                           </button>`;

                    // 🟢 เปลี่ยนจากดาวน์โหลดลงเครื่อง เป็นปุ่ม "เปิดดูไฟล์ต้นฉบับในแท็บใหม่"
                    const viewOriginalBtn = `
                        <button type="button" class="btn-open-file bg-slate-100 hover:bg-slate-700 hover:text-white text-slate-600 font-semibold text-xs px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                                data-base-dir="${formattedBaseDir}" data-stored-name="${file.FILE_FNAME}" data-original-name="${file.FILE_ONAME}">
                            🔗 Open File
                        </button>`;

                    const deleteBtn = isRequester
                        ? `<button type="button" class="btn-delete-file text-rose-500 hover:text-rose-700 font-bold text-xs px-2 cursor-pointer transition-colors" 
                                data-id="${file.FILE_ID}" data-path="${fullFilePath}">
                            🗑️ Delete
                           </button>`
                        : '';

                    let itemHtml = `
                        <li class="flex items-center justify-between py-2.5 px-3 text-sm hover:bg-slate-50 transition-colors" id="uploaded-file-${file.FILE_ID}">
                            <div class="flex items-center gap-2.5 truncate">
                                ${badgeHtml}
                                <span class="font-medium text-slate-700 truncate">${file.FILE_ONAME}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                ${stampBtn}
                                ${viewOriginalBtn}
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
// ตัวอย่างการเรียกใช้ (default: hasBorder = false ไม่มีกรอบ)
async function previewStampedPdfWithPdfLib(fileObj, form, hasBorder = false) {
    try {
        showLoader();

        // 1. ดึง Step และ Log
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

        if (!stampRes?.status)
            throw new Error(
                stampRes?.message || 'ไม่สามารถดึงข้อมูล Stamp ได้',
            );

        // 2. ดึงไฟล์ PDF ผ่าน API กลาง
        const file = await getFile({
            baseDir: (fileObj.FILE_PATH || '').replace(/\\/g, '/'),
            storedName: fileObj.FILE_FNAME,
            originalName: fileObj.FILE_ONAME,
            mode: 'open',
        });

        // 3. เรียก Library กลาง (ส่ง hasBorder เข้าไปได้เลย)
        const pdfBytes = await stampPdfDocument(
            file,
            stampRes.steps,
            stampRes.logs,
            {
                hasBorder: hasBorder, // false = มีแต่วงกลม Stamp ไม่มีกรอบตารางครอบ
            },
        );

        // 4. เปิดในแท็บใหม่
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
    } catch (err) {
        console.error('Preview Stamped Error:', err);
        alert('เกิดข้อผิดพลาด: ' + (err.message || 'Unknown error'));
    } finally {
        showLoader({ show: false });
    }
}
