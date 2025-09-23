@extends('layouts/webflowTemplate')

@section('styles')
    <style>
        @media print {
            .no-print {
                display: none;
            }

            html,
            body {
                overflow: hidden !important;
                width: 210mm;
                height: 297mm;
            }

            body>* {
                transform: scale(0.55);
                transform-origin: top left;
                margin-top: 2rem;
                width: 380.2mm;
            }

            /* Show both tabs when printing */
            .tab-content {
                /* display: block !important; */
                page-break-after: always;
            }
        }

        /* Tab Styles */
        .tab-nav {
            display: flex;
            border-bottom: 2px solid #e5e7eb;
            margin-bottom: 0;
            background: #f9fafb;
            border-radius: 0.75rem 0.75rem 0 0;
        }

        .tab-button {
            flex: 1;
            padding: 1rem;
            background: transparent;
            border: none;
            cursor: pointer;
            font-weight: 500;
            color: #6b7280;
            transition: all 0.3s;
            position: relative;
        }

        .tab-button:hover {
            background: #f3f4f6;
        }

        .tab-button.active {
            color: #1f2937;
            background: white;
        }

        .tab-button.active::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            right: 0;
            height: 3px;
            background: #3b82f6;
        }

        .tab-button.active.tab-clearance::after {
            background: #10b981;
        }

        .tab-content {
            display: none;
            animation: fadeIn 0.3s;
        }

        .tab-content.active {
            display: block;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .status-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .badge-reference {
            background: #dbeafe;
            color: #1e40af;
        }

        .badge-current {
            background: #d1fae5;
            color: #065f46;
        }

        .process-flow {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            background: #f9fafb;
            border-radius: 0.5rem;
            margin-bottom: 1.5rem;
        }

        .process-step {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .process-arrow {
            margin: 0 1rem;
            color: #9ca3af;
        }

        .step-number {
            width: 2rem;
            height: 2rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
        }

        .step-1 {
            background: #3b82f6;
        }

        .step-2 {
            background: #10b981;
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
        <div class="form-data" data-nfrmno="{{ $NFRMNO }}" data-vorgno="{{ $VORGNO }}" data-cyear="{{ $CYEAR }}" data-cyear2="{{ $CYEAR2 }}" data-nrunno="{{ $NRUNNO }}" data-empno="{{ $EMPNO }}" data-need-paydate="{{ $needPayDate ? 1 : 0 }}"></div>
        <div class="form-ent" data-ent_nfrmno="{{ $ENT_FORM->NFRMNO }}" data-ent_vorgno="{{ $ENT_FORM->VORGNO }}" data-ent_cyear="{{ $ENT_FORM->CYEAR }}" data-ent_cyear2="{{ $ENT_FORM->CYEAR2 }}" data-ent_nrunno="{{ $ENT_FORM->NRUNNO }}" data-ent_empno="{{ $ENT_FORM->EMP_INPUT }}"></div>

        <div class="w-full min-h-screen bg-gray-100 px-2 pb-10">
            <div class="max-w-5xl mx-auto bg-white rounded-2xl shadow p-10 border-2 border-gray-300">

                <!-- Main Header -->
                <div class="mb-6 pb-4 border-b-2 border-blue-500">
                    <div class="flex flex-col md:flex-row md:justify-between items-start gap-3">
                        <div>
                            <h1 class="text-3xl font-bold text-blue-900 tracking-wide flex items-center gap-2">
                                Clearance for Expense Report
                            </h1>
                            <div class="text-gray-500 text-base mt-1">แบบเคลียร์ค่าใช้จ่ายในการรับรองผู้มาติดต่อ (ส่วนที่2)</div>
                            <div class="mt-2">
                                <span class="text-2xl font-bold text-red-300">[{{ $clearance_formno }}]</span>
                            </div>
                            @if(empty($formCler->FORM_ENT))
                                <div class="text-red-500 font-semibold mt-2 bg-red-50 p-2 rounded">
                                    Not has Advance Entertainment Form<br>
                                    (กรณีที่ไม่ได้มีการขออนุมัติล่วงหน้า)
                                </div>
                            @endif
                        </div>
                        <div class="text-gray-500 text-sm mt-2 md:mt-0">
                            <span>Report Date: {{ date('d-m-Y') }}</span>
                        </div>
                    </div>
                </div>

                <!-- Process Flow -->
                {{-- <div class="process-flow no-print">
                    <div class="process-step">
                        <div class="step-number step-1">1</div>
                        <span class="text-sm">Entertainment Request</span>
                    </div>
                    <svg class="process-arrow w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                    <div class="process-step">
                        <div class="step-number step-2">2</div>
                        <span class="text-sm font-bold">Expense Clearance</span>
                    </div>
                </div> --}}

                <!-- Tab Navigation -->
                <div class="tab-nav no-print">
                    <button class="tab-button tab-clearance active" onclick="showTab('clearance', this)">
                        <div class="text-xs text-gray-500 mb-1">CURRENT FORM</div>
                        <div class="font-semibold">Clearance Details</div>
                    </button>
                    <button class="tab-button tab-entertainment bg-yellow-50 border-yellow-300 hover:bg-yellow-100 hover:border-yellow-400 cursor-pointer" onclick="showTab('entertainment', this)" title="Click to view Entertainment Form details">
                        <div class="text-xs text-gray-500 mb-1">
                            REFERENCE FOR REQUESITION FOR ENTERTAINMENT:
                            <span class="text-orange-600 animate-bounce font-medium">👆 Click Here!!</span>
                        </div>
                        <div class="font-semibold hover:text-orange-600">
                            Entertainment Form
                            @if(!empty($formCler->FORM_ENT))
                                ({{ $formCler->FORM_ENT }})
                            @elseif(empty($formCler->FORM_ENT))
                                <span class="text-sm text-red-500">(Not has Advance Entertainment Form)</span>
                            @endif
                        </div>
                        <div class="text-xs text-orange-500 mt-1">🔍 Click here for details</div>
                    </button>
                </div>

                <!-- Tab Contents Container -->
                <div class="border-2 border-gray-200 rounded-b-xl p-6">
                    <!-- Clearance Tab Content (DEFAULT ACTIVE) -->
                    <div id="clearance-tab" class="tab-content active">

                        <!-- Clearance Information -->
                        <h2 class="text-xl font-bold text-green-700 mb-4">Clearance Information</h2>
                        <div class="overflow-hidden rounded-xl border-2 border-green-200 mb-8 bg-green-50">
                            <table class="w-full text-sm">
                                <tbody>
                                    <tr>
                                        <th class="w-1/4 text-left font-semibold py-2 pl-4 border-b-2 border-green-200 bg-green-100">Clearance Form No.</th>
                                        <td class="py-2 pl-4 border-b-2 border-green-200">
                                            <span class="status-badge badge-current">{{ $clearance_formno }}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th class="w-1/4 text-left font-semibold py-2 pl-4 border-b-2 border-green-200 bg-green-100">President</th>
                                        <td class="py-2 pl-4 border-b-2 border-green-200">{{ $formCler->PRESIDENT_JOIN == '1' ? '✅ Join' : '❌ Not Join' }}</td>
                                    </tr>
                                    <tr>
                                        <th class="text-left font-semibold py-2 pl-4 border-b-2 border-green-200 bg-green-100">Cash Advance</th>
                                        <td class="py-2 pl-4 border-b-2 text-orange-700 font-semibold border-green-200">{{ $ENT_FORM->REIMBURSEMENT == '1' ? '✅ Yes' : '❌ No' }}</td>
                                    </tr>
                                    <tr>
                                        <th class="text-left font-semibold py-2 pl-4 border-b-2 border-green-200 bg-green-100">Actual Cost</th>
                                        <td class="py-2 pl-4 border-b-2 border-green-200 font-bold text-green-600">฿ {{ number_format($formCler->ACTUAL_COST, 2) }}</td>
                                    </tr>
                                    {{-- <tr>
                                        <th class="text-left font-semibold py-2 pl-4 border-b-2 border-green-200 bg-green-100">Pay Date</th>
                                        <td class="py-2 pl-4 border-b-2 border-green-200 font-bold">{{ $ENT_FORM->PAYDATE }}</td>
                                    </tr> --}}
                                    @if(!empty($formCler->REASON))
                                        <tr>
                                            <th class="text-left font-semibold py-2 pl-4 border-b-2 border-green-200 bg-green-100">Reason</th>
                                            <td class="py-2 pl-4 border-b-2 border-green-200">{{ $formCler->REASON }}</td>
                                        </tr>
                                    @endif
                                    <tr>
                                        <th class="text-left font-semibold py-2 pl-4 border-b-2 border-green-200 bg-green-100">Attach Receipt</th>
                                        <td class="py-2 pl-4 border-b-2 border-green-200">
                                            <a href="{{ base_url('gpform/GP-CLER/main/preview/') . rawurlencode($formCler->RECEIPT_FILE) }}" class="link btn btn-sm text-blue-600 hover:text-blue-800 font-medium" target="_blank">
                                                Open Receipt Attachment
                                            </a>
                                        </td>
                                    </tr>
                                    @if(!empty($file_attach))
                                        <tr>
                                            <th class="text-left font-semibold py-2 pl-4 border-b-2 border-green-200 bg-orange-100">Attach File</th>
                                            <td class="py-2 pl-4 border-b-2 border-green-200 bg-orange-50">
                                                @foreach($file_attach as $file)
                                                    <a href="{{ base_url('gpform/GP-CLER/main/preview/') . rawurlencode($file->FILE_NAME) }}" class="link btn btn-sm text-blue-600 hover:text-blue-800 font-medium mt-1" target="_blank">
                                                        {{ $file->FILE_NAME }}
                                                    </a><br>
                                                @endforeach
                                            </td>
                                        </tr>
                                    @endif
                                    @if(!empty($formCler->MEMO_FILE))
                                        <tr>
                                            <th class="text-left font-semibold py-2 pl-4 border-b-2 border-green-200 bg-orange-100">Attach Memo</th>
                                            <td class="py-2 pl-4 border-b-2 border-green-200 bg-orange-50">
                                                <a href="{{ base_url('gpform/GP-CLER/main/preview/') . rawurlencode($formCler->MEMO_FILE) }}" class="link btn btn-sm text-blue-600 hover:text-blue-800 font-medium" target="_blank">
                                                    Open Memo Attachment
                                                </a>
                                            </td>
                                        </tr>
                                    @endif
                                    <tr class="bg-green-50">
                                        <th class="text-left font-semibold py-2 pl-4 border-green-200 bg-green-100">Remark</th>
                                        <td class="py-2 pl-4 border-green-200">{{ $formCler->REMARK ?? '-' }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {{-- <div class="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                            <h3 class="font-semibold text-green-800">📌 Current Clearance Information</h3>
                            <p class="text-sm text-green-700 mt-1">นี่คือข้อมูลการเคลียร์ค่าใช้จ่ายที่เกิดขึ้นจริง</p>
                        </div> --}}

                        <!-- Summary Box -->

                        <h3 class="text-xl font-bold text-green-700 mb-4">Financial Summary</h3>
                        <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-1 border-2 border-green-200">
                            <div class="grid grid-cols-3 gap-4 text-center">
                                {{-- <div>
                                    <div class="text-sm text-gray-600">Approved Budget</div>
                                    <div class="text-2xl font-bold text-gray-700">{{ number_format($sum ?? 0) }}</div>
                                </div> --}}
                                <div>
                                    <div class="text-sm text-gray-600">Estimate Cost</div>
                                    <div class="text-2xl font-bold text-blue-600">{{ number_format($ENT_FORM->TOTAL_AMOUNT, 2) }}</div>
                                </div>
                                <div>
                                    <div class="text-sm text-gray-600">Actual Cost</div>
                                    <div class="text-2xl font-bold text-green-600">{{ number_format($formCler->ACTUAL_COST, 2) }}</div>
                                </div>
                                @if($ENT_FORM->REIMBURSEMENT == '1')
                                    <div>
                                        <div class="text-sm text-gray-600">{{$formCler->REMAIN_BUDGET < 0 ? "Over Cost" : "Remain Cost"}}</div>
                                        @if(!empty($formCler->REMAIN_BUDGET))
                                            <div class="text-2xl font-bold {{ $formCler->REMAIN_BUDGET >= 0 ? 'text-blue-600' : 'text-red-600' }}">
                                                {{ number_format($formCler->REMAIN_BUDGET, 2) }}
                                            </div>

                                        @endif
                                    </div>
                                @endif
                            </div>
                        </div>

                        <h3 class="text-xl font-bold text-green-700 mb-2">Remark : </h3>
                        <div class="border-green-200 rounded-xl bg-green-50 p-2 mb-6 border-2">
                            <div class="text-xs pl-2 {{ $formCler->REMAIN_BUDGET > 0 ? 'text-blue-600' : 'text-red-600' }}">
                                @if($formCler->REMAIN_BUDGET != 0)
                                    @if($ENT_FORM->REIMBURSEMENT == '1')
                                        {{ $formCler->REMAIN_BUDGET > 0 ? "The Actual cost not over Estimate cost : Employee return remain cash to Company." : "The Actual cost over Estimate cost : Company reimbursement to Employee.(" . $ENT_FORM->EMP_REQ . " " . $form[0]->VREQNAME . ")" }}
                                    @else
                                        {{ $formCler->REMAIN_BUDGET > 0 ? "The actual cost did not exceed the estimated cost. As no advance payment was requested, the employee will be reimbursed by the company." : "The Actual cost over Estimate cost : Company reimbursement to Employee.(" . $ENT_FORM->EMP_REQ . " " . $form[0]->VREQNAME . ")" }}
                                    @endif
                                @endif
                            </div>
                        </div>

                        <!-- Expense Details -->
                        <h2 class="text-xl font-bold text-green-700 mb-4">Expense Cost Detail</h2>
                        <div class="overflow-hidden rounded-xl border-2 border-green-200 bg-green-50 mb-6">
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
                                            <td class="py-2 px-4 border-b border-green-100">{{ number_format($ex->COST, 2) }}</td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>



                        @if($form[0]->CST == '2')
                            <div class="flex justify-center mt-8 no-print">
                                <button onclick="window.print()" class="btn bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-2 rounded-lg shadow">
                                    🖨️ Print Report
                                </button>
                            </div>
                        @endif

                        @if(!empty($formCler->PAYDATE))
                            <div class="flex justify-center mt-6">
                                <div class="w-full max-w-md  rounded-xl shadow-lg p-5 border border-base-300">
                                    <label class="block mb-3">
                                        <span class="block text-sm font-semibold text-base-content mb-1">Pay Date</span>
                                        <div class="relative">
                                            <input type="text" name="pay_date" class="input input-bordered w-full pl-10 bg-gray-50 text-gray-800 font-medium" placeholder="Select Pay Date" value="{{ $formCler->PAYDATE }}" readonly />
                                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    </label>
                                    <p class="text-sm text-base-content/70 mt-1">
                                        Reimbursement to Employee
                                        <span class="font-semibold text-base-content">{{ $form[0]->VREQNAME }}</span>
                                        ({{ $ENT_FORM->EMP_REQ }})
                                    </p>
                                </div>
                            </div>
                        @endif


                        <!-- Approval Section -->
                        @if ($mode == '02')


                            @if ($flowstep[0]->CSTEPNO == '87' && $flowstep[0]->CSTEPNEXTNO == '00')
                                @if($ENT_FORM->REIMBURSEMENT == '1' && $formCler->REMAIN_BUDGET < 0 || $ENT_FORM->REIMBURSEMENT == '0')
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
                                            <p class="text-sm text-base-content/70 mt-1">
                                                Reimbursement to Employee<br>
                                                <span class="font-semibold text-base-content">{{ $form[0]->VREQNAME }}</span>
                                                ({{ $ENT_FORM->EMP_REQ }})
                                            </p>
                                        </div>
                                    </div>
                                @endif
                            @endif

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

                        <div class="flow mt-6" style="overflow: hidden"></div>
                    </div>

                    <!-- Entertainment Tab Content -->
                    <div id="entertainment-tab" class="tab-content">
                        {{-- <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                            <h3 class="font-semibold text-blue-800">📋 Reference: Original Entertainment Request</h3>
                            <p class="text-sm text-blue-700 mt-1">ข้อมูลอ้างอิงจากแบบฟอร์มขออนุมัติการเลี้ยงรับรองที่ได้รับการอนุมัติแล้ว</p>
                        </div> --}}

                        {{-- @if(!empty($formCler->FORM_ENT))
                        <div class="mb-6 text-center">


                        </div>
                        @endif --}}

                        <!-- Entertainment Information -->
                        <div class="text-lg font-bold text-blue-800 mb-3">Entertainment Information</div>
                        <div class="overflow-hidden rounded-xl border-2 border-blue-200 mb-8 bg-blue-50">
                            <table class="w-full text-sm">
                                <tbody>
                                    @if(!empty($formCler->FORM_ENT))
                                        <tr>
                                            <th class="w-1/4 text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Form No.</th>
                                            <td class="py-2 pl-4 border-b-2 border-blue-200">
                                                <span class="status-badge badge-reference">{{ $formCler->FORM_ENT }}</span>
                                            </td>
                                        </tr>
                                    @endif
                                    <tr>
                                        <th class="w-1/4 text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Input by</th>
                                        <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $form[0]->VINPUTNAME }}</td>
                                    </tr>
                                    <tr class="bg-blue-50">
                                        <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Requested by</th>
                                        <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $form[0]->VREQNAME }}</td>
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
                                        <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Type of Entertainment</th>
                                        <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $ENT_FORM->TYPE_TIME }}</td>
                                    </tr>
                                    @if ($ENT_FORM->FILE_MEMO_GIFT)
                                        <tr>
                                            <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">File Memo Gift</th>
                                            <td class="py-2 pl-4 border-b-2 border-blue-200">
                                                <a href="{{ base_url('gpform/GP-ENT/main/preview/' . $ENT_FORM->FILE_MEMO_GIFT) }}" target="_blank" class="text-blue-700 underline btn btn-sm rounded-lg">
                                                    {{ $ENT_FORM->FILE_MEMO_GIFT }}
                                                </a>
                                            </td>
                                        </tr>
                                    @endif
                                    @if($ENT_FORM->FILE_MEMO_OTHER)
                                        <tr>
                                            <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">File Memo Other</th>
                                            <td class="py-2 pl-4 border-b-2 border-blue-200">
                                                <a href="{{ base_url('gpform/GP-ENT/main/preview/' . $ENT_FORM->FILE_MEMO_OTHER) }}" target="_blank" class="text-blue-700 underline btn btn-sm rounded-lg">
                                                    {{ $ENT_FORM->FILE_MEMO_OTHER }}
                                                </a>
                                            </td>
                                        </tr>
                                    @endif
                                    @if($ENT_FORM->OTHER_DETAILS)
                                        <tr>
                                            <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Other Details</th>
                                            <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $ENT_FORM->OTHER_DETAILS }}</td>
                                        </tr>
                                    @endif
                                    <tr class="bg-blue-50">
                                        <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Location</th>
                                        <td class="py-2 pl-4 border-b-2 border-blue-200">{{ $ENT_FORM->LOCATION_TYPE ?? '-' }}</td>
                                    </tr>
                                    {{-- <tr>
                                        <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-b-2 border-blue-200 bg-blue-100">Entertainment Budget</th>
                                        <td class="py-2 pl-4 border-b-2 border-blue-200 font-bold text-blue-600">฿ {{ number_format($ENT_FORM->ENTERTAINMENT_BUDGET ?? 0) }}</td>
                                    </tr> --}}
                                    <tr class="bg-blue-50">
                                        <th class="text-left text-blue-900 font-semibold py-2 pl-4 border-blue-200 bg-blue-100">Guest Type</th>
                                        <td class="py-2 pl-4 border-blue-200">{{ $ENT_FORM->TYPE_NAME ?? '-' }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <!-- Guest Details -->
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
                                                        <a href="{{ base_url('gpform/GP-ENT/main/preview/' . rawurlencode($guest->ATTACH_FILE)) }}" target="_blank" class="text-blue-700 underline">
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

                        <!-- Participants -->
                        <div class="mb-8 w-full">
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
                                    <div class="font-semibold text-blue-700 mb-1">Guest: {{ count($guest) }} person</div>
                                    <ul class="list-disc list-inside text-gray-700 ml-4">
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
                            <div class="overflow-hidden mt-1 rounded-xl border-2 p-3 border-gray-300 bg-gray-50 shadow-sm flex items-center">
                                <span class="text-blue-900 font-semibold mr-3">Remark :</span>
                                <span>{{ $ENT_FORM->REMARK ?? "-" }}</span>
                            </div>
                        </div>

                        <!-- Estimate Cost -->
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

                            <div class="mt-5 grid gap-4 grid-cols-1 {{ !empty($ENT_FORM->FILE_MEMO) ? 'md:grid-cols-2' : '' }}">
                                <!-- Memo File -->
                                @if(!empty($ENT_FORM->FILE_MEMO))
                                    <div class="flex items-center gap-4 bg-blue-50 rounded-xl border border-blue-200 shadow p-4">
                                        <span class="font-semibold text-blue-900 mb-1">Memo File :</span>
                                        <a href="{{ base_url('gpform/GP-ENT/main/preview/' . rawurlencode($ENT_FORM->FILE_MEMO)) }}" class="btn btn-sm text-blue-600 underline text-sm truncate" target="_blank">{{ $ENT_FORM->FILE_MEMO }}</a>
                                    </div>
                                @endif

                                <!-- Cash Advance -->
                                <div class="flex items-center gap-4 bg-blue-50 rounded-xl border border-blue-200 shadow p-4">
                                    <span class="font-semibold text-blue-900 mb-1">Cash Advance :</span>
                                    <span class="inline-flex items-center px-4 py-1.5 rounded-full font-semibold w-fit {{ ($ENT_FORM->REIMBURSEMENT ?? '0') == '1' ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-gray-100 border border-gray-400 text-gray-700' }}">
                                        {{ ($ENT_FORM->REIMBURSEMENT ?? '0') == '1' ? 'Yes' : 'No' }}
                                    </span>
                                </div>
                            </div>
                        @endif
                        <div class="flow_ent mt-8">

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/clearanceView.js?ver={{ $GLOBALS['version'] }}"></script>

    <script>
        // Tab switching function
        function showTab(tabName, button) {
            // Hide all tabs
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });

            // Remove active class from all buttons
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });

            // Show selected tab
            document.getElementById(tabName + '-tab').classList.add('active');

            // Add active class to clicked button
            button.classList.add('active');

            // Update active class based on tab type
            if (tabName === 'clearance') {
                button.classList.add('tab-clearance');
            } else {
                button.classList.remove('tab-clearance');
            }
        }

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