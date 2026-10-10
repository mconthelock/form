import ExcelJS from 'exceljs';
import { fetchUtils } from '@amec/webasset/api/fetch-utils';
import { formatDate } from '@amec/webasset/dayjs';

// ==== EXCEL BUILDER START ====

// รหัส section -> ชื่อ (รู้แค่ 2 ตัวนี้ ที่เหลือจะแสดงเป็นรหัสไปก่อน)
const SECTION_MAP = {
    '050504': 'WHI',
    '050604': 'WSD',
};

const STATUS_MAP = {
    1: 'On Process',
    2: 'Finished',
};

// CSTEPNO ใน flow
const STEP = {
    REQ_SEM: '06', // Requester SEM
    WHI_SEM: '10', // WHI SEM (รอบแรก)
    WHI_SEM_FINAL: '18', // WHI SEM (รอบสุดท้าย)
    LDFM: '19', // WHI (LD/FM)
};

const FILL = {
    title: '1F4E78',
    group1: '4472C4', // ข้อมูลผู้ขอ
    group2: '548235', // ข้อมูลชิ้นส่วน
    group3: 'C55A11', // สถานะอนุมัติ
    rowOdd: 'F7FBFF',
    rowEven: 'FFFFFF',
};

// [header, width, group fill, text color, number format]
const SHEET_COLUMNS = [
    ['No.', 8, FILL.group1, '666666'],
    ['Form No.', 17.14, FILL.group1, '0070C0'],
    ['Section Request', 20.57, FILL.group1, '0070C0'],
    ['Requester', 22.86, FILL.group1, '0070C0'],
    ['Reason for Borrowing', 32, FILL.group1, '0070C0'],
    ['Plan Return Date', 18.29, FILL.group1, '0070C0', 'd-mmm-yy'],
    ['PUR Code', 22.86, FILL.group2, '0070C0'],
    ['Description', 28.57, FILL.group2, '0070C0'],
    ['Drawing', 20.57, FILL.group2, '0070C0'],
    ['Address', 16, FILL.group2, '0070C0'],
    ['WHI User', 37.86, FILL.group2, '0070C0'],
    ['Quantity', 20.57, FILL.group2, '0070C0'],
    ['Production', 22.86, FILL.group2, '0070C0'],
    ['Issue To', 13, FILL.group2, '0070C0'],
    ['Assign LD/FM', 32.29, FILL.group2, '0070C0'],
    ['Remark detail', 25.86, FILL.group2, '0070C0'],
    ['Status Approve', 28.57, FILL.group3, '7F6000'],
    ['Requester Date', 16, FILL.group3, '7F6000', 'd-mmm-yy'],
    ['Requester SEM', 16, FILL.group3, '7F6000', 'd-mmm-yy'],
    ['WHI SEM', 16, FILL.group3, '7F6000', 'd-mmm-yy'],
    ['WHI (LD/FM)', 16, FILL.group3, '7F6000', 'd-mmm-yy'],
    ['WHI SEM ', 16, FILL.group3, '7F6000', 'd-mmm-yy'],
];

const argb = (hex) => ({ argb: `FF${hex}` });

// วันที่จาก API เป็น ISO (UTC) -> เอาเฉพาะวันที่ตามเวลาไทย แล้วทำเป็น Date เที่ยงคืน UTC
// เพื่อให้ Excel แสดงวันที่ตรงกับหน้าจอ
function toExcelDate(value) {
    const text = value ? formatDate(value, 'YYYY-MM-DD') : '';
    return text ? new Date(`${text}T00:00:00Z`) : null;
}

function empLabel(no, name) {
    if (!no || no === 'SYSTEM') return '';
    return name ? `(${no}) ${name.replace(/\s+/g, ' ').trim()}` : `(${no})`;
}

function stepOf(flow, stepNo) {
    return (flow || []).find((f) => f.CSTEPNO === stepNo);
}

// เอาเฉพาะ step ที่อนุมัติแล้ว (CSTEPST = 5 และมีวันที่)
function approvedDate(flow, stepNo) {
    const step = stepOf(flow, stepNo);
    return step?.CSTEPST === '5' && step.DAPVDATE
        ? toExcelDate(step.DAPVDATE)
        : null;
}

function buildRow(row, reasonMap) {
    const form = row.formdetail || {};
    const flow = row.flow || [];
    const ldfm = stepOf(flow, STEP.LDFM);

    const reason = reasonMap[row.REASON_CODE] ?? row.REASON_CODE ?? '';
    const reasonText = [reason, row.REASON_DETAIL].filter(Boolean).join(' - ');

    return [
        null, // No. ใส่เป็นสูตรตอนเขียน
        row.formno || form.FORMNO,
        SECTION_MAP[form.VREQSECCODE] ?? form.VREQSECCODE ?? '',
        empLabel(form.VREQNO, form.VREQNAME),
        reasonText,
        toExcelDate(row.PLAN_RETURN_DATE),
        row.PUR_CODE,
        row.DESCRIPTION,
        row.DRAWING_NO,
        row.ADDRESS,
        empLabel(row.WHI_USER, row.WHI_USER_NAME),
        row.QUANTITY,
        row.PRODUCTION,
        row.ISSUE_TO,
        empLabel(ldfm?.VAPVNO, ldfm?.SNAME),
        ldfm?.VREMARK || form.VREMARK || '',
        STATUS_MAP[form.CST] ?? form.CST ?? '',
        toExcelDate(form.DREQDATE),
        approvedDate(flow, STEP.REQ_SEM),
        approvedDate(flow, STEP.WHI_SEM),
        approvedDate(flow, STEP.LDFM),
        approvedDate(flow, STEP.WHI_SEM_FINAL),
    ];
}

function buildWorkbook(rows, generatedText, reasonMap = {}) {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Sheet1', {
        // views: [{ state: 'frozen', xSplit: 2, ySplit: 3 }],
    });
    const lastCol = SHEET_COLUMNS.length;

    SHEET_COLUMNS.forEach(([, width], i) => {
        ws.getColumn(i + 1).width = width;
    });

    // Title
    ws.mergeCells(1, 1, 1, lastCol);
    const title = ws.getCell(1, 1);
    title.value = 'PART BORROWING REQUEST - FOLLOW UP';
    title.font = { name: 'Arial', size: 16, bold: true, color: argb('FFFFFF') };
    title.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: argb(FILL.title),
    };
    title.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(1).height = 24;

    // Sub title
    ws.mergeCells(2, 1, 2, lastCol);
    const sub = ws.getCell(2, 1);
    sub.value = generatedText;
    sub.font = { name: 'Arial', size: 9, color: argb('666666') };
    sub.alignment = { horizontal: 'left', vertical: 'middle' };
    ws.getRow(2).height = 20;

    // Header
    SHEET_COLUMNS.forEach(([header, , fill], i) => {
        const cell = ws.getCell(3, i + 1);
        cell.value = header;
        cell.font = {
            name: 'Arial',
            size: 9,
            bold: true,
            color: argb('FFFFFF'),
        };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: argb(fill) };
        cell.alignment = {
            horizontal: 'center',
            vertical: 'middle',
            wrapText: true,
        };
    });
    ws.getRow(3).height = 24;

    // Body
    rows.forEach((row, idx) => {
        const r = 4 + idx;
        const values = buildRow(row, reasonMap);
        const excelRow = ws.getRow(r);
        excelRow.height = 27.95;

        SHEET_COLUMNS.forEach(([, , , color, numFmt], i) => {
            const cell = excelRow.getCell(i + 1);
            const value = values[i];

            if (i === 0) {
                cell.value = { formula: 'ROW()-3', result: idx + 1 };
            } else {
                cell.value = value ?? null;
            }

            cell.font = { name: 'Arial', size: 9, color: argb(color) };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: argb(idx % 2 === 0 ? FILL.rowOdd : FILL.rowEven),
            };
            cell.alignment = {
                vertical: 'middle',
                wrapText: true,
                horizontal: i >= 16 ? 'left' : undefined,
            };
            if (numFmt) cell.numFmt = numFmt;
            if (i === 11) {
                cell.numFmt = '#,##0.00';
                if (
                    (typeof value === 'number' ||
                        (typeof value === 'string' && value.trim() !== '')) &&
                    Number.isFinite(Number(value))
                ) {
                    cell.value = Number(value);
                }
            }
        });
    });

    if (rows.length) {
        const lastRow = 3 + rows.length;
        ws.autoFilter = {
            from: { row: 3, column: 1 },
            to: { row: 3, column: lastCol },
        };
        ws.dataValidations.add(`Q4:Q${lastRow}`, {
            type: 'list',
            allowBlank: true,
            formulae: ['"Rejected,On Process,Finished,Returned"'],
        });
    }

    return wb;
}

// ==== EXCEL BUILDER END ====

// REASON_CODE -> REASON_NAME จาก API (ถ้ายิงไม่ผ่านจะแสดงเป็นรหัสแทน)
async function fetchReasonMap() {
    try {
        const response = await fetchUtils({
            url: `${process.env.APP_API}/ps-upi/reason`,
            method: 'GET',
        });
        const list = Array.isArray(response)
            ? response
            : Array.isArray(response?.data)
              ? response.data
              : [];
        return Object.fromEntries(
            list.map((r) => [String(r.REASON_CODE), r.REASON_NAME]),
        );
    } catch (error) {
        console.error('Cannot load PS-UPI reasons', error);
        return {};
    }
}

async function exportReport(rows, criteria) {
    const reasonMap = await fetchReasonMap();
    const stamp = formatDate(new Date(), 'YYYY-MM-DD HH:mm');
    const filters = Object.entries(criteria)
        .map(([key, value]) => `${key}: ${value}`)
        .join(' | ');
    const generatedText = `Generated: ${stamp}   |   ${rows.length} requisition(s)${
        filters ? `   |   ${filters}` : ''
    }`;

    const wb = buildWorkbook(rows, generatedText, reasonMap);
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PartBorrowingRequest_FollowUp_${formatDate(new Date(), 'YYYYMMDD')}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

$(document).ready(async function () {
    $('#upiReportForm').on('submit', async function (event) {
        event.preventDefault();

        const criteria = Object.fromEntries(
            [...new FormData(this).entries()]
                .map(([key, value]) => [key, String(value).trim()])
                .filter(([, value]) => value !== ''),
        );
        const $button = $('#searchUpiReport');

        $button.prop('disabled', true).addClass('loading');
        $('#upiReportSummary').text('Generating Excel report...');

        try {
            const response = await fetchUtils({
                url: `${process.env.APP_API}/ps-upi/getReport`,
                method: 'POST',
                data: criteria,
            });
            const rows = Array.isArray(response)
                ? response
                : Array.isArray(response?.data)
                  ? response.data
                  : [];

            if (!rows.length) {
                $('#upiReportSummary').text('No requisition found.');
                return;
            }

            await exportReport(rows, criteria);
            $('#upiReportSummary').text(
                `${rows.length} requisition(s) exported to Excel.`,
            );
        } catch (error) {
            console.error('Cannot export PS-UPI report', error);
            $('#upiReportSummary').text('Unable to export report data.');
        } finally {
            $button.prop('disabled', false).removeClass('loading');
        }
    });

    $('#resetUpiReport').on('click', function (event) {
        event.preventDefault();
        document.getElementById('upiReportForm').reset();
        $('#upiReportSummary').text('Search to export report data.');
    });
});
