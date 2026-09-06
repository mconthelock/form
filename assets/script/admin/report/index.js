import 'select2/dist/css/select2.min.css';
import select2 from 'select2';
import { showLoader } from '@amec/webasset/preloader';
import { showErrorMessage, showConfirm } from '@amec/webasset/utils';
import { setSelect2 } from '@amec/webasset/select2';
import { createTable } from '@amec/webasset/dataTable';
import { tableOption, tableFillSelect } from '../../utils';
import { getFormDept, getReportMaster } from '../../service';

var table;
select2();
$(document).ready(async function (e) {
    try {
        await reloadTable();
        await bindEvents();
    } catch (error) {
        console.error(error);
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

    await tableFillSelect('#report-owner', department, 'value', 'text');
    await setSelect2({
        element: $('#report-owner'),
        placeholder: 'Selected Owner',
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
    const data = await getReportMaster();
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
    opt.dom = `<"flex mb-3 items-center"<"flex-1"><"flex-none flex flex-row gap-2 table-option">><"bg-white border border-slate-300 rounded-lg overflow-x-auto my-5"t><"flex flex-col items-center gap-3 mt-5 lg:flex-row"<"flex-1"p><"flex-none flex gap-3 items-center table-foot-option"i>>`;
    opt.data = data;
    opt.pageLength = 10;
    opt.order = [[0, 'asc']];
    opt.columns = [
        { data: 'deptname', title: 'Owner' },
        {
            data: 'VNAME',
            title: 'Report Name',
            render: (data, type, row) => {
                if (type == 'display') {
                    return `<div>${data}</div><div>${row.VURL}</div>`;
                }
                return data ? data : '';
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
            data: 'ID',
            title: 'Action',
            className: 'text-center w-32',
            sortable: false,
        },
    ];
    table = await createTable(opt);
}

$(document).on('click', '#save-report', async function (e) {
    e.preventDefault();
    let check = true;
    const el = $('#report-detail-section');
    el.find('.input.req, .select.req').map((_, req) => {
        if (req.value.trim() === '') {
            $(req).addClass('input-error');
            //add error class to select2 element
            if ($(req).hasClass('select')) {
                $(req)
                    .next('.select2-container')
                    .find('.select2-selection')
                    .addClass('border-error!');
            }
            check = false;
        } else {
            $(req).removeClass('input-error');
            if ($(req).hasClass('select')) {
                $(req)
                    .next('.select2-container')
                    .find('.select2-selection')
                    .removeClass('border-error!');
            }
        }
    });
    if (!check) return;

    const data = {
        VORGNO: $('#report-owner').val(),
        VNAME: $('#report-name').val(),
        VURL: $('#report-url').val(),
        CSTAUS: '1',
    };

    if ($('#report-id').val() == '') {
        await createReport(data);
    } else {
        data = { ...data, ID: $('#report-id').val() };
        await updateReport(data);
    }
    // const reportName = $('#report-name').val();
    // const reportOwner = $('#report-owner').val();
    // const reportUrl = $('#report-url').val();
});
