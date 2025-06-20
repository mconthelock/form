import ExcelJS from 'exceljs';

/**
 * Export file excel (Download)
 * @param {object} workbook 
 * @param {string} fileName 
 */
export function exportExcel(workbook, fileName = 'Report'){
    console.log(workbook);
    
    // สร้างไฟล์ Excel เป็น Blob
    workbook.xlsx.writeBuffer().then(function (buffer) {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // สร้างลิงก์ดาวน์โหลด
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}.xlsx`;
        link.click();
    });
}

/**
 * Excel defualt option write file
 */
export const excelOptions = {
    sheetName: 'Sheet1',
    font: { bold: true }, // ทำให้ตัวหนา
    alignment: { vertical: 'middle', horizontal: 'center' }, // จัดข้อความให้อยู่ตรงกลาง
    extraWidth : 8,
    customActions: (sheet) => {}
}
/**
 * Default write file excel 
 * @param {object} data 
 * @param {object} column 
 * @param {callback} options 
 * @returns 
 */
export function defaultExcel(data, column, options = excelOptions){
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(options.sheetName); // เพื่มชีท และตั้งชื่อชีท

    // ตั้งชื่อ cloumn และ key เพื่อให้สอดคล้องกับข้อมูล
    sheet.columns = column;  
    // เพิ่มข้อมูลใน Sheet
    sheet.addRows(data);

    const headerRow = sheet.getRow(1);
    headerRow.font = options.font;
    headerRow.alignment = options.alignment;
    // ตรวจสอบว่ามีฟังก์ชัน customActions หรือไม่
    if (options.customActions(sheet)) {
        options.customActions(sheet); // ส่ง sheet เพื่อให้ปรับแต่งตามที่กำหนด
    }
   
    // คำนวณความยาวของข้อมูลในแต่ละคอลัมน์ และปรับความกว้าง
    sheet.columns.forEach((column) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
            const columnLength = cell.value ? cell.value.toString().length : 10; // คำนวณความยาวของข้อมูลในเซลล์
            if (columnLength > maxLength) {
            maxLength = columnLength;
            }
        });
        column.width = maxLength + options.extraWidth; // เพิ่มความกว้างอีกเล็กน้อยเพื่อไม่ให้ข้อมูลชนขอบ
    });
    return workbook;
}

export const writeOpt = {
    sheetName: 1,
    startRow: 1,
    startCol: 1,
    customSheet: (workbook) => {}
}
export async function writeExcelTemp(file, opt = writeOpt){
    var workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file);
        if (opt.customSheet(workbook)) { // read file custom option
            opt.customSheet(workbook); 
        }
    return workbook;
}



export const readInOpt = {
    maxReadRow : 500,
    startRow : 1,
    startCol : 1, // A
    endCol   : 1, // A
    sheetName: 1,
    headerName: [],
    skipRow: 0,
    customSheet: (workbook) => {}
}
/**
 * Read file by input element or arraybuffer
 * @param {object} file 
 * @returns 
 */
export async function readInput (file, opt = readInOpt){
    var data = [];
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file);

    // console.log(opt.customSheet(workbook));
    if (opt.customSheet(workbook)) { // read file custom option
        console.log('read custom');
        
        data = opt.customSheet(workbook); 
    }else if (opt.headerName.length > 0){ // read file by header name
        console.log('read header');
        
        const worksheet = opt.sheetName == 1 ? workbook.worksheets[0] :workbook.getWorksheet(opt.sheetName);
        worksheet.eachRow((row, rowNumber) => {
            // console.log(opt.startCol, opt.startRow, opt.endCol, row.values);
            if (rowNumber < opt.startRow) return;
            if (rowNumber > opt.maxReadRow) return;
            for (let colIndex = opt.startCol; colIndex <= opt.endCol; colIndex++) {
                if(row.values[1] != '' && typeof row.values[1] == 'number'){
                    const index = row.values[1]-1;
                    if (!data[index]) {
                        data[index] = {};
                    }
                    data[index][opt.headerName[colIndex]] = row.values[colIndex] || '';
                }
            }
            // console.log(data);
        });
    }else{ // read file all data in sheet
        console.log('read default');
        
        const worksheet = opt.sheetName == 1 ? workbook.worksheets[0] :workbook.getWorksheet(opt.sheetName);
        worksheet.eachRow((row, rowNumber) => {
            // console.log(rowNumber);
            
            if (rowNumber < opt.startRow) return;
            if (rowNumber > opt.maxReadRow) return;
            const rowIndex = opt.skipRow > 0 ? rowNumber - (opt.skipRow+1) : rowNumber -1;
            if (opt.skipRow > 0 && rowNumber <= opt.skipRow) return;
            if (!data[rowIndex]) data[rowIndex] = {};
            
            // console.log(rowIndex, opt.skipRow, rowNumber);
            // if (!data[rowNumber]) data[rowNumber] = {};
            if(opt.endCol == 1){
                row.eachCell(function (cell, colNumber) {
                    // console.log(cell.names.length, cell.names, cell);
                    // console.log('Cell ' + colNumber + ' = ' + cell.value);
                    // if (!data[rowIndex - 1]) data[rowIndex - 1] = {};
                    data[rowIndex][colNumber-1] = cell.value;
                });
            }else{
                let index = 0;
                for (let colIndex = opt.startCol; colIndex <= opt.endCol; colIndex++, index++) {
                    // const rowIndex = (rowNumber+opt.skipRow) - 1;
                    // if (!data[rowIndex - 1]) data[rowIndex - 1] = {};
                    data[rowIndex][index] = row.values[colIndex] || '';
                }
            }
        });
    }
    return data
}

/**
 * merge
 * @param {object} worksheet 
 * @param {number} row 
 * @param {number} col 
 * @param {number} range 
 * @param {string} data 
 */
export function mergeCell(worksheet, row, col, range, data){
    // console.log('data',data);
    
    const cell = worksheet.getCell(row, col);
    // console.log(cell);
    
    cell.value = data;
    worksheet.mergeCells(row, col, row, col + range);
    // worksheet.getCell(row, col).alignment = { horizontal: 'center', vertical: 'middle' };
}


/**
 * ฟังก์ชันที่ใช้ใส่สไตล์แบบ range
 * @param {object} worksheet 
 * @param {number} startCol '8'
 * @param {number} endCol '10'
 * @param {number} row '1'
 * @param {object} style 
 */
export function applyStyleToRange(worksheet, startCol, endCol, row, style) {
    // console.log('colper: ',percentCols);
    // console.log('row',row);
    
    for (let col = startCol; col <= endCol; col++) {
        // worksheet.getCell(`${String.fromCharCode(64 + col)}${row}`).style = style;
        const cell = worksheet.getCell(row, col);  // ใช้รูปแบบการระบุตำแหน่งเซลล์ที่ถูกต้อง
        const originalNumFmt = cell.numFmt;
        // ตั้งค่าสไตล์ใหม่
        // คัดลอกสไตล์แยกเพื่อป้องกันการแชร์สไตล์
        cell.style = JSON.parse(JSON.stringify(style));
        // cell.style = style;
         // นำฟอร์แมตตัวเลขเดิมกลับมาใช้
        cell.numFmt = originalNumFmt;
    }
    
}

/**
 * Set format in excel
 * @param {array} cols ['A','B','C']
 * @param {string} format '0.00%' OR '0'
 */
export function setFormat(worksheet, row, cols, format){
    cols.forEach((col) =>{
        const cell = worksheet.getCell(col+row);  
        console.log('cell:',cell ,'row:', row, 'col:', col);
        cell.numFmt = format;
    });
}
    
/**
 * ฟังก์ชันแปลงตัวอักษรคอลัมน์เป็นตัวเลขคอลัมน์
 * @param {string} col 
 * @returns 
 */
export function colToNumber(col) {
    let number = 0;
    for (let i = 0; i < col.length; i++) {
        number = number * 26 + (col.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
    }
    return number;
}

/**
 * 
 * @param {number} num 
 * @returns 
 */
export function numberToCol(num) {  
    if (typeof num !== 'number' || num <= 0 || !Number.isInteger(num)) {
        return undefined; // คืนค่า undefined หาก num ไม่ถูกต้อง
    }
    
    let s = '', t;
    while (num > 0) {
        t = (num - 1) % 26;
        s = String.fromCharCode(65 + t) + s; // แปลงตัวเลขเป็นตัวอักษร
        num = Math.floor((num - t) / 26); // ลดค่าของ num
    }
    return s || undefined;
}

/**
* fill style
* @param {string} fgColor  argb color
* @param {string} type 
* @param {string} pattern 
* @returns 
*/
export const fill = (fgColor, type='pattern', pattern='solid') => {
    return {
        type: type,
        pattern: pattern,
        fgColor: { argb: fgColor }
    }
}
/**
 * Border style
 * @param {string} style thin, dotted, dashDot, hair, dashDotDot, slantDashDot, mediumDashed, mediumDashDotDot, mediumDashDot, medium, double, thick 
 * @returns 
 */
export const border = (style='thin') => {
    return {
        top: {style:style},
        left: {style:style},
        bottom: {style:style},
        right: {style:style}
    }
}
/**
 * Text alignment
 * @param {string} horizontal left, center, right, fill, justify, centerContinuous, distributed
 * @param {string} vertical top, middle, bottom, distributed, justify
 * @param {string} rotation 0 90 -1 -90 vertical หมุนข้อความ
 * @param {boolean} wrapText true or false
 * @param {boolean} shrinkToFit true or false
 * @param {number} readingOrder 0: ltr, 1: rtl 
 * @param {number} indent 0 1 2 3  ย่อหน้า horizontal = left or right
 * @returns 
 */
export const alignment = (horizontal='left', vertical='bottom', rotation='0', wrapText=false, shrinkToFit=false, indent=0, readingOrder='ltr' ) => {
    return {
        horizontal: horizontal,
        vertical: vertical,
        textRotation: rotation,
        wrapText: wrapText,
        shrinkToFit: shrinkToFit,
        readingOrder: readingOrder,
        indent: indent
    }
};

// /**
//  * Column payment style
//  */
// const apPayment = {
//     fill:{
//         type: 'pattern',
//         pattern: 'solid',
//         fgColor: { argb: 'fff9ffc4'}
//     }
// };

// const totalStyle = {
//     font: { 
//         bold: true, 
//         color: { argb: 'FFFFFFFF' }  // ตัวอักษรสีขาว (Hex: #FFFFFF)
//     },
//     fill: {
//         type: 'pattern',
//         pattern: 'solid',
//         fgColor: { argb: 'FFE67E22' }  // พื้นหลังสีส้ม (Hex: #e67e22)
//     }
// };

// const headStyle = {
//     font: {
//         bold: true,
//         color: { argb: 'FFFFFFFF' } 
//     },
//     fill:{
//         type: 'pattern',
//         pattern: 'solid',
//         fgColor: { argb: 'FFA6A6A6' } 
//     },   
//     border:{
//         top: {style:'medium'},
//         left: {style:'medium'},
//         bottom: {style:'medium'},
//         right: {style:'medium'}
//     },
//     alignment: { horizontal: 'center', vertical: 'middle' }
// }

/*
// Iterate over all sheets
// Note: workbook.worksheets.forEach will still work but this is better
workbook.eachSheet(function(worksheet, sheetId) {
    // ...
  });
  
  // fetch sheet by name
  const worksheet = workbook.getWorksheet('My Sheet');
  
  // fetch sheet by id
  // INFO: Be careful when using it!
  // It tries to access to `worksheet.id` field. Sometimes (really very often) workbook has worksheets with id not starting from 1.
  // For instance It happens when any worksheet has been deleted.
  // It's much more safety when you assume that ids are random. And stop to use this function.
  // If you need to access all worksheets in a loop please look to the next example.
  const worksheet = workbook.getWorksheet(1);
  
  // access by `worksheets` array:
  workbook.worksheets[0]; //the first one;

*/



// export async function getFileExcelJS(path){
//     // const workbook = new ExcelJS.Workbook();
//     // // สร้าง Stream จากไฟล์
//     // // ใช้ stream เพื่อโหลดไฟล์ Excel
//     // await workbook.xlsx.readFile(path);
//     // console.log(workbook);
    
//     // return workbook;
// }

// export const excelOptions = {
    
//     customActions: (sheet) => {
            
//         // Merge cells
//         sheet.mergeCells('A1:B1');
//         sheet.mergeCells('C2:D2');

//         // ใส่กรอบให้ cell
//         const cellA1 = sheet.getCell('A1');
//         cellA1.border = {
//             top: { style: 'thin' },
//             left: { style: 'thin' },
//             bottom: { style: 'thin' },
//             right: { style: 'thin' },
//         };

//         // ใส่สีพื้นหลัง
//         cellA1.fill = {
//             type: 'pattern',
//             pattern: 'solid',
//             fgColor: { argb: 'FFFF00' }, // สีเหลือง
//         };

//         // ตั้งค่า alignment ของ cell
//         cellA1.alignment = { vertical: 'middle', horizontal: 'center' };

//         // ใส่กรอบและสีให้ C2:D2
//         const mergedRange = sheet.getCell('C2');
//         mergedRange.border = {
//             top: { style: 'medium' },
//             left: { style: 'medium' },
//             bottom: { style: 'medium' },
//             right: { style: 'medium' },
//         };
//         mergedRange.fill = {
//             type: 'pattern',
//             pattern: 'solid',
//             fgColor: { argb: 'FF0000' }, // สีแดง
//         };
//     },
// };