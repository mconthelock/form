@extends('layouts/webflowTemplate')

@section('contents')
    {{-- การส่งข้อมูลจาก PHP ไป JS แบบนี้ดีอยู่แล้วครับ --}}
    <div class="form-data" data-nfrmno="{{ $NFRMNO }}" data-vorgno="{{ $VORGNO }}" data-cyear="{{ $CYEAR }}" data-cyear2="{{ $CYEAR2 }}" data-nrunno="{{ $NRUNNO }}" data-empno="{{ $EMPNO }}"></div>

    {{-- Matching Create Page Style --}}
    <section class="relative py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-indigo-50/60 min-h-screen overflow-hidden">
        <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.08),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.08),transparent_32%),radial-gradient(circle_at_50%_90%,rgba(16,185,129,0.08),transparent_28%)]"></div>

        <div class="relative w-full max-w-[1700px] mx-auto">
            {{-- Report Card matching Create page style --}}
            <div class="bg-white/90 backdrop-blur shadow-2xl rounded-2xl border border-slate-200/80 ring-1 ring-slate-100">

                {{-- Card Header matching Create page --}}
                <div class="px-8 py-6 border-b border-slate-200/80 bg-gradient-to-r from-slate-50 to-white rounded-t-2xl">
                    <div class="flex flex-col gap-6">
                        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h2 class="text-3xl font-extrabold text-slate-900 leading-tight">User ID & Authorization Review Report</h2>
                                <p class="text-sm text-slate-500 mt-1">รายงานผลการตรวจสอบ User ID และ Authorization</p>
                            </div>
                            <div class="flex flex-wrap items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                                <span class="text-sm font-semibold text-slate-700">Review Period</span>
                                <div class="flex items-center gap-3">
                                    <label class="flex items-center gap-2 text-slate-600 text-sm font-medium">
                                        <i class="fa-solid fa-calendar-day text-primary"></i>
                                        <span id="period-text" class="badge badge-primary font-semibold"></span>
                                    </label>
                                    <span class="h-5 w-px bg-slate-200"></span>
                                    <label class="flex items-center gap-2 text-slate-600 text-sm font-medium">
                                        <i class="fa-solid fa-calendar text-indigo-500"></i>
                                        <span id="year-text" class="badge badge-primary font-semibold"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {{-- Card Body matching Create page --}}
                <div class="p-8 space-y-6">
                    {{-- Executive Summary Section --}}
                    <div class="bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-200/50 rounded-xl p-6 shadow-sm">
                        <div class="flex items-start gap-4">
                            <div class="space-y-3 text-sm leading-relaxed text-slate-700">
                                <p class="text-justify">
                                    According to AMEC have to review User ID and Authentication of concern system to comply with ITGC (IT General Control) regulation.
                                </p>
                                <p class="text-justify">
                                    This time each concern division have been checked and request for corrective already. IS Dept would like to summary the result for your approval.
                                </p>
                                <div class="mt-4 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r">
                                    <div class="flex items-center gap-2">
                                        <i class="fa-solid fa-circle-exclamation text-amber-600"></i>
                                        <p class="font-semibold text-amber-900">
                                            Could you please approval "User ID and Authentication regular review result".
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {{-- Data Table Section matching Create page --}}
                    <div class="overflow-hidden border border-slate-200 rounded-2xl shadow-xl bg-white">
                        <div class="overflow-x-auto">
                            <table id="systemsTable" class="table table-pin-rows w-full text-sm align-middle">
                                {{-- Table Header matching Create page style --}}
                                <thead class="bg-slate-50/90 text-slate-700 border-b border-slate-200">
                                    <tr>
                                        <th rowspan="2" class="w-[50px] text-center font-black uppercase tracking-wide border-r border-slate-200 text-slate-500">No.</th>
                                        <th rowspan="2" class="min-w-[280px] text-left font-semibold border-r border-slate-200 text-slate-800">System (ชื่อระบบหลัก)</th>
                                        <th rowspan="2" class="w-[140px] text-center font-semibold border-r border-slate-200 text-slate-800">Total Users</th>
                                        <th rowspan="2" class="w-[140px] text-center font-semibold border-r border-slate-200 text-slate-800">Unmatched</th>
                                        <th colspan="3" class="text-center font-bold text-primary border-b-2 border-primary/20 bg-gradient-to-r from-indigo-50 to-sky-50 uppercase tracking-wide">
                                            <i class="fas fa-file-alt mr-2"></i> Review Results & Details
                                        </th>
                                    </tr>
                                    <tr class="bg-slate-50 text-slate-600">
                                        <th class="w-[240px] text-center font-semibold border-r border-slate-200">Program Name</th>
                                        <th class="w-[240px] text-center font-semibold border-r border-slate-200">Delete / Change <span class="text-xs text-slate-400">(Count)</span></th>
                                        <th class="min-w-[420px] text-center font-semibold">Detail (User IDs / Reasons)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {{-- Data will be populated via JavaScript --}}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {{-- Remark Section matching Create page style --}}
                    <div class="mt-6" id="remark-div">
                        <label for="remark-view" class="block text-lg font-semibold text-slate-800 mb-2">Remark (หมายเหตุ)</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-3 flex items-start pt-3 text-slate-300">
                                <i class="fa-regular fa-comment-dots"></i>
                            </div>
                            <div id="remark-view" class="min-h-[80px] w-full text-base pl-10 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-lg text-slate-700"></div>
                        </div>
                    </div>
                </div>

                {{-- Card Footer matching Create page --}}

                @if ($mode == '02')
                    <div class="flex flex-col items-center gap-3">
                        <div class="flex gap-3">
                            <button class="btn btn-success btn-lg px-12 shadow-lg rounded-xl text-base font-semibold btn-submit" data-action="approve">
                                Approve
                            </button>
                            <button class="btn btn-error btn-lg px-12 shadow-lg rounded-xl text-base font-semibold btn-submit" data-action="reject">
                                Reject
                            </button>
                        </div>
                    </div>
                @endif


                {{-- Workflow Section --}}
                @if ($mode == '02' || true)
                    <div class="px-8 py-6">
                        <div class="flow"></div>
                    </div>
                @endif
            </div>
        </div>
    </section>
@endsection
@section('scripts')
    {{-- การเรียก Script แบบนี้ถูกต้องตามหลักปฏิบัติครับ --}}
    <script src="{{ $_ENV['APP_JS'] }}/RgrSummaryReport.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
