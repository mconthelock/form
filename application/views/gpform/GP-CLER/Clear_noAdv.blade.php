@extends('layouts/webflowTemplate')

@section('contents')
    <div id="loading-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.85); z-index:9999;">
        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%);">
            <img src="{{base_url()}}assets/images/loading_gif.gif" alt="Loading..." width="120">
        </div>
    </div>
    <div class="w-full min-h-screen bg-gradient-to-b from-blue-100 to-blue-50 py-10 px-2 md:px-0">
        <div class="form-data" data-nfrmno="{{ $NFRMNO }}" data-vorgno="{{ $VORGNO }}" data-cyear="{{ $CYEAR }}"></div>
        <div class="max-w-6xl mx-auto bg-white rounded-3xl shadow-lg p-6 md:p-10 space-y-10 border border-blue-100">
            <h1 class="text-3xl font-bold text-blue-900 text-center mb-6">
                Form Clearance for Expense (Part2)
                <div class="text-base font-normal text-blue-600 mt-2">
                    แบบเคลียร์ค่าใช้จ่ายในการรับรองผู้มาติดต่อ (ส่วนที่2)
                </div>
                <div class="text-xl font-normal text-red-600 mt-2">
                    Not has Advance Entertainment Form (แบบเคลียร์คค่าใช้จ่ายในการรับรองผู้มาติดต่อ *กรณีที่ ไม่ได้มีการขออนุมัติล่วงหน้า)
                </div>
            </h1>

            <!-- Section 1: Basic Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block mb-1 font-semibold text-blue-700">Input by</label>
                    <input type="text" id="input-by" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200" value="{{ $empcode }}" placeholder="Input Employee Code " />
                </div>
                <div>
                    <label class="block mb-1 font-semibold text-blue-700">Requested by</label>
                    <input type="text" id="requested-by" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200" value="{{ $empcode }}" placeholder="Input Employee Code" />
                </div>
                <div>
                    <label class="block mb-1 font-semibold text-blue-700">Entertainment Date</label>
                    <input type="date" id="entertain-date" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200" />
                </div>
                <div></div>
                <div class="md:col-span-2">
                    <label class="block mb-1 font-semibold text-blue-700">*Purpose for Entertainment</label>
                    <textarea id="purpose" class="textarea input-bordered rounded-xl w-full min-h-[48px] shadow-sm border-blue-200" required></textarea>
                </div>
            </div>

            <!-- Section 2: Time & Location -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="font-semibold text-blue-700 block mb-2">Time</label>
                    <div class="flex gap-6">
                        <label class="inline-flex items-center space-x-2">
                            <input type="radio" name="time" id="time-lunch" class="radio radio-primary" value="Lunch" />
                            <span>Lunch</span>
                        </label>
                        <label class="inline-flex items-center space-x-2">
                            <input type="radio" name="time" id="time-dinner" class="radio radio-primary" value="Dinner" />
                            <span>Dinner</span>
                        </label>
                    </div>
                </div>
                <div>
                    <label class="font-semibold text-blue-700 block mb-2">Location</label>
                    <div class="flex flex-wrap gap-6 mb-2">
                        <label class="inline-flex items-center space-x-2">
                            <input type="radio" name="location" id="location-inside" class="radio radio-primary" value="Inside" />
                            <span>Inside</span>
                        </label>
                        <label class="inline-flex items-center space-x-2">
                            <input type="radio" name="location" id="location-outside" class="radio radio-primary" value="Outside" />
                            <span>Outside</span>
                        </label>
                    </div>
                    <input type="text" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200" id="location_detail" placeholder="*Please identify the location." />
                </div>
            </div>

            <div class="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4 shadow">
                <div class="font-bold text-blue-900 text-lg mb-3">Details of Guest</div>
                <ul class="text-xs text-blue-700 mt-2 mb-2 list-disc list-inside space-y-1">
                    <!-- <li>กรณีแขกเยอะ สามารถแนบไฟล์รายชื่อ</li> -->
                    <li>กรณีแขกเป็นหน่วยงานราชการ/รัฐวิสาหกิจ ต้องแนบ Appendix A (Refer AMEC-2303 "Rule for Anti Bribery rule")</li>
                </ul>
                <div id="companies-container">
                    <!-- ชุดฟอร์มบริษัท (ชุดแรก) จะถูก clone ต่อๆ ไป -->
                    <div class="company-group border rounded-lg p-3 mb-3 bg-white relative">
                        <button type="button" class="remove-company-btn absolute top-1 right-1 btn btn-xs btn-circle btn-error hidden">✕</button>
                        <div class="flex flex-wrap items-center gap-2 mb-2">
                            <label class="font-semibold text-red-600">*Company's name</label>
                            <input type="text" name="company_name[]" class="input input-bordered input-sm w-60 company-name rounded-xl" placeholder="Enter company name" />
                        </div>
                        <div class="flex gap-8 mb-2">
                            <label class="flex items-center gap-2">
                                <input type="radio" name="orgType-0" class="radio radio-info org-type" value="1" />
                                <span>Non-Government</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="radio" name="orgType-0" class="radio radio-info org-type" value="2" />
                                <span>Government</span>
                            </label>
                        </div>
                        <div class="appendix-section hidden mb-2">
                            <label class="block font-semibold text-yellow-800 mb-1">Attach Appendix A :</label>
                            <input type="file" name="appendix_a[]" class="file-input file-input-bordered rounded-lg file-input-sm bg-yellow-100" />
                        </div>
                    </div>
                </div>

                <button type="button" id="add-company-btn" class="btn btn-warning mt-2">ADD</button>
            </div>



            <!-- Section 3: Guest Type Table -->
            <div class="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4 mb-2 shadow">
                <h2 class="font-bold text-blue-900 mb-2 text-lg">*Details: Please select for guest type</h2>
                <div class="overflow-x-auto">
                    <table class="table table-xs md:table-sm w-full border rounded-xl overflow-hidden">
                        <thead class="bg-blue-800 text-white text-center text-xs rounded-t-xl">
                            <tr class="text-center">
                                <th>#</th>
                                <th class="border-blue-100">Guest Type</th>
                                <th class="border-blue-100" colspan="2">Participant / Number</th>
                                <th class="border-blue-100" colspan="3">Meal expense for guest (Baht / Person / Time)</th>
                            </tr>
                        </thead>
                        <tbody class="bg-amber-50">
                            @foreach ($guest_type as $gt)
                                <tr>
                                    <td><input type="radio" name="guest_type" class="checkbox bg-white checkbox-primary guest_type" value="{{ $gt->GT_ID }}"></td>
                                    <td class="text-center">{{ $gt->TYPE_NAME }}</td>
                                    <td class="font-semibold">{{ $gt->POSITION }}</td>
                                    <td class="text-center">{{ str_replace(['>=', '<='], ['≥', '≤'], $gt->CONDITION_TEXT) }}</td>
                                    <td class="text-left">{{ str_replace(['>=', '<='], ['≥', '≤'], $gt->SNACK) }}</td>
                                    <td class="text-center">{{ str_replace(['>=', '<='], ['≥', '≤'], $gt->LUNCH) }}</td>
                                    <td class="text-center">{{ str_replace(['>=', '<='], ['≥', '≤'], $gt->DINNER) }}</td>
                                </tr>
                            @endforeach

                        </tbody>
                    </table>
                </div>
                <ul class="text-xs mt-3 space-y-1 text-blue-700 list-disc pl-4">
                    <li>
                        พนักงานที่เข้าร่วมรับรองผู้มาติดต่อ ตำแหน่ง/จำนวน ตามที่ระบุในตาราง
                        <span class="text-gray-400 block">Participating employees, Position/Number as specified in the table.</span>
                    </li>
                    <li>
                        ผู้มาติดต่อตามข้อ 5 บุคคลภายนอกเข้าร่วมประชุม หากมีงบประมาณให้แนบเอกสารกับ Entertainment form
                        <span class="text-gray-400 block">Guests according to item 5, outsiders attending the meeting. If has budget, please attach with Entertainment form.</span>
                    </li>
                    <li>
                        ข้อ 6 หากผู้มาติดต่อไม่เข้าข่ายข้อ 1-5 ให้พิจารณาร่วมกับ RAF
                        <span class="text-gray-400 block">For item 6, in case guest not in items 1–5, consult with RAF.</span>
                    </li>
                </ul>
            </div>

            <!-- Section 4: Attach File -->
            <div class="bg-blue-50 rounded-2xl border border-blue-200 p-4">
                <label class="block font-semibold text-blue-700 mb-1">*Attach File:</label>
                <input type="file" class="file-input file-input-bordered rounded-lg w-full max-w-xs" />
                <span class="ml-2 text-xs text-amber-600">"Visitor Notice" if any</span>
            </div>

            <!-- Section 5: Estimate Table + Budget -->
            {{--<div class="bg-gradient-to-r from-blue-50 via-white to-blue-100 rounded-2xl border border-blue-200 p-4">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
                    <h2 class="font-bold text-blue-900 text-lg">
                        *Estimate Cost / ประมาณการค่าใช้จ่าย:
                        <div role="alert" id="alert-estimate" class="alert alert-error hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>กรุณากรอกรายละเอียด Estimate Cost อย่างน้อย 1 รายการ</span>
                        </div>
                    </h2>

                    <div>
                        <span class="font-bold text-blue-900 mr-2">Entertainment’s Budget:</span>
                        <input type="text" class="input input-bordered input-sm rounded-lg border-blue-200" id="entertain-budget" placeholder="*Please identify (if have)">
                    </div>
                </div>
                <div class="overflow-x-auto mt-3 rounded-lg">
                    <table class="table table-xs md:table-sm w-full rounded-lg overflow-hidden shadow" id="table_cost">
                        <thead class="bg-blue-400 text-white rounded-t-lg">
                            <tr>
                                <th class="text-center">Details</th>
                                <th class="text-center">Quantity</th>
                                <th class="text-center">Cost / Person</th>
                                <th class="text-center">Total</th>
                                <th class="text-center">Remark</th>
                            </tr>
                        </thead>
                        <tbody>
                            @for ($i = 0; $i < 5; $i++)
                                <tr>
                                    <td class="border-l border-gray-200">
                                        <!-- <input class="input input-bordered input-xs rounded-lg w-full" placeholder="รายการ (เช่น Set box, Bento food, ฯลฯ)" /> -->
                                        <select class="select select-sm rounded-lg estimate-type">
                                            <option value="">--Select Detail--</option>
                                            @foreach ($estimate_type as $value)
                                                <option value="{{ $value->ET_NAME }}" data-cost="{{ $value->ET_COST }}">{{ $value->ET_NAME }}</option>
                                            @endforeach
                                        </select>
                                    </td>
                                    <td><input type="number" class="input input-bordered input-sm rounded-lg w-full text-center" /></td>
                                    <td><input type="number" class="input input-bordered input-sm rounded-lg w-full text-center quantity" /></td>
                                    <td class="border-r border-gray-200"><input type="number" class="input input-bordered input-xs input-ghost rounded-lg w-full text-center" readonly /></td>
                                    <td>
                                        <input type="text" class="input input-bordered input-sm rounded-lg w-full remark" placeholder="กรณีเกินเงื่อนไข (ถ้ามี)" disabled />
                                    </td>
                                </tr>
                            @endfor
                        </tbody>
                        <tfoot class="bg-amber-200 font-bold rounded-b-lg">
                            <tr>
                                <td colspan="3" class="text-right rounded-bl-lg">Total Amount / รวมทั้งหมด</td>
                                <td class="text-center rounded-br-lg" id="total-amount">0.00</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div class="text-xs mt-2 text-blue-700 italic">
                    1. สำหรับค่ารับรองอื่นๆที่ไม่ใช่ค่าอาหาร เช่น กีฬา, กระเช้า ฯลฯ ให้พิจารณาร่วมกับ RAF
                    <span class="text-gray-400 block">For entertainment other than meals, such as sports expenses, gift baskets, etc., consider with RAF Division.</span>
                </div>
            </div>--}}

            <!-- Section 6: Quantity of Participant -->
            <div class="bg-gradient-to-r from-blue-50 via-white to-blue-100 rounded-2xl border border-blue-200 p-4 space-y-2">
                <h2 class="font-bold text-blue-900 text-lg mb-2">*Quantity of Participant / จำนวนผู้เข้าร่วมรับรอง:</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Guest -->
                    <div>
                        <label class="font-semibold text-blue-900 block mb-1">
                            Guest's Name: <span class="text-xs text-gray-500" id="guest-count">(0/100)</span>
                        </label>
                        <div class="flex items-center gap-2">
                            <input id="guest-name-input" class="input input-bordered rounded-lg w-full" placeholder="Guest's name" />
                            <button type="button" id="add-guest-btn" class="btn btn-primary btn-xs rounded-lg">ADD</button>
                        </div>
                        <ul id="guest-list" class="ml-2 mt-2 space-y-2"></ul>
                    </div>
                    <!-- AMEC -->
                    <div>
                        <label class="font-semibold text-blue-900 block mb-1">
                            AMEC's Employees Name: <span class="text-xs text-gray-500" id="amec-count">(0/100)</span>
                        </label>
                        <div class="flex items-center gap-2">
                            <input id="amec-name-input" class="input input-bordered rounded-lg w-full" placeholder="Identify Emp. Code" />
                            <button type="button" id="add-amec-btn" class="btn btn-primary btn-xs rounded-lg">ADD</button>
                        </div>
                        <span id="amec-loading" class="hidden text-blue-600 text-xs ml-2">กำลังค้นหา...</span>
                        <ul id="amec-list" class="ml-2 mt-2 space-y-2"></ul>
                    </div>
                </div>


                <!-- Type -->
                <!-- <div> -->
                <!-- <span class="font-semibold text-blue-900 block mb-2">Type of Organization</span> -->

                <!-- </div> -->
                <div>
                    <label class="font-semibold text-blue-900 block mb-2">*Remark:</label>
                    <span class="text-xs text-red-500 block mb-1">
                        If AMEC more than guest, please identify the reason.
                    </span>
                    <textarea class="textarea textarea-bordered rounded-xl w-full min-h-[40px]" id="remark" placeholder="เช่น ระบุเหตุผล..."></textarea>
                </div>

            </div>

            <div class="mt-10">
                <h3 class="flex items-center gap-2 font-bold text-green-800 mb-3 mt-8 text-xl">
                    <!-- <svg ... ไอคอน>  --> Expense Cost
                </h3>
                <div class="border-2 border-green-500 rounded-2xl p-4 bg-green-50 shadow-sm transition">
                    <table class="min-w-full text-sm border-1 rounded-xl overflow-hidden" id="expense-table">
                        <thead>
                            <tr class="bg-green-200 text-green-900">
                                <th class="py-2 px-4 text-center w-12 rounded-tl-xl">No.</th>
                                <th class="py-2 px-4 text-center">Receipt No.</th>
                                <th class="py-2 px-4 text-center">Cost</th>
                                <th class="py-2 px-4 w-12 rounded-tr-xl"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="py-2 px-4 text-center">1</td>
                                <td class="py-2 px-4">
                                    <input type="text" class="input input-sm border rounded-lg px-3 py-1 w-full focus:ring-2 bg-white focus:ring-green-400 transition" placeholder="Receipt No.">
                                </td>
                                <td class="py-2 px-4">
                                    <input type="text" class="input input-sm border rounded-lg px-3 py-1 w-full focus:ring-2 bg-white focus:ring-green-400 transition" placeholder="Cost">
                                </td>
                                <td class="py-2 px-4 text-center">
                                    <button type="button" class="remove-row bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center cursor-pointer justify-center shadow transition" title="Remove row">
                                        &times;
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="flex justify-end mt-4">
                        <button type="button" id="add-row" class="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-xl shadow cursor-pointer transition flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Add Row
                        </button>
                    </div>
                    <!-- <button class="btn btn-success" id="test-submit">Test</button> -->
                </div>
            </div>

            <div>
                <form>
                    <div class="bg-green-50 rounded-2xl border border-green-200 p-6 shadow space-y-8">
                        <h2 class="font-bold text-green-700 text-2xl mb-3">Clearance for Expense</h2>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <!-- President join -->
                            <div>
                                <label class="block font-semibold text-green-700 mb-1">President:</label>
                                <div class="flex gap-6 mt-1">
                                    <label class="inline-flex items-center space-x-2">
                                        <input type="radio" name="president_join" id="president_join" class="radio radio-success" value="1" required>
                                        <span>Join</span>
                                    </label>
                                    <label class="inline-flex items-center space-x-2">
                                        <input type="radio" name="president_join" id="president_join" class="radio radio-success" value="2" required>
                                        <span>Not Join</span>
                                    </label>
                                </div>
                                <div class="text-xs text-red-500 mt-1">*Please select if President join or not join on meal.</div>
                            </div>
                            <!-- Actual cost -->
                            <div>
                                <label class="block font-semibold text-green-700 mb-1">Actual Cost:</label>
                                <input type="number" class="input input-bordered rounded-xl w-full border-green-200 text-lg" placeholder="ใส่ยอดค่าใช้จ่ายจริง" required id="actual-cost" readonly>
                            </div>
                            <!-- Remain -->
                            <!-- <div>
                                                                                        <label class="block font-semibold text-green-700 mb-1">Remain:</label>
                                                                                        <input type="text" class="input input-bordered rounded-xl w-full border-green-200 text-lg font-bold" placeholder="คำนวณอัตโนมัติ" readonly id="remain" style="color: #16a34a;" />
                                                                                        <div id="remain-alert" class="text-xs mt-1"></div>
                                                                                    </div> -->
                        </div>
                        <div class="grid grid-cols-2">
                            <div>
                                <label class="block font-semibold text-green-700 mb-1">Attach Memo:</label>
                                <input type="file" class="file-input rounded-xl w-full max-w-xs" id="file-memo">
                                <div class="text-xs text-red-500 mt-1">*Please attach the memo approved by the President.</div>
                            </div>
                            <div>
                                <label class="block font-semibold text-green-700 mb-1">Attach Receipt:</label>
                                <input type="file" class="file-input file-input-bordered rounded-xl w-full max-w-xs" id="receipt" required>
                            </div>
                        </div>

                        <!-- Attach/Remark -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
                            <div>
                                <label for="" class="block font-semibold text-green-700 mb-1">Reason:</label>
                                <textarea name="" id="reason" class="textarea rounded-xl w-full min-h-[44px]" id="reason" placeholder="เหตุผลว่าทำไมถึงไม่สามารถทำการขอ Entertainment ล่วงหน้า"></textarea>
                            </div>

                            <div>
                                <label class="block font-semibold text-green-700 mb-1">Remark:</label>
                                <textarea class="textarea input-bordered rounded-xl w-full min-h-[44px]" id="remark" placeholder="หากค่าใช้จ่ายเกิน ให้ระบุเหตุผล (บังคับ)"></textarea>
                            </div>
                        </div>

                        <!-- <div class="text-right mt-6">
                                                                                    <button id="btn-submit" class="btn btn-success btn-lg rounded-2xl px-8 shadow-md transition hover:scale-105">Submit</button>
                                                                                </div> -->
                    </div>
                </form>

                <div class="text-xs mt-4 text-gray-600">
                    * ระบบจะคำนวณค่าใช้จ่ายจริงเทียบกับประมาณการ หากค่าใช้จ่ายจริงเกิน (ติดลบ) จะต้องระบุเหตุผลใน Remark และ Submit ไม่ได้ถ้าเหตุผลว่าง<br>
                    * ขั้นตอนอนุมัติ: ถ้า President Join → อนุมัติโดย RAF DIM, ถ้า Not Join → อนุมัติโดย President
                </div>
            </div>

            <!-- Submit -->
            <div class="text-center mt-6">
                <button class="btn btn-accent btn-wide text-lg rounded-2xl shadow-lg transition hover:scale-105" id="submit-btn-noAdv">Submit</button>
            </div>
        </div>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/requestEntertain.js?ver={{ $GLOBALS['version'] }}"></script>
    <script src="{{ $_ENV['APP_JS'] }}/clearanceNoAdv.js?ver={{ $GLOBALS['version'] }}"></script>
    <script>
        let companyIndex = 1;

        function updateRadioNames() {
            $('#companies-container .company-group').each(function (i, group) {
                $(group).find('.org-type').each(function () {
                    $(this).attr('name', 'orgType-' + i);
                });
            });
        }

        $('#add-company-btn').on('click', function () {
            // clone ฟอร์มแรก แล้ว reset ค่า
            let $lastGroup = $('#companies-container .company-group').last();
            let $newGroup = $lastGroup.clone();

            // reset ค่า input
            $newGroup.find('input[type="text"]').val('');
            $newGroup.find('input[type="file"]').val('');
            $newGroup.find('.appendix-section').addClass('hidden');
            $newGroup.find('input.org-type').prop('checked', false);
            // $newGroup.find('input.org-type[value="1"]').prop('checked', true);

            // show ปุ่มลบ ถ้ามากกว่า 1 ชุด
            $newGroup.find('.remove-company-btn').removeClass('hidden');

            // append
            $('#companies-container').append($newGroup);

            updateRadioNames();
        });

        // toggle ช่องแนบไฟล์ในแต่ละชุด
        $('#companies-container').on('change', '.org-type', function () {
            let $group = $(this).closest('.company-group');
            if ($(this).val() === '2') {
                $group.find('.appendix-section').removeClass('hidden');
            } else {
                $group.find('.appendix-section').addClass('hidden');
                $group.find('input[type="file"]').val('');
            }
        });

        // ลบชุดบริษัท
        $('#companies-container').on('click', '.remove-company-btn', function () {
            $(this).closest('.company-group').remove();
            updateRadioNames();
        });


    </script>
@endsection