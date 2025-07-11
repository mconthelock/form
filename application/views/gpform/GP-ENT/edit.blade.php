@extends('layouts/webflowTemplate')

@section('contents')
    <div id="loading-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.85); z-index:9999;">
        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%);">
            <img src="{{base_url()}}assets/images/loading_gif.gif" alt="Loading..." width="120">
        </div>
    </div>
    <div class="w-full min-h-screen bg-gradient-to-b from-blue-100 to-blue-50 py-10 px-2 md:px-0">
        <div class="form-data" data-nfrmno="{{ $NFRMNO }}" data-vorgno="{{ $VORGNO }}" data-cyear="{{ $CYEAR }}" data-cyear2="{{ $CYEAR2 }}" data-nrunno="{{ $NRUNNO }}" data-empno="{{ $EMPNO }}"></div>
        <div class="max-w-6xl mx-auto bg-white rounded-3xl shadow-lg p-6 md:p-10 space-y-10 border border-blue-100">
            <h1 class="text-3xl font-bold text-blue-900 text-center mb-6">
                Form Requesting Approval Entertainment (Part 1)
                <div class="text-base font-normal text-blue-600 mt-2">
                    แบบขออนุมัติค่าใช้จ่ายในการรับรองผู้มาติดต่อ (ส่วนที่ 1)
                </div>
            </h1>

            <!-- Section 1: Basic Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block mb-1 font-semibold text-blue-700">Input by</label>
                    <input type="text" id="input-by" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200" placeholder="Input Employee Code " value="{{ $dataForm->EMP_INPUT }}" />
                </div>
                <div>
                    <label class="block mb-1 font-semibold text-blue-700">Requested by</label>
                    <input type="text" id="requested-by" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200" placeholder="Input Employee Code" value="{{ $dataForm->EMP_REQ }}" />
                </div>
                <div>
                    <label class="block mb-1 font-semibold text-blue-700">Entertainment Date</label>
                    <input type="date" id="entertain-date" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200" value="{{ date('Y-m-d', strtotime($dataForm->ENTERTAINMENT_DATE)) }}" />
                </div>
                <div></div>
                <div class="md:col-span-2">
                    <label class="block mb-1 font-semibold text-blue-700">*Purpose for Entertainment</label>
                    <textarea id="purpose" class="textarea input-bordered rounded-xl w-full min-h-[48px] shadow-sm border-blue-200" required>{{ $dataForm->PURPOSE }}</textarea>
                </div>
            </div>

            <!-- Section 2: Time & Location -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="font-semibold text-blue-700 block mb-2">Time</label>
                    <div class="flex gap-6">
                        <label class="inline-flex items-center space-x-2">
                            <input type="radio" name="time" id="time-lunch" class="radio radio-primary" value="Lunch" {{ $dataForm->TYPE_TIME == 'Lunch' ? 'checked' : '' }} />
                            <span>Lunch</span>
                        </label>
                        <label class="inline-flex items-center space-x-2">
                            <input type="radio" name="time" id="time-dinner" class="radio radio-primary" value="Dinner" {{ $dataForm->TYPE_TIME == 'Dinner' ? 'checked' : '' }} />
                            <span>Dinner</span>
                        </label>
                    </div>
                </div>
                <div>
                    <label class="font-semibold text-blue-700 block mb-2">Location</label>
                    <div class="flex flex-wrap gap-6 mb-2">
                        <label class="inline-flex items-center space-x-2">
                            <input type="radio" name="location" id="location-inside" class="radio radio-primary" value="Inside" {{ $dataForm->LOCATION_TYPE == 'Inside' ? 'checked' : '' }} />
                            <span>Inside</span>
                        </label>
                        <label class="inline-flex items-center space-x-2">
                            <input type="radio" name="location" id="location-outside" class="radio radio-primary" value="Outside" {{ $dataForm->LOCATION_TYPE == 'Outside' ? 'checked' : '' }} />
                            <span>Outside</span>
                        </label>
                    </div>
                    <input type="text" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200" id="location_detail" value="{{ $dataForm->LOCATION }}" placeholder="*Please identify the location." />
                </div>
            </div>

            <div class="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4 shadow">
                <div class="font-bold text-blue-900 text-lg mb-3">Details of Guest</div>
                <ul class="text-xs text-blue-700 mt-2 mb-2 list-disc list-inside space-y-1">
                    <li>if has company of guest more than 1 company, Please click "ADD" button for add items.</li>
                    <li>กรณีแขกเป็นหน่วยงานราชการ/รัฐวิสาหกิจ ต้องแนบ Appendix A (Refer AMEC-2303 "Rule for Anti Bribery rule")</li>
                </ul>
                <div id="companies-container">
                    @foreach ($company as $key => $value)
                        <div class="company-group border rounded-lg p-3 mb-3 bg-white relative">
                            <button type="button" class="remove-company-btn absolute top-1 right-1 btn btn-xs btn-circle btn-error {{ $key == 0 ? 'hidden' : '' }}">✕</button>
                            <div class="flex flex-wrap items-center gap-2 mb-2">
                                <label class="font-semibold text-red-600">*Company's name</label>
                                <input type="text" name="company_name[]" value="{{ $value->COMPANY_NAME }}" class="input input-bordered input-sm w-60 company-name rounded-xl" placeholder="Enter company name" />
                            </div>
                            <div class="flex gap-8 mb-2">
                                <label class="flex items-center gap-2">
                                    <input type="radio" name="orgType-{{ $key }}" class="radio radio-info org-type" value="1" {{ $value->COMPANY_TYPE == '1' ? 'checked' : '' }} />
                                    <span>Non-Government</span>
                                </label>
                                <label class="flex items-center gap-2">
                                    <input type="radio" name="orgType-{{ $key }}" class="radio radio-info org-type" value="2" {{ $value->COMPANY_TYPE == '2' ? 'checked' : '' }} />
                                    <span>Government</span>
                                </label>
                            </div>
                            <div class="appendix-section {{ $value->COMPANY_TYPE == '2' ? '' : 'hidden' }} mb-2">
                                <label class="block font-semibold text-yellow-800 mb-1">Attach Appendix A :</label>
                                @if (!empty($value->ATTACH_FILE))
                                    <div class="mb-1 current-file">
                                        <span class="label">Current file:</span>
                                        <a href="{{ base_url('uploads/' . $value->ATTACH_FILE) }}" target="_blank" class="link link-primary btn btn-sm rounded-lg">{{ $value->ATTACH_FILE }}</a>
                                    </div>
                                    <label class="block text-gray-600 text-xs mb-1">Choose new file to replace (optional):</label>
                                @else
                                    <div class="mb-1 current-file" style="display:none"></div>
                                @endif
                                <input type="file" name="appendix_a[]" class="file-input file-input-bordered rounded-lg file-input-sm bg-yellow-100" />
                            </div>
                        </div>
                    @endforeach
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
                                    <td><input type="radio" name="guest_type" class="checkbox bg-white checkbox-primary guest_type" value="{{ $gt->GT_ID }}" {{ $dataForm->GUEST_TYPE == $gt->GT_ID ? 'checked' : '' }}></td>
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
            <div class="bg-gradient-to-r from-blue-50 via-white to-blue-100 rounded-2xl border border-blue-200 p-4">
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
                            @php $sum = 0; @endphp
                            @for ($i = 0; $i < 5; $i++)
                                @php
                                    $row = isset($estimate_cost[$i]) ? $estimate_cost[$i] : null;
                                    $sum += $row && isset($row->TOTAL_COST) ? $row->TOTAL_COST : 0;
                                @endphp
                                <tr>
                                    <td class="border-l border-gray-200">
                                        <select name="estimate_type[{{ $i }}]" class="select select-sm rounded-lg estimate-type w-full" data-index="{{ $i }}">
                                            <option value="">--Select Detail--</option>
                                            @foreach ($estimate_type as $value)
                                                <option value="{{ $value->ET_NAME }}" data-cost="{{ $value->ET_COST }}" {{ $row && $row->DETAILS == $value->ET_NAME ? 'selected' : '' }}>
                                                    {{ $value->ET_NAME }}
                                                </option>
                                            @endforeach
                                        </select>
                                    </td>
                                    <td>
                                        <input type="number" name="estimate_unit_price[{{ $i }}]" class="input input-bordered input-sm rounded-lg w-full text-center unit-price" value="{{ $row ? $row->QTY : '' }}" />
                                    </td>
                                    <td>
                                        <input type="number" name="estimate_quantity[{{ $i }}]" class="input input-bordered input-sm rounded-lg w-full text-center quantity" value="{{ $row ? $row->UNIT_COST : '' }}" />
                                    </td>
                                    <td class="border-r border-gray-200">
                                        <input type="number" name="estimate_amount[{{ $i }}]" class="input input-bordered input-xs input-ghost rounded-lg w-full text-center amount" value="{{ $row ? $row->TOTAL_COST : '' }}" readonly />
                                    </td>
                                    <td>
                                        <input type="text" name="estimate_remark[{{ $i }}]" class="input input-bordered input-sm rounded-lg w-full remark" placeholder="กรณีเกินเงื่อนไข (ถ้ามี)" value="{{ $row ? $row->REMARK : '' }}" {{ $row && !empty($row->REMARK) ? '' : 'disabled' }} />
                                    </td>
                                </tr>
                            @endfor
                        </tbody>
                        <tfoot class="bg-amber-200 font-bold rounded-b-lg">
                            <tr>
                                <td colspan="3" class="text-right rounded-bl-lg">Total Amount / รวมทั้งหมด</td>
                                <td class="text-center rounded-br-lg" id="total-amount">{{ $sum }}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>

                    <!-- <div class="flex items-center pt-5 rounded-lg space-x-4">
                            <div class="bg-blue-700 text-white font-semibold px-4 py-4 rounded-l-lg">
                                Cash Advance
                            </div>
                            <div class="space-y-2">
                                <div class="flex items-center space-x-2">
                                    <input type="radio" id="cashYes" name="cash_advance" class="checkbox checkbox-primary bg-white  cash_adv" value="1" {{ $dataForm->REIMBURSEMENT == "1" ? "checked" : "" }} />
                                    <label for="cashYes" class="font-semibold">Yes</label>
                                    <div class="text-xs italic text-gray-500">
                                        *Receive cash from FIN Department within 3-4 working day
                                    </div>
                                </div>

                                <div class="flex items-center space-x-2">
                                    <input type="radio" id="cashNo" name="cash_advance" class="checkbox checkbox-primary bg-white  cash_adv" value="0" {{ $dataForm->REIMBURSEMENT == "0" ? "checked" : "" }} />
                                    <label for="cashNo" class="font-semibold">No</label>
                                    <div class="text-xs italic text-gray-500">
                                        *Please bring original receipt for clearance expense on Form Clearacnce Expense for Entertainment (Part 2).
                                    </div>
                                </div>
                            </div>


                        </div> -->
                </div>
                <div class="text-xs mt-2 text-blue-700 italic">
                    1. สำหรับค่ารับรองอื่นๆที่ไม่ใช่ค่าอาหาร เช่น กีฬา, กระเช้า ฯลฯ ให้พิจารณาร่วมกับ RAF
                    <span class="text-gray-400 block">For entertainment other than meals, such as sports expenses, gift baskets, etc., consider with RAF Division.</span>
                </div>
            </div>

            <!-- Section 6: Quantity of Participant -->
            <div class="bg-gradient-to-r from-blue-50 via-white to-blue-100 rounded-2xl border border-blue-200 p-4 space-y-2">
                <h2 class="font-bold text-blue-900 text-lg mb-2">*Quantity of Participant / จำนวนผู้เข้าร่วมรับรอง:</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Guest -->
                    @php
                        $amec  = array_filter($dataParticipants, function ($item) {
                            return $item->TYPE === 'amec';
                        });
                        $guest = array_filter($dataParticipants, function ($item) {
                            return $item->TYPE === 'guest';
                        });
                    @endphp
                    <div>
                        <label class="font-semibold text-blue-900 block mb-1">
                            Guest's Name: <span class="text-xs text-gray-500" id="guest-count">(0/100)</span>
                        </label>
                        <div class="flex items-center gap-2">
                            <input id="guest-name-input" class="input input-bordered rounded-lg w-full" placeholder="Guest's name" />
                            <button type="button" id="add-guest-btn" class="btn btn-primary btn-xs rounded-lg">ADD</button>
                        </div>
                        <ul id="guest-list" class="ml-2 mt-2 space-y-2">
                            @foreach ($guest as $value)
                                <li class="flex items-center justify-between gap-2 border border-blue-200 bg-blue-50 shadow-sm rounded-lg px-3 py-1">
                                    <span>{{ $value->NAME }}</span>
                                    <button type="button" class="remove-li bg-red-200 text-red-700 cursor-pointer rounded px-2 py-0.5 text-xs">ลบ</button>
                                </li>
                            @endforeach
                        </ul>
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
                        <ul id="amec-list" class="ml-2 mt-2 space-y-2">
                            @foreach ($amec as $value)
                                <li class="flex items-center justify-between gap-2 border border-blue-200 bg-blue-50 shadow-sm rounded-lg px-3 py-1">
                                    <span data-empno="{{ $value->SEMPNO }}">{{ $value->SEMPPRE . " " . $value->SNAME }}</span>
                                    <button type="button" class="remove-li bg-red-200 text-red-700 cursor-pointer rounded px-2 py-0.5 text-xs">ลบ</button>
                                </li>
                            @endforeach
                        </ul>
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
                    <textarea class="textarea textarea-bordered rounded-xl w-full min-h-[40px]" id="remark" placeholder="เช่น ระบุเหตุผล...">{{ $dataForm->REMARK }}</textarea>
                </div>

            </div>

            <!-- Submit -->
            <div class="text-center mt-6">
                <button class="btn btn-accent btn-wide text-lg rounded-2xl shadow-lg transition hover:scale-105" id="submit-btn-edit">Submit</button>
            </div>

            <div class="flow"></div>
        </div>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/requestEntertainView.js?ver={{ $GLOBALS['version'] }}"></script>
    <script src="{{ $_ENV['APP_JS'] }}/requestEntertain.js?ver={{ $GLOBALS['version'] }}"></script>
    <script>
        let companyIndex = $('#companies-container .company-group').length;

        function updateRadioNames() {
            $('#companies-container .company-group').each(function (i, group) {
                $(group).find('.org-type').each(function () {
                    $(this).attr('name', 'orgType-' + i);
                });
            });
        }

        $('#add-company-btn').on('click', function () {
            let $lastGroup = $('#companies-container .company-group').last();
            let $newGroup = $lastGroup.clone();

            // reset ค่า input
            $newGroup.find('input[type="text"]').val('');
            $newGroup.find('input[type="file"]').val('');
            $newGroup.find('.org-type').prop('checked', false);
            // ซ่อน appendix section
            $newGroup.find('.appendix-section').addClass('hidden');
            // reset ชื่อไฟล์เดิม
            $newGroup.find('.current-file').hide().html('');
            // show ปุ่มลบ
            $newGroup.find('.remove-company-btn').removeClass('hidden');

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
                $group.find('.current-file').hide().html('');
            }
        });

        // ลบชุดบริษัท
        $('#companies-container').on('click', '.remove-company-btn', function () {
            $(this).closest('.company-group').remove();
            updateRadioNames();
        });
    </script>

@endsection