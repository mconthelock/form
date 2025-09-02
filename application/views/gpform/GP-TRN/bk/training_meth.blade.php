@extends('layouts/webflowTemplate')
@section('styles')
<style>
    button, select, a {
        cursor: pointer;
    }
</style>
@endsection


@section('contents')

<div class="min-h-screen flex flex-col items-center bg-blue-50 pt-6 px-4">
    <!-- Title -->
    <div class="text-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800">แบบฟอร์มแจ้งความประสงค์ขอฝึกอบรมภายนอก ต่างประเทศ</h1>
        <p class="text-gray-500 text-base">External Training Requisition form </p>
    </div>

    <!-- Card -->
    <div class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg border">
        <h2 class="text-xl font-bold text-gray-700 mb-2 text-center">เลือกประเภทแบบฟอร์ม</h2>
        <p class="text-gray-500 text-sm mb-6 text-center">กรุณาเลือกหมวดหมู่การฝึกอบรมที่ต้องการ</p>

        <!-- Select -->
        <label class="block text-sm font-medium text-gray-700 mb-2">Training / Seminar Type</label>
        <select id="trainingType"
            class="w-full border border-gray-300 rounded-lg p-2 
                focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer">
            <option value="" disabled selected hidden>เลือกประเภทการฝึกอบรม...</option>
            <option value="functional">📘 Support Specific Functional Competency</option>
            <option value="legal">📑 Support Legal Requirement</option>
            <option value="meth">🎓 Support ME-TH Training subject</option>
        </select>

        <!-- Detail box -->
        <div id="detailBox" class="hidden mt-4 p-4 rounded-xl border bg-blue-50 text-blue-900">
            <h3 class="font-semibold flex items-center gap-2">
                <span id="detailTitle">-</span>
            </h3>
            <p id="detailDesc" class="text-sm text-gray-700 mt-1"></p>
        </div>

        <!-- Button -->
        <button id="submitBtn" 
            class="w-full mt-6 py-2 rounded-lg font-semibold text-white 
                bg-indigo-400 cursor-not-allowed transition hover:cursor-pointer">
            ไปยังแบบฟอร์ม
        </button>
    </div>
</div>
<!-- Modal -->
<dialog id="alertModal" class="modal">
    <div class="modal-box rounded-xl shadow-lg">
        <h3 class="font-bold text-lg text-red-600">⚠ แจ้งเตือน</h3>
        <p class="py-4">กรุณาเลือกประเภทการฝึกอบรมก่อน !!</p>
        <div class="modal-action">
            <form method="dialog">
                <button class="btn bg-indigo-500 text-white rounded-lg px-4 py-2">ปิด</button>
            </form>
        </div>
    </div>
</dialog>

@endsection

@section('scripts')
<script src="{{ base_url('assets/script/gpform/GP-TRN/training.js') }}"></script>
@endsection