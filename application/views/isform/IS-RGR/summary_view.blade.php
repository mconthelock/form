@extends('layouts/webflowTemplate')

@section('contents')
    {{-- การส่งข้อมูลจาก PHP ไป JS แบบนี้ดีอยู่แล้วครับ --}}
    <div class="form-data" data-nfrmno="{{ $NFRMNO }}" data-vorgno="{{ $VORGNO }}" data-cyear="{{ $CYEAR }}" data-cyear2="{{ $CYEAR2 }}" data-nrunno="{{ $NRUNNO }}" data-empno="{{ $EMPNO }}"></div>

    <section class="py-12 px-2 bg-gray-100 min-h-screen flex flex-col items-center">
        {{-- โครงสร้าง paper-report และการใช้ shadow/rounded/border ของ Tailwind ดูดีครับ --}}
        <div class="w-full mx-auto bg-white shadow-2xl rounded-2xl border border-gray-300 px-10 py-12 paper-report relative">

            <div class="flex flex-row items-center mb-8 border-b pb-4">
                <div>
                    <h2 class="text-3xl font-bold text-gray-800 tracking-wide mb-1">User ID & Authorization Review Report</h2>
                    <div class="text-sm text-gray-500">(รายงานผลการตรวจสอบ User ID และ Authorization)</div>
                </div>
                <div class="ml-auto text-right text-xs text-gray-400">
                    Report Date: <span class="font-semibold">{{ date('d/m/Y') }}</span>
                </div>
            </div>

            <div class="mb-8">
                <p class="text-base text-gray-700 mb-2">
                    According to AMEC have to review User ID and Authentication of concern system to comply with ITGC (IT General Control) regulation.
                </p>
                <p class="text-base text-gray-700 mb-2">
                    This time each concern division have been checked and request for corrective already. IS Dept would like to summary the result for your approval as attached.
                </p>
                <p class="text-base text-gray-700 font-semibold">
                    Could you please approval “User ID and Authentication regular review result”.
                </p>
            </div>

            <div class="mb-8 flex flex-row flex-wrap items-center gap-4 text-base">
                <div class="flex items-center gap-2">
                    <span class="font-medium text-gray-700">Regular review of</span>
                    <span class="font-semibold text-primary" id="period-text"></span>
                    <span class="font-medium text-gray-700">in</span>
                    <span class="font-semibold text-primary" id="year-text"></span>
                </div>
            </div>

            <div class="w-full overflow-x-auto mb-8">
                {{-- การใช้ class "table" (จาก DaisyUI) กับ w-full เป็นวิธีที่ถูกต้องครับ --}}
                <table id="systemsTable" class="table w-full text-sm border border-gray-300 bg-white">
                    <thead class="bg-gray-50 text-gray-700">
                        <tr>
                            <th rowspan="2" class="w-[50px] text-center font-bold border-b-2 border-gray-300 bg-gray-100">No.</th>
                            <th rowspan="2" class="min-w-[250px] text-left font-bold border-b-2 border-gray-300 bg-gray-100">System (ชื่อระบบหลัก)</th>
                            <th rowspan="2" class="w-[120px] text-center font-bold border-b-2 border-gray-300 bg-gray-100">Total Users</th>
                            <th rowspan="2" class="w-[120px] text-center font-bold border-b-2 border-gray-300 bg-gray-100">Unmatched</th>
                            <th colspan="3" class="text-center font-bold border-b-2 border-gray-300 bg-gray-100 text-primary">
                                <i class="fas fa-keyboard mr-2"></i> ACTION & DETAIL REPORT
                            </th>
                        </tr>
                        <tr class="bg-gray-50 text-gray-700">
                            <th class="w-[220px] text-center font-semibold border-b-2 border-gray-300">Program Name</th>
                            <th class="w-[220px] text-center font-semibold border-b-2 border-gray-300">Delete / Change <span class="text-xs text-gray-400">(Count)</span></th>
                            <th class="min-w-[360px] text-center font-semibold border-b-2 border-gray-300">Detail (User IDs / Reasons)</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>

            <div class="mt-8 pt-6 border-t border-dashed border-gray-300">
                <div class="flex flex-row items-center">
                    <div class="w-32 text-lg font-medium text-gray-700">Remark (หมายเหตุ)</div>
                    <div class="flex-1 flex items-center">
                        <div id="remark-view" class="text-base text-gray-700 border-b border-black border-dotted w-full"></div>
                    </div>
                </div>
            </div>
            @if ($mode == '02')
                <div class="flex justify-center mt-6 space-x-4">

                    <button class="bg-green-600 text-white px-6 py-2 btn rounded-lg shadow hover:bg-green-700 transition btn-submit" data-action="approve" id="btn-confirm">
                        Approve
                    </button>

                    <button class="bg-red-600 text-white px-6 py-2 btn rounded-lg shadow hover:bg-red-700 transition btn-submit" data-action="reject">
                        Reject
                    </button>
                </div>
            @endif
            <hr class="my-8">
            <div class="flow mt-8"></div>
        </div>
    </section>

@endsection
@section('scripts')
    {{-- การเรียก Script แบบนี้ถูกต้องตามหลักปฏิบัติครับ --}}
    <script src="{{ $_ENV['APP_JS'] }}/RgrSummaryReport.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection