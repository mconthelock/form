@extends('layouts/webflowTemplate')

@section('styles')
    <style>
        .dlc-table-wrap table.dataTable,
        .dlc-table-wrap #Table {
            border-collapse: separate !important;
            border-spacing: 0 !important;
        }

        .dlc-table-wrap table.dataTable th,
        .dlc-table-wrap table.dataTable td,
        .dlc-table-wrap #Table th,
        .dlc-table-wrap #Table td {
            border: 0.5px solid color-mix(in oklch, var(--color-primary) 22%, white) !important;
            padding: 0.75rem 0.875rem !important;
            color: var(--color-base-content);
        }

        .dlc-table-wrap table.dataTable thead th,
        .dlc-table-wrap #Table thead th {
            background: color-mix(in oklch, var(--color-white) 12%, white);
            color: var(--color-primary);
            font-weight: 700;
            text-align: center;
            vertical-align: middle;
            white-space: nowrap;
        }

        .dlc-table-wrap table.dataTable thead tr:first-child th,
        .dlc-table-wrap #Table thead tr:first-child th {
            border-color: color-mix(in oklch, var(--color-primary) 72%, black) !important;
            background-color: var(--color-primary);
            color: var(--color-white);
        }

        .dlc-table-wrap table.dataTable thead tr:first-child th:first-child {
            border-top-left-radius: 0.625rem;
        }

        .dlc-table-wrap table.dataTable thead tr:first-child th:last-child {
            border-top-right-radius: 0.625rem;
        }

        .dlc-table-wrap .dataTables_scrollBody table.dataTable {
            border-top: 0 !important;
        }
    </style>
@endsection

@section('contents')
    <div class="w-full max-w-7xl mx-auto bg-base-100 rounded-2xl shadow-xl overflow-hidden">

        <div class="bg-primary text-primary-content p-6">
            <h1
                class="text-xl md:text-3xl font-bold text-center text-white flex flex-wrap items-center justify-center gap-2">
                <svg class="h-9 w-9 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                    width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 4h3a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3m0 3h6m-3 5h3m-6 0h.01M12 16h3m-6 0h.01M10 3v4h4V3h-4Z" />
                </svg>
                Drawing List for change PN Master | REPORT
            </h1>
        </div>

        <form class="p-6 md:p-8 space-y-8" id="dlcForm">

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

                <fieldset class="fieldset w-full">
                    <legend class="fieldset-legend text-primary text-lg">DRAWING NO</legend>
                    <input type="text" placeholder="Enter drawing..."
                        class="input input-bordered transition-all duration-200 focus:input-primary w-full"
                        id="drawing" />
                </fieldset>

                <fieldset class="fieldset w-full">
                    <legend class="fieldset-legend text-primary text-lg">NEW CODE</legend>
                    <input type="text" placeholder="Enter code..."
                        class="input input-bordered transition-all duration-200 focus:input-primary w-full"
                        id="newcode" />
                </fieldset>

                <fieldset class="fieldset w-full">
                    <legend class="fieldset-legend text-primary text-lg">OLD CODE</legend>
                    <input type="text" placeholder="Enter code..."
                        class="input input-bordered w-full transition-all duration-200 focus:input-primary "
                        id="oldcode" />
                </fieldset>

                <!-- Example (Schedule) -->
                <fieldset class="fieldset w-full">
                    <legend class="fieldset-legend text-primary text-lg">Production</legend>
                    <div class="flex gap-2">
                        <input type="text"
                            class="input input-bordered transition-all duration-200 focus:input-primary w-full "
                            id="schd_txt" name="CHANGE_SCHD" readonly />
                        <button class="btn btn-neutral" type="button" id="openDatePicker">
                            <i class="fi fi-rr-calendar">
                            </i>
                        </button>
                        <input type="hidden" id="selectedDate" name="CHANGE_DATE" value="" class="fdate w-0" />
                    </div>
                </fieldset>
                <!-- End -->
            </div>

            <button type="button" id="btnSearch" class="btn btn-info  border-none min-w-[140px] shadow-md transition-all">
                <svg class="w-6 h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                    width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z" />
                    <path fill-rule="evenodd"
                        d="M21.707 21.707a1 1 0 0 1-1.414 0l-3.5-3.5a1 1 0 0 1 1.414-1.414l3.5 3.5a1 1 0 0 1 0 1.414Z"
                        clip-rule="evenodd" />
                </svg>
                Search
            </button>

            <button type="reset" id="btnReset"
                class="btn btn-warning btn-soft  border-none min-w-[140px] shadow-md transition-all">
                <svg class="w-6 h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                    width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17.651 7.65a7.131 7.131 0 0 0-12.68 3.15M18.001 4v4h-4m-7.652 8.35a7.13 7.13 0 0 0 12.68-3.15M6 20v-4h4" />
                </svg>

                Reset Data
            </button>

            <button type="button" id="btnExport"
                class="btn btn-success btn-soft  border-none min-w-[140px] shadow-md transition-all">
                <svg class="w-6 h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                    width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd"
                        d="M9 7V2.221a2 2 0 0 0-.5.365L4.586 6.5a2 2 0 0 0-.365.5H9Zm2 0V2h7a2 2 0 0 1 2 2v9.293l-2-2a1 1 0 0 0-1.414 1.414l.293.293h-6.586a1 1 0 1 0 0 2h6.586l-.293.293A1 1 0 0 0 18 16.707l2-2V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9h5a2 2 0 0 0 2-2Z"
                        clip-rule="evenodd" />
                </svg>

                Export Data
            </button>

            <div class="divider"></div>

            <div class="w-full">
                <h3 class="text-lg text-primary font-bold mb-4 flex">
                    <svg class="w-[28px] h-[28px]  text-primary" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                        width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path fill-rule="evenodd"
                            d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6Zm2 8v-2h7v2H4Zm0 2v2h7v-2H4Zm9 2h7v-2h-7v2Zm7-4v-2h-7v2h7Z"
                            clip-rule="evenodd" />
                    </svg>
                    Data Table
                </h3>


                <div class="overflow-x-auto dlc-table-wrap w-full px-2 md:px-4 py-3">
                    <table class="table table-zebra w-full whitespace-nowrap" id="Table">
                    </table>
                </div>
            </div>

            <div class="mt-8 pt-6 border-t border-base-300 ">
                <fieldset class="fieldset w-full hidden" id="controller-section">
                    <legend class="fieldset-legend font-bold text-base-content/80"><span
                            class="w-1.5 h-1.5 bg-primary rounded-full"></span>Job Controller</span>
                    </legend>
                    <select class="select req w-full focus:select-primary max-w-xs" id="CONTROLLER" name="CONTROLLER">
                    </select>
                </fieldset>

                <div id="sentApprove"></div>
            </div>

        </form>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/prDLCreport.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
