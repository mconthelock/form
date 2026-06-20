@extends('layouts/webflowTemplate')

@section('styles')
<style>
    section {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    fieldset:not(:has(.fieldset-label)) {
        display: flex;
    }

    fieldset span {
        font-weight: bold;
        white-space: nowrap;
        width: fit-content;
    }

    label:not(:has(input[name="DELIVELY"])):not(:has(input[name="FORM_TYPE"])) {
        width: 100%;
    }

    span.required::after, h2.required::after {
        content: "**";
        color: red;
        font-weight: bold;
        padding-left: 0.25rem;
    }
    





</style>
@endsection
@section('contents')
<div class="hidden form-info" nfrmno="{{$NFRMNO}}" vorgno="{{$VORGNO}}" cyear="{{$CYEAR}}" mode="{{$mode}}"
    cyear2="{{$mode !=1 ? $CYEAR2 : '' }}" ></div>
<div class="hidden apv-data" empno="{{$empno}}"></div>
<div class="p-6 max-w-7xl mx-auto flex flex-col gap-6 min-w-[70vw]">
    
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-100 shadow-md rounded-lg p-6">
        <div>
            <h1 class="text-2xl font-bold text-base-content flex items-center gap-2">
               Fixed Asset Physical Checking Form
            </h1>
            <p class="text-sm text-base-content/60 mt-1">Upload data to generate and send the Fixed Asset Physical Checking form to the concerned personnel.</p>
        </div>
    </div>

    <div class="bg-base-100 shadow-md rounded-lg p-6">
        <form id="frmmain">
            <div class="max-w-2xl mx-auto py-8">
                
                <div class="form-control w-full">
                    <label class="label">
                        <span class="label-text text-base font-medium required">Browse File</span>
                    </label>
                    <input type="file" id="excelFile" accept=".xlsx" required class="file-input file-input-bordered file-input-primary w-full req" />
                    <label class="label">
                        <span class="label-text-alt text-base-content/60">Supports .xlsx files only.</span>
                    </label>
                </div>
                <div class="divider mt-8 mb-6"></div>
                <div class="flex flex-wrap justify-center gap-4">
                    <button type="button" id="btnCancel" class="btn btn-ghost px-6">
                        Cancel
                    </button>
                    
                    <button type="button" id="btnRequest" class="btn btn-primary px-6 gap-2">
                        Request
                    </button>
                </div>

            </div>
        </form>
    </div>

</div>
@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/create.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection