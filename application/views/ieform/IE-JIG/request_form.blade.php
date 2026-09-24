@extends('layouts/webflowTemplate')
@section('styles')
<style>
#jig-form-type {
    display: inline-flex;
    align-items: center;
    border: 1px solid #c7d2fe;
    border-radius: 9999px;
    padding: 0.2rem 0.65rem;
    background: #eef2ff;
    color: #4338ca;
    font-size: 0.75rem;
    line-height: 1.25rem;
    font-weight: 700;
}
#jig-form-type[hidden] { display: none; }
#jig-form-type[data-type="INSPECTION"] {
    border-color: #99f6e4;
    background: #f0fdfa;
    color: #0f766e;
}
#jig-page input:disabled,
#jig-page select:disabled,
#jig-page textarea:disabled,
#jig-page input[readonly]:not([data-editable-calendar="true"]),
#jig-page textarea[readonly] {
    background-color: #e0f2fe !important;
    opacity: 1;
}
#jig-page #checkpoint-rows input {
    color: #0f172a !important;
    -webkit-text-fill-color: #0f172a;
    font-weight: 600;
    border-color: #94a3b8 !important;
    opacity: 1;
}
#jig-page #checkpoint-rows .row-number {
    color: #475569;
    font-weight: 600;
}
#jig-approval-actions {
    gap: 2rem;
}
#jig-page input[name="input_by"],
#jig-page #ng-detail label,
#jig-page #ng-detail legend,
#jig-page #ng-detail input,
#jig-page #ng-detail textarea {
    color: #0f172a !important;
    -webkit-text-fill-color: #0f172a;
    font-weight: 600;
    opacity: 1;
}
#jig-page #ng-detail input,
#jig-page #ng-detail textarea {
    font-size: 0.875rem;
}
#jig-page #ng-detail input::placeholder,
#jig-page #ng-detail textarea::placeholder {
    color: #64748b;
    -webkit-text-fill-color: #64748b;
}
#jig-page #ng-detail .text-red-600 {
    color: #dc2626 !important;
    -webkit-text-fill-color: #dc2626;
}
</style>
@endsection
@section('contents')
<div class="form-data" data-nfrmno="{{ $NFRMNO }}" data-vorgno="{{ $VORGNO }}" data-cyear="{{ $CYEAR }}" data-cyear2="{{ $CYEAR2 }}" data-nrunno="{{ $NRUNNO }}" data-empno="{{ $EMPNO }}" data-mode="{{ $mode }}" data-cstepno="{{ $CSTEPNO ?? '' }}" data-exdata="{{ $exdata ?? '' }}"></div>
<div id="jig-page" data-mode="{{ $pageMode }}" class="mx-auto w-full max-w-6xl pb-8 text-slate-800">
    <header class="mb-6"><h1 class="text-2xl font-bold tracking-tight text-slate-900">AMEC Jig Inspection Sheet</h1></header>
    <form id="jig-form" novalidate>
        <div class="mb-5 grid items-center gap-4 md:grid-cols-2 rounded-xl border border-slate-200 bg-white p-4 text-sm">
            <div class="flex flex-wrap items-center gap-3">
            <span class="font-semibold">Input By</span>
            <input name="input_by" aria-label="Input By" value="{{ $inputBy }}" readonly class="input input-sm w-36 bg-white">
            <span id="input-by-name" class="text-sm font-semibold text-indigo-700" aria-live="polite"></span>
            </div>
            <div class="flex flex-wrap items-center gap-3">
            <label class="flex items-center gap-3 font-semibold">Requested By <span class="text-red-600">*</span><input name="requested_by" required maxlength="5" aria-describedby="requested-by-name" class="input input-sm w-36 bg-white" placeholder="รหัสพนักงาน"></label><span id="requested-by-name" aria-live="polite" class="text-sm font-semibold text-indigo-700"></span>
            </div>
        </div>
        @if ($pageMode !== 'create')
        <div id="jig-load-status" role="status" class="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">กำลังโหลดข้อมูล Jig</div>
        @endif
        <fieldset id="jig-fields" {{ $pageMode !== 'create' ? 'disabled' : '' }}>
        <section class="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 class="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4 font-bold text-slate-900"><span class="flex size-7 items-center justify-center rounded-full bg-indigo-100 text-sm text-indigo-700">1</span>ข้อมูล JIG <span id="jig-form-type" data-type="{{ $pageMode === 'create' ? 'CREATE' : '' }}" {{ $pageMode !== 'create' ? 'hidden' : '' }} aria-live="polite">{{ $pageMode === 'create' ? 'CREATE' : '' }}</span></h2>
            <div class="grid gap-4 md:grid-cols-3">
                <label class="block text-xs font-semibold text-slate-700">Form No. (Auto)<input name="form_no" type="text" readonly placeholder="สร้างอัตโนมัติเมื่อบันทึก" class="input mt-1 w-full rounded-lg border-slate-200 bg-white text-sm text-slate-800"></label>
                <label class="block text-xs font-semibold text-slate-700">Jig Control No. (Auto)<input name="jig_no" maxlength="20" type="text" readonly placeholder="สร้างอัตโนมัติเมื่อบันทึก" class="input mt-1 w-full rounded-lg border-slate-200 bg-white text-sm text-slate-800"></label>
                <label class="block text-xs font-semibold text-slate-700">Jig Name <span class="text-red-600">*</span><input name="jig_name" maxlength="200" type="text" required class="input mt-1 w-full rounded-lg border-slate-200 bg-white text-sm text-slate-800"></label>
                <label class="block text-xs font-semibold text-slate-700">Drawing No.<span class="text-red-600">*</span><input name="drawing_no" maxlength="100" type="text"  class="input mt-1 w-full rounded-lg border-slate-200 bg-white text-sm text-slate-800"></label>
                <label class="block text-xs font-semibold text-slate-700">Revision<input aria-label="Revision" value="*" readonly class="input mt-1 w-full rounded-lg border-slate-200 bg-slate-50 text-sm"><input name="revision" type="hidden" value="0"></label>
            </div>
            <p class="mb-4 mt-6 border-t border-dashed border-slate-200 pt-4 text-sm font-bold text-slate-900">ข้อมูลการผลิต</p>
            <div class="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4">
                <label class="block text-xs font-semibold text-slate-700">MFG Process Code <span class="text-red-600">*</span><select name="process_code" required disabled class="select mt-1 w-full rounded-lg border-slate-200 bg-white text-sm text-slate-800"><option value="">รอข้อมูล Process Code</option></select></label>
                <label class="block text-xs font-semibold text-slate-700">Item<span class="text-red-600">*</span><input id="itemno" name="itemno" required maxlength="4" type="text"  class="input mt-1 w-full rounded-lg border-slate-200 bg-white text-sm text-slate-800"></label>
                <label class="col-span-2 block text-xs font-semibold text-slate-700">Location <span class="text-red-600">*</span><select name="location" required disabled class="select mt-1 w-full rounded-lg border-slate-200 bg-white text-sm text-slate-800"><option value="">รอข้อมูล Location</option></select></label>
            </div>
            <label class="mt-4 block text-xs font-semibold text-slate-700">IE Person in charge<span class="text-red-600">*</span><select name="pic_empno" disabled class="select mt-1 w-full rounded-lg border-slate-200 bg-white text-sm text-slate-800"><option value="">กำลังโหลดพนักงาน</option></select></label>
            <p class="mb-4 mt-6 border-t border-dashed border-slate-200 pt-4 text-sm font-bold text-slate-900">รายละเอียด JIG</p>
            <div class="grid gap-4 md:grid-cols-3">
                <label class="block text-xs font-semibold text-slate-700">Description<input id="desc" name="desc" maxlength="100" type="text"  class="input mt-1 w-full rounded-lg border-slate-200 bg-white text-sm text-slate-800"></label>
                <label class="block text-xs font-semibold text-slate-700">Maker<input name="maker" maxlength="100" type="text"  class="input mt-1 w-full rounded-lg border-slate-200 bg-white text-sm text-slate-800"></label>
                <label class="block text-xs font-semibold text-slate-700">Start Use<input name="start_use_display" type="text" readonly class="input mt-1 w-full rounded-lg border-slate-200 bg-slate-50 text-sm text-slate-800"><input name="start_use_date" type="hidden"></label>
                <label class="block text-xs font-semibold text-slate-700">Qty (ชิ้น)<span class="text-red-600">*</span><input name="qty" required max="99999" type="number" min="1" step="1" class="input mt-1 w-full rounded-lg border-slate-200 bg-white text-sm text-slate-800"></label>
                <label class="block text-xs font-semibold text-slate-700">Price (บาท)<input name="price" max="9999999999" type="number" min="0" step="1" inputmode="numeric" class="input mt-1 w-full rounded-lg border-slate-200 bg-white text-sm text-slate-800"></label>
                <label class="block text-xs font-semibold text-slate-700">Inspection Period <span class="text-red-600">*</span><select name="period" required class="select mt-1 w-full rounded-lg border-slate-200 bg-white text-sm text-slate-800"><option value="">เลือกช่วงเวลา</option><option value="6">6 เดือน</option><option value="12">12 เดือน</option></select></label>
            </div>
        </section>
        <section class="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 class="mb-4 flex items-center gap-3 font-bold text-slate-900"><span class="flex size-7 items-center justify-center rounded-full bg-violet-100 text-sm text-violet-700">2</span>รูปภาพ / DWG อ้างอิง</h2>
            <label id="jig-file-dropzone" class="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center transition hover:border-indigo-300 hover:bg-indigo-50">
                <span class="text-3xl text-indigo-400" aria-hidden="true">↑</span><span class="text-sm font-medium">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์อ้างอิง</span>
                <span class="text-xs text-slate-400">JPG, PNG, PDF · ไม่เกิน 10 MB ต่อไฟล์ · สูงสุด 5 ไฟล์</span>
                <input id="jig-files" type="file" accept=".jpg,.jpeg,.png,.pdf" multiple class="file-input file-input-sm mt-2 max-w-full bg-white">
            </label>
            <ul id="file-list" class="mt-3 space-y-2 text-sm" aria-live="polite"></ul>
            <p class="mt-3 text-xs text-slate-400">แนบเอกสารเกี่ยวกับ JIG เพื่อใช้อ้างอิงในการตรวจสอบ</p>
        </section>
        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div class="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 class="flex items-center gap-3 font-bold text-slate-900"><span class="flex size-7 items-center justify-center rounded-full bg-sky-100 text-sm text-sky-700">3</span>Check Points <span class="text-xs font-normal text-slate-400">Inspection Data</span></h2><span id="checkpoint-summary" class="text-xs text-slate-500" aria-live="polite"></span></div>
            <div class="overflow-x-auto rounded-xl border border-slate-200">
                <table class="w-full min-w-[900px] table-fixed text-sm">
                    <colgroup>
                        <col style="width:4%"><col style="width:25%"><col style="width:17%">
                        <col style="width:9%"><col style="width:9%"><col style="width:10%">
                        <col style="width:13%"><col style="width:9%"><col style="width:4%">
                    </colgroup>
                    <thead class="bg-slate-50 text-xs font-bold text-slate-800">
                        <tr>
                            <th rowspan="2" class="p-3">#</th>
                            <th rowspan="2">Check Point <span class="text-red-600">*</span></th>
                            <th rowspan="2">Inspection Tool</th><th colspan="2" class="p-2">Standard</th>
                            <th rowspan="2">Measured <span class="text-red-600">*</span></th>
                            <th rowspan="2">Unit</th><th rowspan="2">Result</th>
                            <th rowspan="2"><span class="sr-only">ลบ</span></th>
                        </tr>
                        <tr>
                            <th class="p-2">MIN<span class="text-red-600">*</span></th>
                            <th>MAX<span class="text-red-600">*</span></th>
                        </tr>
                    </thead>
                    <tbody id="checkpoint-rows"></tbody>
                </table>
            </div>
            <div class="mt-4 flex flex-wrap items-center justify-between gap-3"><button id="add-checkpoint" type="button" class="btn btn-sm border-slate-200 bg-white text-indigo-700">+ เพิ่ม Check Point</button><p class="text-xs text-slate-400">กรอก MIN / MAX ก่อน Measured · ค่าในช่วงรวมขอบเขต = OK</p></div>
        </section>
        <section id="ng-detail" hidden class="mt-5 rounded-2xl border border-red-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="ng-heading">
            <h2 id="ng-heading" class="mb-5 font-bold text-red-700">NG Detail</h2>
            <fieldset id="ng-fields" disabled class="space-y-4">
                <label class="block text-xs font-semibold text-slate-700">Defect Detail <span class="text-red-600">*</span>
                    <textarea name="ng_defect_detail" maxlength="500" required rows="3" class="textarea mt-1 w-full bg-white text-sm" placeholder="อธิบายลักษณะข้อบกพร่องที่พบ"></textarea>
                </label>
                <fieldset><legend class="mb-2 text-xs font-semibold text-slate-700">Action <span class="text-red-600">*</span> — เลือกวิธีแก้ไข (เลือกได้มากกว่า 1)</legend>
                    <div class="flex flex-wrap gap-4 text-sm">
                        <label class="flex items-center gap-2"><input type="checkbox" name="ng_action[]" value="Adjust" class="checkbox checkbox-sm">Adjust — ปรับตั้ง</label>
                        <label class="flex items-center gap-2"><input type="checkbox" name="ng_action[]" value="Modify" class="checkbox checkbox-sm">Modify — ดัดแปลง/ซ่อม</label>
                        <label class="flex items-center gap-2"><input type="checkbox" name="ng_action[]" value="Replace" class="checkbox checkbox-sm">Replace — เปลี่ยนใหม่</label>
                    </div>
                </fieldset>
                <label class="block text-xs font-semibold text-slate-700">Corrective Action <span class="text-red-600">*</span>
                    <textarea name="ng_corrective_action" maxlength="100" required rows="3" class="textarea mt-1 w-full bg-white text-sm" placeholder="ระบุแนวทางการแก้ไขและการตรวจสอบก่อนนำกลับมาใช้งาน"></textarea>
                </label>
                <div class="grid gap-4 md:grid-cols-2">
                    <label class="block text-xs font-semibold text-slate-700">Plan Date (กำหนดแก้ไขแล้วเสร็จ) <span class="text-red-600">*</span><input name="ng_plan_date" required placeholder="dd/mm/yyyy" class="input mt-1 w-full bg-white"></label>
                </div>
            </fieldset>
            <div class="mt-5 border-t border-slate-100 pt-4"><button id="generate-ng-pdf" type="button" disabled class="btn w-full bg-white">Generate NG Tag PDF</button></div>
        </section>
        @if ($pageMode === 'create')
        <footer class="mt-6 flex flex-wrap items-center justify-between gap-3"><p class="text-xs text-slate-500">ตรวจสอบข้อมูลก่อนบันทึก</p><button id="validate-jig" type="submit" class="btn btn-primary rounded-xl">บันทึก</button></footer>
        @endif
        </fieldset>
    </form>
    <section id="jig-approval" hidden class="mt-6">
        <label for="jig-remark" class="block text-sm font-semibold text-slate-700">Remark</label>
        <textarea id="jig-remark" name="approval_remark" rows="3" class="textarea mt-2 w-full bg-white text-sm" ></textarea>
        <div id="jig-approval-actions" class="mt-6 flex justify-center">
            <button id="jig-approve" type="button" class="btn btn-primary">Approve</button>
            <button id="jig-return" type="button" class="btn">Return</button>
        </div>
    </section>
    <div class="flow mt-6"></div>
</div>
@endsection
@section('scripts')
<script src="{{ base_url() }}assets/dist/js/iejig.js?ver={{ $GLOBALS['version'] }}-{{ is_file(FCPATH . 'assets/dist/js/iejig.js') ? filemtime(FCPATH . 'assets/dist/js/iejig.js') : 'missing' }}"></script>
@endsection
