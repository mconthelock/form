import {
    getUrlParams,
    renderLoadError,
    showErrorMessage,
    showMessage,
} from '@amec/webasset/utils';
import { getListCreate } from './data';
import { modalSelectPriceComparison } from './modal/select-price-comparison';
import { tableDraft } from '../PUR-CPC/table-draft';
import { checkPlanner } from './function';

$(async function () {
    try {
        const params = getUrlParams();
        const empno = params.EMPNO;
        if (!(await checkPlanner(empno))) {
            throw new Error('User not found');
        }
        $('#INPUTBY').val(empno);
        modalSelectPriceComparison.init();
    } catch (error) {
        console.error(error);
        renderLoadError(error.message);
    }
});

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-09-30
 * @description ตรวจสอบว่า Planner มีอยู่ในระบบหรือไม่ เมื่อกรอกข้อมูลในฟิลด์ REQBY
 */
$(document).on('change', '#REQBY', async function () {
    const empno = $(this).val();
    if (!(await checkPlanner(empno))) {
        $(this).val('');
    }
});

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-09-30
 * @description เปิด modal เพื่อเลือก รายการ Price Comparison
 */
$(document).on('click', '#btn-view-compare', async function () {
    try {
        const req = $('#REQBY').val();
        if (!req) {
            showMessage('Please enter the requester.', 'warning');
            return;
        }
        const lists = await getListCreate(req);
        if (!lists.status) {
            showMessage(`Price comparison not found for ${req}`, 'warning');
            return;
        }
        modalSelectPriceComparison.show(true);
        tableDraft.init(lists.data, 'table-select-price-comparison');
    } catch (error) {
        console.error(error);
        showErrorMessage(error.message);
    }
});
