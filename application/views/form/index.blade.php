@extends('layouts/template')

@section('contents')
    <input type="text" id="status" value="{{ $id }}" class="hidden" />
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
                        DOCUMENT WORKFLOW
                    </span>
                </div>
                <h1 class="text-2xl md:text-3xl font-black tracking-tight text-primary line-clamp-1 uppercase"
                    id="page-title">
                    <div class="skeleton h-9 w-80"></div>
                </h1>
                <div class="text-sm wf-mute leading-relaxed" id="page-description">
                    <div class="skeleton h-5 w-96"></div>
                </div>
            </div>

            <div class="flex flex-wrap items-center gap-2 shrink-0">
                <button id="export-excel" class="btn btn-sm btn-outline btn-primary gap-1.5" type="button">
                    <i class="fi fi-rr-download text-sm"></i>
                    <span>Export</span>
                </button>
            </div>
        </div>

        {{-- Section 2: Precision Filter Strip --}}
        <section class="bg-base-100 shadow-sm border border-base-300 p-4">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div class="{{ $id == 6 ? 'md:col-span-6' : 'md:col-span-4' }}" id="requirements-assignee-filter-wrap">
                    <label class="block text-[11px] font-bold uppercase tracking-wider wf-mute mb-1.5" for="table-search">
                        Search
                    </label>
                    <label class="input input-sm border border-base-300 bg-base-100 flex items-center gap-2 h-9.5 w-full">
                        <i class="fi fi-rr-search text-sm wf-mute shrink-0"></i>
                        <input id="table-search" type="text"
                            class="grow text-sm text-base-content placeholder:text-[#636363] outline-none border-none focus:outline-none"
                            placeholder="Search form no., detail, requester..." autocomplete="off" />
                        <button type="button" class="btn btn-ghost btn-xs clear-table-search" aria-label="Clear search">
                            <i class="fi fi-rr-cross-small text-base"></i>
                        </button>
                    </label>
                </div>
                <div class="md:col-span-3">
                    <label class="block text-[11px] font-bold uppercase tracking-wider wf-mute mb-1.5"
                        for="table-form-filter">
                        Form Type
                    </label>
                    <select id="table-form-filter"
                        class="select select-sm w-full h-9.5 bg-base-100 border border-base-300 text-sm s2">
                        <option value="">All Forms</option>
                    </select>
                </div>
                <div class="md:col-span-2">
                    <label class="block text-[11px] font-bold uppercase tracking-wider wf-mute mb-1.5"
                        for="table-status-filter">
                        Status
                    </label>
                    <select id="table-status-filter"
                        class="select select-sm w-full h-9.5 bg-base-100 border border-base-300 text-sm s2">
                        <option value="">All Status</option>
                    </select>
                </div>
                @if ($id != 6)
                    <div class="md:col-span-2">
                        <label class="block text-[11px] font-bold uppercase tracking-wider wf-mute mb-1.5"
                            for="table-aging-filter">
                            Running Days
                        </label>
                        <select id="table-aging-filter"
                            class="select select-sm w-full h-9.5 bg-base-100 border border-base-300 text-sm s2">
                            <option value="">All Days</option>
                            <option value="lt7">&lt; 7 days</option>
                            <option value="7to14">7 – 14 days</option>
                            <option value="15to29">15 – 29 days</option>
                            <option value="gte30">30+ days (Overdue)</option>
                        </select>
                    </div>
                @endif
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

        {{-- Section 3: Enterprise Document Data Table --}}
        <section class="bg-base-100 shadow-sm border border-base-300 overflow-hidden">
            <div
                class="px-4 py-2.5 bg-base-100 border-b border-base-200 flex flex-wrap items-center justify-between gap-2 text-xs wf-mute">
                <div class="flex items-center gap-2">
                    <span class="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    <span>Electronic Workflow Records</span>
                </div>
                <div class="text-[11px] wf-mute">
                    * Running days are counted from the date the previous person approved the form.
                </div>
            </div>
            <div class="overflow-x-auto tableArea">
                @include('layouts/datatable_load')
                <table id="table" class="table table-sm w-full border-collapse text-left text-xs"></table>
            </div>
        </section>
    </main>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/form.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
