@extends('layouts/webflowTemplate')

<script>
    window.CURRENT_EMPNO = @json($empno ?? '');
</script>

@section('contents')
<div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <!-- Header Title -->
    <div>
        <h1 class="text-xl font-bold text-slate-800 flex items-center gap-2">
            📊 รายงานเอกสาร Environmental Aspect & Risk (FE-ASP Report)
        </h1>
        <p class="text-xs text-slate-500 mt-1">ค้นหา ติดตามสถานะเอกสาร และเปิดดูไฟล์แนบทบทวนประจำปี</p>
    </div>

    <!-- Filter Card -->
    <div class="bg-white border border-slate-200 rounded-2xl shadow-xs p-5">
        <form id="formFilter" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 items-end">
            <div>
                <label class="text-[11px] font-bold text-slate-600 block mb-1">DOC NO. / CONTROL NO.</label>
                <input type="text" id="filter_docNo" placeholder="เช่น AMEC-AR-..." 
                       class="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20">
            </div>

            <div>
                <label class="text-[11px] font-bold text-slate-600 block mb-1">DIVISION (ฝ่าย)</label>
                <select id="filter_divCode" class="w-full h-9 px-2 border border-slate-200 rounded-lg text-xs">
                    <option value="">-- ทั้งหมด (All) --</option>
                    @foreach ($divisions as $div)
                        <option value="{{ $div['SDIVCODE'] }}">{{ $div['SDIVCODE'] }} : {{ $div['DIV_NAME'] }}</option>
                    @endforeach
                </select>
            </div>

            <div>
                <label class="text-[11px] font-bold text-slate-600 block mb-1">DEPARTMENT (แผนก)</label>
                <select id="filter_depCode" class="w-full h-9 px-2 border border-slate-200 rounded-lg text-xs">
                    <option value="">-- ทั้งหมด (All) --</option>
                    @foreach ($departments as $dept)
                        <option value="{{ $dept['SDEPCODE'] }}">{{ $dept['SDEPCODE'] }} : {{ $dept['DEPT_NAME'] }}</option>
                    @endforeach
                </select>
            </div>

            <div>
                <label class="text-[11px] font-bold text-slate-600 block mb-1">STATUS (สถานะ)</label>
                <select id="filter_status" class="w-full h-9 px-2 border border-slate-200 rounded-lg text-xs">
                    <option value="">-- ทั้งหมด (All) --</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="PROCESS">PROCESS</option>
                    <option value="APPROVE">APPROVE</option>
                    <option value="REJECT">REJECT</option>
                </select>
            </div>

            <div>
                <label class="text-[11px] font-bold text-slate-600 block mb-1">ช่วงวันที่สร้าง (จาก)</label>
                <input type="date" id="filter_startDate" class="w-full h-9 px-2 border border-slate-200 rounded-lg text-xs">
            </div>

            <div>
                <label class="text-[11px] font-bold text-slate-600 block mb-1">ช่วงวันที่สร้าง (ถึง)</label>
                <input type="date" id="filter_endDate" class="w-full h-9 px-2 border border-slate-200 rounded-lg text-xs">
            </div>

            <div class="lg:col-span-6 flex justify-end gap-2 pt-2">
                <button type="button" id="btnResetFilter" class="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer">
                    รีเซ็ต
                </button>
                <button type="submit" id="btnSearchFilter" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1.5">
                    🔍 ค้นหา
                </button>
            </div>
        </form>
    </div>

    <!-- Data Table Card -->
    <div class="bg-white border border-slate-200 rounded-2xl shadow-xs p-5">
        <div class="overflow-x-auto">
            <table id="tblReport" class="w-full text-xs text-left stripe hover" style="width:100%">
                <!-- DataTables JS จัดการ Columns -->
            </table>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script src="{{ base_url('assets/dist/js/feaspreport.js') }}"></script>
@endsection