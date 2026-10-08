import {
    renderLoadError,
    showErrorMessage,
    showMessage,
} from '@amec/webasset/utils';
import { steps } from './steps';
import { importExcel } from './importExcel';
import { modalConfirmRequest } from './modal/modal-comfirm';
import { tableComparison } from './table/table-comparison';
import { createComparison } from './data';
import { showLoader } from '@amec/webasset/preloader';
import { prepareFormData } from './function';

$(async function () {
    try {
        // Set step
        await steps.init();
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
$(document).on(
    'click',
    'button[name="btnRequest"], button[name="btnAction"]',
    async function (e) {
        try {
            showLoader();
            const val = $(this).val();
            const details = tableComparison.data();
            if (details.length === 0) {
                showMessage('No data available for request.', 'warning');
                return;
            }
            // const stepData = steps.data;

            // const data = {
            //     FUNC: stepData.function,
            //     REQBY: stepData.requester,
            //     INPUTBY: stepData.inputer,
            //     STATUS: 0,
            //     ISEDIT: stepData.formNo != null,
            //     FORMEDIT: stepData.formNo,
            //     DETAILS: details,
            //     VENDOR: stepData.vendor,
            //     MODE: stepData.compareMode,
            //     ...tableComparison.total,
            // };
            const data = prepareFormData(details);
            let res;
            switch (val) {
                case 'draft':
                    res = await createComparison(data);
                    break;
                case 'save':
                    res = await createComparison(data);
                    break;
                case 'request':
                    modalConfirmRequest.show(true);
                    return;
            }
            if (!res.status) {
                throw new Error('Failed to create comparison.');
            }
            modalConfirmRequest.show(false);
            showMessage('Comparison created successfully.', 'success');
        } catch (error) {
            console.error(error);
            showErrorMessage(error.message);
        } finally {
            showLoader({ show: false });
        }
    },
);
