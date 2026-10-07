@extends('layouts/webflowTemplate')

@section('contents')
    <div class="mx-auto w-full max-w-screen-2xl space-y-5">
        <header class="border-b border-base-300 pb-5">
            <div class="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
                <span class="h-2 w-2 rounded-full bg-primary"></span>
                PS / Warehouse Inventory
            </div>
            <h1 class="text-2xl font-bold leading-tight text-base-content sm:text-3xl">
                Parts and Materials Borrowing Requisition Report
            </h1>
            <p class="mt-2 text-sm text-base-content/60">Search requisitions and review their approval status and borrowed parts.</p>
        </header>

        <section class="card overflow-hidden border border-base-300 bg-base-100 shadow-sm">
            <div class="border-b border-base-300 bg-base-200/60 px-5 py-4 sm:px-6">
                <h2 class="text-base font-semibold text-base-content">Select data</h2>
                <p class="text-xs text-base-content/60">Use one or more filters to find requisitions.</p>
            </div>
            <form id="upiReportForm" class="card-body grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4 sm:p-6">
                <div class="form-control">
                    <label class="label py-1" for="reportStatus"><span class="label-text font-medium">Status</span></label>
                    <select class="select select-bordered w-full" id="reportStatus" name="CST">
                        <option value="">All statuses</option>
                        <option value="1">On process</option>
                        <option value="2">Finished</option>
                    </select>
                </div>
                <div class="form-control">
                    <label class="label py-1" for="reportEmpNo"><span class="label-text font-medium">Requester Emp No.</span></label>
                    <input class="input input-bordered w-full" type="text" id="reportEmpNo" name="VREQNO" placeholder="Employee number">
                </div>
                {{-- <div class="form-control">
                    <label class="label py-1" for="reportSection"><span class="label-text font-medium">Section</span></label>
                    <input class="input input-bordered w-full" type="text" id="reportSection" name="SECTION" placeholder="Section code or name">
                </div> --}}
                <div class="form-control">
                    <label class="label py-1" for="reportRequestDate"><span class="label-text font-medium">Request date</span></label>
                    <input class="input input-bordered w-full" type="date" id="reportRequestDate" name="DREQDATE">
                </div>
                <div class="flex flex-wrap justify-end gap-2 sm:col-span-2 lg:col-span-4">
                    <button type="reset" id="resetUpiReport" class="btn btn-outline">Reset</button>
                    <button type="submit" id="searchUpiReport" class="btn btn-primary">
                        <i class="fi fi-rr-search"></i> Search
                    </button>
                </div>
            </form>
        </section>

        {{-- <section class="card overflow-hidden border border-base-300 bg-base-100 shadow-sm">
            <div class="flex flex-col gap-2 border-b border-base-300 bg-base-200/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                    <h2 class="text-base font-semibold text-base-content">Detail report</h2>
                    <p class="text-xs text-base-content/60">Expand a row to see Part Borrowing Details.</p>
                </div>
                <span id="upiReportSummary" class="text-sm font-medium text-base-content/70">Search to display report data.</span>
            </div>
            <div class="overflow-x-auto p-3">
                <table class="table table-zebra table-sm min-w-full whitespace-nowrap" id="ReportTable">
                    <thead>
                        <tr class="bg-base-200">
                            <th>Form No.</th>
                            <th>Request Date</th>
                            <th>Section Request</th>
                            <th>Requester</th>
                            <th>Status approve</th>
                            <th>Remark detail</th>
                        </tr>
                    </thead>
                    <tbody id="upiReportBody">
                        <tr><td colspan="6" class="py-8 text-center text-base-content/50">Search to display requisitions.</td></tr>
                    </tbody>
                </table>
            </div>
        </section> --}}
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/psUpiReport.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
