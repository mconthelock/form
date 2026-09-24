import { fetchUtils } from '@amec/webasset/api/fetch-utils';
import { getConfig } from '@amec/webasset/config';
import { searchUser } from '@amec/webasset/api/amec';

export const getJigProcesses = () => fetchUtils({ url: `${getConfig().APP_API}/iedoc/jig/mfg-processes`, method: 'GET' });
export const getJigLocations = () => fetchUtils({ url: `${getConfig().APP_API}/iedoc/jig/locations`, method: 'GET' });
export async function getJigEmployee(empno) {
    const users = await searchUser({ SEMPNO: empno, CSTATUS: '1' });
    return users.find((user) => String(user.SEMPNO).trim() === empno && String(user.CSTATUS).trim() === '1') ?? null;
}

export const getJigPics = () => fetchUtils({ url: `${getConfig().APP_API}/iedoc/jig/ie-pics`, method: 'GET' });

export const formPath = key => ['NFRMNO', 'VORGNO', 'CYEAR', 'CYEAR2', 'NRUNNO'].map(name => encodeURIComponent(key[name])).join('/');
export const insertJigForm = data => fetchUtils({ url: `${getConfig().APP_API}/iedoc/jig`, method: 'POST', data });
export const saveJigForm = (key, data) => fetchUtils({ url: `${getConfig().APP_API}/iedoc/jig/forms/${formPath(key)}`, method: 'PATCH', data });
export const configureJigRequesterFlow = (key, picCode) => fetchUtils({
    url: `${getConfig().APP_API}/iedoc/jig/forms/${formPath(key)}/requester-flow`,
    method: 'POST',
    data: picCode ? { PICCODE: picCode } : {},
});
export const finishJigForm = (key, actor) => fetchUtils({ url: `${getConfig().APP_API}/iedoc/jig/forms/${formPath(key)}/finish`, method: 'POST', data: { UPDATE_BY: actor } });
export async function loadJigForm(key, allowMissing = false) {
    const response = await fetch(`${getConfig().APP_API}/iedoc/jig/forms/${formPath(key)}`);
    if (allowMissing && response.status === 404) return null;
    const data = await response.json();
    if (!response.ok) throw new Error(Array.isArray(data.message) ? data.message.join('\n') : data.message || 'โหลด Jig ไม่สำเร็จ');
    return data;
}
const localBase = () => document.querySelector('meta[name="base_url"]').content;
export async function startJigForm(key, actor) {
    const data = new FormData();
    Object.entries(key).forEach(([name, value]) => data.append(name, value));
    data.append('EMPNO', actor);
    return fetchUtils({url: `${localBase()}ieform/IE-JIG/jig/start_request`, method: 'POST', data});
}
export async function deleteJigFile(key, fileSeq) {
    const data = new FormData();
    Object.entries(key).forEach(([name, value]) => data.append(name, value));
    data.append('EMPNO', document.querySelector('.form-data').dataset.empno);
    data.append('FILE_SEQ', fileSeq);
    const result = await fetchUtils({url: `${localBase()}ieform/IE-JIG/jig/deletefile`, method:'POST', data});
    if (!result.status) throw new Error(result.message || 'ลบไฟล์ไม่สำเร็จ');
    return result;
}
export async function uploadJigFiles(key, actor, files) {
    if (!files.length) return [];
    const data = new FormData();
    Object.entries(key).forEach(([name, value]) => data.append(name, value));
    data.append('EMPNO', actor);
    files.forEach(file => data.append('files[]', file));
    const result = await fetchUtils({ url: `${localBase()}ieform/IE-JIG/jig/uploadfile`, method: 'POST', data });
    if (!result.status) throw new Error(result.message || 'อัปโหลดไฟล์ไม่สำเร็จ');
    return result.files;
}
export function jigFileUrl(key, file) {
    const query = new URLSearchParams({ ...key, file: String(file.FILE_PATH).split(/[\\/]/).pop() });
    return `${localBase()}ieform/IE-JIG/jig/preview_file?${query}`;
}
