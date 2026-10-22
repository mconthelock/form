@extends('layouts/webflowTemplate')

@section('styles')
<style>
    td:not(:last-child),
    th:not(:last-child) {
        border-right-color: color-mix(in oklab, var(--color-base-300), #00000036);
        border-right-width: 1px;
    }

    th {
        text-align: center !important;
        vertical-align: top !important;
    }
</style>
@endsection

@section('contents')
<div class="min-h-[calc(100vh-3rem)] p-4 md:p-6 lg:p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">

    <div class="grid grid-cols-[auto_1fr] gap-5">
        {{-- profile --}}
        <div class="flex flex-col gap-5 sticky top-20 self-start">
            <div id="inputer-card-container" class="min-w-82 max-w-96"></div>
            <div id="requester-card-container" class="min-w-82 max-w-96"></div>
            <div id="detail-step-container"></div>
        </div>

        {{-- main content --}}
        <div class="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 shadow-lg backdrop-blur-sm">
            <div class="bg-gradient-to-r from-slate-50 to-slate-100 px-5 py-4 border-b border-slate-200">
                <div class="flex items-center gap-2">
                    <i class="fi fi-sr-scale-comparison-alt text-lg text-slate-600"></i>
                    <h2 class="text-base font-bold text-slate-800">Price Comparison</h2>
                </div>
            </div>
            <div class="flex flex-col gap-5 p-6">
                <table id="table-comparison" class="table table-zebra table-sm"></table>
                <div id="webform-submit" class="hidden"></div>
            </div>
        </div>

    </div>

</div>

@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/purCpcView.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection