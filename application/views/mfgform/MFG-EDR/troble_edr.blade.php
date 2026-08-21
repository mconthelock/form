@extends('layouts/webflowTemplate')

@section('contents')
<style>
    #mfg-trouble-dashboard {
        --trouble-green: #166b13;
        --trouble-green-dark: #0f4f0d;
        --trouble-bg: #eef2f6;
        --trouble-border: #d8dee8;
        --trouble-text: #172033;
    }

    #mfg-trouble-dashboard,
    #mfg-trouble-dashboard * {
        box-sizing: border-box;
    }

    #mfg-trouble-dashboard select,
    #mfg-trouble-dashboard input,
    #mfg-trouble-dashboard button {
        font: inherit;
    }

    #mfg-trouble-dashboard select,
    #mfg-trouble-dashboard input {
        width: 100% !important;
        min-width: 0 !important;
    }

    #mfg-trouble-dashboard .dashboard-shell {
        min-width: 1380px;
    }

    #mfg-trouble-dashboard .dashboard-header {
        display: grid;
        grid-template-columns: 28% 22% minmax(0, 50%);
        gap: 12px;
        min-height: 92px;
    }

    #mfg-trouble-dashboard .chart-grid {
        display: grid;
        grid-template-columns: 34% 22% minmax(0, 44%);
        gap: 12px;
        height: 300px;
    }

    #mfg-trouble-dashboard .dashboard-card {
        min-width: 0;
        overflow: hidden;
        border: 1px solid var(--trouble-border);
        border-radius: 14px;
        background: #fff;
        box-shadow:
            0 8px 20px rgba(15, 23, 42, 0.08),
            0 2px 6px rgba(15, 23, 42, 0.05);
    }

    #mfg-trouble-dashboard .chart-card {
        display: flex;
        min-height: 0;
        flex-direction: column;
    }

    #mfg-trouble-dashboard .chart-card-header {
        display: flex;
        min-height: 42px;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #e2e8f0;
        background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
        padding: 8px 14px;
    }

    #mfg-trouble-dashboard .chart-card-body {
        position: relative;
        min-height: 0;
        flex: 1;
        padding: 8px;
    }

    #mfg-trouble-dashboard .chart-placeholder {
        display: flex;
        height: 100%;
        min-height: 180px;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        background:
            repeating-linear-gradient(
                to bottom,
                #ffffff,
                #ffffff 44px,
                #f1f5f9 45px
            );
        color: #94a3b8;
        font-size: 13px;
        font-weight: 700;
    }

    #mfg-trouble-dashboard .filter-control {
        height: 38px;
        border: 1px solid #cbd5e1;
        border-radius: 7px;
        background: #fff;
        padding: 5px 10px;
        color: #1e293b;
        outline: none;
        transition:
            border-color 0.15s ease,
            box-shadow 0.15s ease;
    }

    #mfg-trouble-dashboard .filter-control:focus {
        border-color: #16a34a;
        box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.13);
    }

    #mfg-trouble-dashboard .effect-button {
        display: flex;
        height: 42px;
        min-width: 0;
        flex: 1;
        align-items: center;
        justify-content: center;
        border: 1px solid #a3a3a3;
        border-radius: 5px;
        background: #fffbd4;
        color: #172033;
        font-size: 14px;
        font-weight: 800;
        cursor: pointer;
        transition:
            transform 0.15s ease,
            box-shadow 0.15s ease,
            background-color 0.15s ease;
    }

    #mfg-trouble-dashboard .effect-button:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 10px rgba(15, 23, 42, 0.12);
    }

    #mfg-trouble-dashboard .effect-button.active {
        border-color: #262626;
        background: #303030;
        color: #fff;
    }

    #mfg-trouble-dashboard .table-wrap {
        height: calc(100vh - 430px);
        min-height: 320px;
        overflow: auto;
        border: 1px solid var(--trouble-border);
        border-radius: 12px;
        background: #fff;
    }

    #mfg-trouble-dashboard .trouble-table {
        width: 100%;
        min-width: 1250px;
        border-collapse: separate;
        border-spacing: 0;
        font-size: 13px;
    }

    #mfg-trouble-dashboard .trouble-table th {
        position: sticky;
        top: 0;
        z-index: 10;
        border-right: 1px solid #64748b;
        border-bottom: 1px solid #64748b;
        background: #242424;
        padding: 8px 10px;
        color: #fff;
        font-size: 12px;
        font-weight: 700;
        text-align: left;
        white-space: nowrap;
    }

    #mfg-trouble-dashboard .trouble-table td {
        border-right: 1px solid #e2e8f0;
        border-bottom: 1px solid #e2e8f0;
        padding: 7px 10px;
        color: #334155;
        vertical-align: top;
    }

    #mfg-trouble-dashboard .trouble-table tbody tr:nth-child(even) {
        background: #f8fafc;
    }

    #mfg-trouble-dashboard .trouble-table tbody tr:hover {
        background: #ecfdf5;
    }

    #mfg-trouble-dashboard .empty-row td {
        padding: 60px 20px;
        color: #94a3b8;
        font-weight: 600;
        text-align: center;
    }

    @media (max-width: 1399px) {
        #mfg-trouble-dashboard {
            overflow-x: auto;
        }
    }
</style>

<div id="mfg-trouble-dashboard" class="min-h-screen bg-[#eef2f6] p-2">
    <div class="dashboard-shell">

        {{-- ========================================================= --}}
        {{-- HEADER --}}
        {{-- ========================================================= --}}
        <header class="dashboard-header mb-3 rounded-2xl bg-[#166b13] p-3 shadow-lg">

            {{-- Title --}}
            <section class="flex min-w-0 items-center px-4">
                <div>
                    <h1 class="text-[34px] font-extrabold leading-none tracking-tight text-white">
                        Daily Report
                    </h1>

                    <p class="mt-2 text-[18px] font-bold text-green-100">
                        (In-process Trouble)
                    </p>
                </div>
            </section>

            {{-- Effect Level --}}
            <section class="rounded-xl bg-white p-3 shadow-md">
                <h2 class="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Effect LV
                </h2>

                <div class="flex gap-2">
                    <button type="button"
                        id="btn-effect-high"
                        class="effect-button active"
                        data-effect="HIGH">
                        High
                    </button>

                    <button type="button"
                        id="btn-effect-low"
                        class="effect-button"
                        data-effect="LOW">
                        Low
                    </button>

                    <button type="button"
                        id="btn-effect-medium"
                        class="effect-button"
                        data-effect="MEDIUM">
                        Medium
                    </button>
                </div>
            </section>

            {{-- Filters --}}
            <section class="rounded-xl bg-white p-3 shadow-md">
                <div class="grid grid-cols-[150px_110px_120px_110px_minmax(150px,1fr)] gap-2">

                    {{-- Fiscal Year --}}
                    <div>
                        <label for="ddl-trouble-fiscal-year"
                            class="mb-1 block text-[10px] font-bold text-slate-500">
                            Fiscal Year
                        </label>

                        <select id="ddl-trouble-fiscal-year"
                            class="filter-control">
                            <option value="">Select Year</option>
                        </select>
                    </div>

                    {{-- Month --}}
                    <div>
                        <label for="ddl-trouble-month"
                            class="mb-1 block text-[10px] font-bold text-slate-500">
                            Month
                        </label>

                        <select id="ddl-trouble-month"
                            class="filter-control">
                            <option value="ALL">All</option>
                            <option value="JAN">Jan</option>
                            <option value="FEB">Feb</option>
                            <option value="MAR">Mar</option>
                            <option value="APR">Apr</option>
                            <option value="MAY">May</option>
                            <option value="JUN">Jun</option>
                            <option value="JUL">Jul</option>
                            <option value="AUG">Aug</option>
                            <option value="SEP">Sep</option>
                            <option value="OCT">Oct</option>
                            <option value="NOV">Nov</option>
                            <option value="DEC">Dec</option>
                        </select>
                    </div>

                    {{-- Defect Type --}}
                    <div>
                        <label for="ddl-trouble-defect-type"
                            class="mb-1 block text-[10px] font-bold text-slate-500">
                            Defect Type
                        </label>

                        <select id="ddl-trouble-defect-type"
                            class="filter-control">
                            <option value="ALL">All</option>
                        </select>
                    </div>

                    {{-- Item --}}
                    <div>
                        <label for="ddl-trouble-item"
                            class="mb-1 block text-[10px] font-bold text-slate-500">
                            ITEM
                        </label>

                        <select id="ddl-trouble-item"
                            class="filter-control">
                            <option value="ALL">All</option>
                        </select>
                    </div>

                    {{-- Department / Section --}}
                    <div>
                        <label for="ddl-trouble-section"
                            class="mb-1 block text-[10px] font-bold text-slate-500">
                            Dept. Sect
                        </label>

                        <select id="ddl-trouble-section"
                            class="filter-control">
                            <option value="ALL">All</option>
                        </select>
                    </div>
                </div>

                <div class="mt-1 flex justify-end">
                    <button type="button"
                        id="btn-reset-trouble-filter"
                        class="text-xs font-semibold text-slate-500 transition hover:text-red-600">
                        ⟳ Reset
                    </button>
                </div>
            </section>
        </header>

        {{-- ========================================================= --}}
        {{-- CHARTS --}}
        {{-- ========================================================= --}}
        <div class="chart-grid mb-3">

            {{-- Top 3 Defective Items --}}
            <section class="dashboard-card chart-card">
                <div class="chart-card-header">
                    <h2 class="text-base font-bold text-slate-700">
                        TOP 3 Defective ITEMs
                    </h2>
                </div>

                <div class="chart-card-body">
                    <div id="chart-top-defective-items"
                        class="h-full">
                        <div class="chart-placeholder">
                            TOP 3 Defective ITEMs Chart
                        </div>
                    </div>
                </div>
            </section>

            {{-- Defect by Section --}}
            <section class="dashboard-card chart-card">
                <div class="chart-card-header">
                    <h2 class="text-base font-bold text-slate-700">
                        Defect by Section
                    </h2>
                </div>

                <div class="chart-card-body">
                    <div id="chart-defect-by-section"
                        class="h-full">
                        <div class="chart-placeholder">
                            Defect by Section Donut Chart
                        </div>
                    </div>
                </div>
            </section>

            {{-- Significant Defect --}}
            <section class="dashboard-card chart-card">
                <div class="chart-card-header">
                    <h2 class="text-base font-bold text-slate-700">
                        Significant Defect
                    </h2>
                </div>

                <div class="chart-card-body">
                    <div id="chart-significant-defect"
                        class="h-full">
                        <div class="chart-placeholder">
                            Significant Defect Pareto Chart
                        </div>
                    </div>
                </div>
            </section>
        </div>

        {{-- ========================================================= --}}
        {{-- DETAIL TABLE --}}
        {{-- ========================================================= --}}
        <section class="dashboard-card p-2">
            <div class="mb-2 flex items-center justify-between px-2">
                <div>
                    <h2 class="text-base font-bold text-slate-700">
                        Trouble Detail
                    </h2>

                    <p class="text-xs text-slate-400">
                        Detail records based on selected filters
                    </p>
                </div>

                <div id="lbl-trouble-total-records"
                    class="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                    0 Records
                </div>
            </div>

            <div class="table-wrap">
                <table class="trouble-table">
                    <thead>
                        <tr>
                            <th class="w-[130px]">Daily No.</th>
                            <th class="w-[75px] text-center">ITEM</th>
                            <th class="w-[90px]">Effect</th>
                            <th class="w-[130px]">Order No.</th>
                            <th class="w-[145px]">Cause Sub</th>
                            <th class="w-[190px]">Cause Name</th>
                            <th>Detail</th>
                        </tr>
                    </thead>

                    <tbody id="tbody-trouble-detail">
                        <tr class="empty-row">
                            <td colspan="7">
                                No data
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </div>
</div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/dashboard_trouble.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection