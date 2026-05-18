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
    </style>
@endsection
@section('contents')
    <div class="min-h-screen bg-base-200/80 py-8 px-4 font-sans flex flex-col items-center">
        <div class="max-w-5xl w-full mx-auto">

            <div
                class="card bg-gradient-to-r from-primary/10 via-base-100 to-base-100 shadow-md border-l-4 border-primary rounded-2xl mb-5">
                <div class="card-body px-8 py-5">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div class="flex items-center gap-4">
                            <div class="bg-primary text-primary-content rounded-xl p-3 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25z" />
                                </svg>
                            </div>
                            <div>
                                <h1 class="text-2xl font-extrabold text-base-content tracking-tight">Requisition Duty Stamp
                                </h1>
                                <p class="text-sm text-primary font-medium mt-0.5">แบบฟอร์มขอเบิกอากรแสตมป์</p>
                            </div>
                        </div>
                        <span class="badge badge-primary badge-lg font-bold px-5 py-4 text-sm shadow-sm"
                            id="Pos"></span>
                    </div>
                </div>
            </div>

            <div class="card bg-base-100 shadow-xl border border-base-200 rounded-2xl overflow-hidden">
                <div class="card-body px-6 py-8 md:px-10">
                    <form action="#" id="form" method="POST" enctype="multipart/form-data" class="space-y-8">
                        <div>
                            <div class="flex items-center gap-3 mb-4">
                                <div class="bg-primary/20 p-1.5 rounded-lg text-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h2 class="text-base font-bold text-primary uppercase tracking-widest">Requester Information
                                </h2>
                            </div>
                            <div class="bg-primary/5 rounded-xl border border-primary/20 p-5 shadow-sm space-y-4">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div class="form-control">
                                        <label class="label pb-1">
                                            <span class="label-text font-bold text-base-content/80 text-sm">Input By</span>
                                        </label>
                                        <input id="INPUTBY" type="text" name="INPUTBY" value="" readonly
                                            class="input input-sm input-bordered border-base-300 bg-base-200/80 text-error cursor-not-allowed font-semibold focus:outline-none" />
                                    </div>
                                    <div class="form-control">
                                        <label class="label pb-1">
                                            <span class="label-text font-bold text-base-content/80 text-sm">Requester</span>
                                        </label>
                                        <input id="REQBY" type="text" name="REQBY" value=""
                                            class="input input-sm input-bordered border-base-300 bg-base-200/80 text-error font-semibold focus:outline-none req" />
                                    </div>
                                </div>
                                <div class="form-control">
                                    <label class="label pb-1">
                                        <span class="label-text font-bold text-base-content/80 text-sm">DIV / Dept /
                                            Sect</span>
                                    </label>
                                    <input id="FULLDP" type="text" name="FULLDP" value=""
                                        class="input input-sm input-bordered border-base-300 bg-base-200/80 cursor-not-allowed text-base-content font-medium focus:outline-none req" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <div class="flex items-center gap-3 mb-4">
                                <div class="bg-secondary/20 p-1.5 rounded-lg text-secondary">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h2 class="text-base font-bold text-secondary uppercase tracking-widest">Request Details
                                </h2>
                            </div>
                            <div class="bg-secondary/5 rounded-xl border border-secondary/20 p-5 shadow-sm space-y-4">
                                <div class="form-control">
                                    <label class="label pb-1">
                                        <span class="label-text font-bold text-base-content/80 text-sm">Option</span>
                                    </label>
                                    <div
                                        class="flex items-center gap-6 mt-1 bg-white/50 p-2 rounded-lg border border-secondary/10 w-fit">

                                        <!-- ตัวเลือกที่ 1: Withdrawal -->
                                        <label for="option_withdrawal"
                                            class="label cursor-pointer gap-3 justify-start px-2 py-0">
                                            <input id="option_withdrawal" type="radio" name="OPTION_CODE" value="0"
                                                class="radio radio-secondary radio-sm" checked />
                                            <span class="label-text font-bold text-secondary-focus">Withdrawal</span>
                                        </label>

                                        <!-- ตัวเลือกที่ 2: Add (ซ่อนไว้สำหรับ FIN Staff) -->
                                        <label for="option_add"
                                            class="label cursor-pointer gap-3 justify-start px-2 py-0 hidden"
                                            id="OPT">
                                            <input id="option_add" type="radio" name="OPTION_CODE" value="1"
                                                class="radio radio-secondary radio-sm" />
                                            <span class="label-text font-bold text-secondary-focus">Add</span>
                                        </label>

                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div class="form-control">
                                        <label class="label pb-1">
                                            <span class="label-text font-bold text-base-content/80 text-sm">Effective
                                                Date</span>
                                        </label>
                                        <input id="EffDate" name="EFFECTIVE_DATE" type="date"
                                            class="req input input-sm input-bordered border-secondary/30 w-full focus:ring-2 focus:ring-secondary/20 transition-all" />
                                    </div>
                                    <div class="form-control">
                                        <label class="label pb-1">
                                            <span class="label-text font-bold text-base-content/80 text-sm">Date
                                                Receive</span>
                                        </label>
                                        <input id="RetDate" name="DATE_RECEIVE" type="date"
                                            class="input input-sm input-bordered border-secondary/30 w-full focus:ring-2 focus:ring-secondary/20 transition-all" />
                                    </div>
                                </div>
                                <div class="form-control">
                                    <label class="label pb-1">
                                        <span class="label-text font-bold text-base-content/80 text-sm">Stamp Duty
                                            Collection Location</span>
                                    </label>
                                    <input id="location" name="LOCATION" type="text"
                                        class="req input input-sm input-bordered border-secondary/30 w-full text-base-content font-medium focus:ring-2 focus:ring-secondary/20 transition-all"
                                        value="Counter FIN Sect." />
                                </div>
                            </div>
                        </div>

                        <div>

                            {{-- เพิ่มปุ่ม Add Row ก่อนตาราง --}}
                            <div class="flex items-center gap-3 mb-4">
                                <div class="bg-accent/20 p-1.5 rounded-lg text-accent-focus"> ... </div>
                                <h2 class="text-base font-bold text-accent-focus uppercase tracking-widest">Purpose &amp;
                                    Duty Stamp Detail</h2>
                                {{-- ปุ่ม Add Row --}}
                                <button type="button" id="addStampRow" class="btn btn-sm btn-accent ml-auto gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Row
                                </button>
                            </div>

                            <div class="bg-base-100 rounded-xl border border-accent/30 shadow-sm overflow-hidden">
                                <div class="overflow-x-auto">
                                    <table id="stampTable" class="table table-xs w-full text-center">

                                        <tbody></tbody> {{-- เริ่มว่าง DataTable จัดการ --}}
                                        <tfoot>
                                            <tr class="bg-accent/10 font-bold text-accent-content">
                                                <td colspan="9"
                                                    class="pr-4 border-r border-accent/20 text-sm py-3 uppercase tracking-wide">
                                                    Grand Total
                                                </td>
                                                <td id="gt-total"
                                                    class="border-r border-accent/20 bg-base-200/30 text-error font-extrabold text-center text-base">
                                                </td>
                                                <td class="border-l border-accent/20"></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                </div>

                {{-- Attachment --}}
                <div>
                    <div class="flex items-center gap-3 mb-4">
                        <div class="bg-info/20 p-1.5 rounded-lg text-info">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                        </div>

                        <h2 class="text-base font-bold text-info uppercase tracking-widest">
                            Attachment
                        </h2>
                    </div>

                    <div
                        class="bg-info/5 rounded-xl border-2 border-info/30 border-dashed p-6 transition-all hover:bg-info/10">
                        <div class="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div class="bg-info/20 p-3 rounded-full text-info">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                </svg>
                            </div>

                            <div class="flex-1">
                                <p class="text-sm font-bold text-info-content mb-2">
                                    Upload Required Documents
                                </p>

                                <input id="attachfile" name="attachfile" type="file" multiple
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    class="file-input file-input-bordered file-input-info file-input-sm w-full max-w-sm bg-white" />

                                <p class="text-xs text-base-content/50 mt-2">
                                    Accepted formats: PDF, JPG, PNG
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="divider before:bg-base-300 after:bg-base-300"></div>

                <div id="actionform"></div>
                </form>
            </div>
        </div>
    </div>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/create.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
