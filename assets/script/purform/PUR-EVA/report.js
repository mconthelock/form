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
            element: $('#VENDOR_GROUP_TYPE'),
            message: 'Please input Vendor Group Type',
        },
        {
            element: $('input[name="REQUEST_DATE_FROM"]'),
            message: 'Please input Request date.',
        },
    ];
    if (!(await requiredForm('#frmmain', requiredMessage))) return;
    const NRUNNO = $('input[name="FORM_NO"]').val();
    const VENDCODE = $('input[name="VENDOR_CODE"]').val();
    const COMNAME = $('input[name="VENDOR_NAME"]').val();
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
    const hasEvaformData = SREQDATE || EREQDATE || CST || hasReqtorData;
    console.log('>>>>' + VENDGROUPTYPE);

    const payload = {
        ...(NRUNNO && { NRUNNO: NRUNNO }),
        ...(VENDCODE && { VENDCODE: VENDCODE }),
        ...(COMNAME && { COMNAME: COMNAME }),
        ...(VENDGROUPTYPE && { VENDGROUP: VENDGROUPTYPE }),
        // หากต้องการแนบ VENDOR ต่างๆ ไปที่ Root level สามารถเพิ่มตรงนี้ได้เลย เช่น:
        // ...(VENDCODE && { VENDCODE: VENDCODE }),

        ...(hasEvaformData && {
            evaform: {
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
        const ressort = await sortrptData(res, sortby, 'asc');
        if (VENDGROUPTYPE == 'Indirect') {
            await writeExcelIndirect(ressort);
        } else {
            await writeExcelDirectSub(ressort);
        }
    } catch (err) {
        throw new Error(err);
    } finally {
        showLoader({ show: false });
    }
});

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
            case 'COMNAME':
                valA = a.COMNAME || '';
                valB = b.COMNAME || '';
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

async function writeExcelIndirect(dataList) {
    var workbook = new ExcelJS.Workbook();
    //const templatePath = `${process.env.AMEC_FILE_PATH}${process.env.STATE == 'production' ? 'production' : 'development'}/Form/FIN/FIN-PCK/TEMPLATE`;
    try {
        // const bfile = await getArrayBufferFile(templatePath, 'TEMPLOCMST.xlsx');
        const judgementMap = {
            A: 'A: EXCELLENT (80 UP)',
            B: 'B: GOOD (70 UP)',
            C: 'C: FAIR (60 UP)',
            D: 'D: POOR (40 UP)',
            E: 'E: NOT APPLICABLE (LESS THAN 40)',
        };

        const bfile = await getTemplate('temprptIndirect.xlsx');
        const workbook = await writeExcelTemp(bfile.buffer, {
            write: (wb) => {
                const now = new Date();
                const sheet = wb.getWorksheet(1);
                const startRow = 2;

                dataList.forEach((item, index) => {
                    const currentRow = startRow + index;
                    const approvedDate = item.FORM.flow.find(
                        (flowRecord) => flowRecord.CSTEPNEXTNO === '00',
                    )?.DAPVDATE;
                    const addrObj = item.ADDRESSES?.find(
                        (addr) => addr.ADDRTYPE === 'E',
                    );
                    const formattedAddress = addrObj
                        ? [
                              [addrObj.ADDR1, addrObj.ADDR2]
                                  .filter(Boolean)
                                  .join(' '),
                              addrObj.CITY,
                              addrObj.STATE,
                              addrObj.POSTCODE,
                              addrObj.COUNTRY,
                          ]
                              .map((val) => (val ? String(val).trim() : ''))
                              .filter(Boolean)
                              .join(', ') || '-'
                        : '-';
                    let strdate = '';
                    const amount =
                        item.AMOUNT != null
                            ? Number(item.AMOUNT).toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                              })
                            : '';
                    if (approvedDate) {
                        strdate = formattedDate(approvedDate);
                    }
                    const totalScore =
                        item.SCORES?.reduce((sum, currentItem) => {
                            // นำค่า sum เดิมมาบวกกับ SCORE รอบปัจจุบัน (ถ้า SCORE เป็น null จะบวก 0 แทน)
                            return sum + (currentItem.SCORE || 0);
                        }, 0) || 0; // เลข 0 ตัวท้ายคือค่าเริ่มต้นของ sum
                    const comment = item.FORM.flow.find(
                        (fls) => fls.CSTART === '1',
                    )?.VREMARK;

                    const vendgrouptype =
                        item.VENDGROUP?.replace(/^\d+:/, '')
                            ?.replace(/\(\d+\)$/, '')
                            ?.trim() || '';
                    sheet.getCell(`A${currentRow}`).value =
                        'PUR-EVA' +
                        item.CYEAR2.slice(-2) +
                        '-' +
                        String(item.NRUNNO).padStart(6, '0');
                    sheet.getCell(`ฺฺB${currentRow}`).value = strdate;
                    sheet.getCell(`ฺฺC${currentRow}`).value = item.VENDCODE;
                    sheet.getCell(`ฺฺD${currentRow}`).value = item.COMNAME;
                    sheet.getCell(`ฺฺE${currentRow}`).value =
                        item.OPERATION == 'N' ? 'New' : 'Annual evaluation';
                    sheet.getCell(`ฺF${currentRow}`).value = vendgrouptype;
                    sheet.getCell(`ฺG${currentRow}`).value = item.VENDTYPE;
                    sheet.getCell(`ฺH${currentRow}`).value = item.FY_AMOUNT;
                    sheet.getCell(`ฺI${currentRow}`).value = amount;
                    sheet.getCell(`ฺJ${currentRow}`).value = item.PUR_LEVEL;
                    sheet.getCell(`ฺK${currentRow}`).value =
                        item.TERM?.STERMDESC;
                    sheet.getCell(`ฺL${currentRow}`).value = item.CURCODE;
                    sheet.getCell(`ฺM${currentRow}`).value = item.CORPORATE_ID;
                    sheet.getCell(`ฺN${currentRow}`).value = item.TAX_ID;
                    sheet.getCell(`ฺO${currentRow}`).value =
                        item.FORM.creator.SEMPPRE +
                        ' ' +
                        item.FORM.creator.SNAME;
                    sheet.getCell(`ฺP${currentRow}`).value =
                        item.FORM.reqtor.SEMPPRE + ' ' + item.FORM.reqtor.SNAME;
                    sheet.getCell(`ฺQ${currentRow}`).value =
                        item.FORM.reqtor.SSEC;
                    sheet.getCell(`ฺR${currentRow}`).value =
                        item.FORM.reqtor.SDEPT;
                    sheet.getCell(`ฺS${currentRow}`).value =
                        item.FORM.reqtor.SDIV;
                    sheet.getCell(`ฺT${currentRow}`).value = formattedAddress;
                    sheet.getCell(`ฺU${currentRow}`).value = item.CONTACT;
                    sheet.getCell(`ฺV${currentRow}`).value = item.EMAIL;
                    sheet.getCell(`ฺW${currentRow}`).value = item.TELNO;
                    // เช็คก่อนว่ามี PROFIT_TURNOVERS หรือไม่ เพื่อป้องกัน Error
                    if (item.PROFIT_TURNOVERS) {
                        // เช็ค Index 0
                        if (item.PROFIT_TURNOVERS[0]) {
                            sheet.getCell(`X${currentRow}`).value = Number(
                                item.PROFIT_TURNOVERS[0].AMOUNT,
                            ).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            });
                        }

                        // เช็ค Index 1
                        if (item.PROFIT_TURNOVERS[1]) {
                            sheet.getCell(`Y${currentRow}`).value = Number(
                                item.PROFIT_TURNOVERS[1].AMOUNT,
                            ).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            });
                        }

                        // เช็ค Index 2
                        if (item.PROFIT_TURNOVERS[2]) {
                            sheet.getCell(`Z${currentRow}`).value = Number(
                                item.PROFIT_TURNOVERS[2].AMOUNT,
                            ).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            });
                        }
                    }
                    // sheet.getCell(`ฺX${currentRow}`).value = Number(
                    //     item.PROFIT_TURNOVERS[0].AMOUNT,
                    // ).toLocaleString('en-US', {
                    //     minimumFractionDigits: 2,
                    //     maximumFractionDigits: 2,
                    // });
                    // sheet.getCell(`ฺY${currentRow}`).value = Number(
                    //     item.PROFIT_TURNOVERS[1].AMOUNT,
                    // ).toLocaleString('en-US', {
                    //     minimumFractionDigits: 2,
                    //     maximumFractionDigits: 2,
                    // });
                    // sheet.getCell(`ฺZ${currentRow}`).value = Number(
                    //     item.PROFIT_TURNOVERS[2].AMOUNT,
                    // ).toLocaleString('en-US', {
                    //     minimumFractionDigits: 2,
                    //     maximumFractionDigits: 2,
                    // });
                    sheet.getCell(`ฺAA${currentRow}`).value =
                        item.SCORES[0].SLEVEL;
                    sheet.getCell(`ฺAB${currentRow}`).value =
                        item.SCORES[1].SLEVEL;
                    sheet.getCell(`ฺAC${currentRow}`).value =
                        item.SCORES[2].SLEVEL;
                    sheet.getCell(`ฺAD${currentRow}`).value =
                        item.SCORES[3].SLEVEL;
                    sheet.getCell(`ฺAE${currentRow}`).value = totalScore;
                    sheet.getCell(`ฺAF${currentRow}`).value =
                        judgementMap[item.JUDGEMENT] || '';
                    sheet.getCell(`ฺAG${currentRow}`).value = comment;
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
        exportExcel(workbook, `HistoryEvaluate_${formatted}`);
    } catch (error) {
        console.error('Error reading excel template on NAS server:', error);
        throw new Error('can not open file');
    }
}

async function writeExcelDirectSub(dataList) {
    var workbook = new ExcelJS.Workbook();

    try {
        const judgementMap = {
            A: 'A: EXCELLENT (80 UP)',
            B: 'B: GOOD (70 UP)',
            C: 'C: FAIR (60 UP)',
            D: 'D: POOR (40 UP)',
            E: 'E: NOT APPLICABLE (LESS THAN 40)',
        };
        const bfile = await getTemplate('temprptDirect.xlsx');
        const workbook = await writeExcelTemp(bfile.buffer, {
            write: (wb) => {
                const now = new Date();
                const sheet = wb.getWorksheet(1);
                const startRow = 2;

                dataList.forEach((item, index) => {
                    const currentRow = startRow + index;
                    const approvedDate = item.FORM.flow.find(
                        (flowRecord) => flowRecord.CSTEPNEXTNO === '00',
                    )?.DAPVDATE;
                    const addrObj = item.ADDRESSES?.find(
                        (addr) => addr.ADDRTYPE === 'E',
                    );
                    const formattedAddress = addrObj
                        ? [
                              [addrObj.ADDR1, addrObj.ADDR2]
                                  .filter(Boolean)
                                  .join(' '),
                              addrObj.CITY,
                              addrObj.STATE,
                              addrObj.POSTCODE,
                              addrObj.COUNTRY,
                          ]
                              .map((val) => (val ? String(val).trim() : ''))
                              .filter(Boolean)
                              .join(', ') || '-'
                        : '-';
                    let strdate = '';
                    if (approvedDate) {
                        strdate = formattedDate(approvedDate);
                    }

                    const sortedTurnOverData = [
                        ...(item.PROFIT_TURNOVERS || []),
                    ].sort((a, b) => b.MYEAR - a.MYEAR);

                    const totalScore =
                        item.SCORES?.reduce((sum, currentItem) => {
                            // นำค่า sum เดิมมาบวกกับ SCORE รอบปัจจุบัน (ถ้า SCORE เป็น null จะบวก 0 แทน)
                            return sum + (currentItem.SCORE || 0);
                        }, 0) || 0; // เลข 0 ตัวท้ายคือค่าเริ่มต้นของ sum
                    const vendgrouptype =
                        item.VENDGROUP?.replace(/^\d+:/, '')
                            ?.replace(/\(\d+\)$/, '')
                            ?.trim() || '';
                    sheet.getCell(`A${currentRow}`).value =
                        'PUR-EVA' +
                        item.CYEAR2.slice(-2) +
                        '-' +
                        String(item.NRUNNO).padStart(6, '0');
                    sheet.getCell(`ฺฺB${currentRow}`).value = strdate;
                    sheet.getCell(`ฺฺC${currentRow}`).value =
                        item.FORM.creator.SNAME;
                    sheet.getCell(`ฺฺD${currentRow}`).value =
                        item.FORM.reqtor.SNAME;
                    sheet.getCell(`ฺE${currentRow}`).value =
                        item.FORM.reqtor.SSEC;
                    sheet.getCell(`ฺฺF${currentRow}`).value = item.VENDCODE;
                    sheet.getCell(`ฺฺG${currentRow}`).value = item.COMNAME;
                    sheet.getCell(`ฺฺH${currentRow}`).value =
                        item.OPERATION == 'N' ? 'New' : 'Annual evaluation';
                    sheet.getCell(`ฺI${currentRow}`).value = vendgrouptype;
                    sheet.getCell(`ฺJ${currentRow}`).value = item.VENDTYPE;
                    sheet.getCell(`ฺK${currentRow}`).value = item.CONTACT;
                    sheet.getCell(`ฺL${currentRow}`).value = formattedAddress;
                    sheet.getCell(`ฺM${currentRow}`).value = item.EMAIL;
                    sheet.getCell(`ฺN${currentRow}`).value = item.TELNO;
                    sheet.getCell(`ฺO${currentRow}`).value = Number(
                        item.CAPITAL,
                    ).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    });
                    sheet.getCell(`ฺP${currentRow}`).value = item.ESTABLISHED;
                    sheet.getCell(`ฺQ${currentRow}`).value =
                        item.TERM?.STERMDESC;
                    sheet.getCell(`ฺR${currentRow}`).value = item.CURCODE;
                    sheet.getCell(`ฺS${currentRow}`).value = item.TAX_ID;
                    sheet.getCell(`ฺT${currentRow}`).value = item.VENDCAT;
                    ['U', 'V', 'W'].forEach((col, index) => {
                        const amount = sortedTurnOverData[index]?.AMOUNT;
                        if (amount != null) {
                            sheet.getCell(`${col}${currentRow}`).value = Number(
                                amount,
                            ).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            });
                        }
                    });
                    sheet.getCell(`ฺX${currentRow}`).value =
                        item.SCORES[0]?.SCORE;
                    sheet.getCell(`ฺY${currentRow}`).value =
                        item.SCORES[1]?.SCORE;
                    sheet.getCell(`ฺZ${currentRow}`).value =
                        item.SCORES[2]?.SCORE;
                    sheet.getCell(`ฺAA${currentRow}`).value =
                        item.SCORES[3]?.SCORE;
                    sheet.getCell(`ฺAB${currentRow}`).value = totalScore;
                    sheet.getCell(`ฺAC${currentRow}`).value =
                        judgementMap[item.JUDGEMENT] || '';
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
        exportExcel(workbook, `HistoryEvaluate_${formatted}`);
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
