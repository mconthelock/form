<div class="pt-4 border-t border-slate-100">
    <!-- กล่อง Remark กลางของ Flow -->
    <div class="mb-5">
        <label class="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            Approval / Return Remark
        </label>
        <textarea id="RemarkTxt" name="RemarkTxt" rows="2" 
                  class="w-full text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" 
                  placeholder="พิมพ์ความเห็นหรือเหตุผลประกอบการพิจารณา...">{{ $REMARK ?? '' }}</textarea>
    </div>

    <!-- ปุ่ม Action สำหรับควบคุม Webflow -->
    <div class="flex flex-wrap justify-end items-center gap-2.5">
        <button type="button" id="PreviewPdfBtn" class="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg border-none shadow-xs">
            📄 Preview Stamp PDF
        </button>
        <button type="button" id="DeleteBtn" class="btn btn-sm btn-error text-white rounded-lg shadow-xs hidden">
            🗑️ Delete
        </button>
        <button type="button" id="ReturnBtn" class="btn btn-sm bg-slate-600 hover:bg-slate-700 text-white rounded-lg shadow-xs hidden">
            ↩️ Return
        </button>
        <button type="button" id="SaveDocBtn" class="btn btn-sm btn-primary text-white rounded-lg shadow-xs hidden">
            🚀 Submit Document
        </button>
        <button type="button" id="ApproveBtn" class="btn btn-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-xs hidden">
            ✅ Approve
        </button>
    </div>
</div>