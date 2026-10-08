// D:\Project\src\form\assets\script\feform\FE-DOC\excelConverter.js
import { host } from '../../utils';

/**
 * แปลงไฟล์ Excel (File / Blob) เป็น PDF ArrayBuffer ผ่าน PHP Backend
 * @param {Blob|File} excelFile
 * @param {string} originalName
 * @returns {Promise<ArrayBuffer>}
 */
export async function convertExcelToPdfBuffer(
    excelFile,
    originalName = 'document.xlsx',
) {
    const formData = new FormData();
    formData.append('file', excelFile, originalName);

    const response = await fetch(
        host + 'feform/FE-DOC/form/ConvertExcelToPdf',
        {
            method: 'POST',
            body: formData,
        },
    );

    if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(
            errJson.message ||
                `แปลงไฟล์ Excel เป็น PDF ล้มเหลว (HTTP ${response.status})`,
        );
    }

    return await response.arrayBuffer();
}
