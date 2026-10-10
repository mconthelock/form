import {
    fetchMsgErr,
    fetchUtils,
    serializeRequestBody,
} from '@amec/webasset/api/fetch-utils';

export async function getTsAdjustData(con) {
    return fetchUtils({
        url: `${process.env.APP_API}/f001kp/ts-adjust`,
        method: 'POST',
        data: con,
    });
}
