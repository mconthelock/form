@extends('layouts/template')
@section('contents')
<div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-10">
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
                <h3 class="text-white font-semibold text-lg">📍 รายชื่อพนักงานในสายรถ</h3>
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
                       class="input input-bordered w-full"
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
            <div>
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