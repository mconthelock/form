import 'select2/dist/css/select2.min.css';
import select2 from 'select2';
import { showLoader } from '@amec/webasset/preloader';
import { showErrorMessage } from '@amec/webasset/utils';
import { createTable } from '@amec/webasset/dataTable';
import { setSelect2 } from '@amec/webasset/select2';
import { tableOption } from '../../utils';
import { getFormDept, getFormMasterGroup } from '../../service';
import { createFormMasterGroup, updateFormMasterGroup } from './data';

var table;
select2();
$(document).ready(async function (e) {
    try {
        const data = await getFormMasterGroup();
        const deptData = await getFormDept();
        const mergedData = data.map((item) => {
            const deptInfo = deptData.find((d) =>
                d.link.includes(item.VGROUPORG),
            );
            return {
                ...item,
                deptname: deptInfo ? deptInfo : null,
            };
        });
        await createTableOption(mergedData);
        await renderForm(deptData);
    } catch (error) {
        console.log(error);
        showErrorMessage();
        return;
    } finally {
        await showLoader({ show: false });
    }
});

$(document).on('click', '.edit-group', function (e) {
    e.preventDefault();
    const groupId = $(this).data('id');
    const groupOrg = $(this).data('org');
    const groupData = table
        .rows()
        .data()
        .toArray()
        .find((item) => item.VGROUPORG === groupOrg && item.VGROUP === groupId);
    if (!groupData) {
        showErrorMessage('Group data not found');
        return;
    }

    $('#vgrouporg').val(groupData.VGROUPORG).trigger('change');
    $('#vgroupname').val(groupData.VGROUPNAME);
    $('#vgroup').val(groupData.VGROUP);
    $('#reset-group-btn').prop('disabled', false);
    $('#save-group-btn').text('Update Data');
});

$(document).on('click', '#reset-group-btn', function (e) {
    e.preventDefault();
    $('#vgrouporg').val('').trigger('change');
    $('#vgroupname').val('');
    $('#vgroup').val('');
    $('#reset-group-btn').prop('disabled', true);
    $('#save-group-btn').text('Save Data');
});

$(document).on('click', '#save-group-btn', async function (e) {
    e.preventDefault();
    try {
        if (!$('#vgrouporg').val() || !$('#vgroupname').val()) {
            showErrorMessage('Please fill in all required fields');
            return;
        }

        let result;
        if ($('#vgroup').val() == '') {
            const saveData = {
                VGROUPORG: $('#vgrouporg').val(),
                VGROUPNAME: $('#vgroupname').val(),
            };
            result = await createFormMasterGroup(saveData);
        } else {
            const saveData = {
                VGROUPORG: $('#vgrouporg').val(),
                VGROUPNAME: $('#vgroupname').val(),
                VGROUP: $('#vgroup').val(),
            };
            result = await updateFormMasterGroup(saveData);
        }
        $('#reset-group-btn').prop('disabled', true);
        $('#save-group-btn').text('Save Data');
        $('#vgrouporg').val('').trigger('change');
        $('#vgroupname').val('');
        $('#vgroup').val('');

        const data = await getFormMasterGroup();
        const deptData = await getFormDept();
        const mergedData = data.map((item) => {
            const deptInfo = deptData.find((d) =>
                d.link.includes(item.VGROUPORG),
            );
            return {
                ...item,
                deptname: deptInfo ? deptInfo : null,
            };
        });
        await createTableOption(mergedData);
    } catch (error) {
        console.log(error);
        showErrorMessage();
        return;
    }
});

async function renderForm(deptData) {
    const dept = [];
    deptData.map((owner) => {
        dept.push({
            value: owner.link[0],
            text: `${owner.name} (${owner.link[0]})`,
        });
    });
    const vorgno = $('#vgrouporg');
    vorgno.find('option:not(:first)').remove();
    dept.forEach((item) => {
        vorgno.append(`<option value="${item.value}">${item.text}</option>`);
    });
    await setSelect2({
        element: '#vgrouporg',
        placeholder: 'Select Owner',
    });
}

async function createTableOption(data) {
    const opt = { ...tableOption };
    opt.dom =
        '<"overflow-x-auto"t><"dt-footer-bar px-4 py-3 bg-base-100 border-t border-base-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs wf-mute"<"table-info"i><"table-page"p>>';
    opt.pagingType = 'simple_numbers';
    opt.language = {
        ...tableOption.language,
        info: 'Showing <strong class="text-primary">_START_ - _END_</strong> of <strong class="text-primary">_TOTAL_</strong> records',
        infoEmpty:
            'Showing <strong class="text-primary">0 - 0</strong> of <strong class="text-primary">0</strong> records',
        paginate: {
            previous: '«',
            next: '»',
            first: '«',
            last: '»',
        },
    };
    opt.data = data;
    opt.pageLength = 10;
    opt.columns = [
        {
            data: 'VGROUPORG',
            title: 'Group Code',
            className: 'text-left! font-mono font-semibold text-primary',
        },
        { data: 'deptname.name', title: 'DEPT.', className: 'text-left!' },
        { data: 'VGROUPNAME', title: 'Group Name' },
        {
            data: null,
            title: 'Action',
            className: 'text-center',
            sortable: false,
            render: function (data, type, row) {
                return `<a href="#" class="btn btn-xs btn-outline btn-primary edit-group" data-id="${row.VGROUP}" data-org="${row.VGROUPORG}" title="Edit Group"><i class="fi fi-sr-pen-swirl text-sm"></i></a>`;
            },
        },
    ];
    const stylePagination = function () {
        const pagination = $(this).closest('.dt-container').find('.dt-paging');
        const nav = pagination.find('nav');
        nav.addClass('join');
        nav.find('.dt-paging-button').each(function () {
            const btn = $(this);
            const isCurrent = btn.hasClass('current');
            const isDisabled = btn.hasClass('disabled');

            btn.removeClass(
                'btn-primary btn-outline border-base-300 btn-disabled',
            ).addClass('join-item btn btn-xs');

            if (isCurrent) {
                btn.addClass('btn-primary');
            } else {
                btn.addClass('btn-outline border-base-300');
            }

            if (isDisabled && !isCurrent) {
                btn.addClass('btn-disabled');
            }
        });

        nav.find('.ellipsis').addClass(
            'join-item btn btn-xs btn-outline border-base-300 btn-disabled',
        );
    };
    opt.drawCallback = stylePagination;
    opt.initComplete = function (settings, json) {
        tableOption.initComplete.call(this, settings, json);
        stylePagination.call(this);
    };
    table = await createTable(opt);
}
