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
            border-color: #d1fae5 !important;
            border-right: 1px solid #bbf7d0 !important;
            border-bottom: 1px solid #bbf7d0 !important;
        }

        #stampTable thead th {
            background: #ecfdf5;
            color: #065f46;
        }

        .dt-scroll-head th,
        .dataTables_scrollHead th {
            background: #ecfdf5 !important;
            color: #065f46 !important;
        }

        #stampTable tfoot th {
            background: #f8fafc;
            color: #334155;
        }

        .dt-scroll-foot th,
        .dataTables_scrollFoot th {
            background: #f8fafc !important;
            color: #334155 !important;
        }

        #stampTable tbody td {
            padding: 9px 12px !important;
            vertical-align: middle;
            white-space: nowrap;
            text-align: center;
            border-right: 1px solid #e2e8f0 !important;
            border-bottom: 1px solid #cbd5e1 !important;
        }

        #stampTable tbody tr:nth-child(odd) td {
            background: #ffffff;
        }

        #stampTable tbody tr:nth-child(even) td {
            background: #f8fafc;
        }

        #stampTable tbody tr:hover td {
            background: #ecfdf5;
        }

        #stampTable .report-detail {
            min-width: 180px;
            max-width: 280px;
            white-space: normal;
            text-align: center !important;
        }

        #stampTable .report-user {
            min-width: 190px;
            max-width: 300px;
            white-space: normal;
            text-align: center !important;
        }

        #stampTable .report-section {
            min-width: 110px;
            text-align: center !important;
            font-weight: 700;
        }

        #stampTable .report-date {
            min-width: 88px;
            color: #0369a1;
            font-weight: 800;
            text-align: center !important;
        }

        #stampTable .report-qty {
            min-width: 58px;
            text-align: center !important;
        }

        #stampTable .report-amt {
            min-width: 82px;
            text-align: center !important;
        }

        #stampTable .report-balance {
            min-width: 96px;
            text-align: center !important;
            font-weight: 800;
        }

        .report-table-card {
            width: 100%;
            max-width: 100%;
            border-color: #a7f3d0;
            overflow-x: auto;
            overflow-y: hidden;
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

   /* body {
            font-family: 'Segoe UI', sans-serif;
            background: #f4f6f9;
            margin: 0;
            padding: 20px;
        } */

        h1 {
            color: #1f2d3d;
            margin-bottom: 20px;
        }

        .card-container {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
        }

        .card {
            background: #fff;
            border-radius: 15px;
            padding: 20px;
            min-width: 220px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            position: relative;
        }

        .card h4 {
            color: #6c757d;
            margin: 0 0 10px;
        }

        .card .value {
            font-size: 36px;
            font-weight: bold;
            color: #ff7a00;
        }

        .nav-btn {
            background: #0d1b3d;
            color: #fff;
            border: none;
            border-radius: 10px;
            padding: 5px 10px;
            margin: 5px;
            cursor: pointer;
        }

        .export-btn {
            font-size: 32px;
            color: #ff7a00;
            border: 3px solid #ff7a00;
            width: 20%;
            height: 20%;
            text-align: center;
            line-height: 55px;
            border-radius: 8px;
        }

        .icon {
            position: absolute;
            right: 15px;
            bottom: 15px;
            font-size: 24px;
            color: #0d1b3d;
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

        #stampTable.dataTable thead {
            visibility: collapse !important;
            height: 0 !important;
            max-height: 0 !important;
            overflow: hidden !important;
        }
        #stampTable.dataTable tfoot {
            visibility: collapse !important;
            height: 0 !important;
            max-height: 0 !important;
            overflow: hidden !important;
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
    <div class="show-page min-h-screen py-8 px-4 font-sans flex flex-col items-center text-slate-700">
        <div class="w-full max-w-5xl mx-auto space-y-5">
            <div class="card bg-gradient-to-r from-emerald-50 via-base-100 to-base-100 shadow-md border-l-4 border-emerald-600 rounded-2xl overflow-hidden">
                <div class="card-body px-8 py-5">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div class="flex items-center gap-4">
                            <div class="bg-emerald-600 text-white rounded-xl p-3 shadow-sm">
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

                            <div>
                                <h1 class="text-2xl font-extrabold text-slate-800 tracking-tight">
                                    Control duty stamp report
                                </h1>
                                <p class="text-sm text-emerald-700 font-medium mt-0.5">
                                    Stamp movement and remaining balance summary
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <div class="card bg-base-100 shadow-xl border border-base-200 rounded-2xl overflow-hidden">
                <div class="card-body px-6 py-8 md:px-10">
                    <form action="#" id="form" method="POST" enctype="multipart/form-data" class="space-y-6">
                        <div class="flex items-center gap-3">
                            <div class="bg-primary/20 p-1.5 rounded-lg text-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h2 class="text-base font-bold text-primary uppercase tracking-widest">
                                Report Criteria
                            </h2>
                        </div>

                        <div class="bg-primary/5 rounded-xl border border-primary/20 p-5 shadow-sm">
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
                                <div class="form-control">
                                    <label class="label pb-1">
                                        <span class="label-text font-bold text-base-content/80 text-sm">FYEAR</span>
                                    </label>
                                    <div class="flex items-center gap-2">
                                        <button type="button" class="nav-btn" data-step="-1">&lt;</button>
                                        <div class="min-w-24 text-center text-3xl font-extrabold text-warning" id="year">
                                            {{ date('Y') }}
                                        </div>
                                        <button type="button" class="nav-btn" data-step="1">&gt;</button>
                                    </div>
                                </div>

                                <div class="form-control">
                                    <label class="label pb-1">
                                        <span class="label-text font-bold text-base-content/80 text-sm">Month</span>
                                    </label>
                                    <select id="reportMonth" class="select select-sm select-bordered w-full border-primary/30">
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
                                        <span class="label-text font-bold text-base-content/80 text-sm">Export</span>
                                    </label>
                                    <button type="button" id="addStampRow" class="btn btn-sm btn-accent w-full gap-2">
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
                            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                                <div class="flex items-center gap-3">
                                    <div class="bg-emerald-100 p-1.5 rounded-lg text-emerald-700">
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
                                    <h2 class="text-base font-bold text-emerald-700 uppercase tracking-widest">
                                        Stamp Duty Report
                                    </h2>
                                </div>
                                <span class="badge badge-outline badge-success font-bold px-4 py-3">
                                    <span id="reportPeriodInline">FY {{ date('Y') }}</span>
                                </span>
                            </div>

                                <div class="report-table-wrap">
                                    <table id="stampTable" class="table table-xs text-center"></table>
                                </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('scripts')

<script>
    window.FIN_DS_REPORT_URL = "{{ base_url('finform/FIN-DS/form/report') }}";
</script>
<script src="{{ $_ENV['APP_JS'] }}/report.js?ver={{ $GLOBALS['version'] }}"></script>

@endsection
