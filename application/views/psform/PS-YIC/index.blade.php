@extends('layouts/webflowTemplate')
@section('contents')
    <div class="max-w-5xl w-full mx-auto bg-white shadow-xl ring-1 ring-gray-200 rounded-lg p-8">

        <!-- Title -->
        <h1 class="text-center font-bold underline text-blue-800 mb-6">
            THE RESULT OF INVENTORY YEARLY CHECKING FY<span class="period"></span> &nbsp;&nbsp;(BULK PART &amp; STOCK PART)
        </h1>

        <hr>

        <!-- Condition Information -->
        <div class="mb-6 mt-4">
            <h2 class="font-bold underline text-blue-800 mb-2">CONDITION INFORMATION:</h2>
            <ul class="space-y-1 text-sm pl-4">
                <li>- &nbsp;Cut Off Data Date: &nbsp;<span class="font-bold cutoff-date underline"></span></li>
                <li>- &nbsp;WHI Check Date: &nbsp;<span class="font-bold whi-date underline"></span></li>
                <li>- &nbsp;RAF Div. Random Check Date: &nbsp;<span class="font-bold fin-date underline"></span></li>
                <li>- &nbsp;Checking area : &nbsp;<span class="font-bold underline">All AMEC Warehouse area</span></li>
            </ul>
        </div>

        <!-- Result -->
        <div class="mb-6">
            <h2 class="font-bold underline text-blue-800 mb-3">RESULT:</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <!-- Bulk Part Table -->
                <div class="overflow-x-auto rounded-md border border-gray-300 shadow-sm">
                    <table class="report-table w-full text-sm border-collapse">
                        <thead>
                            <tr class="bg-blue-800 text-white">
                                <th colspan="3" class="py-2 text-center tracking-wide">Inventory Yearly Checking &nbsp;<span class="period"></span> (Bulk Part )</th>
                            </tr>
                            <tr class="bg-blue-50 border-b border-gray-300">
                                <th class="py-1.5 px-2 text-left text-blue-900">Description</th>
                                <th class="py-1.5 px-2 text-center text-blue-900">Items</th>
                                <th class="py-1.5 px-2 text-right text-blue-900">Amount (Baht)</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            <tr class="bg-white">
                                <td class="py-1.5 px-2 font-medium">Total Item</td>
                                <td class="py-1.5 px-2 text-center total-bulk-items"></td>
                                <td class="py-1.5 px-2 text-right total-bulk-amount"></td>
                            </tr>
                            <tr class="bg-gray-50">
                                <td class="py-1.5 px-2 font-medium">Checking by WHI Sec.</td>
                                <td class="py-1.5 px-2 text-center whi-bulk-items"></td>
                                <td class="py-1.5 px-2 text-right whi-bulk-amount"></td>
                            </tr>
                            <tr class="bg-amber-100">
                                <td class="py-1.5 px-2 font-medium">Sampling Checking by FIN Div.</td>
                                <td class="py-1.5 px-2 text-center fin-bulk-items"></td>
                                <td class="py-1.5 px-2 text-right fin-bulk-amount"></td>
                            </tr>
                            <tr class="bg-red-50">
                                <td class="py-1.5 px-2 font-semibold text-red-700">Variance Item</td>
                                <td class="py-1.5 px-2 text-center font-semibold text-red-700 diff-bulk-items"></td>
                                <td class="py-1.5 px-2 text-right font-semibold text-red-700 diff-bulk-amount"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Stock Part Table -->
                <div class="overflow-x-auto rounded-md border border-gray-300 shadow-sm">
                    <table class="report-table w-full text-sm border-collapse">
                        <thead>
                            <tr class="bg-blue-800 text-white">
                                <th colspan="3" class="py-2 text-center tracking-wide">Inventory Yearly Checking &nbsp;<span class="period"></span> (Stock Part)</th>
                            </tr>
                            <tr class="bg-blue-50 border-b border-gray-300">
                                <th class="py-1.5 px-2 text-left text-blue-900">Description</th>
                                <th class="py-1.5 px-2 text-center text-blue-900">Items</th>
                                <th class="py-1.5 px-2 text-right text-blue-900">Amount (Baht)</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            <tr class="bg-white">
                                <td class="py-1.5 px-2 font-medium">Total Item</td>
                                <td class="py-1.5 px-2 text-center total-stock-items"></td>
                                <td class="py-1.5 px-2 text-right total-stock-amount"></td>
                            </tr>
                            <tr class="bg-gray-50">
                                <td class="py-1.5 px-2 font-medium">Checking by WHI Sec.</td>
                                <td class="py-1.5 px-2 text-center whi-stock-items"></td>
                                <td class="py-1.5 px-2 text-right whi-stock-amount"></td>
                            </tr>
                            <tr class="bg-amber-100">
                                <td class="py-1.5 px-2 font-medium">Sampling Checking by FIN Div.</td>
                                <td class="py-1.5 px-2 text-center fin-stock-items"></td>
                                <td class="py-1.5 px-2 text-right fin-stock-amount"></td>
                            </tr>
                            <tr class="bg-red-50">
                                <td class="py-1.5 px-2 font-semibold text-red-700">Variance Item</td>
                                <td class="py-1.5 px-2 text-center font-semibold text-red-700 diff-stock-items"></td>
                                <td class="py-1.5 px-2 text-right font-semibold text-red-700 diff-stock-amount"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Ref Links to Report 2 / Report 3 -->
        <div class="flex justify-end gap-3 mb-6">
            <a href="{{ base_url('/psform/PS-YIC/main/detail?no=' . $NFRMNO . '&orgNo=' . $VORGNO . '&y=' . $CYEAR . '&y2=' . $CYEAR2 . '&runNo=' . $NRUNNO . '&empno=' . $EMPNO) }}"
                class="btn btn-sm btn-outline btn-primary" target="_blank">
                View Report : Variance Detail &raquo;
            </a>
            {{-- <a href=""
                class="btn btn-sm btn-outline btn-primary" target="_blank">
                View Report 3: FIN Div. Sampling Detail &raquo;
            </a> --}}
        </div>

        <div class="mb-6">
            <h2 class="font-bold underline text-blue-800 mb-3">VARIANCE ERROR CALCULATION:</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <!-- Bulk Part Table -->
                <div class="overflow-x-auto rounded-md border border-gray-300 shadow-sm">
                    <table class="report-table w-full text-sm border-collapse">
                        <thead>
                            <tr class="bg-blue-800 text-white">
                                <th colspan="3" class="py-2 text-center tracking-wide">Inventory Yearly Checking &nbsp;<span class="period"></span> (Bulk Part )</th>
                            </tr>
                            <tr class="bg-blue-50 border-b border-gray-300">
                                <th class="py-1.5 px-2 text-left text-blue-900">Description</th>
                                <th class="py-1.5 px-2 text-center text-blue-900">Items</th>
                                <th class="py-1.5 px-2 text-right text-blue-900">Amount (Baht)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="py-1.5 px-2 font-medium">Error calculation (items)</td>
                                <td class="py-1.5 px-2 text-center variance-bulk-items"></td>
                                <td class="py-1.5 px-2 text-right variance-bulk-amount"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Stock Part Table -->
                <div class="overflow-x-auto rounded-md border border-gray-300 shadow-sm">
                    <table class="report-table w-full text-sm border-collapse">
                        <thead>
                            <tr class="bg-blue-800 text-white">
                                <th colspan="3" class="py-2 text-center tracking-wide">Inventory Yearly Checking &nbsp;<span class="period"></span> (Stock Part)</th>
                            </tr>
                            <tr class="bg-blue-50 border-b border-gray-300">
                                <th class="py-1.5 px-2 text-left text-blue-900">Description</th>
                                <th class="py-1.5 px-2 text-center text-blue-900">Items</th>
                                <th class="py-1.5 px-2 text-right text-blue-900">Amount (Baht)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="py-1.5 px-2 font-medium">Error calculation (items)</td>
                                <td class="py-1.5 px-2 text-center variance-stock-items"></td>
                                <td class="py-1.5 px-2 text-right variance-stock-amount"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Variance Error File Input -->
            <div class="mt-4 variance-error-upload-section">
                <label class="label">
                    <span class="label-text font-medium">Upload Variance Error File</span>
                </label>

                <input type="file" id="varianceErrorFileInput" class="file-input file-input-sm file-input-bordered w-full hidden" />

                <div class="alert variance-error-alert hidden">
                    <div class="flex-1">
                        <div class="font-semibold">
                            Please see details in the uploaded file.
                        </div>
                        {{-- <a href="{{ $varianceErrorFileUrl ?? '' }}" target="_blank" class="link link-primary font-medium badge badge-accent p-2 mt-2 variance-error-file-link">
                            📄 {{ $varianceErrorFileName ?? 'Variance_Error_20260721.xlsx' }}
                        </a> --}}
                        <div class="flex flex-wrap gap-2 mt-2 variance-error-file-list">
                            <!-- ไฟล์แต่ละอันจะถูก inject เข้ามาตรงนี้ -->
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <!-- Comment -->
        <div class="comment bg-gray-50 border border-gray-200 rounded-md p-4 text-sm">

        </div>

        <!-- Uploaded Files List -->
        <div class="mt-8">
            <h3 class="font-bold text-blue-800 mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zm0 4a1 1 0 000 2h9a1 1 0 100-2H3zm0 4a1 1 0 100 2h9a1 1 0 100-2H3zm14-2a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L17 14.586V9z" clip-rule="evenodd" />
                </svg>
                Uploaded Files
            </h3>
            <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table class="w-full text-sm border-collapse">
                    <thead>
                        <tr class="bg-blue-800 text-white">
                            <th class="py-2.5 px-4 text-left">File Name</th>
                            <th class="py-2.5 px-4 text-center">Upload Date</th>
                            <th class="py-2.5 px-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200" id="uploaded-files-list">
                        <tr class="bg-white hover:bg-gray-50 transition-colors">
                            <td colspan="3" class="py-4 px-4 text-center text-gray-400 italic">No files uploaded</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Approve/Reject Actions -->
        <div class="mt-6 aprv-section hidden">
            <div class="max-w-xl mx-auto">
                <div class="space-y-2">
                    <div>
                        <label class="label">
                            <span class="label-text font-medium">Attachment</span>
                        </label>
                        <input type="file" class="file-input file-input-sm file-input-bordered w-full attach-file" />
                    </div>
                    <div>
                        <label class="label">
                            <span class="label-text font-medium">Remark</span>
                        </label>
                        <textarea class="textarea textarea-sm textarea-bordered w-full min-h-30" id="remark" placeholder="Enter your remark here..."></textarea>
                    </div>
                    <div class="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                        <button class="btn btn-success min-w-35 btn-approve" data-action="approve"> Approve</button>
                        <button class="btn btn-error min-w-35 btn-approve" data-action="reject"> Reject</button>
                    </div>
                </div>
            </div>
        </div>

    </div>



    <div class="flow mt-5">

    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/psYic.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
