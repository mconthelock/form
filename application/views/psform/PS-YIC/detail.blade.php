@extends('layouts/webflowTemplate')
@section('contents')
    <div class="w-full mx-auto bg-white shadow-xl ring-1 ring-gray-200 rounded-lg p-6" id="page-root" data-part="1">

        <div class="flex items-center justify-between mb-3">
            <h1 class="font-bold text-sm">The Result Of Yearly Inventory Checking FY <span class="period">2025 half #2nd</span></h1>
            {{-- <a href="{{ route('ps-yic.index', request()->query()) }}" class="btn btn-xs btn-outline">&laquo; Back to Summary</a> --}}
        </div>

        {{-- ============ TABS ============ --}}
        <div role="tablist" class="tabs tabs-lift">

            {{-- ===================== TAB 1: SUMMARY + VARIANCE (Bulk/Stock) ===================== --}}
            <input type="radio" name="yic_report_tabs" role="tab" class="tab" aria-label="Report 1 · Summary" checked="checked" />
            <div role="tabpanel" class="tab-content bg-white border-base-300 p-4">

                {{-- ============ TOP INFO ROW ============ --}}
                <div class="flex gap-3 mb-4 items-start justify-between">

                    {{-- Condition info box --}}
                    <table class="text-xs border max-w-xl border-gray-400 flex-1 shadow-sm">
                        <tbody>
                            <tr>
                                <td class="border border-gray-400 px-2 py-1 font-medium bg-gray-100 w-32">Cut Off Data:</td>
                                <td class="border border-gray-400 px-2 py-1 cutoff-date"></td>
                                <td rowspan="4" class="border border-gray-400 px-3 py-1 align-middle bg-purple-50">
                                    <label class="flex items-center gap-2 mb-1">
                                        <i class="fi fi-rr-checkbox"></i>
                                        <span class="font-semibold text-[#4b1a6b]">BULK PART</span>
                                    </label>
                                    <label class="flex items-center gap-2">
                                        <i class="fi fi-rr-checkbox"></i>
                                        <span class="font-semibold text-[#4b1a6b]">STOCK PART</span>
                                    </label>
                                </td>
                            </tr>
                            <tr>
                                <td class="border border-gray-400 px-2 py-1 font-medium bg-gray-100">Checking Date:</td>
                                <td class="border border-gray-400 px-2 py-1 whi-date"></td>
                            </tr>
                            <tr>
                                <td class="border border-gray-400 px-2 py-1 font-medium bg-gray-100">Department/Section:</td>
                                <td class="border border-gray-400 px-2 py-1">PS / WHI</td>
                            </tr>
                            <tr>
                                <td class="border border-gray-400 px-2 py-1 font-medium bg-gray-100">Check By:</td>
                                <td class="border border-gray-400 px-2 py-1">WHI 100%</td>
                            </tr>
                        </tbody>
                    </table>

                    {{-- Summary box (purple theme = Bulk) --}}
                    <div class="flex gap-3">
                        <table class="text-xs border border-gray-400 shadow-sm" style="min-width:260px">
                            <thead>
                                <tr>
                                    <th colspan="2" class="bg-[#4b1a6b] text-white py-1.5 px-2 text-left tracking-wide">The Result of Inventory (Bulk)</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-300">
                                <tr class="bg-white">
                                    <td class="border border-gray-400 px-2 py-1">Total Item</td>
                                    <td class="border border-gray-400 px-2 py-1 text-right total-items-bulk"></td>
                                </tr>
                                <tr class="bg-gray-50">
                                    <td class="border border-gray-400 px-2 py-1">Checking Item</td>
                                    <td class="border border-gray-400 px-2 py-1 text-right checking-items-bulk"></td>
                                </tr>
                                <tr class="bg-white">
                                    <td class="border border-gray-400 px-2 py-1">Diff Item (First Time)</td>
                                    <td class="border border-gray-400 px-2 py-1 text-right text-red-600 font-medium diff-items-bulk"></td>
                                </tr>
                                <tr class="bg-red-50">
                                    <td class="border border-gray-400 px-2 py-1 font-medium">Variance Item</td>
                                    <td class="border border-gray-400 px-2 py-1 text-right text-red-600 font-semibold variance-items-bulk"></td>
                                </tr>
                            </tbody>
                        </table>

                        <table class="text-xs border border-gray-400 shadow-sm" style="min-width:260px">
                            <thead>
                                <tr>
                                    <th colspan="2" class="bg-[#4b1a6b] text-white py-1.5 px-2 text-left tracking-wide">The Result of Inventory (Stock)</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-300">
                                <tr class="bg-white">
                                    <td class="border border-gray-400 px-2 py-1">Total Item</td>
                                    <td class="border border-gray-400 px-2 py-1 text-right total-items-stock"></td>
                                </tr>
                                <tr class="bg-gray-50">
                                    <td class="border border-gray-400 px-2 py-1">Checking Item</td>
                                    <td class="border border-gray-400 px-2 py-1 text-right checking-items-stock"></td>
                                </tr>
                                <tr class="bg-white">
                                    <td class="border border-gray-400 px-2 py-1">Diff Item (First Time)</td>
                                    <td class="border border-gray-400 px-2 py-1 text-right text-red-600 font-medium diff-items-stock"></td>
                                </tr>
                                <tr class="bg-red-50">
                                    <td class="border border-gray-400 px-2 py-1 font-medium">Variance Item</td>
                                    <td class="border border-gray-400 px-2 py-1 text-right text-red-600 font-semibold variance-items-stock"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {{-- ============ VARIANCE DETAIL TABLE ============ --}}
                <div class="relative overflow-x-auto rounded-md shadow-sm">
                    <table id="tbl-variance" class="w-full table text-xs border-collapse border border-gray-400">
                        <thead>
                            <tr class="bg-[#4b1a6b] text-white">
                                <th class="border border-gray-400 py-1.5 px-2 w-10">No.</th>
                                <th class="border border-gray-400 py-1.5 px-2">Tag no</th>
                                <th class="border border-gray-400 py-1.5 px-2">Item Code</th>
                                <th class="border border-gray-400 py-1.5 px-2">Drawing No.</th>
                                <th class="border border-gray-400 py-1.5 px-2 text-left">Description</th>
                                <th class="border border-gray-400 py-1.5 px-2">Book Q'ty</th>
                                <th class="border border-gray-400 py-1.5 px-2">Tag Q'ty</th>
                                <th class="border border-gray-400 py-1.5 px-2">Diff Q'ty</th>
                                <th class="border border-gray-400 py-1.5 px-2">UM.</th>
                                <th class="border border-gray-400 py-1.5 px-2">Diff Amount</th>
                                <th class="border border-gray-400 py-1.5 px-2 text-left">WHI Reply</th>
                                <th class="border border-gray-400 py-1.5 px-2 text-left">PUR Reply</th>
                            </tr>
                        </thead>
                        <tbody>
                            @for ($j = 0; $j < 15; $j++)
                                <tr class="{{ $j % 2 === 0 ? 'bg-white' : 'bg-gray-50' }} hover:bg-purple-50/60">
                                    @for ($i = 0; $i < 12; $i++)
                                        <td class="border border-gray-400 py-1 px-2 h-8"></td>
                                    @endfor
                                </tr>
                            @endfor
                        </tbody>
                    </table>

                    {{-- Watermark shown when there is no variance --}}
                    <div class="variance-empty hidden absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span class="text-6xl font-bold text-gray-800/70">Variance=0</span>
                    </div>
                </div>

                <div class="flex justify-end mt-3 text-xs">
                    <div class="flex gap-2 items-center bg-red-50 border border-red-200 rounded-md px-3 py-1.5">
                        <span class="font-medium">Total Amount</span>
                        <span class="border-b border-black px-4 text-right total-amount-1 font-semibold text-red-600">0.00</span>
                    </div>
                </div>

            </div>

            {{-- ===================== TAB 2: WAREHOUSE VARIANCE DETAIL ===================== --}}
            <input type="radio" name="yic_report_tabs" role="tab" class="tab" aria-label="Report 2 · WH Detail" />
            <div role="tabpanel" class="tab-content bg-white border-base-300 p-4">

                {{-- ============ VARIANCE DETAIL TABLE ============ --}}
                <div class="relative overflow-x-auto rounded-md shadow-sm">
                    <table id="tbl-variance2" class="w-full table text-xs border-collapse border border-gray-400">
                        <thead>
                            <tr class="bg-[#0066cc] text-white">
                                <th class="border border-gray-400 py-1.5 px-2 w-10">No.</th>
                                <th class="border border-gray-400 py-1.5 px-2">Tag no</th>
                                <th class="border border-gray-400 py-1.5 px-2">Item Code</th>
                                <th class="border border-gray-400 py-1.5 px-2 text-left">Description</th>
                                <th class="border border-gray-400 py-1.5 px-2 text-left">WH User</th>
                                <th class="border border-gray-400 py-1.5 px-2">Onhand Q'ty</th>
                                <th class="border border-gray-400 py-1.5 px-2">Actual Q'ty</th>
                                <th class="border border-gray-400 py-1.5 px-2">Diff Q'ty</th>
                                <th class="border border-gray-400 py-1.5 px-2">STD Cost</th>
                                <th class="border border-gray-400 py-1.5 px-2">Diff Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            @for ($j = 0; $j < 15; $j++)
                                <tr class="{{ $j % 2 === 0 ? 'bg-white' : 'bg-gray-50' }} hover:bg-purple-50/60">
                                    <td class="border border-gray-400 py-1 px-2 h-8">{{ $j + 1 }}</td>
                                    @for ($i = 0; $i < 9; $i++)
                                        <td class="border border-gray-400 py-1 px-2 h-8"></td>
                                    @endfor
                                </tr>
                            @endfor
                        </tbody>
                    </table>

                    {{-- Watermark shown when there is no variance --}}
                    <div class="variance-empty hidden absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span class="text-6xl font-bold text-gray-800/70">Variance=0</span>
                    </div>
                </div>

                <div class="flex justify-end mt-3 text-xs">
                    <div class="flex gap-2 items-center bg-red-50 border border-red-200 rounded-md px-3 py-1.5">
                        <span class="font-medium">Total Amount</span>
                        <span class="border-b border-black px-4 text-right total-amount-2 font-semibold text-red-600">0.00</span>
                    </div>
                </div>

            </div>

        </div>

    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/psYicDetail.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection