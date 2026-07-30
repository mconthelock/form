@extends('layouts/webflowTemplate')

@section('styles')
<style>

/* บังคับให้ section เป็นตัวหลักในการอ้างอิงตำแหน่ง */
    #form-detail {
        position: relative;
        padding-top: 30px; /* เพิ่มพื้นที่ด้านบนนิดหน่อย */
    }

    /* จับคำว่า Form Information มาทำให้อยู่เหนือเส้น */
    #form-detail > div.text-xl {
        position: absolute;
        top: 15px; /* ดึงลงมาให้ทับเส้นขอบกล่องพอดี */
        left: 20px; /* ขยับไปทางขวานิดหน่อย */
       background-color: var(--fallback-b1,oklch(var(--b1)/1));
        padding: 0 10px; /* เว้นระยะซ้ายขวาไม่ให้ชิดเส้นเกินไป */
        z-index: 10;
        margin-bottom: 0 !important; /* ลบ margin เดิมทิ้ง */
    }

    /* ดันกล่องข้อมูลลงมา */
    #form-detail > div.bg-base-200 {
        margin-top: 0px; 
    }
    .display-section {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    background-color: #ffffff;
    font-family: sans-serif;
  }
  .display-title {
    font-size: 1.25rem;
    font-weight: bold;
    margin-bottom: 15px;
    color: #111827;
  }
  .info-row {
    display: grid;
    grid-template-columns: 200px 1fr;
    margin-bottom: 12px;
    align-items: baseline;
  }
  .info-label {
    font-weight: bold;
    color: #374151;
  }
  .info-value {
    color: #1f2937;
  }
  /* เพิ่มสีน้ำเงินอ่อนคล้ายๆ กับหน้า Approval ในภาพ */
  /* .highlight-bg {
    background-color: #f8fafc;
    padding: 15px;
    border-radius: 6px;
  } */
   .display-section {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 30px 20px 20px; /* เพิ่ม padding-top เป็น 30px เพื่อเว้นที่ให้หัวข้อ */
    margin-bottom: 20px;
    background-color: #ffffff;
    font-family: sans-serif;
    position: relative; /* สำคัญมาก: เพื่อใช้เป็นจุดอ้างอิงให้หัวข้อ */
  }

  /* สร้าง CSS เพื่อจับหัวข้อ General Information ขึ้นไปทับเส้น */
  .display-section > div.font-bold.text-lg {
    position: absolute;
    top: -14px; /* ขยับขึ้นไปทับเส้นขอบ (สามารถปรับเพิ่มลดตัวเลขได้หากยังไม่กึ่งกลางเส้น) */
    left: 20px;
    background-color: var(--fallback-b1,oklch(var(--b1)/1)); /* หรือใช้ #ffffff สีเดียวกับพื้นหลังเว็บเพื่อบังเส้น */
    padding: 0 10px;
    margin-bottom: 0;
  }
</style>
@endsection

@section('contents')
<div class="hidden form-info" nfrmno="{{$NFRMNO}}" vorgno="{{$VORGNO}}" cyear="{{$CYEAR}}" mode="{{$mode}}"
    cyear2="{{$mode !=1 ? $CYEAR2 : '' }}" nrunno="{{$mode !=1 ? $NRUNNO : '' }}"></div>
<div class="hidden apv-data" empno="{{$empno}}"></div>
@endsection
<form id="frmmain">
     
    <div class="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
     <h1 class="text-3xl text-center text-primary font-bold mb-10">Vendor/Sub-contractor Evaluation Form</h1>
           <div class="form-overlap-wrapper w-full">
                    <section id="form-detail" class="w-full">
                        
                        </section>
                </div>
            <div class="display-section">
  <div class="font-bold text-lg">General Information</div>
  
<div class="">
    <!-- แสดงผล Operation -->
    <div class="info-row">
      <div class="font-semibold text-sm">Operation:</div>
      <div id="OPERATION" class="text-gray-700 text-sm"></div>
    </div>

    <!-- แสดงผล Vendor Type -->
    <div class="info-row">
      <div class="font-semibold text-sm">Vendor Type:</div>
      <div id="VENDGROUP" class="text-gray-700 text-sm"></div>
    </div>

    <!-- แสดงผล 2nd digit code -->
    <div class="info-row">
      <div class="font-semibold text-sm">2nd digit code Purpose:</div>
      <div id="VENDPURPOSE" class="text-gray-700 text-sm"></div>
    </div>

    <!-- ========================================== -->
    <!-- แสดงผล Vendor Name & Vendor Code (2 คอลัมน์) -->
    <!-- ========================================== -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      
      <!-- คอลัมน์ซ้าย: Vendor Name -->
      <div class="info-row">
        <div class="font-semibold text-sm">Vendor Name:</div>
        <div id="COMNAME" class="text-gray-700 text-sm"></div>
      </div>

      <!-- คอลัมน์ขวา: Vendor Code -->
      <div class="info-row">
        <div class="font-semibold text-sm">Vendor Code:</div>
        <div id="VENDCODE" class="text-gray-700 text-sm"></div>
      </div>

    </div>
    <!-- ========================================== -->

    <!-- Address (EN) -->
    <div class="info-row">
      <div class="font-semibold text-sm">Address (EN):</div>
      <div id="ADDREN" class="text-gray-700 text-sm">-</div>
    </div>

    <!-- Address (TH) -->
    <div class="info-row">
      <div class="font-semibold text-sm">Address (TH):</div>
      <div id="ADDRTH" class="text-gray-700 text-sm">-</div>
    </div>
  </div>
</div>


    </div>
<div id="form-action-container"></div>
</form>
@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/purEvaView.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection