@extends('layouts/template')

@section('contents')
    <input type="text" id="id" value="{{ $id }}" class="hidden">
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
                        REPORT ACCESS CONTROL
                    </span>
                </div>
                <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-primary line-clamp-1" id="page-title">
                    Report Authentication
                </h1>
                <p class="text-sm wf-mute leading-relaxed" id="page-description">
                    Manage employee role permissions (ADM / OPR / USR) for this report.
                </p>
            </div>

            <div class="flex flex-wrap items-center gap-2 shrink-0">
                <a href="{{ base_url('admin/report') }}" class="btn btn-sm btn-outline btn-primary gap-1.5" type="button">
                    <i class="fi fi-br-arrow-small-left text-base"></i>
                    <span>Back</span>
                </a>
            </div>
        </div>

        {{-- Section 2: Precision Filter Strip --}}
        <section class="bg-base-100 shadow-sm border border-base-300 p-4">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div class="md:col-span-3" id="requirements-assignee-filter-wrap">
                    <label class="block text-[11px] font-bold uppercase tracking-wider wf-mute mb-1.5" for="table-search">
                        Search
                    </label>
                    <label class="input input-sm border border-base-300 bg-base-100 flex items-center gap-2 h-9.5 w-full">
                        <i class="fi fi-rr-search text-sm wf-mute shrink-0"></i>
                        <input id="table-search" type="text"
                            class="grow text-sm text-base-content placeholder:text-[#636363] outline-none border-none focus:outline-none"
                            placeholder="Search emp no., name..." />
                    </label>
                </div>

                <div class="md:col-span-3">
                    <label class="block text-[11px] font-bold uppercase tracking-wider wf-mute mb-1.5"
                        for="table-division-filter">
                        Division
                    </label>
                    <select id="table-division-filter"
                        class="select select-sm w-full h-9.5 bg-base-100 border border-base-300 text-sm s2">
                        <option value="">All</option>
                    </select>
                </div>

                <div class="md:col-span-3">
                    <label class="block text-[11px] font-bold uppercase tracking-wider wf-mute mb-1.5"
                        for="table-department-filter">
                        Department
                    </label>
                    <select id="table-department-filter"
                        class="select select-sm w-full h-9.5 bg-base-100 border border-base-300 text-sm s2">
                        <option value="">All</option>
                    </select>
                </div>

                <div class="md:col-span-2">
                    <label class="block text-[11px] font-bold uppercase tracking-wider wf-mute mb-1.5"
                        for="table-section-filter">
                        Section
                    </label>
                    <select id="table-section-filter"
                        class="select select-sm w-full h-9.5 bg-base-100 border border-base-300 text-sm s2">
                        <option value="">All</option>
                    </select>
                </div>

                <div class="md:col-span-1">
                    <button id="reset-filter"
                        class="btn btn-sm btn-primary w-full h-9.5 flex items-center justify-center gap-1"
                        title="Reset Filters" aria-label="Reset Filters" type="button">
                        <i class="fi fi-rr-rotate-left text-sm"></i>
                        <span class="md:hidden">Reset Filters</span>
                    </button>
                </div>
            </div>
        </section>

        {{-- Section 3: Authorization Table --}}
        <section class="bg-base-100 shadow-sm border border-base-300 overflow-hidden">
            <div class="px-4 py-2.5 bg-base-200 border-b border-base-300 flex items-center gap-2">
                <span class="w-1.5 h-4 bg-primary shrink-0"></span>
                <span class="font-bold uppercase tracking-wider text-xs text-primary">Employee Permissions</span>
            </div>
            <div class="overflow-x-auto tableArea">
                @include('layouts/datatable_load')
                <table id="table" class="table table-sm w-full border-collapse text-left text-xs"></table>
            </div>
        </section>
    </main>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/adminReport_Auth.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
