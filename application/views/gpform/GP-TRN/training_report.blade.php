<div class="min-h-screen bg-gray-100 py-4 px-4">
    <div class="w-full bg-white shadow-lg rounded-xl p-8">
        
        <center>
            <h2 class="text-2xl font-bold mb-6 text-indigo-600 border-b pb-3">
                Summary of Domestic Training / Outside Learning
            </h2>
        </center>

        <!-- FILTER MAIN -->
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">

            <div>
                <label class="text-sm font-semibold text-gray-600">Training Type</label>
                <select id="report_type"
                    class="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm focus:ring focus:ring-indigo-200">
                    <option value="">-- All Type --</option>
                    @foreach ($FORM_TYPE as $row)
                        <option value="{{ $row->FID }}">{{ $row->FORM_NAME_EN }}</option>
                    @endforeach
                </select>
            </div>

            <div>
                <label class="text-sm font-semibold text-gray-600">From</label>
                <input type="date" id="report_from"
                    class="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm focus:ring focus:ring-indigo-200" />
            </div>

            <div>
                <label class="text-sm font-semibold text-gray-600">To</label>
                <input type="date" id="report_to"
                    class="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm focus:ring focus:ring-indigo-200" />
            </div>

            <div class="flex items-end space-x-2">
                <button id="report_search"
                    class="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition">
                    🔍 ค้นหา
                </button>
                <button id="report_excel"
                    class="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition">
                    ⬇️ Export Excel
                </button>
            </div>

            <div class="flex items-end">
                <button onclick="toggleFilterPanel()"
                    class="px-4 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700 transition">
                    ⚙️ เงื่อนไขเพิ่มเติม
                </button>
            </div>
        </div>

        <!-- ADVANCED FILTER SECTION (hidden by default) -->
        <div id="filter_advanced"
            class="hidden border rounded-xl p-4 bg-gray-50 mb-6 shadow-inner">

            <h3 class="text-lg font-bold text-gray-700 mb-4">Advanced Filter</h3>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <!-- Emp Code -->
                <div>
                    <label class="text-sm font-semibold text-gray-600">Emp Code (5 digits)</label>
                    <input type="text" id="report_empcode" maxlength="5"
                        class="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm focus:ring focus:ring-indigo-200"
                        oninput="this.value=this.value.replace(/[^0-9]/g,'')" />
                </div>

                <!-- Sec -->
                <div>
                    <label class="text-sm font-semibold text-gray-600">Sect.</label>
                    <select id="report_sec"
                        class="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm focus:ring focus:ring-indigo-200">
                        <option value="">-- Select Sect --</option>
                        @foreach($DATA_SEC as $s)
                            <option value="{{ $s->SSECCODE }}">{{ $s->SSEC }}</option>
                        @endforeach
                    </select>
                </div>

                <!-- Dept -->
                <div>
                    <label class="text-sm font-semibold text-gray-600">Dept.</label>
                    <select id="report_dept"
                        class="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm focus:ring focus:ring-indigo-200">
                        <option value="">-- Select Dept --</option>
                        @foreach($DATA_DEPT as $d)
                            <option value="{{ $d->SDEPTCODE }}">{{ $d->SDEPT }}</option>
                        @endforeach
                    </select>
                </div>

                <!-- Div -->
                <div>
                    <label class="text-sm font-semibold text-gray-600">Div.</label>
                    <select id="report_div"
                        class="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm focus:ring focus:ring-indigo-200">
                        <option value="">-- Select Div --</option>
                        @foreach($DATA_DIV as $v)
                            <option value="{{ $v->SDIVCODE }}">{{ $v->SDIV }}</option>
                        @endforeach
                    </select>
                </div>
            </div>
        </div>

        <!-- TABLE -->
        <div class="border rounded-xl shadow-sm bg-white overflow-hidden">
            <div id="report_table"></div>
        </div>

    </div>
</div>

<script>
function toggleFilterPanel() {
    const panel = document.getElementById('filter_advanced');
    panel.classList.toggle('hidden');
}

initFormReport();
</script>
@endsection
