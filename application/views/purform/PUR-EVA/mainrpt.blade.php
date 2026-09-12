@extends('layouts/webflowTemplate')

@section('styles')
    <style>
        section {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        fieldset:not(:has(.fieldset-label)) {
            display: flex;
        }

        fieldset span {
            font-weight: bold;
            white-space: nowrap;
            width: fit-content;
        }


        span.required::after,
        h2.required::after,
        label.required::after {
            content: "**";
            color: red;
            font-weight: bold;
            padding-left: 0.25rem;
        }

        /* การทำเงาและขอบที่นุ่มนวล */
        #searchModal {
            border: none;
            border-radius: 20px;
            /* มุมมนรับกับ UI สมัยใหม่ */
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            /* เงาเข้มเพื่อดึงให้ลอย */
            padding: 0;
            overflow: hidden;
            background: white;
        }

        /* ใส่ Gradient ให้หัวข้อ เพื่อให้ดูมี Layer */
        .modal-header-gradient {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            color: white;
            padding: 20px 24px;
        }

        /* เพิ่ม Effect ให้รายการตอน Hover */
        .select-item {
            transition: all 0.3s ease;
            border-left: 4px solid transparent;
        }

        .select-item:hover {
            background-color: #f1f5f9;
            border-left: 4px solid #3b82f6;
            /* มีเส้นแถบสีน้ำเงินขึ้นที่ขอบซ้าย */
        }

        #tableSearch tbody tr:hover {
            background-color: #eff6ff !important;
            /* คือสี blue-50 */
            cursor: pointer !important;
        }
    </style>
@endsection
@section('contents')
    <!-- คลุมด้วย Card Design แบบขอบมนและเงานุ่มขึ้น -->
    <div
        class="max-w-6xl mx-auto p-8 bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-slate-100">
        <form id="frmmain">

            <!-- หัวข้อ (ปรับเส้นสายให้เป็น Pill โค้งมน) -->
            <div class="border-b border-slate-100 pb-5 mb-8 flex items-center gap-3">
                <div class="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                <h2 class="font-bold text-xl text-slate-800 tracking-tight">History Evaluation</h2>
            </div>

            <!-- โครงสร้าง Grid แบ่ง 2 คอลัมน์หลัก -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6 items-start">

                <!-- ================= คอลัมน์ซ้าย ================= -->
                <div class="flex flex-col gap-4">

                    <!-- ปรับช่อง label ซ้ายสุดเป็น 140px ทั้งหมด -->
                    <div class="grid grid-cols-[140px_1fr] items-center gap-2">
                        <label class="text-sm font-medium text-slate-700 whitespace-nowrap">Form no. (Ext.26)</label>
                        <input type="text" name="FORM_NO"
                            class="w-full max-w-sm h-9 px-3.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg shadow-sm outline-none transition-all hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                    </div>

                    <div class="grid grid-cols-[140px_1fr] items-center gap-2">
                        <label class="text-sm font-medium text-slate-700 whitespace-nowrap">Vendor code</label>
                        <input type="text" name="VENDOR_CODE"
                            class="w-full max-w-sm h-9 px-3.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg shadow-sm outline-none transition-all hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                    </div>

                    <div class="grid grid-cols-[140px_1fr] items-center gap-2">
                        <label class="text-sm font-medium text-slate-700 whitespace-nowrap">Vendor name</label>
                        <input type="text" name="VENDOR_NAME"
                            class="w-full max-w-sm h-9 px-3.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg shadow-sm outline-none transition-all hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                    </div>

                    <div class="grid grid-cols-[140px_1fr] items-center gap-2">
                        <label class="text-sm font-medium text-slate-700 whitespace-nowrap">Vendor Group Type <span
                                class="text-rose-500 font-bold">*</span></label>
                        <select name="VENDOR_GROUP_TYPE"
                            class="w-full max-w-sm h-9 px-3.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg shadow-sm outline-none transition-all hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%24%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.75rem_center] bg-[length:1em_1em] pr-10">
                            <option value="">-- Select --</option>
                            <option value="Direct">Direct</option>
                            <option value="Indirect">Indirect</option>
                            <option value="Subcon">Subcon</option>
                        </select>
                    </div>

                    <div class="grid grid-cols-[140px_1fr] items-center gap-2">
                        <label class="text-sm font-medium text-slate-700 whitespace-nowrap">Requester</label>
                        <input type="text" name="REQUESTER"
                            class="w-full max-w-sm h-9 px-3.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg shadow-sm outline-none transition-all hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                    </div>

                    <div class="grid grid-cols-[140px_1fr] items-center gap-2">
                        <label class="text-sm font-medium text-slate-700 whitespace-nowrap">Flow status</label>
                        <select name="CST"
                            class="w-full max-w-sm h-9 px-3.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg shadow-sm outline-none transition-all hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%24%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.75rem_center] bg-[length:1em_1em] pr-10">
                            <option value="">-- Select --</option>
                            <option value="2">Approve</option>
                            <option value="3">Reject</option>
                            <option value="1">Running</option>
                        </select>
                    </div>

                    <!-- Request Date -->
                    <div class="grid grid-cols-[140px_1fr] items-center gap-2">
                        <label class="text-sm font-medium text-slate-700 whitespace-nowrap">Request date <span
                                class="text-rose-500 font-bold">*</span></label>
                        <div class="flex items-center gap-4 whitespace-nowrap">
                            <!-- เปลี่ยนจาก w-32 เป็น w-[140px] -->
                            <input type="date" name="REQUEST_DATE_FROM"
                                class="w-[140px] h-9 px-3 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg shadow-sm outline-none transition-all hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                            <span class="text-sm font-medium text-slate-400">to</span>
                            <!-- เปลี่ยนจาก w-32 เป็น w-[140px] -->
                            <input type="date" name="REQUEST_DATE_TO"
                                class="w-[140px] h-9 px-3 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg shadow-sm outline-none transition-all hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                        </div>
                    </div>

                    <!-- Sort by -->
                    <div class="grid grid-cols-[140px_1fr] items-center gap-2">
                        <label class="text-sm font-medium text-slate-700 whitespace-nowrap">Sort by</label>
                        <select name="SORT_BY"
                            class="w-full max-w-sm h-9 px-3.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg shadow-sm outline-none transition-all hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%24%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.75rem_center] bg-[length:1em_1em] pr-10">
                            <option value="VENDCODE">Vendor code</option>
                            <option value="COMNAME">Vendor name</option>
                            <option value="VREQNAME">Requester</option>
                            <option value="VREQNO">Emp No.</option>
                        </select>
                    </div>
                </div>

                <!-- ================= คอลัมน์ขวา ================= -->
                <div class="flex flex-col gap-4">
                    <div class="grid grid-cols-[120px_1fr] items-center gap-2">
                        <label class="text-sm font-medium text-slate-700 whitespace-nowrap">Emp No.</label>
                        <input type="text" name="EMP_NO"
                            class="w-full max-w-xs h-9 px-3.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg shadow-sm outline-none transition-all hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                    </div>

                    <div class="grid grid-cols-[120px_1fr] items-center gap-2">
                        <label class="text-sm font-medium text-slate-700 whitespace-nowrap">Section</label>
                        <select name="SECTION" id="SECTION"
                            class="sec w-full max-w-xs h-9 px-3.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg shadow-sm outline-none transition-all hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%24%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.75rem_center] bg-[length:1em_1em] pr-10">
                            <option value="">-- Select --</option>
                        </select>
                    </div>

                    <div class="grid grid-cols-[120px_1fr] items-center gap-2">
                        <label class="text-sm font-medium text-slate-700 whitespace-nowrap">Department</label>
                        <select name="DEPARTMENT" id="DEPARTMENT"
                            class="dept w-full max-w-xs h-9 px-3.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg shadow-sm outline-none transition-all hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%24%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.75rem_center] bg-[length:1em_1em] pr-10">
                            <option value="">-- Select --</option>
                        </select>
                    </div>

                    <div class="grid grid-cols-[120px_1fr] items-center gap-2">
                        <label class="text-sm font-medium text-slate-700 whitespace-nowrap">Division</label>
                        <select name="DIVISION" id="DIVISION"
                            class="div w-full max-w-xs h-9 px-3.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg shadow-sm outline-none transition-all hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%24%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.75rem_center] bg-[length:1em_1em] pr-10">
                            <option value="">-- Select --</option>
                        </select>
                    </div>
                </div>

            </div>

            <!-- ================= ปุ่ม Action ================= -->
            <div class="mt-10 pt-5 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" id="btnClear"
                    class="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all">
                    Clear
                </button>

                <button type="button" id="btnExport"
                    class="px-5 py-2.5 text-sm font-semibold text-emerald-800 bg-emerald-100 border border-emerald-200 rounded-lg hover:bg-emerald-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                </button>
            </div>

        </form>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/purEvarpt.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
