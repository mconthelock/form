import { showMessage } from '@amec/webasset/utils';
import { getK850mpData } from '../PUR-CPC/data';
import { getUser } from '@amec/webasset/api/amec';
import { tableComparison } from '../PUR-CPC/table-comparison';
import { getPdfViewer } from '@amec/webasset/components/pdfViewer';

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
const getAutoField = () => {
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

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-01
 * @description ตั้งค่า field ที่ต้องกรอกอัตโนมัติจากฟอร์ม Price Comparison
 * แก้ไขสถานะของฟิลด์ตามโหมด (mode)
 * @param {{data: Object, mode: number}} param0
 */
export const setAutoField = ({ data, mode = 1 } = {}) => {
    const autoField = getAutoField();
    const priceCompareFile = $('#price-compare-file-fieldset');
    const priceCompareInput = $('#price-compare-input-fieldset');
    const input = $('#PRICE_COMPARE_NO');
    const file = $('#PRICE_COMPARE_FILE');

    input.toggleClass('req', mode === 1);
    file.toggleClass('req', mode !== 1);
    priceCompareFile.toggleClass('hidden', mode === 1);
    priceCompareInput.toggleClass('hidden', mode !== 1);
    tableComparison.destroy();
    getPdfViewer('PRICE_COMPARE_FILE')?.reset();
    Object.keys(autoField).forEach((key) => {
        const label = autoField[key].closest('label');
        const element = label.length ? label : autoField[key];
        if (mode == 1) {
            element.addClass('bg-amber-50');
        } else {
            element.removeClass('bg-amber-50');
        }
        autoField[key].prop('readonly', mode === 1);
        autoField[key].val(data?.[key] || '');
    });
};
