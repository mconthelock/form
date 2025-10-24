@extends('layouts/webflowTemplate')

@section('styles')
<style>
    /* #tableReport th, #tableReport td {
        border: 0.5px solid #000;
    }
    th{
        border-bottom: 1px solid #000 !important;
    } */
</style>
@endsection

@section('contents')
<div class="userid" userid="{{$userId}}"></div>
<div class="flex flex-col gap-5">
    <div class="flex flex-col gap-5 p-5 bg-white rounded-[3px] shadow w-full h-full border-t-3 border-[#3c8dbc]">
        <div>
            <div class="text-2xl font-bold text-primary mb-3">Section</div>    
            <div id="selectSection"></div>
        </div>
        <div class="">
            <div class="text-2xl font-bold text-primary mb-3">คำอธิบาย</div>
            <div class="flex gap-5">
                <div class="flex gap-3 items-center">
                    <div class="flex gap-6 items-center justify-center">
                        <div class="relative w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 shadow-lg">
                            <div class="absolute inset-1 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-300 flex items-center justify-center font-bold  text-amber-800">
                                25
                            </div>
                        </div>
                    </div>
                    <div class="text-sm">ผ่านเกณฑ์ ได้คะแนนตั้งแต่ 90 ขึ้นไป</div>
                </div>
                <div class="flex gap-3 items-center">
                    <div class="flex gap-6 items-center justify-center">
                        <div class="relative w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 via-gray-300 to-gray-500 shadow-lg">
                            <div class="absolute inset-1 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center font-bold text-gray-700">
                            25
                            </div>
                        </div>
                    </div>
                    <div class="text-sm">ผ่านเกณฑ์ ได้คะแนนตั้งแต่ 80 ขึ้นไป</div>
                </div>
                <div class="flex gap-3 items-center">
                    <div class="flex gap-6 items-center justify-center">
                        <div class="relative w-8 h-8 rounded-full bg-gradient-to-br from-[oklch(0.9_0.05_56.04)] via-[oklch(0.72_0.23_43.31)] to-[oklch(0.84_0.12_82.91)] shadow-lg">
                            <div class="absolute inset-1 rounded-full bg-gradient-to-br from-white to-[#fe6300] flex items-center justify-center font-bold text-[#3f0606]">
                            X
                            </div>
                        </div>
                    </div>
                    <div class="text-sm">ไม่ผ่านเกณฑ์ ได้คะแนนน้อยกว่า 80</div>
                </div>
                <div class="flex gap-3 items-center">
                    <div class="flex gap-6 items-center justify-center">
                        <i class="icofont-check-circled text-success text-xl"></i>
                    </div>
                    <div class="text-sm">Authorize จากระบบเดิม</div>
                </div>
            </div>
            <br>
            <b>หมายเหตุ :</b>
            <div class="text-sm">- ตัวเลขภายใน 25 หมายถึง ปีของวันที่ทำการทดสอบเช่น 25 คือปี 2025</div>
        </div>
    </div>
    <div class="p-5 bg-white rounded-[3px] shadow w-full h-full border-t-3 border-[#3c8dbc]" id="reportList">
    </div>
</div>
<input type="checkbox" id="scoreBoard" class="modal-toggle" />
<div class="modal" role="dialog">
  <div class="modal-box">
    <div class="flex flex-col gap-3">
        <h3><span class="font-bold text-lg">Item : </span><span id="itemNo"></span></h3>
        <h3><span class="font-bold text-lg">Name : </span><span id="fullName"></span></h3>
        <div id="tableScoreboard"></div>
    </div>
    <div class="modal-action">
      <label for="scoreBoard" class="btn btn-neutral">Close</label>
    </div>
  </div>
</div>
@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/eSelfAuthorizeReportList.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection