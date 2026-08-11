@extends('layouts/webflowTemplate')

@section('styles')
    <style>
        .fin-npo-show {
            background: #f8fafc;
            color: #334155;
        }

        .fin-npo-show .page-header {
            background: #ffffff;
            border-left: 6px solid #0369a1;
        }

        .fin-npo-show .show-readonly,
        .fin-npo-show .show-readonly:disabled,
        .fin-npo-show input[readonly] {
            cursor: default;
            opacity: 1;
            background: #ffffff !important;
            border: 2px solid #94a3b8 !important;
            color: #172033 !important;
            font-weight: 700;
        }

        #stampTable {
            width: 100% !important;
            border-collapse: collapse !important;
            border: 2px solid #475569 !important;
        }

        #stampTable th,
        #stampTable td {
            padding: 10px 12px !important;
            border: 1px solid #64748b !important;
            vertical-align: middle;
        }

        #stampTable thead th {
            background: #bae6fd;
            color: #0f172a;
            font-weight: 800;
            text-align: center;
            white-space: nowrap;
        }

        #stampTable tbody td {
            background: #ffffff;
            color: #334155;
            font-weight: 600;
            text-align: center;
        }

        #stampTable tbody td:nth-child(3) {
            text-align: left;
        }

        #stampTable tbody td:nth-child(4),
        #stampTable tbody td:nth-child(5),
        #stampTable tbody td:nth-child(6) {
            text-align: right;
        }
    </style>
@endsection

@section('contents')
    <main class="fin-npo-show min-h-screen px-4 py-8 font-sans">
        <div class="mx-auto w-full max-w-5xl">
            {{-- Header --}}
            <header class="page-header card mb-5 rounded-2xl shadow-md">
                <div class="card-body px-6 py-5 md:px-8">
                    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div class="flex items-center gap-4">
                            <div class="rounded-xl bg-sky-600 p-3 text-white shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M9 12h6m-6 4h6M9 8h3m5.25 12.25H6.75A2.75 2.75 0 014 17.5v-11a2.75 2.75 0 012.75-2.75h7.19c.73 0 1.43.29 1.95.81l3.3 3.3c.52.52.81 1.22.81 1.95v7.69a2.75 2.75 0 01-2.75 2.75z" />
                                </svg>
                            </div>
                            <div>
                                <h1 class="text-2xl font-extrabold tracking-tight text-slate-800">
                                    Non-PO Expense Requisition Detail
                                </h1>
                                <p class="mt-1 text-sm font-medium text-slate-500">
                                    รายละเอียดใบขอเบิกค่าใช้จ่ายที่ไม่เกี่ยวข้องกับใบสั่งซื้อ
                                </p>
                            </div>
                        </div>
                        <span id="Pos"
                            class="badge badge-outline badge-lg border-slate-300 px-5 py-4 font-bold text-slate-600"></span>
                    </div>
                </div>
            </header>

            {{-- Webflow form information --}}
            <div id="formDetailArea" class="mb-5"></div>

            <div class="card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div class="card-body px-6 py-8 md:px-10">
                    <form id="form" action="#" class="space-y-8">
                        {{-- Requester --}}
                        <section>
                            <div class="mb-4 flex items-center gap-3">
                                <span class="h-6 w-1.5 rounded-full bg-sky-500"></span>
                                <h2 class="text-base font-bold uppercase tracking-widest text-sky-700">Requester Information</h2>
                            </div>

                            <div class="space-y-4 rounded-xl border border-sky-200 border-l-4 border-l-sky-500 bg-sky-50/60 p-5 shadow-sm">

                                {{-- <div class="form-control">
                                    <label class="label pb-1" for="FORMNO">
                                        <span class="label-text text-sm font-bold">Form No.</span>
                                    </label>
                                    <input id="FORMNO" name="FORMNO" type="text" readonly
                                        class="show-readonly input input-sm input-bordered w-full" />
                                </div> --}}

                                <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div class="form-control">
                                        <label class="label pb-1" for="INPUTBY">
                                            <span class="label-text text-sm font-bold">Input By</span>
                                        </label>
                                        <input id="INPUTBY" name="INPUTBY" type="text" readonly
                                            class="show-readonly input input-sm input-bordered w-full" />
                                    </div>
                                    <div class="form-control">
                                        <label class="label pb-1" for="REQBY">
                                            <span class="label-text text-sm font-bold">Requester By</span>
                                        </label>
                                        <input id="REQBY" name="REQBY" type="text" readonly
                                            class="show-readonly input input-sm input-bordered w-full" />
                                    </div>
                                </div>

                                <div class="form-control">
                                    <label class="label pb-1" for="FULLDP">
                                        <span class="label-text text-sm font-bold">Division / Department / Section</span>
                                    </label>
                                    <input id="FULLDP" name="FULLDP" type="text" readonly
                                        class="show-readonly input input-sm input-bordered w-full" />
                                </div>
                            </div>
                        </section>

                        {{-- Expense information --}}
                        <section>
                            <div class="mb-4 flex items-center gap-3">
                                <span class="h-6 w-1.5 rounded-full bg-violet-500"></span>
                                <h2 class="text-base font-bold uppercase tracking-widest text-violet-700">Expense Details</h2>
                            </div>

                            <div class="space-y-4 rounded-xl border border-violet-200 border-l-4 border-l-violet-500 bg-violet-50/60 p-5 shadow-sm">
                                <div class="form-control">
                                    <label class="label pb-1" for="SUBJECT">
                                        <span class="label-text text-sm font-bold">Subject</span>
                                    </label>
                                    <input id="SUBJECT" name="SUBJECT" type="text" readonly
                                        class="show-readonly input input-sm input-bordered w-full" />
                                </div>

                                <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div class="form-control">
                                        <label class="label pb-1" for="EXPENSE_NAME">
                                            <span class="label-text text-sm font-bold">Expense Type</span>
                                        </label>
                                        <input id="EXPENSE_CODE" name="EXPENSE_CODE" type="hidden" />
                                        <input id="EXPENSE_NAME" name="EXPENSE_NAME" type="text" readonly
                                            class="show-readonly input input-sm input-bordered w-full" />
                                    </div>
                                    <div class="form-control">
                                        <label class="label pb-1" for="VENDOR_NAME">
                                            <span class="label-text text-sm font-bold">Vendor / Supplier</span>
                                        </label>
                                        <input id="VENDOR_CODE" name="VENDOR_CODE" type="hidden" />
                                        <input id="VENDOR_NAME" name="VENDOR_NAME" type="text" readonly
                                            class="show-readonly input input-sm input-bordered w-full" />
                                    </div>
                                </div>

                                <div id="airSalesEmployeeSection" class="form-control hidden">
                                    <label class="label pb-1">
                                        <span class="label-text text-sm font-bold">Employees Traveling Abroad</span>
                                    </label>
                                    <div id="airSalesEmployeeList"
                                        class="rounded-lg border border-violet-200 bg-white p-4 text-sm text-slate-700">
                                        <div class="grid grid-cols-[minmax(8rem,0.35fr)_1fr] gap-3 border-b border-violet-100 px-3 pb-2 font-bold">
                                            <span>Employee Code</span>
                                            <span>Employee Name</span>
                                        </div>
                                        <div class="px-3 pt-3">No employee information</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {{-- Invoice --}}
                        <section>
                            <div class="mb-4 flex items-center gap-3">
                                <span class="h-6 w-1.5 rounded-full bg-emerald-500"></span>
                                <h2 class="text-base font-bold uppercase tracking-widest text-emerald-700">Invoice Details</h2>
                            </div>
                            <div class="overflow-x-auto rounded-xl">
                                <table id="stampTable" class="table table-xs w-full"></table>
                            </div>
                        </section>

                        {{-- Remark --}}
                        <section>
                            <div class="mb-4 flex items-center gap-3">
                                <span class="h-6 w-1.5 rounded-full bg-amber-500"></span>
                                <h2 class="text-base font-bold uppercase tracking-widest text-amber-700">Remark</h2>
                            </div>
                            <div class="rounded-xl border border-amber-200 border-l-4 border-l-amber-500 bg-amber-50/60 p-5 shadow-sm">
                                <textarea id="REMARK" name="REMARK" rows="4" readonly
                                    class="show-readonly textarea textarea-bordered w-full resize-none"></textarea>
                            </div>
                        </section>

                        {{-- Attachment --}}
                        <section>
                            <div class="mb-4 flex items-center gap-3">
                                <span class="h-6 w-1.5 rounded-full bg-cyan-500"></span>
                                <h2 class="text-base font-bold uppercase tracking-widest text-cyan-700">Attachment</h2>
                            </div>
                            <div class="rounded-xl border-2 border-dashed border-cyan-200 bg-cyan-50/50 p-6">
                                <div id="attachmentList" class="text-sm text-slate-500">
                                    Loading attachment...
                                </div>
                            </div>
                        </section>

                        <div id="actionform"></div>
                    </form>
                </div>
            </div>

            <div id="sentApprove"></div>
        </div>
    </main>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/finNpoShow.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
