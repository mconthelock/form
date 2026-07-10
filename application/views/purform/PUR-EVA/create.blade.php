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

<div class="space-y-6">
    <form id="frmmain">
    <!-- Top Section -->
    <div class="border border-gray-300 p-6 rounded-lg bg-white space-y-4">
        <div class="grid grid-cols-[120px_1fr] items-center gap-2">
            <label class="font-semibold text-sm">Input By:</label>
            <input type="text" maxlength="5" class="input input-sm border border-gray-400 h-8 rounded w-48 px-2">
        </div>
        <div class="grid grid-cols-[120px_1fr] items-center gap-2">
            <label class="font-semibold text-sm">Request By:</label>
            <input type="text" maxlength="5" class="input input-sm border border-gray-400 h-8 rounded w-48 px-2">
        </div>
    </div>

    <!-- Operation Section -->
    <div class="border border-gray-300 p-6 rounded-lg bg-white">
        <!-- ใช้ grid เหมือนกับด้านบน เพื่อให้ระยะขอบซ้ายตรงกันเป๊ะ -->
        <div class="grid grid-cols-[120px_1fr] items-center gap-2">
            <span class="font-semibold text-sm">Operation:</span>
                <div class="flex items-center gap-6">
                <label class="flex items-center gap-2 cursor-pointer text-gray-700 text-sm">
                    <input type="radio" name="vendor_type" value="new" class="w-4 h-4 accent-blue-600"> New vendor
                </label>
                
                <label class="flex items-center gap-2 cursor-pointer text-gray-700 text-sm">
                    <input type="radio" name="vendor_type" value="annual" class="w-4 h-4 accent-blue-600"> Annual evaluation for
                </label>
                
                <input type="text" maxlength="5" placeholder="Vendor Code" class="input input-sm border border-gray-400 h-8 rounded w-48 px-2">
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
        <div class="grid grid-cols-[120px_1fr] gap-4 items-start">
            <span class="font-semibold text-sm pt-1">Vendor Type</span>
            
            <div class="grid grid-cols-3 gap-y-2 gap-x-4 text-sm">
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="vendor_typec" value="1:Oversea (Relate MELCO Group)" class="w-4 h-4 accent-blue-600 radio-typec"> Oversea (Relate MELCO Group)
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="vendor_typec" value="2:Oversea (Not relate MELCO Group)" class="w-4 h-4 accent-blue-600 radio-typec"> Oversea (Not relate MELCO Group)
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="vendor_typec" value="3:Domestic (Use BOI)" class="w-4 h-4 accent-blue-600 radio-typec"> Domestic (Use BOI)
                </label>
                
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="vendor_typec" value="4:Domestic (Use IPO)" class="w-4 h-4 accent-blue-600 radio-typec"> Domestic (Use IPO)
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="vendor_typec" value="7:Domestic (Use FTA)" class="w-4 h-4 accent-blue-600 radio-typec"> Domestic (Use FTA)
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="vendor_typec" value="5:Domestic Vendor" class="w-4 h-4 accent-blue-600 radio-typec"> Domestic Vendor
                </label>
                
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="vendor_typec" value="8:Sub-Contractor" class="w-4 h-4 accent-blue-600 radio-typec"> Sub-Contractor
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="vendor_typec" value="6:Non-Production" class="w-4 h-4 accent-blue-600 radio-typec"> Non-Production
                </label>
             
            </div>
        </div>
            
            <div class="grid grid-cols-[120px_1fr] items-center gap-4">
                <span class="font-semibold text-sm">Vendor Name</span>
                <div class="flex items-center gap-4">
                    <input type="text" name="COMNAME" class="input input-sm border border-gray-400 h-8 rounded w-1/3 px-2">
                    <label class="flex items-center gap-2 text-sm"><input type="radio" name="vendor_type" value="Local" class="w-4 h-4 accent-blue-600  radio-type"> Local</label>
                    <label class="flex items-center gap-2 text-sm"><input type="radio" name="vendor_type" value="Oversea" class="w-4 h-4 accent-blue-600  radio-type"> Oversea</label>
                    <select class="border border-gray-400 h-8 p-1 rounded text-sm">
                        <option>Select Country</option>
                    </select>
                </div>
            </div>

           <!-- Address (EN) Section -->
<div class="grid grid-cols-[120px_1fr] gap-4 pt-4 border-t border-gray-200">
    <label class="font-semibold text-sm pt-2">Address (EN) <span class="text-red-500">**</span></label>
    <div class="space-y-4">
        <!-- Address Line 1 -->
        <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1">No., Village, Building, Alley, Road</label>
            <input type="text" placeholder="e.g. 43/86 Moo 16, Bangna Road..." class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full">
        </div>
        <!-- Grid for Province/District -->
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Province</label>
                <input type="text" placeholder="Province" class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full">
            </div>
            <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">District</label>
                <input type="text" placeholder="District" class="input input-sm border border-gray-400 h-8 rounded px-2 w-full">
            </div>
        </div>
        <!-- Grid for Sub-district/Postcode -->
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Sub-district</label>
                <input type="text" placeholder="Sub-district" class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full">
            </div>
            <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Postcode</label>
                <input type="text" placeholder="Postcode" class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full">
            </div>
        </div>
        <!-- Country -->
        <div class="grid grid-cols-2 gap-4">
                <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Country</label>
                <input type="text" placeholder="Country" class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full">
            </div>
        </div>
    </div>
</div>

<!-- Address (TH) Section -->
<div class="grid grid-cols-[120px_1fr] gap-4 pt-4 border-t border-gray-200">
    <label class="font-semibold text-sm pt-2">Address (TH)</label>
    <div class="space-y-4">
        <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1">บ้านเลขที่, หมู่บ้าน, อาคาร, ซอย, ถนน</label>
            <input type="text" placeholder="เช่น 43/86 หมู่ 16 ซอยบางนา..." class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full">
        </div>
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">จังหวัด</label>
                <input type="text" placeholder="จังหวัด" class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full">
            </div>
            <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">อำเภอ / เขต</label>
                <input type="text" placeholder="อำเภอ / เขต" class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full">
            </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">ตำบล / แขวง</label>
                <input type="text" placeholder="ตำบล / แขวง" class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full">
            </div>
            <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">รหัสไปรษณีย์</label>
                <input type="text" placeholder="รหัสไปรษณีย์" class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full">
            </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">ประเทศ</label>
                <input type="text" placeholder="ประเทศ" class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full">
            </div>
        </div>
    </div>
</div>
            <!-- Contact Information -->
            <div class="pt-4 border-t border-gray-200 space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div class="grid grid-cols-[120px_1fr] items-center gap-4">
                        <label class="font-semibold text-sm">Contact name</label>
                       <input type="text" class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="grid grid-cols-[120px_1fr] items-center gap-4">
                        <label class="font-semibold text-sm">Email</label>
                        <input type="text" class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full">
                    </div>
                    <div class="grid grid-cols-[120px_1fr] items-center gap-4">
                        <label class="font-semibold text-sm">Web site</label>
                        <input type="text" class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full">
                    </div>
                    <div class="grid grid-cols-[120px_1fr] items-center gap-4">
                        <label class="font-semibold text-sm">Tel.no</label>
                        <input type="text" class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full">
                    </div>
                    <div class="grid grid-cols-[120px_1fr] items-center gap-4">
                        <label class="font-semibold text-sm">Fax.no</label>
                        <input type="text" class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full">
                    </div>
                </div>
            </div>
            <!-- ส่วนคั่นจาก Contact name -->
<div class="border-t border-gray-300 pt-6 mt-6">
    <!-- Bank & Branch -->
    <div class="grid grid-cols-2 gap-4 mb-4">
        <div class="grid grid-cols-[120px_1fr] items-center gap-4">
            <label class="font-semibold text-sm">Bank name</label>
            <input type="text" class="input input-sm border border-gray-400 h-8 rounded px-2 w-full">
        </div>
        <div class="grid grid-cols-[120px_1fr] items-center gap-4">
            <label class="font-semibold text-sm">Branch name</label>
            <input type="text" class="input input-sm border border-gray-400 h-8 rounded px-2 w-full">
        </div>
    </div>

    <!-- Additional Banking & Payment Fields -->
    <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
        <div class="grid grid-cols-[120px_1fr] items-center gap-4">
            <label class="font-semibold text-sm">Account number</label>
            <input type="text" class="input input-sm border border-gray-400 h-8 rounded px-2 w-full">
        </div>
        </div>
        <div class="grid grid-cols-[120px_1fr] items-start gap-4">
            <label class="font-semibold text-sm pt-1">Bank Address</label>
            <textarea class="textarea textarea-sm border border-gray-400 rounded px-2 w-full text-sm py-1" rows="2"></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div class="grid grid-cols-[120px_1fr] items-center gap-4">
                <label class="font-semibold text-sm">Payment Term</label>
                <select class="input input-sm border border-gray-400 h-8 rounded px-2 w-full">
                    <option>Select Term</option>
                </select>
            </div>
            <div class="grid grid-cols-[120px_1fr] items-center gap-4">
                <label class="font-semibold text-sm">Std Current</label>
                 <select class="input input-sm border border-gray-400 h-8 rounded px-2 w-full">
                    <option>Select Current</option>
                </select>
            </div>
        </div>

<!-- คอลัมน์หลักสำหรับ Label และ Checkbox -->
<div class="grid grid-cols-[120px_1fr] items-start gap-4">
    <span class="font-semibold text-sm required pt-2">Attach files</span>
    
    <fieldset class="flex flex-col gap-2">
        <label class="attach-file text-sm flex items-center gap-2" id="attach-po">
            <input type="checkbox" name="ATTACH_TYPE" value="P/O Confirmation" class="checkbox checkbox-xs" a-type="po">
            Company Certificate / Company Profile
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
    <div class="border-2 border-dashed border-gray-400 p-4 rounded-lg mb-6 bg-gray-50 field-oversea">
        <h3 class="font-bold mb-3">Compliance</h3>
        <div class="grid grid-cols-1 gap-2 text-black text-sm">
            <label class="flex items-center gap-2"><input type="checkbox" value="ไม่ได้อยู่ในกลุ่มควบคุม ข้อกำหนด AMEC-5070: Rule for Export Control"> ไม่ได้อยู่ในกลุ่มควบคุม ข้อกำหนด AMEC-5070: Rule for Export Control</label>
            <label class="flex items-center gap-2"><input type="checkbox" value="ไม่อยู่ในรายชื่อที่ถูกลงโทษจาก UNSC"> ไม่อยู่ในรายชื่อที่ถูกลงโทษจาก UNSC</label>
            <label class="flex items-center gap-2"><input type="checkbox" value="ไม่อยู่ในประเทศ ประเทศไทยคว่ำบาตร ตามมาตรการคว่ำบาตร โดยสหประชาชาติ WWW.dff-go.th"> ไม่อยู่ในประเทศ ประเทศไทยคว่ำบาตร ตามมาตรการคว่ำบาตร โดยสหประชาชาติ WWW.dff-go.th</label>
            <label class="flex items-center gap-2"><input type="checkbox" value="AMEC's standard Terms of 'CIF'"> AMEC's standard Terms of "CIF"</label>
            <div class="flex items-center gap-2">
                <label class="flex items-center gap-2 flex-shrink-0"><input type="checkbox" value="อื่นๆ ระบุ"> อื่นๆ ระบุ</label>
                <input type="text" class="input input-sm border border-gray-400 h-8 rounded w-1/2 px-2">
                <span class="text-red-600 text-sm font-semibold whitespace-nowrap">ข้อกำหนด AMEC-6000: Rule for Purchase</span>
            </div>
            <label class="flex items-center gap-2"><input type="checkbox"> ได้รับ Financial Record</label>
        </div>
    </div>

            <!-- 1. รายการสินค้าและบริการ -->
    <div>
<label class="font-bold text-sm block mb-2 field-local">รายการสินค้าและบริการที่ยื่นจดทะเบียนเครื่องหมายการค้าในประเทศไทย</label>
<!-- ปรับตรงนี้เป็น grid-cols-3 -->
<div class="grid grid-cols-3 gap-x-4 gap-y-1 text-sm field-local">
    <label class="flex items-center gap-2"><input type="radio" name="product_category" class="w-4 h-4 accent-blue-600"> เครื่องสำอาง ยา ผลิตภัณฑ์เคมี</label>
    <label class="flex items-center gap-2"><input type="radio" name="product_category" class="w-4 h-4 accent-blue-600"> โลหะ เครื่องมืออุปกรณ์ วัสดุก่อสร้าง</label>
    <label class="flex items-center gap-2"><input type="radio" name="product_category" class="w-4 h-4 accent-blue-600"> เครื่องจักรกล เครื่องมือ เครื่องใช้ไฟฟ้า</label>
    
    <label class="flex items-center gap-2"><input type="radio" name="product_category" class="w-4 h-4 accent-blue-600"> โลหะมีค่า นาฬิกา เครื่องหนัง</label>
    <label class="flex items-center gap-2"><input type="radio" name="product_category" class="w-4 h-4 accent-blue-600"> เครื่องดนตรี ของเล่น อุปกรณ์กีฬา</label>
    <label class="flex items-center gap-2"><input type="radio" name="product_category" class="w-4 h-4 accent-blue-600"> กระดาษ เครื่องเขียน เครื่องพิมพ์</label>
    
    <label class="flex items-center gap-2"><input type="radio" name="product_category" class="w-4 h-4 accent-blue-600"> ยาง พลาสติก</label>
    <label class="flex items-center gap-2"><input type="radio" name="product_category" class="w-4 h-4 accent-blue-600"> เฟอร์นิเจอร์ เครื่องใช้ในครัวเรือน</label>
    <label class="flex items-center gap-2"><input type="radio" name="product_category" class="w-4 h-4 accent-blue-600"> เส้นใย เส้นด้าย สิ่งทอ เครื่องนุ่งห่ม</label>
    
    <label class="flex items-center gap-2"><input type="radio" name="product_category" class="w-4 h-4 accent-blue-600"> อาหาร เครื่องดื่ม ของหวาน</label>
    <label class="flex items-center gap-2"><input type="radio" name="product_category" class="w-4 h-4 accent-blue-600"> เครื่องหมายบริการ</label>
    <label class="flex items-center gap-2"><input type="radio" name="product_category" class="w-4 h-4 accent-blue-600"> เครื่องหมายรับรอง</label>
    
    <label class="flex items-center gap-2"><input type="radio" name="product_category" class="w-4 h-4 accent-blue-600"> เครื่องหมายร่วม</label>
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
                    ปี<br><span class="text-xs text-gray-500">Year</span>
                </th>
                <th class="border border-gray-400 p-2 w-2/3 text-sm">
                    กำไรขาดทุนสุทธิ<br><span class="text-xs text-gray-500">Net Profit/Loss</span>
                </th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="border border-gray-400 p-2">
                    <input type="text" class="w-full border-none bg-transparent text-center focus:outline-none" placeholder="ระบุปี (เช่น 2026)">
                </td>
                <td class="border border-gray-400 p-2">
                    <input type="text" class="w-full border-none bg-transparent text-center focus:outline-none" placeholder="ระบุจำนวนเงิน...">
                </td>
            </tr>
            <tr>
                <td class="border border-gray-400 p-2">
                    <input type="text" class="w-full border-none bg-transparent text-center focus:outline-none" placeholder="ระบุปี...">
                </td>
                <td class="border border-gray-400 p-2">
                    <input type="text" class="w-full border-none bg-transparent text-center focus:outline-none" placeholder="ระบุจำนวนเงิน...">
                </td>
            </tr>
            <tr>
                <td class="border border-gray-400 p-2">
                    <input type="text" class="w-full border-none bg-transparent text-center focus:outline-none" placeholder="ระบุปี...">
                </td>
                <td class="border border-gray-400 p-2">
                    <input type="text" class="w-full border-none bg-transparent text-center focus:outline-none" placeholder="ระบุจำนวนเงิน...">
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
            <label class="flex items-center gap-2 text-sm"><input type="radio" name="legal_status" value="นิติบุคคล" class="w-4 h-4 accent-blue-600"> นิติบุคคล</label>
            <label class="flex items-center gap-2 text-sm"><input type="radio" name="legal_status" value="บุคคลธรรมดา" class="w-4 h-4 accent-blue-600"> บุคคลธรรมดา</label>
        </div>
        <div class="grid grid-cols-1 gap-3">
            <div>
                <label class="block text-xs font-semibold text-gray-600">เลขทะเบียนนิติบุคคล</label>
                <input type="text" class="input input-sm border border-gray-400 h-8 rounded w-full px-2">
            </div>
            <div>
                <label class="block text-xs font-semibold text-gray-600">เลขประจำตัวผู้เสียภาษี ภ.พ. 20 (Tax ID)</label>
                <input type="text" class="input input-sm border border-gray-400 h-8 rounded w-full px-2">
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
                    <input type="text" class="w-full border border-gray-400 h-8 p-2 rounded text-sm">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-gray-600">Total Amount [Bht]</label>
                    <input type="text" id="total_amount" class="w-full border border-gray-400 h-8 p-2 rounded text-sm">
                </div>
                <label class="flex items-center gap-2 text-sm"><input type="checkbox" class="checkbox"> Not purchase more than 5 years "DO NOT USE"</label>
            </div>
            <div class="space-y-1 text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
                <label class="flex items-center gap-2"><input type="radio" name="purchase_level" value="A" class="w-4 h-4 accent-blue-600"> Level A: ≥ 1,000,000 Baht</label>
                <label class="flex items-center gap-2"><input type="radio" name="purchase_level" value="B" class="w-4 h-4 accent-blue-600"> Level B: < 1,000,000 and ≥ 100,000 Baht</label>
                <label class="flex items-center gap-2"><input type="radio" name="purchase_level" value="C" class="w-4 h-4 accent-blue-600"> Level C: < 100,000 and ≥ 10,000 Baht</label>
                <label class="flex items-center gap-2"><input type="radio" name="purchase_level" value="D" class="w-4 h-4 accent-blue-600"> Level D: < 10,000 Baht</label>
            </div>
        </div>
    </div>

        <!-- รายละเอียดประเมิน (Financial, Quality, Enviro) จัดเป็น Grid -->
        <div class="grid grid-cols-2 gap-8 border-t pt-6">
            <!-- คอลัมน์ซ้าย -->
            <div class="space-y-6">
                <div>
                    <h3 class="font-bold underline text-sm mb-2">Financial Statement:</h3>
                    <div class="space-y-1 text-sm">
                        <label class="flex items-center gap-2"><input type="radio" name="financial_level" class="w-4 h-4 accent-blue-600"> Level A: Bar C and Related with Melco's Group Company</label>
                        <label class="flex items-center gap-2"><input type="radio" name="financial_level" class="w-4 h-4 accent-blue-600"> Level B: Has Company certificated, Tax payment, Profit ratio</label>
                        <label class="flex items-center gap-2"><input type="radio" name="financial_level" class="w-4 h-4 accent-blue-600"> Level C: Has Company certificated, Tax payment</label>
                        <label class="flex items-center gap-2"><input type="radio" name="financial_level" class="w-4 h-4 accent-blue-600"> Level D: Has Company certificated, Not found data of Tax payment and/or "DO NOT USE" / </label>
                    </div>
                </div>
                <div>
                    <h3 class="font-bold underline text-sm mb-2">Quality Classification by warranty:</h3>
                    <div class="space-y-1 text-sm">
                        <label class="flex items-center gap-2"><input type="radio" name="quality_level" class="w-4 h-4 accent-blue-600"> Level A: No Claim</label>
                        <label class="flex items-center gap-2"><input type="radio" name="quality_level" class="w-4 h-4 accent-blue-600"> Level: B: Clearly Claim on time/ 1 week</label>
                        <label class="flex items-center gap-2"><input type="radio" name="quality_level" class="w-4 h-4 accent-blue-600"> Level: C (Clearly Claim 1-2 month)</label>
                        <label class="flex items-center gap-2"><input type="radio" name="quality_level" class="w-4 h-4 accent-blue-600"> Level: D [not warranty] "DO NOT USE"</label>
                    </div>
                </div>
            </div>

            <!-- คอลัมน์ขวา -->
            <div class="space-y-6">
                <div>
                    <h3 class="font-bold underline text-sm mb-2">Advance verifying invoice's price by:</h3>
                    <div class="space-y-1 text-sm">
                        <label class="flex items-center gap-2"><input type="radio" name="verification_method" class="w-4 h-4 accent-blue-600" value="XML file"> XML file</label>
                        <label class="flex items-center gap-2"><input type="radio" name="verification_method" class="w-4 h-4 accent-blue-600" value="PDF file (convert/not scan)<"> PDF file (convert/not scan)</label>
                        <label class="flex items-center gap-2"><input type="radio" name="verification_method" class="w-4 h-4 accent-blue-600" value="Excel file">Excel file</label>
                        <label class="flex items-center gap-2"><input type="radio" name="verification_method" class="w-4 h-4 accent-blue-600" value="Text file (own pattern/form)"> Text file (own pattern/form)</label>
                        <label class="flex items-center gap-2"><input type="radio" name="verification_method" class="w-4 h-4 accent-blue-600" value="Not able advance any file before deliver to AMEC"> Not able advance any file before deliver to AMEC</label>
                    </div>
                </div>
                <div>
                <h3 class="font-bold text-sm underline mb-3">Environmental: ex.ISO14001 (ref.: PUR-QP-E003)</h3>
                <div class="space-y-2 text-sm">
                    <label class="flex items-center gap-2">
                        <input type="radio" name="environmental_level" class="w-4 h-4 accent-blue-600"> Level A: Has Environmental certificate
                    </label>
                    <label class="flex items-center gap-2">
                        <input type="radio" name="environmental_level" class="w-4 h-4 accent-blue-600"> Level B: Has own Environmental policy
                    </label>
                    <label class="flex items-center gap-2">
                        <input type="radio" name="environmental_level" class="w-4 h-4 accent-blue-600"> Level C: Has response & related material, refer to PUR-QP-E003
                    </label>
                    <label class="flex items-center gap-2">
                        <input type="radio" name="environmental_level" class="w-4 h-4 accent-blue-600"> Level D: Has not related material
                    </label>
                    <label class="flex items-center gap-2">
                        <input type="radio" name="environmental_level" class="w-4 h-4 accent-blue-600"> Level D: Related & Not response
                    </label>
                    
                </div>
            </div>
            </div>
        </div>
        <div class="mt-6">
    <h3 class="font-bold text-sm underline mb-3">E-SCM : (Enable) contact person and e-mail address</h3>
    
    <div id="contact-list" class="space-y-2">
        <!-- แถวข้อมูลเริ่มต้น -->
        <div class="flex gap-4 contact-row">
            <input type="text" placeholder="Name" class="input input-sm border border-gray-400 h-8 rounded w-[450px] px-2">
            <input type="email" placeholder="E-mail" class="input input-sm border border-gray-400 h-8 rounded w-[450px]  px-2">
            <input type="text" placeholder="Username" class="input input-sm border border-gray-400 h-8 rounded w-[200px]  px-2">
        </div>
    </div>

    <!-- ปุ่มเพิ่มแถว -->
    <button type="button" id="add-contact" class="mt-3 text-sm text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
        + Add Contact Person
    </button>
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
</form>
</div>

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