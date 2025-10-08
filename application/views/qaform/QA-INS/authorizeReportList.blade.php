@extends('layouts/webflowTemplate')

@section('styles')
<style>
    #tableReport th:not(.no-border), #tableReport td {
        white-space: nowrap;
        text-align: center;
        vertical-align: start;
        border: 1px solid #000;
    }
    th{
        border-bottom: 1px solid #000 !important;
    }
</style>
@endsection

@section('contents')
<div class="userid" userid="{{$userId}}"></div>
<div class="flex flex-col gap-5">
    <div class="p-5 bg-white rounded-[3px] shadow w-full h-full border-t-3 border-[#3c8dbc]">
        <div class="text-2xl font-bold text-primary mb-3">Section</div>
        <div id="selectSection"></div>
    </div>
    <div class="p-5 bg-white rounded-[3px] shadow w-full h-full border-t-3 border-[#3c8dbc]" id="reportList">
    </div>
</div>
@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/eSelfAuthorizeReportList.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection