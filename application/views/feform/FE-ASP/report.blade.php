@extends('layouts/webflowTemplate')

@section('contents')

<script>
    window.IS_ADMIN               = @json($isAdmin ?? false);
    window.IS_SUPER_ADMIN         = @json($isSuperAdmin ?? false);
    window.CURRENT_EMPNO              = @json($EMPNO ?? false);

</script>
<!-- <div class="load flex justify-center items-center py-12">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
</div> -->


<div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
    
    <!-- Title & Top Action -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 class="text-xl font-bold text-slate-800 flex items-center gap-2">
                📊 รายงานเอกสาร Environmental Aspect & Risk (AMEC-AR Report)
            </h1>
            <p class="text-xs text-slate-500 mt-0.5">ค้นหา ติดตามสถานะเอกสาร ตรวจสอบรอบปี และประวัติเอกสารย้อนหลัง</p>
            <input type="hidden" id="EMPNOHid" value="{{ $EMPNO ?? '' }}" />
        </div>
    </div>

    <!-- 1. Fiscal Year Summary Banner Card (ใส่ Inline Background ป้องกัน CSS หลุด) -->
    <div id="yearly-summary-banner" 
         class="rounded-2xl p-5 shadow-sm border border-slate-700/60"
         style="background-color: #0f172a; color: #ffffff;">
        <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div class="space-y-1">
                <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase" 
                          style="background-color: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.3);">
                        Fiscal Year Status
                    </span>
                    <h2 class="text-sm font-bold text-white">
                        รอบการทบทวนประจำปี FY<span id="banner-year-txt">2026</span> (1 เม.ย. <span id="banner-start-year">2026</span> – 31 มี.ค. <span id="banner-end-year">2027</span>)
                    </h2>
                </div>
                <p id="banner-status-desc" class="text-xs" style="color: #cbd5e1;">
                    กำลังตรวจสอบสถานะการอนุมัติเอกสาร...
                </p>
            </div>

            <div class="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
                <div class="flex items-center gap-3">
                    <div class="text-right">
                        <span class="text-[10px] block font-medium" style="color: #94a3b8;">อนุมัติแล้ว</span>
                        <span id="banner-count-txt" class="text-base font-extrabold" style="color: #34d399;">0 / 0</span>
                    </div>
                    <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs" 
                         id="banner-percent-badge"
                         style="border: 2px solid rgba(16, 185, 129, 0.4); background-color: rgba(16, 185, 129, 0.1); color: #34d399;">
                        0%
                    </div>
                </div>

                <!-- Action Buttons บน Banner -->
                <div class="flex items-center gap-2">
                    <!-- ปุ่มตรวจความครบถ้วนและสั่งสร้าง FE-DOC -->
                    <button type="button" id="btnCheckAndCreateFeDoc" 
                            class="px-3.5 py-2 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer hover:brightness-110"
                            style="background-color: #2563eb;">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        ตรวจสอบรอบปี & สร้าง FE-DOC
                    </button>

                    <!-- ปุ่มดาวน์โหลด Cover Excel -->
                    <button type="button" id="btnDownloadCoverExcel" 
                            class="hidden px-3.5 py-2 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer hover:brightness-110"
                            style="background-color: #059669;">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.5L19 7.5V19a2 2 0 01-2 2z"/></svg>
                        Download Cover (Excel)
                    </button>
                </div>
            </div>
        </div>
    </div>

    
    <!-- 2. Filter Form Card -->
    <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <form id="formFilter" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 items-end">
            <div>
                <label class="text-[11px] font-bold text-slate-600 block mb-1">FISCAL YEAR (รอบปี)</label>
                <select id="filter_fiscalYear" class="w-full h-9 px-2 border border-slate-200 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50/30">
                    @foreach ($fiscalYears as $item)
                        <option value="{{ $item['year'] }}" {{ $item['isSelected'] ? 'selected' : '' }}>
                            {{ $item['label'] }}
                        </option>
                    @endforeach
                </select>
            </div>

            <div>
                <label class="text-[11px] font-bold text-slate-600 block mb-1">CONTROL NO. / DOC NO.</label>
                <input type="text" id="filter_docNo" placeholder="เช่น AMEC-AR-..." class="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs">
            </div>

            <div>
                <label class="text-[11px] font-bold text-slate-600 block mb-1">DIVISION</label>
                <select id="filter_divCode" class="w-full h-9 px-2 border border-slate-200 rounded-lg text-xs">
                    <option value="">-- ทั้งหมด (All) --</option>
                    @foreach ($divisions as $div)
                        <option value="{{ $div['SDIVCODE'] }}">{{ $div['SDIVCODE'] }} : {{ $div['DIV_NAME'] }}</option>
                    @endforeach
                </select>
            </div>

            <div>
                <label class="text-[11px] font-bold text-slate-600 block mb-1">DEPARTMENT</label>
                <select id="filter_depCode" class="w-full h-9 px-2 border border-slate-200 rounded-lg text-xs">
                    <option value="">-- ทั้งหมด (All) --</option>
                    @foreach ($departments as $dept)
                        <option value="{{ $dept['SDEPCODE'] }}">{{ $dept['SDEPCODE'] }} : {{ $dept['DEPT_NAME'] }}</option>
                    @endforeach
                </select>
            </div>

            <!-- เพิ่ม Review period Dropdown -->
            <div>
                <label class="text-[11px] font-bold text-slate-600 block mb-1">REVIEW PERIOD</label>
                <select id="filter_reviewPeriod" class="w-full h-9 px-2 border border-slate-200 rounded-lg text-xs">
                    <option value="">-- ทั้งหมด (All) --</option>
                    <option value="YEARLY">Yearly review</option>
                    <option value="CHANGING">Review on changing</option>
                </select>
            </div>

            <div>
                <label class="text-[11px] font-bold text-slate-600 block mb-1">STATUS</label>
                <select id="filter_status" class="w-full h-9 px-2 border border-slate-200 rounded-lg text-xs">
                    <option value="">-- ทั้งหมด (All) --</option>
                    <option value="APPROVE">APPROVE</option>
                    <option value="PROCESS">PROCESS</option>
                    <option value="DRAFT">DRAFT</option>
                </select>
            </div>

            <div class="flex justify-end gap-2 pt-1">
                <button type="button" id="btnResetFilter" class="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer">
                    รีเซ็ต
                </button>
                <button type="button" id="btnSearch" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-2xs cursor-pointer flex items-center gap-1">
                    🔍 ค้นหา
                </button>
            </div>
        </form>
    </div>

    <!-- 3. Report DataTable (ปล่อยว่างได้เลย DataTables JS จะวาด thead ให้เอง) -->
    <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div class="overflow-x-auto">
            <table id="tblReport" class="w-full text-xs stripe hover" style="width:100%"></table>
        </div>
    </div>
</div>

<!-- 4. Modal แสดงประวัติของ Control No. (History Modal) -->
<div id="modalHistory" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs hidden">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col mx-4 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
                <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                    📜 ประวัติเอกสารทั้งหมดของ Control No.: <span id="modal-control-txt" class="text-emerald-700"></span>
                </h3>
                <p class="text-[11px] text-slate-500 mt-0.5">แสดง Revision และประวัติการทบทวนย้อนหลังของเอกสารฉบับนี้</p>
            </div>
            <button type="button" id="btnCloseModalHistory" class="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer">✕</button>
        </div>
        
        <div class="p-6 overflow-y-auto flex-1">
            <table class="w-full text-xs text-left border-collapse border border-slate-200 rounded-lg overflow-hidden">
                <thead class="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                        <th class="p-2.5 text-center">Rev.</th>
                        <th class="p-2.5">Doc No.</th>
                        <th class="p-2.5">Period</th>
                        <th class="p-2.5">Detail</th>
                        <th class="p-2.5 text-center">Status</th>
                        <th class="p-2.5">Reviewed Date</th>
                        <th class="p-2.5 text-center">Files</th>
                    </tr>
                </thead>
                <tbody id="tblHistoryBody" class="divide-y divide-slate-100"></tbody>
            </table>
        </div>
    </div>
</div>

@endsection

@section('scripts')
<script src="{{ base_url('assets/dist/js/feaspreport.js') }}"></script>
@endsection