@extends('layouts/webflowTemplate')
@section('contents')
<div id="jig-page" data-mode="{{ $mode }}" class="mx-auto w-full max-w-6xl pb-8 text-slate-800">
    <header class="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div><p class="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-500">Engineering / Jig management</p>
        <h1 class="text-2xl font-bold tracking-tight">AMEC Jig Inspection Sheet</h1>
        <p class="mt-2 text-sm text-slate-500">{{ $mode === 'edit' ? 'Edit Jig — แก้ไขข้อมูล Jig' : 'New Jig — สร้างข้อมูล Jig' }}</p></div>
        <span class="rounded-full bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700">ฉบับร่าง</span>
    </header>
    <form id="jig-form">
        <div class="mb-5 flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-sm">
            <span class="font-semibold">Input By</span>
            <input name="input_by" aria-label="Input By" value="{{ $inputBy }}" readonly class="w-24 bg-transparent font-semibold text-indigo-700">
            <span>{{ $inputName }}</span>
            <label class="flex items-center gap-3 sm:ml-auto">Requested By <input name="requested_by" class="input input-sm w-36 bg-white" placeholder="รหัสพนักงาน"></label>
        </div>
        @if ($mode === 'edit')
        <div role="status" class="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">ยังไม่ได้โหลดข้อมูลเดิม — หน้า Edit นี้เป็นโครงหน้าจอ รอเชื่อมต่อ API</div>
        @endif
        <section class="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 class="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4 font-semibold"><span class="flex size-7 items-center justify-center rounded-full bg-indigo-100 text-sm text-indigo-700">1</span>ข้อมูล JIG <span class="text-xs font-normal text-slate-400">Header</span></h2>
            <div class="grid gap-4 md:grid-cols-3">
                <label class="block text-xs font-medium text-slate-500">Form No. (Auto)<input name="form_no" type="text" readonly placeholder="สร้างอัตโนมัติเมื่อบันทึก" class="input mt-1 w-full rounded-lg border-slate-200 bg-white text-sm text-slate-800"></label>
                <label class="block text-xs font-medium text-slate-500">Jig Control No. (Auto)<input name="jig_no" type="text" readonly placeholder="สร้างอัตโนมัติเมื่อบันทึก" class="input mt-1 w-full rounded-lg border-slate-200 bg-white text-sm text-slate-800"></label>
                <label class="block text-xs font-medium text-slate-500">Jig Name *<input name="jig_name" type="text" required class="input mt-1 w-full rounded-lg border-slate-200 bg-white text-sm text-slate-800"></label>
                <label class="block text-xs font-medium text-slate-500">Drawing No.<input name="drawing_no" type="text"  class="input mt-1 w-full rounded-lg border-slate-200 bg-white text-sm text-slate-800"></label>
                <label class="block text-xs font-medium text-slate-500">Revision<input aria-label="Revision" value="*" readonly class="input mt-1 w-full rounded-lg border-slate-200 bg-slate-50 text-sm"><input name="revision" type="hidden" value="0"></label>
                <label class="block text-xs font-medium text-slate-500">Reg. Date *<input name="reg_date" type="text" required placeholder="เลือกวันที่" class="input mt-1 w-full rounded-lg border-slate-200 bg-white text-sm text-slate-800"></label>
            </div>
            <p class="mb-4 mt-6 border-t border-dashed border-slate-200 pt-4 text-xs font-semibold text-slate-400">ข้อมูลการผลิต</p>
            <div class="grid gap-4 md:grid-cols-3">
                <label class="block text-xs font-medium text-slate-500">MFG Process Code *<select name="process_code" disabled class="select mt-1 w-full rounded-lg border-slate-200 bg-white text-sm text-slate-800"><option value="">รอข้อมูล Process Code</option></select></label>
                <label class="block text-xs font-medium text-slate-500">Proc. Code / Item<input name="proc_item" type="text"  class="input mt-1 w-full rounded-lg border-slate-200 bg-white text-sm text-slate-800"></label>
                <label class="block text-xs font-medium text-slate-500">Location *<select name="location" disabled class="select mt-1 w-full rounded-lg border-slate-200 bg-white text-sm text-slate-800"><option value="">รอข้อมูล Location</option></select></label>
            </div>
            <p class="mb-4 mt-6 border-t border-dashed border-slate-200 pt-4 text-xs font-semibold text-slate-400">รายละเอียด JIG</p>
            <div class="grid gap-4 md:grid-cols-3">
                <label class="block text-xs font-medium text-slate-500">Item<input name="item" type="text"  class="input mt-1 w-full rounded-lg border-slate-200 bg-white text-sm text-slate-800"></label>
                <label class="block text-xs font-medium text-slate-500">Maker<input name="maker" type="text"  class="input mt-1 w-full rounded-lg border-slate-200 bg-white text-sm text-slate-800"></label>
                <label class="block text-xs font-medium text-slate-500">Start Use (ปี ค.ศ.)<input name="start_year" type="number" min="1900" max="9999" step="1" class="input mt-1 w-full rounded-lg border-slate-200 bg-white text-sm text-slate-800"></label>
                <label class="block text-xs font-medium text-slate-500">Qty (ชิ้น)<input name="qty" type="number" min="1" step="1" class="input mt-1 w-full rounded-lg border-slate-200 bg-white text-sm text-slate-800"></label>
                <label class="block text-xs font-medium text-slate-500">Price (บาท)<input name="price" type="number" min="0" step="1" inputmode="numeric" class="input mt-1 w-full rounded-lg border-slate-200 bg-white text-sm text-slate-800"></label>
                <label class="block text-xs font-medium text-slate-500">Inspection Period *<select name="period" required class="select mt-1 w-full rounded-lg border-slate-200 bg-white text-sm text-slate-800"><option value="">เลือกช่วงเวลา</option><option value="6">6 เดือน</option><option value="12">12 เดือน</option></select></label>
            </div>
        </section>
        <section class="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 class="mb-4 flex items-center gap-3 font-semibold"><span class="flex size-7 items-center justify-center rounded-full bg-violet-100 text-sm text-violet-700">2</span>รูปภาพ / DWG อ้างอิง</h2>
            <label class="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center transition hover:border-indigo-300 hover:bg-indigo-50">
                <span class="text-3xl text-indigo-400" aria-hidden="true">↑</span><span class="text-sm font-medium">คลิกเพื่อเลือกไฟล์อ้างอิง</span>
                <span class="text-xs text-slate-400">JPG, PNG, PDF · ไม่เกิน 10 MB ต่อไฟล์ · สูงสุด 5 ไฟล์</span>
                <input id="jig-files" type="file" accept=".jpg,.jpeg,.png,.pdf" multiple class="file-input file-input-sm mt-2 max-w-full bg-white">
            </label>
            <ul id="file-list" class="mt-3 space-y-2 text-sm" aria-live="polite"></ul>
            <p class="mt-3 text-xs text-slate-400">แนบ Drawing JIG และรูปถ่ายเพื่อใช้อ้างอิงในการตรวจสอบ</p>
        </section>
        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div class="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 class="flex items-center gap-3 font-semibold"><span class="flex size-7 items-center justify-center rounded-full bg-sky-100 text-sm text-sky-700">3</span>Check Points <span class="text-xs font-normal text-slate-400">Inspection Data</span></h2><span id="checkpoint-summary" class="text-xs text-slate-500" aria-live="polite"></span></div>
            <div class="overflow-x-auto rounded-xl border border-slate-200">
                <table class="w-full min-w-[900px] text-sm">
                    <thead class="bg-slate-50 text-xs text-slate-500"><tr><th rowspan="2" class="p-3">#</th><th rowspan="2">Check Point *</th><th rowspan="2">Inspection Tool</th><th colspan="2" class="p-2">Standard</th><th rowspan="2">Measured *</th><th rowspan="2">Unit</th><th rowspan="2">Result</th><th rowspan="2"><span class="sr-only">ลบ</span></th></tr><tr><th class="p-2">MAX</th><th>MIN</th></tr></thead>
                    <tbody id="checkpoint-rows"></tbody>
                </table>
            </div>
            <div class="mt-4 flex flex-wrap items-center justify-between gap-3"><button id="add-checkpoint" type="button" class="btn btn-sm border-slate-200 bg-white text-indigo-700">+ เพิ่ม Check Point</button><p class="text-xs text-slate-400">กรอก MIN / MAX ก่อน Measured · ค่าในช่วงรวมขอบเขต = OK</p></div>
        </section>
        <footer class="mt-6 flex flex-wrap items-center justify-between gap-3"><p class="text-xs text-slate-500">หน้าตัวอย่าง — ยังไม่เปิดใช้งานการบันทึก</p><button type="button" disabled class="btn btn-primary rounded-xl">บันทึก (รอ API)</button></footer>
    </form>
</div>
@endsection
@section('scripts')
<script src="{{ base_url() }}assets/dist/js/iejig.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
