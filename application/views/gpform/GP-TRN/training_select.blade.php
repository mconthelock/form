@extends('layouts/webflowTemplate')
@section('contents')
<div class="min-h-screen flex flex-col items-center bg-blue-50 pt-6 px-4">
  <input type="hidden" id="txt_base_url" value="{{ base_url() }}">
  <input type="hidden" id="NFRMNO" value="{{ $NFRMNO }}">
  <input type="hidden" id="VORGNO" value="{{ $VORGNO }}">
  <input type="hidden" id="CYEAR" value="{{ $CYEAR }}">
  <input type="hidden" id="EMPNO" value="{{ $EMPNO }}">

  <!-- Card เลือกประเภท -->
  <div id="selectCard" class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl border">
    <h2 class="text-xl font-bold text-gray-700 mb-2 text-center">เลือกประเภทแบบฟอร์ม</h2>
    <p class="text-gray-500 text-sm mb-6 text-center">
      กรุณาเลือกหมวดหมู่การฝึกอบรมที่ต้องการ
    </p>

    <!-- ✅ รายการแบบการ์ด -->
    <div id="trainingList" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="training-item border rounded-xl p-4 cursor-pointer hover:bg-indigo-50 hover:border-indigo-400 transition" data-type="functional">
        <div class="flex items-center gap-2">
          <span class="text-2xl">📘</span>
          <div>
            <h3 class="font-semibold text-gray-800">Support Specific Functional Competency</h3>
            <p class="text-sm text-gray-500">ฟอร์มสนับสนุนความรู้ / ทักษะ / คุณลักษณะ เฉพาะสายงาน</p>
          </div>
        </div>
      </div>

      <div class="training-item border rounded-xl p-4 cursor-pointer hover:bg-indigo-50 hover:border-indigo-400 transition" data-type="legal">
        <div class="flex items-center gap-2">
          <span class="text-2xl">📑</span>
          <div>
            <h3 class="font-semibold text-gray-800">Support Legal Requirement</h3>
            <p class="text-sm text-gray-500">ฟอร์มสนับสนุนข้อกำหนดกฎหมาย</p>
          </div>
        </div>
      </div>

      <div class="training-item border rounded-xl p-4 cursor-pointer hover:bg-indigo-50 hover:border-indigo-400 transition" data-type="meth">
        <div class="flex items-center gap-2">
          <span class="text-2xl">🎓</span>
          <div>
            <h3 class="font-semibold text-gray-800">Support ME-TH Training Subject</h3>
            <p class="text-sm text-gray-500">ฟอร์มสนับสนุนหัวข้อฝึกอบรมของ ME-TH</p>
          </div>
        </div>
      </div>

      <div class="training-item border rounded-xl p-4 cursor-pointer hover:bg-indigo-50 hover:border-indigo-400 transition" data-type="pos">
        <div class="flex items-center gap-2">
          <span class="text-2xl">🧭</span>
          <div>
            <h3 class="font-semibold text-gray-800">Support Position-Based Training</h3>
            <p class="text-sm text-gray-500">ฟอร์มสนับสนุนหัวข้อฝึกอบรมพื้นฐานตามตำแหน่งงาน</p>
          </div>
        </div>
      </div>

      <div class="training-item border rounded-xl p-4 cursor-pointer hover:bg-indigo-50 hover:border-indigo-400 transition" data-type="out">
        <div class="flex items-center gap-2">
          <span class="text-2xl">🌍</span>
          <div>
            <h3 class="font-semibold text-gray-800">Support Outside Learning</h3>
            <p class="text-sm text-gray-500">ฟอร์มสนับสนุนการศึกษาดูงานนอกสถานที่</p>
          </div>
        </div>
      </div>

      <div class="training-item border rounded-xl p-4 cursor-pointer hover:bg-green-50 hover:border-green-400 transition" data-type="summary_report">
        <div class="flex items-center gap-2">
          <span class="text-2xl">📊</span>
          <div>
            <h3 class="font-semibold text-gray-800">Summary Report</h3>
            <p class="text-sm text-gray-500">รายงานสรุปผลการฝึกอบรมทั้งหมด</p>
          </div>
        </div>
      </div>

    @if (in_array($EMPNO, ['15199', '01027', '14001', '02035']))
      <div class="training-item border rounded-xl p-4 cursor-pointer hover:bg-teal-50 hover:border-teal-400 transition min-h-[90px] flex items-start" data-type="manage_group">
        <div class="flex items-start gap-2">
          <span class="text-2xl leading-none">👥</span>
          <div class="flex flex-col">
            <h3 class="font-semibold text-gray-800">
              Manage Group Training
            </h3>
            <p class="text-sm text-gray-500 leading-tight">
              จัดการกลุ่มของแบบฟอร์ม
            </p>
          </div>
        </div>
      </div>
    @endif

    </div>


    <!-- กล่อง preview -->
    <div id="detailBox" class="hidden mt-6 p-4 rounded-xl border bg-blue-50 text-blue-900">
      <h3 class="font-semibold flex items-center gap-2">
        <span id="detailTitle">-</span>
      </h3>
      <p id="detailDesc" class="text-sm text-gray-700 mt-1"></p>
    </div>
  </div>

  <!-- ฟอร์มจริง -->
  <div id="requestForm" class="hidden w-full">
    <div id="form_functional" class="hidden">@includeIf('gpform.GP-TRN.training_form_functional')</div>
    <div id="form_legal" class="hidden">@includeIf('gpform.GP-TRN.training_form_legal')</div>
    <div id="form_meth" class="hidden">@includeIf('gpform.GP-TRN.training_form_meth')</div>
    <div id="form_pos" class="hidden">@includeIf('gpform.GP-TRN.training_form_pos')</div>
    <div id="form_out" class="hidden">@includeIf('gpform.GP-TRN.training_form_out')</div>
    <div id="form_report" class="hidden"></div>
    <div id="form_manage_group" class="hidden"> @includeIf('gpform.GP-TRN.training_manage_group')</div>
  </div>
</div>

<!-- ✅ Modal -->
<dialog id="alertModal" class="rounded-xl shadow-lg p-0 border-0 bg-transparent">
  <div class="rounded-xl shadow-lg p-6 bg-white w-96 mx-auto">
    <h3 id="alertTitle" class="font-bold text-lg text-red-600">⚠ แจ้งเตือน</h3>
    <p id="alertMessage" class="py-4 text-gray-700">ข้อความแจ้งเตือน</p>
    <div class="mt-4 flex justify-end">
      <form method="dialog">
        <button type="submit" class="bg-indigo-500 text-white rounded-lg px-4 py-2 font-semibold hover:bg-indigo-600 transition">ปิด</button>
      </form>
    </div>
  </div>
</dialog>

<!-- ✅ Loader Overlay -->
<div id="loaderOverlay" class="hidden fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
  <div class="bg-white p-16 rounded-3xl shadow-2xl flex flex-col items-center">
    <img src="{{ base_url('assets/images/catcatcat.gif') }}" alt="Loading..." class="w-64 h-64 mx-auto" />
    <p class="mt-8 text-gray-900 text-4xl font-extrabold text-center">
      กำลังบันทึกข้อมูล<br>กรุณารอสักครู่...นะจ๊ะ
    </p>
  </div>
</div>

<style>
dialog {
  border: none;
  padding: 0;
  margin: auto;
  position: fixed;
  top: 40%;
  left: 40%;
  transform: translate(-40%, -40%);
}
dialog::backdrop { background: rgba(0,0,0,0.5); }
#loaderOverlay.hidden { display: none; }
</style>
@endsection

@section('scripts')
<script>
  window.getEmpUrl = "{{ site_url('gpform/GP-TRN/training/get_emp') }}";
  window.mainUrl   = "{{ site_url('gpform/GP-TRN/training') }}";
  
</script>

<script src="{{ base_url('assets/dist/js/training_select.js') }}"></script>
<script src="{{ $_ENV['APP_JS'] }}/manage_group.js?ver={{ $GLOBALS['version'] }}"></script>

@endsection
