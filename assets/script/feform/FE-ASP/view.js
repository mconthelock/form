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
    currentPrevFile,
    initFormControls,
    loadDepartmentDropdown,
    loadSectionDropdown,
    applyReviewPeriodRules,
    bindEmpSearchEvent,
    fetchEmpNameAndOrg,
    populateSavedDetails,
    buildSavePayload,
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

    // 1. กำหนดค่าเริ่มต้น Request By และ Input By
    const initialReq = (
        $('#REQUEST_BY_EMPNO').val() ||
        formData.reqby ||
        empno
    ).toString();
    const initialInput = (
        $('#INPUT_BY_EMPNO').val() ||
        formData.inputby ||
        empno
    ).toString();

    $('#REQUEST_BY_EMPNO').val(initialReq);
    $('#INPUT_BY_EMPNO').val(initialInput);

    // 2. ผูกฟังก์ชันการทำงานพื้นฐานของ Form
    bindEmpSearchEvent();
    initFormControls();
    applyReviewPeriodRules();

    const isCreateMode = !$('#DocHeaderIDHid').val() && !form.NRUNNO;

    if (isCreateMode) {
        // หน้า Create: โหลดสังกัดและ Default Select ตามผู้สร้าง/Request By
        if (initialReq && initialReq.length === 5) {
            await fetchEmpNameAndOrg(initialReq);
        }
    } else {
        // หน้า Edit / View: โหลดสังกัดตาม Snapshot ใน Header เดิม
        const currentDivCode = $('#SDIVCODEHid').val();
        const currentDepCode = $('#DeptDrp').val();
        const currentSecCode = $('#SecDrp').val();

        if (currentDivCode) {
            await loadDepartmentDropdown(currentDivCode, currentDepCode);
            if (currentDepCode) {
                await loadSectionDropdown(currentDepCode, currentSecCode);
            }
        }
    }

    // 3. ป้อนคำตอบตารางประเมินเดิม (ถ้ามี)
    populateSavedDetails(window.INITIAL_SAVED_DETAILS || []);

    // 4. ผูก Flow Bar และควบคุมสิทธิ์ของปุ่ม
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
    $(document).on('click', '#btn-open-prev-file', async function () {
        if (!currentPrevFile) return;
        try {
            await showLoader({ show: true });
            const file = await getFile({
                baseDir: (currentPrevFile.FILE_PATH || '').replace(/\\/g, '/'),
                storedName: currentPrevFile.FILE_FNAME,
                originalName: currentPrevFile.FILE_ONAME,
                mode: 'open',
            });
            const blobUrl = URL.createObjectURL(file);
            window.open(blobUrl, '_blank');
            setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
        } catch (err) {
            console.error(err);
            showErrorMessage('เปิดไฟล์ไม่สำเร็จ');
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
});

/**
 * บันทึกเอกสารผ่าน saveDocMaster และอัปโหลดไฟล์ผ่าน NestJS API
 */
async function executeSaveProcess(form, isDraft = false) {
    const payload = buildSavePayload(form, isDraft, empno);
    if (!payload) return null;

    const validFiles = selectedFilesArray.filter((f) => f !== null);

    try {
        await showLoader({ show: true });
        const resHeader = await saveDocMaster(payload);
        if (!resHeader || !resHeader.status) {
            throw new Error(resHeader?.message || 'บันทึกข้อมูลไม่สำเร็จ');
        }

        const createdDoc = resHeader.data || {};
        form.NFRMNO = createdDoc.NFRMNO || form.NFRMNO;
        form.VORGNO = createdDoc.VORGNO || form.VORGNO;
        form.CYEAR = createdDoc.CYEAR || form.CYEAR;
        form.CYEAR2 = createdDoc.CYEAR2 || form.CYEAR2;
        form.NRUNNO = createdDoc.NRUNNO || form.NRUNNO;
        $('#DocHeaderIDHid').val(createdDoc.DOC_HEADER_ID);

        // ส่งไฟล์ผ่าน NestJS API เข้า Storage กลาง
        if (validFiles.length > 0) {
            let nestData = new FormData();
            nestData.append('NFRMNO', form.NFRMNO);
            nestData.append('VORGNO', form.VORGNO);
            nestData.append('CYEAR', form.CYEAR);
            nestData.append('CYEAR2', form.CYEAR2);
            nestData.append('NRUNNO', form.NRUNNO);
            nestData.append('CREATEBY', empno);
            nestData.append('FORM_TYPE', 'FE');
            validFiles.forEach((file) => nestData.append('files', file));

            const resFile = await uploadDocFiles(nestData);
            if (!resFile || !resFile.status) {
                throw new Error(resFile?.message || 'อัปโหลดไฟล์แนบไม่สำเร็จ');
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
