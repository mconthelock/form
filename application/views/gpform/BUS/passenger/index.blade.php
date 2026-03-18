@extends('layouts/template')
@section('contents')
<div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-10">
    <div class="flex items-center justify-between mb-6">
        <!-- LEFT: ICON + TITLE -->
        <div class="flex items-center gap-4">
            <div class="flex items-center justify-center w-16 h-16 
                bg-gradient-to-br from-purple-100 to-purple-200 
                rounded-2xl shadow-sm border border-purple-200">
                <i class="fa-solid fa-users text-3xl text-purple-700"></i>
            </div>

            <div>
                <h1 class="text-3xl font-bold text-gray-800 tracking-tight">
                    หน้าจอจัดการรายชื่อพนักงานในสายรถ (รับ-ส่ง)
                </h1>
                <p class="text-sm text-gray-500 mt-1">
                    (ข้อมูล Master ของรายชื่อพนักงานในสายรถ)
                </p>
            </div>
        </div>

        <!-- RIGHT: BUTTON -->
        <button id="btnExportPassenger"
            class="bg-yellow-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold 
                hover:bg-yellow-300 transition shadow-sm flex items-center gap-2 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="w-5 h-5">
                <path fill="#21A366" d="M6 4h23v40H6z"/>
                <path fill="#107C41" d="M29 4h13v40H29z"/>
                <path fill="#fff"
                    d="M14 16l3.2 5.5L14 27h2.6l1.9-3.7L20.4 27H23l-3.2-5.5L23 16h-2.6l-1.9 3.7L16.6 16H14z"/>
            </svg>
            Export Data
        </button>

    </div>

    <div class="grid md:grid-cols-10 gap-6">
        <div class="md:col-span-4 bg-white rounded-xl shadow border h-fit">
            <div class="flex justify-between items-center 
                        px-4 py-3 rounded-t-xl
                        bg-gradient-to-r from-blue-600 to-indigo-600">
                <h3 class="text-white font-semibold text-lg"> 🚍 ข้อมูลสายรถ </h3>
            </div>
            <div class="p-4 overflow-x-auto">
                <table id="line_emp_table" class="w-full text-sm"></table>
            </div>
        </div>

        <div class="md:col-span-6 bg-white rounded-xl shadow border h-fit">
            <div class="flex justify-between items-center px-4 py-3 rounded-t-xl bg-gradient-to-r from-orange-500 to-teal-600">
                <h3 class="text-white font-semibold text-lg">
                    📍 รายชื่อพนักงานในสายรถ 
                    <span id="passLineName"class="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold shadow">-</span>
                </h3>
                <button id="btnAddEmp" class="bg-white text-blue-600 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-100 cursor-pointer">+ เพิ่มพนักงาน </button>
            </div>

            <div class="p-4 overflow-x-auto">
                <table id="passenger_table" class="w-full text-sm"> </table>
            </div>
        </div>
    </div>
</div>

<!-- Modal สำหรับเพิ่ม/แก้ไขรายชื่อพนักงาน -->
<dialog id="emp_modal" class="modal">
    <div class="modal-box w-11/12 max-w-lg">
        <h3 class="font-bold text-lg mb-4">เพิ่มพนักงาน</h3>
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-1">
                    สายรถที่เลือก
                </label>

                <div class="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <span class="text-blue-700 font-semibold text-sm" id="lblBusName">-</span>
                </div>
            </div>
            <input type="hidden" id="hdBusId">
            <div>
                <label class="block text-sm font-medium mb-1">รหัสพนักงาน<b style="color:red">*</b></label>
                <input type="text" id="txtEmpno"
                       class="input input-bordered w-full" maxlength="5"
                       placeholder="กรอกรหัสพนักงาน">
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">
                    จุดจอด <b style="color:red">*</b>
                </label>

                <select id="ddlStop"
                        class="select select-bordered w-full">
                    <option value="">-- เลือกจุดจอด --</option>
                </select>
            </div>
            <div style="display:none">
                <div class="flex gap-6">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="empType" value="1"
                               class="radio radio-primary" checked>
                        <span>ขาไป</span>
                    </label>

                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="empType" value="2"
                               class="radio radio-primary">
                        <span>ขากลับ</span>
                    </label>
                </div>
            </div>
        </div>
        <div class="modal-action">
            <button class="btn btn-primary" id="btnSaveEmp">บันทึก</button>
            <button class="btn" onclick="document.getElementById('emp_modal').close()">ยกเลิก</button>
        </div>
    </div>
</dialog>

@endsection


@section('scripts')
<script type="module" src="{{ $_ENV['APP_JS'] }}/bus_passenger.js?ver={{ $_ENV['VERSION'] }}"></script>
@endsection

@section('styles')
<link rel="stylesheet" href="{{ $_ENV['APP_ENV'] }}/assets/style/all.min.css">
<style>
    #line_emp_table tbody tr.line-selected {
        background-color: #dbeafe !important; /* ฟ้าอ่อน */
    }

    #line_emp_table tbody tr.line-selected:hover {
        background-color: #bfdbfe !important;
    }
    #line_emp_table tbody tr {
        transition: background-color 0.2s ease;
    }
</style>
@endsection