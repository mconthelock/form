@extends('layouts/webflowTemplate')
@section('styles')
    <style></style>
@endsection
@section('contents')
    <div class="max-w-7xl mx-auto space-y-6">
        <!-- Header -->
        <h1 class="text-3xl font-extrabold text-center text-[#2CA9E1] tracking-tight">TS ADJUST</h1>

        <!-- Top Section: Form Card -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div class="flex flex-col lg:flex-row gap-6">
                <!-- Left Form -->
                <div class="flex-1 flex flex-col gap-4">
                    <!-- Input Group Style -->
                    <div
                        class="flex rounded-md shadow-sm ring-1 ring-inset ring-slate-300 focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden">
                        <label
                            class="flex items-center justify-center w-1/3 bg-slate-50 text-slate-600 font-medium text-sm border-r border-slate-300 px-3">Input
                            by</label>
                        <input type="text" value="15111" readonly
                            class="w-2/3 border-0 bg-transparent py-2 pl-3 text-slate-900 text-sm focus:ring-0 outline-none">
                    </div>

                    <div
                        class="flex rounded-md shadow-sm ring-1 ring-inset ring-slate-300 focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden">
                        <label
                            class="flex items-center justify-center w-1/3 bg-slate-50 text-slate-600 font-medium text-sm border-r border-slate-300 px-3">Request
                            by</label>
                        <input type="text" value="15111"
                            class="w-2/3 border-0 bg-white py-2 pl-3 text-slate-900 text-sm focus:ring-0 outline-none">
                    </div>

                    <div
                        class="flex rounded-md shadow-sm ring-1 ring-inset ring-slate-300 focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden">
                        <label
                            class="flex items-center justify-center w-1/3 bg-slate-50 text-slate-600 font-medium text-sm border-r border-slate-300 px-3">Production
                            (JUN)</label>
                        <input type="text" name="jun" id="jun"
                            class="w-2/3 border-0 bg-white py-2 pl-3 text-slate-900 text-sm focus:ring-0 outline-none">
                    </div>
                </div>

                <!-- Right Form (Textarea) -->
                <div class="flex-1 flex flex-col rounded-md shadow-sm ring-1 ring-inset ring-slate-300 overflow-hidden">
                    <div class="bg-slate-50 text-slate-600 font-medium text-sm px-4 py-2 border-b border-slate-300">Reason &
                        Remark</div>
                    <textarea class="flex-1 w-full bg-white p-3 text-sm text-slate-900 focus:outline-none resize-none"
                        placeholder="Type your remarks here..."></textarea>
                </div>
            </div>
        </div>

        <!-- Search Bar Card -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-wrap items-center gap-3">
            <div class="flex rounded-md shadow-sm ring-1 ring-inset ring-slate-300 overflow-hidden">
                <span class="bg-[#245D9B] text-white px-4 py-2 text-sm font-medium">Drawing</span>
                <input type="text" placeholder="Dwg No." class="border-0 bg-white px-3 py-2 text-sm w-32 outline-none"
                    maxlength="9">
            </div>

            <input type="text" placeholder="G no."
                class="rounded-md border border-slate-300 px-3 py-2 text-sm w-24 outline-none focus:ring-2 focus:ring-blue-500">
            <input type="text" placeholder="L no."
                class="rounded-md border border-slate-300 px-3 py-2 text-sm w-24 outline-none focus:ring-2 focus:ring-blue-500">
            <span class="text-slate-400 font-bold">-</span>
            <input type="text" placeholder="L no."
                class="rounded-md border border-slate-300 px-3 py-2 text-sm w-24 outline-none focus:ring-2 focus:ring-blue-500">

            <button
                class="bg-[#245D9B] hover:bg-blue-700 text-white font-medium px-6 py-2 text-sm rounded-lg shadow-sm transition ml-auto">ADD</button>
        </div>

        <!-- Table Card -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-xs text-center border-collapse">
                    <!-- Modern Header: Softer background, lighter text -->
                    <thead class="bg-slate-100 text-slate-600 border-b border-slate-300">
                        <tr>
                            <th rowspan="2" class="p-3 font-semibold border-r border-slate-200">No</th>
                            <th rowspan="2" class="p-3 font-semibold border-r border-slate-200">Part name</th>
                            <th rowspan="2" class="p-3 font-semibold border-r border-slate-200">Item</th>
                            <th rowspan="2" class="p-3 font-semibold border-r border-slate-200">DWG</th>
                            <th rowspan="2" class="p-3 font-semibold border-r border-slate-200">Q'ty</th>
                            <th rowspan="2" class="p-3 font-semibold border-r border-slate-200">Process</th>
                            <th rowspan="2" class="p-3 font-semibold border-r border-slate-200">Rev.</th>
                            <th colspan="3" class="p-2 font-semibold bg-slate-200 border-r border-slate-300">Current :
                                STD Time (AS400)</th>
                            <th colspan="3" class="p-2 font-semibold bg-blue-50 border-r border-slate-200 text-blue-800">
                                After : Present Time Adjusts</th>
                            <th rowspan="2" class="p-0 border-r border-slate-200 w-6"></th>
                            <th rowspan="2" class="p-2 font-semibold bg-red-50 text-red-600 border-r border-slate-200">
                                Total Request<br>(Hr)</th>
                            <th rowspan="2" class="p-2 font-semibold">Requested<br>History</th>
                        </tr>
                        <tr class="bg-slate-50">
                            <th class="p-2 font-medium border-r border-slate-200 bg-slate-200">TP</th>
                            <th class="p-2 font-medium border-r border-slate-200 bg-slate-200">TC</th>
                            <th class="p-2 font-medium border-r border-slate-300 bg-slate-200">TS</th>
                            <th class="p-2 font-medium border-r border-slate-200 bg-blue-50 text-blue-800">TP</th>
                            <th class="p-2 font-medium border-r border-slate-200 bg-blue-50 text-blue-800">TC</th>
                            <th class="p-2 font-medium border-r border-slate-200 bg-blue-50 text-blue-800">TS</th>
                        </tr>
                    </thead>

                    <tbody class="text-slate-700">
                        <!-- Sum Row -->
                        <tr class="border-b border-slate-300 font-semibold bg-slate-50">
                            <td colspan="7" class="p-2 border-r border-slate-200"></td>
                            <td colspan="2" class="p-2 border-r border-slate-200 text-right pr-3">Sum</td>
                            <td class="p-2 border-r border-slate-300 bg-slate-200">3.30</td>
                            <td colspan="2" class="p-2 border-r border-slate-200 text-right pr-3">Sum</td>
                            <td class="p-2 border-r border-slate-200 bg-blue-100 text-blue-900">3.85</td>
                            <td class="p-2 border-r border-slate-200 text-right">Sum</td>
                            <td class="p-2 border-r border-slate-200 bg-red-100 text-red-600">+ 0.55</td>
                            <td class="p-2"></td>
                        </tr>

                        <!-- Data Row -->
                        <tr class="border-b border-slate-200 hover:bg-slate-50 transition">
                            <td class="p-2 border-r border-slate-200 text-slate-500">1</td>
                            <td class="p-2 border-r border-slate-200 text-left px-3">XXXXXXX XXXX</td>
                            <td class="p-2 border-r border-slate-200 text-slate-500">XXX</td>
                            <td class="p-2 border-r border-slate-200">XXXXXXXXX - 01</td>
                            <td class="p-2 border-r border-slate-200 text-slate-500">X</td>
                            <td class="p-2 border-r border-slate-200"></td>
                            <td class="p-2 border-r border-slate-200 text-slate-500">K</td>
                            <td class="p-2 border-r border-slate-200">0.05</td>
                            <td class="p-2 border-r border-slate-200">0.25</td>
                            <td class="p-2 border-r border-slate-300 bg-slate-100">0.30</td>
                            <td class="p-2 border-r border-slate-200 font-medium">0.05</td>
                            <td class="p-2 border-r border-slate-200 font-medium">0.30</td>
                            <td class="p-2 border-r border-slate-200 bg-blue-50 text-blue-700">0.35</td>
                            <td class="p-2 border-r border-slate-200 text-slate-400">...</td>
                            <td class="p-2 border-r border-slate-200 text-red-500 font-medium">+ 0.05</td>
                            <td class="p-2 text-slate-400">-</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Bottom Actions -->
        <div class="flex justify-center items-center gap-4 mt-4 pb-8">
            <button
                class="bg-[#3b1c4a] hover:bg-purple-900 text-white font-medium py-2.5 px-8 rounded-lg shadow-sm transition">SAVE</button>
            <button
                class="bg-[#245D9B] hover:bg-blue-800 text-white font-medium py-2.5 px-8 rounded-lg shadow-sm transition">SEND</button>
            <button
                class="bg-[#4caf50] hover:bg-green-700 text-white font-medium py-2.5 px-8 rounded-lg shadow-sm transition">Export</button>
        </div>
    </div>
@endsection
@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/iets.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
