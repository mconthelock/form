@extends('layouts/webflowTemplate')

@section('styles')
<style>
    /* #tableReport th, #tableReport td {
        border: 0.5px solid #000;
    }
    th{
        border-bottom: 1px solid #000 !important;
    } */
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
<input type="checkbox" id="scoreBoard" class="modal-toggle" />
<div class="modal" role="dialog">
  <div class="modal-box">
    <div class="flex flex-col gap-3">
        <h3><span class="font-bold text-lg">Item : </span><span id="itemNo"></span></h3>
        <h3><span class="font-bold text-lg">Name : </span><span id="fullName"></span></h3>
        <div id="tableScoreboard"></div>
    </div>
    <div class="modal-action">
      <label for="scoreBoard" class="btn btn-neutral">Close</label>
    </div>
  </div>
</div>
@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/eSelfAuthorizeReportList.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection