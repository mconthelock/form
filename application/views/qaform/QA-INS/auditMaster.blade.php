@extends('layouts/webflowTemplate')

@section('contents')
<div class="userid" userId="{{$userId}}"></div>
<div class="secid" secId="{{$secId}}"></div>
<div class="flex flex-col gap-5">
    <div class="p-5 bg-white rounded-[3px] shadow w-full h-full border-t-3 border-[#3c8dbc]">
        <div id="revision" class="text-2xl font-bold mb-3"></div>
        <div class="overflow-y-auto w-fit max-w-full max-h-48 rounded shadow">
            <div id="tableRevision" class="table table-zebra"></div>
        </div>
    </div>
    <div class="flex flex-col gap-3 p-5 bg-white rounded-[3px] shadow w-full h-full border-t-3 border-[#3c8dbc]">
        <div class="flex gap-5">
            <div id="master" class="text-2xl font-bold"></div>
            <button class="btn btn-warning" id="edit-button" disabled><i class="icofont-edit"></i>Edit</button>
            <div class="join">
                <button class="btn btn-secondary btn-outline join-item" id="collapse-button" disabled><i class="icofont-collapse text-xl"></i>Collapse</button>
                <button class="btn btn-secondary join-item" id="expand-button" disabled><i class="icofont-expand text-xl"></i></i>Expand</button>
            </div>
            <button class="btn btn-neutral cursor-default"><i class="icofont-calculator-alt-2 text-xl"></i><span id="total">Total</span></button>
            <button class="btn btn-primary hidden" id="add-topic"><i class="icofont-ui-add"></i>Add Topic</button>
        </div>
        <div class="overflow-y-auto w-full  max-h-[60vh] rounded shadow">
            <div id="masterList"></div>
        </div>
        <div id="save" class="hidden flex flex-col gap-3">
            <div class="reason text-xl font-bold">Reason</div>
            <textarea class="textarea textarea-bordered req" placeholder="Enter reason" id="reason"></textarea>
            <div class="flex gap-3">
                <button class="btn btn-primary" id="save-button"><i class="icofont-save"></i>Save</button>
                <button class="btn btn-error" id="cancel-button"><i class="icofont-close"></i>Cancel</button>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/eSelfAuditMaster.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection