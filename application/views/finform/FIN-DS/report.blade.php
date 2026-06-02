@extends('layouts/webflowTemplate')

@section('styles')
    <style>
        #stampTable tbody tr {
            height: 48px;
        }

        #stampTable {
            width: max-content !important;
            min-width: max-content;
            table-layout: auto;
            font-size: 13px;
            border-collapse: collapse;
            border-spacing: 0;
            color: #1f2937;
        }

        #stampTable.dataTable,
        .dataTables_wrapper table.dataTable,
        .dt-container table.dataTable {
            width: max-content !important;
            min-width: max-content !important;
        }

        #stampTable thead th,
        #stampTable tfoot th,
        .dt-scroll-head th,
        .dt-scroll-foot th,
        .dataTables_scrollHead th,
        .dataTables_scrollFoot th {
            text-align: center !important;
            vertical-align: middle !important;
            white-space: nowrap;
            padding: 9px 12px !important;
            line-height: 1.25;
            font-weight: 800;
            justify-content: center;
            border-color: #cbd5e1 !important;
            border-right: 1px solid #cbd5e1 !important;
            border-bottom: 1px solid #cbd5e1 !important;
        }

        #stampTable thead th {
            background: #f8fafc;
            color: #0f172a;
        }

        .dt-scroll-head th,
        .dataTables_scrollHead th {
            background: #f8fafc !important;
            color: #0f172a !important;
        }

        #stampTable tfoot th {
            background: #f1f5f9;
            color: #0f172a;
            font-weight: 700;
            border-top: 3px solid #64748b !important;
        }

        .dt-scroll-foot th,
        .dataTables_scrollFoot th {
            background: #f1f5f9 !important;
            color: #0f172a !important;
            font-weight: 700;
            border-top: 3px solid #64748b !important;
        }

        #stampTable tfoot th:nth-child(2),
        .dt-scroll-foot tfoot th:nth-child(2),
        .dataTables_scrollFoot tfoot th:nth-child(2) {
            text-align: left !important;
        }

        #stampTable tfoot th:nth-child(n+3),
        .dt-scroll-foot tfoot th:nth-child(n+3),
        .dataTables_scrollFoot tfoot th:nth-child(n+3) {
            text-align: right !important;
            font-variant-numeric: tabular-nums;
        }

        #stampTable tbody td {
            padding: 8px 12px !important;
            vertical-align: middle;
            white-space: nowrap;
            text-align: center;
            border-right: 1px solid #e2e8f0 !important;
            border-bottom: 1px solid #e2e8f0 !important;
        }

        #stampTable tbody tr:nth-child(odd) td {
            background: #ffffff;
        }

        #stampTable tbody tr:nth-child(even) td {
            background: #f9fafb;
        }

        #stampTable tbody tr:hover td {
            filter: brightness(0.97);
        }

        #stampTable .report-detail {
            min-width: 220px;
            max-width: 300px;
            white-space: normal;
            text-align: center !important;
            color: #374151;
        }

        #stampTable .report-user {
            min-width: 190px;
            max-width: 300px;
            white-space: normal;
            text-align: center !important;
            color: #374151;
        }

        #stampTable .report-section {
            min-width: 110px;
            text-align: center !important;
            font-weight: 700;
            color: #475569;
        }

        #stampTable .report-date {
            min-width: 96px;
            width: 96px;
            color: #6d28d9;
            font-weight: 800;
            text-align: center !important;
        }

        #stampTable .report-qty {
            min-width: 58px;
            text-align: right !important;
            font-variant-numeric: tabular-nums;
        }

        #stampTable .report-amt {
            min-width: 82px;
            text-align: right !important;
            font-variant-numeric: tabular-nums;
        }

        #stampTable .report-balance {
            min-width: 96px;
            text-align: right !important;
            font-weight: 800;
            color: #6d28d9;
            font-variant-numeric: tabular-nums;
        }

        #stampTable .report-buy-header,
        .dt-scroll-head .report-buy-header,
        .dataTables_scrollHead .report-buy-header {
            background: #ccfbf1 !important;
            color: #115e59 !important;
        }

        #stampTable .report-withdraw-header,
        .dt-scroll-head .report-withdraw-header,
        .dataTables_scrollHead .report-withdraw-header {
            background: #fef3c7 !important;
            color: #92400e !important;
        }

        #stampTable .report-remaining-header,
        .dt-scroll-head .report-remaining-header,
        .dataTables_scrollHead .report-remaining-header {
            background: #dbeafe !important;
            color: #1e40af !important;
        }

        #stampTable .report-balance-header,
        .dt-scroll-head .report-balance-header,
        .dataTables_scrollHead .report-balance-header {
            background: #ede9fe !important;
            color: #5b21b6 !important;
        }

        #stampTable .report-meta-header,
        .dt-scroll-head .report-meta-header,
        .dataTables_scrollHead .report-meta-header {
            background: #f5f3ff !important;
            color: #5b21b6 !important;
        }

        #stampTable .report-buy.report-denom-header,
        .dt-scroll-head .report-buy.report-denom-header,
        .dataTables_scrollHead .report-buy.report-denom-header {
            background: #99f6e4 !important;
            color: #134e4a !important;
        }

        #stampTable .report-withdraw.report-denom-header,
        .dt-scroll-head .report-withdraw.report-denom-header,
        .dataTables_scrollHead .report-withdraw.report-denom-header {
            background: #fde68a !important;
            color: #78350f !important;
        }

        #stampTable .report-remaining.report-denom-header,
        .dt-scroll-head .report-remaining.report-denom-header,
        .dataTables_scrollHead .report-remaining.report-denom-header {
            background: #bfdbfe !important;
            color: #1e3a8a !important;
        }

        #stampTable .report-buy.report-metric-header,
        .dt-scroll-head .report-buy.report-metric-header,
        .dataTables_scrollHead .report-buy.report-metric-header {
            background: #f0fdfa !important;
            color: #115e59 !important;
        }

        #stampTable .report-withdraw.report-metric-header,
        .dt-scroll-head .report-withdraw.report-metric-header,
        .dataTables_scrollHead .report-withdraw.report-metric-header {
            background: #fffbeb !important;
            color: #92400e !important;
        }

        #stampTable .report-remaining.report-metric-header,
        .dt-scroll-head .report-remaining.report-metric-header,
        .dataTables_scrollHead .report-remaining.report-metric-header {
            background: #eff6ff !important;
            color: #1e40af !important;
        }

        #stampTable tbody tr:nth-child(odd) td.report-buy {
            background: #f0fdfa;
        }

        #stampTable tbody tr:nth-child(even) td.report-buy {
            background: #e6fffb;
        }

        #stampTable tbody tr:nth-child(odd) td.report-withdraw {
            background: #fffbeb;
        }

        #stampTable tbody tr:nth-child(even) td.report-withdraw {
            background: #fef7d7;
        }

        #stampTable tbody tr:nth-child(odd) td.report-remaining {
            background: #eff6ff;
        }

        #stampTable tbody tr:nth-child(even) td.report-remaining {
            background: #e0efff;
        }

        #stampTable tbody tr:nth-child(odd) td.report-balance-group {
            background: #faf5ff !important;
        }

        #stampTable tbody tr:nth-child(even) td.report-balance-group {
            background: #f3e8ff !important;
        }

        #stampTable .report-negative {
            background: #fee2e2 !important;
            color: #b91c1c !important;
            font-weight: 900 !important;
        }

        #stampTable tbody tr.report-date-boundary td {
            border-top: 2px solid #64748b !important;
        }

        #stampTable th.report-sticky-date,
        #stampTable td.report-date,
        .dt-scroll-head th.report-sticky-date,
        .dataTables_scrollHead th.report-sticky-date {
            position: sticky;
            left: 0;
            z-index: 6;
        }

        #stampTable td.report-date {
            z-index: 5;
        }

        #stampTable tbody tr:nth-child(odd) td.report-date {
            background: #ffffff;
        }

        #stampTable tbody tr:nth-child(even) td.report-date {
            background: #f9fafb;
        }

        .report-table-wrap {
            display: block;
            width: 100%;
            max-width: 100%;
            overflow-x: auto;
            overflow-y: hidden;
            padding-bottom: 4px;
        }

        #stampTable tbody input,
        #stampTable tbody select,
        #stampTable tbody textarea {
            min-height: 38px;
            padding: 6px 10px;
        }

        .dataTables_wrapper {
            display: block;
            width: max-content;
            min-width: 100%;
            overflow-x: visible;
            overflow-y: visible;
        }

        .dt-container,
        .dt-scroll,
        .dt-scroll-head,
        .dt-scroll-body,
        .dt-scroll-foot,
        .dataTables_scroll,
        .dataTables_scrollHead,
        .dataTables_scrollBody,
        .dataTables_scrollFoot {
            max-width: 100%;
        }
        #stampTable.dataTable tfoot {
            display: table-footer-group !important;
            visibility: visible !important;
        }
  

        .dt-scroll-foot,
        .dataTables_scrollFoot {
            display: block !important;
            visibility: visible !important;
            overflow: hidden !important;
        }
       

        @media (max-width: 1024px) {
            #stampTable {
                font-size: 11px;
            }

            #stampTable thead th,
            #stampTable tfoot th,
            #stampTable tbody td {
                padding: 7px 8px !important;
            }
        }

    </style>
@endsection
@section('contents')
    <div class="min-h-screen bg-base-200/40 px-4 py-6 text-base-content">
        <div class="mx-auto flex w-full max-w-7xl flex-col gap-4">
            <div class="card border border-base-300 bg-base-100 shadow-sm">
                <div class="card-body gap-0 p-5 md:p-6">
                    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div class="flex items-center gap-4">
                            <div class="rounded-box bg-primary p-3 text-primary-content shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg"
                                     class="w-6 h-6"
                                     fill="none"
                                     viewBox="0 0 24 24"
                                     stroke="currentColor"
                                     stroke-width="2">
                                    <path stroke-linecap="round"
                                          stroke-linejoin="round"
                                          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25z" />
                                </svg>
                            </div>
ไำ
                            <div class="space-y-1">
                                <h1 class="text-2xl font-bold tracking-tight text-base-content">
                                    Control duty stamp report
                                </h1>
                                <p class="text-sm text-base-content/60">
                                    Stamp movement and remaining balance summary
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <div class="card border border-base-300 bg-base-100 shadow-sm">
                <div class="card-body gap-6 p-5 md:p-6">
                    <div class="flex items-center gap-3">
                        <div class="rounded-box bg-primary/10 p-2 text-primary">
                            <svg xmlns="http://www.w3.org/w2000/svg" class="w-5 h-5" fill="none"
                                 viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 class="text-sm font-bold uppercase tracking-widest text-primary">
                            Report Criteria
                        </h2>
                    </div>

                    <div class="rounded-box border border-base-300 bg-base-200/40 p-4">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
                            <div class="form-control">
                                <label class="label pb-1">
                                    <span class="label-text text-xs font-bold uppercase tracking-wide text-base-content/60">YEAR</span>
                                </label>
                                <div class="join">
                                    <button type="button" class="btn btn-sm join-item nav-btn" data-step="-1">&lt;</button>
                                    <input type="number"
                                           id="year"
                                           class="input input-sm input-bordered join-item w-28 text-center text-xl font-bold text-warning"
                                           min="2000"
                                           max="2100"
                                           step="1"
                                           value="{{ date('Y') }}">
                                    <button type="button" class="btn btn-sm join-item nav-btn" data-step="1">&gt;</button>
                                </div>
                            </div>

                            <div class="form-control">
                                <label class="label pb-1">
                                    <span class="label-text text-xs font-bold uppercase tracking-wide text-base-content/60">Month</span>
                                </label>
                                <select id="reportMonth" class="select select-bordered select-sm w-full">
                                    <option value="all">All months</option>
                                    <option value="1">January</option>
                                    <option value="2">February</option>
                                    <option value="3">March</option>
                                    <option value="4">April</option>
                                    <option value="5">May</option>
                                    <option value="6">June</option>
                                    <option value="7">July</option>
                                    <option value="8">August</option>
                                    <option value="9">September</option>
                                    <option value="10">October</option>
                                    <option value="11">November</option>
                                    <option value="12">December</option>
                                </select>
                            </div>

                            <div class="form-control">
                                <label class="label pb-1">
                                    <span class="label-text text-xs font-bold uppercase tracking-wide text-base-content/60">Export</span>
                                </label>
                                <button type="button" id="addStampRow" class="btn btn-accent btn-sm w-full gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none"
                                         viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                              d="M12 4v16m8-8H4" />
                                    </svg>
                                    Export
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div class="flex items-center gap-3">
                                <div class="rounded-box bg-success/10 p-2 text-success">
                                <svg xmlns="http://www.w3.org/2000/svg"
                                     class="w-5 h-5"
                                     fill="none"
                                     viewBox="0 0 24 24"
                                     stroke="currentColor"
                                     stroke-width="2">
                                     <path stroke-linecap="round"
                                      stroke-linejoin="round"
                                      d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                </svg>
                                </div>
                                <h2 class="text-sm font-bold uppercase tracking-widest text-success">
                                    Stamp Duty Report
                                </h2>
                            </div>
                            <span class="badge badge-success badge-outline font-bold">
                                <span id="reportPeriodInline">FY {{ date('Y') }}</span>
                            </span>
                        </div>

                        <div class="report-table-wrap">
                            <table id="stampTable" class="table table-xs table-zebra text-center"></table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('scripts')

<script src="{{ $_ENV['APP_JS'] }}/report.js?ver={{ $GLOBALS['version'] }}"></script>

@endsection
