@extends('layouts/webflowTemplate')

@section('styles')
<style>
    #reportTable .fin-npo-status {
        font-weight: 700;
        white-space: nowrap;
    }

    #reportTable .fin-npo-status-not-approved {
        color: #dc2626;
    }

    #reportTable .fin-npo-status-approved {
        color: #111827;
    }

    #reportTable thead th {
        background: #fde9a9;
        color: #9a4b00;
        font-weight: 800;
        text-align: center;
        white-space: nowrap;
    }

    #reportTable th,
    #reportTable td {
        border: 1px solid #cbd5e1;
    }
</style>
@endsection

@section('contents')
<main class="min-h-screen bg-base-200/40 px-4 py-6">
    <div class="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <div class="card border border-base-300 bg-base-100 shadow-sm">
            <div class="card-body p-5 md:p-6">
                <h1 class="text-2xl font-bold text-primary">FIN-NPO Report</h1>
                <p class="text-sm text-base-content/60">Non Purchase Order Payment report</p>
            </div>
        </div>

        <div class="card border border-base-300 bg-base-100 shadow-sm">
            <div class="card-body gap-6 p-5 md:p-6">
                <h2 class="text-sm font-bold uppercase tracking-widest text-primary">Search Data</h2>

                <form id="reportSearchForm" class="rounded-box border border-base-300 bg-base-200/40 p-4 md:p-6">
                    <div class="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                        <fieldset>
                            <legend class="mb-2 text-sm font-bold">Form Date</legend>
                            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <input type="text" id="formDateFrom" class="input input-bordered w-full bg-base-100" placeholder="From Date" autocomplete="off">
                                <input type="text" id="formDateTo" class="input input-bordered w-full bg-base-100" placeholder="To Date" autocomplete="off">
                            </div>
                        </fieldset>

                        <fieldset>
                            <legend class="mb-2 text-sm font-bold">Invoice Date</legend>
                            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <input type="text" id="invoiceDateFrom" class="input input-bordered w-full bg-base-100" placeholder="From Date" autocomplete="off">
                                <input type="text" id="invoiceDateTo" class="input input-bordered w-full bg-base-100" placeholder="To Date" autocomplete="off">
                            </div>
                        </fieldset>

                        <label class="form-control w-full">
                            <span class="label-text mb-2 text-sm font-bold">Expense Type</span>
                            <select id="expenseType" class="select select-bordered w-full bg-base-100">
                                <option value="">All expense types</option>
                            </select>
                        </label>

                        <label class="form-control w-full">
                            <span class="label-text mb-2 text-sm font-bold">Vendor</span>
                            <select id="vendor" class="select select-bordered w-full bg-base-100">
                                <option value="">All vendors</option>
                            </select>
                        </label>

                        <label class="form-control w-full lg:col-span-2">
                            <span class="label-text mb-2 text-sm font-bold">Cost Center</span>
                            <input type="text" id="costCenter" class="input input-bordered w-full bg-base-100" placeholder="All cost centers" autocomplete="off">
                        </label>
                    </div>

                    <div class="mt-6 flex flex-wrap gap-3 border-t border-base-300 pt-5">
                        <button type="submit" id="btnSearch" class="btn btn-info min-w-32">Search</button>
                        <button type="button" id="btnReset" class="btn btn-warning btn-outline min-w-32">Reset Data</button>
                        <button type="button" id="btnExport" class="btn btn-success btn-outline min-w-32">Export Data</button>
                    </div>
                </form>

                <div class="overflow-x-auto">
                    {{-- min-w-[1500px] --}}
                    <table id="reportTable" class="table table-zebra w-full min-w-[1350px] text-sm"></table>
                </div>
            </div>
        </div>
    </div>
</main>
@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/finNpoReport.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
