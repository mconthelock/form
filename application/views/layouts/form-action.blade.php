<section id="form-action-section" class="flex flex-col gap-4 hidden">
    <div id="form-remark-container" class="p-4 bg-gray-200 border border-gray-300 hidden">
        <div class="font-bold mb-2">Remark (Optional)</div>
        <textarea id="form-remark" class="textarea w-full" placeholder="Approval comments (Optional)"></textarea>
    </div>
    <div class="flex gap-3 mb-8 p-4 bg-blue-100 border border-blue-300 border-dashed items-center">
        <div class="button-container flex-1 flex flex-wrap gap-2" id="form-button-container">
            <span class="loading loading-spinner text-gray-700" id="form-button-container-loading"></span>

            <button type="button" class="btn btn-primary btn-outline hidden" id="form-draft" data-attr="draft">
                <span class="loading loading-spinner hidden"></span>
                <span><i class="fi fi-rr-disk text-2xl"></i></span>
                <span>Save Draft/บันทึกร่าง</span>
            </button>

            <button type="button" class="btn btn-primary hidden" id="form-submit" data-attr="submit">
                <span class="loading loading-spinner hidden"></span>
                <span><i class="fi fi-rr-paper-plane text-2xl"></i></span>
                <span>Submit/ส่งคำขอ</span>
            </button>

            <button type="button" class="btn btn-primary btn-outline hidden" id="form-delete" data-attr="delete">
                <span class="loading loading-spinner hidden"></span>
                <span><i class="fi fi-rr-trash text-2xl"></i></span>
                <span>Delete/ลบฟอร์ม</span>
            </button>

            <button type="button" class="btn btn-primary hidden" id="form-approve" data-attr="approve">
                <span class="loading loading-spinner hidden"></span>
                <span><i class="fi fi-rr-paper-plane text-2xl"></i></span>
                <span>Approve/อนุมัติ</span>
            </button>

            <button type="button" class="btn btn-error hidden" id="form-reject" data-attr="reject">
                <span class="loading loading-spinner  hidden"></span>
                <span><i class="fi fi-ss-triangle-warning text-2xl"></i></span>
                <span>Reject/ปฏิเสธ</span>
            </button>

            <button type="button" class="btn btn-error btn-outline hidden" id="form-return" data-attr="return">
                <span class="loading loading-spinner  hidden"></span>
                <span><i class="fi fi-bs-time-past text-2xl"></i></span>
                <span>Return/ส่งกลับ</span>
            </button>

            <button type="button" class="btn btn-neutral btn-outline hidden" id="form-print" data-attr="print">
                <span class="loading loading-spinner  hidden"></span>
                <span><i class="fi fi-rr-print text-2xl"></i></span>
                <span>Print/พิมพ์เอกสาร</span>
            </button>

        </div>
        <div class="text-xs flex items-center gap-1 text-gray-500">
            <i class="fi fi-rr-info text-xl "></i> Please fill out all required fields before submitting.
        </div>
    </div>
</section>
