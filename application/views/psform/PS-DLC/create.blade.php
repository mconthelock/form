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
            border: 1px solid color-mix(in oklch, var(--color-primary) 22%, white) !important;
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
            <h1 class="text-xl md:text-3xl font-bold text-center text-white flex flex-wrap items-center justify-center gap-2">
                <svg class="h-9 w-9 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                    width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 4h3a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3m0 3h6m-3 5h3m-6 0h.01M12 16h3m-6 0h.01M10 3v4h4V3h-4Z" />
                </svg>
                Drawing List for change PN Master
            </h1>
        </div>

        <form class="p-6 md:p-8 space-y-8" id="dlcForm">

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="form-control w-full">
                    <label class="label text-primary"><span class="label-text font-semibold">Input By</span></label>
                    <input type="text" placeholder="Enter input by..."
                        class="input input-bordered transition-all duration-200 focus:input-primary w-full " id="INPUTBY"
                        readonly />
                </div>
                <div class="form-control w-full">
                    <label class="label text-primary"><span class="label-text font-semibold">Name</span></label>
                    <input type="text" placeholder="Enter name..."
                        class="input input-bordered transition-all duration-200 focus:input-primary w-full" id="inputName"
                        readonly />
                </div>

                <div class="form-control w-full">
                    <label class="label text-primary"><span class="label-text font-semibold">Request By</span></label>
                    <input type="text" placeholder="Enter request by..."
                        class="input input-bordered w-full transition-all duration-200 focus:input-primary req"
                        id="REQBY" />
                </div>
                <div class="form-control w-full">
                    <label class="label text-primary"><span class="label-text font-semibold">Name</span></label>
                    <input type="text" placeholder="Enter name..."
                        class="input input-bordered transition-all duration-200 focus:input-primary w-full"
                        id="reqName" />
                </div>

                <div class="form-control w-full">
                    <label class="label text-primary"><span class="label-text font-semibold">Changed Schedule</span></label>
                    <input type="text"
                        class="input input-bordered transition-all duration-200 focus:input-primary w-full req"
                        id="chgSch" />
                </div>

                <div class="form-control w-full">
                    <label class="label text-primary"><span class="label-text font-semibold">Upload Data</span></label>
                    <input type="file"
                        class="file-input file-input-bordered transition-all duration-200 focus:input-primary w-full req"
                        id="fileUpload" accept=".xlsx,.xlsm" />
                </div>
            </div>

            <div class="divider"></div>

            <div class="w-full">
                <h3 class="text-lg font-bold mb-4">Data Table</h3>

                <!-- แก้ไขตรงนี้: เปลี่ยน overflow-hidden เป็น overflow-x-auto -->
                <div class="overflow-x-auto dlc-table-wrap w-full px-2 md:px-4 py-3">
                    <!-- ลบ overflow-x ออก และอาจจะเพิ่ม whitespace-nowrap ถ้าไม่อยากให้ข้อความในตารางตัดขึ้นบรรทัดใหม่ -->
                    <table class="table table-zebra w-full whitespace-nowrap" id="Table">
                        <!-- ข้อมูลตารางของคุณ -->
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
