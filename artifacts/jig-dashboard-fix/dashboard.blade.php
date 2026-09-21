@extends('layout/template')

@section('content')
<input type="hidden" id="empno" value="{{ $empno }}">

<div class="jig-dashboard">
    <div class="row g-3 mb-3">
        <div class="col">
            <div class="jig-summary-card card-total">
                <div class="summary-title">
                    <i class="fa fa-wrench"></i> JIG ทั้งหมด
                </div>
                <div class="summary-value" id="summary-total">0</div>
            </div>
        </div>

        <div class="col">
            <div class="jig-summary-card card-completed">
                <div class="summary-title">
                    <i class="fa fa-check-square"></i> JIG ที่ตรวจแล้ว
                </div>
                <div class="summary-value" id="summary-completed">0</div>
            </div>
        </div>

        <div class="col">
            <div class="jig-summary-card card-due-soon">
                <div class="summary-title">
                    <i class="fa fa-clock-o"></i> JIG ใกล้ครบกำหนด
                </div>
                <div class="summary-value" id="summary-due-soon">0</div>
            </div>
        </div>

        <div class="col">
            <div class="jig-summary-card card-overdue">
                <div class="summary-title">
                    <i class="fa fa-warning"></i> JIG ที่เกินกำหนด
                </div>
                <div class="summary-value" id="summary-overdue">0</div>
            </div>
        </div>

        <div class="col">
            <div class="jig-summary-card card-new">
                <div class="summary-title">
                    <i class="fa fa-star"></i> JIG ที่รอการตรวจ
                </div>
                <div class="summary-value" id="summary-new">0</div>
            </div>
        </div>
    </div>

    <div class="jig-toolbar mb-3">
        <div class="d-flex flex-wrap align-items-center gap-2">
            <button type="button" class="btn jig-filter active" data-filter="all">
                ทั้งหมด (<span id="filter-total">0</span>)
            </button>

            <button type="button" class="btn jig-filter" data-filter="due-soon">
                ใกล้กำหนด (<span id="filter-due-soon">0</span>)
            </button>

            <button type="button" class="btn jig-filter" data-filter="overdue">เกินกำหนด (<span id="filter-overdue">0</span>)</button>
<button type="button" class="btn jig-filter" data-filter="12m">12m (<span id="filter-12m">0</span>)</button>

            <button type="button" class="btn jig-filter" data-filter="6m">
                6m (<span id="filter-6m">0</span>)
            </button>

            <div class="jig-search">
                <i class="fa fa-search"></i>
                <input type="text" id="jig-search" class="form-control" placeholder="ค้นหา JIG / Controller..." >
            </div>

            <button type="button" class="btn btn-light border" id="btn-export">
                <i class="fa fa-file-excel-o"></i> Export Excel
            </button>

            
        </div>
    </div>

    <div class="jig-table-container">
        <table class="table jig-table mb-0" id="jig-table">
            <thead>
                <tr>
                    <th width="4%">No</th>
                    <th width="9%">JIG No.</th>
                    <th width="22%">JIG Name</th>
                    <th width="18%">Controller</th>
                    <th width="5%">Period</th>
                    <th width="11%">Schedule </th>
                    <th width="12%">Next Inspection</th>
                    <th width="10%">Status</th>
                    <th width="9%" class="text-center">Action</th>
                </tr>
            </thead>

            <tbody id="jig-table-body">
                <tr>
                    <td colspan="9" class="text-center py-4">
                        Loading...
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="jig-pagination">
        <div id="pagination-info">
            แสดง 0-0 จาก 0 รายการ
        </div>

        <div id="pagination" class="d-flex gap-1"></div>
    </div>

    <div class="jig-legend mt-3">
        <strong>Legend:</strong>

        <span>
            <span class="legend-box legend-planned"></span>
            แผน Inspection
        </span>

        <span>
            <span class="legend-box legend-completed"></span>
            ตรวจแล้ว
        </span>

        <span>
            <span class="legend-status status-due-soon">Due Soon</span>
            เหลือ ≤ 30 วัน
        </span>

        <span>
            <span class="legend-status status-overdue">Overdue</span>
            เกินกำหนด
        </span>

        <span>
            <span class="legend-status status-new">New JIG</span>
            เริ่มใช้งานภายใน FY
        </span>

        <span class="ms-auto" id="period-label"></span>
    </div>
</div>
@endsection

@section('scripts')
<script>
    const JIG_CONFIG = {
        baseUrl: "{{ base_url() }}",
        apiUrl: "http://amecwebtest/api",
        empno: "{{ $empno }}"
    };
</script>

<script src="{{ base_url() }}assets/scripts/jig/dashboard.js"></script>
@endsection

@section('styles')
<style>
    #body{
        margin-right: 0 !important;
        box-sizing: border-box !important;
        max-width: calc(100% - 250px) !important;
    }

    .jig-dashboard{
        padding: 8px 10px;
        font-size: 14px;
    }

    .jig-dashboard .row.g-3{
        --bs-gutter-x: 10px;
        --bs-gutter-y: 10px;
    }

    .jig-summary-card{
        background: #fff;
        border: 1px solid #dfe5ec;
        border-radius: 10px;
        padding: 10px 14px;
        min-height: 82px;
        border-top-width: 4px;
        box-shadow: 0 2px 6px rgba(30, 41, 59, .08);
        transition: .15s ease;
    }

    .jig-summary-card:hover{
        transform: translateY(-1px);
        box-shadow: 0 4px 10px rgba(30, 41, 59, .12);
    }

    .card-total{
        border-top-color: #234f89;
        background: linear-gradient(135deg, #ffffff 0%, #f4f8ff 100%);
    }

    .card-completed{
        border-top-color: #16a36f;
        background: linear-gradient(135deg, #ffffff 0%, #f0fbf7 100%);
    }

    .card-due-soon{
        border-top-color: #ef9000;
        background: linear-gradient(135deg, #ffffff 0%, #fff9ed 100%);
    }

    .card-overdue{
        border-top-color: #e33636;
        background: linear-gradient(135deg, #ffffff 0%, #fff3f3 100%);
    }

    .card-new{
        border-top-color: #7b3ff2;
        background: linear-gradient(135deg, #ffffff 0%, #f7f2ff 100%);
    }

    .summary-title{
        color: #4d5b70;
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 6px;
        white-space: nowrap;
    }

    .summary-title i{
        margin-right: 4px;
    }

    .summary-value{
        font-size: 30px;
        font-weight: 700;
        line-height: 1;
    }

    .card-total .summary-value{ color: #234f89; }
    .card-completed .summary-value{ color: #13966a; }
    .card-due-soon .summary-value{ color: #e68200; }
    .card-overdue .summary-value{ color: #df2e2e; }
    .card-new .summary-value{ color: #7b3ff2; }

    .jig-toolbar{
        background: #eef3f8;
        padding: 7px 8px;
        border: 1px solid #dfe6ee;
        border-radius: 9px;
        box-shadow: 0 1px 3px rgba(15, 23, 42, .05);
    }

    .jig-toolbar .gap-2{
        gap: 6px !important;
    }

    .jig-filter{
        border: 1px solid #cfd8e4;
        background: #fff;
        color: #42526a;
        border-radius: 18px;
        padding: 5px 13px;
        font-size: 13px;
        font-weight: 500;
        line-height: 1.2;
        min-height: 32px;
    }

    .jig-filter:hover{
        background: #f3f7fc;
        border-color: #9eb6d5;
    }

    .jig-filter.active{
        background: #dfeaff;
        border-color: #6f9fe8;
        color: #1554a3;
        font-weight: 600;
    }

    .jig-select{
        width: 140px;
        height: 32px;
        font-size: 13px;
        padding: 3px 8px;
        border-color: #cfd8e4;
        border-radius: 7px;
    }

    .jig-search{
        position: relative;
        width: 220px;
    }

    .jig-search i{
        position: absolute;
        left: 10px;
        top: 9px;
        color: #64748b;
        z-index: 2;
        font-size: 13px;
    }

    .jig-search input{
        height: 32px;
        padding-left: 30px;
        font-size: 13px;
        border-radius: 7px;
        border-color: #cfd8e4;
    }

    #btn-export{
        height: 32px;
        padding: 4px 12px;
        font-size: 13px;
        border-radius: 7px;
        background: #fff;
    }

    #btn-export:hover{
        background: #f3f7fc;
    }

    #btn-add-jig{
        height: 34px;
        padding: 5px 16px;
        font-size: 14px;
        font-weight: 600;
        border-radius: 18px;
        background: #4f46e5;
        border-color: #4f46e5;
        box-shadow: 0 2px 5px rgba(79, 70, 229, .25);
    }

    #btn-add-jig:hover{
        background: #4338ca;
        border-color: #4338ca;
    }

    .jig-table-container{
        border: 1px solid #dce3eb;
        border-radius: 8px;
        overflow: hidden;
        background: #fff;
        box-shadow: 0 1px 4px rgba(15, 23, 42, .05);
    }

    .jig-table{
        width: 100%;
        table-layout: fixed;
        font-size: 13px;
    }

    .jig-table thead th{
        background: linear-gradient(180deg, #eef3f8 0%, #e6edf5 100%);
        color: #26364d;
        font-weight: 700;
        border-bottom: 1px solid #c8d4e1;
        padding: 8px 10px;
        vertical-align: middle;
        white-space: nowrap;
    }

    .jig-table tbody td{
        padding: 7px 10px;
        vertical-align: middle;
        border-color: #e5ebf1;
        color: #243248;
        line-height: 1.25;
        height: 44px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .jig-table tbody tr:nth-child(even){
        background: #f8fafc;
    }

    .jig-table tbody tr:hover{
        background: #edf5ff;
    }

    .jig-table tbody tr:hover td{
        color: #17345d;
    }

    .jig-table th:first-child,
    .jig-table td:first-child{
        text-align: center;
        color: #617087;
    }

    .jig-table th:nth-child(5),
    .jig-table td:nth-child(5),
    .jig-table th:nth-child(8),
    .jig-table td:nth-child(8),
    .jig-table th:nth-child(9),
    .jig-table td:nth-child(9){
        text-align: center;
    }

    .jig-link{
        display: inline-block;
        min-width: 62px;
        padding: 3px 8px;
        border: 1px solid #cad6e4;
        border-radius: 6px;
        background: #fff;
        color: #2457a6;
        font-weight: 600;
        text-align: center;
        text-decoration: none;
    }

    .jig-link:hover{
        background: #eaf2ff;
        border-color: #8eb0df;
        color: #17457f;
        text-decoration: none;
    }

    .jig-name{
        font-weight: 500;
        color: #1f2f46;
    }

    .period-6m{
        color: #dc7600 !important;
        font-weight: 700;
    }

    .next-due-soon{
        color: #df7a00 !important;
        font-weight: 700;
    }

    .next-overdue{
        color: #e03226 !important;
        font-weight: 700;
    }

    .jig-status{
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        min-width: 74px;
        padding: 4px 8px;
        border-radius: 14px;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
    }

    .status-planned{
        background: #e9eff6;
        color: #53657a;
    }

    .status-due-soon{
        background: #fff0c6;
        color: #a06400;
    }

    .status-overdue{
        background: #ffe0df;
        color: #c72d26;
    }

    .jig-table td:last-child{
        padding-left: 5px;
        padding-right: 5px;
        overflow: visible;
    }

    .btn-inspect,
    .btn-view-jig{
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 64px;
        height: 28px;
        padding: 0 6px;
        margin: 0 auto;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 600;
        line-height: 1;
        white-space: nowrap;
    }

    .btn-inspect{
        background: #234f89;
        border: 1px solid #234f89;
        color: #fff;
    }

    .btn-inspect:hover{
        background: #193c69;
        border-color: #193c69;
        color: #fff;
    }

    .btn-view-jig{
        background: #fff;
        border: 1px solid #c8d4e1;
        color: #384b63;
    }

    .btn-view-jig:hover{
        background: #edf3f8;
        border-color: #9eafc1;
        color: #243b5a;
    }

    .jig-pagination{
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 0 0;
        color: #64748b;
        font-size: 12px;
    }

    .page-btn{
        min-width: 27px;
        height: 27px;
        border: 1px solid #d3dce6;
        background: #fff;
        color: #42526a;
        border-radius: 5px;
        font-size: 12px;
        cursor: pointer;
    }

    .page-btn:hover{
        background: #edf3fa;
    }

    .page-btn.active{
        background: #244c7d;
        border-color: #244c7d;
        color: #fff;
        font-weight: 600;
    }

    .page-btn:disabled{
        opacity: .4;
        cursor: default;
    }

    .page-dots{
        padding: 4px 3px;
        color: #94a3b8;
    }

    .jig-legend{
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 9px;
        background: #f8fafc;
        border: 1px solid #dfe5ec;
        border-radius: 8px;
        padding: 7px 10px;
        font-size: 11px;
        color: #56657a;
    }

    .legend-box{
        display: inline-block;
        width: 11px;
        height: 11px;
        border-radius: 3px;
        margin-right: 3px;
        vertical-align: -1px;
    }

    .legend-planned{
        background: #e8f1ff;
        border: 1px solid #6aa3ff;
    }

    .legend-completed{
        background: #dff8ec;
        border: 1px solid #48c78e;
    }

    .legend-status{
        display: inline-block;
        padding: 2px 7px;
        border-radius: 10px;
        font-size: 10px;
        font-weight: 600;
    }

    @media(max-width: 1400px){
        .summary-title{ font-size: 13px; }
        .summary-value{ font-size: 27px; }
        .jig-table{ font-size: 12px; }
        .jig-table thead th{ font-size: 12px; }
    }

    @media(max-width: 1200px){
        .jig-search{ width: 180px; }

        .jig-dashboard{
            overflow-x: auto;
        }

        .jig-table{
            min-width: 1100px;
        }
    }
</style>
@endsection