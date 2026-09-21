import 'select2/dist/css/select2.min.css';
import select2 from 'select2';
import { showLoader } from '@amec/webasset/preloader';
import { showErrorMessage } from '@amec/webasset/utils';
import { setSelect2 } from '@amec/webasset/select2';
import { createTable } from '@amec/webasset/dataTable';
import {
    tableOption,
    tableFillSelect,
    bindTableColumnSearch,
} from '../../utils';
import { getOrganizations, getFormAuthen } from '../../service';
import { setFormNo, updateFormAuthen } from './data';

var table;
select2();
$(document).ready(async function (e) {
    try {
        await reloadTable();
        await bindEvents();
    } catch (error) {
        console.error(error);
        showErrorMessage(error);
        return;
    } finally {
        await showLoader({ show: false });
    }
});

async function populateFilters() {
    const organizations = await getOrganizations();
    var orgData = organizations.data
        .filter((item) => !item.SDIV.includes('Cancel'))
        .filter((item) => !item.SDEPT.includes('Cancel'))
        .filter((item) => !item.SSEC.includes('Cancel'));

    //Division Filter
    const divisions = [...new Set(orgData.map((item) => item.SDIVCODE))].filter(
        (item) => item,
    );
    const divOptions = divisions.map((divCode) => {
        const divData = orgData.find((item) => item.SDIVCODE === divCode);
        return {
            value: divCode,
            text: divData?.SDIV || divCode,
        };
    });
    await tableFillSelect(
        '#table-division-filter',
        divOptions,
        'value',
        'text',
    );
    await setSelect2({
        element: $('#table-division-filter'),
        placeholder: 'Filter by Division',
    });

    // Department Filter
    const department = [
        ...new Set(orgData.map((item) => item.SDEPCODE)),
    ].filter((item) => item);
    const depOptions = department.map((depCode) => {
        const depData = orgData.find((item) => item.SDEPCODE === depCode);
        return {
            value: depCode,
            text: depData?.SDEPT || depCode,
        };
    });
    await tableFillSelect(
        '#table-department-filter',
        depOptions,
        'value',
        'text',
    );
    await setSelect2({
        element: $('#table-department-filter'),
        placeholder: 'Filter by Department',
    });

    //Section Filter
    const section = [...new Set(orgData.map((item) => item.SSECCODE))].filter(
        (item) => item,
    );
    const secOptions = section.map((secCode) => {
        const secData = orgData.find((item) => item.SSECCODE === secCode);
        return {
            value: secCode,
            text: secData?.SSEC || secCode,
        };
    });
    await tableFillSelect('#table-section-filter', secOptions, 'value', 'text');
    await setSelect2({
        element: $('#table-section-filter'),
        placeholder: 'Filter by Section',
    });
}

function bindEvents() {
    bindTableColumnSearch(table, '#table-search', [4, 5, 6, 7, 8]);

    $('#table-division-filter').on('change', function () {
        table
            .column(0)
            .search('^' + $(this).val() + '$', true, false)
            .draw();
    });

    $('#table-department-filter').on('change', function () {
        table
            .column(1)
            .search('^' + $(this).val() + '$', true, false)
            .draw();
    });

    $('#table-section-filter').on('change', function () {
        table
            .column(2)
            .search('^' + $(this).val() + '$', true, false)
            .draw();
    });

    $('#reset-filter').on('click', function () {
        $('#table-search').val('');
        $('#table-division-filter').val('').trigger('change.select2');
        $('#table-department-filter').val('').trigger('change.select2');
        $('#table-section-filter').val('').trigger('change.select2');

        table.search('');
        table.columns().search('');
        table.page('first').draw('full-reset');
    });
}

async function reloadTable() {
    await populateFilters();
    const formno = await setFormNo();
    if (formno === null) {
        throw new Error('Form Master not found');
    }

    const data = await getFormAuthen(formno.nno, formno.orgno, formno.cyear);
    const dataFiltered = data.filter((item) => item.SPOSCODE != '80');
    if (!table) {
        await createTableOption(dataFiltered);
    } else {
        table.clear();
        table.rows.add(dataFiltered);
        table.draw();
    }
}

async function createTableOption(data) {
    const opt = { ...tableOption };
    opt.dom = `dom: '<"flex mb-3 items-center"<"flex-1"><"flex-none flex flex-row gap-2 table-option">><"bg-white border border-slate-300 rounded-lg overflow-x-auto my-5"t><"flex flex-col items-center gap-3 mt-5 lg:flex-row"<"flex-1"p><"flex-none flex gap-3 items-center table-foot-option"i>>`;
    opt.data = data;
    opt.pageLength = 20;
    opt.order = [
        [0, 'asc'],
        [1, 'asc'],
        [2, 'asc'],
        [3, 'asc'],
    ];
    opt.columns = [
        { data: 'SDIVCODE', className: 'hidden' },
        { data: 'SDEPCODE', className: 'hidden' },
        { data: 'SSECCODE', className: 'hidden' },
        { data: 'STARTDATE', className: 'hidden' },
        {
            data: 'SEMPNO',
            title: 'Employee No.',
            className: 'sticky-column',
        },
        {
            data: 'SNAME',
            title: 'Name',
            className: 'sticky-column',
        },
        {
            data: 'SDIV',
            title: 'Division',
            className: 'sticky-column',
        },
        { data: 'SDEPT', title: 'Department' },
        {
            data: 'SSEC',
            title: 'Section',
        },
        {
            data: 'SPOSNAME',
            title: 'Position',
        },
        {
            data: 'auth',
            title: `<input type="checkbox" class="checkbox check-all" data-id="2" /> ADM`,
            className: 'text-start',
            sortable: false,
            render: function (data, type, row) {
                return `<input type="radio" name="auth-${row.SEMPNO}" class="radio" value="002" ${data[0]?.CAUTHNO == '002' ? 'checked' : ''} /> ADM`;
            },
        },
        {
            data: 'auth',
            title: `<input type="checkbox" class="checkbox check-all" data-id="1"  /> OPR`,
            className: 'text-start',
            sortable: false,
            render: function (data, type, row) {
                return `<input type="radio" name="auth-${row.SEMPNO}" class="radio" value="001" ${data[0]?.CAUTHNO == '001' ? 'checked' : ''} /> OPR`;
            },
        },
        {
            data: 'auth',
            title: `<input type="checkbox" class="checkbox check-all" data-id="3"  /> USR`,
            className: 'text-start',
            sortable: false,
            render: function (data, type, row) {
                return `<input type="radio" name="auth-${row.SEMPNO}" class="radio" value="003" ${data[0]?.CAUTHNO == '003' || data.length == 0 ? 'checked' : ''} /> USR`;
            },
        },
    ];
    table = await createTable(opt);
}

$(document).on('click', '.check-all', async function () {
    try {
        await showLoader({ show: true });
        const id = Number($(this).data('id'));
        const role = id === 1 ? '001' : id === 2 ? '002' : '003';
        const no = $('#form-authen-data').data('no');
        const vorg = $('#form-authen-data').data('org');
        const cyear = $('#form-authen-data').data('cyear');

        const rowIndexes = table
            .rows({ page: 'all', search: 'applied' })
            .indexes()
            .toArray();
        const chunkSize = 5;

        for (let i = 0; i < rowIndexes.length; i += chunkSize) {
            const chunk = rowIndexes.slice(i, i + chunkSize);
            await Promise.all(
                chunk.map(async (rowIndex) => {
                    const rowData = table.row(rowIndex).data();
                    const empNo = rowData?.SEMPNO;
                    if (!empNo) {
                        return;
                    }

                    await updateFormAuthen({
                        NFRMNO: no,
                        VORGNO: vorg,
                        CYEAR: cyear,
                        VEMPNO: empNo,
                        CAUTHNO: role,
                    });

                    const nextRowData = {
                        ...rowData,
                        auth: [{ CAUTHNO: role }],
                    };

                    table.row(rowIndex).data(nextRowData);
                }),
            );
        }

        table.rows().invalidate().draw(false);
    } catch (err) {
        console.error(err);
        showErrorMessage(err);
    } finally {
        await showLoader({ show: false });
    }
});
