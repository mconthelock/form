@extends('layouts/webflowTemplate')
@section('styles')
@endsection
@section('contents')
    {{-- <div class="bg-base-200/40 min-h-full"> --}}
    <div class="form-data" data-nfrmno="{{ $nfrmno }}" data-vorgno="{{ $vorgno }}" data-cyear="{{ $cyear }}" data-cyear2="{{ $cyear2 }}" data-nrunno="{{ $nrunno }}" data-empno="{{ $empno }}"></div>
    <div class=" bg-slate-100">
        <div class="container mx-auto p-4 md:p-6 lg:p-8 space-y-2">

            {{-- Header Card --}}
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {{-- Top accent bar --}}
                <div class="h-1 bg-slate-700"></div>
                <div class="p-6 md:p-5">
                    <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div>
                            <div class="flex items-center gap-2 mb-2">
                                <span class="inline-block w-1.5 h-4 rounded-full bg-slate-500"></span>
                                <span class="text-xs font-semibold text-slate-400 uppercase tracking-widest">Inventory Diff Investigation</span>
                            </div>
                            <h1 class="text-2xl md:text-3xl font-bold text-slate-800 leading-tight">
                                เอกสารสอบสวน
                                <span class="block text-lg md:text-xl font-medium text-slate-500 mt-0.5">Inventory Diff Investigation</span>
                            </h1>
                        </div>
                    </div>

                    <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {{-- วันที่ตรวจสอบ --}}
                        <div class="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                            <div class="shrink-0 w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div class="min-w-0">
                                <p class="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">วันที่ตรวจสอบ</p>
                                <p class="text-sm font-semibold text-slate-700 truncate" id="check_date">-</p>
                            </div>
                        </div>
                        {{-- ผู้รายงาน --}}
                        <div class="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                            <div class="shrink-0 w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div class="min-w-0">
                                <p class="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">ผู้รายงาน / ผู้ตรวจสอบ</p>
                                <p class="text-sm font-semibold text-slate-700 truncate" id="controller"></p>
                            </div>
                        </div>
                        {{-- Zone --}}
                        <div class="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                            <div class="shrink-0 w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div class="min-w-0">
                                <p class="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">Zone</p>
                                <p class="text-sm font-semibold text-slate-700 truncate" id="zone"></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Data Table Card --}}
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="table w-full table-sm md:table-md" id="data-table">
                        <thead>
                            <tr class="bg-slate-700 text-white text-xs uppercase tracking-wider">
                                <th class="text-center w-12 font-semibold">No.</th>
                                <th class="w-32 font-semibold">Item Code</th>
                                <th class="min-w-56 font-semibold">Description</th>
                                <th class="font-semibold">Drawing NO.</th>
                                <th class="text-right w-24 font-semibold">On Hand</th>
                                <th class="text-right w-24 font-semibold">Actual</th>
                                <th class="text-right w-24 font-semibold">Diff</th>
                                <th class="min-w-44 font-semibold">Reason For Diff</th>
                                <th class="min-w-56 font-semibold">Corrective Action</th>
                            </tr>
                        </thead>
                        <tbody>

                        </tbody>
                    </table>
                </div>
            </div>

            {{-- Approve/Reject Section --}}
            @if ($mode == '2')
                {{-- <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div class="h-1 bg-slate-300"></div> --}}
                <div class="p-6 md:p-8">
                    <div class="flex flex-col items-center gap-6 max-w-lg mx-auto">
                        <div class="w-full">
                            <label class="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                                Remark
                            </label>
                            <textarea class="textarea w-full border-slate-300 bg-slate-50 focus:bg-white focus:border-slate-500 focus:outline-none transition-colors rounded-xl text-sm" rows="3" id="remark" placeholder="Enter your remark here..."></textarea>
                        </div>
                        <div class="flex gap-3">
                            <button class="btn btn-success btn-approve gap-2 px-6 rounded-xl" action="approve">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                                </svg>
                                Approve
                            </button>
                            <button class="btn btn-error btn-approve gap-2 px-6 rounded-xl" action="reject">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
                {{-- </div> --}}
            @endif
            <div class="mt-5 flow"></div>
        </div>
    </div>
    {{-- </div> --}}
@endsection
@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/psId.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
