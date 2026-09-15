import { fetchUtils } from '@amec/webasset/api/fetch-utils';

export async function getActivePriceConditions() {
    return await fetchUtils({
        url: `${process.env.APP_API}/purform/cond-comparison-price/active`,
        method: 'GET',
    });
}
