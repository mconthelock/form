<section class="bg-gray-200 border border-gray-300">
    <div class="flex gap-8 text-sm p-4">
        <div class="flex gap-2 items-center">
            <h1 class="font-mono text-lg font-bold text-gray-600">Form No:</h1>
            <span class="font-mono bg-white border border-gray-300 px-2 py-1" id="form-header-no">......</span>
            <a href="#"><i class="fi fi-rr-copy-alt text-md"></i></a>
        </div>
        <div class="flex gap-2 items-center">
            <h1 class="font-mono text-lg font-bold text-gray-600 flex flex-row items-center gap-1"><i
                    class="fi fi-rr-calendar-day"></i>Create Date:</h1>
            <span class="font-mono px-2 py-1" id="form-header-date">......</span>
        </div>
    </div>

    <div class="flex flex-col md:flex-row gap-4 bg-white py-3 px-5">
        <div class="flex-1">
            <div class="flex items-center justify-between gap-2 mb-1">
                <div class="flex items-center gap-2">
                    <h1 class="font-mono font-bold text-gray-600">REQUESTED BY</h1>
                    <span id="form-header-req-badge"
                        class="hidden badge badge-xs badge-outline badge-primary font-mono uppercase">On behalf</span>
                </div>
                <button type="button" id="form-header-req-change-btn"
                    class="hidden btn btn-xs btn-ghost text-primary hover:bg-primary/10 gap-1 font-normal">
                    <i class="fi fi-rr-user-pen text-xs"></i>
                    <span>เปลี่ยนผู้ขอ</span>
                </button>
            </div>

            <input type="hidden" id="form-header-req-no" name="req_by" value="" />

            <div id="form-header-req-editor"
                class="hidden mb-2 p-2 bg-gray-50 border border-gray-300 flex flex-col gap-1.5">
                <div class="flex items-center gap-1.5">
                    <label class="input input-xs border border-gray-300 bg-white flex items-center gap-1.5 flex-1">
                        <i class="fi fi-rr-id-badge text-xs text-gray-400 shrink-0"></i>
                        <input type="text" id="form-header-req-input"
                            class="grow text-xs outline-none border-none focus:outline-none"
                            placeholder="กรอกรหัสพนักงาน (Emp. No.)" autocomplete="off" />
                    </label>
                    <button type="button" id="form-header-req-confirm" class="btn btn-xs btn-primary gap-1">
                        <span class="loading loading-spinner loading-xs hidden"></span>
                        <span>ตกลง</span>
                    </button>
                    <button type="button" id="form-header-req-cancel" class="btn btn-xs btn-ghost">
                        ยกเลิก
                    </button>
                </div>
                <div id="form-header-req-error" class="hidden text-[11px] text-error flex items-center gap-1">
                    <i class="fi fi-rr-exclamation text-xs"></i>
                    <span></span>
                </div>
            </div>

            <div class="flex gap-3 items-center" id="form-header-req">
                <div class="avatar">
                    <div class="w-16 rounded border border-gray-300 shadow-sm img">
                        <div class="h-full w-full bg-gray-200"></div>
                    </div>
                </div>
                <div>
                    <div class="text-md font-bold text-gray-500 name">......</div>
                    <div class="text-xs text-gray-400 pos">.......</div>
                    <div class="text-xs text-gray-400 org">....</div>
                    <div class="text-xs text-gray-400 email">.....</div>
                </div>
            </div>
        </div>
        <div class="flex-1">
            <h1 class="font-mono font-bold text-gray-600 mb-1">INPUTTED BY</h1>
            <div class="flex gap-3 items-center" id="form-header-inputted">
                <div class="avatar">
                    <div class="w-16 rounded border border-gray-300 shadow-sm img">
                        <div class="h-full w-full bg-gray-200"></div>
                    </div>
                </div>
                <div>
                    <div class="text-md font-bold text-gray-500 name">......</div>
                    <div class="text-xs text-gray-400 pos">.......</div>
                    <div class="text-xs text-gray-400 org">....</div>
                    <div class="text-xs text-gray-400 email">.....</div>
                </div>
            </div>
        </div>
        <div class="flex-1">
            <h1 class="font-mono font-bold text-gray-600 mb-1">PURPOSE & JUSTIFICATION / REMARK</h1>
            <div class="border border-gray-300 border-dashed p-2 text-xs min-h-14" id="form-header-remark"></div>
            <textarea id="form-header-remark-input" name="remark" rows="2"
                class="hidden textarea w-full border border-dashed! border-gray-300 p-2 text-sm min-h-16 bg-white focus:border-primary focus:outline-none"
                placeholder="ระบุวัตถุประสงค์ / เหตุผล หรือหมายเหตุเพิ่มเติม..."></textarea>
        </div>
    </div>
</section>
