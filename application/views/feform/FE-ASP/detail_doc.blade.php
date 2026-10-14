<script>
    // ส่งข้อมูลตั้งแต่วินาทีแรกที่ Server โหลดเสร็จ
    window.INITIAL_ATTACHED_FILES = @json($attachedFiles ?? []);
    window.INITIAL_SAVED_DETAILS  = @json($savedDetails ?? []);
    window.INITIAL_PREV_FILE      = @json($prevApprovedFile ?? null);
</script>

<div class="p-6 rounded-2xl bg-slate-50/80 border border-slate-200/80 mb-6 shadow-xs">
    <h2 class="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 pb-2 border-b border-slate-200/60 flex items-center gap-2">
        🌿 REVIEW TABLE OF ENVIRONMENTAL ASPECT EVALUATION AND ENVIRONMENTAL RISK (FE-ASP)
    </h2>

    <!-- แถวที่ 1: Doc No. และ Control No. -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
            <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Doc No.</label>
            <input type="text" id="DOC_IDTxt" class="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-emerald-700 cursor-not-allowed" readonly value="{{ $DOC_NO ?? '' }}">
            <input type="hidden" name="DocHeaderIDHid" id="DocHeaderIDHid" value="{{ $DOC_HEADER_ID ?? '' }}" />
        </div>

        <div>
            <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                CONTROL NUMBER <span class="text-rose-500">*</span>
            </label>
            <select id="ControlNoDrp" name="ControlNoDrp" class="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                <option value="">-- Choose Control No. --</option>
                @if(!empty($controls))
                    @foreach ($controls as $item)
                        <option value="{{ $item['CONTROL_NO'] }}" {{ (isset($CONTROL_NO) && $CONTROL_NO == $item['CONTROL_NO']) ? 'selected' : '' }}>
                            {{ $item['CONTROL_NO'] }} : {{ $item['CONTROL_NAME'] }}
                        </option>
                    @endforeach
                @endif
            </select>
        </div>
    </div>

    <!-- แถวที่ 2: Division & Department / Section (ดึงจาก Master อัตโนมัติ) -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
            <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Division</label>
            <input type="text" id="DivisionTxt" readonly value="{{ $controlInfo['DIVISION_NAME'] ?? '' }}" class="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 cursor-not-allowed">
        </div>
        <div>
            <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Department / Section</label>
            <input type="text" id="DeptSecTxt" readonly value="{{ !empty($controlInfo) ? (($controlInfo['DEPARTMENT_NAME'] ?? '-') . ' / ' . ($controlInfo['SECTION_NAME'] ?? '-')) : '' }}" class="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 cursor-not-allowed">
        </div>
    </div>

    <!-- แถวที่ 3: Input By และ Request By (ตาม Pattern FE-DOC ค้นหาชื่ออัตโนมัติ) -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
            <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Input By</label>
            <div class="flex items-center gap-2">
                <div class="relative w-28 shrink-0">
                    <input type="text" id="INPUT_BY_EMPNO" name="INPUT_BY" readonly tabindex="-1" value="{{ $INPUTBY_EMPNO ?? '' }}" class="w-full h-10 px-2 text-center bg-slate-100 border border-slate-200 rounded-lg text-sm font-semibold tracking-wide text-slate-600 cursor-not-allowed">
                </div>
                <div class="relative flex-1">
                    <input type="text" id="INPUT_BY_NAME" readonly tabindex="-1" value="{{ $INPUTBY_NAME ?? '' }}" class="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 cursor-not-allowed truncate">
                </div>
            </div>
        </div>

        <div>
            <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Request By <span class="{{ empty($NRUNNO) ? 'text-rose-500' : 'hidden' }}">*</span>
            </label>
            <div class="flex items-center gap-2">
                <div class="relative w-28 shrink-0">
                    <input type="text" id="REQUEST_BY_EMPNO" name="REQUEST_BY" maxlength="5" placeholder="รหัส 5 หลัก" value="{{ $REQBY_EMPNO ?? '' }}" {{ !empty($NRUNNO) ? 'readonly' : '' }} class="w-full h-10 px-2 text-center border border-slate-200 rounded-lg text-sm font-semibold tracking-wide transition-all {{ !empty($NRUNNO) ? 'bg-slate-100 text-slate-600 cursor-not-allowed' : 'bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500' }}">
                </div>
                <div class="relative flex-1">
                    <input type="text" id="REQUEST_BY_NAME" readonly tabindex="-1" value="{{ $REQBY_NAME ?? '' }}" class="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 cursor-not-allowed truncate">
                </div>
            </div>
        </div>
    </div>

    <!-- ส่วนที่ 2: โซนไฟล์ Revision เดิม (Previous Approved PDF - แสดงผลเสมอทุก Case) -->
    <div id="prev-revision-zone" class="mt-5 p-4 rounded-xl bg-blue-50/70 border border-blue-200 {{ empty($prevApprovedFile) ? 'hidden' : '' }}">
        <span class="text-xs font-bold text-blue-900 block mb-2">📑 ACTIVE REVISION PDF (เอกสารเวอร์ชันล่าสุดที่ได้รับอนุมัติแล้ว - อ้างอิงทุกกรณี)</span>
        <div class="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-100 shadow-xs">
            <div class="flex items-center gap-2 truncate">
                <span class="text-rose-500 font-bold text-xs bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">PDF</span>
                <span id="prev-file-name" class="text-xs font-semibold text-slate-700 truncate">{{ $prevApprovedFile['FILE_ONAME'] ?? '' }}</span>
            </div>
            <button type="button" id="btn-open-prev-file" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer">
                📄 Open / Download File
            </button>
        </div>
    </div>

    <!-- ส่วนที่ 3: Review Period & Details -->
    <div class="mt-5 pt-4 border-t border-slate-200/60 space-y-4">
        <div>
            <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">REVIEW PERIOD</label>
            <div class="flex gap-6 text-xs font-bold text-slate-700">
                <label class="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="REVIEW_PERIOD" value="YEARLY" {{ ($REVIEW_PERIOD ?? 'YEARLY') === 'YEARLY' ? 'checked' : '' }}> YEARLY REVIEW
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="REVIEW_PERIOD" value="CHANGING" {{ ($REVIEW_PERIOD ?? '') === 'CHANGING' ? 'checked' : '' }}> REVIEW ON CHANGING
                </label>
            </div>
        </div>

        <div>
            <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">REVIEW DETAILS</label>
            <div class="flex gap-6 text-xs font-bold text-slate-700">
                <label class="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="REVIEW_DETAILS" value="NO_CHANGE" {{ ($REVIEW_DETAILS ?? 'NO_CHANGE') === 'NO_CHANGE' ? 'checked' : '' }}> NO CHANGE
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="REVIEW_DETAILS" value="CHANGE" {{ ($REVIEW_DETAILS ?? '') === 'CHANGE' ? 'checked' : '' }}> CHANGE
                </label>
            </div>
        </div>

        <!-- กล่องสำหรับกรอกเมื่อเลือก CHANGE -->
        <div id="change-detail-box" class="p-4 bg-white border border-slate-200 rounded-xl space-y-3 {{ ($REVIEW_DETAILS ?? '') === 'CHANGE' ? '' : 'hidden' }}">
            <div>
                <label class="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    1. Detail of Change <span class="text-rose-500">*</span>
                </label>
                <input type="text" id="DetailChangeTxt" value="{{ $DETAIL_OF_CHANGE ?? '' }}" class="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs" placeholder="ระบุกิจกรรม ขั้นตอน หรือสารเคมีที่มีการเปลี่ยนแปลง">
            </div>
            <div>
                <label class="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    2. Effect to Environmental Aspects and Risks <span class="text-rose-500">*</span>
                </label>
                <div class="flex gap-6 text-xs font-medium text-slate-700">
                    <label class="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="EFFECT_STATUS" value="NO_EFFECT" {{ ($EFFECT_STATUS ?? 'NO_EFFECT') === 'NO_EFFECT' ? 'checked' : '' }}> No Effect
                    </label>
                    <label class="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="EFFECT_STATUS" value="EFFECT" {{ ($EFFECT_STATUS ?? '') === 'EFFECT' ? 'checked' : '' }}> Effect
                    </label>
                </div>
            </div>

            <!-- โซน Dropzone สำหรับแนบไฟล์ Revision ใหม่ -->
            <div class="pt-2">
                <label class="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Upload New Revision PDF <span class="text-rose-500">*</span>
                </label>
                <input type="file" id="files" class="hidden" accept=".pdf,application/pdf">
                <div id="drop-zone" class="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/50 rounded-xl p-5 text-center cursor-pointer transition-all">
                    <p class="text-xs font-semibold text-slate-700">คลิกเลือกไฟล์ หรือลากไฟล์ PDF มาวางที่นี่</p>
                    <p class="text-[11px] text-slate-400">รองรับเฉพาะไฟล์ PDF (.pdf) สำหรับประทับตรายาง</p>
                </div>

                <div id="file-list-container" class="mt-2 hidden">
                    <ul id="selected-files-list" class="divide-y divide-slate-100 border border-slate-200 rounded-lg bg-white p-2 text-xs"></ul>
                </div>

                <div id="download-zone" class="mt-2 hidden">
                    <ul id="uploaded-files-list" class="divide-y divide-slate-100 border border-slate-200 rounded-lg bg-white p-2 shadow-xs text-xs"></ul>
                </div>
            </div>
        </div>
    </div>

    <!-- ส่วนที่ 4: ตาราง Confirmation สีเขียว (แสดงผลตลอด / บังคับตอบ) -->
    <div id="confirmation-table-zone" class="mt-6 pt-4 border-t border-slate-200/60">
        <h3 class="text-xs font-bold text-emerald-900 bg-emerald-100/70 px-3 py-2.5 rounded-t-xl border border-emerald-300">
            ASPECT AND RISK REVIEW CONFIRMATION - ISO14001
        </h3>
        <div class="overflow-x-auto border border-t-0 border-emerald-300 rounded-b-xl">
            <table class="w-full text-xs text-left" id="confirmation-topics-table">
                <thead class="bg-emerald-50 font-bold text-emerald-950 border-b border-emerald-200">
                    <tr>
                        <th class="p-2.5 text-center w-12">No.</th>
                        <th class="p-2.5">Review Topic</th>
                        <th class="p-2.5 text-center w-28">Condition</th>
                        <th class="p-2.5 text-center w-36">Change (Inc/Dec)</th>
                        <th class="p-2.5 text-center w-24">No Change</th>
                        <th class="p-2.5 w-52">Details</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-emerald-100 bg-white" id="topics-tbody">
                    @if(!empty($topics))
                        @foreach ($topics as $t)
                            <tr data-topic-id="{{ $t['TOPIC_ID'] }}" class="hover:bg-slate-50/60 transition-colors">
                                <td class="p-2.5 text-center font-bold text-slate-600">{{ $t['TOPIC_SEQ'] }}</td>
                                <td class="p-2.5 font-medium text-slate-800">{{ $t['TOPIC_NAME'] }}</td>
                                @if($t['TOPIC_GROUP'] !== 'AUDIT_COMPLAIN')
                                    <td class="p-2.5 text-center">
                                        <div class="inline-flex gap-2 font-medium">
                                            <label><input type="radio" name="cond_{{ $t['TOPIC_ID'] }}" value="N" checked> N</label>
                                            <label><input type="radio" name="cond_{{ $t['TOPIC_ID'] }}" value="A"> A</label>
                                            <label><input type="radio" name="cond_{{ $t['TOPIC_ID'] }}" value="E"> E</label>
                                        </div>
                                    </td>
                                    <td class="p-2.5 text-center">
                                        <div class="inline-flex gap-2 font-medium">
                                            <label><input type="radio" name="change_{{ $t['TOPIC_ID'] }}" value="INCREASE"> Inc</label>
                                            <label><input type="radio" name="change_{{ $t['TOPIC_ID'] }}" value="DECREASE"> Dec</label>
                                        </div>
                                    </td>
                                    <td class="p-2.5 text-center">
                                        <input type="radio" name="change_{{ $t['TOPIC_ID'] }}" value="NO_CHANGE" checked>
                                    </td>
                                @else
                                    <td class="p-2.5 text-center" colspan="2">
                                        <div class="inline-flex gap-3 font-medium">
                                            <label><input type="radio" name="change_{{ $t['TOPIC_ID'] }}" value="FOUND"> Found</label>
                                            <label><input type="radio" name="change_{{ $t['TOPIC_ID'] }}" value="NOT_FOUND" checked> Not Found</label>
                                        </div>
                                    </td>
                                    <td class="p-2.5 text-center text-slate-400">-</td>
                                @endif
                                <td class="p-2.5">
                                    <input type="text" class="w-full h-8 px-2 border border-slate-200 rounded text-xs topic-detail-in" placeholder="-">
                                </td>
                            </tr>
                        @endforeach
                    @endif
                </tbody>
            </table>
        </div>
    </div>
</div>