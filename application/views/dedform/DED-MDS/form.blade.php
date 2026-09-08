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
     data-status="{{$STATUS ?? ''}}"
     data-default-destypes="{{ implode('|', $selectedDesTypes ?? []) }}"
     data-doc_no="{{$DOC_NO ?? ''}}"
     data-planheaderid="{{$PLANHEADERID ??''}}"
     >
</div>

<div class="flex flex-col w-full px-4 my-5 font-sans">
    <div class="card bg-base-100 w-full place-self-center shadow-sm">
        
        <div class="load flex flex-col gap-5 h-screen w-full p-6">
            <div class="skeleton h-16 w-full"></div>
            <div class="skeleton h-[80%] w-full"></div>
        </div>

        <form class="card-body hidden" id="form">
           <div class="flex items-center justify-between mb-4">
                <!-- 🟢 ด้านซ้าย: ปุ่มรูปฟันเฟืองวางหน้าชื่อ Master Plan -->
                <div class="flex items-center gap-2.5">
                    <button type="button" 
                            id="btnOpenCalConfig" 
                            class="inline-flex items-center justify-center w-9 h-9 rounded-full text-slate-500 hover:text-blue-600 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition duration-150 shadow-sm focus:outline-none"
                            title="ตั้งค่าวันคำนวณ (Offset Days)">
                        <svg  class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"/>
                        </svg>
                    </button>
                                    
                    <h1 class="text-2xl font-bold text-blue-900 tracking-tight select-none">
                        Master Plan DES BM Management
                    </h1>
                </div>

                <!-- ด้านขวา: แสดง Revision Badge เดิม -->
                <div class="flex items-center gap-2">
                    <span class="border border-blue-600 text-blue-600 rounded-full px-3 py-0.5 text-xs font-semibold">
                        Revision: <span id="RevBadge">-</span>
                    </span>
                    <span class="bg-orange-500 text-white rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider" id="StatusBadge">
                        DRAFT
                    </span>
                </div>
            </div>

            <!-- 🟢 Alert แจ้งเตือนเมื่ออยู่ในสถานะรออนุมัติ (ซ่อนไว้ก่อนด้วย class hidden) -->
            <div id="PendingAlert" class="alert alert-warning shadow-sm mb-4 py-2 hidden">
                <div class="flex items-center gap-2">
                    <!-- <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg> -->
                    <span class="text-sm font-semibold">
                        เอกสารรอบนี้อยู่ในสถานะ <span id="StatusText" class="font-bold underline">PROCESS</span> (รอ Approve เอกสาร Webflow) ไม่สามารถประมวลผลหรือสร้าง Revision ใหม่ได้
                    </span>
                </div>
            </div>

            <!-- Panel Form Selection -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border border-slate-200 p-5 rounded-2xl bg-white shadow-sm mb-6">
                
                <div class="flex flex-col gap-1.5">
                    <label class="block text-xs font-semibold text-slate-500 mb-1">FORM ID :</label>
                    <input type="text" id="DOC_IDTxt" class="input input-bordered input-sm w-full bg-slate-100 font-bold text-primary" readonly placeholder="Auto Generated" value="{{$DOC_NO ?? ''}}">
                    <input type="hidden" name="RevisionHid" id="RevisionHid" value="{{$REVISION??'*'}}" />
                    <input type="hidden" name="STATUSHid" id="STATUSHid" value="{{$STATUS??''}}" />
                    <input type="hidden" name="EMPNOHid" id="EMPNOHid" value="{{$EMPNO??''}}" />
                    <input type="hidden" name="EXTDATAHid" id="EXTDATAHid" value="{{$EMPNO??''}}" />
                    <input type="hidden" name="MODEHid" id="MODEHid" value="{{$EMPNO??''}}" />
                    <input type="hidden" name="PlanHeaderIDHid" id="PlanHeaderIDHid" value="{{$PLANHEADERID??''}}" />
                    
                </div>
                <div class="flex flex-col gap-1.5">
                    <label class="font-bold text-xs text-slate-500 uppercase tracking-wider">Input By :</label>
                    <input type="text" id="INPUT_BYTxt" name="INPUT_BYTxt" 
                        class="w-full text-sm px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 font-medium cursor-not-allowed focus:outline-none" 
                        value="{{$EMPNO}}" readonly disabled>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="font-bold text-xs text-slate-500 uppercase tracking-wider">Request By :</label>
                    <input type="text" id="REQUEST_BYTxt" name="REQUEST_BYTxt" 
                        class="w-full text-sm px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 font-medium cursor-not-allowed focus:outline-none" 
                        value="{{$EMPNO}}" readonly disabled>
                </div>    
            
                <!-- 1. Year -->
                <div class="flex flex-col gap-1.5">
                    <label class="font-bold text-xs text-slate-500 uppercase">Year :</label>
                    <select id="YearDrp" name="YearDrp" class="select select-bordered select-sm w-full">
                        <option value="">Please Select</option>
                        @php
                            // ถ้า $PLAN_YEAR ว่าง ให้ Default เป็นปีปัจจุบัน
                            $currentSelectedYear = !empty($PLAN_YEAR) ? (int)$PLAN_YEAR : (int)date('Y');
                        @endphp
                        @for ($i = date('Y') + 2; $i >= date('Y') - 3; $i--)
                            <option value="{{ $i }}" {{ (int)$i === $currentSelectedYear ? 'selected' : '' }}>
                                {{ $i }}
                            </option>
                        @endfor
                    </select>
                </div>

                <!-- 2. Period -->
                <div class="flex flex-col gap-1.5">
                    <label class="font-bold text-xs text-slate-500 uppercase">Period :</label>
                    <select id="PeriodDrp" name="PeriodDrp" class="select select-bordered select-sm w-full">
                        <option value="" {{ '' === $PERIOD ? 'selected' : '' }} >Please Select</option>
                        <option value="04X-09C" {{ '04X-09C' === $PERIOD ? 'selected' : '' }}>04X-09C (Apr - Sep)</option>
                        <option value="10X-03C" {{ '10X-03C' === $PERIOD ? 'selected' : '' }}>10X-03C (Oct - Mar Next Year)</option>
                    </select>
                </div>

                <!-- 3. DesType Selection (Checkbox Group) -->
                <div class="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
                    <div class="flex justify-between items-center">
                        <label class="font-bold text-xs text-slate-500 uppercase tracking-wider">DesType Target :</label>
                        <span class="text-[11px] text-slate-400">(Multi-select)</span>
                    </div>
                    
                    <div class="flex flex-wrap items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl min-h-[38px]">
                        @if(!empty($desTypeList))
                            @foreach ($desTypeList as $item)
                                <label class="inline-flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs hover:border-primary transition-all">
                                    <input type="checkbox" 
                                        name="DesTypeChk[]" 
                                        value="{{ $item->DesType }}" 
                                        class="checkbox checkbox-primary checkbox-xs rounded-sm des-type-checkbox" 
                                        {{ in_array($item->DesType, $selectedDesTypes ?? []) ? 'checked' : '' }}>
                                    <span class="text-xs font-bold text-slate-700">
                                        {{ $item->DesType }}
                                    </span>
                                    <span class="text-[11px] text-slate-400 font-normal">({{ $item->DesTypeName }})</span>
                                </label>
                            @endforeach
                        @endif
                    </div>
                </div>
                <div class="flex flex-col gap-1.5">
                    <label class="block text-xs font-semibold text-slate-500 mb-1">REMARK :</label>
                    <textarea id="RemarkTxt" rows="2" class="textarea textarea-bordered w-full text-xs" placeholder="ระบุเหตุผลหรือหมายเหตุประกอบการจัดทำแผน (ถ้ามี)"></textarea>
                </div>
                <!-- 4. Action Buttons (Search & Process) -->
                <div class="flex items-end gap-2">
                    <button type="button" id="SearchBtn" class="btn btn-neutral btn-sm flex-1 flex items-center justify-center gap-1.5 text-white">
                        🔍 Search
                    </button>
                    <button type="button" id="ProcessBtn" class="btn btn-primary btn-sm flex-1 flex items-center justify-center gap-1.5 text-white">
                        ⚡ Process Calculation
                    </button>
                    <button type="button" 
                            id="ExportExcelBtn" 
                            class="btn bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded shadow flex items-center gap-1.5 text-sm font-medium transition">
                        <svg  class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                        </svg>
                        <span>Export Excel</span>
                    </button>
                    <!-- 🟢 ปุ่มเปิด Modal ตั้งค่า Cal Config -->
                    <!-- <button type="button" id="btnOpenCalConfig" class="btn btn-outline-secondary flex items-center gap-1" title="ตั้งค่าวันคำนวณ (Offset Days)">
                        <i class="fa fa-cog"></i>
                        <span>Cal Config</span>
                    </button> -->
                </div>
                
            </div>

            <!-- Action Controls ด้านล่างตาราง -->
            <div class="w-full flex justify-end mt-5 gap-2">
                <!-- ปุ่ม Delete Draft (เริ่มต้นซ่อนไว้) -->
                <button type="button" id="DeleteBtn" class="btn btn-error btn-sm text-white hidden flex items-center gap-1">
                    🗑️ Delete 
                </button>
                
                <!-- ปุ่ม Save Plan -->
                <button type="button" id="SavePlanBtn" class="btn btn-success btn-sm text-white hidden flex items-center gap-1">
                    💾 Confirm & Save Plan
                </button>
                
                <button type="button" name="ApproveBtn" id="ApproveBtn"
                        data-action="approve"
                        class="ApproveBtn btn-submit cursor-pointer bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow hidden">
                    Approve
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
            <!-- Data Table Section -->
            <div class="w-full overflow-x-auto mt-2">
                <div id="loading" class="text-center py-5 hidden">
                    <span class="loading loading-spinner loading-lg text-primary"></span>
                    <p class="text-slate-400 mt-2">กำลังคำนวณและประมวลผลตารางวันทำงาน...</p>
                </div>


                <table class="table table-compact table-bordered w-full" id="table-plan" style="width:100%">
                </table>
            </div>


            
            <div class="w-full flex justify-end mt-5 gap-2">
                <!-- <button type="button" name="AddBtn" id="AddBtn"
                        data-action="Add"
                        class="AddBtn btn-submit cursor-pointer bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow hidden">
                    Create Form
                </button> -->
                
            </div>

            <!-- Modal: Tb_MS_Master_DESBM_Cal Config -->
            <div id="calConfigModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 hidden">
                <div class="bg-white rounded-lg shadow-xl w-11/12 max-w-4xl max-h-[90vh] flex flex-col">
                    <!-- Modal Header -->
                    <div class="flex justify-between items-center px-6 py-4 border-b">
                        <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <i class="fa fa-sliders-h text-blue-600"></i> ตั้งค่าสูตรการคำนวณ 
                        </h3>
                        <button type="button" class="btn-close-modal text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
                    </div>

                    <!-- Modal Body: ตารางแสดงรายการ -->
                    <div class="p-6 overflow-y-auto flex-1">
                        <table class="table table-bordered table-hover w-full text-sm">
                            <thead class="bg-gray-100 text-gray-700">
                                <tr>
                                    <th class="text-center w-12">#</th>
                                    <th>Target Field</th>
                                    <th>P Type</th>
                                    <th>Base Field</th>
                                    <th>Base Row Type</th>
                                    <th class="text-center w-36">Offset Days</th>
                                </tr>
                            </thead>
                            <tbody id="calConfigTbody">
                                <!-- ข้อมูลจะถูก Render ผ่าน AJAX -->
                            </tbody>
                        </table>
                    </div>

                    <!-- Modal Footer -->
                    <div class="flex justify-end gap-2 px-6 py-3 border-t bg-gray-50">
                        <button type="button" class="btn btn-secondary btn-close-modal px-4 py-2">ปิดหน้าต่าง</button>
                    </div>
                </div>
            </div>

        </form>
    </div>
</div>
<div class="flow mt-5"></div>
@endsection

@section('scripts')
<script src="{{ base_url('assets/dist/js/dedmdsview.js') }}"></script>
@endsection