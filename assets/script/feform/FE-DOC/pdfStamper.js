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
        if (formKeys.PATH) {
            nestJsData.append('PATH', `${formKeys.PATH}`);
        }

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
/**
 * แปลงวันที่ DD/MM/YYYY ให้เป็นรูปแบบ DD Mon YYYY (เช่น 06 Oct 2026)
 */
function formatStampDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.trim().split('/');
    if (parts.length < 3) return dateStr;

    const months = [
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
    const day = parts[0].padStart(2, '0');
    const monthIdx = parseInt(parts[1], 10) - 1;
    const year = parts[2];

    const mon = months[monthIdx] || parts[1];
    return `${day} ${mon} ${year}`;
}

/**
 * วาดตรายางลง PDF โดยอิงตามรายการ logs ที่อนุมัติจริง เรียงจาก ขวา ไป ซ้าย
 */
export async function stampPdfDocument(pdfSource, logs = [], options = {}) {
    const {
        colWidth = 58, // ปรับลดความกว้างช่องลง เพื่อให้ระยะห่างระหว่างดวงตราน้อยลงตามต้องการ
        boxHeight = 65,
        marginRight = 20,
        marginTop = 18,
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

    // 1. กรอง Requester (Step 00 หรือ CSTART == 1) ออก
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
    const stampRadius = 26; // ขนาดรัศมีวงกลมคงเดิมที่ 26 pt (เส้นผ่านศูนย์กลาง 52 pt)
    const stampColor = rgb(0.88, 0.15, 0.15); // สีแดงตรายางมาตรฐาน

    // วนลูปวาดตรายางผู้อนุมัติ (เรียงจากขวาไปซ้าย)
    approverLogs.forEach((app, idx) => {
        const cellX = width - marginRight - (idx + 1) * colWidth;
        const cellY = startY - boxHeight;

        const centerX = cellX + colWidth / 2;
        const centerY = cellY + boxHeight / 2;

        // --- 1. วงกลมหลักด้านนอก ---
        firstPage.drawEllipse({
            x: centerX,
            y: centerY,
            xScale: stampRadius,
            yScale: stampRadius,
            borderColor: stampColor,
            borderWidth: 1.2,
            opacity: 0.95,
        });

        // --- 2. เส้นขีดแนวนอนด้านใน 2 เส้น (บน / ล่าง) ---
        // คำนวณความกว้างเส้นให้อยู่พอดีภายในขอบวงกลมตามสูตร x = sqrt(r^2 - y^2)
        const lineY1 = centerY + 8; // เส้นแบ่งด้านบน
        const dy1 = lineY1 - centerY;
        const lineHalfW1 =
            Math.sqrt(Math.max(0, stampRadius * stampRadius - dy1 * dy1)) - 0.8;

        firstPage.drawLine({
            start: { x: centerX - lineHalfW1, y: lineY1 },
            end: { x: centerX + lineHalfW1, y: lineY1 },
            thickness: 0.8,
            color: stampColor,
            opacity: 0.9,
        });

        const lineY2 = centerY - 8; // เส้นแบ่งด้านล่าง
        const dy2 = lineY2 - centerY;
        const lineHalfW2 =
            Math.sqrt(Math.max(0, stampRadius * stampRadius - dy2 * dy2)) - 0.8;

        firstPage.drawLine({
            start: { x: centerX - lineHalfW2, y: lineY2 },
            end: { x: centerX + lineHalfW2, y: lineY2 },
            thickness: 0.8,
            color: stampColor,
            opacity: 0.9,
        });

        // --- 3. ข้อความส่วนบน: CHECKED / APPROVED ---
        const topTitle = 'CHECKED';
        const topTitleW = fontBold.widthOfTextAtSize(topTitle, 7);
        firstPage.drawText(topTitle, {
            x: centerX - topTitleW / 2,
            y: centerY + 13,
            size: 7,
            font: fontBold,
            color: stampColor,
        });

        // --- 4. ข้อความตรงกลางบรรทัดแรก: AMEC ---
        const orgText = 'AMEC';
        const orgW = fontBold.widthOfTextAtSize(orgText, 8.5);
        firstPage.drawText(orgText, {
            x: centerX - orgW / 2,
            y: centerY + 0.5,
            size: 8.5,
            font: fontBold,
            color: stampColor,
        });

        // --- 5. ข้อความตรงกลางบรรทัดที่สอง: วันที่ (เช่น 06 Oct 2026) ---
        const rawDate = (app.DAPVDATE_STR || '').trim();
        const dateText = formatStampDate(rawDate);
        const dateW = fontRegular.widthOfTextAtSize(dateText, 6.2);
        firstPage.drawText(dateText, {
            x: centerX - dateW / 2,
            y: centerY - 6.5,
            size: 6.2,
            font: fontRegular,
            color: stampColor,
        });

        // --- 6. ข้อความส่วนล่าง: ชื่อ/นามสกุลผู้อนุมัติ ---
        const empCode = app.SEMPNO || app.VREALAPV || app.EMPNO || '';
        const rawName = app.SNAME || app.VREALAPV || '';
        const displayName = getDisplayStampName(empCode, rawName).toUpperCase();

        const maxTextWidth = stampRadius * 1.55;
        let fontSize = 7;
        let nameW = fontBold.widthOfTextAtSize(displayName, fontSize);

        while (nameW > maxTextWidth && fontSize > 4.5) {
            fontSize -= 0.5;
            nameW = fontBold.widthOfTextAtSize(displayName, fontSize);
        }

        firstPage.drawText(displayName, {
            x: centerX - nameW / 2,
            y: centerY - 16.5,
            size: fontSize,
            font: fontBold,
            color: stampColor,
        });
    });

    return await pdfDoc.save();
}
