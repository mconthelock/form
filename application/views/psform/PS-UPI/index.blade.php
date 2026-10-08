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
                    <p class="mt-2 text-sm text-base-content/60">
                        Record the requester details and materials required for temporary borrowing.
                    </p>
                </div>
                <div class="flex items-center gap-2 self-start sm:self-auto">
                    {{-- <a href="{{ base_url('psform/PS-UPI/main/report') }}" class="btn btn-outline btn-sm">View report</a> --}}
                    <div class="rounded-md border border-base-300 bg-base-200 px-3 py-2 text-xs font-medium text-base-content/70">
                        New requisition
                    </div>
                </div>
            </div>
        </header>

        <div class="card overflow-hidden border border-base-300 bg-base-100 shadow-sm">
            <div class="border-b border-base-300 bg-base-200/60 px-5 py-4 sm:px-6">
                <div class="flex items-center gap-3">
                    <span class="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-content">1</span>
                    <div>
                        <h2 class="text-base font-semibold text-base-content">Request Information</h2>
                        <p class="text-xs text-base-content/60">Identify the requester and requisition date.</p>
                    </div>
                </div>
            </div>
            <div class="card-body p-5 sm:p-6">

                <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <!-- Input By -->
                    <div class="form-control">
                        <label class="label">
                            <span class="label-text font-medium">
                                Input By <span class="text-error">*</span>
                            </span>
                        </label>

                        {{-- <input type="text" id="inputBy" name="inputBy" class="input input-bordered w-full" placeholder="Employee code / Name" /> --}}
                        <p class="mt-3" id="DisplayInputBy"></p>
                    </div>

                    <!-- Request By -->
                    <div class="form-control">
                        <label class="label">
                            <span class="label-text font-medium">
                                Request By <span class="text-error">*</span>
                            </span>
                        </label>

                        <input type="text" id="requestBy" name="requestBy" class="input input-bordered w-full" placeholder="Employee code / Name" />
                        <p class="text-base-content/60 mt-1" id="DisplayRequestBy"></p>
                    </div>


                </div>
            </div>
        </div>
        <div class="card overflow-hidden border border-base-300 bg-base-100 shadow-sm">
            <div class="border-b border-base-300 bg-base-200/60 px-5 py-4 sm:px-6">
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div class="flex items-center gap-3">
                        <span class="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-content">2</span>
                        <div>
                            <h2 class="text-base font-semibold text-base-content">Parts and Materials</h2>
                            <p class="text-xs text-base-content/60">Add every item included in this borrowing request.</p>
                        </div>
                    </div>
                    <button type="button" id="btnAddPart" class="btn btn-primary btn-sm gap-2 self-start sm:self-auto">
                        <span class="text-base leading-none">+</span>
                        Add item
                    </button>
                </div>
            </div>
            <div class="card-body gap-4 p-5 sm:p-6">

                <div class="overflow-x-auto rounded-md border border-base-300">

                    <table id="partTable" class="table table-zebra table-sm min-w-375 whitespace-nowrap">

                        <thead>
                            <tr class="bg-base-200">
                                <th class="w-14">No.</th>
                                <th class="w-52">PUR Code</th>
                                <th class="w-56">Description</th>
                                <th class="w-40">Drawing</th>
                                <th class="w-40">Address</th>
                                <th class="w-44">WHI User</th>
                                <th class="w-32">Quantity</th>
                                <th class="w-40">Production</th>
                                <th class="w-40">Issue to</th>
                                <th class="w-64">Reason for borrowing</th>
                                <th class="w-44">Return Date</th>
                                <th class="w-16">Action</th>
                            </tr>
                        </thead>

                        <tbody id="partTableBody"></tbody>

                    </table>
                </div>

                <div class="flex flex-col gap-1 text-sm text-base-content/60 sm:flex-row sm:items-center sm:justify-between">
                    <span>Total: <span id="partRowCount" class="font-semibold text-base-content">0</span> item(s)</span>
                    <span>Use Add item to include additional materials.</span>
                </div>

                <!-- Row template for dynamic rows -->
                <template id="rowTemplate">
                    <tr>
                        <!-- No -->
                        <td class="row-no text-center"></td>

                        <!-- PUR Code -->
                        <td>
                            <input type="text" class="input input-bordered input-sm w-full part-purcode" placeholder="PUR Code" />
                        </td>

                        <!-- Description -->
                        <td>
                            <input type="text" class="input input-bordered input-sm w-full bg-base-200 part-desc" value="-" readonly />
                        </td>

                        <!-- Drawing -->
                        <td>
                            <input type="text" class="input input-bordered input-sm w-full bg-base-200 part-drawing" value="-" readonly />
                        </td>

                        <!-- Address -->
                        <td><input type="text" class="input input-bordered input-sm w-full bg-base-200 part-address" value="-" readonly /></td>

                        <!-- WHI User -->
                        <td><input type="text" class="input input-bordered input-sm w-full bg-base-200 part-whi" value="-" readonly /></td>

                        <!-- Quantity -->
                        <td><input type="number" min="1" class="input input-bordered input-sm w-full part-qty" placeholder="Qty" /></td>

                        <!-- Production -->
                        <td><input type="text" class="input input-bordered input-sm w-full part-production" placeholder="Production" /></td>

                        <!-- Issue to -->
                        <td><input type="text" class="input input-bordered input-sm w-full part-issueto" placeholder="Issue to" /></td>

                        <!-- Reason -->
                        <td>
                            <div class="flex flex-col gap-2">
                                <select class="select select-bordered select-sm w-full part-reason">
                                </select>
                                <input type="text" class="input input-bordered input-sm w-full reason-detail hidden" />
                            </div>
                        </td>

                        <!-- Return Date -->
                        <td><input type="date" class="input input-bordered input-sm w-full part-returndate" placeholder="Select Date" /></td>

                        <!-- Action -->
                        <td>
                            <button type="button" class="btn btn-ghost btn-sm text-error btn-remove-row" title="Remove"><i class="fi fi-rr-trash"></i></button>
                        </td>
                    </tr>
                </template>
            </div>
        </div>

        <section class="card overflow-hidden border border-base-300 bg-base-100 shadow-sm">
            <div class="border-b border-base-300 bg-base-200/60 px-5 py-4 sm:px-6">
                <div class="flex items-center gap-3">
                    <span class="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-content">
                        <i class="fi fi-rr-clip"></i>
                    </span>
                    <div>
                        <h2 class="text-base font-semibold text-base-content">Attachments</h2>
                        <p class="text-xs text-base-content/60">Attach supporting files to this borrowing request.</p>
                    </div>
                </div>
            </div>
            <div class="card-body gap-3 p-5 sm:p-6">
                <div class="form-control max-w-xl">
                    <label for="attachmentInput" class="label">
                        <span class="label-text font-medium">Select file(s)</span>
                    </label>
                    <input type="file" id="attachmentInput" name="attachments[]" multiple
                        class="file-input file-input-bordered file-input-sm w-full">
                    <ul id="selectedAttachmentList" class="mt-2 space-y-1 text-sm text-base-content/70" aria-live="polite"></ul>
                </div>
            </div>
        </section>

        <div class="flex justify-end">
            <button type="button" id="btnSubmit" class="btn btn-primary gap-2">
                <i class="fi fi-rr-paper-plane"></i>
                Submit form
            </button>
        </div>
    </div>
@endsection
@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/psUpi.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
