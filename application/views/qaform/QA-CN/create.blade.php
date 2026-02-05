@extends('layouts/webflowTemplate')
@section('styles')
    <style>


</style>
@endsection
@section('contents')
@php
  $MODE_ADD = "1";
  $MODE_EDIT = "2";
  $MODE_VIEW = "3";
@endphp
    <div id="loading-overlay"
        style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.85); z-index:9999;">
        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%);">
            <img src="{{ base_url() }}assets/images/loading_gif.gif" alt="Loading..." width="120">
        </div>
    </div>
    <div class="bg-white rounded-md shadow-md border border-gray-200">

<!-- ===== Header ===== -->
<div class="text-center py-5 border-b border-gray-200">
    <h1 class="text-xl font-semibold tracking-wide text-blue-900">
        MITSUBISHI ELEVATOR ASIA CO., LTD.
    </h1>
    <p class="mt-1 text-base font-semibold text-blue-900">
        Changing Notice
    </p>
</div>
<!-- ===== Content ===== -->
<div class="p-4  space-y-0">
<div class="form-data" data-nfrmno="{{ $NFRMNO }}" data-vorgno="{{ $VORGNO }}" data-cyear="{{ $CYEAR }}"
        data-empno="{{ $empno }}" ></div>
<form id="cn-form" method="post" enctype="multipart/form-data"> 

<div class="w-full border border-gray-300 text-sm font-sans">
    
    <style>
        .force-w-350 {
            width: 350px !important;      /* บังคับกว้าง 250px */
            min-width: 350px !important;  /* ห้ามเล็กกว่า 250px */
            max-width: 350px !important;  /* ห้ามใหญ่กว่า 250px */
            white-space: normal !important; /* บังคับตัดบรรทัด */
            word-wrap: break-word !important; /* ตัดคำยาวๆ ลงมา */
            background-color: #9CA2CB;
            color: white;
            padding: 4px 8px;
            font-weight: 600;
            border-bottom: 1px solid white;
            vertical-align: top;
        }
    </style>

    <table class="w-full border-collapse table-fixed">
        
        <colgroup>
            <col style="width: 350px;">
            <col style="width: auto;">
        </colgroup>

        <tr>
            <td class="force-w-350">Input by</td>
            <td class="px-3 py-1 bg-gray-100 text-gray-800 border-b border-white"><input type="hidden" name="txtInput" value="{{ $empinf[0]->SEMPNO }}" >
            {{ '(' . $empinf[0]->SEMPNO . ') ' . $empinf[0]->SNAME }}
            </td>
        </tr>
        <tr>
            <td class="force-w-350">Request by <span class="text-red-600 px-1">*</span></td>
            <td class="px-3 py-1 bg-gray-100 text-gray-800 border-b border-white">
                <input type="text" name="txtReqId" 
                       class="w-36 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm req"
                       value="{{ $empinf[0]->SEMPNO }}" maxlength="12">
            </td>
        </tr>
     <tr>
            <td class="force-w-350">Title <span class="text-red-600 px-1">*</span></td>
            <td class="px-3 py-1 bg-gray-100 text-gray-800 border-b border-white">
                  <input type="text" name="txtTitle" 
                       class="w-1/3 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm req"
                       value="" maxlength="256">
            </td>
        </tr>
        <tr>
            <td class="force-w-350">Order</td>
            <td class="px-3 py-1 bg-gray-100 text-gray-800 border-b border-white">
                <input type="text" name="orderno" 
                       class="w-36  h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                       value="" maxlength="9">
            </td>
        </tr>
         <tr>
            <td class="force-w-350">Item <span class="text-red-600 px-1">*</span></td>
            <td class="px-3 py-1 bg-gray-100 text-gray-800 border-b border-white">
                     <input type="text" name="txtItemno" 
                       class="w-36 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                       value="" maxlength="3" inputmode="numeric" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
            </td>
        </tr>
        <tr>
            <td class="force-w-350">Drawing No <span class="text-red-600 px-1">*</span></td>
            <td class="px-3 py-1 bg-gray-100 text-gray-800 border-b border-white">
                <table class="w-4/5  text-left text-xs">
                     <tbody id="dwg-body">
                    <tr>
                        <td class="py-1">
                            <span><input type="text" name="txtDwgNo[]" 
                            class="w-40 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                            value="" maxlength="9">
                            <input type="text" name="txtG[]" 
                            class="w-40 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                            value="">
                            <input type="text" name="txtL[]" 
                            class="w-40 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                            value=""></span>
                            <span class="px-3">Rev No. :</span><span>  <input type="text" name="revNo[]" 
                            class="w-20 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                            value=""></span>
                        </td>
                    </tr>
                </tbody>
                </table> 
                <div  class="mt-2"><button type="button" data-table = "dwg-body" class="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded shadow cursor-pointer add-table-row">
      + Add Row
    </button></div>  
            </td>
        </tr>
        <tr>
            <td class="force-w-350">Part Name<span class="text-red-600 px-1">*</span></td>
            <td class="px-3 py-1 bg-gray-100 text-gray-800 border-b border-white">
                     <input type="text" name="txtPrtName" 
                       class="w-1/3 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                       value="" maxlength="256">
            </td>
        </tr>
        <tr>
            <td class="force-w-350">Pur Item No.<span class="text-red-600 px-1">*</span></td>
            <td class="px-3 py-1 bg-gray-100 text-gray-800 border-b border-white">
                     <input type="text" name="txtPurItem" 
                       class="w-36 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                       value="" maxlength="10">
            </td>
        </tr>
        <tr>
            <td class="force-w-350">PO. or Invoice no.<span class="text-red-600 px-1">*</span></td>
            <td class="px-3 py-1 bg-gray-100 text-gray-800 border-b border-white">
                     <input type="text" name="txtInvNo" 
                       class="w-1/3 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                       value="" maxlength="90">
            </td>
        </tr>
        <tr>
            <td class="force-w-350">Order Quantity<span class="text-red-600 px-1">*</span></td>
            <td class="px-3 py-1 bg-gray-100 text-gray-800 border-b border-white">
                     <input type="text" name="txtOrdQ" 
                       class="w-36 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                       value="" maxlength="15" inputmode="numeric" oninput="this.value = this.value.replace(/[^0-9]/g, '')" >
            </td>
        </tr>
        <tr>
            <td class="force-w-350">Supplier or subcontractor name<span class="text-red-600 px-1">*</span></td>
            <td class="px-3 py-1 bg-gray-100 text-gray-800 border-b border-white">
                     <input type="text" name="txtSupName" 
                       class="w-1/3 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                       value="" maxlength="90">
            </td>
        </tr>
        <tr>
            <td class="force-w-350">Section Support<span class="text-red-600 px-1">*</span>(เจาะจงแผนกตรวจสอบ)</td>
            <td class="px-3 py-1 bg-gray-100 text-gray-800 border-b border-white">
                        <div class="flex items-center gap-4">
                        <label class="flex items-center gap-1">
                            <input type="radio" name="radsec" class="selsec h-4 w-4 req" value="1">
                            <span>Yes</span>
                        </label>

                        <label class="flex items-center gap-1">
                            <input type="radio" name="radsec" class="selsec h-4 w-4 req" value="2">
                            <span>No</span>
                        </label>
                        </div>
            </td>
        </tr>
        <tr id="showsec" class="hidden chky">
			 <td class="force-w-350">Section<span class="text-red-600 px-1">*</span></td>
            <td class="px-3 py-1 bg-gray-100 text-gray-800 border-b border-white">

                        <div class="flex items-center gap-4">
                        <label class="flex items-center gap-1">
                            <input type="radio"  name="Sec" id="Sec"  class="h-4 w-4" value="1">
                            <span>QEE</span>
                        </label>
                        <label class="flex items-center gap-1">
                            <input type="radio"  name="Sec" id="Sec"  class="h-4 w-4" value="2">
                            <span>QEM</span>
                        </label>
                        <label class="flex items-center gap-1">
                            <input type="radio"  name="Sec" id="Sec"  class="h-4 w-4" value="2">
                            <span>QIC</span>
                        </label>
                        </div>
		</tr>
        <tr id="proc"  class="hidden chkn">
			<td class="force-w-350">Manufacturing Process in AMEC<span class="text-red-600 px-1">*</span></td>
            <td class="px-3 py-1 bg-gray-100 text-gray-800 border-b border-white">

                        <div class="flex items-center gap-4">
                        <label class="flex items-center gap-1">
                            <input type="radio"  name="radProcAMEC"  class="h-4 w-4 selproc" value="1">
                            <span>Yes</span>
                        </label>
                        <label class="flex items-center gap-1">
                            <input type="radio"  name="radProcAMEC"   class="h-4 w-4 selproc" value="2" checked>
                            <span>No</span>
                        </label>
                        </div>
            </td>
		</tr>
      <tr id="eval"  class="hidden chkn chke">
			<td class="force-w-350" align-top>Evaluation object tive</td>
            <td class="px-3 py-1 bg-gray-100 text-gray-800 border-b border-white">

                     <div class="flex flex-col gap-2">
                    <label class="flex items-center gap-1">
                        <input type="radio" name="radobj" class="h-4 w-4" value="1">
                        <span>Sample/trial parts</span>
                    </label>
                    <label class="flex items-center gap-1">
                        <input type="radio" name="radobj" class="h-4 w-4" value="2">
                        <span>1st lot of mass product</span>
                    </label>
                          <label class="flex items-center gap-1">
                        <input type="radio" name="radobj" class="h-4 w-4" value="3">
                        <span>4M change by sub-cont</span>
                    </label>
                    </div>
            </td>
		</tr>
        <tr>
            <td class="force-w-350">Classification of changing<span class="text-red-600 px-1">*</span></td>
            <td class="px-3 py-1 bg-gray-100 text-gray-800 border-b border-white">
                      <div class="flex flex-col space-y-1">
                @foreach ($cncls as $c)
                     <label class="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="chkClass" class="h-4 w-4" value="{{ $c->CLSNO }}" {{ $c->CLSNO == '1'? 'checked':'' }}  >
                        <span>{{ $c->CLSCHANGE }}   </span>
                    </label>
                @endforeach
                </div>
            </td>
        </tr>
        <tr>
            <td class="force-w-350">Reason<span class="text-red-600 px-1">*</span></td>
            <td class="px-3 py-1 bg-gray-100 text-gray-800 border-b border-white">
                      <div class="flex flex-col space-y-1">
                     @foreach ($cnreason as $r)
                    <label class="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="radReason"  class="h-4 w-4" value="{{ $r->RSNNO}}" {{ $r->RSNNO == '1'? 'checked':'' }}  >
                        <span class="{{ $r->RSNNO == '5' ? 'inline-block w-20' : '' }}">{{ $r->REASON }}</span>
                        @if($r->RSNNO == "5")
                        <span class="px-2 inline-block w-1/3"><input type="text" name="txtOther" id="txtOther" value=""  class="w-full h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm" /></span>
                        @endif
                    </label>

                    @endforeach
                </div>
            </td>
        </tr>
        <tr>
            <td class="force-w-350">Sample transaction<span class="text-red-600 px-1">*</span></td>
            <td class="px-3 py-1 bg-gray-100 text-gray-800 border-b border-white">
                <div class="flex flex-col space-y-1">
                    <label class="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="radSample" class="h-4 w-4" value="1"  checked  >
                        <span>Scrap</span>
                    </label>
                    <label class="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="radSample" class="h-4 w-4" value="2"   >
                        <span class="w-20">Return to</span><span class="px-2 w-1/3"> <input type="text" name="txtReturn"  id="txtReturn" 
                       class="w-full h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                       value="" ></span>
                    </label>
                    <label class="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="radSample" class="h-4 w-4" value="3"   >
                        <span class="w-20">Other</span><span class="px-2 w-1/3"> <input type="text" name="txtOth" id="txtOth"
                       class="w-full h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                       value="" ></span>
                    </label>
                </div>
            </td>
        </tr>
                <tr>
            <td class="force-w-350">RQ or CN No. for reference <span class="text-red-600 px-1">*</span></td>
            <td class="px-3 py-1 bg-gray-100 text-gray-800 border-b border-white">
                  <input type="text" name="txtNoRef" 
                       class="w-1/3 h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm"
                       value="" maxlength="20">
            </td>
        </tr>
        <tr class="bg-[#C5CCDC]"><td colspan="2" class="py-1 px-2 font-bold">Necessary Document submitted with changing notice<span class="px-2 text-red-600">(ชื่อไฟล์ต้องเป็นภาษาอังกฤษเท่านั้นและห้ามตัวอักษรพิเศษ)</span></td></tr>
                <tr>
            <td class="force-w-350 align-top pt-2 ">Dwg. <span class="px-2 text-red-600">(Max 1500 KB)</span></td>
            <td class="px-3 py-2 bg-gray-100 border-b border-white "> 
                <div id="dvdwgFile" class="pt-1 w-[600px]">
                <div class="dvSFile flex items-center justify-between gap-2 mb-2">
                    <input type="file" name="DWGFILE[]" data-map="DWGFILE" data-max-kb="1500"
                    class="file-input file-input-bordered border-blue-200 w-full" multiple>
                    <!-- ปุ่มลบ -->
                    <button type="button"
                    class="reset-file btn-square bg-red-200 hover:bg-red-300 text-red-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                    title="Reset file input">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    </button>
                </div>
                </div>
                <!-- ปุ่มเพิ่ม -->
                <div class="flex justify-end mt-2  w-[600px]">
                <button type="button"
                    class="add-row btn-square bg-green-200 hover:bg-green-300 text-green-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                    title="Add row" data-var1="DWGFILE" data-var2="dvdwgFile" data-var3="1500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
                </div>
            </td>
        </tr>
        <tr>
            <td class="force-w-350 align-top pt-2 ">Material Certificate <span class="px-2 text-red-600">(Max 1000 KB)</span></td>
            <td class="px-3 py-2 bg-gray-100 border-b border-white "> 
                <div id="dvmatFile" class="pt-1 w-[600px]">
                <div class="dvSFile flex items-center justify-between gap-2 mb-2">
                    <input type="file" name="MATFILE[]" data-map="MATFILE" data-max-kb="1000"
                    class="file-input file-input-bordered border-blue-200 w-full" multiple>

                    <!-- ปุ่มลบ -->
                    <button type="button"
                    class="reset-file btn-square bg-red-200 hover:bg-red-300 text-red-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                    title="Reset file input">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    </button>
                </div>
                </div>

                <!-- ปุ่มเพิ่ม -->
                <div class="flex justify-end mt-2  w-[600px]">
                <button type="button"
                    class="add-row btn-square bg-green-200 hover:bg-green-300 text-green-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                    title="Add row" data-var1="MATFILE" data-var2="dvmatFile" data-var3="1000">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
                </div>
            </td>
        </tr>
        <tr>
            <td class="force-w-350 align-top pt-2 ">Maker Insp. Data <span class="px-2 text-red-600">(Max 1000 KB)</span></td>
            <td class="px-3 py-2 bg-gray-100 border-b border-white "> 
                <div id="dvmakFile" class="pt-1 w-[600px]">
                <div class="dvSFile flex items-center justify-between gap-2 mb-2">
                    <input type="file" name="MAKFILE[]" data-map="MAKFILE" data-max-kb="1000" 
                    class="file-input file-input-bordered border-blue-200 w-full" multiple>

                    <!-- ปุ่มลบ -->
                    <button type="button"
                    class="reset-file btn-square bg-red-200 hover:bg-red-300 text-red-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                    title="Reset file input">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    </button>
                </div>
                </div>

                <!-- ปุ่มเพิ่ม -->
                <div class="flex justify-end mt-2  w-[600px]">
                <button type="button"
                    class="add-row btn-square bg-green-200 hover:bg-green-300 text-green-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                    title="Add row" data-var1="MAKFILE" data-var2="dvmakFile" data-var3="1000">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
                </div>
            
            </td>
        </tr>
        <tr>
            <td class="force-w-350 align-top pt-2 ">RoHS Certificate <span class="px-2 text-red-600">(Max 300 KB)</span></td>
            <td class="px-3 py-2 bg-gray-100 border-b border-white "> 
                <div id="dvrohFile" class="pt-1 w-[600px]">
                <div class="dvSFile flex items-center justify-between gap-2 mb-2">
                    <input type="file" name="ROHFILE[]" data-map="ROHFILE" data-max-kb="300"
                    class="file-input file-input-bordered border-blue-200 w-full" multiple>

                    <!-- ปุ่มลบ -->
                    <button type="button"
                    class="reset-file btn-square bg-red-200 hover:bg-red-300 text-red-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                    title="Reset file input">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    </button>
                </div>
                </div>

                <!-- ปุ่มเพิ่ม -->
                <div class="flex justify-end mt-2  w-[600px]">
                <button type="button"
                    class="add-row btn-square bg-green-200 hover:bg-green-300 text-green-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                    title="Add row" data-var1="ROHFILE" data-var2="dvrohFile" data-var3="300">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
                </div>
            </td>
        </tr>
        <tr>
            <td class="force-w-350 align-top pt-2 ">Pur. Spec. <span class="px-2 text-red-600">(Max 1000 KB)</span></td>
            <td class="px-3 py-2 bg-gray-100 border-b border-white "> 
                <div id="dvpurFile" class="pt-1 w-[600px]">
                <div class="dvSFile flex items-center justify-between gap-2 mb-2">
                    <input type="file" name="PURFILE[]" data-map="PURFILE" data-max-kb="1000"
                    class="file-input file-input-bordered border-blue-200 w-full" multiple>

                    <!-- ปุ่มลบ -->
                    <button type="button"
                    class="reset-file btn-square bg-red-200 hover:bg-red-300 text-red-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                    title="Reset file input">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    </button>
                </div>
                </div>

                <!-- ปุ่มเพิ่ม -->
                <div class="flex justify-end mt-2  w-[600px]">
                <button type="button"
                    class="add-row btn-square bg-green-200 hover:bg-green-300 text-green-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                    title="Add row" data-var1="PURFILE" data-var2="dvpurFile" data-var3="1000">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
                </div>
            </td>
        </tr>
        <tr>
            <td class="force-w-350 align-top pt-2 ">Sub-Contractor /Maker /AMEC Countermeasure<br>in case of 1st Sample "NG".<span class="px-2 text-red-600">(Max 1000 KB)</span></td>
            <td class="px-3 py-2 bg-gray-100 border-b border-white "> 


                <div id="dvsubFile" class="pt-1 w-[600px]">
                <div class="dvSFile flex items-center justify-between gap-2 mb-2">
                    <input type="file" name="SUBFILE[]" data-map="SUBFILE" data-max-kb="1000"
                    class="file-input file-input-bordered border-blue-200 w-full" multiple>

                    <!-- ปุ่มลบ -->
                    <button type="button"
                    class="reset-file btn-square bg-red-200 hover:bg-red-300 text-red-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                    title="Reset file input">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    </button>
                </div>
                </div>

                <!-- ปุ่มเพิ่ม -->
                <div class="flex justify-end mt-2  w-[600px]">
                <button type="button"
                    class="add-row btn-square bg-green-200 hover:bg-green-300 text-green-800 rounded-md w-8 h-8 flex items-center justify-center shadow transition cursor-pointer"
                    title="Add row" data-var1="SUBFILE" data-var2="dvsubFile" data-var3="1000">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
                </div>
            </td>
        </tr>
        <tr class="bg-[#C5CCDC]"><td colspan="2" class="py-1 px-2 font-bold">Contents of changing (Concretely, Briefly, with sketch if Necessary)</td></tr>
        <tr>
            <td class="force-w-350 align-top pt-2 ">Part Arrive Date / Prod. Month <span class="px-2 text-red-600">*</td>
            <td class="px-3 py-2 bg-gray-100 border-b border-white ">
            <input type="text" class="w-[120px] bg-white border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 req" name="part_date" id="part_date" value=""  />
            </td>
        </tr>
        <tr>
			<td class="force-w-350">Part Arrive Location</td>
            <td class="px-3 py-1 bg-gray-100 text-gray-800 border-b border-white">

                        <div class="flex items-center gap-4">
                        <label class="flex items-center gap-1">
                            <input type="radio"  name="radLoc"  class="h-4 w-4" value="1" checked>
                            <span>WareHouse Receive</span>
                        </label>
                        <label class="flex items-center gap-1">
                            <input type="radio"  name="radLoc"   class="h-4 w-4" value="2">
                            <span class="w-[50px]">Other</span><span class="px-2 w-[500px]"><input type="text" name="txtLoc" id="txtLoc" value=""  class="w-full h-8 px-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm" /></span>
                  
                        </label>
                        </div>
            </td>
		</tr>
        <tr>
			<td class="force-w-350">Before Changing<span class="px-2 text-red-600">*</span></td>
            <td class="px-3 py-1 bg-gray-100 text-gray-800 border-b border-white">
                <textarea name="txtBefChg" id="txtBefChg" rows="3" class="w-1/3 bg-white border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 req resize-none"></textarea>
            </td>
		</tr>
        <tr>
			<td class="force-w-350">After Changing<span class="px-2 text-red-600">*</span></td>
            <td class="px-3 py-1 bg-gray-100 text-gray-800 border-b border-white">
                <textarea name="txtAftChg" id="txtAftChg" rows="3" class="w-1/3 bg-white border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 req resize-none"></textarea>
            </td>
		</tr>
        <tr>
            <td class="force-w-350 align-top pt-2 ">Possible Submitting Date<span class="px-2 text-red-600">*</span></td>
            <td class="px-3 py-2 bg-gray-100 border-b border-white ">
            <input type="text" class="w-[120px] bg-white border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 req" name="submit_date" id="submit_date" value=""  />
            </td>
        </tr>
        <tr>
            <td class="force-w-350 align-top pt-2 ">Required Inspection Date<span class="px-2 text-red-600">*</span></td>
            <td class="px-3 py-2 bg-gray-100 border-b border-white ">
            <input type="text" class="w-[120px] bg-white border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 req" name="inspec_date" id="inspec_date" value=""  />
            </td>
        </tr>
        <tr>
            <td class="force-w-350 align-top pt-2 ">Expected Changing Date<span class="px-2 text-red-600">*</span></td>
            <td class="px-3 py-2 bg-gray-100 border-b border-white ">
            <input type="text" class="w-[120px] bg-white border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 req" name="expchg_date" id="expchg_date" value=""  />
            </td>
        </tr>
                <tr>
			<td class="force-w-350">Remark</td>
            <td class="px-3 py-1 bg-gray-100 text-gray-800 border-b border-white">
                <textarea name="txtRemark" id="txtRemark" rows="3" class="w-1/3 bg-white border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400  resize-none"></textarea>
            </td>
		</tr>
        <tr>
        <td colspan="2" class="py-4 text-center">
                      <button type="button" name="btnSaveData"  id="btnSaveData"
                        data-action="save"
                        class="btn-submit bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded shadow mx-1 cursor-pointer">
                    Save Data
                </button>
                            <button type="button" name="btnRequest"  id="btnRequest"
                        data-action="request"
                        class="btn-submit bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow mx-1 cursor-pointer">
                    Request
                </button>
                
        </td>
        </tr>
    </table>
</div>

</form>
</div>
</div>
</form>
</div>
@endsection

@section('scripts')
     <script src="{{ $_ENV['APP_JS'] }}/cn.js?ver={{ $GLOBALS['version'] }}"></script>
    <script></script>
@endsection
