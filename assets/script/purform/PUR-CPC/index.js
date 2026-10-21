import {
    getUrlParams,
    renderLoadError,
    showErrorMessage,
    showMessage,
} from '@amec/webasset/utils';
import { steps } from './steps';
import { importExcel } from './importExcel';
import { modalConfirmRequest } from './modal/modal-comfirm';
import { tableComparison } from './table/table-comparison';
import { createComparison, getComparisonListByForm } from './data';
import { showLoader } from '@amec/webasset/preloader';
import { finishProcess, prepareFormData } from './function';
import { redirectWebflow } from '@amec/webasset/form';
import { getFormByUrlParam } from '../PUR-PRA/function';
import { getFormPriceApprove } from '../PUR-PRA/data';

$(async function () {
    try {
        showLoader();
        const params = getUrlParams();
        const form = getFormByUrlParam();
        if (!params.NRUNNO) {
            // Set step
            await steps.init();
        } else {
            // หากฟอร์มเป็นการ Return ให้ดึงข้อมูลฟอร์มเพื่อใช้ในการตั้งค่าฟิลด์ต่าง ๆ
            const formData = await getFormPriceApprove(form);
            if (!formData.status) {
                throw new Error(formData.message);
            }
            const data = formData.data;
            const comparisonForm = await getComparisonListByForm(
                data.LINK_FORM.CNO,
            );
            if (!comparisonForm.status) {
                throw new Error(comparisonForm.message);
            }
            const comparisonData = comparisonForm.data;
            steps.setInputer(comparisonData.VINPUTER);
            steps.setRequester(comparisonData.VREQNO);
            steps.mode = 'draft';
            steps.compareMode = comparisonData.CMODE;
            steps.formNo = comparisonData.VFORMNO;
            steps.priceApvForm = { ...form, PRA_NO: data.LINK_FORM?.PNO };
            steps.function = comparisonData.NFUNCTIONS;
            steps.system = comparisonData.VSYSTEM;
            steps.vendor = comparisonData.VVENDOR;
            steps.plannerCode = comparisonData.VPLANNER_CODE.includes(',')
                ? comparisonData.VPLANNER_CODE.split(',')
                : [comparisonData.VPLANNER_CODE];

            await steps.init(true);
        }
        importExcel.init();
        modalConfirmRequest.init();
    } catch (error) {
        console.error(error);
        renderLoadError(error.message);
    } finally {
        showLoader({ show: false });
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
            const data = prepareFormData(details);
            let res;
            switch (val) {
                case 'draft':
                    res = await createComparison(data);
                    break;
                case 'save':
                    if (steps._isReturn) {
                        data.isReturn = true;
                        data.STATUS = 2;
                    }
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
            if (steps._isReturn) {
                finishProcess();
                return;
            }
            await steps.instance.setStep(0);
            redirectWebflow();
        } catch (error) {
            console.error(error);
            showErrorMessage(error.message);
        } finally {
            showLoader({ show: false });
        }
    },
);
