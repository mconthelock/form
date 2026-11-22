<div class="space-y-3">
    <div class="space-y-1">
        <label class="block text-xs uppercase font-bold wf-mute" for="report-name">Report Name</label>
        <input type="text" class="input input-sm h-9.5 w-full req" placeholder="Report Name" id="report-name" />
        <input type="text" id="report-id" class="input hidden">
    </div>

    <div class="space-y-1">
        <label class="block text-xs uppercase font-bold wf-mute" for="report-owner">Owner</label>
        <select class="select select-sm h-9.5 w-full req" id="report-owner">
            <option value=""></option>
        </select>
    </div>

    <div class="space-y-1">
        <label class="block text-xs uppercase font-bold wf-mute" for="report-url">URL</label>
        <input type="text" class="input input-sm h-9.5 w-full font-mono text-xs req" placeholder="Report URL"
            id="report-url" />
    </div>

    <div class="space-y-1">
        <label class="block text-xs uppercase font-bold wf-mute" for="report-seq">Sequence</label>
        <input type="number" class="input input-sm h-9.5 w-full font-mono req" placeholder="Report Seq."
            id="report-seq" />
    </div>

    <div class="space-y-1.5">
        <span class="block text-xs uppercase font-bold wf-mute">Status</span>
        <div class="flex gap-4 items-center text-xs px-3 py-2 bg-base-200 border border-base-300">
            <label for="active" class="inline-flex items-center gap-1.5 cursor-pointer font-medium">
                <input type="radio" id="active" class="radio radio-xs radio-primary reportstatus" name="reportstatus"
                    value="1" checked>
                <span>Active</span>
            </label>
            <label for="inactive" class="inline-flex items-center gap-1.5 cursor-pointer font-medium">
                <input type="radio" id="inactive" class="radio radio-xs radio-primary reportstatus" name="reportstatus"
                    value="0">
                <span>Inactive</span>
            </label>
        </div>
    </div>

    <div class="pt-2">
        <button class="btn btn-sm btn-primary w-full" id="save-report" type="button">Save Report</button>
    </div>
</div>
