import 'select2/dist/css/select2.min.css';
import select2 from 'select2';
import { showLoader } from '@amec/webasset/preloader';
import { showErrorMessage } from '@amec/webasset/utils';
import { createTable } from '@amec/webasset/dataTable';
import { setSelect2 } from '@amec/webasset/select2';
import { initApp, tableOption, tableFillSelect } from '../utils';
import {
    getAmecUsers,
    getFormMaster,
    getFormDept,
    getFormMasterGroup,
} from '../service';

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

        const dept = [];
        const department = deptData.map((owner) => {
            dept.push({
                value: owner.link[0],
                text: `${owner.name} (${owner.link[0]})`,
            });
        });
        const vorgno = $('#vorgno');
        vorgno.find('option:not(:first)').remove();
        dept.forEach((item) => {
            vorgno.append(
                `<option value="${item.value}">${item.text}</option>`,
            );
        });
        await setSelect2({
            element: '#vorgno',
            placeholder: 'Select Owner',
        });
    } catch (error) {
        console.log(error);
        showErrorMessage();
        return;
    } finally {
        await showLoader({ show: false });
    }
});

$(document).on('click', '#add-group-btn', function (e) {
    e.preventDefault();
    $('#add-group-form').toggleClass('hidden');
});

$(document).on('click', '#save-group-btn', function (e) {
    e.preventDefault();
    try {
        const saveData = {
            VGROUPORG: $('#VGROUPORG').val(),
            VGROUPNAME: $('#vgroupname').val(),
            VORGNO: $('#vorgno').val(),
        };
        table.row
            .add({
                VGROUPORG: '',
                VGROUPNAME: '',
                deptname: { name: '' },
            })
            .draw();
        $('#add-group-form').toggleClass('hidden');
    } catch (error) {
        console.log(error);
        showErrorMessage();
        return;
    }
});

async function createTableOption(data) {
    const opt = { ...tableOption };
    opt.dom = `dom: '<"flex mb-3 items-center"<"flex-1"><"flex-none flex flex-row gap-2 table-option">><"bg-white border border-slate-300 rounded-lg overflow-x-auto my-5"t><"flex flex-col items-center gap-3 mt-5 lg:flex-row"<"flex-1"p><"flex-none flex gap-3 items-center table-foot-option"i>>`;
    opt.data = data;
    opt.pageLength = 10;
    opt.columns = [
        { data: 'VGROUPORG', title: 'Group Code', className: 'text-left!' },
        { data: 'VGROUPNAME', title: 'Group Name' },
        { data: 'deptname.name', title: 'DEPT.', className: 'text-center' },
        {
            data: null,
            title: 'Action',
            className: 'text-center',
            sortable: false,
            render: function (data, type, row) {
                return `<a href="/form/formmst/group/${row.VGROUPORG}" class="btn btn-sm btn-primary">Edit</a>`;
            },
        },
    ];
    table = await createTable(opt);
}
