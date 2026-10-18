@extends('layouts/webflowTemplate')
@section('styles')
<style>
#jig-delete-page { background:linear-gradient(180deg,#fff1f2 0%,#fff7f7 45%,#fff 100%); padding:24px; border:1px solid #fecdd3; border-radius:20px; }
#jig-delete-page .delete-header { display:flex; align-items:center; gap:14px; margin-bottom:20px; }
#jig-delete-page .delete-icon { display:flex; align-items:center; justify-content:center; width:46px; height:46px; flex-shrink:0; border-radius:13px; color:#be123c; background:#ffe4e6; border:1px solid #fecdd3; }
#jig-delete-page h1 { font-size:22px; line-height:1.4; font-weight:700; color:#881337; }
#jig-delete-page .delete-card { background:#fff; border:1px solid #f1d9dd; border-radius:14px; padding:20px; margin-top:16px; box-shadow:0 2px 6px #88133706; }
#jig-delete-page .section-heading { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:16px; padding-bottom:12px; border-bottom:1px solid #fce7eb; }
#jig-delete-page .section-heading h2 { font-size:15px; line-height:1.5; font-weight:700; color:#881337; }
#jig-delete-page .section-count { white-space:nowrap; background:#fff1f2; color:#9f1239; border:1px solid #fecdd3; border-radius:999px; padding:3px 10px; font-size:12px; font-weight:600; }
#jig-delete-page .master-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px 16px; }
#jig-delete-page .master-wide { grid-column:span 2; }
#jig-delete-page .master-label { font-size:12px; font-weight:600; color:#64748b; margin-bottom:4px; }
#jig-delete-page [data-master] { background:#fffafa; border:1px solid #f3e4e6; border-radius:7px; padding:8px 10px; min-height:38px; font-size:14px; line-height:1.5; color:#0f172a; overflow-wrap:anywhere; }
#jig-delete-page [data-master="JIG_NO"] { font-weight:700; color:#9f1239; }
#jig-delete-page .delete-table-wrap { overflow:auto; max-height:380px; border:1px solid #f1e3e6; border-radius:10px; }
#jig-delete-page .delete-table { width:100%; min-width:760px; border-collapse:collapse; table-layout:fixed; font-size:13px; }
#jig-delete-page .delete-table th { background:#fff1f2; color:#881337; font-size:12px; font-weight:700; text-align:left; padding:10px; position:sticky; top:0; }
#jig-delete-page .delete-table td { padding:10px; border-top:1px solid #f1e9eb; vertical-align:top; color:#1e293b; overflow-wrap:anywhere; white-space:pre-wrap; }
#jig-delete-page .delete-table tr:nth-child(even) td { background:#fffbfc; }
#jig-delete-page .delete-table .numeric { text-align:right; font-variant-numeric:tabular-nums; }
#jig-delete-page .section-status { font-size:13px; color:#64748b; padding:10px 0; }
#jig-delete-page .section-status.is-error { color:#b91c1c; }
#jig-delete-page .defect-card { padding:14px; border:1px solid #fecdd3; border-radius:10px; background:#fffafa; margin-top:12px; }
#jig-delete-page .defect-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px 20px; }
#jig-delete-page .defect-value { font-size:14px; line-height:1.65; color:#1e293b; white-space:pre-wrap; overflow-wrap:anywhere; }
#jig-delete-page .request-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
#jig-delete-page .textarea { font-size:14px; line-height:1.6; border-color:#e2cfd3; }
#jig-delete-page .textarea:focus { outline-color:#e11d48; }
#jig-delete-page textarea:disabled { background:#e0f2fe; color:#1e293b; opacity:1; -webkit-text-fill-color:#1e293b; }
#jig-delete-page .approval-buttons { display:flex; justify-content:center; flex-wrap:wrap; gap:24px; margin-top:18px; }
#jig-delete-page .approval-buttons .btn { min-width:110px; }
#delete-dropzone { display:block; border:2px dashed #f0bec7; border-radius:12px; padding:22px; text-align:center; background:#fff7f8; cursor:pointer; }
#delete-dropzone.dragging { background:#ffe4e6; border-color:#e11d48; }
#delete-file-list li { display:flex; align-items:center; gap:12px; padding:10px; background:#fff7f8; border-radius:8px; }
#delete-file-list img { width:56px; height:56px; object-fit:cover; border-radius:6px; }
#delete-file-list .file-name { flex:1; overflow-wrap:anywhere; }
#jig-delete-page .delete-submit { background:#be123c; border-color:#be123c; color:#fff; }
#jig-delete-page .delete-submit:hover { background:#9f1239; }
@media(max-width:900px) { #jig-delete-page .master-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
@media(max-width:640px) { #jig-delete-page { padding:14px; } #jig-delete-page h1 { font-size:19px; } #jig-delete-page .master-grid, #jig-delete-page .defect-grid, #jig-delete-page .request-grid { grid-template-columns:1fr; } #jig-delete-page .master-wide { grid-column:auto; } #jig-delete-page .delete-card { padding:16px; } }
</style>
@endsection
@section('contents')
<div id="jig-delete-page" class="mx-auto w-full max-w-6xl pb-8 text-slate-800" data-jigno="{{ $JIGNO }}" data-empno="{{ $EMPNO }}" data-nfrmno="{{ $NFRMNO }}" data-vorgno="{{ $VORGNO }}" data-cyear="{{ $CYEAR }}"
    data-cyear2="{{ $CYEAR2 }}" data-nrunno="{{ $NRUNNO }}" data-mode="{{ $mode }}" data-page-mode="{{ $pageMode }}" data-cstepno="{{ $CSTEPNO }}" data-cst="{{ $cst }}" data-exdata="{{ $exdata }}">
    <header class="delete-header">
        <span class="delete-icon" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/></svg></span>
        <div><h1>Request Delete JIG</h1><p class="mt-1 text-sm text-slate-600">ตรวจสอบข้อมูลและผลการตรวจ ก่อนระบุเหตุผลการขอลบ</p></div>
    </header>
    <section class="delete-card" aria-label="ข้อมูลผู้ร้องขอ">
        <div class="master-grid">
            <div class="master-wide"><div class="master-label">Form No.</div><p id="delete-formno" class="text-sm font-semibold">{{ $formno ?: 'สร้างอัตโนมัติเมื่อบันทึก' }}</p></div>
            <div><div class="master-label">Input By</div><p id="delete-input-by" class="text-sm font-semibold">{{ $EMPNO }}</p></div>
            <div><div class="master-label">Requested By</div><p id="delete-requested-by" class="text-sm font-semibold">{{ $EMPNO }}</p></div>
        </div>
    </section>
    <section class="delete-card">
        <div class="section-heading"><h2>ข้อมูล JIG</h2><span class="section-count">คำขอลบ JIG</span></div>
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
            <div class="{{ in_array($field, ['JIG_NAME', 'DWG', 'LOCATION', 'JIG_DESC', 'PIC_EMPNO', 'INSPEC_PERIOD']) ? 'master-wide' : '' }}"><div class="master-label">{{ $label }}</div><div data-master="{{ $field }}">—</div></div>
            @endforeach
        </div>
    </section>
    <section class="delete-card" aria-labelledby="delete-checkpoint-heading">
        <div class="section-heading"><h2 id="delete-checkpoint-heading">Checkpoints · ข้อมูลการตรวจ</h2><span id="delete-checkpoint-count" class="section-count">—</span></div>
        <p id="delete-checkpoint-status" class="section-status" role="status">กำลังโหลดข้อมูล Checkpoint…</p>
        <button id="delete-checkpoint-retry" type="button" hidden class="btn btn-sm mb-3">โหลด Checkpoint อีกครั้ง</button>
        <div id="delete-checkpoint-table" class="delete-table-wrap" hidden>
            <table class="delete-table"><colgroup><col style="width:5%"><col style="width:27%"><col style="width:19%"><col style="width:12%"><col style="width:12%"><col style="width:14%"><col style="width:11%"></colgroup>
                <thead><tr><th scope="col">#</th><th scope="col">Check Point</th><th scope="col">Inspection Tool</th><th scope="col" class="numeric">MIN</th><th scope="col" class="numeric">MAX</th><th scope="col" class="numeric">Measured</th><th scope="col">Unit</th></tr></thead>
                <tbody id="delete-checkpoint-rows"></tbody>
            </table>
        </div>
    </section>
    <section id="delete-defect-section" class="delete-card" aria-labelledby="delete-defect-heading">
        <div class="section-heading"><h2 id="delete-defect-heading">รายละเอียด NG</h2><span id="delete-defect-count" class="section-count">—</span></div>
        <p id="delete-defect-status" class="section-status" role="status">กำลังโหลดข้อมูล NG…</p>
        <button id="delete-defect-retry" type="button" hidden class="btn btn-sm mb-3">โหลดข้อมูล NG อีกครั้ง</button>
        <div id="delete-defect-list"></div>
    </section>
    <form id="jig-delete-form" novalidate>
        <fieldset id="delete-fields" disabled>
            <section class="delete-card">
                <div class="section-heading"><h2>รายละเอียดคำขอลบ</h2></div>
                <div class="request-grid">
                <label class="block text-sm font-semibold">เหตุผลการลบ <span class="text-red-600">*</span><textarea name="delete_reason" required maxlength="1000" rows="3" class="textarea mt-2 w-full bg-white text-sm" placeholder="ระบุสาเหตุที่ต้องการลบ JIG"></textarea></label>
                <label class="block text-sm font-semibold">รายละเอียดเพิ่มเติม <span class="text-red-600">*</span><textarea name="delete_detail" required maxlength="1000" rows="3" class="textarea mt-2 w-full bg-white text-sm" placeholder="ข้อมูลประกอบเพิ่มเติม "></textarea></label>
                </div>
            </section>
            <section class="delete-card">
                <div class="section-heading"><h2>รูปภาพ / เอกสารประกอบ</h2></div>
                <label id="delete-dropzone"><span class="block text-sm font-semibold text-red-700">ลากไฟล์มาวาง หรือคลิกเลือกไฟล์</span><span class="mt-2 block text-xs text-slate-500">JPG, PNG, PDF · ไม่เกิน 10 MB ต่อไฟล์ · สูงสุด 5 ไฟล์</span><input id="delete-files" type="file" multiple accept=".jpg,.jpeg,.png,.pdf" class="file-input file-input-sm mt-4 max-w-full bg-white"></label>
                <ul id="delete-file-list" class="mt-4 space-y-2 text-sm" aria-live="polite"></ul>
            </section>
            <div class="mt-6 flex flex-wrap items-center justify-between gap-3">
                <p class="text-xs text-slate-500"></p>
                <button id="delete-send" type="submit" class="btn delete-submit" {{ $pageMode !== 'create' ? 'hidden' : '' }}>Send Form</button>
            </div>
        </fieldset>
    </form>
    <section id="delete-approval" class="delete-card" hidden>
        <div class="section-heading"><h2>การอนุมัติคำขอลบ</h2></div>
        <textarea id="delete-remark" rows="3" class="textarea mt-2 w-full bg-white" placeholder="ระบุความเห็น"></textarea>
        <div class="approval-buttons">
            <button id="delete-approve" type="button" class="btn btn-primary">Approve</button>
            <button id="delete-reject" type="button" class="btn delete-submit">Reject</button>
        </div>
    </section>
    <section id="delete-sync-status" class="delete-card" hidden>
        <p id="delete-sync-message" class="text-sm text-red-700" role="status"></p>
        <button id="delete-sync-retry" type="button" class="btn btn-sm mt-3">ลองอัปเดตสถานะ JIG อีกครั้ง</button>
    </section>
    <section id="delete-flow-section" class="delete-card" {{ $pageMode === 'create' ? 'hidden' : '' }}>
        <div id="delete-flow" class="overflow-x-auto"></div>
    </section>
</div>
@endsection
@section('scripts')
<script src="{{ base_url() }}assets/dist/js/iejigDelete.js?ver={{ $GLOBALS['version'] }}-{{ is_file(FCPATH . 'assets/dist/js/iejigDelete.js') ? filemtime(FCPATH . 'assets/dist/js/iejigDelete.js') : 'missing' }}"></script>
@endsection
