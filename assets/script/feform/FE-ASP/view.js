import $ from 'jquery';
import { redirectWebflow } from '@amec/webasset/form';
import { showLoader } from '@amec/webasset/preloader';
import { deleteFile, getFile } from '@amec/webasset/api/file';
import {
    showMessage,
    showErrorMessage,
    showConfirm,
} from '@amec/webasset/utils';
import { host } from '../../utils';
import { uploadDocFiles, saveDocMaster } from './data';
import { initFlow, actionFlow } from './flow';
import {
    getCurrentPrevFiles,
    initFormControls,
    loadSectionDropdown,
    applyReviewPeriodRules,
    bindEmpSearchEvent,
    fetchEmpNameAndOrg,
    populateSavedDetails,
    buildSavePayload,
    renderPrevFile,
} from './form';
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

    $('#DOC_IDTxt').val(form.DOC_NO);
    $('#DocHeaderIDHid').val(formData.doc_header_id || '');

    // ผูก Event คอนโทรลหน้าจอ
    bindEmpSearchEvent();
    initFormControls();
    applyReviewPeriodRules();

    // เติมคำตอบตารางประเมินเดิม (ถ้ามี)
    populateSavedDetails(window.INITIAL_SAVED_DETAILS || []);

    // เริ่มต้นระบบ Flow
    await initFlow(form, formData.status);

    if (form.NRUNNO) {
        loadExistingFiles();
    }

    setTimeout(function () {
        $('.load').addClass('hidden');
        $('#form').removeClass('hidden');
    }, 10);

    initFileDropEvents();

    // --------------------------------------------------------
    // ปุ่ม SAVE DRAFT (บันทึกแบบร่าง)
    // --------------------------------------------------------
    $('#btnSaveDraft').on('click', async function () {
        const isConfirm = await showConfirm({
            title: 'ยืนยันการบันทึกแบบร่าง',
            message: 'ต้องการบันทึกข้อมูลแบบร่าง ใช่หรือไม่?',
            acceptText: 'บันทึก',
            cancelText: 'ยกเลิก',
        });
        if (isConfirm) await executeSaveProcess(form, true);
    });

    // --------------------------------------------------------
    // ปุ่ม SUBMIT DOCUMENT (ส่งเข้าสายอนุมัติ)
    // --------------------------------------------------------
    $('#SaveDocBtn').on('click', async function () {
        const reviewDetails = $('input[name="REVIEW_DETAILS"]:checked').val();
        const existingFileCount = $('#uploaded-files-list li').length;
        const validFiles = selectedFilesArray.filter((f) => f !== null);

        if (
            reviewDetails === 'CHANGE' &&
            existingFileCount === 0 &&
            validFiles.length === 0
        ) {
            showMessage(
                'กรณีเลือก CHANGE บังคับต้องแนบไฟล์ PDF Revision ใหม่',
                'warning',
            );
            return;
        }

        const isConfirm = await showConfirm({
            title: 'ยืนยันการส่งเอกสาร',
            message: 'ต้องการส่งเอกสารเข้าสู่สายอนุมัติ ใช่หรือไม่?',
            acceptText: 'ส่งเอกสาร',
            cancelText: 'ยกเลิก',
        });
        if (!isConfirm) return;

        const resSave = await executeSaveProcess(form, false);
        if (resSave && resSave.status) {
            const isResubmit = !!($('#DocHeaderIDHid').val() && form.NRUNNO);
            if (isResubmit) {
                await actionFlow('approve', form);
            } else {
                showMessage('สร้างและส่งเอกสารเรียบร้อยแล้ว', 'success');
                setTimeout(() => redirectWebflow(), 1200);
            }
        }
    });

    // --------------------------------------------------------
    // ปุ่มเปิดดู Active Revision เดิม
    // --------------------------------------------------------
    $(document).on('click', '.btn-open-prev-file', async function (e) {
        e.preventDefault();
        const baseDir = $(this).data('base-dir');
        const storedName = $(this).data('stored-name');
        const originalName = $(this).data('original-name') || 'document.pdf';

        if (!storedName) {
            showErrorMessage('ไม่พบข้อมูลไฟล์');
            return;
        }

        try {
            await showLoader({ show: true });
            const file = await getFile({
                baseDir: baseDir,
                storedName: storedName,
                originalName: originalName,
                mode: 'open',
            });

            const blobUrl = URL.createObjectURL(file);
            window.open(blobUrl, '_blank');
            setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
        } catch (err) {
            console.error('Open prev file error:', err);
            showErrorMessage('เกิดข้อผิดพลาดในการเปิดไฟล์');
        } finally {
            await showLoader({ show: false });
        }
    });

    // --------------------------------------------------------
    // ปุ่มเปิดดูไฟล์แนบใหม่
    // --------------------------------------------------------
    $(document).on('click', '.btn-open-file', async function (e) {
        e.preventDefault();
        const baseDir = $(this).data('base-dir');
        const storedName = $(this).data('stored-name');
        const originalName = $(this).data('original-name') || 'document.pdf';

        try {
            await showLoader({ show: true });
            const file = await getFile({
                baseDir: baseDir,
                storedName: storedName,
                originalName: originalName,
                mode: 'open',
            });
            const blobUrl = URL.createObjectURL(file);
            window.open(blobUrl, '_blank');
            setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
        } catch (err) {
            console.error(err);
            showErrorMessage('เกิดข้อผิดพลาดในการเปิดไฟล์');
        } finally {
            await showLoader({ show: false });
        }
    });

    // --------------------------------------------------------
    // ปุ่มลบไฟล์แนบใหม่
    // --------------------------------------------------------
    $(document).on('click', '.btn-delete-file', async function () {
        const fileId = $(this).data('id');
        const filePath = $(this).data('path');

        const isConfirm = await showConfirm({
            title: 'ยืนยันการลบไฟล์',
            message: 'ต้องการลบไฟล์แนบนี้ ใช่หรือไม่?',
            acceptText: 'ยืนยัน',
            cancelText: 'ยกเลิก',
        });
        if (!isConfirm) return;

        try {
            await showLoader({ show: true });
            try {
                await deleteFile(filePath);
            } catch (e) {}

            const res = await $.ajax({
                url: host + 'feform/FE-ASP/form/DeleteFile',
                type: 'POST',
                data: { id: fileId },
                dataType: 'json',
            });

            if (res && res.status) {
                $(`#uploaded-file-${fileId}`).remove();
                if ($('#uploaded-files-list li').length === 0) {
                    $('#download-zone').addClass('hidden');
                }
                showMessage('ลบไฟล์เรียบร้อยแล้ว', 'success');
            }
        } catch (e) {
            showErrorMessage('เกิดข้อผิดพลาดในการลบไฟล์');
        } finally {
            await showLoader({ show: false });
        }
    });

    // --------------------------------------------------------
    // โหมดสร้างเอกสารใหม่: เรนเดอร์กล่อง Active Revision ของ Control No. ตัวแรกทันที
    // --------------------------------------------------------
    if (!form.NRUNNO && $('#ControlNoDrp').val()) {
        const initPrev = window.INITIAL_PREV_FILE;
        if (initPrev && initPrev.header) {
            renderPrevFile(initPrev);
        } else {
            $('#ControlNoDrp').trigger('change');
        }
    }

    // --------------------------------------------------------
    // ปุ่มทดสอบส่ง Email แจ้งเตือน PIC (sendNotifyEmailToPic)
    // --------------------------------------------------------
    $('#btnTestSendEmail')
        .off('click')
        .on('click', async function () {
            // เช็คว่ามี NRUNNO หรือยัง (ต้องเป็นฟอร์มที่ถูกสร้างแล้ว)
            if (!form.NRUNNO) {
                showErrorMessage(
                    'ยังไม่มีเลขที่เอกสาร (NRUNNO) กรุณาบันทึกแบบร่างก่อนทดสอบส่งอีเมล',
                );
                return;
            }

            const targetEmpNo = (
                $('#REQUEST_BY_EMPNO').val() ||
                $('#EMPNOHid').val() ||
                empno ||
                '13204'
            ).trim();

            const selectedControlNo = ($('#ControlNoDrp').val() || '').trim();

            const isConfirm = await showConfirm({
                title: '🧪 ทดสอบส่งอีเมลแจ้งเตือน PIC',
                message: `ต้องการทดสอบส่งอีเมล (เอกสาร: ${form.DOC_NO || 'Doc'})\nไปยัง siripapa@mitsubishielevatorasia.co.th ใช่หรือไม่?`,
                acceptText: 'ส่งอีเมลทดสอบ',
                cancelText: 'ยกเลิก',
            });
            if (!isConfirm) return;

            try {
                await showLoader({ show: true });
                const res = await $.ajax({
                    url: `${host}feform/FE-ASP/batch/ajax_test_send_email`,
                    type: 'POST',
                    data: {
                        NFRMNO: form.NFRMNO,
                        VORGNO: form.VORGNO,
                        CYEAR: form.CYEAR,
                        CYEAR2: form.CYEAR2,
                        NRUNNO: form.NRUNNO,
                        DOC_NO: form.DOC_NO,
                        empno: targetEmpNo,
                        controlNo: selectedControlNo,
                    },
                    dataType: 'json',
                });

                if (res && res.status) {
                    showMessage(
                        res.message ||
                            'ส่งอีเมลแจ้งเตือนทดสอบสำเร็จ กรุณาตรวจสอบกล่องข้อความ',
                        'success',
                    );
                } else {
                    showErrorMessage(res?.message || 'ส่งอีเมลไม่สำเร็จ');
                }
            } catch (err) {
                showErrorMessage(
                    'เกิดข้อผิดพลาดในการเชื่อมต่อ: ' +
                        (err.responseJSON?.message || err.statusText),
                );
            } finally {
                await showLoader({ show: false });
            }
        });

    // --------------------------------------------------------
    // ปุ่ม Manual Test Generate Cover PDF (สร้างผ่าน PHP TCPDF)
    // --------------------------------------------------------
    $('#btnTestGeneratePdf')
        .off('click')
        .on('click', function () {
            const controlNo = $('#ControlNoDrp').val() || '';
            const reviewPeriod =
                $('input[name="REVIEW_PERIOD"]:checked').val() || 'YEARLY';
            const reviewDetails =
                $('input[name="REVIEW_DETAILS"]:checked').val() || 'NO_CHANGE';
            const detailChange = encodeURIComponent(
                $('#DetailChangeTxt').val() || '',
            );
            const effectStatus =
                $('input[name="EFFECT_STATUS"]:checked').val() || 'NO_EFFECT';

            const testUrl = `${host}feform/FE-ASP/form/preview_cover_pdf?controlNo=${encodeURIComponent(controlNo)}&reviewPeriod=${reviewPeriod}&reviewDetails=${reviewDetails}&detailChange=${detailChange}&effectStatus=${effectStatus}`;

            window.open(testUrl, '_blank');
        });
});

/**
 * บันทึกเอกสารผ่าน saveDocMaster และอัปโหลดไฟล์ผ่าน NestJS API
 */
async function executeSaveProcess(form, isDraft = false) {
    const payload = buildSavePayload(form, isDraft, empno);
    if (!payload) return null;

    try {
        await showLoader({ show: true });

        // 1. บันทึกข้อมูล Master และสั่ง PHP สร้างไฟล์ Cover PDF ลงโฟลเดอร์ชั่วคราว
        const resHeader = await saveDocMaster(payload);
        if (!resHeader || !resHeader.status) {
            throw new Error(resHeader?.message || 'บันทึกข้อมูลไม่สำเร็จ');
        }

        const createdDoc = resHeader.data || {};
        const targetForm = {
            NFRMNO: createdDoc.NFRMNO || form.NFRMNO,
            VORGNO: createdDoc.VORGNO || form.VORGNO,
            CYEAR: createdDoc.CYEAR || form.CYEAR,
            CYEAR2: createdDoc.CYEAR2 || form.CYEAR2,
            NRUNNO: createdDoc.NRUNNO || form.NRUNNO,
        };

        $('#DocHeaderIDHid').val(createdDoc.DOC_HEADER_ID);
        form.NRUNNO = targetForm.NRUNNO;
        form.CYEAR2 = targetForm.CYEAR2;

        // 2. เตรียมรายการไฟล์แนบที่ผู้ใช้เลือกมา
        let filesToUpload = selectedFilesArray.filter((f) => f !== null);

        // 3. รวมไฟล์ Cover PDF ที่ PHP สร้างไว้เข้าเป็นไฟล์แรก
        let hasCoverFile = false;
        if (!isDraft && resHeader.coverFile && resHeader.coverFile.fileUrl) {
            try {
                const coverRes = await fetch(
                    resHeader.coverFile.fileUrl + '?t=' + Date.now(),
                );
                if (coverRes.ok) {
                    const coverBlob = await coverRes.blob();
                    const coverFile = new File(
                        [coverBlob],
                        resHeader.coverFile.fileName,
                        { type: 'application/pdf' },
                    );
                    filesToUpload.unshift(coverFile);
                    hasCoverFile = true;
                }
            } catch (errCover) {
                console.warn('Cannot fetch cover file to upload:', errCover);
            }
        }

        // 4. ส่งไฟล์ทั้งหมดผ่าน NestJS API (uploadDocFiles) ส่วนกลาง
        if (filesToUpload.length > 0) {
            let nestJsData = new FormData();
            nestJsData.append('NFRMNO', targetForm.NFRMNO);
            nestJsData.append('VORGNO', targetForm.VORGNO);
            nestJsData.append('CYEAR', targetForm.CYEAR);
            nestJsData.append('CYEAR2', targetForm.CYEAR2);
            nestJsData.append('NRUNNO', targetForm.NRUNNO);
            nestJsData.append('CREATEBY', empno);
            nestJsData.append('FORM_TYPE', 'FE');
            nestJsData.append(
                'PATH',
                '\\amecnas\\AMECWEB\\File\\development\\Form\\FE\\AMEC-AR\\' +
                    form.DOC_NO,
            );

            filesToUpload.forEach((file) => nestJsData.append('files', file));

            const resFile = await uploadDocFiles(nestJsData);
            if (!resFile || !resFile.status) {
                throw new Error(resFile?.message || 'อัปโหลดไฟล์ไม่สำเร็จ');
            }

            // 5. ✅ เมื่อบันทึกเข้าส่วนกลางสำเร็จแล้ว ลบไฟล์ Cover Sheet ออกจาก assets/upload/fe_asp/ ทันที
            if (hasCoverFile && resHeader.coverFile?.fileName) {
                try {
                    await $.ajax({
                        url: host + 'feform/FE-ASP/form/deleteTempCoverFile',
                        type: 'POST',
                        data: { fileName: resHeader.coverFile.fileName },
                        dataType: 'json',
                    });
                } catch (delErr) {
                    console.warn('Cannot delete temporary cover file:', delErr);
                }
            }
        }

        if (isDraft) {
            showMessage('บันทึกแบบร่างสำเร็จ', 'success');
        }

        return resHeader;
    } catch (err) {
        showErrorMessage(err?.message || 'เกิดข้อผิดพลาดในการบันทึก');
        return null;
    } finally {
        await showLoader({ show: false });
    }
}

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
        $(this).addClass('border-emerald-500 bg-emerald-50/40');
    });

    $('#drop-zone').on('dragleave dragend drop', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass('border-emerald-500 bg-emerald-50/40');
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
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (
            !file.name.toLowerCase().endsWith('.pdf') &&
            file.type !== 'application/pdf'
        ) {
            showMessage('ระบบรองรับเฉพาะไฟล์ PDF (.pdf) เท่านั้น', 'warning');
            continue;
        }

        selectedFilesArray.push(file);
        let idx = selectedFilesArray.length - 1;

        let html = `
            <li class="flex items-center justify-between py-1.5 px-2 text-xs" id="file-item-${idx}">
                <div class="flex items-center gap-2 truncate">
                    <span class="text-rose-500 font-bold bg-rose-50 px-1 py-0.5 rounded border border-rose-200">PDF</span>
                    <span class="font-medium text-slate-700 truncate">${file.name}</span>
                </div>
                <button type="button" class="btn-remove-selected-file text-rose-500 font-bold ml-2 cursor-pointer" data-index="${idx}">Remove</button>
            </li>`;
        $('#selected-files-list').append(html);
    }

    if (selectedFilesArray.filter(Boolean).length > 0) {
        $('#file-list-container').removeClass('hidden');
    }
}

function renderFileList(files) {
    const formData = $('.form-info').data() || {};
    const mode = $('#MODEHid').val() || '1';
    let isRequester = false;
    const isSuperAdmin = empno === '13204';

    if (mode === '1' || mode === '2') {
        const reqBy = (
            $('#REQUEST_BY_EMPNO').val() ||
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

            const viewBtn = `
                <button type="button" class="btn-open-file bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-semibold text-xs px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                        data-base-dir="${formattedBaseDir}" data-stored-name="${file.FILE_FNAME}" data-original-name="${file.FILE_ONAME}">
                    📄 Open / Download File
                </button>`;

            const deleteBtn =
                isRequester || isSuperAdmin
                    ? `<button type="button" class="btn-delete-file text-rose-500 hover:text-rose-700 font-bold text-xs px-2 cursor-pointer transition-colors" data-id="${file.FILE_ID}" data-path="${fullFilePath}">
                           🗑️ Delete
                       </button>`
                    : '';

            let itemHtml = `
                <li class="flex items-center justify-between py-2 px-3 text-xs hover:bg-slate-50 transition-colors" id="uploaded-file-${file.FILE_ID}">
                    <div class="flex items-center gap-2 truncate">
                        <span class="text-rose-500 font-bold bg-rose-50 px-1 py-0.5 rounded border border-rose-200">PDF</span>
                        <span class="font-medium text-slate-700 truncate">${file.FILE_ONAME}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        ${viewBtn}
                        ${deleteBtn}
                    </div>
                </li>`;
            $list.append(itemHtml);
        });
    } else {
        $('#download-zone').addClass('hidden');
    }
}

export function loadExistingFiles() {
    if (
        Array.isArray(window.INITIAL_ATTACHED_FILES) &&
        window.INITIAL_ATTACHED_FILES.length > 0
    ) {
        renderFileList(window.INITIAL_ATTACHED_FILES);
        return;
    }

    const formData = $('.form-info').data() || {};
    $.ajax({
        url: host + 'feform/FE-ASP/form/GetFilesDisplay',
        type: 'POST',
        dataType: 'json',
        data: {
            NFRMNO: formData.nfrmno,
            VORGNO: formData.vorgno,
            CYEAR2: formData.cyear2,
            NRUNNO: formData.nrunno,
        },
        success: function (res) {
            if (res?.status && res.files) {
                renderFileList(res.files);
            }
        },
    });
}
