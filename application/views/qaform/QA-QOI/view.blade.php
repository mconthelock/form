@extends('layouts/webflowTemplate')

@section('contents')
    <div id="loading-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.85); z-index:9999;">
        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%);">
            <img src="{{base_url()}}assets/images/loading_gif.gif" alt="Loading..." width="120">
        </div>
    </div>
<!-- Container ที่ควบคุมความกว้าง -->
<div class="form-data" data-nfrmno="{{ $NFRMNO }}" data-vorgno="{{ $VORGNO }}" data-cyear="{{ $CYEAR }}" data-cyear2="{{ $CYEAR2 }}" data-nrunno="{{ $NRUNNO }}" data-empno="{{ $empno }}"></div>
<div class="max-w-6xl w-full mx-auto">

  <!-- Header -->
  <div class="bg-gradient-to-b from-sky-400 to-sky-600 text-white text-center py-6 rounded-t-md shadow-md">
    <h1 class="text-xl font-semibold tracking-wide">MITSUBISHI ELEVATOR ASIA CO., LTD.</h1>
    <p class="text-base mt-2">Quality Observation Inspection</p>
  </div>

<!-- Section ติด Header (หัวข้อละแถว) -->
<div class="bg-white rounded-b-md shadow-md p-6 mb-8  max-w-6xl w-full mx-auto text-sm text-gray-800 space-y-3">
  <div class="flex items-center">
    <div class="w-55 text-sm font-normal text-gray-600">Form No.</div>
    <div class="flex-1">{{$formno}}</div>
  </div>
  <div class="flex items-center">
    <div class="w-55  text-sm font-normal text-gray-600">Input by</div>
    <div class="flex-1">{{ '('.$qoiform->VINPUTER.') '.$qoiform->INPNAME }}</div>
  </div>
  <div class="flex items-center">
    <div class="w-55  text-sm font-normal text-gray-600">Requested by</div>
    <div class="flex-1">{{ '('.$qoiform->VREQNO.') '.$qoiform->REQNAME }}</div>
  </div>
  <div class="flex items-center">
    <div class="w-55  text-sm font-normal text-gray-600">Title</div>
    <div class="flex-1"><input type="text" name="title" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" value="{{$qoiform->TITLE}}" />
 </div>
  </div>
  <div class="flex items-center">
    <div class="w-55  text-sm font-normal text-gray-600">Item</div>
    <div class="flex-1"><input type="text" name="itemno" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" value="{{$qoiform->ITEMNO}}" />
 </div>
  </div>
  <!-- แถว Drawing -->
<div class="flex ">
    <!-- ใช้ flex items-center และกำหนดความสูงเท่ากับแถว header ของตาราง -->
    <div class="w-55  text-sm font-normal text-gray-600 flex items-center" style="height: 44px;">
      Drawing No.
    </div>
    <div class="flex-1 overflow-x-auto">
      <table class="min-w-full border border-sky-300 text-left text-sm">
        <thead>
          <!-- กำหนดความสูงแถวหัวตารางเท่ากัน -->
          <tr class="h-11" style="background-color: #bfdbfe !important;">
            <th class="border border-sky-300 px-4 py-2 text-sky-700 font-medium ">DWG No.</th>
            <th class="border border-sky-300 px-4 py-2 text-sky-700 font-medium">OK</th>
            <th class="border border-sky-300 px-4 py-2 text-sky-700 font-medium">NG</th>
            <th class="border border-sky-300 px-4 py-2 text-sky-700 font-medium">Remark</th>
          </tr>
        </thead>
        <tbody>
        @foreach ($resultdwg as $d)
          <tr>
            <td class="border border-sky-300 px-4 py-2">{{ $d->DWGNO }}</td>
            <td class="border border-sky-300 px-4 py-2">
               @if($d->RESULT == '0')
                    <span class="inline-block bg-green-100 text-green-700 px-2 py-1 text-sm rounded-full font-semibold">✔</span>
               @endif     
            </td>
            <td class="border border-sky-300 px-4 py-2">
               @if($d->RESULT == '1')
                   <span class="inline-block bg-red-100 text-red-700 px-2 py-1 text-sm rounded-full font-semibold">✘</span>
               @endif 

            </td>
            <td class="border border-sky-300 px-4 py-2">{{ $d->REMARK }}</td>
          </tr>
        @endforeach
        </tbody>
      </table>
    </div>
  </div>
  <div class="flex items-center">
    <div class="w-55  text-sm font-normal text-gray-600">Part Name</div>
    <div class="flex-1"><input type="text" name="prtname" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" value="{{$qoiform->PRTNAME}}" />
 </div>
</div>
<div class="flex items-center">
    <div class="w-55  text-sm font-normal text-gray-600">Pur Item No.</div>
    <div class="flex-1"><input type="text" name="puritem" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" value="{{$qoiform->PURITEM}}" />
 </div>
</div>
<div class="flex items-center">
    <div class="w-55  text-sm font-normal text-gray-600">Supplier or subcontractor name</div>
    <div class="flex-1"><input type="text" name="svendname" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" value="{{$qoiform->SVENDNAME}}" />
 </div>  
 </div>
</div>

  <!-- Section 2 -->
  <div class="bg-white rounded-md shadow-md p-6 mb-8 text-sm text-gray-800">
    <h2 class="text-lg font-semibold text-sky-700  mb-4 border-b-2 border-sky-500 pb-2">
    Necessary Document submitted with Quality Observation Inspection
    </h2>

<!-- Attach File -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <label class="block text-gray-700 font-medium mb-1">DWG.</label>
      <input type="file" class="file-input file-input-bordered border-blue-200   w-full "  name="DWGFILE[]" id="DWGFILE" data-map="DWGFILE" multiple />
       
    </div>
    <div>
      <label class="block text-gray-700 font-medium mb-1">Spec.</label>
      <input type="file" class="file-input file-input-bordered border-blue-200   w-full "  name="SPECFILE[]" id="SPECFILE" data-map="SPECFILE" multiple />
    </div>
  </div>
</div>

  <!-- Section 3 -->
  <div class="bg-white rounded-md shadow-md p-6 mb-8 text-sm text-gray-800">
    <h2 class="text-lg font-semibold text-sky-700  mb-4 border-b-2 border-sky-500 pb-2">
    Contents of inspection
    </h2>  

  </div>

    <!-- Section 4 -->
    <div class="bg-white rounded-md shadow-md p-6 mb-8 text-sm text-gray-800">
    <h2 class="text-lg font-semibold text-sky-700  mb-4 border-b-2 border-sky-500 pb-2">
    Quality Observation Report (QOI)
    </h2>  
    
  </div>

<div class="flex justify-end gap-4 pt-4">
  <button type="reset" class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded shadow">
    Reset
  </button>
  <button type="submit" class="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2 rounded shadow">
    Submit
  </button>
</div>
<div class="flow">

</div>
</div>

@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/qoiview.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
