<label class="label mb-5">
    <input type="checkbox" class="checkbox checkbox-primary" id="not-improve-investment" />
    <span class="label-text">This project does not need more Equipment / โครงการนี้ไม่มีการเพิ่มอุปกรณ์</span>
</label>
<div class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
    <table class="table table-edit text-xs" id="table-investment">
        <thead class="bg-primary text-sm text-white">
            <tr class="text-center">
                <th>Item</th>
                <th class="w-[10%]">Qty</th>
                <th class="w-[20%]">Standard Cost</th>
                <th class="w-[20%]">Total Cost</th>
                <th width="50px"></th>
            </tr>
        </thead>
        <tbody>
        </tbody>
        <tfoot class="bg-primary/20">
            <tr>
                <th>Total</th>
                <td></td>
                <td></td>
                <td><input type="text" class="text-end outline-0 w-full" readonly id="total-investment-cost"></td>
                <td></td>
            </tr>
        </tfoot>
    </table>
</div>
<div class="flex mt-3 ">
    <button class="btn btn-outline btn-primary" id="add-row-investment"><i class="fi fi-tr-multiple"></i>+ More
        Item</button>
</div>
