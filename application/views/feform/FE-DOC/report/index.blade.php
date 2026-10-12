@extends('layouts/webflowTemplate')

@section('contents')
<input type="hidden" id="EMPNOHid" value="{{ $EMPNO ?? '' }}" />

<div class="flex flex-col w-full px-4 my-6 font-sans max-w-7xl mx-auto">
    <!-- Header -->
    <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold text-slate-800">📊 รายงานเอกสาร FE Document (FeDocReport)</h1>
            <p class="text-xs text-slate-500">ค้นหา ติดตามสถานะ และเปิดดูเอกสารพร้อมไฟล์แนบ</p>
        </div>
    </div>

    <!-- Filter Card -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 mb-6">
        <form id="form" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
            <div>
                <label class="text-[11px] font-bold text-slate-500 uppercase block mb-1">Doc No. / Header ID</label>
                <input type="text" id="keyword" name="keyword" placeholder="เช่น FE-DOC-2026-..." 
                       class="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500/20">
            </div>

            <div>
                <label class="text-[11px] font-bold text-slate-500 uppercase block mb-1">Document Type</label>
                <select id="doc_type" name="doc_type" class="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20">
                    <option value="">-- ทั้งหมด (All Types) --</option>
                    @if(!empty($docTypes))
                        @foreach ($docTypes as $item)
                            <option value="{{ $item->DOC_TYPE_CODE }}">{{ $item->DOC_TYPE_CODE }} - {{ $item->DOC_TYPE_NAME }}</option>
                        @endforeach
                    @endif
                </select>
            </div>

            <div>
                <label class="text-[11px] font-bold text-slate-500 uppercase block mb-1">Status</label>
                <select id="status" name="status" class="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20">
                    <option value="">-- ทั้งหมด (All Status) --</option>
                    <option value="PROCESS">PROCESS</option>
                    <option value="APPROVE">APPROVE</option>
                    <!-- <option value="REJECT">REJECT</option>
                    <option value="DRAFT">DRAFT</option> -->
                </select>
            </div>

            <div class="lg:col-span-2">
                <label class="text-[11px] font-bold text-slate-500 uppercase block mb-1">ช่วงวันที่ออกเอกสาร</label>
                <div class="grid grid-cols-2 gap-2">
                    <input type="date" id="date_from" name="date_from" class="h-10 px-2 bg-white border border-slate-200 rounded-lg text-xs">
                    <input type="date" id="date_to" name="date_to" class="h-10 px-2 bg-white border border-slate-200 rounded-lg text-xs">
                </div>
            </div>

            <div class="flex gap-2">
                <button type="submit" class="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer">
                    🔍 ค้นหา
                </button>
                <button type="button" id="exportReport" class="h-10 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer">
                    📥 Excel
                </button>
                <button type="button" id="resetReport" class="h-10 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold cursor-pointer">
                    รีเซ็ต
                </button>
            </div>
        </form>
    </div>

    <!-- Data Table Card -->
    <div id="result" class="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 hidden">
        <div class="mb-3 text-xs font-bold text-slate-500" id="reportSummary"></div>
        <div class="overflow-x-auto">
            <table id="reportTable" class="w-full text-left text-xs border-collapse"></table>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script src="{{ base_url('assets/dist/js/fedocreport.js') }}"></script>
@endsection