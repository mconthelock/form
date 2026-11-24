import '@amec/webasset/css/dataTable.min.css';
import 'select2/dist/css/select2.min.css';
import dayjs from 'dayjs';
import CryptoJS from 'crypto-js';
import select2 from 'select2';
import { showLoader } from '@amec/webasset/preloader';
import { showMessage } from '@amec/webasset/utils';
import { setSelect2 } from '@amec/webasset/select2';
import { createTable } from '@amec/webasset/dataTable';
import { displayEmpInfo } from '@amec/webasset/indexDB';
import { initApp, tableOption, tableFillSelect } from '../utils';
import { getFormList } from './data';

select2();

var table;
var user;
var customFilterBound = false;

const FORM_STATUS_META = [
    {
        id: '0',
        name: 'Draft',
        badge: 'badge badge-md badge-outline badge-neutral font-mono font-bold uppercase whitespace-nowrap',
    },
    {
        id: '1',
        name: 'Running',
        badge: 'badge badge-md badge-outline badge-info font-mono font-bold uppercase whitespace-nowrap',
    },
    {
        id: '2',
        name: 'Approved',
        badge: 'badge badge-md badge-success font-mono font-bold uppercase whitespace-nowrap',
    },
    {
        id: '3',
        name: 'Rejected',
        badge: 'badge badge-md badge-outline badge-error font-mono font-bold uppercase whitespace-nowrap',
    },
];

function getLastApproved(flow = []) {
    const flowFilter = (Array.isArray(flow) ? flow : []).filter(
        (f) => f && f.DAPVDATE != null,
    );
    const flowSorted = flowFilter.sort((a, b) => {
        const dateA = new Date(
            `${dayjs(a.DAPVDATE).format('MM/DD/YYYY')} ${(a.CAPVTIME?.trim() || '00:00:00').substring(0, 8)}`,
        );
        const dateB = new Date(
            `${dayjs(b.DAPVDATE).format('MM/DD/YYYY')} ${(b.CAPVTIME?.trim() || '00:00:00').substring(0, 8)}`,
        );
        return dateB - dateA;
    });
    return flowSorted[0] || null;
}

function getRunningDays(form) {
    if (!form) return 0;
    const latest = getLastApproved(form.flow);
    let sdate;
    if (!latest) {
        if (!form.DREQDATE) return 0;
        sdate = new Date(
            `${dayjs(form.DREQDATE).format('MM/DD/YYYY')} ${(form.CREQTIME?.trim() || '00:00:00').substring(0, 8)}`,
        );
    } else {
        sdate = new Date(
            `${dayjs(latest.DAPVDATE).format('MM/DD/YYYY')} ${(latest.CAPVTIME?.trim() || '00:00:00').substring(0, 8)}`,
        );
    }
    const diffTime = Math.abs(Date.now() - sdate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
$(document).ready(async function () {
    try {
        await initApp();
        user = $('#user-login').attr('empno');
        const status = $('#status').val();
        await getPageTitle(status);
        await reloadTable();
        await bindEvents();
    } catch (error) {
        console.log(error);
        await showMessage(error.responseJSON?.message || 'Error fetching data');
    } finally {
        await showLoader({ show: false });
    }
});

function getPageTitle(data) {
    const title = [
        {
            id: 0,
            name: 'Under Preparation',
            desc: 'Forms that are pending approval',
        },
        {
            id: 1,
            name: 'Waiting for approval',
            desc: 'Forms that are pending approval',
        },
        { id: 2, name: 'Comming Soon', desc: 'Forms that have been approved' },
        { id: 3, name: 'Mine', desc: 'Forms that have been rejected' },
        {
            id: 4,
            name: 'Approved/Rejected',
            desc: 'Forms that have been rejected',
        },
        {
            id: 5,
            name: 'Representative',
            desc: 'Forms that have been rejected',
        },
        { id: 6, name: 'Finished', desc: 'Forms that have been rejected' },
    ];
    const item = title.find((t) => t.id == data);
    $('#page-title').text(item ? item.name : 'Form List');
    $('#page-description').text(item ? item.desc : '...');
}

async function populateFilters(data) {
    // 1. Form Type options (distinct VANAME + VNAME present in current records)
    const formMap = new Map();
    for (const item of data) {
        const mst = item?.form?.formmst;
        if (!mst) continue;
        const code = String(mst.VANAME || '').trim();
        const name = String(mst.VNAME || '').trim();
        if (!code && !name) continue;
        const key = code || name;
        if (!formMap.has(key)) {
            formMap.set(key, code && name ? `${code} : ${name}` : key);
        }
    }
    const formOptions = Array.from(formMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([value, text]) => ({ value, text }));

    await tableFillSelect('#table-form-filter', formOptions, 'value', 'text');
    await setSelect2({
        element: $('#table-form-filter'),
        placeholder: 'All Forms',
    });

    // 2. Status options (statuses present in current records, fallback to all 4)
    const presentStatuses = new Set(
        data.map((item) => String(item?.form?.CST ?? '')).filter(Boolean),
    );
    const statusOptions = FORM_STATUS_META.filter(
        (s) => presentStatuses.size === 0 || presentStatuses.has(s.id),
    ).map((s) => ({ value: s.id, text: s.name }));

    await tableFillSelect(
        '#table-status-filter',
        statusOptions,
        'value',
        'text',
    );
    await setSelect2({
        element: $('#table-status-filter'),
        placeholder: 'All Status',
        disableSearch: true,
    });

    // 3. Running Days select2 (when present)
    if ($('#table-aging-filter').length) {
        await setSelect2({
            element: $('#table-aging-filter'),
            placeholder: 'All Days',
            disableSearch: true,
            emptyValue: false,
        });
    }
}

function bindEvents() {
    if (!customFilterBound) {
        $.fn.dataTable.ext.search.push(function (settings, _data, dataIndex) {
            if (settings.nTable.id !== 'table') return true;
            const rowData = settings.aoData[dataIndex]?._aData;
            const form = rowData?.form;
            if (!form) return true;

            const formFilter = $('#table-form-filter').val() || '';
            if (formFilter) {
                const code = String(form.formmst?.VANAME || '').trim();
                const name = String(form.formmst?.VNAME || '').trim();
                if (code !== formFilter && name !== formFilter) return false;
            }

            const statusFilter = $('#table-status-filter').val() || '';
            if (statusFilter && String(form.CST ?? '') !== String(statusFilter)) {
                return false;
            }

            const agingFilter = $('#table-aging-filter').val() || '';
            if (agingFilter) {
                const days = getRunningDays(form);
                if (agingFilter === 'lt7' && days >= 7) return false;
                if (agingFilter === '7to14' && (days < 7 || days > 14))
                    return false;
                if (agingFilter === '15to29' && (days < 15 || days > 29))
                    return false;
                if (agingFilter === 'gte30' && days < 30) return false;
            }

            return true;
        });
        customFilterBound = true;
    }

    $('#table-search').on('input', function () {
        table.search($(this).val()).draw();
    });

    $('.clear-table-search').on('click', function () {
        $('#table-search').val('').trigger('input').focus();
    });

    $('#table-form-filter, #table-status-filter, #table-aging-filter').on(
        'change',
        function () {
            table.draw();
        },
    );

    $('#reset-filter').on('click', function () {
        $('#table-search').val('');
        $('#table-form-filter').val('').trigger('change.select2');
        $('#table-status-filter').val('').trigger('change.select2');
        $('#table-aging-filter').val('').trigger('change.select2');

        table.search('');
        table.columns().search('');
        table.page('first').draw('full-reset');
    });
}

function nextApprover(flow = []) {
    const list = Array.isArray(flow) ? flow : [];
    const flowFilter = list
        .sort((a, b) => {
            const stepA = Number(a?.CSTEPST ?? 0);
            const stepB = Number(b?.CSTEPST ?? 0);
            return stepB - stepA;
        })
        .filter((f) => Number(f?.CSTEPST ?? 0) <= 3)
        .filter((item) => item && (item.VAPVNO || item.VREPNO))
        .reduce((acc, item) => {
            const empNo = item.VAPVNO || item.VREPNO;
            if (
                !acc.some(
                    (candidate) =>
                        (candidate.VAPVNO || candidate.VREPNO) === empNo,
                )
            ) {
                acc.push(item);
            }
            return acc;
        }, []);
    return flowFilter;
}

async function reloadTable() {
    const status = $('#status').val();
    const data = await getFormList({ user, status });
    const dataFiltered = Array.from(
        new Map(
            (Array.isArray(data) ? data : [])
                .filter((item) => item)
                .map((item) => {
                    const form = item?.form || item;
                    const key = [
                        form?.NFRMNO ?? '',
                        form?.VORGNO ?? '',
                        form?.CYEAR ?? '',
                        form?.CYEAR2 ?? form?.cyear2 ?? '',
                        form?.NRUNNO ?? '',
                    ].join('|');
                    return [key, item];
                }),
        ).values(),
    );
    await populateFilters(dataFiltered);
    if (!table) {
        await createFormTable(dataFiltered);
    } else {
        table.clear();
        table.rows.add(dataFiltered);
        table.draw();
    }
}

async function createFormTable(data) {
    const pageId = $('body').attr('menutitle');
    const pagestatus = $('#status').val();
    const status = FORM_STATUS_META;
    const lastApproved = getLastApproved;

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
    opt.searching = true;
    opt.pageLength = 10;
    opt.order = [[0, 'desc']];
    opt.columns = [
        { data: 'form.DREQDATE', className: 'hidden' },
        {
            data: 'form',
            title: 'Form No.',
            className: 'text-nowrap',
            render: (data, type, row) => {
                const hash = CryptoJS.MD5(user);
                const formno = `${data.formmst.VANAME || ''}${row.CYEAR2.slice(-2)}-${(
                    '000000' + row.NRUNNO
                ).slice(-6)}`;
                if (type === 'display') {
                    //console.log(document.URL);
                    const serve = data.VFORMPAGE.startsWith('http')
                        ? data.VFORMPAGE.startsWith('https')
                            ? data.VFORMPAGE
                            : window.location.protocol === 'https:'
                              ? data.VFORMPAGE.replace(/^http:\/\//i, 'https://')
                              : data.VFORMPAGE
                        : `https://webflow.mitsubishielevatorasia.co.th/${String(data.VFORMPAGE || '').replace(/^\/+/, '')}`;
                    const conjunction = serve.includes('?') ? '&' : '?';
                    const statusTargetMap = { 0: 'draft', 1: 'waitapprove', 2: 'comming', 3: 'mine', 4: 'approved', 5: 'represent', 6: 'finish' };
                    const callbackBp = `${process.env.APP_ENV}/webform/form/callback?to=${statusTargetMap[pagestatus] || 'waitapprove'}`;
                    const url = `${serve}${conjunction}no=${data.NFRMNO}&orgNo=${data.VORGNO}&y=${data.CYEAR}&y2=${data.CYEAR2}&runNo=${data.NRUNNO}&empno=${user}&empnolv=${hash.toString().toUpperCase()}&bp=${encodeURIComponent(callbackBp)}`;
                    const formName = String(data.formmst?.VNAME || '').replace(/"/g, '&quot;');
                    return `<a class="font-mono font-bold text-primary hover:underline link-self" href="#" data-title="${pageId || 'nav-form-waitapprove'}" data-code="${formno}" data-name="${formName}" data-url="${url}">${formno}</a>`;
                    //return `<a class="text-primary" href="${url}">${formno}</a>`;
                }
                return formno;
            },
        },
        { data: 'form.formmst.VNAME', title: 'Detail' },
        {
            data: 'form',
            title: 'Request By',
            type: 'string',
            className: 'text-left!',
            render: (data, type, row) => {
                if (type === 'display') {
                    return `<div class="flex items-center justify-start gap-2.5 text-left min-w-[220px]" id="req-${data.NFRMNO}-${data.VORGNO}-${data.CYEAR}-${data.CYEAR2}-${data.NRUNNO}">
                        <div class="avatar border-0">
                            <div class="w-11 h-11 rounded-md border border-base-300 bg-base-200 overflow-hidden shrink-0">
                                <img src="" class="hidden w-full h-full object-cover object-top" />
                                <div class="skeleton h-full w-full"></div>
                            </div>
                        </div>
                        <div class="min-w-0 flex flex-col gap-0.5">
                            <div class="name text-xs font-semibold text-base-content leading-tight truncate max-w-[220px]"><div class="skeleton h-3.5 w-28"></div></div>
                            <div class="detail text-[11px] wf-mute leading-tight truncate max-w-[220px]"><div class="skeleton h-3 w-24"></div></div>
                        </div>
                    </div>`;
                }
                return data?.VREQNO || '';
            },
        },
        {
            data: 'form',
            title: 'Request Date',
            className: 'text-left!',
            render: (data, type) => {
                if (type === 'display') {
                    if (data.DREQDATE == null || data.DREQDATE == undefined)
                        return '';
                    return `${dayjs(data.DREQDATE).format('DD/MM/YYYY')} ${(data.CREQTIME.trim() + ':00').substring(0, 8)}`;
                }
                return data?.DREQDATE
                    ? dayjs(data.DREQDATE).format('YYYY-MM-DD')
                    : '';
            },
        },
        {
            data: 'form',
            title: 'Latest Approver',
            type: 'string',
            className: 'text-left!',
            render: (data, type) => {
                const latest = lastApproved(data.flow);
                if (type === 'display') {
                    if (!latest) return '';
                    const apvDate = `${dayjs(latest.DAPVDATE).format('DD/MM/YYYY')} ${(latest.CAPVTIME.trim() || '00:00' + ':00').substring(0, 8)}`;
                    return `<div class="flex items-center justify-start gap-2.5 text-left min-w-[220px]" id="apv-${data.NFRMNO}-${data.VORGNO}-${data.CYEAR}-${data.CYEAR2}-${data.NRUNNO}">
                        <div class="avatar border-0">
                            <div class="w-11 h-11 rounded-md border border-base-300 bg-base-200 overflow-hidden shrink-0">
                                <img src="" class="hidden w-full h-full object-cover object-top" />
                                <div class="skeleton h-full w-full"></div>
                            </div>
                        </div>
                        <div class="min-w-0 flex flex-col gap-0.5">
                            <div class="name text-xs font-semibold text-base-content leading-tight truncate max-w-[220px]"><div class="skeleton h-3.5 w-28"></div></div>
                            <div class="text-[11px] wf-mute leading-tight font-mono"><span class="font-sans font-semibold text-primary me-1">Approved:</span>${apvDate}</div>
                        </div>
                    </div>`;
                }
                return '';
            },
        },
        {
            data: 'form',
            title: 'Next Approver',
            className: `${pagestatus == '0' || pagestatus == '1' || pagestatus == '6' ? 'hidden' : ''}`,
            render: (data, type, row) => {
                if (type === 'display') {
                    const next = nextApprover(data.flow);
                    const visibleNext = next.slice(0, 2);
                    const remaining = Math.max(
                        next.length - visibleNext.length,
                        0,
                    );

                    return `<div class="flex items-center" id="next-${data.NFRMNO}-${data.VORGNO}-${data.CYEAR}-${data.CYEAR2}-${data.NRUNNO}">
                        <div class="avatar-group -space-x-3">
                        ${visibleNext
                            .map(
                                (n) => `<div class="avatar">
                                <div class="w-10 h-10">
                                    <img src="" class="hidden w-full h-full object-cover object-top" />
                                    <div class="skeleton h-full w-full"></div>
                                </div>
                            </div>`,
                            )
                            .join('')}
                            ${
                                remaining > 0
                                    ? `<div class="avatar avatar-placeholder">
                                <div class="bg-neutral text-neutral-content w-10 h-10 text-xs font-mono">
                                    <span>+${remaining}</span>
                                </div>
                            </div>`
                                    : ''
                            }
                        </div>
                    </div>`;
                }
                return '';
            },
        },
        {
            data: 'form',
            title: 'Status',
            className: 'text-center',
            render: (data, type) => {
                const stat = status.find((s) => s.id == data.CST);
                if (type === 'display') {
                    return `<div class="${stat?.badge || 'badge badge-md badge-outline border-base-300 whitespace-nowrap'}">${stat?.name || 'Unknown'}</div>`;
                }
                return stat?.name || '';
            },
        },
        {
            data: 'form',
            title: 'Running Days',
            className: `${pagestatus == 6 ? 'hidden' : ''}`,
            render: (data, type) => {
                const diffDays = getRunningDays(data);
                if (type === 'display') {
                    let badge = '';
                    if (diffDays >= 30)
                        badge = `<div class="badge badge-md badge-error font-mono font-bold whitespace-nowrap">${diffDays} days</div>`;
                    else if (diffDays >= 15)
                        badge = `<div class="badge badge-md badge-warning font-mono font-bold whitespace-nowrap">${diffDays} days</div>`;
                    else if (diffDays >= 7)
                        badge = `<div class="badge badge-md badge-info font-mono font-bold whitespace-nowrap">${diffDays} days</div>`;
                    else
                        badge = `<div class="badge badge-md badge-outline badge-primary font-mono font-bold whitespace-nowrap">${diffDays} days</div>`;
                    return `<div class="text-center">${badge}</div>`;
                }

                return diffDays;
            },
        },
    ];
    opt.createdRow = async function (row, data) {
        const latest = lastApproved(data.form.flow);
        const reqId = `#req-${data.form.NFRMNO}-${data.form.VORGNO}-${data.form.CYEAR}-${data.form.CYEAR2}-${data.form.NRUNNO}`;
        const apvId = `#apv-${data.form.NFRMNO}-${data.form.VORGNO}-${data.form.CYEAR}-${data.form.CYEAR2}-${data.form.NRUNNO}`;
        const nextId = `#next-${data.form.NFRMNO}-${data.form.VORGNO}-${data.form.CYEAR}-${data.form.CYEAR2}-${data.form.NRUNNO}`;

        await fillUserinfo(row, data.form.VREQNO, reqId); // Requester image

        // Last Approver
        if (latest != null) {
            await fillUserinfo(row, latest.VAPVNO, apvId);
        }

        await fillNextApproverInfo(row, data.form.flow, nextId);
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
        const { container } = tableOption.initComplete.call(
            this,
            settings,
            json,
        );
        $('.dt-search').addClass('hidden');
        $('.dt-length').addClass('hidden');
        stylePagination.call(this);
    };
    table = await createTable(opt);
}

// Responsive table
$(document).on(
    'click',
    '#table tbody tr td.dtr-control:not(.dt-hasChild)',
    async function (e) {
        const rows = table.row($(this).closest('tr'));
        if (rows.child.isShown()) {
            const row = $(this).closest('tr').next();
            const data = rows.data();
            await fillImgs(row, data);
        }
    },
);

async function fillUserinfo(row, data, id) {
    const wrap = $(row).find(id);
    const info = await displayEmpInfo(data);
    $(wrap).find('img').attr('src', info.image).removeClass('hidden');
    $(wrap).find('.avatar .skeleton').addClass('hidden');
    const fullName = `${info.SNAME || ''} (${info.SEMPNO || ''})`.trim();
    const orgText = [info.SDIV, info.SDEPT, info.SSEC]
        .filter((v) => v && String(v).trim() && String(v).trim() !== '-')
        .join(' / ');
    $(wrap)
        .find('.name')
        .attr('title', fullName)
        .html(
            `${info.SNAME || ''}<span class="font-mono text-[11px] font-normal wf-mute ms-1">(${info.SEMPNO || ''})</span>`,
        );
    $(wrap).find('.detail').attr('title', orgText).text(orgText);
}

async function fillNextApproverInfo(row, flow, id) {
    const wrap = $(row).find(id);
    if (!wrap.length) return;

    const next = nextApprover(flow);
    const visibleNext = next.slice(0, 2);
    const remaining = Math.max(next.length - visibleNext.length, 0);

    if (remaining > 0) {
        const placeholder = $(wrap).find('.avatar-placeholder span');
        if (placeholder.length) {
            placeholder.text(`+${remaining}`);
        }
    }

    const avatars = $(wrap).find('.avatar:not(.avatar-placeholder)');

    for (let index = 0; index < avatars.length; index++) {
        const item = visibleNext[index];
        if (!item) continue;

        const empNo = item.VAPVNO || item.VREPNO;
        if (!empNo) continue;

        const info = await displayEmpInfo(empNo);
        const avatar = $(avatars[index]);
        avatar.find('img').attr('src', info.image).removeClass('hidden');
        avatar.find('.skeleton').addClass('hidden');
    }
}

$(document).on('click', '#table a.link-self', async function (e) {
    e.preventDefault();
    const url = $(this).attr('data-url');
    // เด้งออกจาก iframe ของพอร์ทัลไปยัง top window โดยตรง แทนการพึ่ง listener ฝั่งพอร์ทัลภายนอก
    //window.top.location.href = url;
    const title = $(this).attr('data-title') || 'nav-form-waitapprove';
    const code = $(this).attr('data-code') || '';
    const name = $(this).attr('data-name') || '';
    if (!url) return;

    try {
        const targetUrlObj = new URL(url, window.location.origin);
        window.location.href = `${process.env.APP_ENV}/webform/form/detail?data=${encodeURIComponent(targetUrlObj.href)}&title=${encodeURIComponent(title)}&code=${encodeURIComponent(code)}&name=${encodeURIComponent(name)}`;
    } catch {
        window.location.href = url;
    }
});
