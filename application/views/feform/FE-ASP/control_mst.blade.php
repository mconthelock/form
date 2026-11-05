@extends('layouts/webflowTemplate')
<script>
    window.MASTER_CONTROLS = @json($controls ?? []);
    window.CURRENT_EMPNO   = @json($empno ?? ''); // เพิ่มบรรทัดนี้ลงไป
</script>
@section('contents')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-6 border-b border-slate-200">
        <div>
            <div class="flex items-center gap-2">
                <span class="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-100 text-emerald-800">ADMIN ONLY</span>
                <h1 class="text-xl font-bold text-slate-800">⚙️ Master Control Number Configuration</h1>
                
                <input type="hidden" id="EMPNOHid" value="{{ $empno ?? '' }}">
            </div>
            <p class="text-xs text-slate-500 mt-1">จัดการรหัสเอกสาร สังกัดแผนกที่ใช้งาน และผู้รับผิดชอบการสร้างเอกสารประจำปี (Auto Job)</p>
        </div>
        <div class="mt-4 sm:mt-0 flex flex-wrap gap-2">
            <!-- ปุ่มส่งเมลซ้ำทั้งหมด  -->
            <button type="button" id="btnResendEmailAll"
                    class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer">
                📩 ส่งเมลแจ้งเตือนซ้ำทั้งหมด
            </button>

            <!-- ปุ่มเดิม -->
            <button type="button" id="btnRunYearlyAll"
                    class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer">
                ⚡ รัน Yearly Review ทั้งหมด
            </button>
            <button type="button" id="btnOpenAddModal"
                    class="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer">
                ➕ เพิ่ม Control No.
            </button>
        </div>
    </div>

    <!-- Data Table Container (Render ผ่าน DataTables ใน JS 100%) -->
    <div class="bg-white border border-slate-200 rounded-2xl shadow-xs p-5">
        <table id="ctrlMstTable" class="w-full text-xs text-left stripe hover" style="width:100%">
            <!-- DataTables จะสร้าง thead และ tbody ให้ทั้งหมด -->
        </table>
    </div>
</div>

<!-- Modal เพิ่ม/แก้ไขข้อมูล -->
<div id="modalForm" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs hidden">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative border border-slate-200">
        <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <h3 class="text-sm font-bold text-slate-800" id="modalTitle">➕ เพิ่ม Master Control Number</h3>
            <button type="button" id="btnCloseModal" class="text-slate-400 hover:text-slate-600 text-lg cursor-pointer">&times;</button>
        </div>

        <form id="formSaveControl" class="space-y-3">
            <input type="hidden" name="isEdit" id="isEdit" value="0">
            <input type="hidden" name="OLD_CONTROL_NO" id="OLD_CONTROL_NO">
            <input type="hidden" name="OLD_SDIVCODE" id="OLD_SDIVCODE">
            <input type="hidden" name="OLD_SDEPCODE" id="OLD_SDEPCODE">
            <input type="hidden" name="OLD_SSECCODE" id="OLD_SSECCODE">

            <!-- Control No. -->
            <div>
                <label class="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Control Number <span class="text-rose-500">*</span>
                </label>
                <input type="text" name="CONTROL_NO" id="modal_CONTROL_NO" placeholder="เช่น AMEC-AR-MAR-001" required
                       class="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                <p class="text-[10px] text-slate-400 mt-0.5">* ใช้รหัสเดิมซ้ำได้ หากต้องการแชร์เอกสารข้าม Department</p>
            </div>

            <!-- Control Name -->
            <div>
                <label class="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Control Name (ชื่อเอกสาร) <span class="text-rose-500">*</span>
                </label>
                <input type="text" name="CONTROL_NAME" id="modal_CONTROL_NAME" placeholder="ระบุชื่อหรือรายละเอียดเอกสาร" required
                       class="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
            </div>

            <!-- Division -->
            <div>
                <label class="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Division (ฝ่าย) <span class="text-rose-500">*</span>
                </label>
                <select name="SDIVCODE" id="modal_SDIVCODE" required class="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs">
                    <option value="">-- เลือก Division --</option>
                    @foreach ($divisions as $div)
                        <option value="{{ $div['SDIVCODE'] }}">{{ $div['SDIVCODE'] }} : {{ $div['DIV_NAME'] }}</option>
                    @endforeach
                </select>
            </div>

            <!-- Department -->
            <div>
                <label class="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Department (แผนกที่ใช้งาน) <span class="text-rose-500">*</span>
                </label>
                <select name="SDEPCODE" id="modal_SDEPCODE" required class="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs">
                    <option value="">-- เลือก Department --</option>
                    @foreach ($departments as $dept)
                        <option value="{{ $dept['SDEPCODE'] }}">{{ $dept['SDEPCODE'] }} : {{ $dept['DEPT_NAME'] }}</option>
                    @endforeach
                </select>
            </div>

            <!-- Section -->
            <div>
                <label class="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Section (ส่วนงาน) <span class="text-rose-500">*</span>
                </label>
                <select name="SSECCODE" id="modal_SSECCODE" required class="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs">
                    <option value="00">00 : No Section / ทั้งแผนก</option>
                </select>
            </div>

            <!-- PIC (RESP_EMPNO) -->
            <div>
                <label class="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    ผู้รับผิดชอบทำ Auto Job (PIC ประจำแผนก) <span class="text-rose-500">*</span>
                </label>
                <select name="RESP_EMPNO" id="modal_RESP_EMPNO" required class="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-semibold">
                    <option value="">-- เลือกผู้รับผิดชอบ (เฉพาะคนใน Department) --</option>
                </select>
            </div>

            <!-- Active Status -->
            <div class="pt-1">
                <label class="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">สถานะ</label>
                <div class="flex gap-4 text-xs font-medium text-slate-700">
                    <label class="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="ACTIVE_FLAG" value="Y" checked> เปิดใช้งาน (Active)
                    </label>
                    <label class="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="ACTIVE_FLAG" value="N"> ปิดใช้งาน (Inactive)
                    </label>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button type="button" id="btnCancelModal" class="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer">
                    ยกเลิก
                </button>
                <button type="submit" id="btnSubmitModal" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer">
                    💾 บันทึกข้อมูล
                </button>
            </div>
        </form>
    </div>
</div>

<script>
    window.MASTER_CONTROLS = @json($controls ?? []);
</script>
@endsection

@section('scripts')
<script src="{{ base_url('assets/dist/js/feaspctrlmst.js') }}"></script>
@endsection