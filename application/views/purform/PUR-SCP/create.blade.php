@extends('layouts/webflowTemplate')

@section('contents')
    <div class="space-y-4">

        {{-- Page Header --}}
        {{-- <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
                <div class="text-sm breadcrumbs text-base-content/50 mb-1">
                    <ul>
                        <li><i class="icofont-home"></i></li>
                        <li>Purchase</li>
                        <li>Scrap Master</li>
                    </ul>
                </div>
            </div>
        </div> --}}
        <h1 class="text-2xl font-bold text-base-content flex justify-between items-center w-full">
            {{-- <i class="icofont-recycle text-primary"></i> --}}
            <span class="bg-white border border-cyan-400 text-cyan-600 rounded px-3 py-2 fyear text-2xl font-semibold"></span>
            <span class="border border-red-400 text-red-600 rounded px-3 py-1 text-base font-semibold">CONFIDENTIAL</span>
        </h1>

        {{-- Upload Card --}}
        <div class="card bg-white shadow border border-base-200">
            <div class="card-body p-4">
                <div class="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div class="flex items-center gap-2 text-base-content/70">
                        <i class="icofont-file-excel text-success text-xl"></i>
                        <span class="font-medium text-sm">Import from Excel</span>
                    </div>
                    <form id="uploadForm" enctype="multipart/form-data"
                        class="flex flex-1 flex-wrap items-center gap-2">
                        <input type="file" id="uploadExcel" name="attach" class="file-input file-input-bordered file-input-sm flex-1 min-w-0">
                        <input type="hidden" name="runno" id="runno" value="{{-- $runno --}}">
                        <input type="hidden" name="year" id="year" value="{{-- $cyear2 --}}">
                        <button class="btn btn-success btn-sm gap-1 shrink-0" id="saveFile">
                            <i class="icofont-upload-alt"></i>
                            Upload
                        </button>
                    </form>
                </div>
            </div>
        </div>

        {{-- Table Card --}}
        <div class="card bg-white shadow border border-base-200">
            <div class="card-body p-0">

                {{-- Table Header Bar --}}
                <div class="flex items-center justify-between px-4 py-3 border-b border-base-200">
                    <div class="flex items-center gap-2 text-base-content/70 text-sm">
                        <i class="icofont-price text-primary"></i>
                        <span class="font-medium">Price List</span>
                    </div>
                    <button id="btnSaveToDb" class="btn btn-primary btn-sm gap-1 hidden">
                        <i class="icofont-save"></i>
                        Save to Database
                    </button>
                </div>

                {{-- Table --}}
                <div class="overflow-x-auto p-2">
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
                </div>

                {{-- Empty State (hidden by JS when rows exist) --}}
                <div id="emptyState" class="flex flex-col items-center justify-center py-16 text-base-content/30">
                    <i class="icofont-file-excel text-6xl mb-3"></i>
                    <p class="text-sm font-medium">No data yet</p>
                    <p class="text-xs mt-1">Upload an Excel file to preview the price list</p>
                </div>

            </div>
        </div>

    </div>
@endsection


@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/purScp_create.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
