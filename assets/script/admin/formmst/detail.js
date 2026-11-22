import 'select2/dist/css/select2.min.css';
import dayjs from 'dayjs';
import select2 from 'select2';
import { showLoader } from '@amec/webasset/preloader';
import { showErrorMessage, showMessage } from '@amec/webasset/utils';
import { setSelect2 } from '@amec/webasset/select2';
import { createBtn, activatedBtnRow } from '@amec/webasset/components/buttons';
import { getByPosition } from '@amec/webasset/api/sequence-org';
import {
    getAmecUsers,
    getFormMaster,
    getFormDept,
    getFormMasterGroup,
    getFlowMaster,
    populateOrganizations,
    getPositions,
} from '../../service';
import {
    setFormNo,
    createFormMaster,
    updateFormMaster,
    addFlowMaster,
    updateFlowMaster,
    deleteFlowMaster,
} from './data';

select2();

let formDeptCache = [];
let formGroupCache = [];

const flowState = {
    isCreateMode: false,
    formno: null,
    sortFlow: [],
    persistedList: [],
    persistedMap: new Map(),
    terminalNextNo: '00',
    orgList: [],
    posList: [],
    posMap: new Map(),
    orgMap: new Map(),
    seqOrgMap: new Map(),
    userList: [],
    userMap: new Map(),
    searchQuery: '',
    modalSelectsReady: false,
    pendingDeleteStepNo: null,
    dragReady: false,
    liveAnnounceTimer: null,
};

const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function cloneStep(step) {
    return {
        ...step,
        STEPMST: step.STEPMST ? { ...step.STEPMST } : null,
    };
}

function getStepCode(step) {
    return String(step?.CSTEPNO ?? step?.STEPMST?.CNO ?? '').trim();
}

function getStepName(step) {
    return String(step?.STEPMST?.VNAME ?? '').trim() || `Step ${getStepCode(step)}`;
}

$(document).ready(async function () {
    try {
        const formno = await setFormNo();
        flowState.formno = formno;

        if (formno === null) {
            flowState.isCreateMode = true;
            await setFormInit(null);
            renderCreateModeFlowState();
            return;
        }

        const master = await getFormMaster();
        const data = master.find(
            (item) =>
                item.NNO == formno.nno &&
                item.VORGNO == formno.orgno &&
                item.CYEAR == formno.cyear,
        );

        if (!data) {
            showErrorMessage('Form Master not found');
            return;
        }

        await setFormInit(data);
        await setFlowMaster(formno, true);
    } catch (error) {
        console.log(error);
        showErrorMessage(error);
        return;
    } finally {
        await showLoader({ show: false });
    }
});

function renderCreateModeFlowState() {
    $('#page-title').text('Create New Form Master');
    $('#add-flow').prop('disabled', true).attr('title', 'Save the new form first');
    $('#flow-search').prop('disabled', true);
    $('#flow-step-count').text('0');
    $('#flow-filter-status').text('0 steps');
    $('#flow-list-row').html(`
        <div class="border border-dashed border-base-300 bg-base-100 p-6 text-center space-y-2 mb-3">
            <div class="text-xs font-semibold text-base-content">Save Form First</div>
            <p class="text-[11px] wf-mute">Create and save the new form information on the left before configuring approval workflow steps.</p>
        </div>
    `);
}

async function populateFormGroupsByOwner(ownerOrg) {
    const groupfilter = ownerOrg
        ? formGroupCache.filter((item) =>
              formDeptCache.find(
                  (d) =>
                      d.link.includes(item.VGROUPORG) &&
                      d.link.includes(ownerOrg),
              ),
          )
        : formGroupCache;

    const formgroup = $('#formgroup');
    if (formgroup.hasClass('select2-hidden-accessible')) {
        formgroup.select2('destroy');
    }
    formgroup.empty().append('<option value=""></option>');
    groupfilter.forEach((item) => {
        formgroup.append(
            `<option value="${escapeHtml(item.VGROUP)}">${escapeHtml(item.VGROUPNAME)}</option>`,
        );
    });
    await setSelect2({
        element: '#formgroup',
        placeholder: 'Select Group',
        emptyValue: false,
    });
}

async function setFormInit(data) {
    const isNew = !data;

    // VORGNO select
    const dept = [];
    const deptData = await getFormDept();
    formDeptCache = deptData;
    deptData.map((owner) => {
        owner.link.map((link) => {
            dept.push({
                value: link,
                text: `${link} : ${owner.name}`,
            });
        });
    });
    const vorgno = $('#vorgno');
    vorgno.empty().append('<option value=""></option>');
    dept.forEach((item) => {
        vorgno.append(
            `<option value="${escapeHtml(item.value)}">${escapeHtml(item.text)}</option>`,
        );
    });
    await setSelect2({
        element: '#vorgno',
        placeholder: 'Select Owner',
        emptyValue: false,
    });

    // Form Group select
    formGroupCache = await getFormMasterGroup();
    await populateFormGroupsByOwner(data?.VORGNO || '');

    // Developer select (also cache all active AMEC users for Flow Master)
    const amecuser = await getAmecUsers();
    const activeUsers = (Array.isArray(amecuser) ? amecuser : []).filter(
        (u) => u && u.CSTATUS == '1',
    );
    flowState.userList = activeUsers;
    flowState.userMap = new Map(
        activeUsers.map((u) => [String(u.SEMPNO).trim(), u]),
    );

    const devUsers = activeUsers.filter((user) => user.SDEPCODE == '050601');
    const developer = $('#developer');
    devUsers.forEach((user) => {
        developer.append(
            `<option value="${escapeHtml(user.SEMPNO)}">${escapeHtml(`${user.SNAME} (${user.SEMPNO})`)}</option>`,
        );
    });
    await setSelect2({
        element: '#developer',
        placeholder: 'Select Developer',
    });

    await setFormValue(data);
    await setFormAction(isNew ? 1 : 2);
}

async function setFormValue(data) {
    if (!data) {
        $('#nno')
            .val('')
            .attr('placeholder', 'Auto')
            .removeClass('req-1')
            .prop('readonly', true);
        $('#cyear')
            .val(dayjs().format('YY'))
            .prop('readonly', true);
        $('#vorgno').prop('disabled', false);
        return;
    }
    data = { ...data, DCREDATE: dayjs(data.DCREDATE).format('YYYY-MM-DD') };
    $('#form-info')
        .find('input, textarea')
        .each(function () {
            const mapping = $(this).attr('data-mapping');
            if (mapping && data[mapping] !== undefined) {
                if ($(this).hasClass('fdate')) {
                    const date = new Date(data[mapping]);
                    const formattedDate = date.toISOString().split('T')[0];
                    $(this).val(formattedDate);
                } else {
                    $(this).val(data[mapping]);
                }
            }
        });

    $('#form-info')
        .find('select')
        .each(function () {
            const mapping = $(this).attr('data-mapping');
            if (mapping && data[mapping] !== undefined) {
                $(this).val(data[mapping]).trigger('change');
            }
        });

    $('#vorgno').prop('disabled', true);
}

async function setFormAction(mode) {
    const addFormBtn = await createBtn({
        id: 'add-form-btn',
        title: 'Create New Form',
        icon: 'fi fi-ss-add text-xl',
        className: 'btn-primary',
    });

    const editFormBtn = await createBtn({
        id: 'edit-form-btn',
        title: 'Save Changes',
        icon: 'fi fi-rr-disk text-xl',
        className: 'btn-primary',
    });

    const backBtn = await createBtn({
        id: 'back-btn',
        title: 'Back to List',
        icon: 'fi fi-rr-angle-left text-xl',
        className: 'btn btn-outline border-base-300',
        type: 'link',
        href: `${process.env.APP_ENV}/admin/formmaster/`,
    });
    if (mode == 1) $('.btn-container').append(addFormBtn, backBtn);
    else $('.btn-container').append(editFormBtn, backBtn);
}

// ============================================================================
// Form Flow Master — Data Loading, Resolution, Rendering, CRUD & Reordering
// ============================================================================

async function setFlowMaster(formno, loadLookups = false) {
    if (loadLookups || flowState.posList.length === 0) {
        const { orgList, posList } = await setApproverType();
        flowState.orgList = orgList;
        flowState.posList = posList;
        flowState.posMap = new Map(
            posList.map((p) => [String(p.SPOSCODE).trim(), p]),
        );
        flowState.orgMap = new Map(
            orgList.map((og) => [`${og.pos}|${og.orgs}`, og]),
        );
    }

    const flow = await getFlowMaster(formno.nno, formno.orgno, formno.cyear);
    const flowList = Array.isArray(flow) ? flow.filter(Boolean) : [];
    const sorted = buildOrderedFlow(flowList);

    // Detect terminal CSTEPNEXTNO from the last item if it does not match any step in the list
    const stepSet = new Set(sorted.map(getStepCode));
    const lastNext = sorted.length
        ? String(sorted[sorted.length - 1].CSTEPNEXTNO ?? '').trim()
        : '00';
    flowState.terminalNextNo =
        lastNext && !stepSet.has(lastNext) ? lastNext : '00';

    flowState.persistedList = sorted.map(cloneStep);
    flowState.persistedMap = new Map(
        flowState.persistedList.map((s) => [getStepCode(s), s]),
    );
    flowState.sortFlow = sorted.map(cloneStep);

    await resolveSequenceOrgApprovers(sorted);

    populateStepSuggestions();
    renderFlowList();
    updateOrderBar();

    if (!flowState.dragReady) {
        initFlowDragAndDrop();
        flowState.dragReady = true;
    }
}

async function resolveSequenceOrgApprovers(steps) {
    const pairs = new Map();
    for (const fs of steps) {
        if (String(fs.CTYPE ?? '').trim() !== '2') continue;
        const vpos = String(fs.VPOSNO ?? '').trim();
        const vorg = String(fs.VAPVORGNO ?? '').trim();
        if (!vpos || !vorg) continue;
        const key = `${vpos}|${vorg}`;
        if (!flowState.seqOrgMap.has(key) && !pairs.has(key)) {
            pairs.set(key, { vpos, vorg });
        }
    }

    if (pairs.size === 0) return;

    await Promise.allSettled(
        Array.from(pairs.entries()).map(async ([key, { vpos, vorg }]) => {
            try {
                const res = await getByPosition(vorg, vpos);
                const record = Array.isArray(res?.data)
                    ? res.data[0]
                    : res?.data;
                const empno =
                    res?.status && record
                        ? String(
                              record.EMPNO ??
                                  record.SEMPNO ??
                                  record.HEADNO ??
                                  '',
                          ).trim()
                        : '';
                flowState.seqOrgMap.set(key, empno || null);
            } catch (err) {
                console.warn('Failed to resolve SEQUENCEORG:', key, err);
                flowState.seqOrgMap.set(key, null);
            }
        }),
    );
}

function buildOrderedFlow(flowList) {
    const sortFlow = [];
    const visited = new Set();
    const firstFlow = flowList.find((f) => String(f.CSTART) === '1');

    if (firstFlow) {
        let currentFlow = firstFlow;
        while (currentFlow && !visited.has(getStepCode(currentFlow))) {
            sortFlow.push(currentFlow);
            visited.add(getStepCode(currentFlow));
            const nextNo = String(currentFlow.CSTEPNEXTNO ?? '').trim();
            currentFlow =
                flowList.find((f) => getStepCode(f) === nextNo) || null;
        }
    }

    // Append any unlinked/orphaned steps so none are silently lost
    for (const item of flowList) {
        const code = getStepCode(item);
        if (!visited.has(code)) {
            sortFlow.push(item);
            visited.add(code);
        }
    }
    return sortFlow;
}

function recomputeChain(list) {
    return list.map((step, idx) => ({
        ...step,
        CSTART: idx === 0 ? '1' : '0',
        CSTEPNEXTNO:
            idx < list.length - 1
                ? getStepCode(list[idx + 1])
                : flowState.terminalNextNo,
    }));
}

function getChangedOrderSteps() {
    const recomputed = recomputeChain(flowState.sortFlow);
    return recomputed.filter((step) => {
        const orig = flowState.persistedMap.get(getStepCode(step));
        if (!orig) return true;
        return (
            String(orig.CSTART ?? '0') !== String(step.CSTART) ||
            String(orig.CSTEPNEXTNO ?? '').trim() !==
                String(step.CSTEPNEXTNO ?? '').trim()
        );
    });
}

function isOrderDirty() {
    if (flowState.sortFlow.length !== flowState.persistedList.length) {
        return true;
    }
    for (let i = 0; i < flowState.sortFlow.length; i++) {
        if (
            getStepCode(flowState.sortFlow[i]) !==
            getStepCode(flowState.persistedList[i])
        ) {
            return true;
        }
    }
    return false;
}

function resolveApproverSummary(fs) {
    const ctype = String(fs.CTYPE ?? '').trim();
    const vpos = String(fs.VPOSNO ?? '').trim();
    const vorg = String(fs.VAPVORGNO ?? '').trim();
    const vapv = String(fs.VAPVNO ?? '').trim();

    if (ctype === '1') {
        const pos = flowState.posMap.get(vpos);
        const label = pos
            ? `${pos.SPOSCODE} : ${pos.SPOSITION}`
            : vpos
              ? `Position ${vpos}`
              : 'Position not set';
        return {
            badge: 'REQ',
            badgeClass: 'badge-info badge-soft',
            icon: 'fi fi-rr-user-gear',
            primary: label,
            secondary: 'Refer to Requester',
            searchText: `requester ${label} ${vpos}`,
        };
    }

    if (ctype === '2') {
        const og = flowState.orgMap.get(`${vpos}|${vorg}`);
        const orgLabel = og
            ? `${og.orgname} · ${og.posname} (${og.pos})`
            : [vorg ? `Org ${vorg}` : '', vpos ? `Pos ${vpos}` : '']
                  .filter(Boolean)
                  .join(' · ') || 'Org / Position not set';
        const seqEmpNo = flowState.seqOrgMap.get(`${vpos}|${vorg}`) || '';
        const seqEmp = seqEmpNo ? flowState.userMap.get(seqEmpNo) : null;
        const empTitle = seqEmpNo
            ? seqEmp
                ? `${seqEmpNo} · ${seqEmp.SNAME}`
                : seqEmpNo
            : '';
        return {
            badge: 'ORG',
            badgeClass: 'badge-secondary badge-soft',
            icon: 'fi fi-rr-building',
            primary: orgLabel,
            empCode: seqEmpNo,
            empTitle,
            secondary: 'Refer to Form Owner',
            searchText: `owner org ${orgLabel} ${vpos} ${vorg} ${empTitle}`,
        };
    }

    if (ctype === '3') {
        const emp = flowState.userMap.get(vapv);
        const label = emp
            ? `${emp.SNAME} (${vapv})`
            : vapv || 'Specific approver not set';
        return {
            badge: 'EMP',
            badgeClass: 'badge-accent badge-soft',
            icon: 'fi fi-rr-user',
            primary: label,
            secondary: 'Specific Approver',
            searchText: `specific ${label} ${vapv}`,
        };
    }

    const fallback = vapv || 'SYSTEM';
    return {
        badge: 'SYS',
        badgeClass: 'badge-ghost',
        icon: 'fi fi-rr-settings',
        primary: fallback,
        secondary: 'System / Unspecified',
        searchText: fallback,
    };
}

function formatShortUrl(url) {
    if (!url) return '';
    const trimmed = String(url).trim();
    if (!trimmed || trimmed === 'https://' || trimmed === 'http://') return '';
    try {
        const parsed = new URL(trimmed);
        return parsed.pathname && parsed.pathname !== '/'
            ? parsed.pathname
            : parsed.host;
    } catch {
        return trimmed;
    }
}

function renderFlowList() {
    const listEl = $('#flow-list-row');
    const total = flowState.sortFlow.length;
    $('#flow-step-count').text(total);

    const query = flowState.searchQuery.trim().toLowerCase();
    const isFiltering = query.length > 0;
    const displaySteps = recomputeChain(flowState.sortFlow);

    const filtered = displaySteps
        .map((step, index) => ({ step, index }))
        .filter(({ step }) => {
            if (!isFiltering) return true;
            const code = getStepCode(step).toLowerCase();
            const name = getStepName(step).toLowerCase();
            const apv = resolveApproverSummary(step);
            const ext = String(step.CEXTDATA ?? '').toLowerCase();
            const url = String(step.VURL ?? '').toLowerCase();
            return (
                code.includes(query) ||
                name.includes(query) ||
                apv.searchText.toLowerCase().includes(query) ||
                ext.includes(query) ||
                url.includes(query)
            );
        });

    $('#flow-filter-status').text(
        isFiltering ? `${filtered.length}/${total}` : `${total} steps`,
    );

    listEl.empty();

    if (total === 0) {
        listEl.append(`
            <div class="border border-dashed border-base-300 bg-base-100 p-6 text-center space-y-2 mb-3">
                <div class="text-xs font-semibold text-base-content">No approval steps configured</div>
                <p class="text-[11px] wf-mute">Click <strong>Add Step</strong> to define the approval sequence for this form.</p>
            </div>
        `);
        return;
    }

    if (filtered.length === 0) {
        listEl.append(`
            <div class="border border-base-300 bg-base-100 p-5 text-center text-xs wf-mute mb-3">
                No steps match "<span class="font-semibold text-base-content">${escapeHtml(flowState.searchQuery)}</span>".
            </div>
        `);
        return;
    }

    if (isFiltering) {
        listEl.append(`
            <div class="px-2.5 py-1.5 bg-base-200 border border-base-300 text-[11px] wf-mute flex items-center justify-between gap-2">
                <span>Clear search filter to drag or reorder steps.</span>
                <button type="button" class="link link-primary text-[11px] font-semibold" id="clear-flow-search">Clear</button>
            </div>
        `);
    }

    const fragment = document.createDocumentFragment();
    for (const { step, index } of filtered) {
        const code = getStepCode(step);
        const name = getStepName(step);
        const apv = resolveApproverSummary(step);
        const isFirst = index === 0;
        const isLast = index === total - 1;
        const extData = String(step.CEXTDATA ?? '').trim();
        const nextLabel = isLast ? 'END' : `→ ${step.CSTEPNEXTNO}`;

        const row = document.createElement('div');
        row.className = 'flow-step-item';
        row.setAttribute('role', 'listitem');
        row.dataset.stepno = code;
        row.dataset.index = String(index);
        row.dataset.start = isFirst ? '1' : '0';

        row.innerHTML = `
            <div class="flex items-center gap-1 shrink-0">
                <button type="button"
                    class="flow-drag-handle"
                    aria-label="Reorder step ${index + 1}: ${escapeHtml(name)} (${escapeHtml(code)}). Press Space to grab."
                    aria-pressed="false"
                    ${isFiltering || total <= 1 ? 'disabled' : ''}
                    title="${isFiltering ? 'Clear filter to reorder' : 'Drag to reorder (or Space + Arrows)'}">
                    <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor" aria-hidden="true">
                        <circle cx="3.5" cy="3" r="1.25"></circle>
                        <circle cx="8.5" cy="3" r="1.25"></circle>
                        <circle cx="3.5" cy="8" r="1.25"></circle>
                        <circle cx="8.5" cy="8" r="1.25"></circle>
                        <circle cx="3.5" cy="13" r="1.25"></circle>
                        <circle cx="8.5" cy="13" r="1.25"></circle>
                    </svg>
                </button>
                <span class="flow-seq-badge" title="Sequence #${index + 1}">${index + 1}</span>
            </div>

            <div class="min-w-0 flex flex-col gap-1">
                <div class="flex items-center gap-1.5 min-w-0">
                    <span class="font-mono text-[10px] font-bold px-1 py-0.5 bg-base-200 border border-base-300 text-primary shrink-0">${escapeHtml(code)}</span>
                    <span class="text-xs font-bold text-base-content truncate" title="${escapeHtml(name)}">${escapeHtml(name)}</span>
                    ${isFirst ? '<span class="badge badge-xs badge-primary font-mono text-[9px] font-bold shrink-0">START</span>' : ''}
                </div>

                <div class="flex items-center gap-1.5 min-w-0 text-[11px] text-base-content/90">
                    <span class="badge badge-xs ${apv.badgeClass} font-mono text-[9px] font-bold px-1 shrink-0" title="${escapeHtml(apv.secondary)}">${apv.badge}</span>
                    <span class="truncate font-medium" title="${escapeHtml(`${apv.secondary}: ${apv.primary}`)}">${escapeHtml(apv.primary)}</span>
                </div>

                <div class="flex flex-wrap items-center gap-1.5 text-[10px] wf-mute">
                    ${apv.empTitle ? `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 border border-base-300 bg-base-200/80 text-base-content font-medium max-w-full truncate" title="SEQUENCEORG: ${escapeHtml(apv.empTitle)}"><i class="fi fi-rr-user text-[9px] text-primary shrink-0"></i><span class="truncate">${escapeHtml(apv.empTitle)}</span></span>` : ''}
                    ${extData ? `<span class="inline-flex items-center px-1.5 py-0.5 border border-neutral bg-base-100 text-neutral font-mono font-bold shrink-0" title="Extra Data (CEXTDATA)">EXT:${escapeHtml(extData)}</span>` : ''}
                    <span class="ml-auto font-mono opacity-75 shrink-0" title="Next Step">${escapeHtml(nextLabel)}</span>
                </div>
                <span class="flow-kbd-hint" aria-hidden="true">Space to reorder</span>
            </div>

            <div class="flex items-center gap-0.5 shrink-0">
                <div class="flex flex-col gap-0.5 mr-0.5">
                    <button type="button"
                        class="btn btn-ghost btn-xs h-5 min-h-5 w-5 p-0 border border-base-300 flow-move-up"
                        data-stepno="${escapeHtml(code)}"
                        aria-label="Move step ${escapeHtml(name)} up"
                        title="Move up"
                        ${isFirst || isFiltering ? 'disabled' : ''}>
                        <i class="fi fi-rr-angle-small-up text-xs"></i>
                    </button>
                    <button type="button"
                        class="btn btn-ghost btn-xs h-5 min-h-5 w-5 p-0 border border-base-300 flow-move-down"
                        data-stepno="${escapeHtml(code)}"
                        aria-label="Move step ${escapeHtml(name)} down"
                        title="Move down"
                        ${isLast || isFiltering ? 'disabled' : ''}>
                        <i class="fi fi-rr-angle-small-down text-xs"></i>
                    </button>
                </div>
                <button type="button"
                    class="btn btn-ghost btn-xs h-7 min-h-7 w-7 p-0 text-primary hover:bg-primary/10 edit-flow"
                    data-stepno="${escapeHtml(code)}"
                    aria-label="Edit step ${escapeHtml(name)}"
                    title="Edit step">
                    <i class="fi fi-rr-pencil text-xs"></i>
                </button>
                <button type="button"
                    class="btn btn-ghost btn-xs h-7 min-h-7 w-7 p-0 text-error hover:bg-error/10 delete-flow"
                    data-stepno="${escapeHtml(code)}"
                    aria-label="Delete step ${escapeHtml(name)}"
                    title="Delete step">
                    <i class="fi fi-rr-trash text-xs"></i>
                </button>
            </div>
        `;
        fragment.appendChild(row);
    }

    listEl[0].appendChild(fragment);
}

function updateOrderBar() {
    const bar = $('#flow-order-bar');
    if (isOrderDirty()) {
        const changed = getChangedOrderSteps().length;
        $('#flow-order-summary').text(
            `Sequence modified (${changed} ${changed === 1 ? 'step' : 'steps'} to update)`,
        );
        bar.removeClass('hidden');
    } else {
        bar.addClass('hidden');
    }
}

function announceLive(message) {
    const region = document.getElementById('flow-live-region');
    if (!region) return;
    clearTimeout(flowState.liveAnnounceTimer);
    region.textContent = '';
    flowState.liveAnnounceTimer = setTimeout(() => {
        region.textContent = message;
    }, 500);
}

function moveNode(container, item, referenceNode) {
    if ('moveBefore' in Element.prototype) {
        container.moveBefore(item, referenceNode);
    } else if (referenceNode) {
        referenceNode.before(item);
    } else {
        container.append(item);
    }
}

function animateFlip(elements, beforeRects, scrollDeltaY = 0) {
    if (prefersReducedMotion()) return;
    for (const el of elements) {
        const before = beforeRects.get(el);
        if (!before) continue;
        const after = el.getBoundingClientRect();
        const dy = before.top - after.top + scrollDeltaY;
        if (Math.abs(dy) < 0.5) continue;
        el.animate(
            [{ translate: `0 ${dy}px` }, { translate: '0 0' }],
            { duration: 180, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
        );
    }
}

function syncOrderFromDom() {
    const items = Array.from(
        document.querySelectorAll('#flow-list-row > .flow-step-item'),
    );
    const byCode = new Map(
        flowState.sortFlow.map((s) => [getStepCode(s), s]),
    );
    flowState.sortFlow = items
        .map((el) => byCode.get(el.dataset.stepno))
        .filter(Boolean);

    const recomputed = recomputeChain(flowState.sortFlow);
    const total = recomputed.length;
    items.forEach((el, idx) => {
        const step = recomputed[idx];
        const isFirst = idx === 0;
        const isLast = idx === total - 1;
        el.dataset.index = String(idx);
        el.dataset.start = isFirst ? '1' : '0';

        const seqBadge = el.querySelector('.flow-seq-badge');
        if (seqBadge) {
            seqBadge.textContent = String(idx + 1);
            seqBadge.title = `Sequence #${idx + 1}`;
        }

        const upBtn = el.querySelector('.flow-move-up');
        const downBtn = el.querySelector('.flow-move-down');
        if (upBtn) upBtn.disabled = isFirst;
        if (downBtn) downBtn.disabled = isLast;

        const handle = el.querySelector('.flow-drag-handle');
        if (handle) {
            handle.setAttribute(
                'aria-label',
                `Reorder step ${idx + 1}: ${getStepName(step)} (${getStepCode(step)}). Press Space to grab.`,
            );
        }

        // Update START badge
        const titleRow = el.querySelector('.min-w-0 > div:first-child');
        if (titleRow) {
            const existingStart = titleRow.querySelector('.badge-primary');
            if (isFirst && !existingStart) {
                titleRow.insertAdjacentHTML(
                    'beforeend',
                    '<span class="badge badge-xs badge-primary font-mono text-[9px] font-bold shrink-0">START</span>',
                );
            } else if (!isFirst && existingStart) {
                existingStart.remove();
            }
        }

        // Update next pointer text
        const nextSpan = el.querySelector('span[title="Next Step"]');
        if (nextSpan) {
            nextSpan.textContent = isLast ? 'END' : `→ ${step.CSTEPNEXTNO}`;
        }
    });

    updateOrderBar();
}

function moveStepByButton(stepNo, direction, triggerBtn) {
    if (flowState.searchQuery.trim() !== '') return;
    const list = document.getElementById('flow-list-row');
    const items = Array.from(list.querySelectorAll(':scope > .flow-step-item'));
    const idx = items.findIndex((el) => el.dataset.stepno === stepNo);
    const targetIdx = idx + direction;
    if (idx < 0 || targetIdx < 0 || targetIdx >= items.length) return;

    const item = items[idx];
    const beforeRects = new Map(
        items.map((el) => [el, el.getBoundingClientRect()]),
    );
    const refNode = direction < 0 ? items[targetIdx] : items[targetIdx].nextElementSibling;
    moveNode(list, item, refNode);
    item.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    animateFlip(items, beforeRects);
    syncOrderFromDom();

    // Preserve focus on clicked button, or shift to opposite arrow if at boundary
    const upBtn = item.querySelector('.flow-move-up');
    const downBtn = item.querySelector('.flow-move-down');
    if (triggerBtn && !triggerBtn.disabled) {
        triggerBtn.focus({ preventScroll: true });
    } else if (direction < 0 && downBtn && !downBtn.disabled) {
        downBtn.focus({ preventScroll: true });
    } else if (direction > 0 && upBtn && !upBtn.disabled) {
        upBtn.focus({ preventScroll: true });
    }

    const step = flowState.sortFlow[targetIdx];
    announceLive(
        `Moved ${getStepName(step)} to position ${targetIdx + 1} of ${flowState.sortFlow.length}`,
    );
}

// ============================================================================
// Pointer & Keyboard Drag-and-Drop (with Drop Marker, FLIP & Auto-Scroll)
// ============================================================================

function initFlowDragAndDrop() {
    const list = document.getElementById('flow-list-row');
    const scroller = document.getElementById('flow-scroll-container');
    if (!list || !scroller) return;

    let drag = null;
    let grabbed = null;
    let suppressBlur = false;

    const getItems = () =>
        Array.from(list.querySelectorAll(':scope > .flow-step-item'));

    function clearDropMarker() {
        list.removeAttribute('data-drop');
        list.style.removeProperty('--drop-x');
        list.style.removeProperty('--drop-y');
        list.style.removeProperty('--drop-w');
        list.style.removeProperty('--drop-h');
    }

    function computeDropTarget(clientY) {
        const items = getItems();
        const scrollerRect = scroller.getBoundingClientRect();
        const clampedY = Math.min(
            Math.max(clientY, scrollerRect.top),
            scrollerRect.bottom,
        );
        const listRect = list.getBoundingClientRect();
        const yInList = clampedY - listRect.top - list.clientTop;

        let referenceNode = null;
        for (const sibling of items) {
            if (sibling === drag.item) continue;
            const mid = sibling.offsetTop + sibling.offsetHeight / 2;
            if (yInList < mid) {
                referenceNode = sibling;
                break;
            }
        }
        return referenceNode;
    }

    function updateDropMarker(referenceNode) {
        if (
            !drag ||
            referenceNode === drag.item.nextElementSibling ||
            referenceNode === drag.item
        ) {
            clearDropMarker();
            return;
        }

        const items = getItems().filter((el) => el !== drag.item);
        if (items.length === 0) {
            clearDropMarker();
            return;
        }

        let markerY;
        let sampleRect;
        if (referenceNode) {
            const nextRect = referenceNode.getBoundingClientRect();
            const prevIdx = items.indexOf(referenceNode) - 1;
            const prevEl = prevIdx >= 0 ? items[prevIdx] : null;
            markerY = prevEl
                ? (prevEl.getBoundingClientRect().bottom + nextRect.top) / 2
                : nextRect.top - 3;
            sampleRect = nextRect;
        } else {
            const lastRect = items[items.length - 1].getBoundingClientRect();
            markerY = lastRect.bottom + 3;
            sampleRect = lastRect;
        }

        list.setAttribute('data-drop', '');
        list.style.setProperty('--drop-x', `${sampleRect.left}px`);
        list.style.setProperty('--drop-y', `${markerY}px`);
        list.style.setProperty('--drop-w', `${sampleRect.width}px`);
        list.style.setProperty('--drop-h', '2px');
    }

    function updateDraggedPosition() {
        if (!drag) return;
        const scrollDelta = scroller.scrollTop - drag.startScrollTop;
        const dy = drag.lastClientY - drag.startClientY + scrollDelta;
        drag.item.style.translate = `0 ${dy}px`;
        drag.referenceNode = computeDropTarget(drag.lastClientY);
        updateDropMarker(drag.referenceNode);
    }

    function autoScrollStep(now) {
        if (!drag) return;
        const dt = Math.min(32, now - (drag.lastFrameTime || now));
        drag.lastFrameTime = now;

        const rect = scroller.getBoundingClientRect();
        const edgeZone = Math.min(drag.itemHeight, rect.height / 3);
        let speed = 0;

        if (drag.lastClientY < rect.top + edgeZone) {
            const depth = rect.top + edgeZone - drag.lastClientY;
            speed = -Math.min(18, (depth / edgeZone) * 10);
        } else if (drag.lastClientY > rect.bottom - edgeZone) {
            const depth = drag.lastClientY - (rect.bottom - edgeZone);
            speed = Math.min(18, (depth / edgeZone) * 10);
        }

        if (speed !== 0) {
            const prev = scroller.scrollTop;
            scroller.scrollTop += speed * (dt / 16);
            if (scroller.scrollTop !== prev) {
                updateDraggedPosition();
            }
        }
        drag.rafId = requestAnimationFrame(autoScrollStep);
    }

    function endPointerDrag(cancelled) {
        if (!drag) return;
        const currentDrag = drag;
        drag = null;

        cancelAnimationFrame(currentDrag.rafId);
        document.documentElement.classList.remove('flow-dragging');
        clearDropMarker();

        const item = currentDrag.item;
        const items = getItems();
        const beforeRects = new Map(
            items.map((el) => [el, el.getBoundingClientRect()]),
        );
        const releasedRect = item.getBoundingClientRect();

        item.style.removeProperty('translate');

        const changed =
            !cancelled &&
            currentDrag.referenceNode !== item.nextElementSibling &&
            currentDrag.referenceNode !== item;

        if (changed) {
            moveNode(list, item, currentDrag.referenceNode);
            item.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            syncOrderFromDom();
        } else if (cancelled) {
            item.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }

        if (!prefersReducedMotion()) {
            const others = items.filter((el) => el !== item);
            if (changed) animateFlip(others, beforeRects);

            item.getAnimations().forEach((anim) => anim.finish());
            const finalRect = item.getBoundingClientRect();
            const dy = releasedRect.top - finalRect.top;
            if (Math.abs(dy) >= 0.5) {
                const anim = item.animate(
                    [{ translate: `0 ${dy}px` }, { translate: '0 0' }],
                    { duration: 180, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
                );
                anim.finished
                    .then(() => {
                        if (!drag || drag.item !== item) {
                            delete item.dataset.dragging;
                        }
                    })
                    .catch(() => {});
            } else {
                delete item.dataset.dragging;
            }
        } else {
            delete item.dataset.dragging;
        }

        if (changed) {
            const newIdx = getItems().indexOf(item);
            const step = flowState.sortFlow[newIdx];
            if (step) {
                announceLive(
                    `Moved ${getStepName(step)} to position ${newIdx + 1} of ${flowState.sortFlow.length}`,
                );
            }
        } else if (cancelled) {
            announceLive('Reorder cancelled');
        }
    }

    list.addEventListener('pointerdown', (e) => {
        if (e.button !== 0 || drag || flowState.searchQuery.trim() !== '') return;
        const handle = e.target.closest('.flow-drag-handle');
        if (!handle || handle.disabled) return;
        const item = handle.closest('.flow-step-item');
        if (!item) return;

        e.preventDefault();
        handle.setPointerCapture(e.pointerId);

        item.getAnimations().forEach((anim) => anim.finish());
        item.dataset.dragging = 'true';
        document.documentElement.classList.add('flow-dragging');

        drag = {
            pointerId: e.pointerId,
            handle,
            item,
            itemHeight: item.getBoundingClientRect().height,
            startClientY: e.clientY,
            lastClientY: e.clientY,
            startScrollTop: scroller.scrollTop,
            referenceNode: item.nextElementSibling,
            rafId: 0,
            lastFrameTime: performance.now(),
        };
        drag.rafId = requestAnimationFrame(autoScrollStep);
    });

    document.addEventListener('pointermove', (e) => {
        if (!drag || e.pointerId !== drag.pointerId) return;
        drag.lastClientY = e.clientY;
        updateDraggedPosition();
    });

    document.addEventListener('pointerup', (e) => {
        if (!drag || e.pointerId !== drag.pointerId) return;
        endPointerDrag(false);
    });

    document.addEventListener('pointercancel', (e) => {
        if (!drag || e.pointerId !== drag.pointerId) return;
        endPointerDrag(true);
    });

    list.addEventListener('lostpointercapture', (e) => {
        if (!drag || e.pointerId !== drag.pointerId) return;
        endPointerDrag(false);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drag) {
            e.preventDefault();
            endPointerDrag(true);
        }
    });

    // Keyboard grab-move-drop on drag handle
    function dropKeyboardGrab(cancelled) {
        if (!grabbed) return;
        const { item, handle, origRefNode, origIndex } = grabbed;
        grabbed = null;

        handle.setAttribute('aria-pressed', 'false');
        delete item.dataset.grabbed;
        const hint = item.querySelector('.flow-kbd-hint');
        if (hint) hint.textContent = 'Space to reorder';

        if (cancelled) {
            const items = getItems();
            const beforeRects = new Map(
                items.map((el) => [el, el.getBoundingClientRect()]),
            );
            suppressBlur = true;
            moveNode(list, item, origRefNode);
            item.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            handle.focus({ preventScroll: true });
            suppressBlur = false;
            animateFlip(items, beforeRects);
            syncOrderFromDom();
            announceLive(`Reorder cancelled. Returned to position ${origIndex + 1}`);
        } else {
            const newIdx = getItems().indexOf(item);
            if (newIdx !== origIndex) {
                const step = flowState.sortFlow[newIdx];
                announceLive(
                    `Dropped ${getStepName(step)} at position ${newIdx + 1} of ${flowState.sortFlow.length}`,
                );
            }
        }
    }

    list.addEventListener('keydown', (e) => {
        const handle = e.target.closest('.flow-drag-handle');
        if (!handle || handle.disabled) return;
        const item = handle.closest('.flow-step-item');
        if (!item) return;

        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (grabbed && grabbed.item === item) {
                dropKeyboardGrab(false);
            } else {
                const items = getItems();
                const origIndex = items.indexOf(item);
                grabbed = {
                    item,
                    handle,
                    origIndex,
                    origRefNode: item.nextElementSibling,
                };
                handle.setAttribute('aria-pressed', 'true');
                item.dataset.grabbed = 'true';
                const hint = item.querySelector('.flow-kbd-hint');
                if (hint) {
                    hint.textContent =
                        'Arrows to move · Space to drop · Esc to cancel';
                }
                const step = flowState.sortFlow[origIndex];
                announceLive(
                    `Grabbed ${getStepName(step)}, position ${origIndex + 1} of ${items.length}. Use Up and Down arrows to move, Space to drop, Escape to cancel.`,
                );
            }
            return;
        }

        if (!grabbed || grabbed.item !== item) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            dropKeyboardGrab(true);
            return;
        }

        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            const direction = e.key === 'ArrowUp' ? -1 : 1;
            const items = getItems();
            const idx = items.indexOf(item);
            const targetIdx = idx + direction;
            if (targetIdx < 0 || targetIdx >= items.length) return;

            const beforeRects = new Map(
                items.map((el) => [el, el.getBoundingClientRect()]),
            );
            const refNode =
                direction < 0
                    ? items[targetIdx]
                    : items[targetIdx].nextElementSibling;
            suppressBlur = true;
            moveNode(list, item, refNode);
            item.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            handle.focus({ preventScroll: true });
            suppressBlur = false;
            animateFlip(items, beforeRects);
            syncOrderFromDom();

            const step = flowState.sortFlow[targetIdx];
            announceLive(
                `${getStepName(step)}, position ${targetIdx + 1} of ${items.length}`,
            );
        }
    });

    list.addEventListener(
        'focusout',
        (e) => {
            if (suppressBlur) return;
            if (grabbed && e.target === grabbed.handle) {
                dropKeyboardGrab(false);
            }
        },
        true,
    );

    list.addEventListener('focusin', (e) => {
        const item = e.target.closest('.flow-step-item');
        if (!item) return;
        if (
            e.target.matches(':focus-visible') &&
            item.getAnimations().length === 0
        ) {
            item.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
    });
}

// ============================================================================
// Modal Helpers (Add / Edit / Delete)
// ============================================================================

function populateStepSuggestions() {
    const datalist = $('#fm-step-suggestions');
    datalist.empty();
    const seen = new Set();
    for (const s of flowState.persistedList) {
        const code = getStepCode(s);
        if (!code || seen.has(code)) continue;
        seen.add(code);
        datalist.append(
            `<option value="${escapeHtml(code)}">${escapeHtml(getStepName(s))}</option>`,
        );
    }
}

async function ensureModalSelects() {
    if (flowState.modalSelectsReady) return;
    const modalParent = $('#flow-step-modal');

    // Position select (CTYPE = 1)
    const posSel = $('#fm-pos-select');
    posSel.empty().append('<option value=""></option>');
    for (const pos of flowState.posList) {
        posSel.append(
            `<option value="${escapeHtml(pos.SPOSCODE)}">${escapeHtml(`${pos.SPOSCODE} : ${pos.SPOSITION}`)}</option>`,
        );
    }
    await setSelect2({
        element: '#fm-pos-select',
        placeholder: 'Select position...',
        size: 'sm',
        width: '100%',
        dropdownParent: modalParent,
        emptyValue: false,
    });

    // Org + Position select (CTYPE = 2)
    const orgSel = $('#fm-org-select');
    orgSel.empty().append('<option value=""></option>');
    for (const og of flowState.orgList) {
        orgSel.append(
            `<option value="${escapeHtml(`${og.pos}|${og.orgs}`)}">${escapeHtml(`${og.pos} : ${og.orgname} ${og.posname}`)}</option>`,
        );
    }
    await setSelect2({
        element: '#fm-org-select',
        placeholder: 'Select organization & position...',
        size: 'sm',
        width: '100%',
        dropdownParent: modalParent,
        emptyValue: false,
    });

    // Specific employee select (CTYPE = 3) with tags: true for custom empno
    const empSel = $('#fm-emp-select');
    empSel.empty().append('<option value=""></option>');
    for (const u of flowState.userList) {
        empSel.append(
            `<option value="${escapeHtml(u.SEMPNO)}">${escapeHtml(`${u.SEMPNO} : ${u.SNAME}`)}</option>`,
        );
    }
    await setSelect2({
        element: '#fm-emp-select',
        placeholder: 'Search employee or type ID...',
        size: 'sm',
        width: '100%',
        dropdownParent: modalParent,
        tags: true,
        emptyValue: false,
    });

    flowState.modalSelectsReady = true;
}

function toggleCtypePanels(ctype) {
    $('#fm-ctype-panel-1').toggleClass('hidden', ctype !== '1');
    $('#fm-ctype-panel-2').toggleClass('hidden', ctype !== '2');
    $('#fm-ctype-panel-3').toggleClass('hidden', ctype !== '3');
}

function populateInsertPositions() {
    const sel = $('#fm-insert-pos');
    sel.empty();
    sel.append('<option value="end">At the end (after last step)</option>');
    if (flowState.sortFlow.length > 0) {
        sel.append('<option value="start">At the beginning (new Start step)</option>');
        flowState.sortFlow.forEach((step, idx) => {
            const code = getStepCode(step);
            sel.append(
                `<option value="after:${escapeHtml(code)}">After #${idx + 1} · ${escapeHtml(code)} — ${escapeHtml(getStepName(step))}</option>`,
            );
        });
    }
}

async function openStepModal(mode, step = null) {
    if (isOrderDirty()) {
        showErrorMessage(
            'Please click "Save Order" or "Reset" before adding or editing steps.',
        );
        return;
    }

    await ensureModalSelects();
    $('#flow-modal-error').text('');
    $('#fm-mode').val(mode);

    const dialog = document.getElementById('flow-step-modal');

    if (mode === 'edit' && step) {
        const code = getStepCode(step);
        const ctype = ['1', '2', '3'].includes(String(step.CTYPE))
            ? String(step.CTYPE)
            : '1';

        $('#flow-modal-title').text('Edit Flow Step');
        $('#flow-modal-step-badge').text(code).removeClass('hidden');
        $('#fm-orig-stepno').val(code);
        $('#fm-step-no').val(code).prop('readonly', true);
        $('#fm-step-name')
            .val(step.STEPMST?.VNAME || '')
            .prop('readonly', true);
        $('#fm-insert-pos-wrap').addClass('hidden');

        $(`input[name="fm-ctype"][value="${ctype}"]`).prop('checked', true);
        toggleCtypePanels(ctype);

        $('#fm-pos-select')
            .val(ctype === '1' ? String(step.VPOSNO ?? '').trim() : '')
            .trigger('change');

        const orgVal =
            ctype === '2' && step.VPOSNO && step.VAPVORGNO
                ? `${String(step.VPOSNO).trim()}|${String(step.VAPVORGNO).trim()}`
                : '';
        $('#fm-org-select').val(orgVal).trigger('change');

        const empVal =
            ctype === '3' && step.VAPVNO && step.VAPVNO !== 'SYSTEM'
                ? String(step.VAPVNO).trim()
                : '';
        if (
            empVal &&
            $('#fm-emp-select').find(`option[value="${CSS.escape(empVal)}"]`)
                .length === 0
        ) {
            $('#fm-emp-select').append(
                new Option(empVal, empVal, true, true),
            );
        }
        $('#fm-emp-select').val(empVal).trigger('change');

        const apvType = String(step.CAPVTYPE) === '3' ? '3' : '1';
        $(`input[name="fm-apvtype"][value="${apvType}"]`).prop('checked', true);
        $('#fm-applyall').prop('checked', String(step.CAPPLYALL) === '2');
        $('#fm-url').val(step.VURL || '');
        $('#fm-extdata').val(step.CEXTDATA || '');
    } else {
        $('#flow-modal-title').text('Add Flow Step');
        $('#flow-modal-step-badge').addClass('hidden').text('');
        $('#fm-orig-stepno').val('');
        $('#fm-step-no').val('').prop('readonly', false);
        $('#fm-step-name').val('').prop('readonly', false);
        populateInsertPositions();
        $('#fm-insert-pos-wrap').removeClass('hidden');

        $('input[name="fm-ctype"][value="1"]').prop('checked', true);
        toggleCtypePanels('1');
        $('#fm-pos-select').val('').trigger('change');
        $('#fm-org-select').val('').trigger('change');
        $('#fm-emp-select').val('').trigger('change');

        $('input[name="fm-apvtype"][value="1"]').prop('checked', true);
        $('#fm-applyall').prop('checked', false);
        $('#fm-url').val('');
        $('#fm-extdata').val('');
    }

    dialog.showModal();
}

function buildFlowPayload(step, overrides = {}) {
    const merged = { ...step, ...overrides };
    return {
        NFRMNO: flowState.formno?.nno ?? $('#nno').val(),
        VORGNO: flowState.formno?.orgno ?? $('#vorgno').val(),
        CYEAR: flowState.formno?.cyear ?? $('#cyear').val(),
        CSTEPNO: getStepCode(merged),
        CSTEPNEXTNO: String(merged.CSTEPNEXTNO ?? flowState.terminalNextNo).trim(),
        VPOSNO: merged.VPOSNO || null,
        VAPVNO: merged.VAPVNO || 'SYSTEM',
        VAPVORGNO: merged.VAPVORGNO || null,
        VURL: merged.VURL || '',
        CSTART: String(merged.CSTART ?? '0'),
        CTYPE: String(merged.CTYPE ?? '1'),
        CEXTDATA: merged.CEXTDATA || '',
        CAPVTYPE: String(merged.CAPVTYPE ?? '1'),
        CREJTYPE: merged.CREJTYPE ?? null,
        CAPPLYALL: String(merged.CAPPLYALL ?? '0'),
    };
}

function openDeleteModal(stepNo) {
    if (isOrderDirty()) {
        showErrorMessage(
            'Please click "Save Order" or "Reset" before deleting steps.',
        );
        return;
    }

    const idx = flowState.sortFlow.findIndex((s) => getStepCode(s) === stepNo);
    if (idx < 0) return;

    const step = flowState.sortFlow[idx];
    const apv = resolveApproverSummary(step);
    const prev = idx > 0 ? flowState.sortFlow[idx - 1] : null;
    const next =
        idx < flowState.sortFlow.length - 1 ? flowState.sortFlow[idx + 1] : null;

    flowState.pendingDeleteStepNo = stepNo;
    $('#flow-delete-summary').html(`
        <div class="flex items-center gap-2">
            <span class="font-mono font-bold text-primary">${escapeHtml(stepNo)}</span>
            <span class="font-semibold text-base-content">${escapeHtml(getStepName(step))}</span>
        </div>
        <div class="wf-mute">${escapeHtml(apv.secondary)}: <span class="text-base-content font-medium">${escapeHtml(apv.primary)}${apv.empTitle ? ` (${escapeHtml(apv.empTitle)})` : ''}</span></div>
    `);

    let relinkText = '';
    if (prev && next) {
        relinkText = `Chain will relink automatically: ${getStepCode(prev)} (${getStepName(prev)}) → ${getStepCode(next)} (${getStepName(next)}).`;
    } else if (prev && !next) {
        relinkText = `Step ${getStepCode(prev)} (${getStepName(prev)}) will become the final step.`;
    } else if (!prev && next) {
        relinkText = `Step ${getStepCode(next)} (${getStepName(next)}) will become the new START step.`;
    } else {
        relinkText = 'This is the only step in the workflow.';
    }
    $('#flow-delete-relink').text(relinkText);

    document.getElementById('flow-delete-modal').showModal();
}

// ============================================================================
// Event Handlers
// ============================================================================

$(document).on('change', '#vorgno', async function () {
    if (!flowState.isCreateMode) return;
    await populateFormGroupsByOwner($(this).val() || '');
});

$(document).on('click', '#add-form-btn', async function (e) {
    e.preventDefault();
    try {
        $('#form-info')
            .find('.req-1')
            .each(function () {
                const val = $(this).val();
                if (!val || String(val).trim() === '') {
                    showErrorMessage('Please fill in all required fields');
                    $(this).focus();
                    throw new Error('Required field is empty');
                }
            });

        await activatedBtnRow($(this), true);
        const data = await formValue();
        if (!data.NNO) delete data.NNO;
        const result = await createFormMaster(data);
        if (result) {
            showMessage('Form created successfully', 'success');
            const created = result.data || result;
            if (created?.NNO && created?.VORGNO && created?.CYEAR) {
                window.location.href = `${process.env.APP_ENV}/admin/formmaster/detail/${created.NNO}/${created.VORGNO}/${created.CYEAR}`;
            } else {
                window.location.href = `${process.env.APP_ENV}/admin/formmaster/`;
            }
        } else {
            showErrorMessage(result?.message || 'Error creating form');
        }
    } catch (error) {
        if (error?.message === 'Required field is empty') return;
        console.error(error);
        showErrorMessage(error?.responseJSON?.message || 'Error creating form');
    } finally {
        await activatedBtnRow($(this), false);
    }
});

$(document).on('click', '#edit-form-btn', async function (e) {
    e.preventDefault();
    try {
        $('#form-info')
            .find('.req-1')
            .each(function () {
                if ($(this).val().trim() === '') {
                    showErrorMessage('Please fill in all required fields');
                    $(this).focus();
                    throw new Error('Required field is empty');
                }
            });

        await activatedBtnRow($(this), true);
        const data = await formValue();
        const result = await updateFormMaster(data);
        if (result) {
            showMessage('Form updated successfully', 'success');
        } else {
            showErrorMessage(result.message || 'Error updating form');
        }
    } catch (error) {
        console.error(error);
        showErrorMessage(error.responseJSON?.message || 'Error updating form');
    } finally {
        await activatedBtnRow($(this), false);
    }
});

// Search / filter flow steps
$(document).on('input', '#flow-search', function () {
    flowState.searchQuery = $(this).val() || '';
    renderFlowList();
});

$(document).on('click', '#clear-flow-search', function () {
    flowState.searchQuery = '';
    $('#flow-search').val('').focus();
    renderFlowList();
});

// Reorder via Up / Down buttons
$(document).on('click', '.flow-move-up', function (e) {
    e.preventDefault();
    moveStepByButton(String($(this).data('stepno')), -1, this);
});

$(document).on('click', '.flow-move-down', function (e) {
    e.preventDefault();
    moveStepByButton(String($(this).data('stepno')), 1, this);
});

// Reset / Save Order
$(document).on('click', '#reset-flow-order', function () {
    flowState.sortFlow = flowState.persistedList.map(cloneStep);
    renderFlowList();
    updateOrderBar();
    announceLive('Order reset to saved sequence');
});

$(document).on('click', '#save-flow-order', async function () {
    const btn = $(this);
    const changedSteps = getChangedOrderSteps();
    if (changedSteps.length === 0) {
        updateOrderBar();
        return;
    }

    try {
        btn.prop('disabled', true);
        for (const step of changedSteps) {
            await updateFlowMaster(buildFlowPayload(step));
        }
        await setFlowMaster(flowState.formno, false);
        showMessage('Approval sequence saved successfully', 'success');
    } catch (error) {
        console.error(error);
        showErrorMessage(
            error?.responseJSON?.message || 'Failed to save approval sequence',
        );
    } finally {
        btn.prop('disabled', false);
    }
});

// Open Add / Edit / Delete modals
$(document).on('click', '.add-flow', function (e) {
    e.preventDefault();
    openStepModal('add');
});

$(document).on('click', '.edit-flow', function (e) {
    e.preventDefault();
    const stepNo = String($(this).data('stepno'));
    const step = flowState.sortFlow.find((s) => getStepCode(s) === stepNo);
    if (step) openStepModal('edit', step);
});

$(document).on('click', '.delete-flow', function (e) {
    e.preventDefault();
    openDeleteModal(String($(this).data('stepno')));
});

// Modal CTYPE switcher
$(document).on('change', 'input[name="fm-ctype"]', function () {
    toggleCtypePanels($(this).val());
});

// Close modals
$(document).on('click', '#close-flow-modal, #cancel-flow-modal', function () {
    document.getElementById('flow-step-modal').close('cancel');
});

$(document).on('click', '#cancel-delete-modal', function () {
    document.getElementById('flow-delete-modal').close('cancel');
});

// Reset returnValue on close per native dialog best practice
document.getElementById('flow-step-modal')?.addEventListener('close', function () {
    this.returnValue = '';
});
document.getElementById('flow-delete-modal')?.addEventListener('close', function () {
    this.returnValue = '';
    flowState.pendingDeleteStepNo = null;
});

// Submit Add / Edit Flow Step
$(document).on('submit', '#flow-step-form', async function (e) {
    e.preventDefault();
    const errorEl = $('#flow-modal-error');
    errorEl.text('');

    const mode = $('#fm-mode').val();
    const stepNo = String($('#fm-step-no').val() || '').trim();
    const ctype = String($('input[name="fm-ctype"]:checked').val() || '1');
    const apvType = String($('input[name="fm-apvtype"]:checked').val() || '1');
    const applyAll = $('#fm-applyall').is(':checked') ? '2' : '0';
    const url = String($('#fm-url').val() || '').trim();
    const extData = String($('#fm-extdata').val() || '').trim();

    if (!stepNo) {
        errorEl.text('Please enter a Step Code (CSTEPNO).');
        $('#fm-step-no').focus();
        return;
    }

    if (
        mode === 'add' &&
        flowState.sortFlow.some((s) => getStepCode(s) === stepNo)
    ) {
        errorEl.text(`Step Code "${stepNo}" already exists in this flow.`);
        $('#fm-step-no').focus();
        return;
    }

    let vposno = null;
    let vapvorgno = null;
    let vapvno = 'SYSTEM';

    if (ctype === '1') {
        vposno = String($('#fm-pos-select').val() || '').trim();
        if (!vposno) {
            errorEl.text('Please select a Position for Refer Requester.');
            return;
        }
    } else if (ctype === '2') {
        const orgCombined = String($('#fm-org-select').val() || '').trim();
        if (!orgCombined || !orgCombined.includes('|')) {
            errorEl.text('Please select an Organization & Position.');
            return;
        }
        const [pos, org] = orgCombined.split('|');
        vposno = pos;
        vapvorgno = org;
    } else if (ctype === '3') {
        vapvno = String($('#fm-emp-select').val() || '').trim();
        if (!vapvno) {
            errorEl.text('Please select or enter a Specific Approver.');
            return;
        }
    }

    const saveBtn = $('#save-flow-step');
    try {
        saveBtn.prop('disabled', true);

        if (mode === 'edit') {
            const orig = flowState.persistedMap.get(stepNo);
            const payload = buildFlowPayload(orig || { CSTEPNO: stepNo }, {
                CSTEPNO: stepNo,
                CTYPE: ctype,
                VPOSNO: vposno,
                VAPVORGNO: vapvorgno,
                VAPVNO: vapvno,
                CAPVTYPE: apvType,
                CAPPLYALL: applyAll,
                VURL: url,
                CEXTDATA: extData,
            });
            await updateFlowMaster(payload);
            document.getElementById('flow-step-modal').close('save');
            await setFlowMaster(flowState.formno, false);
            showMessage('Flow step updated successfully', 'success');
        } else {
            const insertPos = String($('#fm-insert-pos').val() || 'end');
            const current = flowState.sortFlow;
            let insertIdx = current.length;
            if (insertPos === 'start') {
                insertIdx = 0;
            } else if (insertPos.startsWith('after:')) {
                const afterCode = insertPos.slice(6);
                const foundIdx = current.findIndex(
                    (s) => getStepCode(s) === afterCode,
                );
                if (foundIdx >= 0) insertIdx = foundIdx + 1;
            }

            const prevStep = insertIdx > 0 ? current[insertIdx - 1] : null;
            const nextStep =
                insertIdx < current.length ? current[insertIdx] : null;

            const newStepPayload = buildFlowPayload(
                { CSTEPNO: stepNo },
                {
                    CSTEPNO: stepNo,
                    CSTART: insertIdx === 0 ? '1' : '0',
                    CSTEPNEXTNO: nextStep
                        ? getStepCode(nextStep)
                        : flowState.terminalNextNo,
                    CTYPE: ctype,
                    VPOSNO: vposno,
                    VAPVORGNO: vapvorgno,
                    VAPVNO: vapvno,
                    CAPVTYPE: apvType,
                    CAPPLYALL: applyAll,
                    VURL: url,
                    CEXTDATA: extData,
                },
            );

            await addFlowMaster(newStepPayload);

            // Relink neighbor(s) in the chain
            if (prevStep) {
                await updateFlowMaster(
                    buildFlowPayload(prevStep, { CSTEPNEXTNO: stepNo }),
                );
            } else if (nextStep && String(nextStep.CSTART) === '1') {
                await updateFlowMaster(
                    buildFlowPayload(nextStep, { CSTART: '0' }),
                );
            }

            document.getElementById('flow-step-modal').close('save');
            await setFlowMaster(flowState.formno, false);
            showMessage('Flow step added successfully', 'success');
        }
    } catch (error) {
        console.error(error);
        errorEl.text(
            error?.responseJSON?.message || 'Failed to save flow step.',
        );
    } finally {
        saveBtn.prop('disabled', false);
    }
});

// Confirm Delete Flow Step
$(document).on('click', '#confirm-delete-flow', async function () {
    const stepNo = flowState.pendingDeleteStepNo;
    if (!stepNo) return;

    const btn = $(this);
    const idx = flowState.sortFlow.findIndex((s) => getStepCode(s) === stepNo);
    if (idx < 0) return;

    const target = flowState.sortFlow[idx];
    const prev = idx > 0 ? flowState.sortFlow[idx - 1] : null;
    const next =
        idx < flowState.sortFlow.length - 1 ? flowState.sortFlow[idx + 1] : null;

    try {
        btn.prop('disabled', true);
        await deleteFlowMaster({
            NFRMNO: flowState.formno?.nno ?? $('#nno').val(),
            VORGNO: flowState.formno?.orgno ?? $('#vorgno').val(),
            CYEAR: flowState.formno?.cyear ?? $('#cyear').val(),
            CSTEPNO: stepNo,
        });

        // Automatically relink chain so workflow remains intact
        if (prev) {
            await updateFlowMaster(
                buildFlowPayload(prev, {
                    CSTEPNEXTNO: next
                        ? getStepCode(next)
                        : flowState.terminalNextNo,
                }),
            );
        } else if (next && String(target.CSTART) === '1') {
            await updateFlowMaster(buildFlowPayload(next, { CSTART: '1' }));
        }

        document.getElementById('flow-delete-modal').close('delete');
        await setFlowMaster(flowState.formno, false);
        showMessage('Flow step deleted successfully', 'success');
    } catch (error) {
        console.error(error);
        showErrorMessage(
            error?.responseJSON?.message || 'Failed to delete flow step',
        );
    } finally {
        btn.prop('disabled', false);
    }
});

// ============================================================================
// Form Info Helpers & Approver Lookup Builders
// ============================================================================

async function formValue() {
    const formData = {};
    $('#form-info')
        .find('input, textarea')
        .each(function () {
            const mapping = $(this).attr('data-mapping');
            if (mapping) {
                formData[mapping] = $(this).val();
            }
        });

    $('#form-info')
        .find('select')
        .each(function () {
            const mapping = $(this).attr('data-mapping');
            if (mapping) {
                formData[mapping] = $(this).val();
            }
        });
    return formData;
}

async function setApproverType() {
    const positions = await getPositions();
    const posList = positions.sort((a, b) =>
        a.SPOSCODE.localeCompare(b.SPOSCODE),
    );

    const orgs = await populateOrganizations();
    const orgList = [];
    positions
        .filter((p) => p.SPOSCODE == '10' || p.SPOSCODE == '11')
        .forEach((p) => {
            for (const div of orgs.division) {
                orgList.push({
                    pos: p.SPOSCODE,
                    posname: p.SPOSNAME,
                    orgs: div.data.SDIVCODE,
                    orgname: div.data.SDIV,
                });
            }
        });
    positions
        .filter((p) => p.SPOSCODE == '20' || p.SPOSCODE == '21')
        .forEach((p) => {
            for (const dept of orgs.department) {
                if (dept.data.SDEPCODE == '00') continue;
                orgList.push({
                    pos: p.SPOSCODE,
                    posname: p.SPOSNAME,
                    orgs: dept.data.SDEPCODE,
                    orgname: dept.data.SDEPT,
                });
            }
        });
    positions
        .filter((p) => p.SPOSCODE == '30')
        .forEach((p) => {
            for (const sec of orgs.section) {
                if (sec.data.SSECCODE == '00') continue;
                orgList.push({
                    pos: p.SPOSCODE,
                    posname: p.SPOSNAME,
                    orgs: sec.data.SSECCODE,
                    orgname: sec.data.SSEC,
                });
            }
        });

    return { orgList, posList };
}
