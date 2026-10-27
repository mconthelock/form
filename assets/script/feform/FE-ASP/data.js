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
