@extends('layouts/webflowTemplate')

@section('styles')
    <!-- ใส่ CSS ของ Select2 ตรงนี้ -->
    <style>

    </style>
@endsection

@section('contents')

<div class="hidden form-info" 
     data-nfrmno="{{$NFRMNO}}" 
     data-vorgno="{{$VORGNO}}" 
     data-cyear="{{$CYEAR}}" 
     data-cyear2="{{$CYEAR2}}" 
     data-nrunno="{{$NRUNNO}}" 
     data-empno="{{$EMPNO ?? ''}}" 
     data-doc_no="{{$DOC_NO}}"
     data-planyear="{{$PLAN_YEAR ?? ''}}"
     data-period="{{$PERIOD ?? ''}}"
     data-revision="{{$REVISION ?? ''}}"
     data-remark="{{$REMARK ?? ''}}"
     >
</div>

<div class="flex flex-col w-full px-4 my-5 font-sans">
    <div class="card bg-base-100 w-full place-self-center shadow-sm">
        
        <div class="load flex flex-col gap-5 h-screen w-full p-6">
            <div class="skeleton h-16 w-full"></div>
            <div class="skeleton h-[80%] w-full"></div>
        </div>

        <form class="card-body hidden" id="form">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 border-b border-slate-100 pb-3">
                <h2 class="card-title m-0">
                    <u class="text-3xl text-primary font-bold no-underline decoration-transparent">Master Plan DesBm Management</u>
                </h2>
                <div class="flex items-center gap-2">
                    <span class="badge badge-primary badge-outline font-bold" id="RevBadge">Revision: {{$REVISION??'*'}}</span>
                    
                    <input type="hidden" name="RevisionHid" id="RevisionHid" value="{{$REVISION??'*'}}" />
                </div>
            </div>

            <!-- Panel Form Selection -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border border-slate-200 p-5 rounded-2xl bg-white shadow-sm mb-6">
            
                <div class="flex flex-col gap-1.5">
                    <label class="font-bold text-xs text-slate-500 uppercase tracking-wider">Input By :</label>
                    <input type="text" id="INPUT_BYTxt" name="INPUT_BYTxt" 
                        class="w-full text-sm px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 font-medium cursor-not-allowed focus:outline-none" 
                        value="{{$REQBY}}" readonly disabled>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="font-bold text-xs text-slate-500 uppercase tracking-wider">Request By :</label>
                    <input type="text" id="REQUEST_BYTxt" name="REQUEST_BYTxt" 
                        class="w-full text-sm px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 font-medium cursor-not-allowed focus:outline-none" 
                        value="{{$REQBY}}" readonly disabled>
                </div>    
            
                <!-- 1. Year -->
                <div class="flex flex-col gap-1.5">
                    <label class="font-bold text-xs text-slate-500 uppercase">Year :</label>
                    <select id="YearDrp" name="YearDrp" class="select select-bordered select-sm w-full">
                        <option value="" selected >Please Select</option>
                        @for ($i = date('Y') + 2; $i >= date('Y') - 3; $i--)
                            <option value="{{ $i }}" {{ (int)$i === (int)$PLAN_YEAR ? 'selected' : '' }}>{{ $i }}</option>
                        @endfor
                    </select>
                </div>

                <!-- 2. Period -->
                <div class="flex flex-col gap-1.5">
                    <label class="font-bold text-xs text-slate-500 uppercase">Period :</label>
                    <select id="PeriodDrp" name="PeriodDrp" class="select select-bordered select-sm w-full">
                        <option value="" selected >Please Select</option>
                        <option value="04X-09C">04X-09C (Apr - Sep)</option>
                        <option value="10X-03C">10X-03C (Oct - Mar Next Year)</option>
                    </select>
                </div>

                <!-- 3. DesType Selection -->
                <div class="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
                    <label class="font-bold text-xs text-slate-500 uppercase tracking-wider">DesType Target :</label>
                    
                    <div class="flex flex-wrap items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-xl min-h-[38px]">
                        @if(!empty($desTypeList))
                            @foreach ($desTypeList as $item)
                                <label class="inline-flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs hover:border-primary transition-all">
                                    <input type="checkbox" 
                                        name="DesTypeChk[]" 
                                        value="{{ $item->DesType }}" 
                                        class="checkbox checkbox-primary checkbox-xs rounded-sm des-type-checkbox" 
                                        {{ in_array($item->DesType, ['N', 'T']) ? 'checked' : '' }}>
                                    <span class="text-xs font-semibold text-slate-700">
                                        {{ $item->DesType }}
                                    </span>
                                    <span class="text-[11px] text-slate-400 font-normal">({{ $item->DesTypeName }})</span>
                                </label>
                            @endforeach
                        @endif
                    </div>
                </div>

                <!-- 4. Process Button -->
                <div class="flex flex-col justify-end">
                    <button type="button" id="ProcessBtn" class="btn btn-primary btn-sm flex items-center gap-2 text-white">
                        ⚡ Process Calculation
                    </button>
                </div>
            </div>

            <!-- Data Table Section -->
            <div class="w-full overflow-x-auto mt-2">
                <div id="loading" class="text-center py-5 hidden">
                    <span class="loading loading-spinner loading-lg text-primary"></span>
                    <p class="text-slate-400 mt-2">กำลังคำนวณและประมวลผลตารางวันทำงาน...</p>
                </div>
                <table class="table table-compact table-bordered w-full" id="table-plan" style="width:100%">
                </table>
            </div>

            <!-- Action Controls -->
            <div class="w-full flex justify-end mt-5 gap-2">
                <button type="button" id="SavePlanBtn" class="btn btn-success text-white btn-sm hidden">
                    💾 Confirm & Save Plan
                </button>
            </div>

            
            <div class="w-full flex justify-end mt-5 gap-2">
                <!-- <button type="button" name="AddBtn" id="AddBtn"
                        data-action="Add"
                        class="AddBtn btn-submit cursor-pointer bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow hidden">
                    Create Form
                </button> -->
                
                <button type="button" name="ApproveBtn" id="ApproveBtn"
                        data-action="approve"
                        class="ApproveBtn btn-submit cursor-pointer bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow hidden">
                    Approve
                </button>
                
                <button type="button" name="DeleteBtn" id="DeleteBtn"
                        data-action="delete"
                        class="btn-submit cursor-pointer bg-slate-500 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded shadow hidden">
                    Delete
                </button>
                
                <button type="button" name="ReturnBtn" id="ReturnBtn"
                        data-action="return"
                        class="btn-submit cursor-pointer bg-slate-500 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded shadow hidden">
                    Return To Requester
                </button>
                
                <!-- <button type="button" name="RejectBtn" id="RejectBtn"
                        data-action="reject"
                        class="btn-submit cursor-pointer bg-slate-500 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded shadow hidden">
                    Reject
                </button> -->
            </div>
        </form>
    </div>
</div>
<div class="flow mt-5"></div>
@endsection

@section('scripts')
<script src="{{ base_url('assets/dist/js/dedmdsview.js') }}"></script>
@endsection