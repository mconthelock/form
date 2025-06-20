@extends('layouts/webflowTemplate')

@section('contents')
    <div id="loading-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.85); z-index:9999;">
        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%);">
            <img src="{{base_url()}}assets/images/loading_gif.gif" alt="Loading..." width="120">
        </div>
    </div>
    <div class="form-data" data-nfrmno="{{ $NFRMNO }}" data-vorgno="{{ $VORGNO }}" data-cyear="{{ $CYEAR }}" data-cyear2="{{ $CYEAR2 }}" data-nrunno="{{ $NRUNNO }}" data-empno="{{ $EMPNO }}"></div>
    <div class="w-full min-h-screen bg-gray-100 px-2 pb-10">
        <div class="max-w-5xl mx-auto bg-white rounded-2xl shadow p-10 border-2 border-gray-300">
            <div class="mb-8 border-b-2 border-blue-500 pb-4 flex flex-col md:flex-row md:justify-between items-start gap-3">
                <div>
                    <h2 class="text-2xl font-bold text-blue-900 tracking-wide">Form Clearance for Expense (Part2)</h2>
                    <div class="text-gray-700 text-base">แบบเคลียร์ค่าใช้จ่ายในการรับรองผู้มาติดต่อ (ส่วนที่2)</div>
                </div>
                <div class="text-gray-700 text-sm mt-2 md:mt-0">
                    <span>Report Date: {{ date('d-m-Y') }}</span>
                </div>
            </div>
            <!-- Section: Summary Approval (Part 1) -->
            <div>
                <div class="overflow-hidden rounded-xl border-2 border-blue-200 mb-8 bg-blue-50">
                    <table class="w-full text-sm">
                        <tbody>
                            @if(!empty($formCler->FORM_ENT))
                                <tr>
                                    <th class="w-1/3 text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Form No.</th>
                                    <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $formCler->FORM_ENT }}</td>
                                </tr>
                            @endif
                            <tr>
                                <th class="w-1/3 text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Input by</th>
                                <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $ENT_FORM->EMP_INPUT }}</td>
                            </tr>
                            <tr>
                                <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Requested by</th>
                                <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $ENT_FORM->EMP_REQ }}</td>
                            </tr>
                            <tr>
                                <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Purpose for Entertainment</th>
                                <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $ENT_FORM->PURPOSE }}</td>
                            </tr>
                            <tr>
                                <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Entertainment Date</th>
                                <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $ENT_FORM->ENTERTAINMENT_DATE }}</td>
                            </tr>
                            <tr>
                                <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Time</th>
                                <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $ENT_FORM->TYPE_TIME }}</td>
                            </tr>
                            <tr>
                                <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Location</th>
                                <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $ENT_FORM->LOCATION_TYPE }}</td>
                            </tr>
                            <tr>
                                <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Entertainment Budget</th>
                                <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $ENT_FORM->ENTERTAINMENT_BUDGET ?? '-' }}</td>
                            </tr>
                            <tr>
                                <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-blue-200 bg-blue-100">Guest Type</th>
                                <td class="py-2 pl-4 border-blue-200">{{ $ENT_FORM->TYPE_NAME }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="mb-8">
                    <div class="text-lg font-bold text-blue-800 mb-2">Details of Guest</div>
                    <div class="overflow-hidden rounded-xl border-2 border-blue-200 bg-blue-50">
                        <table class="w-full text-sm border">
                            <thead>
                                <tr class="bg-blue-100">
                                    <th class="py-2 px-4 border-b border-blue-200 text-left">#</th>
                                    <th class="py-2 px-4 border-b border-blue-200 text-left">Company's Name</th>
                                    <th class="py-2 px-4 border-b border-blue-200 text-left">Organization Type</th>
                                    <th class="py-2 px-4 border-b border-blue-200 text-left">Appendix A</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($company as $i => $guest)
                                    <tr>
                                        <td class="py-2 px-4 border-b border-blue-100">{{ $i + 1 }}</td>
                                        <td class="py-2 px-4 border-b border-blue-100">{{ $guest->COMPANY_NAME }}</td>
                                        <td class="py-2 px-4 border-b border-blue-100">
                                            {{ $guest->COMPANY_TYPE == '2' ? 'Government' : 'Non-Government' }}
                                        </td>
                                        <td class="py-2 px-4 border-b border-blue-100">
                                            @if (!empty($guest->ATTACH_FILE))
                                                <a href="{{ base_url('gpform/GP-ENT/main/preview/' . $guest->ATTACH_FILE) }}" target="_blank" class="text-blue-700 underline btn btn-sm rounded-lg">
                                                    {{ $guest->ATTACH_FILE }}
                                                </a>
                                            @else
                                                -
                                            @endif
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="mb-8 w-full">
                    <h3 class="font-semibold text-blue-900 mb-2">Quantity of Participant</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 border-2 border-gray-300 rounded-xl p-3 bg-gray-50">
                        @php
                            $amec  = array_filter($dataParticipants, function ($item) {
                                return $item->TYPE === 'amec';
                            });
                            $guest = array_filter($dataParticipants, function ($item) {
                                return $item->TYPE === 'guest';
                            });
                        @endphp
                        <div class="border-r-2 border-gray-300 pr-3">
                            <div class="font-semibold text-blue-700 mb-1">Guest: {{ count($guest) }} person</div>
                            <ul class="list-disc list-inside text-gray-800 ml-4">
                                @foreach ($guest as $value)
                                    <li>{{ $value->NAME }}</li>
                                @endforeach
                            </ul>
                        </div>
                        <div class="pl-3">
                            <div class="font-semibold text-blue-700 mb-1">AMEC: {{ count($amec) }} person</div>
                            <ul class="list-disc list-inside text-gray-800 ml-4">
                                @foreach ($amec as $value)
                                    <li>{{ $value->SEMPPRE . " " . $value->SNAME }}</li>
                                @endforeach
                            </ul>
                        </div>
                    </div>
                </div>

                <h3 class="font-semibold text-blue-900 mb-2 mt-8">Estimate Cost</h3>
                <table class="w-full mt-5 table-fixed border-2 border-blue-200 rounded-xl overflow-hidden bg-white">
                    <thead>
                        <tr class="bg-blue-200 text-blue-900">
                            <th class="py-2 px-2 text-center font-semibold border-b-2 border-gray-400">Details</th>
                            <th class="py-2 px-2 text-center font-semibold border-b-2 border-gray-400">Quantity</th>
                            <th class="py-2 px-2 text-center font-semibold border-b-2 border-gray-400">Cost / Person</th>
                            <th class="py-2 px-2 text-center font-semibold border-b-2 border-gray-400">Total</th>
                            <th class="py-2 px-2 text-center font-semibold border-b-2 border-gray-400">Remark</th>
                        </tr>
                    </thead>
                    <tbody>
                        @php $sum = 0; @endphp
                        @foreach ($estimate_cost as $value)
                            @php $sum += $value->TOTAL_COST; @endphp
                            <tr class="text-center hover:bg-blue-50">
                                <td class="py-2 px-2 border-b border-gray-300">{{ $value->DETAILS }}</td>
                                <td class="py-2 px-2 border-b border-gray-300">{{ $value->QTY }}</td>
                                <td class="py-2 px-2 border-b border-gray-300">{{ $value->UNIT_COST }}</td>
                                <td class="py-2 px-2 border-b border-gray-300">{{ number_format($value->TOTAL_COST) }}</td>
                                <td class="py-2 px-2 border-b border-gray-300">{{ $value->REMARK }}</td>
                            </tr>
                        @endforeach
                        <tr class="font-semibold bg-blue-100">
                            <td colspan="3" class="text-right py-2 px-2">Total Amount</td>
                            <td class="text-center py-2 px-2 text-blue-900" id="total_amount">{{ number_format($sum) }}</td>
                            <td class="py-2 px-2"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <!-- Section Clearance for Expense -->
            <div class="mt-8">
                <div class="bg-green-50 rounded-2xl border-2 border-green-500 p-6 shadow space-y-8">
                    <h2 class="font-bold text-green-800 text-2xl mb-3">Clearance for Expense</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <!-- President join -->
                        <div>
                            <label class="font-semibold text-green-700 mb-1 block">President:</label>
                            <div class="flex gap-4">
                                <label class="inline-flex items-center cursor-pointer">
                                    <input type="radio" name="president_join" value="1" class="radio radio-success" {{ $formCler->PRESIDENT_JOIN == '1' ? 'checked' : '' }} required>
                                    <span class="ml-2">Join</span>
                                </label>
                                <label class="inline-flex items-center cursor-pointer">
                                    <input type="radio" name="president_join" value="2" class="radio radio-success" {{ $formCler->PRESIDENT_JOIN == '2' ? 'checked' : '' }} required>
                                    <span class="ml-2">Not Join</span>
                                </label>
                            </div>
                            <span class="text-xs text-red-500 mt-1 block">*Please select if President joins the meal.</span>
                        </div>
                        <!-- Actual cost -->
                        <div>
                            <label class="font-semibold text-green-700 mb-1 block">Actual Cost:</label>
                            <input type="number" name="actual_cost" id="actual-cost" class="input input-bordered w-full rounded-xl text-lg border-green-400 focus:ring-2 focus:ring-green-500" value="{{ $formCler->ACTUAL_COST }}" placeholder="Enter actual expense" required>
                        </div>
                        <!-- Remain -->
                        <div>
                            <label class="font-semibold text-green-700 mb-1 block">Remain:</label>
                            <input type="text" name="remain" id="remain" class="input input-bordered w-full rounded-xl text-lg font-bold border-green-400 bg-green-50" value="{{ $formCler->REMAIN_BUDGET }}" readonly style="color: #16a34a;">
                            <span id="remain-alert" class="text-xs mt-1 text-red-500"></span>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Attach Receipt -->
                        <div>
                            <label class="font-semibold text-green-700 mb-1 block">Attach Receipt:</label>
                            <div class="flex items-center gap-3">
                                <input type="file" name="receipt" id="receipt" class="file-input file-input-bordered w-full max-w-xs rounded-xl border-green-400" {{ $formCler->RECEIPT_FILE ? '' : 'required' }}>

                            </div>
                            <div class="mt-8">
                                @if ($formCler->RECEIPT_FILE)
                                    <label>Current File : </label>
                                    <a href="{{ base_url('gpform/GP-CLER/main/preview/') . $formCler->RECEIPT_FILE }}" class="link btn rounded-lg text-sm text-blue-600 font-semibold" target="_blank">View Current</a>
                                @endif
                            </div>
                        </div>
                        <!-- Remark -->
                        <div>
                            <label class="font-semibold text-green-700 mb-1 block">Remark:</label>
                            <textarea name="remark" id="remark" class="textarea textarea-bordered w-full min-h-[44px] rounded-xl border-green-400 focus:ring-2 focus:ring-green-500" placeholder="If actual cost exceeds, please specify reason (required)">{{ $formCler->REMARK }}</textarea>
                        </div>
                    </div>
                    <div class="flex justify-end mt-6">
                        <button type="submit" id="btn-savechange" class="btn btn-success btn-lg rounded-2xl px-8 shadow-md transition hover:scale-105">
                            Save Changes
                        </button>
                    </div>
                </div>
                <div class="flow mt-8">

                </div>
            </div>
        </div>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/clearanceView.js?ver={{ $GLOBALS['version'] }}"></script>
    <script>
        $(document).ready(function () {
            const estimate = $('#total_amount').text().replace(/,/g, '') * 1;
            const $actualCost = $('#actual-cost');
            const $remain = $('#remain');
            const $remainAlert = $('#remain-alert');
            const $remark = $('#remark');

            $actualCost.on('input', function () {
                const val = parseFloat($(this).val()) || 0;
                const remain = estimate - val;
                $remain.val(remain);

                if (remain >= 0) {
                    $remain.css('color', '#16a34a'); // green
                    $remainAlert.html('<span class="text-green-700">ค่าใช้จ่ายจริงไม่เกินยอดประมาณการ</span>');
                    $remark.prop('required', false);
                } else {
                    $remain.css('color', '#dc2626'); // red
                    $remainAlert.html('<span class="text-red-600">ค่าใช้จ่ายจริงเกินยอดประมาณการ กรุณาระบุเหตุผลใน Remark</span>');
                    $remark.prop('required', true);
                }
            });
        });
    </script>
@endsection