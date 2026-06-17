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
@section('contents')
<div class="p-6 max-w-7xl mx-auto flex flex-col gap-6 min-w-[70vw]">
    
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-100 shadow-md rounded-lg p-6">
        <div>
            <h1 class="text-2xl font-bold text-base-content flex items-center gap-2">Location Master Management
            </h1>
        </div>
        
        <div class="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
            <button type="button" onclick="handleImport()" class="btn btn-outline btn-success btn-sm md:btn-md gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 md:w-5 md:h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V3.75m0 12.75l-4.5-4.5m4.5 4.5l4.5-4.5M3 18.75h18" />
                </svg>
                <span>Import</span>
            </button>

            <button type="button"  class="btn btn-outline btn-info btn-sm md:btn-md gap-1 locmstexp">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 md:w-5 md:h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v12.75a18.75 18.75 0 0 0 2.25-2.25M12 3a18.75 18.75 0 0 1-2.25 2.25M12 3v12.75m-9 3h18" />
                </svg>
                <span>Export</span>
            </button>

            <button type="button" onclick="handleAdd()" class="btn btn-primary btn-sm md:btn-md gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 md:w-5 md:h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>ADD</span>
            </button>
        </div>
    </div>
    <div class="bg-base-100 shadow-md rounded-lg p-6">
        <div class="w-full">
            <table class="table !table-zebra"  id="tableLocMst" style="width:100%">
            </table>
        </div>
    </div>

</div>
@endsection

@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/locmst.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection