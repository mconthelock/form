@extends('layouts/template')

@section('contents')
    <div class="webform-theme relative w-full h-[95vh]" id="frame-container">
        <div id="loading-indicator"
            class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-base-100/95 backdrop-blur-sm transition-opacity duration-500 ease-in-out opacity-100 shadow-sm border border-base-300 border-t-4 border-t-primary">
            <div class="w-10 h-10 border-4 border-base-300 border-t-primary rounded-full animate-spin"></div>
            <p class="mt-4 text-xs font-semibold uppercase tracking-wider wf-mute animate-pulse">กำลังเตรียมฟอร์ม กรุณารอสักครู่...</p>
        </div>

        <iframe id="my-iframe" src="{{ $target }}"
            class="absolute inset-0 w-full h-screen border-0 transition-opacity duration-700 ease-in-out opacity-0 bg-transparent mb-8"></iframe>

    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/form_detail.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
