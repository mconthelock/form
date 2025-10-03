@extends('layouts/webflowTemplate')
@section('contents')
    <section class="p-6 space-y-6 bg-base-100">

        <!-- Header -->
        <div class="text-center">
            <h2 class="text-2xl font-bold text-primary">User ID and Authorization Regular Review Result</h2>
            <p class="text-sm text-gray-500">2nd Half, 2024 — Regular Review Summary</p>
        </div>

        <!-- Summary Info -->
        {{--<div class="grid md:grid-cols-4 gap-4">
            <div class="stat bg-base-200 rounded-xl">
                <div class="stat-title">Total Systems</div>
                <div class="stat-value text-primary">4</div>
                <div class="stat-desc">Reviewed this half</div>
            </div>
            <div class="stat bg-base-200 rounded-xl">
                <div class="stat-title">Total Users</div>
                <div class="stat-value text-secondary">642</div>
                <div class="stat-desc">Across all systems</div>
            </div>
            <div class="stat bg-base-200 rounded-xl">
                <div class="stat-title">Unmatched Users</div>
                <div class="stat-value text-error">5</div>
                <div class="stat-desc">Checked and corrected</div>
            </div>
            <div class="stat bg-base-200 rounded-xl">
                <div class="stat-title">Reviewed By</div>
                <div class="stat-value text-success">IS Staff</div>
                <div class="stat-desc">All corrections completed</div>
            </div>
        </div> --}}

        <!-- Data Table -->
        <div class="overflow-x-auto">
            <table class="table table-zebra w-full">
                <thead class="bg-base-300">
                    <tr>
                        <th>No.</th>
                        <th>System</th>
                        <th class="text-center">Total Users</th>
                        <th class="text-center">Unmatched</th>
                        <th>Condition</th>
                        <th>Result</th>
                        <th colspan="3">Remark</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td rowspan="2">1</td>
                        <td rowspan="2">
                            <div class="font-semibold">Purchasing System</div>
                            <div class="text-xs text-gray-500">SCM + Procurement + AS400 (090101 B/P DIV.)</div>
                        </td>
                        <td rowspan="2" class="text-center">476</td>
                        <td rowspan="2" class="text-center text-error font-semibold">2</td>
                        <td rowspan="2">All matched</td>
                        <td rowspan="2">✔</td>
                        <td>AS400</td>
                        <td><textarea name="" id="" class="textarea textarea-bordered " placeholder="Enter your comment"></textarea></td>
                        <td><textarea name="" id="" class="textarea textarea-bordered " placeholder="Enter your comment"></textarea></td>

                    </tr>
                    <tr>
                        <td>Procurement</td>
                        <td><textarea name="" id="" class="textarea textarea-bordered " placeholder="Enter your comment"></textarea></td>
                        <td><textarea name="" id="" class="textarea textarea-bordered " placeholder="Enter your comment"></textarea></td>
                    </tr>
                    <tr>
                        <td rowspan="2">2</td>
                        <td rowspan="2">
                            <div class="font-semibold">Financial System</div>
                            <div class="text-xs text-gray-500">LN + AS400 (040401: FIN, 040501: CAT)</div>
                        </td>
                        <td rowspan="2" class="text-center">43</td>
                        <td rowspan="2" class="text-center text-error font-semibold">3</td>
                        <td rowspan="2">All matched</td>
                        <td rowspan="2">✔</td>
                        <td>AS400</td>
                        <td><textarea name="" id="" class="textarea textarea-bordered " placeholder="Enter your comment" rows="1"></textarea></td>
                        <td><textarea name="" id="" class="textarea textarea-bordered " placeholder="Enter your comment" rows="1"></textarea></td>
                    </tr>

                    <tr>
                        <td>LN</td>
                        <td><textarea name="" id="" class="textarea textarea-bordered " placeholder="Enter your comment" rows="1"></textarea></td>
                        <td><textarea name="" id="" class="textarea textarea-bordered " placeholder="Enter your comment" rows="1"></textarea></td>
                    </tr>

                    <tr>
                        <td>3</td>
                        <td>
                            <div class="font-semibold">Marketing System</div>
                            <div class="text-xs text-gray-500">Invoice + MKT</div>
                        </td>
                        <td class="text-center">76</td>
                        <td class="text-center text-error font-semibold">2</td>
                        <td>All matched</td>
                        <td>✔</td>
                        <td>Delete user 12209</td>
                    </tr>

                    <tr>
                        <td>4</td>
                        <td>
                            <div class="font-semibold">Production & Logistics Control System</div>
                            <div class="text-xs text-gray-500">AS400 (060801: PLC DEPT.)</div>
                        </td>
                        <td class="text-center">47</td>
                        <td class="text-center text-success font-semibold">0</td>
                        <td>All matched</td>
                        <td>✔</td>
                        <td>—</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Remark -->
        <div class="alert alert-info mt-4">
            <i class="fa-solid fa-circle-info text-xl"></i>
            <span>Unmatched records have already been checked and corrected for all systems.</span>
        </div>

    </section>

@endsection
@section('scripts')

@endsection