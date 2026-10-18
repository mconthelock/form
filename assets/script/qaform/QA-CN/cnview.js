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
    logFormData,
    filterFormData,
} from '@amec/webasset/utils';
import {
    showflow,
    doaction,
    getFormStatus,
    getFormno,
} from '@amec/webasset/api/webform';
import { sendmail } from '@amec/webasset/api/mail';
import { fetchUtils } from '@amec/webasset/api/fetch-utils';
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

    const { nfrmno, vorgno, cyear, cyear2, nrunno, empno } = formData;
    const flow = await showflow({
        NFRMNO: nfrmno,
        VORGNO: vorgno,
        CYEAR: cyear.toString(),
        CYEAR2: cyear2.toString(),
        NRUNNO: nrunno,
        showStep: true,
    });

    $('.flow').html(flow.html);

    $('.btn-submit').click(async function () {
        try {
            showLoader();
            let action = $(this).data('action');
            if (action !== 'deleteApv') {
                if ($('#mstatus').val() != '1') {
                    // --- โค้ดสำหรับ Debug ดูค่าของ class req ---
                    console.log('--- ตรวจสอบช่องที่บังคับกรอก (.req) ---');
                    $('#cn-form .req').each(function () {
                        // ดึงชื่อ ID หรือ Name เพื่อให้รู้ว่าเป็นช่องไหน
                        const elemName =
                            $(this).attr('id') ||
                            $(this).attr('name') ||
                            'ไม่ทราบชื่อ';
                        const elemValue = $(this).val();

                        if (!elemValue || elemValue.trim() === '') {
                            console.log('❌ ว่าง (ไม่มีค่า) :', elemName);
                        } else {
                            console.log(
                                '✅ มีค่า :',
                                elemName,
                                '=>',
                                elemValue,
                            );
                        }
                    });
                    console.log('------------------------------------');
                    // ------------------------------------------

                    if (!(await requiredForm('#cn-form'))) return;
                }

                // *จุดที่แก้ไขให้: ถ้า checkData ไม่ผ่าน ให้หยุดการทำงาน (return)
                if (!checkData(action)) {
                    console.log('checko');

                    return;
                }
            }
            console.log('xxxxxxxxxxx');
            const txtRemark = $('#txtRemark').val();

            if (action == 'deleteApv') {
                var cnformData = new FormData();
                cnformData.append('NFRMNO', nfrmno);
                cnformData.append('VORGNO', vorgno);
                cnformData.append('CYEAR', cyear);
                cnformData.append('CYEAR2', cyear2);
                cnformData.append('NRUNNO', nrunno);
                cnformData.append('ACTION', action);
                cnformData.append('EMPNO', empno);
                cnformData.append('APVNO', empno);
                cnformData.append('REMARK', txtRemark);
            } else {
                action = action === 'returnrem' ? 'return' : action;
                let targetInput = $('input[name="chkClass"]');
                let inputType;
                let clsNoValue = '';
                let rsnno = '';
                let prdctname = '';
                let radSample = '';
                let txtBefChg = '';
                let txtAftChg = '';
                let submitVal = '';
                let inspecVal = '';
                let expchgVal = '';
                let txtPrtName = '';
                let txtOrdQ = '';
                let txtprtLoc = '';
                let txtNoRef = '';
                let txtOrder = '';
                const puritm = $('input[name="txtPurItem"]').val();
                const invno = $('input[name="txtInvNo"]').val();
                const dwgArray = [];
                if (targetInput.length > 0) {
                    // เช็คว่ามี element นี้อยู่บนหน้าจอ
                    inputType = targetInput.prop('type');

                    if (inputType === 'radio') {
                        clsNoValue = targetInput.filter(':checked').val();
                    } else {
                        clsNoValue = targetInput.val();
                    }
                }
                targetInput = $('input[name="radReason"]');
                if (targetInput.length > 0) {
                    // เช็คว่ามี element นี้อยู่บนหน้าจอ
                    inputType = targetInput.prop('type');
                    if (inputType === 'radio') {
                        rsnno = targetInput.filter(':checked').val();
                    }
                }
                targetInput = $('input[name="part_date"]');
                if (targetInput.length > 0) {
                    prdctname = targetInput.val();
                }
                targetInput = $('input[name="radSample"]');
                if (targetInput.length > 0) {
                    // เช็คว่ามี element นี้อยู่บนหน้าจอ
                    inputType = targetInput.prop('type');
                    if (inputType === 'radio') {
                        radSample = targetInput.filter(':checked').val();
                    }
                }
                targetInput = $('textarea[name="txtBefChg"]');
                if (targetInput.length > 0) {
                    txtBefChg = targetInput.val();
                }
                targetInput = $('textarea[name="txtAftChg"]');
                if (targetInput.length > 0) {
                    txtAftChg = targetInput.val();
                }
                targetInput = $('input[name="submit_date"]');
                if (targetInput.length > 0) {
                    submitVal = targetInput.val();
                }
                targetInput = $('input[name="inspec_date"]');
                if (targetInput.length > 0) {
                    inspecVal = targetInput.val();
                }
                targetInput = $('input[name="expchg_date"]');
                if (targetInput.length > 0) {
                    expchgVal = targetInput.val();
                }
                targetInput = $('input[name="txtPrtName"]');
                if (targetInput.length > 0) {
                    txtPrtName = targetInput.val();
                }
                targetInput = $('input[name="txtOrdQ"]');
                if (targetInput.length > 0) {
                    txtOrdQ = targetInput.val();
                }
                targetInput = $('input[name="txtprtLoc"]');
                if (targetInput.length > 0) {
                    txtprtLoc = targetInput.val();
                }
                targetInput = $('input[name="txtNoRef"]');
                if (targetInput.length > 0) {
                    txtNoRef = targetInput.val();
                }
                targetInput = $('input[name="txtOrder"]');
                if (targetInput.length > 0) {
                    txtOrder = targetInput.val();
                }
                let dwgInputs = $('input[name="txtDwgNo[]"]');
                if (dwgInputs.length > 0) {
                    $('#dwg-body tr').each(function () {
                        let dwgNo = $(this)
                            .find('input[name="txtDwgNo[]"]')
                            .val();
                        let txtG = $(this).find('input[name="txtG[]"]').val();
                        let txtL = $(this).find('input[name="txtL[]"]').val();
                        let revNo = $(this).find('input[name="revNo[]"]').val();
                        let fullDwgNo = [dwgNo, txtG, txtL]
                            .filter(Boolean)
                            .join(' ');

                        if (dwgNo) {
                            dwgArray.push({
                                DWGNO: fullDwgNo,
                                REVNO: revNo,
                            });
                        }
                    });
                } else {
                    $('#dwg-body tr').each(function () {
                        let dwgNo = $(this).find('.btn-open').data('dwgfull');
                        let radValue = $(this).find('.radDwg:checked').val();
                        let remark = $(this).find('.txtDwgRem').val();
                        // นำข้อมูลของแถวนี้มาจัดรูปเป็น Object แล้วใส่ใน Array
                        if (dwgNo) {
                            dwgArray.push({
                                DWGNO: dwgNo,
                                RESULT:
                                    radValue !== undefined ? radValue : null, // ถ้าไม่ได้เลือกให้เป็น null
                                REMARK: remark,
                            });
                        }
                    });
                }

                const frm2 = {
                    NFRMNO: nfrmno,
                    VORGNO: vorgno,
                    CYEAR: cyear,
                    CYEAR2: cyear2,
                    NRUNNO: nrunno,
                    APVNO: empno,
                    EMPNO: empno,
                    REMARK: txtRemark,
                    ACTION: action,
                    TITLE: $('input[name="txtTitle"]').val(),
                    ITEMNO: $('input[name="txtItemno"]').val(),
                    SVENDNAME: $('input[name="txtSupName"]').val(),
                    CLSNO: clsNoValue,
                    ...(rsnno && { RSNNO: rsnno }),
                    ...(rsnno && {
                        RSNOTHER:
                            rsnno == '5'
                                ? $('input[name="txtOther"]').val()
                                : '',
                    }),
                    ...(prdctname && { PRDCTNAME: prdctname }),
                    ...(radSample && { TRANSNO: radSample }),
                    ...(radSample && {
                        DETTRANS:
                            radSample == '2'
                                ? $('input[name="txtReturn"]').val()
                                : radSample == '3'
                                  ? $('input[name="txtOth"]').val()
                                  : '',
                    }),

                    ...(txtBefChg && { BEFCHANGE: txtBefChg }),
                    ...(txtAftChg && { AFTCHANGE: txtAftChg }),
                    ...(submitVal && {
                        SUBMITDATE: formatDate(
                            submitVal,
                            'YYYY-MM-DD',
                            'DD/MM/YYYY',
                        ),
                    }),
                    ...(inspecVal && {
                        INSPECDATE: formatDate(
                            inspecVal,
                            'YYYY-MM-DD',
                            'DD/MM/YYYY',
                        ),
                    }),
                    ...(expchgVal && {
                        EXPCHGDATE: formatDate(
                            expchgVal,
                            'YYYY-MM-DD',
                            'DD/MM/YYYY',
                        ),
                    }),
                    ...(txtPrtName && { PRTNAME: txtPrtName }),
                    PURITEM: puritm,
                    INVNO: invno,
                    ...(txtOrdQ && { ORDQ: txtOrdQ }),
                    ...(txtprtLoc && { PRTLOC: txtprtLoc }),
                    ...(txtNoRef && { RQCNREF: txtNoRef }),
                    ...(txtOrder && { ORDERNO: txtOrder }),
                    DWGNO: dwgArray,
                };
                const frm = $('#cn-form');
                var originalData = new FormData(frm[0]);
                var cnformData = new FormData(); // สร้างตัวใหม่มารองรับ
                for (let [key, value] of originalData.entries()) {
                    // เปลี่ยน key เป็นตัวพิมพ์ใหญ่ แล้วเก็บลง FormData ตัวใหม่
                    cnformData.append(key.toUpperCase(), value);
                }
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
            }
            filterFormData(cnformData, { empty: true });
            // logFormData(cnformData);

            const status = await approve(cnformData);
            if (!status.status) {
                showMessage(status.message, 'warning');
                return false;
            } else {
                redirectWebflow();
            }
        } catch (err) {
            console.error(err);
            showErrorMessage(err);
        } finally {
            showLoader({ show: false });
        }
    });

    $('.btn-submitxxx').click(async function () {
        //console.log("xxxxxxxxxx");

        let action = $(this).data('action');
        const baseForm = {
            NFRMNO: nfrmno,
            VORGNO: vorgno,
            CYEAR: cyear,
            CYEAR2: cyear2,
            NRUNNO: nrunno,
        };
        //console.log(action);
        //return false;

        if (action != 'deleteApv') {
            if ($('#mstatus').val() != '1') {
                if (!(await requiredForm('#cn-form'))) return;
            }
            if (checkData(action)) {
                action = action === 'returnrem' ? 'return' : action;
                const frm = $('#cn-form');
                var cnformData = new FormData(frm[0]);
                cnformData.append('nfrmno', nfrmno);
                cnformData.append('vorgno', vorgno);
                cnformData.append('cyear', cyear);
                cnformData.append('cyear2', cyear2);
                cnformData.append('nrunno', nrunno);
                cnformData.append('action', action);
                cnformData.append('empno', empno);

                let mstatus = cnformData.get('mstatus');
                let cextData = parseInt(cnformData.get('cextData'));
                let stepready = cnformData.get('stepready');
                //     for (let pair of cnformData.entries()) {
                //     console.log(pair[0] + ' = ' + pair[1]);
                // }

                // console.log(empno);

                // return false;

                console.log(action);
                if (action == 'approve' || action == 'reject') {
                    console.log('xxxx');
                    let act;
                    //let cextData =  parseInt($("#cextData").val());
                    if (cextData > 1 && cextData != 5 && action == 'reject') {
                        act = 'approve';
                    } else {
                        act = action;
                    }

                    const confirm = await doaction({
                        ...baseForm,
                        ACTION: act,
                        EMPNO: empno,
                        REMARK: $('#txtRemark').val(),
                    });
                    console.log('aaaaaaaaa' + confirm.status);
                    if (confirm.status) {
                        const statusact = await actionfrm(cnformData);

                        const formStatus = await getFormStatus({
                            ...baseForm,
                        });
                        console.log('formStatus =' + formStatus);

                        if (formStatus == '2' || formStatus == '3') {
                            if (formStatus == '3' && mstatus == '1') {
                                const resform = await createcnng(baseForm);
                            }

                            let param = {
                                ...baseForm,
                                FSTATUS: formStatus,
                                MTYPE: mstatus == '1' ? 'PIC' : 'ALL',
                            };

                            const res = await buildmail(param);

                            if (!res.to || !res.subject || !res.html) {
                                throw 'Mail data is incomplete';
                            }

                            let objmail = {
                                from: 'noreplay@MitsubishiElevatorAsia.co.th',
                                to: res.to,
                                subject: res.subject,
                                html: res.html,
                            };

                            // รอให้ส่งเมลเสร็จก่อน
                            await sendmail(objmail);
                        } else if (stepready == '06' && mstatus == '1') {
                            let param = {
                                ...baseForm,
                                FSTATUS: formStatus,
                                MTYPE: 'FOREMAN',
                            };
                            const res = await buildmail(param);

                            if (!res.to || !res.subject || !res.html) {
                                throw 'Mail data is incomplete';
                            }

                            let objmail = {
                                from: 'noreplay@MitsubishiElevatorAsia.co.th',
                                to: res.to,
                                subject: res.subject,
                                html: res.html,
                            };

                            // รอให้ส่งเมลเสร็จก่อน
                            await sendmail(objmail);
                        }
                        // แล้วค่อย redirect
                        if (statusact.status) {
                            redirectWebflow();
                        }
                    }
                } else if (action == 'sendApv') {
                    if (stepready != '--') {
                        const statusact = await actionfrm(cnformData);
                        if (statusact.status) {
                            redirectWebflow();
                        }
                    } else {
                        const confirm = await doaction({
                            ...baseForm,
                            ACTION: 'approve',
                            EMPNO: empno,
                            REMARK: $('#txtRemark').val(),
                        });
                        if (confirm.status) {
                            const statusact = await actionfrm(cnformData);
                            if (statusact.status) {
                                redirectWebflow();
                            }
                        }
                    }
                } else if (action == 'returnb') {
                    const confirm = await doaction({
                        ...baseForm,
                        ACTION: 'returnb',
                        EMPNO: empno,
                        REMARK: $('#txtRemark').val(),
                    });
                    if (confirm.status) {
                        redirectWebflow();
                    }
                } else {
                    //console.log("actionfrm");
                    const statusact = await actionfrm(cnformData);
                    console.log(statusact);

                    if (action == 'return') {
                        let param = {
                            ...baseForm,
                            FSTATUS: '1',
                            MTYPE: 'REQUESTER',
                        };
                        const res = await buildmail(param);

                        if (!res.to || !res.subject || !res.html) {
                            throw 'Mail data is incomplete';
                        }
                        let objmail = {
                            from: 'noreplay@MitsubishiElevatorAsia.co.th',
                            to: res.to,
                            subject: res.subject,
                            html: res.html,
                        };
                        // รอให้ส่งเมลเสร็จก่อน
                        await sendmail(objmail);
                    }
                    if (statusact.status) redirectWebflow();
                }
            }
        } else {
            const frm = $('#cn-form');
            var cnformData = new FormData(frm[0]);
            cnformData.append('nfrmno', nfrmno);
            cnformData.append('vorgno', vorgno);
            cnformData.append('cyear', cyear);
            cnformData.append('cyear2', cyear2);
            cnformData.append('nrunno', nrunno);
            cnformData.append('action', action);
            cnformData.append('empno', empno);
            const statusact = await actionfrm(cnformData);
            if (statusact.status) redirectWebflow();
        }

        // console.log($("#chkopr").val() );
        // console.log(">>>"||$("#demapv").val()||"<<<<");
        // if($("#demapv").val()=="1")
        // {
        //   console.log("IF");
        // }else{
        //   console.log("ELSE");
        // }
    });
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

$(document).on('click', '.add-table-row', function (e) {
    const tableid = $(this).attr('data-table');
    const lastRow = $('#' + tableid + ' tr:last');
    const newRow = lastRow.clone();
    newRow.find('input').val('');
    $('#' + tableid).append(newRow);
});

$(document).on('change', '.radio-result', function (e) {
    //Result OK
    if ($(this).val() == 0) {
        $('#btn-approve').removeClass('hidden'); // แสดงปุ่ม
        $('#btn-reject').addClass('hidden'); // ซ่อนปุ่ม
        $('#btn-cancel').addClass('hidden'); // ซ่อนปุ่ม
        $('#radio-acceptable').prop('checked', true);
    } else {
        //Result NG
        $('#btn-approve').addClass('hidden'); // แสดงปุ่ม
        $('#btn-reject').removeClass('hidden'); // ซ่อนปุ่ม
        $('#btn-cancel').removeClass('hidden'); // ซ่อนปุ่ม
        $('#radio-notaccept').prop('checked', true);
    }
    // const tableid =  $(this).attr("data-table");
    // const lastRow = $("#"+tableid+" tr:last");
    // const newRow = lastRow.clone();
    // newRow.find("input").val("");
    // $("#"+tableid).append(newRow);
});

/**
 * Delete file
 */
$(document).on('click', '.del-file', async function () {
    const nfrmno = $('.form-data').attr('data-nfrmno');
    const vorgno = $('.form-data').attr('data-vorgno');
    const cyear = $('.form-data').attr('data-cyear');
    const cyear2 = $('.form-data').attr('data-cyear2');
    const nrunno = $('.form-data').attr('data-nrunno');
    $(this).closest('.openfl').remove();
    var itemno = $(this).closest('.openfl').attr('data-id');
    var sfile = $(this).closest('.openfl').attr('data-filename');
    const data = {
        nfrmno: nfrmno,
        vorgno: vorgno,
        cyear: cyear,
        cyear2: cyear2,
        nrunno: nrunno,
        itemno: itemno,
        sfile: sfile,
    };
    console.log(data);
    const resdel = await deletefile(data);
});

$(document).on('click', '.btn-export', async function () {
    const nfrmno = $('.form-data').attr('data-nfrmno');
    const vorgno = $('.form-data').attr('data-vorgno');
    const cyear = $('.form-data').attr('data-cyear');
    const cyear2 = $('.form-data').attr('data-cyear2');
    const nrunno = $('.form-data').attr('data-nrunno');
    $.ajax({
        type: 'POST',
        url: host + 'qaform/QA-CN/form/exportexcel',
        data: {
            nfrmno: nfrmno,
            vorgno: vorgno,
            cyear: cyear,
            cyear2: cyear2,
            nrunno: nrunno,
        },
        dataType: 'json',
        beforeSend: function () {
            showLoader({ show: true });
        },
        success: function (res) {
            openExcel(res.filename, res.content);
        },
        complete: function (xhr, status) {
            showLoader({ show: false });
        },
        error: function (xhr, status, error) {
            console.error('Export Error:', xhr.responseText);
            showMessage('Export Excel Error , please try agian', 'error');
        },
    });
});

$(document).on('click', '.btn-export-frm', async function () {
    const nfrmno = $('.form-data').attr('data-nfrmno');
    const vorgno = $('.form-data').attr('data-vorgno');
    const cyear = $('.form-data').attr('data-cyear');
    const cyear2 = $('.form-data').attr('data-cyear2');
    const nrunno = $('.form-data').attr('data-nrunno');
    $.ajax({
        type: 'POST',
        url: host + 'qaform/QA-CN/form/exportfrm',
        data: {
            nfrmno: nfrmno,
            vorgno: vorgno,
            cyear: cyear,
            cyear2: cyear2,
            nrunno: nrunno,
        },
        dataType: 'json',
        beforeSend: function () {
            showLoader({ show: true });
        },
        success: function (res) {
            openExcel(res.filename, res.content);
        },
        complete: function (xhr, status) {
            showLoader({ show: false });
        },
        error: function (xhr, status, error) {
            console.error('Export Error:', xhr.responseText);
            showMessage('Export Form Error , please try agian', 'error');
        },
    });
});

$(document).on('click', '.radDwg', function () {
    let val = $(this).val();

    if (val === '0') {
        $('#btnApprove').show();
        $('#btnReject').hide();
        $('#btnReturn').show();
    } else {
        $('#btnApprove').hide();
        $('#btnReject').show();
        $('#btnReturn').hide();
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

$(document).on('click', '.btn-print', function () {
    const nfrmno = $('.form-data').data('nfrmno');
    const vorgno = $('.form-data').data('vorgno');
    const cyear = $('.form-data').data('cyear');
    const cyear2 = $('.form-data').data('cyear2');
    const nrunno = $('.form-data').data('nrunno');

    const url =
        host +
        'qaform/QA-CN/form/printcn' +
        '?no=' +
        nfrmno +
        '&orgNo=' +
        vorgno +
        '&y=' +
        cyear +
        '&y2=' +
        cyear2 +
        '&runNo=' +
        nrunno;

    window.open(url, '_blank');
});

function actionfrm(data) {
    return new Promise((resolve) => {
        $.ajax({
            url: host + 'qaform/QA-CN/form/action',
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

function buildmail(formno) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: host + 'qaform/QA-CN/form/buildmail',
            type: 'post',
            dataType: 'json',
            data: formno,
            success: function (res) {
                resolve(res);
            },
            error: function (xhr, status, error) {
                reject(error);
            },
        });
    });
}

function createcnng(formno) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: host + 'qaform/QA-CN/form/createcnng',
            type: 'post',
            dataType: 'json',
            data: formno,
            success: function (res) {
                resolve(res);
            },
            error: function (xhr, status, error) {
                reject(error);
            },
        });
    });
}

function checkData(act) {
    let cextdata = parseInt($('#cextData').val());
    const chkopr = $('#chkopr').val();
    const demapv = $('#demapv').val();
    if (act == 'jobsaveData') {
        return true;
    }
    if (act == 'saveData' || act == 'sendApv') {
        let reason = $('input[name="radReason"]:checked').val();
        let sample = $('input[name="radSample"]:checked').val();
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
    } else if (act == 'change') {
        if ($('#Foreman').val() == '') {
            showMessage('Please select Foreman', 'warning');
            return false;
        }
        return true;
    } else if (act == 'changepic') {
        if ($('#Pic').val() == '') {
            showMessage('Please select Change To', 'warning');
            return false;
        }
        return true;
    } else if (
        act == 'returnb' ||
        act == 'returnrem' ||
        act == 'returnqastaff' ||
        act == 'returnass'
    ) {
        if ($('#txtRemark').val() == '') {
            showMessage('Please input Remark for reason return', 'warning');
            return false;
        }
    } else if (act == 'return') {
    } else {
        if ($('#mstatus').val() == '1' && act == 'approve') {
            if (cextdata == 6 && $('#Operator').val() == '') {
                showMessage('Please select Operator', 'warning');
                return false;
            }
        }

        const needOther =
            (chkopr != '1' && cextdata >= 2 && cextdata < 8) ||
            (chkopr == '1' &&
                ((cextdata >= 3 && cextdata <= 5) || cextdata == 7));
        if (!needOther) return true;
        let radJudge = $('input[name="radJudge"]:checked').val();
        if (radJudge == '2.5' && $('#txtJdgOther1').val() == '') {
            showMessage('Please input Judgement for Not Accept', 'warning');
            return false;
        }
        if (radJudge == '4.2' && $('#txtJdgOther2').val() == '') {
            showMessage('Please input Judgement for Cancel', 'warning');
            return false;
        }
        if (cextdata == 2) {
            if (!$('#cn-form').find('[name=radJudge]:checked').length) {
                showMessage('Please select Judgement.', 'warning');
                return false;
            }
            if (chkopr == '1' && act == 'approve') {
                let hasOldFile = false;
                if ($('#dvmak .openfl').length > 0) {
                    hasOldFile = true;
                }
                let hasNewFile = false;
                $('input[type="file"][name="CHKFILE[]"]').each(function () {
                    if (this.files && this.files.length > 0) {
                        hasNewFile = true;
                    }
                });
                if (!hasOldFile && !hasNewFile) {
                    showMessage('Please attach Check Sheet.', 'warning');
                    return false;
                }
            }
        }
        if (cextdata == 7) {
            let count = 0;
            while ($('#cn-form').find(`[name='radDwg${count}']`).length) {
                const rad = $('#cn-form').find(`[name='radDwg${count}']`);
                if (!rad.is(':checked')) {
                    showMessage('Please Check result for Drawing', 'warning');
                    return false;
                }
                count++;
            }
        }
    } // end else
    return true;
}

/**
 * Delete file
 * @param {array} data
 * @returns
 */
function deletefile(data) {
    return new Promise((resolve) => {
        $.ajax({
            url: host + 'qaform/QA-CN/form/delfile',
            type: 'post',
            dataType: 'json',
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

$(document).on('click', '.btn-open', function () {
    // var dwg = $(this).attr("data-dwg");
    // var rev = $(this).attr("data-rev");
    var dwg = $(this).data('dwg');
    var rev = $(this).data('rev');
    if (rev === '*') rev = '0';

    var url =
        'http://amecweb.mitsubishielevatorasia.co.th/pdmopendwg/menu_control/openfile2?dwg=' +
        encodeURIComponent(dwg) +
        '&rev=' +
        encodeURIComponent(rev);

    window.open(
        url,
        'dwg',
        'width=1000,height=800,scrollbars=yes,resizable=yes',
    );
});

export async function approve(form) {
    return fetchUtils({
        url: `${process.env.APP_API}/qaform/qa-cn/approve`,
        method: 'PATCH',
        data: form,
    });
}
//function opendwg(dwg , rev) {
// console.log(dwg);
// console.log(rev);
//alert("xxx"+dwg);
// if(rev == "*")
// {
//   rev = "0";
// }
// if(rev != "")
// {
//    const win =  window.open("http://amecweb.mitsubishielevatorasia.co.th/pdmopendwg/menu_control/openfile2?dwg="+dwg+"&rev="+rev,"dwg",NOTOP_WIN_CONF);
// }else{
//    const win =  window.open("http://amecweb.mitsubishielevatorasia.co.th/pdmopendwg/menu_control/openfile2?dwg="+dwg,"dwg",NOTOP_WIN_CONF);
// }
//  if (win) {
//       win.focus();
//   }
//}

function openExcel(fileName, dataBase64) {
    var fileType = fileName.split('.').pop();
    fileType =
        'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,';
    var $a = $('<a>');
    $a.attr('href', fileType + dataBase64);
    $('body').append($a);
    $a.attr('download', fileName);
    $a[0].click();
    $a.remove();
}
