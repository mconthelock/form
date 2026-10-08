import { steps } from './steps';
import { tableComparison } from './table/table-comparison';

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-08
 * @description เตรียมข้อมูลสำหรับสร้างฟอร์ม PUR-CPC
 * @param {object[]} details - ข้อมูลของตาราง comparison
 * @returns {object} ข้อมูลที่เตรียมไว้สำหรับสร้างฟอร์ม PUR-CPC
 */
export const prepareFormData = (details) => {
    const stepData = steps.data;
    return {
        FUNC: stepData.function,
        REQBY: stepData.requester,
        INPUTBY: stepData.inputer,
        STATUS: 0,
        ISEDIT: stepData.formNo != null,
        FORMEDIT: stepData.formNo,
        DETAILS: details,
        VENDOR: stepData.vendor,
        MODE: stepData.compareMode,
        ...tableComparison.total,
    };
};
