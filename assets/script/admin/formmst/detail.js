import 'select2/dist/css/select2.min.css';
import select2 from 'select2';
import { showLoader } from '@amec/webasset/preloader';
import { showErrorMessage } from '@amec/webasset/utils';
import { getFormMaster } from '../../service';
import { setFormNo } from './data';
import { flowState, getStepCode } from './detail/state';
import {
    handleAddForm,
    handleEditForm,
    populateFormGroupsByOwner,
    renderCreateModeFlowState,
    setFormInit,
} from './detail/form';
import {
    moveStepByButton,
    renderFlowList,
    resetFlowOrder,
    saveFlowOrder,
    setFlowMaster,
} from './detail/flow';
import {
    confirmDeleteFlowStep,
    openDeleteModal,
    openStepModal,
    submitFlowStepForm,
    toggleCtypePanels,
} from './detail/flow-modal';

select2();

// ============================================================================
// Page Initialization
// ============================================================================

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
    } finally {
        await showLoader({ show: false });
    }
});

// ============================================================================
// Form Info Events
// ============================================================================

$(document).on('change', '#vorgno', async function () {
    if (!flowState.isCreateMode) return;
    await populateFormGroupsByOwner($(this).val() || '');
});

$(document).on('click', '#add-form-btn', async function (e) {
    e.preventDefault();
    await handleAddForm($(this));
});

$(document).on('click', '#edit-form-btn', async function (e) {
    e.preventDefault();
    await handleEditForm($(this));
});

// ============================================================================
// Flow List Search & Reorder Events
// ============================================================================

$(document).on('input', '#flow-search', function () {
    flowState.searchQuery = $(this).val() || '';
    renderFlowList();
});

$(document).on('click', '#clear-flow-search', function () {
    flowState.searchQuery = '';
    $('#flow-search').val('').focus();
    renderFlowList();
});

$(document).on('click', '.flow-move-up', function (e) {
    e.preventDefault();
    moveStepByButton(String($(this).data('stepno')), -1, this);
});

$(document).on('click', '.flow-move-down', function (e) {
    e.preventDefault();
    moveStepByButton(String($(this).data('stepno')), 1, this);
});

$(document).on('click', '#reset-flow-order', function () {
    resetFlowOrder();
});

$(document).on('click', '#save-flow-order', async function () {
    await saveFlowOrder($(this));
});

// ============================================================================
// Flow Step Modal Events (Add / Edit / Delete)
// ============================================================================

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

$(document).on('change', 'input[name="fm-ctype"]', function () {
    toggleCtypePanels($(this).val());
});

$(document).on('click', '#close-flow-modal, #cancel-flow-modal', function () {
    document.getElementById('flow-step-modal').close('cancel');
});

$(document).on('click', '#cancel-delete-modal', function () {
    document.getElementById('flow-delete-modal').close('cancel');
});

// Reset returnValue on close per native dialog best practice
document
    .getElementById('flow-step-modal')
    ?.addEventListener('close', function () {
        this.returnValue = '';
    });

document
    .getElementById('flow-delete-modal')
    ?.addEventListener('close', function () {
        this.returnValue = '';
        flowState.pendingDeleteStepNo = null;
    });

$(document).on('submit', '#flow-step-form', async function (e) {
    e.preventDefault();
    await submitFlowStepForm();
});

$(document).on('click', '#confirm-delete-flow', async function () {
    await confirmDeleteFlowStep($(this));
});
