@extends('layouts/template')

@section('contents')
    <input type="text" id="status" value="{{ $id }}" class="hidden" />
    <div class="space-y-3 mb-8">
        <div>
            <h1 class="text-3xl text-primary font-bold line-clamp-1" id="page-title">
                <div class="skeleton h-12 w-96"></div>
            </h1>
            <div class="mt-2 max-w-3xl text-sm text-slate-500" id="page-description">
                <div class="skeleton h-8 w-120"></div>
            </div>
        </div>
        <section
            class="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-end rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
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
                <label class="form-control w-full">
                    <div class="label pb-2">
                        <span
                            class="label-text text-xs font-semibold uppercase tracking-wide text-slate-500">Developer</span>
                    </div>
                    <select id="table-dev-filter" class="select select-bordered w-full">
                        <option value="">All</option>
                    </select>
                </label>
            </div>
            <div class="flex items-center gap-3">
                <button id="reset-filter" class="btn bordered-base-300" type="button">Reset Filters</button>
                <button id="export-excel" class="btn btn-outline btn-primary" type="button">Export</button>
            </div>
        </section>
    </div>
    <div class="space-y-6 mb-6">
        <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="overflow-hidden tableArea">
                @include('layouts/datatable_load')
                <table id="table" class="table table-zebra display text-xs"></table>
                <p class="text-xs text-gray-600 mt-3">* Running days are the number of days counted from the date the
                    previous
                    person approved
                    the
                    form.</p>
            </div>
        </section>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/form.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
