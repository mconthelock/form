@extends('layouts/webflowTemplate')

@section('contents')
<div class="hidden form-info" nfrmno="{{$NFRMNO}}" vorgno="{{$VORGNO}}" cyear="{{$CYEAR}}" mode="{{$mode}}"
    cyear2={{$mode !=1 ? $CYEAR2 : '' }} nrunno={{$mode !=1 ? $NRUNNO : '' }}></div>
<div class="hidden apv-data" empno="{{$empno}}"></div>
@If($mode == 1)
<form id="form" action="">
@endIf
<div class="flex flex-col w-full px-4 my-5 font-sans">
    <div class="card bg-base-100 w-full lg:w-[70rem] place-self-center shadow-sm">
        <div class="card-body p-6 lg:p-10">
            <h2 class="card-title justify-center items-start">
                <u class="text-3xl text-primary font-bold mb-5">Annual Development Plan FY 
                    @if($mode != 1)
                    <span class="fyear"></span>
                    @endIf
                </u>
                @If($mode == 1)
                <input type="text" name="fyear" id="fyear" maxlength="4" class="input w-16">
                @endIf
            </h2>
            <div class="absolute right-10 top-10 ml-auto px-2 font-bold text-2xl text-error border-3 border-error">
                CONFIDENTAIL</div>
            <div id="detail" class="flex flex-col gap-5">
                <div id="form-detail"></div>
                <section id="form-Requester" class="flex flex-col gap-5 hidden w-2xs">
                    <fieldset class="flex justify-between gap-3">
                        <span class="text-lg font-bold">Input by</span>
                        <label>
                            <input type="text" name="CREATEBY" id="CREATEBY" class="input input-sm w-40" value="{{ $empno }}" readonly>
                        </label>
                    </fieldset>
                    <fieldset class="flex justify-between gap-3">
                        <span class="text-lg font-bold">Request by</span>
                        <label>
                            <input type="text" name="REQUESTER" id="REQUESTER"  maxlength="5"  class="input input-sm w-40 req">
                        </label>
                    </fieldset>
                </section>
                <div class="divider"></div>
                <div class="detail-topic">
                    <u class="text-xl font-bold">1. FY<span class="fyear"></span> Development policy</u>
                </div>
                <div class="detail-content">
                    <p>The Implement plan sheet item are to be made this year and are prioritized based on the policy
                        as,</p>
                    <ol type="1" class="list-decimal list-inside ml-5">
                        <li>Give priority to development with higher result. (Company policy : Total cost reduction)
                        </li>
                        <li>Support Compliance activity (Company policy : Compliance)</li>
                        <li>Support for Smooth Production. ( Company policy : Smooth Production)</li>
                        <li>Support for Improve direct/indirect efficiency up. (Company policy : Total cost reduction)
                        </li>
                    </ol>
                </div>
                <div class="detail-topic">
                    <u class="text-xl font-bold">2. FY<span class="fyear"></span> Request from each division and
                        conclusion</u>
                </div>
                <div class="detail-content">
                    <ol class="list-disc ml-5">
                        <li>All division has requested total of <span id="total" class="underline font-bold"></span>
                            request items.</li>
                        <li>For FY<span class="fyear"></span>, we have studied in accordance to development policies
                            written above and decided to implement <span id="totalDev"
                                class="underline font-bold"></span> items.</li>
                        <li>From all request, we decided to pending <span id="sub" class="underline font-bold"></span>
                            request items due to Low benefit and over our development workload, If we have remaining
                            workload, we will support to development topic in pending items next.</li>
                    </ol>
                </div>
                <div class="detail-table">
                    <table id="table" class="table table-sm">
                        <tfoot>
                            <tr>
                                <th>Grand Total</th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                @If($mode == 1)
                    <div  class="rounded-xl border bg-base-200 p-5 w-96">
                        <label for="file" class="font-bold text-xl">Attachment Annual plan <span
                                class="text-error">*</span></label>
                        <input type="file" name="file" id="file" class="file-input mt-3 req"
                            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel">
                    </div>
                @else
                <div class="rounded-xl border bg-base-200 p-5 min-w-96 w-fit max-w-full mb-8">
                    <label class="font-bold text-xl">Attachment Annual plan </label>
                    <div id="attachFile"></div>
                </div>
                @endIf
            </div>
            <div id="btnAction"></div>
        </div>
    </div>
</div>
@If($mode == 1)
</form>
@endIf
@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/isAdp.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection