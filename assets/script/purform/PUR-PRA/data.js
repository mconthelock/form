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
