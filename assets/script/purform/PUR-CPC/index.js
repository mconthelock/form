import {
    getUrlParams,
    logtest,
    renderLoadError,
    showErrorMessage,
    showMessage,
} from '@amec/webasset/utils';
import { steps } from './steps';
import { importExcel } from './importExcel';
import { modalConfirmRequest } from './modal-comfirm';
import { tableComparison } from './table-comparison';

$(async function () {
    try {
        const params = getUrlParams();
        const empno = params.EMPNO;
        logtest(params);
        // Set step
        await steps.init(empno);
        importExcel.init();
        modalConfirmRequest.init();
    } catch (error) {
        console.error(error);
        renderLoadError(error.message);
    }
});

$(document).on('submit', 'form[data-step-panel]', function (e) {
    e.preventDefault();
});

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-09-22
 * @description Handle click events for request buttons (draft, save, request)
 */
$(document).on('click', 'button[name="btnRequest"]', async function (e) {
    try {
        const val = $(this).val();
        const data = tableComparison.data();
        if (data.length === 0) {
            showMessage('No data available for request.', 'warning');
            return;
        }
        switch (val) {
            case 'draft':
                break;
            case 'save':
                break;
            case 'request':
                modalConfirmRequest.show(true);
                break;
        }
    } catch (error) {
        console.error(error);
        showErrorMessage(error.message);
    }
});
