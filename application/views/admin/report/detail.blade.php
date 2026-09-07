<fieldset class="fieldset">
    <legend class="fieldset-legend">Name</legend>
    <input type="text" class="input w-full req" placeholder="Report Name" id="report-name" />
    <input type="text" id="report-id" class="input hidden">
</fieldset>

<fieldset class="fieldset">
    <legend class="fieldset-legend">Owner</legend>
    <select class="select w-full req" id="report-owner">
        <option value=""></option>
    </select>
</fieldset>

<fieldset class="fieldset">
    <legend class="fieldset-legend">URL</legend>
    <input type="text" class="input w-full req" placeholder="Report URL" id="report-url" />
</fieldset>

<fieldset class="fieldset">
    <legend class="fieldset-legend">Status</legend>
    <div class="flex gap-2 items-center text-sm">
        <input type="radio" id="active" class="radio radio-sm reportstatus" name="reportstatus" value="1"
            checked>
        <label for="#active">Active</label>
        <input type="radio" id="inactive" class="radio radio-sm reportstatus" name="reportstatus" value="0">
        <label for="#inactive">Inactive</label>
    </div>
</fieldset>

<div class="mt-3">
    <button class="btn btn-primary w-full" id="save-report">Save</button>
</div>
