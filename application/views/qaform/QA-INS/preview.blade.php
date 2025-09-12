@extends('layouts/webflowTemplate')

@section('contents')
<div class="secid" secId="{{$secId}}"></div>
<div class="flex flex-col gap-5">
    <div class="flex flex-col gap-5 p-5 bg-white rounded-[3px] shadow w-full h-full border-t-3 border-[#3c8dbc] relative">
        <u class="flex flex-col items-center mb-5">
            <span class="text-2xl font-bold">Quality Built In Line Audit Report</span>
            <span class="text-2xl font-bold">Strengthen Trouble Report After Shipment</span>
            <span class="text-2xl font-bold" id="revision" rev="{{$rev}}">Revision {{$revText}}</span>
        </u>
        <div id="score"></div>
        <div id="auditReport"></div>
    </div>
</div>
@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/eSelfPreview.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection