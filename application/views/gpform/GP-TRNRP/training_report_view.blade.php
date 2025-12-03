@extends('layouts/webflowTemplate')
@section('contents')

<div class="w-full max-w-5xl mx-auto bg-white p-6 rounded-xl shadow">

  {{-- Header --}}
  <h2 class="text-3xl font-extrabold mb-8 text-center text-[#DC143C] tracking-wide drop-shadow-lg">
    แบบรายงานหลังการฝึกอบรม (Training Report Form)
  </h2>

  <form method="POST" action="" enctype="multipart/form-data">

    {{-- Hidden Fields --}}
    <input type="hidden" id="txt_exdata" value="{{ $exdata }}">
    <input type="hidden" id="txt_trainee_pos" value="{{ $data_head[0]->SPOSCODE }}">
    <input type="hidden" id="txt_enddate" value="{{ $data_head[0]->DATE_TO }}">

    {{-- REF Form --}}
    <input type="hidden" name="REF_NFRMNO" value="{{ $data_head[0]->REF_NFRMNO }}">
    <input type="hidden" name="REF_VORGNO" value="{{ $data_head[0]->REF_VORGNO }}">
    <input type="hidden" name="REF_CYEAR"  value="{{ $data_head[0]->REF_CYEAR }}">
    <input type="hidden" name="REF_CYEAR2" value="{{ $data_head[0]->REF_CYEAR2 }}">
    <input type="hidden" name="REF_NRUNNO" value="{{ $data_head[0]->REF_NRUNNO }}">

    {{-- Data attribute for JS --}}
    <div class="form-data"
        data-nfrmno="{{ $NFRMNO }}"
        data-vorgno="{{ $VORGNO }}"
        data-cyear="{{ $CYEAR }}"
        data-cyear2="{{ $CYEAR2 }}"
        data-nrunno="{{ $NRUNNO }}"
        data-empno="{{ $EMPNO }}">
    </div>

    {{-- Header --}}
    <h3 class="font-bold text-xl mb-3 text-blue-700 border-b pb-1">
      แบบฟอร์ม {{ $data_head[0]->FORM_NAME_TH }} ({{ $data_head[0]->FORM_NAME_EN }})
    </h3><br>

    {{-- Detail Section --}}
    <div class="grid grid-cols-2 gap-x-10 gap-y-3 mb-6 text-[15px] leading-snug">

      <div class="flex items-start py-1">
        <label class="w-56 font-semibold text-gray-800">หมายเลขฟอร์ม:</label>
        <span class="text-blue-700 font-bold ml-2">{{ $formno }}</span>
      </div>

      <div class="flex items-start py-1">
        <label class="w-56 font-semibold text-gray-800">ฟอร์มอ้างอิง:</label>
        @php
         $url = site_url("gpform/GP-TRN/training?no={$data_head[0]->REF_NFRMNO}&orgNo={$data_head[0]->REF_VORGNO}&y={$data_head[0]->REF_CYEAR}&y2={$data_head[0]->REF_CYEAR2}&runNo={$data_head[0]->REF_NRUNNO}");
        @endphp
        <a href="{{ $url }}" target="_blank"
            class="ml-2 px-3 py-1.5 inline-flex items-center
                  bg-blue-50 border border-blue-200 rounded-md font-semibold text-blue-700">
            <i class="bi bi-link-45deg text-blue-600 mr-1"></i>
            {{ $ref_formno }}
        </a>
      </div>

      <div class="flex items-start py-1">
        <label class="w-56 font-semibold text-gray-800">รหัสผู้อบรม:</label>
        <span class="text-blue-700 font-bold ml-2">{{ $data_head[0]->SEMPNO }}</span>
      </div>

      <div class="flex items-start py-1">
        <label class="w-56 font-semibold text-gray-800">ชื่อ - สกุล:</label>
        <span class="text-blue-700 font-bold ml-2">{{ $data_head[0]->STNAME }}</span>
      </div>

      <div class="flex items-start py-1">
        <label class="w-56 font-semibold text-gray-800">ตำแหน่ง:</label>
        <span class="text-blue-700 font-bold ml-2">{{ $data_head[0]->SPOSITION }}</span>
      </div>

      <div class="flex items-start py-1">
        <label class="w-56 font-semibold text-gray-800">แผนก/ส่วน/ฝ่าย:</label>
        <span class="text-blue-700 font-bold ml-2">
          {{ $data_head[0]->SSEC }} / {{ $data_head[0]->SDEPT }} / {{ $data_head[0]->SDIV }}
        </span>
      </div>

      <div class="col-span-2 flex py-1">
        <label class="w-56 font-semibold">หัวข้อฝึกอบรม:</label>
        <span class="text-blue-700 font-bold ml-2">{{ $data_head[0]->SUBJECT }}</span>
      </div>

      <div class="flex py-1">
        <label class="w-56 font-semibold">วันที่ฝึกอบรม:</label>
        <span class="text-blue-700 font-bold ml-2">
          {{ $data_head[0]->DATE_FROM == $data_head[0]->DATE_TO 
              ? $data_head[0]->DATE_FROM
              : $data_head[0]->DATE_FROM.' - '.$data_head[0]->DATE_TO }}
        </span>
      </div>

      <div class="flex py-1">
        <label class="w-56 font-semibold">เวลา:</label>
        <span class="text-blue-700 font-bold ml-2">
            {{ $data_head[0]->TIME_FROM." - ".$data_head[0]->TIME_TO }}
        </span>
      </div>

      <div class="col-span-2 flex py-1">
        <label class="w-56 font-semibold">สถานที่:</label>
        <span class="text-blue-700 font-bold ml-2">{{ $data_head[0]->PLACE }}</span>
      </div>

      <div class="col-span-2 flex py-1">
        <label class="w-56 font-semibold">สถาบัน:</label>
        <span class="text-blue-700 font-bold ml-2">{{ $data_head[0]->INSTITUTION }}</span>
      </div>
    </div>

    <p class="text-[14px] text-red-600 font-semibold mt-1 ml-2">
      ※ สามารถส่งฟอร์มนี้ได้ตั้งแต่วันที่ {{ $data_head[0]->DATE_TO }}
    </p>

    {{-- Editable --}}
    @if ($mode == '02' && $exdata == '99')

      {{-- CASE 1: ต้องแนบไฟล์ --}}
      @if(in_array($data_head[0]->SPOSCODE, ['55','60','61','62','63']))

        <div class="border border-sky-300 bg-sky-50 p-4 rounded-xl mb-6">
            <label class="font-semibold text-lg text-sky-900">
              แนบไฟล์สิ่งที่ได้รับจากการอบรม
            </label>
            <input type="file" id="txt_trn_att" name="txt_trn_att[]" multiple
                class="block w-full mt-2 p-2 border border-sky-300 rounded-lg file:bg-sky-600 file:text-white"/>
        </div>

      {{-- CASE 2 --}}
      @else

        <div class="border border-gray-400 p-3 mb-4 rounded-lg bg-gray-50">
          <label class="font-semibold block mb-2">สรุปเนื้อหา ที่ได้รับจากการฝึกอบรม (Training content)</label>
          <textarea id="CONTENT" rows="10"
            class="w-full border border-gray-300 rounded-lg p-2 resize-none">{{ $data_head[0]->CONTENT }}</textarea>
        </div>

        <div class="border border-gray-400 p-3 mb-6 rounded-lg bg-gray-50">
          <label class="font-semibold block mb-2">ท่านจะประยุกต์ใช้ ความรู้ / ทักษะ / คุณลักษณะหรือพฤติกรรม จากการฝึกอบรม ต่อการปฏิบัติงานในบริษัทฯ ได้อย่างไร <br>(How to apply knowledge / skill / attribute or behavior from training class to your organization ?)</label>
          <textarea id="APPLY" rows="8"
            class="w-full border border-gray-300 rounded-lg p-2 resize-none">{{ $data_head[0]->APPLY }}</textarea>
        </div>

      @endif

    {{-- VIEW ONLY --}}
    @else

      <div class="border border-gray-400 p-3 mb-4 rounded-lg bg-gray-50 whitespace-pre-line">
        <label class="font-semibold block mb-2">สรุปเนื้อหา ที่ได้รับจากการฝึกอบรม (Training content)</label>
        {{ $data_head[0]->CONTENT }}
      </div>

      <div class="border border-gray-400 p-3 mb-6 rounded-lg bg-gray-50 whitespace-pre-line">
        <label class="font-semibold block mb-2">ท่านจะประยุกต์ใช้ ความรู้ / ทักษะ / คุณลักษณะหรือพฤติกรรม จากการฝึกอบรม ต่อการปฏิบัติงานในบริษัทฯ ได้อย่างไร <br>(How to apply knowledge / skill / attribute or behavior from training class to your organization ?)</label>
        {{ $data_head[0]->APPLY }}
      </div>

    @endif

    @if ($mode == '02')
      <div class="text-center mt-6">
        <button id="btnSubmit"
          type="button"
          data-action="approve"
          class="btnSubmit bg-[#DC143C] hover:bg-red-700 text-white py-2 px-8 rounded-lg shadow-md transition-all">
          Send Form
        </button>
      </div>
    @endif

  </form>
</div>

@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/view_train_report.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection

{{-- Disable Submit Button if not reached end date --}}
<script>
document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("btnSubmit");

  if (!btn) return; // ถ้าไม่มีปุ่ม ไม่ต้องทำอะไรเลย

  let endDateStr = "{{ $data_head[0]->DATE_TO ?? '' }}";
  if (!endDateStr) return;

  // 🔹 แปลงรูปแบบวันที่
  if (endDateStr.includes("/")) {
    const p = endDateStr.split("/");
    endDateStr = `${p[2]}-${p[1]}-${p[0]}`;
  } else if (!endDateStr.includes("-")) {
    endDateStr = `${endDateStr.substring(0,4)}-${endDateStr.substring(4,6)}-${endDateStr.substring(6,8)}`;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(endDateStr);
  endDate.setHours(0, 0, 0, 0);

  // 🔥 Debug
  console.log("📅 EndDate:", endDate, "Today:", today);

  // 🔸 ถ้ายังไม่ถึงวันส่ง ไม่ให้กด แต่ยัง hover ได้
  if (today < endDate) {
    btn.disabled = true;
    btn.classList.add("opacity-50", "cursor-not-allowed");
    btn.title = "ยังไม่ถึงวันที่สามารถส่งได้";

    // ข้อความแจ้งเตือน
    const warnMsg = document.createElement("p");
    warnMsg.textContent = "※ ยังไม่ถึงวันที่สามารถส่งได้";
    warnMsg.className = "text-[14px] text-orange-600 font-medium mt-3";

    btn.parentElement.prepend(warnMsg);
  }
});
</script>
