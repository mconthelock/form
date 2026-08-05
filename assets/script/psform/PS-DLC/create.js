import { webflowSubmit } from '@amec/webasset/components/form';
import { createTable } from '@amec/webasset/dataTable';
import {
    createdlcForm,
    getEmpData,
    getSchedule,
    validateDrawingNo,
} from './data';
import { logFormData, requiredForm, showMessage } from '@amec/webasset/utils';
import ExcelJS from 'exceljs';
import { setDatePicker } from '@amec/webasset/flatpickr';
import dayjs from 'dayjs';
import { redirectWebflow } from '@amec/webasset/form';

// main function
$(async function () {
    try {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const empno = urlParams.get('empno');
        const getName = await getEmpData(empno);
        $('#INPUTBY').val(empno);
        $('#inputName').val(getName.SNAME);

        // ----------JUNG BM- ------------------------
        await setDatePicker({
            element: '#selectedDate',
            dateFormat: 'Y-m-d',
            // maxDate: 'today',
            dayOff: false,
            onChange: async (selectedDates, dateStr) => {
                await setSchedule(dateStr);
            },
        });
        // -------------------------------------------------
        // ---------- สร้างและเริ่มการทำงานของตาราง ----------
        await TableManager.init();

        const action = webflowSubmit({ request: true });
        $('#sentRequest').html(action);
    } catch (error) {
        console.log(error);
    }
});

//BM date
$(document).on('click', '#openDatePicker', function (e) {
    e.preventDefault();
    const datePicker = document.querySelector('#selectedDate')?._flatpickr;
    if (datePicker) datePicker.open();
});

//BM date
async function setSchedule(dateStr) {
    let currentDate = dayjs(dateStr);
    if (!currentDate.isValid()) {
        currentDate = dayjs(String(dateStr), 'YYYYMMDD');
    }

    let res = [];
    const maxLookbackDays = 365;
    for (let i = 0; i < maxLookbackDays; i++) {
        const queryDate = currentDate.format('YYYYMMDD');
        res = await getSchedule({ sdate: queryDate, edate: queryDate });
        if (Array.isArray(res) && res.length > 0 && res[0].SCHDNUMBER != null) {
            break;
        }
        currentDate = currentDate.subtract(1, 'day');
    }

    if (!Array.isArray(res) || res.length === 0) {
        $('#schd_txt').val('');
        $('#schd_number').val('');
        $('#schd_p').val('');
        showMessage('No schedule found.');
        return;
    }

    $('#schd_txt').val(res[0].SCHDMFG + '-' + res[0].PRIORITY);
    $('#schd_number').val(res[0].SCHDNUMBER);
    $('#schd_p').val(res[0].PRIORITY);
    const workId = String(res?.[0]?.WORKID ?? '');
    const formattedWorkId = /^\d{8}$/.test(workId)
        ? `${workId.slice(0, 4)}-${workId.slice(4, 6)}-${workId.slice(6, 8)}`
        : workId;
    console.log(formattedWorkId);
    $('#selectedDate').val(formattedWorkId);
}

// get name Requester
$(document).on('change', '#REQBY', async function (e) {
    e.preventDefault();
    try {
        const empData = await getEmpData($(this).val());
        $('#reqName').val(empData.SNAME);
    } catch (error) {
        console.log(error);
    }
});

$(document).on('click', '#linkdownload', function (e) {
    e.preventDefault();
    const fileUrl = `${process.env.APP_ENV}/assets/files/PN_template/Template CHG PN.xlsx`;
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = 'Template CHG PN.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Request form
$(document).on('click', '#btnRequest', async function () {
    try {
        const requiredMessage = [
            {
                element: $('#REQBY'),
                message: 'Please fill in the Request By',
            },
            {
                element: $('#fileUpload'),
                message: 'Please upload file',
            },
            {
                element: $('#schd_txt'),
                message: 'Please select Schedule',
            },
        ];

        if (!(await requiredForm(`#dlcForm`, requiredMessage))) return;

        const formData = new FormData($(`#dlcForm`)[0]);
        formData.set('REMARK', $('#remark').val());

        // ==========================================
        // ส่วนที่เพิ่ม: นำข้อมูลตารางใส่เข้า FormData
        // ==========================================
        if (typeof TableManager !== 'undefined') {
            // 1. สั่ง sync ข้อมูลล่าสุดจากตาราง (เผื่อกรณี User พิมพ์แก้แล้วยังไม่ได้คลิกออกนอกช่อง)
            TableManager.syncData();
            const invalidOldCodes = TableManager.validateOldCodeLengths();
            if (invalidOldCodes.length > 0) {
                showMessage('พบ OLDCODE บางรายการเกิน 20 ตัวอักษร โปรดแก้ไข');
                return;
            }

            const invalidRows = TableManager.excelData.filter(
                (row) => !validateDrawingNo(row.DRAWING),
            );

            if (invalidRows.length > 0) {
                // ดึงเอา Drawing No ที่ผิดมาต่อกันด้วยลูกน้ำ (,) เพื่อแสดงในข้อความ
                // ถ้าค่านั้นว่างเปล่า (Empty) ให้แสดงคำว่า "[ค่าว่าง]" แทน
                const badDrawings = invalidRows
                    .map((row) => (row.DRAWING ? row.DRAWING : '[ค่าว่าง]'))
                    .join(', ');

                showMessage(`พบ Drawing No. ไม่ถูกต้อง: ${badDrawings}`);
                return;
            }

            // 3. แปลง Array เป็น JSON String แล้วแนบเข้า FormData
            // หมายเหตุ: ฝั่ง Backend (เช่น PHP/Node.js) ต้องรับค่า "TABLE_DATA" แล้วนำไป parse เป็น JSON กลับอีกที
            formData.set('DETAILS', JSON.stringify(TableManager.excelData));
        }
        // ==========================================
        logFormData(formData);
        const res = await createdlcForm(formData);

        if (res.status == true) {
            showMessage(res.message, 'success');
            redirectWebflow();
        } else {
            throw new Error(res.message);
        }
    } catch (error) {
        console.log(error);
        showMessage(error.message);
    }
});

// ==========================================
// 1. UTILITIES & CONSTANTS (ฟังก์ชันตัวช่วย ต้องอยู่บนสุด)
// ==========================================
const MAX_OLD_CODE_LENGTH = 20;

const tableKeys = [
    'SEQNO',
    'DRAWING',
    'ITEM',
    'NEWCODE',
    'NEWFLAG',
    'OLDCODE',
    'OLDFLAG',
    'OLDSTATUS',
    'OLDSPEC',
    'REFERENCE',
    'REMARKTABLE',
];

const dlcColumns = [
    { key: 'SEQNO', aliases: ['no', 'no.'] },
    { key: 'DRAWING', aliases: ['drawing no', 'drawing no.', 'drawing'] },
    { key: 'ITEM', aliases: ['item'] },
    { key: 'NEWCODE', aliases: ['change to code', 'new code', 'code'] },
    { key: 'NEWFLAG', aliases: ['change to new flag', 'new flag'] },
    {
        key: 'OLDCODE',
        aliases: ['before change code', 'before code', 'old code'],
    },
    {
        key: 'OLDFLAG',
        aliases: ['before change flag', 'before flag', 'old flag'],
    },
    { key: 'OLDSTATUS', aliases: ['before change status', 'status'] },
    {
        key: 'OLDSPEC',
        aliases: ['before change spec material', 'spec material'],
    },
    { key: 'REFERENCE', aliases: ['reference', 'ref'] },
    { key: 'REMARKTABLE', aliases: ['remark', 'remarks'] },
];

function getCellText(cell) {
    const value = cell.value;
    if (value == null) return '';
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    if (typeof value === 'object') {
        if (value.text) return value.text;
        if (value.result != null) return String(value.result);
        if (value.richText)
            return value.richText.map((item) => item.text).join('');
    }
    return String(value).trim();
}

function normalizeHeader(value) {
    return String(value)
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[._-]/g, '')
        .trim();
}

function findHeaderMap(sheet) {
    const maxHeaderRows = Math.min(10, sheet.rowCount);
    let bestMatch = { headerRows: 0, columns: {}, count: 0 };

    for (let headerRows = 1; headerRows <= maxHeaderRows; headerRows++) {
        const columns = {};
        for (let colNumber = 1; colNumber <= sheet.columnCount; colNumber++) {
            const headerParts = [];
            for (let rowNumber = 1; rowNumber <= headerRows; rowNumber++) {
                const text = getCellText(
                    sheet.getRow(rowNumber).getCell(colNumber),
                );
                if (text) headerParts.push(text);
            }
            const fullHeader = normalizeHeader(headerParts.join(' '));
            const lastHeader = normalizeHeader(
                headerParts[headerParts.length - 1] || '',
            );

            dlcColumns.forEach(({ key, aliases }) => {
                if (columns[key]) return;
                const matched = aliases.some((alias) => {
                    const normalizedAlias = normalizeHeader(alias);
                    return (
                        fullHeader === normalizedAlias ||
                        fullHeader.includes(normalizedAlias) ||
                        lastHeader === normalizedAlias
                    );
                });
                if (matched) columns[key] = colNumber;
            });
        }
        const count = Object.keys(columns).length;
        if (count > bestMatch.count) bestMatch = { headerRows, columns, count };
    }
    return bestMatch;
}

async function readExcelToJson(file) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await file.arrayBuffer());

    const sheet = workbook.worksheets[0];
    const headerMap = findHeaderMap(sheet);
    const rows = [];

    if (headerMap.count === 0)
        throw new Error('ไม่พบ header ที่ตรงกับตารางในไฟล์ Excel');

    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber <= headerMap.headerRows) return;
        const item = {};
        dlcColumns.forEach(({ key }) => {
            const colNumber = headerMap.columns[key];
            const text = colNumber ? getCellText(row.getCell(colNumber)) : '';
            item[key] = key === 'NO' ? (text === '' ? '' : Number(text)) : text;
        });
        if (dlcColumns.some(({ key }) => item[key] !== '')) rows.push(item);
    });
    return rows;
}

// ==========================================
// 2. TABLE MANAGER (จัดการตาราง)
// ==========================================
const TableManager = {
    instance: null,
    excelData: [],

    async init() {
        this.instance = await createTable(
            {
                responsive: false,
                columns: [
                    { title: 'No' },
                    { title: 'Drawing No.', className: 'text-nowrap' },
                    { title: 'Item' },
                    { title: 'Code', className: 'text-nowrap' },
                    { title: 'New Flag' },
                    { title: 'Code', className: 'text-nowrap' },
                    { title: 'Flag' },
                    { title: 'Status', className: 'text-nowrap' },
                    { title: 'Spec Material', className: 'text-nowrap' },
                    { title: 'Reference', className: 'text-nowrap' },
                    {
                        title: 'Remark',
                        className: 'min-w-[300px]',
                        width: '300px',
                    },
                ],
                columnDefs: [
                    {
                        targets: '_all',
                        createdCell: (td, cellData, rowData, row, col) => {
                            const columnNames = [
                                'SEQNO',
                                'DRAWING',
                                'ITEM',
                                'NEWCODE',
                                'NEWFLAG',
                                'OLDCODE',
                                'OLDFLAG',
                                'OLDSTATUS',
                                'OLDSPEC',
                                'REFERENCE',
                                'REMARKTABLE',
                            ];
                            $(td)
                                .attr('contenteditable', 'true')
                                .addClass('dlc-editable-cell')
                                .attr('name', columnNames[col]);
                        },
                    },
                ],
                initComplete: function () {
                    const $thead = $(this.api().table().header());
                    $thead.html(`
          <tr>
            <th rowspan="2">No</th>
            <th rowspan="2">Drawing No.</th>
            <th rowspan="2">Item</th>
            <th colspan="2">Change To</th>
            <th colspan="4">Before Change</th>
            <th rowspan="2">Reference</th>
            <th rowspan="2" style="min-width: 300px;">Remark</th>
          </tr>
          <tr>
            <th>Code</th>
            <th>New Flag</th>
            <th>Code</th>
            <th>Flag</th>
            <th>Status</th>
            <th>Spec Material</th>
          </tr>
        `);
                },
            },
            { id: '#Table', domScroll: { status: true } },
        );

        this.bindEvents();
    },

    bindEvents() {
        $(document).on('blur', '#Table tbody td.dlc-editable-cell', (e) => {
            const cell = e.currentTarget;
            const name = $(cell).attr('name');
            let value = $(cell).text().trim();

            if (name === 'DRAWING') {
                const validated = validateDrawingNo(value);
                if (!validated) {
                    showMessage('Drawing No. ไม่ถูกต้อง');
                    return;
                }
                value = validated;
                $(cell).text(value);
            }

            this.instance.cell(cell).data(value);
            this.syncData();
            if (name === 'OLDCODE') {
                this.highlightOldCodeCell(cell, value);
            }
        });

        $(document).on('change', '#fileUpload', async (e) => {
            try {
                const file = e.target.files[0];
                if (!file) return;
                this.excelData = await readExcelToJson(file);

                this.excelData = this.excelData.map((row) => ({
                    ...row,
                    DRAWING: validateDrawingNo(row.DRAWING) ?? row.DRAWING,
                }));

                this.renderData(this.excelData);
            } catch (error) {
                console.log(error);
                showMessage(error.message);
            }
        });
    },

    syncData() {
        this.excelData = this.instance
            .rows()
            .data()
            .toArray()
            .map((row) => {
                const item = {};
                tableKeys.forEach((key, index) => {
                    const value = row[index] ?? '';
                    item[key] =
                        key === 'NO'
                            ? value === ''
                                ? ''
                                : Number(value)
                            : value;
                });
                return item;
            });
    },

    getColumnIndex(columnName) {
        return tableKeys.indexOf(columnName);
    },

    highlightOldCodeCell(cell, value) {
        const text = String(value || '').trim();
        if (text.length > MAX_OLD_CODE_LENGTH) {
            $(cell).css('color', '#dc2626');
        } else {
            $(cell).css('color', '');
        }
    },

    highlightAllOldCodeCells() {
        const columnIndex = this.getColumnIndex('OLDCODE');
        if (columnIndex === -1) return;

        $(this.instance.rows().nodes()).each((rowIndex, tr) => {
            const cell = $(tr).find('td').eq(columnIndex);
            const text = cell.text().trim();
            if (text.length > MAX_OLD_CODE_LENGTH) {
                cell.css('color', '#dc2626');
            } else {
                cell.css('color', '');
            }
        });
    },

    validateOldCodeLengths() {
        this.syncData();
        const invalidRows = this.excelData.filter(
            (row) => String(row.OLDCODE || '').length > MAX_OLD_CODE_LENGTH,
        );
        this.highlightAllOldCodeCells();
        return invalidRows;
    },

    renderData(data) {
        this.instance.clear();
        this.instance.rows.add(
            data.map((row) => [
                row.SEQNO,
                row.DRAWING,
                row.ITEM,
                row.NEWCODE,
                row.NEWFLAG,
                row.OLDCODE,
                row.OLDFLAG,
                row.OLDSTATUS,
                row.OLDSPEC,
                row.REFERENCE,
                row.REMARKTABLE,
            ]),
        );
        this.instance.draw(false);
        this.highlightAllOldCodeCells();
    },
};
