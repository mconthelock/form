@extends('layouts/webflowTemplate')

@php
    $extData = json_decode($cextData ?? '', true);
    $flowStep = is_array($extData) ? '' : ($cextData ?? '');
    $formKey = [
        'NFRMNO' => $NFRMNO ?? '',
        'VORGNO' => $VORGNO ?? '',
        'CYEAR' => $CYEAR ?? '',
        'CYEAR2' => $CYEAR2 ?? '',
        'NRUNNO' => $NRUNNO ?? '',
        'EMPNO' => $apv ?? '',
        'CEXTDATA' => $flowStep,
    ];
    $details = is_array($extData) ? ($extData['DETAILS'] ?? $extData['details'] ?? []) : [];
@endphp

@section('styles')
<style>
    .ps-clm-page {
        min-height: calc(100vh - 8rem);
        background: #f4f7fb;
        color: #1f2937;
    }

    .ps-clm-page #psClmPage {
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

    .ps-clm-detail-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem 1.25rem;
    }

    .ps-clm-info {
        border: 1px solid #d7e0ed;
        border-radius: var(--radius-box);
        background: #f8fafc;
        padding: 12px 14px;
    }

    .ps-clm-label {
        display: block;
        color: #475569;
        font-size: 12px;
        font-weight: 700;
    }

    .ps-clm-value {
        display: block;
        margin-top: 6px;
        color: #0f172a;
        font-size: 14px;
        font-weight: 700;
        overflow-wrap: anywhere;
    }

    #form-detail {
        margin-bottom: 1rem;
    }

    .ps-clm-table-wrap {
        width: 100%;
        max-height: 60vh;
        overflow-x: auto;
        border: 1px solid #b6c3d1;
        border-radius: var(--radius-box);
        background: #fff;
    }

    .ps-clm-table {
        border-collapse: collapse;
        font-size: 12px;
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

    .ps-clm-table th,
    .ps-clm-table td {
        white-space: nowrap;
    }

    .ps-clm-table td {
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

    .ps-clm-cell-input {
        width: 100%;
        min-width: 72px;
        font-size: 12px;
    }

    .ps-clm-schedule-editor {
        position: relative;
        min-width: 190px;
    }

    .ps-clm-schedule-editor .ps-clm-schedule-date {
        position: absolute;
        inset: 0;
        z-index: 1;
        height: 100%;
        opacity: 0;
        cursor: pointer;
    }

    .ps-clm-schedule-result {
        display: flex;
        min-height: 32px;
        align-items: center;
        border: 1px solid #cbd5e1;
        border-radius: 4px;
        background: #fff;
        color: #475569;
        padding: 0 10px;
        line-height: 1.25;
        white-space: nowrap;
    }

    .ps-clm-schedule-result.is-error {
        border-color: #ef4444;
        color: #b91c1c;
    }

    .ps-clm-yellow {
        background: #fefce8 !important;
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
        padding: 20px 24px;
    }

    .ps-clm-as400-screen {
        background: #001a0d;
        border: 2px solid #37e86f;
        color: #78ff98;
        font-family: Consolas, "Courier New", monospace;
        text-shadow: 0 0 4px rgba(120, 255, 152, .35);
    }

    .ps-clm-as400-title,
    .ps-clm-as400-file > h4 {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        background: #0b4224;
        color: #baffc8;
        padding: 8px 10px;
        text-transform: uppercase;
    }

    .ps-clm-as400-notice,
    .ps-clm-as400-empty {
        color: #ffe66d;
        padding: 10px 0;
    }

    .ps-clm-as400-file {
        border: 1px solid #2aa957;
        margin-top: 16px;
        padding: 8px;
    }

    .ps-clm-as400-record {
        border-top: 1px dashed #287d45;
        padding: 8px 2px;
    }

    .ps-clm-as400-record summary {
        cursor: pointer;
        font-weight: 700;
    }

    .ps-clm-as400-data {
        max-height: 320px;
        overflow: auto;
        padding-top: 8px;
    }

    .ps-clm-as400-data table {
        min-width: max-content;
        border-collapse: collapse;
        white-space: nowrap;
    }

    .ps-clm-as400-data th,
    .ps-clm-as400-data td {
        border-bottom: 1px dotted #245d37;
        padding: 4px 8px;
        text-align: left;
    }

    .ps-clm-as400-data th {
        color: #fff58a;
    }

    .ps-clm-as400-close {
        background: #0b4224;
        border-color: #78ff98;
        color: #baffc8;
    }

    @media (max-width: 900px) {
        .ps-clm-detail-grid {
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
    <div class="card mx-auto w-full max-w-[1440px] overflow-hidden border border-base-300 bg-base-100 shadow-xl" id="psClmPage" data-page="show">
        <input type="hidden" name="NFRMNO" value="{{ $NFRMNO ?? '' }}">
        <input type="hidden" name="VORGNO" value="{{ $VORGNO ?? '' }}">
        <input type="hidden" name="CYEAR" value="{{ $CYEAR ?? '' }}">
        <input type="hidden" name="CYEAR2" value="{{ $CYEAR2 ?? '' }}">
        <input type="hidden" name="NRUNNO" value="{{ $NRUNNO ?? '' }}">
        <input type="hidden" id="INPUTBY" value="{{ $apv ?? '' }}">
        <script type="application/json" id="psClmFormKey">@json($formKey)</script>
        <script type="application/json" id="psClmExtData">@json(is_array($extData) ? $extData : [])</script>
        <script type="application/json" id="psClmDetails">@json($details)</script>

        <div class="ps-clm-header px-6 py-5">
            <div class="ps-clm-title-block pl-4">
                <h1 class="ps-clm-title text-2xl font-extrabold tracking-normal">Claim Slip / SCL Issue Part</h1>
                <p class="ps-clm-subtitle mt-1 text-sm">Review request data before approval.</p>
            </div>
        </div>

        <section class="ps-clm-section px-6 py-5">
            <div class="ps-clm-section-title mb-4 pl-3">
                <h2 class="text-base font-extrabold">Request Detail</h2>
            </div>
            <div id="form-detail" class="ps-clm-info">
                <span class="ps-clm-label">Form Number</span>
                <span class="ps-clm-value">PS-CLM{{ substr($CYEAR2 ?? '', -2) }}-{{ str_pad($NRUNNO ?? '', 6, '0', STR_PAD_LEFT) }}</span>
            </div>
            <div class="ps-clm-detail-grid">
                <div class="ps-clm-info">
                    <span class="ps-clm-label">Input By</span>
                    <span class="ps-clm-value" id="summaryInputBy">-</span>
                </div>
                <div class="ps-clm-info">
                    <span class="ps-clm-label">Request By</span>
                    <span class="ps-clm-value" id="summaryRequestBy">-</span>
                </div>
                <div class="ps-clm-info">
                    <span class="ps-clm-label">Attachment File</span>
                    <span class="ps-clm-value" id="summaryAttachment">-</span>
                </div>
                <div class="ps-clm-info">
                    <span class="ps-clm-label">New Order</span>
                    <span class="ps-clm-value" id="summaryNewOrder">-</span>
                </div>
            </div>
        </section>

        <section class="ps-clm-section hidden px-6 py-5" id="assignPeopleSection">
            <div class="ps-clm-section-title mb-4 pl-3">
                <h2 class="text-base font-extrabold">Assign People</h2>
            </div>
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div class="form-control">
                    <label class="label py-1" for="assignPeople"><span class="label-text font-bold">Assign People</span></label>
                    <select class="select select-bordered w-full" id="assignPeople">
                        <option value="">Select Employee</option>
                        <option value="12177">12177</option>
                        <option value="14036">14036</option>
                        <option value="16066">16066</option>
                    </select>
                </div>
                <div class="form-control">
                    <label class="label py-1" for="assignPeopleName"><span class="label-text font-bold">Assign Name</span></label>
                    <div class="flex items-center gap-3">
                        <img class="hidden h-12 w-12 flex-none rounded-full object-cover" id="assignPeopleImage" alt="">
                        <input type="text" class="input input-bordered w-full bg-base-200" id="assignPeopleName" readonly>
                    </div>
                </div>
            </div>
        </section>

        <section class="px-6 py-5">
            <div class="mb-4">
                <div class="ps-clm-section-title pl-3">
                    <h2 class="text-base font-extrabold">Items</h2>
                </div>
            </div>
            <div class="ps-clm-table-wrap">
                <table class="table table-sm ps-clm-table" id="itemTable" aria-label="Claim slip item list">
                    <thead>
                        <tr>
                            <th>Original Order</th>
                            <th>Item</th>
                            <th>Part Name</th>
                            <th>Drawing</th>
                            <th>Variable</th>
                            <th>Qty</th>
                            <th>SCL-No.</th>
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
        </section>

        <div id="actionform"></div>
    </div>
</div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/psClmShow.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection


