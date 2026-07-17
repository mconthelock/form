import {
    showflow,
    getExtData,
    updateFlow,
    doaction,
    getFormno,
    getFormDetail,
    deleteFlowandForm,
    deleteFlowStep,
} from '@amec/webasset/api/webform';
import { webflowSubmit, getformDetail } from '@amec/webasset/components/form';
import { formSubmitSkeleton } from '@amec/webasset/skeleton';
import { createTable } from '@amec/webasset/dataTable';
import {
    filterFormData,
    getAllAttr,
    logFormData,
    ordinalIndicator,
    removeClassError,
    requiredForm,
    setRound,
    showErrorMessage,
    showMessage,
} from '@amec/webasset/utils';
import { getData, updatepck } from './data';
import { formatDate } from '@amec/webasset/dayjs';
import select2 from 'select2';
import { setSelect2 } from '@amec/webasset/select2';
import {
    getByPosition,
    getManager,
    getSubordinates,
} from '@amec/webasset/api/sequence-org';
import { showLoader } from '@amec/webasset/preloader';
import { redirectWebflow } from '@amec/webasset/form';
import { getTemplate } from './function';
import ExcelJS from 'exceljs';
import { writeExcelTemp, exportExcel } from '@amec/webasset/excel';
import { checkEmployee } from '@amec/webasset/employee';
import { getEmployee, searchUser } from '@amec/webasset/api/amec';
import { getOrganize } from './dataloc';
import { getRepresent } from '@amec/webasset/api/rep';
select2();
var tablepck;
var form = {};
var data = {};
let targetClasses = [
    '.input-confirm',
    '.input-nosticker',
    '.input-lost',
    '.input-damage',
    '.input-movement',
    '.input-oth',
];
$(async function () {
    const formInfo = await getAllAttr('.form-info');
    form = {
        NFRMNO: formInfo.nfrmno,
        VORGNO: formInfo.vorgno,
        CYEAR: formInfo.cyear,
        CYEAR2: formInfo.cyear2,
        NRUNNO: formInfo.nrunno,
    };
    const formDetail = await getformDetail(form);
    console.log('formDetail = ' + formDetail);

    data = await getData(form);
    $('#loccode').text(data.LOCCODE);
    $('#locname').text(data.LOCNAME);
    console.log(data);

    const apvno = $('.apv-data').attr('empno');
    const cextdata = await getExtData({ ...form, EMPNO: apvno });
    const isEditable = cextdata === '02';
    const flow = await showflow({ ...form, showStep: true });
    const container = $('#form-action-container');
    const showformdetail = $('#form-detail');
    const mode = Number(formInfo.mode);
    showformdetail.html(formDetail);
    const columnPck = [
        {
            data: 'GRPCODE',
            title: 'Group',
            className: 'text-center sticky-column bg-base-100',
        },
        {
            data: 'GRP.GRPDESC',
            title: 'Description',
            className: 'sticky-column bg-base-100 text-nowrap',
        },
        {
            data: 'ASSETNO',
            title: 'Asset No.',
            className: 'sticky-column bg-base-100 text-left',
        },
        {
            data: 'ASSETDESC',
            title: 'Description',
            className: 'text-nowrap ',
        },
        {
            data: 'DOCDATE',
            title: 'Doc Date',
            className: 'text-nowrap ',
            render: function (data) {
                return data ? formatDate(data) : '-';
            },
        },
        {
            data: 'INITVAL',
            title: 'Initialvalue',
            render: function (data) {
                return setRound(data, 2);
            },
        },
        {
            data: 'BOOKVAL',
            title: 'Bookvalue',
            render: function (data) {
                return setRound(data, 2);
            },
        },
        { data: 'MODELNO', title: 'Model No.', className: 'text-nowrap ' },
        { data: 'SNNO', title: 'S/N', className: 'text-nowrap ' },
        { data: 'PONO', title: 'P/O', className: 'text-nowrap ' },
        { data: 'REFASSET', title: 'Ref. Asset', className: 'text-nowrap ' },
        { data: 'QTY', title: 'Qty.' },
        { data: 'UNIT', title: 'Unit' },
        { data: 'SUPPLIER', title: 'Supplier', className: 'text-nowrap' },
        { data: 'PRNO', title: 'PR. NO.' },
        { data: 'REQBY', title: 'Req. By', className: 'text-nowrap' },
        {
            data: 'CONFIRM',
            title: isEditable
                ? `<div class="flex items-center gap-2 justify-center">
             Confirm 
             <input type="checkbox" id="checkAllConfirm" class="auto-fill-cb checkbox checkbox-sm checkbox-primary" data-target=".input-confirm" >
           </div>`
                : 'Confirm',
            defaultContent: '',
            render: function (data, type, row) {
                // เช็คเผื่อไว้ถ้าโครงสร้างหลุดหรือไม่มีคนรับผิดชอบ ให้แสดงเป็นช่องว่างหรือเครื่องหมาย -
                if (isEditable) {
                    // ถ้าเป็นโหมดให้กรอกได้ ให้แสดงเป็น Input แล้วเอา empText ไปตั้งเป็นค่าเริ่มต้น
                    return `<input type="hidden" name="assetid" class="input-id" value="${row.ID}"><input type="text" oninput="this.value = this.value.replace(/[^0-9]/g, '')" class="input input-bordered input-sm w-[50px] input-confirm check-qty" value="${row.CONFIRM || ''}" data-asset="${row.ASSETNO}" data-qty="${row.QTY}">`;
                } else {
                    return row.CONFIRM;
                }
            },
        },
        {
            data: 'NOSTICKER',
            title: isEditable
                ? `<div class="flex items-center gap-2 justify-center">
             No Sticker 
             <input type="checkbox" id="checkAllSticker" class="auto-fill-cb checkbox checkbox-sm checkbox-primary" data-target=".input-nosticker">
           </div>`
                : 'No Sticker',
            defaultContent: '',
            render: function (data, type, row) {
                // เช็คเผื่อไว้ถ้าโครงสร้างหลุดหรือไม่มีคนรับผิดชอบ ให้แสดงเป็นช่องว่างหรือเครื่องหมาย -
                if (isEditable) {
                    // ถ้าเป็นโหมดให้กรอกได้ ให้แสดงเป็น Input แล้วเอา empText ไปตั้งเป็นค่าเริ่มต้น
                    return `<input type="text" oninput="this.value = this.value.replace(/[^0-9]/g, '')" class="input input-bordered input-sm w-[50px] input-nosticker check-qty" value="${row.NOSTICKER || ''}" data-asset="${row.ASSETNO}" data-qty="${row.QTY}">`;
                } else {
                    return row.NOSTICKER;
                }
            },
        },
        {
            data: 'LOST',
            title: isEditable
                ? `<div class="flex items-center gap-2 justify-center">
             Lost 
             <input type="checkbox" id="checkAllLost" class="auto-fill-cb checkbox checkbox-sm checkbox-primary" data-target=".input-lost">
           </div>`
                : 'Lost',
            defaultContent: '',
            render: function (data, type, row) {
                // เช็คเผื่อไว้ถ้าโครงสร้างหลุดหรือไม่มีคนรับผิดชอบ ให้แสดงเป็นช่องว่างหรือเครื่องหมาย -
                if (isEditable) {
                    // ถ้าเป็นโหมดให้กรอกได้ ให้แสดงเป็น Input แล้วเอา empText ไปตั้งเป็นค่าเริ่มต้น
                    return `<input type="text" oninput="this.value = this.value.replace(/[^0-9]/g, '')" class="input input-bordered input-sm w-[50px] input-lost check-qty" value="${row.LOST || ''}" data-asset="${row.ASSETNO}" data-qty="${row.QTY}">`;
                } else {
                    return row.LOST;
                }
            },
        },
        {
            data: 'DAMAGE',
            title: isEditable
                ? `<div class="flex items-center gap-2 justify-center">
             Damage 
             <input type="checkbox" id="checkAllDamage" class="auto-fill-cb checkbox checkbox-sm checkbox-primary" data-target=".input-damage">
           </div>`
                : 'Damage',
            defaultContent: '',
            render: function (data, type, row) {
                // เช็คเผื่อไว้ถ้าโครงสร้างหลุดหรือไม่มีคนรับผิดชอบ ให้แสดงเป็นช่องว่างหรือเครื่องหมาย -
                if (isEditable) {
                    // ถ้าเป็นโหมดให้กรอกได้ ให้แสดงเป็น Input แล้วเอา empText ไปตั้งเป็นค่าเริ่มต้น
                    return `<input type="text" oninput="this.value = this.value.replace(/[^0-9]/g, '')" class="input input-bordered input-sm w-[50px] input-damage check-qty" value="${row.DAMAGE || ''}" data-asset="${row.ASSETNO}" data-qty="${row.QTY}">`;
                } else {
                    return row.DAMAGE;
                }
            },
        },
        {
            data: 'MOVEMENT',
            title: isEditable
                ? `<div class="flex items-center gap-2 justify-center">
             Movement 
             <input type="checkbox" id="checkAllMovement" class="auto-fill-cb checkbox checkbox-sm checkbox-primary" data-target=".input-movement">
           </div>`
                : 'Movement',
            defaultContent: '',
            render: function (data, type, row) {
                // เช็คเผื่อไว้ถ้าโครงสร้างหลุดหรือไม่มีคนรับผิดชอบ ให้แสดงเป็นช่องว่างหรือเครื่องหมาย -
                if (isEditable) {
                    // ถ้าเป็นโหมดให้กรอกได้ ให้แสดงเป็น Input แล้วเอา empText ไปตั้งเป็นค่าเริ่มต้น
                    return `<input type="text" oninput="this.value = this.value.replace(/[^0-9]/g, '')" class="input input-bordered input-sm w-[50px] input-movement check-qty" value="${row.MOVEMENT || ''}" data-asset="${row.ASSETNO}" data-qty="${row.QTY}">`;
                } else {
                    return row.MOVEMENT;
                }
            },
        },
        {
            data: 'OTHCAUSE',
            title: isEditable
                ? `<div class="flex items-center gap-2 justify-center">
             Other Cause 
             <input type="checkbox" id="checkAllOther" class="auto-fill-cb checkbox checkbox-sm checkbox-primary" data-target=".input-oth">
           </div>`
                : 'Other Cause',
            className: 'text-nowrap',
            defaultContent: '',
            render: function (data, type, row) {
                // เช็คเผื่อไว้ถ้าโครงสร้างหลุดหรือไม่มีคนรับผิดชอบ ให้แสดงเป็นช่องว่างหรือเครื่องหมาย -
                if (isEditable) {
                    // ถ้าเป็นโหมดให้กรอกได้ ให้แสดงเป็น Input แล้วเอา empText ไปตั้งเป็นค่าเริ่มต้น
                    return `<input type="text" oninput="this.value = this.value.replace(/[^0-9]/g, '')" class="input input-bordered input-sm w-[50px] input-oth check-qty" value="${row.OTHCAUSE || ''}" data-asset="${row.ASSETNO}" data-qty="${row.QTY}">`;
                } else {
                    return row.OTHCAUSE;
                }
            },
        },
        {
            data: 'REMOTHCAUSE',
            title: 'Remark Other Cause',
            className: 'text-nowrap',
            defaultContent: '',
            render: function (data, type, row) {
                // เช็คเผื่อไว้ถ้าโครงสร้างหลุดหรือไม่มีคนรับผิดชอบ ให้แสดงเป็นช่องว่างหรือเครื่องหมาย -
                if (isEditable) {
                    // ถ้าเป็นโหมดให้กรอกได้ ให้แสดงเป็น Input แล้วเอา empText ไปตั้งเป็นค่าเริ่มต้น
                    return `<input type="text" class="input input-bordered input-sm w-[150px] input-remoth" value="${row.REMOTHCAUSE || ''}" data-asset="${row.ASSETNO}" >`;
                } else {
                    return row.REMOTHCAUSE;
                }
            },
        },
        {
            data: 'PIC',
            title: 'Person Incharge',
            className: 'text-nowrap',
            defaultContent: '',
            render: function (data, type, row) {
                // เช็คเผื่อไว้ถ้าโครงสร้างหลุดหรือไม่มีคนรับผิดชอบ ให้แสดงเป็นช่องว่างหรือเครื่องหมาย -
                if (isEditable) {
                    // ถ้าเป็นโหมดให้กรอกได้ ให้แสดงเป็น Input แล้วเอา empText ไปตั้งเป็นค่าเริ่มต้น
                    return `<input type="text" class="input input-bordered input-sm w-[150px] input-pic" value="${row.PIC || ''}" data-asset="${row.ASSETNO}">`;
                } else {
                    return row.PIC;
                }
            },
        },
    ];

    tablepck = await createTable(
        {
            data: data.ASSETS,
            columns: columnPck,
            responsive: false,
            searching: false,
            paging: false,
            ordering: false,
        },
        {
            id: '#tablepck',
            columnSelect: { status: false },
            domScroll: { status: true, maxHeight: '25rem', type: 'tailwind4' },
            join: true,
            headerSticky: { status: true },
            language: 'en',
        },
    );
    $('#assignContainer').hide();
    $('#controllContainer').hide();
    $('#assignTo').removeClass('req');
    if (cextdata == '01') {
        const subord = getSubordinates(apvno);
        const arrsubord = await subord;

        arrsubord.sort((a, b) => {
            const posA = parseInt(a.SPOSCODE, 10);
            const posB = parseInt(b.SPOSCODE, 10);
            if (posA !== posB) {
                return posA - posB;
            }
            return a.SNAME.localeCompare(b.SNAME);
        });

        const suborddata = arrsubord.map((p) => ({
            value: p.SEMPNO,
            text: `(${p.SEMPNO}) ${p.SNAME}`,
        }));
        await setSelect2({
            id: 'assignTo',
            data: suborddata,
            size: 'sm',
            placeholder: 'Choose the person inchange',
            search: true,
            clear: false,
            width: '25%',
            emptyValue: true,
        });
        $('#assignContainer').show();
        $('#assignTo').addClass('req');
    } else if (cextdata == '06') {
        $('#controllContainer').show();
    }
    switch (mode) {
        case 2:
            container.html(
                webflowSubmit({
                    flow: true,
                    flowhtml: flow.html,
                    approve: true,
                    reject: false,
                    return:
                        cextdata !== '01' &&
                        cextdata !== '02' &&
                        cextdata !== '06',
                }),
            );
            break;
        case 3:
            container.html(
                webflowSubmit({
                    actionsForm: false,
                    remark: false,
                    flow: true,
                    flowhtml: flow.html,
                }),
            );
            break;
        default:
            container.html('');
            break;
    }
    var btnExport = $(
        '<button type="button" class="btn mg-l-12" id="btnExport" name="btnAction" value="export">Export</button>',
    );
    $('.actions-Form .flex.gap-3.mt-2').append(btnExport);
});

$(document).on('change', '.auto-fill-cb', function () {
    const isChecked = $(this).prop('checked');
    const targetInputClass = $(this).attr('data-target');

    if (isChecked) {
        // 1. สั่งให้ Checkbox ตัวโคลนของคอลัมน์เดียวกัน (ถ้ามี) โดนติ๊กไปด้วย
        $(`.auto-fill-cb[data-target="${targetInputClass}"]`).prop(
            'checked',
            true,
        );

        // 2. วิ่งไปหา Checkbox คอลัมน์ "อื่นๆ" (ที่ไม่ใช่คอลัมน์นี้)
        $('.auto-fill-cb')
            .not(`[data-target="${targetInputClass}"]`)
            .each(function () {
                // เอาเครื่องหมายติ๊กออก
                $(this).prop('checked', false);

                // เคลียร์ค่าคอลัมน์นั้นทิ้ง
                const otherTargetClass = $(this).attr('data-target');
                if (otherTargetClass) {
                    $(`#tablepck ${otherTargetClass}`).val('');
                }
            });

        // 3. เติมค่าให้คอลัมน์ที่เพิ่งเลือก
        $(`#tablepck ${targetInputClass}`).each(function () {
            const qty = $(this).attr('data-qty');
            if (qty) {
                $(this).val(qty);
            }
        });
    } else {
        // กรณีเอาเครื่องหมายติ๊กออกเอง
        $(`.auto-fill-cb[data-target="${targetInputClass}"]`).prop(
            'checked',
            false,
        );
        $(`#tablepck ${targetInputClass}`).val('');
    }
});

// $(document).on('change', '.auto-fill-cb', function () {
//     const isChecked = $(this).prop('checked');
//     const targetInputClass = $(this).attr('data-target');
//     $(`#tablepck ${targetInputClass}`).each(function () {
//         if (isChecked) {
//             $('.auto-fill-cb')
//                 .not(this)
//                 .each(function () {
//                     // เอาเครื่องหมายติ๊กออก
//                     $(this).prop('checked', false);

//                     // เคลียร์ค่าในช่อง Input ของคอลัมน์นั้นๆ ให้เป็นช่องว่าง
//                     const otherTargetClass = $(this).attr('data-target');
//                     $(`#tablepck ${otherTargetClass}`).val('');
//                 });

//             // 2. เติมค่า QTY ให้กับคอลัมน์ที่เพิ่งถูกติ๊ก
//             $(`#tablepck ${targetInputClass}`).each(function () {
//                 $(this).val($(this).attr('data-qty'));
//             });
//         } else {
//             $(`#tablepck ${targetInputClass}`).val('');
//         }
//     });
// });

$(document).on('click', 'button[name="btnAction"]', async function (e) {
    const action = this.value;
    const cextdata = $('.extdata').attr('extdata');
    const apvno = $('.apv-data').attr('empno');
    const requiredMessage = [
        {
            element: $('#assignTo'),
            message: 'Please choose the person in charge',
        },
    ].filter(Boolean);
    if (action != 'export') {
        if (!(await requiredForm('#frmmain', requiredMessage))) return;
    }
    //console.log($('#assignTo').val());
    if (action == 'approve') {
        showLoader();
        //Concern Approver1
        if (cextdata == '01') {
            const formData = {
                condition: {
                    ...form,
                    CEXTDATA: '02',
                },
                VAPVNO: $('#assignTo').val(),
            };
            try {
                const res = await updateFlow(formData);
            } catch (err) {
                //showErrorMessage(err);
                throw new Error('can not updaet flow');
            }
            //Main Approval
        } else if (cextdata == '02') {
            if (chkValid()) {
                try {
                    const assetData = await payloadData();
                    const res = await updatepck(assetData);
                } catch (err) {
                    //showErrorMessage(err);
                    throw new Error('can not update data');
                }
            } else {
                showLoader({ show: false });
                showMessage('Please enter valid data.', 'warning');
                return false;
            }
            //Assigned Person
        } else if (cextdata == '06') {
            const controller = $('#controller').val().replace(/\s+/g, '');
            if (controller.length == 0) {
                const delstep = ['19', '88', '80', '81', '58'];
                try {
                    for (const step of delstep) {
                        await deleteFlowStep({ ...form, CSTEPNO: step });
                    }
                } catch (err) {
                    //showErrorMessage(err);
                    throw new Error('can not delete flow');
                }
            } else {
                const infocon = await searchUser({
                    SEMPNO: controller,
                    CSTATUS: '1',
                });

                if (infocon.length > 0) {
                    await updateorgcon(infocon[0]);
                } else {
                    showLoader({ show: false });
                    showMessage('Employee  not found!', 'warning');
                    return false;
                }
            }
        }
        try {
            const resdo = await doaction({
                ...form,
                EMPNO: apvno,
                ACTION: 'approve',
                REMARK: $('#remark').val(),
            });
            redirectWebflow();
        } catch (err) {
            //showErrorMessage(err);
            throw new Error('cannot approve');
        } finally {
            showLoader({ show: false });
        }
    } else if (action == 'return') {
        if ($('#remark').val() == '') {
            showMessage('Please enter Remark', 'warning');
            return false;
        }
        let retstep;
        if (['03', '04', '05', '06', '07', '11'].includes(cextdata)) {
            retstep = '02';
        } else if (['08', '09', '10'].includes(cextdata)) {
            retstep = '07';
        }
        const resdo = await doaction({
            ...form,
            EMPNO: apvno,
            ACTION: 'returnE',
            CEXTDATA: retstep,
            REMARK: $('#remark').val(),
        });
        redirectWebflow();
    } else if (action == 'export') {
        const res = await writeExcel(data);
    }
});

$(document).on('input', '.check-qty', function () {
    // 1. กรองเอาเฉพาะตัวเลขก่อน (พิมพ์ตัวอักษรไม่ได้)
    let cleanValue = this.value.replace(/[^0-9]/g, '');
    let currentVal = parseInt(cleanValue, 10) || 0;

    // 2. หาแถว (tr) ปัจจุบัน และดึงค่า QTY สูงสุดของแถวนี้
    let $row = $(this).closest('tr');
    let maxQty = parseInt($(this).data('qty'), 10) || 0;

    // 4. วนลูปหาผลรวมของช่องอื่นๆ ในแถวนี้ (ยกเว้นช่องที่กำลังพิมพ์อยู่)
    let otherSum = 0;
    targetClasses.forEach(function (cls) {
        let $input = $row.find(cls);
        // ตรวจสอบว่าเจอ Element และไม่ใช่ช่องปัจจุบันที่กำลังพิมพ์
        if ($input.length && !$input.is(this)) {
            let val = parseInt($input.val(), 10) || 0;
            otherSum += val;
        }
    }, this); // ใส่ this ตรงนี้เพื่อให้ภายใน foreach รู้จักช่องปัจจุบัน

    // 5. ตรวจสอบเงื่อนไขผลรวม
    if (otherSum + currentVal > maxQty) {
        // ถ้าเกิน QTY ให้คำนวณโควตาที่เหลืออยู่
        let allowedVal = maxQty - otherSum;

        // บังคับใส่ค่าสูงสุดที่ยังเหลืออยู่ (ถ้าไม่เหลือโควตาแล้ว จะกลายเป็น 0 ทันที)
        this.value = allowedVal > 0 ? allowedVal : 0;
    } else {
        // ถ้าผลรวมยังไม่เกิน QTY ให้แสดงค่าตามที่พิมพ์ปกติ
        this.value = cleanValue === '' ? '' : currentVal;
    }
});

async function writeExcel(dataList) {
    var formNo = $("td:contains('Form no:')").next('td').text().trim();
    var inputBy = $("td:contains('Input by:')").next('td').text().trim();
    var requestedBy = $("td:contains('Requested by:')")
        .next('td')
        .text()
        .trim();
    var workbook = new ExcelJS.Workbook();
    //const templatePath = `${process.env.AMEC_FILE_PATH}${process.env.STATE == 'production' ? 'production' : 'development'}/Form/FIN/FIN-PCK/TEMPLATE`;
    try {
        // const bfile = await getArrayBufferFile(templatePath, 'TEMPLOCMST.xlsx');
        const bfile = await getTemplate('TEMPEXP.xlsx');
        const workbook = await writeExcelTemp(bfile.buffer, {
            write: (wb) => {
                const sheet = wb.getWorksheet(1);
                sheet.getCell(`B1`).value = formNo;
                sheet.getCell(`B2`).value = inputBy;
                sheet.getCell(`B3`).value = requestedBy;
                sheet.getCell(`B4`).value = dataList.LOCCODE;
                sheet.getCell(`B5`).value = dataList.LOCNAME;
                const startRow = 8;
                dataList.ASSETS.forEach((item, index) => {
                    const currentRow = startRow + index;
                    sheet.getCell(`A${currentRow}`).value = item.GRP.GRPCODE;
                    sheet.getCell(`B${currentRow}`).value = item.GRP.GRPDESC;
                    sheet.getCell(`C${currentRow}`).value = item.ASSETNO;
                    sheet.getCell(`D${currentRow}`).value = item.ASSETDESC;
                    sheet.getCell(`E${currentRow}`).value = formatDate(
                        item.DOCDATE,
                    );
                    sheet.getCell(`F${currentRow}`).value = setRound(
                        item.INITVAL,
                        2,
                    );
                    sheet.getCell(`G${currentRow}`).value = setRound(
                        item.BOOKVAL,
                        2,
                    );
                    sheet.getCell(`H${currentRow}`).value = item.MODELNO;
                    sheet.getCell(`I${currentRow}`).value = item.SNNO;
                    sheet.getCell(`J${currentRow}`).value = item.PONO;
                    sheet.getCell(`K${currentRow}`).value = item.REFASSET;
                    sheet.getCell(`L${currentRow}`).value = item.QTY;
                    sheet.getCell(`M${currentRow}`).value = item.UNIT;
                    sheet.getCell(`N${currentRow}`).value = item.SUPPLIER;
                    sheet.getCell(`O${currentRow}`).value = item.PRNO;
                    sheet.getCell(`P${currentRow}`).value = item.REQBY;
                    sheet.getCell(`Q${currentRow}`).value = item.CONFIRM;
                    sheet.getCell(`R${currentRow}`).value = item.NOSTICKER;
                    sheet.getCell(`S${currentRow}`).value = item.LOST;
                    sheet.getCell(`T${currentRow}`).value = item.DAMAGE;
                    sheet.getCell(`U${currentRow}`).value = item.MOVEMENT;
                    sheet.getCell(`V${currentRow}`).value = item.OTHCAUSE;
                    sheet.getCell(`W${currentRow}`).value = item.REMOTHCAUSE;
                    sheet.getCell(`X${currentRow}`).value = item.PIC;
                });
            },
        });
        const d = new Date();
        const formatted = d
            .toLocaleString('en-GB', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
            })
            .replace(/\D/g, '');
        exportExcel(workbook, `${formNo}_${formatted}`);
    } catch (error) {
        console.error('Error reading excel template on NAS server:', error);
        throw new Error('can not open file');
    }
}

function chkValid() {
    let isAllValid = true;
    $('table tbody tr').each(function () {
        let row = $(this);
        let firstInput = row.find('.check-qty').first();

        if (firstInput.length === 0) return true;

        let maxQty = parseInt(firstInput.data('qty'), 10) || 0;
        let rowSum = 0;

        targetClasses.forEach(function (cls) {
            let val = parseInt(row.find(cls).val(), 10) || 0;
            rowSum += val;
        });
        let oth = parseInt(row.find('.input-oth').val(), 10) || 0;
        if (oth != 0) {
            let remoth = row.find('.input-remoth').val();
            if (remoth == '') {
                isAllValid = false;
                row.css('background-color', '#fee2e2');
            }
        }
        // เช็คว่าผลรวมเท่ากับ QTY ที่ตั้งไว้หรือไม่
        if (rowSum !== maxQty) {
            isAllValid = false;
            row.css('background-color', '#fee2e2');
        } else {
            row.css('background-color', '');
        }
    });
    return isAllValid;
}

async function payloadData() {
    let assetsPayload = [];
    $('table tbody tr').each(function () {
        let row = $(this);
        let firstInput = row.find('.check-qty').first();

        if (firstInput.length === 0) return true;

        let assetid = parseInt(row.find('.input-id').val());
        let valConfirm = parseInt(row.find('.input-confirm').val(), 10) || 0;
        let valNoSticker =
            parseInt(row.find('.input-nosticker').val(), 10) || 0;
        let valLost = parseInt(row.find('.input-lost').val(), 10) || 0;
        let valDamage = parseInt(row.find('.input-damage').val(), 10) || 0;
        let valMovement = parseInt(row.find('.input-movement').val(), 10) || 0;
        let valoth = parseInt(row.find('.input-oth').val(), 10) || 0;
        let remoth = row.find('.input-remoth').val() || '';
        let pic = row.find('.input-pic').val() || '';
        let assetData = {
            ...form, // ระบบจะเอา NFRMNO, VORGNO, CYEAR ฯลฯ มาใส่ให้ตรงนี้อัตโนมัติ
            ID: assetid,
            CONFIRM: valConfirm,
            NOSTICKER: valNoSticker,
            LOST: valLost,
            DAMAGE: valDamage,
            MOVEMENT: valMovement,
            OTHCAUSE: valoth,
            REMOTHCAUSE: remoth,
            PIC: pic,
        };
        assetsPayload.push(assetData);
    });
    // console.log(assetsPayload);
    return assetsPayload;
}

async function updateorgcon(objcon) {
    const approvalSteps = [
        { CSTEPNO: '88', CEXTDATA: '08', SPOSCODE: 30 },
        { CSTEPNO: '80', CEXTDATA: '09', SPOSCODE: 21 },
        { CSTEPNO: '81', CEXTDATA: '10', SPOSCODE: 20 },
    ];
    let delstep = [];
    const posCon = parseInt(objcon.SPOSCODE, 10);
    let rep = await getRepresent({
        NFRMNO: form.NFRMNO,
        VORGNO: form.VORGNO,
        CYEAR: form.CYEAR,
        VEMPNO: objcon.SEMPNO,
    });
    let formData = {
        condition: {
            ...form,
            CEXTDATA: '07',
        },
        VAPVNO: objcon.SEMPNO,
        VREPNO: rep,
    };
    let res = await updateFlow(formData);
    let vorgno;
    for (const step of approvalSteps) {
        if (posCon > step.SPOSCODE) {
            vorgno = step.SPOSCODE == 30 ? objcon.SSECCODE : objcon.SDEPCODE;
            const sempno = await getByPosition(vorgno, step.SPOSCODE + '');
            if (sempno.status) {
                rep = await getRepresent({
                    NFRMNO: form.NFRMNO,
                    VORGNO: form.VORGNO,
                    CYEAR: form.CYEAR,
                    VEMPNO: sempno.data.EMPNO,
                });
                formData.condition.CEXTDATA = step.CEXTDATA;
                formData.VAPVNO = sempno.data.EMPNO;
                formData.VREPNO = rep;
                res = await updateFlow(formData);
            } else {
                delstep.push(step.CSTEPNO);
            }
        } else {
            delstep.push(step.CSTEPNO);
        }
    }
    for (const step of delstep) {
        console.log(step);

        // เติม await ด้านหน้า เพื่อสั่งให้โปรแกรมรอจนกว่า API/Function นี้จะทำงานเสร็จ
        await deleteFlowStep({ ...form, CSTEPNO: step });
    }
    // delstep.forEach((step) => {
    //     console.log(step);
    //     deleteFlowStep({ ...form, CSTEPNO: step });
    // });

    // if (posCon > 30) {
    //     try {
    //         let formData = {
    //             condition: {
    //                 ...form,
    //                 CEXTDATA: '07',
    //             },
    //             VAPVNO: objcon.SEMPNO,
    //         };
    //         const res = await updateFlow(formData);
    //         const sem = await getByPosition(objcon.SSECCODE, '30');
    //         if (sem.status) {
    //             formData.condition.CEXTDATA = '08';
    //             formData.VAPVNO = sem.data.SEMPNO;
    //         }

    //         console.log(sem);
    //     } catch (err) {
    //         showLoader({ show: false });
    //         showErrorMessage(err);
    //         return false;
    //     }
    // }
    // const manger = await getManager(empno);
    // console.log(manger);
    // return false;
    // const formData = {
    //     condition: {
    //         ...form,
    //         CEXTDATA: '07',
    //     },
    //     VAPVNO: empno,
    // };
    // try {
    //     const res = await updateFlow(formData);
    // } catch (err) {
    //     showLoader({ show: false });
    //     showErrorMessage(err);
    //     return false;
    // }
}
