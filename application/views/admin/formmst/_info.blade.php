<fieldset class="fieldset">
    <legend class="fieldset-legend text-slate-500 font-bold!">Form Master Ref.</legend>
    <div class="grid grid-cols-3 gap-4">
        <input type="text" class="input req-1" id="nno" placeholder="NNO" data-mapping="NNO" readonly />
        <select class="select w-full req-1" id="vorgno" data-mapping="VORGNO"></select>
        <input type="text" class="input req-1" id="cyear" placeholder="CYEAR" data-mapping="CYEAR" readonly />
    </div>
</fieldset>

<fieldset class="fieldset">
    <legend class="fieldset-legend text-slate-500 font-bold!">Form Name</legend>
    <div class="flex gap-4">
        <input type="text" class="input w-3/4 req-1" placeholder="VNAME" data-mapping="VNAME" />
        <input type="text" class="input w-1/4 req-1" placeholder="VANAME" data-mapping="VANAME" />
    </div>
</fieldset>

<fieldset class="fieldset">
    <legend class="fieldset-legend text-slate-500 font-bold!">Description</legend>
    <textarea class="textarea h-24 w-full req-" placeholder="VDESC" data-mapping="VDESC"></textarea>
</fieldset>

<fieldset class="fieldset">
    <legend class="fieldset-legend text-slate-500 font-bold!">URL</legend>
    <input type="text" class="input w-full req-1" placeholder="VFORMPAGE" data-mapping="VFORMPAGE" />
</fieldset>

<fieldset class="fieldset flex gap-4">
    <div class="flex-1">
        <legend class="fieldset-legend text-slate-500 font-bold!">Group</legend>
        <select class="select w-full" data-mapping="VDIR" id="formgroup"></select>
    </div>
    <div class="flex-1">
        <legend class="fieldset-legend text-slate-500 font-bold!">Lift Time (Days)</legend>
        <input type="text" class="input w-full req-1" placeholder="NLIFETIME" data-mapping="NLIFETIME" />
    </div>
</fieldset>

<fieldset class="fieldset flex gap-4">
    <div class="flex-1">
        <legend class="fieldset-legend text-slate-500 font-bold!">Developer</legend>
        <select class="select w-full" data-mapping="VDEVELOPER" id="developer">
            <option disabled selected></option>
        </select>
    </div>
    <div class="flex-1">
        <legend class="fieldset-legend text-slate-500 font-bold!">Create Date</legend>
        <div class="flex gap-2">
            <input type="text" class="input w-full" value="{{ date('Y-m-d') }}" placeholder="{{ date('Y-m-d') }}"
                data-mapping="DCREDATE" readonly />
            <input type="text" class="input w-full" value="{{ date('H:i:s') }}" placeholder="{{ date('H:i:s') }}"
                data-mapping="CCRETIME" readonly />
        </div>
    </div>
</fieldset>
