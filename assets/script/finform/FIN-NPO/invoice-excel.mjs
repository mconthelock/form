import ExcelJS from 'exceljs';

const headers = ['Invoice Date', 'Invoice No.', 'Total Amount', 'VAT', 'Net Price', 'Reference'];
const templateId = 'FIN-NPO-INVOICES:v1';

export function createInvoiceWorkbook(invoices = []) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Invoices');
    sheet.columns = headers.map((header, index) => ({
        header,
        width: [18, 24, 20, 18, 20, 36][index],
    }));
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    sheet.autoFilter = 'A1:F1';
    sheet.getRow(1).height = 28;
    headers.forEach((_, index) => {
        const cell = sheet.getCell(1, index + 1);
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: index === 4 ? 'FF2563EB' : 'FF15803D' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
    sheet.getColumn(1).numFmt = 'yyyy-mm-dd';
    sheet.getColumn(2).numFmt = '@';
    [3, 4, 5].forEach((column) => { sheet.getColumn(column).numFmt = '#,##0.00'; });
    sheet.getColumn(6).numFmt = '@';
    (invoices.length ? invoices : [{}]).forEach((invoice) => {
        const total = invoice.TOTAL_AMOUNT ?? '';
        const vat = invoice.VAT ?? '';
        const row = sheet.addRow([
            invoice.INVOICE_DATE || '', invoice.INVOICE_NO || '',
            total, vat, null, invoice.REFERENCE || '',
        ]);
        row.getCell(5).value = {
            formula: `IF(C${row.number}="","",C${row.number}-D${row.number})`,
            result: total === '' ? '' : Math.round((Number(total) - Number(vat)) * 100) / 100,
        };
        row.eachCell({ includeEmpty: true }, (cell) => {
            cell.border = { bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } } };
        });
    });
    workbook.addWorksheet('_FIN_NPO_TEMPLATE', { state: 'veryHidden' }).getCell('A1').value = templateId;
    workbook.calcProperties.fullCalcOnLoad = true;
    return workbook;
}

function isBlank(value) {
    return value == null || (typeof value === 'string' && value.trim() === '');
}

function textValue(value, rowNumber, label) {
    if (isBlank(value)) return '';
    if (typeof value !== 'string' && typeof value !== 'number') {
        throw new Error(`Row ${rowNumber}: ${label} must be text or a number.`);
    }
    return String(value).trim();
}

function amountValue(value, rowNumber, label) {
    const text = typeof value === 'string' ? value.trim() : '';
    if (typeof value !== 'number' && !/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(text)) {
        throw new Error(`Row ${rowNumber}: ${label} must be a number with up to 2 decimal places.`);
    }
    const amount = typeof value === 'number' ? value : Number(text.replace(/,/g, ''));
    if (!Number.isFinite(amount) || amount < 0 || !Number.isSafeInteger(Math.round(amount * 100)) || Math.abs(amount * 100 - Math.round(amount * 100)) > 0.0001) {
        throw new Error(`Row ${rowNumber}: ${label} is invalid.`);
    }
    return amount;
}

function dateValue(value, rowNumber) {
    const text = value instanceof Date && !Number.isNaN(value.getTime())
        ? value.toISOString().slice(0, 10) : String(value ?? '').trim();
    const date = new Date(`${text}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== text) {
        throw new Error(`Row ${rowNumber}: Invoice Date must be a valid date (YYYY-MM-DD).`);
    }
    return text;
}

export function readInvoiceWorkbook(workbook) {
    const sheet = workbook.getWorksheet('Invoices');
    const marker = workbook.getWorksheet('_FIN_NPO_TEMPLATE');
    if (workbook.worksheets.length !== 2 || !sheet || marker?.getCell('A1').value !== templateId ||
        sheet.columnCount !== headers.length ||
        headers.some((header, index) => sheet.getCell(1, index + 1).value !== header)) {
        throw new Error('Invalid template. Please use the .xlsx file downloaded from Export Excel without changing its sheets or column headers.');
    }

    const invoices = [];
    sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const values = [1, 2, 3, 4, 6].map((column) => row.getCell(column).value);
        // The calculated Net Price formula does not make an empty template row an invoice.
        if (values.every(isBlank) && (isBlank(row.getCell(5).value) || row.getCell(5).type === ExcelJS.ValueType.Formula)) return;
        const [date, number, total, vat, reference] = values;
        const invoice = {
            INVOICE_DATE: dateValue(date, rowNumber),
            INVOICE_NO: textValue(number, rowNumber, 'Invoice No.'),
            TOTAL_AMOUNT: amountValue(total, rowNumber, 'Total Amount'),
            VAT: amountValue(vat, rowNumber, 'VAT'),
            REFERENCE: textValue(reference, rowNumber, 'Reference'),
        };
        if (!invoice.INVOICE_NO || invoice.TOTAL_AMOUNT <= 0 || invoice.VAT > invoice.TOTAL_AMOUNT || invoice.REFERENCE.length > 255) {
            throw new Error(`Row ${rowNumber}: Invoice No. is required, Total Amount must be greater than 0, VAT must not exceed Total Amount, and Reference must not exceed 255 characters.`);
        }
        invoice.NET_PRICE = Math.round((invoice.TOTAL_AMOUNT - invoice.VAT) * 100) / 100;
        invoices.push(invoice);
    });
    if (!invoices.length) throw new Error('No invoice data found. Please fill in the exported template before importing.');
    return invoices;
}

export async function loadInvoiceFile(buffer) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    return readInvoiceWorkbook(workbook);
}
