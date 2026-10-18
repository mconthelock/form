// D:\Project\src\form\assets\script\feform\FE-DOC\pdfStamper.js
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { getFile, getFileForm, deleteFile } from '@amec/webasset/api/file';
import { uploadDocFiles } from './data';
import { host } from '../../utils';

/**
 * Reusable Library: ฟังก์ชันสำหรับประทับตรายาง (Stamp) ลงบนหน้าแรกของไฟล์ PDF
 *
 * @param {ArrayBuffer|Uint8Array|Blob|File} pdfSource - ข้อมูลไฟล์ PDF เดิม
 * @param {Array} steps - ลำดับขั้นตอนทั้งหมดใน Flow [{CSTEPNO, CEXTDATA, POSITION_TITLE, ...}]
 * @param {Array} logs - ประวัติการอนุมัติที่ Approve แล้ว [{CSTEPNO, CEXTDATA, SNAME, DAPVDATE_STR, ...}]
 * @param {Object} options - ตัวเลือกการแสดงผล
 * @param {boolean} options.hasBorder - ใส่กรอบสี่เหลี่ยมครอบตารางหรือไม่ (default: false = ไม่มีกรอบ มีแค่วงกลมตรายาง)
 * @param {number} options.colWidth - ความกว้างต่อช่อง (default: 68)
 * @param {number} options.titleHeight - ความสูงช่องชื่อตำแหน่ง (default: 16)
 * @param {number} options.boxHeight - ความสูงช่องประทับตรายาง (default: 56)
 * @param {number} options.marginRight - ระยะห่างจากขอบขวาของกระดาษ (default: 20)
 * @param {number} options.marginTop - ระยะห่างจากขอบบนของกระดาษ (default: 20)
 * @returns {Promise<Uint8Array>} pdfBytes ของไฟล์ที่ Stamp เรียบร้อยแล้ว
 */
export async function stampPdfDocument(
    pdfSource,
    steps = [],
    logs = [],
    options = {},
) {
    const {
        hasBorder = false,
        colWidth = 68,
        boxHeight = 56,
        marginRight = 20,
        marginTop = 20,
    } = options;

    let buffer = pdfSource;
    if (
        pdfSource instanceof Blob ||
        (typeof File !== 'undefined' && pdfSource instanceof File)
    ) {
        buffer = await pdfSource.arrayBuffer();
    }

    const pdfDoc = await PDFDocument.load(buffer);
    const pages = pdfDoc.getPages();
    if (pages.length === 0) return await pdfDoc.save();

    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const stepCount = steps.length;
    if (stepCount === 0) return await pdfDoc.save();

    const totalTableW = colWidth * stepCount;
    const startX = width - totalTableW - marginRight;
    const startY = height - marginTop;

    const appMap = {};
    (logs || []).forEach((l) => {
        const ext = (l.CEXTDATA || '').trim();
        const stepNo = (l.CSTEPNO || '').trim();
        if (ext) appMap[ext] = l;
        if (stepNo) appMap[stepNo] = l;
    });

    steps.forEach((st, idx) => {
        // 🟢 แก้ไข Syntax error เติมเครื่องหมายลบ
        const colIndexFromRight = stepCount - 1 - idx;
        const cellX = startX + colIndexFromRight * colWidth;
        const cellY = startY - boxHeight;

        // วาดกรอบครอบเฉพาะเมื่อ hasBorder = true
        if (hasBorder) {
            firstPage.drawRectangle({
                x: cellX,
                y: cellY,
                width: colWidth,
                height: boxHeight,
                borderColor: rgb(0.3, 0.3, 0.3),
                borderWidth: 0.8,
            });
        }

        // วาดเฉพาะตรายางสีแดงเมื่อมีคน Approve แล้ว
        const extKey = (st.CEXTDATA || '').trim();
        const stepKey = (st.CSTEPNO || '').trim();
        const app = appMap[extKey] || appMap[stepKey];

        if (app && app.DAPVDATE_STR) {
            const centerX = cellX + colWidth / 2;
            const centerY = cellY + boxHeight / 2;

            // วงกลมสีแดง
            firstPage.drawEllipse({
                x: centerX,
                y: centerY,
                xScale: 21,
                yScale: 21,
                borderColor: rgb(0.85, 0.1, 0.1),
                borderWidth: 1.2,
                opacity: 0.95,
            });

            // AMEC
            const orgText = 'AMEC';
            const orgW = fontBold.widthOfTextAtSize(orgText, 7.5);
            firstPage.drawText(orgText, {
                x: centerX - orgW / 2,
                y: centerY + 8,
                size: 7.5,
                font: fontBold,
                color: rgb(0.85, 0.1, 0.1),
            });

            // วันที่
            const dateText = (app.DAPVDATE_STR || '').trim();
            const dateW = fontRegular.widthOfTextAtSize(dateText, 6.5);
            firstPage.drawText(dateText, {
                x: centerX - dateW / 2,
                y: centerY - 1.5,
                size: 6.5,
                font: fontRegular,
                color: rgb(0.85, 0.1, 0.1),
            });

            // ชื่อ
            const fullName = (app.SNAME || '').trim();
            const firstName = fullName.split(' ')[0] || fullName;
            const nameW = fontBold.widthOfTextAtSize(firstName, 7);
            firstPage.drawText(firstName, {
                x: centerX - nameW / 2,
                y: centerY - 11,
                size: 7,
                font: fontBold,
                color: rgb(0.85, 0.1, 0.1),
            });
        }
    });

    return await pdfDoc.save();
}

/**
 * ฟังก์ชันหลัก: ค้นหาไฟล์แนบของฟอร์มทั้งหมด -> Stamp ตรายาง -> แทนที่ไฟล์เดิมบนระบบ
 *
 * @param {Object} formKeys - คีย์สำหรับค้นหาไฟล์ { NFRMNO, VORGNO, CYEAR, CYEAR2, NRUNNO, EMPNO, FORM_TYPE }
 * @param {Array} steps - ลำดับขั้นตอน Approval Steps
 * @param {Array} logs - ประวัติการอนุมัติจริงจากระบบ
 * @param {Object} stampOptions - ออปชันสำหรับตรายาง เช่น { hasBorder: false }
 */
export async function stampFormAttachedFiles(
    formKeys,
    steps = [],
    logs = [],
    stampOptions = { hasBorder: false },
) {
    if (!formKeys?.NRUNNO) {
        throw new Error('ไม่พบข้อมูลเอกสาร (NRUNNO)');
    }

    if (!steps || steps.length === 0) {
        throw new Error('ไม่พบข้อมูล Step สำหรับประทับตรา');
    }

    // 🟢 ถ้ายังไม่มีประวัติการอนุมัติจริงในระบบ ให้หยุดทันที (มีประวัติจริงค่อย Stamp)
    if (!logs || logs.length === 0) {
        throw new Error(
            'ยังไม่มีประวัติการอนุมัติในระบบ ไม่สามารถประทับตราได้',
        );
    }

    // 1. ดึงรายการไฟล์ทั้งหมดของฟอร์มผ่าน getFileForm
    const fileFormRes = await getFileForm({
        NFRMNO: Number(formKeys.NFRMNO),
        VORGNO: String(formKeys.VORGNO),
        CYEAR: String(formKeys.CYEAR),
        CYEAR2: String(formKeys.CYEAR2),
        NRUNNO: Number(formKeys.NRUNNO),
        FORM_TYPE: formKeys.FORM_TYPE || 'FE',
    });

    let files = [];
    if (Array.isArray(fileFormRes?.data)) {
        files = fileFormRes.data;
    } else if (fileFormRes?.data) {
        files = [fileFormRes.data];
    }

    if (files.length === 0) {
        throw new Error('ไม่พบไฟล์แนบสำหรับประทับตรา');
    }

    // 2. วนลูปประทับตราแต่ละไฟล์และอัปเดตไฟล์ลงระบบ
    for (const f of files) {
        const fileName = f.FILE_ONAME || f.FILE_FNAME || '';
        if (!fileName.toLowerCase().endsWith('.pdf')) continue;

        // ดึงไฟล์เดิมลงมาเป็น Blob
        const fileObj = await getFile({
            baseDir: (f.FILE_PATH || '').replace(/\\/g, '/'),
            storedName: f.FILE_FNAME,
            originalName: f.FILE_ONAME,
            mode: 'open',
        });

        // Stamp ตรายางลงเนื้อ PDF โดยใช้ logs จริงเท่านั้น
        const stampedBytes = await stampPdfDocument(
            fileObj,
            steps,
            logs,
            stampOptions,
        );

        // ลบไฟล์เดิมออกจากระบบ
        let fullFilePath = (
            (f.FILE_PATH || '').replace(/\\/g, '/') +
            '/' +
            f.FILE_FNAME
        ).replace(/\/+/g, '/');
        if (!fullFilePath.startsWith('//')) fullFilePath = '/' + fullFilePath;

        try {
            await deleteFile(fullFilePath);
        } catch (delApiErr) {
            console.warn('Delete physical file warning:', delApiErr);
        }

        try {
            await $.ajax({
                url: host + 'feform/FE-DOC/form/DeleteFile',
                type: 'POST',
                data: { id: f.FILE_ID },
                dataType: 'json',
            });
        } catch (delDbErr) {
            console.warn('Delete DB file record warning:', delDbErr);
        }

        // อัปโหลดไฟล์ประทับตราใหม่เข้า Storage
        let nestJsData = new FormData();
        nestJsData.append('NFRMNO', formKeys.NFRMNO);
        nestJsData.append('VORGNO', formKeys.VORGNO);
        nestJsData.append('CYEAR', formKeys.CYEAR);
        nestJsData.append('CYEAR2', formKeys.CYEAR2);
        nestJsData.append('NRUNNO', formKeys.NRUNNO);
        nestJsData.append('CREATEBY', formKeys.EMPNO);
        nestJsData.append('FORM_TYPE', formKeys.FORM_TYPE || 'FE');

        const stampedBlob = new Blob([stampedBytes], {
            type: 'application/pdf',
        });
        nestJsData.append('files', stampedBlob, f.FILE_ONAME);

        const resUpload = await uploadDocFiles(nestJsData);
        if (!resUpload || !resUpload.status) {
            throw new Error(
                resUpload?.message ||
                    'บันทึกไฟล์ที่มีตรายางเข้า Storage ไม่สำเร็จ',
            );
        }
    }

    return true;
}
