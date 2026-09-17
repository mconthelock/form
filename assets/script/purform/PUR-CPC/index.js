import {
    getUrlParams,
    logtest,
    showErrorMessage,
    showMessage,
} from '@amec/webasset/utils';
import { getUser, getUserImage } from '@amec/webasset/api/amec';

import { EmployeeProfileCard } from '@amec/webasset/components/profileCard';
import { getActivePriceConditions, getK850mpData } from './data';
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

$(document).on('submit', 'form[data-step-panel]', function (e) {
    e.preventDefault();
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

$(document).on('change', 'input[name="function"]', async function () {
    try {
        steps.function = $(this).val();
    } catch (error) {
        console.error(error);
        showErrorMessage(error.message);
    }
});

/**
 * @author Sutthipong Tangmongkhoncharoen(24008)
 * @since 2026-09-07
 * @description Handles the selection of an Excel file for upload.
 */
$(document).on('change', '#excel-file', function () {
    const file = this.files[0];
    if (!file) {
        $('#selected-file-name')
            .text('Please select an Excel file')
            .removeClass('text-success');
        return;
    }

    const size = (file.size / 1024 / 1024).toFixed(2);
    $('#selected-file-name').html(`
        <i class="fi fi-sr-file-excel text-success"></i>
        ${file.name}
        <span class="text-base-content/50">(${size} MB)</span>
    `);
});

async function setProfileCard(empno, containner, title = 'Requester') {
    const k850mpData = await getK850mpData();
    const k850mpRecord = k850mpData.data.filter(
        (record) => record.K85M03 === empno,
    );
    if (k850mpRecord.length === 0) {
        $(containner).empty();
        steps.plannerCode = null;
        $('input[name="requester"]').val('');
        showMessage('Planner not found', 'warning');
        return;
    }
    const empnoData = await getUser(empno);
    const userImage = await getUserImage(empno);
    if (!empnoData) {
        steps.requester = null;
        $(containner).empty();
        $('input[name="requester"]').val('');
        showMessage('Requester not found', 'warning');
        return;
    }
    steps.requester = empno;
    steps.plannerCode = k850mpRecord.map((record) => record.K85M02);
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
