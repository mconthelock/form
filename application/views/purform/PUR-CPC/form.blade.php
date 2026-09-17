@extends('layouts/webflowTemplate')

@section('styles')
<style>
</style>
@endsection

@section('contents')
{{-- <div class="hidden form-info" nfrmno="{{$NFRMNO}}" vorgno="{{$VORGNO}}" cyear="{{$CYEAR}}" mode="{{$mode}}"
    cyear2="{{$mode !=1 ? $CYEAR2 : '' }}" nrunno="{{$mode !=1 ? $NRUNNO : '' }}" return="{{$return ?? ''}}"></div> --}}
{{-- <div class="hidden apv-data" empno="{{$empno}}"></div> --}}
<div class="min-h-[calc(100vh-3rem)] p-4 md:p-6 lg:p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">

    <div class="grid grid-cols-[auto_1fr] gap-5">
        {{-- profile --}}
        <div class="flex flex-col gap-5">
            <div id="inputer-card-container" class="min-w-82 max-w-96"></div>
            <div id="requester-card-container" class="min-w-82 max-w-96"></div>
        </div>

        {{-- main content --}}
        <div class="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 shadow-lg backdrop-blur-sm">
            <div class="bg-gradient-to-r from-slate-50 to-slate-100 px-5 py-4 border-b border-slate-200">
                <div class="flex items-center gap-2">
                    <i class="fi fi-rr-code-compare text-lg text-slate-600"></i>
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
                    <button class="btn btn-neutral p-5 text-lg next-step hidden" id="draft-step" mode="draft">Draft</button>

                </div>
                {{-- Content for step 2 goes here --}}
                <div data-step-panel class="hidden gap-5">
                    <table class="table table-zebra" id="table-draft"></table>
                    {{-- <div class="flex justify-center gap-3">
                        <button type="button" class="btn previous-step">Back</button>
                        <button type="button" class="btn next-step">Next</button>
                    </div> --}}
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
                        <div id="price-cond"></div>
                    </fieldset>
                    {{-- <div class="flex justify-center gap-3">
                        <button type="button" class="btn previous-step">Back</button>
                        <button type="button" class="btn next-step">Next</button>
                    </div> --}}
                </form>

                {{-- Content for step 4 goes here --}}
                <div data-step-panel class="hidden flex flex-col gap-3">
                    <table id="table-create-price" class="table table-zebra table-sm"></table>
                    {{-- <div class="flex justify-center gap-3 mt-5">
                        <button type="button" class="btn previous-step">Back</button>
                        <button type="button" class="btn next-step">Next</button>
                    </div> --}}
                </div>

                {{-- Content for step 5 goes here --}}
                <div data-step-panel class="hidden">
                    <div class="flex gap-5">
                        <!-- Upload Area -->
                        <div class="flex items-center gap-4 p-4 rounded-xl bg-base-200/50 border border-base-300">
                            <div class="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                                <i class="fi fi-sr-file-excel text-2xl text-primary"></i>
                            </div>

                            <div class="flex-1 min-w-0">
                                <div class="font-semibold">
                                    Excel File
                                </div>

                                <div id="selected-file-name" class="flex gap-2 text-sm text-base-content/60 truncate">
                                    Please select an Excel file
                                </div>
                            </div>

                            <label for="excel-file" class="btn btn-outline btn-sm cursor-pointer">
                                <i class="fi fi-sr-folder-open"></i>
                                Choose File
                            </label>

                            <input type="file" id="excel-file" class="hidden" accept=".xlsx,.xls" />

                        </div>

                        <!-- Actions -->
                        <div class="flex justify-end gap-3">

                            <button id="upload-excel" class="btn btn-primary" type="button">
                                <i class="fi fi-sr-file-upload text-lg"></i>
                                <span>Import & Map</span>
                            </button>

                        </div>
                    </div>
                    <table id="table-price-comparison" class="table table-zebra table-sm"></table>
                </div>
                <div class="flex justify-center gap-3" id="step-navigation">
                    <button type="button" class="hidden btn" id="previous-step">Back</button>
                    <button type="button" class="hidden btn" id="next-step">Next</button>
                    <button type="button" class="hidden btn btn-neutral" id="save-draft">Save Draft</button>
                    <button type="button" class="hidden btn btn-primary" id="submit-form">Submit</button>
                </div>
            </div>
        </div>

    </div>

</div>

@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/purCpc.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection