@extends('layouts/webflowTemplate')

@section('contents')
<div class="hidden form-info" nfrmno="{{$NFRMNO}}" vorgno="{{$VORGNO}}" cyear="{{$CYEAR}}" mode="{{$mode}}"
    cyear2="{{$mode !=1 ? $CYEAR2 : '' }}" nrunno="{{$mode !=1 ? $NRUNNO : '' }}"></div>
<div class="hidden apv-data" empno="{{$empno}}"></div>
@endsection

<form id="frmmain">
     
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
    <h1 class="text-3xl text-center text-primary font-bold mb-10 mt-6">Vendor/Sub-contractor Evaluation Form</h1>
    
    <!-- 1. ส่วน Form Information (มาจากระบบ) -->
    <div class="form-overlap-wrapper w-full">
      <!-- ใช้ bg-base-200 เพื่อให้ได้สีเดิมคืนมา และแก้หัวข้อเป็น !bg-transparent -->
      <section id="form-detail" class="w-full border border-gray-300 rounded-lg pt-8 px-5 pb-5 mt-8 bg-base-200 relative 
        [&>div.text-xl]:absolute [&>div.text-xl]:-top-3.5 [&>div.text-xl]:left-5 [&>div.text-xl]:!bg-transparent [&>div.text-xl]:px-2.5 [&>div.text-xl]:!m-0 [&>div.text-xl]:text-lg [&>div.text-xl]:text-gray-900 [&>div.text-xl]:z-10 
        [&>div.bg-base-200]:!bg-transparent [&>div.bg-base-200]:!border-none [&>div.bg-base-200]:!p-0 [&>div.bg-base-200]:!w-full [&>div.bg-base-200]:!shadow-none 
        [&_table_td]:!pl-0 [&_table_td:first-child]:!w-[220px] [&_tr]:!border-b-0 [&_td]:!border-b-0"></section>
    </div>

    <!-- 2. ส่วน General Information -->
    <div class="border border-gray-300 shadow-sm rounded-lg pt-8 px-5 pb-5 mt-8 mb-5 bg-white relative">
      <!-- เปลี่ยนเป็น !bg-transparent ตามที่ต้องการ -->
      <div class="absolute -top-3.5 left-5 !bg-transparent px-2.5 text-lg font-bold text-gray-900 m-0 z-10">General Information</div>
      
      <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
        <div class="font-semibold text-sm">Operation : </div>
        <div id="OPERATION" class="text-gray-700 text-sm"></div>
      </div>

      <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
        <div class="font-semibold text-sm">Vendor Type : </div>
        <div id="VENDGROUP" class="text-gray-700 text-sm"></div>
      </div>

      <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
        <div class="font-semibold text-sm">2nd digit code Purpose : </div>
        <div id="VENDPURPOSE" class="text-gray-700 text-sm"></div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
          <div class="font-semibold text-sm">Vendor Name :</div>
          <div id="COMNAME" class="text-gray-700 text-sm"></div>
        </div>
        <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
          <div class="font-semibold text-sm">Vendor Code :</div>
          <div id="VENDCODE" class="text-gray-700 text-sm"></div>
        </div>
      </div>
      
      <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
        <div class="font-semibold text-sm">Address (EN) :</div>
        <div id="ADDREN" class="text-gray-700 text-sm">-</div>
      </div>

      <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
        <div class="font-semibold text-sm">Address (TH) :</div>
        <div id="ADDRTH" class="text-gray-700 text-sm">-</div>
      </div>
      
      <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
        <div class="font-semibold text-sm">Contact name :</div>
        <div id="CONTACT" class="text-gray-700 text-sm">-</div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
          <div class="font-semibold text-sm">Email :</div>
          <div id="EMAIL" class="text-gray-700 text-sm"></div>
        </div>
        <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
          <div class="font-semibold text-sm">Web Site :</div>
          <div id="WEBSITE" class="text-gray-700 text-sm"></div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">  
        <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
          <div class="font-semibold text-sm">Tel.no :</div>
          <div id="TELNO" class="text-gray-700 text-sm"></div>
        </div>
        <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
          <div class="font-semibold text-sm">Fax no :</div>
          <div id="FAX" class="text-gray-700 text-sm"></div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">  
        <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
          <div class="font-semibold text-sm">Bank name :</div>
          <div id="BANKNAME" class="text-gray-700 text-sm"></div>
        </div>
        <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
          <div class="font-semibold text-sm">Branch name :</div>
          <div id="BRANCH" class="text-gray-700 text-sm"></div>
        </div>
      </div>
      
      <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
        <div class="font-semibold text-sm">Account number :</div>
        <div id="ACCNUMBER" class="text-gray-700 text-sm">-</div>
      </div>
      
      <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
        <div class="font-semibold text-sm">Bank Address :</div>
        <div id="BANKADDR" class="text-gray-700 text-sm">-</div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">  
        <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
          <div class="font-semibold text-sm">Payment Term :</div>
          <div id="TERMCODE" class="text-gray-700 text-sm"></div>
        </div>
        <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
          <div class="font-semibold text-sm">Currency Code :</div>
          <div id="CURCODE" class="text-gray-700 text-sm"></div>
        </div>
      </div>
    </div>

 <!-- 3. ส่วน Vendor Evaluation -->
    <div class="border border-gray-300 shadow-sm rounded-lg pt-8 px-5 pb-5 mt-8 mb-5 bg-white relative">
      <!-- หัวข้อ -->
      <div class="absolute -top-3.5 left-5 !bg-transparent px-2.5 text-lg font-bold text-gray-900 m-0 z-10">Vendor Evaluation</div>
        
      <!-- รายการสินค้า -->
      <div class="info-row flex flex-row items-baseline gap-2 prodcat-container">
        <div class="font-semibold text-sm whitespace-nowrap">รายการสินค้าและบริการที่ยื่นจดทะเบียนเครื่องหมายการค้าในประเทศไทย : </div>
        <div id="PRODCAT" class="text-gray-700 text-sm break-words"></div>
      </div>

      <!-- Compliance (ระยะห่าง mt-4) -->
      <div  class="info-row grid grid-cols-[220px_1fr] gap-3 items-start mt-4">
        <div class="font-semibold text-sm">Compliance :</div>
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
            <input type="text" id="COMPLIANCE_OTHER_READONLY" readonly class="input input-sm border border-gray-300 bg-white text-gray-800 h-8 rounded w-1/2 px-2 cursor-not-allowed focus:outline-none">
          </div>
        </div>
      </div>
      
      <!-- ประเภทธุรกิจ (ระยะห่าง mt-4 และช่องว่างระหว่างกัน space-y-4) -->
      <div class="nonpro mt-4 space-y-4">
        <div class="flex flex-row items-baseline gap-2">
          <div class="font-semibold text-sm whitespace-nowrap">ประเภทธุรกิจตอนจดทะเบียน (Business type at registration) : </div>
          <div id="BUSTYPE_REG" class="text-gray-700 text-sm break-words"></div>
        </div>
        <div class="flex flex-row items-baseline gap-2">
          <div class="font-semibold text-sm whitespace-nowrap">ประเภทธุรกิจที่ส่งงบการเงินล่าสุด (Business type that submitted the latest financial statements) : </div>
          <div id="BUSTYPE_SUB" class="text-gray-700 text-sm break-words"></div>
        </div>
      </div>

      <!-- ข้อมูล 4 ช่อง (ระยะห่าง mt-4 และเปลี่ยนเป็น gap-4 เพื่อให้เท่ากัน) -->
      <div class="pro mt-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- ลบ mb-3 ออก เพื่อไม่ให้ระยะห่างเบิ้ล -->
          <div class="grid grid-cols-[220px_1fr] gap-3 items-baseline eval-row">
            <div class="font-semibold text-sm">Vendor Category :</div>
            <div id="VENDCAT" class="text-gray-700 text-sm"></div>
          </div>
          <div class="grid grid-cols-[220px_1fr] gap-3 items-baseline eval-row">
            <div class="font-semibold text-sm">TAX.ID/Swift Code :</div>
            <div id="TAX_ID_PRO" class="text-gray-700 text-sm"></div>
          </div>
          <div class="grid grid-cols-[220px_1fr] gap-3 items-baseline eval-row">
            <div class="font-semibold text-sm">Capital :</div>
            <div id="CAPITAL" class="text-gray-700 text-sm"></div>
          </div>
          <div class="grid grid-cols-[220px_1fr] gap-3 items-baseline eval-row">
            <div class="font-semibold text-sm">Type of Company :</div>
            <div id="COM_TYPE" class="text-gray-700 text-sm"></div>
          </div>
        </div>
      </div>

      <!-- ตาราง Shareholder (เปลี่ยน mt-6 เป็น mt-4 ให้ระยะห่างเท่ากันหมด) -->
      <div class="pro mt-4">
        <div class="font-semibold text-sm mb-2 text-gray-900">Shareholder</div>
         <div class="overflow-x-auto">
        <table class="w-full border-collapse border border-gray-300 text-sm text-left text-gray-700">
            <thead class="bg-gray-50">
            <tr>
                <th class="border border-gray-300 px-4 py-2 font-semibold text-center">Nationality</th>
                <th class="border border-gray-300 px-4 py-2 font-semibold text-center w-40">%</th>
            </tr>
            </thead>
            <!-- ตั้ง id ไว้สำหรับให้ JavaScript อ้างอิงเพื่อเอาข้อมูลมาใส่ -->
            <tbody id="shareholder-tbody">
            <!-- แถวข้อมูลจะถูกเพิ่มผ่าน JS ตรงนี้ -->
            </tbody>
        </table>
        </div>
       
      </div>
<!-- ส่วน Employee -->
    <div class="pro mt-6">
      <div class="font-semibold text-sm mb-2 text-gray-900">Employee</div>
      <!-- ใช้ grid-cols-[repeat(4,minmax(0,1fr))] เพื่อล็อกสัดส่วน 4 คอลัมน์ให้เท่ากันเป๊ะ -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))] gap-4 bg-white border border-gray-200 rounded-md px-6 py-4 text-sm text-gray-700">
        
        <div class="flex items-center gap-2">
          <span class="font-semibold text-gray-900">Direct :</span>
          <span id="EMPDIRECT">-</span>
        </div>

        <div class="flex items-center gap-2">
          <span class="font-semibold text-gray-900">Indirect :</span>
          <span id="EMPINDIRECT">-</span>
        </div>

        <div class="flex items-center gap-2">
          <span class="font-semibold text-gray-900">Total :</span>
          <span id="EMPTOTAL">-</span>
        </div>

        <div class="flex items-center gap-2">
          <span class="font-semibold text-gray-900">Average Age :</span>
          <span id="AVGAGE">-</span>
        </div>

      </div>
    </div>

    <!-- ส่วน Area of Factory/Building -->
    <div class="pro mt-6">
      <div class="font-semibold text-sm mb-2 text-gray-900">Area of Factory/Building</div>
      <!-- ใช้โครงสร้างคอลัมน์แบบเดียวกันเป๊ะ -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))] gap-4 bg-white border border-gray-200 rounded-md px-6 py-4 text-sm text-gray-700">
        
        <!-- ช่องที่ 1: ตรงกับ Direct -->
        <div class="flex items-center gap-2">
          <span class="font-semibold text-gray-900">Land (M2) :</span>
          <span id="LAND">-</span>
        </div>

        <!-- ช่องที่ 2: ตรงกับ Indirect เป๊ะๆ -->
        <div class="flex items-center gap-2">
          <span class="font-semibold text-gray-900">Factory (M2) :</span>
          <span id="FACTORY">-</span>
        </div>

        <!-- เว้นช่อง 3 และ 4 ไว้เพื่อให้โครงสร้าง Grid สมบูรณ์ -->
        <div class="hidden lg:block"></div>
        <div class="hidden lg:block"></div>

      </div>
    </div>

    <div class="mt-4">
        <div class="font-semibold text-sm mb-2 text-gray-900"><span id="titleprofit"></span></div>
         <div class="overflow-x-auto">
        <table class="w-full border-collapse border border-gray-300 text-sm text-left text-gray-700 text-center">
            <thead class="bg-gray-50">
            <tr>
                <th class="border border-gray-300 px-4 py-2 font-semibold text-center">Year</th>
                <th class="border border-gray-300 px-4 py-2 font-semibold text-center w-40"><span id="thprofit"></span></th>
            </tr>
            </thead>
            <!-- ตั้ง id ไว้สำหรับให้ JavaScript อ้างอิงเพื่อเอาข้อมูลมาใส่ -->
            <tbody id="profit-tbody">
            <!-- แถวข้อมูลจะถูกเพิ่มผ่าน JS ตรงนี้ -->
            </tbody>
        </table>
        </div>
       
      </div>

    </div>

    <!-- 4. ส่วน Attach files -->
    <div class="border border-gray-300 shadow-sm rounded-lg pt-8 px-5 pb-5 mt-8 mb-5 bg-white relative">
      <!-- เปลี่ยนเป็น !bg-transparent ตามที่ต้องการ -->
      <div class="absolute -top-3.5 left-5 !bg-transparent px-2.5 text-lg font-bold text-gray-900 m-0 z-10">Attach files</div>
      <div class="">
        <!-- Content -->
      </div>
    </div> 

  </div>
  <div id="form-action-container"></div>
</form>

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/purEvaView.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection