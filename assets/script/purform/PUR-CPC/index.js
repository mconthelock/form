import {
    getUrlParams,
<<<<<<< HEAD
<<<<<<< HEAD
=======
    logtest,
>>>>>>> fa21af55 (feat(price-apv): implement view logic and modal confirmation for price approval requests, enhance step handling and data management)
    renderLoadError,
    showErrorMessage,
    showMessage,
} from '@amec/webasset/utils';
import { steps } from './steps';
import { importExcel } from './importExcel';
<<<<<<< HEAD
import { modalConfirmRequest } from './modal/modal-comfirm';
import { tableComparison } from './table/table-comparison';
import { createComparison, getComparisonListByForm } from './data';
import { showLoader } from '@amec/webasset/preloader';
import { finishProcess, prepareFormData } from './function';
import { redirectWebflow } from '@amec/webasset/form';
import { getFormByUrlParam } from '../PUR-PRA/function';
import { getFormPriceApprove } from '../PUR-PRA/data';
=======
import { modalConfirmRequest } from './modal-comfirm';
import { tableComparison } from './table-comparison';
>>>>>>> fa21af55 (feat(price-apv): implement view logic and modal confirmation for price approval requests, enhance step handling and data management)

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
<<<<<<< HEAD
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
=======
    logtest,
    showErrorMessage,
    showMessage,
} from '@amec/webasset/utils';
import { getUser, getUserImage } from '@amec/webasset/api/amec';

import { EmployeeProfileCard } from '@amec/webasset/components/profileCard';
import { getActivePriceConditions } from './data';
import { steps } from './steps';

$(async function () {
    try {
        const params = getUrlParams();
        const empno = params.EMPNO;
        logtest(params);
        const activePriceConditions = await getActivePriceConditions();
        if (!activePriceConditions.status) {
            throw new Error(activePriceConditions.message);
        }
        const priceCondContainer = $('#price-cond');
        priceCondContainer.replaceWith(
            activePriceConditions.data
                .map(
                    (condition) => `
                <label class="label">
                    <input type="radio" name="function" value="${condition.NO}" class="radio req"
                        data-message="Please enter function">
                    ${condition.NO}
                    ${condition.DESCRIPTION}
                </label>
            `,
                )
                .join(''),
        );

        // Set the inputer field with the empno
        $('#INPUTBY').val(empno);
        await setProfileCard(empno, '#inputer-card-container', 'Inputer');
        // Set step
        steps.init();
    } catch (error) {
        console.error(error);
        showErrorMessage(error.message);
    }
});

$(document).on('input', 'input[name="requester"]', async function () {
    try {
        const requester = $(this).val();
        if (requester.length < 5) {
            $('#requester-card-container').empty();
            return;
        }
        await setProfileCard(requester, '#requester-card-container');
    } catch (error) {
        console.error(error);
        showErrorMessage(error.message);
    }
});

$(document).on('change', 'input[name="requester"]', async function () {
    try {
        const requester = $(this).val();
        if (requester.length < 5) {
            showMessage('Requester must be at least 5 characters', 'warning');
            $(this).val('');
=======
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
>>>>>>> fa21af55 (feat(price-apv): implement view logic and modal confirmation for price approval requests, enhance step handling and data management)
        }
    } catch (error) {
        console.error(error);
        showErrorMessage(error.message);
    }
});
<<<<<<< HEAD

async function setProfileCard(empno, containner, title = 'Requester') {
    const empnoData = await getUser(empno);
    const userImage = await getUserImage(empno);
    if (!empnoData) {
        $(containner).empty();
        showMessage('Requester not found', 'warning');
        return;
    }
    new EmployeeProfileCard({
        container: containner,
        name: empnoData.SNAME,
        empno: empno,
        position: empnoData.SPOSITION,
        sec: empnoData.SSEC || '-',
        dept: empnoData.SDEPT || '-',
        image: userImage,
        title: title,
    });
}
>>>>>>> e2e73ccd (feat: implement PUR-CPC form and related functionality, add price comparison steps and data handling)
=======
>>>>>>> fa21af55 (feat(price-apv): implement view logic and modal confirmation for price approval requests, enhance step handling and data management)
