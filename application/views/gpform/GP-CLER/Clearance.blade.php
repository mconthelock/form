@extends('layouts/webflowTemplate')

@section('styles')
    <style>
        .select2-container--default .select2-selection--single {
            height: 40px !important;
            border-radius: 0.75rem !important;
            border-color: oklch(88.2% 0.059 254.128) !important;
            width: 100% !important;
        }

        .select2-container--default .select2-selection--single .select2-selection__rendered {
            line-height: 40px !important;
        }

        .select2-selection__arrow {
            margin-top: 5px !important;
        }

        .select2-container--open .select2-dropdown--below {
            border-top: none;
            /* border-top-left-radius: 0; */
            /* border-top-right-radius: 0; */
            border-bottom-left-radius: 0.5rem !important;
            border-bottom-right-radius: 0.5rem !important;
            border-top-left-radius: 0.25rem !important;
            border-top-right-radius: 0.25rem !important;
            border-color: oklch(88.2% 0.059 254.128) !important;
        }
    </style>
@endsection
@section('contents')
    <form action="{{ base_url('gpform/GP-CLER/main/Clearance_form') }}" method="post">
        <div class="flex items-center min-h-[calc(100vh-100px)]">
            <div class="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8 space-y-6 border border-blue-100">
                <h2 class="text-lg font-bold text-blue-900 text-center mb-4">Form Clearance for Entertainment (Part2)<br>(แบบเคลียร์ค่าใช้จ่ายในการเลี้ยงรับนองผู้มาติดต่อ (ส่วนที่ 2))</h2>
                <!-- <div class="form-data" data-nfrmno="{{ $NFRMNO }}" data-vorgno="{{ $VORGNO }}" data-cyear="{{ $CYEAR }}" data-cyear2="{{ $CYEAR2 }}" data-nrunno="{{ $NRUNNO }}" data-empno="{{ $EMPNO }}"></div> -->
                <!-- ค้นหาเอกสารขออนุมัติ (อ้างอิงจาก Part 1) -->
                <div>
                    <label class="block mb-1 font-semibold text-blue-700">Emp.Code <span class="text-red-500">*</span></label>
                    <input type="text" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200" name="empcode" id="input-empcode" value="{{$EMPNO}}" readonly placeholder="รหัสพนักงานผู้เคลียร์" required>
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
                        <label for="no-entertain" class="label cursor-pointer inline-block">
                            <span>กรณีไม่ได้ทำ Entertainment Form</span><br>
                            <span class="text-sm text-red-500">(Please click : In case of Requestor not prepare Entertainment form before)</span>
                        </label>
                    </div>
                    <div class="text-right">
                        {{-- <input type="hidden" name="NFRMNO" value="{{ $NFRMNO }}">
                        <input type="hidden" name="VORGNO" value="{{ $VORGNO }}">
                        <input type="hidden" name="CYEAR" value="{{ $CYEAR }}">
                        <input type="hidden" name="CYEAR2" value="{{ $CYEAR2 }}">
                        <input type="hidden" name="NRUNNO" value="{{ $NRUNNO }}">
                        <input type="hidden" name="EMPNO" value="{{ $EMPNO }}"> --}}
                        <button id="btn-next" class="btn btn-accent btn-md rounded-xl px-6">ถัดไป</button>
                    </div>
                </div>
            </div>
        </div>
    </form>
@endsection
@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/clearance.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection