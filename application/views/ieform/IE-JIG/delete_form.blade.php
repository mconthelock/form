@extends('layouts/webflowTemplate')
@section('styles')
<style>
#jig-delete-page .delete-card { background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:24px; margin-top:20px; box-shadow:0 1px 3px #0f172a0d; }
#jig-delete-page .master-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:18px; }
#jig-delete-page .master-label { font-size:12px; font-weight:600; color:#475569; margin-bottom:6px; }
#jig-delete-page [data-master] { background:#f0f9ff; border:1px solid #dbeafe; border-radius:8px; padding:10px 12px; min-height:42px; font-size:14px; color:#0f172a; overflow-wrap:anywhere; }
#delete-dropzone { display:block; border:2px dashed #cbd5e1; border-radius:12px; padding:28px; text-align:center; background:#f8fafc; cursor:pointer; }
#delete-dropzone.dragging { background:#eef2ff; border-color:#6366f1; }
#delete-file-list li { display:flex; align-items:center; gap:12px; padding:10px; background:#f8fafc; border-radius:8px; }
#delete-file-list img { width:56px; height:56px; object-fit:cover; border-radius:6px; }
#delete-file-list .file-name { flex:1; overflow-wrap:anywhere; }
@media(max-width:640px) { #jig-delete-page .master-grid { grid-template-columns:1fr; } #jig-delete-page .delete-card { padding:18px; } }
</style>
@endsection
@section('contents')
<div id="jig-delete-page" class="mx-auto w-full max-w-6xl pb-8 text-slate-800" data-jigno="{{ $JIGNO }}" data-empno="{{ $EMPNO }}" data-nfrmno="{{ $NFRMNO }}" data-vorgno="{{ $VORGNO }}" data-cyear="{{ $CYEAR }}">
    <h1 class="text-2xl font-bold text-slate-900">Form : Request Delete JIG</h1>
    <section class="delete-card">
        <div class="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 class="font-bold text-slate-900">ข้อมูล JIG</h2><span class="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">DELETE REQUEST</span></div>
        <p id="delete-load-status" role="status" class="mb-4 text-sm text-slate-500">กำลังโหลดข้อมูล JIG…</p>
        <button id="delete-retry" type="button" hidden class="btn btn-sm mb-4">โหลดข้อมูลอีกครั้ง</button>
        <div class="master-grid">
            @foreach (
                [
                    'JIG_NO'=>'Jig Control No.',
                    'JIG_NAME'=>'Jig Name',
                    'REV'=>'Revision',
                    'DWG'=>'Drawing No.',
                    'PROCESS_CODE'=>'MFG Process Code',
                    'ITEMNO'=>'Item',
                    'LOCATION'=>'Location',
                    'PIC_EMPNO'=>'IE Person in charge',
                    'JIG_DESC'=>'Description',
                    'MAKER'=>'Maker',
                    'START_USE_DATE'=>'Start Use',
                    'JIG_QTY'=>'Qty (ชิ้น)',
                    'PRICE'=>'Price (บาท)',
                    'INSPEC_PERIOD'=>'Inspection Period',
                ] as $field => $label)
            <div><div class="master-label">{{ $label }}</div><div data-master="{{ $field }}">—</div></div>
            @endforeach
        </div>
    </section>
    <form id="jig-delete-form" novalidate>
        <fieldset id="delete-fields" disabled>
            <section class="delete-card">
                <label class="block text-sm font-semibold">เหตุผลการลบ <span class="text-red-600">*</span><textarea name="delete_reason" required rows="3" class="textarea mt-2 w-full bg-white text-sm" placeholder="ระบุสาเหตุที่ต้องการลบ JIG"></textarea></label>
                <label class="mt-5 block text-sm font-semibold">รายละเอียดเพิ่มเติม<span class="text-red-600">*</span><textarea name="delete_detail" required rows="4" class="textarea mt-2 w-full bg-white text-sm" placeholder="ข้อมูลประกอบเพิ่มเติม "></textarea></label>
            </section>
            <section class="delete-card">
                <h2 class="mb-5 font-bold text-slate-900">รูปภาพ / เอกสารประกอบ</h2>
                <label id="delete-dropzone"><span class="block text-sm font-semibold text-indigo-700">ลากไฟล์มาวาง หรือคลิกเลือกไฟล์</span><span class="mt-2 block text-xs text-slate-500">JPG, PNG, PDF · ไม่เกิน 10 MB ต่อไฟล์ · สูงสุด 5 ไฟล์</span><input id="delete-files" type="file" multiple accept=".jpg,.jpeg,.png,.pdf" class="file-input file-input-sm mt-4 max-w-full bg-white"></label>
                <ul id="delete-file-list" class="mt-4 space-y-2 text-sm" aria-live="polite"></ul>
            </section>
            <div class="mt-6 flex flex-wrap items-center justify-between gap-3"><p class="text-xs text-slate-500">หน้านี้ยังไม่ส่งคำขอหรือบันทึกไฟล์เข้าสู่ระบบ</p><button type="submit" class="btn btn-primary">ตรวจสอบข้อมูล</button></div>
        </fieldset>
    </form>
</div>
@endsection
@section('scripts')
<script src="{{ base_url() }}assets/dist/js/iejigDelete.js?ver={{ $GLOBALS['version'] }}-{{ is_file(FCPATH . 'assets/dist/js/iejigDelete.js') ? filemtime(FCPATH . 'assets/dist/js/iejigDelete.js') : 'missing' }}"></script>
@endsection
