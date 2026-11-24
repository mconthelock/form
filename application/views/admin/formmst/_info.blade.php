{{-- Block 1: General Information (Procurement Vendor Detail Style) --}}
<div class="border border-base-300">
    <div class="px-4 py-3 bg-base-200 border-b border-base-300 flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
            <span class="w-1.5 h-5 bg-primary shrink-0"></span>
            <h2 class="text-sm font-bold uppercase tracking-wider text-primary">
                General Information (ข้อมูลทั่วไปของฟอร์ม)
            </h2>
        </div>
        <span class="font-mono text-xs wf-mute uppercase">Form Identity</span>
    </div>

    <div class="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {{-- NNO --}}
        <div class="space-y-1.5">
            <label class="block text-sm uppercase font-bold wf-mute" for="nno">Form No. (NNO)</label>
            <input type="text" class="input input-md w-full font-mono text-base font-semibold text-primary req-1"
                id="nno" placeholder="NNO" data-mapping="NNO" readonly />
        </div>

        {{-- VORGNO --}}
        <div class="space-y-1.5">
            <label class="block text-sm uppercase font-bold wf-mute" for="vorgno">Organization Owner (VORGNO)</label>
            <select class="select select-md w-full text-sm req-1" id="vorgno" data-mapping="VORGNO"></select>
        </div>

        {{-- CYEAR --}}
        <div class="space-y-1.5">
            <label class="block text-sm uppercase font-bold wf-mute" for="cyear">Fiscal Year (CYEAR)</label>
            <input type="text" class="input input-md w-full font-mono text-base font-semibold text-primary req-1"
                id="cyear" placeholder="CYEAR" data-mapping="CYEAR" readonly />
        </div>

        {{-- VNAME --}}
        <div class="space-y-1.5 md:col-span-2">
            <label class="block text-sm uppercase font-bold wf-mute">Form Name (VNAME)</label>
            <input type="text" class="input input-md w-full text-base font-medium req-1" placeholder="Form Name"
                data-mapping="VNAME" />
        </div>

        {{-- VANAME --}}
        <div class="space-y-1.5">
            <label class="block text-sm uppercase font-bold wf-mute">Short Code (VANAME)</label>
            <input type="text"
                class="input input-md w-full font-mono text-base font-bold text-primary uppercase req-1"
                placeholder="VANAME" data-mapping="VANAME" />
        </div>

        {{-- VDESC --}}
        <div class="space-y-1.5 md:col-span-3">
            <label class="block text-sm uppercase font-bold wf-mute">Description (VDESC)</label>
            <textarea class="textarea textarea-md min-h-24 w-full text-base req-" placeholder="Form description..."
                data-mapping="VDESC"></textarea>
        </div>
    </div>
</div>

{{-- Block 2: Routing, Ownership & Metadata --}}
<div class="border border-base-300">
    <div class="px-4 py-3 bg-base-200 border-b border-base-300 flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
            <span class="w-1.5 h-5 bg-primary shrink-0"></span>
            <h2 class="text-sm font-bold uppercase tracking-wider text-primary">
                Routing &amp; Configuration (การตั้งค่าระบบและผู้ดูแล)
            </h2>
        </div>
        <span class="font-mono text-xs wf-mute uppercase">System Metadata</span>
    </div>

    <div class="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {{-- VFORMPAGE --}}
        <div class="space-y-1.5 md:col-span-3">
            <label class="block text-sm uppercase font-bold wf-mute">Form Page URL (VFORMPAGE)</label>
            <input type="text" class="input input-md w-full font-mono text-sm req-1" placeholder="VFORMPAGE"
                data-mapping="VFORMPAGE" />
        </div>

        {{-- VDIR / Group --}}
        <div class="space-y-1.5">
            <label class="block text-sm uppercase font-bold wf-mute" for="formgroup">Form Group</label>
            <select class="select select-md w-full text-sm" data-mapping="VDIR" id="formgroup"></select>
        </div>

        {{-- VDEVELOPER --}}
        <div class="space-y-1.5">
            <label class="block text-sm uppercase font-bold wf-mute" for="developer">Developer</label>
            <select class="select select-md w-full text-sm" data-mapping="VDEVELOPER" id="developer">
                <option disabled selected></option>
            </select>
        </div>

        {{-- NLIFETIME --}}
        <div class="space-y-1.5">
            <label class="block text-sm uppercase font-bold wf-mute">Life Time (Days)</label>
            <input type="text" class="input input-md w-full font-mono text-base req-1" placeholder="NLIFETIME"
                data-mapping="NLIFETIME" />
        </div>

        {{-- DCREDATE --}}
        <div class="space-y-1.5">
            <label class="block text-sm uppercase font-bold wf-mute">Create Date</label>
            <input type="text" class="input input-md w-full font-mono text-base" value="{{ date('Y-m-d') }}"
                placeholder="{{ date('Y-m-d') }}" data-mapping="DCREDATE" readonly />
        </div>

        {{-- CCRETIME --}}
        <div class="space-y-1.5">
            <label class="block text-sm uppercase font-bold wf-mute">Create Time</label>
            <input type="text" class="input input-md w-full font-mono text-base" value="{{ date('H:i:s') }}"
                placeholder="{{ date('H:i:s') }}" data-mapping="CCRETIME" readonly />
        </div>

        {{-- CCREATED --}}
        <div class="space-y-1.5">
            <label class="block text-sm uppercase font-bold wf-mute" for="ccreated">Webform Create (CCREATED)</label>
            <select class="select select-md w-full text-sm" id="ccreated" data-mapping="CCREATED">
                <option value="1">Allow (สร้างจาก Webform ได้)</option>
                <option value="0">Not Allowed (ไม่สามารถสร้างได้)</option>
            </select>
        </div>
    </div>
</div>
