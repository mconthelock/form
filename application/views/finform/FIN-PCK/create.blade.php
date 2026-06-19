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
<div class="p-6 max-w-7xl mx-auto flex flex-col gap-6 min-w-[70vw]">
    
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-100 shadow-md rounded-lg p-6">
        <div>
            <h1 class="text-2xl font-bold text-base-content flex items-center gap-2">
               FIXED ASSET PHYSICAL CHECKING FORM
            </h1>
            <p class="text-sm text-base-content/60 mt-1">Upload data to generate and send the Fixed Asset Physical Checking form to the concerned personnel.</p>
        </div>
    </div>

    <div class="bg-base-100 shadow-md rounded-lg p-6">
        <form id="formDataProcess">
            <div class="max-w-2xl mx-auto py-8">
                
                <div class="form-control w-full">
                    <label class="label">
                        <span class="label-text text-base font-medium required">เลือกไฟล์ข้อมูล (Browse File)</span>
                    </label>
                    <input type="file" id="processFile" accept=".xlsx" required class="file-input file-input-bordered file-input-primary w-full req" />
                    <label class="label">
                        <span class="label-text-alt text-base-content/60">รองรับไฟล์นามสกุล .xlsx เท่านั้น</span>
                    </label>
                </div>

                <div class="divider mt-8 mb-6"></div>

                <div class="flex flex-col sm:flex-row justify-center gap-4">
                    <button type="button" id="btnCancelProcess" class="btn btn-ghost w-full sm:w-32">
                        Cancel
                    </button>
                    <button type="button" id="btnProcessData" class="btn btn-primary w-full sm:w-48 gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                        </svg>
                        Process Data
                    </button>
                </div>

            </div>
        </form>
    </div>

</div>
@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/locmst.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection