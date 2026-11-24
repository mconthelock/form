@extends('layouts/template')

@section('contents')
    <main class="webform-theme w-full flex flex-col gap-4 pb-12">
        {{-- Section 1: Standard Page Header Component --}}
        <div
            class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 bg-base-100 p-5 md:p-6 shadow-sm border border-base-300 border-t-4 border-t-primary">
            <div class="space-y-1.5 max-w-3xl">
                <div class="flex items-center gap-2">
                    <span class="badge badge-primary font-mono text-[11px] uppercase tracking-wider font-bold">
                        AMEC-WEBFLOW
                    </span>
                    <span class="badge badge-xs badge-outline font-mono font-bold uppercase">
                        REPORT CENTER
                    </span>
                </div>
                <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-primary line-clamp-1" id="page-title">
                    Electronic Form Report
                </h1>
                <p class="text-sm wf-mute leading-relaxed" id="page-description">
                    Select a department to view the electronic form reports.
                </p>
            </div>
        </div>

        {{-- Section 2: Report Search, DataTable & Recent Reports --}}
        <div class="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
            <div class="xl:col-span-9 flex flex-col gap-4">
                {{-- Precision Filter Strip --}}
                <section class="bg-base-100 shadow-sm border border-base-300 p-4">
                    <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                        <div class="md:col-span-7">
                            <label class="block text-[11px] font-bold uppercase tracking-wider wf-mute mb-1.5"
                                for="search-form">
                                Search
                            </label>
                            <label
                                class="input input-sm border border-base-300 bg-base-100 flex items-center gap-2 h-9.5 w-full">
                                <i class="fi fi-rr-search text-sm wf-mute shrink-0"></i>
                                <input type="text"
                                    class="grow text-sm text-base-content placeholder:text-[#636363] outline-none border-none focus:outline-none"
                                    placeholder="Search report name or department..." id="search-form" autocomplete="off" />
                                <button type="button" class="btn btn-ghost btn-xs clear-search-form"
                                    aria-label="Clear search">
                                    <i class="fi fi-rr-cross-small text-base"></i>
                                </button>
                                <kbd class="kbd kbd-xs font-mono hidden sm:inline-flex">Ctrl</kbd>
                                <kbd class="kbd kbd-xs font-mono hidden sm:inline-flex">K</kbd>
                            </label>
                        </div>
                        <div class="md:col-span-4">
                            <label class="block text-[11px] font-bold uppercase tracking-wider wf-mute mb-1.5"
                                for="dept-filter">
                                Department
                            </label>
                            <select id="dept-filter"
                                class="select select-sm w-full h-9.5 bg-base-100 border border-base-300 text-sm s2">
                                <option value="">All Departments</option>
                            </select>
                        </div>
                        <div class="md:col-span-1">
                            <button id="reset-filter"
                                class="btn btn-sm btn-primary w-full h-9.5 flex items-center justify-center gap-1"
                                title="Reset Filters" aria-label="Reset Filters" type="button">
                                <i class="fi fi-rr-rotate-left text-sm"></i>
                                <span class="md:hidden">Reset</span>
                            </button>
                        </div>
                    </div>
                </section>

                {{-- Report Directory DataTable --}}
                <section class="bg-base-100 shadow-sm border border-base-300 overflow-hidden">
                    <div
                        class="px-4 py-2.5 bg-base-100 border-b border-base-200 flex flex-wrap items-center justify-between gap-2 text-xs wf-mute">
                        <div class="flex items-center gap-2">
                            <span class="inline-block w-2 h-2 rounded-full bg-primary"></span>
                            <span class="font-semibold uppercase tracking-wider text-[11px] text-primary">
                                Available Reports
                            </span>
                        </div>
                        <span class="badge badge-xs badge-outline font-mono font-bold" id="report-count-badge">0
                            REPORTS</span>
                    </div>
                    <div class="overflow-x-auto tableArea">
                        @include('layouts/datatable_load')
                        <table id="table" class="table table-sm w-full border-collapse text-left text-xs"></table>
                    </div>
                </section>
            </div>

            <aside class="xl:col-span-3 bg-base-100 border border-base-300 border-t-4 border-t-primary shadow-sm">
                <div class="p-4" id="recent-report-forms">
                    <div class="border-b border-base-200 pb-2.5 mb-3">
                        <h2 class="text-xs font-bold uppercase tracking-wider text-primary">Recent Created Forms</h2>
                    </div>
                    <p class="text-xs wf-mute">Select a report from the list to view.</p>
                </div>
            </aside>
        </div>
    </main>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/form_report.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
