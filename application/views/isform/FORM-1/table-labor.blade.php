<div class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
    <table class="table table-edit text-xs">
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
            <tr>
                <th>
                    <select class="select w-full" id="select-position">
                        <option disabled selected>Select a position</option>
                    </select>
                </th>
                <td><input type="text" class="input-number input-labor"></td>
                <td><input type="text" class="input-number input-labor"></td>
                <td><input type="text" class="input-number input-labor"></td>
                <td><input type="text" class="input-number input-labor" readonly></td>
                <td><input type="text" class="input-number input-labor" readonly></td>
                <td class="text-center"><button type="button" class="btn btn-sm btn-error remove-row">X</button></td>
            </tr>
        </tbody>
        <tfoot class="bg-primary/20">
            <tr>
                <th>Total</th>
                <td></td>
                <td><input type="text" class="text-end outline-0 w-full" readonly></td>
                <td><input type="text" class="text-end outline-0 w-full" readonly></td>
                <td><input type="text" class="text-end outline-0 w-full" readonly></td>
                <td><input type="text" class="text-end outline-0 w-full" readonly></td>
                <td></td>
            </tr>
        </tfoot>
    </table>
</div>
