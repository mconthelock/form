@extends('layouts/webflowTemplate')

@section('contents')

<style>
    .edr-wrapper {
        max-width: 1600px;
        margin: 0 auto;
    }

    .edr-main-card,
    .edr-zone {
        background: #fff;
        overflow: hidden;
        box-shadow: 0 4px 14px rgba(15, 23, 42, .05);
    }

    .edr-main-card {
        border-radius: 24px;
        box-shadow: 0 10px 30px rgba(15, 23, 42, .10);
    }

    .edr-zone {
        border: 1px solid #dbe4ee;
        border-radius: 18px;
        margin-bottom: 24px;
    }

    .edr-header,
    .edr-zone-title {
        background: linear-gradient(90deg, #064e3b, #0f766e, #0891b2);
        color: #fff;
    }

    .edr-header {
        padding: 24px;
    }

    .edr-header-title {
        font-size: 2rem;
        font-weight: 900;
        text-align: center;
        letter-spacing: .5px;
    }

    .edr-zone-title {
        padding: 12px 18px;
        font-size: 1rem;
        font-weight: 900;
        letter-spacing: .3px;
    }

    .edr-zone-body {
        padding: 0;
    }

    .edr-label {
        background: #ecfdf5;
        color: #064e3b;
        font-weight: 800;
    }

    .edr-value {
        background: #fff;
        color: #334155;
        font-weight: 700;
        min-height: 44px;
        display: flex;
        align-items: center;
        word-break: break-word;
    }

    .edr-file-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    .edr-file-list a {
        color: #2563eb;
        text-decoration: underline;
        font-weight: 700;
    }

    .edr-table,
    #tblViewDetail {
        width: 100%;
        min-width: 0;
        border-collapse: collapse;
        table-layout: fixed;
        font-size: 14px;
    }

    .edr-table thead {
        background: #065f46;
        color: #fff;
    }

    .edr-table th,
    .edr-table td {
        border: 1px solid #dbe4ee;
        overflow-wrap: break-word;
        word-break: break-word;
    }

    .edr-table th {
        padding: 11px;
        font-weight: 800;
        text-align: center;
        white-space: nowrap;
    }

    .edr-table td {
        padding: 10px;
        vertical-align: top;
    }

    .edr-table tbody tr:nth-child(even) {
        background: #ecfeff;
    }

    .text-left {
        text-align: left !important;
    }

    .text-center {
        text-align: center !important;
    }
</style>

<input type="hidden" id="base_url" value="<?= base_url(); ?>">
<input type="hidden" id="nfrmno" value="{{ $NFRMNO ?? '' }}">
<input type="hidden" id="vorgno" value="{{ $VORGNO ?? '' }}">
<input type="hidden" id="cyear" value="{{ $CYEAR ?? '' }}">
<input type="hidden" id="cyear2" value="{{ $CYEAR2 ?? '' }}">
<input type="hidden" id="nrunno" value="{{ $NRUNNO ?? '' }}">
<input type="hidden" id="empno" value="{{ $EMPNO ?? '' }}">
<input type="hidden" id="txt_exdata" value="{{ $exdata ?? '' }}">
<input type="hidden" id="mode" value="{{ $mode }}">


<div class="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-50 py-6 px-3">
    <div class="edr-wrapper">
        <div class="edr-main-card">
            <div class="edr-header">
                <div class="edr-header-title">
                    MFG E-Daily Report Form
                </div>
            </div>

            <div class="p-5">
                {{-- ================= FORM INFO ================= --}}
                <div class="edr-zone zone-main">


                    <div class="edr-zone-body">
                        <div class="grid grid-cols-12 border-b border-slate-300">
                            <div class="edr-label col-span-12 md:col-span-2 px-4 py-2">Form no :</div>
                            <div id="v_form_no" class="edr-value col-span-12 md:col-span-10 px-4 py-2" data-formno="<?= $formno ?>"><?= $formno ?></div>
                        </div>

                        <div class="grid grid-cols-12 border-b border-slate-300">
                            <div class="edr-label col-span-12 md:col-span-2 px-4 py-2">Daily Report No</div>
                            <div id="v_daily_no" class="edr-value col-span-12 md:col-span-10 px-4 py-2">-</div>
                        </div>

                        <div class="grid grid-cols-12 border-b border-slate-300">
                            <div class="edr-label col-span-12 md:col-span-2 px-4 py-2">Create By</div>
                            <div id="v_create_by" class="edr-value col-span-12 md:col-span-10 px-4 py-2">-</div>
                        </div>

                        <div class="grid grid-cols-12 border-b border-slate-300">
                            <div class="edr-label col-span-12 md:col-span-2 px-4 py-2">Input By (ผู้เจอปัญหา)</div>
                            <div id="v_request_by" class="edr-value col-span-12 md:col-span-10 px-4 py-2">-</div>
                        </div>

                        <div class="grid grid-cols-12 border-b border-slate-300">
                            <div class="edr-label col-span-12 md:col-span-2 px-4 py-2">Repair by (ผู้แก้ไข)</div>
                            <div id="v_repair_by" class="edr-value col-span-12 md:col-span-10 px-4 py-2">-</div>
                        </div>

                        <div class="grid grid-cols-12 border-b border-slate-300">
                            <div class="edr-label col-span-12 md:col-span-2 px-4 py-2">
                                ประเภทของงาน
                            </div>
                            <div id="v_worktype" class="edr-value col-span-12 md:col-span-4 px-4 py-2">
                                -
                            </div>
                            <div class="edr-label col-span-12 md:col-span-2 px-4 py-2">
                                สาเหตุ(เบื้องต้น)
                            </div>
                            <div id="v_cause"
                                class="edr-value col-span-12 md:col-span-4 px-4 py-2">
                                -
                            </div>
                        </div>

                        <div class="grid grid-cols-12 border-b border-slate-300">
                            <div class="edr-label col-span-12 md:col-span-2 px-4 py-2">
                                เอกสาร / รูปภาพ
                            </div>

                            <div class="edr-value col-span-12 md:col-span-10 px-4 py-2">
                                <div id="v_file_list" class="edr-file-list">
                                    -
                                </div>
                            </div>
                        </div>

                        <div class="grid grid-cols-12">
                            <div class="edr-label col-span-12 md:col-span-2 px-4 py-2">
                                Remark
                            </div>

                            <div class="edr-value col-span-12 md:col-span-10 px-4 py-2">
                                <div class="w-full">
                                    <textarea id="remark"  name="remark" rows="3"  placeholder="REMARK !!!" class="edr-input w-full resize-y rounded-lg border border-slate-300 px-3 py-2"> </textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {{-- ================= DETAIL ================= --}}
                <div class="edr-zone zone-detail">
                    <div class="edr-zone-title">
                        Production Detail
                    </div>

                    <div class="overflow-x-auto">
                        <table id="tblViewDetail" class="edr-table table-fixed">
                            <colgroup id="v_detail_colgroup"></colgroup>
                            <thead id="v_detail_head"></thead>
                            <tbody id="v_detail_body" class="bg-white"></tbody>
                        </table>

                    </div>

                </div>

        
                {{-- ================= CAUSE 4 M ================= --}}
                <div id="zone_cause4m" class="edr-zone zone-cause4m">
                    <div class="edr-zone-title">
                        CAUSE 4 M (สาเหตุของปัญหา)
                    </div>
                    <div>
                        <table class="edr-table">
                            <thead >
                                <tr>
                                    <th style="width:50px;">No</th>
                                    <th style="width:140px;">สาเหตุ(4M)</th>
                                    <th>การแก้ไข</th>
                                    <th style="width:170px;">กำหนดเสร็จ</th>
                                    <th style="width:220px;">ผู้รับผิดชอบ</th>
                                    <th style="width:80px;" class="col-action-cause4m">#</th>
                                </tr>
                            </thead>
                            <tbody id="v_cause4m_body"></tbody>
                        </table>
                    </div>
                </div>

                {{-- ================= APPROVE ACTION ================= --}}
                @if (($mode ?? '') == 2)
                    <div class="edr-zone">
                        <div class="p-6">
                            <div class="flex flex-wrap justify-center gap-6">
                                <button type="button" id="btn-submit" class="btn-submit px-8 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 font-bold" data-action="approve">
                                    ✅ Approve
                                </button>
                                <button type="button" class="btn-submit px-8 py-3 bg-red-600 text-white rounded-xl shadow hover:bg-red-700 font-bold" data-action="reject">
                                    ❌ Reject
                                </button>
                            @if ($exdata != '01')
                                <button type="button" class="btn-submit px-8 py-3 bg-yellow-500 text-white rounded-xl shadow hover:bg-yellow-600 font-bold" data-action="returnb">
                                    ↩ Return
                                </button>
                             @endif
                            </div>
                        </div>
                    </div>
                @endif

            </div>
        </div>
    </div>
</div>
<div class="flow mt-8"></div>

@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/mfg_edr_view.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection