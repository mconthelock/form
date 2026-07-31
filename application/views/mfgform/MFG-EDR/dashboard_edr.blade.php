@extends('layouts/webflowTemplate')

@section('contents')
<style>
    #mfg-edr-dashboard {
        --edr-primary: #0f4c5c;
        --edr-primary-dark: #123241;
        --edr-accent: #f28c28;
        --edr-accent-soft: #fff2df;
        --edr-page: #f3f6f9;
        --edr-panel: #ffffff;
        --edr-panel-soft: #eef6f8;
        --edr-border: #cbd5e1;
        --edr-text: #172033;
        --edr-muted: #64748b;
    }

    #mfg-edr-dashboard,
    #mfg-edr-dashboard * { box-sizing: border-box; }

    #mfg-edr-dashboard select,
    #mfg-edr-dashboard input,
    #mfg-edr-dashboard button { font: inherit; }

    #mfg-edr-dashboard select,
    #mfg-edr-dashboard input {
        width: 100% !important;
        min-width: 0 !important;
    }

    #mfg-edr-dashboard .dashboard-grid {
        display: grid;
        grid-template-columns: 16% 40% minmax(0, 44%);
        gap: 14px;
        min-width: 1380px;
    }

    #mfg-edr-dashboard .dashboard-panel {
        min-width: 0;
        height: calc(100vh - 118px);
        min-height: 700px;
    }

    #mfg-edr-dashboard .dashboard-card {
        overflow: hidden;
        border: 1px solid rgba(148, 163, 184, 0.28);
        border-radius: 14px;
        background: #fff;
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.07);
    }

    #mfg-edr-dashboard .chart-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #94a3b8;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: .01em;
        background-image: linear-gradient(to bottom, transparent 95%, rgba(148,163,184,.08) 95%);
        background-size: 100% 28px;
    }

    #mfg-edr-dashboard .filter-select {
        height: 40px;
        border: 1px solid #cbd5e1;
        border-radius: 9px;
        background: #fff;
        padding: 6px 10px;
        color: var(--edr-text);
        outline: none;
        transition: border-color .15s ease, box-shadow .15s ease, transform .15s ease;
    }

    #mfg-edr-dashboard .filter-select:hover { border-color: #94a3b8; }

    #mfg-edr-dashboard .filter-select:focus {
        border-color: #0f4c5c;
        box-shadow: 0 0 0 3px rgba(15, 76, 92, .14);
    }

    #mfg-edr-dashboard .filter-block {
        border: 1px solid rgba(148,163,184,.25);
        border-radius: 12px;
        background: rgba(255,255,255,.88);
        padding: 12px;
        box-shadow: 0 6px 16px rgba(15,23,42,.05);
    }

    #mfg-edr-dashboard .section-title {
        color: var(--edr-primary-dark);
        font-weight: 800;
        letter-spacing: .01em;
    }

    #mfg-edr-dashboard .dashboard-section-item {
        display: flex;
        min-height: 36px;
        cursor: pointer;
        align-items: center;
        gap: 9px;
        border: 1px solid transparent;
        border-radius: 9px;
        padding: 7px 9px;
        color: #334155;
        transition: background-color .15s ease, border-color .15s ease, color .15s ease, transform .15s ease;
    }

    #mfg-edr-dashboard .dashboard-section-item:hover {
        border-color: #bfdbfe;
        background: #eff6ff;
        color: #1d4ed8;
        transform: translateY(-1px);
    }

    #mfg-edr-dashboard .dashboard-section-item input,
    #mfg-edr-dashboard #chk-dashboard-section-all {
        width: 17px !important;
        height: 17px !important;
        flex: 0 0 auto;
        cursor: pointer;
        accent-color: #0f4c5c;
    }

    #mfg-edr-dashboard .dashboard-section-item span {
        font-size: 14px;
        font-weight: 700;
    }

    #mfg-edr-dashboard .panel-heading {
        display: flex;
        align-items: center;
        min-height: 38px;
        border-bottom: 1px solid #e2e8f0;
        background: linear-gradient(90deg, #f8fafc 0%, #ffffff 100%);
        padding: 0 14px;
        color: #334155;
        font-size: 12px;
        font-weight: 800;
    }

    #mfg-edr-dashboard table thead {
        background: linear-gradient(90deg, #f59e0b 0%, #f97316 100%);
        color: #fff;
    }

    #mfg-edr-dashboard table tbody tr:nth-child(even) { background: #f8fafc; }
    #mfg-edr-dashboard table tbody tr:hover { background: #eff6ff; }

    @media (max-width: 1399px) {
        #mfg-edr-dashboard { overflow-x: auto; }
    }
</style>

<div id="mfg-edr-dashboard" class="min-h-screen bg-[#f3f6f9] p-2">

    {{-- Header --}}
    <header class="mb-3 flex h-[66px] items-center justify-center rounded-xl bg-gradient-to-r from-[#0f4c5c] via-[#126782] to-[#0f4c5c] px-4 shadow-lg">
        <h1 class="text-center text-[38px] font-semibold leading-none tracking-[0.04em] text-white drop-shadow-sm">
            MFG Daily Report : Dash board
        </h1>
    </header>

    <div class="dashboard-grid">
        {{-- ========================================================= --}}
            {{-- LEFT: FILTER PANEL --}}    
            {{-- ========================================================= --}}
            <aside class="dashboard-panel rounded-2xl border border-slate-200 bg-gradient-to-b from-[#fff8ef] to-[#fff1df] px-4 py-4 shadow-lg">

            {{-- Fiscal Year --}}
            <section class="mb-4">
                <h2 class="section-title mb-2 text-center text-xl">
                    Fiscal Year
                </h2>

                <select id="ddl-dashboard-year"
                    class="filter-select !h-12 !border-[#0f4c5c] !bg-white text-center text-lg font-bold text-[#123241] shadow-sm">
                </select>
            </section>

            {{-- Department / Section --}}
            <section>
                <h3 class="section-title mb-2 text-center text-xl">
                    Dept./Sect.
                </h3>

                <div class="filter-block">

                    {{-- All --}}
                    <label class="mb-3 flex cursor-pointer items-center gap-3 rounded-lg border border-[#cfe5ea] bg-[#eef7f9] px-3 py-2.5">
                        <input type="checkbox"
                            id="chk-dashboard-section-all"
                            value="ALL"
                            checked
                            class="!h-5 !w-5 cursor-pointer accent-blue-600">

                        <span class="text-base font-extrabold text-[#123241]">
                            All
                        </span>
                    </label>

                    {{-- Section List --}}
                    <div id="dashboard-section-list" class="grid grid-cols-2 gap-x-4 gap-y-3">
                        <label class="dashboard-section-item">
                            <input type="checkbox"
                                class="dashboard-section-checkbox"
                                value="060202"
                                data-display="STF"
                                checked>
                            <span>STF</span>
                        </label>

                        <label class="dashboard-section-item">
                            <input type="checkbox"
                                class="dashboard-section-checkbox"
                                value="060205"
                                data-display="STA"
                                checked>
                            <span>STA</span>
                        </label>

                        <label class="dashboard-section-item">
                            <input type="checkbox"
                                class="dashboard-section-checkbox"
                                value="060306"
                                data-display="TMA"
                                checked>
                            <span>TMA</span>
                        </label>

                        <label class="dashboard-section-item">
                            <input type="checkbox"
                                class="dashboard-section-checkbox"
                                value="060307"
                                data-display="MTF"
                                checked>
                            <span>MTF</span>
                        </label>

                        <label class="dashboard-section-item">
                            <input type="checkbox"
                                class="dashboard-section-checkbox"
                                value="060402"
                                data-display="M/P"
                                checked>
                            <span>M/P</span>
                        </label>

                        <label class="dashboard-section-item">
                            <input type="checkbox"
                                class="dashboard-section-checkbox"
                                value="060403"
                                data-display="CEC"
                                checked>
                            <span>CEC</span>
                        </label>

                        <label class="dashboard-section-item">
                            <input type="checkbox"
                                class="dashboard-section-checkbox"
                                value="060502"
                                data-display="ESP"
                                checked>
                            <span>ESP</span>
                        </label>

                        <label class="dashboard-section-item">
                            <input type="checkbox"
                                class="dashboard-section-checkbox"
                                value="060503"
                                data-display="ESA"
                                checked>
                            <span>ESA</span>
                        </label>

                        <label class="dashboard-section-item">
                            <input type="checkbox"
                                class="dashboard-section-checkbox"
                                value="060702"
                                data-display="ELC"
                                checked>
                            <span>ELC</span>
                        </label>

                        <label class="dashboard-section-item">
                            <input type="checkbox"
                                class="dashboard-section-checkbox"
                                value="060704"
                                data-display="EWC"
                                checked>
                            <span>EWC</span>
                        </label>

                        <label class="dashboard-section-item">
                            <input type="checkbox"
                                class="dashboard-section-checkbox"
                                value="060802"
                                data-display="PC"
                                checked>
                            <span>PC</span>
                        </label>

                        <label class="dashboard-section-item">
                            <input type="checkbox"
                                class="dashboard-section-checkbox"
                                value="060803"
                                data-display="PKC"
                                checked>
                            <span>PKC</span>
                        </label>
                    </div>
                </div>
            </section>

            {{-- ITEM / Factor / Cause ยังไม่ทำ --}}
            <div class="mt-5 space-y-3 rounded-xl border border-orange-200 bg-white/90 p-3 shadow-sm">
                <div>
                    <label class="mb-1.5 block text-sm font-extrabold uppercase tracking-wide text-slate-600">ITEM</label>
                    <select id="ddl-dashboard-item" class="filter-select">
                        <option value="ALL">All</option>
                    </select>
                </div>

                <div>
                    <label class="mb-1.5 block text-sm font-extrabold uppercase tracking-wide text-slate-600">
                        Factor
                    </label>

                    <select id="ddl-dashboard-factor" class="filter-select">
                        <option value="ALL">All</option>
                    </select>
                </div>

                <div>
                    <label class="mb-1.5 block text-sm font-extrabold uppercase tracking-wide text-slate-600">
                        Cause
                    </label>

                    <select id="ddl-dashboard-cause" class="filter-select">
                        <option value="ALL">All</option>
                    </select>
                </div>

            </div>
        </aside>

        {{-- ========================================================= --}}
        {{-- CENTER PANEL --}}
        {{-- ========================================================= --}}
        <main class="dashboard-panel flex flex-col gap-3 rounded-2xl border border-slate-200 bg-gradient-to-b from-[#eef7fa] to-[#e7f1f5] p-3 shadow-lg">

            <h2 class="section-title px-1 text-xl">
                MFG Acc. Daily report
            </h2>

            {{-- Daily Report Bar Chart --}}
            <section class="dashboard-card h-[168px]">
                <div class="panel-heading">
                    <h3 class="text-sm font-medium text-slate-800">
                        Number of Daily report
                    </h3>
                </div>

                <div id="chart-daily-report-section" class="h-[138px]">
                    <div class="chart-placeholder">
                        Number of Daily Report Chart
                    </div>
                </div>
            </section>

            {{-- Factor + Cause --}}
            <div class="grid h-[174px] grid-cols-2 gap-2">

                <section class="dashboard-card min-w-0">
                    <div class="panel-heading justify-between">
                        <h3 class="text-[11px] font-semibold uppercase text-slate-500">
                            Factor
                        </h3>

                        <span id="lbl-factor-sync-date"
                            class="text-[9px] text-slate-400">
                        </span>
                    </div>

                    <div id="chart-factor" class="h-[145px]">
                        <div class="chart-placeholder">
                            Factor Donut Chart
                        </div>
                    </div>
                </section>

                <section class="dashboard-card min-w-0">
                    <div class="panel-heading">
                        <h3 class="text-[11px] font-semibold uppercase text-slate-500">
                            Cause
                        </h3>
                    </div>

                    <div id="chart-cause" class="h-[145px]">
                        <div class="chart-placeholder">
                            Cause Treemap
                        </div>
                    </div>
                </section>
            </div>

            {{-- Department Summary Table --}}
            <section class="dashboard-card min-h-0 flex-1 p-2">
                <div class="h-full overflow-auto rounded-xl border border-slate-200">
                    <table class="w-full border-collapse text-xs">
                        <thead class="sticky top-0 z-10">
                            <tr>
                                <th class="border border-white px-2 py-2 text-left">
                                    Department
                                </th>
                                <th class="border border-white px-2 py-2 text-right">
                                    Assembly Mistake
                                </th>
                                <th class="border border-white px-2 py-2 text-right">
                                    Other
                                </th>
                                <th class="border border-white px-2 py-2 text-right">
                                    Wiring Mistake
                                </th>
                                <th class="border border-white px-2 py-2 text-right">
                                    Total
                                </th>
                            </tr>
                        </thead>

                        <tbody id="tbody-dashboard-department">
                            <tr>
                                <td colspan="5"
                                    class="px-3 py-12 text-center text-slate-400">
                                    No data
                                </td>
                            </tr>
                        </tbody>

                        <tfoot id="tfoot-dashboard-department"
                            class="font-bold text-slate-900">
                            <tr>
                                <td class="border-t border-slate-300 px-2 py-2">
                                    Total
                                </td>
                                <td class="border-t border-slate-300 px-2 py-2 text-right">0</td>
                                <td class="border-t border-slate-300 px-2 py-2 text-right">0</td>
                                <td class="border-t border-slate-300 px-2 py-2 text-right">0</td>
                                <td class="border-t border-slate-300 px-2 py-2 text-right">0</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </section>
        </main>

        {{-- ========================================================= --}}
        {{-- RIGHT PANEL --}}
        {{-- ========================================================= --}}
        <section class="dashboard-panel flex flex-col gap-3 rounded-2xl bg-gradient-to-b from-[#0f4c5c] to-[#123241] p-3 shadow-lg">

            {{-- Top Filters --}}
            <div class="dashboard-card flex h-[62px] items-center gap-2 px-3 py-2">

                <div class="w-[82px]">
                    <label class="block text-[9px] font-semibold text-slate-500">
                        Fiscal Year
                    </label>
                    <div id="lbl-dashboard-year"
                        class="flex h-8 items-center justify-center rounded-md bg-[#123241] text-xs font-bold text-white shadow-sm">
                        -
                    </div>
                </div>

                <div class="w-[92px]">
                    <label for="ddl-dashboard-month" class="block text-[9px] font-semibold text-slate-500">
                        Month
                    </label>

                    <select id="ddl-dashboard-month"
                        class="filter-select !h-8 !border-slate-200 text-xs">
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

                <div class="w-[92px]">
                    <label class="block truncate text-[9px] font-semibold text-slate-500">
                        Defect Factor
                    </label>

                    <select id="ddl-dashboard-right-factor" class="filter-select !h-8 !border-slate-200 text-xs">
                        <option value="ALL">All</option>
                    </select>
                </div>

                <div class="w-[92px]">
                    <label class="block truncate text-[9px] font-semibold text-slate-500">
                        Item
                    </label>

                    <select id="ddl-dashboard-right-item" class="filter-select !h-8 !border-slate-200 text-xs">
                        <option value="ALL">All</option>
                    </select>
                </div>

                <div class="w-[120px]">
                    <label class="block truncate text-[9px] font-semibold text-slate-500">
                        Dept. Sect
                    </label>

                    <select id="ddl-dashboard-right-section" class="filter-select !h-8 !border-slate-200 text-xs">
                        <option value="ALL">All</option>
                    </select>
                </div>

                <div class="ml-auto flex h-[39px] min-w-[155px] items-center justify-center border-2 border-red-600 px-3">
                    <span class="font-serif text-xl font-bold text-red-600">
                        CONFIDENTIAL
                    </span>
                </div>
            </div>

            {{-- Trend Chart --}}
            <section class="dashboard-card min-h-0 flex-[1.08]">
                <div class="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2">
                    <h3 class="flex-1 text-center text-xs font-semibold text-slate-700">
                        ELC &amp; EWC Trouble Trend
                    </h3>

                    <div class="grid w-[300px] grid-cols-2 gap-1">
                        <input type="date"
                            id="txt-dashboard-date-from"
                            class="!h-8 !border !border-slate-200 px-2 text-[10px]">

                        <input type="date"
                            id="txt-dashboard-date-to"
                            class="!h-8 !border !border-slate-200 px-2 text-[10px]">
                    </div>
                </div>

                <div id="chart-trouble-trend" class="h-[calc(100%-47px)] min-h-[245px]">
                    <div class="chart-placeholder">
                        ELC &amp; EWC Trouble Trend Chart
                    </div>
                </div>
            </section>

            {{-- Defect Ratio --}}
            <section class="dashboard-card min-h-0 flex-1">
                <div class="border-b border-slate-200 bg-slate-50 px-4 py-2">
                    <h3 class="text-center text-xs font-semibold text-slate-700">
                        Defect Ratio by Production unit
                    </h3>
                </div>

                <div id="chart-defect-ratio" class="h-[calc(100%-39px)] min-h-[250px]">
                    <div class="chart-placeholder">
                        Defect Ratio by Production Unit Chart
                    </div>
                </div>
            </section>
        </section>
    </div>
</div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/dashboard_edr.js?ver={{ $GLOBALS['version'] }}"></script>             
@endsection