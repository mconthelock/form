@extends('layouts/webflowTemplate')
@section('contents')
    <script>window.baseUrl = "{{ base_url() }}";</script>
    <script src="{{ base_url() }}assets/dist/js/show_sum_report.js"></script>
    
    <style>
        .tabulator-alert,
        .tabulator-alert-msg,
        .tabulator-alert-state-msg {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
        }
    </style>
    <input type="hidden" id="EMPNO" value="{{ $EMPNO }}">
    <div class="min-h-screen bg-gray-100 py-4 px-4">
        <div class="w-full bg-white shadow-lg rounded-xl p-8">
            <center>
                <h2 class="text-2xl font-bold mb-6 text-indigo-600 border-b pb-3">
                    Summary of Domestic Training / Outside Learning
                </h2>
            </center>

            <div class="flex justify-between items-center mb-6">
                <!-- 🔙 ปุ่ม Back -->
                <button 
                    onclick="window.location.href='{{ base_url() }}gpform/GP-TRN/training?empno={{ $EMPNO }}';"
                    class="px-4 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700 transition">
                    ⬅️ กลับไปเลือกฟอร์ม
                </button>

                <div class="flex space-x-2">
                    <!-- 🔍 ปุ่มค้นหา -->
                    <button 
                        class="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
                        onclick="document.getElementById('filterModal').showModal();">
                        🔍 เงื่อนไขการค้นหา
                    </button>

                    <!-- ⬇️ Export Excel -->
                    <button id="report_excel"
                        class="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition">
                        ⬇️ Export Excel
                    </button>
                </div>
            </div>

            <!-- Table Container -->
            <div class="border rounded-xl shadow-sm bg-white overflow-hidden">
                <table id="report_table"></table>
            </div>
        </div>
    </div>

    <!-- 🔵 Popup Modal (Native <dialog>) -->
    <dialog id="filterModal" class="rounded-xl p-6 w-[450px] shadow-xl">
        <h3 class="text-xl font-semibold mb-4 text-indigo-700">เงื่อนไขการค้นหา</h3>
        <div class="mb-4">
            <label class="text-sm font-semibold">From</label>
            <input type="date" id="filter_from" class="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm" />
        </div>

        <div class="mb-4">
            <label class="text-sm font-semibold">To</label>
            <input type="date" id="filter_to" class="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm" />
        </div>

        <!-- Training Type -->
        <div class="mb-4">
            <label class="text-sm font-semibold">Training Type</label>
            <select id="filter_type" class="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm">
                <option value="">-- All Type --</option>
                @foreach ($FORM_TYPE as $row)
                    <option value="{{ $row->FID }}">{{ $row->FORM_NAME_EN }}</option>
                @endforeach
            </select>
        </div>

        <!-- EMPNO -->
        <div class="mb-4">
            <label class="text-sm font-semibold">Emp No (5 digits)</label>
            <input type="text" maxlength="5" id="filter_empno"
                class="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm"
                placeholder="ex.12345"
                oninput="this.value = this.value.replace(/[^0-9]/g, '').slice(0,5);" />
        </div>

        <!-- SEC -->
        <div class="mb-4">
            <label class="text-sm font-semibold">Section</label>
            <select id="filter_sec" class="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm">
                <option value="">-- All SEC --</option>
                @foreach ($DATA_SEC as $sec)
                    <option value="{{ $sec->SSECCODE }}">{{ $sec->SSEC }}</option>
                @endforeach
            </select>
        </div>

        <!-- DEPT -->
        <div class="mb-4">
            <label class="text-sm font-semibold">Department</label>
            <select id="filter_dept" class="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm">
                <option value="">-- All DEPT --</option>
                @foreach ($DATA_DEPT as $dept)
                    <option value="{{ $dept->SDEPCODE }}">{{ $dept->SDEPT }}</option>
                @endforeach
            </select>
        </div>

        <!-- DIV -->
        <div class="mb-4">
            <label class="text-sm font-semibold">Division</label>
            <select id="filter_div" class="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm">
                <option value="">-- All DIV --</option>
                @foreach ($DATA_DIV as $div)
                    <option value="{{ $div->SDIVCODE }}">{{ $div->SDIV }}</option>
                @endforeach
            </select>
        </div>

        <div class="flex justify-end space-x-2 mt-4">
            <button class="px-4 py-2 bg-gray-400 text-white rounded-lg" onclick="filterModal.close();">
                ปิด
            </button>

            <button id="btnSearchSubmit" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                ค้นหา
            </button>
        </div>
    </dialog>

    <!-- ⭐ JS -->
    <script>
        initFormReport();

        document.getElementById("btnSearchSubmit").addEventListener("click", function () {
            filterModal.close();
            setTimeout(() => {
                window.loadReportData();
            }, 100);
        });
    </script>

@endsection
