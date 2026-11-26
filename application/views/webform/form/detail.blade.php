@extends('layouts/template')

@section('contents')
    <main class="webform-theme w-full flex flex-col gap-3 pb-8">
        {{-- Compact Context Bar --}}
        <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-base-100 px-4 py-3 shadow-sm border border-base-300 border-t-4 border-t-primary">
            <div class="flex flex-wrap items-center gap-2 min-w-0">
                <span class="badge badge-primary font-mono text-[11px] uppercase tracking-wider font-bold shrink-0">
                    AMEC-WEBFLOW
                </span>
                @if (!empty($code))
                    <span
                        class="inline-block font-mono text-xs font-bold text-primary bg-primary/8 border border-primary/20 px-2 py-0.5 tabular-nums shrink-0">
                        {{ $code }}
                    </span>
                @endif
                <h1 class="text-sm md:text-base font-bold text-base-content truncate"
                    title="{{ !empty($name) ? $name : 'Electronic Form' }}">
                    {{ !empty($name) ? $name : 'Electronic Form' }}
                </h1>
            </div>

            <div class="flex flex-wrap items-center gap-2 shrink-0">
                <button type="button" id="btn-detail-back" data-fallback="{{ base_url('webform/form/create') }}"
                    class="btn btn-xs sm:btn-sm btn-outline btn-primary gap-1.5">
                    <i class="fi fi-br-arrow-small-left text-base"></i>
                    <span>Back</span>
                </button>
                <a href="{{ base_url('webform/form/index/1') }}"
                    class="btn btn-xs sm:btn-sm btn-outline border-base-300 gap-1.5">
                    <i class="fi fi-rr-list-check text-xs"></i>
                    <span>Waiting for Approve</span>
                </a>
                <a href="{{ $target }}" target="_blank" rel="noopener noreferrer"
                    class="btn btn-xs sm:btn-sm btn-ghost border border-base-300 gap-1.5" title="Open form in a new tab">
                    <i class="fi fi-rr-arrow-up-right-from-square text-xs"></i>
                    <span>Open in New Tab</span>
                </a>
            </div>
        </div>

        {{-- Iframe Container --}}
        <div id="frame-container"
            class="relative w-full h-[calc(100vh-160px)] min-h-125 bg-white border border-base-300 shadow-sm overflow-hidden">
            <div id="loading-indicator"
                class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-base-100/95 backdrop-blur-sm transition-opacity duration-500 ease-in-out opacity-100">
                <div class="w-10 h-10 border-4 border-base-300 border-t-primary rounded-full animate-spin"></div>
                <p class="mt-4 text-xs font-semibold uppercase tracking-wider wf-mute animate-pulse">
                    กำลังเตรียมฟอร์ม กรุณารอสักครู่...
                </p>
            </div>

            <iframe id="my-iframe" data-src="{{ $target }}"
                class="w-full h-full border-0 transition-opacity duration-500 ease-in-out opacity-0 bg-white"></iframe>
        </div>
    </main>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/form_detail.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
