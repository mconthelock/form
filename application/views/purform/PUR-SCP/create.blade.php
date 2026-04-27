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

        {{-- Period Selection Card --}}
        <div class="card bg-white shadow border border-base-200" id="periodSelectCard">
            <div class="card-body p-4">
                <div class="flex flex-wrap items-center gap-4">
                    <div class="flex items-center gap-2 text-base-content/70 shrink-0">
                        <i class="icofont-calendar text-primary text-lg"></i>
                        <span class="font-medium text-sm">New Price Period</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <label class="label-text text-sm font-medium">Year (FYEAR)</label>
                        <input type="number" id="selectFYear" class="input input-bordered input-sm w-28" placeholder="FYEAR" min="2000" max="2099">
                    </div>
                    <div class="flex items-center gap-2">
                        <label class="label-text text-sm font-medium">Period</label>
                        <select id="selectPeriod" class="select select-bordered select-sm">
                            <option value="1">1&nbsp;&nbsp;(Jan – Jun)</option>
                            <option value="2">2&nbsp;&nbsp;(Jul – Dec)</option>
                            <option value="full">Full Year&nbsp;&nbsp;(Jan – Dec)</option>
                        </select>
                    </div>
                    <div id="periodPreview" class="text-sm font-semibold text-primary" style="opacity:0;transition:opacity .2s">—</div>
                    <div id="periodErrorMsg" class="hidden items-center gap-1.5 text-warning text-sm font-medium">
                        <i class="icofont-warning-alt text-base"></i>
                        <span>Period นี้มีข้อมูลบางส่วนอยู่แล้ว — row ที่ซ้ำจะถูกข้ามอัตโนมัติ</span>
                    </div>
                </div>
            </div>
        </div>

        {{-- Quotation Filter Card --}}
        <div class="card bg-white shadow border border-base-200 hidden" id="quotationFilterCard">
            <div class="card-body p-4">
                <div class="flex flex-wrap items-center gap-3">
                    <div class="flex items-center gap-2 text-base-content/70 shrink-0">
                        <i class="icofont-filter text-primary text-lg"></i>
                        <span class="font-medium text-sm">Quotation ที่จะ Update รอบนี้</span>
                    </div>
                    <div id="quotationCheckboxes" class="flex flex-wrap gap-2"></div>
                    <span id="updateSummary" class="ml-auto text-xs text-base-content/60 hidden"></span>
                </div>
            </div>
        </div>

        {{-- Table Card --}}
        <div class="card bg-white shadow border border-base-200">
            <div class="card-body p-0">

                {{-- Table Header Bar --}}
                <div class="flex items-center px-4 py-3 border-b border-base-200">
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
                                {{-- <th rowspan="2" class="align-middle text-center">Status</th> --}}
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
                <div id="emptyState" class="hidden flex-col items-center justify-center py-16 text-base-content/30">
                    <i class="icofont-file-excel text-6xl mb-3"></i>
                    <p class="text-sm font-medium">No data yet</p>
                    <p class="text-xs mt-1">Upload an Excel file to preview the price list</p>
                </div>

            </div>
        </div>

        {{-- Bank Guarantee Section --}}
        <div class="card bg-white shadow border border-base-200" id="bankGuaranteeCard">
            <div class="card-body p-0">
                <div class="flex items-center justify-between px-4 py-3 border-b border-base-200">
                    <div class="flex items-center gap-2 text-base-content/70 text-sm">
                        <i class="icofont-bank-alt text-warning text-lg"></i>
                        <span class="font-medium">Bank Guarantee Amount</span>
                    </div>
                    <button id="btnAddBgVendor" class="btn btn-outline btn-primary btn-sm gap-1">
                        <i class="icofont-plus"></i>
                        Add Vendor
                    </button>
                </div>
                <div class="p-4 overflow-x-auto">
                    <table id="bankGuaranteeTable"
                        class="table table-sm border-collapse
                               [&_th]:border [&_th]:border-slate-400 [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wide
                               [&_td]:border [&_td]:border-slate-400 [&_td]:py-2">
                        <thead>
                            <tr id="bgVendorHeaderRow">
                                <th class="bg-base-200 w-48 align-middle">Bank Guarantee Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr id="bgAmountInputRow">
                                <td class="bg-base-200 font-medium text-sm text-base-content/70 whitespace-nowrap">Amount (THB)</td>
                            </tr>
                        </tbody>
                    </table>
                    <p id="bgEmptyMsg" class="text-xs text-base-content/40 italic mt-2">Upload Excel or add vendor manually to enter bank guarantee amounts.</p>
                </div>
            </div>
        </div>

        {{-- Attach Files Section --}}
        <div class="card bg-white shadow border border-base-200" id="attachFilesCard">
            <div class="card-body p-0">
                <div class="flex items-center justify-between px-4 py-3 border-b border-base-200">
                    <div class="flex items-center gap-2 text-base-content/70 text-sm">
                        <i class="icofont-paper-clip text-info text-lg"></i>
                        <span class="font-medium">แนบไฟล์เพิ่มเติม</span>
                    </div>
                    <label for="attachFileInput" class="btn btn-outline btn-info btn-sm gap-1 cursor-pointer">
                        <i class="icofont-plus"></i>
                        เลือกไฟล์
                    </label>
                    <input type="file" id="attachFileInput" multiple class="hidden">
                </div>
                <div class="p-4">
                    <ul id="attachFileList" class="space-y-2">
                        <li id="attachEmptyMsg" class="text-xs text-base-content/40 italic">ยังไม่มีไฟล์แนบ</li>
                    </ul>
                </div>
            </div>
        </div>

        {{-- Remark Section --}}
        <div class="card bg-white shadow border border-base-200" id="remarkCard">
            <div class="card-body p-0">
                <div class="flex items-center px-4 py-3 border-b border-base-200">
                    <div class="flex items-center gap-2 text-base-content/70 text-sm">
                        <i class="icofont-notepad text-secondary text-lg"></i>
                        <span class="font-medium">Remark</span>
                    </div>
                </div>
                <div class="p-4">
                    <textarea id="remarkInput" rows="3"
                        class="textarea textarea-bordered w-full text-sm"
                        placeholder="หมายเหตุ / Remark (ถ้ามี)"></textarea>
                </div>
            </div>
        </div>

        {{-- Sticky Save Footer --}}
        <div id="saveFooter" class="hidden sticky bottom-0 z-20 -mx-4 px-4 py-3 bg-base-100 border-t border-base-300 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
            <div class="flex items-center justify-end gap-3">
                <span class="text-sm text-base-content/60">ตรวจสอบข้อมูลครบแล้วใช่ไหม?</span>
                <button id="btnSaveToDb" class="btn btn-primary gap-2">
                    <i class="icofont-save"></i>
                    Save to Database
                </button>
            </div>
        </div>

    </div>
@endsection


@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/purScp_create.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
