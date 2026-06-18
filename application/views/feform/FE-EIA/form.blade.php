@extends('layouts/webflowTemplate')

@section('contents')
<div class="hidden form-info" 
     data-nfrmno="{{$NFRMNO}}" 
     data-vorgno="{{$VORGNO}}" 
     data-cyear="{{$CYEAR}}" 
     data-cyear2="{{$CYEAR2}}" 
     data-nrunno="{{$NRUNNO}}" 
     data-empno="{{$EMPNO ?? ''}}" 
     data-cost_year="{{$COST_YEAR}}" 
     data-cost_month="{{$COST_MONTH}}" 
     data-doc_no="{{$DOC_NO}}"

  ></div>

<input type="hidden" name="EMPNOHid" id="EMPNOHid" value="{{ $EMPNO }}" />
<input type="hidden" name="MODEHid" id="MODEHid" value="" />
<input type="hidden" name="EXTDATAHid" id="EXTDATAHid" value="" />
<input type="hidden" name="COST_YEARHid" id="COST_YEARHid" value="{{ $COST_YEAR }}" />
<input type="hidden" name="COST_MONTHHid" id="COST_MONTHHid" value="{{ $COST_MONTH }}" />
<input type="hidden" name="DOC_NOHid" id="DOC_NOHid" value="{{ $DOC_NO }}" />

<div class="flex flex-col w-full px-4 my-5 font-sans">
    <div class="card bg-base-100 w-full place-self-center shadow-sm">
        
        <div class="load flex flex-col gap-5 h-screen w-full p-6">
            <div class="flex">
                <div class="skeleton h-16 w-[70%]"></div>
                <div class="skeleton h-16 w-[20%] ml-auto"></div>
            </div>
            <div class="skeleton h-[80%] w-full"></div>
        </div>

        <form href="#" class="card-body hidden" id="form">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 border-b border-slate-100 pb-3">
                <h2 class="card-title m-0">
                    <u class="text-3xl text-primary font-bold no-underline decoration-transparent">Maintenance Stock Cost Report</u>
                </h2>
                
                <button type="button" id="PdfBtn" name="PdfBtn" 
                        class="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition-all flex items-center gap-2">
                    Export PDF
                </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 border border-slate-200 p-6 rounded-2xl bg-white shadow-sm mb-6 font-sans">
                
                <div class="flex flex-col gap-1.5">
                    <label class="font-bold text-xs text-slate-500 uppercase tracking-wider">Form ID :</label>
                    <input type="text" id="FORMIDTxt" name="FORMIDTxt" 
                        class="w-full text-sm px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 font-medium cursor-not-allowed focus:outline-none" 
                        value="{{$DOC_NO}}" readonly disabled>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="font-bold text-xs text-slate-500 uppercase tracking-wider">Input By :</label>
                    <input type="text" id="INPUT_BYTxt" name="INPUT_BYTxt" 
                        class="w-full text-sm px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 font-medium cursor-not-allowed focus:outline-none" 
                        value="Auto Job" readonly disabled>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="font-bold text-xs text-slate-500 uppercase tracking-wider">Request By :</label>
                    <input type="text" id="REQUEST_BYTxt" name="REQUEST_BYTxt" 
                        class="w-full text-sm px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 font-medium cursor-not-allowed focus:outline-none" 
                        value="{{$REQBY}}" readonly disabled>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="font-bold text-xs text-slate-500 uppercase tracking-wider">Year :</label>
                    <div class="relative">
                        <select id="YEARDrp" name="YEARDrp" 
                                class="w-full text-sm px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 font-medium appearance-none cursor-not-allowed focus:outline-none" 
                                readonly disabled>
                            <option value="">Choose...</option>
                            @for ($i = date('Y'); $i >= date('Y') - 10; $i--)
                                <option value="{{ $i }}" {{ isset($COST_YEAR) && $COST_YEAR == $i ? 'selected' : '' }}>{{ $i }}</option>
                            @endfor
                        </select>
                    </div>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="font-bold text-xs text-slate-500 uppercase tracking-wider">Month :</label>
                    <div class="relative">
                        <select id="MONTHDrp" name="MONTHDrp" 
                                class="w-full text-sm px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 font-medium appearance-none cursor-not-allowed focus:outline-none" 
                                readonly disabled>
                            <option value="">ALL PERIOD</option>
                            @for ($m = 1; $m <= 12; $m++)
                                @php $currentMonth = str_pad($m, 2, '0', STR_PAD_LEFT); @endphp
                                <option value="{{ $currentMonth }}" {{ isset($COST_MONTH) && $COST_MONTH == $currentMonth ? 'selected' : '' }}>
                                    {{ date('F', mktime(0, 0, 0, $m, 1)) }}
                                </option>
                            @endfor
                        </select>
                    </div>
                </div>

                <div class="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3">
                    <label class="font-bold text-xs text-slate-500 uppercase tracking-wider">Remark :</label>
                    <textarea id="txtRemark" name="txtRemark" rows="2" 
                            class="w-full text-sm px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all resize-none"
                            placeholder="พิมพ์ข้อความหมายเหตุหรือความเห็นเพิ่มเติมที่นี่...">{{$REMARK}}</textarea>
                </div>

                <div class="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3 border border-slate-100 p-4 rounded-xl bg-slate-50/30">
                    <label class="font-bold text-xs text-slate-500 uppercase tracking-wider">Attachment File (เอกสารแนบรายงาน) :</label>
                    
                    <input type="hidden" id="FORM_TYPE" name="FORM_TYPE" value="FE">
                    <input type="hidden" id="FILE_CODE" name="FILE_CODE" value="ATTACHMENT_REPORT">

                    <div id="upload-zone" class="hidden">
                        <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-slate-300 rounded-2xl bg-white hover:border-green-500 transition-all group cursor-pointer" id="drop-zone">
                            <div class="space-y-1 text-center">
                                <svg class="mx-auto h-12 w-12 text-slate-400 group-hover:text-green-500 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                <div class="flex text-sm text-slate-600 justify-center">
                                    <label class="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary-focus">
                                        <span>Upload a file</span>
                                        <input id="files" name="files[]" type="file" class="sr-only" multiple>
                                    </label>
                                    <p class="pl-1">or drag and drop</p>
                                </div>
                                <p class="text-xs text-slate-400">PDF, Excel, Word or Images up to 10MB</p>
                            </div>
                        </div>
                        <div id="file-list-container" class="mt-3 space-y-2 hidden">
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Selected Files :</p>
                            <ul id="selected-files-list" class="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white p-2"></ul>
                        </div>
                    </div>

                    <div id="download-zone" class="hidden">
                        <ul id="uploaded-files-list" class="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white p-2 shadow-sm">
                            </ul>
                    </div>
                </div>

            </div>


            <div class="w-full overflow-x-auto mt-5">
                <div id="loading" class="text-center py-5 d-none">
                    <span class="loading loading-spinner loading-lg text-primary"></span>
                    <p class="text-slate-400 mt-2">กำลังดึงและคำนวณข้อมูลจากระบบ MIMS...</p>
                </div>
                <table class="table table-striped w-full cell-border row-border" id="table-view" style="width:100%">
                    </table> 
            </div>
            <div class="w-full flex justify-end mt-5 gap-2">
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
            <div class="form-action-container mt-5">

            </div>

        </form>
    </div>
</div>
<div class="flow mt-5"></div>
@endsection

@section('scripts')
<script src="{{ base_url('assets/dist/js/mscview.js') }}"></script>
@endsection
