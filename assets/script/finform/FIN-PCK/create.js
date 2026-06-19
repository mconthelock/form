import { webflowSubmit, getformDetail } from '@amec/webasset/components/form';
import { showLoader } from '@amec/webasset/preloader';
import { formSubmitSkeleton } from '@amec/webasset/skeleton';
import { readInput } from '@amec/webasset/excel';
import { getArrayBufferFile } from '@amec/webasset/file';
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
import { getLocMstData } from './dataloc';

$(async function () {
    $(document).on('click', '#btnRequest', async function () {
        console.log('xxxx');

        console.log(locmstdata);

        console.log('yyyy');
        //let locmst = await getLocMstData();
        //console.log(locmst);
    });
});

async function prepareData(excelData) {
    const locmstdata = await getLocMstData({});
    const empLoopup = {};
    locmstdata.forEach((loc) => {
        const empNo = loc.INC?.EMPINFO?.SEMPNO || '';
        empLookup[loc.LOCCODE] = empNo;
    });
    const groupedResult = {};
}
