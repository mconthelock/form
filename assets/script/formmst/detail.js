import 'select2/dist/css/select2.min.css';
import select2 from 'select2';
import { showLoader } from '@amec/webasset/preloader';
import { showErrorMessage } from '@amec/webasset/utils';
import { setSelect2 } from '@amec/webasset/select2';
import { createTable } from '@amec/webasset/dataTable';
import { createBtn } from '@amec/webasset/components/buttons';
import { initApp, tableOption, tableFillSelect } from '../utils';
import { getAmecUsers, getFormMaster, getFormDept } from '../service';

select2();
var cyear, orgno, nno;
$(document).ready(async function (e) {
    try {
        const master = await getFormMaster();
        const fornno = await setFormNo();
        await setFormInit();
        if (fornno == null) {
            //create new form
            $('#nno').addClass('hidden');
            $('#cyear').addClass('hidden');
            await setFormAction(1);
        } else {
            const data = master.find(
                (item) =>
                    item.NNO == nno &&
                    item.VORGNO == orgno &&
                    item.CYEAR == cyear,
            );
            if (!data) {
                showErrorMessage('Form not found');
                return;
            }
            await setFormValue(data);
            await setFormAction(2);
        }
    } catch (error) {
        console.log(error);
        showErrorMessage();
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

async function setFormInit() {
    //populate vorgno select
    const dept = [];
    const deptData = await getFormDept();
    const department = deptData.map((owner) => {
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
    await setSelect2({
        element: '#formgroup',
        placeholder: 'Select Group',
    });

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
}

async function setFormValue(data) {
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
                console.log(mapping, data[mapping]);
                $(this).val(data[mapping]).trigger('change');
            }
        });

    $('#vorgno').prop('disabled', true);
    $('#nno').prop('readonly', true);
    $('#cyear').prop('readonly', true);
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
        className: 'btn-ghost',
        type: 'link',
        href: `${process.env.APP_ENV}/webform/formmaster/`,
    });
    if (mode == 1) $('.btn-container').append(addFormBtn, backBtn);
    else $('.btn-container').append(editFormBtn, backBtn);
}
