@extends('layouts/webflowTemplate')
@section('contents')
    <div class="container mx-auto p-6">
        <div class="form-data" data-nfrmno="{{ $_GET['no'] }}" data-vorgno="{{ $_GET['orgNo'] }}" data-cyear="{{ $_GET['y'] }}" data-cyear2="{{ $_GET['y2'] }}" data-nrunno="{{ $_GET['runNo'] }}" data-empno="{{ $_GET['empno'] }}"></div>
        <div class="card bg-white shadow-xl rounded-2xl">
            <div class="card-body">
                <!-- Header -->
                <div class="text-center mb-6">
                    <h2 class="text-xl font-bold">Form : Set New Address / Change Address / Change User</h2>
                    <p class="text-sm text-gray-500">Warehouse Report Request</p>
                </div>

                <!-- Info Section -->
                <div class="grid gap-4 mb-6 w-1/3">
                    <div>
                        <label class="block text-sm font-medium">Date</label>
                        <input type="date" class="input input-bordered w-full" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium">Person in Charge</label>
                        <input type="text" placeholder="ชื่อผู้รับผิดชอบ" class="input input-bordered w-full" />
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
            <div class="flow"></div>
        </div>

    </div>

@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/psSar.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection