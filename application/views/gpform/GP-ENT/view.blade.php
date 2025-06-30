@extends('layouts/webflowTemplate')

@section('styles')
    <style>
        .floating-label>span {
            font-size: 12pt;
        }

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
                transform: scale(0.62);
                transform-origin: top left;
                margin-top: 2rem;
                width: 350.2mm;
                /* 210 * 0.62 */
                height: 190.14mm;
                /* 297 * 0.62 */
            }

        }
    </style>
@endsection
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
                    <h2 class="text-2xl font-bold text-blue-900 tracking-wide">Entertainment Request Approval (Part 1)</h2>
                    <div class="text-gray-500 text-base">แบบฟอร์มขออนุมัติค่าใช้จ่ายในการรับรองผู้มาติดต่อ (ส่วนที่ 1)</div>
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
                                <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $form[0]->VINPUTNAME }}</td>
                            </tr>
                            <tr>
                                <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Requested by</th>
                                <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $form[0]->VREQNAME }}</td>
                            </tr>
                            <tr>
                                <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Purpose for Entertainment</th>
                                <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $dataForm->PURPOSE }}</td>
                            </tr>
                            <tr>
                                <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Entertainment Date</th>
                                <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $dataForm->ENTERTAINMENT_DATE }}</td>
                            </tr>
                            <tr>
                                <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Time</th>
                                <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $dataForm->TYPE_TIME }}</td>
                            </tr>
                            <tr>
                                <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Location</th>
                                <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $dataForm->LOCATION_TYPE }}</td>
                            </tr>
                            <tr>
                                <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Entertainment Budget</th>
                                <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $dataForm->ENTERTAINMENT_BUDGET ?? '-' }}</td>
                            </tr>
                            <tr>
                                <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-blue-200 bg-blue-100">Guest Type</th>
                                <td class="py-2 pl-4 border-blue-200">{{ $dataForm->TYPE_NAME }}</td>
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
                <table class="w-full mt-2 table-fixed border-2 border-blue-200 rounded-xl overflow-hidden bg-white">
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
            @if($form[0]->CST == '2')
                <div class="flex justify-center mt-8">
                    <button onclick="window.print()" class="btn bg-indigo-600 text-white no-print mb-4 no-print">Print</button>
                </div>
            @endif
            @if ($mode == '02')
                @if ($flowstep[0]->CSTEPNO == '87' && $flowstep[0]->CSTEPNEXTNO == '00')
                    <div class="relative flex justify-center mt-4">
                        <div class="w-full max-w-xs">
                            <label class="floating-label block">
                                <span class="block mb-1 font-medium">Pay Date</span>
                                <div class="relative">
                                    <input type="date" name="pay_date" id="pay_date" class="input input-bordered border-gray-700 w-full pl-10" placeholder="Select Pay Date" />
                                    <!-- Heroicon Calendar -->
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </label>
                        </div>
                    </div>

                @endif

                @if($dataForm->ENTERTAINMENT_DATE < date("d-M-y") && $flowstep[0]->CSTEPNO == '18')

                    <!-- Open the modal using ID.showModal() method -->
                    <!-- <button class="btn" onclick="my_modal_1.showModal()">open modal</button> -->
                    <dialog id="my_modal_1" class="modal">
                        <div class="modal-box w-11/12 max-w-3xl">
                            <h3 class="text-lg font-bold"><i class="fa-solid fa-triangle-exclamation text-yellow-500 text-2xl"></i> Message Alert</h3>
                            <p class="py-4">
                                This Entertainment form, requested on <span class="text-red-500 font-semibold">{{$dataForm->ENTERTAINMENT_DATE}}</span>, was not approved before the event date. Please review and provide your approval by selecting either <span class="text-green-700 font-semibold">'Accept'</span> or <span class="text-red-700 font-semibold">'Not Accept'</span>.
                            </p>
                            <p class="py-4">
                                For your information.
                            </p>
                            <p>
                                (Refer: RAF Practical Regulation : RAF-PR-G-068).
                            </p>
                            <div class="modal-action">
                                <form method="dialog">
                                    <!-- if there is a button in form, it will close the modal -->
                                    <button class="btn">Close</button>
                                </form>
                            </div>
                        </div>
                    </dialog>

                    <div class="border-2 border-orange-500 bg-orange-50 mt-3 p-3 rounded-lg">
                        <span class="text-xl font-semibold">
                            *Please consider your approval by selecting accept or not accept. This form wasn’t approved before the entertainment date.
                        </span>
                        <div class="flex w-full gap-4">
                            <!-- Radio options -->
                            <div class="w-1/4 flex flex-col justify-center">
                                <div class="flex items-center mt-6 mb-2 pl-6">
                                    <input type="radio" name="accept" id="accept" class="checkbox checkbox-primary bg-white" value="1" />
                                    <label for="accept" class="ml-3 cursor-pointer text-black">Accept</label>
                                </div>
                                <div class="flex items-center mb-2 pl-6">
                                    <input type="radio" name="accept" id="notaccept" class="checkbox checkbox-primary bg-white" value="0" />
                                    <label for="notaccept" class="ml-3 cursor-pointer text-black">Not Accept</label>
                                </div>
                            </div>
                            <!-- Remark inputs -->
                            <div class="w-3/4 flex flex-col justify-center">
                                <div class="flex items-center mt-6 mb-2">
                                    <label for="accept_remark" class="bg-amber-300 rounded-md p-1 mr-2 w-28 text-center">Remark:</label>
                                    <input type="text" id="accept_remark" name="accept_remark" class="input input-bordered rounded-lg flex-1" placeholder="If any" />
                                </div>
                                <div class="flex items-center mb-2">
                                    <label for="notaccept_remark" class="bg-amber-300 rounded-md p-1 mr-2 w-28 text-center">*Remark:</label>
                                    <input type="text" id="notaccept_remark" name="notaccept_remark" class="input input-bordered rounded-lg flex-1" placeholder="*Please identify the reason" />
                                </div>
                            </div>
                        </div>

                    </div>

                @endif

                <div class="flex justify-center mt-6 space-x-4">
                    <input type="hidden" class="cstepno" value="{{ $flowstep[0]->CSTEPNO }}" />
                    <input type="hidden" class="cstepnextno" value="{{ $flowstep[0]->CSTEPNEXTNO }}" />
                    <button type="button" class="btn btn-success w-32 transition btn-submit" data-action="approve" id="btn-confirm">
                        Approve
                    </button>
                    <button type="button" class="btn btn-error w-32 transition btn-submit" data-action="reject">
                        Reject
                    </button>
                    @if ($flowstep[0]->CSTEPNO == '19' && $flowstep[0]->CSTEPNEXTNO == '18')
                        <button type="button" class="btn btn-info w-32 transition btn-submit" data-action="return">
                            Return
                        </button>
                    @endif
                </div>

                <div class="flex justify-center mt-4 no-print">
                    <textarea name="" id="remark_approve" class="textarea textarea-bordered rounded-lg w-full max-w-lg" rows="2" placeholder="Remark..."></textarea>
                </div>
            @endif



            <div class="flow mt-8">

            </div>

        </div>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/requestEntertainView.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection