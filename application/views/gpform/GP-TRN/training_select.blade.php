@extends('layouts/webflowTemplate')
@section('contents')
<div class="min-h-screen flex flex-col items-center bg-blue-50 pt-6 px-4">
<Input type="hidden" id="txt_base_url" value="<?php echo base_url();?>">
    <!-- Card เลือกประเภท -->
    <div id="selectCard" class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg border">
        <h2 class="text-xl font-bold text-gray-700 mb-2 text-center">เลือกประเภทแบบฟอร์ม</h2>
        <p class="text-gray-500 text-sm mb-6 text-center">กรุณาเลือกหมวดหมู่การฝึกอบรมที่ต้องการ</p>

        <label class="block text-sm font-medium text-gray-700 mb-2">Training / Seminar Type</label>
        <select id="trainingType"
            class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer">
            <option value="">เลือกประเภทการฝึกอบรม...</option>
            <option value="functional">📘 Support Specific Functional Competency</option>
            <option value="legal">📑 Support Legal Requirement</option>
            <option value="meth">🎓 Support ME-TH Training subject</option>
        </select>

        <!-- กล่อง preview -->
        <div id="detailBox" class="hidden mt-4 p-4 rounded-xl border bg-blue-50 text-blue-900">
            <h3 class="font-semibold flex items-center gap-2">
                <span id="detailTitle">-</span>
            </h3>
            <p id="detailDesc" class="text-sm text-gray-700 mt-1"></p>
        </div>

        <button id="submitBtn" type="button"
            class="w-full mt-6 py-2 rounded-lg font-semibold text-white bg-indigo-400 transition"
            disabled>
            ไปยังแบบฟอร์ม
        </button>


    </div>

    <!-- Request Form (ซ่อนอยู่) -->
    <div id="requestForm" class="hidden w-full">
        <div id="form_functional" class="hidden">
            @includeIf('gpform.GP-TRN.training_form_functional')
        </div>
        <div id="form_legal" class="hidden">
            @includeIf('gpform.GP-TRN.training_form_legel')
        </div>
        <div id="form_meth" class="hidden">
            @includeIf('gpform.GP-TRN.training_form_meth')
        </div>
    </div>

</div>


<!-- ✅ Modal -->
<dialog id="alertModal" class="rounded-xl shadow-lg p-0 border-0 bg-transparent">
  <div class="rounded-xl shadow-lg p-6 bg-white w-96 mx-auto">
    <h3 id="alertTitle" class="font-bold text-lg text-red-600">⚠ แจ้งเตือน</h3>
    <p id="alertMessage" class="py-4 text-gray-700">ข้อความแจ้งเตือน</p>
    <div class="mt-4 flex justify-end">
      <form method="dialog">
        <button type="submit"
          class="bg-indigo-500 text-white rounded-lg px-4 py-2 font-semibold 
                 hover:bg-indigo-600 transition">
          ปิด
        </button>
      </form>
    </div>
  </div>
</dialog>

<style>
dialog {
  border: none;
  padding: 0;
  margin: auto;
  position: fixed;   /* ให้อยู่ยึดกับหน้าจอ */
  top: 40%;          /* จัดกึ่งกลางแนวตั้ง */
  left: 40%;         /* จัดกึ่งกลางแนวนอน */
  transform: translate(-40%, -40%); /* ชดเชยให้อยู่กลางจริง */
}

dialog::backdrop {
  background: rgba(0, 0, 0, 0.5); /* พื้นหลังโปร่งดำ */
}
</style>


@endsection

@section('scripts')
    <script>const getEmpUrl = "{{ site_url('gpform/GP-TRN/training/get_emp') }}";</script>
    <script type="module" src="{{ base_url('assets/script/gpform/GP-TRN/training.js?v=') . time() }}"></script>
@endsection
