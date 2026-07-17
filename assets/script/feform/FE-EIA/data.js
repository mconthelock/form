import { fetchMsgErr } from '@amec/webasset/api/fetch-utils';

export async function createFeEia(formData) {
    // 🟢 เปลี่ยน URL ให้เป็น /feform/fe-eia/createfile
    const res = await fetch(`${process.env.APP_API}/webform/file`, {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) {
        return {
            status: false,
            message: `Failed to insert data: ${await fetchMsgErr(res)}`,
        };
    }

    const data = await res.json();
    return data;
}
