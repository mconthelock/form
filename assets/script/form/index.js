import '@amec/webasset/css/dataTable.min.css';
import dayjs from 'dayjs';
import CryptoJS from 'crypto-js';
import { showLoader } from '@amec/webasset/preloader';
import { showMessage } from '@amec/webasset/utils';
import { createTable } from '@amec/webasset/dataTable';
import {
    displayEmpInfo,
    displayEmpImage,
    fillImages,
} from '@amec/webasset/indexDB';
import { initApp, tableOption } from '../utils';
import { getFormList } from './data';

var table;
var user;
$(document).ready(async function () {
    try {
        await initApp();
        //user = $('#user-login').attr('empno');
        //user = '07086';
        user = '96244';
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
    // const owners = [...new Set(data.map((item) => item.APP_DIV))].filter(
    //     (item) => item,
    // );
    // const ownerOptions = owners.map((owner) => ({
    //     value: owner,
    //     text: owner,
    // }));
    // await tableFillSelect('#table-owner-filter', ownerOptions, 'value', 'text');
    // await setSelect2({
    //     element: $('#table-owner-filter'),
    //     placeholder: 'Filter by Owner',
    // });
    // const developer = await getUsers({ CSTATUS: '1', SDEPCODE: '050601' });
    // const devOptions = developer
    //     .filter((dev) => dev.SPOSCODE >= '33' && dev.SPOSCODE <= '50')
    //     .map((dev) => ({
    //         value: dev.SEMPNO,
    //         text: `${dev.SNAME} (${dev.SEMPNO})`,
    //     }));
    // const avatarData = developer.map((dev) => dev.SEMPNO);
    // await setSelect2({
    //     element: $('#table-dev-filter'),
    //     avatar: true,
    //     placeholder: 'Filter by Developer',
    //     data: devOptions,
    //     avatarData: avatarData,
    // });
}

function bindEvents() {
    $('#table-search').on('input', function () {
        table.search($(this).val()).draw();
    });

    $('#table-owner-filter').on('change', function () {
        table.column(5).search($(this).val()).draw();
    });

    $('#table-dev-filter').on('change', function () {
        table.column(6).search($(this).val()).draw();
    });

    $('#reset-filter').on('click', function () {
        $('#table-search').val('');
        $('#table-owner-filter').val('').trigger('change.select2');
        $('#table-dev-filter').val('').trigger('change.select2');

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
    await populateFilters(data);
    if (!table) {
        await createFormTable(data);
    } else {
        table.clear();
        table.rows.add(data);
        table.draw();
    }
}

async function createFormTable(data) {
    const pageId = $('body').attr('menutitle');
    const pagestatus = $('#status').val();
    const status = [
        { id: 0, name: 'Draft', badge: 'badge badge-outline badge-neutral' },
        { id: 1, name: 'Running', badge: 'badge badge-outline badge-info' },
        { id: 2, name: 'Approved', badge: 'badge badge-success' },
        { id: 3, name: 'Rejected', badge: 'badge badge-outline badge-error' },
    ];

    const lastApproved = (flow) => {
        const flowFilter = flow.filter((f) => f.DAPVDATE != null);
        const flowSorted = flowFilter.sort((a, b) => {
            const dateA = new Date(
                `${dayjs(a.DAPVDATE).format('MM/DD/YYYY')} ${(a.CAPVTIME.trim() || '00:00' + ':00').substring(0, 8)}`,
            );
            const dateB = new Date(
                `${dayjs(b.DAPVDATE).format('MM/DD/YYYY')} ${(b.CAPVTIME.trim() || '00:00' + ':00').substring(0, 8)}`,
            );
            return dateB - dateA;
        });
        return flowSorted[0] || null;
    };

    const opt = { ...tableOption };
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
                    const serve = data.VFORMPAGE.startsWith('http')
                        ? data.VFORMPAGE.replace('http', 'https')
                        : `http://webflow.mitsubishielevatorasia.co.th/${data.VFORMPAGE}`;
                    const conjunction = serve.includes('?') ? '&' : '?';
                    const url = `${serve}${conjunction}no=${data.NFRMNO}&orgNo=${data.VORGNO}&y=${data.CYEAR}&y2=${data.CYEAR2}&runNo=${data.NRUNNO}&empno=${user}`;
                    return `<a class="text-primary link-self" href="#" data-title="${pageId}" data-url="${url}&empnolv=${hash.toString().toUpperCase()}&bp=${encodeURIComponent('http://localhost:8080/form/webform/form/index/1')}">${formno}</a>`;
                }
                return formno;
            },
        },
        { data: 'form.formmst.VNAME', title: 'Detail' },
        {
            data: 'form',
            title: 'Request By',
            className: 'text-start',
            render: (data, type, row) => {
                if (type === 'display') {
                    return `<div class="flex items-center" id="req-${data.NFRMNO}-${data.VORGNO}-${data.CYEAR}-${data.CYEAR2}-${data.NRUNNO}">
                        <div class="avatar border-0">
                            <div class="w-12 rounded-full border border-slate-300 shadow-md">
                                <img src=""  class="hidden" />
                                <div class="skeleton h-32 w-32"></div>
                            </div>
                        </div>
                        <div class="ml-2 flex flex-col gap-1">
                            <div class="name"><div class="skeleton h-6 w-32"></div></div>
                            <div class="detail text-xs text-gray-500"><div class="skeleton h-4 w-32"></div></div>
                        </div>
                    </div>`;
                }
                return data;
            },
        },
        {
            data: 'form',
            title: 'Request Date',
            className: 'text-start',
            render: (data, type) => {
                if (type === 'display') {
                    if (data.DREQDATE == null || data.DREQDATE == undefined)
                        return '';
                    return `${dayjs(data.DREQDATE).format('DD/MM/YYYY')} ${(data.CREQTIME.trim() + ':00').substring(0, 8)}`;
                }
                return data;
            },
        },
        {
            data: 'form',
            title: 'Latest Approver',
            className: 'text-start',
            render: (data, type) => {
                const latest = lastApproved(data.flow);
                if (type === 'display') {
                    if (!latest) return '';
                    const apvDate = `${dayjs(latest.DAPVDATE).format('DD/MM/YYYY')} ${(latest.CAPVTIME.trim() || '00:00' + ':00').substring(0, 8)}`;
                    return `<div class="flex items-center" id="apv-${data.NFRMNO}-${data.VORGNO}-${data.CYEAR}-${data.CYEAR2}-${data.NRUNNO}">
                        <div class="avatar border-0">
                            <div class="w-12 rounded-full border border-slate-300 shadow-md">
                                <img src=""  class="hidden" />
                                <div class="skeleton h-32 w-32"></div>
                            </div>
                        </div>
                        <div class="ml-2 flex flex-col gap-1">
                            <div class="name"><div class="skeleton h-6 w-32"></div></div>
                            <div class="text-xs text-gray-500"><span class="font-semibold text-primary me-2">Approve At:</span>${apvDate}</div>
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
                        <div class="avatar-group -space-x-6">
                        ${visibleNext
                            .map(
                                (n) => `<div class="avatar">
                                <div class="w-12">
                                    <img src=""  class="hidden" />
                                    <div class="skeleton h-32 w-32"></div>
                                </div>
                            </div>`,
                            )
                            .join('')}
                            ${
                                remaining > 0
                                    ? `<div class="avatar avatar-placeholder">
                                <div class="bg-neutral text-neutral-content w-12">
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
            render: (data, type, row) => {
                if (type === 'display') {
                    const stat = status.find((s) => s.id == data.CST);
                    return `<div class="badge ${stat.badge || 'badge badge-outline border-base-300'}">${stat.name || 'Unknow'}</div>`;
                }
                return data;
            },
        },
        {
            data: 'form',
            title: 'Running Days',
            className: `${pagestatus == 6 ? 'hidden' : ''}`,
            render: (data, type, row) => {
                if (type === 'display') {
                    let sdate = '';
                    const latest = lastApproved(data.flow);
                    if (!latest) {
                        sdate = new Date(
                            `${dayjs(data.DREQDATE).format('MM/DD/YYYY')} ${(data.CREQTIME.trim() || '00:00' + ':0000').substring(0, 8)}`,
                        );
                    } else {
                        sdate = new Date(
                            `${dayjs(latest.DAPVDATE).format('MM/DD/YYYY')} ${(latest.CAPVTIME.trim() || '00:00' + ':00').substring(0, 8)}`,
                        );
                    }

                    const now = new Date();
                    const diffTime = Math.abs(now - sdate);
                    const diffDays = Math.ceil(
                        diffTime / (1000 * 60 * 60 * 24),
                    );

                    let badge = '';
                    if (diffDays >= 30)
                        badge = `<div class="badge badge-error">${diffDays} days</div>`;
                    else if (diffDays >= 15)
                        badge = `<div class="badge badge-warning">${diffDays} days</div>`;
                    else if (diffDays >= 7)
                        badge = `<div class="badge badge-info">${diffDays} days</div>`;
                    else
                        badge = `<div class="badge badge-outline badge-primary">${diffDays} days</div>`;
                    return `<div class="text-center">${badge}</div>`;
                }

                return null;
            },
        },
    ];
    opt.createdRow = async function (row, data) {
        const latest = lastApproved(data.form.flow);
        const reqId = `#req-${data.form.NFRMNO}-${data.form.VORGNO}-${data.form.CYEAR}-${data.form.CYEAR2}-${data.form.NRUNNO}`;
        const apvId = `#apv-${data.form.NFRMNO}-${data.form.VORGNO}-${data.form.CYEAR}-${data.form.CYEAR2}-${data.form.NRUNNO}`;
        const nextId = `#next-${data.form.NFRMNO}-${data.form.VORGNO}-${data.form.CYEAR}-${data.form.CYEAR2}-${data.form.NRUNNO}`;

        await fillUserinfo(row, data.form.VREQNO, reqId);
        if (latest.VAPVNO != undefined && latest.VAPVNO != null)
            await fillUserinfo(row, latest.VAPVNO, apvId);

        await fillNextApproverInfo(row, data.form.flow, nextId);
    };

    opt.initComplete = function (settings, json) {
        const { container } = tableOption.initComplete.call(
            this,
            settings,
            json,
        );
        $('.dt-search').addClass('hidden');
        $('.dt-length').addClass('hidden');
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
    $(wrap).find('img').attr('src', info.image);
    $(wrap).find('img').removeClass('hidden');
    $(wrap).find('.name').html(`${info.SNAME} (${info.SEMPNO})`);
    $(wrap).find('.detail').html(`${info.SDIV} - ${info.SDEPT} - ${info.SSEC}`);
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
    const title = $(this).attr('data-title');
    window.location.href = `${
        process.env.APP_ENV
    }/webform/form/detail?title=${title}&data=${encodeURIComponent(url)}`;
});
