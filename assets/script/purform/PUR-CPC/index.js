import { getUrlParams, logtest, renderLoadError } from '@amec/webasset/utils';
import { steps } from './steps';
import { importExcel } from './importExcel';

$(async function () {
    try {
        const params = getUrlParams();
        const empno = params.EMPNO;
        logtest(params);
        // Set step
        await steps.init(empno);
        importExcel.init();
    } catch (error) {
        console.error(error);
        renderLoadError(error.message);
    }
});

$(document).on('submit', 'form[data-step-panel]', function (e) {
    e.preventDefault();
});
