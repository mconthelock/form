@extends('layouts/webflowTemplate')

@section('contents')
    <div id="loading-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.85); z-index:9999;">
        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%);">
            <img src="{{ base_url() }}assets/images/loading_gif.gif" alt="Loading..." width="120">
        </div>
    </div>
    <div class="form-data" data-nfrmno="{{ $NFRMNO }}" data-vorgno="{{ $VORGNO }}" data-cyear="{{ $CYEAR }}"></div>
    <div class="form-ent" data-nfrmno="{{ $ent['NFRMNO'] }}" data-vorgno="{{ $ent['VORGNO'] }}" data-cyear="{{ $ent['CYEAR'] }}" data-cyear2="{{ $ent['CYEAR2'] }}" data-nrunno="{{ $ent['NRUNNO'] }}"></div>
    <div class="w-full min-h-screen bg-gray-100 px-2 pb-10">
        <div class="max-w-6xl mx-auto bg-white rounded-2xl shadow p-10 border-2 border-gray-300">
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
                            <tr>
                                <th class="w-1/3 text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Form No.</th>
                                <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $formNumber }}</td>
                            </tr>
                            <tr>
                                <th class="w-1/3 text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Input by</th>
                                <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $entertainData->EMP_INPUT }}</td>
                            </tr>
                            <tr>
                                <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Requested by</th>
                                <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $entertainData->EMP_REQ }}</td>
                            </tr>
                            <tr>
                                <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Purpose for Entertainment</th>
                                <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $entertainData->PURPOSE }}</td>
                            </tr>
                            <tr>
                                <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Entertainment Date</th>
                                <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $entertainData->ENTERTAINMENT_DATE }}</td>
                            </tr>
                            <tr>
                                <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Time</th>
                                <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $entertainData->TYPE_TIME }}</td>
                            </tr>
                            @if ($entertainData->FILE_MEMO_GIFT)
                                <tr>
                                    <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">File Memo Gift</th>
                                    <td class="py-2 pl-4 border-b-2 border-blue-200">
                                        <a href="{{ base_url('gpform/GP-ENT/main/preview/' . $entertainData->FILE_MEMO_GIFT) }}" target="_blank" class="text-blue-700 underline btn btn-sm rounded-lg">
                                            {{ $entertainData->FILE_MEMO_GIFT }}
                                        </a>
                                    </td>
                                </tr>
                            @endif
                            @if ($entertainData->FILE_MEMO_OTHER)
                                <tr>
                                    <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">File Memo Other</th>
                                    <td class="py-2 pl-4 border-b-2 border-blue-200">
                                        <a href="{{ base_url('gpform/GP-ENT/main/preview/' . $entertainData->FILE_MEMO_OTHER) }}" target="_blank" class="text-blue-700 underline btn btn-sm rounded-lg">
                                            {{ $entertainData->FILE_MEMO_OTHER }}
                                        </a>
                                    </td>
                                </tr>
                            @endif
                            @if ($entertainData->OTHER_DETAILS)
                                <tr>
                                    <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Other Details</th>
                                    <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $entertainData->OTHER_DETAILS }}</td>
                                </tr>
                            @endif
                            <tr>
                                <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Location</th>
                                <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $entertainData->LOCATION_TYPE ?? '-' }}</td>
                            </tr>
                            {{-- <tr>
                                <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Entertainment Budget</th>
                                <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $entertainData->ENTERTAINMENT_BUDGET ?? '-' }}</td>
                            </tr> --}}
                            <tr>
                                <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-blue-200 bg-blue-100">Guest Type</th>
                                <td class="py-2 pl-4 border-blue-200">{{ $entertainData->TYPE_NAME }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="mb-8 w-full">
                    <h3 class="font-semibold text-blue-900 mb-2">Quantity of Participant</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 border-2 border-gray-300 rounded-xl p-3 bg-gray-50">
                        @php
                            $amec = array_filter($dataParticipants, function ($item) {
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
                                    <li>{{ $value->SEMPPRE . ' ' . $value->SNAME }}</li>
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

            @php
                $mealTypes = [1, 2, 3];
                $breakTypes = [4, 7];
                $estimateByType = [];
                $presentTypes = [];

                foreach ($estimate_cost as $item) {
                    $estimateByType[$item->ET_ID] = $item->TOTAL_COST;
                    $presentTypes[$item->ET_ID] = true;
                }

                $hasMeal = false;
                $hasBreak = false;
                foreach (array_keys($presentTypes) as $typeId) {
                    if (in_array($typeId, $mealTypes, true)) {
                        $hasMeal = true;
                    }
                    if (in_array($typeId, $breakTypes, true)) {
                        $hasBreak = true;
                    }
                }

                $splitExpense = $hasMeal && $hasBreak;

                $typeConfigs = [
                    1 => [
                        'label' => 'Lunch -> Inside',
                        'text' => 'text-blue-800',
                        'labelText' => 'text-blue-800',
                        'border' => 'border-blue-500',
                        'borderLight' => 'border-blue-200',
                        'bg' => 'bg-blue-50',
                        'headerBg' => 'bg-blue-200',
                        'headerText' => 'text-blue-900',
                        'focusRing' => 'focus:ring-blue-400',
                        'fileBorder' => 'border-blue-400',
                        'button' => 'bg-blue-600 hover:bg-blue-700',
                        'allowMulti' => true
                    ],
                    2 => [
                        'label' => 'Lunch -> Outside',
                        'text' => 'text-indigo-800',
                        'labelText' => 'text-indigo-800',
                        'border' => 'border-indigo-500',
                        'borderLight' => 'border-indigo-200',
                        'bg' => 'bg-indigo-50',
                        'headerBg' => 'bg-indigo-200',
                        'headerText' => 'text-indigo-900',
                        'focusRing' => 'focus:ring-indigo-400',
                        'fileBorder' => 'border-indigo-400',
                        'button' => 'bg-indigo-600 hover:bg-indigo-700',
                        'allowMulti' => true
                    ],
                    3 => [
                        'label' => 'Dinner -> Outside',
                        'text' => 'text-slate-800',
                        'labelText' => 'text-slate-800',
                        'border' => 'border-slate-500',
                        'borderLight' => 'border-slate-200',
                        'bg' => 'bg-slate-50',
                        'headerBg' => 'bg-slate-200',
                        'headerText' => 'text-slate-900',
                        'focusRing' => 'focus:ring-slate-400',
                        'fileBorder' => 'border-slate-400',
                        'button' => 'bg-slate-600 hover:bg-slate-700',
                        'allowMulti' => true
                    ],
                    4 => [
                        'label' => 'Morning Break (Snack Box)',
                        'text' => 'text-violet-800',
                        'labelText' => 'text-violet-800',
                        'border' => 'border-violet-500',
                        'borderLight' => 'border-violet-200',
                        'bg' => 'bg-violet-50',
                        'headerBg' => 'bg-violet-200',
                        'headerText' => 'text-violet-900',
                        'focusRing' => 'focus:ring-violet-400',
                        'fileBorder' => 'border-violet-400',
                        'button' => 'bg-violet-600 hover:bg-violet-700',
                        'allowMulti' => true
                    ],
                    7 => [
                        'label' => 'Afternoon Break (Snack Box)',
                        'text' => 'text-teal-800',
                        'labelText' => 'text-teal-800',
                        'border' => 'border-teal-500',
                        'borderLight' => 'border-teal-200',
                        'bg' => 'bg-teal-50',
                        'headerBg' => 'bg-teal-200',
                        'headerText' => 'text-teal-900',
                        'focusRing' => 'focus:ring-teal-400',
                        'fileBorder' => 'border-teal-400',
                        'button' => 'bg-teal-600 hover:bg-teal-700',
                        'allowMulti' => true
                    ]
                ];
            @endphp

            @if ($splitExpense)
                <div class="mt-10">
                    @foreach ($typeConfigs as $typeId => $cfg)
                        @if (!empty($presentTypes[$typeId]))
                            <h3 class="flex items-center gap-2 font-bold {{ $cfg['text'] }} mb-3 mt-8 text-xl">
                                {{ $cfg['label'] }}
                            </h3>
                            <div class="border-2 {{ $cfg['border'] }} rounded-2xl p-4 {{ $cfg['bg'] }} shadow-sm transition mb-8" data-estimate="{{ $estimateByType[$typeId] ?? 0 }}">
                                <table class="min-w-full text-sm border-1 rounded-xl overflow-hidden expense-table-split" data-type="{{ $typeId }}" data-label="{{ $cfg['label'] }}">
                                    <thead>
                                        <tr class="{{ $cfg['headerBg'] }} {{ $cfg['headerText'] }}">
                                            <th class="py-2 px-4 text-center w-12 rounded-tl-xl">No.</th>
                                            <th class="py-2 px-4 text-center">Receipt No.</th>
                                            <th class="py-2 px-4 text-center">Cost</th>
                                            <th class="py-2 px-4 text-center">Date issue receipt</th>
                                            <th class="py-2 px-4 text-center">Attach Receipt</th>
                                            <th class="py-2 px-4 w-12 rounded-tr-xl"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td class="py-2 px-4 text-center">1</td>
                                            <td class="py-2 px-4">
                                                <input type="text" name="receipt_no_{{ $typeId }}[]" class="input input-sm border rounded-lg px-3 py-1 w-full focus:ring-2 bg-white {{ $cfg['focusRing'] }} transition" placeholder="Receipt No.">
                                            </td>
                                            <td class="py-2 px-4">
                                                <input type="number" name="cost_{{ $typeId }}[]" class="input input-sm border rounded-lg px-3 py-1 w-full focus:ring-2 bg-white {{ $cfg['focusRing'] }} transition cost-input" placeholder="Cost">
                                            </td>
                                            <td class="py-2 px-4">
                                                <input type="date" name="date_issue_{{ $typeId }}[]" class="input input-sm border rounded-lg px-3 py-1 w-full focus:ring-2 bg-white {{ $cfg['focusRing'] }} transition">
                                            </td>
                                            <td class="py-2 px-4">
                                                <input type="file" name="receipt_file_{{ $typeId }}[]" class="file-input file-input-sm file-input-bordered w-full max-w-xs rounded-lg {{ $cfg['fileBorder'] }}">
                                            </td>
                                            <td class="py-2 px-4 text-center">
                                                @if ($cfg['allowMulti'])
                                                    <button type="button" class="remove-row bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center cursor-pointer justify-center shadow transition" title="Remove row">
                                                        &times;
                                                    </button>
                                                @endif
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                @if ($cfg['allowMulti'])
                                    <div class="flex justify-end mt-4">
                                        <button type="button" class="add-row-split {{ $cfg['button'] }} text-white font-semibold py-2 px-6 rounded-xl shadow cursor-pointer transition flex items-center gap-2" data-type="{{ $typeId }}">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                            </svg>
                                            Add Row
                                        </button>
                                    </div>
                                @endif

                                <div class="grid grid-cols-1 gap-6 mt-6 border-t {{ $cfg['borderLight'] }} pt-4 memo-section" id="memo-section-{{ $typeId }}" data-type="{{ $typeId }}" style="display:none;">
                                    <div>
                                        <label class="font-semibold {{ $cfg['labelText'] }} mb-1 block">Attach Memo:</label>
                                        <div class="flex items-center gap-3">
                                            <input type="file" name="memo_{{ $typeId }}" class="file-input file-input-bordered w-full max-w-xs rounded-xl {{ $cfg['fileBorder'] }}">
                                        </div>
                                        <span class="text-xs text-red-500 mt-1">Require "Memorandum" if cost exceeds budget.</span>
                                    </div>
                                </div>
                            </div>
                        @endif
                    @endforeach
                </div>
            @else
                <div class="mt-10">
                    <h3 class="flex items-center gap-2 font-bold text-blue-800 mb-3 mt-8 text-xl">
                        <!-- <svg ... ไอคอน>  --> Expense Cost <label class="text-sm inline-block font-light text-red-500">(*If has “Receipt no.” more than 1, Please click “Add row” button for input the details.)</label>
                    </h3>
                    <div class="border-2 border-blue-500 rounded-2xl p-4 bg-blue-50 shadow-sm transition">
                        <table class="min-w-full text-sm border-1 rounded-xl overflow-hidden" id="expense-table">
                            <thead>
                                <tr class="bg-blue-200 text-blue-900">
                                    <th class="py-2 px-4 text-center w-12 rounded-tl-xl">No.</th>
                                    <th class="py-2 px-4 text-center">Receipt No.</th>
                                    <th class="py-2 px-4 text-center">Cost</th>
                                    <th class="py-2 px-4 text-center">Date issue receipt</th>
                                    <th class="py-2 px-4 text-center">Attach Receipt</th>
                                    <th class="py-2 px-4 w-12 rounded-tr-xl"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="py-2 px-4 text-center">1</td>
                                    <td class="py-2 px-4">
                                        <input type="text" name="receipt_no[]" class="input input-sm border rounded-lg px-3 py-1 w-full focus:ring-2 bg-white focus:ring-blue-400 transition" placeholder="Receipt No.">
                                    </td>
                                    <td class="py-2 px-4">
                                        <input type="number" name="cost[]" class="input input-sm border rounded-lg px-3 py-1 w-full focus:ring-2 bg-white focus:ring-blue-400 transition cost-input" placeholder="Cost">
                                    </td>
                                    <td class="py-2 px-4">
                                        <input type="date" name="date_issue[]" class="input input-sm border rounded-lg px-3 py-1 w-full focus:ring-2 bg-white focus:ring-blue-400 transition">
                                    </td>
                                    <td class="py-2 px-4">
                                        <input type="file" name="receipt_file[]" class="file-input file-input-sm file-input-bordered w-full max-w-xs rounded-lg border-blue-400">
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
                            <button type="button" id="add-row" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-xl shadow cursor-pointer transition flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Add Row
                            </button>
                        </div>
                        <!-- <button class="btn btn-success" id="test-submit">Test</button> -->
                    </div>
                </div>
            @endif

            <!-- Section Clearance for Expense -->
            <div class="mt-8">
                <div class="bg-green-50 rounded-2xl border-2 border-green-500 p-6 shadow space-y-8">
                    <h2 class="font-bold text-green-800 text-2xl mb-3">Clearance for Expense</h2>
                    <h2 class="font-bold text-orange-500 text-2xl mb-3 border-3  border-orange-500 inline-block p-2">Cash Advance : {{ $entertainData->REIMBURSEMENT == '1' ? 'Yes' : 'No' }}</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <!-- President join -->
                        <div>
                            <label class="font-semibold text-green-700 mb-1 block">President:</label>
                            <div class="flex gap-4">
                                <label class="inline-flex items-center cursor-pointer">
                                    <input type="radio" name="president_join" id="president_join" class="radio radio-success bg-white" value="1" required>
                                    <span class="ml-2">Join</span>
                                </label>
                                <label class="inline-flex items-center cursor-pointer">
                                    <input type="radio" name="president_join" id="president_join" class="radio radio-success bg-white" value="2" required>
                                    <span class="ml-2">Not Join</span>
                                </label>
                            </div>
                            <span class="text-xs text-red-500 mt-1 block">*Please select if President joins the meal.</span>
                        </div>
                        <!-- Actual cost -->
                        <div>
                            <label class="font-semibold text-green-700 mb-1 block">Actual Cost:</label>
                            <input type="number" name="actual_cost" id="actual-cost" class="input input-bordered w-full rounded-xl text-lg border-green-400 focus:ring-2 focus:ring-green-500" readonly placeholder="Enter actual expense" required>
                        </div>
                        <!-- Remain -->
                        <div>
                            <label class="font-semibold text-green-700 mb-1 block">Remain:</label>
                            <input type="text" name="remain" id="remain" class="input input-bordered w-full rounded-xl text-lg font-bold border-green-400 bg-green-50" readonly style="color: #16a34a;">
                            <span id="remain-alert" class="text-xs mt-1 text-red-500"></span>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Attach Receipt -->
                        {{-- <div>
                            <label class="font-semibold text-green-700 mb-1 block">Attach Receipt:</label>
                            <div class="flex items-center gap-3">
                                <input type="file" name="receipt" id="receipt" class="file-input file-input-bordered w-full max-w-xs rounded-xl border-green-400">
                            </div>
                        </div> --}}
                        <!-- Remark -->
                        {{-- <div>
                            <label class="font-semibold text-green-700 mb-1 block">Remark:</label>
                            <textarea name="remark" id="remark" class="textarea textarea-bordered w-full min-h-[44px] rounded-xl border-green-400 focus:ring-2 focus:ring-green-500" placeholder="หากค่าใช้จ่ายเกิน ให้ระบุเหตุผล (บังคับ)"></textarea>
                        </div> --}}
                    </div>
                    <div class="grid grid-cols-1 gap-6" id="file-group-section" style="display:none;">
                        <div>
                            <label class="font-semibold text-green-700 mb-1 block">Attach Memo:</label>
                            <div class="flex items-center gap-3">
                                <input type="file" name="file_group" multiple id="file_group" class="file-input file-input-bordered w-full max-w-xs rounded-xl border-green-400">
                            </div>
                            <span class="text-xs text-amber-600 mt-2">In case of the expense is over Estimate cost must be prepare memorandum and get approve by President only.</span>
                            <ul id="file-list" class="mt-4 space-y-1 text-gray-600"></ul>
                        </div>
                    </div>
                    <div class="flex justify-end mt-6">
                        <input type="hidden" id="inputer" value="{{ $inputer }}">
                        <input type="hidden" id="requester" value="{{ $empcode }}">
                        <input type="hidden" id="formnumber" value="{{ $formNumber }}">
                        <button id="btn-submit" class="btn btn-success btn-lg rounded-2xl px-8 shadow-md transition hover:scale-105">Submit</button>
                    </div>

                    {{-- <div class="text-xs mt-4 text-gray-600">
                        * ระบบจะคำนวณค่าใช้จ่ายจริงเทียบกับประมาณการ หากค่าใช้จ่ายจริงเกิน (ติดลบ) จะต้องระบุเหตุผลใน Remark และ Submit ไม่ได้ถ้าเหตุผลว่าง<br>
                        * ขั้นตอนอนุมัติ: ถ้า President Join → อนุมัติโดย RAF DIM, ถ้า Not Join → อนุมัติโดย President
                    </div> --}}
                </div>
                <div class="flow mt-8">

                </div>
            </div>
        </div>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/clearance.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
