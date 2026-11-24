import { showErrorMessage, showMessage } from '@amec/webasset/utils';
import { getByPosition } from '@amec/webasset/api/sequence-org';
import {
    getFlowMaster,
    populateOrganizations,
    getPositions,
} from '../../../service';
import { updateFlowMaster } from '../data';
import {
    cloneStep,
    escapeHtml,
    flowState,
    getStepCode,
    getStepName,
    prefersReducedMotion,
} from './state';
import { initFlowDragAndDrop } from './flow-dnd';

// ============================================================================
// Approver Lookups & Flow Master Data Loading
// ============================================================================

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

export async function setFlowMaster(formno, loadLookups = false) {
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

    renderFlowList();
    updateOrderBar();

    if (!flowState.dragReady) {
        initFlowDragAndDrop({
            moveNode,
            animateFlip,
            syncOrderFromDom,
            announceLive,
        });
        flowState.dragReady = true;
    }
}

// ============================================================================
// Chain Ordering & Payload Helpers
// ============================================================================

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

export function isOrderDirty() {
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

export function buildFlowPayload(step, overrides = {}) {
    const merged = { ...step, ...overrides };
    return {
        NFRMNO: flowState.formno?.nno ?? $('#nno').val(),
        VORGNO: flowState.formno?.orgno ?? $('#vorgno').val(),
        CYEAR: flowState.formno?.cyear ?? $('#cyear').val(),
        CSTEPNO: getStepCode(merged),
        CSTEPNEXTNO: String(
            merged.CSTEPNEXTNO ?? flowState.terminalNextNo,
        ).trim(),
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

export function resolveApproverSummary(fs) {
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

// ============================================================================
// Rendering, DOM Sync & Reordering
// ============================================================================

export function renderFlowList() {
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
                    <span class="font-mono text-xs font-bold px-1.5 py-0.5 bg-base-200 border border-base-300 text-primary shrink-0">${escapeHtml(code)}</span>
                    <span class="text-sm font-bold text-base-content truncate" title="${escapeHtml(name)}">${escapeHtml(name)}</span>
                    ${isFirst ? '<span class="badge badge-sm badge-primary font-mono text-[11px] font-bold shrink-0">START</span>' : ''}
                </div>

                <div class="flex items-center gap-1.5 min-w-0 text-xs text-base-content/90">
                    <span class="badge badge-sm ${apv.badgeClass} font-mono text-[11px] font-bold px-1.5 shrink-0" title="${escapeHtml(apv.secondary)}">${apv.badge}</span>
                    <span class="truncate font-medium" title="${escapeHtml(`${apv.secondary}: ${apv.primary}`)}">${escapeHtml(apv.primary)}</span>
                </div>

                <div class="flex flex-wrap items-center gap-1.5 text-xs wf-mute">
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

export function updateOrderBar() {
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

export function announceLive(message) {
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
                    '<span class="badge badge-sm badge-primary font-mono text-[11px] font-bold shrink-0">START</span>',
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

export function moveStepByButton(stepNo, direction, triggerBtn) {
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
    const refNode =
        direction < 0 ? items[targetIdx] : items[targetIdx].nextElementSibling;
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

export function resetFlowOrder() {
    flowState.sortFlow = flowState.persistedList.map(cloneStep);
    renderFlowList();
    updateOrderBar();
    announceLive('Order reset to saved sequence');
}

export async function saveFlowOrder($btn) {
    const changedSteps = getChangedOrderSteps();
    if (changedSteps.length === 0) {
        updateOrderBar();
        return;
    }

    try {
        $btn.prop('disabled', true);
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
        $btn.prop('disabled', false);
    }
}
