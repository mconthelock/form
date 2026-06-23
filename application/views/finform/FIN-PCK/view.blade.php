@extends('layouts/webflowTemplate')

@section('styles')
<style>
/* 1. จัดการกล่องครอบด้านนอกให้เป็นจุดอ้างอิง */
#magic-form-wrapper {
    position: relative;
    margin-top: 24px; /* ดันกล่องลงมาเพื่อเว้นพื้นที่ให้ตัวหนังสือลอยขึ้นไปได้ */
}

/* 2. พุ่งเป้าไปจับที่ตัวหนังสือ "Form Information" โดยตรงผ่าน Class */
#magic-form-wrapper .text-xl.font-bold {
    position: absolute !important; /* บังคับลอย */
    top: -14px !important; /* ดึงขึ้นไป 14px (ครึ่งนึงของตัวอักษร) เพื่อให้ทับเส้นขอบพอดี */
    left: 24px !important; /* ขยับจากขอบซ้าย ให้ดูสวยงาม */
    margin-bottom: 0 !important; /* ลบล้าง mb-5 ที่ฟังก์ชันแถมมาให้ */
    padding: 0 10px !important; /* เว้นระยะซ้าย-ขวา เพื่อเป็นพื้นที่ไว้บังเส้นขอบ */
    
    /* ⚠️ สำคัญมาก: ต้องเปลี่ยนสีตรงนี้ให้ตรงกับสี "พื้นหลังของหน้าจอคุณ" */
    background-color: #f4f6f8 !important; 
    
    z-index: 10 !important; /* บังคับให้อยู่เลเยอร์บนสุด */
}
</style>
@endsection
@section('contents')
<div class="hidden form-info" nfrmno="{{$NFRMNO}}" vorgno="{{$VORGNO}}" cyear="{{$CYEAR}}" mode="{{$mode}}"
    cyear2="{{$mode !=1 ? $CYEAR2 : '' }}" nrunno="{{$mode !=1 ? $NRUNNO : '' }}"></div>
<div class="hidden apv-data" empno="{{$empno}}"></div>
<div class="p-6 max-w-7xl mx-auto flex flex-col gap-6 min-w-[70vw]">
    
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-100 shadow-md rounded-lg p-6">
        <div>
            <h1 class="text-2xl font-bold text-base-content flex items-center gap-2">
               Fixed Asset Physical Checking Form
            </h1>
        </div>
    </div>

    <div class="bg-base-100 shadow-md rounded-lg p-6">
        <form id="frmmain">
            <div  class="magic-form-wrapper">
            <section id="form-detail">
            </section>
            </div>
            <div class="max-w-2xl mx-auto py-8">
                
                <div class="form-control w-full">
                    <label class="label">
                        <span class="label-text text-base font-medium required">Browse File</span>
                    </label>
                    <input type="file" id="excelFile" accept=".xlsx" required class="file-input file-input-bordered file-input-primary w-full req" />
                    <label class="label">
                        <span class="label-text-alt text-base-content/60">Supports .xlsx files only.</span>
                    </label>
                </div>
                <div class="divider mt-8 mb-6"></div>
                <div class="flex flex-wrap justify-center gap-4">
                    <button type="button" id="btnCancel" class="btn btn-ghost px-6">
                        Cancel
                    </button>
                    
                    <button type="button" id="btnRequest" class="btn btn-primary px-6 gap-2">
                        Request
                    </button>
                </div>

            </div>
             <div id="form-action-container"></div>
        </form>
    </div>

</div>
@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/view.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection