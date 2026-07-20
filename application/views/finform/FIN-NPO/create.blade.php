@extends('layouts/webflowTemplate')
@section('styles')
    <style>
        #stampTable tbody tr {
            height: 48px;
        }

        #stampTable {
            border-collapse: collapse !important;
            border: 2px solid #0a6619 !important;
        }

        #stampTable th,
        #stampTable tbody td {
            border: 1px solid #09643a !important;
            padding: 10px 12px !important;
            vertical-align: middle;
            text-align: center;
        }

        #stampTable tbody input,
        #stampTable tbody select,
        #stampTable tbody textarea {
            min-height: 38px;
            padding: 6px 10px;
        }

        .fin-ds-accessible {
            background: #ffffff !important;
            color: #172033;
        }

        .fin-ds-accessible > div > .card:first-child {
            background: linear-gradient(90deg, #dbeafe 0%, #ffffff 72%) !important;
            border-left-color: #1d4ed8 !important;
        }

        .fin-ds-accessible .card {
            background-color: #ffffff !important;
            border-color: #94a3b8 !important;
        }

        .fin-ds-accessible [class*="bg-base-200"] {
            background-color: #ffffff !important;
        }

        .fin-ds-accessible h1 {
            color: #0f172a !important;
        }

        .fin-ds-accessible h2,
        .fin-ds-accessible .label-text {
            color: #1e293b !important;
        }

        .fin-ds-accessible [class*="bg-primary/5"] {
            background: #dbeafe !important;
            border-color: #3b82f6 !important;
            border-left: 5px solid #1d4ed8 !important;
        }

        .fin-ds-accessible [class*="bg-secondary/5"] {
            background: #ede9fe !important;
            border-color: #8b5cf6 !important;
            border-left: 5px solid #6d28d9 !important;
        }

        .fin-ds-accessible [class*="border-accent/30"] {
            border-color: #059669 !important;
            border-left: 5px solid #047857 !important;
        }

        .fin-ds-accessible [class*="bg-info/5"] {
            background: #cffafe !important;
            border-color: #0891b2 !important;
        }

        .fin-ds-accessible input:not([type="radio"]),
        .fin-ds-accessible select,
        .fin-ds-accessible textarea,
        .fin-ds-accessible .file-input {
            background-color: #ffffff !important;
            border-color: #64748b !important;
            color: #0f172a !important;
            border-width: 2px !important;
        }

        .fin-ds-accessible input[readonly],
        .fin-ds-accessible input:disabled {
            background-color: #ffffff !important;
            color: #334155 !important;
        }

        .fin-ds-accessible input:focus,
        .fin-ds-accessible select:focus,
        .fin-ds-accessible textarea:focus {
            border-color: #1d4ed8 !important;
            outline: 3px solid rgba(29, 78, 216, 0.28) !important;
            outline-offset: 1px;
        }

        .fin-ds-accessible #stampTable thead tr {
            background: #239400 !important;
            color: #ffffff !important;
        }

        .fin-ds-accessible #stampTable th,
        .fin-ds-accessible #stampTable td {
            border: 1px solid #022502 !important;
        }
    </style>
@endsection
@section('contents')
    <div class="fin-ds-accessible min-h-screen bg-base-200/80 py-8 px-4 font-sans flex flex-col items-center">
        <div class="max-w-5xl w-full mx-auto">

            <div
                class="card bg-linear-to-r from-primary/10 via-base-100 to-base-100 shadow-md border-l-4 border-primary rounded-2xl mb-5">
                <div class="card-body px-8 py-5">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div class="flex items-center gap-4">
                            <div class="bg-primary text-primary-content rounded-xl p-3 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="grey" viewBox="0 0 24 24"
                                    stroke="white" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25z" />
                                </svg>
                            </div>
                            <div>
                                <h1 class="text-2xl font-extrabold text-base-content tracking-tight">Non-Po expense Requestition Form
                                </h1>
                                <p class="text-sm text-primary font-medium mt-0.5">แบบฟอร์มขอเบิกค่าใช้จ่ายที่ไม่เกี่ยวข้องกับใบสั่งซื้อ</p>
                            </div>
                        </div>
                        {{-- <span class="badge badge-primary badge-lg font-bold px-5 py-4 text-sm shadow-sm"
                            id="Pos"></span> --}}
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
                                    <div class="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-x-2 gap-y-2">
                                        <label class="label p-0">
                                            <span class="label-text font-bold text-base-content/80 text-sm">Input By</span>
                                        </label>
                                        {{-- <input id="INPUTBY" type="text" name="INPUTBY" value="" readonly --}}
                                        <input id="INPUTBY" type="text" name="INPUTBY" value="" 
                                            class="input input-sm input-bordered w-full min-w-0 border-base-300 bg-base-200/80 text-error cursor-not-allowed font-semibold focus:outline-none" />
                                    </div>
                                    <div class="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-x-2 gap-y-2">
                                        <label class="label p-0">
                                            <span class="label-text font-bold text-base-content/80 text-sm">Name</span>
                                        </label>
                                        <p id="INPUTBY_NAME"
                                            class="inputby-feedback hidden items-center gap-2 border-l-2 border-error/40 pl-2 text-sm font-bold text-error">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0 opacity-70"
                                                viewBox="0 0 20 20" fill="currentColor">
                                                <path
                                                    d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493A7 7 0 0110 10a7 7 0 016.535 4.493A1.5 1.5 0 0115.13 16.5H4.87a1.5 1.5 0 01-1.405-2.007z" />
                                            </svg>
                                            <span class="emp-name"></span>
                                        </p>

                                    </div>

                                </div>

                                 {{-- Request name --}}
                                
                                 <div class="grid grid-cols-1 md:grid-cols-2 gap-5">   
                                    <div class="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-x-2 gap-y-2">
                                        <label class="label p-0">
                                            <span class="label-text font-bold text-base-content/80 text-sm">Requester By</span>
                                        </label>
                                        <input id="REQBY" type="text" name="REQBY" value=""
                                            class="input input-sm input-bordered w-full min-w-0 border-base-300 bg-base-200/80 text-error font-semibold focus:outline-none req" />

                                    </div>
                                        <div class="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-x-2 gap-y-2">

                                        <label class="label p-0">
                                            <span class="label-text font-bold text-base-content/80 text-sm">Name</span>
                                        </label>
                                        <p id="REQBY_NAME"
                                            class="reqby-feedback hidden items-center gap-2 border-l-2 border-error/40 pl-2 text-sm font-bold text-error">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0 opacity-70"
                                                viewBox="0 0 20 20" fill="currentColor">
                                                <path
                                                    d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493A7 7 0 0110 10a7 7 0 016.535 4.493A1.5 1.5 0 0115.13 16.5H4.87a1.5 1.5 0 01-1.405-2.007z" />
                                            </svg>
                                            <span class="emp-name"></span>
                                        </p>

                                    </div>
                                </div>


                                <div class="form-control">
                                    <div class="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-x-2 gap-y-2">
                                        <label class="label pb-1">
                                        <span class=" w-2.5 label-text font-bold text-base-content/80 text-sm ">Subject  </span>
                                        </label>
                                    </div>
                                    
                                    <input id="SUBJECT" type="text" name="SUBJECT" value=""
                                        class="input input-sm input-bordered w-full border-base-300 bg-base-200/80  text-base-content font-medium focus:outline-none req" />
                                </div>
                            </div>
                        </div>

                            {{-- Expense Detail --}}

                        <div>
                            <div class="flex items-center gap-3 mb-4">
                                <div class="bg-secondary/20 p-1.5 rounded-lg text-secondary">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h2 class="text-base font-bold text-secondary uppercase tracking-widest">Expense Details
                                </h2>
                            </div>


         <div class="bg-secondary/5 rounded-xl border border-secondary/20 p-5 shadow-sm space-y-4">

                <div class="mb-6">
                    <div class="border border-base-300 p-4 rounded-lg bg-base-200/30 space-y-4" >
                        <div class="font-bold text-primary mb-6 text-sm flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                            ประเภทค่าใช้จ่าย / Expense type
                        </div>
                        <div id="purposeList" class="flex flex-col gap-3">
                        </div>
                    </div>
                </div>
            </div>
          {{-- TEST  ทำเมื่อมีการ เลือก Select 2 Travel abord แล้วโชช่องกรอก User--}}
<div class=" p-4 rounded-lg bg- base-200/30space-y-4" ></div>



   {{-- for select Traveling abord in Expense Type --}}
                            <div id="airFreightSalesEmployeeSection"
                                class="hidden bg-secondary/5 rounded-xl border border-secondary/20 p-5 shadow-sm space-y-4 mb-4">
         <div class="rounded-xl border border-secondary/20  bg-white p-5 shadow-sm space-y-4">
                <h2 class="text-base font-bold text-secondary uppercase tracking-widest">List of Empolyee that Traveling Abroad / รายชื่อพนักงานการเดินทางไปต่างประเทศ   
            </h2> 
         </div>                                
        <button type="button" id="addAirSalesEmployeeRow" class="btn btn-sm btn-success float-right ml-auto gap-1">
                                    <span class="text-lg leading-none">+</span>
                                    Add Row
                                </button>
                                <div class="clear-both"></div>
                                <div id="airSalesEmployeeRows" class="space-y-3">

                                   <div class="air-sales-employee-row grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div class="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-x-2 gap-y-2">
                                        <label class="label p-0">
                                            <span class="label-text font-bold text-base-content/80 text-sm">Empolyee Code</span>
                                        </label>
<input type="text" name="AIR_SALES_BY[]" value=""
                                            class="air-sales-by input input-sm input-bordered w-full min-w-0 border-base-300 bg-base-200/80 text-error font-semibold focus:outline-none" />
                                    </div>
                                    <div class="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-x-2 gap-y-2">
                                        <label class="label p-0">
                                            <span class="label-text font-bold text-base-content/80 text-sm">Name</span>
                                        </label>
                                        <p id="AIR_SALES_NAME"
                                            class="air-sales-feedback hidden items-center gap-2 border-l-2 border-error/40 pl-2 text-sm font-bold text-error">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0 opacity-70"
                                                viewBox="0 0 20 20" fill="currentColor">
                                                <path
                                                    d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493A7 7 0 0110 10a7 7 0 016.535 4.493A1.5 1.5 0 0115.13 16.5H4.87a1.5 1.5 0 01-1.405-2.007z" />
                                            </svg>
                                            <span class="emp-name"></span>
                                        </p>
                                    </div>
                                </div>
            </div>                
             {{-- </div> --}}

             
            {{-- TEST --}} 
                        </div>
                        </div>
                        {{-- End for select Traveling abord in Expense Type --}}
                        <div>
                            <div class="bg-accent/5 rounded-xl border border-accent/30 p-5 shadow-sm space-y-3 mb-4">
                                <div class="grid grid-cols-1 md:grid-cols-[12rem_minmax(0,1fr)] items-center gap-3">
                                    <label class="label p-0" for="VENDOR_CODE">
                                        <span class="label-text font-bold text-base-content/80 text-sm">
                                            Vendor / Supplier
                                        </span>
                                    </label>
                                    <select id="VENDOR_CODE" name="VENDOR_CODE"
                                        class="select select-sm select-bordered w-full bg-white border-base-300 req">
                                        <option value="">Loading vendor...</option>
                                    </select>
                                </div>
                            </div>
                            {{-- เพิ่มปุ่ม Add Row ก่อนตาราง --}}
                            <div class="flex items-center gap-3 mb-4">
                                <div class="bg-accent/20 p-1.5 rounded-lg text-accent-focus"> ... </div>
                                <h2 class="text-base font-bold text-accent-focus uppercase tracking-widest">Purpose &amp;
                                    Vendor / Supplier name</h2>
                                {{-- ปุ่ม Add Row --}}
                                <button type="button" id="addStampRow" class="btn btn-sm btn-accent ml-auto gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Invoice
                                </button>
                            </div>

                            <div>
                                <div class="overflow-x-auto">
                                    <table id="stampTable" class="table table-xs w-full text-center">

                                        <tbody></tbody> {{-- เริ่มว่าง DataTable จัดการ --}}
                                        <tfoot>
                                            <tr class="bg-accent/10 font-bold text-accent-content">
                                                <td colspan="9"
                                                    class="pr-4 border-r border-accent/20 text-sm py-3 uppercase tracking-wide">
                                                    For Test table
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
    <script src="{{ $_ENV['APP_JS'] }}/finNpoCreate.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
