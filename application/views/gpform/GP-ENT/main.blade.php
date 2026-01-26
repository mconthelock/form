@extends('layouts/webflowTemplate')

@section('contents')
    <div id="loading-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.7); z-index:9999;">
        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%);">
            <img src="{{ base_url() }}assets/images/loading_gif.gif" alt="Loading..." width="150">
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

            <div>
                <label for="" class="text-sm text-gray-500"><i>For Requesting Approval Entertainment (Part1) must get approve from Approver before Entertainment date 1 day. <br>(Refer: RAF Practical Regulation : RAF-PR-G-068)</i></label>
            </div>
            <!-- Section 1: Basic Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block mb-1 font-semibold text-blue-700">Input by</label>
                    <input type="text" id="input-by" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200" value="{{ $_GET['empno'] }}" readonly placeholder="Input Employee Code " />
                </div>
                <div>
                    <label class="block mb-1 font-semibold text-blue-700">Requested by</label>
                    <input type="text" id="requested-by" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200" placeholder="Input Employee Code" />
                </div>
                <div class="col-span-2">
                    <label class="block mb-1 font-semibold text-blue-700">Entertainment Date</label>
                    <div class="relative max-w-xs" id="entertain-date-wrapper">
                        <input type="text" id="entertain-date" class="input input-bordered rounded-xl w-full shadow-sm border-blue-200 pr-10" />
                        <button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800" id="entertain-date-icon" aria-label="Open calendar">
                            <!-- Heroicon: Calendar -->
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                        </button>
                    </div>

                    <div id="urgent-note" class="hidden mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600 font-semibold">
                        Note: “As the requester did not obtain prior approval for the entertainment at least 5 working days in advance, please download the file for approve URGENT case by P or RAF DIM before submit”
                    </div>

                    <div id="urgent-attachment" class="hidden mt-2 p-4 bg-white rounded-lg border-2 border-red-500 shadow-sm">
                        <label class="block mb-2 font-bold text-red-600 text-sm">*Attach Memo (In case of not submit Request Entertainment form (before 5 day))</label>
                        <input type="file" id="urgent-file" name="urgent_file" class="file-input file-input-bordered file-input-sm w-full max-w-xs file-input-error bg-yellow-50" />
                        <div class="mt-2 text-xs text-gray-500">
                            *Require "Memorandum" get approve by RAF DIM/President, In case of use budget for buying gift to guest (Refer to RAF-PR-G-068-M-Entertainment on topic no.4,no.4.6)
                        </div>
                        <div class="mt-2 text-sm font-bold text-blue-600">
                            Download file: <a href="{{ base_url('assets/files/Special_Form_for_Request_Entertainment.pdf') }}" download class="underline hover:text-blue-800">Special Form for Request Entertainment.pdf</a>
                        </div>
                    </div>
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
                    <label class="font-semibold text-blue-700 block mb-2">Type of Entertainment</label>
                    <div class="flex gap-6">
                        <label class="inline-flex items-center space-x-2">
                            <input type="radio" name="time" id="time-lunch" class="radio radio-primary time time-radio" value="Lunch" />
                            <span>Lunch</span>
                        </label>
                        <label class="inline-flex items-center space-x-2">
                            <input type="radio" name="time" id="time-dinner" class="radio radio-primary time time-radio" value="Dinner" />
                            <span>Dinner</span>
                        </label>
                        <label class="inline-flex items-center space-x-2">
                            <input type="radio" name="time" id="time-gift" class="radio radio-primary time time-radio" value="Gift" />
                            <span>Gift</span>
                        </label>
                        <label class="inline-flex items-center space-x-2">
                            <input type="radio" name="time" id="time-other" class="radio radio-primary time time-radio" value="Other" />
                            <span>Other</span>
                        </label>
                    </div>
                    <!-- ฟิลด์ Attach Memo (กรณี Gift) -->

                </div>

                <div id="gift-memo" class="hidden mt-2">
                    <label class="block font-semibold text-yellow-800">Attach Memo (Gift)</label>
                    <input type="file" id="gift-memo-file" name="gift_memo" class="file-input file-input-bordered rounded-lg file-input-sm bg-yellow-100" />
                    <p class="text-xs text-gray-500">
                        *Require "Memorandum" get approve by RAF DIM/President, In case of use budget for buying gift to guest (Refer to RAF-PR-G-068-M-Entertainment on topic no.4,no.4.6)
                    </p>
                </div>

                <div id="payable-date-section" class="hidden mt-4">
                    <label class="block font-semibold text-red-700">Payable Date:</label>
                    <div class="relative max-w-xs" id="payable-date-wrapper">
                        <input type="text" id="payable-date" class="input input-bordered rounded-xl w-full shadow-sm border-red-200 pr-10" />
                        <button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-red-600 hover:text-red-800" id="payable-date-icon" aria-label="Open calendar">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                        </button>
                    </div>
                </div>
                <!-- ฟิลด์ Other + Attach Memo -->
                <div id="other-fields" class="hidden mt-2">
                    <label class="block font-semibold text-yellow-800">Other Details</label>
                    <input type="text" id="other-details" name="other_details" placeholder="Please identify the details" class="input input-bordered rounded-lg input-sm w-full max-w-xs mb-2" />

                    <label class="block font-semibold text-yellow-800">Attach Memo (Other)</label>
                    <input type="file" id="other-memo-file" name="other_memo" class="file-input file-input-bordered rounded-lg file-input-sm bg-yellow-100" />
                    <p class="text-xs text-gray-500">
                        *Require "Memorandum" get approve by RAF DIM/President, In case of use budget for buying other (Refer to RAF-PR-G-068-M-Entertainment on topic no.4,no.4.6)
                    </p>
                </div>

                <div id="div_location">
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

                    {{-- <label class="font-semibold text-blue-700 block mb-2">Reimbursement</label>
                    <div class="flex flex-wrap gap-6 mb-2">
                        <label class="inline-flex items-center space-x-2">
                            <input type="checkbox" name="reimbursement" id="reimbursement" class="checkbox checkbox-primary" value="1" />
                            <span>Reimbursement</span>
                        </label>
                    </div> --}}
                </div>
            </div>

            <div class="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4 shadow">
                <div class="font-bold text-blue-900 text-lg mb-3">Details of Guest</div>
                <ul class="text-xs text-blue-700 mt-2 mb-2 list-disc list-inside space-y-1">
                    <li>if has company of guest more than 1 company, Please click "ADD" button for add items.</li>
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
            <div class="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4 mb-2 shadow" id="div_gt">
                <h2 class="font-bold text-blue-900 mb-2 text-lg">*Details: Please select for guest type</h2>
                <div class="overflow-x-auto">
                    <table class="table table-xs md:table-sm w-full border rounded-xl overflow-hidden">
                        <thead class="bg-blue-800 text-white text-center text-xs rounded-t-xl">
                            <tr class="text-center">
                                <th>#</th>
                                <th class="border-blue-100 w-64">Guest Type</th>
                                <th class="border-blue-100" colspan="2">Participant / Number</th>
                                <th class="border-blue-100" colspan="3">Meal expense for guest (Baht / Person / Time)</th>
                            </tr>
                        </thead>
                        <tbody class="bg-amber-50">
                            @foreach ($guest_type as $gt)
                                <tr>
                                    <td><input type="radio" name="guest_type" class="checkbox bg-white text-blue-500 checkbox-primary guest_type" value="{{ $gt->GT_ID }}"></td>
                                    <td class="text-left">{{ $gt->TYPE_NAME }}</td>
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
                <input type="file" name="visitor_notice" id="visitor-notice" class="file-input file-input-bordered rounded-lg w-full max-w-xs" />
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
                        <span class="font-bold text-blue-900 mr-2">Entertainment's Budget:</span>
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
                                        <select class="select select-sm rounded-lg estimate-type">
                                            <option value="">--Select Detail--</option>
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
                    <div id="attach-memo-section" style="display:none">
                        <div class="mt-2">
                            <label class="block font-semibold text-blue-700 mb-1">Attach Memo:</label>
                            <div class="flex items-center gap-2">
                                <input type="file" name="file_memo" id="file-memo" class="file-input file-input-bordered rounded-lg file-input-sm" />
                                <span class="text-xs text-amber-600">Require "Memorandum" get approve by President only,In case of Cost/Person over condition</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center pt-5 rounded-lg space-x-4">
                        <div class="bg-blue-700 text-white font-semibold px-4 py-4 rounded-l-lg">
                            Cash Advance
                        </div>
                        <div class="space-y-2">
                            <div class="flex items-center space-x-2">
                                <input type="radio" id="cashYes" name="cash_advance" class="checkbox checkbox-primary text-blue-500 bg-white  cash_adv" value="1" />
                                <label for="cashYes" class="font-semibold">Yes</label>
                                <div class="text-xs italic text-gray-500">
                                    *Receive cash from FIN Department within 3-4 working day
                                </div>
                            </div>

                            <div class="flex items-center space-x-2">
                                <input type="radio" id="cashNo" name="cash_advance" class="checkbox checkbox-primary text-blue-500 bg-white  cash_adv" value="0" />
                                <label for="cashNo" class="font-semibold">No</label>
                                <div class="text-xs italic text-gray-500">
                                    *Please bring original receipt for clearance expense on Form Clearacnce Expense for Entertainment (Part 2).
                                </div>
                            </div>
                        </div>


                    </div>


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

            <!-- Submit -->
            <div class="text-center mt-6">
                <button class="btn btn-accent btn-wide text-lg rounded-2xl shadow-lg transition hover:scale-105" id="submit-btn">Submit</button>
            </div>
        </div>
    </div>
@endsection

@section('scripts')
    <!-- Flatpickr -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script src="{{ $_ENV['APP_JS'] }}/requestEntertain.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
