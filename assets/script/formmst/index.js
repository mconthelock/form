import { showLoader } from '@amec/webasset/preloader';
import { showErrorMessage } from '@amec/webasset/utils';
import { createTable } from '@amec/webasset/dataTable';
import { initApp, tableOption } from '../utils';
import { getFormMaster, getFormDept } from './data';

var table;
$(document).ready(async function (e) {
    showLoader();
    const app = await initApp({ submenu: '.admin' });
    if (!app) return;
    try {
        const data = await getFormMaster();
        const dept = await getFormDept();
        console.log(dept);

        const mergedData = data.map((item) => {
            const deptInfo = dept.find((d) => d.link.includes(item.VORGNO));
            return {
                ...item,
                deptname: deptInfo ? deptInfo : null,
            };
        });
        const tableOption = await createTableOption(mergedData);
        table = await createTable(tableOption);
    } catch (error) {
        console.log(error);
        showErrorMessage();
        return;
    } finally {
        await showLoader({ show: false });
    }
});

async function createTableOption(data) {
    const opt = { ...tableOption };
    opt.data = data;
    opt.pageLength = 10;
    opt.order = [
        [2, 'asc'],
        [3, 'asc'],
        [1, 'asc'],
    ];
    opt.columns = [
        {
            data: 'deptname',
            title: 'DEPT.',
            render: function (data, type, row) {
                if (data === null) return '-';
                return data.code.toUpperCase();
            },
        },
        { data: 'NNO', title: 'NNO', className: 'text-center' },
        { data: 'VORGNO', title: 'VORGNO', className: 'text-center' },
        { data: 'CYEAR', title: 'CYEAR', className: 'text-center' },
        { data: 'VANAME', title: 'VANAME' },
        {
            data: 'VNAME',
            title: 'Form Name',
            class: `text-left w-[750px] min-w-[750px]`,
            render: function (data, type, row) {
                return `<div class="flex flex-col gap-1">
                    <div class="font-bold">${data}</div>
                    <div class="text-sm text-gray-600">${row.VDESC == null ? '' : row.VDESC}</div>
                    <div class="text-sm text-primary">${row.VFORMPAGE == null ? '' : row.VFORMPAGE}</div>
                 </div>`;
            },
        },

        {
            data: 'formmstGroup',
            title: 'Group',
            render: function (data, type, row) {
                if (data == null) return 'General';
                return '';
            },
        },
        {
            data: 'CSTATUS',
            title: 'Status',
            className: 'text-center',
            render: function (data, type, row) {
                if (type === 'display') {
                    if (data === '1')
                        return '<div class="badge badge-success">Active</div>';
                    else return '<div class="badge badge-error">Inactive</div>';
                }
                return data;
            },
        },
    ];
    return opt;
}
