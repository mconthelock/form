import { getUser } from '@amec/webasset/api/amec';
import { removeClassError, showMessage } from '@amec/webasset/utils';
import { getPdfViewer } from '@amec/webasset/components/pdfViewer';
import { getFileUploadInstance } from '@amec/webasset/components/fileUpload';
import { getK850mpData } from '../PUR-CPC/data';
import { tableComparison } from '../PUR-CPC/table-comparison';
import { getCommittee, getGroup, getVendor } from './data';

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
export const setAutoField = ({
    data,
    mode = 1,
    trigger = true,
    removeError = true,
} = {}) => {
    const autoField = getAutoField();
    const priceCompareFile = $('#price-compare-file-fieldset');
    const priceCompareInput = $('#price-compare-input-fieldset');
    const input = $('#PRICE_COMPARE_NO');
    const file = $('#PRICE_COMPARE_FILE');
    $(`input[name="form-mode"][value="${mode}"]`).prop('checked', true);

    input.toggleClass('req', mode === 1);
    file.toggleClass('req', mode !== 1);
    priceCompareFile.toggleClass('hidden', mode === 1);
    priceCompareInput.toggleClass('hidden', mode !== 1);
    tableComparison.destroy();
    getPdfViewer('price-compare-container')?.reset();
    getFileUploadInstance('PRICE_COMPARE_FILE')?.reset();
    Object.keys(autoField).forEach((key) => {
        const label = autoField[key].closest('label');
        const element = label.length ? label : autoField[key];
        autoField[key].prop('readonly', mode === 1);
        autoField[key].val(data?.[key] || '');
        if (removeError) removeClassError(autoField[key]);
        if (trigger) autoField[key].trigger('blur');
        if (mode == 1) {
            element.addClass('bg-amber-50');
        } else {
            if (key === 'vendorName') return;
            element.removeClass('bg-amber-50');
        }
    });
};

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-02
 * @description ตรวจสอบว่ามี Vendor อยู่ในระบบหรือไม่
 * @param {string} vendor  รหัส Vendor ที่ต้องการตรวจสอบ
 * @returns {Promise<{status: boolean, data?: Object}|false>} ผลลัพธ์การตรวจสอบ Vendor
 */
export async function checkVendor(vendor) {
    const vendors = await getVendor(vendor);
    if (!vendors || vendors.length === 0) {
        showMessage('No vendor data found', 'warning');
        return false;
    }
    return { status: true, data: vendors[0] };
}

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-05
 * @description โหลดข้อมูลคณะกรรมการและแสดงใน container สามารถส่งค่า committeeId เพื่อกำหนดค่าเริ่มต้นได้
 * @param {number} committeeId
 * @returns {Promise<void>}
 */
export const committees = async function (committeeId) {
    const container = $('#committee-container');
    if (!container.length) throw new Error('Committee container not found');
    const committees = await getCommittee();
    if (!committees.status) throw new Error('Failed to fetch committees');
    container.html(
        committees.data
            .map((val) => {
                return `
                <label class="label cursor-pointer gap-2 rounded-lg border border-slate-200 px-3 py-2 has-checked:border-primary has-checked:bg-primary/5">
                    <input type="radio" name="VCOMMITTEE" value="${val.NID}" class="radio radio-sm radio-primary req" ${val.NID === committeeId ? 'checked' : ''}>
                    <span class="label-text">${val.VCODE}: ${val.VNAME}</span>
                </label>
            `;
            })
            .join(''),
    );
};

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-05
 * @description โหลดข้อมูลกลุ่มและแสดงใน container สามารถส่งค่า groupId เพื่อกำหนดค่าเริ่มต้นได้
 * @param {number} groupId
 * @returns {Promise<void>}
 */
export const groups = async function (groupId) {
    const container = $('#group-container');
    if (!container.length) throw new Error('Group container not found');
    const groups = await getGroup();
    if (!groups.status) throw new Error('Failed to fetch groups');
    container.html(
        groups.data
            .map((val) => {
                return `
                <label class="label cursor-pointer gap-2 rounded-lg border border-slate-200 px-4 py-2 has-checked:border-primary has-checked:bg-primary/5">
                    <input type="radio" name="group" value="${val.NID}" class="radio radio-sm radio-primary req" ${val.NID === groupId ? 'checked' : ''}>
                    <span class="label-text">${val.VNAME}</span>
                </label>
            `;
            })
            .join(''),
    );
};
