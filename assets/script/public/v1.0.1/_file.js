/**
 * Manage file upload and download functionality
 * @module _file
 * @description This file is used to manage file upload and download functionality.
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @since  2025-05-01
 * @note This file includes functions to handle file upload, file validation.
 * @requires jQuery npm install jquery
 * @requires _utils
 * @requires _jFuntion
 * @version 1.0.1
 */

import { showLoader } from "../utils.js";
import { ajaxOptionsLoad, getData, showMessage } from "./jFuntion.js";

export const fileImgFormat   = { extension : ['.jpg', '.jpeg', '.png', '.gif'], msg: 'Only Image files are allowed.', layoutMsg: 'toast-end' };
export const filePdfFormat   = { extension : ['.pdf'], msg: 'ไฟล์ไม่ถูกต้อง กรุณาแนบไฟล์ PDF เท่านั้น', layoutMsg: 'toast-end' };
export const fileWordFormat  = { extension : ['.docx', '.doc'], msg: 'ไฟล์ไม่ถูกต้อง กรุณาแนบไฟล์ PDF เท่านั้น', layoutMsg: 'toast-end' };
export const fileExcelFormat = { extension : ['.xlsx', '.xls'], msg: 'ไฟล์ไม่ถูกต้อง กรุณาแนบไฟล์ PDF เท่านั้น', layoutMsg: 'toast-end' };
export const filePowerFormat = { extension : ['.pptx', '.ppt'], msg: 'ไฟล์ไม่ถูกต้อง กรุณาแนบไฟล์ PDF เท่านั้น', layoutMsg: 'toast-end' };

export const fileFormats = {
    pdf  : filePdfFormat,
    excel : fileExcelFormat,
    word : fileWordFormat,
    powerpoint : filePowerFormat,
    image: fileImgFormat
};

/**
 * Check file format
 * @param {object} e $(this)
 * @param {string} format .pdf  .xlsx or ['.jpg', '.jpeg', '.png', '.gif']
 * @param {string} msg ไฟล์ไม่ถูกต้อง กรุณาแนบไฟล์ PDF เท่านั้น
 */
export function checkFileFormat(e, format, msg, layoutMsg = 'toast-end'){
    // const file = e.val();
    // if (file && !file.toLowerCase().endsWith(format)) {
    //     e.val('');
    //     showMessage(msg);
    // } else if (/[ก-๙]/.test(file)) {
    //     e.val('');
    //     showMessage('ชื่อไฟล์ต้องเป็นภาษาอังกฤษเท่านั้น', 'warning');
    // } 
    const file = e.val();
    // console.log(file, format);
    
    if (!file) return;
    // console.log('file');
    
    const isValidFormat = Array.isArray(format)
        ? format.some(ext => file.toLowerCase().endsWith(ext))
        : file.toLowerCase().endsWith(format); // รองรับกรณี format เป็น string แบบเดิม
    
    // console.log(isValidFormat);
    
    if (!isValidFormat) {
        e.val('');
        showMessage(msg, 'warning', layoutMsg);
        return false;
    }
    if (/[ก-๙]/.test(file) && (format === '.pdf' || (Array.isArray(format) && format.includes('.pdf')))) {
        e.val('');
        showMessage('ชื่อไฟล์ต้องเป็นภาษาอังกฤษเท่านั้น', 'warning', layoutMsg);
        return false;
    }
    return true;
}

export async function checkFileType(filename, format, msg, layoutMsg = 'toast-end'){
    const isValidFormat = Array.isArray(format)
        ? format.some(ext => filename.toLowerCase().endsWith(ext))
        : filename.toLowerCase().endsWith(format); // รองรับกรณี format เป็น string แบบเดิม
    
        // console.log(/[ก-๙]/.test(filename));
        // console.log(isValidFormat);
        
    if (/[ก-๙]/.test(filename) || !isValidFormat) {
        showMessage(msg, 'warning', layoutMsg);
        return false;
    }
    return true;
    
}

/**
 * Download all file in path
 * @param {string} pathFile e.g. 'assets/file/template/'
 * @param {string} filename e.g. 'chemical Template.xlsx'
 */
export async function downloadInPath(pathFile, filename = ''){
    const File = await getfileInPath(pathFile, filename);
    File.forEach(async file => {
        console.log(`Processing file: ${file.filename}`);
        const binaryData = atob(file.content); // แปลง Base64 เป็น Binary
        const buffer = new Uint8Array(binaryData.length);

        for (let i = 0; i < binaryData.length; i++) {
            buffer[i] = binaryData.charCodeAt(i);
        }
        downloadExcelFile(buffer, file.filename);
    });
}

/**
 * Download one file
 * @param {string} filePath e.g. 'assets/file/template/'
 * @param {string} fileName e.g. 'chemical Template.xlsx'
 */
export async function downloadExcel(filePath, fileName){
    const file = await getArrayBufferFile(filePath, fileName);
    downloadExcelFile(file, fileName);
}

/**
 * Download file
 * @param {object} fileBuffer 
 * @param {string} fileName e.g. Template.xlxs
 */
export function downloadExcelFile(fileBuffer, fileName = 'Template.xlxs'){
    const blob = new Blob([fileBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
}

/**
 * Get file as array buffer
 * @param {string} filePath e.g. 'assets/file/template/'
 * @param {string} fileName e.g. 'chemical Template.xlsx'
 * @returns 
 */
export async function getArrayBufferFile(filePath, fileName){
    await getData({
        ...ajaxOptionsLoad,
        url: `${process.env.APP_ENV}/authen/getArrayBufferFile/`,
        data: {
            filePath: filePath,
            filename: fileName
        },
        xhrFields: {
            responseType: 'arraybuffer' // ดึงข้อมูลเป็น binary เพื่อให้ ExcelJS สามารถอ่านได้
        },
        complete: function(xhr){
            showLoader(false);
        }
    });
}

/**
 * Get all file in path
 * @param {string} path     e.g. 'assets/file/master/chemical
 * @param {string} fileName e.g. '03_QES_Rev.B_11.12.2024.xlsx'
 * @returns 
 * await getfileInPath('assets/file/master/chemical'); แบบทุกไฟล์ใน path
 * await getfileInPath('assets/file/master/chemical','03_QES_Rev.B_11.12.2024.xlsx'); แบบเฉพาะไฟล์นั้นๆ
 */
export async function getfileInPath(path, fileName = ''){
    await getData({
        ...ajaxOptionsLoad,
        url: `${process.env.APP_ENV}/authen/getfileInPath/`,
        data:{
            path:path,
            fileName:fileName
        },
        xhrFields: {
            responseType: 'arraybuffer' // ดึงข้อมูลเป็น binary เพื่อให้ ExcelJS สามารถอ่านได้
        },
        success: function (res) {
            // console.log(res);
            // console.log(typeof res); 
            if(Array.isArray(res)){
                res.forEach(async file => {
                    console.log(`Processing file: ${file.filename}`);

                    const binaryData = atob(file.content); // แปลง Base64 เป็น Binary
                    const buffer = new Uint8Array(binaryData.length);
            
                    for (let i = 0; i < binaryData.length; i++) {
                        buffer[i] = binaryData.charCodeAt(i);
                    }
                    file.buffer = buffer; // เอา buffer ไปใช้งานต่อ เขียนหรืออ่าน
                });    
            }  
            resolve(res);
        },
    });
}
