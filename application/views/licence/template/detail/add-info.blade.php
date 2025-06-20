<div class="flex-1 border shadow-md rounded-lg p-5 bg-base-200 h-full flex flex-col gap-2" id="docinfo">
    <h1 class="text-xl font-extrabold">Document Information</h1>
    <div class="divider !m-2"></div>

    <fieldset class="fieldset">
        <legend class="fieldset-legend font-bold text-sm">Prefix<span class="text-error">*</span></legend>
        <input type="text" class="input w-full uppercase req docno" name="doc_no" maxlength="5" />
        <input type="hidden" class="input docid" name="doc_id" />
    </fieldset>

    <fieldset class="fieldset">
        <legend class="fieldset-legend font-bold text-sm">Title<span class="text-error">*</span></legend>
        <input type="text" class="input w-full docname req" name="docname" maxlength="50" />
    </fieldset>


    <fieldset class="fieldset">
        <legend class="fieldset-legend font-bold text-sm">Document Type<span class="text-error">*</span></legend>
        <select class="select w-full req doctype" name="doc_type" id="doc_type" placeholder="Select Document Type">
            <option disabled selected value=""></option>
        </select>
    </fieldset>

    <fieldset class="fieldset">
        <legend class="fieldset-legend font-bold text-sm">Control Term<span class="text-error">*</span></legend>
        <div class="flex gap-3">
            <input type="number" class="flex-1 input w-full req docterm" name="doc_term" min="30" />
            <select class="flex-none select s2 max-w-[120px] doctermunit" name="doc_termunit">
                <option value="Day" selected>Day</option>
                <option value="Month">Month</option>
                <option value="Year">Year</option>
            </select>
        </div>
    </fieldset>

    <fieldset class="fieldset">
        <legend class="fieldset-legend font-bold text-sm">Early alert<span class="text-error">*</span></legend>
        <input type="number" class="input w-full req docalert" />
        <p class="label">System will notify before your document expire</p>
    </fieldset>
</div>
