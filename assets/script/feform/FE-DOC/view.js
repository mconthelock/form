import $ from 'jquery';
import { redirectWebflow } from '@amec/webasset/form';
import { showLoader } from '@amec/webasset/preloader';
import { deleteFile, getFile } from '@amec/webasset/api/file';
import { host } from '../../utils';
import { uploadDocFiles, saveDocMaster } from './data';
import { initFlow, actionFlow } from './flow';
import { stampPdfDocument } from './pdfStamper';
import { convertExcelToPdfBuffer } from './excelConverter';

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
    $('#REQUEST_BYTxt').val(formData.reqby || empno);
    $('#INPUT_BYTxt').val(formData.inputby || empno);
    $('#DocHeaderIDHid').val(formData.doc_header_id || '');

    // เริ่มต้นระบบ Flow & Permissions จากไฟล์ flow.js
    await initFlow(form, formData.status);

    // แสดงรายการไฟล์ทันที (ถ้ามี INITIAL_ATTACHED_FILES จะไม่ยิง AJAX)
    if (form.NRUNNO) {
        loadExistingFiles();
    }

    setTimeout(function () {
        $('.load').addClass('hidden');
        $('#form').removeClass('hidden');
    }, 10);

    // Event จัดการเลือกไฟล์แนบ
    initFileDropEvents();

    // ปุ่มบันทึกเอกสาร & อัปโหลดไฟล์ / ส่งซ้ำหลังโดน Return
    $('#SaveDocBtn').on('click', async function () {
        const docHeaderId = $('#DocHeaderIDHid').val();
        const isResubmit = !!(docHeaderId && form.NRUNNO);

        const docType = $('#DocTypeDrp').val();
        if (!docType) {
            alert('กรุณาเลือก Document Type');
            return;
        }

        const existingFileCount = $('#uploaded-files-list li').length;
        const validFiles = selectedFilesArray.filter((f) => f !== null);

        if (existingFileCount === 0 && validFiles.length === 0) {
            alert('กรุณาแนบไฟล์เอกสาร PDF หรือ Excel อย่างน้อย 1 ไฟล์');
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
                let headerPayload = new FormData();
                headerPayload.append('DOC_TYPE_CODE', docType);
                headerPayload.append('REMARK', $('#RemarkTxt').val() || '');
                const userEmpNo =
                    empno ||
                    $('#REQUEST_BYTxt').val() ||
                    $('#EMPNOHid').val() ||
                    '';
                headerPayload.append('EMPNO', userEmpNo);
                headerPayload.append('REQBY', userEmpNo);

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

            // อัปโหลดไฟล์ใหม่เข้า Storage
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

    // ปุ่ม Preview Stamp สำหรับไฟล์ PDF และ Excel
    $(document).on('click', '.btn-preview-file', async function (e) {
        e.preventDefault();

        const fileObj = {
            FILE_ID: $(this).data('file-id'),
            FILE_PATH: $(this).data('base-dir'),
            FILE_FNAME: $(this).data('stored-name'),
            FILE_ONAME: $(this).data('original-name'),
        };
        const orientation = $(this).data('orientation') || 'auto';

        await previewStampedPdfWithPdfLib(fileObj, form, false, orientation);
    });

    // ปุ่มเปิดดูไฟล์ต้นฉบับในแท็บใหม่
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

            const blobUrl = URL.createObjectURL(file);
            window.open(blobUrl, '_blank');
        } catch (err) {
            console.error('Open file error:', err);
            alert('เกิดข้อผิดพลาดในการเปิดไฟล์: ' + err.message);
        } finally {
            showLoader({ show: false });
        }
    });

    // ปุ่มลบไฟล์แนบ
    $(document).on('click', '.btn-delete-file', async function () {
        const fileId = $(this).data('id');
        const filePath = $(this).data('path');

        if (!confirm('ยืนยันการลบไฟล์แนบนี้ใช่หรือไม่?')) return;

        showLoader();
        try {
            try {
                await deleteFile(filePath);
            } catch (apiErr) {
                console.warn('API delete physical file warning:', apiErr);
            }

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
                // สั่งล้าง cache ข้อมูลเริ่มต้น
                window.INITIAL_ATTACHED_FILES = null;
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

    const allowedExtensions = ['pdf', 'xlsx', 'xls'];
    const allowedMimeTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
    ];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split('.').pop().toLowerCase();

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

// ฟังก์ชันวาด DOM รายการไฟล์
// ปรับปรุงในส่วน renderFileList():
function renderFileList(files) {
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
    $list.empty();

    if (files && files.length > 0) {
        $('#download-zone').removeClass('hidden');

        files.forEach(function (file) {
            const formattedBaseDir = (file.FILE_PATH || '').replace(/\\/g, '/');
            let fullFilePath = (
                (file.FILE_PATH || '').replace(/\\/g, '/') +
                '/' +
                file.FILE_FNAME
            ).replace(/\/+/g, '/');
            if (!fullFilePath.startsWith('//'))
                fullFilePath = '/' + fullFilePath;

            const ext = (file.FILE_ONAME || '').split('.').pop().toLowerCase();
            const isPdf = ext === 'pdf';
            const isExcel = ext === 'xlsx' || ext === 'xls';

            const badgeHtml = isPdf
                ? `<span class="text-rose-500 font-bold text-xs bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">PDF</span>`
                : isExcel
                  ? `<span class="text-emerald-600 font-bold text-xs bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">EXCEL</span>`
                  : `<span class="text-slate-500 font-bold text-xs bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">FILE</span>`;

            // ปุ่ม Preview Stamp (ถ้าเป็น Excel ให้มีปุ่มสลับแนวหน้ากระดาษเพิ่มเติม)
            let stampBtn = '';
            if (isPdf) {
                stampBtn = `
                    <button type="button" 
                            class="btn-preview-file bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 font-semibold text-xs px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                            data-file-id="${file.FILE_ID}" 
                            data-base-dir="${formattedBaseDir}" 
                            data-stored-name="${file.FILE_FNAME}" 
                            data-original-name="${file.FILE_ONAME}"
                            data-orientation="auto">
                        👁️ Preview Stamp
                    </button>`;
            } else if (isExcel) {
                stampBtn = `
                    <div class="inline-flex rounded-lg shadow-xs" role="group">
                        <button type="button" 
                                class="btn-preview-file bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 font-semibold text-xs px-2.5 py-1.5 rounded-l-lg border-r border-blue-200 transition-all cursor-pointer"
                                title="Preview Stamp (Auto Detect)"
                                data-file-id="${file.FILE_ID}" 
                                data-base-dir="${formattedBaseDir}" 
                                data-stored-name="${file.FILE_FNAME}" 
                                data-original-name="${file.FILE_ONAME}"
                                data-orientation="auto">
                            👁️ Preview
                        </button>
                        <button type="button" 
                                class="btn-preview-file bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 font-semibold text-xs px-2 py-1.5 border-r border-blue-200 transition-all cursor-pointer"
                                title="บังคับแปลงเป็น แนวนอน (Landscape)"
                                data-file-id="${file.FILE_ID}" 
                                data-base-dir="${formattedBaseDir}" 
                                data-stored-name="${file.FILE_FNAME}" 
                                data-original-name="${file.FILE_ONAME}"
                                data-orientation="landscape">
                            ↔️ แนวนอน
                        </button>
                        <button type="button" 
                                class="btn-preview-file bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 font-semibold text-xs px-2 py-1.5 rounded-r-lg transition-all cursor-pointer"
                                title="บังคับแปลงเป็น แนวตั้ง (Portrait)"
                                data-file-id="${file.FILE_ID}" 
                                data-base-dir="${formattedBaseDir}" 
                                data-stored-name="${file.FILE_FNAME}" 
                                data-original-name="${file.FILE_ONAME}"
                                data-orientation="portrait">
                            ↕️ แนวตั้ง
                        </button>
                    </div>`;
            }

            const viewOriginalBtn = `
                <button type="button" 
                        class="btn-open-file bg-slate-100 hover:bg-slate-700 hover:text-white text-slate-600 font-semibold text-xs px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                        data-base-dir="${formattedBaseDir}" 
                        data-stored-name="${file.FILE_FNAME}" 
                        data-original-name="${file.FILE_ONAME}">
                    🔗 Open File
                </button>`;

            const deleteBtn = isRequester
                ? `<button type="button" 
                           class="btn-delete-file text-rose-500 hover:text-rose-700 font-bold text-xs px-2 cursor-pointer transition-colors" 
                           data-id="${file.FILE_ID}" 
                           data-path="${fullFilePath}">
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
}

// ฟังก์ชันโหลดไฟล์ตัวเดียว: ถ้ามีแคชจาก Server แสดงผลทันที 0ms
function loadExistingFiles(forceRefresh = false) {
    if (
        !forceRefresh &&
        Array.isArray(window.INITIAL_ATTACHED_FILES) &&
        window.INITIAL_ATTACHED_FILES.length > 0
    ) {
        renderFileList(window.INITIAL_ATTACHED_FILES);
        return;
    }

    const formData = $('.form-info').data() || {};
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
            if (response?.status === true && response.files) {
                window.INITIAL_ATTACHED_FILES = response.files;
                renderFileList(response.files);
            }
        },
    });
}

// ฟังก์ชันทำ Preview Stamp
async function previewStampedPdfWithPdfLib(
    fileObj,
    form,
    hasBorder = false,
    orientation = 'auto',
) {
    try {
        showLoader();

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

        const file = await getFile({
            baseDir: (fileObj.FILE_PATH || '').replace(/\\/g, '/'),
            storedName: fileObj.FILE_FNAME,
            originalName: fileObj.FILE_ONAME,
            mode: 'open',
        });

        const ext = (fileObj.FILE_ONAME || '').split('.').pop().toLowerCase();
        let pdfSourceBuffer = null;

        if (ext === 'xlsx' || ext === 'xls') {
            // ส่งค่า orientation ('auto', 'landscape', หรือ 'portrait') ไปแปลง
            pdfSourceBuffer = await convertExcelToPdfBuffer(
                file,
                fileObj.FILE_ONAME,
                orientation,
            );
        } else {
            pdfSourceBuffer = await file.arrayBuffer();
        }

        const pdfBytes = await stampPdfDocument(
            pdfSourceBuffer,
            stampRes.steps,
            stampRes.logs,
            { hasBorder: hasBorder },
        );

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
