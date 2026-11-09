@extends('layouts/webflowTemplate')

@section('contents')
    <!-- แนะนำให้ใส่คลาส bg-base-200 หรือ bg-slate-50 ที่ tag <body> เพื่อให้หน้าเว็บมีมิติ -->
    <div
        class="w-full max-w-[1400px] mx-auto bg-base-100 rounded-2xl shadow-lg border border-base-200 overflow-hidden p-6 lg:p-8 my-8 text-base-content">

        <!-- Container หลัก -->
        <div class="w-full flex flex-col lg:flex-row gap-8">

            <!-- ================= ฝั่งซ้าย (ส่วนตารางและข้อมูลหลัก) ================= -->
            <div class="lg:w-2/3 flex flex-col gap-5">

                <!-- หัวข้อ -->
                <div class="flex items-center gap-3">
                    <div class="p-3 bg-primary/10 rounded-lg text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                            stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 class="text-3xl font-extrabold tracking-tight text-neutral">Overtime Working Plan</h1>
                </div>

                <!-- กล่องคำเตือน (ปรับให้อ่านง่าย ชัดเจน) -->
                <div class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg flex gap-3 text-amber-900 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 text-amber-500 mt-0.5" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div class="text-sm font-medium leading-relaxed">
                        ระบบบันทึกการวางแผนทำงานล่วงเวลา ผู้ใช้สามารถวางแผน/เปลี่ยนแปลงข้อมูลได้ก่อน
                        <span class="font-bold underline text-amber-950">5
                            วันสุดท้ายของสิ้นเดือน(นับเฉพาะวันทำงานปกติ)</span><br>
                        จากนั้นระบบจะส่งข้อมูลเพื่อขออนุมัติ และไม่อนุญาตให้แก้ไขข้อมูลหลังจากนั้น<br>
                        <span
                            class="text-xs font-normal opacity-80">(พนักงานยังสามารถทำโอทีได้โดยบันทึกข้อมูลที่หน้าโอทีปกติ
                            แต่จะถูกนับเป็นรายการที่ไม่วางแผนล่วงหน้า)</span>
                    </div>
                </div>

                <!-- เดือนที่ Plan & ฟิลเตอร์ -->
                <div
                    class="flex items-center justify-between bg-base-200/50 p-3 rounded-xl border border-base-200 shadow-sm">
                    <div class="flex items-center gap-3">
                        <span class="font-semibold text-neutral text-sm px-2">Plan Month :</span>
                        <div class="badge badge-primary badge-outline badge-lg font-bold shadow-sm" id="monthOT">Month -
                            Year</div>
                    </div>
                    <!-- เผื่อมีปุ่มค้นหาหรือฟิลเตอร์อื่นๆ ในอนาคต -->
                </div>

                <!-- ตาราง -->
                <div class="w-full bg-base-100 rounded-xl border border-base-200 shadow-sm overflow-hidden">
                    <div class="overflow-x-auto px-4 py-3">
                        <table class="table table-zebra table-sm w-full" id="tableOT">
                        </table>
                    </div>
                </div>
            </div>

            <!-- ================= ฝั่งขวา (แบบฟอร์มและสรุป) ================= -->
            <div class="lg:w-1/3 flex flex-col gap-6">

                <!-- Card สรุป 3 กล่อง (ทองแดง, เงิน, ทอง) -->
                <div class="grid grid-cols-3 gap-3">
                    <!-- ทองแดง (Bronze) - Rate 1.3 -->
                    <div
                        class="bg-gradient-to-br from-amber-600 to-orange-700 text-white rounded-2xl flex flex-col items-center justify-center p-4 shadow-md shadow-orange-700/20 border border-orange-500/30">
                        <span class="text-xs font-semibold text-orange-100/80 mb-1">Rate 1.3</span>
                        <span class="text-3xl font-black drop-shadow-md" id="bronze">0</span>
                    </div>
                    <!-- เงิน (Silver) - Rate 1.5 -->
                    <div
                        class="bg-gradient-to-br from-slate-400 to-slate-600 text-white rounded-2xl flex flex-col items-center justify-center p-4 shadow-md shadow-slate-600/20 border border-slate-300/30">
                        <span class="text-xs font-semibold text-slate-100/80 mb-1">Rate 1.5</span>
                        <span class="text-3xl font-black drop-shadow-md" id="silver">0</span>
                    </div>
                    <!-- ทอง (Gold) - Rate 3.0 -->
                    <div
                        class="bg-gradient-to-br from-yellow-400 to-amber-500 text-white rounded-2xl flex flex-col items-center justify-center p-4 shadow-md shadow-amber-500/30 border border-yellow-300/40">
                        <span class="text-xs font-semibold text-amber-50/90 mb-1">Rate 3.0</span>
                        <span class="text-3xl font-black drop-shadow-md" id="gold">0</span>
                    </div>
                </div>

                <!-- Template file for download -->
                <div class="bg-base-100 rounded-xl border border-base-200 shadow-sm p-5">
                    <h3 class="font-bold text-sm text-neutral mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-success" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Template for Upload
                    </h3>

                    <a class="flex items-center justify-between p-3 rounded-lg border border-base-300 bg-base-200/30 hover:bg-base-200 transition-colors w-full cursor-pointer group"
                        id="templateOT">
                        <div class="flex items-center gap-3">
                            <div class="p-2 bg-success/10 rounded-md">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-success" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <span
                                class="text-sm font-semibold text-neutral group-hover:text-primary transition-colors">FE-OT_template.xlsx</span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg"
                            class="h-5 w-5 text-base-content/40 group-hover:text-primary transition-colors" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </a>
                </div>

                <!-- กล่องฟอร์มกรอกข้อมูล -->
                <form class="bg-base-100 rounded-xl border border-base-200 shadow-sm p-5" id="OTform">

                    <div class="flex flex-col gap-4 mb-4">
                        <h2 class="font-bold text-lg text-neutral border-b border-base-200 pb-2">Add / Update Plan</h2>

                        <!-- ส่วนอัปโหลดไฟล์ -->
                        <div class="form-control w-full">
                            <label class="label pt-0"><span class="label-text font-medium text-neutral/70">Upload Excel
                                    File</span></label>
                            <input type="file"
                                class="file-input file-input-bordered file-input-primary file-input-sm w-full"
                                accept=".xlsx,.xlsm" id="uploadFile" />
                        </div>
                    </div>

                    <div class="divider my-2 text-xs text-base-content/40">OR MANUAL INPUT</div>

                    <div class="flex flex-col gap-4 mt-2">
                        <!-- EmpNo -->
                        <div class="form-control w-full">
                            <label class="label pt-0"><span class="label-text font-medium">Empno</span></label>
                            <input type="text" class="input input-bordered input-sm w-full focus:border-primary"
                                id="empNo" name="SEMPNO" />
                        </div>

                        <!-- Work Date -->
                        <div class="form-control w-full">
                            <label class="label pt-0"><span class="label-text font-medium">Work Date</span></label>
                            <input type="date" class="input input-bordered input-sm w-full focus:border-primary"
                                id="calendarOT" name="WORKDATE" />
                        </div>

                        <!-- Work Time -->
                        <div class="form-control w-full">
                            <label class="label pt-0"><span class="label-text font-medium">Work Time</span></label>
                            <div class="flex gap-3 w-full">
                                <div class="w-1/2 relative">
                                    <input type="time" placeholder="Time In"
                                        class="input input-bordered input-sm w-full focus:border-primary" id="timeIN"
                                        name="WORKTIMEIN" />
                                </div>
                                <div class="flex items-center text-base-content/50">-</div>
                                <div class="w-1/2 relative">
                                    <input type="time" placeholder="Time out"
                                        class="input input-bordered input-sm w-full focus:border-primary" id="timeOUT"
                                        name="WORKTIMEOUT" />
                                </div>
                            </div>
                        </div>

                        <input type="hidden" id="PLANYEAR" name="PLANYEAR">
                        <input type="hidden" id="PLANMONTH" name="PLANMONTH">
                        <input type="hidden" id="OTHour" name="OTHour">
                        <input type="hidden" id="OTType" name="OTType">

                        <!-- Work Detail -->
                        <div class="form-control w-full">
                            <label class="label pt-0"><span class="label-text font-medium">Work Detail</span></label>
                            <textarea class="textarea textarea-bordered w-full  focus:border-primary " id="deTail"
                                placeholder="Enter OT reason or details..."></textarea>
                        </div>

                        <!-- ปุ่มบันทึก -->
                        <button class="btn btn-primary w-full mt-2 text-white shadow-lg shadow-primary/30 rounded-lg"
                            id="saveOT">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            Save Plan
                        </button>
                    </div>
                    
                </form>

            </div>
        </div>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/feOT.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
