@extends('layouts/webflowTemplate')

@section('contents')

    <section class="py-12 px-6 bg-gray-50 min-h-screen flex flex-col items-center">
        <div class="mb-10 text-center">
            <h2 class="text-4xl font-light text-gray-700 mb-2">User ID & Authorization Review Input</h2>
            <p class="text-sm text-gray-500">กรุณากรอก **จำนวนการดำเนินการ (Delete/Change)** และ **รายละเอียด (User IDs/Reasons)**</p>
        </div>
        <div class="mb-8 flex flex-row flex-nowrap items-center gap-2">
            <span class="text-lg font-medium text-gray-700 whitespace-nowrap">Regular review of</span>
            <select name="review_period" id="period" class="input select-bordered select-sm text-lg font-medium text-gray-700 px-2 cursor-pointer">
                <option value=""> - please select - </option>
                <option value="1">1<sup>st</sup> half</option>
                <option value="2">2<sup>nd</sup> half</option>
            </select>
            <span class="text-lg font-medium text-gray-700">in</span>
            @php
                $currentYear = date('Y');
                $startYear   = $currentYear - 1;
                $endYear     = $currentYear + 1;
            @endphp
            <select name="review_year" id="year" class="input input-bordered input-sm w-24 font-medium text-gray-700 px-2 cursor-pointer">
                @for ($year = $startYear; $year <= $endYear; $year++)
                    <option value="{{ $year }}" {{ $year == $currentYear ? 'selected' : '' }}>{{ $year }}</option>
                @endfor
            </select>
        </div>
        {{-- เปิดฟอร์มที่นี่ --}}
        <form id="reviewForm" action="/path/to/your/submit/url" method="POST" class="w-full max-w-[1700px]">

            <div class="w-full shadow-2xl rounded-xl bg-white border border-gray-200 overflow-hidden">
                <div class="overflow-x-auto">
                    <!-- Table container for dynamic content -->
                    <table id="systemsTable" class="table w-full text-sm">
                        <thead class="bg-gray-100 text-gray-600 sticky top-0 z-10">
                            <tr>
                                <th rowspan="2" class="w-[50px] text-center font-bold border-b-2 bg-primary/10 border-1 border-gray-300">No.</th>
                                <th rowspan="2" class="min-w-[250px] text-left font-bold border-b-2 bg-primary/10 border-1 border-gray-300">System (ชื่อระบบหลัก)</th>
                                <th rowspan="2" class="w-[120px] text-center font-bold border-b-2 bg-primary/10 border-1 border-gray-300">Total Users</th>
                                <th rowspan="2" class="w-[120px] text-center font-bold border-b-2 bg-primary/10 border-1 border-gray-300">Unmatched</th>
                                <th colspan="3" class="text-center font-bold bg-primary/10 text-primary border-1 border-b-2 border-gray-300">
                                    <i class="fas fa-keyboard mr-2"></i> ACTION & DETAIL INPUT
                                </th>
                            </tr>
                            <tr class="bg-primary/5 text-gray-600">
                                <th class="w-[220px] text-center font-semibold border-b-2 border-1 border-gray-300">Program Name</th>
                                <th class="w-[220px] text-center font-semibold border-b-2 border-gray-300">Delete / Change <span class="text-xs text-gray-400">(Count)</span></th>
                                <th class="min-w-[360px] text-center font-semibold border-b-2 border-gray-300">Detail (User IDs / Reasons)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Data will be loaded here by jQuery AJAX -->
                        </tbody>
                    </table>

                </div>
            </div>

            <div class="mt-2 mb-5 w-full mx-auto remark-div">
                <div class="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
                    <label for="remark" class="block text-lg font-medium text-gray-700 mb-2">
                        Remark (หมายเหตุ)
                    </label>
                    <textarea id="remark" name="remark" rows="4" class="textarea textarea-bordered w-full text-base" placeholder="Enter any additional remarks here..."></textarea>
                </div>
            </div>

            <div class="flex justify-end mt-10 w-full">
                <button class="btn btn-primary btn-lg px-16 shadow-lg rounded-xl text-base font-semibold" type="submit">
                    <i class="fa-solid fa-floppy-disk mr-3"></i> Save All
                </button>
            </div>

        </form>
    </section>

@endsection
@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/RgvSummary.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection