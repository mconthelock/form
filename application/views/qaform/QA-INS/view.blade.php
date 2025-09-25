@extends('layouts/webflowTemplate')

@section('styles')
<style>
    table.mytable {
        overflow: hidden;
        box-shadow: 0 0px 5px rgb(0 0 0 / 0.15);
    }

    table.mytable tr {
        border-bottom: 2px solid #fff;
    }

    table.mytable tr:last-child {
        border-bottom: 0px;
    }

    table.mytable td:first-child {
        width: 200px;
        font-weight: bold;
        align-content: flex-start;
        background-color: var(--color-primary-content);
        color: var(--color-primary)
    }

    table.mytable td {
        background-color: var(--color-base-100);
    }
</style>
@endsection

@section('contents')
<div class="hidden form-info" data-test="1" NFRMNO="{{$NFRMNO}}" VORGNO="{{$VORGNO}}" CYEAR="{{$CYEAR}}"
    empno="{{$empno}}" mode="{{ $mode }}"></div>
@if ($mode != '1')
<div class="form-no hidden" CYEAR2="{{ $CYEAR2 }}" NRUNNO="{{ $NRUNNO }}"></div>
<div class="apv-data hidden" cextData="{{ $cextData }}" return="{{ $return }}"></div>
@endif
<div class="flex justify-center">
    <div class="card bg-white min-w-[70vw] max-w-[80vw] w-fit drop-shadow-lg">
        <div class="card-header px-6 pt-6">
            <h2 class="text-3xl font-bold">E-Self Inspection and Authorize</h2>
        </div>
        <div class="card-body">
            <hr class="mb-4">

            <div class="form-detail"></div>

            <hr class="my-4">

            <div class="reqDetail flex flex-col gap-5 hidden">
                <div class="text-xl font-bold">Requester Details</div>
                <table class="mytable table">
                    <tbody>
                        <tr>
                            <td class="bg-primary">Item</td>
                            <td>
                                <div class="item"></div>
                            </td>
                        </tr>
                        <tr>
                            <td>ID Operator</td>
                            <td>
                                <div class="operator"></div>
                            </td>
                        </tr>
                        <tr>
                            <td>Attach File</td>
                            <td>
                                <div class="attachFile"></div>
                            </td>
                        </tr>
                        <tr>
                            <td>QC Section Incharge</td>
                            <td>
                                <div class="qcIncharge"></div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <form class="flex flex-col gap-5 hidden" id="qcForm1">
                    <div class="flex flex-col gap-5">
                        <div class="qc w-full">
                            <div class="text-xl font-bold mb-5 mt-8">QC Incharge</div>
                            <table class="mytable table">
                                <tbody>
                                    <tr>
                                        <td>Training Date</td>
                                        <td>
                                            <div class="trainingDate"></div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>OJT Date</td>
                                        <td>
                                            <div class="ojtDate"></div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>QC Foreman</td>
                                        <td>
                                            <div class="qcForeman"></div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Revision</td>
                                        <td>
                                            <div class="inchargeRevision"></div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="auditor w-full">
                            <div class="text-xl font-bold mb-5 mt-8">QC Auditor</div>
                            <div id="tableLoading"></div>
                            <table class="table !table-zebra" id="tableAuditor"></table>
                        </div>
                    </div>
                </form>
                <div id="qcForm2" class="flex flex-col gap-5 hidden">
                    <div class="text-xl font-bold mt-8">QC Auditor</div>
                    <table class="mytable table  w-full">
                        <tbody>
                            <tr>
                                <td>Auditor</td>
                                <td>
                                    <div id="auditorShow"></div>
                                </td>
                            </tr>
                            <tr>
                                <td>Training Date</td>
                                <td>
                                    <div id="tdateShow"></div>
                                </td>
                            </tr>
                            <tr>
                                <td>OJT Date</td>
                                <td>
                                    <div id="ojtShow"></div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="text-xl font-bold mt-8">Auditee</div>
                    <table id="auditee" class="table"></table>
                    <div id="tableAuditeeLoading"></div>
                </div>
                <div id="actionWebflow" class="mt-5"></div>
            </div>
        </div>
    </div>
</div>
</div>

@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/eSelfView.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection