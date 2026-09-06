import CryptoJS from 'crypto-js';
import { showLoader } from '@amec/webasset/preloader';
import { showMessage } from '@amec/webasset/utils';
import { getTagColor, initApp } from '../utils';
import { getFormMaster, getFormDept, getFormMasterGroup } from '../service';

const FORM_LIST_PAGE_SIZE = 10;
let formListPage = 1;

$(document).ready(function () {
    loadCreatePage();
});

async function loadCreatePage() {
    try {
        if ($('#deptid').length > 0) {
            await createFormList();
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
        return JSON.parse(localStorage.getItem('recent-created-forms') || '[]');
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
            (item) => item.link !== form.link && item.name !== form.name,
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
                <h1>Recent Created Forms</h1>
                <div class="mt-3 text-sm text-slate-500">No recent forms yet.</div>
            </div>
        `);
        return;
    }

    const list = filteredForms
        .map((item) => {
            const tagColor = getTagColor(item.group);
            return `<a href="${item.link}" class="mt-3 block rounded-lg border border-slate-200 bg-white p-3 text-sm hover:bg-primary/5">
                    <div class="font-semibold text-slate-700"><div class="badge badge-outline ${tagColor} me-1">${item.code}</div>${item.name}</div>
                    <div class="mt-1 line-clamp-2 text-xs text-slate-500 hidden">${item.desc || ''}</div>
                </a>
            `;
        })
        .join('');

    container.html(`
        <div>
            <h1>Recent Created Forms</h1>
            <div class="mt-3 space-y-2">${list}</div>
        </div>
    `);
}

async function createRecent(id = '') {
    renderRecentCreatedForms(id);
}

function normalizeVorgno(value) {
    return String(value ?? '').replace(/^0+/, '') || '0';
}

function getFormListRows() {
    return $('#formlist .list-row.list-data');
}

function getMatchingFormListRows() {
    const searchValue = $('#search-form').val().trim().toLowerCase();
    const rows = getFormListRows();
    if (searchValue === '') {
        return rows;
    }

    return rows.filter(function () {
        const formName = $(this)
            .children()
            .map(function () {
                return $(this).text().toLowerCase();
            })
            .get()
            .join(' ');
        return formName.includes(searchValue);
    });
}

function renderFormListPagination() {
    const nav = $('#formlist-pagination');
    if (!nav.length) {
        return;
    }

    const totalPages = Math.ceil(
        getMatchingFormListRows().length / FORM_LIST_PAGE_SIZE,
    );

    if (totalPages <= 1) {
        nav.empty();
        return;
    }

    let buttons = `<button type="button" class="join-item btn btn-sm form-list-page" data-page="${formListPage - 1}" ${formListPage === 1 ? 'disabled' : ''}>«</button>`;
    for (let page = 1; page <= totalPages; page++) {
        buttons += `<button type="button" class="join-item btn btn-sm form-list-page ${page === formListPage ? 'btn-active' : ''}" data-page="${page}">${page}</button>`;
    }
    buttons += `<button type="button" class="join-item btn btn-sm form-list-page" data-page="${formListPage + 1}" ${formListPage === totalPages ? 'disabled' : ''}>»</button>`;

    nav.html(`<div class="join">${buttons}</div>`);
}

function applyFormListPagination() {
    const matchingRows = getMatchingFormListRows();
    const totalPages = Math.max(
        1,
        Math.ceil(matchingRows.length / FORM_LIST_PAGE_SIZE),
    );

    formListPage = Math.min(Math.max(formListPage, 1), totalPages);

    const start = (formListPage - 1) * FORM_LIST_PAGE_SIZE;
    const end = start + FORM_LIST_PAGE_SIZE;

    getFormListRows().hide();
    matchingRows.slice(start, end).show();
    updateGroupHeaderVisibility();
}

//while searching, keep every group header visible so the per-group "Not found" line can show; otherwise only show headers whose rows landed on the current page
function updateGroupHeaderVisibility() {
    const searchValue = $('#search-form').val().trim().toLowerCase();

    $('#formlist .list-group').each(function () {
        const header = $(this);
        if (searchValue !== '') {
            header.show();
            return;
        }

        //check each row's own inline display instead of :visible, since #formlist is still hidden during the initial load
        const hasVisibleRow = header
            .nextUntil('.list-group', '.list-data')
            .toArray()
            .some((row) => row.style.display !== 'none');
        header.toggle(hasVisibleRow);
    });
}

$(document).on('click', '.form-list-page', function () {
    const page = Number($(this).data('page'));
    if (!page || page === formListPage) {
        return;
    }

    formListPage = page;
    applyFormListPagination();
    renderFormListPagination();
});

async function createFormList() {
    const id = $('#deptid').val();
    const formMaster = await getFormMaster();
    const formdept = await getFormDept();
    const formGroup = await getFormMasterGroup();
    const selectdDept = formdept.find((d) => String(d.id) === String(id));
    const linkedDeptIds = Array.isArray(selectdDept?.link)
        ? selectdDept.link.map((value) => normalizeVorgno(value))
        : [];

    let result = formMaster.filter(
        (f) =>
            linkedDeptIds.includes(normalizeVorgno(f.VORGNO)) &&
            String(f.CSTATUS) === '1',
    );

    $('#formlist').empty();
    if (!result.length) {
        $('#formlist').append(
            '<div class="text-center text-sm text-slate-500 py-6">No forms available for this department.</div>',
        );
        $('#formlist-skeleton').addClass('hidden');
        $('#formlist').removeClass('hidden');
        return;
    }

    //VGROUPORG is an org code, not the dept id, so match it against linkedDeptIds like VORGNO above
    const distinctGroups = [
        {
            VGROUPORG: '030101',
            VGROUP: null,
            VGROUPNAME: 'General',
        },
        ...formGroup.filter((item) =>
            linkedDeptIds.includes(normalizeVorgno(item.VGROUPORG)),
        ),
    ];
    for (const group of distinctGroups) {
        await setFormList(result, group);
    }

    formListPage = 1;
    applyFormListPagination();
    renderFormListPagination();
    $('#formlist-skeleton').addClass('hidden');
    $('#formlist').removeClass('hidden');
}

async function setFormList(data, group) {
    await initApp();
    const user = $('#user-login').attr('empno');
    const hash = CryptoJS.MD5(user);
    const filtered = data.filter((item) => item.VDIR == group.VGROUP);
    if (!filtered.length) {
        return;
    }
    let str = `
        <li class="list-row list-group p-4 pb-2 text-xl text-primary font-black tracking-wide">${group.VGROUPNAME}</li>`;
    filtered.forEach((item) => {
        str += `<li class="list-row list-data border border-white cursor-pointer hover:bg-base-300 hover:border-slate-300 create-form-detail" data-url="${item.VFORMPAGE}?sr=1&empnolv=${hash.toString().toUpperCase()}" data-name="${item.VNAME}" data-desc="${item.VDESC == null ? '' : item.VDESC}" data-code="${item.VANAME}">
            <div class="text-4xl font-thin opacity-30 tabular-nums min-w-37">${item.VANAME}</div>
            <div class="list-col-grow">
                <div>${item.VNAME}</div>
                <div class="text-xs font-semibold opacity-60">${item.VDESC == null ? '' : item.VDESC}</div>
            </div>
            <button class="btn btn-circle btn-ghost flex justify-center items-center">
                <i class="fi fi-rr-play text-xl"></i>
            </button>
        </li>`;
    });
    $('#formlist').append(str);
}

$(document).on('click', '.create-form-detail', async function (e) {
    e.preventDefault();
    try {
        await showLoader();
        //แยกประเภท URL คือตอนนี้มี 3 แบบคือ
        //1. URL ที่เรียกจากภายใน project
        //2. URL ที่เรียกจาก project webflow
        //3. URL ที่เรียกจาก ASP
        let url = $(this).attr('data-url');
        if (url.includes('index.asp')) {
            url = `https://webflow.mitsubishielevatorasia.co.th/${url}`;
        }

        const detailUrl = `${process.env.APP_ENV}/webform/form/detail?data=${encodeURIComponent(url)}`;
        const formCode = $(this).data('code') || '';
        const formName = $(this).data('name') || 'Untitled form';
        const formDesc = $(this).data('desc') || '';

        saveRecentCreatedForm({
            code: formCode,
            name: formName,
            desc: formDesc,
            link: detailUrl,
            group: $('#deptid').val(),
        });
        //renderRecentCreatedForms();
        window.location.href = detailUrl;
    } catch (error) {
        console.log(error);
        await showMessage(
            error.responseJSON?.message || 'Error navigating to form detail',
        );
    } finally {
        await showLoader({ show: false });
    }
});

//shows a "Not found" line under a group header when none of its rows match the search, independent of pagination
function updateGroupNotFoundMessages() {
    const searchValue = $('#search-form').val().trim().toLowerCase();
    const matchingRows = getMatchingFormListRows();

    $('#formlist .list-group').each(function () {
        const header = $(this);
        const notFoundEl = header.next('.group-search-not-found');
        const groupRows = header.nextUntil('.list-group', '.list-data');
        const hasMatch =
            searchValue === '' ||
            groupRows.filter((_, row) => matchingRows.is(row)).length > 0;

        if (hasMatch) {
            notFoundEl.remove();
        } else if (!notFoundEl.length) {
            header.after(
                '<li class="list-row group-search-not-found pt-0 pb-2 text-sm text-slate-500">Not found</li>',
            );
        }
    });
}

function applySearchFilter() {
    const notFoundEl = $('#form-search-not-found');
    const hasMatch = getMatchingFormListRows().length > 0;

    if (!hasMatch) {
        if (!notFoundEl.length) {
            $('#formlist').append(
                '<div id="form-search-not-found" class="mt-4 text-center text-sm text-slate-500">Not found</div>',
            );
        }
    } else {
        notFoundEl.remove();
    }

    updateGroupNotFoundMessages();

    formListPage = 1;
    applyFormListPagination();
    renderFormListPagination();
}

$(document).on('keyup', '#search-form', async function (e) {
    e.preventDefault();
    applySearchFilter();
});

$(document).on('click', '.clear-search-form', function () {
    const input = $('#search-form');
    input.val('').trigger('keyup');
    input.focus();
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
