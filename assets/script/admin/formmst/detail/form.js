import dayjs from 'dayjs';
import { showErrorMessage, showMessage } from '@amec/webasset/utils';
import { setSelect2 } from '@amec/webasset/select2';
import { createBtn, activatedBtnRow } from '@amec/webasset/components/buttons';
import {
    getAmecUsers,
    getFormDept,
    getFormMasterGroup,
} from '../../../service';
import { createFormMaster, updateFormMaster } from '../data';
import { escapeHtml, flowState, formCache } from './state';

export function renderCreateModeFlowState() {
    $('#page-title').text('Create New Form Master');
    $('#add-flow')
        .prop('disabled', true)
        .attr('title', 'Save the new form first');
    $('#flow-search').prop('disabled', true);
    $('#flow-step-count').text('0');
    $('#flow-filter-status').text('0 steps');
    $('#flow-list-row').html(`
        <div class="border border-dashed border-base-300 bg-base-100 p-6 text-center space-y-2 mb-3">
            <div class="text-xs font-semibold text-base-content">Save Form First</div>
            <p class="text-[11px] wf-mute">Create and save the new form information on the left before configuring approval workflow steps.</p>
        </div>
    `);
}

export async function populateFormGroupsByOwner(ownerOrg) {
    const groupfilter = ownerOrg
        ? formCache.group.filter((item) =>
              formCache.dept.find(
                  (d) =>
                      d.link.includes(item.VGROUPORG) &&
                      d.link.includes(ownerOrg),
              ),
          )
        : formCache.group;

    const formgroup = $('#formgroup');
    if (formgroup.hasClass('select2-hidden-accessible')) {
        formgroup.select2('destroy');
    }
    formgroup.empty().append('<option value=""></option>');
    groupfilter.forEach((item) => {
        formgroup.append(
            `<option value="${escapeHtml(item.VGROUP)}">${escapeHtml(item.VGROUPNAME)}</option>`,
        );
    });
    await setSelect2({
        element: '#formgroup',
        placeholder: 'Select Group',
        emptyValue: false,
    });
}

export async function setFormInit(data) {
    const isNew = !data;

    // VORGNO select
    const dept = [];
    const deptData = await getFormDept();
    formCache.dept = deptData;
    deptData.map((owner) => {
        owner.link.map((link) => {
            dept.push({
                value: link,
                text: `${link} : ${owner.name}`,
            });
        });
    });
    const vorgno = $('#vorgno');
    vorgno.empty().append('<option value=""></option>');
    dept.forEach((item) => {
        vorgno.append(
            `<option value="${escapeHtml(item.value)}">${escapeHtml(item.text)}</option>`,
        );
    });
    await setSelect2({
        element: '#vorgno',
        placeholder: 'Select Owner',
        emptyValue: false,
    });

    // Form Group select
    formCache.group = await getFormMasterGroup();
    await populateFormGroupsByOwner(data?.VORGNO || '');

    // Developer select (also cache all active AMEC users for Flow Master)
    const amecuser = await getAmecUsers();
    const activeUsers = (Array.isArray(amecuser) ? amecuser : []).filter(
        (u) => u && u.CSTATUS == '1',
    );
    flowState.userList = activeUsers;
    flowState.userMap = new Map(
        activeUsers.map((u) => [String(u.SEMPNO).trim(), u]),
    );

    const devUsers = activeUsers.filter((user) => user.SDEPCODE == '050601');
    const developer = $('#developer');
    devUsers.forEach((user) => {
        developer.append(
            `<option value="${escapeHtml(user.SEMPNO)}">${escapeHtml(`${user.SNAME} (${user.SEMPNO})`)}</option>`,
        );
    });
    await setSelect2({
        element: '#developer',
        placeholder: 'Select Developer',
    });

    await setFormValue(data);
    await setFormAction(isNew ? 1 : 2);
}

export async function setFormValue(data) {
    if (!data) {
        $('#nno')
            .val('')
            .attr('placeholder', 'Auto')
            .removeClass('req-1')
            .prop('readonly', true);
        $('#cyear').val(dayjs().format('YY')).prop('readonly', true);
        $('#vorgno').prop('disabled', false);
        return;
    }
    data = {
        ...data,
        DCREDATE: dayjs(data.DCREDATE).format('YYYY-MM-DD'),
        CCREATED:
            data.CCREATED != null && data.CCREATED !== ''
                ? String(data.CCREATED)
                : '1',
    };
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
}

export async function setFormAction(mode) {
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

export async function formValue() {
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

function validateRequiredFormFields() {
    let valid = true;
    $('#form-info')
        .find('.req-1')
        .each(function () {
            const val = $(this).val();
            if (!val || String(val).trim() === '') {
                showErrorMessage('Please fill in all required fields');
                $(this).focus();
                valid = false;
                return false;
            }
        });
    return valid;
}

export async function handleAddForm($btn) {
    if (!validateRequiredFormFields()) return;
    try {
        await activatedBtnRow($btn, true);
        const data = await formValue();
        if (!data.NNO) delete data.NNO;
        const result = await createFormMaster(data);
        if (result) {
            showMessage('Form created successfully', 'success');
            const created = result.data || result;
            if (created?.NNO && created?.VORGNO && created?.CYEAR) {
                window.location.href = `${process.env.APP_ENV}/admin/formmaster/detail/${created.NNO}/${created.VORGNO}/${created.CYEAR}`;
            } else {
                window.location.href = `${process.env.APP_ENV}/admin/formmaster/`;
            }
        } else {
            showErrorMessage(result?.message || 'Error creating form');
        }
    } catch (error) {
        console.error(error);
        showErrorMessage(error?.responseJSON?.message || 'Error creating form');
    } finally {
        await activatedBtnRow($btn, false);
    }
}

export async function handleEditForm($btn) {
    if (!validateRequiredFormFields()) return;
    try {
        await activatedBtnRow($btn, true);
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
        await activatedBtnRow($btn, false);
    }
}
