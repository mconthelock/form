<label class="label mb-5">
    <input type="checkbox" class="checkbox checkbox-primary" id="not-improve-manpower" />
    <span class="label-text">This project is not improve manpower / โครงการนี้ไม่ได้ปรับปรุงด้านกำลังคน</span>
</label>
<div class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">

    <table class="table table-edit text-xs" id="table-labor">
        <thead class="bg-primary text-sm text-white">
            <tr class="text-center">
                <th rowspan="2">Postion</th>
                <th rowspan="2" class="w-[15%] text-wrap">Cost</th>
                <th colspan="2">Condition (Hrs/Year)</th>
                <th rowspan="2" class="w-[15%] text-wrap">Comparision (1-2)</th>
                <th rowspan="2" class="w-[15%] text-wrap">Reduce Cost</th>
                <th rowspan="2" width="50px"></th>
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
                <td></td>
            </tr>
        </tfoot>
    </table>
</div>
<div class="flex mt-3 ">
    <button class="btn btn-outline btn-primary" id="add-row-labor">+ More Row</button>
</div>
