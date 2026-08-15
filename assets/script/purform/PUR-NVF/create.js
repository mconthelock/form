import { handleFiles } from '@amec/webasset/dragdrop';
import {
    acceptPoManager,
    actionFormManager,
    attachTypeManager,
    formManager,
    inVoiceTypeManager,
    paymentNumManager,
    paymentTypeManager,
    reqByManager,
    countryManager,
    currencyManager,
    attachFileManager,
    vendorTypeManager,
    ReqtypeManager,
    vendorCodeManager,
    cityEnManager,
    stateEnManager,
    postcodeEnManager,
} from './formManager';
import { downloadOrOpenFile } from '@amec/webasset/api/file';
import { checkAttFile } from './function';

$(async function () {
    formManager.init();
});

$(document).on('change', '#REQBY', function () {
    reqByManager.setEmpRequester(this.value);
});

// Sync value for currency select2
// $(document).on("select2:select", ".currency", function () {
//     const value = $(this).val();
//     currencyManager.syncValue(value, this);
// });

$(document).on('change', 'input[name="files"]', async function (e) {
    handleFiles();
});

// เมื่อเลือก Invoice Type เป็น Other ให้เปิดช่องกรอกข้อมูล
// $(document).on("change", 'input[name="INVOICE_TYPE"]', async function () {
//     await inVoiceTypeManager.change();
// });

// เมื่อเลือก Accept PO เป็น Subcon หรือ Other ให้เปิดช่องกรอกข้อมูล
// $(document).on("change", 'input[name="ACCEPT_PO"]', function () {
//     acceptPoManager.change();
// });

$(document).on(
    'change',
    'input[name="VENDOR_LOCATION_SHOW"]',
    async function () {
        vendorTypeManager.change();
    },
);

// เมื่อเลือก PAYMENT CONDITIONS & TERMS
// $(document).on("change", 'input[name="PAYMENT_TYPE"]', function () {
//     paymentTypeManager.change();
// });

$(document).on('select2:select', '.country', async function (e) {
    countryManager.change(e);
});

$(document).on('change', 'input[name="REQTYPE_SHOW"]', function (e) {
    ReqtypeManager.change(e);
});

// $(document).on("input", "input[name='PAYMENT_NUM']", function () {
//     paymentNumManager.onInput(this.value);
// });

$(document).on('change', 'input[name="ATTACH_TYPE"]', function () {
    attachTypeManager.change();
});

$(document).on('click', '#btnRequest', async function () {
    await actionFormManager.requestForm();
});

$(document).on('click', 'button[name="btnAction"]', async function (e) {
    await actionFormManager.action(this.value);
});

$(document).on('click', '.file-link', async function (e) {
    e.preventDefault();
    const filePath = $(this).attr('href');
    const filename = $(this).attr('originalName');
    const storedName = $(this).attr('storedName');
    const ext = filename.split('.').pop();

    await downloadOrOpenFile({
        baseDir: filePath,
        storedName: storedName,
        originalName: filename,
        mode: ext == 'pdf' ? 'open' : 'download',
    });
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

$(document).on('input', '#VENDORCODE', async function () {
    await vendorCodeManager.change();
});

$(document).on('input', '#TELNO', function () {
    let val = this.value.replace(/\D/g, ''); // ลบสิ่งที่ไม่ใช่ตัวเลขออกก่อน
    if (val.length > 3 && val.length <= 6) {
        this.value = val.slice(0, 3) + '-' + val.slice(3);
    } else if (val.length > 6) {
        this.value =
            val.slice(0, 3) + '-' + val.slice(3, 6) + '-' + val.slice(6, 10);
    }
});

$(document).on('input', '#ACCNUMBER', function () {
    let val = this.value.replace(/\D/g, ''); // ลบสิ่งที่ไม่ใช่ตัวเลขออกก่อน
    if (val.length > 3 && val.length <= 4) {
        this.value = val.slice(0, 3) + '-' + val.slice(3);
    } else if (val.length > 4 && val.length <= 9) {
        this.value =
            val.slice(0, 3) + '-' + val.slice(3, 4) + '-' + val.slice(4);
    } else if (val.length > 9) {
        this.value =
            val.slice(0, 3) +
            '-' +
            val.slice(3, 4) +
            '-' +
            val.slice(4, 9) +
            '-' +
            val.slice(9, 10);
    }
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
