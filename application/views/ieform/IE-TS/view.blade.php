@extends('layouts/webflowTemplate')
@section('styles')
    <style>
        /* ซ่อนลูกศรขึ้นลงของ input number ให้ดูคลีนขึ้น */
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }

        input[type=number] {
            -moz-appearance: textfield;
            /* สำหรับ Firefox */
        }

        /* ลบกรอบและปรับพื้นหลังของ Select2 ให้กลืนกับ Tailwind */
        .select2-container--default .select2-selection--single {
            border: none !important;
            border-radius: 0 !important;
            background-color: transparent !important;

            /* 👇 ปรับความสูงตรงนี้ ลองเปลี่ยนเป็น 34px หรือ 36px ให้พอดีกับช่องอื่น */
            height: 36px !important;
            min-height: 36px !important;

            display: flex !important;
            align-items: center !important;
            box-shadow: none !important;
        }

        /* จัดข้อความให้อยู่กึ่งกลางพอดี */
        .select2-container--default .select2-selection--single .select2-selection__rendered {
            padding-left: 0.75rem !important;
            color: #0f172a !important;
            font-size: 0.875rem !important;
            line-height: normal !important;
            /* เพิ่มบรรทัดนี้เพื่อไม่ให้ข้อความดันกล่อง */
        }
    </style>
@endsection
@section('contents')
    <div class="hidden form-info" nfrmno="{{ $NFRMNO }}" vorgno="{{ $VORGNO }}" cyear="{{ $CYEAR }}"
        mode="{{ $mode }}" cyear2="{{ $mode != 1 ? $CYEAR2 : '' }}" nrunno="{{ $mode != 1 ? $NRUNNO : '' }}"></div>
    <div class="hidden apv-data" empno="{{ $empno }}"></div>
    <form id="frmmain">
        <div class="max-w-7xl mx-auto space-y-6">
            <!-- Header -->
            <h1 class="text-3xl font-extrabold text-center text-[#2CA9E1] tracking-tight">TS ADJUST</h1>

            <!-- Top Section: Form Card -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div class="flex flex-col lg:flex-row gap-6">
                    <!-- Left Form -->
                    <div id="form-detail" class="flex-1 flex flex-col gap-4">
                    </div>

                    <!-- Right Form (Textarea) -->
                    <div id="remark-section"
                        class="flex-1 flex flex-col rounded-md shadow-sm ring-1 ring-inset ring-slate-300 overflow-hidden">
                        <div class="bg-slate-50 text-slate-600 font-medium text-sm px-4 py-2 border-b border-slate-300">
                            Reason &
                            Remark</div>
                        <textarea name="txtRemark" class="flex-1 w-full bg-white p-3 text-sm text-slate-900 focus:outline-none resize-none"
                            placeholder="Type your remarks here..."></textarea>
                    </div>
                </div>
            </div>


            <table id="TsTable"
                class="display w-full whitespace-nowrap border-separate border-spacing-0 text-xs font-medium border-t border-l border-slate-200">
                <thead>
                    <!-- แถวที่ 1: หัวตารางหลัก -->
                    <tr class="bg-slate-50 text-slate-700">
                        <th rowspan="2"
                            class="col-no sticky-column sticky z-20 border-b border-r border-slate-200 px-3 py-2.5 text-center font-bold tracking-wider">
                            NO
                        </th>
                        <th rowspan="2"
                            class="col-part sticky-column sticky z-20 border-b border-r border-slate-200 px-3 py-2.5 text-left font-bold tracking-wider">
                            PART
                            NAME</th>
                        <th rowspan="2"
                            class="col-item border-b border-r border-slate-200 px-3 py-2.5 text-center font-bold tracking-wider">
                            ITEM
                        </th>
                        <th rowspan="2"
                            class="col-dwg border-b border-r border-slate-200 px-3 py-2.5 text-center font-bold tracking-wider">
                            DWG
                        </th>
                        <th rowspan="2"
                            class="col-qty border-b border-r border-slate-200 px-3 py-2.5 text-center font-bold tracking-wider">
                            Q'ty
                        </th>
                        <th rowspan="2"
                            class="col-process border-b border-r border-slate-200 px-3 py-2.5 text-center font-bold tracking-wider">
                            Process</th>

                        <!-- Current -->
                        <th colspan="3"
                            class="border-b border-r border-slate-200 px-3 py-2 text-center bg-slate-100 text-blue-900 font-bold">
                            Current : STD Time (AS400)
                        </th>

                        <!-- After -->
                        <th colspan="3"
                            class="border-b border-r border-slate-200 px-3 py-2 text-center bg-amber-50 text-amber-900 font-bold">
                            After : Present Time Adjusts
                        </th>

                        <!-- Total Request -->
                        <th rowspan="2"
                            class="col-total-req border-b border-r border-slate-200 px-3 py-2.5 text-center bg-red-50 text-red-700 font-bold leading-tight">
                            Total Request<br><span class="text-[10px] font-normal">(Hr)</span>
                        </th>

                        <!-- IE Incharge Check & Accept (เพิ่มใหม่) -->
                        <th colspan="3"
                            class="border-b border-r border-slate-200 px-3 py-2 text-center bg-green-50 text-green-900 font-bold">
                            IE Incharge Check & Accept
                        </th>
                        <th rowspan="2"
                            class="col-accept border-b border-r border-slate-200 px-3 py-1.5 text-center bg-green-100 font-bold text-green-800">
                            Accept <span class="text-[9px]">(Hr)</span></th>

                        <!-- Requested History -->
                        <th rowspan="2"
                            class="col-history border-b border-r border-slate-200 px-3 py-2.5 text-center font-bold tracking-wider">
                            Requested<br>History
                        </th>

                        <!-- (คอลัมน์ Action ถูกตัดออกตามรีเควสต์) -->
                    </tr>

                    <!-- แถวที่ 2: หัวตารางย่อย -->
                    <tr class="text-slate-500 bg-slate-50">
                        <!-- Current Sub -->
                        <th class="col-cur-tp border-b border-r border-slate-200 px-3 py-1.5 text-center bg-slate-100/50">TP
                            <span class="text-[9px]">(Hr)</span>
                        </th>
                        <th class="col-cur-tc border-b border-r border-slate-200 px-3 py-1.5 text-center bg-slate-100/50">TC
                            <span class="text-[9px]">(Hr)</span>
                        </th>
                        <th
                            class="col-cur-ts border-b border-r border-slate-200 px-3 py-1.5 text-center bg-slate-100/80 font-bold text-blue-900">
                            TS <span class="text-[9px]">(Hr)</span></th>

                        <!-- After Sub -->
                        <th class="col-after-tp border-b border-r border-slate-200 px-3 py-1.5 text-center bg-amber-50/30">
                            TP <span class="text-[9px]">(Hr)</span></th>
                        <th class="col-after-tc border-b border-r border-slate-200 px-3 py-1.5 text-center bg-amber-50/30">
                            TC <span class="text-[9px]">(Hr)</span></th>
                        <th
                            class="col-after-ts border-b border-r border-slate-200 px-3 py-1.5 text-center bg-amber-50/70 font-bold text-amber-950">
                            TS <span class="text-[9px]">(Hr)</span></th>

                        <!-- IE Incharge Sub (เพิ่มใหม่) -->
                        <th class="col-ie-tp border-b border-r border-slate-200 px-3 py-1.5 text-center bg-green-50/30">TP
                            <span class="text-[9px]">(Hr)</span>
                        </th>
                        <th class="col-ie-tc border-b border-r border-slate-200 px-3 py-1.5 text-center bg-green-50/30">TC
                            <span class="text-[9px]">(Hr)</span>
                        </th>
                        <th
                            class="col-ie-ts border-b border-r border-slate-200 px-3 py-1.5 text-center bg-green-50/70 font-bold text-green-900">
                            TS <span class="text-[9px]">(Hr)</span></th>

                    </tr>

                    <!-- แถวที่ 3: แถว Sum -->
                    <tr class="bg-white">
                        <th colspan="6" class="border-b border-slate-200"></th>

                        <!-- Sum Current -->
                        <th colspan="2"
                            class="border-b border-slate-200 px-3 py-2 text-right pr-3 text-blue-700 font-bold text-xs">Sum
                        </th>
                        <th class="border-b border-r border-slate-200 px-2 py-1.5">
                            <span id="sum-current-ts"
                                class="inline-block w-full px-2 py-1 text-center font-bold rounded-md bg-slate-200 text-slate-800 border border-slate-300 shadow-sm">0.0000</span>
                        </th>

                        <!-- Sum After -->
                        <th colspan="2"
                            class="border-b border-slate-200 px-3 py-2 text-right pr-3 text-blue-700 font-bold text-xs">Sum
                        </th>
                        <th class="border-b border-r border-slate-200 px-2 py-1.5">
                            <span id="sum-after-ts"
                                class="inline-block w-full px-2 py-1 text-center font-bold rounded-md bg-amber-100 text-amber-900 border border-amber-200 shadow-sm">0.0000</span>
                        </th>

                        <!-- Sum Total Request -->
                        <th class="border-b border-r border-slate-200 px-2 py-1.5 bg-red-50/50">
                            <div
                                class="flex items-center justify-between bg-red-100/80 border border-red-200 rounded-md px-2 py-1 text-red-700 font-bold shadow-sm">
                                <span class="text-[10px] text-red-600/80 font-normal mr-3">Sum</span>
                                <span id="sum-total" class="flex-1 text-right text-xs">+ 0.0000</span>
                            </div>
                        </th>

                        <!-- Sum IE Incharge (เพิ่มใหม่) -->
                        <th colspan="2"
                            class="border-b border-slate-200 px-3 py-2 text-right pr-3 text-green-700 font-bold text-xs">Sum
                        </th>
                        <th class="border-b border-slate-200 px-2 py-1.5">
                            <span id="sum-ie-ts"
                                class="inline-block w-full px-2 py-1 text-center font-bold rounded-md bg-green-50 text-green-800 border border-green-200 shadow-sm"></span>
                        </th>
                        <th class="border-b border-r border-slate-200 px-2 py-1.5 bg-green-50/50">
                            <div
                                class="flex items-center justify-between bg-green-100/80 border border-green-200 rounded-md px-2 py-1 text-green-700 font-bold shadow-sm">
                                <span class="text-[10px] text-green-600/80 font-normal mr-3">Sum</span>
                                <span id="sum-ie-accept" class="flex-1 text-right text-xs"></span>
                        </th>

                        <!-- เว้นช่องประวัติ -->
                        <th class="border-b border-r border-slate-200 bg-white"></th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
            <!-- Bottom Actions (Pastel Tone) -->
            <div id="form-action-container"></div>
        </div>
    </form>
@endsection
@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/ietsview.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
