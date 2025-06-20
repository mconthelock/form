@extends('layouts/webflowTemplate')

@section('styles')

@endsection
@section('contents')
    <form action="{{ base_url('gpform/GP-CLER/main/Clearance_form') }}" method="post">
        <div class="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 space-y-6 border border-blue-100">
            <h2 class="text-2xl font-bold text-blue-900 text-center mb-4">เคลียร์ค่าใช้จ่าย (Part 2)</h2>
            <!-- <div class="form-data" data-nfrmno="{{ $NFRMNO }}" data-vorgno="{{ $VORGNO }}" data-cyear="{{ $CYEAR }}" data-cyear2="{{ $CYEAR2 }}" data-nrunno="{{ $NRUNNO }}" data-empno="{{ $EMPNO }}"></div> -->
            <!-- ค้นหาเอกสารขออนุมัติ (อ้างอิงจาก Part 1) -->
            <div>
                <label class="block mb-1 font-semibold text-blue-700">Emp.Code <span class="text-red-500">*</span></label>
                <input type="text" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200" name="empcode" id="input-empcode" placeholder="รหัสพนักงานผู้เคลียร์" required>
            </div>
            <div id="form-entertain">
                <label class="block mb-1 font-semibold text-blue-700">Entertainment Form No. (Part 1) <span class="text-red-500">*</span></label>
                <div class="flex items-center gap-2">                 
                    {{-- {{print_r($form_entertain)}} --}}
                    <select id="entertain-form-no" name="form_no" class=" w-full ">
                        <option value="" selected>เลือก Entertainment Form No.</option>
                        @foreach ($form_entertain as $value)
                            <option value="{{$value->CYEAR2}}/{{$value->NRUNNO}}">{{$value->form_number}}</option>
                        @endforeach
                    </select>
                    {{-- <button class="btn btn-primary btn-sm rounded-lg">Search</button> --}}
                </div>
            </div>
            <div class="text-xs text-blue-800 mt-1">
                *กรุณาแนบใบเสร็จฉบับจริงด้วยทุกครั้ง (Please attach original “Receipt Slip”)
            </div>
            <div class="grid grid-cols-2 gap-4 items-center">
                <div class="flex items-center space-x-3">
                    <input type="checkbox" class="checkbox checkbox-primary" name="no_entertain" id="no-entertain" />
                    <label for="no-entertain" class="label cursor-pointer">กรณีไม่ได้ทำ Entertainment Form</label>
                </div>
                <div class="text-right">
                    <!-- <input type="hidden" name="NFRMNO" value="{{ $NFRMNO }}">
                    <input type="hidden" name="VORGNO" value="{{ $VORGNO }}">
                    <input type="hidden" name="CYEAR" value="{{ $CYEAR }}">
                    <input type="hidden" name="CYEAR2" value="{{ $CYEAR2 }}">
                    <input type="hidden" name="NRUNNO" value="{{ $NRUNNO }}">
                    <input type="hidden" name="EMPNO" value="{{ $EMPNO }}"> -->
                    <button id="btn-next" class="btn btn-accent btn-md rounded-xl px-6">ถัดไป</button>
                </div>
            </div>
        </div>
    </form>
@endsection
@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/clearance.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection