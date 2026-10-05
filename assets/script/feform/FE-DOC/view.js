import $ from 'jquery';
import { redirectWebflow } from '@amec/webasset/form';
import {
    getMode,
    getExtData,
    showflow,
    doaction,
    deleteFlowandForm,
} from '@amec/webasset/api/webform';
import { showLoader } from '@amec/webasset/preloader';
import { host } from '../../utils';
import { saveDocMaster, deleteDraftDoc, getFilesDisplay } from './data';

let empno = '';
let currentMode = '1';
let currentExtData = '';
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
    $('#REQUEST_BYTxt').val(form.EMPNO);
    $('#INPUT_BYTxt').val(form.EMPNO);
    $('#DocHeaderIDHid').val(formData.doc_header_id || '');

    if (!form.NRUNNO) {
        currentMode = '1';
        $('#MODEHid').val('1');
        $('#EXTDATAHid').val('');
        applyButtonPermissions('1', '', '');
    } else {
        currentMode = String(await getMode(form));
        currentExtData = String(await getExtData(form));
        $('#MODEHid').val(currentMode);
        $('#EXTDATAHid').val(currentExtData);

        applyButtonPermissions(currentMode, currentExtData, formData.status);
        loadExistingFiles();

        const flow = await showflow(form);
        $('.flow').html(flow.html);
    }

    setTimeout(function () {
        $('.load').addClass('hidden');
        $('#form').removeClass('hidden');
    }, 10);

    // File Selection & Drag & Drop
    $('#drop-zone').on('click', () => $('#files').trigger('click'));
    $(document).on('change', '#files', function () {
        handleFileSelect(this.files);
    });

    // Submit Document Action
    $('#SaveDocBtn').on('click', async function () {
        const docType = $('#DocTypeDrp').val();
        if (!docType) {
            alert('กรุณาเลือก Document Type');
            return;
        }

        const validFiles = selectedFilesArray.filter((f) => f !== null);
        // if ($('#DocHeaderIDHid').val() === '' && validFiles.length === 0) {
        //     alert('กรุณาแนบไฟล์เอกสาร (PDF หรือ Excel) อย่างน้อย 1 ไฟล์');
        //     return;
        // }

        if (
            !confirm('ยืนยันการบันทึกและส่งเอกสารเข้าระบบ Approval ใช่หรือไม่?')
        )
            return;

        let formDataPayload = new FormData();
        formDataPayload.append('DOC_TYPE_CODE', docType);
        formDataPayload.append('REMARK', $('#RemarkTxt').val());
        formDataPayload.append('EMPNO', empno);
        formDataPayload.append('DOC_HEADER_ID', $('#DocHeaderIDHid').val());

        validFiles.forEach((file) => {
            formDataPayload.append('files[]', file);
        });

        try {
            showLoader();
            const res = await saveDocMaster(formDataPayload);
            if (res.status) {
                alert(res.message);
                redirectWebflow();
            } else {
                alert('เกิดข้อผิดพลาด: ' + res.message);
            }
        } catch (err) {
            console.error(err);
            alert('ไม่สามารถบันทึกเอกสารได้');
        } finally {
            showLoader({ show: false });
        }
    });

    // Flow Action Buttons
    $(document).on('click', '#ApproveBtn', async () => actionFlow('approve'));
    $(document).on('click', '#ReturnBtn', async () => {
        if (confirm('ยืนยันการ Return เอกสารกลับผู้จัดทำใช่หรือไม่?'))
            actionFlow('return');
    });

    // Delete Action Button
    $(document).on('click', '#DeleteBtn', async function () {
        if (!confirm('ยืนยันการลบแบบฟอร์มนี้ใช่หรือไม่?')) return;

        showLoader();
        try {
            const delFlow = await deleteFlowandForm(form);
            if (delFlow.status) {
                await deleteDraftDoc({
                    DOC_HEADER_ID: $('#DocHeaderIDHid').val(),
                });
                alert('ลบข้อมูลเรียบร้อยแล้ว');
                redirectWebflow();
            } else {
                alert('ไม่สามารถลบ Flow ได้');
            }
        } catch (e) {
            alert('เกิดข้อผิดพลาด: ' + e.message);
        } finally {
            showLoader({ show: false });
        }
    });

    // Preview PDF
    $(document).on('click', '#PreviewPdfBtn', function () {
        const url =
            host +
            `feform/FE-DOC/form/PreviewStampedPdf?no=${form.NFRMNO}&orgNo=${form.VORGNO}&y=${form.CYEAR}&y2=${form.CYEAR2}&runNo=${form.NRUNNO}`;
        window.open(url, '_blank');
    });
});

function applyButtonPermissions(mode, extData, status = '') {
    const rawStatus = (status || '').toUpperCase().trim();
    $('#SaveDocBtn, #DeleteBtn, #ApproveBtn, #ReturnBtn').addClass('hidden');

    if (mode === '1') {
        $('#DocTypeDrp').prop('disabled', false);
        $('#drop-zone').removeClass('hidden');
        if (rawStatus === 'DRAFT' || rawStatus === '') {
            $('#SaveDocBtn').removeClass('hidden');
            if (rawStatus === 'DRAFT') $('#DeleteBtn').removeClass('hidden');
        }
    } else if (mode === '2') {
        $('#DocTypeDrp').prop('disabled', true);
        $('#drop-zone').addClass('hidden');
        $('#ApproveBtn, #ReturnBtn').removeClass('hidden');
    } else {
        $('#DocTypeDrp').prop('disabled', true);
        $('#drop-zone').addClass('hidden');
    }
}

async function actionFlow(actionType) {
    const formData = $('.form-info').data() || {};
    const payload = {
        NFRMNO: Number(formData.nfrmno || 0),
        VORGNO: String(formData.vorgno || ''),
        CYEAR: String(formData.cyear || ''),
        CYEAR2: String(formData.cyear2 || ''),
        NRUNNO: Number(formData.nrunno || 0),
        ACTION: actionType,
        EMPNO: empno,
        REMARK: $('#RemarkTxt').val() || '',
    };

    try {
        showLoader();
        const res = await doaction(payload);
        if (res?.status) {
            await $.ajax({
                url: host + 'feform/FE-DOC/form/ActionFlow',
                type: 'POST',
                data: {
                    ...payload,
                    EXTDATA: $('#EXTDATAHid').val(),
                    DOC_HEADER_ID: $('#DocHeaderIDHid').val(),
                },
                dataType: 'json',
            });
            redirectWebflow();
        } else {
            alert(res?.message || 'ส่งสถานะ Flow ไม่สำเร็จ');
        }
    } catch (e) {
        console.error(e);
        alert('เกิดข้อผิดพลาดในการทำ Action');
    } finally {
        showLoader({ show: false });
    }
}

function handleFileSelect(files) {
    if (!files || files.length === 0) return;
    $('#file-list-container').removeClass('hidden');

    for (let i = 0; i < files.length; i++) {
        selectedFilesArray.push(files[i]);
        let idx = selectedFilesArray.length - 1;
        let fileSize = (files[i].size / (1024 * 1024)).toFixed(2) + ' MB';

        let html = `
            <li class="flex items-center justify-between py-2 px-3 text-sm" id="file-item-${idx}">
                <div class="flex items-center gap-2 truncate">
                    <span>📄</span>
                    <span class="font-medium text-slate-700 truncate">${files[i].name}</span>
                    <span class="text-xs text-slate-400">(${fileSize})</span>
                </div>
                <button type="button" class="btn-remove-selected-file text-rose-500 font-bold text-xs" data-index="${idx}">Remove</button>
            </li>`;
        $('#selected-files-list').append(html);
    }
}

$(document).on('click', '.btn-remove-selected-file', function () {
    let idx = $(this).data('index');
    selectedFilesArray[idx] = null;
    $(`#file-item-${idx}`).remove();
    if (selectedFilesArray.filter(Boolean).length === 0) {
        $('#file-list-container').addClass('hidden');
    }
});

function loadExistingFiles() {
    const formData = $('.form-info').data() || {};
    getFilesDisplay({
        NFRMNO: formData.nfrmno,
        VORGNO: formData.vorgno,
        CYEAR2: formData.cyear2,
        NRUNNO: formData.nrunno,
    }).then((res) => {
        if (res.status && res.files.length > 0) {
            const $list = $('#uploaded-files-list');
            $list.empty();
            $('#download-zone').removeClass('hidden');

            res.files.forEach((file) => {
                const downloadUrl =
                    host + 'feform/FE-DOC/form/DownloadFile?id=' + file.FILE_ID;
                $list.append(`
                    <li class="flex items-center justify-between py-2.5 px-3 text-sm hover:bg-slate-50 transition-colors">
                        <div class="flex items-center gap-2.5 truncate">
                            <span>📁</span>
                            <span class="font-medium text-slate-700 truncate">${file.FILE_ONAME}</span>
                        </div>
                        <a href="${downloadUrl}" target="_blank" class="bg-slate-100 hover:bg-primary hover:text-white text-slate-600 font-semibold text-xs px-2.5 py-1.5 rounded-lg transition-all">
                            ⬇️ Download
                        </a>
                    </li>
                `);
            });
        }
    });
}
