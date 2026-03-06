@extends('layouts/webflowTemplate')
@section('styles')
<style>
  .active-tab {
    background-color: rgba(255, 255, 255, 0.5); /* โปร่งบาง */
    border-left-color: #2563eb;
    color: #1e40af;
    font-weight: 600;
  }
    /* ใช้ peer เพื่อจับสถานะ checked */
    input[type="checkbox"].checkbox-primary {
    /* transition สำหรับ animation */
    transition: all 0.3s ease;
  }

  /* ตอน hover ขยาย checkbox */
  input[type="checkbox"].checkbox-primary:hover {
    transform: scale(1.1);
  }

  /* ตอน checked เปลี่ยนสีเป็น gradient และโชว์เครื่องหมาย ✔ */
  input[type="checkbox"].checkbox-primary:checked {
    background: linear-gradient(90deg, #3b82f6, #6366f1); /* from blue-500 to indigo-600 */
    border-color: transparent;
    position: relative;
    color: white;
  }
  /* ซ่อนเครื่องหมาย ✔ โดย default */
  input[type="checkbox"].checkbox-primary:checked::after {
    content: "✔";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 14px;
    font-weight: bold;
    color: white;
  }
  #tablesch_info {
    display: none !important;
  }


table.dataTable .select2-container--default .select2-selection--multiple {
    min-height: auto !important;
    height: auto !important;
}

.file-list
{
  font-size: 14px;
  color:blue;
}
.tooltip {
    position: absolute;
    left: 0;
    top: 100%;
    margin-top: 0.25rem;
    width: 16rem;
    padding: 0.5rem;
    background-color: #374151;
    color: white;
    font-size: 0.875rem;
    border-radius: 0.25rem;
    z-index: 10;
  }

  [x-cloak] { display: none !important; }
</style>
@endsection
@section('contents')
<div class="flex flex-col w-full px-4 mt-20 mb-20 md:px-8 lg:mt-5">
  <div class="flex bg-white rounded-xl shadow-md overflow-hidden w-full max-w-full mx-auto">

  <div class="flex-[0_0_240px] bg-gradient-to-b from-[#EBF2FA] via-[#E7F1F9] to-[#F2F8FE] border-r shadow-md rounded-l-xl overflow-hidden">
  <ul class="flex flex-col text-sm font-medium text-gray-700" id="tabs">
     <!--  Visit Arrangement  -->
    <li>
      <button
        class="flex items-center w-full px-6 py-4 space-x-3 border-l-4 border-transparent hover:bg-white/30 hover:border-blue-600 transition-all duration-300 active-tab"
        data-tab="tab-visitarg"
      >
        <svg class="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 110-16 8 8 0 010 16z" />
        </svg>
        <span>Visit Arrangement</span>
      </button>
    </li>

    <!--  Stakeholders  -->
    <li>
      <button
        class="flex items-center w-full px-6 py-4 space-x-3 border-l-4 border-transparent hover:bg-white/30 hover:border-blue-600 transition-all duration-300"
        data-tab="tab-stk"
      >
      <svg class="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="10" stroke-width="2"/>
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M12 10a2 2 0 100-4 2 2 0 000 4zm0 0c-2.21 0-4 1.343-4 3v1h8v-1c0-1.657-1.79-3-4-3z"/>
    </svg>
        <span>Stakeholders</span>
      </button>
    </li>

    <!-- Schedule -->
    <li>
      <button
        class="flex items-center w-full px-6 py-4 space-x-3 border-l-4 border-transparent hover:bg-white/30 hover:border-blue-600 transition-all duration-300"
        data-tab="tab-sch"
      >
      <svg class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 6v6l4 2m4-2a8 8 0 11-16 0 8 8 0 0116 0z" />
        </svg>
        <span>Schedule</span>
      </button>
    </li>

    <li>
      <button 
        class="flex items-center w-full px-6 py-4 space-x-3 border-l-4 border-transparent hover:bg-white/30 hover:border-blue-600 transition-all duration-300"
        data-tab="tab-req"
      >
    <!-- Clipboard icon -->

    
    <svg xmlns="http://www.w3.org/2000/svg" 
         class="h-5 w-5 text-blue-600 hover:text-blue-700 transition-colors duration-300 ease-in-out" 
         fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M9.75 17h4.5M21 16V5a2 2 0 00-2-2H5a2 2 0 00-2 2v11a2 2 0 002 2h14a2 2 0 002-2z" />
    </svg>
        <span>Required Items</span>
      </button>
    </li>

        <!-- Visitor Information -->
        <li>
      <button
        class="flex items-center w-full px-6 py-4 space-x-3 border-l-4 border-transparent hover:bg-white/30 hover:border-blue-600 transition-all duration-300"
        data-tab="tab-inf"
      >
      <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5 text-blue-600 hover:text-blue-700 transition-colors duration-300 ease-in-out"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M12 12a5 5 0 100-10 5 5 0 000 10z"
      />
    </svg>
        <span>Visitor Information</span>
      </button>
    </li>
        <!-- AMEC Employees Name (Join Lunch/Dinner)-->
<li>
  <button 
    class="flex items-center w-full px-6 py-4 space-x-3 border-l-4 border-transparent hover:bg-white/30 hover:border-blue-600 transition-all duration-300"
    data-tab="tab-meal"
  >
  <svg xmlns="http://www.w3.org/2000/svg"
     class="h-5 w-5 text-blue-600 hover:text-blue-700 transition-colors duration-300 ease-in-out"
     viewBox="0 0 64 64"
     fill="currentColor">
  <!-- จาน -->
  <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="3" fill="none"/>

  <!-- ตะเกียบคู่ -->
  <rect x="18" y="18" width="3" height="28" rx="1" ry="1" />
  <rect x="26" y="18" width="3" height="28" rx="1" ry="1" />

  <!-- ช้อน -->
  <rect x="38" y="20" width="4" height="24" rx="1.5" ry="1.5" />
  <circle cx="40" cy="18" r="5" />
</svg>
    <span>AMEC (Lunch/Dinner)</span>
  </button>
</li>
   <!-- project -->
<li>
  <button 
    class="flex items-center w-full px-6 py-4 space-x-3 border-l-4 border-transparent hover:bg-white/30 hover:border-blue-600 transition-all duration-300"
    data-tab="tab-prj"
  >
    <svg xmlns="http://www.w3.org/2000/svg"
         class="h-5 w-5 text-blue-600 hover:text-blue-700 transition-colors duration-300 ease-in-out"
         viewBox="0 0 64 64"
         fill="currentColor">
      <!-- ไอคอนแฟ้มเอกสาร -->
      <path d="M10 16h20l6 6h18v26H10z" stroke="currentColor" stroke-width="3" fill="none" />
      <path d="M10 16v32" stroke="currentColor" stroke-width="3" />
      <path d="M36 22h12" stroke="currentColor" stroke-width="3" />
    </svg>
    <span>Projects</span>
  </button>
</li>
   <!--  Submit Form-->
   <li> 
  <button id="btn-submit-form"
    class="flex items-center w-full px-6 py-4 space-x-3 border-l-4 border-transparent hover:bg-white/30 hover:border-blue-600 transition-all duration-300"
    data-tab="tab-submit"
  >
    <!-- Full Envelope Icon ขนาดเล็ก -->
    <svg xmlns="http://www.w3.org/2000/svg" 
         class="h-4 w-4 text-blue-600 hover:text-blue-700 transition-colors duration-300 ease-in-out"
         fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <!-- Envelope outline -->
      <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
      <!-- Envelope flap -->
      <polyline points="2,4 12,13 22,4" />
    </svg>

    <span>Submit Form</span>
  </button>
</li>





  </ul>
</div>

<!-- Content ขวา -->
<div class="flex-1 w-full min-w-0 bg-gradient-to-b from-[#EBF2FA] via-[#E7F1F9] to-[#F2F8FE] p-6 lg:p-10 rounded-r-xl overflow-hidden" id="tab-content">
<input type="hidden" id="nfrmno" name="nfrmno" value="{{ $NFRMNO }}" />
<input type="hidden" id="vorgno" name="vorgno" value="{{ $VORGNO }}" />
<input type="hidden" id="cyear" name="cyear" value="{{ $CYEAR }}" />
<input type="hidden" id="empno" name="empno" value="{{ $empno }}" />
<input type="hidden" id="cyear2" name="cyear2" value="{{ $mode == 2 ? $CYEAR2 : '' }}"/>
<input type="hidden" id="nrunno" name="nrunno" value="{{ $mode == 2 ? $NRUNNO : '' }}"/>
<input type="hidden" id="mode" name="mode" value="{{ $mode }}" />

<!-- tab-visit arrangment -->
<form id="form-visitarg"  method="post" enctype="multipart/form-data">
<div id="tab-visitarg" class="tab-pane w-full max-w-7xl mx-auto ">
  <h2 class="text-2xl font-bold text-blue-900 mb-2">Visit Arrangement</h2>
  <p class="text-sm text-gray-600 mb-6">Please provide complete information to ensure smooth and efficient visit arrangements.</p>

  <!-- Form & Document -->
<section class="mb-12">
  <h3 class="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2 mb-3">Form & Documents</h3>

  <!-- Grid 2 คอลัมน์ -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">

    <!-- Form Version -->
    <div>
      <label for="formVersion" class="block text-sm text-gray-700 font-medium mb-1">Form Version</label>
      <div class="flex items-center gap-2">
        <input
          type="text"
          id="formVersion"
          name="formVersion"
          maxlength="10"
          value="{{ $mode == 2 && !empty($visit) ? $visit[0]->FORMVER : $formversion }}"
          readonly
          class="input input-bordered rounded-xl w-72 shadow-sm border-blue-200 text-gray-900"
        />
        <button type="button" id="updateBtn" class="btn btn-sm btn-primary">Update</button>
      </div>
    </div>

    <!-- Form C1-1 -->
    <div>
      <label for="formC1" class="block text-sm text-gray-700 font-medium mb-1">Form C1-1</label>
      <select
        id="formC1"
        name="formC1"
        class="input input-bordered rounded-xl w-72  shadow-sm border-blue-200 text-gray-900"
      >
        <option value=""></option>
        <option value="Y" {{ ($mode == "2" && !empty($visit) && $visit[0]->FORMC1_1 == "Y") ? 'selected' : '' }} >Yes</option>
        <option value="N" {{ ($mode == "2" && !empty($visit) && $visit[0]->FORMC1_1 == "N") ? 'selected' : '' }} >No</option>
      </select>
    </div>

    <!-- Sale company -->
    <div>
      <label for="salecom" class="block text-sm text-gray-700 font-medium mb-1">Sale company<span class="text-red-500">*</span></label>
      <select
        id="salecom"
        name="salecom"
        class="input input-bordered rounded-xl w-[40px]  shadow-sm border-blue-200 text-gray-900"
        placeholder="Select Sale company"
      >
        <option value=""></option>
        @foreach($salecom as $sc)
          <option value="{{ $sc->ABBREVIATION }}" {{ ($mode == "2" && !empty($visit) && $visit[0]->SALECOM == $sc->ABBREVIATION) ? 'selected' : '' }}>
            {{ $sc->ABBREVIATION }}
          </option>
        @endforeach
      </select>
    </div>

    @if ($mode <> 1)
    <div>
      <label for="formVersion" class="block text-sm text-gray-700 font-medium mb-1">Ref. No.</label>
      {{ ($mode == "2" && !empty($visit))? "MAR-".$visit[0]->CYEAR2.str_pad($visit[0]->REFNO, 3, "0", STR_PAD_LEFT).'-'.$visit[0]->SALECOM:'' }}
    </div>
    @endif

  </div>
</section>

<section class="mb-12">
  <h3 class="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2 mb-3">Visit Details</h3>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
    <!-- ส่วนอื่นๆ ที่เป็น grid 2 คอลัมน์ เช่น Visit Date, Reception Room, Purpose of Visit, Detail -->

    <div>
      <label for="visitDate" class="block text-sm text-gray-700 font-medium mb-1">Visit Date</label>
      <input type="text" name="visitDate" id="visitDate" placeholder="yyyy-mm-dd" value="{{ ($mode == '2' && !empty($visit) && isset($visit[0]->VISITDATE) && trim($visit[0]->VISITDATE) !== '') 
    ? date('Y-m-d', strtotime($visit[0]->VISITDATE)) 
    : '' }}" class="datesel input input-bordered rounded-xl  w-72 shadow-sm border-blue-200 text-gray-900">
   
    </div>
    <div>
      <label for="visitTypes" class="block text-sm text-gray-700 font-medium mb-1">Visit Types</label>
      <select id="visitTypes" name="visitTypes" class="input input-bordered rounded-xl w-72 shadow-sm border-blue-200 text-gray-900">
        <option value="" ></option>
        @foreach($visittype as $vt)
                <option value="{{ $vt->VTID }}"  {{ ($mode == "2" && !empty($visit) && $visit[0]->VISITTYPE== $vt->VTID) ? 'selected' : '' }}   >{{ $vt->VTYPE}}</option>
        @endforeach
      </select>
    </div>
    <div>
      <label for="receptionRoom" class="block text-sm text-gray-700 font-medium mb-1">Reception Room</label>
      <select id="receptionRoom" name="receptionRoom" class="input input-bordered rounded-xl  w-72 shadow-sm border-blue-200 text-gray-900" placeholder="Select Reception Room">
        <option value=""></option>
        @foreach($room as $r)
            <option value="{{ $r->ROOMNAME }}"   {{ ($mode == "2" && !empty($visit) && $visit[0]->RECEPTROOM== $r->ROOMNAME) ? 'selected' : '' }}  >{{ $r->ROOMNAME}}</option>
        @endforeach
      </select>
    </div>
    <div>
      <label for="bookingTime" class="block text-sm text-gray-700 font-medium mb-1">Booking time</label>
      <select id="bookingTime" name="bookingTime" class="input input-bordered rounded-xl  w-72 shadow-sm border-blue-200 text-gray-900">
        <option value=""></option>
        <option value="FT" data-start="08:00 AM" data-end="17:10 PM" {{ ($mode == "2" && !empty($visit) && $visit[0]->BOOKING== "FT") ? 'selected' : '' }} >Full day</option>
        <option value="AM" data-start="08:00 AM" data-end="12:10 PM"  {{ ($mode == "2" && !empty($visit) && $visit[0]->BOOKING== "AM") ? 'selected' : '' }} >Half day (morning)</option>
        <option value="PM" data-start="13:00 PM" data-end="17:10 PM"  {{ ($mode == "2" && !empty($visit) && $visit[0]->BOOKING== "PM") ? 'selected' : '' }} >Half day (afternoon)</option>
      </select>
    </div>
    <div>
      <label for="purposevisit" class="block text-sm text-gray-700 font-medium mb-1">Purpose of Visit</label>
      <select id="purposevisit" name="purposevisit" class="input input-bordered rounded-xl  w-72  shadow-sm border-blue-200 text-gray-900">
        <option value=""></option>
        @foreach($purpose as $p)
                <option value="{{ $p->PVID }}"   {{ ($mode == "2" && !empty($visit) && $visit[0]->PURPOSE== $p->PVID) ? 'selected' : '' }}  >{{ $p->PURPOSE}}</option>
        @endforeach
        </select>
    </div>
    <div>
      <label for="detail" class="block text-sm text-gray-700 font-medium mb-1">Detail</label>
      <input type="text" id="detail" name="detail" value="{{ $mode == 2 && !empty($visit) ? $visit[0]->PURPOSEDETAIL : '' }}" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900" />
    </div>

    <div>
    <label for="guestDetai" class="block text-sm text-gray-700 font-medium mb-1">Details of Guest</label>
    <div class="flex items-center space-x-4">
    <label class="flex items-center space-x-2">
      <input type="radio" name="guestDetail" id="nonGov" value="1"  checked>
      <span>Non-Government</span>
    </label>

    <label class="flex items-center space-x-2 relative">
      <input type="radio" name="guestDetail" value="2" id="gov" {{ $mode == 2 && !empty($visit) && $visit[0]->COMTYPE == "2" ?  'checked': '' }}>
      <span>Government</span>

      <!-- Tooltip -->
      <div id="govTooltip" class="tooltip hidden">
        Please fill out the government guest form.
      </div>
    </label>
    </div>
    </div>
    <div>
      <label for="fileAttachment" class="block text-sm text-gray-700 font-medium mb-1">Attachment File</label>
      <input
        type="file"
        id="fileAttachment"
        name="fileAttachment[]"
        multiple
        class="w-full text-sm text-gray-500
               file:mr-4 file:py-2 file:px-4
               file:rounded-md file:border-0
               file:text-sm file:font-semibold
               file:bg-blue-50 file:text-blue-700
               hover:file:bg-blue-100
               focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div id="attachmentfileDisplay">
      @foreach($attgfile as $f)
        <!--span class="file-item">{{ substr($f->SFILE, 13) }}</!--span><br-->
        <div class="file-item"  data-id="{{$f->ITEMNO}}" data-filename="{{$f->SFILE}}" data-folder="{{ $NFRMNO.'_'.$VORGNO.'_'.$CYEAR.'_'.$CYEAR2.'_'.$NRUNNO}}">
              <a href="{{ base_url('marform/MAR-VMS/form/mdownload/').$NFRMNO.'_'.$VORGNO.'_'.$CYEAR.'_'.$CYEAR2.'_'.$NRUNNO.'/'.substr($f->SFILE,13).'/'.$f->SFILE}}" target="_blank" class="file-list"><i class="${iconClass}" style="margin-right: 4px;color: #007bff;"></i>{{ substr($f->SFILE, 13) }}</a>
              <i class="icofont-close-line-circled delete-file" style="color: red; font-size: 20px;  margin-left: 8px; vertical-align: middle; cursor: pointer;"></i>
            </div>
      @endforeach
    </div>
    </div>
    <div>
      <label for="guestType" class="block text-sm text-gray-700 font-medium mb-1">Guest Type</label>
      <select id="guestType" name="guestType" class="input input-bordered rounded-xl w-72 shadow-sm border-blue-200 text-gray-900">
        <option value="" ></option>
        @foreach($guesttype as $gt)
                <option value="{{ $gt->GT_ID }}"  {{ ($mode == "2" && !empty($visit) && $visit[0]->GUESTTYPE== $gt->GT_ID) ? 'selected' : '' }}    >{{ $gt->TYPE_NAME}}</option>
        @endforeach
      </select>
    </div>

    <!-- ... เพิ่มเติมข้อมูลอื่นใน grid นี้ได้ตามเดิม ... -->
  </div>

  <!-- แยก container นี้สำหรับ Shop tour กับ Specific textarea -->
  <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
    <div>
      <label for="shoptour" class="block text-sm text-gray-700 font-medium mb-1">Shop tour</label>
      <select id="shoptour" name="shoptour" class="input input-bordered rounded-xl w-72 shadow-sm border-blue-200 text-gray-900">
        <option value=""></option> 
        <option value="G" {{ ($mode == "2" && !empty($visit) && $visit[0]->SHOPTOUR== "G") ? 'selected' : '' }}>General</option>
        <option value="S" {{ ($mode == "2" && !empty($visit) && $visit[0]->SHOPTOUR== "S") ? 'selected' : '' }}>Specific</option>
      </select>
    </div>
    <div>
      <label for="specificAttachment" class="block text-sm text-gray-700 font-medium mb-1">Attachment Specific</label>
      <input
        type="file"
        id="specificAttachment"
        name="specificAttachment[]"
        multiple
        class="w-full text-sm text-gray-500
               file:mr-4 file:py-2 file:px-4
               file:rounded-md file:border-0
               file:text-sm file:font-semibold
               file:bg-blue-50 file:text-blue-700
               hover:file:bg-blue-100
               focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div id="attachmentDisplay">
      @foreach($attfile as $f)
        <!--span class="file-item">{{ substr($f->SFILE, 13) }}</!--span><br-->
        <div class="file-item"  data-id="{{$f->ITEMNO}}" data-filename="{{$f->SFILE}}" data-folder="{{ $NFRMNO.'_'.$VORGNO.'_'.$CYEAR.'_'.$CYEAR2.'_'.$NRUNNO}}">
              <a href="{{ base_url('marform/MAR-VMS/form/mdownload/').$NFRMNO.'_'.$VORGNO.'_'.$CYEAR.'_'.$CYEAR2.'_'.$NRUNNO.'/'.substr($f->SFILE,13).'/'.$f->SFILE}}" target="_blank" class="file-list"><i class="${iconClass}" style="margin-right: 4px;color: #007bff;"></i>{{ substr($f->SFILE, 13) }}</a>
              <i class="icofont-close-line-circled delete-file" style="color: red; font-size: 20px;  margin-left: 8px; vertical-align: middle; cursor: pointer;"></i>
            </div>
      @endforeach
    </div>
    </div>
  </div>

  <!-- ส่วนอื่นๆ ที่เหลือ -->

  <!--div class="mt-6 md:col-span-2">
      <label for="specific" class="block text-sm text-gray-700 font-medium mb-1">Specific</label>
      <textarea
  id="specific"
  name="specific"
  rows="3"
  class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900 p-3 resize-y"
  style="height: auto; min-height: 5em;"
></textarea>
    </!--div-->
  
</section>
  <!-- Modal -->
  <div id="modal" class="fixed inset-0 bg-gray-200 bg-opacity-40 hidden items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-lg p-6 w-96">
          <h3 class="text-lg font-semibold mb-4">Update Form Version</h3>
          <input type="text" id="newVersion" maxlength="10" placeholder="Enter new version" class="input input-bordered w-1/2 mb-4" />
          <div class="flex justify-end gap-2">
              <button id="cancelBtn" class="btn btn-sm btn-secondary">Cancel</button>
              <button id="saveBtn" class="btn btn-sm btn-primary">Save</button>
          </div>
      </div>
  </div>
<!-- Section: Travel & Accommodation -->
<section class="mb-12">
<h3 class="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2 mb-3">Travel &amp; Accommodation</h3>
<div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <!-- Hotel Reservation -->
          <div>
          <label for="hotelReservation" class="block text-sm text-gray-700 font-medium mb-1">Hotel Reservation</label>
          <input
            type="text"
            id="hotelReservation"
            name="hotelReservation"
            value="{{ $mode == 2 && !empty($visit) ? $visit[0]->HOTELNAME:'' }}"
            placeholder="Enter hotel reservation details"
            class="input input-bordered rounded-xl w-72 shadow-sm border-blue-200 text-gray-900"
          />
        </div>
         <!-- Car Reservation Hotel -->
        <div>
          <label for="carHotel" class="block text-sm text-gray-700 font-medium mb-1">Car Reservation Hotel</label>
          <select
            id="carHotel"
            name="carHotel"
            class="input input-bordered rounded-xl w-72 shadow-sm border-blue-200 text-gray-900"
          >
            <option value="" ></option>
            <option value="Y" {{ ($mode == "2" && !empty($visit) && $visit[0]->CARHOTEL== "Y") ? 'selected' : '' }}>Yes</option>
            <option value="N" {{ ($mode == "2" && !empty($visit) && $visit[0]->CARHOTEL== "N") ? 'selected' : '' }}>No</option>
          </select>
        </div>
        <div class="md:col-span-2">
    <label for="carHotelNote" class="block text-sm text-gray-700 font-medium mb-1">
      Additional Notes (Car Reservation Hotel)
    </label>
    <textarea
  id="carHotelNote"
  name="carHotelNote"
  rows="3"
  class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900 p-3 resize-y"
  style="height: auto; min-height: 5em;"
>
{{ $mode == 2 && !empty($visit) ? $visit[0]->CARHOTELNOTE:'' }}
</textarea>
  </div>

</div>
</section>
   <!-- Section: Meal Arrangement -->
<section class="mb-12">
<h3 class="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2 mb-3">Meal Arrangement</h3>
<div >

      <!-- Lunch -->
<div class="mb-8">
  <label class="inline-flex items-center cursor-pointer mb-3 select-none">
    <input type="hidden" name="hasLunch" value="N">
    <input type="checkbox" id="hasLunch" name="hasLunch" class="w-6 h-6 rounded-lg checkbox checkbox-primary shadow-sm border-blue-200" value="Y" {{ ($mode == "2" && !empty($visit) && $visit[0]->LUNCH== "Y") ? 'checked' : '' }} />
    <span class="text-sm text-gray-700 font-semibold select-text ml-2">Do you require Lunch arrangement?</span>
  </label>

  <div id="lunchDetails" class="grid grid-cols-1 md:grid-cols-2 gap-6 {{ ($mode == "2" && !empty($visit) && $visit[0]->LUNCH== "Y") ? '' : 'hidden' }}">
    <input type="hidden" id="lunchPlace" name="lunchPlace" />
    <!-- Lunch Location -->
    <div>
      <label class="block text-sm text-gray-700 font-medium mb-1">Lunch Location</label>
      <select name="lunch" id="lunch" class="lunchSelect input input-bordered rounded-xl w-72 shadow-sm border-blue-200 text-gray-900">
        <option value=""></option>
        <option value="I" {{ ($mode == "2" && !empty($visit) && $visit[0]->LUNCH_LOC== "I") ? 'selected' : '' }}>Inside</option>
        <option value="O" {{ ($mode == "2" && !empty($visit) && $visit[0]->LUNCH_LOC== "O") ? 'selected' : '' }}>Outside</option>
      </select>
    </div>

    <!-- Inside: Select -->
    <div id="lunchPlaceSelectDiv" class="{{ ($mode == "2" && !empty($visit) && $visit[0]->LUNCH_LOC== "I") ? '' : 'hidden' }}">
      <label class="block text-sm text-gray-700 font-medium mb-1">Place (Inside)</label>
      <select id="lunchPlaceSelect" name="lunchPlaceSelect" class="input input-bordered rounded-xl w-72 shadow-sm border-blue-200 text-gray-900" placeholder="Select Place">
        <option value=""></option>
        @foreach($room as $r)
          <option value="{{ $r->ROOMNAME }}" {{ ($mode == "2" && !empty($visit) && $visit[0]->LUNCH_PLACE == $r->ROOMNAME) ? 'selected' : '' }}>{{ $r->ROOMNAME}}</option>
        @endforeach
      </select>
    </div>

    <!-- Outside: Input -->
    <div id="lunchPlaceInputDiv" class="{{ ($mode == "2" && !empty($visit) && $visit[0]->LUNCH_LOC== "O") ? '' : 'hidden' }}">
      <label class="block text-sm text-gray-700 font-medium mb-1">Place (Outside)</label>
      <input type="text" name="lunchPlaceInput" id="lunchPlaceInput" value="{{ ($mode == '2' && !empty($visit)) ? $visit[0]->LUNCH_PLACE : '' }}" placeholder="e.g. Chonburi/Green grass Amata City Chonburi" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900" />
    </div>

  </div>
</div>

      <!-- Dinner -->
      <div>
        <label class="inline-flex items-center cursor-pointer mb-3 select-none">
        <input type="hidden" name="hasDinner" value="N">
          <input type="checkbox" id="hasDinner" name="hasDinner" class="w-6 h-6 rounded-lg checkbox checkbox-primary shadow-sm border-blue-200" value="Y" {{ ($mode == "2" && !empty($visit) && $visit[0]->DINNER== "Y") ? 'checked' : '' }}  />

          <span class="text-sm text-gray-700 font-semibold select-text ml-2">Do you require Dinner arrangement?</span>
        </label>

        <div id="dinnerDetails" class="{{ ($mode == "2" && !empty($visit) && $visit[0]->DINNER== "Y") ? '' : 'hidden' }}" >
          <label class="block text-sm text-gray-700 font-medium mb-1">Place</label>
          <input name="dinnerPlace" id="dinnerPlace"
            type="text"
            value="{{ $mode == 2 && !empty($visit) ? $visit[0]->DINNER_PLACE:'' }}"
            placeholder="e.g. Chonburi/Green grass Amata City Chonburi"
            class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900"
          />
        </div>
      </div>
    </div>
</section>

<!-- ปุ่ม Save -->
<div class="flex justify-end mt-6">
  <button  type="button" data-tab="visitarg"
    class="save-btn bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-xl text-sm font-semibold
           shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300">
    Save
  </button>
</div>
</div>
</form>
  <!-- tab-sch -->
  <form id="form-sch"  method="post" enctype="multipart/form-data">
  <div id="tab-sch" class="tab-pane hidden w-full max-w-7xl mx-auto">
  <h2 class="text-2xl font-bold text-blue-900 mb-2">Schedule</h2>
  <p class="text-sm text-gray-600 mb-6">Please fill in the schedule of activities during the visit.</p>
  <div>
    <table id="tablesch" class="min-w-[1800px] text-sm text-gray-800 w-full">
<thead class="text-blue-800 sticky top-0 z-10 shadow-sm">
  <tr class="bg-gradient-to-r from-blue-100 via-blue-100 to-blue-100 text-sm">
    <th class="px-4 py-3 text-left w-32 sticky-column bg-gradient-to-r from-blue-100 via-blue-100 to-blue-100">Time Start</th>
    <th class="px-4 py-3 text-left w-32 sticky-column bg-gradient-to-r from-blue-100 via-blue-100 to-blue-100">Time End</th>
    <th class="px-4 py-3 text-left w-36">Duration (Min)</th>
    <th class="px-4 py-3 text-left w-96">Place</th>
    <th class="px-4 py-3 text-left w-100">Content</th>
    <th class="px-4 py-3 text-left w-96">AMEC Participants</th>
    <th class="px-4 py-3 text-left w-96">Note</th>
    <th class="px-4 py-3 text-left w-52">Activity</th>
  </tr>
</thead>
<tbody class="divide-y divide-cyan-200">
@foreach($sch as $s)
  <tr class="bg-white">
      <td class="px-2 py-2 w-32 sticky-column">
        <input name="starttime[]" type="time" value="{{  date('H:i', strtotime($s->SCHSTIME_FORMAT))}}"
          class="w-full rounded-lg border border-blue-200 px-3 py-2 shadow-sm" />
      </td>
      <td class="px-2 py-2 w-32 sticky-column">
        <input name="endtime[]" type="time"  value="{{  date('H:i', strtotime($s->SCHETIME_FORMAT))}}"
          class="w-full rounded-lg border border-blue-200 px-3 py-2 shadow-sm" />
      </td>
      <td class="px-2 py-2 w-28 difmin">
        <input name="diffmin[]" type="text"  value="{{(strtotime($s->SCHETIME_FORMAT) - strtotime($s->SCHSTIME_FORMAT)) / 60 }}"
          class="w-full rounded-lg border border-blue-200 px-3 py-2 shadow-sm" readonly />
        <!--input name="duration" type="text" placeholder="e.g. 60"
          class="w-full rounded-lg border border-blue-200 px-3 py-2 shadow-sm" /-->
      </td>

      <!-- เพิ่มความกว้างให้ Place -->
      <td class="px-2 py-2  w-100">
        <input name="place[]" type="text" value="{{ $s->PLACE }}"
          class="w-full rounded-lg border border-blue-200 px-3 py-2 shadow-sm" />
      </td>

      <!-- Content ยาวขึ้น -->
      <td class="px-2 py-2 w-108">
        <input name="content[]" type="text" value="{{ $s->CONTENT }}"
          class="w-full rounded-lg border border-blue-200 px-3 py-2 shadow-sm" />
      </td>

      <!-- Participants -->
      <td class="px-2 py-2  w-100">
        <input name="participants[]" type="text" value="{{ $s->AMECP }}"
          class="w-full rounded-lg border border-blue-200 px-3 py-2 shadow-sm" />
      <!--select class="participants-select" multiple style="width: 300px;">
        
              @foreach($participants as $p)
              <option value="{{ $p->SEMPNO }}" data-div="{{ $p->SDIV }}" data-dep="{{ $p->SDEPT }}" data-sec="{{ $p->SSEC }}" data-pos="{{ $p->SPOSNAME }}"  >{{ $p->SNAME}}</option>
              @endforeach
      </!--select-->
      </td>
      <!-- Note -->
      <td class="px-2 py-2  w-100">
        <input name="note[]" type="text" value="{{ $s->NOTE }}"
          class="w-full rounded-lg border border-blue-200 px-3 py-2 shadow-sm" />
      </td>

      <!-- Activity -->
      <td class="px-2 py-2 w-60">
        <select name="activity[]"
          class="w-full rounded-lg border border-blue-200 px-3 py-2 shadow-sm">
          @foreach($activity as $a)
          <option value="{{ $a->AID}}" {{ ($a->AID == $s->AID)? "selected":"" }} >{{ $a->ACTIVITY }}</option>
          @endforeach
        </select>
      </td>
    </tr>
@endforeach   
@if(empty($sch))
  <tr class="bg-white">
    <td class="px-2 py-2 w-32 sticky-column">
      <input name="starttime[]" type="time"
        class="w-full rounded-lg border border-blue-200 px-3 py-2 shadow-sm" />
    </td>
    <td class="px-2 py-2 w-32 sticky-column">
      <input name="endtime[]" type="time"
        class="w-full rounded-lg border border-blue-200 px-3 py-2 shadow-sm" />
    </td>
    <td class="px-2 py-2 w-28">
      <!--input name="duration" type="text" placeholder="e.g. 60"
        class="w-full rounded-lg border border-blue-200 px-3 py-2 shadow-sm" /-->
        <input name="diffmin[]" type="text"  value=""
          class="w-full rounded-lg border border-blue-200 px-3 py-2 shadow-sm" readonly />
    </td>

    <!-- เพิ่มความกว้างให้ Place -->
    <td class="px-2 py-2  w-100">
      <input name="place[]" type="text"
        class="w-full rounded-lg border border-blue-200 px-3 py-2 shadow-sm" />
    </td>

    <!-- Content ยาวขึ้น -->
    <td class="px-2 py-2 w-108">
      <input name="content[]" type="text"
        class="w-full rounded-lg border border-blue-200 px-3 py-2 shadow-sm" />
    </td>

    <!-- Participants -->
    <td class="px-2 py-2  w-100">
       <input name="participants[]" type="text"
        class="w-full rounded-lg border border-blue-200 px-3 py-2 shadow-sm" />
    <!--select class="participants-select" multiple style="width: 300px;">
      
            @foreach($participants as $p)
            <option value="{{ $p->SEMPNO }}" data-div="{{ $p->SDIV }}" data-dep="{{ $p->SDEPT }}" data-sec="{{ $p->SSEC }}" data-pos="{{ $p->SPOSNAME }}"  >{{ $p->SNAME}}</option>
            @endforeach
     </!--select-->
    </td>
    <!-- Note -->
    <td class="px-2 py-2  w-100">
      <input name="note[]" type="text"
        class="w-full rounded-lg border border-blue-200 px-3 py-2 shadow-sm" />
    </td>

    <!-- Activity -->
    <td class="px-2 py-2 w-60">
      <select name="activity[]"
        class="w-full rounded-lg border border-blue-200 px-3 py-2 shadow-sm">
        @foreach($activity as $a)
         <option value="{{ $a->AID}}">{{ $a->ACTIVITY }}</option>
        @endforeach
      </select>
    </td>
  </tr>
@endif
</tbody>
    </table>
    <!-- ปุ่ม Add Row อยู่มุมล่างซ้าย -->
<div class="flex justify-start">
  <button id="addRowBtn" type="button"
    class="bg-blue-100 text-blue-600 hover:bg-blue-200 border border-blue-300 rounded-md p-1 text-sm font-semibold shadow focus:outline-none transition-colors"
    title="Add Row">
    Add
  </button>
</div>
  </div>
<!-- ปุ่ม Save -->
<div class="flex justify-end mt-6">
  <button  type="button" data-tab="sch"
    class="save-btn bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-xl text-sm font-semibold
           shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300">
    Save
  </button>
</div>
</div>
</form>
<!-- Tab3: Visitor Details -->

<form id="form-inf"  method="post" enctype="multipart/form-data">
<div id="tab-inf" class="tab-pane hidden w-full max-w-7xl mx-auto">
  <h2 class="text-2xl font-bold text-blue-900 mb-2">Visitor Information</h2>
  <p class="text-sm text-gray-600 mb-6">Please fill in the visitor information.</p>
  <div >
  <label for="visitor_file" class="block text-sm font-semibold text-gray-700 mb-2">
    Upload Excel File
  </label>
  <input type="file" id="visitor_file" name="visitor_file"
    accept=".xlsx"
    class="hidden" />
  
  <label for="visitor_file"
    class="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg shadow cursor-pointer hover:bg-blue-600">
    Browse Excel
  </label>
  <p class="mt-1 text-xs text-gray-500">Supported format: .xlsx</p>
</div>
  <div>
    <table id="tablevisitor" class="table min-w-[1800px] text-sm text-gray-800 w-full">
      <thead class="text-blue-800 sticky top-0 z-10 shadow-sm">
        <tr class="bg-gradient-to-r from-blue-100 via-blue-100 to-blue-100 text-sm">
          <th class="text-left w-20 sticky-column bg-gradient-to-r from-blue-100 via-blue-100 to-blue-100">No.</th>
          <th class="text-left w-40">Country</th>
          <th class="text-left w-60">Company</th>
          <th class="text-left w-72">Name (Title Selection: Mr./Ms./Mrs.)</th>
          <th class="text-left w-60">Position</th>
          <th class="text-left w-60">Previous Visit Experience</th>
          <th class="text-left w-40 {{ ($mode == '2' && !empty($visit) && $visit[0]->LUNCH == 'N') ? 'hidden' : '' }}">Lunch Provided</th>
          <th class="text-left w-40 {{ ($mode == '2' && !empty($visit) && $visit[0]->DINNER == 'N') ? 'hidden' : '' }}">Dinner Provided</th>
          <th class="text-left w-40 {{ ($mode == '2' && !empty($visit) && ($visit[0]->LUNCH == 'N') && ($visit[0]->DINNER == 'N')) ? 'hidden' : '' }}">Dietary Requirements</th>
          
        </tr>
      </thead>
      <tbody class="divide-y divide-blue-100">
        @foreach($visitinf as $index => $v)
        <tr class="bg-white">
            <td class="sticky-column">{{ $index+1 }}</td>
            <td><input type="text" name="country[]" value="{{ $v->COUNTRY }}" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900  py-1 px-2 keep-value"  /></td>
            <td><input type="text" name="company[]" value="{{ $v->COMPANY }}" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900  py-1 px-2 keep-value" /></td>
            <td><input type="text" name="name[]" value="{{ $v->NAME }}" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900 py-1 px-2" placeholder="e.g. Mr. John Smith" /></td>
            <td><input type="text" name="pos[]" value="{{ $v->POSITION }}" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900 py-1 px-2" /></td>
            <td>
            <select name="exp[]" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900">
                <option value=""></option>
                <option value="Y" {{ ($v->VISITEXP == "Y")? "selected":"" }}>Yes</option>
                <option value="N" {{ ($v->VISITEXP == "N")? "selected":"" }}>No</option>
              </select>
            </td>
            <td  class="{{ ($mode == "2" && !empty($visit) && $visit[0]->LUNCH == "N") ? 'hidden' : '' }}" >
              <select name="lunch_provided[]" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900">
                <option value=""></option>
                <option value="Y" {{ ($v->LUNCH == "Y")? "selected":"" }} >Yes</option>
                <option value="N" {{ ($v->LUNCH == "N")? "selected":"" }} >No</option>
              </select>
            </td>
            <td  class="{{ ($mode == "2" && !empty($visit) && $visit[0]->DINNER == "N") ? 'hidden' : '' }}">
              <select name="dinner_provided[]" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900">
                <option value=""></option>
                <option value="Y" {{ ($v->DINNER == "Y")? "selected":"" }}>Yes</option>
                <option value="N" {{ ($v->DINNER == "N")? "selected":"" }}>No</option>
              </select>
            </td>
            <td  class="{{ ($mode == "2" && !empty($visit) && ($visit[0]->LUNCH == "N") && ($visit[0]->DINNER == "N")) ? 'hidden' : '' }}">
              <select id="dietary_require" name="dietary_require[]" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900 dietary_require" placeholder = "Select Dietary Requirements">
                <option value=""></option>
                @foreach($dietary as $index => $d)
                <option value="{{ $d->DIETARY }}" {{ ($d->DIETARY == $v->DIETREQ)? "selected":"" }}  >{{ $d->DIETARY }}</option>
                @endforeach
              </select>
            </td>
          </tr>
        @endforeach
        @if(empty($visitinf))
          <tr class="bg-white">
            <td class="sticky-column">1</td>
            <td><input type="text" name="country[]" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900 py-1 px-2 keep-value" /></td>
            <td><input type="text" name="company[]" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900 py-1 px-2 keep-value" /></td>
            <td><input type="text" name="name[]" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900 py-1 px-2" placeholder="e.g. Mr. John Smith" /></td>
            <td><input type="text" name="pos[]" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900 py-1 px-2" /></td>
            <td>
            <select name="exp[]" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900">
                <option value=""></option>
                <option value="Y">Yes</option>
                <option value="N">No</option>
              </select>
            </td>
            <td class="{{ ($mode == '2' && !empty($visit) && $visit[0]->LUNCH == 'N') ? 'hidden' : '' }}"  >
              <select name="lunch_provided[]" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900">
                <option value=""></option>
                <option value="Y">Yes</option>
                <option value="N">No</option>
              </select>
            </td>
            <td class="{{ ($mode == '2' && !empty($visit) && $visit[0]->DINNER == 'N') ? 'hidden' : '' }}">
              <select name="dinner_provided[]" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900">
                <option value=""></option>
                <option value="Y">Yes</option>
                <option value="N">No</option>
              </select>
            </td>
            <td class="{{ ($mode == '2' && !empty($visit) && ($visit[0]->LUNCH == 'N') && ($visit[0]->DINNER == 'N')) ? 'hidden' : '' }}">
              <select id="dietary_require" name="dietary_require[]" class="w-full border border-blue-200 rounded-lg px-2 py-1 dietary_require" placeholder = "Select Dietary Requirements">
                <option value=""></option>
                @foreach($dietary as $index => $d)
                <option value="{{ $d->DIETARY }}">{{ $d->DIETARY }}</option>
                @endforeach
              </select>
            </td>
          </tr>
        @endif
      </tbody>
    </table>

<!-- ปุ่ม Add Row อยู่มุมล่างซ้าย -->
<div class="flex justify-start">
  <button id="addVisitorBtn" type="button"
    class="bg-blue-100 text-blue-600 hover:bg-blue-200 border border-blue-300 rounded-md p-1 text-sm font-semibold shadow focus:outline-none transition-colors"
    title="Add Row">
    Add
  </button>
</div>
</div>
<!-- ปุ่ม Save -->
<div class="flex justify-end mt-6">
  <button  type="button" data-tab="inf"
    class="save-btn bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-xl text-sm font-semibold
           shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300">
    Save
  </button>
</div>
 
</div>
</form>
<form id="form-meal"  method="post" enctype="multipart/form-data">
<!-- Tab4: AMEC Employees Name (Join Lunch/Dinner) -->
<div id="tab-meal" class="tab-pane hidden w-full max-w-7xl mx-auto">
  <h2 class="text-2xl font-bold text-blue-900 mb-2">AMEC Employees Name (Join Lunch/Dinner)</h2>
  <p class="text-sm text-gray-600 mb-6">Please fill in the Employee information.</p>
  <div>
    <table id="tableemp" class="min-w-[1200px] text-sm text-gray-800 w-full">
      <thead class="text-blue-800 sticky top-0 z-10 shadow-sm">
        <tr class="bg-gradient-to-r from-blue-100 via-blue-100 to-blue-100 text-sm">
          <th class="px-4 py-3 text-left w-5 sticky-column bg-gradient-to-r from-blue-100 via-blue-100 to-blue-100">No.</th>
          <th class="px-4 py-3 text-left w-20">Name</th>
          <th class="px-4 py-3 text-left w-20">Position</th>
          <th class="px-4 py-3 text-left w-20 {{ ($mode == '2' && !empty($visit) && $visit[0]->LUNCH == 'N') ? 'hidden' : '' }}">Lunch Provided</th>
          <th class="px-4 py-3 text-left w-20 {{ ($mode == '2' && !empty($visit) && $visit[0]->DINNER == 'N') ? 'hidden' : '' }}">Dinner Provided</th>
          <th class="px-4 py-3 text-left w-20 {{ ($mode == '2' && !empty($visit) && $visit[0]->LUNCH == 'N' && $visit[0]->DINNER == 'N') ? 'hidden' : '' }}">Dietary Requirements</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-blue-100">
      @foreach($amecmeal as $index => $m)
        <tr class="bg-white">
          <td class="px-2 py-2 sticky-column">{{ $index+1 }}</td>
          <td class="px-2 py-2" style="width:160px;">
            <select name="employee[]" class="emp-select w-full"  style="width:100%" placeholder= 'Select Name' >
             <option value=""></option>
                @foreach($participants as $p)
                <option value="{{ $p->SEMPNO }}" data-div="{{ $p->SDIV }}" data-dep="{{ $p->SDEPT }}" data-sec="{{ $p->SSEC }}" data-pos="{{ $p->SPOSNAME }}"  {{ ($p->SEMPNO == $m->SEMPNO)? "selected":"" }} >{{ $p->SNAME}}</option>
                @endforeach
            </select>
          </td>
          <td class="px-2 py-2 pos-col"></td>
          <td class="px-2 py-2 {{ ($mode == '2' && !empty($visit) && $visit[0]->LUNCH == 'N') ? 'hidden' : '' }}">
            <select name="lunch_provided[]" class="w-full border border-blue-200 rounded-lg px-2 py-1">
              <option value=""></option>
              <option value="Y" {{ ($m->LUNCH == "Y")? "selected":"" }}>Yes</option>
              <option value="N" {{ ($m->LUNCH == "N")? "selected":"" }}>No</option>
            </select>
          </td>
          <td class="px-2 py-2 {{ ($mode == '2' && !empty($visit) && $visit[0]->DINNER == 'N') ? 'hidden' : '' }}">
            <select name="dinner_provided[]" class="w-full border border-blue-200 rounded-lg px-2 py-1">
              <option value=""></option>
              <option value="Y" {{ ($m->DINNER == "Y")? "selected":"" }}>Yes</option>
              <option value="N" {{ ($m->DINNER == "N")? "selected":"" }}>No</option>
            </select>
          </td>
          <td class="px-2 py-2 {{ ($mode == '2' && !empty($visit) && $visit[0]->LUNCH == 'N' && $visit[0]->DINNER == 'N') ? 'hidden' : '' }}">
            <select name="amecdietary_require[]" class="w-full border border-blue-200 rounded-lg px-2 py-1 dietary_require"   placeholder= 'Select Dietary Requirements'>
              <option value=""></option>
              @foreach($dietary as $index => $d)
                <option value="{{ $d->DIETARY }}"  {{ ($m->DIETREQ == $d->DIETARY)? "selected":"" }}>{{ $d->DIETARY }}</option>
              @endforeach
            </select>
          </td>
        </tr>
        @endforeach
        @if(empty($amecmeal))
        <tr class="bg-white">
          <td class="px-2 py-2 sticky-column">1</td>
          <td class="px-2 py-2" style="width:160px;">
            <select name="employee[]" class="emp-select w-full"  style="width:100%" placeholder= 'Select Name' >
             <option value=""></option>
                @foreach($participants as $p)
                <option value="{{ $p->SEMPNO }}" data-div="{{ $p->SDIV }}" data-dep="{{ $p->SDEPT }}" data-sec="{{ $p->SSEC }}" data-pos="{{ $p->SPOSNAME }}"  >{{ $p->SNAME}}</option>
                @endforeach
            </select>
          </td>
          <td class="px-2 py-2 pos-col"></td>
          <td class="px-2 py-2 ">
            <select name="lunch_provided[]" class="w-full border border-blue-200 rounded-lg px-2 py-1">
              <option value=""></option>
              <option value="Y" selected>Yes</option>
              <option value="N">No</option>
            </select>
          </td>
          <td class="px-2 py-2">
            <select name="dinner_provided[]" class="w-full border border-blue-200 rounded-lg px-2 py-1">
              <option value=""></option>
              <option value="Y" selected>Yes</option>
              <option value="N">No</option>
            </select>
          </td>
          <td class="px-2 py-2">
            <select name="amecdietary_require[]" class="w-full border border-blue-200 rounded-lg px-2 py-1 dietary_require"   placeholder= 'Select Dietary Requirements'>
              <option value=""></option>
              @foreach($dietary as $index => $d)
                <option value="{{ $d->DIETARY }}">{{ $d->DIETARY }}</option>
              @endforeach
            </select>
          </td>
        </tr>
        @endif
      </tbody>
    </table>
<!-- ปุ่ม Add -->
<div class="flex justify-start">
  <button id="addEmpBtn" type="button"
    class="bg-blue-100 text-blue-600 hover:bg-blue-200 border border-blue-300 rounded-md p-1 text-sm font-semibold shadow focus:outline-none transition-colors">
    Add
  </button>
</div>
</div>
<!-- ปุ่ม Save -->
<div class="flex justify-end mt-6">
  <button  type="button" data-tab="meal"
    class="save-btn  bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-xl text-sm font-semibold
           shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300">
    Save
  </button>

  </div>
</div>
</form>

<!-- Tab5: Projects -->
<form id="form-prj"  method="post" enctype="multipart/form-data">
<div id="tab-prj" class="tab-pane hidden w-full max-w-7xl mx-auto">
  <h2 class="text-2xl font-bold text-blue-900 mb-2">Projects</h2>
  <p class="text-sm text-gray-600 mb-6">Manage Secured and Prospective Projects below.</p>

  <!-- Secured Projects Table -->
<section class="mb-12">
  <h3 class="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2 mb-3">Secured Projects</h3>
  <table id="tablesec" class="min-w-[1200px] text-sm text-gray-800 w-full">
    <thead class="text-blue-800 sticky top-0 z-10 shadow-sm">
      <tr class="bg-gradient-to-r from-blue-100 via-blue-100 to-blue-100 text-sm">
        <th class="px-4 py-3 text-left w-28 sticky-column bg-gradient-to-r from-blue-100 via-blue-100 to-blue-100">No.</th>
        <th class="px-4 py-3 text-left w-48">Project No.</th>
        <th class="px-4 py-3 text-left w-72">Project Name</th>
        <th class="px-4 py-3 text-left w-96">Model</th>
        <th class="px-4 py-3 text-left w-96">Basic Specification</th>
        <th class="px-4 py-3 text-left w-40">No. of Units</th>
        <th class="px-4 py-3 text-left w-48">Current Status</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-blue-100">

    @if(empty($sproj))
      <tr class="bg-white main-row" data-rowid="1">
        <td class="px-2 py-2 sticky-column">1</td>
        <td class="px-2 py-2">
          <input type="text" name="secured_project_no[]" 
                 class="w-full border border-blue-200 rounded-lg px-2 py-1 sproj"
                 placeholder="Enter Project No." />
        </td>
        <td class="px-2 py-2 text-gray-600"></td>
        <td class="px-2 py-2 text-gray-600"></td>
        <td class="px-2 py-2 text-gray-600"></td>
        <td class="px-2 py-2 text-gray-600"></td>
        <td class="px-2 py-2 text-gray-600"></td>
      </tr>
    @endif
    </tbody>
  </table>
  <!-- ปุ่ม Add มุมซ้าย -->
  <div class="flex justify-start">
    <button id="addSecBtn" type="button"
      class="bg-blue-100 text-blue-600 hover:bg-blue-200 border border-blue-300 rounded-md p-1 text-sm font-semibold shadow focus:outline-none transition-colors">
      Add
    </button>
  </div>
</section>

<!-- Prospective Projects Table -->
<section>
  <h3 class="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2 mb-3">Prospective Projects</h3>
  <table id="tablepro" class="min-w-[1200px] text-sm text-gray-800 w-full">
    <thead class="text-blue-800 sticky top-0 z-10 shadow-sm">
      <tr class="bg-gradient-to-r from-blue-100 via-blue-100 to-blue-100 text-sm">
        <th class="px-4 py-3 text-left w-28 sticky-column bg-gradient-to-r from-blue-100 via-blue-100 to-blue-100">No.</th>
        <th class="px-4 py-3 text-left w-48">Project No.</th>
        <th class="px-4 py-3 text-left w-72">Project Name</th>
        <th class="px-4 py-3 text-left w-96">Model</th>
        <th class="px-4 py-3 text-left w-96">Basic Specification</th>
        <th class="px-4 py-3 text-left w-40">No. of Units</th>
        <th class="px-4 py-3 text-left w-48">Current Status</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-blue-100">
    @foreach($pproj as $index => $p)
    <tr class="bg-white">
        <td class="px-2 py-2 sticky-column">{{ $index+1 }}</td>
        <td class="px-2 py-2">
          <input type="text" name="prospective_project_no[]" value="{{ $p->PROJNO }}"
                 class="w-full border border-blue-200 rounded-lg px-2 py-1" />
        </td>
        <td class="px-2 py-2">
          <input type="text" name="prospective_project_name[]" value="{{ $p->PROJNAME }}"
                 class="w-full border border-blue-200 rounded-lg px-2 py-1" />
        </td>
        <td class="px-2 py-2">
          <input type="text" name="prospective_model[]" value="{{ $p->MODEL }}"
                 class="w-full border border-blue-200 rounded-lg px-2 py-1" />
        </td>
        <td class="px-2 py-2">
          <input type="text" name="prospective_basic_spec[]"  value="{{ $p->SPEC }}"
                 class="w-full border border-blue-200 rounded-lg px-2 py-1" />
        </td>
        <td class="px-2 py-2">
          <input type="number" name="prospective_units[]"  value="{{ $p->QTY }}"
                 class="w-full border border-blue-200 rounded-lg px-2 py-1" min="0" />
        </td>
        <td class="px-2 py-2">
          <input type="text" name="prospective_status[]" value="{{ $p->STATUS }}"
                 class="w-full border border-blue-200 rounded-lg px-2 py-1"  />
        </td>
      </tr>


    @endforeach
    @if(empty($pproj))
      <tr class="bg-white">
        <td class="px-2 py-2 sticky-column">1</td>
        <td class="px-2 py-2">
          <input type="text" name="prospective_project_no[]" 
                 class="w-full border border-blue-200 rounded-lg px-2 py-1" />
        </td>
        <td class="px-2 py-2">
          <input type="text" name="prospective_project_name[]" 
                 class="w-full border border-blue-200 rounded-lg px-2 py-1" />
        </td>
        <td class="px-2 py-2">
          <input type="text" name="prospective_model[]" 
                 class="w-full border border-blue-200 rounded-lg px-2 py-1" />
        </td>
        <td class="px-2 py-2">
          <input type="text" name="prospective_basic_spec[]" 
                 class="w-full border border-blue-200 rounded-lg px-2 py-1" />
        </td>
        <td class="px-2 py-2">
          <input type="number" name="prospective_units[]" 
                 class="w-full border border-blue-200 rounded-lg px-2 py-1" min="0" />
        </td>
        <td class="px-2 py-2">
          <input type="text" name="prospective_status[]" 
                 class="w-full border border-blue-200 rounded-lg px-2 py-1"  />
        </td>
      </tr>
    @endif
    </tbody>
  </table>
<!-- ปุ่ม Add Row อยู่มุมล่างซ้าย -->
<div class="flex justify-start">
  <button id="addProBtn" type="button"
    class="bg-blue-100 text-blue-600 hover:bg-blue-200 border border-blue-300 rounded-md p-1 text-sm font-semibold shadow focus:outline-none transition-colors"
    title="Add Row">
    Add
  </button>
</div>
</section>
<!-- ปุ่ม Save -->
<div class="flex justify-end mt-6">
  <button  type="button" data-tab="prj"
    class="save-btn   bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-xl text-sm font-semibold
           shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300">
    Save
  </button>
</div>
</div>
</form>
<!-- Tab6: Required Items -->
<form id="form-req"  method="post" enctype="multipart/form-data">
<div id="tab-req" class="tab-pane hidden w-full max-w-5xl mx-auto">
  <h2 class="text-2xl font-bold text-blue-900 mb-2">Required Items</h2>
  <p class="text-sm text-gray-600 mb-6">Please specify the required items for visitor arrangement.</p>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Require Welcome Board -->
    <div>
      <label for="requireWelcomeBoard" class="block text-sm text-gray-700 font-medium mb-1">Require Welcome Board</label>
      <select
        id="requireWelcomeBoard"
        name="requireWelcomeBoard"
        class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 text-gray-900"
      >
        <option value=""></option>
        <option value="Y" {{ ($mode == "2" && !empty($visit) && $visit[0]->BOARD== "Y") ? 'selected' : '' }}>Yes</option>
        <option value="N" {{ ($mode == "2" && !empty($visit) && $visit[0]->BOARD== "N") ? 'selected' : '' }}>No</option>
      </select>
    </div>

    <!-- Attach Welcome Board file -->
    <div>
      <label for="welcomeBoardFile" class="block text-sm text-gray-700 font-medium mb-1">Attachment File</label>
      <input
        type="file"
        id="welcomeBoardFile"
        name="welcomeBoardFile[]"
        multiple
        class="w-full text-sm text-gray-500
               file:mr-4 file:py-2 file:px-4
               file:rounded-md file:border-0
               file:text-sm file:font-semibold
               file:bg-blue-50 file:text-blue-700
               hover:file:bg-blue-100
               focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div id="attachmentreqDisplay">
      @foreach($attbfile as $f)
        <!--span class="file-item">{{ substr($f->SFILE, 13) }}</!--span><br-->
        <div class="file-item"  data-id="{{$f->ITEMNO}}" data-filename="{{$f->SFILE}}" data-folder="{{ $NFRMNO.'_'.$VORGNO.'_'.$CYEAR.'_'.$CYEAR2.'_'.$NRUNNO}}">
              <a href="{{ base_url('marform/MAR-VMS/form/mdownload/').$NFRMNO.'_'.$VORGNO.'_'.$CYEAR.'_'.$CYEAR2.'_'.$NRUNNO.'/'.substr($f->SFILE,13).'/'.$f->SFILE}}" target="_blank" class="file-list"><i class="${iconClass}" style="margin-right: 4px;color: #007bff;"></i>{{ substr($f->SFILE, 13) }}</a>
              <i class="icofont-close-line-circled delete-file" style="color: red; font-size: 20px;  margin-left: 8px; vertical-align: middle; cursor: pointer;"></i>
        </div>
      @endforeach
      </div>
    </div>
  </div>

<!-- ปุ่ม Save -->
<div class="flex justify-end mt-6">
  <button  type="button" data-tab="req"
    class="save-btn bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-xl text-sm font-semibold
           shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300">
    Save
  </button>
</div>
</div>
</form>
<form id="form-stk"  method="post" enctype="multipart/form-data">
<!-- Tab7: Stakeholders-->
<div id="tab-stk" class="tab-pane hidden w-full max-w-7xl mx-auto">

<h2 class="text-2xl font-bold text-blue-900 mb-2">Stakeholders</h2>
  <p class="text-sm text-gray-600 mb-6">Manage Primary Stakeholders and Informed Stakeholders below.</p>

  <!-- Primary Stakeholders Table -->
<section class="mb-12">
  <h3 class="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2 mb-3">Primary Stakeholders</h3>
  <table id="tablepst" class="min-w-[1200px] text-sm text-gray-800 w-full">
    <thead class="text-blue-800 sticky top-0 z-10 shadow-sm">
      <tr class="bg-gradient-to-r from-blue-100 via-blue-100 to-blue-100 text-sm">
        <th class="px-4 py-3 text-left w-20 sticky-column bg-gradient-to-r from-blue-100 via-blue-100 to-blue-100">No.</th>
        <th class="px-4 py-3 text-left w-30">Group Name</th>
        <th class="px-4 py-3 text-left w-50">Detail</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-blue-100">
      @foreach($pstk as $index => $ps)
      <tr class="bg-white">
        <td class="px-2 py-2 w-20 sticky-column">{{ $index+1 }}</td>
        <td  class="px-2 py-2  w-30">
          <select class="pst-select" style="width: 50px;" name="pst[]" placeholder='select Group Name'>
            <option value=""></option>
            @foreach($allgroup as $p)
              <option value="{{ $p->GID }}"
                      data-detail="{{ $p->GDETAIL }}"
                      {{ $p->GID == $ps->GID ? 'selected' : '' }}>
                {{ $p->GNAME }}
              </option>
            @endforeach
          </select>
        </td>
        <td class="px-2 py-2 w-50 text-gray-600 grp-col">{{ $ps->GDETAIL }}</td>
      </tr>
      @endforeach
      @if(empty($pstk))
      <tr class="bg-white">
        <td class="px-2 py-2 w-20 sticky-column">1</td>
        <td class="px-2 py-2  w-30">
        <select class="pst-select" style="width: 50px;" name ="pst[]"  placeholder='select Group Name'>
                <option value=""></option>
                @foreach($allgroup as $p)
                <option value="{{ $p->GID }}"
                        data-detail="{{ $p->GDETAIL }}">
                    {{ $p->GNAME }}
                </option>
              @endforeach
        </select>
        
    </td>
        <td class="px-2 py-2  w-50 text-gray-600 grp-col"></td>
      </tr>
      @endif
    </tbody>
  </table>
  <!-- ปุ่ม Add มุมซ้าย -->
  <div class="flex justify-start">
    <button id="addPstBtn" type="button"
      class="bg-blue-100 text-blue-600 hover:bg-blue-200 border border-blue-300 rounded-md p-1 text-sm font-semibold shadow focus:outline-none transition-colors">
      Add
    </button>
  </div>
</section>

  <!-- Informed Stakeholders Table -->
  <section class="mb-12">
  <h3 class="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2 mb-3">Informed Stakeholders</h3>
  <table id="tableist" class="min-w-[1200px] text-sm text-gray-800 w-full">
    <thead class="text-blue-800 sticky top-0 z-10 shadow-sm">
      <tr class="bg-gradient-to-r from-blue-100 via-blue-100 to-blue-100 text-sm">
        <th class="px-4 py-3 text-left w-20 sticky-column bg-gradient-to-r from-blue-100 via-blue-100 to-blue-100">No.</th>
        <th class="px-4 py-3 text-left w-30">Group Name</th>
        <th class="px-4 py-3 text-left w-50">Detail</th>
       
      </tr>
    </thead>
    <tbody class="divide-y divide-blue-100">
    @foreach($istk as $index => $is)
      <tr class="bg-white">
        <td class="px-2 py-2  w-20 sticky-column">{{ $index+1 }}</td>
        <td class="px-2 py-2  w-30">
          <select class="ist-select"   style="width: 50px;"" name="ist[]" placeholder='select Group Name'>
            <option value=""></option>
            @foreach($allgroup as $p)
              <option value="{{ $p->GID }}"
                       data-detail="{{ $p->GDETAIL }}"
                      {{ $p->GID == $is->GID ? 'selected' : '' }}>
                {{ $p->GNAME }}
              </option>
            @endforeach
          </select>
        </td>
        <td class="px-2 py-2 w-50 text-gray-600 grp-col">{{ $is->GDETAIL }}</td>
      </tr>
      @endforeach


    @if(empty($istk)) 
      <tr class="bg-white">
        <td class="px-2 py-2  w-20  sticky-column">1</td>
        <td class="px-2 py-2  w-30">
        <select class="ist-select"  style="width: 50px;" name ="ist[]" placeholder='select Group Name'>
                <option value=""></option>
                @foreach($allgroup as $p)
                <option value="{{ $p->GID }}"  data-detail="{{ $p->GDETAIL }}"> {{ $p->GNAME}}</option>
                @endforeach
        </select>
        </td>
        <td class="px-2 py-2 w-50  text-gray-600 grp-col"></td>
      </tr>
    @endif

    </tbody>
  </table>
  <!-- ปุ่ม Add มุมซ้าย -->
  <div class="flex justify-start">
    <button id="addIstBtn" type="button"
      class="bg-blue-100 text-blue-600 hover:bg-blue-200 border border-blue-300 rounded-md p-1 text-sm font-semibold shadow focus:outline-none transition-colors">
      Add
    </button>
  </div>
</section>
<!-- ปุ่ม Save -->
<div class="flex justify-end mt-6">
  <button  type="button" data-tab="stk"
    class="save-btn bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-xl text-sm font-semibold
           shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300">
    Save
  </button>
</div>
</div>
</form>
<form id="form-submit" method="post" enctype="multipart/form-data" class="space-y-6 font-sans">
<div id="tab-submit" class="tab-pane hidden w-full max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="grid grid-cols-3 gap-4 p-4 bg-white rounded-xl shadow-md text-sm h-40">
      <!-- Left Side -->
      <div class="col-span-2 grid gap-y-2 h-full">
        <!-- Attn -->
        <div class="grid grid-cols-[auto_1fr] gap-x-2">
          <span class="font-semibold text-gray-700">Attn:</span>
          <span class="text-gray-900 break-words" data-field="attn"></span>
        </div>

        <!-- CC -->
        <div class="grid grid-cols-[auto_1fr] gap-x-2">
          <span class="font-semibold text-gray-700">CC:</span>
          <span class="text-gray-900 break-words" data-field="cc"></span>
        </div>

        <div class="flex-1"></div>

        <!-- Purpose of visit -->
        <div class="grid grid-cols-[auto_1fr] gap-x-2">
          <span class="font-semibold text-gray-700">Purpose of visit:</span>
          <span class="text-gray-900" data-field="purpose"></span>
        </div>
      </div>

      <!-- Right Side -->
      <div class="col-span-1 flex flex-col justify-between space-y-1 h-full">
      <div class="flex space-x-2">
        <span class="font-semibold text-gray-700 w-32">Issue Date:</span>
        <span class="text-gray-900" data-field="issueDate"></span>
      </div>

      <div class="flex space-x-2">
        <span class="font-semibold text-gray-700 w-32">Ref. No.:</span>
        <span class="text-gray-900" data-field="refno"></span>
      </div>

      <div class="flex space-x-2">
        <span class="font-semibold text-gray-700 w-32">Issued by:</span>
        <span class="text-gray-900" data-field="issueby"></span>
      </div>

      <div class="flex space-x-2">
        <span class="font-semibold text-gray-700 w-32">Visit date:</span>
        <span class="text-gray-900" data-field="visitdate" ></span>
      </div>

      <div class="flex space-x-2">
        <span class="font-semibold text-gray-700 w-32">Reception room:</span>
        <span class="text-gray-900" data-field="receptroom" ></span>
      </div>

      <div class="flex space-x-2">
        <span class="font-semibold text-gray-700 w-32">No. of visitors:</span>
        <span class="text-gray-900" data-field="visitor"></span>
      </div>
      </div>
    </div>

  <!-- Visitor Information -->
  <div class="bg-white rounded-2xl shadow-lg p-6">
    <div class="flex justify-between items-center border-b-2 border-blue-400 pb-2">
    <h2 class="font-semibold text-lg">Visitor Information</h2>
    <button type="button" data-tab="inf"
      class="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center space-x-1 edit-btn">
      <span>✎</span>
      <span>Edit</span>
    </button>
    </div>
    <table class="w-full border border-gray-300 text-sm mt-3 table-auto">
      <thead class="bg-blue-50 text-gray-700">
        <tr>
          <th class="border border-gray-300 px-3 py-2">No.</th>
          <th class="border border-gray-300 px-3 py-2">Country</th>
          <th class="border border-gray-300 px-3 py-2">Company</th>
          <th class="border border-gray-300 px-3 py-2">Name</th>
          <th class="border border-gray-300 px-3 py-2">Position</th>
          <th class="border border-gray-300 px-3 py-2">Experience</th>
        </tr>
      </thead>
      <tbody id="visitor-body" class="text-gray-900"></tbody>
    </table>
  </div>

  <!-- Schedule -->
  <div class="bg-white rounded-2xl shadow-lg p-6">
    <div class="flex justify-between items-center border-b-2 border-blue-400 pb-2">
    <h2 class="font-semibold text-lg">Schedule</h2>
    <button type="button" data-tab="sch"
      class="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center space-x-1 edit-btn">
      <span>✎</span>
      <span>Edit</span>
    </button>
    </div>
    <table class="w-full border border-gray-300 text-sm mt-3 table-auto">
      <thead class="bg-blue-50 text-gray-700">
        <tr>
          <th class="border border-gray-300 px-3 py-2">Time</th>
          <th class="border border-gray-300 px-3 py-2">Place</th>
          <th class="border border-gray-300 px-3 py-2">Content</th>
          <th class="border border-gray-300 px-3 py-2">AMEC Participants</th>
          <th class="border border-gray-300 px-3 py-2">Note</th>
        </tr>
      </thead>
      <tbody id="schedule-body" class="text-gray-900"></tbody>
    </table>
  </div>

  <!-- Request Items -->
  <div class="bg-white rounded-2xl shadow-lg p-6 space-y-6">
    <div class="flex justify-between items-center border-b-2 border-blue-400 pb-2">
    <h2 class="font-semibold text-lg">Request Items</h2>
    <button type="button" data-tab="req"
      class="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center space-x-1 edit-btn">
      <span>✎</span>
      <span>Edit</span>
    </button>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

      <!-- Left Column: Arranged by G/P -->
      <div class="bg-gray-50 p-4 rounded-xl shadow-inner space-y-4">
        <h3 class="font-semibold text-sm text-blue-600">Arranged by G/P</h3>

        <div class="border rounded-lg p-3 text-sm bg-white shadow-sm">
          <div class="font-semibold mb-1">Welcome Board</div>
          <span class="text-gray-900" data-field="board"></span>
          <span class="sfile text-blue-600" data-field="filename"></span>
        </div>

        <div class="border rounded-lg p-3 text-sm bg-white shadow-sm">
          <div class="font-semibold mb-2 text-blue-600" data-field="roomlunch"></div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <div class="grid grid-cols-[auto_1fr] gap-x-2">
                <span class="font-semibold text-gray-700">Date:</span>
                <span class="text-gray-900" data-field="roomdate"></span>
              </div>
              <div class="grid grid-cols-[auto_1fr] gap-x-2">
                <span class="font-semibold text-gray-700">Time:</span>
                <span class="text-gray-900" data-field="roomtime" ></span>
              </div>
            </div>
            <div class="space-y-2">
              <div class="grid grid-cols-[auto_1fr] gap-x-2">
                <span class="font-semibold text-gray-700">No. of Visitors:</span>
                <span class="text-gray-900" data-field="visitlunch"></span>
              </div>
              <div class="grid grid-cols-[auto_1fr] gap-x-2">
                <span class="font-semibold text-gray-700">No. of AMEC:</span>
                <span class="text-gray-900" data-field="ameclunch"></span>
              </div>
              <div class="grid grid-cols-[auto_1fr] gap-x-2">
                <span class="font-semibold text-gray-700">Total:</span>
                <span class="text-gray-900" data-field="totlunch"></span>
              </div>
            </div>

            <div class="md:col-span-2 grid grid-cols-[auto_1fr] gap-x-2">
              <span class="font-semibold text-gray-700">Dietary Restrictions:</span>
              <span class="text-gray-900" data-field="roomdietary"></span>
            </div>
            <div class="md:col-span-2 grid grid-cols-[auto_1fr] gap-x-2">
              <span class="font-semibold text-gray-700" data-field="headent"></span>
              <span class="text-gray-900" data-field="reqent"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Arranged by Visitor's Host -->
      <div class="bg-gray-50 p-4 rounded-xl shadow-inner space-y-3">
        <h3 class="font-semibold text-sm text-blue-600">Arranged by Visitor's Host</h3>

        <div class="grid grid-cols-[auto_1fr] gap-x-2">
          <span class="text-sm font-semibold text-gray-700 w-32">Hotel Reservation:</span>
          <span class="text-sm text-gray-900" data-field="hotelname"></span>
        </div>
        <div class="grid grid-cols-[auto_1fr] gap-x-2">
          <span class="text-sm font-semibold text-gray-700 w-32">Shop tour:</span>
          <span class="text-sm text-gray-900" data-field="shoptour"></span>
        </div>
        <div class="grid grid-cols-[auto_1fr] gap-x-2">
          <span class="text-sm font-semibold text-gray-700 w-32">Form C1-1:</span>
          <span class="text-sm text-gray-900" data-field="formc1_1"></span>
        </div>
        <div class="grid grid-cols-[auto_1fr] gap-x-2">
          <span class="text-sm font-semibold text-gray-700 w-32">Car reservation:</span>
          <span class="text-sm text-gray-900" data-field="car"></span>
        </div>
        <div class="grid grid-cols-[auto_1fr] gap-x-2">
        <span class="text-sm font-semibold text-gray-700 w-32" data-field="cardetail"></span>
        </div>
        <div class="md:col-span-2">
        <span class="text-sm font-semibold text-gray-700 w-32">Entertainment Form:</span>
          <span class="text-sm text-gray-900" data-field="formreqent"></span>
        </div>
      </div>
    </div>
  </div>

  <!-- Projects (Vertical Stack) -->
  <div class="space-y-6">

    <div class="bg-white rounded-2xl shadow-lg p-6">
      <div class="flex justify-between items-center border-b-2 border-blue-400 pb-2">
      <h2 class="font-semibold text-lg">Secured Projects</h2>
      <button type="button" data-tab="prj"
        class="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center space-x-1 edit-btn">
        <span>✎</span>
        <span>Edit</span>
      </button>
      </div>
      <table class="w-full border border-gray-300 text-sm mt-3 table-auto">
        <thead class="bg-blue-50 text-gray-700">
          <tr>
            <th class="border border-gray-300 px-3 py-2  w-24">Project No.</th>
            <th class="border border-gray-300 px-3 py-2 w-56">Project Name</th>
            <th class="border border-gray-300 px-3 py-2 w-56">Model</th>
            <th class="border border-gray-300 px-3 py-2 w-32">Specification</th>
            <th class="border border-gray-300 px-3 py-2 w-20">No. of Units</th>
            <th class="border border-gray-300 px-3 py-2  w-16">Status</th>
          </tr>
        </thead>
        <tbody id="sproject-body" class="text-gray-900"></tbody>
      </table>
    </div>

    <div class="bg-white rounded-2xl shadow-lg p-6">
      <div class="flex justify-between items-center border-b-2 border-blue-400 pb-2">
      <h2 class="font-semibold text-lg">Prospective Projects</h2>
      <button type="button" data-tab="prj"
        class="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center space-x-1 edit-btn">
        <span>✎</span>
        <span>Edit</span>
      </button>
      </div>
      <table class="w-full border border-gray-300 text-sm mt-3 table-auto">
        <thead class="bg-blue-50 text-gray-700">
          <tr>
            <th class="border border-gray-300 px-3 py-2  w-24">Project No.</th>
            <th class="border border-gray-300 px-3 py-2 w-56">Project Name</th>
            <th class="border border-gray-300 px-3 py-2 w-56">Model</th>
            <th class="border border-gray-300 px-3 py-2 w-32">Specification</th>
            <th class="border border-gray-300 px-3 py-2 w-20">No. of Units</th>
            <th class="border border-gray-300 px-3 py-2  w-16">Status</th>
          </tr>
        </thead>
        <tbody id="pproject-body" class="text-gray-900"></tbody>
      </table>
    </div>

  </div>
  <!-- ปุ่ม -->
  <div class="flex justify-end space-x-2 mt-6">
      <!--button type="button"  id="bookRoomBtn"
          class="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-xl text-sm font-semibold
                 shadow-md hover:shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-300">
        Book Room
      </button -->
      <button type="button" data-tab="submit" 
        class="confirm-btn bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-xl text-sm font-semibold
              shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300
              {{ (!empty($form) && ($mode == '2') && ($form[0]->CST == '0')) ? '' : 'hidden' }}">
        Create Form Entertainment
      </button>
        <button type="button" data-tab="submit" 
        class="send-btn px-6 py-2 rounded-xl text-white font-semibold 
         bg-gradient-to-r from-teal-500 to-teal-600 
         hover:from-teal-600 hover:to-teal-700 
         shadow-md hover:shadow-lg">
        Sent Mail
      </button>
      <button type="button" data-tab="del" 
        class="del-btn bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-xl text-sm font-semibold
              shadow-md hover:shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-300
              {{ (!empty($form) && ($mode == '2') && ($form[0]->CST == '0')) ? '' : 'hidden' }}">
        Delete
      </button>
      <button type="button" data-tab="submit" 
        class="export-btn flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 
         text-white px-6 py-2 rounded-xl text-sm font-semibold
         shadow-md hover:shadow-lg hover:from-orange-600 hover:to-orange-700
         transition-all duration-300
              {{ (!empty($form) && ($mode == '2')) ? '' : 'hidden' }}">
        Export
      </button>
  </div>
</div>
</form>

</div>
  </div>
</div>
<!-- Modal แยกออกจาก tab -->
<div id="bookRoomModal" class="hidden fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-40 z-50">
  <div class="bg-white rounded-xl shadow-lg p-6 w-96">
    <h3 class="text-lg font-semibold mb-4">Enter Password Email</h3>
    <input type="password" id="passwordInput" placeholder="Password"
           class="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-green-500 focus:outline-none" />
           <div class="flex justify-end gap-2">
              <button id="cancelModalBtn" class="btn btn-sm btn-secondary">Cancel</button>
              <button id="confirmModalBtn" class="btn btn-sm btn-primary">OK</button>
          </div>
  </div>
</div>


@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/vms.js?ver={{ $GLOBALS['version'] }}"></script>
    <script>
      
    window.sproj = @json($sproj);
    window.costmst = @json($costmst);
    const costMap = {};
    window.costmst.forEach(item => {
        costMap[item.ET_NAME] = item.ET_COST;
    });
    const dietaryOptions = [
        @foreach($dietary as $d)
            "{{ $d->DIETARY }}",
        @endforeach
    ];
    /*const tabButtons = document.querySelectorAll('#tabs button');
    const tabPanes = document.querySelectorAll('.tab-pane');
  
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        // remove active classes
        tabButtons.forEach(btn => btn.classList.remove('active-tab'));
        tabPanes.forEach(pane => pane.classList.add('hidden'));

        // add active to current
        button.classList.add('active-tab');
        const tab = button.getAttribute('data-tab');
        document.getElementById(tab).classList.remove('hidden');
      });
    });
    const lunchCheckbox = document.getElementById('hasLunch');
  const lunchDetails = document.getElementById('lunchDetails');
  lunchCheckbox.addEventListener('change', () => {
    lunchDetails.classList.toggle('hidden', !lunchCheckbox.checked);
  });

  const dinnerCheckbox = document.getElementById('hasDinner');
  const dinnerDetails = document.getElementById('dinnerDetails');
  dinnerCheckbox.addEventListener('change', () => {
    dinnerDetails.classList.toggle('hidden', !dinnerCheckbox.checked);
  });*/
    </script>
@endsection
