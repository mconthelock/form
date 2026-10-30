import { getUrlParams, renderLoadError } from '@amec/webasset/utils';
import { steps } from './steps';
import { tableComparison } from './table/table-comparison';
import { webflowSubmit } from '@amec/webasset/components/form';
import { getLink, getListComparison } from './data';
import { showLoader } from '@amec/webasset/preloader';

$(async function () {
    try {
        showLoader();
        const params = getUrlParams();
        const comparison = await getListComparison({
            CYEAR2: params.CYEAR2,
            NRUNNO: params.NRUNNO,
        });
        if (!comparison.status) {
            throw new Error(comparison.message);
        }
        const data = comparison.data[0];
        const priceApv = data.PRICE_APV_FORM;
        await steps.setInputer(data.VINPUTER);
        await steps.setRequester(data.VREQNO);
        steps.mode = 'draft';
        steps.compareMode = data.CMODE;
        steps.formNo = data.VFORMNO;
        steps.priceApvForm = { PRA_NO: priceApv };
        steps.function = data.NFUNCTIONS;
        tableComparison.init({ formNo: data.VFORMNO });
        if (priceApv) {
            const linkRes = await getLink({
                PNO: priceApv,
            });
            if (!linkRes.status) {
                throw new Error(`Price Aproval form ${priceApv} not found`);
            }
            const formLink = linkRes.data;
            const submitHtml = await webflowSubmit({
                remark: false,
                back: false,
                form: {
                    NFRMNO: formLink.PFRMNO,
                    VORGNO: formLink.PORGNO,
                    CYEAR: formLink.PYEAR,
                    CYEAR2: formLink.PYEAR2,
                    NRUNNO: formLink.PRUNNO,
                },
            });
            $('#webform-submit').html(submitHtml).removeClass('hidden');
        }
    } catch (error) {
        console.error(error);
        renderLoadError(error.message);
    } finally {
        showLoader({ show: false });
    }
});
