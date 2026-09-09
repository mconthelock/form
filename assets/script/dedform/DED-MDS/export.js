/**
 * assets/script/dedform/DED-MDS/export.js
 */
import { writeExcelTemp, exportExcel } from '@amec/webasset/excel';
import { showLoader } from '@amec/webasset/preloader';
import ExcelJS from 'exceljs';
import { host } from '../../utils';

// =========================================================================
// 🟢 ประกาศ Helper Functions ไว้ด้านบนสุดของไฟล์ (Global Module Scope)
// =========================================================================

// แปลงหมายเลขคอลัมน์เป็นตัวอักษร Excel (1 -> A, 4 -> D, 28 -> AB)
function getExcelColumnLetter(colIndex) {
    let temp,
        letter = '';
    while (colIndex > 0) {
        temp = (colIndex - 1) % 26;
        letter = String.fromCharCode(temp + 65) + letter;
        colIndex = Math.floor((colIndex - temp - 1) / 26);
    }
    return letter;
}

// จัดรูปแบบวันที่เป็น DD-MMM-YY (เช่น 08-Sep-26)
function formatDate(val) {
    if (!val) return null;
    const clean = String(val).substring(0, 10);
    const parts = clean.split('-');
    if (parts.length < 3) return null;
    const y = parts[0].slice(-2);
    const mIdx = parseInt(parts[1], 10) - 1;
    const day = parts[2].padStart(2, '0');
    const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ];
    return `${day}-${monthNames[mIdx]}-${y}`;
}

// แปลงค่าตัวเลข
function toNum(val) {
    if (val === null || val === undefined || val === '') return null;
    const n = Number(val);
    return isNaN(n) ? null : n;
}

// ตั้งค่าฟอนต์และสี (แดงถ้าแก้แบบ Manual / ดำถ้า SYSTEM)
function setCellFontColor(cell, isRed) {
    const existingFont =
        cell.style && cell.style.font ? cell.style.font : cell.font || {};

    const newFont = {
        name: existingFont.name || 'Arial',
        size: existingFont.size || 8,
        bold: isRed ? true : existingFont.bold || false,
        color: { argb: isRed ? 'FFFF0000' : 'FF000000' },
    };

    cell.style = Object.assign({}, cell.style || {}, { font: newFont });
    cell.font = newFont;
}

/**
 * ดึง ArrayBuffer ของไฟล์ Template จาก Controller
 */
async function getTemplateFile(templateName) {
    const res = await fetch(
        host +
            `dedform/DED-MDS/form/GetExcelTemplate?template=${encodeURIComponent(templateName)}`,
    );
    if (!res.ok) {
        throw new Error(
            `ไม่สามารถโหลดไฟล์ Template (${templateName}.xlsx) ได้`,
        );
    }
    return await res.arrayBuffer();
}

// =========================================================================
// 🟢 ฟังก์ชันหลักสำหรับ Export
// =========================================================================
export async function exportPlanExcel({
    dataList,
    prevRows = [],
    planHeaderID,
    revision,
    revHistory = [],
    signatures = null,
    planStatus,
    year,
    periodCode,
}) {
    try {
        if (typeof showLoader === 'function') showLoader();

        const cleanPeriod = String(periodCode || '').toUpperCase();
        const isOctPeriod = cleanPeriod.includes('10X');
        const curYearInt = parseInt(year, 10) || new Date().getFullYear();
        const curYY = String(curYearInt).slice(-2);
        const nextYY = String(curYearInt + 1).slice(-2);

        // 1. โหลด Master Template
        const templateBuffer = await getTemplateFile('04X-09C');

        const workbook = await writeExcelTemp(templateBuffer, {
            write: (wb) => {
                wb.calcProperties.fullCalcOnLoad = true;

                // =========================================================================
                // ส่วนที่ 1: Sheet 1 (Schedule Report)
                // =========================================================================
                const reportSheet = wb.getWorksheet(1);
                reportSheet.name = isOctPeriod ? '10X-03C' : '04X-09C';

                reportSheet.eachRow({ includeEmpty: true }, (row) => {
                    row.eachCell({ includeEmpty: true }, (cell) => {
                        if (cell.model && cell.model.sharedFormula) {
                            delete cell.model.sharedFormula;
                            delete cell.model.si;
                            delete cell.model.ref;
                        }
                    });
                });

                const scheduleTitle = isOctPeriod
                    ? `AMEC Design Schedule (10X'${curYY}-3C'${nextYY})`
                    : `AMEC Design Schedule (04X'${curYY}-9C'${curYY})`;

                const isDraft =
                    planStatus === 'DRAFT' || !revision || revision === '*';
                const titleCell =
                    reportSheet.getCell('G2') || reportSheet.getCell('E5');
                if (titleCell) {
                    titleCell.value = isDraft
                        ? `DRAFT ${scheduleTitle} Rev.${revision}`
                        : `${scheduleTitle} Rev.${revision}`;
                }

                // แสตมป์ตาราง Revision History
                const revCellMap = {
                    '*': 'Z3',
                    A: 'Z4',
                    B: 'Z5',
                    C: 'Z6',
                    D: 'Z7',
                    E: 'AB3',
                    F: 'AB4',
                    G: 'AB5',
                    H: 'AB6',
                    I: 'AB7',
                };

                if (Array.isArray(revHistory) && revHistory.length > 0) {
                    revHistory.forEach((item) => {
                        const rKey = String(item.Revision || '')
                            .trim()
                            .toUpperCase();
                        const targetCellRef = revCellMap[rKey];
                        if (targetCellRef && item.ApproveDate) {
                            reportSheet.getCell(targetCellRef).value =
                                formatDate(item.ApproveDate);
                        }
                    });
                }

                if (
                    planStatus === 'APPROVE' &&
                    revCellMap[String(revision || '*').toUpperCase()]
                ) {
                    const todayStr = new Date().toISOString().slice(0, 10);
                    reportSheet.getCell(
                        revCellMap[String(revision || '*').toUpperCase()],
                    ).value = formatDate(todayStr);
                }

                // กล่องแสตมป์ลายเซ็น
                if (signatures) {
                    if (signatures.preparedBy && signatures.preparedBy.name) {
                        reportSheet.getCell('AD3').value = String(
                            signatures.preparedBy.name,
                        );
                        reportSheet.getCell('AD7').value = formatDate(
                            signatures.preparedBy.date,
                        );
                    }
                    if (signatures.checkedBy && signatures.checkedBy.name) {
                        reportSheet.getCell('AG3').value = String(
                            signatures.checkedBy.name,
                        );
                        reportSheet.getCell('AG7').value = formatDate(
                            signatures.checkedBy.date,
                        );
                    }
                    if (signatures.approvedBy && signatures.approvedBy.name) {
                        reportSheet.getCell('AJ3').value = String(
                            signatures.approvedBy.name,
                        );
                        reportSheet.getCell('AJ7').value = formatDate(
                            signatures.approvedBy.date,
                        );
                    }
                }

                // Dynamic DesType
                let activeDesTypes = [];
                if (Array.isArray(dataList) && dataList.length > 0) {
                    activeDesTypes = [
                        ...new Set(
                            dataList
                                .map((item) =>
                                    String(item.DesType || '').trim(),
                                )
                                .filter(Boolean),
                        ),
                    ];
                }
                if (activeDesTypes.length === 0) activeDesTypes = ['N', 'T'];

                const junLetters = ['X', 'A', 'Y', 'B', 'Z', 'C'];
                const dynamicJunTypes = [];
                junLetters.forEach((jLetter) => {
                    activeDesTypes.forEach((dType) => {
                        dynamicJunTypes.push(`${jLetter}${dType}`);
                    });
                });

                const monthsTop = isOctPeriod
                    ? ['10', '11', '12']
                    : ['04', '05', '06'];
                const monthsBottom = isOctPeriod
                    ? ['01', '02', '03']
                    : ['07', '08', '09'];

                const rowMappingsTop = [
                    { r: 10, col: 'G' },
                    { r: 11, col: 'I' },
                    { r: 12, col: 'K' },
                    { r: 13, col: 'O' },
                    { r: 15, col: 'E' },
                    { r: 16, col: 'Q' },
                    { r: 17, col: 'F' },
                    { r: 18, col: 'C' },
                    { r: 19, col: 'M' },
                ];

                const rowMappingsBottom = [
                    { r: 21, col: 'G' },
                    { r: 22, col: 'I' },
                    { r: 23, col: 'K' },
                    { r: 24, col: 'O' },
                    { r: 26, col: 'E' },
                    { r: 27, col: 'Q' },
                    { r: 28, col: 'F' },
                    { r: 29, col: 'C' },
                    { r: 30, col: 'M' },
                ];

                // 1. ตารางบน
                let colPointer = 4;
                let tplRowPointer = 4;
                monthsTop.forEach((mCode) => {
                    dynamicJunTypes.forEach((jType) => {
                        const colLet = getExcelColumnLetter(colPointer);
                        const item = dataList[tplRowPointer - 4];
                        const isManual =
                            item &&
                            String(item.UserAction || 'SYSTEM')
                                .trim()
                                .toUpperCase() !== 'SYSTEM';

                        reportSheet.getCell(`${colLet}9`).value =
                            `${mCode}${jType}`;
                        const c14 = reportSheet.getCell(`${colLet}14`);
                        c14.value = { formula: `${colLet}13` };
                        setCellFontColor(c14, isManual);

                        rowMappingsTop.forEach((map) => {
                            const c = reportSheet.getCell(`${colLet}${map.r}`);
                            c.value = {
                                formula: `Template!${map.col}${tplRowPointer}`,
                            };
                            if (map.r !== 16 && map.r !== 17) {
                                setCellFontColor(c, isManual);
                            }
                        });

                        colPointer++;
                        tplRowPointer++;
                    });
                });

                // 2. ตารางล่าง
                colPointer = 4;
                monthsBottom.forEach((mCode) => {
                    dynamicJunTypes.forEach((jType) => {
                        const colLet = getExcelColumnLetter(colPointer);
                        const item = dataList[tplRowPointer - 4];
                        const isManual =
                            item &&
                            String(item.UserAction || 'SYSTEM')
                                .trim()
                                .toUpperCase() !== 'SYSTEM';

                        reportSheet.getCell(`${colLet}20`).value =
                            `${mCode}${jType}`;
                        const c25 = reportSheet.getCell(`${colLet}25`);
                        c25.value = { formula: `${colLet}24` };
                        setCellFontColor(c25, isManual);

                        rowMappingsBottom.forEach((map) => {
                            const c = reportSheet.getCell(`${colLet}${map.r}`);
                            c.value = {
                                formula: `Template!${map.col}${tplRowPointer}`,
                            };
                            if (map.r !== 27 && map.r !== 28) {
                                setCellFontColor(c, isManual);
                            }
                        });

                        colPointer++;
                        tplRowPointer++;
                    });
                });

                // 3. ตาราง GO-DESIGN & DES_BM
                const allSixMonths = [...monthsTop, ...monthsBottom];
                const monthColPairs = [
                    { labelCol: 'A', valCol: 'B' },
                    { labelCol: 'C', valCol: 'D' },
                    { labelCol: 'E', valCol: 'F' },
                    { labelCol: 'G', valCol: 'H' },
                    { labelCol: 'I', valCol: 'J' },
                    { labelCol: 'K', valCol: 'L' },
                ];

                let bottomTplRow = 4;
                allSixMonths.forEach((mCode, mIdx) => {
                    const pair = monthColPairs[mIdx];
                    if (!pair) return;

                    dynamicJunTypes.forEach((jType, jIdx) => {
                        const item = dataList[bottomTplRow - 4];
                        const isManual =
                            item &&
                            String(item.UserAction || 'SYSTEM')
                                .trim()
                                .toUpperCase() !== 'SYSTEM';

                        const rGo = 34 + jIdx;
                        reportSheet.getCell(`${pair.labelCol}${rGo}`).value =
                            `${mCode}${jType}`;
                        const cGoVal = reportSheet.getCell(
                            `${pair.valCol}${rGo}`,
                        );
                        cGoVal.value = { formula: `Template!G${bottomTplRow}` };
                        setCellFontColor(cGoVal, isManual);

                        const rDes = 48 + jIdx;
                        reportSheet.getCell(`${pair.labelCol}${rDes}`).value =
                            `${mCode}${jType}`;
                        const cDesVal = reportSheet.getCell(
                            `${pair.valCol}${rDes}`,
                        );
                        cDesVal.value = {
                            formula: `Template!E${bottomTplRow}`,
                        };
                        setCellFontColor(cDesVal, isManual);

                        bottomTplRow++;
                    });
                });

                // =========================================================================
                // ส่วนที่ 2: Sheet 2 ("Template")
                // =========================================================================
                const templateSheet =
                    wb.getWorksheet('Template') || wb.getWorksheet(2);

                if (Array.isArray(prevRows) && prevRows.length > 0) {
                    prevRows.forEach((pItem, pIdx) => {
                        const pr = 2 + pIdx;
                        templateSheet.getCell(`B${pr}`).value =
                            pItem.PROD || null;
                        templateSheet.getCell(`C${pr}`).value = formatDate(
                            pItem.MFG_BM,
                        );
                        templateSheet.getCell(`D${pr}`).value =
                            pItem.P_Type || null;
                        templateSheet.getCell(`E${pr}`).value = formatDate(
                            pItem.DES_BM,
                        );
                        ['B', 'C', 'D', 'E'].forEach((c) => {
                            setCellFontColor(
                                templateSheet.getCell(`${c}${pr}`),
                                false,
                            );
                        });
                    });
                }

                const startRow = 4;
                const cols = [
                    'A',
                    'B',
                    'C',
                    'D',
                    'E',
                    'F',
                    'G',
                    'H',
                    'I',
                    'J',
                    'K',
                    'L',
                    'M',
                    'N',
                    'O',
                    'P',
                    'Q',
                    'R',
                    'S',
                    'T',
                ];

                dataList.forEach((item, index) => {
                    const r = startRow + index;
                    templateSheet.getCell(`A${r}`).value =
                        item.SeqNo || index + 1;
                    templateSheet.getCell(`B${r}`).value = item.PROD || '-';
                    templateSheet.getCell(`C${r}`).value =
                        formatDate(item.MFG_BM) || '-';
                    templateSheet.getCell(`D${r}`).value = item.P_Type || '-';
                    templateSheet.getCell(`E${r}`).value =
                        formatDate(item.DES_BM) || '-';
                    templateSheet.getCell(`F${r}`).value =
                        toNum(item.Time_DESBM_to_MFGBM) || '-';
                    templateSheet.getCell(`G${r}`).value =
                        formatDate(item.Go_DES) || '-';
                    templateSheet.getCell(`H${r}`).value =
                        toNum(item.Time_GoDES_to_DESBM) || '-';
                    templateSheet.getCell(`I${r}`).value =
                        formatDate(item.Confirm_MELINA_Portion) || '-';
                    templateSheet.getCell(`J${r}`).value =
                        toNum(item.Time_Confirm_Melina) || '-';
                    templateSheet.getCell(`K${r}`).value =
                        formatDate(item.MSE_to_MELINA) || '-';
                    templateSheet.getCell(`L${r}`).value =
                        toNum(item.Time_MSE_to_MELINA) || '-';
                    templateSheet.getCell(`M${r}`).value =
                        formatDate(item.SW_Assembly) || '-';
                    templateSheet.getCell(`N${r}`).value =
                        toNum(item.Time_SW_Assembly) || '-';
                    templateSheet.getCell(`O${r}`).value =
                        formatDate(item.Zero_Level_Check_Temp_DWG) || '-';
                    templateSheet.getCell(`P${r}`).value =
                        toNum(item.Time_Zero_Level) || '-';

                    const cellQ = templateSheet.getCell(`Q${r}`);
                    cellQ.value = toNum(item.Design_working_day);
                    cellQ.numFmt = '0';

                    templateSheet.getCell(`R${r}`).value =
                        toNum(item.LeadTime) || '-';
                    templateSheet.getCell(`S${r}`).value =
                        toNum(item.Time_DESBM_to_MFGBM_2) || '-';
                    templateSheet.getCell(`T${r}`).value =
                        item.UserAction || '-';

                    const userAction = String(item.UserAction || 'SYSTEM')
                        .trim()
                        .toUpperCase();
                    const isManual =
                        userAction !== 'SYSTEM' &&
                        userAction !== '' &&
                        userAction !== '-';

                    cols.forEach((c) => {
                        setCellFontColor(
                            templateSheet.getCell(`${c}${r}`),
                            isManual,
                        );
                    });
                });
            },
        });

        const now = new Date();
        const timeStamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
        const revLabel =
            planStatus === 'DRAFT' || !revision || revision === '*'
                ? 'DRAFT'
                : `REV_${revision}`;
        const outFileName = `DESBM_${cleanPeriod}_${revLabel}_${timeStamp}`;

        await exportExcel(workbook, outFileName);
    } catch (error) {
        console.error('Error generating excel:', error);
        alert(
            'เกิดข้อผิดพลาดในการสร้างไฟล์ Excel: ' + (error.message || error),
        );
    } finally {
        if (typeof showLoader === 'function') showLoader({ show: false });
    }
}
