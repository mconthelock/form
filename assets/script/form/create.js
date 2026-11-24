import 'select2/dist/css/select2.min.css';
import select2 from 'select2';
import { showLoader } from '@amec/webasset/preloader';
import { showMessage } from '@amec/webasset/utils';
import { setSelect2 } from '@amec/webasset/select2';
import { createTable } from '@amec/webasset/dataTable';
import { getTagColor, initApp, tableOption, tableFillSelect } from '../utils';
import { getFormMaster, getFormDept, getFormMasterGroup } from '../service';

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

function getCallbackBpUrl(to = 'waitapprove') {
    return `${process.env.APP_ENV}/webform/form/callback?to=${encodeURIComponent(to)}`;
}

function normalizeTargetUrl(rawUrl) {
    let target = String(rawUrl || '').trim();
    if (!target) return '';

    if (!/^https?:\/\//i.test(target)) {
        const cleanPath = target.replace(/^\/+/, '');
        target = `https://webflow.mitsubishielevatorasia.co.th/${cleanPath}`;
    } else if (
        window.location.protocol === 'https:' &&
        target.startsWith('http://')
    ) {
        target = target.replace(/^http:\/\//i, 'https://');
    }

    return target;
}

function buildFormDestination({ formCode, formName, url }) {
    const normalized = normalizeTargetUrl(url);
    if (!normalized) return '';

    const targetUrlObj = new URL(normalized, window.location.origin);
    const isSameOrigin = targetUrlObj.origin === window.location.origin;

    if (isSameOrigin) {
        return targetUrlObj.href;
    }

    return `${process.env.APP_ENV}/webform/form/detail?data=${encodeURIComponent(targetUrlObj.href)}&code=${encodeURIComponent(formCode || '')}&name=${encodeURIComponent(formName || '')}`;
}

function normalizeRecentItem(item) {
    if (!item || typeof item !== 'object') return null;

    let rawTarget = item.targetUrl || '';
    if (!rawTarget && item.link) {
        try {
            const linkUrl = new URL(item.link, window.location.origin);
            if (linkUrl.pathname.includes('/webform/form/detail')) {
                rawTarget = linkUrl.searchParams.get('data') || '';
            } else {
                rawTarget = linkUrl.href;
            }
        } catch {
            rawTarget = item.link;
        }
    }

    const normalizedTarget = normalizeTargetUrl(rawTarget);
    if (!normalizedTarget) return item;

    let updatedTarget = normalizedTarget;
    try {
        const parsed = new URL(normalizedTarget, window.location.origin);
        const currentBp = parsed.searchParams.get('bp');
        if (currentBp && currentBp.includes('/webform/form/createdetail')) {
            parsed.searchParams.set('bp', getCallbackBpUrl('waitapprove'));
            updatedTarget = parsed.href;
        }
    } catch {
        // Keep normalizedTarget as-is
    }

    const destination = buildFormDestination({
        formCode: item.code || '',
        formName: item.name || '',
        url: updatedTarget,
    });

    return {
        ...item,
        targetUrl: updatedTarget,
        link: destination || item.link,
    };
}

$(document).ready(function () {
    loadCreatePage();
});

async function loadCreatePage() {
    try {
        if ($('#deptid').length > 0) {
            await createFormTable();
            await createRecent($('#deptid').val());
        } else {
            await createRecent();
        }
    } catch (error) {
        console.log(error);
        await showMessage(error.responseJSON?.message || 'Error fetching data');
    } finally {
        await showLoader({ show: false });
    }
}

window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        loadCreatePage();
    }
});

function getRecentCreatedForms() {
    try {
        const stored = JSON.parse(
            localStorage.getItem('recent-created-forms') || '[]',
        );
        if (!Array.isArray(stored)) return [];
        return stored.map(normalizeRecentItem).filter(Boolean);
    } catch (error) {
        console.log(error);
        return [];
    }
}

function saveRecentCreatedForm(form) {
    const recent = getRecentCreatedForms();
    const next = [
        {
            ...form,
            createdAt: new Date().toISOString(),
        },
        ...recent.filter(
            (item) =>
                item.targetUrl !== form.targetUrl &&
                item.link !== form.link &&
                item.name !== form.name,
        ),
    ].slice(0, 10);

    localStorage.setItem('recent-created-forms', JSON.stringify(next));
    return next;
}

function renderRecentCreatedForms(id) {
    const container = $('#recent-created-forms');
    const recentForms = getRecentCreatedForms();

    if (!container.length) {
        return;
    }

    const filteredForms = id
        ? recentForms.filter((item) => item.group == id)
        : recentForms;
    if (!filteredForms.length) {
        container.html(`
            <div>
                <div class="border-b border-base-200 pb-2.5 mb-3 flex items-center justify-between">
                    <h2 class="text-xs font-bold uppercase tracking-wider text-primary">Recent Created Forms</h2>
                    <span class="badge badge-xs badge-outline font-mono">0</span>
                </div>
                <div class="text-xs wf-mute py-2">No recent forms yet.</div>
            </div>
        `);
        return;
    }

    const list = filteredForms
        .map((item) => {
            const tagColor = getTagColor(item.group);
            return `<a href="${escapeHtml(item.link)}" class="block border border-base-300 border-l-2 border-l-base-300 bg-base-100 p-3 text-xs hover:border-l-primary hover:bg-primary/[0.04] transition-all">
                    <div class="font-semibold text-base-content leading-snug"><span class="badge badge-xs badge-outline font-mono font-bold ${tagColor} me-1.5">${escapeHtml(item.code)}</span>${escapeHtml(item.name)}</div>
                    <div class="mt-1 line-clamp-2 text-[11px] wf-mute hidden">${escapeHtml(item.desc || '')}</div>
                </a>
            `;
        })
        .join('');

    container.html(`
        <div>
            <div class="border-b border-base-200 pb-2.5 mb-3 flex items-center justify-between">
                <h2 class="text-xs font-bold uppercase tracking-wider text-primary">Recent Created Forms</h2>
                <span class="badge badge-xs badge-primary font-mono font-bold">${filteredForms.length}</span>
            </div>
            <div class="space-y-2">${list}</div>
        </div>
    `);
}

async function createRecent(id = '') {
    renderRecentCreatedForms(id);
}

function normalizeVorgno(value) {
    return String(value ?? '').replace(/^0+/, '') || '0';
}

async function createFormTable() {
    await initApp();
    const id = $('#deptid').val();
    const user = $('#user-login').attr('empno') || '';
    const bp = encodeURIComponent(getCallbackBpUrl('waitapprove'));

    const [formMaster, formdept, formGroup] = await Promise.all([
        getFormMaster(),
        getFormDept(),
        getFormMasterGroup(),
    ]);

    const selectdDept = formdept.find((d) => String(d.id) === String(id));
    const linkedDeptIds = Array.isArray(selectdDept?.link)
        ? selectdDept.link.map((value) => normalizeVorgno(value))
        : [];

    const deptGroups = formGroup.filter((item) =>
        linkedDeptIds.includes(normalizeVorgno(item.VGROUPORG)),
    );
    const groupMap = new Map(
        deptGroups.map((g) => [String(g.VGROUP), g.VGROUPNAME]),
    );

    const rows = formMaster
        .filter(
            (f) =>
                linkedDeptIds.includes(normalizeVorgno(f.VORGNO)) &&
                String(f.CSTATUS) === '1',
        )
        .map((item) => {
            const uri = String(item.VFORMPAGE || '').includes('?') ? '&' : '?';
            const groupName =
                item.VDIR != null && groupMap.has(String(item.VDIR))
                    ? groupMap.get(String(item.VDIR))
                    : 'General';
            return {
                ...item,
                groupName,
                targetUrl: `${item.VFORMPAGE}${uri}no=${item.NNO}&orgNo=${item.VORGNO}&y=${item.CYEAR}&empno=${user}&bp=${bp}`,
            };
        });

    $('#form-count-badge').text(
        `${rows.length} ${rows.length === 1 ? 'FORM' : 'FORMS'}`,
    );

    // Populate group filter dropdown
    const usedGroupNames = [...new Set(rows.map((r) => r.groupName))];
    const groupOptions = usedGroupNames.map((name) => ({
        value: name,
        text: name,
    }));
    await tableFillSelect('#group-filter', groupOptions, 'value', 'text');
    await setSelect2({
        element: $('#group-filter'),
        placeholder: 'All Groups',
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
        emptyTable: 'No forms available for this department.',
        zeroRecords: 'No matching forms found.',
        info: 'Showing <strong class="text-primary">_START_ - _END_</strong> of <strong class="text-primary">_TOTAL_</strong> forms',
        infoEmpty:
            'Showing <strong class="text-primary">0 - 0</strong> of <strong class="text-primary">0</strong> forms',
        paginate: {
            previous: '«',
            next: '»',
            first: '«',
            last: '»',
        },
    };
    opt.data = rows;
    opt.pageLength = 10;
    opt.order = [
        [2, 'asc'],
        [0, 'asc'],
    ];
    opt.columns = [
        {
            data: 'VANAME',
            title: 'Code',
            className: 'text-nowrap align-middle',
            render: function (data, type) {
                if (type === 'display') {
                    return `<span class="inline-block font-mono text-xs font-bold text-primary bg-primary/8 border border-primary/20 px-2.5 py-1 tabular-nums min-w-24 text-center">${escapeHtml(data)}</span>`;
                }
                return data || '';
            },
        },
        {
            data: 'VNAME',
            title: 'Form Name',
            className: 'text-left min-w-[280px]',
            render: function (data, type, row) {
                const desc = row.VDESC == null ? '' : String(row.VDESC);
                if (type === 'display') {
                    return `<div class="flex flex-col gap-0.5">
                        <div class="text-sm font-semibold text-base-content leading-snug">${escapeHtml(data)}</div>
                        ${desc ? `<div class="text-xs wf-mute line-clamp-2">${escapeHtml(desc)}</div>` : ''}
                    </div>`;
                }
                return `${data || ''} ${desc}`;
            },
        },
        {
            data: 'groupName',
            title: 'Group',
            className: 'text-nowrap align-middle',
            render: function (data, type) {
                if (type === 'display') {
                    return `<span class="badge badge-xs badge-outline font-mono font-bold uppercase">${escapeHtml(data)}</span>`;
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
            render: function (data, type, row) {
                return `<button type="button"
                    class="btn btn-xs btn-outline btn-primary inline-flex items-center gap-1 create-form-detail"
                    data-url="${escapeHtml(row.targetUrl)}"
                    data-name="${escapeHtml(row.VNAME)}"
                    data-desc="${escapeHtml(row.VDESC == null ? '' : row.VDESC)}"
                    data-code="${escapeHtml(row.VANAME)}">
                    <i class="fi fi-rr-play text-xs"></i>
                    <span>Create</span>
                </button>`;
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

async function openFormDetail({ formCode, formName, formDesc, url }) {
    try {
        await showLoader();
        const normalizedTarget = normalizeTargetUrl(url);
        const destination = buildFormDestination({
            formCode,
            formName,
            url: normalizedTarget,
        });

        if (!destination) {
            throw new Error('Invalid form URL');
        }

        saveRecentCreatedForm({
            code: formCode,
            name: formName,
            desc: formDesc,
            targetUrl: normalizedTarget,
            link: destination,
            group: $('#deptid').val(),
        });
        window.location.href = destination;
    } catch (error) {
        console.log(error);
        await showMessage(
            error.responseJSON?.message ||
                error.message ||
                'Error navigating to form detail',
        );
    } finally {
        await showLoader({ show: false });
    }
}

$(document).on('click', '.create-form-detail', async function (e) {
    e.preventDefault();
    e.stopPropagation();
    await openFormDetail({
        formCode: $(this).data('code') || '',
        formName: $(this).data('name') || 'Untitled form',
        formDesc: $(this).data('desc') || '',
        url: $(this).attr('data-url') || '',
    });
});

$(document).on('click', '#table tbody tr', async function (e) {
    if ($(e.target).closest('button, a').length) return;
    const btn = $(this).find('.create-form-detail');
    if (!btn.length) return;
    await openFormDetail({
        formCode: btn.data('code') || '',
        formName: btn.data('name') || 'Untitled form',
        formDesc: btn.data('desc') || '',
        url: btn.attr('data-url') || '',
    });
});

$(document).on('input', '#search-form', function () {
    if (!table) return;
    table.search($(this).val() || '').draw();
});

$(document).on('click', '.clear-search-form', function () {
    const input = $('#search-form');
    input.val('').trigger('input').focus();
});

$(document).on('change', '#group-filter', function () {
    if (!table) return;
    const val = $(this).val() || '';
    if (val === '') {
        table.column(2).search('').draw();
    } else {
        table
            .column(2)
            .search(`^${escapeRegex(val)}$`, true, false)
            .draw();
    }
});

$(document).on('click', '#reset-filter', function () {
    if (!table) return;
    $('#search-form').val('');
    $('#group-filter').val('').trigger('change.select2');
    table.search('');
    table.columns().search('');
    table.page('first').draw('full-reset');
});

$(document).on('keydown', function (e) {
    const isShortcut = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k';

    if (isShortcut) {
        e.preventDefault();
        const input = $('#search-form');
        input.focus();
        input.select();
    }
});
