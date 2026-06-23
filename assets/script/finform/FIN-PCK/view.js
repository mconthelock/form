import { showflow, getExtData } from '@amec/webasset/api/webform';
import { webflowSubmit, getformDetail } from '@amec/webasset/components/form';
import { formSubmitSkeleton } from '@amec/webasset/skeleton';
import {
    filterFormData,
    getAllAttr,
    logFormData,
    ordinalIndicator,
    removeClassError,
    requiredForm,
    setRound,
    showErrorMessage,
    showMessage,
} from '@amec/webasset/utils';

$(async function () {
    const formInfo = await getAllAttr('.form-info');
    const form = {
        NFRMNO: formInfo.nfrmno,
        VORGNO: formInfo.vorgno,
        CYEAR: formInfo.cyear,
        CYEAR2: formInfo.cyear2,
        NRUNNO: formInfo.nrunno,
    };
    const formDetail = await getformDetail(form);
    console.log(formDetail);

    const apvno = $('.apv-data').attr('empno');
    const cextdata = await getExtData({ ...form, EMPNO: apvno });
    const flow = await showflow(form);
    const container = $('#form-action-container');
    const showformdetail = $('#form-detail');
    const mode = Number(formInfo.mode);
    showformdetail.html(formDetail);
    switch (mode) {
        case 2:
            console.log('2');

            container.html(
                webflowSubmit({
                    flow: true,
                    flowhtml: flow.html,
                    approve: true,
                    reject: false,
                    return: true,
                }),
            );
            break;
        case 3:
            console.log('3');
            container.html(
                webflowSubmit({
                    actionsForm: false,
                    remark: false,
                    flow: true,
                    flowhtml: flow.html,
                }),
            );
            break;
        default:
            container.html('');
            break;
    }
});
