@extends('layouts/template')

@section('contents')
<div class="bg-white rounded shadow-sm p-3">

    <!-- 🔷 Header -->
    <div class="d-flex justify-content-between align-items-center mb-3">
        <div class="d-flex gap-2 align-items-center">
            <h5 class="mb-0">Daily Transportation Management</h5>
            <input type="date" id="dispatchDate" class="form-control form-control-sm" style="width:160px;">
            <button class="btn btn-sm btn-outline-primary" id="btnRefresh">
                <i class="bi bi-arrow-clockwise"></i> Refresh
            </button>
        </div>

        <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-secondary" id="btnAuto">
                <i class="bi bi-magic"></i> Auto Assign
            </button>
            <button class="btn btn-sm btn-success" id="btnSave">
                <i class="bi bi-save"></i> Save Dispatch
            </button>
        </div>
    </div>

    <!-- 🔷 Tabs -->
    <ul class="nav nav-tabs mb-3" id="dispatchTab">
        <li class="nav-item">
            <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#tabNormal">
                🚍 เวลากลับปกติ (17:10)
            </button>
        </li>
        <li class="nav-item">
            <button class="nav-link" data-bs-toggle="tab" data-bs-target="#tabOT">
                🌙 เวลา OT (20:00)
            </button>
        </li>
    </ul>

    <div class="tab-content">

        <!-- ================= NORMAL TAB ================= -->
        <div class="tab-pane fade show active" id="tabNormal">
            <div class="row g-3">

                <!-- LEFT PANEL -->
                <div class="col-md-5">
                    <div class="card h-100">
                        <div class="card-header py-2">
                            <strong>Passenger Pool</strong>
                        </div>
                        <div class="card-body p-2">
                            <table id="tbNormalPassenger" class="table table-sm table-hover w-100">
                                <thead>
                                    <tr>
                                        <th>Line</th>
                                        <th>Stop</th>
                                        <th>Empno</th>
                                        <th>Name</th>
                                        <th>Section</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- RIGHT PANEL -->
                <div class="col-md-7">
                    <div class="card h-100">
                        <div class="card-header py-2 d-flex justify-content-between">
                            <strong>Dispatch Workspace</strong>
                            <button class="btn btn-sm btn-outline-primary" id="btnAddLineNormal">
                                <i class="bi bi-plus"></i> Add Line
                            </button>
                        </div>
                        <div class="card-body p-2">
                            <div id="normalWorkspace">
                                <!-- render line + stop here -->
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <!-- ================= OT TAB ================= -->
        <div class="tab-pane fade" id="tabOT">
            <div class="row g-3">

                <!-- LEFT PANEL -->
                <div class="col-md-5">
                    <div class="card h-100">
                        <div class="card-header py-2">
                            <strong>OT Passenger Pool</strong>
                        </div>
                        <div class="card-body p-2">
                            <table id="tbOTPassenger" class="table table-sm table-hover w-100">
                                <thead>
                                    <tr>
                                        <th>Line</th>
                                        <th>Stop</th>
                                        <th>Empno</th>
                                        <th>Name</th>
                                        <th>Section</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- RIGHT PANEL -->
                <div class="col-md-7">
                    <div class="card h-100">
                        <div class="card-header py-2 d-flex justify-content-between">
                            <strong>OT Dispatch Workspace</strong>
                            <button class="btn btn-sm btn-outline-primary" id="btnAddLineOT">
                                <i class="bi bi-plus"></i> Add Line
                            </button>
                        </div>
                        <div class="card-body p-2">
                            <div id="otWorkspace">
                                <!-- render line + stop here -->
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

    </div>
</div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/bus_overtime.js?ver={{ $_ENV['VERSION'] }}"></script>
@endsection