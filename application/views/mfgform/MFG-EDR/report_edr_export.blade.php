@extends('layouts/webflowTemplate')

@section('contents')
<style>
    #edr-export-app .edr-filter-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        border: 1px solid #cbd5e1;
    }

    #edr-export-app .edr-field {
        display: grid;
        grid-template-columns: 200px minmax(0, 1fr);
        min-width: 0;
        border-right: 1px solid #cbd5e1;
        border-bottom: 1px solid #cbd5e1;
        background: #fff;
    }

    #edr-export-app .edr-field:nth-child(3n) {
        border-right: 0;
    }

    #edr-export-app .edr-label {
        display: flex;
        align-items: center;
        min-height: 44px;
        padding: 8px 12px;
        background: #bfdbfe;
        font-weight: 600;
        color: #0f172a;
        white-space: nowrap;
    }

    #edr-export-app .edr-control {
        min-width: 0;
        padding: 4px;
    }

    #edr-export-app input,
    #edr-export-app select {
        display: block;
        width: 100% !important;
        min-width: 0 !important;
        height: 36px;
        padding: 6px 10px;
        border: 1px solid #cbd5e1;
        border-radius: 4px;
        background: #fff;
        font-size: 14px;
        outline: none;
        box-sizing: border-box;
    }

    #edr-export-app select {
        background: #fefce8;
    }

    #edr-export-app input:focus,
    #edr-export-app select:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
    }

    #edr-export-app .edr-date-field {
        grid-column: span 2;
        grid-template-columns: 200px minmax(0, 1fr);
    }

    #edr-export-app .edr-date-controls {
        display: grid;
        grid-template-columns: 60px minmax(0, 1fr) 40px minmax(0, 1fr);
        align-items: center;
        gap: 8px;
        min-width: 0;
        padding: 4px;
    }

    #edr-export-app .edr-date-text {
        text-align: center;
        font-weight: 600;
        color: #1e293b;
    }

    @media (max-width: 1200px) {
        #edr-export-app .edr-filter-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        #edr-export-app .edr-field:nth-child(3n) {
            border-right: 1px solid #cbd5e1;
        }

        #edr-export-app .edr-field:nth-child(2n) {
            border-right: 0;
        }

        #edr-export-app .edr-date-field {
            grid-column: span 2;
        }
    }

    @media (max-width: 768px) {
        #edr-export-app .edr-filter-grid {
            grid-template-columns: 1fr;
        }

        #edr-export-app .edr-field,
        #edr-export-app .edr-date-field {
            grid-column: span 1;
            grid-template-columns: 140px minmax(0, 1fr);
            border-right: 0;
        }

        #edr-export-app .edr-date-controls {
            grid-template-columns: 50px minmax(0, 1fr);
        }
    }
</style>

<div id="edr-export-app" class="min-h-screen bg-slate-100 p-3">
    <div class="w-full rounded-lg border border-slate-200 bg-white p-3 shadow-md">

        <div class="mb-2 flex h-16 items-center justify-center bg-blue-200">
            <h1 class="text-2xl font-bold text-slate-900">MFG E-Daily Report</h1>
        </div>

        <form id="form-edr-export" autocomplete="off">
            <div class="edr-filter-grid">

                <div class="edr-field">
                    <label for="txt-request-by" class="edr-label">Request By</label>
                    <div class="edr-control">
                        <input type="text" id="txt-request-by" name="request_by" maxlength="5" placeholder="Ex.15199">
                    </div>
                </div>

                <div class="edr-field">
                    <label for="txt-repair-by" class="edr-label">Repair By</label>
                    <div class="edr-control">
                        <input type="text" id="txt-repair-by" name="repair_by" maxlength="5" placeholder="Ex.15199">
                    </div>
                </div>

                <div class="edr-field">
                    <label for="txt-daily-report-no" class="edr-label">Daily Report no</label>
                    <div class="edr-control">
                        <input type="text" id="txt-daily-report-no" name="daily_report_no" placeholder="Ex.EAS-AUG-24003">
                    </div>
                </div>

                <div class="edr-field">
                    <label for="ddl-work-type" class="edr-label">ประเภทของงาน</label>
                    <div class="edr-control">
                        <select id="ddl-work-type" name="work_type">
                            <option value="">--- Please select ---</option>
                        </select>
                    </div>
                </div>

                <div class="edr-field">
                    <label for="ddl-initial-cause" class="edr-label">สาเหตุ (เบื้องต้น)</label>
                    <div class="edr-control">
                        <select id="ddl-initial-cause" name="initial_cause">
                            <option value="">--- Please select ---</option>
                        </select>
                    </div>
                </div>

                <div class="edr-field">
                    <label for="ddl-responsible-section" class="edr-label">แผนกที่รับผิดชอบ</label>
                    <div class="edr-control">
                        <select id="ddl-responsible-section" name="responsible_section">
                            <option value="">--- Please select ---</option>
                        </select>
                    </div>
                </div>

                <div class="edr-field">
                    <label for="txt-order-no" class="edr-label">Order no</label>
                    <div class="edr-control">
                        <input type="text" id="txt-order-no" name="order_no" placeholder="Ex.EYEQ74052">
                    </div>
                </div>

                <div class="edr-field">
                    <label for="txt-drawing-no" class="edr-label">Drawing no</label>
                    <div class="edr-control">
                        <input type="text" id="txt-drawing-no" name="drawing_no" placeholder="Ex.YA252C596-01">
                    </div>
                </div>

                <div class="edr-field">
                    <label for="txt-item-no" class="edr-label">Item no</label>
                    <div class="edr-control">
                        <input type="text" id="txt-item-no" name="item_no" placeholder="Ex.375">
                    </div>
                </div>

                <div class="edr-field edr-date-field">
                    <label class="edr-label">Request Date</label>

                    <div class="edr-date-controls">
                        <label for="txt-request-date-from" class="edr-date-text">From</label>
                        <input type="date" id="txt-request-date-from" name="request_date_from">

                        <label for="txt-request-date-to" class="edr-date-text">To</label>
                        <input type="date" id="txt-request-date-to" name="request_date_to">
                    </div>
                </div>

                <div class="edr-field">
                    <label for="ddl-form-status" class="edr-label">Form Status</label>
                    <div class="edr-control">
                        <select id="ddl-form-status" name="form_status">
                            <option value="">All</option>
                            <option value="1">Running</option>
                            <option value="2">Approved</option>
                            <option value="3">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="flex items-center justify-center gap-10 py-6">
                <button type="submit"
                    id="btn-export-excel"
                    class="min-w-[140px] rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700">
                    Export Excel
                </button>

                <button type="button"
                    id="btn-clear-filter"
                    class="min-w-[140px] rounded-full bg-amber-400 px-6 py-3 font-semibold text-slate-900 transition hover:bg-amber-500">
                    Clear data
                </button>
            </div>
        </form>
    </div>
</div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/mfg_edr_report.js?ver={{ $GLOBALS['version'] }}"></script>             
@endsection