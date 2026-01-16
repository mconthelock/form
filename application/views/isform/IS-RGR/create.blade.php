@extends('layouts/webflowTemplate')

@section('contents')
    <div class="form-data" data-nfrmno="{{ $NFRMNO }}" data-vorgno="{{ $VORGNO }}" data-cyear="{{ $CYEAR }}" data-cyear2="{{ $CYEAR2 }}" data-nrunno="{{ $NRUNNO }}" data-empno="{{ $EMPNO }}"></div>

    <section class="relative py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-indigo-50/60 min-h-screen overflow-hidden">
        <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.08),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.08),transparent_32%),radial-gradient(circle_at_50%_90%,rgba(16,185,129,0.08),transparent_28%)]"></div>
        <form id="reviewForm" method="POST" class="relative w-full max-w-[1700px] mx-auto">
            <div class="bg-white/90 backdrop-blur shadow-2xl rounded-2xl border border-slate-200/80 ring-1 ring-slate-100">
                {{-- Card Header --}}
                <div class="px-8 py-6 border-b border-slate-200/80 bg-gradient-to-r from-slate-50 to-white rounded-t-2xl">
                    <div class="flex flex-col gap-6">
                        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h2 class="text-3xl font-extrabold text-slate-900 leading-tight">User ID & Authorization Review</h2>
                                <p class="text-sm text-slate-500 mt-1">กรุณากรอกจำนวนการดำเนินการ (Delete/Change) และรายละเอียด (User IDs/Reasons)</p>
                            </div>
                            <div class="flex flex-wrap items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                                <span class="text-sm font-semibold text-slate-700">Review Period</span>
                                <div class="flex items-center gap-3">
                                    <label class="flex items-center gap-2 text-slate-600 text-sm font-medium">
                                        <i class="fa-solid fa-calendar-day text-primary"></i>
                                        <select name="review_period" id="period" class="select select-bordered select-sm font-semibold cursor-pointer bg-white/80">
                                            <option value="">เลือกช่วง</option>
                                            <option value="1">1st half</option>
                                            <option value="2">2nd half</option>
                                        </select>
                                    </label>
                                    <span class="h-5 w-px bg-slate-200"></span>
                                    @php
                                        $currentYear = date('Y');
                                        $startYear = $currentYear - 1;
                                        $endYear = $currentYear + 1;
                                    @endphp
                                    <label class="flex items-center gap-2 text-slate-600 text-sm font-medium">
                                        <i class="fa-solid fa-calendar text-indigo-500"></i>
                                        <select name="review_year" id="year" class="select select-bordered select-sm w-28 font-semibold cursor-pointer bg-white/80">
                                            @for ($year = $startYear; $year <= $endYear; $year++)
                                                <option value="{{ $year }}" {{ $year == $currentYear ? 'selected' : '' }}>{{ $year }}</option>
                                            @endfor
                                        </select>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {{-- Card Body --}}
                <div class="p-8 space-y-6">
                    <div class="overflow-hidden border border-slate-200 rounded-2xl shadow-xl bg-white">
                        <div class="overflow-x-auto">
                            <table id="systemsTable" class="table table-pin-rows w-full text-sm align-middle">
                                <thead class="bg-slate-50/90 text-slate-700 border-b border-slate-200">
                                    <tr>
                                        <th rowspan="2" class="w-[50px] text-center font-black uppercase tracking-wide border-r border-slate-200 text-slate-500">No.</th>
                                        <th rowspan="2" class="min-w-[280px] text-left font-semibold border-r border-slate-200 text-slate-800">System (ชื่อระบบหลัก)</th>
                                        <th rowspan="2" class="w-[140px] text-center font-semibold border-r border-slate-200 text-slate-800">Total Users</th>
                                        <th rowspan="2" class="w-[140px] text-center font-semibold border-r border-slate-200 text-slate-800">Unmatched</th>
                                        <th colspan="3" class="text-center font-bold text-primary border-b-2 border-primary/20 bg-gradient-to-r from-indigo-50 to-sky-50 uppercase tracking-wide">
                                            <i class="fas fa-keyboard mr-2"></i> Action & Detail Input
                                        </th>
                                    </tr>
                                    <tr class="bg-slate-50 text-slate-600">
                                        <th class="w-[240px] text-center font-semibold border-r border-slate-200">Program Name</th>
                                        <th class="w-[240px] text-center font-semibold border-r border-slate-200">Delete / Change <span class="text-xs text-slate-400">(Count)</span></th>
                                        <th class="min-w-[420px] text-center font-semibold">Detail (User IDs / Reasons)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Data will be loaded here by jQuery AJAX -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="remark-div mt-2" id="remark-div">
                        <label for="remark" class="block text-lg font-semibold text-slate-800 mb-2">Remark (หมายเหตุ)</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-3 flex items-start pt-3 text-slate-300">
                                <i class="fa-regular fa-comment-dots"></i>
                            </div>
                            <textarea id="remark" name="remark" rows="4" class="textarea textarea-bordered w-full text-base pl-10 bg-white/80" placeholder="Enter any additional remarks here..."></textarea>
                        </div>
                    </div>
                </div>
                {{-- Card Footer --}}
                <div class="px-8 py-5 bg-slate-50 border-t border-slate-200 rounded-b-2xl">
                    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div class="text-sm text-slate-600 flex items-center gap-2">
                            <i class="fa-solid fa-circle-info text-primary"></i>
                            <span>ตรวจสอบข้อมูลให้ครบถ้วนก่อนบันทึก ระบบจะบันทึกผลทั้งหมดในครั้งเดียว</span>
                        </div>
                        <button class="btn btn-primary btn-lg px-12 shadow-lg rounded-xl text-base font-semibold" type="submit">
                            <i class="fa-solid fa-floppy-disk mr-3"></i> Save All
                        </button>
                    </div>
                </div>
            </div>
        </form>
    </section>
@endsection
@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/RgrSummary.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
