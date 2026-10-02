@extends('layouts/webflowTemplate')
@section('contents')
    <div class="mx-auto w-full space-y-5">
        <header class="border-b border-base-300 pb-5">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div class="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
                        <span class="h-2 w-2 rounded-full bg-primary"></span>
                        PS / Warehouse Inventory
                    </div>
                    <h1 class="text-2xl font-bold leading-tight text-base-content sm:text-3xl">
                        Parts and Materials Borrowing Requisition Form
                    </h1>
                    <p class="mt-2 text-sm text-base-content/60">Submitted requisition details.</p>
                </div>
                <div class="self-start rounded-md border border-base-300 bg-base-200 px-3 py-2 text-xs font-medium text-base-content/70 sm:self-auto">
                    Requisition details
                </div>
            </div>
        </header>

        <div id="formDetail"></div>

        {{-- <section class="card overflow-hidden border border-base-300 bg-base-100 shadow-sm">
            <div class="border-b border-base-300 bg-base-200/60 px-5 py-4 sm:px-6">
                <div class="flex items-center gap-3">
                    <span class="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-content">1</span>
                    <div>
                        <h2 class="text-base font-semibold text-base-content">Request Information</h2>
                        <p class="text-xs text-base-content/60">Requester details for this requisition.</p>
                    </div>
                </div>
            </div>
            <div class="card-body grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6" id="formDetail">
                <div class="rounded-md border border-base-300 p-4">
                    <p class="text-xs font-medium uppercase tracking-wide text-base-content/60">Input By</p>
                    <p id="inputByValue" class="mt-1 font-semibold text-base-content">—</p>
                </div>
                <div class="rounded-md border border-base-300 p-4">
                    <p class="text-xs font-medium uppercase tracking-wide text-base-content/60">Request By</p>
                    <p id="requestByValue" class="mt-1 font-semibold text-base-content">—</p>
                </div>
            </div>
        </section> --}}

        <section class="card overflow-hidden border border-base-300 bg-base-100 shadow-sm">
            <div class="border-b border-base-300 bg-base-200/60 px-5 py-4 sm:px-6">
                <div class="flex items-center gap-3">
                    <span class="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-content"><i class="fi fi-rr-list"></i></span>
                    <div>
                        <h2 class="text-base font-semibold text-base-content">Parts and Materials</h2>
                        <p class="text-xs text-base-content/60">Items included in this borrowing request.</p>
                    </div>
                </div>
            </div>
            <div class="card-body gap-4 p-5 sm:p-6">
                <table class="table table-zebra table-sm min-w-300" id="partTable">
                    <thead>
                        <tr class="bg-base-200">
                            <th class="w-14">No.</th>
                            <th>PUR Code</th>
                            <th>Description</th>
                            <th>Drawing</th>
                            <th>Address</th>
                            <th>WHI User</th>
                            <th>Quantity</th>
                            <th>Production</th>
                            <th>Issue to</th>
                            <th>Reason for borrowing</th>
                            <th>Reason Detail</th>
                            <th>Return Date</th>
                        </tr>
                    </thead>
                    {{-- <tbody id="partTableBody">
                            <tr>
                                <td colspan="11" class="py-8 text-center text-base-content/50">Loading items...</td>
                            </tr>
                        </tbody> --}}
                </table>
                <div class="text-sm text-base-content/60">
                    Total: <span id="partRowCount" class="font-semibold text-base-content">0</span> item(s)
                </div>
            </div>
        </section>
    </div>
    <div class="form-group mt-5 mx-auto min-w-xs hidden" id="worker-form">
        <label for="workerSelect" class="block text-sm font-medium text-base-content mb-2">Worker</label>
        <select id="workerSelect" class="select select-bordered w-full">
            <option value="">Select a worker</option>
        </select>
    </div>
    <div class="action-form">

    </div>
    <div class="flow mt-5"></div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/psUpiView.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
