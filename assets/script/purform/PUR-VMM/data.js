import {
    fetchMsgErr,
    fetchUtils,
    serializeRequestBody,
} from '@amec/webasset/api/fetch-utils';

export async function getData(form) {
    return fetchUtils({
        url: `${process.env.APP_API}/purform/purvmm-form/data`,
        method: 'POST',
        data: form,
    });
}
