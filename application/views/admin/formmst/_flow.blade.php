{{-- Filter / Quick Search Toolbar --}}
<div class="px-3 py-2 bg-base-100 border-b border-base-200 flex items-center gap-2 shrink-0" id="flow-toolbar">
    <label class="input input-xs h-8 flex-1 flex items-center gap-1.5 px-2">
        <i class="fi fi-rr-search text-xs wf-mute"></i>
        <input type="search" id="flow-search" class="grow text-xs"
            placeholder="Filter step, position, org, or approver..." autocomplete="off" />
    </label>
    <span class="text-[11px] font-mono wf-mute shrink-0" id="flow-filter-status"></span>
</div>

{{-- Scrollable Compact Approval Sequence --}}
<div class="flow-timeline-scroll" id="flow-scroll-container">
    <div class="flow-timeline-list" id="flow-list-row" role="list" aria-label="Approval workflow steps"></div>
</div>

{{-- Screen reader live region for reorder announcements --}}
<div id="flow-live-region" class="sr-only" aria-live="polite" aria-atomic="true"></div>

{{-- Sticky Unsaved Order Footer Bar --}}
<div class="hidden px-3 py-2.5 bg-warning/15 border-t border-warning/50 flex items-center justify-between gap-2 shrink-0"
    id="flow-order-bar">
    <div class="flex items-center gap-2 min-w-0">
        <span class="inline-block w-2 h-2 bg-warning shrink-0"></span>
        <span class="text-xs font-semibold text-base-content truncate" id="flow-order-summary">
            Sequence modified
        </span>
    </div>
    <div class="flex items-center gap-1.5 shrink-0">
        <button type="button" class="btn btn-xs btn-outline border-base-300 bg-base-100" id="reset-flow-order">
            Reset
        </button>
        <button type="button" class="btn btn-xs btn-primary" id="save-flow-order">
            <i class="fi fi-rr-disk text-xs"></i>
            <span>Save Order</span>
        </button>
    </div>
</div>

{{-- Native Modal Dialog: Add / Edit Flow Step --}}
<dialog id="flow-step-modal" class="wf-dialog" aria-labelledby="flow-modal-title" closedby="closerequest">
    <div class="wf-dialog-box bg-base-100 border border-base-300 border-t-4 border-t-primary shadow-xl">
        <div class="px-5 py-3.5 bg-base-200 border-b border-base-300 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2 min-w-0">
                <span class="w-1.5 h-4 bg-primary shrink-0"></span>
                <h2 class="text-sm font-bold uppercase tracking-wider text-primary truncate" id="flow-modal-title">
                    Add Flow Step
                </h2>
                <span class="badge badge-xs badge-outline font-mono font-bold hidden" id="flow-modal-step-badge"></span>
            </div>
            <button type="button" class="btn btn-xs btn-ghost btn-square" id="close-flow-modal"
                aria-label="Close dialog">
                <i class="fi fi-rr-cross-small text-sm"></i>
            </button>
        </div>

        <form id="flow-step-form" class="p-5 space-y-4 overflow-y-auto max-h-[75vh]" novalidate>
            <input type="hidden" id="fm-mode" value="add" />
            <input type="hidden" id="fm-orig-stepno" value="" />

            {{-- Step Identity & Position --}}
            <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div class="sm:col-span-4 space-y-1">
                    <label class="block text-xs uppercase font-bold wf-mute" for="fm-step-no">
                        Step Code (CSTEPNO) <span class="text-error">*</span>
                    </label>
                    <input type="text" id="fm-step-no" class="input input-sm h-9 w-full font-mono font-semibold"
                        placeholder="e.g. 01, 18, 19" list="fm-step-suggestions" maxlength="10" required autofocus />
                    <datalist id="fm-step-suggestions"></datalist>
                </div>

                <div class="sm:col-span-8 space-y-1" id="fm-step-name-wrap">
                    <label class="block text-xs uppercase font-bold wf-mute" for="fm-step-name">
                        Step Name (STEPMST)
                    </label>
                    <input type="text" id="fm-step-name" class="input input-sm h-9 w-full"
                        placeholder="Display label (optional for new step)" />
                </div>
            </div>

            {{-- Insert Position (Add mode only) --}}
            <div class="space-y-1" id="fm-insert-pos-wrap">
                <label class="block text-xs uppercase font-bold wf-mute" for="fm-insert-pos">
                    Insert Position in Sequence
                </label>
                <select id="fm-insert-pos" class="select select-sm h-9 w-full text-xs"></select>
            </div>

            {{-- Approver Configuration (CTYPE) --}}
            <div class="border border-base-300 p-3.5 space-y-3 bg-base-200/30">
                <div class="flex items-center justify-between gap-2">
                    <span class="text-xs uppercase font-bold text-primary">
                        Approver Resolution (CTYPE) <span class="text-error">*</span>
                    </span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2" role="radiogroup" aria-label="Approver Type">
                    <label
                        class="flow-ctype-option flex items-center gap-2 px-2.5 py-2 border border-base-300 bg-base-100 cursor-pointer text-xs font-semibold">
                        <input type="radio" name="fm-ctype" value="1" class="radio radio-primary radio-xs" checked />
                        <span class="leading-tight">
                            <span class="block">Refer Requester</span>
                            <span class="text-[10px] font-normal wf-mute">By Position</span>
                        </span>
                    </label>

                    <label
                        class="flow-ctype-option flex items-center gap-2 px-2.5 py-2 border border-base-300 bg-base-100 cursor-pointer text-xs font-semibold">
                        <input type="radio" name="fm-ctype" value="2" class="radio radio-primary radio-xs" />
                        <span class="leading-tight">
                            <span class="block">Form Owner / Org</span>
                            <span class="text-[10px] font-normal wf-mute">Position + Org</span>
                        </span>
                    </label>

                    <label
                        class="flow-ctype-option flex items-center gap-2 px-2.5 py-2 border border-base-300 bg-base-100 cursor-pointer text-xs font-semibold">
                        <input type="radio" name="fm-ctype" value="3" class="radio radio-primary radio-xs" />
                        <span class="leading-tight">
                            <span class="block">Specific Approver</span>
                            <span class="text-[10px] font-normal wf-mute">Employee ID</span>
                        </span>
                    </label>
                </div>

                {{-- CTYPE = 1: Position --}}
                <div id="fm-ctype-panel-1" class="space-y-1">
                    <label class="block text-xs font-semibold wf-mute" for="fm-pos-select">
                        Position (Refer to Requester)
                    </label>
                    <select id="fm-pos-select" class="select select-sm w-full"></select>
                </div>

                {{-- CTYPE = 2: Org + Position --}}
                <div id="fm-ctype-panel-2" class="space-y-1 hidden">
                    <label class="block text-xs font-semibold wf-mute" for="fm-org-select">
                        Organization &amp; Position (Refer to Form Owner)
                    </label>
                    <select id="fm-org-select" class="select select-sm w-full"></select>
                </div>

                {{-- CTYPE = 3: Specific Employee --}}
                <div id="fm-ctype-panel-3" class="space-y-1 hidden">
                    <label class="block text-xs font-semibold wf-mute" for="fm-emp-select">
                        Specific Approver (Employee No. or Name)
                    </label>
                    <select id="fm-emp-select" class="select select-sm w-full"></select>
                    <p class="text-[11px] wf-mute">Select an employee or type a custom employee code.</p>
                </div>
            </div>

            {{-- Approve Type & Options --}}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="border border-base-300 p-3 space-y-2">
                    <span class="block text-xs uppercase font-bold wf-mute">Approve Type (CAPVTYPE)</span>
                    <div class="flex flex-col gap-1.5 text-xs">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="fm-apvtype" value="1" class="radio radio-primary radio-xs"
                                checked />
                            <span>Single Approver (1)</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="fm-apvtype" value="3" class="radio radio-primary radio-xs" />
                            <span>Multiple Approver (3)</span>
                        </label>
                    </div>
                </div>

                <div class="border border-base-300 p-3 space-y-2">
                    <span class="block text-xs uppercase font-bold wf-mute">Approval Rule (CAPPLYALL)</span>
                    <label class="flex items-start gap-2 cursor-pointer text-xs pt-0.5">
                        <input type="checkbox" id="fm-applyall" class="checkbox checkbox-primary checkbox-xs mt-0.5"
                            value="2" />
                        <span class="leading-snug">
                            <span class="font-medium block">Apply All (2)</span>
                            <span class="text-[11px] wf-mute">Require all matched approvers</span>
                        </span>
                    </label>
                </div>
            </div>

            {{-- URL & Extra Data --}}
            <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div class="sm:col-span-8 space-y-1">
                    <label class="block text-xs uppercase font-bold wf-mute" for="fm-url">
                        Page Location (VURL)
                    </label>
                    <label class="input input-sm h-9 w-full flex items-center gap-2">
                        <i class="fi fi-br-link-alt text-xs wf-mute"></i>
                        <input type="text" id="fm-url" class="grow font-mono text-xs"
                            placeholder="https://... or path" />
                    </label>
                </div>

                <div class="sm:col-span-4 space-y-1">
                    <label class="block text-xs uppercase font-bold wf-mute" for="fm-extdata">
                        Extra Data (CEXTDATA)
                    </label>
                    <input type="text" id="fm-extdata" class="input input-sm h-9 w-full font-mono text-xs"
                        placeholder="e.g. 01" />
                </div>
            </div>

            <div class="text-xs text-error font-medium min-h-4" id="flow-modal-error" role="alert"></div>
        </form>

        <div class="px-5 py-3 bg-base-200 border-t border-base-300 flex items-center justify-end gap-2">
            <button type="button" class="btn btn-sm btn-outline border-base-300 bg-base-100" id="cancel-flow-modal">
                Cancel
            </button>
            <button type="submit" form="flow-step-form" class="btn btn-sm btn-primary" id="save-flow-step">
                <i class="fi fi-rr-disk text-xs"></i>
                <span>Save Step</span>
            </button>
        </div>
    </div>
</dialog>

{{-- Native Modal Dialog: Delete Flow Step Confirmation --}}
<dialog id="flow-delete-modal" class="wf-dialog wf-dialog-sm" aria-labelledby="flow-delete-title"
    closedby="closerequest">
    <div class="wf-dialog-box bg-base-100 border border-base-300 border-t-4 border-t-error shadow-xl">
        <div class="px-5 py-3.5 bg-base-200 border-b border-base-300 flex items-center gap-2">
            <span class="w-1.5 h-4 bg-error shrink-0"></span>
            <h2 class="text-sm font-bold uppercase tracking-wider text-error" id="flow-delete-title">
                Delete Flow Step
            </h2>
        </div>

        <div class="p-5 space-y-3 text-sm">
            <p class="text-xs text-base-content leading-relaxed">
                Are you sure you want to remove this approval step from the workflow?
            </p>
            <div class="border border-base-300 bg-base-200/50 p-3 space-y-1 text-xs" id="flow-delete-summary"></div>
            <p class="text-[11px] wf-mute" id="flow-delete-relink"></p>
        </div>

        <div class="px-5 py-3 bg-base-200 border-t border-base-300 flex items-center justify-end gap-2">
            <button type="button" class="btn btn-sm btn-outline border-base-300 bg-base-100" id="cancel-delete-modal"
                autofocus>
                Cancel
            </button>
            <button type="button" class="btn btn-sm btn-error" id="confirm-delete-flow">
                <i class="fi fi-rr-trash text-xs"></i>
                <span>Delete Step</span>
            </button>
        </div>
    </div>
</dialog>
