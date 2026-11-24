import { showErrorMessage, showMessage } from '@amec/webasset/utils';
import { setSelect2 } from '@amec/webasset/select2';
import {
    addFlowMaster,
    updateFlowMaster,
    deleteFlowMaster,
    getStepMaster,
} from '../data';
import { escapeHtml, flowState, getStepCode, getStepName } from './state';
import {
    buildFlowPayload,
    isOrderDirty,
    resolveApproverSummary,
    setFlowMaster,
} from './flow';

// ============================================================================
// Modal Select2 Setup & UI Helpers
// ============================================================================

async function ensureModalSelects() {
    if (flowState.modalSelectsReady) return;
    const modalParent = $('#flow-step-modal');

    // Step Master select (STEPMST: CNO = CSTEPNO)
    if (flowState.stepList.length === 0) {
        const steps = await getStepMaster();
        flowState.stepList = (Array.isArray(steps) ? steps : []).filter(
            (s) => s && String(s.CNO ?? '').trim() !== '',
        );
    }
    const stepSel = $('#fm-step-no');
    stepSel.empty().append('<option value=""></option>');
    for (const st of flowState.stepList) {
        const cno = String(st.CNO ?? '').trim();
        const vname = String(st.VNAME ?? '').trim();
        stepSel.append(
            `<option value="${escapeHtml(cno)}">${escapeHtml(vname ? `${cno} : ${vname}` : cno)}</option>`,
        );
    }
    await setSelect2({
        element: '#fm-step-no',
        placeholder: 'Select step from STEPMST...',
        size: 'sm',
        width: '100%',
        dropdownParent: modalParent,
        emptyValue: false,
    });

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

export function toggleCtypePanels(ctype) {
    $('#fm-ctype-panel-1').toggleClass('hidden', ctype !== '1');
    $('#fm-ctype-panel-2').toggleClass('hidden', ctype !== '2');
    $('#fm-ctype-panel-3').toggleClass('hidden', ctype !== '3');
}

function populateInsertPositions() {
    const sel = $('#fm-insert-pos');
    sel.empty();
    sel.append('<option value="end">At the end (after last step)</option>');
    if (flowState.sortFlow.length > 0) {
        sel.append(
            '<option value="start">At the beginning (new Start step)</option>',
        );
        flowState.sortFlow.forEach((step, idx) => {
            const code = getStepCode(step);
            sel.append(
                `<option value="after:${escapeHtml(code)}">After #${idx + 1} · ${escapeHtml(code)} — ${escapeHtml(getStepName(step))}</option>`,
            );
        });
    }
}

// ============================================================================
// Open Add / Edit / Delete Modals
// ============================================================================

export async function openStepModal(mode, step = null) {
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
        if (
            code &&
            $('#fm-step-no').find(`option[value="${CSS.escape(code)}"]`)
                .length === 0
        ) {
            $('#fm-step-no').append(
                new Option(`${code} : ${getStepName(step)}`, code, true, true),
            );
        }
        $('#fm-step-no').val(code).trigger('change').prop('disabled', true);
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
            $('#fm-emp-select').append(new Option(empVal, empVal, true, true));
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
        $('#fm-step-no').prop('disabled', false).val('').trigger('change');

        populateInsertPositions();
        $('#fm-insert-pos-wrap').removeClass('hidden');

        $('input[name="fm-ctype"][value="1"]').prop('checked', true);
        toggleCtypePanels('1');
        $('#fm-pos-select').val('').trigger('change');
        $('#fm-org-select').val('').trigger('change');
        $('#fm-emp-select').val('').trigger('change');

        $('input[name="fm-apvtype"][value="1"]').prop('checked', true);
        $('#fm-applyall').prop('checked', false);
        $('#fm-url').val(
            String($('#form-info [data-mapping="VFORMPAGE"]').val() || '').trim(),
        );
        $('#fm-extdata').val('');
    }

    dialog.showModal();
}

export function openDeleteModal(stepNo) {
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
// Submit Add / Edit & Confirm Delete Handlers
// ============================================================================

export async function submitFlowStepForm() {
    const errorEl = $('#flow-modal-error');
    errorEl.text('');

    const mode = $('#fm-mode').val();
    const stepNo = String(
        $('#fm-step-no').val() || $('#fm-orig-stepno').val() || '',
    ).trim();
    const ctype = String($('input[name="fm-ctype"]:checked').val() || '1');
    const apvType = String($('input[name="fm-apvtype"]:checked').val() || '1');
    const applyAll = $('#fm-applyall').is(':checked') ? '2' : '0';
    const url = String($('#fm-url').val() || '').trim();
    const extData = String($('#fm-extdata').val() || '').trim();

    if (!stepNo) {
        errorEl.text('Please select a Step (CSTEPNO).');
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
}

export async function confirmDeleteFlowStep($btn) {
    const stepNo = flowState.pendingDeleteStepNo;
    if (!stepNo) return;

    const idx = flowState.sortFlow.findIndex((s) => getStepCode(s) === stepNo);
    if (idx < 0) return;

    const target = flowState.sortFlow[idx];
    const prev = idx > 0 ? flowState.sortFlow[idx - 1] : null;
    const next =
        idx < flowState.sortFlow.length - 1 ? flowState.sortFlow[idx + 1] : null;

    try {
        $btn.prop('disabled', true);
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
        $btn.prop('disabled', false);
    }
}
