import $ from 'jquery';
import { redirectWebflow } from '@amec/webasset/form';
import { showLoader } from '@amec/webasset/preloader';
import { host } from '../../utils';
import { uploadDocFiles, saveDocMaster, getFilesDisplay } from './data';
import { initFlow } from './flow';

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
    $('#SaveDocBtn').on('click', async function () {
        const docType = $('#DocTypeDrp').val();
        if (!docType) {
            alert('กรุณาเลือก Document Type');
            return;
        }

        const validFiles = selectedFilesArray.filter((f) => f !== null);
        if ($('#DocHeaderIDHid').val() === '' && validFiles.length === 0) {
            alert('กรุณาแนบไฟล์เอกสาร PDF อย่างน้อย 1 ไฟล์');
            return;
        }

        if (
            !confirm('ยืนยันการบันทึกและส่งเอกสารเข้าระบบ Approval ใช่หรือไม่?')
        ) {
            return;
        }

        try {
            showLoader();

            let headerPayload = new FormData();
            headerPayload.append('DOC_TYPE_CODE', docType);
            headerPayload.append('REMARK', $('#RemarkTxt').val() || '');
            headerPayload.append('EMPNO', empno);
            headerPayload.append('DOC_HEADER_ID', $('#DocHeaderIDHid').val());

            const resHeader = await saveDocMaster(headerPayload);
            if (!resHeader || !resHeader.status) {
                throw new Error(
                    resHeader?.message || 'บันทึกข้อมูลเอกสารไม่สำเร็จ',
                );
            }

            const createdDoc = resHeader.data || {};

            // อัปโหลดไฟล์ผ่าน NestJS API
            if (validFiles.length > 0) {
                let nestJsData = new FormData();
                nestJsData.append('NFRMNO', createdDoc.NFRMNO || form.NFRMNO);
                nestJsData.append('VORGNO', createdDoc.VORGNO || form.VORGNO);
                nestJsData.append('CYEAR', createdDoc.CYEAR || form.CYEAR);
                nestJsData.append('CYEAR2', createdDoc.CYEAR2 || form.CYEAR2);
                nestJsData.append('NRUNNO', createdDoc.NRUNNO || form.NRUNNO);
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

            alert(resHeader.message || 'บันทึกเอกสารและอัปโหลดไฟล์สำเร็จ');
            redirectWebflow();
        } catch (err) {
            console.error('Save & Upload Error:', err);
            alert('เกิดข้อผิดพลาด: ' + err.message);
        } finally {
            showLoader({ show: false });
        }
    });

    // ปุ่ม Preview Stamped PDF
    $(document).on('click', '#PreviewPdfBtn', function () {
        const url =
            host +
            `feform/FE-DOC/form/PreviewStampedPdf?no=${form.NFRMNO}&orgNo=${form.VORGNO}&y=${form.CYEAR}&y2=${form.CYEAR2}&runNo=${form.NRUNNO}`;
        window.open(url, '_blank');
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
    const mode = $('#MODEHid').val() || '1'; // 🟢 ดึงค่า mode จาก Hidden Input แทน
    let isRequester = false;

    // เช็คสิทธิ์ว่าเป็นคนสร้างเอกสารหรือไม่
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
                    let downloadUrl =
                        host +
                        'feform/FE-DOC/form/DownloadFile?id=' +
                        file.FILE_ID;

                    // แสดงปุ่ม Delete เมื่อผู้เปิดเป็น Requester
                    let deleteBtn = isRequester
                        ? `<button type="button" 
                                   class="btn-delete-file text-rose-500 hover:text-rose-700 font-bold text-xs px-2 cursor-pointer transition-colors" 
                                   data-id="${file.FILE_ID}">
                               🗑️ Delete
                           </button>`
                        : '';

                    let itemHtml = `
                        <li class="flex items-center justify-between py-2.5 px-3 text-sm hover:bg-slate-50 transition-colors" id="uploaded-file-${file.FILE_ID}">
                            <div class="flex items-center gap-2.5 truncate">
                                <span class="text-rose-500 font-bold text-xs bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">PDF</span>
                                <span class="font-medium text-slate-700 truncate">${file.FILE_ONAME}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <a href="${downloadUrl}" target="_blank" class="bg-slate-100 hover:bg-primary hover:text-white text-slate-600 font-semibold text-xs px-2.5 py-1.5 rounded-lg transition-all">
                                    ⬇️ Download
                                </a>
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
$(document).on('click', '.btn-delete-file', function () {
    const fileId = $(this).data('id');
    if (!confirm('ยืนยันการลบไฟล์แนบนี้ใช่หรือไม่?')) return;

    showLoader();
    $.ajax({
        url: host + 'feform/FE-DOC/form/DeleteFile',
        type: 'POST',
        data: { id: fileId },
        dataType: 'json',
        success: function (res) {
            if (res && res.status) {
                $(`#uploaded-file-${fileId}`).remove();
                if ($('#uploaded-files-list li').length === 0) {
                    $('#download-zone').addClass('hidden');
                }
            } else {
                alert('ไม่สามารถลบไฟล์ได้: ' + (res?.message || ''));
            }
        },
        error: function () {
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อเพื่อลบไฟล์');
        },
        complete: function () {
            showLoader({ show: false });
        },
    });
});
