<script>
    window.INITIAL_ATTACHED_FILES = @json($attachedFiles ?? []);
    window.IS_ADMIN               = @json($isAdmin ?? false);
    window.IS_SUPER_ADMIN         = @json($isSuperAdmin ?? false);
    window.IS_LOCKED              = @json($isLocked ?? false);

    window.INITIAL_SAVED_DETAILS = @json($savedDetails ?? []);
    window.INITIAL_PREV_FILE = @json($prevApprovedFile ?? []);
    window.IS_FIRST_STEP_APPROVED = @json($isFirstStepApproved ?? false);
</script>

<div class="p-6 rounded-2xl bg-slate-50/80 border border-slate-200/80 mb-6 shadow-xs">
    <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/60">
        <h2 class="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            🌿 REVIEW TABLE OF ENVIRONMENTAL ASPECT EVALUATION AND ENVIRONMENTAL RISK (AMEC-AR)
        </h2>
        <span class="px-2.5 py-0.5 rounded-full text-xs font-bold {{ ($CREATE_MODE ?? 'MANUAL') === 'AUTO' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700' }}">
            Mode: {{ $CREATE_MODE ?? 'MANUAL' }}
        </span>
    </div>

    <!-- แถวที่ 1: Doc No. & Control No.  -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
            <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Doc No.</label>
            <input type="text" id="DOC_IDTxt" class="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-emerald-700 cursor-not-allowed" readonly value="{{ $DOC_NO ?? '' }}">
            <input type="hidden" name="DocHeaderIDHid" id="DocHeaderIDHid" value="{{ $DOC_HEADER_ID ?? '' }}" />
            <input type="hidden" name="CREATE_MODEHid" id="CREATE_MODEHid" value="{{ $CREATE_MODE ?? 'MANUAL' }}" />
        </div>

        <div>
            <!-- ส่วนหัวเหนือ Dropdown: ใส่ Label พร้อมปุ่มจัดการทางขวา -->
            <div class="flex items-center justify-between mb-1">
                <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    CONTROL NUMBER <span class="text-rose-500">*</span>
                </label>

                <div class="flex items-center gap-1.5">
                    <!-- ปุ่ม Test ส่ง Email (แสดงเฉพาะ Admin / SuperAdmin) -->
                    @if(!empty($isSuperAdmin) || !empty($isAdmin))
                        <button type="button" id="btnTestSendEmail"
                                class="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-200/80 transition-colors shadow-2xs cursor-pointer">
                            Send Email
                        </button>

                        <a href="{{ site_url('feform/FE-ASP/control_mst?empno=' . ($EMPNO ?? '')) }}" 
                           target="_blank"
                           class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200/80 transition-colors shadow-2xs">
                            ⚙️ จัดการ Master Control No.
                        </a>
                    @endif
                </div>
            </div>

            <select id="ControlNoDrp" name="ControlNoDrp" class="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                <option value="">-- Choose Control No. --</option>
                @if(!empty($controls))
                    @foreach ($controls as $item)
                        <option value="{{ $item['CONTROL_NO'] }}" 
                                data-divcode="{{ $item['SDIVCODE'] }}"
                                data-divname="{{ $item['DIVISION_NAME'] }}"
                                {{ (isset($CONTROL_NO) && $CONTROL_NO == $item['CONTROL_NO']) ? 'selected' : '' }}>
                            {{ $item['CONTROL_NO'] }} 
                        </option>
                    @endforeach
                @endif
            </select>
        </div>
    </div>

    <!-- แถวที่ 2: Organization Snapshot (DIV, DEPT, SEC) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
            <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Division (ฝ่าย)</label>
            <input type="text" id="DivisionTxt" readonly value="{{ $DIVISION_NAME ?? '' }}" 
                   class="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 cursor-not-allowed">
            <input type="hidden" id="SDIVCODEHid" name="SDIVCODE" value="{{ $SDIVCODE ?? '' }}">
        </div>

        <div>
            <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Department (แผนก) <span class="text-rose-500">*</span>
            </label>
            <select id="DeptDrp" name="SDEPCODE" class="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                <option value="">-- Choose Department --</option>
                @if(!empty($departments))
                    @foreach ($departments as $d)
                        @php
                            $depCode = $d['SDEPCODE'] ?? '';
                            $depName = $d['DEPT_NAME'] ?? ($d['SDEPT'] ?? ($d['SDEPARTMENT'] ?? ''));
                        @endphp
                        <option value="{{ $depCode }}" {{ (isset($SDEPCODE) && $SDEPCODE == $depCode) ? 'selected' : '' }}>
                            {{ $depCode }} : {{ $depName }}
                        </option>
                    @endforeach
                @endif
            </select>
        </div>

        <div>
            <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Section (ส่วนงาน)</label>
            <select id="SecDrp" name="SSECCODE" class="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                <option value="00">00 : No Section</option>
                @if(!empty($sections))
                    @foreach ($sections as $s)
                        @php
                            $secCode = $s['SSECCODE'] ?? '';
                            $secName = $s['SEC_NAME'] ?? ($s['SSEC'] ?? ($s['SSECTION'] ?? ''));
                        @endphp
                        <option value="{{ $secCode }}" {{ (isset($SSECCODE) && $SSECCODE == $secCode) ? 'selected' : '' }}>
                            {{ $secCode }} : {{ $secName }}
                        </option>
                    @endforeach
                @endif
            </select>
        </div>
    </div>

    <!-- แถวที่ 3: Input By & Request By -->
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

    <!-- โซน Active Revision PDF (Previous Approved Document & Files) -->
    @php
        // ตรวจสอบว่ามีเอกสารคำขอล่าสุดส่งมาจาก Controller หรือไม่
        $hasPrevDoc = !empty($prevApprovedFile) && !empty($prevApprovedFile['header']);
        $prevHeader = $hasPrevDoc ? $prevApprovedFile['header'] : null;
        $prevFiles  = $hasPrevDoc ? ($prevApprovedFile['files'] ?? []) : [];

        $docFormUrl = '';
        if ($prevHeader) {
            $curHost = prep_url($_SERVER['HTTP_HOST'] ?? 'amecweb');
            $docFormUrl = rtrim($curHost, '/') . "/form/feform/FE-ASP/form/main?no={$prevHeader['NFRMNO']}&orgNo={$prevHeader['VORGNO']}&y={$prevHeader['CYEAR']}&y2={$prevHeader['CYEAR2']}&runNo={$prevHeader['NRUNNO']}&m=3&empno={$EMPNO}&bp=%2Fformtest%2Fworkflow%2FmineList.asp&menu=1";
        }
    @endphp

    <!-- กล่อง Active Revision: จะแสดงผลตั้งแต่ตอนโหลดหน้าทันทีถ้า $hasPrevDoc เป็นจริง ไม่ต้องรอ JS -->
    <div id="prev-revision-zone" class="mt-5 p-4 rounded-xl bg-blue-50/70 border border-blue-200 {{ $hasPrevDoc ? '' : 'hidden' }}">
        <!-- ส่วนหัว: แสดงเลขที่เอกสาร และปุ่มเปิดเอกสารคำขอล่าสุด -->
        <div class="flex items-center justify-between pb-2 mb-3 border-b border-blue-200/60">
            <span class="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                📑 ACTIVE REVISION (เอกสารเวอร์ชันล่าสุดที่ได้รับอนุมัติแล้ว: <span id="prev-doc-no" class="text-blue-700">{{ $prevHeader['DOC_NO'] ?? '' }}</span>)
            </span>
            <a id="btn-open-prev-doc" href="{{ $docFormUrl }}" target="_blank" rel="noopener noreferrer"
            class="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-blue-600 hover:text-white text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-all shadow-xs {{ empty($docFormUrl) ? 'hidden' : '' }}">
                📂 เปิดเอกสารคำขอล่าสุด
            </a>
        </div>

        <!-- รายการไฟล์แนบ -->
        <div id="prev-file-list" class="space-y-2">
            @if(!empty($prevFiles) && count($prevFiles) > 0)
                @foreach ($prevFiles as $file)
                    @php
                        $baseDir = str_replace('\\', '/', $file['FILE_PATH'] ?? '');
                    @endphp
                    <div class="flex items-center justify-between bg-white p-2.5 rounded-lg border border-blue-100 shadow-xs">
                        <div class="flex items-center gap-2 truncate">
                            <span class="text-rose-500 font-bold text-xs bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">PDF</span>
                            <span class="text-xs font-medium text-slate-700 truncate">{{ $file['FILE_ONAME'] ?? '' }}</span>
                        </div>
                        <button type="button" 
                                class="btn-open-prev-file bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer shrink-0"
                                data-base-dir="{{ $baseDir }}" 
                                data-stored-name="{{ $file['FILE_FNAME'] ?? '' }}" 
                                data-original-name="{{ $file['FILE_ONAME'] ?? 'document.pdf' }}">
                            📄 Open / Download
                        </button>
                    </div>
                @endforeach
            @else
                <div class="text-center py-2 text-xs text-slate-500 bg-white/60 rounded-lg border border-dashed border-blue-200 no-file-msg">
                    (ไม่มีไฟล์แนบในเอกสารฉบับนี้)
                </div>
            @endif
        </div>
    </div>

    <!-- ส่วนที่ 3: Review Period & Details -->
    <div class="mt-5 pt-4 border-t border-slate-200/60 space-y-4">
        <div>
            <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">REVIEW PERIOD</label>
            @php
                $isManual = ($CREATE_MODE ?? 'MANUAL') === 'MANUAL';
                $isAdminUser = !empty($isAdmin) || !empty($isSuperAdmin);
                
                // อนุญาตให้เลือก YEARLY ได้ถ้า: ไม่ใช่ Manual หรือเป็น Admin
                $canSelectYearly = !$isManual || $isAdminUser;
                // อนุญาตให้เลือก CHANGING ได้ถ้าเป็นโหมด Manual
                $canSelectChanging = $isManual;
            @endphp
            <div class="flex gap-6 text-xs font-bold text-slate-700">
                <!-- YEARLY REVIEW: อนุญาตถ้าเป็น AUTO หรือถ้าเป็น Admin ในโหมด Manual -->
                <label class="flex items-center gap-1.5 {{ !$canSelectYearly ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer' }}">
                    <input type="radio" 
                        id="radio_yearly"
                        name="REVIEW_PERIOD" 
                        value="YEARLY" 
                        {{ ($REVIEW_PERIOD ?? '') === 'YEARLY' ? 'checked' : '' }}
                        {{ !$canSelectYearly ? 'disabled' : '' }}> 
                    YEARLY REVIEW
                </label>

                <!-- REVIEW ON CHANGING: อนุญาตถ้าเป็น MANUAL -->
                <label class="flex items-center gap-1.5 {{ !$canSelectChanging ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer' }}">
                    <input type="radio" 
                        id="radio_changing"
                        name="REVIEW_PERIOD" 
                        value="CHANGING" 
                        {{ ($REVIEW_PERIOD ?? '') === 'CHANGING' ? 'checked' : '' }}
                        {{ !$canSelectChanging ? 'disabled' : '' }}> 
                    REVIEW ON CHANGING
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
        @php
            $isChangeDetail = (($REVIEW_DETAILS ?? 'NO_CHANGE') === 'CHANGE');
        @endphp

        <!-- กล่องสำหรับกรอกเมื่อเลือก CHANGE -->
        <div id="change-detail-box" 
             class="p-4 bg-white border border-slate-200 rounded-xl space-y-3 {{ $isChangeDetail ? '' : 'hidden' }}"
             style="{{ $isChangeDetail ? '' : 'display: none;' }}">
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

            <!-- แนบไฟล์ Revision ใหม่ -->
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

    <!-- ส่วนที่ 4: ตาราง Confirmation (แสดงเฉพาะโหมด YEARLY REVIEW) -->
    <div id="confirmation-table-zone" class="mt-6 pt-4 border-t border-slate-200/60 {{ $isManual ? 'hidden' : '' }}" style="{{ $isManual ? 'display: none;' : '' }}">
        
        <!-- ========================================================= -->
        <!-- ตารางที่ 1: ASPECT AND RISK REVIEW CONFIRMATION (1 - 14)    -->
        <!-- ========================================================= -->
        <div class="mb-6 rounded-xl border border-emerald-300 overflow-hidden shadow-xs">
            <div class="bg-emerald-100/80 px-4 py-2.5 border-b border-emerald-200 flex items-center justify-between">
                <h3 class="text-xs font-bold text-emerald-950 uppercase tracking-wide flex items-center gap-2">
                    🌿 1. ASPECT AND RISK REVIEW CONFIRMATION - ISO14001
                </h3>
                <span class="text-[11px] font-semibold text-emerald-800 bg-white/70 px-2 py-0.5 rounded-md border border-emerald-300">
                    Topic 1 - 14
                </span>
            </div>
            <div class="overflow-x-auto bg-white">
                <table class="w-full text-xs text-left" id="aspect-topics-table">
                    <thead class="bg-emerald-50/70 font-bold text-emerald-950 border-b border-emerald-200">
                        <tr>
                            <th class="p-2.5 text-center w-12">No.</th>
                            <th class="p-2.5">Review Topic</th>
                            <th class="p-2.5 text-center w-28">Condition</th>
                            <th class="p-2.5 text-center w-36">Change-Increased</th>
                            <th class="p-2.5 text-center w-36">Change-Decreased</th>
                            <th class="p-2.5 text-center w-32">No Change</th>
                            <th class="p-2.5 min-w-[200px]">Details</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-emerald-100">
                        @if(!empty($topics))
                            @foreach ($topics as $t)
                                @if(($t['TOPIC_GROUP'] ?? '') === 'ASPECT_REVIEW')
                                    <tr data-topic-id="{{ $t['TOPIC_ID'] }}" data-group="ASPECT_REVIEW" class="hover:bg-slate-50/70 transition-colors">
                                        <td class="p-2.5 text-center font-bold text-slate-600">{{ $t['TOPIC_SEQ'] }}</td>
                                        <td class="p-2.5 font-medium text-slate-800">{{ $t['TOPIC_NAME'] }}</td>
                                        
                                        <!-- Condition: N / A / E -->
                                        <td class="p-2.5 text-center">
                                            <div class="inline-flex gap-2.5 font-medium">
                                                <label class="inline-flex items-center gap-1 cursor-pointer">
                                                    <input type="radio" name="cond_{{ $t['TOPIC_ID'] }}" value="N" checked class="text-emerald-600 focus:ring-emerald-500"> N
                                                </label>
                                                <label class="inline-flex items-center gap-1 cursor-pointer">
                                                    <input type="radio" name="cond_{{ $t['TOPIC_ID'] }}" value="A" class="text-emerald-600 focus:ring-emerald-500"> A
                                                </label>
                                                <label class="inline-flex items-center gap-1 cursor-pointer">
                                                    <input type="radio" name="cond_{{ $t['TOPIC_ID'] }}" value="E" class="text-emerald-600 focus:ring-emerald-500"> E
                                                </label>
                                            </div>
                                        </td>

                                        <!-- Change-Increased (Y/N) -->
                                        <td class="p-2.5 text-center">
                                            <div class="inline-flex gap-2.5 font-medium">
                                                <label class="inline-flex items-center gap-1 cursor-pointer">
                                                    <input type="radio" name="inc_{{ $t['TOPIC_ID'] }}" value="Y" class="text-amber-600 focus:ring-amber-500"> 
                                                    <span class="text-amber-800 font-bold">Y</span>
                                                </label>
                                                <label class="inline-flex items-center gap-1 cursor-pointer">
                                                    <input type="radio" name="inc_{{ $t['TOPIC_ID'] }}" value="N" checked class="text-slate-500 focus:ring-slate-400"> N
                                                </label>
                                            </div>
                                        </td>

                                        <!-- Change-Decreased (Y/N) -->
                                        <td class="p-2.5 text-center">
                                            <div class="inline-flex gap-2.5 font-medium">
                                                <label class="inline-flex items-center gap-1 cursor-pointer">
                                                    <input type="radio" name="dec_{{ $t['TOPIC_ID'] }}" value="Y" class="text-blue-600 focus:ring-blue-500"> 
                                                    <span class="text-blue-800 font-bold">Y</span>
                                                </label>
                                                <label class="inline-flex items-center gap-1 cursor-pointer">
                                                    <input type="radio" name="dec_{{ $t['TOPIC_ID'] }}" value="N" checked class="text-slate-500 focus:ring-slate-400"> N
                                                </label>
                                            </div>
                                        </td>

                                        <!-- No Change (Y/N อิสระ) -->
                                        <td class="p-2.5 text-center">
                                            <div class="inline-flex gap-2.5 font-medium">
                                                <label class="inline-flex items-center gap-1 cursor-pointer">
                                                    <input type="radio" name="nochange_{{ $t['TOPIC_ID'] }}" value="Y" class="text-slate-700 focus:ring-slate-500"> 
                                                    <span class="text-slate-800 font-bold">Y</span>
                                                </label>
                                                <label class="inline-flex items-center gap-1 cursor-pointer">
                                                    <input type="radio" name="nochange_{{ $t['TOPIC_ID'] }}" value="N" checked class="text-slate-500 focus:ring-slate-400"> N
                                                </label>
                                            </div>
                                        </td>

                                        <!-- Details -->
                                        <td class="p-2.5">
                                            <input type="text" class="w-full h-8 px-2.5 border border-slate-200 rounded-lg text-xs topic-detail-in focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="-">
                                        </td>
                                    </tr>
                                @endif
                            @endforeach
                        @endif
                    </tbody>
                </table>
            </div>
        </div>

        <!-- ========================================================= -->
        <!-- ตารางที่ 2: AUDIT FINDINGS & COMPLAINTS (15 - 17)          -->
        <!-- ========================================================= -->
        <div class="rounded-xl border border-blue-300 overflow-hidden shadow-xs">
            <div class="bg-blue-100/80 px-4 py-2.5 border-b border-blue-200 flex items-center justify-between">
                <h3 class="text-xs font-bold text-blue-950 uppercase tracking-wide flex items-center gap-2">
                    📋 2. AUDIT FINDINGS & COMPLAINTS
                </h3>
                <span class="text-[11px] font-semibold text-blue-800 bg-white/70 px-2 py-0.5 rounded-md border border-blue-300">
                    Topic 15 - 17
                </span>
            </div>
            <div class="overflow-x-auto bg-white">
                <table class="w-full text-xs text-left" id="audit-topics-table">
                    <thead class="bg-blue-50/70 font-bold text-blue-950 border-b border-blue-200">
                        <tr>
                            <th class="p-2.5 text-center w-12">No.</th>
                            <th class="p-2.5">Review Topic</th>
                            <th class="p-2.5 text-center w-56">Result</th>
                            <th class="p-2.5 min-w-[200px]">Details</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-blue-100">
                        @if(!empty($topics))
                            @foreach ($topics as $t)
                                @if(($t['TOPIC_GROUP'] ?? '') === 'AUDIT_COMPLAIN')
                                    <tr data-topic-id="{{ $t['TOPIC_ID'] }}" data-group="AUDIT_COMPLAIN" class="hover:bg-slate-50/70 transition-colors">
                                        <td class="p-2.5 text-center font-bold text-slate-600">{{ $t['TOPIC_SEQ'] }}</td>
                                        <td class="p-2.5 font-medium text-slate-800">{{ $t['TOPIC_NAME'] }}</td>
                                        
                                        <!-- Result: Found / Not Found -->
                                        <td class="p-2.5 text-center">
                                            <div class="inline-flex gap-4 font-medium">
                                                <label class="inline-flex items-center gap-1 cursor-pointer">
                                                    <input type="radio" name="result_{{ $t['TOPIC_ID'] }}" value="FOUND" class="text-rose-600 focus:ring-rose-500">
                                                    <span class="text-rose-700 font-semibold">Found</span>
                                                </label>
                                                <label class="inline-flex items-center gap-1 cursor-pointer">
                                                    <input type="radio" name="result_{{ $t['TOPIC_ID'] }}" value="NOT_FOUND" checked class="text-emerald-600 focus:ring-emerald-500">
                                                    <span class="text-emerald-700 font-semibold">Not Found</span>
                                                </label>
                                            </div>
                                        </td>

                                        <!-- Details -->
                                        <td class="p-2.5">
                                            <input type="text" class="w-full h-8 px-2.5 border border-slate-200 rounded-lg text-xs topic-detail-in focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="-">
                                        </td>
                                    </tr>
                                @endif
                            @endforeach
                        @endif
                    </tbody>
                </table>
            </div>
        </div>

    </div>
</div>