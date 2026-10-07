{{-- filepath: d:\Docker_mark\src\form\application\views\gpform\GP-TPH\addarea.blade.php --}}
@extends('layouts/webflowTemplate')

@section('styles')
    <style>
        /* Hallmark · compact workbench · DaisyUI system · centered area management.
           Pre-emit critique: P4 H4 E4 S4 R5 V4 */
        .area-data-shell {
            --area-soft: color-mix(in srgb, var(--color-primary) 6%, var(--color-base-100));
            --area-shadow: color-mix(in srgb, var(--color-primary) 10%, transparent);
            --area-backdrop: color-mix(in srgb, var(--color-neutral) 55%, transparent);
            font-family: var(--font-sans);
            color: var(--color-base-content);
            text-align: center;
        }
        .area-data-shell { width: 100%; max-width: 1040px; margin: 16px auto; }
        .area-data-card {
            width: 100%; min-width: 0; overflow: hidden;
            background: var(--color-base-100); border: 1px solid var(--color-base-300);
            border-radius: 20px; box-shadow: 0 8px 28px var(--area-shadow);
        }
        .area-data-header {
            display: grid; grid-template-columns: 52px minmax(0, 1fr); column-gap: 18px;
            align-items: center; padding: 28px; background: #0d4db5;
            color: #fff; text-align: left;
        }
        .area-data-mark {
            display: grid; grid-row: span 2; place-items: center; width: 52px; height: 52px;
            margin: 0; border: 1px solid currentColor; border-radius: 14px;
        }
        .area-data-title { font-size: clamp(21px, 3vw, 28px); font-weight: 700; line-height: 1.4; overflow-wrap: anywhere; }
        .area-data-subtitle { font-size: 13px; margin-top: 2px; }
        .area-data-body { padding: 24px; }
        .area-data-shell .toolbar { display: flex; justify-content: flex-start; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; }
        .area-data-shell .search-input { width: min(100%, 380px); height: 40px; text-align: left; border-radius: 10px; }
        .area-data-shell .btn { border-radius: 9px; box-shadow: none; white-space: nowrap; }
        .area-form-dialog { width: min(calc(100% - 32px), 1200px); margin: auto; padding: 0; overflow: visible; border: 1px solid var(--color-base-300); border-radius: 20px; background: var(--color-base-100); color: var(--color-base-content); font-size: 15px; box-shadow: 0 16px 48px var(--area-shadow); }
        .area-form-dialog::backdrop { background: var(--area-backdrop); }
        .area-form-dialog__content { max-height: calc(100dvh - 32px); overflow-y: auto; padding: 30px; }
        .area-form-dialog__header { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 20px; text-align: left; }
        .area-form-dialog__title { font-size: 22px; font-weight: 700; }
        .area-form-dialog__close { display: grid; place-items: center; width: 42px; height: 42px; border: 1px solid var(--color-base-300); border-radius: 9px; background: var(--color-base-100); color: var(--color-base-content); font-size: 24px; }
        .area-data-shell .area-form { padding: 24px; border: 1px solid var(--color-base-300); border-radius: 14px; background: var(--area-soft); }
        .area-data-shell .area-form-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px 18px; }
        .area-data-shell .area-form-grid > div { min-width: 0; }
        .area-data-shell .area-form label { display: block; margin-bottom: 8px; font-size: 15px; font-weight: 600; }
        .area-data-shell .area-form :is(input, select) {
            width: 100%; height: 48px; padding: 0 12px; border: 1px solid var(--color-base-300);
            border-radius: 8px; background: var(--color-base-100); color: var(--color-base-content);
            font: inherit; text-align: center;
        }
        .area-data-shell .area-form .select2-container { width: 100% !important; text-align: center; }
        .area-data-shell .select2-selection--single { height: 48px; border: 1px solid var(--color-base-300); border-radius: 8px; background: var(--color-base-100); }
        .area-data-shell .select2-selection__rendered { line-height: 46px !important; color: var(--color-base-content) !important; font-size: 15px; }
        .area-data-shell .select2-selection__arrow { height: 46px !important; }
        .area-form-dialog .select2-results__option { padding: 10px 14px; font-size: 15px; }
        .area-data-shell .area-form-actions { display: flex; justify-content: center; flex-wrap: wrap; gap: 12px; margin-top: 22px; }
        .area-form-dialog .area-form-actions .btn { min-height: 44px; padding-inline: 18px; font-size: 15px; }
        .area-data-shell :is(input, select, button):focus-visible {
            outline: 2px solid var(--color-primary); outline-offset: 3px;
        }
        .area-data-shell .table-wrapper { overflow-x: auto; border: 1px solid var(--color-base-300); border-radius: 12px; }
        .area-data-shell .area-table { width: 100%; min-width: 640px; border-collapse: collapse; font-size: 13px; }
        .area-data-shell .area-table :is(th, td) { text-align: center; vertical-align: middle; padding: 12px 14px; border: 0; border-bottom: 1px solid var(--color-base-300); }
        .area-data-shell .area-table th { background: var(--area-soft); color: var(--color-primary); font-weight: 700; white-space: nowrap; }
        .area-data-shell .area-table td:last-child { white-space: nowrap; }
        .area-data-shell .area-table tbody tr:nth-child(even) { background: var(--color-base-200); }
        .area-data-shell .area-table tbody tr:hover { background: var(--area-soft); }
        .area-data-shell .area-table tbody tr:last-child td { border-bottom: 0; }
        .area-data-shell .area-table td:first-child { font-variant-numeric: tabular-nums; color: var(--color-neutral); }
        .area-data-shell .area-table td:nth-child(3) { font-weight: 600; }
        .area-data-shell .action-link { display: inline-flex; justify-content: center; align-items: center; margin: 0 3px; cursor: pointer; }
        .area-data-shell .table-action-button { width: 34px; height: 34px; border: 1px solid var(--color-base-300); border-radius: 8px; background: var(--color-base-100); }
        .area-data-shell .table-action-button:hover { border-color: var(--color-primary); background: var(--area-soft); }
        .area-data-shell .edit-area span { color: var(--color-yellow-400); }
        .area-data-shell .empty-row { height: 150px; color: var(--color-neutral); }
        .area-data-shell .table-summary { margin-top: 16px; font-size: 12px; color: var(--color-neutral); text-align: center; }
        .area-data-shell .area-pagination { display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
        .area-data-shell .area-pagination__status { min-width: 72px; font-size: 12px; color: var(--color-neutral); }
        @media (max-width: 640px) {
            .area-data-shell .area-form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 480px) {
            .area-data-shell { margin-block: 8px; }
            .area-data-body { padding: 14px; }
            .area-data-header { padding: 22px 14px; }
            .area-data-shell .toolbar { flex-direction: column; align-items: stretch; }
            .area-data-shell .toolbar .btn { width: 100%; }
            .area-form-dialog__content { padding: 16px; }
            .area-data-shell .area-form { padding: 16px; }
            .area-data-shell .area-form-grid { grid-template-columns: minmax(0, 1fr); }
        }
    </style>
@endsection

@section('contents')
    <div class="area-data-shell bg-base-200 flex justify-center text-[13px] leading-relaxed font-sans text-base-content">
        <div class="area-data-card">
            <header class="area-data-header">
                <div class="area-data-mark" aria-hidden="true">
                    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
                        <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
                        <circle cx="12" cy="10" r="2.5" />
                    </svg>
                </div>
                <h1 class="area-data-title">พื้นที่ขออนุญาตถ่ายภาพ</h1>
                <p class="area-data-subtitle">GP-TPH · Photo Permission Areas</p>
            </header>
            <div class="area-data-body">
            <div class="toolbar">
                <input type="text" id="searchArea" class="input search-input" placeholder="ค้นหาพื้นที่ สถานที่ หรือเจ้าของพื้นที่" aria-label="ค้นหาพื้นที่" autocomplete="off">
                <button type="button" id="newAreaButton" class="btn btn-primary add-button">
                    + เพิ่มพื้นที่
                </button>
            </div>

            <dialog id="areaFormDialog" class="area-form-dialog" aria-labelledby="areaFormTitle">
            <div class="area-form-dialog__content">
            <header class="area-form-dialog__header">
                <h2 id="areaFormTitle" class="area-form-dialog__title">เพิ่มพื้นที่</h2>
                <button type="button" id="closeAreaFormButton" class="area-form-dialog__close" aria-label="ปิด">×</button>
            </header>
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
                    <button type="button" id="cancelAreaButton" class="btn btn-sm btn-ghost gap-2">
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
            </div>
            </dialog>

            <div class="table-wrapper border-slate-200">
                <table class="area-table">
                    <thead>
                        <tr>
                            <th class ="border p-2 bg-blue-500 text-white">
                                NO
                            </th>
                            <th class ="border p-2">
                                Location
                            </th>
                            <th class ="border p-2">
                                Area
                            </th>
                            <th class ="border p-2">
                                Level
                            </th>
                            <th class ="border p-2">
                                Area Owner
                            </th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody id="areaTableBody"></tbody>
                </table>
            </div>

            <div id="areaTableSummary" class="table-summary">
                0 row(s)
            </div>
            <nav id="areaPagination" class="area-pagination" aria-label="Area pagination">
                <button type="button" id="previousAreaPage" class="btn btn-sm" aria-label="Previous page">ก่อนหน้า</button>
                <span id="areaPageStatus" class="area-pagination__status">หน้า 1 / 1</span>
                <button type="button" id="nextAreaPage" class="btn btn-sm" aria-label="Next page">ถัดไป</button>
            </nav>
            </div>
        </div>
    </div>

@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/gpTPHArea.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
