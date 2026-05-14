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
