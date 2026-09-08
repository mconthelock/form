import { fetchUtils } from '@amec/webasset/api/fetch-utils';

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
