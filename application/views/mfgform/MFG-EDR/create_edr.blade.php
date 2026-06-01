@extends('layouts/webflowTemplate')

@section('contents')
<style>
    #tblDetail thead th {
        padding: 10px;
        font-weight: 700;
        text-align: center;
    }
    .edr-card {
        box-shadow: 0 5px 15px rgba(15, 23, 42, 0.12);
    }

    .edr-label {
        background: #ecfdf5;
        color: #064e3b;
        font-weight: 800;
    }

    .edr-input {
        width: 100%;
        border: 1px solid #cbd5e1;
        border-radius: 0.75rem;
        padding: 0.65rem 0.85rem;
        outline: none;
        background: #fff;
    }

    .edr-input:focus {
        border-color: #24c2af;
        box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.18);
    }

    .required {
        color: #ef4444;
    }

    button,
    button *,
    .btnDeleteRow,
    #btnAddRow,
    #btnSaveDraft,
    #btnSendForm {
        cursor: pointer !important;
    }

    button:disabled {
        cursor: not-allowed !important;
    }

    .disabled-textbox {
        background-color: #f0f0f0 !important;
        cursor: not-allowed !important;
        color: #64748b;
    }

    .disabled-textbox:hover {
        cursor: not-allowed !important;
    }

    .req-star {
        color: #ef4444;
        margin-left: 2px;
    }

    #tblDetail.tbl-pcb {
        table-layout: fixed;
        width: 100%;
    }

    /* # */
    #tblDetail.tbl-pcb th:nth-child(1),
    #tblDetail.tbl-pcb td:nth-child(1) {
        width: 3%;
    }

    /* Drawing */
    #tblDetail.tbl-pcb th:nth-child(2),
    #tblDetail.tbl-pcb td:nth-child(2) {
        width: 17%;
    }

    /* Line */
    #tblDetail.tbl-pcb th:nth-child(3),
    #tblDetail.tbl-pcb td:nth-child(3) {
        width: 7%;
    }

    /* Process */
    #tblDetail.tbl-pcb th:nth-child(4),
    #tblDetail.tbl-pcb td:nth-child(4) {
        width: 8%;
    }

    /* Lot */
    #tblDetail.tbl-pcb th:nth-child(5),
    #tblDetail.tbl-pcb td:nth-child(5) {
        width: 10%;
    }

    /* Serial */
    #tblDetail.tbl-pcb th:nth-child(6),
    #tblDetail.tbl-pcb td:nth-child(6) {
        width: 14%;
    }

    /* Prod Jun */
    #tblDetail.tbl-pcb th:nth-child(7),
    #tblDetail.tbl-pcb td:nth-child(7) {
        width: 10%;
    }

    /* Qty */
    #tblDetail.tbl-pcb th:nth-child(8),
    #tblDetail.tbl-pcb td:nth-child(8) {
        width: 8%;
    }

    /* Detail */
    #tblDetail.tbl-pcb th:nth-child(9),
    #tblDetail.tbl-pcb td:nth-child(9) {
        width: 20%;
    }

    /* Action */
    #tblDetail.tbl-pcb th:nth-child(10),
    #tblDetail.tbl-pcb td:nth-child(10) {
        width: 6%;
    }
</style>

<input type="hidden" id="nfrmno" name="nfrmno" value="{{ $NFRMNO }}">
<input type="hidden" id="vorgno" name="vorgno" value="{{ $VORGNO }}">
<input type="hidden" id="cyear" name="cyear" value="{{ $CYEAR }}">
<script>
    console.log('NFRMNO =', '{{ $NFRMNO }}');
    console.log('VORGNO =', '{{ $VORGNO }}');
    console.log('CYEAR =', '{{ $CYEAR }}');
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-50 px- py-6">
    <div class="edr-card w-full max-w-[1600px] mx-auto overflow-hidden rounded-2xl bg-white">
        <div class="bg-gradient-to-r from-emerald-900 via-teal-700 to-cyan-600 px-6 py-6">
            <h1 class="text-center text-3xl font-extrabold tracking-wide text-white">
                MFG E-Daily Report Form
            </h1>
        </div>

        <form id="formMfgEdr" enctype="multipart/form-data" class="p-4">
            <div class="overflow-hidden rounded-2xl border border-slate-300 bg-white">
                <div class="grid grid-cols-12 border-b border-slate-300">
                    <div class="edr-label col-span-12 md:col-span-2 px-4 py-2">
                        Create By 
                    </div>
                    <div class="col-span-12 md:col-span-10 px-4 py-2 font-bold text-slate-800">
                        <input type="hidden" id="inputBy" name="inputBy" value="{{ $EMPNO }}">
                        <input type="hidden" id="sseccode" name="sseccode" >
                        <input type="hidden" id="ssec" name="ssec" >
                        <input type="hidden" id="sdepcode" name="sdepcode" >
                        <span id="input_name" class="ml-2 text-sm text-emerald-700"></span>
                    </div>
                </div>

                <div class="grid grid-cols-12 border-b border-slate-300">
                    <div class="edr-label col-span-12 md:col-span-2 px-4 py-2">
                        Input By (ผู้เจอปัญหา) <span class="required">*</span>
                    </div>
                    <div class="col-span-12 md:col-span-4 px-4 py-2">
                        <input type="text" id="request_by" name="request_by" maxlength="5" placeholder="Ex.15199" class="edr-input max-w-[120px]">
                        <span id="request_by_name" class="ml-2 text-sm font-bold text-emerald-700"></span>
                    </div>

                    <div class="edr-label col-span-12 md:col-span-2 px-4 py-2">
                        Repair by (ผู้แก้ไข) <span class="required">*</span>
                    </div>
                    <div class="col-span-12 md:col-span-4 px-4 py-2">
                        <input type="text" id="repair_by" name="repair_by" maxlength="5" placeholder="Ex.15199" class="edr-input max-w-[120px]">
                        <span id="repair_by_name" class="ml-2 text-sm font-bold text-emerald-700"></span>
                    </div>
                </div>

                <div class="grid grid-cols-12 border-b border-slate-300">
                    <div class="edr-label col-span-12 md:col-span-2 px-4 py-2">
                        ประเภทของงาน <span class="required">*</span>
                    </div>
                    <div class="col-span-12 md:col-span-4 px-4 py-2">
                        <select id="job_type" name="job_type" class="edr-input">
                            <option value="">--- Please select ---</option>
                        </select>
                    </div>

                    <div class="edr-label col-span-12 md:col-span-2 px-4 py-2">
                        สาเหตุ(เบื้องต้น) <span class="required">*</span>
                    </div>
                    <div class="col-span-12 md:col-span-4 px-4 py-2">
                        <select id="cause" name="cause" class="edr-input">
                            <option value="">--- Please select ---</option>
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-12 border-b border-slate-300">
                    <div class="edr-label col-span-12 md:col-span-2 px-4 py-2">
                        เอกสาร / รูปภาพ
                    </div>
                    <div class="col-span-12 md:col-span-10 px-4 py-2">
                        <input type="file" id="filUpload_ref" name="filUpload_ref[]" multiple
                            class="block w-full text-sm text-slate-700
                            file:mr-4 file:rounded-xl file:border-0
                            file:bg-teal-700 file:px-4 file:py-2
                            file:font-bold file:text-white
                            hover:file:bg-teal-800">

                        <p class="mt-2 text-xs font-bold text-red-700"> **ชื่อไฟล์ห้ามมีช่องว่างหรืออักษรพิเศษ เช่น [ ' , " * ]</p>
                    </div>
                </div>

                <div class="grid grid-cols-12">
                    <div class="edr-label col-span-12 md:col-span-2 px-4 py-2">
                        Remark
                    </div>
                    <div class="col-span-12 md:col-span-10 px-4 py-2">
                        <textarea id="remark" name="remark" rows="4"
                            placeholder="REMARK !!!" class="edr-input resize-y"></textarea>
                    </div>
                </div>
            </div>


            <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
                <button type="button" id="btnAddRow"
                    class="rounded-full bg-gradient-to-r from-orange-500 to-amber-400 px-7 py-2 font-extrabold text-white shadow-lg hover:scale-[1.02]">
                    Add Row
                </button>

                <div class="rounded-full border border-yellow-300 bg-yellow-100 px-8 py-2 font-extrabold text-yellow-800 shadow">
                    Total Row : <span id="totalRow">0</span>
                </div>
            </div>

            <div class="mt-3 overflow-x-auto rounded-2xl border border-slate-300">
                <table id="tblDetail" class="w-full min-w-[1350px] border-collapse text-sm">
                    <colgroup>
                        <col style="width:3%">
                        <col style="width:10%">
                        <col style="width:15%">
                        <col style="width:25%">
                        <col style="width:7%">
                        <col style="width:5%">
                        <col style="width:7%">
                        <col style="width:7%">
                        <col style="width:17%">
                        <col style="width:4%">
                    </colgroup>
                    <thead>
                        <tr class="bg-gradient-to-r from-emerald-900 to-teal-700 text-white">
                            <th class="border border-slate-300 px-3 py-2 text-center w-14">#</th>
                            <th class="border border-slate-300 px-3 py-2 text-left">Order no <span class="text-red-800">*</span></th>
                            <th class="border border-slate-300 px-3 py-2 text-left">Drawing no <span class="text-red-800">*</span></th>
                            <th class="border border-slate-300 px-3 py-2 text-left">Project no</th>
                            <th class="border border-slate-300 px-3 py-2 text-left">Prod Jun</th>
                            <th class="border border-slate-300 px-3 py-2 text-left">Item <span class="text-red-800">*</span></th>
                            <th class="border border-slate-300 px-3 py-2 text-left">Model</th>
                            <th class="border border-slate-300 px-3 py-2 text-left">Qty <span class="text-red-800">*</span></th>
                            <th class="border border-slate-300 px-3 py-2 text-left">Detail of problem</th>
                            <th class="border border-slate-300 px-3 py-2 text-center w-24">Action</th>
                        </tr>
                    </thead>
                    <tbody id="detailBody" class="bg-white"></tbody>
                </table>
            </div>

            <div class="mt-5 flex justify-center gap-4">
            <!--<button type="button" id="btnSaveDraft"
                    class="rounded-full bg-yellow-400 px-8 py-2 font-extrabold text-slate-900 shadow-lg hover:bg-yellow-500">
                    Save Draft
                </button>
            -->
                <button type="button" id="btnSendForm"
                    class="rounded-full bg-gradient-to-r from-violet-700 to-indigo-500 px-8 py-2 font-extrabold text-white shadow-lg hover:scale-[1.02]">
                    Send Form
                </button>
            </div>

        </form>
    </div>
</div>

@endsection
@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/mfg_edr_main.js?ver={{ $GLOBALS['version'] }}"></script>             
@endsection