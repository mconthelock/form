@extends('layouts/webflowTemplate')
@section('contents')
<form>

<div class="flex justify-center p-8 bg-gray-50 min-h-screen">
  <div class="card w-full max-w-4xl bg-white shadow-sm border border-gray-200">
    <div class="card-body">
      <div class="flex justify-between items-center border-b pb-4 mb-6">
      <h2 class="card-title text-2xl font-bold pb-4 mb-6 text-primary">
        GA Requisition Details
      </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div class="space-y-1">
          <label class="label">
            <span class="label-text font-semibold">Input By:</span>
          </label>
          <p class="text-base text-slate-900 font-semibold py-2 px-1 border-b border-gray-100" id="VIEW_INBY">
            {{-- ข้อมูลจะถูกใส่ผ่าน JS หรือ Blade Variable --}}
            -
          </p>
        </div>

        <div class="space-y-1">
          <label class="label">
            <span class="label-text font-semibold">Request By:</span>
          </label>
          <p class="text-base text-slate-900 font-semibold py-2 px-1 border-b border-gray-100" id="VIEW_REQBY">
            -
          </p>
        </div>

        <div class="space-y-1">
          <label class="label">
            <span class="label-text font-semibold">Request Date:</span>
          </label>
          <div class="flex items-center gap-2 py-2 px-1 border-b border-gray-100">
             <span class="text-base text-slate-900 font-semibold" id="VIEW_REQDATE">-</span>
          </div>
        </div>

        <div class="space-y-1">
          <label class="label">
            <span class="label-text font-semibold">Request For:</span>
          </label>
          <p class="text-base text-slate-900 font-semibold py-2 px-1 border-b border-gray-100" id="VIEW_CATEGORY">
            -
          </p>
        </div>

        <div class="form-control w-full md:col-span-2 mt-4">
          <label class="label">
            <span class="label-text font-semibold">Attachment:</span>
          </label>
          <div id="file-list" class="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
             {{-- วนลูปแสดงไฟล์ตรงนี้ --}}
             <div class="flex items-center gap-2 text-sm text-blue-600 cursor-pointer hover:underline">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                document_ref_01.pdf
             </div>
          </div>
        </div>
      </div>

      <div class="card-actions justify-end mt-10 gap-4 border-t pt-6">
        <button class="btn btn-ghost border-gray-300 px-8" onclick="history.back()">
          Back
        </button>
        <button class="btn btn-error text-white px-8" id="btn-reject">
          Reject
        </button>
        <button class="btn btn-primary px-10 text-white" id="btn-approve">
          Approve Request
        </button>
      </div>

    </div>
  </div>
</div>
</form>
@endsection

@section('scripts')
    <script src="{{$_ENV['APP_JS']}}/show_form.js?ver={{$GLOBALS['version']}}"></script>
@endsection