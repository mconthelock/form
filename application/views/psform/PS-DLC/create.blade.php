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
                Drawing List for change PN Master
            </h1>
        </div>

        <form class="p-6 md:p-8 space-y-8" id="dlcForm">

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <fieldset class="fieldset w-full">
                    <legend class="fieldset-legend text-primary text-lg">Input By</legend>
                    <input type="text" placeholder="Enter input by..."
                        class="input input-bordered transition-all duration-200 focus:input-primary w-full" id="INPUTBY"
                        name="INPUTBY" readonly />
                </fieldset>

                <fieldset class="fieldset w-full">
                    <legend class="fieldset-legend text-primary text-lg">Name</legend>
                    <input type="text" placeholder="Enter name..."
                        class="input input-bordered transition-all duration-200 focus:input-primary w-full" id="inputName"
                        readonly />
                </fieldset>

                <fieldset class="fieldset w-full">
                    <legend class="fieldset-legend text-primary text-lg">Request By</legend>
                    <input type="text" placeholder="Enter request by..."
                        class="input input-bordered w-full transition-all duration-200 focus:input-primary req"
                        id="REQBY" name="REQBY" />
                </fieldset>

                <fieldset class="fieldset w-full">
                    <legend class="fieldset-legend text-primary text-lg">Name</legend>
                    <input type="text" placeholder="Enter name..."
                        class="input input-bordered transition-all duration-200 focus:input-primary w-full" id="reqName"
                        readonly />
                </fieldset>

                <fieldset class="fieldset w-full">
                    <div>
                        <legend class="fieldset-legend text-primary text-lg flex items-center gap-2">
                            Upload Data
                            <a class="link link-info inline-flex items-center gap-1" id="linkdownload">
                                Template
                                <svg class="w-6 h-6 text-info" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                    width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                    <path fill-rule="evenodd"
                                        d="M13 11.15V4a1 1 0 1 0-2 0v7.15L8.78 8.374a1 1 0 1 0-1.56 1.25l4 5a1 1 0 0 0 1.56 0l4-5a1 1 0 1 0-1.56-1.25L13 11.15Z"
                                        clip-rule="evenodd" />
                                    <path fill-rule="evenodd"
                                        d="M9.657 15.874 7.358 13H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2.358l-2.3 2.874a3 3 0 0 1-4.685 0ZM17 16a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H17Z"
                                        clip-rule="evenodd" />
                                </svg>
                            </a>
                        </legend>
                    </div>
                    <input type="file"
                        class="file-input file-input-bordered transition-all duration-200 focus:input-primary w-full req"
                        id="fileUpload" accept=".xlsx,.xlsm" />
                </fieldset>

                <!-- Example (Schedule) -->
                <fieldset class="fieldset w-full">
                    <legend class="fieldset-legend text-primary text-lg">Changed Schedule</legend>
                    <div class="flex gap-2">
                        <input type="text"
                            class="input input-bordered transition-all duration-200 focus:input-primary w-full req"
                            id="schd_txt" name="CHANGE_SCHD" readonly />
                        <input type="text" class="input hidden" id="schd_number" readonly />
                        <input type="text"
                            class="input hidden input-bordered transition-all duration-200 focus:input-primary w-full req"
                            id="schd_p" readonly />
                        <button class="btn btn-neutral" type="button" id="openDatePicker">
                            <i class="fi fi-rr-calendar">
                            </i>
                        </button>
                        <input type="hidden" id="selectedDate" name="CHANGE_DATE" value="" class="fdate w-0" />
                    </div>
                </fieldset>
                <!-- End -->
            </div>

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
                <div id="sentRequest"></div>
            </div>

        </form>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/psDLC.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
