@extends('layouts/webflowTemplate')

@section('contents')
<div class="min-h-screen flex flex-col items-center bg-blue-50 pt-6 px-4">

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


<!-- Modal -->
<dialog id="alertModal" class="modal">
    <div class="modal-box rounded-xl shadow-lg">
        <h3 id="alertTitle" class="font-bold text-lg text-red-600">⚠ แจ้งเตือน</h3>
        <p id="alertMessage" class="py-4">ข้อความแจ้งเตือน</p>
        <div class="modal-action">
            <form method="dialog">
                <button class="btn bg-indigo-500 text-white rounded-lg px-4 py-2">ปิด</button>
            </form>
        </div>
    </div>
</dialog>
@endsection
<meta name="base_url" content="{{ base_url() }}">
@section('scripts')
    window.BASE_URL = "{{ base_url() }}";
    <script type="module" src="{{ base_url('assets/script/gpform/GP-TRN/training.js') }}"></script>
@endsection
