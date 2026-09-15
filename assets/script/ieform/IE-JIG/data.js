import { fetchUtils } from '@amec/webasset/api/fetch-utils';
import { getConfig } from '@amec/webasset/config';
import { searchUser } from '@amec/webasset/api/amec';

export const getJigProcesses = () => fetchUtils({ url: `${getConfig().APP_API}/iedoc/jig/mfg-processes`, method: 'GET' });
export const getJigLocations = () => fetchUtils({ url: `${getConfig().APP_API}/iedoc/jig/locations`, method: 'GET' });
export async function getJigEmployee(empno) {
    const users = await searchUser({ SEMPNO: empno, CSTATUS: '1' });
    return users.find((user) => String(user.SEMPNO).trim() === empno && String(user.CSTATUS).trim() === '1') ?? null;
}

// Supply confirmed endpoints and map API fields here when the Jig API is ready.
// No invented endpoint or sample record is used by the prototype.
export function createJigApi({ loadUrl, createUrl, updateUrl } = {}) {
    const request = (url, method, data = null) => {
        if (!url) throw new Error('ยังไม่ได้ตั้งค่า API ของ Jig');
        return fetchUtils({ url, method, data });
    };
    return {
        load: () => request(loadUrl, 'GET'),
        create: (data) => request(createUrl, 'POST', data),
        update: (data) => request(updateUrl, 'PUT', data),
    };
}
