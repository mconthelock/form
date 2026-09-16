import { fetchUtils } from '@amec/webasset/api/fetch-utils';

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-09-15
 * @description Fetches the active price conditions.
 * @returns
 */
export async function getActivePriceConditions() {
    return await fetchUtils({
        url: `${process.env.APP_API}/purform/cond-comparison-price/active`,
        method: 'GET',
    });
}

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-09-15
 * @description Fetches the planner compare sheet for the specified planner.
 * @returns
 */
export async function getPlannerCompareSheet(planner) {
    return await fetchUtils({
        url: `${process.env.APP_API}/purform/pur-cpc/planner-compare-sheet/${planner}`,
        method: 'GET',
    });
}

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-09-15
 * @description Fetches the K850mp data.
 * @returns
 */
export async function getK850mpData() {
    return await fetchUtils({
        url: `${process.env.APP_API}/datacenter/k850mp`,
        method: 'GET',
    });
}
