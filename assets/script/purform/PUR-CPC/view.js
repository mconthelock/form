import { getUrlParams } from '@amec/webasset/utils';
import { steps } from './steps';
import { tableComparison } from './table/table-comparison';
import { webflowSubmit } from '@amec/webasset/components/form';

$(async function () {
    try {
        const params = getUrlParams();
        const { EMPNO: empno, ...form } = params;
        console.log(empno, form);
        await steps.setProfileCard(empno, '#inputer-card-container', 'Inputer');
        await steps.setProfileCard(empno, '#requester-card-container');

        tableComparison.init({ formNo: '' });
        const submitHtml = webflowSubmit({
            remark: false,
            flow: true,
            flowHtml: '',
        });
        $('#webform-submit').html(submitHtml).removeClass('hidden');
    } catch (error) {
        console.error(error);
        renderLoadError(error.message);
    }
});
