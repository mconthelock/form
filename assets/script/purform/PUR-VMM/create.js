import {
    filterFormData,
    getAllAttr,
    logFormData,
    requiredForm,
    showErrorMessage,
    showMessage,
} from '@amec/webasset/utils';
import { getCurrency } from '../PUR-EVA/data';
import { currencyManager, renderFilesByType } from '../PUR-EVA/formManager';
import { getTermcode, getVendor } from '../PUR-NVF/data';
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
import { create, getData, update } from './data';
import { getFormStatus, showflow } from '@amec/webasset/api/webform';
import { webflowSubmit } from '@amec/webasset/components/form';
import Swal from 'sweetalert2';
import { redirectWebflow } from '@amec/webasset/form';
import { showLoader } from '@amec/webasset/preloader';
import { classIcofont } from '@amec/webasset/fileExplorer';
import { downloadOrOpenFile } from '@amec/webasset/api/file';
import { checkAttFile, renderNewFilesUI } from './function';

var form = {};
var deletefile = [];
const requiredMessage = [
    { element: $('input[name="REQBY"]'), message: 'Please input requester.' },
    {
        element: $('input[name="REQTYPE"]'),
        message: 'Please input Mode.',
    },
    {
        element: $('input[name="VENDCODE"]'),
        message: 'Please input Vendor Code.',
    },
    {
        element: $('input[name="VENDGROUPTYPE"]'),
        message: 'Please input Vendor Group Type.',
    },
    {
        element: $('input[name="VENDNAME"]'),
        message: 'Please input Vendor Name.',
    },
    {
        element: $('input[name="ADDRESS1_EN"]'),
        message: 'Please input Address (EN).',
    },
    {
        element: $('input[name="VENDCAT"]'),
        message: 'Please input Vendor Category.',
    },
    {
        element: $('input[name="TAXID"]'),
        message: 'Please input TAX.ID/Swift code',
    },
    {
        element: $('.termcode'),
        message: 'Please input Payment Term',
    },
    {
        element: $('input[name="CONTACT"]'),
        message: 'Please input Contact name.',
    },
    {
        element: $('input[name="EMAIL"]'),
        message: 'Please input Email.',
    },
    {
        element: $('input[name="TELNO"]'),
        message: 'Please input Tel.no',
    },
].filter(Boolean);

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
        $(`input[name="VENDGROUPTYPE"][value="${purvmm.VENDGROUPTYPE}"]`).prop(
            'checked',
            true,
        );
        $('input[name="VENDNAME"], #VENDNAME').val(purvmm.VENDNAME || '');
        $('input[name="VENDCAT"], #VENDCAT').val(purvmm.VENDCAT || '');
        $('input[name="TAXID"], #TAXID').val(purvmm.TAXID || '');
        $('input[name="CANO"], #CANO').val(purvmm.CANO || '');
        $('input[name="BANO"], #BANO').val(purvmm.BANO || '');
        $('#constdcur').text(purvmm.CURRENCY.CURR_NAME || '');
        $('#CURCODE').val(purvmm.CURCODE || '');
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

$(document).on('input', '#VENDCODE', async function () {
    const keywordValue = this.value.trim();
    console.log('xxx');

    if (keywordValue.length === 5) {
        const searchData = { VND_CODE: keywordValue, IS_DETAIL: '1' };
        const vendor = await getVendor(searchData);
        console.log(vendor);
        if (vendor.length > 0) {
            try {
                showLoader();
                console.log(vendor[0].PURVMM);

                if (vendor[0].PURVMM.length > 0) {
                    console.log('IFFFFFFF');

                    const vendorfilter = vendor[0].PURVMM.filter(
                        (item) => item.FORM.CST == '2',
                    );
                    if (vendorfilter) {
                        const latestVendor = vendorfilter.sort((a, b) => {
                            // เรียง CYEAR2 จากมากไปน้อย (ปีใหม่กว่าขึ้นก่อน)
                            if (b.CYEAR2 !== a.CYEAR2) {
                                return b.CYEAR2.localeCompare(a.CYEAR2);
                            }
                            // ถ้าปีเท่ากัน เรียง NRUNNO จากมากไปน้อย
                            return b.NRUNNO - a.NRUNNO;
                        })[0];
                        $(
                            `input[name="REQTYPE"][value="${latestVendor.REQTYPE}"]`,
                        ).prop('checked', true);
                        $(
                            `input[name="VENDGROUPTYPE"][value="${latestVendor.VENDGROUPTYPE}"]`,
                        ).prop('checked', true);
                        $('input[name="VENDNAME"], #VENDNAME').val(
                            latestVendor.VENDNAME || '',
                        );
                        $('input[name="VENDCAT"], #VENDCAT').val(
                            latestVendor.VENDCAT || '',
                        );
                        $('input[name="TAXID"], #TAXID').val(
                            latestVendor.TAXID || '',
                        );
                        $('input[name="CANO"], #CANO').val(
                            latestVendor.CANO || '',
                        );
                        $('input[name="BANO"], #BANO').val(
                            latestVendor.BANO || '',
                        );
                        $('#constdcur').text(vendor[0].STDCUR.CURR_NAME || '');
                        $('#CURCODE').val(latestVendor.CURCODE || '');
                        $('#VPAYTO').val(latestVendor.VPAYTO || '');
                        $('#VTYPE')
                            .val(
                                latestVendor.VTYPE
                                    ? latestVendor.VTYPE
                                    : vendor[0].VND_TYPE2,
                            )
                            .trigger('change');
                        $('#VPAYTY')
                            .val(
                                latestVendor.VPAYTY
                                    ? latestVendor.VPAYTY
                                    : vendor[0].VND_PAYMENT,
                            )
                            .trigger('change');
                        $('#TERM_PAYMENT')
                            .val(
                                latestVendor.TERMCODE
                                    ? latestVendor.TERMCODE
                                    : vendor[0].VND_TERM,
                            )
                            .trigger('change');
                        $('#V1TIME').val(latestVendor.V1TIME || '');
                        $('#VNALPH').val(latestVendor.VNALPH || '');
                        $('#CONTACT').val(
                            latestVendor.CONTACT
                                ? latestVendor.CONTACT
                                : vendor[0].VND_CONTACTNAME,
                        );
                        $('#EMAIL').val(latestVendor.EMAIL || '');
                        $('#WEBSITE').val(latestVendor.WEBSITE || '');
                        $('#TELNO').val(
                            latestVendor.TELNO
                                ? latestVendor.TELNO
                                : vendor[0].VND_PHONE,
                        );
                        $('#FAX').val(
                            latestVendor.FAX
                                ? latestVendor.FAX
                                : vendor[0].VND_FAX,
                        );
                        $('#ACCNUMBER').val(latestVendor.ACCNUMBER || '');
                        $('#BANKNAME').val(latestVendor.BANKNAME || '');
                        $('#BRANCH').val(latestVendor.BRANCH || '');
                        $('#BANKADDR').val(latestVendor.BANKADDR || '');
                        // if (vendorfilter.SCMUSER) {
                        //     vendorfilter.SCMUSER.sort(
                        //         (a, b) => a.ID - b.ID,
                        //     ).forEach((user, index) => {
                        //         // ถ้ารอบแรก (0) ใช้แถวเดิม, ถ้ารอบอื่นให้ clone แล้วต่อท้ายตารางเลย
                        //         let $row =
                        //             index === 0
                        //                 ? $('#scm-table tbody tr:first')
                        //                 : $('#scm-table tbody tr:first')
                        //                       .clone()
                        //                       .appendTo('#scm-table tbody');

                        //         // เติมค่าลงในแถวที่ได้ (ไม่ว่าจะเป็นแถวเดิมหรือแถวที่ clone มา)
                        //         $row.find('.scm-name')
                        //             .val(user.NAME)
                        //             .end()
                        //             .find('.scm-mail')
                        //             .val(user.EMAIL)
                        //             .end()
                        //             .find('.scm-usrname')
                        //             .val(user.USERNAME);
                        //     });
                        // }

                        for (const address of latestVendor.ADDRESSES) {
                            if (address.ADDRTYPE === 'E') {
                                addr1EnManager.value = address.ADDR1 || '';
                                addr2EnManager.value = address.ADDR2 || '';
                                cityEnManager.value = address.CITY || '';
                                stateEnManager.value = address.STATE || '';
                                postcodeEnManager.value =
                                    address.POSTCODE || '';
                                countryEnManager.value = address.COUNTRY || '';
                            } else {
                                addrThManager.value = address.ADDR1 || '';
                            }
                        }
                    }
                } else {
                    $(
                        `input[name="VENDGROUPTYPE"][value="${vendor[0].VND_TYPE1}"]`,
                    ).prop('checked', true);
                    $('input[name="VENDNAME"], #VENDNAME').val(
                        vendor[0].VND_NAME || '',
                    );
                    $('input[name="VENDCAT"], #VENDCAT').val(
                        vendor[0].VND_CATEGORY || '',
                    );
                    $('input[name="CANO"], #CANO').val(
                        vendor[0].VND_CANO || '',
                    );
                    $('input[name="BANO"], #BANO').val(
                        vendor[0].VND_BANO || '',
                    );
                    $('#constdcur').text(vendor[0].STDCUR.CURR_NAME || '');
                    console.log(vendor[0].VND_CURRENCY);

                    $('#CURCODE').val(vendor[0].VND_CURRENCY || '');
                    $('#VPAYTO').val(vendor[0].VND_CODE || '');
                    $('#VTYPE').val(vendor[0].VND_TYPE2).trigger('change');
                    $('#VPAYTY').val(vendor[0].VND_PAYMENT).trigger('change');
                    $('#TERM_PAYMENT')
                        .val(vendor[0].VND_TERM)
                        .trigger('change');
                    $('#CONTACT').val(vendor[0].VND_CONTACTNAME || '');
                    $('#TELNO').val(vendor[0].VND_PHONE || '');
                    $('#FAX').val(vendor[0].VND_FAX || '');
                    addr1EnManager.value = vendor[0].VND_ADDRESS1 || '';
                    addr2EnManager.value = vendor[0].VND_ADDRESS2 || '';
                    cityEnManager.value = vendor[0].VND_CITY || '';
                    stateEnManager.value = vendor[0].VND_STATE || '';
                    countryEnManager.value = vendor[0].VND_COUNTRY || '';
                }
            } catch (err) {
                console.error('Error get Vendor:', err);
                showErrorMessage('เกิดข้อผิดพลาดในการดึงข้อมูลคู่ค้า');
            } finally {
                showLoader({ show: false });
            }
        } else {
            showMessage('Vendor code not found', 'warning');
            return false;
        }
    }
});
$(document).on('click', '.add-row-btn', function () {
    const tableId = $(this).data('table');
    const tbody = $('#' + tableId + ' tbody');
    const newRow = tbody.find('.row-template').first().clone();
    // newRow.removeClass('row-template');
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

$(document).on('click', '#btnDraft, #btnRequest', async function () {
    // if (this.id === 'btnRequest') {
    //     if (!(await requiredForm('#frmmain'))) return;
    //     if (!checkAttFile()) {
    //         return false;
    //     }
    // }
    const formElement = $('#frmmain')[0];
    let SCMUSER = $('.row-template')
        .map((_, row) => {
            let NAME = $(row).find('.scm-name').val();
            let EMAIL = $(row).find('.scm-mail').val();
            let USERNAME = $(row).find('.scm-usrname').val();

            // ถ้าว่างหมดให้ return null (jQuery จะไม่เอาเข้า array ให้เอง)
            return NAME || EMAIL || USERNAME ? { NAME, EMAIL, USERNAME } : null;
        })
        .get(); // .get() เพื่อแปลง jQuery Object ให้เป็น Array ปกติ
    //console.log(SCMUSER);

    const fd = new FormData(formElement);
    const formInfo = await getAllAttr('.form-info');
    fd.append('NFRMNO', formInfo.nfrmno);
    fd.append('VORGNO', formInfo.vorgno);
    fd.append('CYEAR', formInfo.cyear);
    // fd.append('CYEAR2', formInfo.cyear2);
    // fd.append('NRUNNO', formInfo.nrunno);
    // const apvno = $('.apv-data').attr('empno');
    // fd.append('EMPNO', apvno);
    const appendObjArray = (key, arr) =>
        arr.forEach((obj, i) =>
            Object.entries(obj).forEach(([prop, val]) => {
                if (val !== undefined) fd.append(`${key}[${i}][${prop}]`, val);
            }),
        );

    appendObjArray('SCMUSER', SCMUSER);
    fd.delete('NAME[]');
    fd.delete('EMAIL[]');
    fd.delete('USERNAME[]');
    if (this.id === 'btnDraft') {
        fd.append('DRAFT', '0');
    }
    const formdata = filterFormData(fd, { empty: true });

    // logFormData(formdata);
    // return false;
    try {
        showLoader();
        const res = await create(formdata);
        if (res.status == true) {
            showMessage(res.message, 'success');
            redirectWebflow();
        } else {
            throw new Error(res.message);
        }
    } catch (err) {
        console.error(err);
        showErrorMessage(err);
    } finally {
        showLoader({ show: false });
    }
});
$(document).on('click', 'button[name="btnAction"]', async function () {
    const act = $(this).val();

    $('#frmmain')
        .find('input, select, textarea')
        .each(function () {
            if ($(this).hasClass('req')) {
                console.log(
                    $(this).attr('name'),
                    $(this).attr('id'),
                    $(this).val(),
                );
            }
        });
    if (act == 'approve') {
        if (!(await requiredForm('#frmmain'))) return;
        if (!checkAttFile()) {
            return false;
        }
    }
    $('input[name="ACTION"]').val(act);
    const formElement = $('#frmmain')[0];
    let SCMUSER = $('.row-template')
        .map((_, row) => {
            let NAME = $(row).find('.scm-name').val();
            let EMAIL = $(row).find('.scm-mail').val();
            let USERNAME = $(row).find('.scm-usrname').val();

            // ถ้าว่างหมดให้ return null (jQuery จะไม่เอาเข้า array ให้เอง)
            return NAME || EMAIL || USERNAME ? { NAME, EMAIL, USERNAME } : null;
        })
        .get(); // .get() เพื่อแปลง jQuery Object ให้เป็น Array ปกติ
    //console.log(SCMUSER);

    const fd = new FormData(formElement);
    const formInfo = await getAllAttr('.form-info');
    fd.append('NFRMNO', formInfo.nfrmno);
    fd.append('VORGNO', formInfo.vorgno);
    fd.append('CYEAR', formInfo.cyear);
    fd.append('CYEAR2', formInfo.cyear2);
    fd.append('NRUNNO', formInfo.nrunno);
    const apvno = $('.apv-data').attr('empno');
    fd.append('EMPNO', apvno);
    const appendObjArray = (key, arr) =>
        arr.forEach((obj, i) =>
            Object.entries(obj).forEach(([prop, val]) => {
                if (val !== undefined) fd.append(`${key}[${i}][${prop}]`, val);
            }),
        );

    appendObjArray('SCMUSER', SCMUSER);
    fd.delete('NAME[]');
    fd.delete('EMAIL[]');
    fd.delete('USERNAME[]');
    deletefile.forEach((fileId) => {
        fd.append('DELETE_FILES[]', String(fileId));
    });
    const formdata = filterFormData(fd, { empty: true });
    // logFormData(formdata);
    // return false;

    try {
        showLoader();
        const res = await update(formdata);
        if (res.status == true) {
            showMessage(res.message, 'success');
            redirectWebflow();
        } else {
            throw new Error(res.message);
        }
    } catch (err) {
        console.error(err);
        showErrorMessage(err);
    } finally {
        showLoader({ show: false });
    }
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
