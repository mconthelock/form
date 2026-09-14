{{-- filepath: d:\Docker_mark\src\form\application\views\gpform\GP-TPH\addarea.blade.php --}}
@extends('layouts/webflowTemplate')

@section('styles')
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
            background: #e6e7ea;
            font-family: Arial, Helvetica, sans-serif;
            color: #111;
        }

        .page-wrapper {
            min-height: 100vh;
            border-top: 2px solid #222;
            padding: 22px 19px;
        }

        .page-title {
            margin: 0 0 11px 13px;
            color: #0754b8;
            font-size: 36px;
            font-weight: 700;
        }

        .page-subtitle {
            display: block;
            margin-top: 3px;
            font-size: 26px;
            color: #0754b8;
        }

        .content-card {
            width: 100%;
            min-height: 344px;
            padding: 31px 32px;
            background: #fff;
            border-radius: 4px;
        }

        .toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
        }

        .area-form {
            display: none;
            margin-bottom: 20px;
            padding: 20px;
            border: 1px solid #c6d2e1;
            border-radius: 8px;
            background: #f8fafc;
        }

        .area-form.is-visible {
            display: block;
        }

        .area-form-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 12px;
        }

        .area-form label {
            display: block;
            margin-bottom: 5px;
            color: #4a596d;
            font-size: 13px;
            font-weight: 600;
        }

        .area-form input,
        .area-form select {
            width: 100%;
            height: 34px;
            padding: 0 10px;
            border: 1px solid #c8c8c8;
            border-radius: 3px;
            outline: none;
            font-size: 15px;
        }

        .area-form input:focus {
            border-color: #0754b8;
        }

        .area-form .select2-container {
            width: 100% !important;
        }

        .area-form .select2-container .select2-selection--single {
            height: 34px;
            padding: 0 10px;
            border: 1px solid #c8c8c8;
            border-radius: 3px;
            font-size: 15px;
        }

        .area-form .select2-container .select2-selection__rendered {
            padding: 0;
            line-height: 32px;
        }

        .area-form .select2-container .select2-selection__arrow {
            height: 32px;
        }

        .area-form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            margin-top: 16px;
        }

        .area-form-actions button {
            min-width: 80px;
            height: 33px;
            padding: 0 14px;
            border: 0;
            border-radius: 6px;
            cursor: pointer;
            font-size: 15px;
            font-weight: 600;
        }

        .search-input {
            width: 185px;
            height: 32px;
            padding: 0 12px;
            border: 1px solid #c8c8c8;
            border-radius: 3px;
            outline: none;
            font-size: 13px;
        }

        .search-input:focus {
            border-color: #0754b8;
        }

        .add-button {
            min-width: 98px;
            height: 45px;
            padding: 0 14px;
            border: 0;
            border-radius: 9px;
            background: #0754b8;
            color: #fff;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        .add-button:hover {
            background: #06449a;
        }

        .table-wrapper {
            overflow-x: auto;
        }

        .area-table {
            width: 100%;
            border: 1px solid #c6d2e1;
            border-radius: 8px;
            border-spacing: 0;
            border-collapse: separate;
            overflow: hidden;
            font-size: 15px;
        }

        .area-table th {
            height: 37px;
            padding: 0 10px;
            background: #fff;
            color: #4a596d;
            text-align: left;
            font-weight: 600;
            white-space: nowrap;
            border-bottom: 1px solid #c6d2e1;
        }

        .area-table td {
            height: 49px;
            padding: 0 10px;
            border-bottom: 1px solid #c6d2e1;
            white-space: nowrap;
        }

        .area-table th:not(:last-child),
        .area-table td:not(:last-child) {
            border-right: 1px solid #c6d2e1;
        }

        .area-table tbody tr:last-child td {
            border-bottom: 0;
        }

        .area-table tbody tr:nth-child(even) {
            background: #e9e9e9;
        }

        .area-table th:nth-child(1),
        .area-table td:nth-child(1) {
            width: 8%;
        }

        .area-table th:nth-child(2),
        .area-table td:nth-child(2) {
            width: 23%;
        }

        .area-table th:nth-child(3),
        .area-table td:nth-child(3) {
            width: 22%;
        }

        .area-table th:nth-child(4),
        .area-table td:nth-child(4) {
            width: 12%;
        }

        .area-table th:nth-child(5),
        .area-table td:nth-child(5) {
            width: 25%;
        }

        .area-table th:last-child,
        .area-table td:last-child {
            width: 120px;
            text-align: center;
        }

        .sort-icon {
            float: right;
            color: #e5e5e5;
            font-size: 13px;
            line-height: 12px;
        }

        .action-link {
            display: inline-flex;
            width: 27px;
            height: 30px;
            align-items: center;
            justify-content: center;
            margin: 0 3px;
            text-decoration: none;
            cursor: pointer;

        }

        .table-action-button {
            width: 36px;
            height: 36px;
            border: 2px solid #e5e5e5;
            border-radius: 4px;
            background: #fff;
            font: inherit;
        }

        .edit-icon {
            color: #facc15;
            font-size: 21px;
            border-block: black;
        }

        .delete-icon {
            color: #d30b17;
            font-size: 21px;
            border-block: black;
        }

        .empty-row {
            height: 80px !important;
            text-align: center;
            color: #777;
        }

        .table-summary {
            margin-top: 25px;
            text-align: right;
            font-size: 14px;
        }

        .search-input {
            width: 300px;
            height: 42px;
            padding: 0 14px;
            font-size: 16px;
        }

        .search-input:focus {
            border-color: #0754b8;
        }

        .search-input {
            width: 20%;
        }

        @media (max-width: 768px) {
            .content-card {
                padding: 20px 14px;
            }

            .page-title {
                margin-left: 0;
                font-size: 25px;
            }

            .toolbar {
                gap: 12px;
                align-items: stretch;
                flex-direction: column;
            }

            .search-input {
                width: 100%;
            }

            .add-button {
                align-self: flex-end;
            }

            .area-form-grid {
                grid-template-columns: 1fr;
            }

            .area-table {
                min-width: 850px;
            }
        }
    </style>
@endsection

@section('contents')
    <div class="page-wrapper">
        <div class="text-center">
            <H1 class="text-4xl font-bold text-primary">พื้นที่ขออนุญาตถ่ายภาพ</H1>
            <H2 lass="text-2xl font-semibold uppercase opacity-50 tracking-wider mt-1">(Photo Permission Area)</H2>

        </div>

        <div class="content-card">
            <div class="toolbar">
                <input type="text" id="searchArea" class="search-input " placeholder="Search record" autocomplete="off">
                <button type="button" id="newAreaButton" class="add-button">
                    + NEW AREA
                </button>
            </div>

            <form id="areaForm" class="area-form">
                <div class="area-form-grid">
                    <div>
                        <label for="LOCATION_ID">Location</label>
                        <select id="LOCATION_ID" name="LOCATION_ID" required>
                            <option value="">Select location</option>
                        </select>
                    </div>
                    <div>
                        <label for="AREA_NAME">Area</label>
                        <input type="text" id="AREA_NAME" name="AREA_NAME" required>
                    </div>
                    <div>
                        <label for="AREA_LEVEL">Level</label>
                        <input type="number" id="AREA_LEVEL" name="AREA_LEVEL" inputmode="numeric" min="0" step="1" required>
                    </div>
                    <div>
                        <label for="AREA_OWNER">Area Owner</label>
                        <select id="AREA_OWNER" name="AREA_OWNER" required>
                            <option value="">Select area owner</option>
                        </select>
                    </div>
                </div>
                <div class="area-form-actions">
                    <button type="button" id="cancelAreaButton" class="btn btn-sm btn-error gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                        Cancel
                    </button>
                    <button type="submit" class="btn btn-sm btn-primary gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 4h11l3 3v13H5V4Zm3 0v6h8V4m-8 16v-6h8v6" />
                        </svg>
                        Save
                    </button>
                </div>
            </form>

            <div class="table-wrapper border-slate-200">
                <table class="area-table">
                    <thead>
                        <tr>
                            <th class ="border p-2 bg-blue-500 text-white">
                                NO
                                <span class="sort-icon">▲<br>▼</span>
                            </th>
                            <th class ="border p-2">
                                Location
                                <span class="sort-icon">▲<br>▼</span>
                            </th>
                            <th class ="border p-2">
                                Area
                                <span class="sort-icon">▲<br>▼</span>
                            </th>
                            <th class ="border p-2">
                                Level
                                <span class="sort-icon">▲<br>▼</span>
                            </th>
                            <th class ="border p-2">
                                Area Owner
                                <span class="sort-icon">▲<br>▼</span>
                            </th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody id="areaTableBody">
                        @forelse ([] as $index => $area)
                            <tr>
                                <td>{{ $index + 1 }}</td>
                                <td>{{ $area->location ?? '-' }}</td>
                                <td>{{ $area->area ?? '-' }}</td>
                                <td>{{ $area->level ?? '-' }}</td>
                                <td>{{ $area->area_owner ?? '-' }}</td>
                                <td>
                                    <a href="{{ url('/photo-permission-area/' . $area->id . '/edit') }}" class="action-link"
                                        title="แก้ไขข้อมูล" style="border-block-end-color: gold">
                                        <span class="edit-icon">✎</span>
                                    </a>

                                    <form action="{{ url('/photo-permission-area/' . $area->id) }}" method="POST"
                                        style="display: inline;" onsubmit="return confirm('ยืนยันการลบข้อมูลนี้หรือไม่?');">
                                        @csrf
                                        @method('DELETE')

                                        <button type="submit" class="action-link" title="ลบข้อมูล"
                                            style="border: 0; background: transparent;">
                                            <span class="delete-icon">🗑</span>
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="6" class="empty-row">
                                    ไม่พบข้อมูล
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <div id="areaTableSummary" class="table-summary">
                0 row(s)
            </div>
        </div>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/gpTPHArea.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
