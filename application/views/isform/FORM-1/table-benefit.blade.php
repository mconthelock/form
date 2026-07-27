<div class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
    <table class="table table-edit text-xs" id="table-benefit">
        <thead class="bg-primary text-sm text-white">
            <tr>
                <th rowspan="2" colspan="2" class="text-center">Item</th>
                <th colspan="2" class="text-center">Condition (KB)</th>
                <th rowspan="2" class="w-[20%] text-nowrap text-center">Comparision (1-2)</th>
            </tr>
            <tr>
                <th class="w-[20%] text-nowrap text-center">Present Status (1)</th>
                <th class="w-[20%] text-nowrap text-center">After Improvement (2)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <th colspan="2">
                    <div>Running Cost</div>
                    <div class="text-gray-500 font-normal mt-1">Reduce the use of disposable materials.
                        (Paperless/Electricity Bill) / ลดการใช้ทรัพยากรสิ้นเปลือง เช่น กระดาษ/ค่าไฟฟ้า </div>
                </th>
                <td class="bg-primary-content">
                    <input type="text" class="input-number input-benefit present-cost" />
                </td>
                <td class="bg-primary-content">
                    <input type="text" class="input-number input-benefit future-cost" />
                </td>
                <td><input type="text" class="subtotal-cost" readonly /></td>
            </tr>
            <tr>
                <th colspan="2">
                    <div>Production Volumn/Output</div>
                    <div class="text-gray-500 font-normal mt-1">Increase production efficiency. /
                        เพิ่มประสิทธิภาพการผลิต
                    </div>
                </th>
                <td class="bg-primary-content">
                    <input type="text" class="input-number input-benefit present-cost" />
                </td>
                <td class="bg-primary-content">
                    <input type="text" class="input-number input-benefit future-cost" />
                </td>
                <td><input type="text" class="subtotal-cost" readonly /></td>
            </tr>
            <tr>
                <th colspan="2">
                    <div>Lost (Material/Order)</div>
                    <div class="text-gray-500 font-normal mt-1">Reduce errors that lead to additional
                        costs. / ลดการสูญเสียหรือข้อผิดพลาดที่นำไปสู่ค่าใช้จ่ายเพิ่มเติม</div>
                </th>
                <td class="bg-primary-content">
                    <input type="text" class="input-number input-benefit present-cost" />
                </td>
                <td class="bg-primary-content">
                    <input type="text" class="input-number input-benefit future-cost" />
                </td>
                <td><input type="text" class="subtotal-cost" readonly /></td>
            </tr>
            <tr>
                <th rowspan="2">
                    <div>Manpower</div>
                    <div class="text-gray-500 font-normal mt-1">Improve employee performance. /
                        เพิ่มประสิทธิภาพการทำงานของพนักงาน</div>
                </th>
                <th>
                    <div>Labor Cost</div>
                    <div class="text-gray-500 font-normal mt-1">*คำนวณจาก Efficiency Gains</div>
                </th>
                <td class="">
                    <input type="text" class="input-number input-benefit present-cost" id="labor-present-benefit"
                        readonly />
                </td>
                <td class="">
                    <input type="text" class="input-number input-benefit future-cost" id="labor-future-benefit"
                        readonly />
                </td>
                <td><input type="text" class="subtotal-cost" id="labor-total-benefit" readonly /></td>
            </tr>
            <tr>
                <th class="text-nowrap">Subcon/Outsource Cost</th>
                <td class="bg-primary-content">
                    <input type="text" class="input-number input-benefit present-cost" />
                </td>
                <td class="bg-primary-content">
                    <input type="text" class="input-number input-benefit future-cost" />
                </td>
                <td><input type="text" class="subtotal-cost" readonly /></td>
            </tr>
            <tr>
                <th rowspan="4">
                    <div>Other</div>
                    <div class="text-gray-500 font-normal mt-1">Support miscellaneous tasks / Compliance / Audit etc. /
                        สนับสนุนงานอื่น ๆ ที่เกี่ยวข้อง เช่น งาน Compliance / Audit เป็นต้น
                    </div>
                </th>
                <th>Preparing Cost</th>
                <td class="bg-primary-content">
                    <input type="text" class="input-number input-benefit present-cost" />
                </td>
                <td class="bg-primary-content">
                    <input type="text" class="input-number input-benefit future-cost" />
                </td>
                <td><input type="text" class="subtotal-cost" readonly /></td>
            </tr>
            <tr>
                <th>Equipment Cost</th>
                <td class="bg-primary-content">
                    <input type="text" class="input-number input-benefit present-cost" />
                </td>
                <td class="bg-primary-content">
                    <input type="text" class="input-number input-benefit future-cost" />
                </td>
                <td><input type="text" class="subtotal-cost" readonly /></td>
            </tr>
            <tr>
                <th>Area Cost</th>
                <td class="bg-primary-content">
                    <input type="text" class="input-number input-benefit present-cost" />
                </td>
                <td class="bg-primary-content">
                    <input type="text" class="input-number input-benefit future-cost" />
                </td>
                <td><input type="text" class="subtotal-cost" readonly /></td>
            </tr>
            <tr>
                <th>Other</th>
                <td class="bg-primary-content">
                    <input type="text" class="input-number input-benefit present-cost" />
                </td>
                <td class="bg-primary-content">
                    <input type="text" class="input-number input-benefit future-cost" />
                </td>
                <td><input type="text" class="subtotal-cost" readonly /></td>
            </tr>
        </tbody>
        <tfoot class="bg-primary/20">
            <tr>
                <th colspan="2" class="font-semibold">Total</th>
                <td><input type="text" class="text-end outline-0 w-full total-present" readonly></td>
                <td><input type="text" class="text-end outline-0 w-full total-future" readonly></td>
                <td><input type="text" class="text-end outline-0 w-full total-benefit" readonly></td>
            </tr>
        </tfoot>
    </table>
</div>
