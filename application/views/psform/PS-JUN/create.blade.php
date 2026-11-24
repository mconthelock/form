@extends('layouts/webflowTemplate')

@section('contents')
    <main class="flex flex-col gap-4">
        @include('layouts/form-header')
        @include('layouts/form-header-info')

        <section class="webform-theme bg-base-100 shadow-sm border border-base-300 overflow-hidden">
            <div
                class="px-4 py-2.5 bg-base-100 border-b border-base-200 flex flex-wrap items-center justify-between gap-2 text-xs wf-mute">
                <div class="flex items-center gap-2">
                    <span class="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    <span>AMEC Manufacturing Master Schedule For Production</span>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                    <label class="input input-sm border border-base-300 bg-base-100 flex items-center gap-2 h-8 w-56">
                        <i class="fi fi-rr-search text-xs wf-mute shrink-0"></i>
                        <input id="table-search" type="text"
                            class="grow text-xs text-base-content placeholder:text-[#636363] outline-none border-none focus:outline-none"
                            placeholder="Search schedule..." autocomplete="off" />
                        <button type="button" class="btn btn-ghost btn-xs clear-table-search" aria-label="Clear search">
                            <i class="fi fi-rr-cross-small text-base"></i>
                        </button>
                    </label>
                    <button class="btn btn-sm btn-outline btn-primary gap-1.5" id="export-button" type="button">
                        <i class="fi fi-rr-download text-sm"></i>
                        <span>Export</span>
                    </button>
                </div>
            </div>
            <div class="overflow-x-auto tableArea">
                @include('layouts/datatable_load')
                <table id="table" class="table table-sm w-full border-collapse text-left text-xs">
                    <thead>
                        <tr>
                            <th rowspan="2" class="hidden"></th>
                            <th rowspan="2" class="border border-slate-200 text-center!">Prod.</th>
                            <th rowspan="2" class="border border-slate-200 text-center!">Work Days</th>
                            <th rowspan="2" class="border border-slate-200 text-center!">Setup Prod.</th>
                            <th rowspan="2" class="border border-slate-200 text-center!">P.</th>
                            <th rowspan="2" class="border border-slate-200 text-center!">BM Date</th>
                            <th rowspan="2" class="border border-slate-200 text-center!">NC Program</th>
                            <th colspan="2" class="border border-slate-200 text-center!">Feeder 1</th>
                            <th colspan="2" class="border border-slate-200 text-center!">Feeder 2</th>
                            <th colspan="2" class="border border-slate-200 text-center!">Sub Assy</th>
                            <th rowspan="2" class="border border-slate-200 text-center!">Paint</th>
                            <th rowspan="2" class="border border-slate-200 text-center!">Assy</th>
                            <th rowspan="2" class="border border-slate-200 text-center!">Inspection</th>
                            <th rowspan="2" class="border border-slate-200 text-center!">Packing</th>
                        </tr>
                        <tr>
                            @for ($i = 0; $i < 3; $i++)
                                <th class="border border-slate-200 text-center!">Start</th>
                                <th class="border border-slate-200 text-center!">Finish</th>
                            @endfor
                        </tr>
                    </thead>
                </table>
            </div>
        </section>

        @include('layouts/form-action')
        @include('layouts/form-flow')
    </main>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/psMasterSchedule.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
