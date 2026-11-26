<header class="flex items-center gap-3 px-4 py-3 border-b border-gray-300">
    <span class="bg-black text-white h-8 w-8 flex items-center justify-center text-base font-mono font-bold">04</span>
    <div>
        <h2 class="font-mono font-bold text-lg text-gray-700 uppercase">Investment in Equipment</h2>
        <div class="text-sm text-gray-500">การลงทุนอุปกรณ์และฮาร์ดแวร์เพิ่มเติม</div>
    </div>
</header>
<div class="bg-white p-5">
    <div class="table-wrap overflow-x-auto">
        <label class="label mb-5 {{ isset($view) ? 'hidden' : '' }}">
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
                        @if (!isset($view))
                            <th width="50px"></th>
                        @endif
                    </tr>
                </thead>
                <tbody>
                </tbody>
                <tfoot class="bg-primary/20">
                    <tr>
                        <th>Total</th>
                        <td></td>
                        <td></td>
                        <td><input type="text" class="text-end outline-0 w-full" readonly id="total-investment-cost">
                        </td>
                        @if (!isset($view))
                            <td></td>
                        @endif
                    </tr>
                </tfoot>
            </table>
        </div>
        <div class="flex mt-3 {{ isset($view) ? 'hidden' : '' }}">
            <button class="btn btn-outline btn-primary" id="add-row-investment"><i class="fi fi-tr-multiple"></i>+ More
                Item</button>
        </div>
    </div>
</div>
