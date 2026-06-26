@extends('layouts/webflowTemplate')

@section('contents')
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<style>
    body {
        background: #f1f5f9;
    }
   
    .or-center-table th {
        background: #312e81;
        color: #fff;
        font-weight: 900;
        font-size: 14px;
        padding: 7px 8px;
        text-align: center;
        white-space: nowrap;
    }

    .or-center-table td {
        font-size: 14px;
        padding: 7px 8px;
        border-bottom: 1px solid #cbd5e1;
        color: #0f172a;
    }
    .or-center-input {
        height: 28px;
        border: 1px solid #94a3b8;
        padding: 2px 8px;
        font-size: 13px;
        outline: none;
        background: #fff;
    }

    .or-center-input:focus {
        border-color: #4f46e5;
        box-shadow: 0 0 0 2px rgba(79, 70, 229, .15);
    }

    .or-center-select {
        height: 28px;
        border: 1px solid #94a3b8;
        padding: 2px 8px;
        font-size: 13px;
        outline: none;
        background: #fff;
    }

    .or-center-select:focus {
        border-color: #4f46e5;
        box-shadow: 0 0 0 2px rgba(79, 70, 229, .15);
    }

    .or-center-table th {
        background: #312e81;
        color: #fff;
        font-weight: 900;
        font-size: 13px;
        padding: 6px 8px;
        text-align: center;
        white-space: nowrap;
    }

    .or-center-table td {
        font-size: 12px;
        padding: 5px 8px;
        border-bottom: 1px solid #cbd5e1;
        color: #0f172a;
    }

    .or-center-table tbody tr:nth-child(odd) {
        background: #e5e7eb;
    }

    .or-center-table tbody tr:nth-child(even) {
        background: #f3f4f6;
    }

    .or-center-table tbody tr:hover {
        background: #eef2ff;
    }

    .or-btn {
        border-radius: 999px;
        padding: 8px 26px;
        font-weight: 900;
        font-size: 14px;
        color: #fff;
        cursor: pointer;
        transition: .15s;
    }

    .or-btn:hover {
        transform: translateY(-1px);
    }

    .or-file-links {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 12px;
    }

    .or-file-icon {
        font-size: 16px;
        cursor: pointer;
        text-decoration: none;
    }

    .or-file-pdf {
        color: #dc2626;
    }

    .or-file-excel {
        color: #059669;
    }


</style>

<div class="min-h-screen bg-gradient-to-br from-slate-100 via-white to-indigo-50 px-2 py-3">
    <div class="w-full overflow-hidden rounded-t-xl bg-white shadow-lg">

        <div class="border-b-4 border-indigo-900 bg-gradient-to-r from-indigo-700 via-violet-700 to-indigo-600 px-4 py-4">
            <h1 class="text-center text-3xl font-black tracking-wide text-white">
                OR CENTER
            </h1>
        </div>

        <div class="bg-slate-100 px-4 py-3">
            <div class="flex flex-wrap items-center gap-x-4 gap-y-3 text-sm font-black text-slate-900">

                <label class="flex items-center gap-2">
                    OR NO
                    <input type="text" id="search_orno" class="or-center-input w-[200px]" placeholder="EX.OR-MFG-26001">
                </label>

                <label class="flex items-center gap-2">
                    TOPIC
                    <input type="text" id="search_topic" class="or-center-input w-[450px]">
                </label>

                <label class="flex items-center gap-2">
                    Classification
                    <select id="search_class" class="or-center-select w-[300px]">
                        <option value="">All</option>
                        <option value="BASIC">Basic Knowledge (ความรู้พื้นฐาน)</option>
                        <option value="IMPROVE">Improvement Case (กรณีปรับปรุงงาน)</option>
                        <option value="TROUBLE">Trouble Case (กรณีเกิดปัญหาซ้ำ)</option>
                        <option value="REGULATION">Regulation (กฎระเบียบ/ข้อบังคับ)</option>
                    </select>
                </label>

                <label class="flex items-center gap-2">
                    Year
                    <select id="search_year" class="or-center-select w-[90px]">
                        <option value="">All</option>
                        @php
                            $currentYear = date('Y');
                        @endphp

                        @for ($year = $currentYear; $year >= $currentYear - 5; $year--)
                            <option value="{{ $year }}">
                                {{ $year }}
                            </option>
                        @endfor
                    </select>
                </label>

                <button type="button" id="btn_search" class="or-btn bg-amber-500 hover:bg-amber-600 text-white">
                    Search
                </button>
            </div>
        </div>

        <div class="bg-slate-100 px-2 pb-4 pt-2">
            <div class="mb-2 flex items-center justify-between px-2 text-sm font-black text-slate-700">
                <div id="or_center_count">Total: 0</div>
            </div>

            <div class="overflow-x-auto">
                <table id="or_center_table" class="or-center-table w-full border-collapse">
                    <thead>
                        <tr>
                            <th class="w-[90px]">File</th>
                            <th class="w-[190px]">OR No.</th>
                            <th class="w-[80px]">Rev</th>
                            <th>Topic</th>
                            <th class="w-[300px]">Classification</th>
                            <th class="w-[150px]">Issue Date</th>
                            <th class="w-[150px]">Revise Date</th>
                            <th class="w-[150px]">Form no</th>
                        </tr>
                    </thead>

                    <tbody id="or_center_tbody"></tbody>
                </table>
            </div>

            <div class="mt-3 flex justify-end px-2">
                <button type="button" id="btn_export_excel" class="or-btn bg-emerald-600 hover:bg-emerald-700">
                    Export Excel
                </button>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/mfg_or_center.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection