import { showMessage } from '@amec/webasset/utils';
import { getK850mpData } from '../PUR-CPC/data';
import { getUser } from '@amec/webasset/api/amec';

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-09-30
 * @description ตรวจสอบว่า Planner มีอยู่ในระบบหรือไม่
 * @param {string} empno
 * @returns
 */
export async function checkPlanner(empno) {
    const k850mpData = await getK850mpData();
    const k850mpRecord = k850mpData.data.filter(
        (record) => record.K85M03 === empno,
    );
    if (k850mpRecord.length === 0) {
        showMessage('Planner not found', 'warning');
        return false;
    }
    const empnoData = await getUser(empno);
    if (!empnoData) {
        showMessage('User not found', 'warning');
        return false;
    }
    return true;
}

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-01
 * @description ดึง field ที่ต้องกรอกอัตโนมัติจากฟอร์ม Price Comparison
 * @returns
 */
export const getAutoField = () => {
    return {
        formComparison: $('#PRICE_COMPARE_NO'),
        vendor: $('#VVENDOR'),
        vendorName: $('#VVENDOR_NAME'),
        planner: $('#VPLANNER'),
        totalPresent: $('#NTOTAL_PRES'),
        totalNew: $('#NTOTAL_NEW'),
        totalCost: $('#NTOTAL_COST'),
        totalRatio: $('#NTOTAL_RATIO'),
    };
};
