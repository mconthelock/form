@extends('layouts/webflowTemplate')
@section('contents')
    <div class="max-w-10xl w-full mx-auto px-5 py-10 bg-white space-y-8 text-gray-800">
        <h1 class="text-3xl font-bold text-blue-900 border-b pb-4">Regular Review <text class="text-sm">({{ $program }})</text></h1>
        <div class="form-data" data-nfrmno="{{ $NFRMNO }}" data-vorgno="{{ $VORGNO }}" data-cyear="{{ $CYEAR }}" data-cyear2="{{ $CYEAR2 }}" data-nrunno="{{ $NRUNNO }}" data-empno="{{ $EMPNO }}"></div>
        <div class="my-6">
            {{-- print_r($form) --}}

            <table class="table table-sm border-collapse border" id="checktable">
                <thead>
                    <tr class="text-center bg-base-200">
                        <th class="border border-gray-300">Server Name</th>
                        <th class="border border-gray-300">Group</th>
                        <th class="border border-gray-300">User</th>
                        <th class="border border-gray-300">EMPNO</th>
                        <th class="border border-gray-300">Status</th>
                        <th class="border border-gray-300">Correct</th>
                        <th class="border border-gray-300">InCorrect</th>
                        <th class="border border-gray-300">Remark</th>
                    </tr>
                </thead>
                <tbody>
                    {{-- pre_array($empform) --}}

                    <!-- {{ pre_array($user) }} -->
                    @foreach ($user as $key => $item)
                        <tr class="text-center">
                            <td class="border border-gray-300">{{ $item->SERVER_NAME }}</td>
                            <td class="border border-gray-300">{{ $item->GROUP_NAME }}</td>
                            <td class="border border-gray-300">{{ $item->USER_LOGIN }}</td>
                            <td class="border border-gray-300">{{ $item->EMPNO }}</td>
                            <td class="border border-gray-300">{{ $item->USER_STATUS == '1' ? 'Enable' : 'Disable' }}</td>
                            <td class="border border-gray-300">
                                @if (is_null($item->RESULT))
                                    <input type="radio" id="correct-{{ $item->EMPNO }}" checked name="result[{{ $item->EMPNO }}{{ $key }}]" class="radio result-radio radio-success" value="1">
                                @else
                                    {!! $item->RESULT == '1' ? '&#x2714;' : '' !!}
                                @endif
                            </td>
                            <td class="border border-gray-300">
                                @if (is_null($item->RESULT))
                                    <input type="radio" id="incorrect-{{ $item->EMPNO }}" name="result[{{ $item->EMPNO }}{{ $key }}]" class="radio result-radio radio-error" value="0">
                                @else
                                    {!! $item->RESULT == '0' ? '&#x2714;' : '' !!}
                                @endif
                            </td>
                            <td class="border border-gray-300">
                                @if (is_null($item->RESULT))
                                    <input type="text" id="remark-{{ $item->EMPNO }}" class="input rounded-lg remark-input" name="remark[{{ $item->EMPNO }}]">
                                @else
                                    {{ $item->DETAIL }}
                                @endif
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
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
        <div class="flow">

        </div>
    </div>

@endsection
@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/RgvView.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection