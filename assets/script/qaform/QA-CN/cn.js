import { redirectWebflow } from '@amec/webasset/form';
import { host } from '../../utils';
import { showLoader } from '@amec/webasset/preloader';
import 'select2';
import 'select2/dist/css/select2.min.css';
import flatpickr from 'flatpickr';
//import { setDatePicker } from "@public/_flatpickr";
import 'flatpickr/dist/flatpickr.min.css';
import {
    ajaxOptions,
    getAllAttr,
    getData,
    showMessage,
    requiredForm,
    filterFormData,
    logFormData,
} from '@amec/webasset/utils';
import {
    showflow,
    doaction,
    getFormStatus,
    getFormno,
} from '@amec/webasset/api/webform';
import { sendmail } from '@amec/webasset/api/mail';
import {
    fetchMsgErr,
    fetchUtils,
    serializeRequestBody,
} from '@amec/webasset/api/fetch-utils';
import { formatDate } from '@amec/webasset/dayjs';

$(document).ready(async function () {
    const formData = $('.form-data').data();

    flatpickr('#part_date', {
        dateFormat: 'd/m/Y',
        defaultDate: $('#part_date').val(),
    });
    flatpickr('#submit_date', {
        dateFormat: 'd/m/Y',
        defaultDate: $('#submit_date').val(),
    });
    flatpickr('#inspec_date', {
        dateFormat: 'd/m/Y',
        defaultDate: $('#inspec_date').val(),
    });
    flatpickr('#expchg_date', {
        dateFormat: 'd/m/Y',
        defaultDate: $('#expchg_date').val(),
    });

    const { nfrmno, vorgno, cyear, empno } = formData;
    $('.btn-submit').click(async function () {
        let action = $(this).data('action');

        if (!(await requiredForm('#cn-form'))) return;
        if (checkData()) {
            const puritm = $('input[name="txtPurItem"]').val();
            const invno = $('input[name="txtInvNo"]').val();
            if (puritm || invno) {
                const res = await searchAs400(invno, puritm);
                if (res.data && res.data.length > 0) {
                    showMessage('CN NO. duplicate, Please check', 'warning');
                    return false;
                }
            }

            const rsnno = $('input[name="radReason"]:checked').val();
            const radSample = $('input[name="radSample"]:checked').val();
            const submitVal = $('#submit_date').val();
            const inspecVal = $('#inspec_date').val();
            const expchgVal = $('#expchg_date').val();
            // const submitDate = submitVal
            //     ? new Date(
            //           formatDate(submitVal)
            //       )
            //     : null;
            // const inspecDate = inspecVal
            //     ? new Date(
            //           inspecVal.replace(
            //               /(\d{2})\/(\d{2})\/(\d{4})/,
            //               '$3-$2-$1',
            //           ),
            //       )
            //     : null;
            // const expchgDate = expchgVal
            //     ? new Date(
            //           expchgVal.replace(
            //               /(\d{2})\/(\d{2})\/(\d{4})/,
            //               '$3-$2-$1',
            //           ),
            //       )
            //     : null;
            const dwgArray = [];
            $('#dwg-body tr').each(function () {
                let dwgNo = $(this).find('input[name="txtDwgNo[]"]').val();
                let txtG = $(this).find('input[name="txtG[]"]').val();
                let txtL = $(this).find('input[name="txtL[]"]').val();
                let revNo = $(this).find('input[name="revNo[]"]').val();
                let fullDwgNo = [dwgNo, txtG, txtL].filter(Boolean).join(' ');

                if (dwgNo) {
                    dwgArray.push({
                        DWGNO: fullDwgNo,
                        REVNO: revNo,
                    });
                }
            });

            const frm2 = {
                NFRMNO: nfrmno,
                VORGNO: vorgno,
                CYEAR: cyear,
                REQBY: $('input[name="txtReqId"]').val(),
                INPUTBY: $('input[name="txtInput"]').val(),
                REMARK: $('input[name="txtRemark"]').val(),
                ACTION: action,
                TITLE: $('input[name="txtTitle"]').val(),
                ITEMNO: $('input[name="txtItemno"]').val(),
                SVENDNAME: $('input[name="txtSupName"]').val(),
                CLSNO: $('input[name="chkClass"]:checked').val(),
                RSNNO: rsnno,
                RSNOTHER: rsnno == '5' ? $('input[name="txtOther"]').val() : '',
                PRDCTNAME: $('input[name="part_date"]').val(),
                TRANSNO: radSample,
                DETTRANS:
                    radSample == '2'
                        ? $('input[name="txtReturn"]').val()
                        : radSample == '3'
                          ? $('input[name="txtOth"]').val()
                          : '',
                BEFCHANGE: $('#txtBefChg').val(),
                AFTCHANGE: $('#txtAftChg').val(),
                // ...(submitDate && { SUBMITDATE: submitDate }),
                // ...(inspecDate && { INSPECDATE: inspecDate }),
                // ...(expchgDate && { EXPCHGDATE: expchgDate }),
                SUBMITDATE: formatDate(submitVal, 'YYYY-MM-DD'),
                INSPECDATE: formatDate(inspecVal, 'YYYY-MM-DD'),
                EXPCHGDATE: formatDate(expchgVal, 'YYYY-MM-DD'),
                PRTNAME: $('input[name="txtPrtName"]').val(),
                PURITEM: puritm,
                INVNO: invno,
                ORDQ: $('input[name="txtOrdQ"]').val(),
                PRTLOC: $('input[name="txtprtLoc"]').val(),
                RQCNREF: $('input[name="txtNoRef"]').val(),
                ORDERNO: $('input[name="txtOrder"]').val(),
                DWGNO: dwgArray,
            };

            const frm = $('#cn-form');
            var cnformData = new FormData(frm[0]);
            for (const key in frm2) {
                if (frm2.hasOwnProperty(key)) {
                    const value = frm2[key];

                    // เช็คว่าถ้าค่าเป็น Array หรือ Object (เช่น dwgArray) ให้แปลงเป็น String ก่อน
                    if (typeof value === 'object' && value !== null) {
                        // ใช้ .append() หรือ .set() ก็ได้ (แนะนำ .set() เพื่อให้มันทับค่าเดิมถ้าใน HTML มีชื่อซ้ำกัน)
                        cnformData.set(key, JSON.stringify(value));
                    }
                    // ถ้าเป็นค่าว่าง, ข้อความ หรือ ตัวเลขปกติ
                    else if (value !== undefined) {
                        cnformData.set(key, value);
                    }
                }
            }
            filterFormData(cnformData, { empty: true });
            logFormData(cnformData);
            //console.log(cnformData);
            //return false;
            const status = await create(cnformData);
            // cnformData.append('nfrmno', nfrmno);
            // cnformData.append('vorgno', vorgno);
            // cnformData.append('cyear', cyear);
            // cnformData.append('act', action);
            // cnformData.append('empno', empno);
            // console.log(cnformData);
            // const status = await insertfrm(cnformData);
            if (!status.status) {
                showMessage(status.message, 'warning');
                return false;
            } else {
                redirectWebflow();
            }
        }
    });
});

$(document).on('change', '.selsec', function () {
    const val = $(this).val();
    $('.chkn').toggleClass('hidden', val !== '2');
    $('.chky').toggleClass('hidden', val !== '1');
    //console.log(val);

    //$('.tr-yes').toggleClass('hidden', val !== '1');
    //$('.tr-no').toggleClass('hidden', val !== '2');
});

$(document).on('change', '.selproc', function () {
    const val = $(this).val();
    $('.chke').toggleClass('hidden', val !== '2');
    //console.log(val);

    //$('.tr-yes').toggleClass('hidden', val !== '1');
    //$('.tr-no').toggleClass('hidden', val !== '2');
});

$(document).on('click', '.add-table-row', function (e) {
    const tableid = $(this).attr('data-table');
    const lastRow = $('#' + tableid + ' tr:last');
    const newRow = lastRow.clone();
    newRow.find('input').val('');
    $('#' + tableid).append(newRow);
});

$(document).on('click', '.add-row', function (e) {
    e.preventDefault();
    const var1 = $(this).attr('data-var1');
    const var2 = $(this).attr('data-var2');
    const maxsize = $(this).attr('data-var3');

    add_more(var1, var2, maxsize);
});

$(document).on('click', '.reset-file', function (e) {
    e.preventDefault();
    const container = $(this).closest('.dvSFile');
    container.find('input[type="file"]').val('');
});

$(document).on('click', '.del-table-row', function (e) {
    const tableid = $(this).attr('data-table');
    const row = $(this).closest('tr');
    const totalRows = $('#' + tableid + ' tr').length;
    console.log(totalRows);
    if (totalRows > 1) {
        row.remove();
    }
});

function add_more(fl, dv, s) {
    var div = document.createElement('DIV');
    var str =
        '<div class="dvSFile flex items-center justify-between gap-2 mb-2"><input type="file" name="' +
        fl +
        '[]" data-map="' +
        fl +
        '"' +
        'data-max-kb="' +
        s +
        '"' +
        ' class="file-input file-input-bordered border-blue-200 w-full" multiple> <button type="button" ';
    str +=
        'class="reset-file btn-square bg-red-200 hover:bg-red-300 text-red-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer" title="Reset file input"> ';
    str +=
        '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg> </button></div>';
    div.innerHTML = str;
    document.getElementById(dv).appendChild(div);
}

$(document).on('focus click', '#txtOther', function () {
    $('input[name="radReason"][value="5"]')
        .prop('checked', true)
        .trigger('change');
});

$(document).on('focus click', '#txtReturn', function () {
    $('input[name="radSample"][value="2"]')
        .prop('checked', true)
        .trigger('change');
});

$(document).on('focus click', '#txtOth', function () {
    $('input[name="radSample"][value="3"]')
        .prop('checked', true)
        .trigger('change');
});

$(document).on('focus click', '#txtLoc', function () {
    $('input[name="radLoc"][value="2"]')
        .prop('checked', true)
        .trigger('change');
});

function checkData() {
    let reason = $('input[name="radReason"]:checked').val();
    let sample = $('input[name="radSample"]:checked').val();
    let radsec = $('input[name="radsec"]:checked').val();
    let radProc = $('input[name="radProcAMEC"]:checked').val();

    if (radsec == '1') {
        if ($('input[name="Sec"]:checked').val() == '') {
            showMessage('Please select section support', 'warning');
            return false;
        }
    }

    if (radProc == '2') {
        if ($('input[name="radobj"]:checked').val() == '') {
            showMessage('Please select Evaluation object tivet', 'warning');
            return false;
        }
    }

    if (!checkHasDWG()) {
        showMessage('Please input Drawing', 'warning');
        return false;
    }
    if (reason == '5' && $('#txtOther').val() == '') {
        showMessage('Please input Reason for others', 'warning');
        return false;
    }
    if (sample == '2' && $('#txtReturn').val() == '') {
        showMessage('Please input Return to', 'warning');
        return false;
    }
    if (sample == '3' && $('#txtOth').val() == '') {
        showMessage('Please input Other', 'warning');
        return false;
    }
    return true;
}

function checkHasDWG() {
    let hasValue = false;

    $('input[name="txtDwgNo[]"]').each(function () {
        if ($(this).val().trim() !== '') {
            hasValue = true;
            return false; // เจอแล้ว หยุด loop
        }
    });

    return hasValue;
}

$(document).on('change', '.file-input', async function () {
    const type = $(this).attr('data-map');
    if (type == 'MAKFILE') {
        return;
    }
    const maxKB = parseInt($(this).attr('data-max-kb'), 10);
    const maxSize = maxKB * 1024; // byte

    if (!this.files || this.files.length === 0) return;

    for (let i = 0; i < this.files.length; i++) {
        const file = this.files[i];

        if (file.size > maxSize) {
            showMessage(
                file.name +
                    ' ' +
                    (file.size / 1024).toFixed(0) +
                    ' KB over ' +
                    maxKB +
                    ' KB',
                'warning',
            );
            $(this).val(''); // ล้างเฉพาะ input นี้
            return;
        }
    }
});

function insertfrm(data) {
    return new Promise((resolve) => {
        $.ajax({
            url: host + 'qaform/QA-CN/form/insertcn',
            type: 'post',
            dataType: 'json',
            processData: false,
            contentType: false,
            data: data,
            beforeSend: function () {
                showLoader({ show: true });
            },
            success: function (res) {
                resolve(res);
            },
            complete: function (xhr, status) {
                showLoader({ show: false });
            },
        });
    });
}

export async function create(form) {
    return fetchUtils({
        url: `${process.env.APP_API}/qaform/qa-cn/create`,
        method: 'POST',
        data: form,
    });
}

export async function approve(form) {
    return fetchUtils({
        url: `${process.env.APP_API}/qaform/qa-cn/approve`,
        method: 'PATCH',
        data: form,
    });
}

export async function searchAs400(inv, puritm) {
    return fetchUtils({
        url: `${process.env.APP_API}/as400/j736kp/search?inv=${inv}&puritm=${puritm}`,
        method: 'GET',
    });
}
