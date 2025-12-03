@extends('layouts/webflowTemplate')

@section('contents')
    <!-- Container -->
    <div class="mx-auto w-full bg-white rounded-2xl shadow-xl p-8">
        <!-- Header -->
        <div class="text-center border-b-2 border-blue-300 pb-4 mb-8">
            <h1 class="text-3xl font-bold tracking-wide">
                Monthly Report on Crimp Height Measurement of Connectors
            </h1>
        </div>

        <!-- Report Info Section -->
        <div class="grid grid-cols-3 gap-6 items-start">
            <!-- Left info -->
            <div class="space-y-2">
                <div class="flex items-center">
                    <span class="font-semibold w-20">Year :</span>
                    <span class="underline text-gray-700 ml-2">2025</span>
                </div>
                <div class="flex items-center">
                    <span class="font-semibold w-20">Month :</span>
                    <span class="underline text-gray-700 ml-2">October</span>
                </div>
                <div class="flex items-center">
                    <span class="font-semibold w-20">Shop :</span>
                    <span class="underline text-gray-700 ml-2">ELC (Feeder)</span>
                </div>
            </div>



        </div>

        <!-- Spacer -->
        <div class="my-8 border-t border-gray-300"></div>

        <!-- Table container (your table goes here) -->
        <!-- <div class="bg-base-100 rounded-xl p-2 shadow-inner border border-gray-200"> -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden text-sm text-center">
            <div class="overflow-x-auto p-2">
                <table class="table table-sm w-full text-center border border-gray-300">
                    <tr class="bg-blue-50">
                        <th class="border text-xl text-blue-900 font-semibold" colspan="9" rowspan="2">
                            ตารางตรวจสอบมาตราฐาน Crimping Condition สำหรับ Skill "CA"
                        </th>
                        <th class="border w-10 p-2 text-blue-900" rowspan="3">CrimpHeight STD</th>
                        <th class="border w-10 p-2 text-blue-900" rowspan="3">Accuracy +-</th>
                        <th class="border bg-red-500"></th>
                        <th class="border text-left font-semibold" colspan="2">= ค่าไม่ผ่าน</th>
                        <th class="border bg-indigo-100 text-indigo-900" colspan="3" rowspan="2">รูปตัวอย่างชิ้นงาน ( 3 ชิ้น )</th>
                    </tr>
                    <tr>
                        <th class="border bg-blue-50" colspan="3">ค่า CrimpHeight ที่วัดได้</th>
                    </tr>
                    <tr class="bg-blue-50">
                        <th class="border text-blue-900">วันที่</th>
                        <th class="border p-2 text-blue-900">machine</th>
                        <th class="border p-2 text-blue-900">JUN</th>
                        <th class="border p-2 text-blue-900">ผู้ตรวจสอบ</th>
                        <th class="border p-2 text-blue-900">Applicator</th>
                        <th class="border p-2 text-blue-900">connector</th>
                        <th class="border p-2 text-blue-900">DWG</th>
                        <th class="border p-2 text-blue-900">สายไฟ</th>
                        <th class="border p-2 text-blue-900">Crimping Condition</th>
                        <th class="border p-2 text-red-600 bg-red-50">ครั้งที่ 1</th>
                        <th class="border p-2 text-red-600 bg-red-50">ครั้งที่ 2</th>
                        <th class="border p-2 text-red-600 bg-red-50">ครั้งที่ 3</th>
                        <th class="border text-indigo-800 bg-indigo-50">รูปที่ 1</th>
                        <th class="border text-indigo-800 bg-indigo-50">รูปที่ 2</th>
                        <th class="border text-indigo-800 bg-indigo-50">รูปที่ 3</th>
                    </tr>
                    <tbody id="table-body">
                        @foreach ($record as $rec)

                            <tr>
                                <td class="border">{{ $rec->CREATED_AT }}</td>
                                <td class="border">{{ $rec->MACHINE_NO }}</td>
                                <td class="border">{{ $rec->JUN_NO }}</td>
                                <td class="border">{{ $rec->INSPECTOR }}</td>
                                <td class="border">{{ $rec->APPLICATOR_NO }}</td>
                                <td class="border">{{ $rec->CONNECTOR }}</td>
                                <td class="border">{{ $rec->PARTNO }}</td>
                                <td class="border">{{ $rec->WIRESIZE }}</td>
                                <td class="border">{{ $rec->CRIMPING_CONDITION }}</td>
                                <td class="border">{{ $rec->CRIMPHEIGHT_STD }}</td>
                                <td class="border">{{ $rec->ACCURACY }}</td>
                                <td class="border">{{ $rec->MEASURE1 }}</td>
                                <td class="border">{{ $rec->MEASURE2 }}</td>
                                <td class="border">{{ $rec->MEASURE3 }}</td>
                                <td class="border">{{ $rec->IMAGE1 }}</td>
                                <td class="border">{{ $rec->IMAGE2 }}</td>
                                <td class="border">{{ $rec->IMAGE3 }}</td>
                            </tr>

                        @endforeach

                    </tbody>
                </table>
            </div>
        </div>
        <!-- </div> -->

    </div>


@endsection

@section('scripts')

@endsection