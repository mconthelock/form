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
            </div>

            <div class="p-4">
                <table id="line_emp_table" class="w-full text-sm"></table>
            </div>
        </div>


        <!-- RIGHT PANEL -->
        <div class="bg-white rounded-xl shadow border">
            <!-- HEADER BAR -->
            <div class="flex justify-between items-center 
                        px-4 py-3 rounded-t-xl
                        bg-gradient-to-r from-orange-500 to-teal-600">

                <h3 class="text-white font-semibold text-lg">📍 รายชื่อพนักงานในสายรถ</h3>
                <button id="btnAddStop" class="bg-white text-blue-600 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-100">+ เพิ่มพนักงาน </button>
            </div>

            <div class="p-4">
                <table id="passenger_table" class="w-full text-sm"> </table>
            </div>
        </div>
    </div>
</div>



@endsection


@section('scripts')
<script type="module" src="{{ $_ENV['APP_JS'] }}/bus_passenger.js?ver={{ $_ENV['VERSION'] }}"></script>
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