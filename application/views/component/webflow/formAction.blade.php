<div class="card-actions flex-col gap-5 justify-start pl-6">
    <div class="my-5 hidden actions-Form ">
        <fieldset class="fieldset">
            <span class="fieldset-label">Remark</span>
            <textarea class="textarea h-24 w-56" id="remark" ></textarea>
        </fieldset>
        <div class="flex gap-3  mt-2">
            <button type="button" class="btn btn-primary" name="btnAction" value="approve">Approve</button>
            <button type="button" class="btn btn-error mg-l-12" name="btnAction" value="reject">Reject</button>
            <button type="button" class="btn btn-neutral mg-l-12 btnReturn  hidden" name="btnAction" value="return">Return</button>
            <button type="button" class="btn btn-neutral mg-l-12 btnReturnb hidden" name="btnAction" value="returnb">Return</button>
            <button type="button" class="btn btn-neutral mg-l-12 btnReturnp hidden" name="btnAction" value="returnp">Return</button>
        </div>
    </div>
  
    <div id="flow" class="w-full mb-5">
        <div class="flex justify-center">
            <div class="skeleton h-32 w-[36rem]"></div>
        </div>
    </div>
</div>