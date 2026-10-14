// D:\Project\src\form\assets\script\feform\FE-DOC\pdfStamper.js
import $ from 'jquery';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { getFile, getFileForm, deleteFile } from '@amec/webasset/api/file';
import { uploadDocFiles } from './data';
import { host } from '../../utils';

/**
 * ฟังก์ชันช่วยตัดชื่อผู้อนุมัติ:
 * - รหัสพนักงานขึ้นต้นด้วย J (ญี่ปุ่น) -> ใช้นามสกุล (คำสุดท้าย)
 * - รหัสพนักงานคนไทย -> ใช้ชื่อตัว (คำแรก)
 */
function getDisplayStampName(empNo, rawName) {
    const fullName = (rawName || '').trim();
    if (!fullName) return '';

    // ตัดช่องว่างหลายตัวให้เหลือตัวเดียว และแยกเป็นคำๆ
    const nameParts = fullName.split(/\s+/).filter(Boolean);
    if (nameParts.length === 0) return '';

    const emp = (empNo || '').toString().trim().toUpperCase();

    // กรณีพนักงานญี่ปุ่น (ขึ้นต้นด้วย J) -> ใช้นามสกุล (คำสุดท้าย)
    if (emp.startsWith('J')) {
        return nameParts[nameParts.length - 1];
    }

    // กรณีทั่วไป (พนักงานไทย) -> ใช้ชื่อจริง (คำแรก)
    return nameParts[0];
}

/**
 * ฟังก์ชันหลัก: ค้นหาไฟล์แนบของฟอร์มทั้งหมด -> Stamp ตรายางตาม logs -> แทนที่ไฟล์เดิมบนระบบ
 */
export async function stampFormAttachedFiles(
    formKeys,
    logs = [],
    stampOptions = {},
) {
    if (!formKeys?.NRUNNO) {
        throw new Error('ไม่พบข้อมูลเอกสาร (NRUNNO)');
    }
    if (!logs || logs.length === 0) {
        throw new Error('ยังไม่มีประวัติการอนุมัติในระบบ');
    }

    // 1. ดึงรายการไฟล์ทั้งหมดของฟอร์มนี้ผ่าน getFileForm
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

    // 2. วนลูปประทับตราและบันทึกไฟล์ใหม่แทนที่ไฟล์เดิม
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

        // ประทับตราลงเนื้อ PDF ตามประวัติจริง (เรียงจากขวาไปซ้าย)
        const stampedBytes = await stampPdfDocument(
            fileObj,
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
        } catch (e) {
            console.warn('deleteFile warning:', e);
        }

        try {
            await $.ajax({
                url: host + 'feform/FE-DOC/form/DeleteFile',
                type: 'POST',
                data: { id: f.FILE_ID },
                dataType: 'json',
            });
        } catch (e) {
            console.warn('Delete DB file warning:', e);
        }

        // อัปโหลดไฟล์ที่ประทับตราแล้วกลับเข้าสู่ Storage
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

/**
 * วาดตรายางลง PDF โดยอิงตามรายการ logs ที่อนุมัติจริง เรียงจาก ขวา ไป ซ้าย
 */
export async function stampPdfDocument(pdfSource, logs = [], options = {}) {
    const {
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
    if (pages.length === 0 || !logs || logs.length === 0) {
        return await pdfDoc.save();
    }

    // 1. กรองตัด Requester (Step 00 หรือ CSTART == 1) ออก ไม่นำมา Stamp
    const approverLogs = logs.filter((item) => {
        const ext = String(item.CEXTDATA || '').trim();
        const isStartStep = String(item.CSTART || '') === '1';
        return ext !== '00' && !isStartStep;
    });

    if (approverLogs.length === 0) {
        return await pdfDoc.save();
    }

    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const startY = height - marginTop;

    // วนลูปวาดเฉพาะผู้อนุมัติ (คนแรก idx = 0 อยู่ชิดขวา คนถัดไปขยับไปซ้าย)
    approverLogs.forEach((app, idx) => {
        const cellX = width - marginRight - (idx + 1) * colWidth;
        const cellY = startY - boxHeight;

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

        // ข้อความ AMEC
        const orgText = 'AMEC';
        const orgW = fontBold.widthOfTextAtSize(orgText, 7.5);
        firstPage.drawText(orgText, {
            x: centerX - orgW / 2,
            y: centerY + 8,
            size: 7.5,
            font: fontBold,
            color: rgb(0.85, 0.1, 0.1),
        });

        // วันที่อนุมัติจริง
        const dateText = (app.DAPVDATE_STR || '').trim();
        const dateW = fontRegular.widthOfTextAtSize(dateText, 6.5);
        firstPage.drawText(dateText, {
            x: centerX - dateW / 2,
            y: centerY - 1.5,
            size: 6.5,
            font: fontRegular,
            color: rgb(0.85, 0.1, 0.1),
        });

        // 2. ดึงชื่อ/นามสกุล ตามเงื่อนไขรหัสพนักงาน (ถ้าขึ้นต้นด้วย J ใช้นามสกุล)
        const empCode = app.SEMPNO || app.VREALAPV || app.EMPNO || '';
        const rawName = app.SNAME || app.VREALAPV || '';
        const displayName = getDisplayStampName(empCode, rawName);

        const nameW = fontBold.widthOfTextAtSize(displayName, 7);
        firstPage.drawText(displayName, {
            x: centerX - nameW / 2,
            y: centerY - 11,
            size: 7,
            font: fontBold,
            color: rgb(0.85, 0.1, 0.1),
        });
    });

    return await pdfDoc.save();
}
