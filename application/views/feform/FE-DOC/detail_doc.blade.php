
<script>
    // ส่งข้อมูลไฟล์แนบตั้งแต่วินาทีแรกที่ Server โหลดหน้าเสร็จ
    window.INITIAL_ATTACHED_FILES = @json($attachedFiles ?? []);
</script>

<div class="p-6 rounded-2xl bg-slate-50/80 border border-slate-200/80 mb-6">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
            <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Doc No.</label>
            <input type="text" id="DOC_IDTxt" class="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-blue-700 cursor-not-allowed" readonly value="{{ $DOC_NO ?? '' }}">
            <input type="hidden" name="DocHeaderIDHid" id="DocHeaderIDHid" value="{{ $DOC_HEADER_ID ?? '' }}" />
        </div>

        <div>
            <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Input By</label>
            <input type="text" id="INPUT_BYTxt" class="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600 cursor-not-allowed" value="{{$INPUTBY}}" readonly>
        </div>

        <div>
            <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Request By</label>
            <input type="text" id="REQUEST_BYTxt" class="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600 cursor-not-allowed" value="{{$REQBY}}" readonly>
        </div>

        <!-- Dropdown Document Type (Master) -->
        <div>
            <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                DOCUMENT TYPE <span class="text-rose-500">*</span>
            </label>
            <select id="DocTypeDrp" name="DocTypeDrp" class="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option value="">-- Choose Type --</option>
                @if(!empty($docTypes))
                    @foreach ($docTypes as $item)
                        <option value="{{ $item->DOC_TYPE_CODE }}" 
                                data-orientation="{{ $item->DEFAULT_ORIENTATION }}" {{ (isset($DOC_TYPE_CODE) && $DOC_TYPE_CODE == $item->DOC_TYPE_CODE) ? 'selected' : '' }}>{{ $item->DOC_TYPE_NAME }}
                        </option>
                    @endforeach
                @endif
            </select>
                @if(empty($NRUNNO) && !empty($isAdmin))
                    <button type="button" id="btn-open-master-modal" class="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer transition-colors">
                        ⚙️ จัดการ Master Type & Steps
                    </button>
                @endif
        </div>
    </div>

    <!-- โซนแนบไฟล์เอกสาร (PDF & Excel) -->
    <div class="mt-4">
        <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            ATTACHMENT FILES (รองรับไฟล์ PDF และ Excel) <span class="text-rose-500">*</span>
        </label>
        
        <!-- รองรับทั้ง PDF และ Excel (.xlsx, .xls) -->
        <input type="file" id="files" class="hidden" multiple accept=".pdf,.xlsx,.xls,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel">

        <div id="drop-zone" class="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white rounded-2xl p-6 text-center cursor-pointer transition-all">
            <div class="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                <span class="text-3xl">📁</span>
                <p class="text-sm font-semibold text-slate-700">คลิกเลือกไฟล์ หรือลากไฟล์มาวางที่นี่</p>
                <p class="text-xs text-slate-500 font-medium">รองรับไฟล์ PDF, Excel (.xlsx, .xls) สูงสุด 5MB ต่อไฟล์</p>
            </div>
        </div>

        <!-- รายการไฟล์ที่เลือกใหม่ -->
        <div id="file-list-container" class="mt-3 hidden">
            <ul id="selected-files-list" class="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white p-2"></ul>
        </div>

        <!-- รายการไฟล์เดิมที่บันทึกแล้วใน DB -->
        <div id="download-zone" class="mt-3 hidden">
            <ul id="uploaded-files-list" class="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white p-2 shadow-sm"></ul>
        </div>
    </div>

</div>

<!-- Modal จัดการ Master -->
<div id="master-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs hidden">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-6 overflow-hidden max-h-[92vh] flex flex-col mx-4">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b pb-3 mb-4">
            <div>
                <h3 class="text-base font-bold text-slate-800">⚙️ จัดการ Master Document Type & Approval Steps</h3>
                <p class="text-xs text-slate-400">เพิ่ม/แก้ไขประเภทเอกสาร และกำหนดสายอนุมัติตามตำแหน่งใน Webflow</p>
            </div>
            <button type="button" class="btn-close-master-modal text-slate-400 hover:text-slate-600 font-bold text-2xl leading-none cursor-pointer">&times;</button>
        </div>

        <!-- Body -->
        <div class="overflow-y-auto flex-1 pr-2 space-y-4">
            
            <!-- ตัวเลือก Document Type -->
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                <span class="text-xs font-bold text-slate-600">เลือกประเภทที่ต้องการแก้ไข:</span>
                <select id="modal-select-doctype" class="h-8 px-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500/20">
                    <option value="__NEW__">+ สร้างประเภทเอกสารใหม่ (New Type)</option>
                    @if(!empty($docTypes))
                        @foreach ($docTypes as $item)
                            <option value="{{ $item->DOC_TYPE_CODE }}">{{ $item->DOC_TYPE_CODE }} - {{ $item->DOC_TYPE_NAME }}</option>
                        @endforeach
                    @endif
                </select>
                <button type="button" id="btn-del-doctype" class="text-xs font-semibold text-rose-500 hover:text-rose-700 ml-auto hidden cursor-pointer">
                    🗑️ ลบประเภทเอกสารนี้
                </button>
            </div>

            <!-- ฟิลด์ Code & Name -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-[11px] font-bold text-slate-500 uppercase mb-1">DOC TYPE CODE <span class="text-rose-500">*</span></label>
                    <input type="text" id="m_doc_code" class="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-semibold uppercase" placeholder="e.g. QUALIFICATION">
                </div>
                <div>
                    <label class="block text-[11px] font-bold text-slate-500 uppercase mb-1">DOC TYPE NAME <span class="text-rose-500">*</span></label>
                    <input type="text" id="m_doc_name" class="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-medium" placeholder="e.g. Qualification Sheet">
                </div>
            </div>

            <!-- ตาราง Steps -->
            <div>
                <div class="flex items-center justify-between mb-2">
                    <label class="text-xs font-bold text-slate-700">Approval Steps (ตามตาราง FE_DOC_STEP_MST)</label>
                    <button type="button" id="btn-add-step-row" class="text-xs font-semibold bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white px-2.5 py-1 rounded-lg transition-all cursor-pointer">
                        + เพิ่ม Step
                    </button>
                </div>

                <div class="border border-slate-200 rounded-xl overflow-hidden">
                    <table class="w-full text-left text-xs border-collapse">
                        <thead class="bg-slate-100 text-slate-600 font-semibold border-b">
                            <tr>
                                <th class="p-2.5 w-12 text-center">Step</th>
                                <th class="p-2.5 w-16 text-center">EXT</th>
                                <th class="p-2.5">ตำแหน่งผู้อนุมัติ (Position Flow)</th>
                                <th class="p-2.5 w-60">กำหนดรหัสเฉพาะ (กรณี Requester)</th>
                                <th class="p-2.5 w-12 text-center">ลบ</th>
                            </tr>
                        </thead>
                        <tbody id="master-steps-tbody" class="divide-y divide-slate-100">
                            <!-- แถว Step จะถูก Render ที่นี่ -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="border-t pt-3 mt-3 flex items-center justify-end gap-2">
            <button type="button" class="btn-close-master-modal px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer">ปิด</button>
            <button type="button" id="btn-save-master-data" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer">💾 บันทึกข้อมูล Master</button>
        </div>
    </div>
</div>