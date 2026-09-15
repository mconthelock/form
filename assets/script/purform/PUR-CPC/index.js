import {
    getUrlParams,
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

/**
 * Handle input event for requester field and update profile card accordingly.
 */
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

/**
 * Handle change event for requester field and validate its length.
 */
$(document).on('change', 'input[name="requester"]', async function () {
    try {
        const requester = $(this).val();
        if (requester.length < 5) {
            showMessage('Requester must be at least 5 characters', 'warning');
            $(this).val('');
        }
    } catch (error) {
        console.error(error);
        showErrorMessage(error.message);
    }
});

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
