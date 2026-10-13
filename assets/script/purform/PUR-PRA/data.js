import { fetchUtils } from '@amec/webasset/api/fetch-utils';

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-09-30
 * @description ดึงข้อมูล Create price comparison ที่ created ไว้แต่ไม่ได้สร้าง Price approve อัตโนมัติ
 * @returns
 */
export async function getListCreate(empno) {
    return await fetchUtils({
        url: `${process.env.APP_API}/purform/pur-cpc/lists`,
        method: 'POST',
        data: {
            NSTATUS: 1,
            VREQNO: empno,
        },
    });
}

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-05
 * @description ดึงข้อมูล Vendor จากระบบ AVM โดยใช้รหัส Vendor
 * @returns
 */
export async function getVendor(vendor) {
    return await fetchUtils({
        url: `${process.env.APP_API}/avm/search`,
        method: 'POST',
        data: {
            VENDOR: vendor,
        },
    });
}

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-05
 * @description ดึงข้อมูลคณะกรรมการ PCS จากระบบ
 * @returns
 */
export async function getCommittee() {
    return await fetchUtils({
        url: `${process.env.APP_API}/purform/pur-pra/committees`,
        method: 'GET',
    });
}

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-05
 * @description ดึงข้อมูลกลุ่มจากระบบ
 * @returns
 */
export async function getGroup() {
    return await fetchUtils({
        url: `${process.env.APP_API}/purform/pur-pra/groups`,
        method: 'GET',
    });
}

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-06
 * @description ดึงข้อมูล Planner จากระบบ
 * @returns
 */
export async function getPlanner(planner) {
    return await fetchUtils({
        url: `${process.env.APP_API}/datacenter/k850mp/planner/${planner}`,
        method: 'GET',
    });
}

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-06
 * @description ดึงข้อมูลเหตุผล Cost Up จากระบบ
 * @returns
 */
export async function getReasonCostUp() {
    return await fetchUtils({
        url: `${process.env.APP_API}/purform/pur-pra/reasons/costup`,
        method: 'GET',
    });
}

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-06
 * @description ดึงข้อมูลเหตุผล Cost Down จากระบบ
 * @returns
 */
export async function getReasonCostDown() {
    return await fetchUtils({
        url: `${process.env.APP_API}/purform/pur-pra/reasons/costdown`,
        method: 'GET',
    });
}

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-06
 * @description ดึงข้อมูลเหตุผล Condition Revise จากระบบ
 * @returns
 */
export async function getReasonConditionRevise() {
    return await fetchUtils({
        url: `${process.env.APP_API}/purform/pur-pra/reasons/condition-revise`,
        method: 'GET',
    });
}

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-06
 * @description ดึงข้อมูลเหตุผล Estimate Price จากระบบ
 * @returns
 */
export async function getReasonEstimatePrice() {
    return await fetchUtils({
        url: `${process.env.APP_API}/purform/pur-pra/reasons/estimate-price`,
        method: 'GET',
    });
}

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-06
 * @description สร้างฟอร์ม Price Approve ในระบบ
 * @param {Object} data  ข้อมูลฟอร์ม Price Approve
 * @returns
 */
export async function createPriceApproveForm(data) {
    return await fetchUtils({
        url: `${process.env.APP_API}/purform/pur-pra`,
        method: 'POST',
        data,
    });
}

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-13
 * @description ดึงข้อมูลฟอร์ม Price Approve จากระบบ
 * @param {FormDto} form
 * @returns {Promise<Object>} ข้อมูลฟอร์ม Price Approve จากระบบ
 */
export async function getFormPriceApprove(form) {
    return await fetchUtils({
        url: `${process.env.APP_API}/purform/pur-pra/form`,
        method: 'POST',
        data: form,
    });
}
