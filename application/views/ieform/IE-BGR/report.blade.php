@extends('layouts/webflowTemplate')

@section('styles')
 <style>
    td{
        border-right: 1px solid #ddd !important;
    }
 </style>
@endsection

@section('contents')
<div class="card bg-white w-full lg:w-[70rem] place-self-center shadow-sm" id="box-search">
    <div class="card-body gap-5 p-6 lg:p-10 items-center">
        <h2 class="card-title justify-center">
            <h1 class="text-3xl text-center text-primary font-bold">Search and Export Budget Requisition Form</h1>
        </h2>
        <form id="form" class="flex flex-col gap-3 w-1/2 rounded-2xl bg-primary-content p-6">
            <fieldset class="flex justify-between">
                <label for="EMPNO" class="font-bold">Requested by :</label>
                <input type="text" class="input" id="EMPNO" name="EMPNO" placeholder="24008" maxlength="5">
            </fieldset>


            <fieldset class="flex justify-between">
                <label for="DEPT" class="font-bold">Department :</label>
                <select class="select" id="DEPT" name="DEPT" placeholder="Select Department"></select>
            </fieldset>
            <fieldset class="flex justify-between">
                <label for="FORMNO" class="font-bold">Ebudget Form No :</label>
                <input type="text" class="input txt-upper" id="FORMNO" name="FORMNO" placeholder="IE-BGR26-000001" maxlength="15">
            </fieldset>
            <fieldset class="flex justify-between">
                <label for="PRNO" class="font-bold">PR No :</label>
                <input type="text" class="input txt-upper" id="PRNO" name="PRNO" placeholder="PR0001178228" maxlength="12">
            </fieldset>
            <fieldset class="flex justify-between">
                <label for="PONO" class="font-bold">PO No :</label>
                <input type="text" class="input txt-upper" id="PONO" name="PONO" placeholder="AMEC00421937" maxlength="12">
            </fieldset>

            <fieldset class="flex justify-between">
                <label for="FORM_STATUS" class="font-bold">Flow Status :</label>
                <select class="select" id="FORM_STATUS" name="FORM_STATUS" placeholder="Select Status">
                    <option value=""></option>
                    <option value="2">Approve</option>
                    <option value="3">Reject</option>
                    <option value="1">Running</option>
                </select>
            </fieldset>
            <div class="search flex justify-center gap-5 mt-5">
                <button type="button" id="search" class="btn btn-primary" disabled>
                    <i class="icofont-search-2 text-2xl font-bold" title="Search"></i>
                    Search
                </button>
                <button type="button" id="reload" class="btn btn-secondary hidden">
                    <i class="icofont-spinner-alt-3 text-2xl font-bold" title="Reload"></i>
                    Reload
                </button>
                
            </div>
        </form>
    </div>
</div>
<div id="box-table" class="hidden card bg-white w-full lg:w-[90rem] place-self-center shadow-sm overflow-x-auto relative p-5">
    <fieldset class="absolute right-8 z-10">
        <button type="button" id="export" class="btn btn-success">
            <i class="icofont-file-excel text-2xl font-bold" title="Export to Excel"></i>
            Export to Excel
        </button>
        <button type="button" id="back" class="btn btn-primary">
            <i class="icofont-arrow-left text-2xl font-bold" title="back"> </i>
            Back
        </button>
    </fieldset>
    <table class="table table-zebra" id="table">
</div>
</table>
@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/iebgrReport.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection