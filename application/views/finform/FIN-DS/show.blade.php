@extends('layouts/webflowTemplate')

@section('styles')
    <style>
        #stampTable tbody tr {
            height: 48px;
        }

        #stampTable tbody td {
            padding: 10px 12px !important;
            vertical-align: middle;
        }

        #stampTable tbody input,
        #stampTable tbody select,
        #stampTable tbody textarea {
            min-height: 38px;
            padding: 6px 10px;
        }

        .show-page {
            background:
                radial-gradient(circle at top left, rgba(56, 189, 248, 0.16), transparent 32%),
                radial-gradient(circle at bottom right, rgba(167, 139, 250, 0.12), transparent 30%),
                linear-gradient(180deg, rgba(248, 250, 252, 0.98), rgba(241, 245, 249, 0.96));
        }

        .show-card-header {
            background: linear-gradient(to right, rgba(240, 249, 255, 0.96), rgba(255, 255, 255, 1));
            border-left: 6px solid rgba(14, 165, 233, 0.75);
        }

        .show-readonly,
        .show-readonly:disabled,
        .show-readonly[readonly] {
            cursor: not-allowed;
            opacity: 1;
            border-style: solid !important;
            font-weight: 700;
        }

        .show-mode-banner {
            border: 1px solid rgba(125, 211, 252, 0.55);
            background: linear-gradient(90deg, rgba(240, 249, 255, 0.9), rgba(255, 255, 255, 0.95));
        }

        #stampTable thead th {
            background: linear-gradient(180deg, rgba(240, 249, 255, 1), rgba(224, 242, 254, 0.8));
            color: #0f172a;
            font-weight: 800;
            border-color: rgba(14, 165, 233, 0.24);
            text-align: center;
            vertical-align: middle;
        }

        #stampTable tbody td {
            text-align: center;
            vertical-align: middle;
            color: #334155;
            font-weight: 650;
        }

        #stampTable tbody td:nth-child(1) {
            color: #0369a1;
            font-weight: 900;
        }

        #stampTable tbody td:nth-child(2) {
            color: #334155;
            font-weight: 800;
            text-align: left !important;
        }

        #stampTable tbody td:nth-child(n+3) {
            color: #047857;
            font-weight: 900;
        }

        #stampTable tfoot th {
            background: linear-gradient(180deg, rgba(254, 243, 199, 0.85), rgba(254, 249, 195, 0.7));
            color: #92400e;
            font-weight: 900;
            text-align: right;
        }

        .readonly-watermark {
            position: absolute;
            top: 1rem;
            right: 1rem;
            opacity: 0.055;
            font-size: 4rem;
            font-weight: 900;
            letter-spacing: 0.15em;
            pointer-events: none;
            user-select: none;
        }
    </style>
@endsection

@section('contents')
    <div class="show-page min-h-screen py-8 px-4 font-sans flex flex-col items-center text-slate-700">
        <div class="max-w-5xl w-full mx-auto">

            {{-- Page Header --}}
            <div class="card show-card-header shadow-md rounded-2xl mb-5 relative overflow-hidden">
                <div class="readonly-watermark">SHOW</div>

                <div class="card-body px-8 py-5">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div class="flex items-center gap-4">
                            <div class="bg-sky-600 text-white rounded-xl p-3 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg"
                                     class="w-6 h-6"
                                     fill="none"
                                     viewBox="0 0 24 24"
                                     stroke="currentColor"
                                     stroke-width="2">
                                    <path stroke-linecap="round"
                                          stroke-linejoin="round"
                                          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25z" />
                                </svg>
                            </div>

                            <div>
                                <h1 class="text-2xl font-extrabold text-slate-800 tracking-tight">
                                    Requisition Duty Stamp Detail
                                </h1>
                                <p class="text-sm text-sky-700 font-bold mt-0.5">
                                    View-only mode / หน้าแสดงรายละเอียดเอกสาร
                                </p>
                            </div>
                        </div>

                        <div class="flex items-center gap-2">
                            <span class="badge bg-sky-100 text-sky-800 border-sky-200 badge-lg font-bold px-5 py-4 text-sm shadow-sm">
                                VIEW ONLY
                            </span>

                            <span class="badge badge-outline badge-lg font-bold px-5 py-4 text-sm shadow-sm border-slate-300 text-slate-600"
                                  id="Pos">
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Webflow Form Detail Area --}}
            <div id="formDetailArea" class="mb-5"></div>

            {{-- Main Content --}}
            <div class="card bg-white shadow-xl border border-slate-200 rounded-2xl overflow-hidden">
                <div class="card-body px-6 py-8 md:px-10">

                    <div class="show-mode-banner rounded-2xl px-6 py-4 mb-5 shadow-sm flex items-start gap-3">
                        <div class="badge bg-sky-100 text-sky-700 border-sky-200 badge-sm mt-0.5">
                            INFO
                        </div>

                        <div>
                            <p class="font-extrabold text-slate-800">
                                This document is read-only
                            </p>
                            <p class="text-sm text-slate-500">
                                หน้านี้ใช้สำหรับตรวจสอบรายละเอียดเท่านั้น ไม่สามารถเพิ่ม แก้ไข หรือลบข้อมูลได้
                            </p>
                        </div>
                    </div>

                    <form action="#" id="form" class="space-y-8">

                        {{-- Requester Information --}}
                        <section>
                            <div class="flex items-center gap-3 mb-4">
                                <div class="bg-sky-100 p-1.5 rounded-lg text-sky-700">
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                         class="w-5 h-5"
                                         fill="none"
                                         viewBox="0 0 24 24"
                                         stroke="currentColor"
                                         stroke-width="2">
                                        <path stroke-linecap="round"
                                              stroke-linejoin="round"
                                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>

                                <h2 class="text-base font-bold text-sky-700 uppercase tracking-widest">
                                    Requester Information
                                </h2>
                            </div>

                            <div class="rounded-xl p-5 shadow-sm space-y-4 bg-sky-50/70 border border-sky-200 border-l-4 border-l-sky-400">

                                {{-- Form No. --}}
                                <div class="form-control">
                                    <label class="label pb-1">
                                        <span class="label-text font-bold text-base-content/80 text-sm">
                                            Form No.
                                        </span>
                                    </label>

                                    <input id="FORMNO"
                                           type="text"
                                           name="FORMNO"
                                           readonly
                                           class="show-readonly input input-sm input-bordered w-full bg-sky-50 text-sky-800 border-sky-200 focus:outline-none shadow-sm" />
                                </div>

                                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div class="form-control">
                                        <label class="label pb-1">
                                            <span class="label-text font-bold text-base-content/80 text-sm">
                                                Input By
                                            </span>
                                        </label>

                                        <input id="INPUTBY"
                                               type="text"
                                               name="INPUTBY"
                                               readonly
                                               class="show-readonly input input-sm input-bordered w-full bg-indigo-50 text-indigo-800 border-indigo-200 focus:outline-none shadow-sm" />
                                    </div>

                                    <div class="form-control">
                                        <label class="label pb-1">
                                            <span class="label-text font-bold text-base-content/80 text-sm">
                                                Requester
                                            </span>
                                        </label>

                                        <input id="REQBY"
                                               type="text"
                                               name="REQBY"
                                               readonly
                                               class="show-readonly input input-sm input-bordered w-full bg-cyan-50 text-cyan-800 border-cyan-200 focus:outline-none shadow-sm" />
                                    </div>
                                </div>

                                <div class="form-control">
                                    <label class="label pb-1">
                                        <span class="label-text font-bold text-base-content/80 text-sm">
                                            DIV / Dept / Sect
                                        </span>
                                    </label>

                                    <input id="FULLDP"
                                           type="text"
                                           name="FULLDP"
                                           readonly
                                           class="show-readonly input input-sm input-bordered w-full bg-emerald-50 text-emerald-800 border-emerald-200 focus:outline-none shadow-sm" />
                                </div>
                            </div>
                        </section>

                        {{-- Request Details --}}
                        <section>
                            <div class="flex items-center gap-3 mb-4">
                                <div class="bg-violet-100 p-1.5 rounded-lg text-violet-700">
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                         class="w-5 h-5"
                                         fill="none"
                                         viewBox="0 0 24 24"
                                         stroke="currentColor"
                                         stroke-width="2">
                                        <path stroke-linecap="round"
                                              stroke-linejoin="round"
                                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>

                                <h2 class="text-base font-bold text-violet-700 uppercase tracking-widest">
                                    Request Details
                                </h2>
                            </div>

                            <div class="bg-violet-50/60 rounded-xl border border-violet-200 border-l-4 border-l-violet-400 p-5 shadow-sm space-y-4">
                                <div class="form-control">
                                    <label class="label pb-1">
                                        <span class="label-text font-bold text-base-content/80 text-sm">
                                            Option
                                        </span>
                                    </label>

                                    <div class="flex items-center gap-6 mt-1 bg-white/80 p-2 rounded-lg border border-violet-200 w-fit shadow-sm">
                                        <label class="label gap-3 justify-start px-2 py-0">
                                            <input id="withd"
                                                   type="radio"
                                                   name="OPTION_CODE"
                                                   value="0"
                                                   class="radio radio-secondary radio-sm"
                                                   disabled />

                                            <span class="label-text font-bold text-violet-800">
                                                Withdrawal
                                            </span>
                                        </label>

                                        <label class="label gap-3 justify-start px-2 py-0" id="OPT">
                                            <input id="addOption"
                                                   type="radio"
                                                   name="OPTION_CODE"
                                                   value="1"
                                                   class="radio radio-secondary radio-sm"
                                                   disabled />

                                            <span class="label-text font-bold text-violet-800">
                                                Add
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div class="form-control">
                                        <label class="label pb-1">
                                            <span class="label-text font-bold text-base-content/80 text-sm">
                                                Effective Date
                                            </span>
                                        </label>

                                        <input id="EffDate"
                                               name="EFFECTIVE_DATE"
                                               type="text"
                                               readonly
                                               class="show-readonly input input-sm input-bordered w-full bg-violet-50 text-violet-800 border-violet-200 focus:outline-none shadow-sm" />
                                    </div>

                                    <div class="form-control">
                                        <label class="label pb-1">
                                            <span class="label-text font-bold text-base-content/80 text-sm">
                                                Date Receive
                                            </span>
                                        </label>

                                        <input id="RetDate"
                                               name="DATE_RECEIVE"
                                               type="text"
                                               readonly
                                               class="show-readonly input input-sm input-bordered w-full bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200 focus:outline-none shadow-sm" />
                                    </div>
                                </div>

                                <div class="form-control">
                                    <label class="label pb-1">
                                        <span class="label-text font-bold text-base-content/80 text-sm">
                                            Stamp Duty Collection Location
                                        </span>
                                    </label>

                                    <input id="location"
                                           name="LOCATION"
                                           type="text"
                                           readonly
                                           class="show-readonly input input-sm input-bordered w-full bg-teal-50 text-teal-800 border-teal-200 focus:outline-none shadow-sm" />
                                </div>

                                <div class="form-control">
                                    <label class="label pb-1">
                                        <span class="label-text font-bold text-base-content/80 text-sm">
                                            Remark
                                        </span>
                                    </label>

                                    <textarea id="REMARK"
                                              name="REMARK"
                                              readonly
                                              class="show-readonly textarea textarea-bordered w-full bg-amber-50 text-amber-900 border-amber-200 focus:outline-none shadow-sm min-h-20"></textarea>
                                </div>
                            </div>
                        </section>

                        {{-- Purpose & Duty Stamp Detail --}}
                        <section>
                            <div class="flex items-center gap-3 mb-4">
                                <div class="bg-emerald-100 p-1.5 rounded-lg text-emerald-700">
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                         class="w-5 h-5"
                                         fill="none"
                                         viewBox="0 0 24 24"
                                         stroke="currentColor"
                                         stroke-width="2">
                                        <path stroke-linecap="round"
                                              stroke-linejoin="round"
                                              d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                    </svg>
                                </div>

                                <h2 class="text-base font-bold text-emerald-700 uppercase tracking-widest">
                                    Purpose &amp; Duty Stamp Detail
                                </h2>
                            </div>

                            <div class="bg-white rounded-xl border border-emerald-200 shadow-sm overflow-hidden">
                                <div class="overflow-x-auto">
                                    <table id="stampTable"
                                           class="table table-xs w-full text-center"></table>
                                </div>
                            </div>
                        </section>

                        {{-- Attachment --}}
                        <section>
                            <div class="flex items-center gap-3 mb-4">
                                <div class="bg-cyan-100 p-1.5 rounded-lg text-cyan-700">
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                         class="w-5 h-5"
                                         fill="none"
                                         viewBox="0 0 24 24"
                                         stroke="currentColor"
                                         stroke-width="2">
                                        <path stroke-linecap="round"
                                              stroke-linejoin="round"
                                              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                </div>

                                <h2 class="text-base font-bold text-cyan-700 uppercase tracking-widest">
                                    Attachment
                                </h2>
                            </div>

                            <div class="bg-cyan-50/60 rounded-xl border-2 border-cyan-200 border-dashed p-6">
                                <div id="attachmentList" class="text-sm text-slate-500">
                                    Loading attachment...
                                </div>
                            </div>
                        </section>

                        <div class="divider before:bg-slate-200 after:bg-slate-200"></div>

                        {{-- Status Area --}}
                        <div id="actionform">
                            <div class="alert bg-sky-50 text-sky-900 border border-sky-200 shadow-sm">
                                <div>
                                    <p class="font-bold">
                                        Read-only document
                                    </p>
                                    <p class="text-sm">
                                        This page is for viewing submitted information only.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/show.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection