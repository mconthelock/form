@extends('layouts/webflowTemplate')
@section('contents')

<div class="w-full max-w-5xl mx-auto bg-white p-6 rounded-xl shadow">

  <h2 class="text-3xl font-extrabold mb-8 text-center text-[#DC143C] tracking-wide drop-shadow-lg">
    แบบรายงานหลังการฝึกอบรม (Training Report Form)
  </h2>

  <form method="POST" action="" enctype="multipart/form-data">

    <input type="hidden" id="txt_exdata" value="{{ $exdata }}">
    <input type="hidden" id="txt_trainee_pos" value="{{ $data_head[0]->SPOSCODE }}">
    <input type="hidden" id="txt_enddate" value="{{ $data_head[0]->DATE_TO }}">

    <input type="hidden" name="REF_NFRMNO" value="{{ $data_head[0]->REF_NFRMNO }}">
    <input type="hidden" name="REF_VORGNO" value="{{ $data_head[0]->REF_VORGNO }}">
    <input type="hidden" name="REF_CYEAR"  value="{{ $data_head[0]->REF_CYEAR }}">
    <input type="hidden" name="REF_CYEAR2" value="{{ $data_head[0]->REF_CYEAR2 }}">
    <input type="hidden" name="REF_NRUNNO" value="{{ $data_head[0]->REF_NRUNNO }}">

    <div class="form-data"
        data-nfrmno="{{ $NFRMNO }}"
        data-vorgno="{{ $VORGNO }}"
        data-cyear="{{ $CYEAR }}"
        data-cyear2="{{ $CYEAR2 }}"
        data-nrunno="{{ $NRUNNO }}"
        data-empno="{{ $EMPNO }}">
    </div>

    <h3 class="font-bold text-xl mb-3 text-red-700 border-b pb-1">
      แบบฟอร์ม {{ $data_head[0]->FORM_NAME_TH }} ({{ $data_head[0]->FORM_NAME_EN }})
    </h3><br>

    {{-- (เนื้อหาเดิมทั้งหมดของท่านคงไว้เหมือนเดิม 100%) --}}
    {{-- ตัดออกในตัวอย่างนี้เพื่อความกระชับ แต่ใช้อันเดิมของท่านได้เลย --}}

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

  <div class="flow mt-6" style="overflow: hidden"></div>
</div>

<!-- ✅ Loader Overlay -->
<div id="loaderOverlay" class="hidden fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
  <div class="bg-white p-16 rounded-3xl shadow-2xl flex flex-col items-center">
    <img src="{{ base_url('assets/images/catcatcat.gif') }}"
         alt="Loading..."
         class="w-40 h-40 mx-auto" />
    <p class="mt-6 text-gray-900 text-2xl font-bold text-center">
      กำลังดำเนินการ...<br>กรุณารอสักครู่
    </p>
  </div>
</div>

@endsection


@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/view_train_report.js?ver={{ $GLOBALS['version'] }}"></script>

<script>
document.addEventListener("DOMContentLoaded", function () {

  const btn = document.getElementById("btnSubmit");
  if (!btn) return;

  let endDateStr = "{{ $data_head[0]->DATE_TO ?? '' }}";
  if (!endDateStr) return;

  if (endDateStr.includes("/")) {
    const p = endDateStr.split("/");
    endDateStr = `${p[2]}-${p[1]}-${p[0]}`;
  } else if (!endDateStr.includes("-")) {
    endDateStr = `${endDateStr.substring(0,4)}-${endDateStr.substring(4,6)}-${endDateStr.substring(6,8)}`;
  }

  const today = new Date();
  today.setHours(0,0,0,0);

  const endDate = new Date(endDateStr);
  endDate.setHours(0,0,0,0);

  if (today < endDate) {
    btn.disabled = true;
    btn.classList.add("opacity-50","cursor-not-allowed");
    btn.title = "ยังไม่ถึงวันที่สามารถส่งได้";

    const warnMsg = document.createElement("p");
    warnMsg.textContent = "※ ยังไม่ถึงวันที่สามารถส่งได้";
    warnMsg.className = "text-[14px] text-orange-600 font-medium mt-3";

    btn.parentElement.prepend(warnMsg);
    return;
  }

  btn.addEventListener("click", function () {
    btn.disabled = true;
    btn.classList.add("opacity-50");
    showLoader();
  });

});

function showLoader() {
  const loader = document.getElementById("loaderOverlay");
  if (loader) loader.classList.remove("hidden");
}

function hideLoader() {
  const loader = document.getElementById("loaderOverlay");
  if (loader) loader.classList.add("hidden");
}
</script>

@endsection
