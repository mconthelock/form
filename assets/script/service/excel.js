import dayjs from 'dayjs';
import ExcelJS from 'exceljs';

export const cloneRows = async (worksheet, sourceRowNum, targetRowNum) => {
    const sourceRow = worksheet.getRow(sourceRowNum);
    const newRow = worksheet.insertRow(targetRowNum);
    sourceRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const newCell = newRow.getCell(colNumber);
        if (cell.style) {
            newCell.style = { ...cell.style };
        }
    });
    newRow.height = sourceRow.height;
};

export const exportExcel = async (data, template, options = {}) => {
    try {
        const opt = {
            filename: `export.xlsx`,
            rowstart: 2,
            ...options,
        };
        const file = template.buffer;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file).then(async (workbook) => {
            const sheet_data = workbook.worksheets[1];
            const columns = await exportFormat(sheet_data);
            const sheet = workbook.worksheets[0];
            const colCount = sheet.columnCount;

            let color = opt.rowstart;
            let target = opt.rowstart + 2;

            let i = 0;
            for (const el of data) {
                cloneRows(sheet, color, target);
                for (let j = 1; j <= colCount; j++) {
                    const format = columns.find((item) => item[1] == j);
                    if (format == undefined || format[3] == null) continue;

                    let value = '';
                    if (format[2] == 'Func') {
                        const param = format[4] ? JSON.parse(format[4]) : {};
                        value = eval(format[3])(el, param);
                        sheet.getCell(target, format[1]).value = value;
                    } else if (format[2] == 'Formula') {
                        value = {
                            formula: format[3].replaceAll('{x}', target - 2),
                        };
                        sheet.getCell(target, format[1]).value = value;
                    } else {
                        if (format[3].includes('.')) {
                            const keys = format[3].split('.');
                            const item = el[keys[0]];
                            if (item !== undefined) {
                                if (Array.isArray(item)) {
                                    // prettier-ignore
                                    value = item !== undefined ? item[0][keys[1]] : "";
                                } else {
                                    value =
                                        item !== undefined ? item[keys[1]] : '';
                                }
                            }
                        } else {
                            // prettier-ignore
                            value = el[format[3]] !== undefined ? el[format[3]] : "";
                        }
                        //Format Data
                        if (format[2] === 'Date' && value) {
                            // prettier-ignore
                            sheet.getCell(target, format[1]).value = dayjs(value).add(7, 'hour').toDate();
                            sheet.getCell(target, format[1]).numFmt = format[4]
                                ? format[4]
                                : 'yyyy-mm-dd';
                        } else if (format[2] === 'Datetime' && value) {
                            // prettier-ignore
                            sheet.getCell(target, format[1]).value = dayjs(value).add(7, 'hour').toDate();
                            sheet.getCell(target, format[1]).numFmt = format[4]
                                ? format[4]
                                : 'yyyy-mm-dd hh:mm:ss';
                        } else if (format[2] === 'Account') {
                            const digit = format[4] ? parseInt(format[4]) : 0;
                            // prettier-ignore
                            sheet.getCell(target, format[1]).value = value !== "" ? parseFloat(value) : 0;
                            sheet.getCell(target, format[1]).numFmt =
                                `_(* #,##0${digit > 0 ? '.' + '0'.repeat(digit) : ''}_);_(* (#,##0${digit > 0 ? '.' + '0'.repeat(digit) : ''})_);_(* "-"??_);_(@_)`;
                        } else {
                            sheet.getCell(target, format[1]).value = value;
                            sheet.getCell(target, format[1]).numFmt = 'General';
                        }
                    }
                }
                target = target + 1;
                color = color == opt.rowstart ? color + 1 : opt.rowstart;
                // });
            }
            if (opt.static) {
                for (let rw of opt.static) {
                    sheet.getCell(rw.cols).value = rw.text;
                }
            }

            // Excute more options (if any)
            if (opt.execute != null && typeof opt.execute == 'function') {
                await opt.execute(workbook, sheet);
            }

            sheet.spliceRows(opt.rowstart, 2);
            // Remove all sheets except the first one
            while (workbook.worksheets.length > 1)
                workbook.removeWorksheet(workbook.worksheets[1].id);
            await workbook.xlsx.writeBuffer().then(function (buffer) {
                const blob = new Blob([buffer], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = opt.filename;
                link.click();
            });
        });
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const exportFormat = (sheet) => {
    const data_array = [];
    sheet.eachRow({ includeEmpty: false }, function (row, rowNumber) {
        const row_values = [];
        row.eachCell({ includeEmpty: true }, function (cell, colNumber) {
            row_values.push(cell.value);
        });
        data_array.push(row_values);
    });
    return data_array;
};

export const getTemplate = async (filename) => {
    const dir = `${process.env.AMEC_FILE_PATH}${process.env.STATE == 'production' ? 'production' : 'development'}/Form/`;
    const data = {
        path: `${dir}/${filename}`,
        name: filename,
    };
    console.log(data.path);

    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${process.env.APP_API}/files/template/read/`,
            type: 'POST',
            dataType: 'json',
            data: data,
            success: function (res) {
                const binaryData = atob(res.content);
                const buffer = new Uint8Array(binaryData.length);
                for (let i = 0; i < binaryData.length; i++) {
                    buffer[i] = binaryData.charCodeAt(i);
                }
                res.buffer = buffer;
                resolve(res);
            },
            error: function (error) {
                reject(error);
            },
        });
    });
};

export function getSchedule(data, param) {
    const val = data.AMEC_SCHDL;
    if (val == '' || val == undefined || val == null) return '';

    const str1 = dayjs(val).format('YYMM');
    let jun = '';
    switch (dayjs(val).format('DD')) {
        case '05':
            jun = `${str1}X`;
            break;
        case '10':
            jun = `${str1}A`;
            break;
        case '15':
            jun = `${str1}Y`;
            break;
        case '20':
            jun = `${str1}B`;
            break;
        case '25':
            jun = `${str1}Z`;
            break;
        default:
            jun = `${str1}C`;
            break;
    }
    return jun;
}
