export const formCache = {
    dept: [],
    group: [],
};

export const flowState = {
    isCreateMode: false,
    formno: null,
    sortFlow: [],
    persistedList: [],
    persistedMap: new Map(),
    terminalNextNo: '00',
    stepList: [],
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

export const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function cloneStep(step) {
    return {
        ...step,
        STEPMST: step.STEPMST ? { ...step.STEPMST } : null,
    };
}

export function getStepCode(step) {
    return String(step?.CSTEPNO ?? step?.STEPMST?.CNO ?? '').trim();
}

export function getStepName(step) {
    return (
        String(step?.STEPMST?.VNAME ?? '').trim() || `Step ${getStepCode(step)}`
    );
}
