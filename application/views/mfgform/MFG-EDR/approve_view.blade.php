@extends('layouts/webflowTemplate')

@section('contents')
<style>
    .edr-card {
        box-shadow: 0 5px 15px rgba(15, 23, 42, 0.12);
    }

    .edr-label {
        background: #ecfdf5;
        color: #064e3b;
        font-weight: 800;
    }

    .edr-value {
        background: #ffffff;
        color: #334155;
        font-weight: 700;
        min-height: 42px;
        display: flex;
        align-items: center;
        word-break: break-word;
    }

    .edr-section-title {
        background: linear-gradient(to right, #064e3b, #0f766e);
        color: #ffffff;
        font-weight: 900;
        padding: 0.75rem 1rem;
        border-radius: 1rem 1rem 0 0;
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

    .edr-remark {
        white-space: pre-wrap;
        line-height: 1.6;
    }

    .edr-table th {
        padding: 10px;
        font-weight: 800;
        text-align: center;
        white-space: nowrap;
    }

    .edr-table td {
        padding: 9px 10px;
        border: 1px solid #cbd5e1;
        vertical-align: top;
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

<div class="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-50 py-6">
    <div class="edr-card w-full max-w-[1600px] mx-auto overflow-hidden rounded-2xl bg-white">

        <div class="bg-gradient-to-r from-emerald-900 via-teal-700 to-cyan-600 px-6 py-6">
            <h1 class="text-center text-3xl font-extrabold tracking-wide text-white">
                MFG E-Daily Report Form
            </h1>
        </div>

        <div class="p-4">

            <div class="overflow-hidden rounded-2xl border border-slate-300 bg-white">

                <div class="grid grid-cols-12 border-b border-slate-300">
                    <div class="edr-label col-span-12 md:col-span-2 px-4 py-2">Form no :</div>
                    <div id="v_form_no" class="edr-value col-span-12 md:col-span-10 px-4 py-2">-</div>
                </div>

                <div class="grid grid-cols-12 border-b border-slate-300">
                    <div class="edr-label col-span-12 md:col-span-2 px-4 py-2">Create By</div>
                    <div id="v_create_by" class="edr-value col-span-12 md:col-span-10 px-4 py-2">-</div>
                </div>

                <div class="grid grid-cols-12 border-b border-slate-300">
                    <div class="edr-label col-span-12 md:col-span-2 px-4 py-2">Request By</div>
                    <div id="v_request_by" class="edr-value col-span-12 md:col-span-10 px-4 py-2">-</div>
                </div>

                <div class="grid grid-cols-12 border-b border-slate-300">
                    <div class="edr-label col-span-12 md:col-span-2 px-4 py-2">Daily Report No</div>
                    <div id="v_daily_no" class="edr-value col-span-12 md:col-span-10 px-4 py-2">-</div>
                </div>

                <div class="grid grid-cols-12 border-b border-slate-300">
                    <div class="edr-label col-span-12 md:col-span-2 px-4 py-2">ประเภทของงาน</div>
                    <div id="v_worktype" class="edr-value col-span-12 md:col-span-10 px-4 py-2">-</div>
                </div>

                <div class="grid grid-cols-12 border-b border-slate-300">
                    <div class="edr-label col-span-12 md:col-span-2 px-4 py-2">Repair by (ผู้แก้ไข)</div>
                    <div id="v_repair_by" class="edr-value col-span-12 md:col-span-4 px-4 py-2">-</div>

                    <div class="edr-label col-span-12 md:col-span-2 px-4 py-2">สาเหตุ(เบื้องต้น)</div>
                    <div id="v_cause" class="edr-value col-span-12 md:col-span-4 px-4 py-2">-</div>
                </div>

                <div class="grid grid-cols-12 border-b border-slate-300">
                    <div class="edr-label col-span-12 md:col-span-2 px-4 py-2">เอกสาร / รูปภาพ</div>
                    <div class="edr-value col-span-12 md:col-span-10 px-4 py-2">
                        <div id="v_file_list" class="edr-file-list">-</div>
                    </div>
                </div>

                <div class="grid grid-cols-12">
                    <div class="edr-label col-span-12 md:col-span-2 px-4 py-2">Remark</div>
                    <div class="edr-value col-span-12 md:col-span-10 px-4 py-2">
                        <div id="v_remark" class="edr-remark">-</div>
                    </div>
                </div>

            </div>

            <div class="mt-4 overflow-x-auto rounded-2xl border border-slate-300">
                <table id="tblViewDetail" class="edr-table w-full min-w-[1350px] border-collapse text-sm">
                    <thead id="v_detail_head">
                    </thead>
                    <tbody id="v_detail_body" class="bg-white">
                    </tbody>
                </table>
            </div>

            <div class="mt-5">
                <div class="edr-section-title">
                    Root cause (วิเคราะห์สาเหตุ) Why-Why Analysis
                </div>

                <div class="overflow-x-auto rounded-b-2xl border border-t-0 border-slate-300">
                    <table class="edr-table w-full border-collapse text-sm">
                        <thead>
                            <tr class="bg-red-800 text-white">
                                <th style="width: 80px;">No</th>
                                <th>Why</th>
                            </tr>
                        </thead>
                        <tbody id="v_root_body" class="bg-white">
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="mt-5">
                <div class="edr-section-title">
                    Corrective Action (การแก้ไขปัญหา)
                </div>

                <div class="overflow-x-auto rounded-b-2xl border border-t-0 border-slate-300">
                    <table class="edr-table w-full border-collapse text-sm">
                        <thead>
                            <tr class="bg-red-700 text-white">
                                <th style="width: 80px;">No</th>
                                <th>Corrective Action (การแก้ไขปัญหา)</th>
                                <th style="width: 220px;">กำหนดเสร็จ</th>
                            </tr>
                        </thead>
                        <tbody id="v_corrective_body" class="bg-white">
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="mt-5">
                <div class="edr-section-title">
                    Preventive Action (การป้องกันปัญหา)
                </div>

                <div class="overflow-x-auto rounded-b-2xl border border-t-0 border-slate-300">
                    <table class="edr-table w-full border-collapse text-sm">
                        <thead>
                            <tr class="bg-pink-700 text-white">
                                <th style="width: 80px;">No</th>
                                <th>Preventive Action (การป้องกันปัญหา)</th>
                                <th style="width: 220px;">กำหนดเสร็จ</th>
                            </tr>
                        </thead>
                        <tbody id="v_preventive_body" class="bg-white">
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    </div>
</div>

@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/mfg_edr_view.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection