@extends('layouts/webflowTemplate')
@section('contents')
    <div class="container mx-auto p-6">
        <div class="form-data" data-nfrmno="{{ $_GET['no'] }}" data-vorgno="{{ $_GET['orgNo'] }}" data-cyear="{{ $_GET['y'] }}" data-cyear2="{{ $_GET['y2'] }}" data-nrunno="{{ $_GET['runNo'] }}" data-empno="{{ $_GET['empno'] }}"></div>
        <div class="card bg-white shadow-xl rounded-2xl">
            <div class="card-body">
                <!-- Header -->
                <div class="mb-8">
                    <div class="border-b-2 border-primary pb-4">
                        <div class="flex items-center justify-between mb-3">
                            <div>
                                <h2 class="text-2xl font-bold text-gray-800">Form : Set New Address / Change Address / Change User</h2>
                                <p class="text-sm text-gray-500 mt-1">Warehouse Report Request</p>
                            </div>
                            <div class="text-right">
                                <p class="text-xs text-gray-500">Date</p>
                                <p id="form-date" class="text-lg font-semibold text-gray-700">-</p>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-4 mt-4">
                            <div class="flex items-center gap-2">
                                <span class="text-sm font-medium text-gray-600">Person in Charge:</span>
                                <span id="person-in-charge" class="text-sm text-gray-800 font-semibold">-</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="text-sm font-medium text-gray-600">Type:</span>
                                <span id="form-type" class="badge badge-lg">-</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Table Section -->
                <div class="overflow-x-auto">
                    <table class="table table-zebra w-full" id="table-detail">
                        <thead class="bg-gray-100">
                            <tr class="text-center">
                                <th rowspan="2" class="border border-gray-300">No.</th>
                                <th rowspan="2" class="border border-gray-300">Item No.</th>
                                <th rowspan="2" class="border border-gray-300">Drawing</th>
                                <th rowspan="2" class="border border-gray-300">Description</th>
                                <th rowspan="2" class="border border-gray-300">Old Address</th>
                                <th rowspan="2" class="border border-gray-300">Old User</th>
                                <th rowspan="2" class="border border-gray-300">New Address</th>
                                <th rowspan="2" class="border border-gray-300">New User</th>
                                <th rowspan="2" class="border border-gray-300">Issue To</th>
                                <th rowspan="2" class="border border-gray-300">Reason</th>
                                <th colspan="2" class="border border-gray-300">J-Staff Confirm</th>
                            </tr>
                            <tr class="text-center">
                                <th class="border border-gray-300">Bulk</th>
                                <th class="border border-gray-300">Stock</th>
                            </tr>
                        </thead>
                        <tbody>

                        </tbody>
                    </table>
                </div>

                <!-- Action -->
                <!-- <div class="mt-6 text-right">
                                <button class="btn btn-primary">Submit Report</button>
                            </div> -->
            </div>
            <div class="flex items-center justify-center gap-3 mb-3">
                <button class="btn btn-success" >Approve</button>
                <button class="btn btn-error">Reject</button>
            </div>
            <div class="flow mb-5"></div>
        </div>

    </div>

@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/psSar.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection