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
                    + Add Route
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
            <div class="px-4 py-3 rounded-t-xl
                        bg-gradient-to-r from-emerald-500 to-teal-600">

                <h3 class="text-white font-semibold text-lg">
                    📍 รายละเอียดจุดรถ
                </h3>
            </div>

            <div class="p-4">
                <table id="route_detail_table" class="w-full text-sm">
                </table>
            </div>

        </div>

    </div>

</div>

@endsection


@section('scripts')
<script type="module" src="{{ $_ENV['APP_JS'] }}/bus_routes.js?ver={{ $_ENV['VERSION'] }}"></script>
@endsection

@section('styles')
    <style>
        #line_table_wrapper,
        #route_detail_table_wrapper {
            width: 100% !important;
        }
    </style>
@endsection