import { fetchUtils } from '@amec/webasset/api/fetch-utils';
import { getFormDetail } from '@amec/webasset/api/webform';
import { webflowSubmit } from '@amec/webasset/components/form';
import { redirectWebflow } from '@amec/webasset/form';
import { logFormData, requiredForm, showMessage } from '@amec/webasset/utils';
import {
    renderPurpose,
    getConfig,
    getEmpData,
    toggleStandard,
    toggleOther,
    createForm,
} from './data';

function toggleNameStampByPurpose() {
    const purposeId = $('#purposeList input[name="PURPOSE_ID"]:checked').val();
    $('#stampCircle-name, #nameInput').toggleClass('hide', purposeId == '2');
}

// ฟังก์ชันหลักที่ทำงานเมื่อโหลดหน้า
$(async function () {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const empno = urlParams.get('empno');
    $('#INPUTBY').val(empno);
    await renderPurpose();

    await toggleStandard('1');
    await toggleOther('1');
    const action = webflowSubmit({ request: true });
    $('#sentRequest').html(action);
});

// เมื่อเปลี่ยน REQBY
$(document).on('change', '#REQBY', async function (e) {
    e.preventDefault();
    try {
        const empData = await getEmpData($(this).val());
        if (!empData || !empData.SNAME) {
            showMessage('Employee data not found', 'error');
            $(this).val('');
            $(this).focus();
            return;
        }
        $('#empName').val(empData.SNAME);
        $('#empDept').val(`${empData.SSEC}/${empData.SDEPT}/${empData.SDIV}`);
        $('#empPos').val(empData.SPOSNAME);
        $('#empPosCode').val(empData.SPOSCODE);
        const config = await getConfig();
        const selectedConfig = config.find(
            (c) => c.SPOSCODE === empData.SPOSCODE,
        );
        const nameParts = empData.SNAME.split(' ');
        $('#nameInput').val(nameParts[0]);
        $('#stampCircle-name').html(nameParts[0]);
        toggleNameStampByPurpose();
        $('#stampSize').html(selectedConfig.SIZE_MM + ' mm.');

        if (selectedConfig.STAMP_TYPE == '2') {
            $('#stampCircle-label').html(empData.SDIV);
        } else {
            $('#stampCircle-label').html('AMEC');
        }

    } catch (error) {
        console.log(error);
    }
});

$(document).on('input', '#nameInput', function () {
    const inputVal = $(this).val();
    $('#stampCircle-name').html(inputVal);
});

$(document).on('change', '#purposeList input[name="PURPOSE_ID"]', function () {
    toggleNameStampByPurpose();
});

$(document).on('change', '.stampFormatGroup', async function () {
    const value = $(this).val();
    await toggleStandard(value);
    await toggleOther(value);
});

// ฟังก์ชันจัดการการคลิกปุ่ม Request เพื่อส่งข้อมูลฟอร์ม
$(document).on('click', '#btnRequest', async function () {
    try {
        if ($('.stampFormatGroup:checked').val() == '1') {
            const requiredMessage = [
                {
                    element: $('#REQBY'),
                    message: 'Please fill the Request Code',
                },
                {
                    element: $('#stampCircle-name'),
                    message: 'Please fill the Name',
                },
                {
                    // แก้ selector เดิมที่ quote ปิดผิด
                    element: $('#purposeList input[name="PURPOSE_ID"]'),
                    message: 'Please select the Purpose',
                },
            ];
            if (
                $('#purposeList input[name="PURPOSE_ID"]:checked').attr(
                    'data-purpose-group',
                ) == '3'
            ) {
                $('#otherSelect').addClass('req');
                requiredMessage.push({
                    element: $('#otherSelect'),
                    message: 'Please fill the other purpose',
                });
            } else {
                $('#otherSelect').removeClass('req');
            }
            if (!(await requiredForm(`#rbForm`, requiredMessage))) return;
        } else {
            const requiredMessage = [
                {
                    element: $('#REQBY'),
                    message: 'Please fill the Request Code',
                },
                {
                    element: $('#otherReason'),
                    message: 'Please fill Reason for Other Stamp',
                },
                {
                    element: $('#otherQty'),
                    message: 'Please fill Quantity for Other Stamp',
                },
                {
                    element: $('#otherAttachment'),
                    message: 'Please fill Attachment for Other Stamp',
                },
            ];
            if (!(await requiredForm(`#rbForm`, requiredMessage))) return;
        }

        const formData = new FormData($(`#rbForm`)[0]);
        formData.set('REMARK', $('#remark').val());
        logFormData(formData);
        const res = await createForm(formData);
        if (res.status == true) {
            showMessage(res.message, 'success');
            redirectWebflow();
        } else {
            throw new Error(res.message);
        }
    } catch (error) {
        console.log(error);
        showMessage(error.message);
    }
});

