@extends('layouts/template')
@section('contents')
<div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
    <div class="grid md:grid-cols-2 gap-6">

        <!-- LEFT PANEL -->
        <div class="bg-white rounded-xl shadow border">

            <!-- HEADER BAR -->
            <div class="flex justify-between items-center 
                        px-4 py-3 rounded-t-xl
                        bg-gradient-to-r from-blue-600 to-indigo-600">

                <h3 class="text-white font-semibold text-lg">
                    🚍 ข้อมูลสายรถ
                </h3>

                <button id="btnAddLine"
                    class="bg-white text-blue-600 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-100">
                    + เพิ่มสายรถ
                </button>
            </div>

            <div class="p-4">
                <table id="line_table" class="w-full text-sm">
                </table>
            </div>

        </div>


        <!-- RIGHT PANEL -->
        <div class="bg-white rounded-xl shadow border">

            <!-- HEADER BAR -->
            <div class="flex justify-between items-center 
                        px-4 py-3 rounded-t-xl
                        bg-gradient-to-r from-emerald-500 to-teal-600">

                <h3 class="text-white font-semibold text-lg">
                    📍 รายละเอียดจุดรถ
                </h3>

                <button id="btnAddStop"
                    class="bg-white text-blue-600 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-100">
                    + เพิ่มจุดรถ
                </button>
            </div>

            <div class="p-4">
                <table id="route_detail_table" class="w-full text-sm">
                </table>
            </div>
        </div>
    </div>
</div>


<dialog id="line_modal" class="modal">
    <div class="modal-box w-11/12 max-w-lg">
        <h3 class="font-bold text-lg mb-4">เพิ่มสายรถ</h3>
        <div class="space-y-4">
            <!-- ชื่อสายรถ -->
            <div>
                <label class="block text-sm font-medium mb-1">ชื่อสายรถ<b style="color:red">*</b></label>
                <input type="text" id="txtLineName"
                       class="input input-bordered w-full"
                       placeholder="กรอกชื่อสายรถ">
            </div>

            <!-- ประเภทรถ -->
            <div>
                <label class="block text-sm font-medium mb-2">ประเภทรถ<b style="color:red">*</b></label>
                <div class="flex gap-6">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="busType" value="1" class="radio radio-primary" checked>
                        <span>Bus</span>
                    </label>

                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="busType" value="2" class="radio radio-primary">
                        <span>Van</span>
                    </label>
                </div>
            </div>

            <!-- จำนวนที่นั่ง -->
            <div>
                <label class="block text-sm font-medium mb-1">จำนวนที่นั่ง<b style="color:red">*</b></label>
                <select id="ddlSeat" class="select select-bordered w-full">
                    <option value="">-- เลือกจำนวนที่นั่ง --</option>
                    <option value="12">12 ที่นั่ง</option>
                    <option value="20">20 ที่นั่ง</option>
                    <option value="24">24 ที่นั่ง</option>
                </select>
            </div>

        </div>

        <div class="modal-action">
            <button class="btn btn-primary" id="btnSaveLine">บันทึก</button>
            <button class="btn" onclick="document.getElementById('line_modal').close()">ยกเลิก</button>
        </div>
    </div>
</dialog>


<dialog id="stop_modal" class="modal">
    <div class="modal-box w-11/12 max-w-lg">
        <h3 class="font-bold text-lg mb-4">เพิ่มจุดรถ</h3>
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-1">
                    สายรถที่เลือก
                </label>

                <div class="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <span class="text-blue-700 font-semibold text-sm" id="lblBusName">-</span>
                </div>
                <input type="hidden" id="hdBusId">
            </div>
            <!-- ชื่อจุดรถ -->
            <div>
                <label class="block text-sm font-medium mb-1">ชื่อจุดรถ<b style="color:red">*</b></label>
                <input type="text" id="txtStopName"
                       class="input input-bordered w-full"
                       placeholder="กรอกชื่อจุดรถ">
            </div>

            <div>
                <div class="flex gap-6">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="stopType" value="1"
                               class="radio radio-primary" checked>
                        <span>ขาไป</span>
                    </label>

                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="stopType" value="2"
                               class="radio radio-primary">
                        <span>ขากลับ</span>
                    </label>
                </div>
            </div>

            <!-- เวลากะปกติ -->
            <div>
                <label class="block text-sm font-medium mb-1">เวลากะปกติ<b style="color:red">*</b></label>
                <div class="flex items-center gap-2">
                    <select id="workdayHour" class="select select-bordered w-24"></select>
                    <span>:</span>
                    <select id="workdayMin" class="select select-bordered w-24"></select>
                </div>
            </div>

            <!-- เวลากะกลางคืน -->
            <div>
                <label class="block text-sm font-medium mb-1">เวลากะกลางคืน</label>
                <div class="flex items-center gap-2">
                    <select id="nightHour" class="select select-bordered w-24"></select>
                    <span>:</span>
                    <select id="nightMin" class="select select-bordered w-24"></select>
                </div>
            </div>

            <!-- เวลาวันหยุด -->
            <div>
                <label class="block text-sm font-medium mb-1">เวลาวันหยุด</label>
                <div class="flex items-center gap-2">
                    <select id="holidayHour" class="select select-bordered w-24"></select>
                    <span>:</span>
                    <select id="holidayMin" class="select select-bordered w-24"></select>
                </div>
            </div>


      

        </div>

        <div class="modal-action">
            <button class="btn btn-primary" id="btnSaveStop">บันทึก</button>
            <button class="btn" onclick="document.getElementById('stop_modal').close()">ยกเลิก</button>
        </div>
    </div>
</dialog>


@endsection


@section('scripts')
<script type="module" src="{{ $_ENV['APP_JS'] }}/bus_routes.js?ver={{ $_ENV['VERSION'] }}"></script>
@endsection

@section('styles')
<style>
    #line_table tbody tr.line-selected {
        background-color: #dbeafe !important; /* ฟ้าอ่อน */
    }

    #line_table tbody tr.line-selected:hover {
        background-color: #bfdbfe !important;
    }
    #line_table tbody tr {
        transition: background-color 0.2s ease;
    }
</style>
@endsection