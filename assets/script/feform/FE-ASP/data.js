import { host } from '../../utils';
import { fetchMsgErr } from '@amec/webasset/api/fetch-utils';

export async function saveDocMaster(formData) {
    return $.ajax({
        url: host + 'feform/FE-ASP/form/SaveDocMaster',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        dataType: 'json',
    });
}

export async function deleteDraftDoc(payload) {
    return $.ajax({
        url: host + 'feform/FE-ASP/form/DeleteDraftDoc',
        type: 'POST',
        data: payload,
        dataType: 'json',
    });
}

/**
 * อัปโหลดไฟล์ผ่าน NestJS API เข้าตาราง FE_FILE และ Storage กลางของ AMEC (เหมือน FE-DOC)
 */
export async function uploadDocFiles(formData) {
    const res = await fetch(`${process.env.APP_API}/webform/file`, {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) {
        return {
            status: false,
            message: `Failed to upload file: ${await fetchMsgErr(res)}`,
        };
    }

    return await res.json();
}

/**
 * ฟังก์ชันกลางสำหรับ Fetch ไฟล์ Excel สรุปประจำปี -> อัปโหลดเข้า NestJS API -> สั่งลบ Temp
 *
 * @param {Object} feDocData ข้อมูลที่ได้รับจาก Backend (docNo, feDocKeys, excelFile)
 * @param {string} empno รหัสพนักงานผู้ดำเนินการ
 * @returns {Promise<boolean>} สถานะการอัปโหลด
 */
export async function handleAutoFeDocUpload(feDocData, empno) {
    if (!feDocData || !feDocData.excelFile || !feDocData.feDocKeys) {
        return false;
    }

    const empNoToSend = (
        empno ||
        window.CURRENT_EMPNO ||
        $('#EMPNOHid').val() ||
        '13204'
    ).trim();

    try {
        // 1. ดึง Blob ไฟล์ Excel ที่หยอด Template จากโฟลเดอร์ Temp
        const response = await fetch(
            feDocData.excelFile.fileUrl + '?t=' + Date.now(),
        );
        if (!response.ok) {
            throw new Error('ไม่สามารถเข้าถึงไฟล์ Excel ชั่วคราวได้');
        }
        const blob = await response.blob();
        const fileObj = new File([blob], feDocData.excelFile.fileName, {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        // 2. จัดเตรียม Payload ส่งเข้า NestJS File Service
        let nestJsData = new FormData();
        nestJsData.append('NFRMNO', feDocData.feDocKeys.NFRMNO);
        nestJsData.append('VORGNO', feDocData.feDocKeys.VORGNO);
        nestJsData.append('CYEAR', feDocData.feDocKeys.CYEAR);
        nestJsData.append('CYEAR2', feDocData.feDocKeys.CYEAR2);
        nestJsData.append('NRUNNO', feDocData.feDocKeys.NRUNNO);
        nestJsData.append('CREATEBY', empNoToSend);
        nestJsData.append('FORM_TYPE', 'FE');
        nestJsData.append(
            'PATH',
            `\\\\amecnas\\AMECWEB\\File\\development\\Form\\FE\\FE-DOC\\${feDocData.docNo}`,
        );
        nestJsData.append('files', fileObj);

        const resFile = await uploadDocFiles(nestJsData);
        if (!resFile || !resFile.status) {
            throw new Error(
                resFile?.message || 'อัปโหลดไฟล์ผ่าน NestJS API ไม่สำเร็จ',
            );
        }

        // 3. ลบไฟล์ Temp Excel ออกจาก assets/upload/fe_asp/
        try {
            await $.ajax({
                url: `${host}feform/FE-ASP/report/deleteTempExcelFile`,
                type: 'POST',
                data: { fileName: feDocData.excelFile.fileName },
                dataType: 'json',
            });
        } catch (delErr) {
            console.warn('Cannot delete temporary excel file:', delErr);
        }

        return true;
    } catch (err) {
        console.error('handleAutoFeDocUpload failed:', err);
        throw err;
    }
}
