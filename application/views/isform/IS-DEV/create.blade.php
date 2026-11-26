@extends('layouts/webflowTemplate')

@section('contents')
    <form action="" id="form-is-dev">
        <input type="text" class="hidden" id="MODE" value="{{ $mode ?? 1 }}" />
        <input type="text" class="hidden" value="{{ $CATEGORY }}" data-map="CATEGORY" />
        <input type="text" class="hidden" value="{{ $PLANYEAR }}" data-map="PLANYEAR" />
        <input type="text" class="hidden" id="STATUS" value="1" data-map="STATUS" />

        <main class="webform-theme flex flex-col gap-4 pb-8 text-base">
            @include('layouts/form-header')
            @include('layouts/form-header-info')

            {{-- Section 01: Request Detail --}}
            <section class="bg-gray-200 border border-gray-300">
                @include('isform/IS-DEV/create/request-detail')
            </section>

            {{-- Section 02: Expected Outcome --}}
            <section class="bg-gray-200 border border-gray-300 form-roi">
                @include('isform/IS-DEV/create/expected-outcome')
            </section>

            {{-- Section 03: Efficiency Gains --}}
            <section class="bg-gray-200 border border-gray-300 form-roi">
                @include('isform/IS-DEV/create/efficiency-gains')
            </section>

            {{-- Section 04: Investment in Equipment --}}
            <section class="bg-gray-200 border border-gray-300 form-roi">
                @include('isform/IS-DEV/create/investment')
            </section>

            {{-- ROI Summary --}}
            @include('isform/IS-DEV/roi')

            {{-- Form Action Bar --}}
            @include('layouts/form-action')
        </main>
    </form>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/devForm.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
