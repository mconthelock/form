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
    opt.dom = `dom: '<"flex mb-3 items-center"<"flex-1"><"flex-none flex flex-row gap-2 table-option">><"bg-white border border-slate-300 rounded-lg overflow-x-auto my-5"t><"flex flex-col items-center gap-3 mt-5 lg:flex-row"<"flex-1"p><"flex-none flex gap-3 items-center table-foot-option"i>>`;
    opt.data = data;
    opt.pageLength = 10;
    opt.columns = [
        { data: 'VGROUPORG', title: 'Group Code', className: 'text-left!' },
        { data: 'deptname.name', title: 'DEPT.', className: 'text-left!' },
        { data: 'VGROUPNAME', title: 'Group Name' },
        {
            data: null,
            title: 'Action',
            className: 'text-center',
            sortable: false,
            render: function (data, type, row) {
                return `<a href="#" class="btn btn-sm btn-circle btn-primary edit-group" data-id="${row.VGROUP}" data-org="${row.VGROUPORG}"><i class="fi fi-sr-pen-swirl text-lg"></i></a>`;
            },
        },
    ];
    table = await createTable(opt);
}
