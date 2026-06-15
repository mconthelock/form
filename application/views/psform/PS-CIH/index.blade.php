@extends('layouts/webflowTemplate')

@section('contents')
    <div class="form-data"
        data-nfrmno="{{ $_GET['no'] }}"
        data-vorgno="{{ $_GET['orgNo'] }}"
        data-cyear="{{ $_GET['y'] }}"
        data-cyear2="{{ $_GET['y2'] }}"
        data-nrunno="{{ $_GET['runNo'] }}">
    </div>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

        <div class="flex items-start justify-between mb-6 gap-4">
            <div>
                <p class="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
                    MITSUBISHI ELEVATOR ASIA CO., LTD. &nbsp;·&nbsp; PS / WHI
                </p>
                <h1 class="text-2xl font-bold text-slate-800 leading-tight">
                    Cycle Count Inventory Sheet (6 Months)
                </h1>
                <p class="text-xl text-slate-500 mt-1">
                    Group&nbsp;<span class="group-name font-semibold text-slate-700">—</span>
                </p>
            </div>

            <div class="flex flex-wrap gap-2 text-xs shrink-0">
                <div class="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-full px-3 py-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block"></span>
                    <span class="text-slate-500 font-medium">Data Date</span>
                    <span class="text-slate-800 font-semibold data-date">—</span>
                </div>
                <div class="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-full px-3 py-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block"></span>
                    <span class="text-slate-500 font-medium">Check Date</span>
                    <span class="text-slate-800 font-semibold check-date">—</span>
                </div>
                <div class="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-full px-3 py-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
                    <span class="text-slate-500 font-medium">Check By</span>
                    <span class="text-slate-800 font-semibold">WHI</span>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">

            {{-- Total Item --}}
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Total Item</p>
                <p class="text-3xl font-bold text-slate-800 total-item skeleton h-8 w-16"></p>
            </div>

            {{-- Checking Item --}}
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Checking Item</p>
                <p class="text-3xl font-bold text-slate-800 checking-item skeleton h-8 w-16"></p>
            </div>

            {{-- L/D Random Check --}}
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">L/D Random Check</p>
                <p class="text-3xl font-bold text-slate-800 random-check skeleton h-8 w-16"></p>
            </div>

            {{-- Diff First Time --}}
            <div class="bg-red-50 border border-red-200 rounded-xl p-4">
                <p class="text-[11px] font-semibold text-red-400 uppercase tracking-wider mb-2">Diff. (First Time)</p>
                <p class="text-3xl font-bold text-red-700 diff-item-first-time skeleton h-8 w-16"></p>
            </div>

            {{-- Diff After Re-check --}}
            <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p class="text-[11px] font-semibold text-amber-500 uppercase tracking-wider mb-2">Diff. (After Re-check)</p>
                <p class="text-3xl font-bold text-amber-700 diff-item-after-recheck skeleton h-8 w-16"></p>
            </div>

        </div>

        <div class="bg-slate-50 rounded-xl border border-slate-200 mb-6 overflow-hidden">
            <div class="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                <h2 class="text-sm font-semibold text-slate-700">Inventory Detail</h2>
            </div>
            <div class="overflow-x-auto p-4">
                <table class="table table-sm w-full" id="table"></table>
            </div>
        </div>

        <div class="card bg-white shadow border border-base-200 overflow-hidden">
            <div class="card-body p-0">
                <div class="bg-info text-white px-4 py-3 border-b">
                    <div class="card-title text-sm">
                        <i class="icofont-paper-clip"></i>
                        <span>ไฟล์แนบเพิ่มเติม</span>
                    </div>
                </div>

                <div class="p-4 file-contents">
                    <ul id="attachFileList" class="space-y-2">
                        <li id="attachFilesLoading" class="text-xs text-base-content/40 italic">กำลังโหลด...</li>
                    </ul>
                </div>
            </div>
        </div>


        <div class="mt-6 aprv-section" style="display: none">
            <div class="max-w-xl mx-auto">
                <div class="space-y-2">
                    <div>
                        <label class="label">
                            <span class="label-text font-medium">Attachment</span>
                        </label>
                        <input type="file" class="file-input file-input-sm file-input-bordered w-full attach-file" />
                    </div>
                    <div>
                        <label class="label">
                            <span class="label-text font-medium">Remark</span>
                        </label>
                        <textarea class="textarea textarea-sm textarea-bordered w-full min-h-30" id="remark" placeholder="Enter your remark here..."></textarea>
                    </div>
                    <div class="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                        <button class="btn btn-success min-w-35 btn-approve" data-action="approve"> Approve</button>
                        <button class="btn btn-error min-w-35 btn-approve" data-action="reject"> Reject</button>
                    </div>
                </div>
            </div>
        </div>

        {{-- ─── Approval flow timeline ─────────────────────────────────────────── ─ --}}
        <div class="mt-5 flow"></div>

    </div>{{-- /outer card --}}
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/psCih.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
