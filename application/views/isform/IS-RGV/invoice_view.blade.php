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
                                            return isset($item->RESULT) && $item->RESULT == 0;
                                        }));
                                    @endphp
                                    {{ $countUnmath }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {{-- ===== User Access Table ===== --}}
            <div class="card bg-base-100 border border-base-300 shadow-xl">
                <div class="card-body p-4 md:p-6">
                    <div class="overflow-x-auto rounded-xl border border-base-300">
                        <table class="table table-sm table-zebra border-collapse border" id="checktable">
                            <thead>
                                <tr class="text-center bg-base-200">
                                    <th class="border border-gray-300">Group</th>
                                    <th class="border border-gray-300">User</th>
                                    <th class="border border-gray-300">Name</th>
                                    <th class="border border-gray-300">Invoice Management</th>
                                    <th class="border border-gray-300">Display(Export)</th>
                                    <th class="border border-gray-300">Display(Domestic)</th>
                                    <th class="border border-gray-300">User Controller</th>
                                    <th class="border border-gray-300">Status</th>
                                    <th class="border border-gray-300">Add Date</th>
                                    <th class="border border-gray-300">Update Date</th>
                                    <th class="border border-gray-300">Match</th>
                                    <th class="border border-gray-300">Unmatch</th>
                                    <th class="border border-gray-300">Remark</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach ($user as $key => $item)
                                    <tr class="text-center hover:bg-base-100">
                                        <td class="border border-gray-300">{{ $item->sect_id }}</td>
                                        <td class="border border-gray-300">{{ $item->user_id }}</td>
                                        <td class="border border-gray-300">{{ $item->user_name }}</td>
                                        <td class="border border-gray-300">{!! $item->InvManagement == '-1' ? '&check;' : '' !!}</td>
                                        <td class="border border-gray-300">{!! $item->DisplayInvoice == '-1' ? '&check;' : '' !!}</td>
                                        <td class="border border-gray-300">{!! $item->DisplayInvoice2 == '-1' ? '&check;' : '' !!}</td>
                                        <td class="border border-gray-300">{!! $item->UserContoller == '-1' ? '&check;' : '' !!}</td>
                                        <td class="border border-gray-300">
                                            <span class="badge {{ $item->user_state == 'A' ? 'badge-success' : 'badge-neutral' }} badge-outline">
                                                {{ $item->user_state == 'A' ? 'Enable' : 'Disable' }}
                                            </span>
                                        </td>
                                        <td class="border border-gray-300">{{ substr($item->CREUSRDATE, 0, 10) }}</td>
                                        <td class="border border-gray-300">{{ substr($item->UPDUSRDATE, 0, 10) }}</td>
                                        <td class="border border-gray-300">
                                            @if (is_null($item->RESULT))
                                                <input type="radio" id="correct-{{ $item->user_id }}" checked name="result[{{ $item->user_id }}{{ $key }}]" class="radio result-radio radio-success" value="1">
                                            @else
                                                {!! $item->RESULT == '1' ? '&#x2714;' : '' !!}
                                            @endif
                                        </td>
                                        <td class="border border-gray-300">
                                            @if (is_null($item->RESULT))
                                                <input type="radio" id="incorrect-{{ $item->user_id }}" name="result[{{ $item->user_id }}{{ $key }}]" class="radio result-radio radio-error" value="0">
                                            @else
                                                {!! $item->RESULT == '0' ? '&#x2714;' : '' !!}
                                            @endif
                                        </td>
                                        <td class="border border-gray-300">
                                            @if (is_null($item->RESULT))
                                                <input type="text" id="remark-{{ $item->user_id }}" class="input input-bordered rounded-lg remark-input" name="remark[{{ $item->user_id }}]">
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
                {{-- <button class="bg-red-600 text-white px-6 py-2 btn rounded-lg shadow hover:bg-red-700 transition btn-approve" data-action="reject">
                    Reject
                </button> --}}
            </div>
        @endif

        <div class="flow mt-8"></div>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/RgvView.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection