@extends('layouts/webflowTemplate')
@section('contents')
    <div class="mx-auto w-full space-y-5">

        {{-- Page header --}}
        <header class="flex flex-col gap-1 border-b border-base-300 pb-4">
            <p class="text-sm text-base-content/60">PS / Warehouse Inventory</p>
            <h1 class="text-2xl font-bold leading-tight text-base-content sm:text-3xl">
                Parts and Materials Borrowing Requisition Form
            </h1>
        </header>

        {{-- Requisition details (rendered by psUpiView.js) --}}
        <div id="formDetail"></div>

        {{-- Parts and materials --}}
        <section class="card overflow-hidden border border-base-300 bg-base-100 shadow-sm">
            <div class="flex items-center justify-between gap-3 border-b border-base-300 bg-base-200/60 px-5 py-4 sm:px-6">
                <div class="flex items-center gap-3">
                    <span class="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-content">
                        <i class="fi fi-rr-list"></i>
                    </span>
                    <div>
                        <h2 class="text-base font-semibold text-base-content">Parts and Materials</h2>
                        <p class="text-xs text-base-content/60">Items included in this borrowing request.</p>
                    </div>
                </div>
                <div class="badge badge-outline badge-lg gap-1 whitespace-nowrap">
                    <span id="partRowCount" class="font-semibold">0</span>
                    <span class="text-base-content/70">item(s)</span>
                </div>
            </div>
            <div class="card-body p-0">
                <div class="overflow-x-auto p-4 sm:p-5">
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
                    </table>
                </div>
            </div>
        </section>

        {{-- Attachments --}}
        <section class="card overflow-hidden border border-base-300 bg-base-100 shadow-sm">
            <div class="flex items-center gap-3 border-b border-base-300 bg-base-200/60 px-5 py-4 sm:px-6">
                <span class="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-content">
                    <i class="fi fi-rr-clip"></i>
                </span>
                <div>
                    <h2 class="text-base font-semibold text-base-content">Attachments</h2>
                    <p class="text-xs text-base-content/60">Files uploaded for this requisition.</p>
                </div>
            </div>
            <div class="card-body gap-5 p-5 sm:p-6">
                <div class="overflow-x-auto rounded-md border border-base-300">
                    <table class="table table-zebra table-sm">
                        <thead>
                            <tr class="bg-base-200">
                                <th>File Name</th>
                                <th class="w-32 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody id="uploaded-files-list">
                            <tr>
                                <td colspan="2" class="py-6 text-center text-base-content/50">Loading files...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="form-group max-w-md">
                    <label for="fileInput" class="mb-1 block text-sm font-medium text-base-content">Upload a file</label>
                    <input type="file" id="fileInput" name="file"
                        class="file-input file-input-bordered file-input-sm w-full">
                </div>
            </div>
        </section>

        {{-- Worker selection (shown by JS when needed) --}}
        <div class="form-group hidden max-w-md" id="worker-form">
            <label for="workerSelect" class="mb-1 block text-sm font-medium text-base-content">Worker</label>
            <select id="workerSelect" class="select select-bordered w-full">
                <option value="">Select a worker</option>
            </select>
        </div>

        {{-- Approve / reject actions and approval flow (rendered by psUpiView.js) --}}
        <div class="action-form"></div>
        <div class="flow"></div>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/psUpiView.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection