@extends('layouts/webflowTemplate')

@section('styles')
<style>
    section {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    fieldset:not(:has(.fieldset-label)) {
        display: flex;
    }

    fieldset span {
        font-weight: bold;
        white-space: nowrap;
        width: fit-content;
    }


    span.required::after, h2.required::after {
        content: "**";
        color: red;
        font-weight: bold;
        padding-left: 0.25rem;
    }
/* การทำเงาและขอบที่นุ่มนวล */
#searchModal {
    border: none;
    border-radius: 20px; /* มุมมนรับกับ UI สมัยใหม่ */
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); /* เงาเข้มเพื่อดึงให้ลอย */
    padding: 0;
    overflow: hidden;
    background: white;
}

/* ใส่ Gradient ให้หัวข้อ เพื่อให้ดูมี Layer */
.modal-header-gradient {
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    color: white;
    padding: 20px 24px;
}

/* เพิ่ม Effect ให้รายการตอน Hover */
.select-item {
    transition: all 0.3s ease;
    border-left: 4px solid transparent;
}
.select-item:hover {
    background-color: #f1f5f9;
    border-left: 4px solid #3b82f6; /* มีเส้นแถบสีน้ำเงินขึ้นที่ขอบซ้าย */
}
#tableSearch tbody tr:hover {
        background-color: #eff6ff !important; /* คือสี blue-50 */
        cursor: pointer !important;
    }
    
</style>
@endsection
@section('contents')
<div class="hidden form-info" nfrmno="{{$NFRMNO}}" vorgno="{{$VORGNO}}" cyear="{{$CYEAR}}" mode="{{$mode}}"
    cyear2="{{$mode !=1 ? $CYEAR2 : '' }}" nrunno="{{$mode !=1 ? $NRUNNO : '' }}" return="{{$return ?? ''}}"></div>
<div class="hidden apv-data" empno="{{$empno}}"></div>
<form id="frmmain">
<div class="space-y-6">
 
    <!-- Top Section -->
    <div class="border border-gray-300 p-6 rounded-lg bg-white space-y-4">
        <div class="grid grid-cols-[140px_1fr] items-center gap-2">
            <span class="font-semibold text-sm">Input By:</span>
            <input type="text" maxlength="5" class="input input-sm border border-gray-400 h-8 rounded w-48 px-2" value="{{$empno}}" readonly>
        </div>
        <div class="grid grid-cols-[140px_1fr] items-center gap-2 required">
            <span class="font-semibold text-sm required ">Request By:</span>
            <input type="text" maxlength="5" class="input input-sm border border-gray-400 h-8 rounded w-48 px-2  req" value="{{$empno}}">
        </div>
    </div>

    <!-- Operation Section -->
<div class="border border-gray-300 p-6 rounded-lg bg-white">
    <div class="grid grid-cols-[140px_1fr] items-center gap-2">
        <span class="font-semibold text-sm required">Operation:</span>
        
        <div class="flex items-center gap-6">
            <label class="flex items-center gap-2 cursor-pointer text-gray-700 text-sm">
                <input type="radio" name="OPERATION" value="N" class="w-4 h-4 accent-blue-600"> New vendor
            </label>
            
            <label class="flex items-center gap-2 cursor-pointer text-gray-700 text-sm">
                <input type="radio" name="OPERATION" value="A" class="w-4 h-4 accent-blue-600"> Annual evaluation for
            </label>
            
            <div class="flex items-center gap-4">
                <input type="text" maxlength="5" placeholder="Vendor Code" class="input input-sm border border-gray-400 h-8 rounded w-48 px-2">
                
                <label class="flex items-center gap-2 cursor-pointer text-gray-700 text-sm">
                    <input type="checkbox" name="UPSTATUS" class="w-4 h-4 accent-blue-600 rounded"> 
                    Update Vendor Master
                </label>
            </div>
        </div>
    </div>
</div>
<div class="border border-gray-300 p-6 rounded-lg bg-white">
        
        <!-- Header Section -->
        <div class="flex justify-between items-center mb-6">
            <h3 class="font-bold text-lg">General Information</h3>
            <div class="flex items-center gap-4">
                
                <div class="relative flex items-center">
                    <svg class="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    
                    <input type="text" id="directSearchInput" 
                        class="block w-64 pl-10 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                        placeholder="Add from PUR-NVF Form">
                </div>

                <span class="text-xs font-semibold text-gray-400">OR</span>

                <button id="btnOpenModal" type="button" class="inline-flex items-center gap-2 px-4 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                    </svg>
                    Browse List
                </button>

            </div>
        </div>

        <!-- เนื้อหาภายใน -->
        <div class="space-y-6">
        <div class="grid grid-cols-[140px_1fr] gap-4 items-start">
            <span class="font-semibold text-sm pt-1 required">Vendor Type</span>
            
            <div class="grid grid-cols-3 gap-y-2 gap-x-4 text-sm">
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="VENDGROUP" value="1:Oversea (Relate MELCO Group) (1)" class="w-4 h-4 accent-blue-600 req radio-typec"> Oversea (Relate MELCO Group) (1)
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="VENDGROUP" value="2:Oversea (Not relate MELCO Group) (2)" class="w-4 h-4 accent-blue-600 req radio-typec"> Oversea (Not relate MELCO Group) (2)
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="VENDGROUP" value="3:Domestic (Use BOI) (3)" class="w-4 h-4 accent-blue-600 req radio-typec"> Domestic (Use BOI) (3)
                </label>
                
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="VENDGROUP" value="4:Domestic (Use IPO) (4)" class="w-4 h-4 accent-blue-600 req radio-typec"> Domestic (Use IPO) (4)
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="VENDGROUP" value="7:Domestic (Use FTA) (7)" class="w-4 h-4 accent-blue-600 req radio-typec"> Domestic (Use FTA) (7)
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="VENDGROUP" value="5:Domestic Vendor (5)" class="w-4 h-4 accent-blue-600 req radio-typec"> Domestic Vendor (5)
                </label>
                
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="VENDGROUP" value="8:Sub-Contractor (8)" class="w-4 h-4 accent-blue-600 req radio-typec"> Sub-Contractor (8)
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="VENDGROUP" value="6:Non-Production (6)" class="w-4 h-4 accent-blue-600 req radio-typec"> Non-Production (6)
                </label>
             
            </div>
        </div>
        <div class="grid grid-cols-[140px_1fr] gap-4 items-start mt-4 pro">
            <span class="font-semibold text-sm pt-1">Vendor Purpose</span>
            
            <div class="grid grid-cols-3 gap-y-2 gap-x-4 text-sm">
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="VENDPURPOSE" value="9:PCB in house (9)" class="w-4 h-4 accent-blue-600"> PCB in house (9)
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="VENDPURPOSE" value="5:FTA privilege by AMEC (5)" class="w-4 h-4 accent-blue-600"> FTA privilege by AMEC (5)
                </label>
                <div></div> <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="VENDPURPOSE" value="8:Maintenance (8)" class="w-4 h-4 accent-blue-600"> Maintenance (8)
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="VENDPURPOSE" value="0:General...(0)" class="w-4 h-4 accent-blue-600"> General ... (0)
                </label>
                <div></div> </div>
        </div>

            
            <div class="grid grid-cols-[140px_1fr] items-center gap-4">
                <span class="font-semibold text-sm required">Vendor Name</span>
                <div class="flex items-center gap-4">
                    <input type="text" name="COMNAME" class="input input-sm border border-gray-400 h-8 rounded w-1/3 px-2 req">
                    <label class="flex items-center gap-2 text-sm"><input type="radio" name="VENDTYPE" value="Local" class="w-4 h-4 accent-blue-600  radio-type"> Local</label>
                    <label class="flex items-center gap-2 text-sm"><input type="radio" name="VENDTYPE" value="Oversea" class="w-4 h-4 accent-blue-600  radio-type"> Oversea</label>
                    <select name="COUNTRY_SELECT" id="COUNTRY_SELECT" class="select select-bordered select-sm bg-gray-50 border-gray-300 country  w-[200px]" disabled>
                            <option value="">-- Select Country --</option>
                    </select>
                </div>
            </div>

           <!-- Address (EN) Section -->
<div class="grid grid-cols-[140px_1fr] gap-4 pt-4 border-t border-gray-200">
    <span class="font-semibold text-sm pt-2 required">Address (EN) </span>
    <div class="space-y-4">
        <!-- Address Line 1 -->
        <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1">No., Village, Building, Alley, Road</label>
            <input type="text" name="ADDRESS_EN"   id="ADDRESS_EN"  placeholder="e.g. 43/86 Moo 16, Bangna Road..." class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full req">
        </div>
        <!-- Grid for Province/District -->
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Province</label>
                <input type="text" name="PROVINCE_EN" id="PROVINCE_EN" maxlength="100" class="input input-bordered input-sm w-full req bg-gray-50 border-gray-300 field-oversea" placeholder="Province">
                <div id="PROVINCE_LOCAL_WRAPPER" class="field-local hidden">
                    <select id="PROVINCE_SELECT" class="province">
                        <option value="">-- Select Province --</option>
                    </select>
                </div>

            </div>
            <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">District</label>
                <input type="text" name="DISTRICT_EN" id="DISTRICT_EN" maxlength="100" class="input input-bordered input-sm w-full req bg-gray-50 border-gray-300 field-oversea" placeholder="District">
                <div id="DISTRICT_LOCAL_WRAPPER" class="field-local hidden">
                    <select id="DISTRICT_SELECT" class="district">
                        <option value="">-- Select District --</option>
                    </select>
                </div>
            </div>
        </div>
        <!-- Grid for Sub-district/Postcode -->
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Sub-district</label>
                <input type="text" name="SUB_DISTRICT_EN" id="SUB_DISTRICT_EN" maxlength="100" class="input input-bordered input-sm w-full req bg-gray-50 border-gray-300 field-oversea" placeholder="Sub-district">
                <div id="SUB_DISTRICT_LOCAL_WRAPPER" class="field-local hidden">
                    <select id="SUB_DISTRICT_SELECT" class="sub-district">
                        <option value="">-- Select Sub-district --</option>
                    </select>
                </div>
            </div>
            <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Postcode</label>
                <input type="text" name="POSTCODE_EN" id="POSTCODE_EN"  placeholder="Postcode" class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full req">
            </div>
        </div>
        <!-- Country -->
        <div class="grid grid-cols-2 gap-4">
                <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Country</label>
                <input type="text" name="COUNTRY_EN" id="COUNTRY_EN" placeholder="Country" class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full req">
            </div>
        </div>
    </div>
</div>

<!-- Address (TH) Section -->
<div class="grid grid-cols-[140px_1fr] gap-4 pt-4 border-t border-gray-200">
    <label class="font-semibold text-sm pt-2">Address (TH)</label>
    <div class="space-y-4">
        <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1">บ้านเลขที่, หมู่บ้าน, อาคาร, ซอย, ถนน</label>
            <input type="text" name="ADDRESS_TH" id="ADDRESS_TH" placeholder="เช่น 43/86 หมู่ 16 ซอยบางนา" maxlength="200" class="input input-bordered input-sm w-full  bg-gray-50 border-gray-300" placeholder="เช่น 43/86 หมู่ 16 ซอยบางนา...">
        </div>
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">จังหวัด</label>
                <input type="text" name="PROVINCE_TH" id="PROVINCE_TH" maxlength="100" class="input input-bordered input-sm w-full  bg-gray-50 border-gray-300" placeholder="จังหวัด">

            </div>
            <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">อำเภอ / เขต</label>
                 <input type="text" name="DISTRICT_TH" id="DISTRICT_TH" maxlength="100" class="input input-bordered input-sm w-full  bg-gray-50 border-gray-300" placeholder="อำเภอ / เขต">
            </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">ตำบล / แขวง</label>
                <input type="text" name="SUB_DISTRICT_TH" id="SUB_DISTRICT_TH" maxlength="100" class="input input-bordered input-sm w-full  bg-gray-50 border-gray-300" placeholder="ตำบล / แขวง">
            </div>
            <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">รหัสไปรษณีย์</label>
                <input type="text" name="POSTCODE_TH" id="POSTCODE_TH" maxlength="50" class="input input-bordered input-sm w-full  bg-gray-50 border-gray-300" placeholder="รหัสไปรษณีย์">
            </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">ประเทศ</label>
                <input type="text" name="COUNTRY_TH" id="COUNTRY_TH" maxlength="200" class="input input-bordered input-sm w-full bg-gray-50 border-gray-300" placeholder="ประเทศ" readonly>
            </div>
        </div>
    </div>
</div>
            <!-- Contact Information -->
            <div class="pt-4 border-t border-gray-200 space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div class="grid grid-cols-[140px_1fr] items-center gap-4">
                        <span class="font-semibold text-sm required">Contact name</span>
                       <input type="text" name="CONTACT" id="CONTACT" maxlength="90" class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full req">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="grid grid-cols-[140px_1fr] items-center gap-4">
                        <span class="font-semibold text-sm required">Email</span>
                        <input type="text" name="EMAIL" id="EMAIL" maxlength="90" class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full req">
                    </div>
                    <div class="grid grid-cols-[140px_1fr] items-center gap-4">
                        <span class="font-semibold text-sm required">Web site</span>
                        <input type="text" name="WEBSITE" id="WEBSITE" maxlength="200" class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full req">
                    </div>
                    <div class="grid grid-cols-[140px_1fr] items-center gap-4">
                        <span class="font-semibold text-sm required">Tel.no</span>
                        <input type="text"  name="TELNO" id="TELNO" maxlength="12" class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full req">
                    </div>
                    <div class="grid grid-cols-[140px_1fr] items-center gap-4">
                        <span class="font-semibold text-sm">Fax.no</span>
                        <input type="text" name="FAX" id="FAX" maxlength="30" class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full">
                    </div>
                </div>
            </div>
            <!-- ส่วนคั่นจาก Contact name -->
<div class="border-t border-gray-300 pt-6 mt-6">
    <!-- Bank & Branch -->
    <div class="grid grid-cols-2 gap-4 mb-4">
        <div class="grid grid-cols-[140px_1fr] items-center gap-4">
            <span class="font-semibold text-sm required">Bank name</span>
            <input type="text"  name="BANKNAME" id="BANKNAME" maxlength="50"  class="input input-sm border border-gray-400 h-8 rounded px-2 w-full req">
        </div>
        <div class="grid grid-cols-[140px_1fr] items-center gap-4">
            <span class="font-semibold text-sm required">Branch name</span>
            <input type="text" name="BRANCH" id="BRANCH" maxlength="50"  class="input input-sm border border-gray-400 h-8 rounded px-2 w-full req">
        </div>
    </div>

    <!-- Additional Banking & Payment Fields -->
    <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
        <div class="grid grid-cols-[140px_1fr] items-center gap-4">
            <span class="font-semibold text-sm required">Account number</span>
            <input type="text" name="ACCNUMBER" id="ACCNUMBER" maxlength="13" class="input input-sm border border-gray-400 h-8 rounded px-2 w-full req">
        </div>
        </div>
        <div class="grid grid-cols-[140px_1fr] items-start gap-4">
            <label class="font-semibold text-sm pt-1">Bank Address</label>
            <textarea  name="BANKADDR" id="BANKADDR" class="textarea textarea-sm border border-gray-400 rounded px-2 w-full text-sm py-1" rows="2"></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div class="grid grid-cols-[140px_1fr] items-center gap-4">
                <span class="font-semibold text-sm required">Payment Term</span>
                	<input type="hidden" id="TERM_PAYMENT_HIDDEN" name="TERMCODE" value="">
                            <select id="TERM_PAYMENT" name ="TERM_PAYMENT" class="select select-sm w-48 min-w-max termcode req">
                                <option value="" disabled selected>...</option>
                            </select>
            </div>
            <div class="grid grid-cols-[140px_1fr] items-center gap-4">
                <span class="font-semibold text-sm required">Currency Code</span>
                 <select id="stdcur" name="STDCUR" class="input input-sm border border-gray-400 h-8 rounded px-2 w-48 currency req">
                    <option value="" disabled selected>...</option>
                    </select>
            </div>
        </div>

<!-- คอลัมน์หลักสำหรับ Label และ Checkbox -->
<div class="grid grid-cols-[140px_1fr] items-start gap-4">
    <span class="font-semibold text-sm required pt-2">Attach files</span>
    
    <fieldset class="flex flex-col gap-2">
        <label class="attach-file text-sm flex items-center gap-2" id="attach-po">
        <input type="checkbox" name="ATTACH_TYPE" value="Company Certification" class="checkbox checkbox-xs" a-type="cer">
            Company Certificate / Company Profile
        </label>
        <label class="attach-file text-sm flex items-center gap-2" id="attach-ie">
            <input type="checkbox" name="ATTACH_TYPE" value="IE evaluation" class="checkbox checkbox-xs" a-type="ie">
            IE's evaluation Document
        </label>
        <label class="attach-file text-sm flex items-center gap-2" id="attach-qa">
            <input type="checkbox" name="ATTACH_TYPE" value="QA evaluation" class="checkbox checkbox-xs" a-type="qa">
            QA's evaluation Document
        </label>
        <label class="attach-file text-sm flex items-center gap-2" id="attach-other">
            <input type="checkbox" name="ATTACH_TYPE" value="Other" class="checkbox checkbox-xs" a-type="other">
            Other
            <input type="text" name="ATTACH_OTHER" id="ATTACH_OTHER" class="input input-sm w-full border border-gray-400 rounded px-2" disabled>
        </label>
    </fieldset>
</div>

<!-- ย้าย Dropzone ออกมาข้างนอก เพื่อให้ใช้ความกว้างได้เต็ม 100% ของ Container หลัก -->
<div id="attachFile" class="mt-4">
    <div class="p-3 w-full">
        <label for="files" class="dropZone border border-primary border-dashed rounded-lg w-full block min-h-[200px] text-primary cursor-pointer hover:bg-gray-50 transition-colors">
            <!-- จัดให้อยู่ตรงกลางกล่อง -->
            <div class="drop-message flex flex-col justify-center items-center h-[200px] text-center p-4">
                <span class="font-semibold">Drag & Drop files here or click to select</span>
            </div>
            <ul class="drop-list w-full flex-col items-start text-gray-500 hidden p-1 gap-1"></ul>
        </label>
        <input type="file" class="inputDrop hidden" name="files" id="files" multiple>
    </div>
</div>
    </div>
</div>
        </div>
    </div>
<!-- Vendor Evaluation Section -->
<div id="nonpro" class="border border-gray-300 p-6 rounded-lg bg-white mt-6 hidden">
    <h2 class="font-bold text-lg ">Vendor Evaluation</h2>
    <!-- ส่วน Compliance (ตัวแดง) -->
    <div class="border-2 border-dashed border-gray-400 p-4 rounded-lg mb-6 bg-gray-50 field-oversea-nonpro">
        <span class="required font-bold mb-3">Compliance</span>
        <div class="grid grid-cols-1 gap-2 text-black text-sm">
            <label class="flex items-center gap-2"><input type="checkbox" name = "COMPLIANCE" value="ไม่ได้อยู่ในกลุ่มควบคุม ข้อกำหนด AMEC-5070: Rule for Export Control"> ไม่ได้อยู่ในกลุ่มควบคุม ข้อกำหนด AMEC-5070: Rule for Export Control</label>
            <label class="flex items-center gap-2"><input type="checkbox" name = "COMPLIANCE" value="ไม่อยู่ในรายชื่อที่ถูกลงโทษจาก UNSC"> ไม่อยู่ในรายชื่อที่ถูกลงโทษจาก UNSC</label>
            <label class="flex items-center gap-2"><input type="checkbox" name = "COMPLIANCE" value="ไม่อยู่ในประเทศ ประเทศไทยคว่ำบาตร ตามมาตรการคว่ำบาตร โดยสหประชาชาติ WWW.dff-go.th"> ไม่อยู่ในประเทศ ประเทศไทยคว่ำบาตร ตามมาตรการคว่ำบาตร โดยสหประชาชาติ WWW.dff-go.th</label>
            <label class="flex items-center gap-2"><input type="checkbox" name = "COMPLIANCE" value="AMEC's standard Terms of 'CIF'"> AMEC's standard Terms of "CIF"</label>
            <label class="flex items-center gap-2"><input type="checkbox" name = "COMPLIANCE" value="ได้รับ Financial Record"> ได้รับ Financial Record</label>
            <div class="flex items-center gap-2">
                <label class="flex items-center gap-2 flex-shrink-0"><input type="checkbox" name = "COMPLIANCE" value="อื่นๆ ระบุ"> อื่นๆ ระบุ</label>
                <input type="text"  name = "COMPLIANCE_OTHER" class="input input-sm border border-gray-400 h-8 rounded w-1/2 px-2">
                <span class="text-red-600 text-sm font-semibold whitespace-nowrap">ข้อกำหนด AMEC-6000: Rule for Purchase</span>
            </div>
              </div>
    </div>

            <!-- 1. รายการสินค้าและบริการ -->
    <div>
<span class="required font-bold text-sm block mb-2 field-local-nonpro">รายการสินค้าและบริการที่ยื่นจดทะเบียนเครื่องหมายการค้าในประเทศไทย</span>
<!-- ปรับตรงนี้เป็น grid-cols-3 -->
<div class="grid grid-cols-3 gap-x-4 gap-y-1 text-sm field-local-nonpro">
    <label class="flex items-center gap-2"><input type="radio" name="PRODCAT" value="เครื่องสำอาง ยา ผลิตภัณฑ์เคมี" class="w-4 h-4 accent-blue-600"> เครื่องสำอาง ยา ผลิตภัณฑ์เคมี</label>
    <label class="flex items-center gap-2"><input type="radio" name="PRODCAT" value="โลหะ เครื่องมืออุปกรณ์ วัสดุก่อสร้าง" class="w-4 h-4 accent-blue-600"> โลหะ เครื่องมืออุปกรณ์ วัสดุก่อสร้าง</label>
    <label class="flex items-center gap-2"><input type="radio" name="PRODCAT" value="เครื่องจักรกล เครื่องมือ เครื่องใช้ไฟฟ้า" class="w-4 h-4 accent-blue-600"> เครื่องจักรกล เครื่องมือ เครื่องใช้ไฟฟ้า</label>
    
    <label class="flex items-center gap-2"><input type="radio" name="PRODCAT" value="โลหะมีค่า นาฬิกา เครื่องหนัง" class="w-4 h-4 accent-blue-600"> โลหะมีค่า นาฬิกา เครื่องหนัง</label>
    <label class="flex items-center gap-2"><input type="radio" name="PRODCAT" value="เครื่องดนตรี ของเล่น อุปกรณ์กีฬา" class="w-4 h-4 accent-blue-600"> เครื่องดนตรี ของเล่น อุปกรณ์กีฬา</label>
    <label class="flex items-center gap-2"><input type="radio" name="PRODCAT" value="กระดาษ เครื่องเขียน เครื่องพิมพ์" class="w-4 h-4 accent-blue-600"> กระดาษ เครื่องเขียน เครื่องพิมพ์</label>
    
    <label class="flex items-center gap-2"><input type="radio" name="PRODCAT" value="ยาง พลาสติก" class="w-4 h-4 accent-blue-600"> ยาง พลาสติก</label>
    <label class="flex items-center gap-2"><input type="radio" name="PRODCAT" value="เฟอร์นิเจอร์ เครื่องใช้ในครัวเรือน" class="w-4 h-4 accent-blue-600"> เฟอร์นิเจอร์ เครื่องใช้ในครัวเรือน</label>
    <label class="flex items-center gap-2"><input type="radio" name="PRODCAT" value="เส้นใย เส้นด้าย สิ่งทอ เครื่องนุ่งห่ม" class="w-4 h-4 accent-blue-600"> เส้นใย เส้นด้าย สิ่งทอ เครื่องนุ่งห่ม</label>
    
    <label class="flex items-center gap-2"><input type="radio" name="PRODCAT" value="อาหาร เครื่องดื่ม ของหวาน" class="w-4 h-4 accent-blue-600"> อาหาร เครื่องดื่ม ของหวาน</label>
    <label class="flex items-center gap-2"><input type="radio" name="PRODCAT" value="เครื่องหมายบริการ" class="w-4 h-4 accent-blue-600"> เครื่องหมายบริการ</label>
    <label class="flex items-center gap-2"><input type="radio" name="PRODCAT" value="เครื่องหมายรับรอง" class="w-4 h-4 accent-blue-600"> เครื่องหมายรับรอง</label>
    
    <label class="flex items-center gap-2"><input type="radio" name="PRODCAT" value="เครื่องหมายร่วม" class="w-4 h-4 accent-blue-600"> เครื่องหมายร่วม</label>
</div>
    </div>
    <!-- องค์ประกอบอื่นๆ (Business Type, Financial Statement, etc.) -->
    <div class="space-y-6">
        <!-- Business Type -->
        <div class="grid grid-cols-1 gap-4 pt-4 ">
<div>
    <label class="font-bold text-sm block mb-1">ประเภทธุรกิจตอนจดทะเบียน (Business type at registration)</label>
    <input type="text" class="input input-sm border border-gray-400 h-8 rounded w-full px-2">
</div>

<div>
    <label class="font-bold text-sm block mb-1">ประเภทธุรกิจที่ส่งงบการเงินล่าสุด (Business type that submitted the latest financial statements)</label>
    <input type="text" class="input input-sm border border-gray-400 h-8 rounded w-full px-2">
</div>

<div class="rounded-lg mb-6 mt-4"> 
    <label class="font-bold text-sm block mb-1">กำไรขาดทุนสุทธิ 3 ปีล่าสุด</label>
    <table class="w-full text-center border-collapse">
        <thead>
            <tr class="bg-gray-100">
                <th class="border border-gray-400 p-2 w-1/3 text-sm">
                    <span class="text-xs text-gray-500">Year</span>
                </th>
                <th class="border border-gray-400 p-2 w-2/3 text-sm">
                   <span class="text-xs text-gray-500">Net Profit/Loss</span>
                </th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="border border-gray-400 p-2">
                    <input type="text" class="w-full border-none bg-transparent text-center focus:outline-none" placeholder="Year (e.g., 2026)">
                </td>
                <td class="border border-gray-400 p-2">
                    <input type="text" class="w-full border-none bg-transparent text-center focus:outline-none" placeholder="0.00">
                </td>
            </tr>
            <tr>
                <td class="border border-gray-400 p-2">
                    <input type="text" class="w-full border-none bg-transparent text-center focus:outline-none" placeholder="Year">
                </td>
                <td class="border border-gray-400 p-2">
                    <input type="text" class="w-full border-none bg-transparent text-center focus:outline-none" placeholder="0.00">
                </td>
            </tr>
            <tr>
                <td class="border border-gray-400 p-2">
                    <input type="text" class="w-full border-none bg-transparent text-center focus:outline-none" placeholder="Year">
                </td>
                <td class="border border-gray-400 p-2">
                    <input type="text" class="w-full border-none bg-transparent text-center focus:outline-none" placeholder="0.00">
                </td>
            </tr>
        </tbody>
    </table>
</div>
        </div>

    <!-- 2. ข้อมูลการจดทะเบียนนิติบุคคลและภาษี -->
    <div class="border-t pt-4">
        <div class="flex items-center gap-6 mb-3">
            <label class="font-bold text-sm">ข้อมูลการจดทะเบียนนิติบุคคลและภาษี</label>
            <label class="flex items-center gap-2 text-sm"><input type="radio" name="LEGALSTATUS" value="นิติบุคคล" class="w-4 h-4 accent-blue-600"> นิติบุคคล</label>
            <label class="flex items-center gap-2 text-sm"><input type="radio" name="LEGALSTATUS" value="บุคคลธรรมดา" class="w-4 h-4 accent-blue-600"> บุคคลธรรมดา</label>
        </div>
        <div class="grid grid-cols-1 gap-3">
            <div>
                <label class="block text-xs font-semibold text-gray-600">เลขทะเบียนนิติบุคคล</label>
                <input type="text" name="CORPORATE_ID" class="input input-sm border border-gray-400 h-8 rounded w-full px-2">
            </div>
            <div>
                <label class="block text-xs font-semibold text-gray-600">เลขประจำตัวผู้เสียภาษี ภ.พ. 20 (Tax ID)</label>
                <input type="text"  name="TAX_ID"  class="input input-sm border border-gray-400 h-8 rounded w-full px-2">
            </div>
        </div>
    </div>


    <!-- 3. รายละเอียดค่าใช้จ่ายและการประเมิน -->
    <div class="border-t pt-4">
        <label class="font-bold text-sm block mb-2">รายละเอียดค่าใช้จ่ายและการประเมิน</label>
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-xs font-semibold text-gray-600">Expense Type</label>
                <select class="w-full border border-gray-400 h-8 p-1 rounded text-sm"></select>
            </div>
            <div>
                <label class="block text-xs font-semibold text-gray-600">Concerned Division</label>
                <select class="w-full border border-gray-400 h-8 p-1 rounded text-sm"></select>
            </div>
        </div>
    </div>

    <!-- 4. Purchase Amount last year -->
    <div class="border-t pt-4">
        <h3 class="font-bold text-sm mb-3">Purchase Amount last year</h3>
        <div class="grid grid-cols-2 gap-8 items-start">
            <div class="space-y-3">
                <div>
                    <label class="block text-xs font-semibold text-gray-600">Fiscal Year</label>
                    <input type="text" name="FY_AMOUNT" class="w-full border border-gray-400 h-8 p-2 rounded text-sm">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-gray-600">Total Amount [Bht]</label>
                    <input type="text" id="AMOUNT" class="w-full border border-gray-400 h-8 p-2 rounded text-sm">
                </div>
                <label class="flex items-center gap-2 text-sm"><input type="checkbox" class="checkbox"> Not purchase more than 5 years "DO NOT USE"</label>
            </div>
            <div class="space-y-1 text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
                <label class="flex items-center gap-2"><input type="radio" name="PUR_LEVEL" value="A" class="w-4 h-4 accent-blue-600"> Level A: ≥ 1,000,000 Baht</label>
                <label class="flex items-center gap-2"><input type="radio" name="PUR_LEVEL" value="B" class="w-4 h-4 accent-blue-600"> Level B: < 1,000,000 and ≥ 100,000 Baht</label>
                <label class="flex items-center gap-2"><input type="radio" name="PUR_LEVEL" value="C" class="w-4 h-4 accent-blue-600"> Level C: < 100,000 and ≥ 10,000 Baht</label>
                <label class="flex items-center gap-2"><input type="radio" name="PUR_LEVEL" value="D" class="w-4 h-4 accent-blue-600"> Level D: < 10,000 Baht</label>
            </div>
        </div>
    </div>

    <div class="mb-8 mt-6 border-2 border-dashed border-gray-400 rounded-lg p-6 bg-blue-50">
    <table class="w-full text-sm border-collapse border border-gray-400 bg-white">
        <thead>
            <tr class="bg-gray-100">
                <th class="border border-gray-400 p-2 text-left" rowspan="2">Evaluation Item</th>
                <th class="border border-gray-400 p-2 text-left" rowspan="2">Check Point</th>
                <th class="border border-gray-400 p-2 text-center" colspan="5">Scroe</th>
            </tr>
            <tr class="bg-gray-50 text-xs text-center">
                <th class="border border-gray-400 p-1 w-[13%]">25</th>
                <th class="border border-gray-400 p-1 w-[13%]">20</th>
                <th class="border border-gray-400 p-1 w-[13%]">15</th>
                <th class="border border-gray-400 p-1 w-[13%]">10</th>
                <th class="border border-gray-400 p-1 w-[13%]">5</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="border border-gray-400 p-2 font-semibold">FINANCIAL STATEMENT</td>
                <td class="border border-gray-400 p-2 text-xs">Financial status evaluation</td>
                <td class="border border-gray-400 p-2 text-center align-top">
                    <label class="cursor-pointer block">
                        <input type="radio" name="FIN_LEVEL" value="A" class="block mx-auto mb-1 w-4 h-4 accent-blue-600">
                        <span class="text-[10px] leading-tight block mt-1">Bar C and Related with Melco's Group</span>
                    </label>
                </td>
                <td class="border border-gray-400 p-2 text-center align-top">
                    <label class="cursor-pointer block">
                        <input type="radio" name="FIN_LEVEL" value="B" class="block mx-auto mb-1 w-4 h-4 accent-blue-600">
                        <span class="text-[10px] leading-tight block mt-1">Has Company certificated, Tax payment, Profit ratio</span>
                    </label>
                </td>
                <td class="border border-gray-400 p-2 text-center align-top">
                    <label class="cursor-pointer block">
                        <input type="radio" name="FIN_LEVEL" value="C" class="block mx-auto mb-1 w-4 h-4 accent-blue-600">
                        <span class="text-[10px] leading-tight block mt-1">Has Company certificated, Tax payment</span>
                    </label>
                </td>
                <td class="border border-gray-400 p-2 text-center align-top">
                    <label class="cursor-pointer block">
                        <input type="radio" name="FIN_LEVEL" value="D" class="block mx-auto mb-1 w-4 h-4 accent-blue-600">
                        <span class="text-[10px] leading-tight block mt-1">Not found data of Tax payment and/or "DO NOT USE"</span>
                    </label>
                </td>
                <td class="border border-gray-400 p-2 bg-gray-50"></td> </tr>

            <tr>
                <td class="border border-gray-400 p-2 font-semibold">QUALITY CLASSIFICATION</td>
                <td class="border border-gray-400 p-2 text-xs">Classification by warranty</td>
                <td class="border border-gray-400 p-2 text-center align-top">
                    <label class="cursor-pointer block">
                        <input type="radio" name="QA_LEVEL" value="A" class="block mx-auto mb-1 w-4 h-4 accent-blue-600">
                        <span class="text-[10px] leading-tight block mt-1">No Claim</span>
                    </label>
                </td>
                <td class="border border-gray-400 p-2 text-center align-top">
                    <label class="cursor-pointer block">
                        <input type="radio" name="QA_LEVEL" value="B" class="block mx-auto mb-1 w-4 h-4 accent-blue-600">
                        <span class="text-[10px] leading-tight block mt-1">Clearly Claim on time/ 1 week</span>
                    </label>
                </td>
                <td class="border border-gray-400 p-2 text-center align-top">
                    <label class="cursor-pointer block">
                        <input type="radio" name="QA_LEVEL" value="C" class="block mx-auto mb-1 w-4 h-4 accent-blue-600">
                        <span class="text-[10px] leading-tight block mt-1">Clearly Claim 1-2 month</span>
                    </label>
                </td>
                <td class="border border-gray-400 p-2 text-center align-top">
                    <label class="cursor-pointer block">
                        <input type="radio" name="QA_LEVEL" value="D" class="block mx-auto mb-1 w-4 h-4 accent-blue-600">
                        <span class="text-[10px] leading-tight block mt-1">[Not warranty] "DO NOT USE"</span>
                    </label>
                </td>
                <td class="border border-gray-400 p-2 bg-gray-50"></td> </tr>

            <tr>
                <td class="border border-gray-400 p-2 font-semibold">ADVANCE VERIFYING</td>
                <td class="border border-gray-400 p-2 text-xs">Invoice's price by</td>
                <td class="border border-gray-400 p-2 text-center align-top">
                    <label class="cursor-pointer block">
                        <input type="radio" name="VERIFYING" value="XML file" class="block mx-auto mb-1 w-4 h-4 accent-blue-600">
                        <span class="text-[10px] leading-tight block mt-1">Very Good Support (XML file / PDF file (convert/not scan) / Excel file)</span>
                    </label>
                </td>
                <td class="border border-gray-400 p-2 text-center align-top">
                    <label class="cursor-pointer block">
                        <input type="radio" name="VERIFYING" value="PDF file" class="block mx-auto mb-1 w-4 h-4 accent-blue-600">
                        <span class="text-[10px] leading-tight block mt-1">Good Support (Text file (own pattern/form))</span>
                    </label>
                </td>
            <td class="border border-gray-400 p-2 bg-gray-50"></td>
             <td class="border border-gray-400 p-2 bg-gray-50"></td>
                <td class="border border-gray-400 p-2 text-center align-top">
                    <label class="cursor-pointer block">
                        <input type="radio" name="VERIFYING" value="Not able" class="block mx-auto mb-1 w-4 h-4 accent-blue-600">
                        <span class="text-[10px] leading-tight block mt-1">Not able advance any file before deliver to AMEC</span>
                    </label>
                </td>
            </tr>

            <tr>
                <td class="border border-gray-400 p-2 font-semibold">ENVIRONMENTAL</td>
                <td class="border border-gray-400 p-2 text-xs">ex.ISO14001 (ref.: PUR-QP-E003)</td>
                <td class="border border-gray-400 p-2 text-center align-top">
                    <label class="cursor-pointer block">
                        <input type="radio" name="ENV_LEVEL" value="A" class="block mx-auto mb-1 w-4 h-4 accent-blue-600">
                        <span class="text-[10px] leading-tight block mt-1">Has Environmental certificate</span>
                    </label>
                </td>
                <td class="border border-gray-400 p-2 text-center align-top">
                    <label class="cursor-pointer block">
                        <input type="radio" name="ENV_LEVEL" value="B" class="block mx-auto mb-1 w-4 h-4 accent-blue-600">
                        <span class="text-[10px] leading-tight block mt-1">Has own Environmental policy</span>
                    </label>
                </td>
                <td class="border border-gray-400 p-2 text-center align-top">
                    <label class="cursor-pointer block">
                        <input type="radio" name="ENV_LEVEL" value="C" class="block mx-auto mb-1 w-4 h-4 accent-blue-600">
                        <span class="text-[10px] leading-tight block mt-1">Has response & related material</span>
                    </label>
                </td>
                <td class="border border-gray-400 p-2 text-center align-top">
                    <label class="cursor-pointer block">
                        <input type="radio" name="ENV_LEVEL" value="D1" class="block mx-auto mb-1 w-4 h-4 accent-blue-600">
                        <span class="text-[10px] leading-tight block mt-1">Has not related material</span>
                    </label>
                </td>
                <td class="border border-gray-400 p-2 text-center align-top">
                    <label class="cursor-pointer block">
                        <input type="radio" name="ENV_LEVEL" value="D2" class="block mx-auto mb-1 w-4 h-4 accent-blue-600">
                        <span class="text-[10px] leading-tight block mt-1">Related & Not response</span>
                    </label>
                </td>
            </tr>
        </tbody>
    </table>
    <div class="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-lg flex flex-col sm:flex-row items-center gap-6">
        <label class="font-bold text-sm">TOTAL SCORE: <span id="total-score-non" class="text-blue-600 text-xl ml-2">0</span></label>
        <div class="h-6 w-px bg-gray-400 hidden sm:block"></div>
        <label class="font-bold text-sm">JUDGEMENT: <span id="judgement-result-non" class="text-red-600 uppercase italic ml-2">-</span></label>
    </div>
</div>

   
        <!-- <div class="grid grid-cols-2 gap-8 border-t pt-6">
    
            <div class="space-y-6">
                <div>
                    <h3 class="font-bold underline text-sm mb-2">Financial Statement:</h3>
                    <div class="space-y-1 text-sm">
                        <label class="flex items-center gap-2"><input type="radio" name="FIN_LEVEL" value="A" class="w-4 h-4 accent-blue-600"> Level A: Bar C and Related with Melco's Group Company</label>
                        <label class="flex items-center gap-2"><input type="radio" name="FIN_LEVEL" value="B" class="w-4 h-4 accent-blue-600"> Level B: Has Company certificated, Tax payment, Profit ratio</label>
                        <label class="flex items-center gap-2"><input type="radio" name="FIN_LEVEL" value="C" class="w-4 h-4 accent-blue-600"> Level C: Has Company certificated, Tax payment</label>
                        <label class="flex items-center gap-2"><input type="radio" name="FIN_LEVEL" value="D" class="w-4 h-4 accent-blue-600"> Level D: Has Company certificated, Not found data of Tax payment and/or "DO NOT USE" / </label>
                    </div>
                </div>
                <div>
                    <h3 class="font-bold underline text-sm mb-2">Quality Classification by warranty:</h3>
                    <div class="space-y-1 text-sm">
                        <label class="flex items-center gap-2"><input type="radio" name="QA_LEVEL" class="w-4 h-4 accent-blue-600"> Level A: No Claim</label>
                        <label class="flex items-center gap-2"><input type="radio" name="QA_LEVEL" class="w-4 h-4 accent-blue-600"> Level: B: Clearly Claim on time/ 1 week</label>
                        <label class="flex items-center gap-2"><input type="radio" name="QA_LEVEL" class="w-4 h-4 accent-blue-600"> Level: C (Clearly Claim 1-2 month)</label>
                        <label class="flex items-center gap-2"><input type="radio" name="QA_LEVEL" class="w-4 h-4 accent-blue-600"> Level: D [not warranty] "DO NOT USE"</label>
                    </div>
                </div>
            </div>
            <div class="space-y-6">
                <div>
                    <h3 class="font-bold underline text-sm mb-2">Advance verifying invoice's price by:</h3>
                    <div class="space-y-1 text-sm">
                        <label class="flex items-center gap-2"><input type="radio" name="VERIFYING" class="w-4 h-4 accent-blue-600" value="XML file"> XML file</label>
                        <label class="flex items-center gap-2"><input type="radio" name="VERIFYING" class="w-4 h-4 accent-blue-600" value="PDF file (convert/not scan)<"> PDF file (convert/not scan)</label>
                        <label class="flex items-center gap-2"><input type="radio" name="VERIFYING" class="w-4 h-4 accent-blue-600" value="Excel file">Excel file</label>
                        <label class="flex items-center gap-2"><input type="radio" name="VERIFYING" class="w-4 h-4 accent-blue-600" value="Text file (own pattern/form)"> Text file (own pattern/form)</label>
                        <label class="flex items-center gap-2"><input type="radio" name="VERIFYING" class="w-4 h-4 accent-blue-600" value="Not able advance any file before deliver to AMEC"> Not able advance any file before deliver to AMEC</label>
                    </div>
                </div>
                <div>
                <h3 class="font-bold text-sm underline mb-3">Environmental: ex.ISO14001 (ref.: PUR-QP-E003)</h3>
                <div class="space-y-2 text-sm">
                    <label class="flex items-center gap-2">
                        <input type="radio" name="ENV_LEVEL" class="w-4 h-4 accent-blue-600" value="A"> Level A: Has Environmental certificate
                    </label>
                    <label class="flex items-center gap-2">
                        <input type="radio" name="ENV_LEVEL" class="w-4 h-4 accent-blue-600" value="B"> Level B: Has own Environmental policy
                    </label>
                    <label class="flex items-center gap-2">
                        <input type="radio" name="ENV_LEVEL" class="w-4 h-4 accent-blue-600" value="C"> Level C: Has response & related material, refer to PUR-QP-E003
                    </label>
                    <label class="flex items-center gap-2">
                        <input type="radio" name="ENV_LEVEL" class="w-4 h-4 accent-blue-600" value="D"> Level D: Has not related material
                    </label>
                    <label class="flex items-center gap-2">
                        <input type="radio" name="ENV_LEVEL" class="w-4 h-4 accent-blue-600" value="D"> Level D: Related & Not response
                    </label>
                    
                </div>
            </div>
            </div>
        </div> -->

        <!-- <div class="mt-6">
    <h3 class="font-bold text-sm underline mb-3">E-SCM : (Enable) contact person and e-mail address</h3>
    
    <div id="contact-list" class="space-y-2"> -->
        <!-- แถวข้อมูลเริ่มต้น -->
        <!-- <div class="flex gap-4 contact-row">
            <input type="text" placeholder="Name" class="input input-sm border border-gray-400 h-8 rounded w-[450px] px-2">
            <input type="email" placeholder="E-mail" class="input input-sm border border-gray-400 h-8 rounded w-[450px]  px-2">
            <input type="text" placeholder="Username" class="input input-sm border border-gray-400 h-8 rounded w-[200px]  px-2">
        </div>
    </div> -->

    <!-- ปุ่มเพิ่มแถว -->
    <!-- <button type="button" id="add-contact" class="mt-3 text-sm text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
        + Add Contact Person
    </button> -->
</div>
<div class="border-t pt-4 mt-6">
            <label class="block font-bold text-sm mb-2 text-gray-800">Other comments</label>
            <textarea 
                class="w-full border border-gray-400 p-2 rounded text-sm focus:outline-none " 
                rows="4" 
                placeholder="Additional comments (if any)..."
            ></textarea>
</div>
</div>
</div>
<div id="pro" class="border border-gray-300 p-6 rounded-lg bg-white mt-6 hidden">
    <h2 class="font-bold text-lg mb-6  pb-2">Vendor Evaluation</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
<div>
    <label class="block font-bold text-sm text-gray-700 mb-2">Capital</label>
    <div class="flex gap-2">
        <input type="text" class="flex-1 input input-bordered input-sm w-full bg-gray-50 border-gray-300" placeholder="0.00">
        
        <select class="select select-bordered select-sm w-24 border-gray-400 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-700 text-sm">
            <option value="THB">THB</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="JPY">JPY</option>
        </select>
    </div>
</div>
        <div>
            <label class="block font-bold text-sm text-gray-700 mb-3">Type of Company</label>
            <div class="grid grid-cols-2 gap-3 text-sm">
                <label class="flex items-center gap-2">
                    <input type="radio" name="comtype" class="w-4 h-4 accent-blue-600"> Corporation
                </label>
                <label class="flex items-center gap-2">
                    <input type="radio" name="comtype" class="w-4 h-4 accent-blue-600"> Inc. OR Co.,Ltd.
                </label>
                <label class="flex items-center gap-2">
                    <input type="radio" name="comtype" class="w-4 h-4 accent-blue-600"> Limited Partnership
                </label>
                <label class="flex items-center gap-2">
                    <input type="radio" name="comtype" class="w-4 h-4 accent-blue-600"> Family Partnership
                </label>
            </div>
            <div class="flex items-center gap-2 mt-2 text-sm">
                <label class="flex items-center gap-2">
                    <input type="radio" name="comtype" class="w-4 h-4 accent-blue-600"> Other:
                </label>
                <input type="text" placeholder="Please specify..." class="flex-1 input input-sm border border-gray-400 h-8 rounded px-2">
            </div>
        </div>
    </div>

    <div class="mb-6">
        <div class="flex justify-between items-end mb-2">
            <label class="font-bold text-sm">Shareholder</label>
            <button type="button" data-table="shareholder-table"
                class="add-row-btn w-7 h-7 rounded border border-blue-500 text-blue-500 hover:bg-blue-50 flex items-center justify-center font-bold text-lg">
                +
            </button>
        </div>
        <table id="shareholder-table" class="w-full text-sm border-collapse border border-gray-400">
            <thead>
                <tr class="bg-gray-100">
                    <th class="border border-gray-400 p-2 text-left">Nationality</th>
                    <th class="border border-gray-400 p-2 w-1/4">%</th>
                    <th class="border border-gray-400 p-2 w-10 text-center">Action</th>
                </tr>
            </thead>
            <tbody>
                <tr class="row-template">
                    <td class="border border-gray-400 p-1"><input type="text"  name="sharename[]"  class="w-full px-1"></td>
                    <td class="border border-gray-400 p-1"><input type="text"  name="shareper[]" class="w-full px-1 text-center"></td>
                    <td class="border border-gray-400 p-1 text-center"></td>
                </tr>
            </tbody>
        </table>
    </div>
    <div class="flex flex-col gap-6 mb-6">
    
    <div>
        <label class="block font-bold text-sm text-gray-700 mb-3">Employee</label>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            
            <div class="flex items-center gap-2">
                <span class="flex-shrink-0 whitespace-nowrap">Direct:</span>
                <input type="text" class="flex-1 input input-bordered input-sm bg-gray-50 border-gray-300">
            </div>
            
            <div class="flex items-center gap-2">
                <span class="flex-shrink-0 whitespace-nowrap">Indirect:</span>
                <input type="text" class="flex-1 input input-bordered input-sm bg-gray-50 border-gray-300">
            </div>
            
            <div class="flex items-center gap-2">
                <span class="flex-shrink-0 whitespace-nowrap">Total:</span>
                <input type="text" class="flex-1 input input-bordered input-sm bg-gray-50 border-gray-300">
            </div>
            
            <div class="flex items-center gap-2">
                <span class="flex-shrink-0 whitespace-nowrap">Average Age:</span>
                <input type="text" class="flex-1 input input-bordered input-sm bg-gray-50 border-gray-300">
            </div>
            
        </div>
    </div>

    <div>
        <label class="block font-bold text-sm text-gray-700 mb-3">Area of Factory/Building</label>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
            
            <div class="flex items-center gap-2">
                <span class="flex-shrink-0 whitespace-nowrap">Land (M2):</span>
                <input type="text" class="flex-1 input input-bordered input-sm bg-gray-50 border-gray-300">
            </div>
            
            <div class="flex items-center gap-2">
                <span class="flex-shrink-0 whitespace-nowrap">Factory (M2):</span>
                <input type="text" class="flex-1 input input-bordered input-sm bg-gray-50 border-gray-300">
            </div>
            
        </div>
    </div>
    
</div>
    
<!-- <div class="grid grid-cols-2 gap-8 mb-6">
    <div class="flex flex-col gap-3">
        <label class="font-bold text-sm text-gray-700">Employee</label>
        
        <div class="flex items-center gap-2 text-xs">
            <span class="w-24 flex-shrink-0">Direct:</span>
            <input type="text" class="w-40 input input-bordered input-sm bg-gray-50 border-gray-300">
        </div>
        
        <div class="flex items-center gap-2 text-xs">
            <span class="w-24 flex-shrink-0">Indirect:</span>
            <input type="text" class="w-40 input input-bordered input-sm bg-gray-50 border-gray-300">
        </div>
        
        <div class="flex items-center gap-2 text-xs">
            <span class="w-24 flex-shrink-0">Total:</span>
            <input type="text" class="w-40 input input-bordered input-sm bg-gray-50 border-gray-300">
        </div>
        
        <div class="flex items-center gap-2 text-xs">
            <span class="w-24 flex-shrink-0">Average Age:</span>
            <input type="text" class="w-40 input input-bordered input-sm bg-gray-50 border-gray-300">
        </div>
    </div>

    <div class="flex flex-col gap-3">
        <label class="font-bold text-sm text-gray-700">Area of Factory/Building</label>
        
        <div class="flex items-center gap-2 text-xs">
            <span class="w-24 flex-shrink-0">Land (M2):</span>
            <input type="text" class="w-40 input input-bordered input-sm bg-gray-50 border-gray-300">
        </div>
        
        <div class="flex items-center gap-2 text-xs">
            <span class="w-24 flex-shrink-0">Factory (M2):</span>
            <input type="text" class="w-40 input input-bordered input-sm bg-gray-50 border-gray-300">
        </div>
    </div>
</div> -->
    <!-- <div class="grid grid-cols-2 gap-6 mb-6">
        <div class="space-y-2">
            <label class="font-bold text-sm">Employee</label>
            <div class="grid grid-cols-2 gap-2 text-xs">
                <span>Direct:</span> <input type="text" class="input input-bordered input-sm w-full bg-gray-50 border-gray-300">
                <span>Indirect:</span> <input type="text" class="input input-bordered input-sm w-full bg-gray-50 border-gray-300">
                <span>Total:</span> <input type="text" class="input input-bordered input-sm w-full bg-gray-50 border-gray-300">
                <span>Average Age:</span> <input type="text" class="input input-bordered input-sm w-full bg-gray-50 border-gray-300">
            </div>
        </div>
        <div class="space-y-2">
            <label class="font-bold text-sm">Area of Factory/Building</label>
            <div class="grid grid-cols-2 gap-2 text-xs">
                <span>Land (M2):</span> <input type="text" class="input input-bordered input-sm w-full bg-gray-50 border-gray-300">
                <span>Factory (M2):</span> <input type="text" class="input input-bordered input-sm w-full bg-gray-50 border-gray-300">
            </div>
        </div>
    </div> -->

    <!-- <div class="mb-6">
        <label class="font-bold text-sm block mb-2">Turn Over [THB]</label>
        <div class="grid grid-cols-3 gap-4">
            <div><label class="text-xs">2 Years ago:</label><input type="text" class="border border-gray-400 h-8 w-full px-1"></div>
            <div><label class="text-xs">Last year:</label><input type="text" class="border border-gray-400 h-8 w-full px-1"></div>
            <div><label class="text-xs">This year:</label><input type="text" class="border border-gray-400 h-8 w-full px-1"></div>
        </div>
    </div> -->

    <div class="rounded-lg mb-6 mt-4"> 
    <label class="font-bold text-sm block mb-1">Last 3 Years Turnover</label>
    <table class="w-full text-center border-collapse">
        <thead>
            <tr class="bg-gray-100">
                <th class="border border-gray-400 p-2 w-1/3 text-sm">
                    <span class="text-xs text-gray-500">Year</span>
                </th>
                <th class="border border-gray-400 p-2 w-2/3 text-sm">
                   <span class="text-xs text-gray-500">Turn Over</span>
                </th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="border border-gray-400 p-2">
                    <input type="text" class="w-full border-none bg-transparent text-center focus:outline-none" placeholder="Year (e.g., 2026)">
                </td>
                <td class="border border-gray-400 p-2">
                    <input type="text" class="w-full border-none bg-transparent text-center focus:outline-none" placeholder="0.00">
                </td>
            </tr>
            <tr>
                <td class="border border-gray-400 p-2">
                    <input type="text" class="w-full border-none bg-transparent text-center focus:outline-none" placeholder="Year">
                </td>
                <td class="border border-gray-400 p-2">
                    <input type="text" class="w-full border-none bg-transparent text-center focus:outline-none" placeholder="0.00">
                </td>
            </tr>
            <tr>
                <td class="border border-gray-400 p-2">
                    <input type="text" class="w-full border-none bg-transparent text-center focus:outline-none" placeholder="ํํYear">
                </td>
                <td class="border border-gray-400 p-2">
                    <input type="text" class="w-full border-none bg-transparent text-center focus:outline-none" placeholder="0.00">
                </td>
            </tr>
        </tbody>
    </table>
</div>




    <div class="mb-6">
        <label class="font-bold text-sm block mb-2">Management</label>
        <div class="space-y-3 text-sm">
            <div class="flex flex-col gap-1">
                <div class="flex justify-between items-center">
                    <span>Quality Management (ISO9001):</span>
                    <div class="flex gap-3"><label><input type="radio" name="qm" value="Y"> Yes</label><label><input type="radio" name="qm" value="N"> No</label></div>
                </div>
                <input type="text" placeholder="Certificate No. / Details" class="input input-bordered input-sm w-full bg-gray-50 border-gray-300">
            </div>
            <div class="flex flex-col gap-1">
                <div class="flex justify-between items-center">
                    <span>CSR Management:</span>
                    <div class="flex gap-3"><label><input type="radio" name="csr" value="Y"> Yes</label><label><input type="radio" name="csr" value="N"> No</label></div>
                </div>
                <input type="text" placeholder="Specify project name or details..." class="input input-bordered input-sm w-full bg-gray-50 border-gray-300">
            </div>
            <div class="flex flex-col gap-1">
                <div class="flex justify-between items-center">
                    <span>Environmental (ISO14001):</span>
                    <div class="flex gap-3"><label><input type="radio" name="env" value="Y"> Yes</label><label><input type="radio" name="env" value="N"> No</label></div>
                </div>
                <input type="text" placeholder="Certificate No. / Details" class="input input-bordered input-sm w-full bg-gray-50 border-gray-300">
            </div>
        </div>
    </div>

<div class="pt-4">
    <label class="font-bold text-sm block mb-2">Labour Union:</label>
    <div class="flex flex-wrap items-center gap-6 text-sm">
        
        <div class="flex items-center gap-2">
            <label class="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                <input type="radio" name="union" value="Y" class="w-4 h-4 accent-blue-600"> Have established
            </label>
            
            <input type="text" placeholder="Specify established date..." 
                   class="input input-bordered input-sm w-48 bg-gray-50 border-gray-300">
        </div>
        
        <label class="flex items-center gap-2 cursor-pointer whitespace-nowrap">
            <input type="radio" name="union" value="N" class="w-4 h-4 accent-blue-600"> Do not have
        </label>
        
    </div>
</div>
    <div class="space-y-6 pt-6">
    <div>
        <div class="flex justify-between items-end mb-2">
            <label class="font-bold text-sm">Main Customer</label>
            <button type="button" data-table="customer-table"  class="add-row-btn w-7 h-7 rounded border border-blue-500 text-blue-500 hover:bg-blue-50 flex items-center justify-center font-bold text-lg">+</button>
        </div>
        <table id="customer-table" class="w-full text-sm border-collapse border border-gray-400">
            <tr class="bg-gray-100"><th class="border border-gray-400 p-2 text-left">Name</th><th class="border border-gray-400 p-2 w-1/4">%</th><th class="border border-gray-400 p-2 w-10"></th></tr>
            <tr class="row-template"><td class="border border-gray-400 p-1"><input name="cusname[]" type="text" class="w-full px-1"></td><td class="border border-gray-400 p-1"><input type="text" name="cusper[]" class="w-full px-1 text-center"></td><td class="border border-gray-400 p-1"></td></tr>
        </table>
    </div>

    <div>
        <div class="flex justify-between items-end mb-2">
            <label class="font-bold text-sm">Supplier of Main Material</label>
            <button type="button" data-table="supplier-table"   class="add-row-btn w-7 h-7 rounded border border-blue-500 text-blue-500 hover:bg-blue-50 flex items-center justify-center font-bold text-lg">+</button>
        </div>
        <table id="supplier-table" class="w-full text-sm border-collapse border border-gray-400">
            <tr class="bg-gray-100"><th class="border border-gray-400 p-2 text-left">Name</th><th class="border border-gray-400 p-2 w-1/4">%</th><th class="border border-gray-400 p-2 w-10"></th></tr>
            <tr class="row-template"><td class="border border-gray-400 p-1"><input name = "supname[]" type="text" class="w-full px-1"></td><td class="border border-gray-400 p-1"><input type="text" name="supper[]" class="w-full px-1 text-center"></td><td class="border border-gray-400 p-1"></td></tr>
        </table>
    </div>

    <div>
        <div class="flex justify-between items-end mb-2">
            <label class="font-bold text-sm">Main Product</label>
            <button type="button"  data-table="product-table"  class="add-row-btn w-7 h-7 rounded border border-blue-500 text-blue-500 hover:bg-blue-50 flex items-center justify-center font-bold text-lg">+</button>
        </div>
        <table id="product-table" class="w-full text-sm border-collapse border border-gray-400">
            <tr class="bg-gray-100"><th class="border border-gray-400 p-2 text-left">Name</th><th class="border border-gray-400 p-2 w-1/4">%</th><th class="border border-gray-400 p-2 w-10"></th></tr>
            <tr class="row-template"><td class="border border-gray-400 p-1"><input type="text" name="proname[]" class="w-full px-1"></td><td class="border border-gray-400 p-1"><input name="proper[]" type="text" class="w-full px-1 text-center"></td><td class="border border-gray-400 p-1"></td></tr>
        </table>
    </div>
<!-- <div class="mb-8 mt-6">
    <h2 class="font-bold text-lg mb-4 text-gray-800  pb-2">Evaluation (Purchasing Matters)</h2>
    <div class="overflow-x-auto">
        <table id="eval-table" class="w-full text-sm border-collapse border border-gray-400">
            <thead>
                <tr class="bg-gray-100">
                    <th class="border border-gray-400 p-2 text-left" rowspan="2">Evaluation Item</th>
                    <th class="border border-gray-400 p-2 text-left" rowspan="2">Check Point</th>
                    <th class="border border-gray-400 p-2 text-center" colspan="5">Score</th>
                </tr>
                <tr class="bg-gray-50 text-xs text-center">
                    <th class="border border-gray-400 p-1">25</th>
                    <th class="border border-gray-400 p-1">20</th>
                    <th class="border border-gray-400 p-1">15</th>
                    <th class="border border-gray-400 p-1">10</th>
                    <th class="border border-gray-400 p-1">5</th>
                </tr>
            </thead>
            <tbody>
            
                <tr>
                    <td class="border border-gray-400 p-2 font-semibold">PRICE LEVEL</td>
                    <td class="border border-gray-400 p-2">Comparison with market price or competitor</td>
                    <td class="border border-gray-400 p-2 text-center"><label><input type="radio" name="price" value="25" class="block mx-auto mb-1"><span class="text-[10px]">VERY COMPETITIVE</span></label></td>
                    <td class="border border-gray-400 p-2 text-center"><label><input type="radio" name="price" value="20" class="block mx-auto mb-1"><span class="text-[10px]">COMPETITIVE</span></label></td>
                    <td class="border border-gray-400 p-2 text-center"><label><input type="radio" name="price" value="15" class="block mx-auto mb-1"><span class="text-[10px]">SAME LEVEL</span></label></td>
                    <td class="border border-gray-400 p-2 text-center"><label><input type="radio" name="price" value="10" class="block mx-auto mb-1"><span class="text-[10px]">SLITELY EXPENSIVE</span></label></td>
                    <td class="border border-gray-400 p-2 text-center"><label><input type="radio" name="price" value="5" class="block mx-auto mb-1"><span class="text-[10px]">EXPENSIVE</span></label></td>
                </tr>
             
                <tr>
                    <td class="border border-gray-400 p-2 font-semibold">ORDER MANAGEMENT</td>
                    <td class="border border-gray-400 p-2">Control system from P/O to delivery</td>
                    <td class="border border-gray-400 p-2 text-center"><label><input type="radio" name="order" value="25" class="block mx-auto mb-1"><span class="text-[10px]">SYSTEMATIC CONTROL</span></label></td>
                    <td class="border border-gray-400 p-2 text-center"><label><input type="radio" name="order" value="20" class="block mx-auto mb-1"><span class="text-[10px]">SEMI SYSTEMATIC</span></label></td>
                    <td class="border border-gray-400 p-2 text-center"><label><input type="radio" name="order" value="15" class="block mx-auto mb-1"><span class="text-[10px]">EXCEL CONTROL</span></label></td>
                    <td class="border border-gray-400 p-2 text-center"><label><input type="radio" name="order" value="10" class="block mx-auto mb-1"><span class="text-[10px]">MANUAL BOOK</span></label></td>
                    <td class="border border-gray-400 p-2 text-center"><label><input type="radio" name="order" value="5" class="block mx-auto mb-1"><span class="text-[10px]">NOT CONTROL</span></label></td>
                </tr>
 
                <tr>
                    <td class="border border-gray-400 p-2 font-semibold">CUSTOMER SERVICE</td>
                    <td class="border border-gray-400 p-2">Responsiveness for delivery/price</td>
                    <td class="border border-gray-400 p-2 text-center"><label><input type="radio" name="service" value="25" class="block mx-auto mb-1"><span class="text-[10px]">VERY GOOD<br>(1 day)</span></label></td>
                    <td class="border border-gray-400 p-2 text-center"><label><input type="radio" name="service" value="20" class="block mx-auto mb-1"><span class="text-[10px]">GOOD<br>(3 days)</span></label></td>
                    <td class="border border-gray-400 p-2 text-center"><label><input type="radio" name="service" value="15" class="block mx-auto mb-1"><span class="text-[10px]">FAIR<br>(1 week)</span></label></td>
                    <td class="border border-gray-400 p-2 text-center"><label><input type="radio" name="service" value="10" class="block mx-auto mb-1"><span class="text-[10px]">BAD<br>(2 weeks)</span></label></td>
                    <td class="border border-gray-400 p-2 text-center"><label><input type="radio" name="service" value="5" class="block mx-auto mb-1"><span class="text-[10px]">VERY BAD<br>(>2 weeks)</span></label></td>
                </tr>
        
                <tr>
                    <td class="border border-gray-400 p-2 font-semibold">STANDARD DELIVERY</td>
                    <td class="border border-gray-400 p-2">Delivery term vs Competitor</td>
                    <td class="border border-gray-400 p-2 text-center"><label><input type="radio" name="delivery" value="25" class="block mx-auto mb-1"><span class="text-[10px]">VERY SHORT</span></label></td>
                    <td class="border border-gray-400 p-2 text-center"><label><input type="radio" name="delivery" value="20" class="block mx-auto mb-1"><span class="text-[10px]">SHORT</span></label></td>
                    <td class="border border-gray-400 p-2 text-center"><label><input type="radio" name="delivery" value="15" class="block mx-auto mb-1"><span class="text-[10px]">SAME</span></label></td>
                    <td class="border border-gray-400 p-2 text-center"><label><input type="radio" name="delivery" value="10" class="block mx-auto mb-1"><span class="text-[10px]">LONGER</span></label></td>
                    <td class="border border-gray-400 p-2 text-center"><label><input type="radio" name="delivery" value="5" class="block mx-auto mb-1"><span class="text-[10px]">VERY LONGER</span></label></td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="mt-4 p-4 bg-gray-50 border rounded-lg flex items-center gap-6">
        <label class="font-bold text-sm">TOTAL SCORE: <span id="total-score" class="text-blue-600 text-lg">0</span></label>
        <label class="font-bold text-sm">JUDGEMENT: <span id="judgement-result" class="text-red-600 uppercase italic">-</span></label>
    </div>
</div> -->
<div class="mb-8 mt-6 border-2 border-dashed border-gray-400 rounded-lg p-6 bg-blue-50">
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
                    <th class="border border-gray-400 p-1">25</th>
                    <th class="border border-gray-400 p-1">20</th>
                    <th class="border border-gray-400 p-1">15</th>
                    <th class="border border-gray-400 p-1">10</th>
                    <th class="border border-gray-400 p-1">5</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="border border-gray-400 p-2 font-semibold">PRICE LEVEL</td>
                    <td class="border border-gray-400 p-2">Comparison with market price or competitor</td>
                    <td class="border border-gray-400 p-2 text-center"><label class="cursor-pointer block"><input type="radio" name="price" value="25" class="block mx-auto mb-1 score-radio"><span class="text-[10px]">VERY COMPETITIVE</span></label></td>
                    <td class="border border-gray-400 p-2 text-center"><label class="cursor-pointer block"><input type="radio" name="price" value="20" class="block mx-auto mb-1 score-radio"><span class="text-[10px]">COMPETITIVE</span></label></td>
                    <td class="border border-gray-400 p-2 text-center"><label class="cursor-pointer block"><input type="radio" name="price" value="15" class="block mx-auto mb-1 score-radio"><span class="text-[10px]">SAME LEVEL</span></label></td>
                    <td class="border border-gray-400 p-2 text-center"><label class="cursor-pointer block"><input type="radio" name="price" value="10" class="block mx-auto mb-1 score-radio"><span class="text-[10px]">SLITELY EXPENSIVE</span></label></td>
                    <td class="border border-gray-400 p-2 text-center"><label class="cursor-pointer block"><input type="radio" name="price" value="5" class="block mx-auto mb-1 score-radio"><span class="text-[10px]">EXPENSIVE</span></label></td>
                </tr>
                <tr>
                    <td class="border border-gray-400 p-2 font-semibold">ORDER MANAGEMENT</td>
                    <td class="border border-gray-400 p-2">Control system from P/O to delivery</td>
                    <td class="border border-gray-400 p-2 text-center"><label class="cursor-pointer block"><input type="radio" name="order" value="25" class="block mx-auto mb-1 score-radio"><span class="text-[10px]">SYSTEMATIC CONTROL</span></label></td>
                    <td class="border border-gray-400 p-2 text-center"><label class="cursor-pointer block"><input type="radio" name="order" value="20" class="block mx-auto mb-1 score-radio"><span class="text-[10px]">SEMI SYSTEMATIC</span></label></td>
                    <td class="border border-gray-400 p-2 text-center"><label class="cursor-pointer block"><input type="radio" name="order" value="15" class="block mx-auto mb-1 score-radio"><span class="text-[10px]">EXCEL CONTROL</span></label></td>
                    <td class="border border-gray-400 p-2 text-center"><label class="cursor-pointer block"><input type="radio" name="order" value="10" class="block mx-auto mb-1 score-radio"><span class="text-[10px]">MANUAL BOOK</span></label></td>
                    <td class="border border-gray-400 p-2 text-center"><label class="cursor-pointer block"><input type="radio" name="order" value="5" class="block mx-auto mb-1 score-radio"><span class="text-[10px]">NOT CONTROL</span></label></td>
                </tr>
                <tr>
                    <td class="border border-gray-400 p-2 font-semibold">CUSTOMER SERVICE</td>
                    <td class="border border-gray-400 p-2">Responsiveness for delivery/price</td>
                    <td class="border border-gray-400 p-2 text-center"><label class="cursor-pointer block"><input type="radio" name="service" value="25" class="block mx-auto mb-1 score-radio"><span class="text-[10px]">VERY GOOD<br>(1 day)</span></label></td>
                    <td class="border border-gray-400 p-2 text-center"><label class="cursor-pointer block"><input type="radio" name="service" value="20" class="block mx-auto mb-1 score-radio"><span class="text-[10px]">GOOD<br>(3 days)</span></label></td>
                    <td class="border border-gray-400 p-2 text-center"><label class="cursor-pointer block"><input type="radio" name="service" value="15" class="block mx-auto mb-1 score-radio"><span class="text-[10px]">FAIR<br>(1 week)</span></label></td>
                    <td class="border border-gray-400 p-2 text-center"><label class="cursor-pointer block"><input type="radio" name="service" value="10" class="block mx-auto mb-1 score-radio"><span class="text-[10px]">BAD<br>(2 weeks)</span></label></td>
                    <td class="border border-gray-400 p-2 text-center"><label class="cursor-pointer block"><input type="radio" name="service" value="5" class="block mx-auto mb-1 score-radio"><span class="text-[10px]">VERY BAD<br>(>2 weeks)</span></label></td>
                </tr>
                <tr>
                    <td class="border border-gray-400 p-2 font-semibold">STANDARD DELIVERY</td>
                    <td class="border border-gray-400 p-2">Delivery term vs Competitor</td>
                    <td class="border border-gray-400 p-2 text-center"><label class="cursor-pointer block"><input type="radio" name="delivery" value="25" class="block mx-auto mb-1 score-radio"><span class="text-[10px]">VERY SHORT</span></label></td>
                    <td class="border border-gray-400 p-2 text-center"><label class="cursor-pointer block"><input type="radio" name="delivery" value="20" class="block mx-auto mb-1 score-radio"><span class="text-[10px]">SHORT</span></label></td>
                    <td class="border border-gray-400 p-2 text-center"><label class="cursor-pointer block"><input type="radio" name="delivery" value="15" class="block mx-auto mb-1 score-radio"><span class="text-[10px]">SAME</span></label></td>
                    <td class="border border-gray-400 p-2 text-center"><label class="cursor-pointer block"><input type="radio" name="delivery" value="10" class="block mx-auto mb-1 score-radio"><span class="text-[10px]">LONGER</span></label></td>
                    <td class="border border-gray-400 p-2 text-center"><label class="cursor-pointer block"><input type="radio" name="delivery" value="5" class="block mx-auto mb-1 score-radio"><span class="text-[10px]">VERY LONGER</span></label></td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-lg flex flex-col sm:flex-row items-center gap-6">
        <label class="font-bold text-sm">TOTAL SCORE: <span id="total-score" class="text-blue-600 text-xl ml-2">0</span></label>
        <div class="h-6 w-px bg-gray-400 hidden sm:block"></div>
        <label class="font-bold text-sm">JUDGEMENT: <span id="judgement-result" class="text-red-600 uppercase italic ml-2">-</span></label>
    </div>
</div>

</div>
</div>


</div>
</form>

<dialog id="searchModal" 
        class="fixed inset-y-0 right-0 w-full max-w-xl h-full max-h-screen rounded-none rounded-l-2xl shadow-2xl p-0 "
        style="margin: 0 0 0 auto;">
    <!-- Header -->
    <div class="modal-header-gradient flex justify-between items-center">
        <h3 class="font-semibold text-lg tracking-wide">Search PUR-NVF Form</h3>
        <button id="btnCloseModal" class="text-slate-300 hover:text-white transition-colors text-2xl font-light">✕</button>
    </div>
    
    <!-- Body -->
    <div class="p-8 space-y-6">
        <!-- ช่องค้นหาที่ดูสะอาดตา -->
        <div class="relative">
            <span class="absolute left-3 top-2.5 text-gray-400">🔍</span>
            <input type="text" id="modalSearch" 
                   class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50/50 focus:border-blue-500 outline-none transition-all text-gray-700" 
                   placeholder="Enter Form Number or Vendor Name...">
        </div>
     <div id="tableContainer">
        </div>
    </div>
</dialog>

@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/purEva.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection