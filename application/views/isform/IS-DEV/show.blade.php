@extends('layouts/webflowTemplate')

@section('contents')
    <main class="webform-theme webform-view flex flex-col gap-4 pb-8 text-base" id="form-data">
        <input type="hidden" id="req-roi-years" value="1" />
        @include('layouts/form-header')
        @include('layouts/form-header-info')

        {{-- Section 01: Request Detail --}}
        <section class="bg-gray-200 border border-gray-300">
            @include('isform/IS-DEV/show/request-detail')
        </section>

        {{-- Section 02: Expected Outcome --}}
        <section class="bg-gray-200 border border-gray-300 form-roi">
            @include('isform/IS-DEV/show/expected-outcome')
        </section>

        {{-- Section 03: Efficiency Gains --}}
        <section class="bg-gray-200 border border-gray-300 form-roi">
            @include('isform/IS-DEV/create/efficiency-gains', ['view' => true])
        </section>

        {{-- Section 04: Investment in Equipment --}}
        <section class="bg-gray-200 border border-gray-300 form-roi">
            @include('isform/IS-DEV/create/investment', ['view' => true])
        </section>


        {{-- ROI Summary --}}
        @include('isform/IS-DEV/roi')

        {{-- Form Action Bar (View / Print Only) --}}
        @include('layouts/form-action')
        @include('layouts/form-flow')
    </main>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/devFormView.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
