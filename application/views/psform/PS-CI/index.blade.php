@extends('layouts/webflowTemplate')
@section('contents')
    <!-- Header Section -->
    <div class="form-data" data-nfrmno="{{ $_GET['no'] }}" data-vorgno="{{ $_GET['orgNo'] }}" data-cyear="{{ $_GET['y'] }}" data-cyear2="{{ $_GET['y2'] }}" data-nrunno="{{ $_GET['runNo'] }}"></div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <!-- Header Section -->
        <div class="bg-slate-200/70 rounded-lg p-6 shadow-sm border border-slate-300">
            <h2 class="text-2xl font-bold text-slate-800 mb-1">Cycle Count Inventory Sheet</h2>
            <p class="text-sm text-slate-600 mb-4">MITSUBISHI ELEVATOR ASIA CO., LTD.</p>

            <div class="grid grid-cols-2 gap-4 bg-white/50 p-4 rounded border border-slate-300">
                <div>
                    <label class="text-xs font-semibold text-slate-600 uppercase tracking-wide">Data Date</label>
                    <div class="text-sm font-medium text-slate-800 mt-1">01/01/2026</div>
                </div>
                <div>
                    <label class="text-xs font-semibold text-slate-600 uppercase tracking-wide">Check Date</label>
                    <div class="text-sm font-medium text-slate-800 mt-1">02/01/2026</div>
                </div>
                <div>
                    <label class="text-xs font-semibold text-slate-600 uppercase tracking-wide">Department / Section</label>
                    <div class="text-sm font-medium text-slate-800 mt-1">PS / WHI</div>
                </div>
                <div>
                    <label class="text-xs font-semibold text-slate-600 uppercase tracking-wide">Check By</label>
                    <div class="text-sm font-medium text-slate-800 mt-1">WHI</div>
                </div>
            </div>
        </div>

        <!-- Summary Section -->
        <div class="bg-slate-200/70 rounded-lg p-6 shadow-sm border border-slate-300">
            <h3 class="text-lg font-bold text-slate-800 mb-4">The Result of Monthly Inventory (Group B-E)</h3>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Total Item -->
                <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <div class="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Total Item</div>
                    <div class="text-3xl font-bold text-blue-900 total-item skeleton h-8 w-20"></div>
                </div>

                <!-- Checking Item -->
                <div class="bg-slate-50 border-2 border-slate-300 rounded-lg p-4">
                    <div class="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">Checking Item</div>
                    <div class="text-3xl font-bold text-slate-900 checking-item skeleton h-8 w-20"></div>
                </div>

                <div class="bg-slate-50 border-2 border-slate-300 rounded-lg p-4">
                    <div class="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">L/D Random Check</div>
                    <div class="text-3xl font-bold text-slate-900 random-check skeleton h-8 w-20"></div>
                </div>

                <!-- Diff Item (First Time) -->
                <div class="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                    <div class="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">Diff. Item (First Time)</div>
                    <div class="text-3xl font-bold text-red-900 diff-item-first-time skeleton h-8 w-20"></div>
                </div>

                <!-- Diff Item (After Re-check) -->
                <div class="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                    <div class="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">Diff. Item (After Re-check)</div>
                    <div class="text-3xl font-bold text-amber-900 diff-item-after-recheck skeleton h-8 w-20"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- Table Section -->
    <div class="bg-slate-200/70 rounded-lg p-6 shadow-sm border border-slate-300">
        <div class="overflow-x-auto bg-white rounded border border-slate-300 p-4">
            <table class="table table-sm w-full" id="table">
                <thead class="bg-slate-300 text-slate-800">
                    <tr>
                        <th class="border-r border-slate-400 bg-slate-300">No.</th>
                        <th class="border-r border-slate-400 bg-slate-300">Buyer</th>
                        <th class="border-r border-slate-400 bg-slate-300">Item Code</th>
                        <th class="border-r border-slate-400 bg-slate-300">Description</th>
                        <th class="border-r border-slate-400 bg-slate-300">Drawing No.</th>
                        <th class="border-r border-slate-400 bg-slate-300">Location</th>
                        <th class="border-r border-slate-400 bg-slate-300">Controller</th>
                        <th class="border-r border-slate-400 bg-amber-100">On Hand</th>
                        <th class="border-r border-slate-400 bg-slate-300">WH/U.M.</th>
                        {{-- <th class="border-r border-slate-400">Unit Price</th>
                        <th class="border-r border-slate-400">Amount</th> --}}
                        <th class="border-r border-slate-400 bg-slate-300">Actual QTY</th>
                        <th class="border-r border-slate-400 bg-slate-200">Diff</th>
                        <th class="border-r border-slate-400 bg-slate-300">L/D Random Check</th>
                        <th class="bg-slate-300">Reason From</th>
                    </tr>
                </thead>
                <tbody class="text-sm table-detail">

                </tbody>
            </table>
        </div>
    </div>
    @if ($mode == '2')
        <div class="mt-5 flex flex-col items-center justify-center gap-4">
            <div>
                <label class="text-sm font-semibold text-slate-700 mb-2 block">Remark</label>
                <textarea class="textarea textarea-bordered w-96" id="remark" placeholder="Enter your remark here..."></textarea>
            </div>
            <div class="flex gap-3 items-center justify-center">

                <button class="btn btn-success btn-approve" action="approve">Approve</button>
                <button class="btn btn-error btn-approve" action="reject">Reject</button>
            </div>
        </div>
    @endif
    <div class="mt-5 flow"></div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/psCi.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
