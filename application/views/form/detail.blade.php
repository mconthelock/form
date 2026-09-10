@extends('layouts/template')

@section('contents')
    {{-- bg-gray-50 rounded-xl border border-gray-200  shadow-sm mb-5 --}}
    <div class="relative w-full h-[95vh] overflow-hidden">
        <div id="loading-indicator"
            class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm transition-opacity duration-500 ease-in-out opacity-100 rounded-xl shadow-sm border border-gray-200">
            <div class="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p class="mt-4 text-gray-500 font-medium animate-pulse">กำลังเตรียมฟอร์ม กรุณารอสักครู่...</p>
        </div>

        <iframe id="my-iframe" src="{{ $target }}"
            class="absolute inset-0 w-full h-full border-0 transition-opacity duration-700 ease-in-out opacity-0 bg-white"></iframe>

    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/form_detail.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
