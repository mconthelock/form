import {
    getUrlParams,
    renderLoadError,
    showErrorMessage,
    showMessage,
} from '@amec/webasset/utils';
import { getListCreate } from './data';
import { modalSelectPriceComparison } from './modal/select-price-comparison';
import { tableDraft } from '../PUR-CPC/table-draft';
import { checkPlanner, setAutoField } from './function';
import { showLoader } from '@amec/webasset/preloader';

$(async function () {
    try {
        showLoader();
        const params = getUrlParams();
        const empno = params.EMPNO;
        if (!(await checkPlanner(empno))) {
            throw new Error('User not found');
        }
        $('#INPUTBY').val(empno);
        $('input[name="form-mode"][value="1"]').prop('checked', true);
        setAutoField({ mode: 1 });
        modalSelectPriceComparison.init();
    } catch (error) {
        console.error(error);
        renderLoadError(error.message);
    } finally {
        showLoader({ show: false });
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

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-10-01
 * @description จัดการการเปลี่ยนแปลงโหมดฟอร์ม (form mode)
 */
$(document).on('change', 'input[name="form-mode"]', function () {
    try {
        const mode = $(this).val();
        setAutoField({ mode: +mode });
    } catch (error) {
        console.error(error);
        showErrorMessage(error.message);
    }
});
