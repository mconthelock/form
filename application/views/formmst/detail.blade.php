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
    <section class="w-full flex gap-4">
        <div class="flex-1 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm mb-6" id="form-info">
            @include('formmst/_info')
            <div class="btn-container mt-5 flex gap-5"></div>
        </div>
        <div class="flex-none w-1/3">
            @include('formmst/_flow')
        </div>
    </section>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/formmst_detail.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
