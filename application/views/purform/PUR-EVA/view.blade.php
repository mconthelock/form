@extends('layouts/webflowTemplate')

@section('contents')
<div class="hidden form-info" nfrmno="{{$NFRMNO}}" vorgno="{{$VORGNO}}" cyear="{{$CYEAR}}" mode="{{$mode}}"
    cyear2="{{$mode !=1 ? $CYEAR2 : '' }}" nrunno="{{$mode !=1 ? $NRUNNO : '' }}"></div>
<div class="hidden apv-data" empno="{{$empno}}"></div>
@endsection

<form id="frmmain" style="visibility: hidden;">
     
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
                <th class="border border-gray-300 px-4 py-2 font-semibold text-left">Nationality</th>
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

<div class="nonpro mt-4 space-y-4">
  <!-- บรรทัดเดิม: ข้อมูลการจดทะเบียนนิติบุคคลและภาษี -->
  <div class="flex flex-row items-baseline gap-2">
    <div class="font-semibold text-sm whitespace-nowrap">ข้อมูลการจดทะเบียนนิติบุคคลและภาษี :</div>
    <div id="LEGAL_STATUS" class="text-gray-700 text-sm break-words"></div>
  </div>

  <!-- บรรทัดใหม่: 2 คอลัมน์ (เลขทะเบียนนิติบุคคล และ เลขประจำตัวผู้เสียภาษี) -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
    <!-- คอลัมน์ที่ 1: เลขทะเบียนนิติบุคคล -->
    <div class="flex flex-row items-baseline gap-2">
      <div class="font-semibold whitespace-nowrap">เลขทะเบียนนิติบุคคล :</div>
      <div id="CORPORATE_ID" class="text-gray-700 break-words"></div>
    </div>

    <!-- คอลัมน์ที่ 2: เลขประจำตัวผู้เสียภาษี -->
    <div class="flex flex-row items-baseline gap-2">
      <div class="font-semibold whitespace-nowrap">เลขประจำตัวผู้เสียภาษี (Tax ID) :</div>
      <div id="TAX_ID" class="text-gray-700 break-words"></div>
    </div>
  </div>

  <!-- บรรทัดเดิม: Concerned Division -->
  <div class="flex flex-row items-baseline gap-2">
    <div class="font-semibold text-sm whitespace-nowrap">Concerned Division :</div>
    <div id="CONCERNEDORG" class="text-gray-700 text-sm break-words"></div>
  </div>

  <!-- เพิ่มส่วนใหม่หลัง Concerned Division (มี 2 ช่อง ตามรูปแบบที่ต้องการ) -->
  <div class="mt-4">
    <div class="font-semibold text-sm mb-2 text-gray-900">Purchase Amount last year</div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white border border-gray-200 rounded-md px-6 py-4 text-sm text-gray-700">
      
      <!-- ช่องที่ 1 -->
      <div class="flex items-center gap-2">
        <span class="font-semibold text-gray-900">Fiscal Year :</span>
        <span id="FY_AMOUNT">-</span>
      </div>

      <!-- ช่องที่ 2 -->
      <div class="flex items-center gap-2">
        <span class="font-semibold text-gray-900">Total Amount[Bht] :</span>
        <span id="AMOUNT">-</span>
        <span id="PUR_LEVEL_BADGE" class="px-2 py-0.5 text-xs font-semibold rounded-md hidden"></span>
      </div>

    </div>
  </div>
  <div class="flex items-center gap-2 mt-2">
  <input type="checkbox" id="PUR_STATUS" onclick="return false;"  class="w-4 h-4 text-blue-600 border-gray-300 rounded cursor-not-allowed">
  <label for="PUR_STATUS" class="text-sm text-gray-700 font-medium">Not purchase more than 5 years "DO NOT USE"</label>
</div>

<div id="section-eva-non" class="mb-8 mt-6 border-2 border-dashed border-gray-400 rounded-lg p-6 bg-blue-50">
    <table class="w-full text-sm border-collapse border border-gray-400 bg-white">
        <thead>
            <tr class="bg-gray-100">
                <th class="border border-gray-400 p-2 text-left" rowspan="2">Evaluation Item</th>
                <th class="border border-gray-400 p-2 text-left" rowspan="2">Check Point</th>
                <th class="border border-gray-400 p-2 text-center" colspan="6">Score</th>
            </tr>
            <tr class="bg-gray-50 text-xs text-center">
                <th class="border border-gray-400 p-1 w-[13%]">25</th>
                <th class="border border-gray-400 p-1 w-[13%]">20</th>
                <th class="border border-gray-400 p-1 w-[13%]">15</th>
                <th class="border border-gray-400 p-1 w-[13%]">10</th>
                <th class="border border-gray-400 p-1 w-[13%]">5</th>
                <th class="border border-gray-400 p-1 w-[13%]">0</th>
            </tr>
        </thead>
        <tbody>
            <!-- FINANCIAL STATEMENT -->
            <tr>
                <td class="border border-gray-400 p-2 text-xs font-semibold">FINANCIAL STATEMENT</td>
                <td class="border border-gray-400 p-2 text-xs">Financial status evaluation</td>
                <td class="border border-gray-400 p-2 text-center align-top">
                    <label class="block"><input type="radio" name="FIN_LEVEL" value="25" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">B or C and Related with Melco's Group</span></label>
                </td>
                <td class="border border-gray-400 p-2 text-center align-top">
                    <label class="block"><input type="radio" name="FIN_LEVEL" value="20" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">Has Company certificated, Tax payment, Profit ratio</span></label>
                </td>
                <td class="border border-gray-400 p-2 text-center align-top">
                    <label class="block"><input type="radio" name="FIN_LEVEL" value="15" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">Has Company certificated, Tax payment</span></label>
                </td>
                <td class="border border-gray-400 p-2 text-center align-top">
                    <label class="block"><input type="radio" name="FIN_LEVEL" value="10" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">Not found data of Tax payment and/or "DO NOT USE"</span></label>
                </td>
                <td class="border border-gray-400 p-2 bg-gray-50"></td> 
                <td class="border border-gray-400 p-2 bg-gray-50"></td>
            </tr>

            <!-- QUALITY CLASSIFICATION -->
            <tr>
                <td class="border border-gray-400 p-2 text-xs font-semibold">QUALITY CLASSIFICATION</td>
                <td class="border border-gray-400 p-2 text-xs">Classification by warranty</td>
                <td class="border border-gray-400 p-2 text-center align-top">
                    <label class="block"><input type="radio" name="QA_LEVEL" value="25" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">No Claim</span></label>
                </td>
                <td class="border border-gray-400 p-2 text-center align-top">
                    <label class="block"><input type="radio" name="QA_LEVEL" value="20" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">Clearly Claim on time/ 1 week</span></label>
                </td>
                <td class="border border-gray-400 p-2 text-center align-top">
                    <label class="block"><input type="radio" name="QA_LEVEL" value="15" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">Clearly Claim 1-2 month</span></label>
                </td>
                <td class="border border-gray-400 p-2 text-center align-top">
                    <label class="block"><input type="radio" name="QA_LEVEL" value="10" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">[Not warranty] "DO NOT USE"</span></label>
                </td>
                <td class="border border-gray-400 p-2 bg-gray-50"></td> 
                <td class="border border-gray-400 p-2 bg-gray-50"></td>
            </tr>

            <!-- ENVIRONMENTAL -->
            <tr>
                <td class="border border-gray-400 p-2 text-xs font-semibold">ENVIRONMENTAL</td>
                <td class="border border-gray-400 p-2 text-xs">ex.ISO14001 (ref.: PRO-QP-E003)</td>
                <td class="border border-gray-400 p-2 text-center align-top">
                    <label class="block"><input type="radio" name="ENV_LEVEL" value="25" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">Has Environmental certificate</span></label>
                </td>
                <td class="border border-gray-400 p-2 text-center align-top">
                    <label class="block"><input type="radio" name="ENV_LEVEL" value="20" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">Has own Environmental policy</span></label>
                </td>
                <td class="border border-gray-400 p-2 text-center align-top">
                    <label class="block"><input type="radio" name="ENV_LEVEL" value="15" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">Has response & related material</span></label>
                </td>
                <td class="border border-gray-400 p-2 text-center align-top">
                    <label class="block"><input type="radio" name="ENV_LEVEL" value="10" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">Has not related material</span></label>
                </td>
                <td class="border border-gray-400 p-2 bg-gray-50"></td>
                <td class="border border-gray-400 p-2 text-center align-top">
                    <label class="block"><input type="radio" name="ENV_LEVEL" value="0" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">Environmental or Legal Violations : "Do Not Use"</span></label>
                </td>
            </tr>

            <!-- ADVANCE VERIFYING -->
            <tr>
                <td class="border border-gray-400 p-2 text-xs font-semibold">ADVANCE VERIFYING</td>
                <td class="border border-gray-400 p-2 text-xs">Invoice's price by</td>
                <td class="border border-gray-400 p-2 text-center align-top">
                    <label class="block"><input type="radio" name="VERIFYING" value="25" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">Very Good Support (XML file / PDF file (convert/not scan) / Excel file)</span></label>
                </td>
                <td class="border border-gray-400 p-2 text-center align-top">
                    <label class="block"><input type="radio" name="VERIFYING" value="20" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">Good Support (Text file (own pattern/form))</span></label>
                </td>
                <td class="border border-gray-400 p-2 bg-gray-50"></td>
                <td class="border border-gray-400 p-2 bg-gray-50"></td>
                <td class="border border-gray-400 p-2 text-center align-top">
                    <label class="block"><input type="radio" name="VERIFYING" value="5" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">Not able advance any file before deliver to AMEC</span></label>
                </td>
                <td class="border border-gray-400 p-2 bg-gray-50"></td>
            </tr>
        </tbody>
    </table>

    <!-- สรุปผลคะแนน -->
    <div class="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-lg flex flex-col sm:flex-row items-center gap-6">
        <label class="font-bold text-sm">TOTAL SCORE: <span class="text-blue-600 text-xl ml-2 total-score">0</span></label>
        <div class="h-6 w-px bg-gray-400 hidden sm:block"></div>
        <label class="font-bold text-sm">JUDGEMENT: <span class="text-red-600 uppercase italic ml-2 judgement-result">-</span></label>
    </div>
</div>

</div>

<div class="pro mt-4 space-y-4">
  <div class="mt-4">
    <div class="font-semibold text-sm mb-2 text-gray-900">Management</div>
    <div class="grid grid-cols-1 gap-4 bg-white border border-gray-200 rounded-md px-6 py-4 text-sm text-gray-700">
      <div class="flex items-center gap-2">
        <span class="font-semibold text-gray-900">Quality Management (ISO9001) :</span>
        <span id="QM_STATUS" class="inline-block"></span>
      </div>
      <div class="flex items-center gap-2">
        <span class="font-semibold text-gray-900">CSR Management :</span>
        <span id="CSR_STATUS" class="inline-block"></span>
      </div>
      <div class="flex items-center gap-2">
        <span class="font-semibold text-gray-900">Environmental (ISO14001) :</span>
        <span id="ENV_STATUS" class="inline-block"></span>
      </div>
    </div>
  </div>  

  <div class="flex flex-row items-baseline gap-2">
    <div class="font-semibold text-sm whitespace-nowrap">Labor Union :</div>
    <div id="LABOR_STATUS" class="text-gray-700 text-sm break-words"></div>
  </div>
  <div class="mt-4">
    <div class="font-semibold text-sm mb-2 text-gray-900">Main Customer</div>
      <div class="overflow-x-auto">
        <table class="w-full border-collapse border border-gray-300 text-sm text-left text-gray-700">
            <thead class="bg-gray-50">
            <tr>
                <th class="border border-gray-300 px-4 py-2 font-semibold text-left">Name</th>
                <th class="border border-gray-300 px-4 py-2 font-semibold text-center w-40">%</th>
            </tr>
            </thead>
            <!-- ตั้ง id ไว้สำหรับให้ JavaScript อ้างอิงเพื่อเอาข้อมูลมาใส่ -->
            <tbody id="customer-tbody">
            <!-- แถวข้อมูลจะถูกเพิ่มผ่าน JS ตรงนี้ -->
            </tbody>
        </table>
        </div>

  </div>  
    <div class="mt-4">
    <div class="font-semibold text-sm mb-2 text-gray-900">Supplier of Main Material</div>
      <div class="overflow-x-auto">
        <table class="w-full border-collapse border border-gray-300 text-sm text-left text-gray-700">
            <thead class="bg-gray-50">
            <tr>
                <th class="border border-gray-300 px-4 py-2 font-semibold text-left">Name</th>
                <th class="border border-gray-300 px-4 py-2 font-semibold text-center w-40">%</th>
            </tr>
            </thead>
            <!-- ตั้ง id ไว้สำหรับให้ JavaScript อ้างอิงเพื่อเอาข้อมูลมาใส่ -->
            <tbody id="supplier-tbody">
            <!-- แถวข้อมูลจะถูกเพิ่มผ่าน JS ตรงนี้ -->
            </tbody>
        </table>
        </div>
  </div>  
    <div class="mt-4">
    <div class="font-semibold text-sm mb-2 text-gray-900">Main Product</div>
      <div class="overflow-x-auto">
        <table class="w-full border-collapse border border-gray-300 text-sm text-left text-gray-700">
            <thead class="bg-gray-50">
            <tr>
                <th class="border border-gray-300 px-4 py-2 font-semibold text-left">Name</th>
                <th class="border border-gray-300 px-4 py-2 font-semibold text-center w-40">%</th>
            </tr>
            </thead>
            <!-- ตั้ง id ไว้สำหรับให้ JavaScript อ้างอิงเพื่อเอาข้อมูลมาใส่ -->
            <tbody id="product-tbody">
            <!-- แถวข้อมูลจะถูกเพิ่มผ่าน JS ตรงนี้ -->
            </tbody>
        </table>
        </div>
  </div> 
<div id="section-eva-pro" class="mb-8 mt-6 border-2 border-dashed border-gray-400 rounded-lg p-6 bg-blue-50">
    <h2 class="font-bold text-lg mb-4 text-gray-800 pb-2">Evaluation (Purchasing Matters)</h2>
    <div class="overflow-x-auto">
        <table id="eval-table" class="w-full text-sm border-collapse border border-gray-400 bg-white">
            <thead>
                <tr class="bg-gray-100">
                    <th class="border border-gray-400 p-2 text-left" rowspan="2">Evaluation Item</th>
                    <th class="border border-gray-400 p-2 text-left" rowspan="2">Check Point</th>
                    <th class="border border-gray-400 p-2 text-center" colspan="5">Score</th>
                </tr>
                <tr class="bg-gray-50 text-xs text-center">
                    <th class="border border-gray-400 p-1 w-[16%]">25</th>
                    <th class="border border-gray-400 p-1 w-[16%]">20</th>
                    <th class="border border-gray-400 p-1 w-[16%]">15</th>
                    <th class="border border-gray-400 p-1 w-[16%]">10</th>
                    <th class="border border-gray-400 p-1 w-[16%]">5</th>
                </tr>
            </thead>
            <tbody>
                <!-- PRICE LEVEL -->
                <tr>
                    <td class="border border-gray-400 p-2 text-xs font-semibold">PRICE LEVEL</td>
                    <td class="border border-gray-400 p-2 text-xs">Comparison with market price or competitor</td>
                    <td class="border border-gray-400 p-2 text-center align-top">
                        <label class="block"><input type="radio" name="PRICE_LEVEL" value="25" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">VERY COMPETITIVE</span></label>
                    </td>
                    <td class="border border-gray-400 p-2 text-center align-top">
                        <label class="block"><input type="radio" name="PRICE_LEVEL" value="20" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">COMPETITIVE</span></label>
                    </td>
                    <td class="border border-gray-400 p-2 text-center align-top">
                        <label class="block"><input type="radio" name="PRICE_LEVEL" value="15" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">SAME LEVEL</span></label>
                    </td>
                    <td class="border border-gray-400 p-2 text-center align-top">
                        <label class="block"><input type="radio" name="PRICE_LEVEL" value="10" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">SLITELY EXPENSIVE</span></label>
                    </td>
                    <td class="border border-gray-400 p-2 text-center align-top">
                        <label class="block"><input type="radio" name="PRICE_LEVEL" value="5" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">EXPENSIVE</span></label>
                    </td>
                </tr>

                <!-- ORDER MANAGEMENT -->
                <tr>
                    <td class="border border-gray-400 p-2 text-xs font-semibold">ORDER MANAGEMENT</td>
                    <td class="border border-gray-400 p-2 text-xs">Control system from P/O to delivery</td>
                    <td class="border border-gray-400 p-2 text-center align-top">
                        <label class="block"><input type="radio" name="ORDER_LEVEL" value="25" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">SYSTEMATIC CONTROL</span></label>
                    </td>
                    <td class="border border-gray-400 p-2 text-center align-top">
                        <label class="block"><input type="radio" name="ORDER_LEVEL" value="20" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">SEMI SYSTEMATIC</span></label>
                    </td>
                    <td class="border border-gray-400 p-2 text-center align-top">
                        <label class="block"><input type="radio" name="ORDER_LEVEL" value="15" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">EXCEL CONTROL</span></label>
                    </td>
                    <td class="border border-gray-400 p-2 text-center align-top">
                        <label class="block"><input type="radio" name="ORDER_LEVEL" value="10" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">MANUAL BOOK</span></label>
                    </td>
                    <td class="border border-gray-400 p-2 text-center align-top">
                        <label class="block"><input type="radio" name="ORDER_LEVEL" value="5" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">NOT CONTROL</span></label>
                    </td>
                </tr>

                <!-- CUSTOMER SERVICE -->
                <tr>
                    <td class="border border-gray-400 p-2 text-xs font-semibold">CUSTOMER SERVICE</td>
                    <td class="border border-gray-400 p-2 text-xs">Responsiveness for delivery/price</td>
                    <td class="border border-gray-400 p-2 text-center align-top">
                        <label class="block"><input type="radio" name="CUSTOMER_LEVEL" value="25" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">VERY GOOD<br>(1 day)</span></label>
                    </td>
                    <td class="border border-gray-400 p-2 text-center align-top">
                        <label class="block"><input type="radio" name="CUSTOMER_LEVEL" value="20" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">GOOD<br>(3 days)</span></label>
                    </td>
                    <td class="border border-gray-400 p-2 text-center align-top">
                        <label class="block"><input type="radio" name="CUSTOMER_LEVEL" value="15" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">FAIR<br>(1 week)</span></label>
                    </td>
                    <td class="border border-gray-400 p-2 text-center align-top">
                        <label class="block"><input type="radio" name="CUSTOMER_LEVEL" value="10" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">BAD<br>(2 weeks)</span></label>
                    </td>
                    <td class="border border-gray-400 p-2 text-center align-top">
                        <label class="block"><input type="radio" name="CUSTOMER_LEVEL" value="5" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">VERY BAD<br>(&gt;2 weeks)</span></label>
                    </td>
                </tr>

                <!-- STANDARD DELIVERY -->
                <tr>
                    <td class="border border-gray-400 p-2 text-xs font-semibold">STANDARD DELIVERY</td>
                    <td class="border border-gray-400 p-2 text-xs">Delivery term vs Competitor</td>
                    <td class="border border-gray-400 p-2 text-center align-top">
                        <label class="block"><input type="radio" name="DELIVERY_LEVEL" value="25" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">VERY SHORT</span></label>
                    </td>
                    <td class="border border-gray-400 p-2 text-center align-top">
                        <label class="block"><input type="radio" name="DELIVERY_LEVEL" value="20" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">SHORT</span></label>
                    </td>
                    <td class="border border-gray-400 p-2 text-center align-top">
                        <label class="block"><input type="radio" name="DELIVERY_LEVEL" value="15" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">SAME</span></label>
                    </td>
                    <td class="border border-gray-400 p-2 text-center align-top">
                        <label class="block"><input type="radio" name="DELIVERY_LEVEL" value="10" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">LONGER</span></label>
                    </td>
                    <td class="border border-gray-400 p-2 text-center align-top">
                        <label class="block"><input type="radio" name="DELIVERY_LEVEL" value="5" onclick="return false;" class="block mx-auto mb-1 w-4 h-4 accent-blue-600"><span class="text-[10px] leading-tight block mt-1">VERY LONGER</span></label>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- ส่วนสรุปผลคะแนน -->
    <div class="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-lg flex flex-col sm:flex-row items-center gap-6">
        <label class="font-bold text-sm">TOTAL SCORE: <span class="text-blue-600 text-xl ml-2 total-score">0</span></label>
        <div class="h-6 w-px bg-gray-400 hidden sm:block"></div>
        <label class="font-bold text-sm">JUDGEMENT: <span class="text-red-600 uppercase italic ml-2 judgement-result">-</span></label>
    </div>
</div>



</div>

    </div>

    <!-- 4. ส่วน Attach files -->
    <div class="border border-gray-300 shadow-sm rounded-lg pt-5 px-5 pb-5 mt-8 mb-5 bg-white relative">
      <!-- เปลี่ยนเป็น !bg-transparent ตามที่ต้องการ -->
      <div class="absolute -top-3.5 left-5 !bg-transparent px-2.5 text-lg font-bold text-gray-900 m-0 z-10">Attach files</div>
      <div class="">
       <!-- หัวข้อที่ 1: Company Certificate / Vat Register / Company Profile (FILE_TYPE = 11) -->
        <div class="nonpro mt-4">
          <span class="text-sm font-medium block mb-2">Company Certificate / Vat Register / Company Profile :</span>
          <div id="file-type-11" class="file-container"></div>
        </div>

        <!-- หัวข้อที่ 2: IE's evaluation Document (FILE_TYPE = 12) -->
        <div class="pro mt-4">
          <span class="text-sm font-medium block mb-2">IE's evaluation Document :</span>
          <div id="file-type-12" class="file-container"></div>
        </div>

        <!-- หัวข้อที่ 3: QA's evaluation Document (FILE_TYPE = 13) -->
        <div class="pro mt-4">
          <span class="text-sm font-medium block mb-2">QA's evaluation Document :</span>
          <div id="file-type-13" class="file-container"></div>
        </div>

        <!-- หัวข้อที่ 4: Other / ATTACH_OTHER (FILE_TYPE = 2) -->
        <div class="mt-4">
          <span class="text-sm font-medium block mb-2">Other : <span id="ATTACH_OTHER_TEXT" class="text-gray-600 font-normal"></span></span>
          <div id="file-type-2" class="file-container"></div>
        </div>
      </div>
    </div> 

<div class="border border-gray-300 shadow-sm rounded-lg pt-5 px-5 pb-5 mt-8 mb-5 bg-white relative">
  <div id="MJUDGEMENT"></div>
  <div>
    <label class="block font-bold text-sm mb-2 text-gray-800">Comment/Conclusion</label>
    <textarea name="txtRemark"
      class="w-full border border-gray-400 p-2 rounded text-sm focus:outline-none" 
      rows="4" 
      placeholder="Additional comments (if any)..."
    ></textarea>
  </div> 
</div>

  </div>

  <div id="form-action-container"></div>
</form>

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/purEvaView.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection