@extends('layouts/webflowTemplate')

@section('styles')
<style>
/* ================== 1. จัดการตัวหนังสือหัวข้อ (ทั้งซ้ายและขวา) ================== */
.form-overlap-wrapper > div:first-child,
.location-overlap-wrapper > div:first-child {
    font-size: 16px !important; 
    position: relative !important;
    z-index: 10 !important; 
    width: fit-content !important;
    margin-left: 24px !important; 
    padding: 0 10px !important; 
    
    background-color: hsl(var(--b1)) !important; 
    
    border-radius: 4px !important;
    margin-bottom: 0 !important; 
}

/* ================== 2. จัดการกล่องตาราง (ทั้งซ้ายและขวา) ================== */
.form-overlap-wrapper > div:nth-child(2),
.location-overlap-wrapper > div:nth-child(2) {
    margin-top: -14px !important; 
    position: relative !important;
    z-index: 1 !important; 
    width: 100% !important; 
    max-width: 100% !important;
}
</style>
@endsection

@section('contents')
<!-- ================== ส่วนที่ 1: เลือกประเภทรายงาน ================== -->
<div class="mt-6 mb-4 p-4 bg-base-200/50 rounded-box border border-base-300">
    <label class="font-bold text-gray-800 text-[15px] mb-3 block">Select Report Type :</label>
    <div class="flex flex-col sm:flex-row gap-6">
        <label class="label cursor-pointer justify-start gap-3">
            <input type="radio" name="reportType" value="detail_listing" class="radio radio-primary" checked />
            <span class="label-text font-medium text-base">DETAIL PHYSICAL COUNT FIXED ASSETS LISTING</span>
        </label>
        <label class="label cursor-pointer justify-start gap-3">
            <input type="radio" name="reportType" value="status_checking" class="radio radio-primary" />
            <span class="label-text font-medium text-base">REPORTS CHECK STATUS COMPLETE AND INCOMPLETE</span>
        </label>
    </div>
</div>
<!-- ================== ส่วนที่ 2: เงื่อนไขการกรองข้อมูล (Filter) รวมกล่องเดียว ================== -->
<div class="form-overlap-wrapper w-full mt-6">
    <div class="font-bold font-heading">Report Criteria</div>
    <div class="h-fit w-full bg-base-200 border border-base-300 p-6 rounded-box relative">
        
        <!-- จัดเรียงฟิลด์ในรูปแบบ Grid แบ่งเป็น 3 คอลัมน์ -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <!-- 1. Form Year (ปีที่ออก Form) -->
            <div class="flex flex-col gap-1">
                <label class="font-semibold text-sm text-gray-600">Year of Issue</label>
                <select id="formYear" name="formYear" class="select select-bordered w-full font-normal">
                    <option value="" selected>-- Select Year --</option>
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                </select>
            </div>

            <!-- 2. Location Code -->
            <div class="flex flex-col gap-1">
                <label class="font-semibold text-sm text-gray-600">Location Code</label>
                <input type="text" id="locationCode" name="locationCode" placeholder="Ex. 532" class="input input-bordered w-full" />
            </div>

            <!-- 3. Asset Group -->
            <div class="flex flex-col gap-1">
                <label class="font-semibold text-sm text-gray-600">Asset Group</label>
                <select id="assetGroup" name="assetGroup" class="select select-bordered w-full font-normal">
                    <option value="" selected>-- Select Asset Group --</option>
                    <option value="004">004 - MACHINERY</option>
                    <!-- ดึง option กลุ่มอื่นๆ เพิ่มเติมจาก DB -->
                </select>
            </div>

            <!-- 4. Status -->
            <div class="flex flex-col gap-1">
                <label class="font-semibold text-sm text-gray-600">Status</label>
                <select id="docStatus" name="docStatus" class="select select-bordered w-full font-normal">
                    <option value="" selected>All Status</option>
                    <option value="complete">Complete</option>
                    <option value="not_complete">Not Complete</option>
                </select>
            </div>

            <!-- 5. Asset No. -->
            <div class="flex flex-col gap-1">
                <label class="font-semibold text-sm text-gray-600">Asset No.</label>
                <input type="text" id="assetNo" name="assetNo" placeholder="Ex. 049996720" class="input input-bordered w-full" />
            </div>

        </div>
    </div>
</div>
<!-- ================== ส่วนที่ 3: ปุ่ม Action ================== -->
<div class="mt-8 pt-4 border-t border-base-300 flex flex-wrap items-center justify-end gap-3">
    
    <!-- ปุ่ม Clear (ใช้ type="reset" เพื่อล้างค่าในฟอร์มทั้งหมดอัตโนมัติ) -->
    <button type="reset" id="btnClear" class="btn btn-ghost hover:bg-base-200">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Clear Filter
    </button>
    
    <!-- ปุ่ม Export Excel (ใช้สีเขียว btn-success ตามมาตรฐานการดึงข้อมูลลง Excel) -->
    <button type="button" id="btnExport" class="btn btn-success text-white shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export Excel
    </button>

</div>
@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/report.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection