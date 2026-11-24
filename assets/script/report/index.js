import 'select2/dist/css/select2.min.css';
import select2 from 'select2';
import { showLoader } from '@amec/webasset/preloader';
import { showMessage } from '@amec/webasset/utils';
import { setSelect2 } from '@amec/webasset/select2';
import { createTable } from '@amec/webasset/dataTable';
import { getTagColor, initApp, tableOption, tableFillSelect } from '../utils';
import { getReportAuthen, getFormDept } from '../service';

select2();

let table = null;

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeRegex(value) {
    return String(value ?? '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

$(document).ready(async function () {
    try {
        await createReportTable();
    } catch (error) {
        console.log(error);
        await showMessage(error.responseJSON?.message || 'Error fetching data');
    } finally {
        await showLoader({ show: false });
    }
});

async function createReportTable() {
    await initApp();
    const user = $('#user-login').attr('empno');
    const [data, formDept] = await Promise.all([
        getReportAuthen(user),
        getFormDept(),
    ]);

    const dataFilter = (Array.isArray(data) ? data : []).filter(
        (item) => item && item.CAUTHNO != '003' && item.REPORT_MASTER,
    );

    const rows = [];
    (Array.isArray(formDept) ? formDept : []).forEach((el) => {
        for (const dept of el.link || []) {
            const reportDept = dataFilter
                .filter((item) => item.REPORT_MASTER.VORGNO === dept)
                .sort(
                    (a, b) =>
                        Number(a.REPORT_MASTER.NSEQ ?? 0) -
                        Number(b.REPORT_MASTER.NSEQ ?? 0),
                );
            reportDept.forEach((rpt) => {
                rows.push({
                    deptId: String(el.id ?? ''),
                    deptName: el.name || '',
                    seq: Number(rpt.REPORT_MASTER.NSEQ ?? 0),
                    name: rpt.REPORT_MASTER.VNAME || '',
                    url: rpt.REPORT_MASTER.VURL || '',
                });
            });
        }
    });

    $('#report-count-badge').text(
        `${rows.length} ${rows.length === 1 ? 'REPORT' : 'REPORTS'}`,
    );

    const usedDepts = [...new Set(rows.map((r) => r.deptName))];
    const deptOptions = usedDepts.map((name) => ({
        value: name,
        text: name,
    }));
    await tableFillSelect('#dept-filter', deptOptions, 'value', 'text');
    await setSelect2({
        element: $('#dept-filter'),
        placeholder: 'All Departments',
    });

    if (table) {
        table.clear();
        table.rows.add(rows);
        table.draw();
        return;
    }

    const opt = { ...tableOption };
    opt.dom =
        '<"overflow-x-auto"t><"dt-footer-bar px-4 py-3 bg-base-100 border-t border-base-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs wf-mute"<"table-info"i><"table-page"p>>';
    opt.pagingType = 'simple_numbers';
    opt.language = {
        ...tableOption.language,
        emptyTable: 'No reports available.',
        zeroRecords: 'No matching reports found.',
        info: 'Showing <strong class="text-primary">_START_ - _END_</strong> of <strong class="text-primary">_TOTAL_</strong> reports',
        infoEmpty:
            'Showing <strong class="text-primary">0 - 0</strong> of <strong class="text-primary">0</strong> reports',
        paginate: {
            previous: '«',
            next: '»',
            first: '«',
            last: '»',
        },
    };
    opt.data = rows;
    opt.pageLength = 10;
    opt.order = [];
    opt.columns = [
        {
            data: 'deptName',
            title: 'Department',
            className: 'text-nowrap align-middle',
            render: function (data, type, row) {
                if (type === 'display') {
                    const tagColor = getTagColor(row.deptId || data || '');
                    return `<span class="badge badge-outline font-mono font-bold uppercase text-md ${tagColor}">${escapeHtml(data)}</span>`;
                }
                return data || '';
            },
        },
        {
            data: 'name',
            title: 'Report Name',
            className: 'text-left min-w-[280px]',
            render: function (data, type) {
                if (type === 'display') {
                    return `<div class="flex items-center gap-2 text-sm font-semibold text-base-content leading-snug">
                        <i class="fi fi-rs-paper-plane-top text-primary/70 shrink-0"></i>
                        <span>${escapeHtml(data)}</span>
                    </div>`;
                }
                return data || '';
            },
        },
        {
            data: null,
            title: 'Action',
            orderable: false,
            searchable: false,
            className: 'text-center text-nowrap! align-middle',
            render: function (_data, _type, row) {
                return `<a href="${escapeHtml(row.url)}"
                    class="btn btn-xs btn-outline btn-primary inline-flex items-center gap-1 open-report">
                    <i class="fi fi-rr-play text-xs"></i>
                    <span>Open</span>
                </a>`;
            },
        },
    ];

    opt.createdRow = function (rowEl) {
        $(rowEl).addClass('cursor-pointer');
    };

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

$(document).on('click', '#table tbody tr', function (e) {
    if ($(e.target).closest('button, a').length) return;
    const link = $(this).find('a.open-report');
    const href = link.attr('href');
    if (href) {
        window.location.href = href;
    }
});

$(document).on('input', '#search-form', function () {
    if (!table) return;
    table.search($(this).val() || '').draw();
});

$(document).on('click', '.clear-search-form', function () {
    const input = $('#search-form');
    input.val('').trigger('input').focus();
});

$(document).on('change', '#dept-filter', function () {
    if (!table) return;
    const val = $(this).val() || '';
    if (val === '') {
        table.column(0).search('').draw();
    } else {
        table
            .column(0)
            .search(`^${escapeRegex(val)}$`, true, false)
            .draw();
    }
});

$(document).on('click', '#reset-filter', function () {
    if (!table) return;
    $('#search-form').val('');
    $('#dept-filter').val('').trigger('change.select2');
    table.search('');
    table.columns().search('');
    table.page('first').draw('full-reset');
});

$(document).on('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const input = $('#search-form');
        input.focus();
        input.select();
    }
});
