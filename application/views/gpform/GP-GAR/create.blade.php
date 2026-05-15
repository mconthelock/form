@extends('layouts/webflowTemplate')
@section('contents')

<div class="flex justify-center p-8 bg-base-200 min-h-screen">
  <div class="card w-full max-w-4xl bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title text-2xl font-bold border-b pb-4 mb-6 text-primary">
        GA Requisition Form
      </h2>

      <form class="grid grid-cols-1 md:grid-cols-2 gap-6" id="form" name="form">

        <div class="form-control w-full">
          <label class="label">
            <span class="label-text font-semibold">Input By:</span>
          </label>
          <input type="text" placeholder="ชื่อผู้บันทึก" class="input req w-full focus:input-primary" id ="INBY" name="INBY" readonly/>
        </div>

        <div class="form-control w-full">
          <label class="label">
            <span class="label-text font-semibold">Request By:</span>
          </label>
          <input type="text" placeholder="รหัสผู้ขอ" class="input  req w-full focus:input-primary" id ="REQBY" name="REQBY" />
        </div>

        <div class="form-control w-full">
          <label class="label">
            <span class="label-text font-semibold">Request Date:</span>
          </label>
          <input type="date" class="input  req w-full focus:input-primary" id ="REQDATE" name="REQDATE"/>
        </div>

        <div class="form-control w-full">
          <label class="label">
            <span class="label-text font-semibold">Request For:</span>
          </label>
          <select class="select select-bordered req w-full focus:select-primary" id="CATEGORY_CODE" name="CATEGORY_CODE">
          </select>
        </div>

        <div class="form-control w-full md:col-span-2">
          <label class="label">
            <span class="label-text font-semibold">Attachment:</span>
          </label>
          <input type="file" multiple class="file-input  req w-full focus:file-input-primary"  id="FILE" name="FILE"/>
        </div>
    </form>
    
    <div id="action"></div>
    </div>
  </div>
</div>
@endsection

@section('scripts')
    <script src="{{$_ENV['APP_JS']}}/gar_form.js?ver={{$GLOBALS['version']}}"></script>
@endsection