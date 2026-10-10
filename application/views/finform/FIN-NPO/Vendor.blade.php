@extends('layouts/webflowTemplate')

@section('styles')
<style>
    #vendorTable thead th {
        background: #dcfce7;
        color: #166534;
        font-weight: 800;
        text-align: center;
        white-space: nowrap;
    }

    #vendorTable th,
    #vendorTable td {
        border: 1px solid #cbd5e1;
        vertical-align: middle;
    }
</style>
@endsection

@section('contents')
<main class="min-h-screen bg-base-200/40 px-4 py-6">
    <div class="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <div class="card border border-base-300 bg-base-100 shadow-sm">
            <div class="card-body flex-row items-center justify-between p-5 md:p-6">
                <div>
                    <h1 class="text-2xl font-bold text-primary">FIN-NPO Vendor Master</h1>
                    <p class="text-sm text-base-content/60">Manage vendor data used by FIN-NPO forms</p>
                </div>
                <button type="button" id="addVendor" class="btn btn-success">+ Add Vendor</button>
            </div>
        </div>

        <div class="card border border-base-300 bg-base-100 shadow-sm">
            <div class="card-body p-5 md:p-6">
                <div class="overflow-x-auto">
                    <table id="vendorTable" class="table table-zebra w-full text-sm"></table>
                </div>
            </div>
        </div>
    </div>
</main>

<dialog id="vendorModal" class="modal">
    <div class="modal-box max-w-xl">
        <form method="dialog">
            <button type="submit" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" aria-label="Close">✕</button>
        </form>
        <h2 id="vendorModalTitle" class="mb-5 text-xl font-bold">Add Vendor</h2>

        <form id="vendorForm" class="space-y-4">
            <input type="hidden" id="ORIGINAL_VENDOR_CODE">
            <input type="hidden" id="ORIGINAL_VENDOR_NAME">

            <label class="form-control w-full">
                <span class="label-text mb-2 font-bold">Vendor Code <span class="text-error">*</span></span>
                <input type="text" id="VENDOR_CODE" maxlength="50" required
                    class="input input-bordered w-full" autocomplete="off">
            </label>

            <label class="form-control w-full">
                <span class="label-text mb-2 font-bold">Vendor Name <span class="text-error">*</span></span>
                <input type="text" id="VENDOR_NAME" maxlength="255" required
                    class="input input-bordered w-full" autocomplete="off">
            </label>

            <label class="form-control w-full">
                <span class="label-text mb-2 font-bold">Status</span>
                <select id="ACTIVE" class="select select-bordered w-full">
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                </select>
            </label>

            <div class="modal-action">
                <button type="button" id="cancelVendor" class="btn">Cancel</button>
                <button type="submit" id="saveVendor" class="btn btn-success">Save</button>
            </div>
        </form>
    </div>
    <form method="dialog" class="modal-backdrop"><button type="submit">close</button></form>
</dialog>

<dialog id="deleteVendorModal" class="modal">
    <div class="modal-box max-w-md text-center">
        <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error/15 text-3xl text-error">!</div>
        <h2 class="text-xl font-bold">Confirm Delete</h2>
        <p class="mt-2 text-base-content/70">Are you sure you want to delete this vendor?</p>
        <p id="deleteVendorName" class="mt-3 break-words font-bold text-error"></p>

        <div class="modal-action justify-center">
            <button type="button" id="cancelDeleteVendor" class="btn">Cancel</button>
            <button type="button" id="confirmDeleteVendor" class="btn btn-error">Delete</button>
        </div>
    </div>
    <form method="dialog" class="modal-backdrop"><button type="submit">close</button></form>
</dialog>
@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/finNpoVendor.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
