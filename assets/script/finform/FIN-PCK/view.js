import {
    showflow,
    getExtData,
    updateFlow,
    doaction,
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
import { getData } from './data';
import { formatDate } from '@amec/webasset/dayjs';
import select2 from 'select2';
import { setSelect2 } from '@amec/webasset/select2';
import { getSubordinates } from '@amec/webasset/api/sequence-org';
import { showLoader } from '@amec/webasset/preloader';
import { redirectWebflow } from '@amec/webasset/form';
select2();
var tablepck;
var form = {};
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
    const data = await getData(form);
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
            title: 'Confirm',
            defaultContent: '',
            render: function (data, type, row) {
                // เช็คเผื่อไว้ถ้าโครงสร้างหลุดหรือไม่มีคนรับผิดชอบ ให้แสดงเป็นช่องว่างหรือเครื่องหมาย -
                if (isEditable) {
                    // ถ้าเป็นโหมดให้กรอกได้ ให้แสดงเป็น Input แล้วเอา empText ไปตั้งเป็นค่าเริ่มต้น
                    return `<input type="text" oninput="this.value = this.value.replace(/[^0-9]/g, '')" class="input input-bordered input-sm w-[50px] input-confirm check-qty" value="${row.CONFIRM || ''}" data-asset="${row.ASSETNO}" data-qty="${row.QTY}">`;
                } else {
                    return row.CONFIRM;
                }
            },
        },
        {
            data: 'NOSTICKER',
            title: 'No Sticker',
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
            title: 'Lost',
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
            title: 'Damage',
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
            title: 'Movement',
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
            title: 'Other Cause',
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
                    return `<input type="text" class="input input-bordered input-sm w-[150px] input-oth" value="${row.REMOTHCAUSE || ''}" data-asset="${row.ASSETNO}" >`;
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
                    return `<input type="text" class="input input-bordered input-sm w-[150px] input-oth" value="${row.PIC || ''}" data-asset="${row.ASSETNO}">`;
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
    }
    switch (mode) {
        case 2:
            container.html(
                webflowSubmit({
                    flow: true,
                    flowhtml: flow.html,
                    approve: true,
                    reject: false,
                    return: cextdata !== '01' && cextdata !== '02',
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
});

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
    if (!(await requiredForm('#frmmain', requiredMessage))) return;
    //console.log($('#assignTo').val());
    if (action == 'approve') {
        showLoader();
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
                const resdo = await doaction({
                    ...form,
                    EMPNO: apvno,
                    ACTION: 'approve',
                    REMARK: $('#remark').val(),
                });
                redirectWebflow();
            } catch (err) {
                showErrorMessage(err);
            } finally {
                showLoader({ show: false });
            }
        }
    }
});

$(document).on('input', '.check-qty', function () {
    // 1. กรองเอาเฉพาะตัวเลขก่อน (พิมพ์ตัวอักษรไม่ได้)
    let cleanValue = this.value.replace(/[^0-9]/g, '');
    let currentVal = parseInt(cleanValue, 10) || 0;

    // 2. หาแถว (tr) ปัจจุบัน และดึงค่า QTY สูงสุดของแถวนี้
    let $row = $(this).closest('tr');
    let maxQty = parseInt($(this).data('qty'), 10) || 0;

    // 3. ระบุคลาสของทั้ง 6 ช่องที่ต้องการเอาค่ามารวมกัน
    let targetClasses = [
        '.input-confirm',
        '.input-nosticker',
        '.input-lost',
        '.input-damage',
        '.input-movement',
        '.input-oth',
    ];

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
