<div class="flex flex-col gap-2 hiddenx" id="flow-list-row">
</div>

<div class="bg-base-100 rounded-box shadow-md border border-slate-200 hidden" id="add-flow-form">
    <form action="#" class="p-4 space-y-3" id="flow-form">
        <h1 class="font-semibold mb-2">New Flow Step</h1>
        <fieldset class="fieldset">
            <legend class="fieldset-legend">Flow Name</legend>
            <select class="select w-full s2">
                <option value=""></option>
            </select>
        </fieldset>

        <fieldset class="fieldset">
            <legend class="fieldset-legend">Flow Name</legend>
            <select class="select w-full s2">
                <option value=""></option>
            </select>
        </fieldset>

        <fieldset class="fieldset w-full">
            <legend class="fieldset-legend">Page Location</legend>
            <label class="input validator w-full">
                <i class="fi fi-br-link-alt text-gray-400"></i>
                <input type="url" placeholder="https://" value="https://" />
            </label>
        </fieldset>

        <fieldset class="fieldset">
            <legend class="fieldset-legend">Approver</legend>
            <div class="flex flex-col gap-1">
                <div class="flex gap-2 items-center">
                    <input type="radio" name="approver-${fs.STEPMST.CNO}" class="radio radio-primary radio-sm" />
                    <select class="select w-full s2">
                        <option value=""></option>
                    </select>
                </div>
                <p class="label ml-10 mb-1">Refer requester</p>

                <div class="flex gap-2 items-center">
                    <input type="radio" name="approver-${fs.STEPMST.CNO}" class="radio radio-primary radio-sm" />
                    <select class="select w-full s2">
                        <option value=""></option>
                    </select>
                </div>
                <p class="label ml-10 mb-1">Refer to Form Owner</p>

                <div class="flex gap-2 items-center">
                    <input type="radio" name="approver-${fs.STEPMST.CNO}" class="radio radio-primary radio-sm" />
                    <div class="w-full">
                        <input type="text" class="input input-sm w-full" placeholder="Specific approver"
                            value="" />
                    </div>
                </div>
            </div>
        </fieldset>

        <fieldset class="fieldset">
            <legend class="fieldset-legend">Approve Type</legend>
            <div class="flex flex-col gap-2">
                <div class="flex gap-2 items-center">
                    <input type="radio" name="approve-type-${fs.STEPMST.CNO}" class="radio radio-primary radio-sm" />
                    <p>Single Approver</p>
                </div>
                <div class="flex gap-2 items-center">
                    <input type="radio" name="approve-type-${fs.STEPMST.CNO}" class="radio radio-primary radio-sm" />
                    <p>Multiple Approver</p>
                </div>
                <div class="divider m-0!"></div>
                <div class="flex gap-2 items-center">
                    <input type="checkbox" name="" class="checkbox checkbox-primary checkbox-sm"
                        value="2" />
                    <p>Single Approver</p>
                </div>
            </div>
        </fieldset>

        <fieldset class="fieldset">
            <legend class="fieldset-legend">Extra Data</legend>
            <input type="text" class="input input-sm w-full" placeholder="Extra Data" value="" />
        </fieldset>

        <div class="flex gap-1 mt-2">
            <button class="btn btn-primary btn-sm" type="button" id="add-new-flow">Save Data</button>
            <button class="btn btn-soft btn-sm" type="button" id="cancel-new-flow">Cancel</button>
        </div>
    </form>
</div>
