<div class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
    <table class="table table-edit text-xs">
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
            <tr>
                <th>
                    <select class="select w-full" id="select-device">
                        <option></option>
                    </select>
                </th>
                <td><input type="text" value="1"></td>
                <td><input type="text"></td>
                <td><input type="text"></td>
                <td class="text-center"><button type="button" class="btn btn-sm btn-error remove-row">X</button></td>
            </tr>
        </tbody>
        <tfoot class="bg-primary/20">
            <tr>
                <th>Total</th>
                <td></td>
                <td></td>
                <td></td>
                <th></th>
            </tr>
        </tfoot>
    </table>
</div>
