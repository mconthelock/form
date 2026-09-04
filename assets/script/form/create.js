import CryptoJS from 'crypto-js';
import { showLoader } from '@amec/webasset/preloader';
import { showMessage } from '@amec/webasset/utils';
import { getTagColor, initApp } from '../utils';
import { getFormMaster, getFormDept } from '../service';

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

$(document).ready(function () {
    loadCreatePage();
});

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

async function createFormList() {
    const formMaster = await getFormMaster();
    const formdept = await getFormDept();
    const id = $('#deptid').val();
    const selectdDept = formdept.find((d) => String(d.id) === String(id));
    const linkedDeptIds = Array.isArray(selectdDept?.link)
        ? selectdDept.link.map((value) => normalizeVorgno(value))
        : [];

    let result = formMaster.filter(
        (f) =>
            linkedDeptIds.includes(normalizeVorgno(f.VORGNO)) &&
            String(f.CSTATUS) === '1',
    );

    const list = $('#formlist');
    list.empty();

    if (!result.length) {
        list.append(
            '<div class="text-center text-sm text-slate-500 py-6">No forms available for this department.</div>',
        );
        return;
    }

    //get distinct group
    const distinctGroups = [
        ...new Set(
            result.map((item) =>
                item.formmstGroup == null ? null : item.formmstGroup.VGROUP,
            ),
        ),
    ].sort((a, b) => (a === null ? -1 : b === null ? 1 : 0));
    distinctGroups.forEach((group) => {
        setFormList(result, group);
    });
}

async function setFormList(data, group) {
    await initApp();
    const user = $('#user-login').attr('empno');
    const hash = CryptoJS.MD5(user);
    const filtered =
        group == null
            ? data.filter((item) => item.formmstGroup == null)
            : data.filter((item) => item.formmstGroup?.VGROUP === group);
    let str = `<ul class="list bg-base-100 rounded-box shadow-md border border-slate-300 mb-8 p-6 pb-5 gap-2">
        <li class="p-4 pb-2 text-xl text-primary font-black tracking-wide">${filtered[0].formmstGroup?.VGROUPNAME || 'General'}</li>`;
    filtered.forEach((item) => {
        str += `<li class="list-row border border-white cursor-pointer hover:bg-base-300 hover:border-slate-300 create-form-detail" data-url="${item.VFORMPAGE}?sr=1&empnolv=${hash.toString().toUpperCase()}" data-name="${item.VNAME}" data-desc="${item.VDESC == null ? '' : item.VDESC}" data-code="${item.VANAME}">
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
    str += '</ul>';
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

function applySearchFilter() {
    const searchValue = $('#search-form').val().trim().toLowerCase();
    const notFoundEl = $('#form-search-not-found');

    let hasMatch = false;

    $('#formlist > ul').each(function () {
        const groupRows = $(this).find('.list-row');
        let groupHasMatch = false;

        groupRows.each(function () {
            const formName = $(this)
                .children()
                .map(function () {
                    return $(this).text().toLowerCase();
                })
                .get()
                .join(' ');

            const isMatch =
                searchValue === '' || formName.includes(searchValue);
            $(this).toggle(isMatch);

            if (isMatch) {
                groupHasMatch = true;
                hasMatch = true;
            }
        });

        $(this).toggle(groupHasMatch || searchValue === '');
    });

    if (!hasMatch && searchValue !== '') {
        if (!notFoundEl.length) {
            $('#formlist').append(
                '<div id="form-search-not-found" class="mt-4 text-center text-sm text-slate-500">Not found</div>',
            );
        }
    } else {
        notFoundEl.remove();
    }
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
