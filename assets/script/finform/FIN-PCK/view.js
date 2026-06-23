import { showflow, getExtData } from '@amec/webasset/api/webform';
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
var tablepck;
$(async function () {
    const formInfo = await getAllAttr('.form-info');
    const form = {
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
                    return `<input type="text" class="input input-bordered input-sm w-full input-confirm" value="${row.CONFIRM}" data-asset="${row.ASSETNO}">`;
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
                    return `<input type="text" class="input input-bordered input-sm w-full input-nosticker" value="${row.NOSTICKER}" data-asset="${row.ASSETNO}">`;
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
                    return `<input type="text" class="input input-bordered input-sm w-full input-lost" value="${row.LOST}" data-asset="${row.ASSETNO}">`;
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
                    return `<input type="text" class="input input-bordered input-sm w-full input-damage" value="${row.DAMAGE}" data-asset="${row.ASSETNO}">`;
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
                    return `<input type="text" class="input input-bordered input-sm w-full input-movement" value="${row.MOVEMENT}" data-asset="${row.ASSETNO}">`;
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
                    return `<input type="text" class="input input-bordered input-sm w-full input-oth" value="${row.OTHCAUSE}" data-asset="${row.ASSETNO}">`;
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
                    return `<input type="text" class="input input-bordered input-sm w-full input-oth" value="${row.REMOTHCAUSE}" data-asset="${row.ASSETNO}">`;
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
                    return `<input type="text" class="input input-bordered input-sm w-full input-oth" value="${row.PIC}" data-asset="${row.ASSETNO}">`;
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
        },
        {
            id: '#tablepck',
            columnSelect: { status: false },
            domScroll: { status: true, maxHeight: '21rem', type: 'tailwind4' },
            join: true,
            headerSticky: { status: true },
        },
    );
    switch (mode) {
        case 2:
            container.html(
                webflowSubmit({
                    flow: true,
                    flowhtml: flow.html,
                    approve: true,
                    reject: false,
                    return: true,
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
