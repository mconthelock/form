import '@flaticon/flaticon-uicons/css/all/all.css';
import 'select2/dist/css/select2.min.css';
import select2 from 'select2';
import { showLoader } from '@amec/webasset/preloader';
import { showErrorMessage } from '@amec/webasset/utils';
import { setSelect2 } from '@amec/webasset/select2';
import { createTable } from '@amec/webasset/dataTable';
import { displayEmpImage } from '@amec/webasset/indexDB';
import { tableOption } from '../utils';
import { getAmecUsers, getOrganizations } from '../service';

select2();

const PAGE_SIZE = 18;

const COMPANY_HOTLINES = [
    {
        SEMPNO: 'MAIN',
        SNAME: 'Mitsubishi Elevator Asia (Switchboard)',
        STNAME: 'ศูนย์กลางโทรศัพท์บริษัท (Operator)',
        SPOSITION: 'Main Switchboard',
        SDIV: 'AMEC',
        SDEPT: 'General Affairs',
        SSEC: 'Reception & Operator',
        SRECMAIL: '',
        TEL: '+66-38-936-600',
        CATEGORY: 'OTHER',
    },
    {
        SEMPNO: 'SEC',
        SNAME: 'Security & Emergency Gate',
        STNAME: 'ศูนย์รักษาความปลอดภัย / เหตุฉุกเฉิน',
        SPOSITION: '24-Hour Security Desk',
        SDIV: 'AMEC',
        SDEPT: 'General Affairs',
        SSEC: 'Security & Safety',
        SRECMAIL: '',
        TEL: '191 / Ext. 1111',
        CATEGORY: 'OTHER',
    },
    {
        SEMPNO: 'MED',
        SNAME: 'AMEC First Aid Clinic',
        STNAME: 'ห้องพยาบาลบริษัท',
        SPOSITION: 'Occupational Health',
        SDIV: 'AMEC',
        SDEPT: 'Human Resources',
        SSEC: 'Welfare & Medical',
        SRECMAIL: '',
        TEL: 'Ext. 1120',
        CATEGORY: 'OTHER',
    },
    {
        SEMPNO: 'IT',
        SNAME: 'IT Service Desk / Helpdesk',
        STNAME: 'ศูนย์ช่วยเหลือด้านไอทีและระบบสารสนเทศ',
        SPOSITION: 'IT Support',
        SDIV: 'AMEC',
        SDEPT: 'Information Systems',
        SSEC: 'IT Helpdesk',
        SRECMAIL: '',
        TEL: 'Ext. 1500',
        CATEGORY: 'OTHER',
    },
];

let allEmployees = [];
let filteredEmployees = [];
let currentCategory = 'ALL';
let currentLetter = '';
let currentView = 'cards';
let currentPage = 1;
let dataTable = null;

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

let orgLookup = {
    div: new Map(),
    dept: new Map(),
    sec: new Map(),
};

function buildOrgLookup(orgRes) {
    const list = Array.isArray(orgRes) ? orgRes : orgRes?.data || [];
    orgLookup = { div: new Map(), dept: new Map(), sec: new Map() };
    list.forEach((item) => {
        if (!item) return;
        const divCode = String(item.SDIVCODE ?? '').trim();
        const depCode = String(item.SDEPCODE ?? '').trim();
        const secCode = String(item.SSECCODE ?? '').trim();
        if (divCode && !orgLookup.div.has(divCode)) {
            orgLookup.div.set(divCode, {
                full: String(item.SDIVISION ?? '').trim(),
                short: String(item.SDIV ?? '').trim(),
            });
        }
        if (depCode && !orgLookup.dept.has(depCode)) {
            orgLookup.dept.set(depCode, {
                full: String(item.SDEPARTMENT ?? '').trim(),
                short: String(item.SDEPT ?? '').trim(),
            });
        }
        if (secCode && !orgLookup.sec.has(secCode)) {
            orgLookup.sec.set(secCode, {
                full: String(item.SSECTION ?? '').trim(),
                short: String(item.SSEC ?? '').trim(),
            });
        }
    });
}

function formatOrgName(full, short) {
    const rawFull = String(full ?? '').trim();
    const commaIdx = rawFull.indexOf(',');
    const f = (commaIdx >= 0 ? rawFull.slice(0, commaIdx) : rawFull).trim();
    const fallbackShort =
        commaIdx >= 0 ? rawFull.slice(commaIdx + 1).trim() : '';
    const s = String(short ?? '').trim() || fallbackShort;
    if (f && s && f.toLowerCase() !== s.toLowerCase()) {
        return `${f} (${s})`;
    }
    return f || s || '-';
}

function formatOrgText(full, short, code) {
    const label = formatOrgName(full, short);
    const c = String(code ?? '').trim();
    return c ? `${c} ${label}` : label;
}

function normalizeUser(raw) {
    const tel = String(
        raw.NTELNO ?? raw.STELNO ?? raw.CEXT ?? raw.TEL ?? '',
    ).trim();
    const sname = String(raw.SNAME ?? '').trim();
    const stname = String(raw.STNAME ?? '').trim();
    const pos = String(raw.SPOSITION ?? raw.SPOSNAME ?? '').trim();
    const divCode = String(raw.SDIVCODE ?? '').trim();
    const deptCode = String(raw.SDEPCODE ?? '').trim();
    const secCode = String(raw.SSECCODE ?? '').trim();

    const divRef = orgLookup.div.get(divCode);
    const deptRef = orgLookup.dept.get(deptCode);
    const secRef = orgLookup.sec.get(secCode);

    const div = String(raw.SDIV ?? divRef?.short ?? '').trim();
    const dept = String(raw.SDEPT ?? deptRef?.short ?? '').trim();
    const sec = String(raw.SSEC ?? secRef?.short ?? '').trim();
    const divFull = String(raw.SDIVISION ?? divRef?.full ?? '').trim();
    const deptFull = String(raw.SDEPARTMENT ?? deptRef?.full ?? '').trim();
    const secFull = String(raw.SSECTION ?? secRef?.full ?? '').trim();

    const email = String(raw.SRECMAIL ?? '').trim();
    const melgit = String(raw.MELGIT ?? '').trim();
    const empno = String(raw.SEMPNO ?? '').trim();
    const posCode = String(raw.SPOSCODE ?? '').trim();

    const isOutsource =
        posCode === '80' ||
        posCode === '98' ||
        /outsource|subcontract|contractor|temp/i.test(
            `${pos} ${dept} ${sec} ${div}`,
        );

    return {
        SEMPNO: empno,
        SNAME: sname,
        STNAME: stname,
        SPOSITION: pos,
        SDIV: div,
        SDIVISION: divFull,
        SDEPT: dept,
        SDEPARTMENT: deptFull,
        SSEC: sec,
        SSECTION: secFull,
        SDIVCODE: divCode,
        SDEPCODE: deptCode,
        SSECCODE: secCode,
        SRECMAIL: email,
        MELGIT: melgit,
        TEL: tel === '0' || tel === '-' ? '' : tel,
        IS_OUTSOURCE: isOutsource,
        CATEGORY: raw.CATEGORY || (isOutsource ? 'OUTSOURCE' : 'EMPLOYEE'),
        SEARCH_BLOB: [
            empno,
            sname,
            stname,
            pos,
            div,
            divFull,
            divCode,
            dept,
            deptFull,
            deptCode,
            sec,
            secFull,
            secCode,
            email,
            melgit,
            tel,
        ]
            .join(' ')
            .toLowerCase(),
    };
}

function getInitials(name) {
    const parts = String(name || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    if (!parts.length) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const empImageCache = new Map();
const empImagePending = new Map();

function fetchEmpPhoto(empno) {
    const key = String(empno || '').trim();
    if (!key) return Promise.resolve(null);
    if (empImageCache.has(key)) return Promise.resolve(empImageCache.get(key));
    if (empImagePending.has(key)) return empImagePending.get(key);

    const promise = displayEmpImage(key)
        .then((src) => {
            const valid =
                typeof src === 'string' && src.startsWith('data:image/')
                    ? src
                    : null;
            empImageCache.set(key, valid);
            return valid;
        })
        .catch(() => {
            empImageCache.set(key, null);
            return null;
        })
        .finally(() => {
            empImagePending.delete(key);
        });

    empImagePending.set(key, promise);
    return promise;
}

function renderAvatarHtml(u, sizeClass = 'w-14 h-14 text-base') {
    const empno = String(u?.SEMPNO || '').trim();
    const canLoadPhoto = Boolean(empno && u?.CATEGORY !== 'OTHER');
    const cached = canLoadPhoto ? empImageCache.get(empno) : null;
    const needsLoad = canLoadPhoto && !empImageCache.has(empno);
    const initials = escapeHtml(getInitials(u?.SNAME));
    const alt = escapeHtml(u?.SNAME || empno);

    return `<div class="phone-avatar ${sizeClass} rounded-full bg-primary/10 border border-primary/25 text-primary font-mono font-bold flex items-center justify-center overflow-hidden shrink-0"${needsLoad ? ` data-empno="${escapeHtml(empno)}"` : ''}>
        ${
            cached
                ? `<img src="${cached}" alt="${alt}" class="w-full h-full object-cover object-top" /><span class="phone-avatar-initials hidden">${initials}</span>`
                : `<span class="phone-avatar-initials">${initials}</span>`
        }
    </div>`;
}

function hydrateAvatars(container) {
    if (!container) return;
    const nodes = container.querySelectorAll('.phone-avatar[data-empno]');
    if (!nodes.length) return;

    const groups = new Map();
    nodes.forEach((el) => {
        const empno = el.getAttribute('data-empno');
        if (!empno) return;
        if (!groups.has(empno)) groups.set(empno, []);
        groups.get(empno).push(el);
    });

    groups.forEach((elements, empno) => {
        fetchEmpPhoto(empno).then((src) => {
            elements.forEach((el) => {
                if (!el.isConnected) return;
                el.removeAttribute('data-empno');
                if (!src) return;
                const initialsEl = el.querySelector('.phone-avatar-initials');
                const img = document.createElement('img');
                img.src = src;
                img.alt = empno;
                img.className = 'w-full h-full object-cover object-top';
                initialsEl?.classList.add('hidden');
                el.prepend(img);
            });
        });
    });
}

function populateSelectOptions(selector, values, placeholder) {
    const el = $(selector);
    const currentVal = el.val() || '';
    const nextVal = currentVal && values.includes(currentVal) ? currentVal : '';
    el.empty();
    el.append('<option value=""></option>');
    values.forEach((v) => {
        el.append(`<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`);
    });
    el.val(nextVal);
    if (el.hasClass('select2-hidden-accessible')) {
        el.trigger('change.select2');
    } else {
        setSelect2({
            element: el,
            placeholder,
            width: '100%',
            emptyValue: false,
        });
    }
}

function updateCascadingFilters() {
    const selectedDiv = $('#division').val() || '';
    const selectedDept = $('#department').val() || '';

    const divs = [
        ...new Set(allEmployees.map((u) => u.SDIV).filter(Boolean)),
    ].sort();
    populateSelectOptions('#division', divs, 'All Divisions');

    const deptSource = selectedDiv
        ? allEmployees.filter((u) => u.SDIV === selectedDiv)
        : allEmployees;
    const depts = [
        ...new Set(deptSource.map((u) => u.SDEPT).filter(Boolean)),
    ].sort();
    populateSelectOptions('#department', depts, 'All Departments');

    const activeDept = $('#department').val() || '';
    const secSource = deptSource.filter(
        (u) => !activeDept || u.SDEPT === activeDept,
    );
    const secs = [
        ...new Set(secSource.map((u) => u.SSEC).filter(Boolean)),
    ].sort();
    populateSelectOptions('#section', secs, 'All Sections');

    const positions = [
        ...new Set(allEmployees.map((u) => u.SPOSITION).filter(Boolean)),
    ].sort();
    populateSelectOptions('#position', positions, 'All');

    if (selectedDept && !depts.includes(selectedDept)) {
        $('#department').val('').trigger('change.select2');
    }
}

function updateKpiAndTabCounts() {
    const withTel = allEmployees.filter((u) => u.TEL !== '').length;
    const outsources = allEmployees.filter((u) => u.IS_OUTSOURCE).length;
    const uniqueDepts = new Set(
        allEmployees.map((u) => u.SDEPT).filter(Boolean),
    ).size;

    $('#kpi-total-emp').text(allEmployees.length.toLocaleString());
    $('#kpi-with-tel').text(withTel.toLocaleString());
    $('#kpi-total-dept').text(uniqueDepts.toLocaleString());

    $('#cat-count-all').text(allEmployees.length.toLocaleString());
    $('#cat-count-company').text(withTel.toLocaleString());
    $('#cat-count-outsource').text(outsources.toLocaleString());
    $('#cat-count-other').text(COMPANY_HOTLINES.length.toLocaleString());
}

function getCategorySource() {
    if (currentCategory === 'COMPANY') {
        return allEmployees.filter((u) => u.TEL !== '');
    }
    if (currentCategory === 'OUTSOURCE') {
        return allEmployees.filter((u) => u.IS_OUTSOURCE);
    }
    if (currentCategory === 'OTHER') {
        return COMPANY_HOTLINES.map((item) => normalizeUser(item));
    }
    return allEmployees;
}

function applyFilters(resetPage = true) {
    const query = ($('#phone-search').val() || '').trim().toLowerCase();
    const tokens = query ? query.split(/\s+/).filter(Boolean) : [];
    const div = $('#division').val() || '';
    const dept = $('#department').val() || '';
    const sec = $('#section').val() || '';
    const pos = $('#position').val() || '';
    const hasTelOnly = $('#filter-has-tel').is(':checked');

    $('#clear-phone-search').toggleClass('hidden', query === '');

    const source = getCategorySource();
    filteredEmployees = source.filter((u) => {
        if (div && u.SDIV !== div) return false;
        if (dept && u.SDEPT !== dept) return false;
        if (sec && u.SSEC !== sec) return false;
        if (pos && u.SPOSITION !== pos) return false;
        if (hasTelOnly && !u.TEL) return false;
        if (currentLetter) {
            const firstChar = (u.SNAME || '').trim().charAt(0).toUpperCase();
            if (firstChar !== currentLetter) return false;
        }
        if (tokens.length > 0) {
            return tokens.every((t) => u.SEARCH_BLOB.includes(t));
        }
        return true;
    });

    if (resetPage) {
        currentPage = 1;
    }

    const headings = {
        ALL: 'All Employees Directory',
        COMPANY: 'Company Telephone Extensions',
        OUTSOURCE: 'Outsource Personnel Directory',
        OTHER: 'Company Hotlines & Important Numbers',
    };
    $('#result-heading').text(
        headings[currentCategory] || 'Employee Directory',
    );
    $('#result-count-badge').text(filteredEmployees.length.toLocaleString());
    $('#kpi-matched').text(filteredEmployees.length.toLocaleString());

    renderActiveView();
}

function renderActiveView() {
    $('#phone-loading').addClass('hidden');
    if (currentView === 'cards') {
        $('#phone-table-wrap').addClass('hidden');
        $('#phone-cards-wrap').removeClass('hidden');
        renderCards();
    } else {
        $('#phone-cards-wrap').addClass('hidden');
        $('#phone-table-wrap').removeClass('hidden');
        renderDataTable();
    }
}

function renderCards() {
    const grid = $('#phone-cards-grid');
    const empty = $('#phone-cards-empty');
    const footer = $('#phone-cards-footer');
    const total = filteredEmployees.length;

    if (total === 0) {
        grid.empty().addClass('hidden');
        empty.removeClass('hidden');
        footer.addClass('hidden');
        return;
    }

    grid.removeClass('hidden');
    empty.addClass('hidden');
    footer.removeClass('hidden');

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    currentPage = Math.min(Math.max(1, currentPage), totalPages);
    const startIdx = (currentPage - 1) * PAGE_SIZE;
    const endIdx = Math.min(startIdx + PAGE_SIZE, total);
    const slice = filteredEmployees.slice(startIdx, endIdx);

    const html = slice
        .map((u) => {
            const orgRows = [
                {
                    tag: 'Division',
                    icon: 'fi-rr-building',
                    name: formatOrgName(u.SDIVISION, u.SDIV),
                    code: u.SDIVCODE,
                },
                {
                    tag: 'Department',
                    icon: 'fi-rr-sitemap',
                    name: formatOrgName(u.SDEPARTMENT, u.SDEPT),
                    code: u.SDEPCODE,
                },
                {
                    tag: 'Section',
                    icon: 'fi-rr-users-alt',
                    name: formatOrgName(u.SSECTION, u.SSEC),
                    code: u.SSECCODE,
                },
            ];
            const orgBlock = `<div class="mt-2.5 space-y-1.5 bg-base-200/60 border border-base-300 px-2.5 py-2 text-[11px]">
                ${orgRows
                    .map(
                        (
                            r,
                        ) => `<div class="flex items-start gap-2 leading-snug">
                            <i class="fi ${r.icon} text-primary text-xs shrink-0 mt-0.5" title="${r.tag}"></i>
                            ${r.code ? `<button type="button" class="copy-btn px-1.5 py-0.5 bg-base-100 border border-primary/50 text-primary font-mono text-[10px] font-bold leading-none shrink-0 mt-0.5 hover:bg-primary hover:text-white transition-colors cursor-pointer" data-copy="${escapeHtml(r.code)}" title="Click to copy ${r.tag} code">${escapeHtml(r.code)}</button>` : ''}
                            <span class="text-base-content wrap-break-word min-w-0">${escapeHtml(r.name)}</span>
                        </div>`,
                    )
                    .join('')}
            </div>`;
            const telBlock = u.TEL
                ? `<button type="button" class="copy-btn inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white font-mono text-base font-bold hover:opacity-90 cursor-pointer shrink-0" data-copy="${escapeHtml(u.TEL)}" title="Click to copy telephone">
                        <i class="fi fi-rr-phone-call text-sm"></i>
                        <span>${escapeHtml(u.TEL)}</span>
                   </button>`
                : `<span class="inline-flex items-center gap-1 px-2.5 py-1.5 bg-base-200 border border-base-300 font-mono text-xs wf-mute shrink-0">No Ext.</span>`;

            const emailRow = u.SRECMAIL
                ? `<div class="flex items-center justify-between gap-2 text-xs">
                        <a href="mailto:${escapeHtml(u.SRECMAIL)}" class="flex items-center gap-1.5 text-primary hover:underline truncate min-w-0">
                            <i class="fi fi-rr-envelope text-xs shrink-0"></i>
                            <span class="truncate font-mono text-[11px]">${escapeHtml(u.SRECMAIL)}</span>
                        </a>
                        <button type="button" class="copy-btn btn btn-xs btn-ghost px-1.5 wf-mute hover:text-primary shrink-0" data-copy="${escapeHtml(u.SRECMAIL)}" title="Copy email">
                            <i class="fi fi-rr-copy text-xs"></i>
                        </button>
                   </div>`
                : `<div class="text-[11px] wf-mute font-mono">No email listed</div>`;

            const melgitRow = u.MELGIT
                ? `<div class="flex items-center justify-between gap-2 text-xs">
                        ${
                            u.MELGIT.includes('@')
                                ? `<a href="mailto:${escapeHtml(u.MELGIT)}" class="flex items-center gap-1.5 text-primary hover:underline truncate min-w-0">
                                    <span class="px-1 py-0.5 bg-base-200 border border-base-300 text-[9px] font-mono font-bold uppercase leading-none wf-mute shrink-0">MELGIT</span>
                                    <span class="truncate font-mono text-[11px]">${escapeHtml(u.MELGIT)}</span>
                                   </a>`
                                : `<div class="flex items-center gap-1.5 text-base-content truncate min-w-0">
                                    <span class="px-1 py-0.5 bg-base-200 border border-base-300 text-[9px] font-mono font-bold uppercase leading-none wf-mute shrink-0">MELGIT</span>
                                    <span class="truncate font-mono text-[11px]">${escapeHtml(u.MELGIT)}</span>
                                   </div>`
                        }
                        <button type="button" class="copy-btn btn btn-xs btn-ghost px-1.5 wf-mute hover:text-primary shrink-0" data-copy="${escapeHtml(u.MELGIT)}" title="Copy melgit">
                            <i class="fi fi-rr-copy text-xs"></i>
                        </button>
                   </div>`
                : `<div class="flex items-center gap-1.5 text-[11px] wf-mute font-mono">
                        <span class="px-1 py-0.5 bg-base-200 border border-base-300 text-[9px] font-bold uppercase leading-none shrink-0">MELGIT</span>
                        <span>—</span>
                   </div>`;

            const emailBlock = `<div class="pt-2.5 mt-2.5 border-t border-base-200 space-y-1">
                ${emailRow}
                ${melgitRow}
            </div>`;

            return `<article class="bg-base-100 border border-base-300 border-l-4 border-l-primary p-4 hover:bg-primary/3 transition-colors flex flex-col justify-between">
                <div>
                    <div class="flex items-start justify-between gap-2">
                        <div class="flex items-center gap-3 min-w-0">
                            ${renderAvatarHtml(u, 'w-14 h-14 text-base')}
                            <div class="min-w-0">
                                <div class="text-base font-bold text-base-content truncate" title="${escapeHtml(u.SNAME)}">${escapeHtml(u.SNAME || '-')}</div>
                                <div class="text-sm font-medium wf-mute truncate" title="${escapeHtml(u.STNAME)}">${escapeHtml(u.STNAME || '—')}</div>
                            </div>
                        </div>
                        ${telBlock}
                    </div>

                    <div class="mt-3 flex flex-wrap items-center gap-2">
                        <button type="button" class="copy-btn inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 border border-primary/50 font-mono text-sm font-bold text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer" data-copy="${escapeHtml(u.SEMPNO)}" title="Click to copy employee no.">
                            <span>${escapeHtml(u.SEMPNO || '-')}</span>
                            <i class="fi fi-rr-copy text-xs opacity-75"></i>
                        </button>
                        ${u.SPOSITION ? `<span class="inline-flex items-center px-2.5 py-1 bg-base-200 border border-base-300 text-base-content text-sm font-semibold">${escapeHtml(u.SPOSITION)}</span>` : ''}
                    </div>

                    ${orgBlock}
                </div>
                ${emailBlock}
            </article>`;
        })
        .join('');

    grid.html(html);
    hydrateAvatars(grid[0]);

    $('#phone-cards-info').html(
        `Showing <strong class="text-primary">${(startIdx + 1).toLocaleString()} - ${endIdx.toLocaleString()}</strong> of <strong class="text-primary">${total.toLocaleString()}</strong> contacts`,
    );

    renderCardPagination(totalPages);
}

function renderCardPagination(totalPages) {
    const nav = $('#phone-cards-pagination');
    if (totalPages <= 1) {
        nav.empty();
        return;
    }

    const pages = [];
    const delta = 2;
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    pages.push(1);
    if (left > 2) pages.push('...');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push('...');
    if (totalPages > 1) pages.push(totalPages);

    let buttons = `<button type="button" class="join-item btn btn-xs btn-outline border-base-300 phone-page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>«</button>`;
    pages.forEach((p) => {
        if (p === '...') {
            buttons += `<button type="button" class="join-item btn btn-xs btn-outline border-base-300 btn-disabled" disabled>…</button>`;
        } else {
            buttons += `<button type="button" class="join-item btn btn-xs phone-page-btn ${p === currentPage ? 'btn-primary' : 'btn-outline border-base-300'}" data-page="${p}">${p}</button>`;
        }
    });
    buttons += `<button type="button" class="join-item btn btn-xs btn-outline border-base-300 phone-page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>»</button>`;

    nav.html(`<div class="join">${buttons}</div>`);
}

async function renderDataTable() {
    if (dataTable) {
        dataTable.clear();
        dataTable.rows.add(filteredEmployees);
        dataTable.page('first').draw();
        return;
    }

    const opt = { ...tableOption };
    opt.dom =
        '<"overflow-x-auto"t><"dt-footer-bar px-4 py-3 bg-base-100 border-t border-base-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs wf-mute"<"table-info"i><"table-page"p>>';
    opt.pagingType = 'simple_numbers';
    opt.searching = false;
    opt.pageLength = 20;
    opt.data = filteredEmployees;
    opt.order = [[0, 'asc']];
    opt.language = {
        ...tableOption.language,
        info: 'Showing <strong class="text-primary">_START_ - _END_</strong> of <strong class="text-primary">_TOTAL_</strong> contacts',
        infoEmpty:
            'Showing <strong class="text-primary">0 - 0</strong> of <strong class="text-primary">0</strong> contacts',
        paginate: { previous: '«', next: '»', first: '«', last: '»' },
    };
    opt.columns = [
        {
            data: 'SEMPNO',
            title: 'Emp No.',
            className: 'text-nowrap',
            render: (data, type) => {
                if (type !== 'display') return data;
                if (!data) return '<span class="wf-mute">—</span>';
                return `<button type="button" class="copy-btn inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 border border-primary/50 font-mono text-sm font-bold text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer" data-copy="${escapeHtml(data)}" title="Click to copy employee no.">
                    <span>${escapeHtml(data)}</span>
                    <i class="fi fi-rr-copy text-xs opacity-75"></i>
                </button>`;
            },
        },
        {
            data: 'SNAME',
            title: 'Name (EN / TH)',
            render: (data, type, row) => {
                if (type !== 'display') return `${data} ${row.STNAME}`;
                return `<div class="flex items-center gap-3 min-w-0">
                    ${renderAvatarHtml(row, 'w-11 h-11 text-sm')}
                    <div class="min-w-0">
                        <div class="text-sm font-bold text-base-content">${escapeHtml(data)}</div>
                        <div class="text-sm wf-mute">${escapeHtml(row.STNAME || '—')}</div>
                    </div>
                </div>`;
            },
        },
        {
            data: 'SPOSITION',
            title: 'Position',
            className: 'text-nowrap text-sm font-medium',
        },
        {
            data: 'SDIV',
            title: 'Organization (DIV / DEPT / SEC)',
            render: (data, type, row) => {
                const rows = [
                    {
                        tag: 'Division',
                        icon: 'fi-rr-building',
                        name: formatOrgName(row.SDIVISION, row.SDIV),
                        code: row.SDIVCODE,
                    },
                    {
                        tag: 'Department',
                        icon: 'fi-rr-sitemap',
                        name: formatOrgName(row.SDEPARTMENT, row.SDEPT),
                        code: row.SDEPCODE,
                    },
                    {
                        tag: 'Section',
                        icon: 'fi-rr-users-alt',
                        name: formatOrgName(row.SSECTION, row.SSEC),
                        code: row.SSECCODE,
                    },
                ];
                if (type !== 'display') {
                    return rows
                        .map((r) => `${r.code} ${r.name}`.trim())
                        .join(' ');
                }
                return `<div class="space-y-1 text-[11px] leading-snug">
                    ${rows
                        .map(
                            (r) => `<div class="flex items-start gap-1.5">
                                <i class="fi ${r.icon} text-primary text-xs shrink-0 mt-0.5" title="${r.tag}"></i>
                                ${r.code ? `<button type="button" class="copy-btn px-1.5 py-0.5 bg-base-100 border border-primary/50 text-primary font-mono text-[10px] font-bold leading-none shrink-0 mt-0.5 hover:bg-primary hover:text-white transition-colors cursor-pointer" data-copy="${escapeHtml(r.code)}" title="Click to copy ${r.tag} code">${escapeHtml(r.code)}</button>` : ''}
                                <span class="wrap-break-word">${escapeHtml(r.name)}</span>
                            </div>`,
                        )
                        .join('')}
                </div>`;
            },
        },
        {
            data: 'TEL',
            title: 'Tel. / Ext.',
            className: 'text-nowrap',
            render: (data, type) => {
                if (type !== 'display') return data;
                if (!data) return '<span class="wf-mute">—</span>';
                return `<button type="button" class="copy-btn inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary text-white font-mono text-sm font-bold hover:opacity-90 cursor-pointer" data-copy="${escapeHtml(data)}" title="Click to copy">
                    <i class="fi fi-rr-phone-call text-xs"></i>
                    <span>${escapeHtml(data)}</span>
                </button>`;
            },
        },
        {
            data: 'SRECMAIL',
            title: 'Email / Melgit',
            render: (data, type, row) => {
                if (type !== 'display') {
                    return `${data || ''} ${row.MELGIT || ''}`.trim();
                }
                const emailPart = data
                    ? `<div class="inline-flex items-center gap-1.5">
                        <a href="mailto:${escapeHtml(data)}" class="font-mono text-xs text-primary hover:underline">${escapeHtml(data)}</a>
                        <button type="button" class="copy-btn btn btn-xs btn-ghost px-1 wf-mute hover:text-primary shrink-0" data-copy="${escapeHtml(data)}" title="Copy email">
                            <i class="fi fi-rr-copy text-xs"></i>
                        </button>
                    </div>`
                    : '<div class="wf-mute">—</div>';
                const melgitPart = row.MELGIT
                    ? `<div class="inline-flex items-center gap-1.5">
                        <span class="px-1 py-0.5 bg-base-200 border border-base-300 text-[9px] font-mono font-bold uppercase leading-none wf-mute shrink-0">MELGIT</span>
                        ${
                            row.MELGIT.includes('@')
                                ? `<a href="mailto:${escapeHtml(row.MELGIT)}" class="font-mono text-xs text-primary hover:underline">${escapeHtml(row.MELGIT)}</a>`
                                : `<span class="font-mono text-xs text-base-content">${escapeHtml(row.MELGIT)}</span>`
                        }
                        <button type="button" class="copy-btn btn btn-xs btn-ghost px-1 wf-mute hover:text-primary shrink-0" data-copy="${escapeHtml(row.MELGIT)}" title="Copy melgit">
                            <i class="fi fi-rr-copy text-xs"></i>
                        </button>
                    </div>`
                    : '';
                return `<div class="flex flex-col gap-0.5">${emailPart}${melgitPart}</div>`;
            },
        },
    ];

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

    opt.drawCallback = function () {
        stylePagination.call(this);
        hydrateAvatars(this[0] || this);
    };
    opt.initComplete = function (settings, json) {
        tableOption.initComplete.call(this, settings, json);
        stylePagination.call(this);
        hydrateAvatars(this[0] || this);
    };

    dataTable = await createTable(opt, { id: '#amec-employee' });
}

function exportFilteredCsv() {
    const headers = [
        'Emp No.',
        'Name (EN)',
        'Name (TH)',
        'Position',
        'Div Code',
        'Division',
        'Dept Code',
        'Department',
        'Sec Code',
        'Section',
        'Tel / Ext.',
        'Email',
        'Melgit',
    ];
    const rows = filteredEmployees.map((u) => [
        u.SEMPNO,
        u.SNAME,
        u.STNAME,
        u.SPOSITION,
        u.SDIVCODE,
        u.SDIV,
        u.SDEPCODE,
        u.SDEPT,
        u.SSECCODE,
        u.SSEC,
        u.TEL,
        u.SRECMAIL,
        u.MELGIT,
    ]);
    const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv =
        '\uFEFF' +
        [headers, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AMEC_Directory_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function bindEvents() {
    $('#phone-search').on('input', function () {
        applyFilters(true);
    });

    $('#clear-phone-search').on('click', function () {
        $('#phone-search').val('').focus();
        applyFilters(true);
    });

    $('#division').on('change', function () {
        $('#department').val('').trigger('change.select2');
        $('#section').val('').trigger('change.select2');
        updateCascadingFilters();
        applyFilters(true);
    });

    $('#department').on('change', function () {
        $('#section').val('').trigger('change.select2');
        updateCascadingFilters();
        applyFilters(true);
    });

    $('#section, #position, #filter-has-tel').on('change', function () {
        applyFilters(true);
    });

    $('#reset-filter').on('click', function () {
        $('#phone-search').val('');
        $('#division').val('').trigger('change.select2');
        $('#department').val('').trigger('change.select2');
        $('#section').val('').trigger('change.select2');
        $('#position').val('').trigger('change.select2');
        $('#filter-has-tel').prop('checked', true);
        currentLetter = '';
        $('.alpha-btn')
            .removeClass('btn-primary')
            .addClass('btn-outline border-base-300 bg-base-100');
        $('.alpha-btn[data-letter=""]')
            .removeClass('btn-outline border-base-300 bg-base-100')
            .addClass('btn-primary');
        updateCascadingFilters();
        applyFilters(true);
    });

    $(document).on('click', '.phone-cat-tab', function () {
        currentCategory = $(this).data('category');
        $('.phone-cat-tab')
            .attr('aria-selected', 'false')
            .removeClass('font-bold text-primary border-primary')
            .addClass('font-semibold wf-mute border-transparent');
        $('.phone-cat-tab .badge')
            .removeClass('badge-primary')
            .addClass('badge-outline');

        $(this)
            .attr('aria-selected', 'true')
            .removeClass('font-semibold wf-mute border-transparent')
            .addClass('font-bold text-primary border-primary');
        $(this)
            .find('.badge')
            .removeClass('badge-outline')
            .addClass('badge-primary');

        applyFilters(true);
    });

    $(document).on('click', '.alpha-btn', function () {
        currentLetter = $(this).data('letter') || '';
        $('.alpha-btn')
            .removeClass('btn-primary')
            .addClass('btn-outline border-base-300 bg-base-100');
        $(this)
            .removeClass('btn-outline border-base-300 bg-base-100')
            .addClass('btn-primary');
        applyFilters(true);
    });

    $(document).on('click', '.phone-page-btn', function () {
        const p = Number($(this).data('page'));
        if (!p || p === currentPage) return;
        currentPage = p;
        renderCards();
    });

    $('#view-mode-cards').on('click', function () {
        if (currentView === 'cards') return;
        currentView = 'cards';
        $('#view-mode-cards')
            .removeClass('btn-outline border-base-300 bg-base-100')
            .addClass('btn-primary');
        $('#view-mode-table')
            .removeClass('btn-primary')
            .addClass('btn-outline border-base-300 bg-base-100');
        renderActiveView();
    });

    $('#view-mode-table').on('click', function () {
        if (currentView === 'table') return;
        currentView = 'table';
        $('#view-mode-table')
            .removeClass('btn-outline border-base-300 bg-base-100')
            .addClass('btn-primary');
        $('#view-mode-cards')
            .removeClass('btn-primary')
            .addClass('btn-outline border-base-300 bg-base-100');
        renderActiveView();
    });

    $('#btn-export-phone').on('click', function () {
        exportFilteredCsv();
    });

    $(document).on('click', '.copy-btn', async function () {
        const text = $(this).attr('data-copy') || '';
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            const btn = $(this);
            const originalHtml = btn.html();
            btn.html(
                '<i class="fi fi-rr-check text-xs"></i><span>Copied</span>',
            );
            setTimeout(() => btn.html(originalHtml), 1200);
        } catch {
            // Fallback ignored if clipboard blocked
        }
    });

    document.addEventListener(
        'error',
        (e) => {
            const img = e.target;
            if (!(img instanceof HTMLImageElement)) return;
            const wrap = img.closest('.phone-avatar');
            if (!wrap) return;
            img.remove();
            wrap.querySelector('.phone-avatar-initials')?.classList.remove(
                'hidden',
            );
        },
        true,
    );

    $(document).on('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            const input = $('#phone-search');
            input.focus();
            input.select();
        }
    });
}

$(document).ready(async function () {
    try {
        bindEvents();
        const [raw, orgRes] = await Promise.all([
            getAmecUsers(),
            getOrganizations().catch(() => null),
        ]);
        if (orgRes) {
            buildOrgLookup(orgRes);
        }
        const list = Array.isArray(raw) ? raw : raw?.data || [];
        allEmployees = list
            .filter((u) => u && (u.SEMPNO || u.SNAME))
            .map(normalizeUser)
            .sort((a, b) => a.SNAME.localeCompare(b.SNAME));

        updateKpiAndTabCounts();
        updateCascadingFilters();
        applyFilters(true);
    } catch (error) {
        console.error(error);
        $('#phone-loading').addClass('hidden');
        showErrorMessage(
            error?.responseJSON?.message || 'Unable to load directory data',
        );
    } finally {
        showLoader({ show: false });
    }
});
