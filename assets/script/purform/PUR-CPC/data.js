import { fetchUtils } from '@amec/webasset/api/fetch-utils';

export const templateBaseDir = `${process.env.AMEC_FILE_PATH}${process.env.STATE == 'production' ? 'production' : 'development'}/webflow/template/price-compare`;

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-09-15
 * @description Fetches the active price conditions.
 * @returns
 */
export async function getActivePriceConditions() {
    return await fetchUtils({
        url: `${process.env.APP_API}/purform/pur-cpc/cond-comparison-price/active`,
        method: 'GET',
    });
}

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-09-15
 * @description Fetches the planner compare sheet for the specified planner.
 * @returns
 */
export async function getPlannerCompareSheet(data) {
    return await fetchUtils({
        url: `${process.env.APP_API}/purform/pur-cpc/planner-compare-sheet`,
        method: 'POST',
        data: data,
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

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-09-17
 * @description Get data for the price comparison.
 * @returns
 */
export async function getPriceComparison(data) {
    return await fetchUtils({
        url: `${process.env.APP_API}/purform/pur-cpc/Price-Comparison`,
        method: 'POST',
        data: data,
    });
}

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-09-18
 * @description Get currency data.
 * @returns
 */
export async function getCurrenCy() {
    return await fetchUtils({
        url: `${process.env.APP_API}/as400/k089kp/currency`,
        method: 'GET',
    });
}

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-09-21
 * @description Fetches the vendor data.
 * @returns
 */
export async function getVendors() {
    return await fetchUtils({
        url: `${process.env.APP_API}/avm`,
        method: 'GET',
    });
}

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-09-29
 * @description Creates a price comparison.
 * @param {CreateFormDto} data
 * @returns
 */
export async function createComparison(data) {
    return await fetchUtils({
        url: `${process.env.APP_API}/purform/pur-cpc`,
        method: 'POST',
        data: data,
    });
}

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-09-29
 * @description ดึงข้อมูล Create price comparison draft.
 * @returns
 */
export async function getListDraft(empno) {
    return await fetchUtils({
        url: `${process.env.APP_API}/purform/pur-cpc/lists`,
        method: 'POST',
        data: {
            NSTATUS: 0,
            VREQNO: empno,
        },
    });
}

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-09-30
 * @description ดึงข้อมูล form ตามหมายเลขฟอร์ม
 * @returns
 */
export async function getformComparison(form) {
    return await fetchUtils({
        url: `${process.env.APP_API}/purform/pur-cpc/form/${form}`,
        method: 'GET',
    });
}

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-08
 * @description ดึงข้อมูล item
 * @param {object} data
 * @returns
 */
export async function getItemDetail(data) {
    return await fetchUtils({
        url: `${process.env.APP_API}/purform/pur-cpc/item-detail`,
        method: 'POST',
        data: data,
    });
}

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-13
 * @description ดึงข้อมูล Price Comparison ตามฟอร์มจากระบบ
 * @param {string} form หมายเลขฟอร์ม Price Approve
 * @returns {Promise<Object>} ข้อมูล Price Comparison ที่เกี่ยวข้องกับฟอร์มจากระบบ
 */
export async function getComparisonListByForm(form) {
    return await fetchUtils({
        url: `${process.env.APP_API}/purform/pur-cpc/lists/${form}`,
        method: 'GET',
    });
}
