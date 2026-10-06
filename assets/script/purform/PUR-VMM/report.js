import { requiredForm } from '@amec/webasset/utils';
import { getOrganize } from '../../finform/FIN-PCK/dataloc';
import { deptManager, divManager, secManager } from './formManager';
import { searchrpt } from './data';
import { getTemplate } from './function';
import { getFormno } from '@amec/webasset/api/webform';
import { exportExcel, writeExcelTemp } from '@amec/webasset/excel';
import { showLoader } from '@amec/webasset/preloader';
import ExcelJS from 'exceljs';

$(async function () {
    const org = await getOrganize();
    const orgfilter = org.filter((item) => item.VORGNO !== '00');
    const groupedOrg = orgfilter.reduce((acc, item) => {
        // ถ้ายังไม่มี property ของ type นี้ ให้สร้าง Array ว่างเตรียมไว้
        if (!acc[item.CTYPE]) {
            acc[item.CTYPE] = [];
        }
        // ดันข้อมูลเข้าไปใน type นั้นๆ
        acc[item.CTYPE].push(item);
        return acc;
    }, {});

    const secData = groupedOrg[1].filter(
        (item) =>
            item.VORGNO.startsWith('0905') || item.VORGNO.startsWith('0906'),
    );
    const secdata = secData.map((o) => ({
        value: o.VORGNO,
        text: o.VNAME,
    }));
    const deptData = groupedOrg[2].filter(
        (item) =>
            item.VORGNO.startsWith('0905') || item.VORGNO.startsWith('0906'),
    );

    const deptdata = deptData.map((o) => ({
        value: o.VORGNO,
        text: o.VNAME,
    }));
    const divData = groupedOrg[3].filter((item) =>
        item.VORGNO.startsWith('09'),
    );
    const divdata = divData.map((o) => ({
        value: o.VORGNO,
        text: o.VNAME,
    }));
    secManager.init(secdata);
    deptManager.init(deptdata);
    divManager.init(divdata);
});

$(document).on('click', '#btnExport', async function () {
    const requiredMessage = [
        {
            element: $('input[name="REQUEST_DATE_FROM"]'),
            message: 'Please input Request date.',
        },
    ];
    if (!(await requiredForm('#frmmain', requiredMessage))) return;
    const NRUNNO = $('input[name="FORM_NO"]').val();
    const VENDCODE = $('input[name="VENDOR_CODE"]').val();
    const VENDNAME = $('input[name="VENDOR_NAME"]').val();
    // const VENDGROUPTYPE = $('#VENDOR_GROUP_TYPE').val();
    const SNAME = $('input[name="REQUESTER"]').val();
    const CST = $('#CST').val();
    const SREQDATE = $('input[name="REQUEST_DATE_FROM"]').val();
    const EREQDATE = $('input[name="REQUEST_DATE_TO"]').val();
    const SEMPNO = $('input[name="EMP_NO"]').val();
    const SSECCODE = $('#SECTION').val();
    const SDEPCODE = $('#DEPARTMENT').val();
    const SDIVCODE = $('#DIVISION').val();
    const sortby = $('#SORT_BY').val();
    const hasReqtorData = SEMPNO || SNAME || SSECCODE || SDEPCODE || SDIVCODE;
    const hasVmmformData = SREQDATE || EREQDATE || CST || hasReqtorData;
    // console.log('>>>>' + VENDGROUPTYPE);

    const payload = {
        ...(NRUNNO && { NRUNNO: NRUNNO }),
        ...(VENDCODE && { VENDCODE: VENDCODE }),
        ...(VENDNAME && { VENDNAME: COMNAME }),
        // หากต้องการแนบ VENDOR ต่างๆ ไปที่ Root level สามารถเพิ่มตรงนี้ได้เลย เช่น:
        // ...(VENDCODE && { VENDCODE: VENDCODE }),

        ...(hasVmmformData && {
            vmmform: {
                ...(SREQDATE && { START_DREQDATE: SREQDATE }),
                ...(EREQDATE && { END_DREQDATE: EREQDATE }),
                ...(CST && { CST: CST }),
                // ถ้ามีข้อมูลในกลุ่ม reqtor ค่อยสร้างก้อน reqtor
                ...(hasReqtorData && {
                    reqtor: {
                        ...(SEMPNO && { SEMPNO: SEMPNO }),
                        ...(SNAME && { SNAME: SNAME }),
                        ...(SSECCODE && { SSECCODE: SSECCODE }),
                        ...(SDEPCODE && { SDEPCODE: SDEPCODE }),
                        ...(SDIVCODE && { SDIVCODE: SDIVCODE }),
                    },
                }),
            },
        }),
    };
    try {
        showLoader();
        console.log(payload);
        const res = await searchrpt(payload);
        console.log(res);

        // const ressort = await sortrptData(res, sortby, 'asc');
        // if (VENDGROUPTYPE == 'Indirect') {
        //     await writeExcelIndirect(ressort);
        // } else {
        //     await writeExcelDirectSub(ressort);
        // }
    } catch (err) {
        throw new Error(err);
    } finally {
        showLoader({ show: false });
    }
});

async function writeExcelIndirect(dataList) {
    var workbook = new ExcelJS.Workbook();
    try {
        const bfile = await getTemplate('temprptIndirect.xlsx');
        const workbook = await writeExcelTemp(bfile.buffer, {
            write: (wb) => {
                const now = new Date();
                const sheet = wb.getWorksheet(1);
                const startRow = 2;

                dataList.forEach((item, index) => {
                    const currentRow = startRow + index;
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
        exportExcel(workbook, `HistoryTransactionApproval_${formatted}`);
    } catch (error) {
        console.error('Error reading excel template on NAS server:', error);
        throw new Error('can not open file');
    }
}

function formattedDate(rawDate) {
    const datePart = rawDate.split('T')[0];
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
}
