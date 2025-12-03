@extends('layouts/webflowTemplate')
@section('contents')

<div class="w-full max-w-5xl mx-auto bg-white/80 backdrop-blur-sm 
            p-8 rounded-2xl shadow-xl border border-emerald-300 mt-6">

  {{-- Header --}}
  <h2 class="text-3xl font-extrabold mb-10 text-center 
             text-emerald-700 tracking-wide drop-shadow-md">
    ใบเคลียร์ค่าใช้จ่ายอบรม (Clearance Training Form)
  </h2>

  <form method="POST" enctype="multipart/form-data">

    {{-- Hidden --}}
    <input type="hidden" name="NFRMNO" value="{{ $NFRMNO }}">
    <input type="hidden" name="VORGNO" value="{{ $VORGNO }}">
    <input type="hidden" name="CYEAR"  value="{{ $CYEAR }}">
    <input type="hidden" name="CYEAR2" value="{{ $CYEAR2 }}">
    <input type="hidden" name="NRUNNO" value="{{ $NRUNNO }}">

    {{-- Section --}}
    <h3 class="font-bold text-xl mb-4 text-emerald-800 border-b pb-1">
      ข้อมูลการฝึกอบรมที่อ้างอิง (Reference Training Information)
    </h3>

    {{-- INFO TABLE --}}
    <div class="grid grid-cols-2 gap-y-4 gap-x-10 text-[15px] leading-snug">

      {{-- Form No --}}
      <div class="border-b pb-1">
        <label class="block font-semibold text-slate-700">หมายเลขฟอร์ม (Form No):</label>
        <p class="text-emerald-700 font-bold">{{ $formno }}</p>
      </div>

      {{-- Ref No --}}
      <div class="border-b pb-1">
        <label class="block font-semibold text-slate-700">หมายเลขฟอร์มอ้างอิง (Ref Form No):</label>
        @php
          $url = site_url(
            "gpform/GP-TRN/training?no={$data_head[0]->REF_NFRMNO}".
            "&orgNo={$data_head[0]->REF_VORGNO}".
            "&y={$data_head[0]->REF_CYEAR}".
            "&y2={$data_head[0]->REF_CYEAR2}".
            "&runNo={$data_head[0]->REF_NRUNNO}"
          );
        @endphp
        <a href="{{ $url }}" target="_blank"
           class="inline-flex items-center px-3 py-1.5 rounded-md 
                  bg-emerald-50 text-emerald-700 font-semibold shadow-sm
                  hover:bg-emerald-100 hover:scale-[1.02]
                  transition-all border border-emerald-200">
          <i class="bi bi-link-45deg mr-1"></i>
          {{ $ref_formno }}
        </a>
      </div>

      {{-- Trainee Code --}}
      <div class="border-b pb-1">
        <label class="font-semibold text-slate-700">รหัสผู้อบรม (Trainee Code):</label>
        <p class="text-emerald-700 font-bold">{{ $data_head[0]->SEMPNO }}</p>
      </div>

      {{-- Name --}}
      <div class="border-b pb-1">
        <label class="font-semibold text-slate-700">ชื่อ - สกุล (Name):</label>
        <p class="text-emerald-700 font-bold">{{ $data_head[0]->STNAME }}</p>
      </div>

      {{-- Position --}}
      <div class="border-b pb-1">
        <label class="font-semibold text-slate-700">ตำแหน่ง (Position):</label>
        <p class="text-emerald-700 font-bold">{{ $data_head[0]->SPOSITION }}</p>
      </div>

      {{-- Department --}}
      <div class="border-b pb-1">
        <label class="font-semibold text-slate-700">แผนก/ส่วน/ฝ่าย (Sect./Dept./Div.):</label>
        <p class="text-emerald-700 font-bold">
          {{ $data_head[0]->SSEC }} /
          {{ $data_head[0]->SDEPT }} /
          {{ $data_head[0]->SDIV }}
        </p>
      </div>

      {{-- Subject --}}
      <div class="col-span-2 border-b pb-1">
        <label class="font-semibold text-slate-700">ชื่อหัวข้อฝึกอบรม (Training subject):</label>
        <p class="text-emerald-700 font-bold">{{ $data_head[0]->SUBJECT }}</p>
      </div>

      {{-- Date --}}
      <div class="border-b pb-1">
        <label class="font-semibold text-slate-700">วันที่ฝึกอบรม (Training Date):</label>
        <p class="text-emerald-700 font-bold">
          {{ $data_head[0]->DATE_FROM }}
          @if ($data_head[0]->DATE_FROM !== $data_head[0]->DATE_TO)
            - {{ $data_head[0]->DATE_TO }}
          @endif
        </p>
      </div>

      {{-- Time --}}
      <div class="border-b pb-1">
        <label class="font-semibold text-slate-700">เวลาที่ฝึกอบรม (Training Time):</label>
        <p class="text-emerald-700 font-bold">
          {{ $data_head[0]->TIME_FROM }} - {{ $data_head[0]->TIME_TO }}
        </p>
      </div>

      {{-- Place --}}
      <div class="col-span-2 border-b pb-1">
        <label class="font-semibold text-slate-700">สถานที่ฝึกอบรม (Training Place):</label>
        <p class="text-emerald-700 font-bold">{{ $data_head[0]->PLACE }}</p>
      </div>

      {{-- Institution --}}
      <div class="col-span-2 border-b pb-1">
        <label class="font-semibold text-slate-700">สถาบันที่ฝึกอบรม (Training Institution):</label>
        <p class="text-emerald-700 font-bold">{{ $data_head[0]->INSTITUTION }}</p>
      </div>

    </div>

    {{-- Divider --}}
    <div class="my-8 border-b border-emerald-300"></div>
    <div>
      <p class="text-[14px] text-red-600 font-semibold mt-1 ml-2"> ※ สามารถส่งฟอร์มนี้ได้ตั้งแต่วันที่ {{ $data_head[0]->DATE_TO ?? '-' }} เป็นต้นไป </p>
    </div>  
    {{-- Attachment --}}
    <div class="border border-emerald-300 bg-emerald-50/70 p-4 rounded-xl mb-6">
      <label class="font-semibold block mb-2 text-emerald-900 text-lg">
        แนบใบเสร็จ (Receipt Attachment)
      </label>
      <input type="file"
             name="txt_clrtrn_att[]" multiple
             class="block w-full text-sm bg-white border border-emerald-300 rounded-lg 
                    p-2 file:bg-emerald-600 file:text-white file:px-4
                    file:py-2 file:rounded-md hover:file:bg-emerald-700 cursor-pointer">
    </div>

    {{-- Remark --}}
    <div class="mb-6">
      <label class="font-semibold text-slate-700 mb-1 block">หมายเหตุเพิ่มเติม (Optional)</label>
      <input type="text" name="REMARK"
             class="w-full border border-gray-300 rounded-lg p-3 
                    focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400">
    </div>   
    {{-- Submit --}}
    <div class="text-center mt-10">
      <button id="btnSubmitClr" type="submit"
          class="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold 
          py-2 px-10 rounded-lg shadow-md transition-all">
          Send Clearance
      </button>
    </div>

  </form>
</div>

@endsection

<script>
document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("btnSubmitClr") || 
              document.querySelector("button[type='submit']");
  
  let endDateStr = "{{ $data_head[0]->DATE_TO ?? '' }}";

  if (!endDateStr) return;

  // 🔹 แปลงรูปแบบวันที่ให้เป็น YYYY-MM-DD
  if (endDateStr.includes("/")) {
    const p = endDateStr.split("/");
    endDateStr = `${p[2]}-${p[1]}-${p[0]}`;       // DD/MM/YYYY → YYYY-MM-DD
  } else if (!endDateStr.includes("-")) {
    endDateStr = `${endDateStr.substring(0,4)}-${endDateStr.substring(4,6)}-${endDateStr.substring(6,8)}`;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(endDateStr);
  endDate.setHours(0, 0, 0, 0);

  console.log("📅 EndDate:", endDate, "Today:", today);

  // 🔸 ถ้ายังไม่ถึงวันที่ส่งฟอร์ม
  if (today < endDate) {
    btn.disabled = true;
    btn.classList.add("opacity-50", "cursor-not-allowed");
    btn.title = "ยังไม่ถึงวันที่สามารถส่ง clearance ได้";

    // แสดงข้อความแจ้งเตือนด้านบนปุ่ม
    const warnMsg = document.createElement("p");
    warnMsg.textContent = "※ ยังไม่ถึงวันที่สามารถส่ง Clearance ได้";
    warnMsg.className = "text-[14px] text-orange-600 font-medium mt-3";
    
    btn.parentElement.prepend(warnMsg);
  }
});
</script>
