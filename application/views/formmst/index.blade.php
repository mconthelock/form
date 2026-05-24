@extends('layouts/template')

@section('contents')
    <div class="space-y-3 mb-8">
        <div>
            <h1 class="text-3xl text-primary font-bold line-clamp-1" id="page-title">
                Form Master Management
            </h1>
            <div class="mt-2 max-w-3xl text-sm text-slate-500" id="page-description">
                {{-- <div class="skeleton h-8 w-120"></div> --}}
            </div>
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
            <button id="reset-filter" class="btn btn-ghost" type="button">Reset Filters</button>
            <button id="addform" class="btn btn-primary" type="button"><i class="fi fi-ss-add text-xl"></i></i>Add
                Form</button>
            <button id="export" class="btn btn-primary text-slate-200" type="button"><i
                    class="fi fi-rr-down-to-line text-xl me-1"></i>Export</button>
        </div>
    </section>

    <div class="space-y-6">
        <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="overflow-hidden tableArea">
                @include('layouts/datatable_load')
                <table id="table" class="table table-zebra display text-sm"></table>
            </div>
        </section>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/formmst.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
