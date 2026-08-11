@extends('layouts/webflowTemplate')

@section('styles')
<style>
    .ps-clm-page {
        min-height: calc(100vh - 8rem);
        background: #f4f7fb;
        color: #1f2937;
    }

    .ps-clm-page #form {
        border-color: #cbd5e1;
        background: #ffffff;
        color: #1f2937;
        box-shadow: 0 18px 40px rgba(15, 23, 42, .10);
    }

    .ps-clm-header {
        border-bottom: 1px solid #cbd5e1;
        background: #eef6ff;
    }

    .ps-clm-title-block,
    .ps-clm-section-title {
        border-left: 4px solid #2563eb;
    }

    .ps-clm-title {
        color: #0f172a;
    }

    .ps-clm-subtitle {
        color: #475569;
    }

    .ps-clm-section {
        border-bottom: 1px solid #dbe3ee;
        background: #ffffff;
    }

    .ps-clm-section-title h2 {
        color: #1e3a8a;
    }

    .ps-clm-page .label-text {
        color: #334155;
        font-weight: 800;
    }

    .ps-clm-page .input,
    .ps-clm-page .textarea,
    .ps-clm-page .file-input {
        border-color: #cbd5e1;
        background: #ffffff;
        color: #111827;
    }

    .ps-clm-page .input::placeholder,
    .ps-clm-page .textarea::placeholder {
        color: #64748b;
    }

    .ps-clm-page .input:read-only,
    .ps-clm-page .textarea:read-only {
        background: #eef2f7;
        color: #334155;
    }

    .ps-clm-page .input:focus,
    .ps-clm-page .textarea:focus,
    .ps-clm-page .file-input:focus {
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, .16);
    }

    .ps-clm-request-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem 1.25rem;
    }

    .ps-clm-table-wrap {
        width: 100%;
        max-height: 60vh;
        overflow: auto;
        border: 1px solid #b6c3d1;
        border-radius: var(--radius-box);
        background: #fff;
    }

    .ps-clm-table {
        border-collapse: collapse;
        font-size: 12px;
        table-layout: fixed;
    }

    .ps-clm-table th,
    .ps-clm-table td {
        box-sizing: border-box;
    }

    .ps-clm-table-wrap .dt-scroll-body thead th {
        height: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        line-height: 0 !important;
    }

    .ps-clm-table-wrap .dt-scroll-body thead th * {
        display: none;
    }

    .ps-clm-table th {
        position: sticky;
        top: 0;
        z-index: 1;
        height: 38px;
        border-right: 1px solid #1e5b9a;
        border-bottom: 1px solid #1e5b9a;
        background: #2f6fb7;
        color: #fff;
        padding: 7px 8px;
        text-align: center;
        font-weight: 800;
        white-space: nowrap;
    }

    .ps-clm-table-wrap .dt-scroll-head th {
        text-align: center !important;
    }

    .ps-clm-table td {
        position: relative;
        height: 42px;
        border-top: 1px solid #e2e8f0;
        border-right: 1px solid #e2e8f0;
        background: #fff;
        color: #1f2937;
        padding: 6px;
        vertical-align: middle;
    }

    .ps-clm-table tbody tr:nth-child(even) td {
        background: #f8fafc;
    }

    .ps-clm-table td:last-child,
    .ps-clm-table th:last-child {
        border-right: 0;
    }

    .ps-clm-table input[type="text"],
    .ps-clm-table input[type="number"] {
        width: 100%;
        min-height: 30px;
        border: 1px solid #93c5fd;
        border-radius: 4px;
        background: #fff;
        color: #0f172a;
        padding: 5px 6px;
        font-size: 12px;
        outline: none;
    }

    .ps-clm-table input[type="text"]:focus,
    .ps-clm-table input[type="number"]:focus {
        border-color: #93c5fd;
        background: #fff;
        box-shadow: 0 0 0 2px rgba(147, 197, 253, .35);
    }

    .ps-clm-table input.editing {
        position: absolute;
        inset: 5px;
        z-index: 2;
        width: calc(100% - 10px);
        min-height: 30px;
        margin: 0;
    }

    .ps-clm-table td.ps-clm-drawing-cell,
    .ps-clm-table td.ps-clm-variable-cell {
        cursor: pointer;
    }

    .ps-clm-table td.ps-clm-manual-cell {
        cursor: text;
    }

    .ps-clm-drawing-editor {
        display: grid;
        grid-template-columns: minmax(90px, 1fr) 130px;
        gap: 4px;
        width: 100%;
    }

    .ps-clm-drawing-l-editor {
        display: grid;
        grid-column: 1 / -1;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 4px;
    }

    .ps-clm-variable-editor {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 4px;
        width: 100%;
    }

    .ps-clm-drawing-editor input,
    .ps-clm-variable-editor input {
        min-width: 0;
        padding-inline: 4px;
    }

    .ps-clm-field-group {
        display: flex;
        min-width: 0;
        flex-direction: column;
        gap: 4px;
    }

    .ps-clm-field-group > span {
        color: #334155;
        font-size: 12px;
        font-weight: 700;
    }

    .ps-clm-field-group input {
        width: 100%;
    }

    .ps-clm-invalid {
        border-color: #f59e0b !important;
        background: #fffbeb !important;
        box-shadow: 0 0 0 2px rgba(245, 158, 11, .18) !important;
    }

    .ps-clm-type-cell label {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-right: 0;
        margin-bottom: 4px;
        color: #334155;
        font-size: 12px;
        white-space: nowrap;
    }

    .ps-clm-type-cell label:last-child {
        margin-bottom: 0;
    }

    .ps-clm-type-cell input {
        width: 14px;
        height: 14px;
        accent-color: #2563eb;
    }

    .ps-clm-yellow {
        background: #fefce8 !important;
    }

    .ps-clm-schedule-code {
        margin-top: 3px;
        color: #047857;
        font-size: 11px;
        font-weight: 700;
        line-height: 1.1;
    }

    .ps-clm-table th.ps-clm-yellow,
    .ps-clm-table-wrap .dt-scroll-head th.ps-clm-yellow {
        background: #2f6fb7 !important;
        color: #fff !important;
    }

    #actionform {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
        margin-top: 12px;
    }

    #btnConfirmData {
        order: 0;
        min-height: 34px;
        padding: 6px 14px;
        font-size: 13px;
        margin-left: auto;
    }

    #actionform::after {
        content: "";
        order: 1;
        flex-basis: 100%;
        height: 0;
    }

    #actionform > :not(#btnConfirmData) {
        order: 2;
    }

    @media (max-width: 900px) {
        .ps-clm-request-grid {
            grid-template-columns: 1fr;
        }
    }

    @media (max-width: 640px) {
        #actionform button {
            width: 100%;
        }
    }
</style>
@endsection

@section('contents')
<div class="ps-clm-page rounded-box p-0 md:p-6">
    <form id="form" class="card mx-auto w-full max-w-[1440px] bg-base-100 shadow-xl border border-base-300 overflow-hidden" method="post" enctype="multipart/form-data" autocomplete="off">
        <input type="hidden" name="NFRMNO" value="{{ $NFRMNO ?? '' }}">
        <input type="hidden" name="VORGNO" value="{{ $VORGNO ?? '' }}">
        <input type="hidden" name="CYEAR" value="{{ $CYEAR ?? '' }}">
        <input type="hidden" name="CYEAR2" value="{{ $CYEAR2 ?? '' }}">
        <input type="hidden" name="NRUNNO" value="{{ $NRUNNO ?? '' }}">
        <div class="ps-clm-header px-6 py-5">
            <div class="ps-clm-title-block pl-4">
                <h1 class="ps-clm-title text-2xl font-extrabold tracking-normal">Claim Slip / SCL Issue Part</h1>
                <p class="ps-clm-subtitle mt-1 text-sm">Create request for claim slip or SCL issue part.</p>
            </div>
        </div>

        <section class="ps-clm-section px-6 py-5">
            <div class="ps-clm-section-title mb-4 pl-3">
                <h2 class="text-base font-extrabold">Requester Information</h2>
            </div>
            <div class="ps-clm-request-grid">
                <div class="form-control">
                    <label class="label py-1" for="INPUTBY"><span class="label-text font-bold">Input By <span class="text-error" aria-hidden="true">*</span></span></label>
                    <input type="text" class="input input-bordered w-full" id="INPUTBY" name="INPUTBY" value="{{ $apv ?? '' }}" maxlength="5" placeholder="Enter Employee ID" required>
                </div>
                <div class="form-control">
                    <label class="label py-1" for="inputName"><span class="label-text font-bold">Input Name</span></label>
                    <input type="text" class="input input-bordered w-full bg-base-200" id="inputName" name="INPUT_NAME" placeholder="Enter Full Name" readonly>
                </div>
                <div class="form-control">
                    <label class="label py-1" for="REQBY"><span class="label-text font-bold">Request By <span class="text-error" aria-hidden="true">*</span></span></label>
                    <input type="text" class="input input-bordered w-full" id="REQBY" name="REQBY" maxlength="5" placeholder="Enter Requester ID" required>
                </div>
                <div class="form-control">
                    <label class="label py-1" for="requestName"><span class="label-text font-bold">Request Name</span></label>
                    <input type="text" class="input input-bordered w-full bg-base-200" id="requestName" name="REQUEST_NAME" placeholder="Enter Requester Name" readonly>
                </div>
                <div class="form-control">
                    <label class="label py-1" for="attachment"><span class="label-text font-bold">Attachment</span></label>
                    <input type="file" class="file-input file-input-bordered w-full" id="attachment" name="ATTACHMENT">
                </div>
                <div class="form-control">
                    <label class="label py-1" for="newOrderNo"><span class="label-text font-bold">New Order No.</span></label>
                    <input type="text" class="input input-bordered w-full bg-base-200" id="newOrderNo" name="NEWORDER" readonly>
                </div>
                <div class="form-control md:col-span-2">
                    <label class="label py-1" for="REMARK"><span class="label-text font-bold">Remark</span></label>
                    <textarea class="textarea textarea-bordered min-h-28 w-full" id="REMARK" name="REMARK" placeholder="Describe the reason for returning or details of the revision..."></textarea>
                </div>
            </div>
        </section>

        <section class="px-6 py-5">
            <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div class="ps-clm-section-title pl-3">
                    <h2 class="text-base font-extrabold">Items <span class="text-xs font-normal text-error">* Required</span></h2>
                </div>
                <button type="button" class="btn btn-outline btn-primary btn-sm" id="addItem">
                    <i class="icofont-plus"></i>
                    Add Item
                </button>
            </div>

            <div class="ps-clm-table-wrap">
                <table class="table table-sm ps-clm-table" id="itemTable" aria-label="Claim slip item list">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Original Order <span class="text-error" aria-hidden="true">*</span></th>
                            <th>Item <span class="text-error" aria-hidden="true">*</span></th>
                            <th>Part Name</th>
                            <th>Drawing <span class="text-error" aria-hidden="true">*</span></th>
                            <th>Variable</th>
                            <th>Qty <span class="text-error" aria-hidden="true">*</span></th>
                            <th>SCL-No. <span class="text-error" aria-hidden="true">*</span></th>
                            <th>Type</th>
                            <th>Schedule</th>
                            <th>P</th>
                            <th>Issue To</th>
                            <th>Next Process</th>
                        </tr>
                    </thead>
                    <tbody id="itemRows"></tbody>
                </table>
            </div>
            <p class="mt-2 text-xs text-base-content/70">Original Order and Item are filled from the Drawing when matched. Click either cell to enter or override the value manually.</p>
            <div id="actionform"></div>
        </section>
    </form>

    <dialog id="psClmConfirmModal" class="modal">
        <div class="modal-box w-11/12 max-w-4xl">
            <h3 class="text-lg font-extrabold">Confirm Data</h3>
            <div id="psClmConfirmSummary" class="mt-4"></div>
            <div class="modal-action">
                <button type="button" class="btn btn-primary" id="psClmConfirmApply">Check Again</button>
                <button type="button" class="btn" id="psClmConfirmClose">Close</button>
            </div>
        </div>
    </dialog>

    <dialog id="psClmFieldModal" class="modal">
        <div class="modal-box w-11/12 max-w-3xl">
            <h3 class="text-lg font-extrabold" id="psClmFieldTitle"></h3>
            <div class="mt-4" id="psClmFieldEditor"></div>
            <div class="modal-action">
                <button type="button" class="btn btn-primary" id="psClmFieldApply">Apply</button>
                <button type="button" class="btn" id="psClmFieldCancel">Cancel</button>
            </div>
        </div>
    </dialog>
</div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/psClm.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
