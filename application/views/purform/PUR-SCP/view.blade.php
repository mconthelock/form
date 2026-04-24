@extends('layouts/webflowTemplate')

@section('contents')
    <div class="space-y-4">

        <h1 class="text-2xl font-bold text-base-content flex justify-between items-center w-full">
            <span class="bg-white border border-cyan-400 text-cyan-600 rounded px-3 py-2 fyear text-2xl font-semibold"></span>
            <span class="border border-red-400 text-red-600 rounded px-3 py-1 text-base font-semibold">CONFIDENTIAL</span>
        </h1>

        {{-- Table Card --}}
        <div class="card bg-white shadow border border-base-200">
            <div class="card-body p-0">

                {{-- Table Header Bar --}}
                <div class="flex items-center justify-between px-4 py-3 border-b border-base-200">
                    <div class="flex items-center gap-2 text-base-content/70 text-sm">
                        <i class="icofont-price text-primary"></i>
                        <span class="font-medium">Price List</span>
                    </div>
                </div>

                {{-- Loading Skeleton --}}
                <div id="loadingSkeleton" class="p-4 space-y-3">
                    <div class="animate-pulse h-5 w-56 rounded bg-base-200"></div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div class="animate-pulse h-10 rounded bg-base-200"></div>
                        <div class="animate-pulse h-10 rounded bg-base-200"></div>
                    </div>
                    <div class="space-y-2 pt-1">
                        <div class="animate-pulse h-9 rounded bg-base-200"></div>
                        <div class="animate-pulse h-9 rounded bg-base-200"></div>
                        <div class="animate-pulse h-9 rounded bg-base-200"></div>
                        <div class="animate-pulse h-9 rounded bg-base-200"></div>
                        <div class="animate-pulse h-9 rounded bg-base-200"></div>
                        <div class="animate-pulse h-9 rounded bg-base-200"></div>
                    </div>
                </div>

                {{-- Table --}}
                <div id="tableWrapper" class="overflow-x-auto p-2 hidden">
                    <table id="price_table"
                        class="table table-zebra table-sm w-full border-collapse
                               [&_th]:border [&_th]:border-slate-700! [&_th]:border-t-0 [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wide
                               [&_td]:border [&_td]:border-slate-500! [&_td]:py-2">
                        <thead class="bg-base-200 text-base-content sticky top-0 z-10">
                            <tr>
                                <th rowspan="2" class="align-middle">Scrap ID</th>
                                <th rowspan="2" class="align-middle" style="width:300px;">Scrap Name (EN)</th>
                                <th rowspan="2" class="align-middle text-center">Quotation</th>
                                <th rowspan="2" class="align-middle text-center">Old Vendor</th>
                                <th rowspan="2" class="align-middle text-center">
                                    Price
                                    <div class="old-price-period font-normal normal-case opacity-60 text-xs mt-0.5"></div>
                                </th>
                                <th colspan="2" class="text-center bg-primary/15 text-primary">
                                    Winner
                                    <div class="new-period font-normal normal-case opacity-80 text-xs mt-0.5"></div>
                                </th>
                                <th rowspan="2" class="align-middle text-center">U/M</th>
                                <th rowspan="2" class="align-middle text-center">BOI / Non-BOI</th>
                                <th rowspan="2" class="align-middle text-center bg-primary/15 text-primary">Effective Date</th>
                                <th rowspan="2" class="align-middle text-center">Bank Guarantee</th>
                            </tr>
                            <tr>
                                <th class="text-center bg-primary/15 text-primary">New Vendor</th>
                                <th class="text-center bg-primary/15 text-primary">
                                    New Price
                                    <div class="new-price-period font-normal normal-case opacity-60 text-xs mt-0.5"></div>
                                </th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>

                    <div class="p-4 overflow-x-auto rounded-lg">
                        <table id="bankGuaranteeTable"
                            class="table table-sm border-collapse w-80
                               [&_th]:border [&_th]:border-slate-400 [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wide
                               [&_td]:border [&_td]:border-slate-400 [&_td]:py-2">
                            <thead>
                                <tr id="bgVendorHeaderRow">
                                    <th class="bg-base-200 w-48 align-middle">Bank Guarantee Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr id="bgAmountRow">
                                    <td class="bg-base-200 font-medium text-sm text-base-content/70 whitespace-nowrap">Amount (THB)</td>
                                </tr>
                            </tbody>
                        </table>
                        <p id="bgEmptyMsg" class="text-xs text-base-content/40 italic mt-2">No bank guarantee data.</p>
                    </div>

                    <div id="emptyState" class="hidden flex-col items-center justify-center py-16 text-base-content/30">
                        <i class="icofont-file-excel text-6xl mb-3"></i>
                        <p class="text-sm font-medium">No data available</p>
                    </div>

                    {{-- Attached Files Card --}}
                    <div class="card bg-white shadow border border-base-200" id="attachFilesCard">
                        <div class="card-body p-0">
                            <div class="flex items-center bg-blue-100 gap-2 px-4 py-3 border-b border-base-200 text-base-content/70 text-sm">
                                <i class="icofont-paper-clip text-info text-lg"></i>
                                <span class="font-medium">ไฟล์แนบเพิ่มเติม</span>
                            </div>
                            <div class="p-4">
                                <ul id="attachFileList" class="space-y-2">
                                    <li id="attachFilesLoading" class="text-xs text-base-content/40 italic">กำลังโหลด...</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="Apv-btn"></div>

                    <div class="flow mt-3 mb-5"></div>
                </div>

                {{-- Empty State --}}
            </div>


        </div>


    </div>
@endsection


@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/purScp_view.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
