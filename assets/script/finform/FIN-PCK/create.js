import { showLoader } from '@amec/webasset/preloader';
import { readInput } from '@amec/webasset/excel';
import {
    filterFormData,
    getAllAttr,
    logFormData,
    ordinalIndicator,
    removeClassError,
    requiredForm,
    setRound,
    showErrorMessage,
    showMessage,
} from '@amec/webasset/utils';
import { getLocMstData } from './dataloc';
import { createpck } from './data';

$(async function () {
    $(document).on('click', '#btnRequest', async function () {
        showLoader();
        try {
            if (!(await requiredForm('#frmmain'))) return;
            const fileInput = $('#excelFile')[0];
            const file = fileInput.files[0];
            const arrayBuffer = await file.arrayBuffer();
            const exceldata = await readInput(arrayBuffer, {
                readDefault: true,
                startRow: 6,
            });
            const dataload = await prepareData(exceldata);
            const formInfo = $('.form-info');
            const reqby = $('.apv-data');
            const currentFormData = {
                NFRMNO: Number(formInfo.attr('nfrmno')) || 0,
                VORGNO: formInfo.attr('vorgno') || '',
                CYEAR: formInfo.attr('cyear') || '',
                REQBY: reqby.attr('empno') || '',
                INPUTBY: '21001',
                REMARK: '',
            };
            const payload = {
                formData: currentFormData,
                groupedData: dataload,
            };
            console.log(payload);
            const res = await createpck(payload);
            if (res.status) {
                showLoader({ show: false });
                showMessage(res.message, 'success');
            }
        } catch (err) {
            // console.error(err);
            showErrorMessage(err);
        } finally {
            showLoader({ show: false });
        }
    });
});

// async function prepareData(excelData) {
//     const locmstdata = await getLocMstData({});
//     const empLoopup = {};
//     locmstdata.forEach((loc) => {
//         const empNo = loc.INC?.EMPINFO?.SEMPNO || '';
//         empLookup[loc.LOCCODE] = empNo;
//     });
//     const formatDate = (dateValue) => {
//         if (!dateValue) return '';
//         try {
//             const d = new Date(dateValue);
//             if (!isNaN(d.getTime())) {
//                 const year = d.getFullYear();
//                 const month = String(d.getMonth() + 1).padStart(2, '0');
//                 const day = String(d.getDate()).padStart(2, '0');
//                 return `${year}-${month}-${day}`;
//             }
//         } catch (error) {}
//         return String(dateValue);
//     };
//     const groupedResult = {};
//     excelData.forEach((row) => {
//         // สมมติว่า keys จาก Excel ถูกแปลงมาเป็นชื่อเหล่านี้แล้ว
//         // (อาจจะต้องเช็คชื่อ Field ของ row อีกทีให้ตรงกับ Library ที่ใช้อ่าน Excel นะคะ)
//         const locCode = row[4];

//         // ถ้ายังไม่มีการสร้างกลุ่มของสถานที่นี้ ให้สร้างโครงสร้างเริ่มต้นไว้ก่อน
//         if (!groupedResult[locCode]) {
//             // ดึงข้อมูล Master Data ที่เราเตรียมไว้ในขั้นตอนที่ 1 มาใช้
//             const INC = empLookup[locCode] || '';

//             groupedResult[locCode] = {
//                 CCCODE: row[2],
//                 CCDESC: row[3],
//                 LOCCODE: locCode,
//                 LOCNAME: row[5],
//                 INC: INC,
//                 assets: [], // สร้าง Array ว่างรอรับสินทรัพย์
//             };
//         }

//         // 3. ยัดข้อมูล Asset จาก Excel แถวนี้ เข้าไปใน Array assets ของกลุ่มนั้นๆ
//         groupedResult[locCode].assets.push({
//             GRPCODE: row[0],
//             ASSETNO: row[6],
//             ASSETDESC: row[7],
//             DOCDATE: formatDate(row[8]),
//             INITVAL: row[9],
//             STARTDP: formatDate(row[10]),
//             MONTHDP: row[11],
//             YTDDP: row[12],
//             ACCUMDP: row[13],
//             BOOKVAL: row[14],
//             INVNO: row[15],
//             MODELNO: row[16],
//             SNNO: row[17],
//             PONO: row[18],
//             REFASSET: row[19],
//             VOUCHER: row[20],
//             QTY: row[21],
//             STATUS: row[22],
//             SUPPLIER: row[23],
//             PRNO: row[24],
//             BUDGETNO: row[25],
//             REQBY: row[26],
//             USINGLIFE: row[27],
//         });
//     });

//     // ผลลัพธ์ใน groupedResult ตอนนี้จะเป็น Object ที่มี Key เป็น LOCCODE
//     // ถ้าคุณต้องการให้ข้อมูลส่งออกไปเป็น Array แบบ [ { LOCCODE: "1003", ... }, { LOCCODE: "1004", ... } ]
//     // ให้ใช้ Object.values() แบบนี้ค่ะ:
//     const finalArrayResult = Object.values(groupedResult);

//     return finalArrayResult;
// }
async function prepareData(excelData) {
    const locmstdata = await getLocMstData({});

    // แก้คำสะกดให้ตรงกันนะคะ empLookup
    const empLookup = {};
    locmstdata.data.forEach((loc) => {
        const empNo = loc.INC?.EMPINFO?.SEMPNO || '';
        empLookup[loc.LOCCODE] = {
            empNo: empNo,
            sposcode: loc.SPOSCODE,
            vorgno: loc.VORGNO,
        };
    });

    // 🌟 ฟังก์ชันแปลงวันที่ ท่าไม้ตายดักทุกรูปแบบ
    const formatDate = (dateValue) => {
        if (!dateValue) return '';

        // ท่าที่ 1: ถ้ามาเป็น String ที่มีตัว 'T' อยู่แล้ว เช่น "2015-10-15T00:00:00.000Z" ให้หั่นแล้วเอาเลย
        if (typeof dateValue === 'string' && dateValue.includes('T')) {
            return dateValue.split('T')[0];
        }

        // ท่าที่ 2: ถ้า Library ส่งมาเป็น Date Object ของระบบ
        if (
            dateValue instanceof Date ||
            typeof dateValue.getMonth === 'function'
        ) {
            const year = dateValue.getFullYear();
            const month = String(dateValue.getMonth() + 1).padStart(2, '0');
            const day = String(dateValue.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        // ท่าที่ 3: ถ้าเป็นตัวเลข Timestamp หรือรูปแบบอื่น
        try {
            const d = new Date(dateValue);
            if (!isNaN(d.getTime())) {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }
        } catch (error) {}

        // ถ้าแปลงไม่ได้จริงๆ ให้แปลงเป็น String ก่อน แล้วเช็คว่าหั่น 'T' ได้ไหม
        const fallbackStr = String(dateValue);
        return fallbackStr.includes('T')
            ? fallbackStr.split('T')[0]
            : fallbackStr;
    };

    const groupedResult = {};

    excelData.forEach((row) => {
        const locCode = row[4];

        if (!groupedResult[locCode]) {
            const INC = empLookup[locCode].empNo || '';
            const SPOSCODE = empLookup[locCode].sposcode || '';
            const INCVORGNO = empLookup[locCode].vorgno || '';
            groupedResult[locCode] = {
                CCCODE: row[2],
                CCDESC: row[3],
                LOCCODE: locCode,
                LOCNAME: row[5],
                INC: INC,
                SPOSCODE: SPOSCODE,
                INCVORGNO: INCVORGNO,
                ASSETS: [],
            };
        }

        groupedResult[locCode].ASSETS.push({
            GRPCODE: row[0],
            ASSETNO: row[6],
            ASSETDESC: row[7],
            DOCDATE: formatDate(row[8]), // ✅ แปลงวันที่จุดที่ 1
            INITVAL: row[9],
            STARTDP: formatDate(row[10]), // ✅ แปลงวันที่จุดที่ 2
            MONTHDP: row[11],
            YTDDP: row[12],
            ACCUMDP: row[13],
            BOOKVAL: row[14],
            INVNO: row[15],
            MODELNO: row[16],
            SNNO: row[17],
            PONO: row[18],
            REFASSET: row[19],
            VOUCHER: row[20],
            QTY: row[21],
            UNIT: row[22],
            STATUS: row[23],
            SUPPLIER: row[24],
            PRNO: row[25],
            BUDGETNO: row[26],
            REQBY: row[27],
            USINGLIFE: row[28],
        });
    });

    const finalArrayResult = Object.values(groupedResult);
    return finalArrayResult;
}
