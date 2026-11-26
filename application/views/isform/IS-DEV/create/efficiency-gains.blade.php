<header class="flex items-center gap-3 px-4 py-3 border-b border-gray-300">
    <span class="bg-black text-white h-8 w-8 flex items-center justify-center text-base font-mono font-bold">03</span>
    <div>
        <h2 class="font-mono font-bold text-lg text-gray-700 uppercase">Efficiency Gains</h2>
        <div class="text-sm text-gray-500">การลดเวลาและค่าใช้จ่ายด้านกำลังคน</div>
    </div>
</header>
<div class="bg-white p-5">
    <div class="table-wrap overflow-x-auto">
        <label class="label mb-5 {{ isset($view) ? 'hidden' : '' }}">
            <input type="checkbox" class="checkbox checkbox-primary" id="not-improve-manpower" />
            <span class="label-text">This project is not improve manpower / โครงการนี้ไม่ได้ปรับปรุงด้านกำลังคน</span>
        </label>
        <div class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
            <table class="table table-edit text-xs" id="table-labor">
                <thead class="bg-primary text-sm text-white">
                    <tr class="text-center">
                        <th rowspan="2">Postion</th>
                        <th rowspan="2" class="w-[15%] text-wrap">Cost</th>
                        <th colspan="2" class="text-center">Condition (Hrs/Year)</th>
                        <th rowspan="2" class="w-[15%] text-wrap">Comparision (1-2)</th>
                        <th rowspan="2" class="w-[15%] text-wrap">Reduce Cost</th>
                        @if (!isset($view))
                            <th rowspan="2" width="50px"></th>
                        @endif
                    </tr>
                    <tr>
                        <th class="w-[15%] text-wrap">Present Status (1)</th>
                        <th class="w-[15%] text-wrap">After Improvement (2)</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
                <tfoot class="bg-primary/20">
                    <tr>
                        <th>Total</th>
                        <td></td>
                        <td><input type="text" class="text-end outline-0 w-full total-present" readonly></td>
                        <td><input type="text" class="text-end outline-0 w-full total-future" readonly></td>
                        <td><input type="text" class="text-end outline-0 w-full total-time" readonly></td>
                        <td><input type="text" class="text-end outline-0 w-full total-labor" readonly></td>
                        @if (!isset($view))
                            <td></td>
                        @endif
                    </tr>
                </tfoot>
            </table>
        </div>
        <div class="flex mt-3 {{ isset($view) ? 'hidden' : '' }}">
            <button class="btn btn-outline btn-primary" id="add-row-labor">+ More Row</button>
        </div>
    </div>
</div>
