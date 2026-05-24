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
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/formmst.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
