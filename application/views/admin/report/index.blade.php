@extends('layouts/template')

@section('contents')
    <div class="space-y-3 mb-8">
        <h1 class="text-3xl text-primary font-bold line-clamp-1" id="page-title">
            Report Master Management
        </h1>
        <div class="mt-2 max-w-3xl text-sm text-slate-500" id="page-description">
            {{-- <div class="skeleton h-8 w-120"></div> --}}
        </div>
    </div>

    <section
        class="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-end rounded-3xl border border-slate-200 bg-white p-5 shadow-sm mb-6">
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label class="form-control w-full" id="requirements-assignee-filter-wrap">
                <div class="label pb-2">
                    <span class="label-text text-xs font-semibold uppercase tracking-wide text-slate-500">Search</span>
                </div>
                <input id="table-search" type="text" class="input input-bordered w-full" placeholder="Search...">
            </label>
            <label class="form-control w-full">
                <div class="label pb-2">
                    <span class="label-text text-xs font-semibold uppercase tracking-wide text-slate-500">Owner</span>
                </div>
                <select id="table-owner-filter" class="select select-bordered w-full s2">
                    <option value="">All</option>
                </select>
            </label>
        </div>
        <div class="flex items-center gap-3">
            <button id="reset-filter" class="btn border-slate-300" type="button">Reset Filters</button>
            <a id="#" href="{{ $_ENV['APP_ENV'] }}/admin/report/detail/" class="btn btn-primary hidden"
                type="button"><i class="fi fi-ss-add text-xl"></i></i>Add
                Report</a>
            <button id="export" class="btn btn-primary btn-outline" type="button"><i
                    class="fi fi-rr-down-to-line text-xl me-1"></i>Export</button>
        </div>
    </section>

    <div class="flex gap-5 mb-5">
        <section class="rounded-xl flex-1 border border-slate-200 bg-white p-5 shadow-sm">
            <div class="overflow-hidden tableArea">
                @include('layouts/datatable_load')
                <table id="table" class="table table-zebra display text-sm"></table>
            </div>
        </section>

        <section class="rounded-xl flex-none w-120 border border-slate-200 bg-white p-5 shadow-sm"
            id="report-detail-section">
            @include('admin/report/detail')
        </section>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/adminReport.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
