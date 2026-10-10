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
    const VENDGROUPTYPE = $('#VENDOR_GROUP_TYPE').val();
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
        ...(VENDNAME && { VENDNAME: VENDNAME }),
        ...(VENDGROUPTYPE && { VENDGROUPTYPE: VENDGROUPTYPE }),
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
        const ressort = await sortrptData(res, sortby, 'asc');
        await writeExcel(ressort);
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

async function writeExcel(dataList) {
    var workbook = new ExcelJS.Workbook();
    try {
        const bfile = await getTemplate('temprpt.xlsx');
        const workbook = await writeExcelTemp(bfile.buffer, {
            write: (wb) => {
                const now = new Date();
                const sheet = wb.getWorksheet(1);
                const startRow = 2;

                dataList.forEach((item, index) => {
                    const currentRow = startRow + index;
                    const addrObj = item.ADDRESSES?.find(
                        (addr) => addr.ADDRTYPE === 'E',
                    );
                    sheet.getCell(`A${currentRow}`).value =
                        'PRO-VMM' +
                        item.CYEAR2.slice(-2) +
                        '-' +
                        String(item.NRUNNO).padStart(6, '0');
                    const SEMSTEP = item.FORM.flow.find(
                        (flowRecord) => flowRecord.CSTEPNO === '06',
                    );
                    const DEMSTEP = item.FORM.flow.find(
                        (flowRecord) => flowRecord.CSTEPNO === '04',
                    );
                    sheet.getCell(`ฺฺB${currentRow}`).value =
                        item.FORM.CST == '0'
                            ? 'Draft'
                            : item.FORM.CST == '1'
                              ? 'Running'
                              : item.FORM.CST == '2'
                                ? 'Approve'
                                : item.FORM.CST == '3'
                                  ? 'Reject'
                                  : '';
                    sheet.getCell(`ฺฺC${currentRow}`).value = item.REQTYPE;
                    sheet.getCell(`ฺฺD${currentRow}`).value = item.VENDCODE;
                    sheet.getCell(`ฺฺE${currentRow}`).value =
                        item.VENDGROUPTYPE;
                    sheet.getCell(`ฺฺF${currentRow}`).value = item.VENDNAME;
                    sheet.getCell(`ฺฺG${currentRow}`).value =
                        item.FORM.creator.SEMPNO;
                    sheet.getCell(`ฺฺH${currentRow}`).value =
                        item.FORM.reqtor.SEMPNO;
                    sheet.getCell(`ฺฺI${currentRow}`).value =
                        item.FORM.reqtor.SSEC;
                    sheet.getCell(`ฺฺJ${currentRow}`).value =
                        item.FORM.reqtor.SDEPT;
                    sheet.getCell(`ฺฺK${currentRow}`).value =
                        item.FORM.reqtor.SDIV;
                    sheet.getCell(`ฺฺL${currentRow}`).value = [
                        addrObj?.ADDR1,
                        addrObj?.ADDR2,
                    ]
                        .filter(Boolean)
                        .join(' ');
                    sheet.getCell(`ฺฺM${currentRow}`).value = addrObj?.CITY;
                    sheet.getCell(`ฺฺN${currentRow}`).value = addrObj?.STATE;
                    sheet.getCell(`ฺฺO${currentRow}`).value = addrObj?.POSTCODE;
                    sheet.getCell(`ฺฺP${currentRow}`).value = addrObj?.COUNTRY;
                    sheet.getCell(`ฺฺQ${currentRow}`).value = item.VENDCAT;
                    sheet.getCell(`ฺฺR${currentRow}`).value = item.TAXID;
                    sheet.getCell(`ฺฺS${currentRow}`).value = item.CANO;
                    sheet.getCell(`ฺฺT${currentRow}`).value = item.BANO;
                    sheet.getCell(`ฺฺU${currentRow}`).value =
                        item.TERM?.STERMDESC;
                    sheet.getCell(`ฺฺV${currentRow}`).value = item.TRADE
                        ? [
                              `${item.TRADE.TRADE_CODE}_${item.TRADE.TRADE_NAME}`,
                              item.TRADE.TRADE_SHIPTO
                                  ? `to ${item.TRADE.TRADE_SHIPTO}`
                                  : null,
                              item.TRADE.TRADE_SHIPBY
                                  ? `(${item.TRADE.TRADE_SHIPBY})`
                                  : null,
                          ]
                              .filter(Boolean)
                              .join(' ')
                        : '';
                    sheet.getCell(`ฺฺW${currentRow}`).value = item.CONTACT;
                    sheet.getCell(`ฺฺX${currentRow}`).value = item.EMAIL;
                    sheet.getCell(`ฺฺY${currentRow}`).value = item.TELNO;
                    sheet.getCell(`ฺฺZ${currentRow}`).value = item.CURCODE;
                    sheet.getCell(`ฺฺAA${currentRow}`).value = item.FORM
                        .DREQDATE
                        ? formattedDate(item.FORM.DREQDATE)
                        : '';
                    sheet.getCell(`ฺฺAB${currentRow}`).value =
                        item.FORM.CREQTIME;
                    sheet.getCell(`ฺฺAC${currentRow}`).value =
                        SEMSTEP?.VREALAPV || '';
                    sheet.getCell(`ฺฺAD${currentRow}`).value =
                        SEMSTEP && SEMSTEP.DAPVDATE
                            ? formattedDate(SEMSTEP.DAPVDATE)
                            : '';
                    sheet.getCell(`ฺฺAE${currentRow}`).value =
                        SEMSTEP && SEMSTEP.CAPVTIME ? SEMSTEP.CAPVTIME : '';
                    sheet.getCell(`ฺฺAF${currentRow}`).value =
                        DEMSTEP?.VREALAPV || '';
                    sheet.getCell(`ฺฺAG${currentRow}`).value =
                        DEMSTEP && DEMSTEP.DAPVDATE
                            ? formattedDate(DEMSTEP.DAPVDATE)
                            : '';
                    sheet.getCell(`ฺฺAH${currentRow}`).value =
                        DEMSTEP && DEMSTEP.CAPVTIME ? DEMSTEP.CAPVTIME : '';
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

async function sortrptData(data, sortBy, direction = 'asc') {
    // ใช้ [...data] เพื่อสร้าง Array ใหม่ จะได้ไม่กระทบข้อมูลต้นฉบับ
    return [...data].sort((a, b) => {
        let valA = '';
        let valB = '';

        // กำหนดวิธีดึงค่าตาม Key ที่ต้องการ
        switch (sortBy) {
            case 'VENDCODE':
                // ถ้าเป็น null ให้มองเป็น String ว่าง ('') จะได้ไม่พังตอนเปรียบเทียบ
                valA = a.VENDCODE || '';
                valB = b.VENDCODE || '';
                break;
            case 'VENDNAME':
                valA = a.VENDNAME || '';
                valB = b.VENDNAME || '';
                break;
            case 'SNAME':
                // ใช้ Optional Chaining (?.) เผื่อในกรณีที่ object ย่อยไม่มีค่า
                valA = a.FORM?.reqtor?.SNAME || '';
                valB = b.FORM?.reqtor?.SNAME || '';
                break;
            case 'SEMPNO':
                valA = a.FORM?.reqtor?.SEMPNO || '';
                valB = b.FORM?.reqtor?.SEMPNO || '';
                break;
            default:
                return 0;
        }

        // ใช้ localeCompare สำหรับเปรียบเทียบ String เรียงลำดับตัวอักษร
        const comparison = valA.localeCompare(valB);

        // ถ้า direction เป็น 'desc' (น้อยไปมาก) ให้คูณ -1 เพื่อกลับด้านผลลัพธ์
        return direction === 'desc' ? comparison * -1 : comparison;
    });
}
function formattedDate(rawDate) {
    const datePart = rawDate.split('T')[0];
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
}
