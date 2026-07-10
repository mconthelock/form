import {
    fetchMsgErr,
    fetchUtils,
    serializeRequestBody,
} from '@amec/webasset/api/fetch-utils';

export async function searchNVFForm(keyword) {
    return fetchUtils({
        url: `${process.env.APP_API}/purform/purnvf-form/search?keyword=${encodeURIComponent(keyword)}`,
        method: 'GET',
    });
}
