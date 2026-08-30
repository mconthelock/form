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
    getFlowMaster,
    populateOrganizations,
    getPositions,
} from '../../service';
import { setFormNo, createFormMaster, updateFormMaster } from './data';

select2();
$(document).ready(async function (e) {
    try {
        const master = await getFormMaster();
        const formno = await setFormNo();
        if (formno === null) {
            showErrorMessage('Form Master not found');
            return;
        }

        const data = master.find(
            (item) =>
                item.NNO == formno.nno &&
                item.VORGNO == formno.orgno &&
                item.CYEAR == formno.cyear,
        );

        await setFormInit(data);
        await setFlowMaster(formno);
    } catch (error) {
        console.log(error);
        showErrorMessage(error);
        return;
    } finally {
        await showLoader({ show: false });
    }
});

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
const FLOW_PAGE_SIZE = 5;
let flowState = { sortFlow: [], orgList: [], posList: [], currentPage: 1 };

async function setFlowMaster(formno) {
    const { orgList, posList } = await setApproverType();
    const flow = await getFlowMaster(formno.nno, formno.orgno, formno.cyear);
    let sortFlow = [];
    const firstFlow = flow.find((f) => f.CSTART == '1');
    sortFlow.push(firstFlow);
    let currentFlow = firstFlow;
    while (currentFlow) {
        const nextFlow = flow.find((f) => f.CSTEPNO == currentFlow.CSTEPNEXTNO);
        if (nextFlow) {
            sortFlow.push(nextFlow);
            currentFlow = nextFlow;
        } else {
            break;
        }
    }

    flowState = { sortFlow, orgList, posList, currentPage: 1 };
    renderFlowPage();
}

function renderFlowPage() {
    const { sortFlow, orgList, posList } = flowState;
    const totalPages = Math.max(1, Math.ceil(sortFlow.length / FLOW_PAGE_SIZE));
    const page = Math.min(Math.max(1, flowState.currentPage), totalPages);
    flowState.currentPage = page;
    const start = (page - 1) * FLOW_PAGE_SIZE;
    const pageItems = sortFlow.slice(start, start + FLOW_PAGE_SIZE);

    const el = $('#flow-list-row');
    el.empty();
    for (const fs of pageItems) {
        el.append(`<details class="collapse bg-base-100 border border-base-300" name="flow-accordion">
            <summary class="collapse-title font-semibold flex justify-between p-4!">
                <div class="flex gap-2 items-center">
                    <span class="flex w-10 h-10 items-center justify-center bg-amber-300 rounded-full">${fs.STEPMST.CNO}</span>
                    <div class="flex-1 flex flex-col gap-1">
                        <span class="text-gray-500 text-sm">${fs.STEPMST.VNAME}</span>
                        <span class="text-gray-500 text-xs">${fs.VAPVNO}</span>
                    </div>
                </div>
                <div>
                    <button class="btn btn-sm btn-circle"><i class="fi fi-rr-arrow-small-up"></i></button>
                    <button class="btn btn-sm btn-circle"><i class="fi fi-rr-arrow-small-down"></i></button>
                </div>
            </summary>
            <div class="collapse-content text-sm">
                <fieldset class="fieldset w-full">
                    <legend class="fieldset-legend">Page Location</legend>
                    <label class="input validator w-full">
                        <i class="fi fi-br-link-alt text-gray-400"></i>
                        <input type="url" placeholder="https://"
                            value="${fs.VURL == null ? 'https://' : fs.VURL}"/>
                    </label>
                </fieldset>

                <fieldset class="fieldset">
                    <legend class="fieldset-legend">Approver</legend>
                    <div class="flex flex-col gap-1">
                        <div class="flex gap-2 items-center">
                            <input type="radio" name="approver-${fs.STEPMST.CNO}" class="radio radio-primary radio-sm" ${fs.CTYPE == 1 ? 'checked' : ''}/>
                            <select class="select w-full s2">
                                <option value=""></option>
                                ${posList.map((pos) => `<option value="${pos.SPOSCODE}" ${fs.CTYPE == '1' && fs.VPOSNO == pos.SPOSCODE ? 'selected' : ''}>${pos.SPOSCODE} : ${pos.SPOSITION}</option>`).join('')}
                            </select>
                        </div>
                        <p class="label ml-10 mb-1">Refer requester</p>

                        <div class="flex gap-2 items-center">
                            <input type="radio" name="approver-${fs.STEPMST.CNO}" class="radio radio-primary radio-sm" ${fs.CTYPE == 2 ? 'checked' : ''}/>
                            <select class="select w-full s2">
                                <option value=""></option>
                                ${orgList.map((og) => `<option value="${og.pos}-${og.org}" ${fs.CTYPE == '2' && fs.VPOSNO == og.pos && fs.VAPVORGNO == og.orgs ? 'selected' : ''}>${og.pos} : ${og.orgname} ${og.posname}</option>`).join('')}
                            </select>
                        </div>
                        <p class="label ml-10 mb-1">Refer to Form Owner</p>

                        <div class="flex gap-2 items-center">
                            <input type="radio" name="approver-${fs.STEPMST.CNO}" class="radio radio-primary radio-sm" ${fs.CTYPE == 3 ? 'checked' : ''}/>
                            <div class="w-full">
                                <input type="text" class="input input-sm w-full" placeholder="Specific approver" value="${fs.CTYPE != 3 && fs.VAPVNO == 'SYSTEM' ? '' : fs.VAPVNO}" />
                            </div>
                        </div>
                    </div>
                </fieldset>

                <fieldset class="fieldset">
                    <legend class="fieldset-legend">Approve Type</legend>
                    <div class="flex flex-col gap-2">
                        <div class="flex gap-2 items-center">
                            <input type="radio" name="approve-type-${fs.STEPMST.CNO}" class="radio radio-primary radio-sm" ${fs.CAPVTYPE == '1' ? 'checked' : ''} />
                            <p>Single Approver</p>
                        </div>
                        <div class="flex gap-2 items-center">
                            <input type="radio" name="approve-type-${fs.STEPMST.CNO}" class="radio radio-primary radio-sm" ${fs.CAPVTYPE == '3' ? 'checked' : ''} />
                            <p>Multiple Approver</p>
                        </div>
                        <div class="divider m-0!"></div>
                        <div class="flex gap-2 items-center">
                            <input type="checkbox" name="" class="checkbox checkbox-primary checkbox-sm" ${fs.CAPPLYALL == '2' ? 'checked' : ''} value="2"/>
                            <p>Single Approver</p>
                        </div>
                    </div>
                </fieldset>

                <fieldset class="fieldset">
                    <legend class="fieldset-legend">Extra Data</legend>
                    <input type="text" class="input input-sm w-full" placeholder="Extra Data"  value="${fs.CEXTDATA || ''}"/>
                </fieldset>

                <div class="flex gap-1 mt-2">
                    <button class="btn btn-sm btn-primary update-flow" type="button">Update</button>
                    <button class="btn btn-sm btn-error delete-flow" type="button">Delete</button>
                </div>
            </div>
        </details>`);
    }
    setSelect2({
        selector: '.s2',
        placeholder: 'Select an approver',
        size: 'sm',
        containerCssClass: 'w-full',
        clear: false,
    });
    renderFlowPagination(totalPages, page);
}

function renderFlowPagination(totalPages, currentPage) {
    let pagination = $('#flow-pagination');
    if (pagination.length === 0) {
        $('#flow-list-row').after(
            '<div id="flow-pagination" class="flex justify-center gap-1 mt-4"></div>',
        );
        pagination = $('#flow-pagination');
    }
    pagination.empty();
    if (totalPages <= 1) return;

    pagination.append(
        `<button class="btn btn-sm flow-page-prev" ${currentPage === 1 ? 'disabled' : ''}><i class="fi fi-rr-angle-left"></i></button>`,
    );
    for (let i = 1; i <= totalPages; i++) {
        pagination.append(
            `<button class="btn btn-sm flow-page-item ${i === currentPage ? 'btn-primary' : 'btn-outline'}" data-page="${i}">${i}</button>`,
        );
    }
    pagination.append(
        `<button class="btn btn-sm flow-page-next" ${currentPage === totalPages ? 'disabled' : ''}><i class="fi fi-rr-angle-right"></i></button>`,
    );
}

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

$(document).on('click', '.add-flow', async function (e) {
    e.preventDefault();
    $('#flow-list-row').addClass('hidden');
    $('#add-flow-form').removeClass('hidden');
    $('#flow-form')[0].reset();
});

$(document).on('click', '#add-new-flow', async function (e) {
    e.preventDefault();
});

$(document).on('click', '#cancel-new-flow', async function (e) {
    e.preventDefault();
    $('#flow-list-row').removeClass('hidden');
    $('#add-flow-form').addClass('hidden');
    $('#flow-form')[0].reset();
});

$(document).on('click', '.update-flow', async function (e) {
    e.preventDefault();
    // Add your update flow logic here
});

$(document).on('click', '.delete-flow', async function (e) {
    e.preventDefault();
    // Add your delete flow logic here
});

$(document).on('click', '.flow-page-item', function () {
    flowState.currentPage = Number($(this).data('page'));
    renderFlowPage();
});

$(document).on('click', '.flow-page-prev', function () {
    flowState.currentPage -= 1;
    renderFlowPage();
});

$(document).on('click', '.flow-page-next', function () {
    flowState.currentPage += 1;
    renderFlowPage();
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

async function setApproverType() {
    const positions = await getPositions();
    const posList = positions.sort((a, b) =>
        a.SPOSCODE.localeCompare(b.SPOSCODE),
    );

    const orgs = await populateOrganizations();
    const orgList = [];
    const dim = positions
        .filter((p) => p.SPOSCODE == '10' || p.SPOSCODE == '11')
        .map((p) => {
            for (const div of orgs.division) {
                orgList.push({
                    pos: p.SPOSCODE,
                    posname: p.SPOSNAME,
                    orgs: div.data.SDIVCODE,
                    orgname: div.data.SDIV,
                });
            }
        });
    const dem = positions
        .filter((p) => p.SPOSCODE == '20' || p.SPOSCODE == '21')
        .map((p) => {
            for (const dept of orgs.department) {
                if (dept.data.SDEPCODE == '00') continue;
                orgList.push({
                    pos: p.SPOSCODE,
                    posname: p.SPOSNAME,
                    orgs: dept.data.SDEPCODE,
                    orgname: dept.data.SDEPT,
                });
            }
        });
    const sem = positions
        .filter((p) => p.SPOSCODE == '30')
        .map((p) => {
            for (const sec of orgs.section) {
                if (sec.data.SSECCODE == '00') continue;
                orgList.push({
                    pos: p.SPOSCODE,
                    posname: p.SPOSNAME,
                    orgs: sec.data.SSECCODE,
                    orgname: sec.data.SSEC,
                });
            }
        });

    return { orgList, posList };
}

async function setApproverType2() {}
