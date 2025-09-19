@extends('layouts/webflowTemplate')
@section('contents')
    <div class="w-full mx-auto px-5 py-10 text-gray-800">
        {{-- ===== Header ===== --}}
        <div class="rounded-2xl overflow-hidden shadow-sm border border-base-300 mb-8">
            <div class="bg-sky-600 text-white p-6">
                <h1 class="text-2xl md:text-3xl font-bold tracking-tight">
                    Regular Review <span class="mx-2 text-xs md:text-sm font-normal bg-white/15 px-2 py-1 rounded">({{ $program }}) </span> [{{ $formNumber }}]
                </h1>

            </div>
        </div>

        <div class="form-data" data-nfrmno="{{ $NFRMNO }}" data-vorgno="{{ $VORGNO }}" data-cyear="{{ $CYEAR }}" data-cyear2="{{ $CYEAR2 }}" data-nrunno="{{ $NRUNNO }}" data-empno="{{ $EMPNO }}"></div>

        <div class="my-6">
            {{-- ===== Result Summary ===== --}}
            <div class="card bg-base-100 border border-base-300 shadow-xl mb-6 w-fit">
                <div class="card-body p-4">
                    <h2 class="card-title text-lg mb-3">Result Summary</h2>
                    <table class="table table-sm w-80 mb-5">
                        <thead>
                            <tr class="text-center bg-base-200">
                                <th class="border border-gray-500">TOPIC</th>
                                <th class="border border-gray-500">AMOUNT</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="border border-gray-500">AllUser</td>
                                <td class="border border-gray-500 text-center">{{ sizeof($user) }}</td>
                            </tr>
                            <tr>
                                <td class="border border-gray-500">Unmatch</td>
                                <td class="border border-gray-500 text-center">
                                    @php
                                        $countUnmath = count(array_filter($user, function ($item) {
                                            return isset($item->RESULT) && $item->RESULST == 0;
                                        }));
                                    @endphp
                                    {{ $countUnmath }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {{-- ===== Data Table ===== --}}
            <div class="card bg-base-100 border border-base-300 shadow-xl">
                <div class="card-body p-4 md:p-6">
                    <div class="text-center font-semibold mb-4">
                        <span class="text-red-600">VIW = VIEW</span>
                        <span class="mx-2">|</span>
                        <span class="text-green-600">AED = ADD | EDIT | DELETE</span>
                        <span class="mx-2">|</span>
                        <span class="text-gray-600">NOT = No Authorize</span>
                    </div>

                    <div class="overflow-x-auto rounded-xl border border-base-300">
                        <table class="table table-sm border-collapse border" id="checktable">
                            <thead>
                                <tr class="text-center bg-base-200">
                                    <th class="border border-gray-300">Division</th>
                                    <th class="border border-gray-300">Department</th>
                                    <th class="border border-gray-300">Section</th>
                                    <th class="border border-gray-300">User ID</th>
                                    <th class="border border-gray-300">Name</th>
                                    <th class="border border-gray-300">Add Date</th>
                                    <th class="border border-gray-300">Update Date</th>
                                    <th class="border border-gray-300">Data Manager</th>
                                    <th class="border border-gray-300">Vendor</th>
                                    <th class="border border-gray-300">Product</th>
                                    <th class="border border-gray-300">P/R</th>
                                    <th class="border border-gray-300">User</th>
                                    <th class="border border-gray-300">P/O</th>
                                    <th class="border border-gray-300">Report</th>
                                    <th class="border border-gray-300">Invoice</th>
                                    <th class="border border-gray-300">Group</th>
                                    <th class="border border-gray-300">Match</th>
                                    <th class="border border-gray-300">Unmatch</th>
                                    <th class="border border-gray-300">Remark</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach ($user as $key => $item)
                                    <tr class="text-center hover:bg-gray-200!">
                                        <td class="border border-gray-300">{{ $item->SDIV }}</td>
                                        <td class="border border-gray-300">{{ $item->SDEPT }}</td>
                                        <td class="border border-gray-300">{{ $item->SSEC }}</td>
                                        <td class="border border-gray-300">{{ $item->SEMPNO }}</td>
                                        <td class="border border-gray-300 text-left">{{ $item->SNAME }}</td>
                                        <td class="border border-gray-300">
                                            {{ \Carbon\Carbon::parse($item->CREUSRDATE)->format('d/m/Y') }}
                                        </td></td>
                                        <td class="border border-gray-300">{{ $item->UPDUSRDATE }}</td>
                                        <td class="border border-gray-300">{{ $item->DATAMANAGER }}</td>
                                        <td class="border border-gray-300">{{ $item->VENDORMANAGEMENT }}</td>
                                        <td class="border border-gray-300">{{ $item->PRODUCT }}</td>
                                        <td class="border border-gray-300">{{ $item->PR }}</td>
                                        <td class="border border-gray-300">{{ $item->USERMANAGER }}</td>
                                        <td class="border border-gray-300">{{ $item->PO }}</td>
                                        <td class="border border-gray-300">{{ $item->REPORT }}</td>
                                        <td class="border border-gray-300">{{ $item->INVOICE }}</td>
                                        <td class="border border-gray-300">{{ $item->GROUPMASTER }}</td>
                                        <td class="border border-gray-300">
                                            @if (is_null($item->RESULT))
                                                <input type="radio" id="correct-{{ $item->SEMPNO }}" checked name="result[{{ $item->SEMPNO }}{{ $key }}]" class="radio result-radio radio-success" value="1">
                                            @else
                                                {!! $item->RESULT == '1' ? '&#x2714;' : '' !!}
                                            @endif
                                        </td>
                                        <td class="border border-gray-300">
                                            @if (is_null($item->RESULT))
                                                <input type="radio" id="incorrect-{{ $item->SEMPNO }}" name="result[{{ $item->SEMPNO }}{{ $key }}]" class="radio result-radio radio-error" value="0">
                                            @else
                                                {!! $item->RESULT == '0' ? '&#x2714;' : '' !!}
                                            @endif
                                        </td>
                                        <td class="border border-gray-300">
                                            @if (is_null($item->RESULT))
                                                <input type="text" id="remark-{{ $item->SEMPNO }}" class="input input-bordered rounded-lg remark-input" name="remark[{{ $item->SEMPNO }}]">
                                            @else
                                                {{ $item->DETAIL }}
                                            @endif
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        {{-- ===== Actions ===== --}}
        @if ($mode == '02')
            <div class="flex justify-center mt-6 space-x-4">
                @if($form->STATUS == '1')
                    <button class="bg-green-600 text-white px-6 py-2 btn rounded-lg shadow hover:bg-green-700 transition btn-submit" data-action="approve" id="btn-confirm">
                        Approve
                    </button>
                @else
                    <button class="bg-green-600 text-white px-6 py-2 btn rounded-lg shadow hover:bg-green-700 transition btn-approve" data-action="approve" id="btn-confirm">
                        Approve
                    </button>
                @endif
                <button class="bg-red-600 text-white px-6 py-2 btn rounded-lg shadow hover:bg-red-700 transition btn-approve" data-action="reject">
                    Reject
                </button>
            </div>
        @endif

        <div class="flow mt-8"></div>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/RgvView.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection