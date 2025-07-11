@extends('layouts/webflowTemplate')

@section('styles')
    <style>
        @media print {
            .no-print {
                display: none;
            }

            html,
            body {
                /* ซ่อน scroll bar ตอน print */
                overflow: hidden !important;
                /* ให้ขนาดพอดี A4 */
                width: 210mm;
                height: 297mm;
            }



            body>* {
                /* ย่อทั้ง body ให้เหมือนปรับ scale ใน dialog (เช่น 62%) */
                transform: scale(0.55);
                transform-origin: top left;
                margin-top: 2rem;
                width: 380.2mm;
                /* 210 * 0.62 */
                /* height: 190.14mm; */
                /* 297 * 0.62 */
            }

        }
    </style>
@endsection
@section('contents')
    <div id="loading-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.7); z-index:9999;">
        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%);">
            <img src="{{base_url()}}assets/images/loading_gif.gif" alt="Loading..." width="150">
        </div>
    </div>
    <div id="pdf-content">
        <div class="form-data" data-nfrmno="{{ $NFRMNO }}" data-vorgno="{{ $VORGNO }}" data-cyear="{{ $CYEAR }}" data-cyear2="{{ $CYEAR2 }}" data-nrunno="{{ $NRUNNO }}" data-empno="{{ $EMPNO }}"></div>
        <div class="w-full min-h-screen bg-gray-100 px-2 pb-10 ">
            <div class="max-w-5xl mx-auto bg-white rounded-2xl shadow p-10 border-2 border-gray-300">
                <div class="mb-8 border-b-2 border-blue-500 pb-4 flex flex-col md:flex-row md:justify-between items-start gap-3">
                    <div>
                        <h2 class="text-2xl font-bold text-blue-900 tracking-wide">Form Clearance for Expense (Part2)</h2>
                        <div class="text-gray-500 text-base">แบบเคลียร์ค่าใช้จ่ายในการรับรองผู้มาติดต่อ (ส่วนที่2)</div>
                        @if(empty($formCler->FORM_ENT))
                            <div class="text-red-500 text-base">Not has Advance Entertainment Form <Br> (แบบเคลียร์ค่าใช้จ่ายในการรับรองผู้มาติดต่อ *กรณีที่ ไม่ได้มีการขออนุมัติล่วงหน้า)</div>
                        @endif
                    </div>
                    <div class="text-gray-500 text-sm mt-2 md:mt-0">
                        <span>Report Date: {{ date('d-m-Y') }}</span>
                    </div>
                </div>
                <!-- ส่วนสรุป Approval (Part 1) -->
                <div class="grid grid-cols-1 gap-4">

                    <div>
                        <div class="overflow-hidden rounded-xl border-2 border-blue-200 mb-8 bg-blue-50">
                            <table class="w-full text-sm">
                                <tbody>
                                    @if(!empty($formCler->FORM_ENT))
                                        <tr>
                                            <th class="w-1/4 text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Form No.</th>
                                            <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $formCler->FORM_ENT }}</td>
                                        </tr>
                                    @endif
                                    <tr>
                                        <th class="w-1/4 text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Input by</th>
                                        <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $ENT_FORM->EMP_INPUT }}</td>
                                    </tr>
                                    <tr class="bg-blue-50">
                                        <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Requested by</th>
                                        <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $ENT_FORM->EMP_REQ }}</td>
                                    </tr>
                                    <tr>
                                        <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Purpose for Entertainment</th>
                                        <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $ENT_FORM->PURPOSE }}</td>
                                    </tr>
                                    <tr class="bg-blue-50">
                                        <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Entertainment Date</th>
                                        <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $ENT_FORM->ENTERTAINMENT_DATE }}</td>
                                    </tr>
                                    <tr>
                                        <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Time</th>
                                        <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $ENT_FORM->TYPE_TIME }}</td>
                                    </tr>
                                    <tr class="bg-blue-50">
                                        <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Location</th>
                                        <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $ENT_FORM->LOCATION_TYPE }}</td>
                                    </tr>
                                    <tr>
                                        <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Entertainment Budget</th>
                                        <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $ENT_FORM->ENTERTAINMENT_BUDGET ?? '-' }}</td>
                                    </tr>
                                    <tr class="bg-blue-50">
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
                        <div class="mb-8 w-full ">
                            <h3 class="text-xl font-bold text-blue-700 mb-4">Quantity of Participant</h3>
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
                                    <div class="font-semibold text-blue-700 mb-1 ">Guest: {{ count($guest) }} person</div>
                                    <ul class="list-disc list-inside text-gray-700 ml-4 ">
                                        @foreach ($guest as $value)
                                            <li>{{ $value->NAME }}</li>
                                        @endforeach
                                    </ul>
                                </div>

                                <div class="pl-3">
                                    <div class="font-semibold text-blue-700 mb-1">AMEC: {{ count($amec) }} person</div>
                                    <ul class="list-disc list-inside text-gray-700 ml-4">
                                        @foreach ($amec as $value)
                                            <li>{{ $value->SEMPPRE . " " . $value->SNAME }}</li>
                                        @endforeach
                                    </ul>
                                </div>
                            </div>
                        </div>
                        @if(!empty($estimate_cost))
                            <h2 class="text-xl font-bold text-blue-700 mb-4">Estimate Cost</h2>
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
                                        <tr class="text-center hover:bg-gray-50">
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
                        @endif
                    </div>
                    <div>
                        <h2 class="text-xl font-bold text-green-700 mb-4">Expense Cost Detail</h2>
                        <div class="overflow-hidden rounded-xl border-2 border-green-200 bg-green-50">
                            <table class="w-full text-sm border">
                                <thead>
                                    <tr class="bg-green-100">
                                        <th class="py-2 px-4 border-b border-green-200 text-left">#</th>
                                        <th class="py-2 px-4 border-b border-green-200 text-left">Receipt No.</th>
                                        <th class="py-2 px-4 border-b border-green-200 text-left">Cost</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($expense as $i => $ex)
                                        <tr>
                                            <td class="py-2 px-4 border-b border-green-100">{{ $i + 1 }}</td>
                                            <td class="py-2 px-4 border-b border-green-100">{{ $ex->RECEIPT }}</td>
                                            <td class="py-2 px-4 border-b border-green-100">{{ $ex->COST}} </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div>
                        <!-- <div class="w-full bg-white rounded-2xl shadow p-8 border border-green-100"> -->
                        <h2 class="text-xl font-bold text-green-700 mb-4">Clearance for Expense Detail</h2>
                        <div class="overflow-hidden rounded-xl border-2 border-green-200 mb-8 bg-green-50">
                            <table class="w-full text-sm">
                                <tbody>
                                    <tr>
                                        <th class="w-1/4 text-left font-semibold py-2 pl-4 border-b-2 border-green-200 bg-green-100">President</th>
                                        <td class="py-2 pl-4 border-b-2 border-green-200">{{ $formCler->PRESIDENT_JOIN == '1' ? 'Join' : 'Not Join' }}</td>
                                    </tr>
                                    <tr>
                                        <th class="text-left font-semibold py-2 pl-4 border-b-2 border-green-200 bg-green-100">Cash Advance</th>
                                        <td class="py-2 pl-4 border-b-2 text-orange-700 font-semibold border-green-200">{{ $ENT_FORM->REIMBURSEMENT == '1' ? 'Yes' : 'No' }}</td>
                                    </tr>
                                    <tr>
                                        <th class="text-left font-semibold py-2 pl-4 border-b-2 border-green-200 bg-green-100">Actual Cost</th>
                                        <td class="py-2 pl-4 border-b-2 border-green-200">{{ number_format($formCler->ACTUAL_COST, 2) }} </td>
                                    </tr>
                                    @if(!empty($formCler->REASON))
                                        <tr>
                                            <th class="text-left  font-semibold py-2 pl-4 border-b-2 border-green-200 bg-green-100">Reason</th>
                                            <td class="py-2 pl-4 border-b-2 border-green-200">{{$formCler->REASON }}</td>
                                        </tr>
                                    @endif
                                    @if(!empty($formCler->REMAIN_BUDGET))
                                        <tr>
                                            <th class="text-left  font-semibold py-2 pl-4 border-b-2 border-green-200 bg-green-100">Remain</th>
                                            <td class="py-2 pl-4 border-b-2 border-green-200">{{ number_format($formCler->REMAIN_BUDGET, 2) }} {{ $formCler->REMAIN_BUDGET > 0 ? "(Return cash to company)" : "(Reimbursement to Employee($ENT_FORM->EMP_REQ))" }}</td>
                                        </tr>
                                    @endif
                                    <tr>
                                        <th class="text-left  font-semibold py-2 pl-4 border-b-2 border-green-200 bg-green-100">Attach Receipt</th>
                                        <td class="py-2 pl-4 border-b-2 border-green-200">
                                            <a href="{{ base_url('gpform/GP-CLER/main/preview/') . $formCler->RECEIPT_FILE }}" class="link text-blue-400 btn rounded-lg" target="_blank">Open Attachment Receipt</a>
                                            <!-- <a href="#" class="text-blue-700 underline">{{ $formCler->RECEIPT_FILE }}</a> -->
                                        </td>
                                    </tr>
                                    @if(!empty($formCler->MEMO_FILE))
                                        <tr>
                                            <th class="text-left  font-semibold py-2 pl-4 border-b-2 border-green-200 bg-green-100">Attach Memo</th>
                                            <td class="py-2 pl-4 border-b-2 border-green-200">
                                                <a href="{{ base_url('gpform/GP-CLER/main/preview/') . $formCler->MEMO_FILE }}" class="link text-blue-400 btn rounded-lg" target="_blank">Open Attachment Memo</a>
                                            </td>
                                        </tr>
                                    @endif
                                    <tr class="bg-green-50">
                                        <th class="text-left  font-semibold py-2 pl-4 border-green-200 bg-green-100">Remark</th>
                                        <td class="py-2 pl-4 border-green-200">{{ $formCler->REMARK }}</td>
                                    </tr>

                                </tbody>
                            </table>
                        </div>
                        <!-- <button id="btn-print-pdf" type="button" class="btn bg-indigo-600 text-white no-print mb-4">Save as PDF</button> -->
                        <!-- <button onclick="window.print()" class="btn bg-indigo-600 text-white no-print mb-4 no-print">Print</button> -->
                        <!-- </div> -->

                    </div>
                </div>
                @if($form[0]->CST == '2')
                    <div class="flex justify-center mt-8 no-print">
                        <button onclick="window.print()" class="btn bg-indigo-600 text-white no-print">Print</button>
                    </div>
                @endif
                @if ($mode == '02')
                    <div class="flex justify-center mt-6 space-x-4 no-print">
                        <button class="bg-green-600 text-white px-6 py-2 btn rounded-lg shadow hover:bg-green-700 transition btn-submit" data-action="approve" id="btn-confirm">
                            Approve
                        </button>
                        <button class="bg-red-600 text-white px-6 py-2 btn rounded-lg shadow hover:bg-red-700 transition btn-submit" data-action="reject">
                            Reject
                        </button>
                        <button class="bg-blue-600 text-white px-6 py-2 btn rounded-lg shadow hover:bg-blue-700 transition btn-submit" data-action="return">
                            Return
                        </button>
                    </div>
                    <div class="flex justify-center mt-3 no-print">
                        <textarea name="" id="remark_approve" class="textarea rounded-lg" placeholder="Remark..."></textarea>
                    </div>
                @endif
                <div class="flow mt-6" style="overflow: hidden "></div>
                <!-- Section Clearance for Expense -->
            </div>
        </div>

    </div>
    <!-- <button id="btn-print-pdf" class="no-print">Save as PDF</button> -->
@endsection

@section('scripts')

    <script src="{{ $_ENV['APP_JS'] }}/clearanceView.js?ver={{ $GLOBALS['version'] }}"></script>
    <script>
        $(document).ready(function () {
            const estimate = $('#total_amount').text().replace(/,/g, '') * 1; // Convert to number
            const $actualCost = $('#actual-cost');
            const $remain = $('#remain');
            const $remainAlert = $('#remain-alert');
            const $remark = $('#remark');

            $actualCost.on('input', function () {
                const val = parseFloat($(this).val()) || 0;
                const remain = estimate - val;
                $remain.val(remain.toLocaleString() + ' บาท');

                if (remain >= 0) {
                    $remain.css('color', '#16a34a'); // เขียว
                    $remainAlert.html('<span class="text-green-700">ค่าใช้จ่ายจริงไม่เกินยอดประมาณการ</span>');
                    $remark.prop('required', false);
                } else {
                    $remain.css('color', '#dc2626'); // แดง
                    $remainAlert.html('<span class="text-red-600">ค่าใช้จ่ายจริงเกินยอดประมาณการ กรุณาระบุเหตุผลใน Remark</span>');
                    $remark.prop('required', true);
                }
            });
        });
    </script>



@endsection