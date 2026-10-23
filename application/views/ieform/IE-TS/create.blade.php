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
        mode="{{ $mode }}" cyear2="{{ $mode != 1 ? $CYEAR2 : '' }}" nrunno="{{ $mode != 1 ? $NRUNNO : '' }}"
        return="{{ $return ?? '' }}"></div>
    <div class="hidden apv-data" empno="{{ $empno }}"></div>
    <form id="frmmain">
        <div class="max-w-7xl mx-auto space-y-6">
            <!-- Header -->
            <h1 class="text-3xl font-extrabold text-center text-[#2CA9E1] tracking-tight">TS ADJUST</h1>

            <!-- Top Section: Form Card -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div class="flex flex-col lg:flex-row gap-6">
                    <!-- Left Form -->
                    <div class="flex-1 flex flex-col gap-4">

                        <!-- Input by -->
                        <div
                            class="flex rounded-md shadow-sm border border-slate-300 focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden">
                            <label
                                class="flex items-center justify-center w-1/3 bg-slate-50 text-slate-600 font-medium text-sm border-r border-slate-300 px-3">
                                Input by
                            </label>
                            <input name="INPUTBY" type="text" value="{{ $empno }}" readonly
                                class="w-2/3 border-0 bg-transparent py-2 pl-3 text-slate-900 text-sm focus:ring-0 outline-none">
                        </div>

                        <!-- Request by -->
                        <div
                            class="flex rounded-md shadow-sm border border-slate-300 focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden">
                            <label
                                class="flex items-center justify-center w-1/3 bg-slate-50 text-slate-600 font-medium text-sm border-r border-slate-300 px-3">
                                Request by
                            </label>
                            <input name = "REQBY" type="text" value="{{ $empno }}" maxlength="5"
                                class="w-2/3 border-0 bg-white py-2 pl-3 text-slate-900 text-sm focus:ring-0 outline-none">
                        </div>
                        <!-- Section -->
                        <div
                            class="flex rounded-md shadow-sm border border-slate-300 focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden">
                            <label
                                class="flex shrink-0 items-center justify-center w-1/3 bg-slate-50 text-slate-600 font-medium text-sm border-r border-slate-300 px-3 text-center">
                                Section
                            </label>
                            <select name="TSORGNO" id="TSORGNO"
                                class="w-2/3 border-0 bg-gray-50 py-2 pl-3 text-slate-900 text-sm focus:ring-0 outline-none disabled:text-gray-400">
                                <option value="">---------</option>
                            </select>
                        </div>

                        <!-- Production (JUN) -->
                        <div
                            class="flex rounded-md shadow-sm border border-slate-300 focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden">
                            <label
                                class="flex items-center justify-center w-1/3 bg-slate-50 text-slate-600 font-medium text-sm border-r border-slate-300 px-3">
                                Production (JUNG)
                            </label>
                            <input type="text" name="jung" id="jung"
                                class="w-2/3 border-0 bg-white py-2 pl-3 text-slate-900 text-sm focus:ring-0 outline-none">
                        </div>

                    </div>

                    <!-- Right Form (Textarea) -->
                    <div class="flex-1 flex flex-col rounded-md shadow-sm ring-1 ring-inset ring-slate-300 overflow-hidden">
                        <div class="bg-slate-50 text-slate-600 font-medium text-sm px-4 py-2 border-b border-slate-300">
                            Reason &
                            Remark</div>
                        <textarea name="txtRemark" class="flex-1 w-full bg-white p-3 text-sm text-slate-900 focus:outline-none resize-none"
                            placeholder="Type your remarks here..."></textarea>
                    </div>
                </div>
            </div>

            <!-- Search Bar Card -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-wrap items-center gap-3">
                <div class="flex rounded-md shadow-sm border border-slate-300 overflow-hidden">
                    <span
                        class="bg-slate-100 text-slate-700 border-r border-slate-300 px-4 py-2 text-sm font-bold flex items-center">
                        Drawing
                    </span>
                    <input id="dwgNo" type="text" placeholder="Dwg No."
                        class="auto-tab border-0 bg-white px-3 py-2 text-sm w-32 outline-none focus:ring-0" maxlength="9">
                </div>
                <input type="text" placeholder="G no." id="gNo" maxlength="3"
                    class="auto-tab rounded-md border border-slate-300 px-3 py-2 text-sm w-24 outline-none focus:ring-2 focus:ring-[#245D9B]">
                <input type="text" placeholder="L no." id="l1No"
                    class="auto-tab rounded-md border border-slate-300 px-3 py-2 text-sm w-24 outline-none focus:ring-2 focus:ring-[#245D9B]">
                <span class="text-slate-400 font-bold">-</span>
                <input type="text" placeholder="L no." id="l2No"
                    class="rounded-md border border-slate-300 px-3 py-2 text-sm w-24 outline-none focus:ring-2 focus:ring-[#245D9B]">
                <button type="button" id="btnAdd"
                    class="bg-blue-100 hover:bg-blue-200 border border-blue-200 text-blue-700 font-bold px-6 py-2 text-sm rounded-lg shadow-sm transition ml-auto">
                    ADD
                </button>
            </div>

            <table id="TsTable"
                class="display w-full whitespace-nowrap border-separate border-spacing-0 text-xs font-medium border-t border-l border-slate-200">
                <thead>
                    <!-- แถวที่ 1: หัวตารางหลัก -->
                    <tr class="bg-slate-50 text-slate-700">
                        <th rowspan="2"
                            class="border-b border-r border-slate-200 px-3 py-2.5 text-center font-bold tracking-wider">NO
                        </th>
                        <th rowspan="2"
                            class="border-b border-r border-slate-200 px-3 py-2.5 text-left font-bold tracking-wider">PART
                            NAME</th>
                        <th rowspan="2"
                            class="border-b border-r border-slate-200 px-3 py-2.5 text-center font-bold tracking-wider">ITEM
                        </th>
                        <th rowspan="2"
                            class="border-b border-r border-slate-200 px-3 py-2.5 text-center font-bold tracking-wider">DWG
                        </th>
                        <th rowspan="2"
                            class="border-b border-r border-slate-200 px-3 py-2.5 text-center font-bold tracking-wider">Q'ty
                        </th>
                        <th rowspan="2"
                            class="border-b border-r border-slate-200 px-3 py-2.5 text-center font-bold tracking-wider">
                            Process</th>

                        <!-- Current -->
                        <th colspan="3"
                            class="border-b border-r border-slate-200 px-3 py-2 text-center bg-slate-100 text-blue-900 font-bold">
                            Current : STD Time (AS400)</th>

                        <!-- After -->
                        <th colspan="3"
                            class="border-b border-r border-slate-200 px-3 py-2 text-center bg-amber-50 text-amber-900 font-bold">
                            After : Present Time Adjusts</th>

                        <!-- Total Request -->
                        <th rowspan="2"
                            class="border-b border-r border-slate-200 px-3 py-2.5 text-center bg-red-50 text-red-700 font-bold leading-tight">
                            Total Request<br><span class="text-[10px] font-normal">(Hr)</span></th>
                        <th rowspan="2"
                            class="border-b border-r border-slate-200 px-3 py-2.5 text-center font-bold tracking-wider">
                            Requested<br>History</th>

                        <!-- เพิ่มคอลัมน์ใหม่ Action ด้านหลังสุด (คอลัมน์ที่ 15) -->
                        <th rowspan="2"
                            class="border-b border-slate-200 px-3 py-2.5 text-center font-bold text-red-500 tracking-wider">
                            Action
                        </th>
                    </tr>

                    <!-- แถวที่ 2: หัวตารางย่อย -->
                    <tr class="text-slate-500 bg-slate-50">
                        <th class="border-b border-r border-slate-200 px-3 py-1.5 text-center bg-slate-100/50">TP <span
                                class="text-[9px]">(Hr)</span></th>
                        <th class="border-b border-r border-slate-200 px-3 py-1.5 text-center bg-slate-100/50">TC <span
                                class="text-[9px]">(Hr)</span></th>
                        <th
                            class="border-b border-r border-slate-200 px-3 py-1.5 text-center bg-slate-100/80 font-bold text-blue-900">
                            TS <span class="text-[9px]">(Hr)</span></th>

                        <th class="border-b border-r border-slate-200 px-3 py-1.5 text-center bg-amber-50/30">TP <span
                                class="text-[9px]">(Hr)</span></th>
                        <th class="border-b border-r border-slate-200 px-3 py-1.5 text-center bg-amber-50/30">TC <span
                                class="text-[9px]">(Hr)</span></th>
                        <th
                            class="border-b border-r border-slate-200 px-3 py-1.5 text-center bg-amber-50/70 font-bold text-amber-950">
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

                        <!-- ช่อง Sum Total Request -->
                        <th class="border-b border-r border-slate-200 px-2 py-1.5 bg-red-50/50">
                            <div
                                class="flex items-center justify-between bg-red-100/80 border border-red-200 rounded-md px-2 py-1 text-red-700 font-bold shadow-sm">
                                <span class="text-[10px] text-red-600/80 font-normal mr-3">Sum</span>
                                <span id="sum-total" class="flex-1 text-right text-xs">+ 0.0000</span>
                            </div>
                        </th>

                        <!-- เว้นช่องประวัติ -->
                        <th class="border-b border-r border-slate-200 bg-white"></th>

                        <!-- เพิ่มช่องว่างในแถว sum สำหรับคอลัมน์ Action ด้านหลังสุด (คอลัมน์ที่ 15) -->
                        <th class="border-b border-slate-200 bg-white"></th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
            <!-- Bottom Actions (Pastel Tone) -->
            <div class="flex justify-center items-center gap-4 mt-6 pb-8">

                <!-- SAVE: พาสเทลเทา (ดูเป็นปุ่มรอง) -->
                <button type="button" id="btnDraft" name="btnDraft" value="draft"
                    class="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 font-bold py-2.5 px-8 rounded-lg shadow-sm transition btnact">
                    SAVE
                </button>

                <!-- SEND: พาสเทลฟ้า/น้ำเงิน (ปุ่มหลัก ดูซอฟต์แต่ยังโดดเด่น) -->
                <button type="button" id="btnRequest" name="btnRequest" value="request"
                    class="bg-blue-100 hover:bg-blue-200 border border-blue-200 text-blue-700 font-bold py-2.5 px-8 rounded-lg shadow-sm transition btnact">
                    SEND
                </button>

            </div>

        </div>
    </form>
@endsection
@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/iets.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
