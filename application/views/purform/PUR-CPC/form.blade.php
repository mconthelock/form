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

    label:has(input:disabled){
        cursor: not-allowed;
    }
</style>
@endsection

@section('contents')
{{-- <div class="hidden form-info" nfrmno="{{$NFRMNO}}" vorgno="{{$VORGNO}}" cyear="{{$CYEAR}}" mode="{{$mode}}"
    cyear2="{{$mode !=1 ? $CYEAR2 : '' }}" nrunno="{{$mode !=1 ? $NRUNNO : '' }}" return="{{$return ?? ''}}"></div> --}}
{{-- <div class="hidden apv-data" empno="{{$empno}}"></div> --}}
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

                {{-- Steps for the price comparison process --}}
                <div class="w-full flex justify-center p-6">
                    <div id="price-comparison-steps"></div>
                </div>
                <div class="divider"></div>
                {{-- Content for step 1 goes here --}}
                <div data-step-panel class="flex justify-center gap-5">
                    <button class="btn btn-primary p-5 text-lg next-step hidden" id="new-step" mode="new">New</button>
                    <button class="btn btn-neutral p-5 text-lg next-step hidden" id="draft-step"
                        mode="draft">Draft</button>

                </div>
                {{-- Content for step 2 goes here --}}
                <div data-step-panel class="hidden gap-5">
                    <table class="table table-zebra" id="table-draft"></table>
                </div>

                {{-- Content for step 3 goes here --}}
                <form href="#" data-step-panel class="hidden flex flex-col gap-3" id="step-requester">
                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">Requester</legend>
                        <input type="text" name="requester" placeholder="Enter requester" class="input w-64 mb-4 req"
                            data-message="Please enter requester" maxlength="5">
                    </fieldset>
                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">Function</legend>
                        <div id="price-cond" class="flex flex-col gap-2"></div>
                    </fieldset>
                </form>

                {{-- Content for step 4 goes here --}}
                <form href="#" data-step-panel class="hidden flex flex-col gap-3" id="step-vendor">
                    <section class="flex gap-10 rounded-xl border border-slate-200 p-4">
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend">Vendor</legend>
                            <select id="filter-vendor" class="select w-96 req" placeholder="Select vendor" data-message="Please select Vendor"></select>
                        </fieldset>
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend">Mode</legend>
                            <div class="flex gap-5">
                                <label class="label">
                                    <input type="radio" name="compare-mode" value="A" class="radio req"
                                        data-message="Please enter mode">
                                    Add
                                </label>
                                <label class="label">
                                    <input type="radio" name="compare-mode" value="E" class="radio req"
                                        data-message="Please enter mode">
                                    Edit
                                </label>
                            </div>
                        </fieldset>
                    </section>
                    <table id="table-create-price" class="table table-zebra table-sm"></table>
                </form>

                {{-- Content for step 5 goes here --}}
                <div data-step-panel class="hidden flex flex-col gap-5">
                    <div id="import-excel-container"></div>
                    <table id="table-comparison" class="table table-zebra table-sm">
                    </table>
                </div>
                <div id="webform-submit" class="hidden"></div>
                <div class="flex justify-between gap-3" id="step-navigation">
                    <button type="button" class="hidden btn" id="previous-step"><i class="fi fi-rr-angle-circle-left"></i>Back</button>
                    <button type="button" class="hidden btn" id="next-step">Next<i class="fi fi-rr-angle-circle-right"></i></button>
                </div>
            </div>
        </div>

    </div>

</div>

@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/purCpc.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection