// D:\Project\src\form\assets\script\feform\FE-DOC\pdfStamper.js
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

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

        // 🟢 เอาการวาดชื่อตำแหน่งออกไปทั้งหมด (ไม่มี REPORTER / ตำแหน่งแล้ว)

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
