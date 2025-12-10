@extends('layouts/webflowTemplate')

@section('contents')
    <div class="hidden form-info" nfrmno="{{$NFRMNO}}" vorgno="{{$VORGNO}}" cyear="{{$CYEAR}}"></div>
    <div class="hidden apv-data" empno="{{$empno}}"></div>
    <div class="flex flex-col w-full px-4 my-5 font-sans">
        <div class="card bg-base-100 w-full lg:w-[70rem] place-self-center shadow-sm">
            <div class="card-body p-6 lg:p-10">
                <h2 class="card-title justify-center">
                    <u class="text-3xl text-primary font-bold mb-5">Annual Development Plan FY <span class="fyear"></span></u>
                </h2>
                <div class="absolute right-10 top-10 ml-auto px-2 font-bold text-2xl text-error border-3 border-error">CONFIDENTAIL</div>
                <div id="detail" class="flex flex-col gap-5">
                    <div class="detail-topic">
                        <u class="text-xl font-bold">1. FY<span class="fyear"></span> Development policy</u>
                    </div>
                    <div class="detail-content">
                        <p>The Implement plan sheet item are to be made this year and are prioritized based on the policy as,</p>
                        <ol type="1" class="list-decimal list-inside ml-5">
                            <li>Give priority to development with higher result. (Company policy : Total cost reduction)</li>
                            <li>Support Compliance activity (Company policy : Compliance)</li>
                            <li>Support for Smooth Production. ( Company policy : Smooth Production)</li>
                            <li>Support for Improve direct/indirect efficiency up. (Company policy : Total cost reduction)</li>
                        </ol>
                    </div>
                    <div class="detail-topic">
                        <u class="text-xl font-bold">2. FY<span class="fyear"></span> Request from each division and conclusion</u>
                    </div>
                    <div class="detail-content">
                        <ol class="list-disc ml-5">
                            <li>All division has requested total of <span id="total" class="underline font-bold"></span> request items.</li>
                            <li>For FY<span class="fyear"></span>, we have studied in accordance to development policies written above and decided to implement <span id="totalDev" class="underline font-bold"></span> items.</li>
                            <li>From all request, we decided to pending <span id="sub" class="underline font-bold"></span> request items due to Low benefit and over our development workload, If we have remaining workload, we will support to development topic in pending items next.</li>
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
                    <input type="file" name="" id="" class="file-input">
                </div>
                <div id="btnAction"></div>
            </div>
        </div>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/isAdp.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection