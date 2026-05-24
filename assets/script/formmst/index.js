import 'select2/dist/css/select2.min.css';
import select2 from 'select2';
import { showLoader } from '@amec/webasset/preloader';
import { showErrorMessage } from '@amec/webasset/utils';
import { setSelect2 } from '@amec/webasset/select2';
import { createTable } from '@amec/webasset/dataTable';
import { initApp, tableOption, tableFillSelect } from '../utils';
import { getFormMaster, getFormDept } from './data';

var table;
select2();
$(document).ready(async function (e) {
    showLoader();
    const app = await initApp({ submenu: '.admin' });
    if (!app) return;
    try {
        const data = await getFormMaster();
        const dept = await getFormDept();
        const mergedData = data.map((item) => {
            const deptInfo = dept.find((d) => d.link.includes(item.VORGNO));
            return {
                ...item,
                deptname: deptInfo ? deptInfo : null,
            };
        });

        await reloadTable();
        await bindEvents();
        // const tableOption = await createTableOption(mergedData);
        // table = await createTable(tableOption);
    } catch (error) {
        console.log(error);
        showErrorMessage();
        return;
    } finally {
        await showLoader({ show: false });
    }
});

async function populateFilters(data, dept) {
    const department = dept.map((owner) => ({
        value: owner.id,
        text: owner.name,
    }));
    await tableFillSelect('#table-owner-filter', department, 'value', 'text');
    await setSelect2({
        element: $('#table-owner-filter'),
        placeholder: 'Filter by VORGNO',
    });
}

function bindEvents() {
    $('#table-search').on('input', function () {
        table.search($(this).val()).draw();
    });

    $('#table-owner-filter').on('change', function () {
        table
            .column(0)
            .search('^' + $(this).val() + '$', true, false)
            .draw();
    });

    $('#reset-filter').on('click', function () {
        $('#table-search').val('');
        $('#table-owner-filter').val('').trigger('change.select2');

        table.search('');
        table.columns().search('');
        table.page('first').draw('full-reset');
    });
}

async function reloadTable() {
    const data = await getFormMaster();
    const dept = await getFormDept();
    const mergedData = data.map((item) => {
        const deptInfo = dept.find((d) => d.link.includes(item.VORGNO));
        return {
            ...item,
            deptname: deptInfo ? deptInfo : null,
        };
    });

    await populateFilters(mergedData, dept);
    if (!table) {
        await createTableOption(mergedData);
    } else {
        table.clear();
        table.rows.add(data);
        table.draw();
    }
}

async function createTableOption(data) {
    const opt = { ...tableOption };
    opt.dom = `dom: '<"flex mb-3 items-center"<"flex-1"><"flex-none flex flex-row gap-2 table-option">><"bg-white border border-slate-300 rounded-lg overflow-x-auto my-5"t><"flex flex-col items-center gap-3 mt-5 lg:flex-row"<"flex-1"p><"flex-none flex gap-3 items-center table-foot-option"i>>`;
    opt.data = data;
    opt.pageLength = 10;
    opt.order = [
        [3, 'asc'],
        [4, 'asc'],
        [2, 'asc'],
    ];
    opt.columns = [
        { data: 'deptname.id', className: 'hidden' },
        {
            data: 'deptname',
            title: 'DEPT.',
            className: 'sticky-column',
            render: function (data, type, row) {
                if (data === null) return '-';
                return data.code.toUpperCase();
            },
        },
        { data: 'NNO', title: 'NNO', className: 'text-center sticky-column' },
        {
            data: 'VORGNO',
            title: 'VORGNO',
            className: 'text-center sticky-column',
        },
        {
            data: 'CYEAR',
            title: 'CYEAR',
            className: 'text-center sticky-column',
        },
        { data: 'VANAME', title: 'VANAME' },
        {
            data: 'VNAME',
            title: 'Form Name',
            class: `text-left w-[650px] min-w-[650px]`,
            render: function (data, type, row) {
                return `<div class="flex flex-col gap-1">
                    <div class="font-bold">${data}</div>
                    <div class="text-sm text-gray-600">${row.VDESC == null ? '' : row.VDESC}</div>
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
        {
            data: null,
            title: 'Action',
            orderable: false,
            className: 'text-center',
            render: function (data, type, row) {
                return `<a href="${process.env.APP_ENV}/webform/formmaster/detail/${row.VORGNO}" class="btn btn-sm btn-primary">Edit</a>`;
            },
        },
    ];
    table = await createTable(opt);
}
