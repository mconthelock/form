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

        {{-- Section 2: Report Search, Department Report Cards & Recent Reports --}}
        <div class="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
            <div class="xl:col-span-9 flex flex-col gap-4">
                {{-- Precision Search Strip --}}
                <div class="bg-base-100 border border-base-300 shadow-sm p-4">
                    <label class="input input-sm border border-base-300 bg-base-100 flex items-center gap-2 h-9.5 w-full">
                        <i class="fi fi-rr-search text-sm wf-mute shrink-0"></i>
                        <input type="text" class="grow text-sm text-base-content placeholder:text-[#636363]"
                            placeholder="Search report name or department..." id="search-form" />
                        <button type="button" class="btn btn-ghost btn-xs clear-search-form" aria-label="Clear search">
                            <i class="fi fi-rr-cross-small text-base"></i>
                        </button>
                        <kbd class="kbd kbd-xs font-mono">Ctrl</kbd>
                        <kbd class="kbd kbd-xs font-mono">K</kbd>
                    </label>
                </div>

                {{-- Report Grid --}}
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start" id="list-report">
                    @for ($i = 0; $i < 4; $i++)
                        <div class="skeleton h-64 w-full"></div>
                    @endfor
                </div>
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
