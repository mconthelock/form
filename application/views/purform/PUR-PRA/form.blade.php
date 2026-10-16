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

    label:has(input:disabled) {
        cursor: not-allowed;
    }

    .block-container {
        border: 1px solid var(--color-base-300);
        border-radius: 1rem;
        /* overflow: hidden; */
        padding: 1.25rem;
    }

    .block-container .block-title {
        font-weight: bold;
        font-size: small;
        margin-bottom: 0.5rem;
    }

    .block-container .block-icon {
        width: 4rem;
        height: 4rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: calc(infinity * 1px);
    }

    .block-detail span {
        padding: 0.5rem;
        border-bottom: 1px solid var(--color-base-300);
    }

    .block-detail> :nth-child(2n) {
        padding-left: 0.5rem;
        /* overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap; */
    }

    .block-detail> :nth-child(2n+1) {
        font-weight: bold;
        background-color: var(--color-slate-50);
        border-right: 1px solid var(--color-base-300);
    }
</style>
@endsection

@section('contents')
<div class="min-h-[calc(100vh-3rem)] p-4 md:p-6 lg:p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <div id="create-form" class="flex justify-center w-full hidden">
        @include('purform/PUR-PRA/create')
    </div>
    <div id="view-form" class="flex justify-center w-full hidden">
        @include('purform/PUR-PRA/view')
    </div>
</div>

<template>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-4">
        <div class="grid grid-cols-[max-content_auto_auto] gap-5 col-span-2 w-full">
            <fieldset class="fieldset" id="request-form-no">
                <legend class="fieldset-legend">Request form no.</legend>
                <span class="text-xl font-bold" id="req-form"></span>
            </fieldset>
            {{-- Inputer --}}
            <fieldset class="fieldset ml-10" id="inputer-fieldset">
            </fieldset>
            {{-- Requester --}}
            <fieldset class="fieldset" id="requester-fieldset">
            </fieldset>
        </div>
        <fieldset class="fieldset col-span-2">
            <legend class="fieldset-legend">Refer Price compare</legend>
            <table id="table-comparison" class="table table-zebra table-sm">
            </table>
            <div id="price-compare-container">
            </div>
        </fieldset>
    </div>
</template>

@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/purPra.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection