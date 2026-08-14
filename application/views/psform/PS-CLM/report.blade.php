@extends('layouts/webflowTemplate')

@section('styles')
<style>
    .ps-clm-report {
        min-height: calc(100vh - 8rem);
        background: #f4f7fb;
        color: #1f2937;
    }

    .ps-clm-report-card {
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

    .ps-clm-filter-panel {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 1rem 1.25rem;
    }

    .ps-clm-report .label-text {
        color: #334155;
        font-weight: 800;
    }

    .ps-clm-report .input:focus {
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, .16);
    }

    .ps-clm-report-result.hidden {
        display: none;
    }

    .ps-clm-table-wrap {
        width: 100%;
        overflow-x: auto;
        background: #fff;
    }

    .ps-clm-table-wrap table.dataTable th,
    .ps-clm-table-wrap table.dataTable td {
        white-space: nowrap;
    }

    .ps-clm-table-wrap table.dataTable thead th,
    .ps-clm-table-wrap .dt-scroll-head table.dataTable thead th {
        border: 0 !important;
        background: #2f6fb7 !important;
        color: #fff !important;
        text-align: center !important;
        vertical-align: middle !important;
        font-weight: 800 !important;
    }

    .ps-clm-table-wrap table.dataTable tbody td {
        border: 0 !important;
        text-align: center !important;
        vertical-align: middle !important;
    }

    @media (max-width: 1024px) {
        .ps-clm-filter-panel {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
    }

    @media (max-width: 640px) {
        .ps-clm-filter-panel {
            grid-template-columns: 1fr;
        }

        .ps-clm-report-actions .btn {
            width: 100%;
        }
    }
</style>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/psClmReport.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection

@section('contents')
<div class="ps-clm-report rounded-box p-0 md:p-6">
    <div class="card ps-clm-report-card mx-auto w-full max-w-[1280px] overflow-hidden border border-base-300 bg-base-100 shadow-xl">
        <form id="form" method="get" autocomplete="off">
            <div class="ps-clm-header px-6 py-5">
                <div class="ps-clm-title-block pl-4">
                    <h1 class="ps-clm-title text-2xl font-extrabold tracking-normal">Claim Slip / SCL Issue Part Report</h1>
                    <p class="ps-clm-subtitle mt-1 text-sm">PS-CLM request item report.</p>
                </div>
            </div>

            <section class="ps-clm-section px-6 py-5">
                <div class="ps-clm-section-title mb-4 pl-3">
                    <h2 class="text-base font-extrabold">Filters</h2>
                </div>
                <div class="ps-clm-filter-panel">
                    <div class="form-control">
                        <label class="label py-1" for="CLAIM_SLIP_SCL_NO"><span class="label-text">CLAIM SLIP/SCL NO.</span></label>
                        <input type="text" class="input input-bordered w-full" id="CLAIM_SLIP_SCL_NO" name="CLAIM_SLIP_SCL_NO">
                    </div>
                    <div class="form-control">
                        <label class="label py-1" for="ORDER"><span class="label-text">ORDER</span></label>
                        <input type="text" class="input input-bordered w-full" id="ORDER" name="ORDER">
                    </div>
                    <div class="form-control">
                        <label class="label py-1" for="DRAWING_NO"><span class="label-text">DRAWING NO.</span></label>
                        <input type="text" class="input input-bordered w-full" id="DRAWING_NO" name="DRAWING_NO">
                    </div>
                    <div class="form-control">
                        <label class="label py-1" for="PRODUCTION"><span class="label-text">PRODUCTION</span></label>
                        <input type="text" class="input input-bordered w-full" id="PRODUCTION" name="PRODUCTION">
                    </div>
                </div>
            </section>

            <div class="ps-clm-report-actions flex flex-wrap justify-end gap-2 px-6 py-4">
                <button type="button" class="btn btn-outline" id="resetReport">
                    <i class="icofont-refresh"></i>
                    Reset
                </button>
                <button type="submit" class="btn btn-primary">
                    <i class="icofont-search-1"></i>
                    Search
                </button>
                <button type="button" class="btn btn-success" id="exportReport">
                    <i class="icofont-file-excel"></i>
                    Export Excel
                </button>
            </div>
        </form>

        <section id="result" class="ps-clm-report-result hidden px-6 py-5">
            <div class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div class="ps-clm-section-title pl-3">
                    <h2 class="text-base font-extrabold">Result</h2>
                </div>
                <span id="reportSummary" class="text-sm font-bold text-slate-600"></span>
            </div>
            <div class="ps-clm-table-wrap">
                <table id="reportTable" class="display nowrap" style="width:100%"></table>
            </div>
        </section>
    </div>
</div>
@endsection
