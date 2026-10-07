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
        </div>
    </div>

    <!-- โซนแนบไฟล์เอกสาร (PDF & Excel) -->
    <!-- โซนแนบไฟล์เอกสาร (เฉพาะ PDF) -->
    <div class="mt-4">
        <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            ATTACHMENT FILES (รองรับเฉพาะไฟล์ PDF เท่านั้น) <span class="text-rose-500">*</span>
        </label>
        
        <!-- ซ่อน file input ไว้นอก drop-zone และรับเฉพาะ .pdf -->
        <input type="file" id="files" name="files[]" class="hidden" accept=".pdf,application/pdf" multiple>

        <div id="drop-zone" class="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white rounded-2xl p-6 text-center cursor-pointer transition-all">
            <div class="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                <span class="text-3xl">📄</span>
                <p class="text-sm font-semibold text-slate-700">คลิกเลือกไฟล์ หรือลากไฟล์มาวางที่นี่</p>
                <p class="text-xs text-rose-500 font-medium">รองรับเฉพาะไฟล์ PDF (สูงสุด 5MB)</p>
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