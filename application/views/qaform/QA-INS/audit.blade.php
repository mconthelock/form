@extends('layouts/webflowTemplate')

@section('contents')
<div class="hidden form-info" nfrmno="{{$NFRMNO}}" vorgno="{{$VORGNO}}" cyear="{{$CYEAR}}" cyear2="{{ $CYEAR2 }}" nrunno="{{ $NRUNNO }}" seq="{{ $seq }}" empno="{{$empno}}"></div>
<div class="flex flex-col gap-5">
    <div class="flex flex-col gap-5 p-5 bg-white rounded-[3px] shadow w-full h-full border-t-3 border-[#3c8dbc] relative">
        <u class="flex flex-col items-center mb-12">
            <span class="text-2xl font-bold">Quality Built In Line Audit Report</span>
            <span class="text-2xl font-bold">Strengthen Trouble Report After Shipment</span>
        </u>
        <div id="score"></div>
        <div id="auditReport"></div>
        <div id="action" class="flex gap-5"></div>
    </div>
</div>
@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/eSelfAudit.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection