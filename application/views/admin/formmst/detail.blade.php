@extends('layouts/template')

@section('contents')
    <div class="space-y-3 mb-8 h-full">
        <div>
            <h1 class="text-3xl text-primary font-bold line-clamp-1" id="page-title">
                Form Master Management
            </h1>
            <div class="mt-2 max-w-3xl text-sm text-slate-500" id="page-description">
            </div>
        </div>
    </div>
    <section class="w-full flex gap-4 mb-3">
        <div class="flex-1 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm mb-6 h-full" id="form-info">
            @include('admin/formmst/_info')
            <div class="btn-container mt-5 flex gap-2"></div>
        </div>
        <div
            class="flex-none flex flex-col gap-2 w-1/3 bg-base-100 rounded-box shadow-md border border-slate-200 p-4 h-full">
            <div class="flex justify-between">
                <div class="">
                    <div class="font-black text-primary">Form Flow</div>
                    <div class="text-slate-500 text-xs">The flow of the form process</div>
                </div>
                <a href="#" class="btn btn-primary btn-circle add-flow" id="add-flow">+</a>
            </div>
            @include('admin/formmst/_flow')
        </div>
    </section>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/formmst_detail.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
