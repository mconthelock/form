import { getAllAttr } from '@amec/webasset/utils';
import { getCurrency } from '../PUR-EVA/data';
import { currencyManager, renderFilesByType } from '../PUR-EVA/formManager';
import { getTermcode } from '../PUR-NVF/data';
import {
    addr1EnManager,
    addr2EnManager,
    addrThManager,
    cityEnManager,
    countryEnManager,
    paymentTermManager,
    postcodeEnManager,
    stateEnManager,
} from '../PUR-NVF/formManager';
import { getData } from './data';
import { getFormStatus, showflow } from '@amec/webasset/api/webform';
import { webflowSubmit } from '@amec/webasset/components/form';
import Swal from 'sweetalert2';

var form = {};
var deletefile = [];
$(document).ready(async function () {
    const term = await getTermcode();
    console.log(term);

    const termdata = term.map((t) => ({
        value: t.STERMCODE,
        text: t.STERMDESC,
    }));

    // const currency = await getCurrency();
    // const currencyData = currency.map((c) => ({
    //     value: c.CURR_CODE,
    //     text: c.CURR_NAME,
    // }));

    paymentTermManager.init(termdata);
    // currencyManager.init(currencyData);
    const formInfo = await getAllAttr('.form-info');

    form = {
        NFRMNO: formInfo.nfrmno,
        VORGNO: formInfo.vorgno,
        CYEAR: formInfo.cyear,
        CYEAR2: formInfo.cyear2,
        NRUNNO: formInfo.nrunno,
        MODE: Number(formInfo.mode) ?? null,
        EMPNO: $('.apv-data').attr('empno'),
        RETURN: formInfo.return ?? null,
    };
    if (formInfo.return) {
        const flow = await showflow({ ...form, showStep: true });
        const purvmm = await getData(form);
        $(`input[name="REQTYPE"][value="${purvmm.REQTYPE}"]`).prop(
            'checked',
            true,
        );
        $('input[name="VENDCODE"], #VENDCODE').val(purvmm.VENDCODE);
        $(`input[name="VENDGROUP"][value="${purvmm.VENDGROUPTYPE}"]`).prop(
            'checked',
            true,
        );
        $('input[name="VENDNAME"], #VENDNAME').val(purvmm.VENDNAME || '');
        $('input[name="VENDCAT"], #VENDCAT').val(purvmm.VENDCAT || '');
        $('input[name="TAXID"], #TAXID').val(purvmm.TAXID || '');
        $('input[name="CANO"], #CANO').val(purvmm.CANO || '');
        $('input[name="BANO"], #BANO').val(purvmm.BANO || '');
        $('#constdcur').text(purvmm.CURRENCY.CURR_NAME || '');
        $('#CURCODE').text(purvmm.CURCODE || '');
        $('#VPAYTO').val(purvmm.VPAYTO || '');
        $('#VTYPE').val(purvmm.VTYPE).trigger('change');
        $('#VPAYTY').val(purvmm.VPAYTY).trigger('change');
        $('#TERM_PAYMENT').val(purvmm.TERMCODE).trigger('change');
        $('#V1TIME').val(purvmm.V1TIME || '');
        $('#VNALPH').val(purvmm.VNALPH || '');
        $('#CONTACT').val(purvmm.CONTACT || '');
        $('#EMAIL').val(purvmm.EMAIL || '');
        $('#WEBSITE').val(purvmm.WEBSITE || '');
        $('#TELNO').val(purvmm.TELNO || '');
        $('#FAX').val(purvmm.FAX || '');
        $('#ACCNUMBER').val(purvmm.ACCNUMBER || '');
        $('#BANKNAME').val(purvmm.BANKNAME || '');
        $('#BRANCH').val(purvmm.BRANCH || '');
        $('#BANKADDR').val(purvmm.BANKADDR || '');
        purvmm.ATTACH_OTHER && $('#ATTACH_OTHER').val(purvmm.ATTACH_OTHER);
        const attachedFiles = purvmm.FILES || [];
        renderFilesByType(attachedFiles, 11, 'file-type-11', true);
        renderFilesByType(attachedFiles, 2, 'file-type-2', true);
        purvmm.SCMUSER.sort((a, b) => a.ID - b.ID).forEach((user, index) => {
            // ถ้ารอบแรก (0) ใช้แถวเดิม, ถ้ารอบอื่นให้ clone แล้วต่อท้ายตารางเลย
            let $row =
                index === 0
                    ? $('#scm-table tbody tr:first')
                    : $('#scm-table tbody tr:first')
                          .clone()
                          .appendTo('#scm-table tbody');

            // เติมค่าลงในแถวที่ได้ (ไม่ว่าจะเป็นแถวเดิมหรือแถวที่ clone มา)
            $row.find('.scm-name')
                .val(user.NAME)
                .end()
                .find('.scm-mail')
                .val(user.EMAIL)
                .end()
                .find('.scm-usrname')
                .val(user.USERNAME);
        });

        for (const address of purvmm.ADDRESSES) {
            if (address.ADDRTYPE === 'E') {
                addr1EnManager.value = address.ADDR1 || '';
                addr2EnManager.value = address.ADDR2 || '';
                cityEnManager.value = address.CITY || '';
                stateEnManager.value = address.STATE || '';
                postcodeEnManager.value = address.POSTCODE || '';
                countryEnManager.value = address.COUNTRY || '';
            } else {
                addrThManager.value = address.ADDR1 || '';
            }
        }
        const cst = await getFormStatus(form);
        if (cst == '1') {
            $('#form-action-container').html(
                webflowSubmit({
                    flow: true,
                    flowhtml: flow.html,
                    approve: true,
                    save: true,
                    remark: false,
                }),
            );
        } else {
            $('#form-action-container').html(
                webflowSubmit({
                    approve: true,
                    save: true,
                    remark: false,
                }),
            );
        }
        console.log(purvmm);
    } else {
        $('#form-action-container').html(
            webflowSubmit({
                request: true,
                draft: true,
                remark: false,
            }),
        );
    }
});
$(document).on('click', '.add-row-btn', function () {
    console.log('cccc');

    const tableId = $(this).data('table');
    const tbody = $('#' + tableId + ' tbody');
    const newRow = tbody.find('.row-template').first().clone();
    newRow.removeClass('row-template');
    newRow.find('input').val('');
    newRow
        .find('td:last-child')
        .html(
            '<button type="button" class="remove-row w-7 h-7 rounded border border-red-500 text-red-500 hover:bg-red-50 flex items-center justify-center font-bold text-lg mx-auto transition-colors">×</button>',
        );
    tbody.append(newRow);
});

$(document).on('click', '.remove-row', function () {
    $(this).closest('tr').remove();
});

const selectedFilesCache = {};
$(document).on('change', 'input[type="file"]', async function () {
    let inputId = $(this).attr('id');
    let wrapper = $(this).closest('.flex-col');
    let showFileContainer = wrapper.find('.show-file');

    if (!selectedFilesCache[inputId]) {
        selectedFilesCache[inputId] = new DataTransfer();
    }
    let dataTransfer = selectedFilesCache[inputId];

    if (this.files && this.files.length > 0) {
        $.each(this.files, function (index, file) {
            let isDuplicate = false;
            for (let i = 0; i < dataTransfer.files.length; i++) {
                if (dataTransfer.files[i].name === file.name) {
                    isDuplicate = true;
                    break;
                }
            }
            if (!isDuplicate) {
                dataTransfer.items.add(file);
            }
        });
    }
    this.files = dataTransfer.files;
    renderNewFilesUI(inputId, dataTransfer, showFileContainer);
});

$(document).on('click', '.remove-new-file', function () {
    let inputId = $(this).data('id');
    let indexToRemove = $(this).data('index');
    let dataTransfer = selectedFilesCache[inputId];
    let inputElement = $('#' + inputId)[0];
    let showFileContainer = $(this).closest('.show-file');

    if (dataTransfer) {
        dataTransfer.items.remove(indexToRemove);
        inputElement.files = dataTransfer.files;
        renderNewFilesUI(inputId, dataTransfer, showFileContainer);
    }
});

$(document).on('click', '.remove-file', async function (e) {
    e.preventDefault();
    e.stopPropagation();
    const id = $(this).attr('file-id');
    const tagA = $(this).closest('a');
    Swal.fire({
        title: 'Are you sure you want to delete this file?',
        icon: 'warning',
        showCancelButton: true,
    }).then((result) => {
        if (result.isConfirmed) {
            tagA.remove();
            deletefile.push(id);
        }
    });
});

function renderNewFilesUI(inputId, dataTransfer, container) {
    let newFilesDiv = container.find('.new-selected-files');
    if (newFilesDiv.length === 0) {
        container.append('<div class="new-selected-files mt-1"></div>');
        newFilesDiv = container.find('.new-selected-files');
    }

    newFilesDiv.empty();

    $.each(dataTransfer.files, function (index, file) {
        let fileItemHtml = `
            <div class="flex items-center gap-2 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                     class="cursor-pointer remove-new-file shrink-0"
                     data-id="${inputId}" data-index="${index}" title="Remove file">
                    <circle cx="12" cy="12" r="10" fill="#dc2626"></circle>
                    <line x1="7" y1="12" x2="17" y2="12" stroke="white" stroke-width="3" stroke-linecap="round"></line>
                </svg>
                <span class="text-sm text-gray-700">${file.name}</span>
            </div>
        `;
        newFilesDiv.append(fileItemHtml);
    });
}
