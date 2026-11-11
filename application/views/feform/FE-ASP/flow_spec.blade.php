<div class="pt-4 border-t border-slate-100">
    <!-- Remark สำหรับบันทึกความเห็นการอนุมัติ -->
    <div class="mb-5">
        <label class="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            Approval / Return Remark
        </label>
        <textarea id="RemarkTxt" name="RemarkTxt" rows="2" 
                  class="w-full text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none" 
                  placeholder="พิมพ์ความเห็นหรือเหตุผลประกอบการพิจารณา...">{{ $REMARK ?? '' }}</textarea>
    </div>

    <!-- ปุ่ม Action ควบคุมสายอนุมัติ -->
    <div class="flex flex-wrap justify-end items-center gap-2.5">
        @if(isset($EMPNO) && (string)$EMPNO === '13204')
            <button type="button" id="ManualStampBtn" class="btn btn-sm bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-xs cursor-pointer">
                ⚡ Force Stamp PDF (13204)
            </button>
            <button type="button" id="btnTestGeneratePdf" class="btn btn-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs cursor-pointer">
                📄 Test Generate Cover PDF
            </button>
            

        @endif

        <button type="button" id="DeleteBtn" class="btn btn-sm btn-error text-white rounded-lg shadow-xs hidden">
            🗑️ Delete
        </button>
        <!-- <button type="button" id="RejectBtn"  class="btn btn-sm bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs hidden">
            ❌ Reject
        </button> -->
        <button type="button" id="ReturnBtn" class="btn btn-sm bg-slate-600 hover:bg-slate-700 text-white rounded-lg shadow-xs hidden">
            ↩️ Return
        </button>
        <button type="button" id="btnSaveDraft" class="btn btn-sm bg-slate-700 hover:bg-slate-800 text-white rounded-lg shadow-xs hidden">
            💾 Save Draft
        </button>
        <button type="button" id="SaveDocBtn" class="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs hidden">
            🚀 Submit Document
        </button>
        <button type="button" id="ApproveBtn" class="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs hidden">
            ✅ Approve
        </button>
    </div>
</div>