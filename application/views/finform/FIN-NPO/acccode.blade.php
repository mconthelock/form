@extends('layouts/webflowTemplate')

@section('styles')
<style>
    #expenseTable thead th {
        background: #dcfce7;
        color: #166534;
        font-weight: 800;
        text-align: center;
        white-space: nowrap;
    }

    #expenseTable th,
    #expenseTable td {
        border: 1px solid #cbd5e1;
        vertical-align: middle;
    }
</style>
@endsection

@section('contents')
<main class="min-h-screen bg-base-200/40 px-4 py-6">
    <div class="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <div class="card border border-base-300 bg-base-100 shadow-sm">
            <div class="card-body flex-row items-center justify-between p-5 md:p-6">
                <div>
                    <h1 class="text-2xl font-bold text-primary">FIN-NPO Expense Master</h1>
                    <p class="text-sm text-base-content/60">Manage account codes used by FIN-NPO forms</p>
                </div>
                <button type="button" id="addExpense" class="btn btn-success">+ Add Expense</button>
            </div>
        </div>

        <div class="card border border-base-300 bg-base-100 shadow-sm">
            <div class="card-body p-5 md:p-6">
                <div class="overflow-x-auto">
                    <table id="expenseTable" class="table table-zebra w-full text-sm"></table>
                </div>
            </div>
        </div>
    </div>
</main>

<dialog id="expenseModal" class="modal">
    <div class="modal-box max-w-2xl">
        <form method="dialog">
            <button type="submit" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" aria-label="Close">&times;</button>
        </form>
        <h2 id="expenseModalTitle" class="mb-5 text-xl font-bold">Add Expense</h2>

        <form id="expenseForm" class="space-y-4">
            <input type="hidden" id="ORIGINAL_EXPENSE_CODE">
            <input type="hidden" id="ORIGINAL_EXPENSE_ENAME">
            <input type="hidden" id="ORIGINAL_EXPENSE_TNAME">

            <label class="form-control w-full">
                <span class="label-text mb-2 font-bold">Expense Code <span class="text-error">*</span></span>
                <input type="text" id="EXPENSE_CODE" inputmode="numeric" pattern="[0-9]+" maxlength="20" required
                    class="input input-bordered w-full" autocomplete="off">
            </label>

            <label class="form-control w-full">
                <span class="label-text mb-2 font-bold">English Name <span class="text-error">*</span></span>
                <input type="text" id="EXPENSE_ENAME" maxlength="255" required
                    class="input input-bordered w-full" autocomplete="off">
            </label>

            <label class="form-control w-full">
                <span class="label-text mb-2 font-bold">Thai Name <span class="text-error">*</span></span>
                <input type="text" id="EXPENSE_TNAME" maxlength="255" required
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
                <button type="button" id="cancelExpense" class="btn">Cancel</button>
                <button type="submit" id="saveExpense" class="btn btn-success">Save</button>
            </div>
        </form>
    </div>
    <form method="dialog" class="modal-backdrop"><button type="submit">close</button></form>
</dialog>

<dialog id="deleteExpenseModal" class="modal">
    <div class="modal-box max-w-md text-center">
        <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error/15 text-3xl text-error">!</div>
        <h2 class="text-xl font-bold">Confirm Delete</h2>
        <p class="mt-2 text-base-content/70">Are you sure you want to delete this expense?</p>
        <p id="deleteExpenseName" class="mt-3 break-words font-bold text-error"></p>

        <div class="modal-action justify-center">
            <button type="button" id="cancelDeleteExpense" class="btn">Cancel</button>
            <button type="button" id="confirmDeleteExpense" class="btn btn-error">Delete</button>
        </div>
    </div>
    <form method="dialog" class="modal-backdrop"><button type="submit">close</button></form>
</dialog>
@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/finNpoAcccode.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
