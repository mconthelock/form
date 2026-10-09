import $ from 'jquery';
import { redirectWebflow } from '@amec/webasset/form';
import { showLoader } from '@amec/webasset/preloader';
import { deleteFile, getFile } from '@amec/webasset/api/file';
import { host } from '../../utils';
import { uploadDocFiles, saveDocMaster } from './data';
import { initFlow, actionFlow } from './flow';

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
    $('#REQUEST_BYTxt').val(formData.reqby || empno);
    $('#INPUT_BYTxt').val(formData.inputby || empno);
    $('#DocHeaderIDHid').val(formData.doc_header_id || '');

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
    // ปุ่มบันทึกเอกสาร / สร้างเอกสารใหม่
    // --------------------------------------------------------
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
            const userEmpNo =
                empno ||
                $('#REQUEST_BYTxt').val() ||
                $('#EMPNOHid').val() ||
                '';

            if (!isResubmit) {
                let headerPayload = new FormData();
                headerPayload.append('DOC_TYPE_CODE', docType);
                headerPayload.append('REMARK', $('#RemarkTxt').val() || '');
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

            // อัปโหลดไฟล์ PDF ขึ้น Storage
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

                // Stamp ตรา Requester (Step 00) ลงบนไฟล์จริง
                if (!isResubmit) {
                    await $.ajax({
                        url: host + 'feform/FE-DOC/form/StampRequesterStep',
                        type: 'POST',
                        data: {
                            NFRMNO: targetForm.NFRMNO,
                            VORGNO: targetForm.VORGNO,
                            CYEAR2: targetForm.CYEAR2,
                            NRUNNO: targetForm.NRUNNO,
                            EMPNO: userEmpNo,
                        },
                        dataType: 'json',
                    });
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

    // ปุ่มเปิดดูไฟล์ PDF ที่ Stamp แล้ว
    $(document).on('click', '.btn-open-file', async function (e) {
        e.preventDefault();

        const baseDir = $(this).data('base-dir');
        const storedName = $(this).data('stored-name');
        const originalName = $(this).data('original-name') || 'document.pdf';

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
            setTimeout(() => URL.revokeObjectURL(blobUrl), 20000);
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

    // ========================================================
    // Modal จัดการ Master Document Type & Steps
    // ========================================================
    const FLOW_EXT_LIST = [
        { ext: '00', title: 'REQUESTER', apvType: 'EMP' },
        { ext: '01', title: 'EFC SEM', apvType: 'POS' },
        { ext: '02', title: 'MAT SEM', apvType: 'POS' },
        { ext: '03', title: 'FE DEM', apvType: 'POS' },
        { ext: '04', title: 'E/P DDIM', apvType: 'POS' },
        { ext: '05', title: 'E/P DIM', apvType: 'POS' },
    ];

    $(document).on('click', '#btn-open-master-modal', function (e) {
        e.preventDefault();
        const currentSelected = $('#DocTypeDrp').val();
        if (currentSelected) {
            $('#modal-select-doctype').val(currentSelected).trigger('change');
        } else {
            $('#modal-select-doctype').val('__NEW__').trigger('change');
        }
        $('#master-modal').removeClass('hidden');
    });

    $(document).on('click', '.btn-close-master-modal', function (e) {
        e.preventDefault();
        $('#master-modal').addClass('hidden');
    });

    $('#modal-select-doctype').on('change', function () {
        const selectedCode = $(this).val();
        $('#master-steps-tbody').empty();

        if (selectedCode === '__NEW__') {
            $('#m_doc_code').val('').prop('readonly', false);
            $('#m_doc_name').val('');
            $('#btn-del-doctype').addClass('hidden');
            appendStepRow({ STEP_NO: 1, CEXTDATA: '00', TARGET_EMPNO: '' });
        } else {
            $('#m_doc_code').val(selectedCode).prop('readonly', true);
            $('#btn-del-doctype').removeClass('hidden');

            showLoader();
            $.getJSON(
                host +
                    'feform/FE-DOC/form/GetMasterDetail?docTypeCode=' +
                    selectedCode,
                function (res) {
                    showLoader({ show: false });
                    if (res.status) {
                        $('#m_doc_name').val(res.type?.DOC_TYPE_NAME || '');
                        if (res.steps && res.steps.length > 0) {
                            res.steps.forEach((s) => appendStepRow(s));
                        } else {
                            appendStepRow({
                                STEP_NO: 1,
                                CEXTDATA: '00',
                                TARGET_EMPNO: '',
                            });
                        }
                    }
                },
            ).fail(function () {
                showLoader({ show: false });
                alert('ไม่สามารถโหลดข้อมูล Master ได้');
            });
        }
    });

    function appendStepRow(data = {}) {
        const rowCount = $('#master-steps-tbody tr').length;
        const stepNo = data.STEP_NO || rowCount + 1;
        const selectedExt =
            data.CEXTDATA !== undefined && data.CEXTDATA !== null
                ? data.CEXTDATA.toString()
                : '01';
        const isStep00 = selectedExt === '00';

        let optionsHtml = '';
        FLOW_EXT_LIST.forEach((item) => {
            if (rowCount === 0 && item.ext !== '00') return;
            if (rowCount > 0 && item.ext === '00') return;

            optionsHtml += `<option value="${item.ext}" data-title="${item.title}" data-type="${item.apvType}" ${selectedExt === item.ext ? 'selected' : ''}>
                ${item.ext} : ${item.title}
            </option>`;
        });

        const html = `
            <tr class="step-row hover:bg-slate-50/60 transition-colors">
                <td class="p-2.5 text-center font-bold text-slate-700 row-step-no">${stepNo}</td>
                <td class="p-2.5 text-center">
                    <span class="inline-block px-2 py-1 bg-slate-100 border border-slate-200 rounded font-mono font-bold text-xs ext-badge">${selectedExt}</span>
                </td>
                <td class="p-2.5">
                    <select class="w-full h-8 px-2 border border-slate-200 rounded text-xs font-semibold select-step-preset focus:ring-2 focus:ring-blue-500/20" ${isStep00 ? 'disabled' : ''}>
                        ${optionsHtml}
                    </select>
                </td>
                <td class="p-2.5">
                    ${
                        isStep00
                            ? `<input type="text" class="w-full h-8 px-2 border border-slate-200 rounded text-xs in-target-empno font-medium" 
                                      value="${data.TARGET_EMPNO || ''}" 
                                      placeholder="เว้นว่าง = ใช้รหัสผู้สร้างเอกสาร">`
                            : `<span class="text-xs text-slate-400 italic">สายอนุมัติตาม Webflow</span>`
                    }
                </td>
                <td class="p-2.5 text-center">
                    ${isStep00 ? '' : '<button type="button" class="btn-remove-step-row text-rose-500 hover:text-rose-700 font-bold text-lg cursor-pointer">&times;</button>'}
                </td>
            </tr>
        `;
        $('#master-steps-tbody').append(html);
    }

    $(document).on('change', '.select-step-preset', function () {
        const ext = $(this).val();
        $(this).closest('tr').find('.ext-badge').text(ext);
    });

    $('#btn-add-step-row').on('click', function () {
        const existingExts = [];
        $('#master-steps-tbody .select-step-preset').each(function () {
            existingExts.push($(this).val());
        });

        const available = ['01', '02', '03', '04', '05'];
        const nextExt =
            available.find((ext) => !existingExts.includes(ext)) || '01';
        appendStepRow({ CEXTDATA: nextExt });
    });

    $(document).on('click', '.btn-remove-step-row', function () {
        $(this).closest('tr').remove();
        $('#master-steps-tbody tr').each(function (idx) {
            $(this)
                .find('.row-step-no')
                .text(idx + 1);
        });
    });

    $('#btn-save-master-data').on('click', async function () {
        const docCode = $('#m_doc_code').val().trim().toUpperCase();
        const docName = $('#m_doc_name').val().trim();

        if (!docCode || !docName) {
            alert('กรุณากรอก DOC TYPE CODE และ DOC TYPE NAME');
            return;
        }

        const steps = [];
        $('#master-steps-tbody tr').each(function (idx) {
            const $tr = $(this);
            let ext = '00';
            let title = 'REQUESTER';
            let apvType = 'EMP';
            let targetEmp = $tr.find('.in-target-empno').val()?.trim() || '';

            if (idx > 0) {
                const $opt = $tr.find('.select-step-preset option:selected');
                ext = $opt.val();
                title = $opt.data('title');
                apvType = $opt.data('type');
                targetEmp = '';
            }

            steps.push({
                STEP_NO: idx + 1,
                CEXTDATA: ext,
                POSITION_TITLE: title,
                APV_TYPE: apvType,
                TARGET_EMPNO: targetEmp,
            });
        });

        try {
            showLoader();
            const res = await $.ajax({
                url: host + 'feform/FE-DOC/form/SaveMaster',
                type: 'POST',
                data: {
                    DOC_TYPE_CODE: docCode,
                    DOC_TYPE_NAME: docName,
                    EMPNO: empno,
                    STEPS: JSON.stringify(steps),
                },
                dataType: 'json',
            });

            if (res && res.status) {
                alert('บันทึก Master สำเร็จ');
                location.reload();
            } else {
                alert('บันทึกไม่สำเร็จ: ' + (res?.message || ''));
            }
        } catch (e) {
            console.error(e);
            alert('เกิดข้อผิดพลาดในการบันทึก Master');
        } finally {
            showLoader({ show: false });
        }
    });

    $('#btn-del-doctype').on('click', async function () {
        const docCode = $('#m_doc_code').val().trim();
        if (!docCode) return;

        if (
            !confirm(
                `ยืนยันการลบประเภทเอกสาร [${docCode}] พร้อม Flow ทั้งหมดใช่หรือไม่?`,
            )
        )
            return;

        try {
            showLoader();
            const res = await $.ajax({
                url: host + 'feform/FE-DOC/form/DeleteDocType',
                type: 'POST',
                data: { DOC_TYPE_CODE: docCode, EMPNO: empno },
                dataType: 'json',
            });

            if (res && res.status) {
                alert('ลบประเภทเอกสารเรียบร้อยแล้ว');
                location.reload();
            } else {
                alert('ลบไม่สำเร็จ: ' + (res?.message || ''));
            }
        } catch (e) {
            console.error(e);
            alert('เกิดข้อผิดพลาดในการลบ');
        } finally {
            showLoader({ show: false });
        }
    });
});

// ==========================================
// การเลือกไฟล์และลากวาง (เฉพาะ PDF)
// ==========================================
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
                    <span class="text-rose-500 bg-rose-50 border-rose-200 font-bold text-xs px-1.5 py-0.5 rounded border">PDF</span>
                    <span class="font-medium text-slate-700 truncate">${file.name}</span>
                    <span class="text-xs text-slate-400">(${fileSize})</span>
                </div>
                <button type="button" class="btn-remove-selected-file text-rose-500 font-bold text-xs cursor-pointer" data-index="${idx}">Remove</button>
            </li>`;
        $('#selected-files-list').append(html);
    }

    if (hasInvalid) {
        alert('ระบบรองรับเฉพาะไฟล์ PDF (.pdf) เท่านั้น');
    }

    if (selectedFilesArray.filter(Boolean).length > 0) {
        $('#file-list-container').removeClass('hidden');
    }
}

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

            const viewBtn = `
                <button type="button" 
                        class="btn-open-file bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 font-semibold text-xs px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                        data-base-dir="${formattedBaseDir}" 
                        data-stored-name="${file.FILE_FNAME}" 
                        data-original-name="${file.FILE_ONAME}">
                    📄 Open / Download File
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
                        <span class="text-rose-500 font-bold text-xs bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">PDF</span>
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
