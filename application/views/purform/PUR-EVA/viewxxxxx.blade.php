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
      <div class="font-semibold text-sm">Operation : </div>
      <div id="OPERATION" class="text-gray-700 text-sm"></div>
    </div>

    <!-- แสดงผล Vendor Type -->
    <div class="info-row">
      <div class="font-semibold text-sm">Vendor Type : </div>
      <div id="VENDGROUP" class="text-gray-700 text-sm"></div>
    </div>

    <!-- แสดงผล 2nd digit code -->
    <div class="info-row">
      <div class="font-semibold text-sm">2nd digit code Purpose : </div>
      <div id="VENDPURPOSE" class="text-gray-700 text-sm"></div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      
      <!-- คอลัมน์ซ้าย: Vendor Name -->
      <div class="info-row">
        <div class="font-semibold text-sm">Vendor Name :</div>
        <div id="COMNAME" class="text-gray-700 text-sm"></div>
      </div>

      <!-- คอลัมน์ขวา: Vendor Code -->
      <div class="info-row">
        <div class="font-semibold text-sm">Vendor Code :</div>
        <div id="VENDCODE" class="text-gray-700 text-sm"></div>
      </div>

    </div>
    <!-- Address (EN) -->
    <div class="info-row">
      <div class="font-semibold text-sm">Address (EN) :</div>
      <div id="ADDREN" class="text-gray-700 text-sm">-</div>
    </div>

    <!-- Address (TH) -->
    <div class="info-row">
      <div class="font-semibold text-sm">Address (TH) :</div>
      <div id="ADDRTH" class="text-gray-700 text-sm">-</div>
    </div>
    <div class="info-row">
      <div class="font-semibold text-sm">Contact name :</div>
      <div id="CONTACT" class="text-gray-700 text-sm">-</div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      
      <!-- คอลัมน์ซ้าย: Email -->
      <div class="info-row">
        <div class="font-semibold text-sm">Email :</div>
        <div id="EMAIL" class="text-gray-700 text-sm"></div>
      </div>

      <!-- คอลัมน์ขวา: Website -->
      <div class="info-row">
        <div class="font-semibold text-sm">Web Site :</div>
        <div id="WEBSITE" class="text-gray-700 text-sm"></div>
      </div>

    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">  
      <!-- คอลัมน์ซ้าย: Tel.no -->
      <div class="info-row">
        <div class="font-semibold text-sm">Tel.no :</div>
        <div id="TELNO" class="text-gray-700 text-sm"></div>
      </div>
      <!-- คอลัมน์ขวา: Fax.no -->
      <div class="info-row">
        <div class="font-semibold text-sm">Fax no :</div>
        <div id="FAX" class="text-gray-700 text-sm"></div>
      </div>
    </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">  
      <!-- คอลัมน์ซ้าย: Tel.no -->
      <div class="info-row">
        <div class="font-semibold text-sm">Bank name :</div>
        <div id="BANKNAME" class="text-gray-700 text-sm"></div>
      </div>
      <!-- คอลัมน์ขวา: Fax.no -->
      <div class="info-row">
        <div class="font-semibold text-sm">Branch name :</div>
        <div id="BRANCH" class="text-gray-700 text-sm"></div>
      </div>
    </div>
    <div class="info-row">
      <div class="font-semibold text-sm">Account number :</div>
      <div id="ACCNUMBER" class="text-gray-700 text-sm">-</div>
    </div>
    <div class="info-row">
      <div class="font-semibold text-sm">Bank Address :</div>
      <div id="BANKADDR" class="text-gray-700 text-sm">-</div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">  
      <!-- คอลัมน์ซ้าย: Payment Term -->
      <div class="info-row">
        <div class="font-semibold text-sm">Payment Term :</div>
        <div id="TERMCODE" class="text-gray-700 text-sm"></div>
      </div>
      <!-- คอลัมน์ขวา: Currency Code -->
      <div class="info-row">
        <div class="font-semibold text-sm">Currency Code :</div>
        <div id="CURCODE" class="text-gray-700 text-sm"></div>
      </div>
    </div>
  </div>
</div>
<div class="display-section">
  <div class="font-bold text-lg">Vendor Evaluation</div>
  <div class="">
    
    <!-- รายการสินค้าและบริการ -->
    <div class="prodcat-container flex flex-row w-full mb-4 mt-2 gap-2 items-start">
      <div class="font-semibold text-sm shrink-0">รายการสินค้าและบริการที่ยื่นจดทะเบียนเครื่องหมายการค้าในประเทศไทย : </div>
      <div id="PRODCAT" class="text-gray-700 text-sm flex-1 break-words whitespace-pre-wrap"></div>
    </div>

    <!-- Compliance -->
    <div class="info-row mt-4">
      <div class="font-semibold text-sm mb-2 text-gray-900">Compliance</div>
      <div class="text-gray-700 text-sm space-y-2" id="COMPLIANCE_READONLY_CONTAINER">
        
        <label class="flex items-center gap-2">
          <input type="checkbox" onclick="return false;" class="chk-compliance rounded text-blue-600 cursor-not-allowed" value="ไม่ได้อยู่ในกลุ่มควบคุม ข้อกำหนด AMEC-5070: Rule for Export Control"> 
          <span class="chk-label text-gray-500">ไม่ได้อยู่ในกลุ่มควบคุม ข้อกำหนด AMEC-5070: Rule for Export Control</span>
        </label>
        
        <label class="flex items-center gap-2">
          <input type="checkbox" onclick="return false;" class="chk-compliance rounded text-blue-600 cursor-not-allowed" value="ไม่อยู่ในรายชื่อที่ถูกลงโทษจาก UNSC"> 
          <span class="chk-label text-gray-500">ไม่อยู่ในรายชื่อที่ถูกลงโทษจาก UNSC</span>
        </label>
        
        <label class="flex items-center gap-2">
          <input type="checkbox" onclick="return false;" class="chk-compliance rounded text-blue-600 cursor-not-allowed" value="ไม่อยู่ในประเทศ ประเทศไทยคว่ำบาตร ตามมาตรการคว่ำบาตร โดยสหประชาชาติ WWW.dff-go.th"> 
          <span class="chk-label text-gray-500">ไม่อยู่ในประเทศ ประเทศไทยคว่ำบาตร ตามมาตรการคว่ำบาตร โดยสหประชาชาติ WWW.dff-go.th</span>
        </label>
        
        <label class="flex items-center gap-2">
          <input type="checkbox" onclick="return false;" class="chk-compliance rounded text-blue-600 cursor-not-allowed" value="AMEC's standard Terms of 'CIF'"> 
          <span class="chk-label text-gray-500">AMEC's standard Terms of "CIF"</span>
        </label>
        
        <label class="flex items-center gap-2">
          <input type="checkbox" onclick="return false;" class="chk-compliance rounded text-blue-600 cursor-not-allowed" value="ได้รับ Financial Record"> 
          <span class="chk-label text-gray-500">ได้รับ Financial Record</span>
        </label>
        
        <div class="flex items-center gap-2">
          <label class="flex items-center gap-2 flex-shrink-0">
            <input type="checkbox" onclick="return false;" class="chk-compliance rounded text-blue-600 cursor-not-allowed" value="อื่นๆ ระบุ"> 
            <span class="chk-label text-gray-500">อื่นๆ ระบุ</span>
          </label>
          <input type="text" id="COMPLIANCE_OTHER_READONLY" readonly class="input input-sm border border-gray-300 bg-gray-100 text-gray-800 h-8 rounded w-1/2 px-2 cursor-not-allowed focus:outline-none">
        </div>

      </div>
    </div>
    
    <!-- Non-pro Business Type -->
    <div class="nonpro flex flex-row w-full mb-4 mt-2 gap-2 items-start">
      <div class="font-semibold text-sm shrink-0">ประเภทธุรกิจตอนจดทะเบียน (Business type at registration) : </div>
      <div id="BUSTYPE_REG" class="text-gray-700 text-sm flex-1 break-words whitespace-pre-wrap"></div>
    </div>
    <div class="nonpro flex flex-row w-full mb-4 mt-2 gap-2 items-start">
      <div class="font-semibold text-sm shrink-0">ประเภทธุรกิจที่ส่งงบการเงินล่าสุด (Business type that submitted the latest financial statements) : </div>
      <div id="BUSTYPE_SUB" class="text-gray-700 text-sm flex-1 break-words whitespace-pre-wrap"></div>
    </div>

    <!-- ส่วนที่แก้ไขให้ Grid เท่ากับ General Information ด้านบน (เปลี่ยนเป็น gap-4) -->
    <div class="pro w-full">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div class="info-row eval-row">
          <div class="font-semibold text-sm">Vendor Category :</div>
          <div id="VENDCAT" class="text-gray-700 text-sm"></div>
        </div>

        <div class="info-row eval-row">
          <div class="font-semibold text-sm">TAX.ID/Swift Code :</div>
          <div id="TAX_ID_PRO" class="text-gray-700 text-sm"></div>
        </div>

        <div class="info-row eval-row">
          <div class="font-semibold text-sm">Capital :</div>
          <div id="CAPITAL" class="text-gray-700 text-sm"></div>
        </div>

        <div class="info-row eval-row">
          <div class="font-semibold text-sm">Type of Company :</div>
          <div id="COM_TYPE" class="text-gray-700 text-sm"></div>
        </div>

      </div>

      <!-- ส่วนของ Shareholder ปรับ mt-4 เพื่อให้ระยะห่างสวยงามพอดี -->
      <div class="w-full mt-4">
        <div class="font-semibold text-sm mb-2 text-gray-900">Shareholder</div>
        <div class="border rounded-md p-4 bg-white">
          ... ตาราง ...
        </div>
      </div>
    </div>

  </div>
</div>
<!-- <div class="display-section">
  <div class="font-bold text-lg">Vendor Evaluation</div>
  <div class="">
    <div class="info-row">
      <div class="font-semibold text-sm">รายการสินค้าและบริการที่ยื่นจดทะเบียนเครื่องหมายการค้าในประเทศไทย:</div>
      <div id="PRODCAT" class="text-gray-700 text-sm"></div>
    </div>
<div class="info-row mt-4">
  <div class="font-semibold text-sm mb-2 text-gray-900">Compliance </div>
  
  <div class="text-gray-700 text-sm space-y-2" id="COMPLIANCE_READONLY_CONTAINER">
    
    <label class="flex items-center gap-2">
      <input type="checkbox" disabled class="chk-compliance rounded text-blue-600 disabled:opacity-60" value="ไม่ได้อยู่ในกลุ่มควบคุม ข้อกำหนด AMEC-5070: Rule for Export Control"> 
      <span class="chk-label text-gray-500">ไม่ได้อยู่ในกลุ่มควบคุม ข้อกำหนด AMEC-5070: Rule for Export Control</span>
    </label>
    
    <label class="flex items-center gap-2">
      <input type="checkbox" disabled class="chk-compliance rounded text-blue-600 disabled:opacity-60" value="ไม่อยู่ในรายชื่อที่ถูกลงโทษจาก UNSC"> 
      <span class="chk-label text-gray-500">ไม่อยู่ในรายชื่อที่ถูกลงโทษจาก UNSC</span>
    </label>
    
    <label class="flex items-center gap-2">
      <input type="checkbox" disabled class="chk-compliance rounded text-blue-600 disabled:opacity-60" value="ไม่อยู่ในประเทศ ประเทศไทยคว่ำบาตร ตามมาตรการคว่ำบาตร โดยสหประชาชาติ WWW.dff-go.th"> 
      <span class="chk-label text-gray-500">ไม่อยู่ในประเทศ ประเทศไทยคว่ำบาตร ตามมาตรการคว่ำบาตร โดยสหประชาชาติ WWW.dff-go.th</span>
    </label>
    
    <label class="flex items-center gap-2">
      <input type="checkbox" disabled class="chk-compliance rounded text-blue-600 disabled:opacity-60" value="AMEC's standard Terms of 'CIF'"> 
      <span class="chk-label text-gray-500">AMEC's standard Terms of "CIF"</span>
    </label>
    
    <label class="flex items-center gap-2">
      <input type="checkbox" disabled class="chk-compliance rounded text-blue-600 disabled:opacity-60" value="ได้รับ Financial Record"> 
      <span class="chk-label text-gray-500">ได้รับ Financial Record</span>
    </label>
    
    <div class="flex items-center gap-2">
      <label class="flex items-center gap-2 flex-shrink-0">
        <input type="checkbox" disabled class="chk-compliance rounded text-blue-600 disabled:opacity-60" value="อื่นๆ ระบุ"> 
        <span class="chk-label text-gray-500">อื่นๆ ระบุ</span>
      </label>
      <input type="text" id="COMPLIANCE_OTHER_READONLY" disabled class="input input-sm border border-gray-300 bg-gray-100 text-gray-800 h-8 rounded w-1/2 px-2 disabled:opacity-70">
    
    </div>

  </div>
</div>
  </div>
</div>  -->

<div class="display-section">
  <div class="font-bold text-lg">Attach files</div>
  <div class=""></div>
</div> 

</div>
<div id="form-action-container"></div>
</form>
@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/purEvaView.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection