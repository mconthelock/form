import 'select2/dist/css/select2.min.css';
import dayjs from 'dayjs';
import select2 from 'select2';
import { showLoader } from '@amec/webasset/preloader';
import { showErrorMessage, showMessage } from '@amec/webasset/utils';
import { setSelect2 } from '@amec/webasset/select2';
import { createBtn, activatedBtnRow } from '@amec/webasset/components/buttons';
import {
    getAmecUsers,
    getFormMaster,
    getFormDept,
    getFormMasterGroup,
} from '../../service';
import { createFormMaster, updateFormMaster } from './data';

select2();
var cyear, orgno, nno;

$(document).ready(async function (e) {
    try {
        const master = await getFormMaster();
        const fornno = await setFormNo();
        var data = [];
        if (fornno !== null) {
            data = master.find(
                (item) =>
                    item.NNO == nno &&
                    item.VORGNO == orgno &&
                    item.CYEAR == cyear,
            );
            if (!data) {
                showErrorMessage('Form not found');
                return;
            }
        }
        await setFormInit(data);
    } catch (error) {
        console.log(error);
        showErrorMessage(error);
        return;
    } finally {
        await showLoader({ show: false });
    }
});

async function setFormNo() {
    const path = window.location.pathname;
    const pathSegments = path.split('/').filter((segment) => segment !== '');
    cyear = pathSegments[pathSegments.length - 1];
    orgno = pathSegments[pathSegments.length - 2];
    nno = pathSegments[pathSegments.length - 3];
    if (cyear == 'detail') return null;
    return `${nno}/${orgno}/${cyear}`;
}

async function setFormInit(data) {
    //VORGNO select
    const dept = [];
    const deptData = await getFormDept();
    deptData.map((owner) => {
        const links = owner.link.map((link) => {
            dept.push({
                value: link,
                text: `${link} : ${owner.name}`,
            });
        });
    });
    const vorgno = $('#vorgno');
    vorgno.find('option:not(:first)').remove();
    dept.forEach((item) => {
        vorgno.append(`<option value="${item.value}">${item.text}</option>`);
    });
    await setSelect2({
        element: '#vorgno',
        placeholder: 'Select Owner',
    });

    //Form Group select
    const groupData = await getFormMasterGroup();
    const groupfilter = groupData.filter((item) => {
        return deptData.find(
            (d) =>
                d.link.includes(item.VGROUPORG) && d.link.includes(data.VORGNO),
        );
    });

    const group = groupfilter.map((item) => ({
        value: item.VGROUP,
        text: item.VGROUPNAME,
    }));
    const formgroup = $('#formgroup');
    formgroup.find('option:not(:first)').remove();
    group.forEach((item) => {
        formgroup.append(`<option value="${item.value}">${item.text}</option>`);
    });
    await setSelect2({
        element: '#formgroup',
        placeholder: 'Select Group',
    });

    //Developer select
    const amecuser = await getAmecUsers();
    const users = amecuser.filter(
        (user) => user.CSTATUS == '1' && user.SDEPCODE == '050601',
    );
    const userOptions = users.map((user) => ({
        value: user.SEMPNO,
        text: `${user.SNAME} (${user.SEMPNO})`,
    }));
    const developer = $('#developer');
    userOptions.forEach((item) => {
        developer.append(`<option value="${item.value}">${item.text}</option>`);
    });
    await setSelect2({
        element: '#developer',
        placeholder: 'Select Developer',
    });

    await setFormValue(data);
    await setFormAction(data.length == 0 ? 1 : 2);
}

async function setFormValue(data) {
    if (data.length == 0) {
        $('#nno').addClass('hidden');
        $('#cyear').addClass('hidden');
        return;
    }
    data = { ...data, DCREDATE: dayjs(data.DCREDATE).format('YYYY-MM-DD') };
    $('#form-info')
        .find('input, textarea')
        .each(function () {
            const mapping = $(this).attr('data-mapping');
            if (mapping && data[mapping] !== undefined) {
                if ($(this).hasClass('fdate')) {
                    const date = new Date(data[mapping]);
                    const formattedDate = date.toISOString().split('T')[0];
                    $(this).val(formattedDate);
                } else {
                    $(this).val(data[mapping]);
                }
            }
        });

    $('#form-info')
        .find('select')
        .each(function () {
            const mapping = $(this).attr('data-mapping');
            if (mapping && data[mapping] !== undefined) {
                $(this).val(data[mapping]).trigger('change');
            }
        });

    $('#vorgno').prop('disabled', true);
    //$('#nno').prop('readonly', true);
    //$('#cyear').prop('readonly', true);
}

async function setFormAction(mode) {
    const addFormBtn = await createBtn({
        id: 'add-form-btn',
        title: 'Create New Form',
        icon: 'fi fi-ss-add text-xl',
        className: 'btn-primary',
    });

    const editFormBtn = await createBtn({
        id: 'edit-form-btn',
        title: 'Save Changes',
        icon: 'fi fi-rr-disk text-xl',
        className: 'btn-primary',
    });

    const backBtn = await createBtn({
        id: 'back-btn',
        title: 'Back to List',
        icon: 'fi fi-rr-angle-left text-xl',
        className: 'btn btn-outline border-base-300',
        type: 'link',
        href: `${process.env.APP_ENV}/admin/formmaster/`,
    });
    if (mode == 1) $('.btn-container').append(addFormBtn, backBtn);
    else $('.btn-container').append(editFormBtn, backBtn);
}

//Flow Master
$(document).on('click', '.add-flow', async function (e) {
    e.preventDefault();
    $('#flow-form')[0].reset();
    $('#add-flow-form').toggleClass('hidden');
    $('#flow-list').toggleClass('hidden');
});

$(document).on('click', '#edit-form-btn', async function (e) {
    e.preventDefault();
    try {
        $('#form-info')
            .find('.req-1')
            .each(function () {
                if ($(this).val().trim() === '') {
                    showErrorMessage('Please fill in all required fields');
                    $(this).focus();
                    throw new Error('Required field is empty');
                }
            });

        await activatedBtnRow($(this), true);
        const data = await formValue();
        const result = await updateFormMaster(data);
        if (result) {
            showMessage('Form updated successfully', 'success');
        } else {
            showErrorMessage(result.message || 'Error updating form');
        }
    } catch (error) {
        console.error(error);
        showErrorMessage(error.responseJSON?.message || 'Error updating form');
    } finally {
        await activatedBtnRow($(this), false);
    }
});

async function formValue() {
    const formData = {};
    $('#form-info')
        .find('input, textarea')
        .each(function () {
            const mapping = $(this).attr('data-mapping');
            if (mapping) {
                formData[mapping] = $(this).val();
            }
        });

    $('#form-info')
        .find('select')
        .each(function () {
            const mapping = $(this).attr('data-mapping');
            if (mapping) {
                formData[mapping] = $(this).val();
            }
        });
    return formData;
}
