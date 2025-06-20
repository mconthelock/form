@extends('layouts/webflowTemplate')

@section('contents')
    <div class="max-w-5xl w-full mx-auto px-6 py-8 bg-white shadow-lg rounded-2xl space-y-8">
        <div class="flex justify-between items-center border-b pb-4">
            <h1 class="text-3xl font-bold text-blue-900">Special Authorization ID Detail</h1>
            <span class="text-red-600 font-semibold border border-red-600 px-4 py-1 rounded-lg">CONFIDENTIAL</span>
        </div>
        <div class="form-data" data-nfrmno="{{ $NFRMNO }}" data-vorgno="{{ $VORGNO }}" data-cyear="{{ $CYEAR }}" data-cyear2="{{ $CYEAR2 }}" data-nrunno="{{ $NRUNNO }}" data-empno="{{ $EMPNO }}"></div>
        @if ($data['ACTION'] == 'ADD')
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-xl">
                <!-- ซ้าย -->
                <div class="bg-blue-50 rounded-xl shadow-inner divide-y divide-blue-200 overflow-hidden">
                    <div class="flex items-center px-5 py-2">
                        <div class="w-40 text-sm font-semibold text-blue-700">Form Number : </div>
                        <div class="text-sm text-gray-900">{{ $formNumber }}</div>
                    </div>
                    <div class="flex items-center px-5 py-2">
                        <div class="w-40 text-sm font-semibold text-blue-700">Input By : </div>
                        <div class="text-sm text-gray-900">{{ $input_name }}({{ $data['EMP_INPUT'] }})</div>
                    </div>
                    <div class="flex items-center px-5 py-2">
                        <div class="w-40 text-sm font-semibold text-blue-700">Request By : </div>
                        <div class="text-sm text-gray-900">{{ $req_name }}({{ $data['EMP_REQUEST'] }})</div>
                    </div>
                    <div class="flex items-center px-5 py-2">
                        <div class="w-40 text-sm font-semibold text-blue-700">Request Date : </div>
                        <div class="text-sm text-gray-900">{{ date('d/m/Y', strtotime($data['REQUEST_DATE'])) }}</div>
                    </div>
                    <div class="flex items-center px-5 py-2">
                        <div class="w-40 text-sm font-semibold text-blue-700">Action : </div>
                        <div class="text-sm text-gray-900 font-semibold">{{ $data['ACTION'] }}</div>
                    </div>
                    <div class="flex items-center px-5 py-2">
                        <div class="w-40 text-sm font-semibold text-blue-700">Reason : </div>
                        <div class="text-sm text-gray-900">{{ $data['REASON'] }}</div>
                    </div>
                </div>

                <!-- ขวา -->
                <div class="bg-yellow-50 rounded-xl shadow-inner divide-y divide-yellow-200 overflow-hidden">
                    <div class="flex items-center px-5 py-2">
                        <div class="w-40 text-sm font-semibold text-yellow-700">Platform : </div>
                        <div class="text-sm text-gray-900">{{ $data['PLATFORM'] }}</div>
                    </div>
                    <div class="flex items-center px-5 py-2">
                        <div class="w-40 text-sm font-semibold text-yellow-700">Class : </div>
                        <div class="text-sm text-gray-900">{{ $data['CLASS'] }}</div>
                    </div>
                    <div class="flex items-center px-5 py-2">
                        <div class="w-40 text-sm font-semibold text-yellow-700">CATEGORY : </div>
                        <div class="text-sm text-gray-900">{{ $data['CATEGORY'] }}</div>
                    </div>
                    <div class="flex items-center px-5 py-2">
                        <div class="w-40 text-sm font-semibold text-yellow-700">Role : </div>
                        <div class="text-sm text-gray-900">{{ $data['ROLE'] }}</div>
                    </div>
                    <div class="flex items-center px-5 py-2">
                        <div class="w-40 text-sm font-semibold text-yellow-700">Duration Type : </div>
                        <div class="text-sm text-gray-900">{{ $data['DURATION_TYPE'] }}</div>
                    </div>
                    <div class="flex items-center px-5 py-2">
                        <div class="w-40 text-sm font-semibold text-yellow-700">User Type : </div>
                        <div class="text-sm text-gray-900">{{ $data['USER_TYPE'] }}</div>
                    </div>
                </div>
            </div>
        @elseif($data['ACTION'] == 'DELETE')
            <div class="bg-blue-50 rounded-xl shadow-inner divide-y divide-blue-200 overflow-hidden">
                <div class="flex items-center px-5 py-2">
                    <div class="w-40 text-sm font-semibold text-blue-700">Form Number : </div>
                    <div class="text-sm text-gray-900">{{ $formNumber }}</div>
                </div>
                <div class="flex items-center px-5 py-2">
                    <div class="w-40 text-sm font-semibold text-blue-700">Input By : </div>
                    <div class="text-sm text-gray-900">{{ $data['EMP_INPUT'] }}</div>
                </div>
                <div class="flex items-center px-5 py-2">
                    <div class="w-40 text-sm font-semibold text-blue-700">Request By : </div>
                    <div class="text-sm text-gray-900">{{ $data['EMP_REQUEST'] }}</div>
                </div>
                <div class="flex items-center px-5 py-2">
                    <div class="w-40 text-sm font-semibold text-blue-700">Request Date : </div>
                    <div class="text-sm text-gray-900">{{ date('d/m/Y', strtotime($data['REQUEST_DATE'])) }}</div>
                </div>
                <div class="flex items-center px-5 py-2">
                    <div class="w-40 text-sm font-semibold text-blue-700">Action : </div>
                    <div class="text-sm font-semibold text-red-500">{{ $data['ACTION'] }}</div>
                </div>
                <div class="flex items-center px-5 py-2">
                    <div class="w-40 text-sm font-semibold text-blue-700">Platform : </div>
                    <div class="text-sm text-gray-900">{{ $data['PLATFORM'] }}</div>
                </div>
                <div class="flex items-center px-5 py-2">
                    <div class="w-40 text-sm font-semibold text-blue-700">Username : </div>
                    <div class="text-sm font-semibold text-gray-900">{{ $data['USERNAME'] }}</div>
                </div>
                <div class="flex items-center px-5 py-2">
                    <div class="w-40 text-sm font-semibold text-blue-700">Reason : </div>
                    <div class="text-sm text-gray-900">{{ $data['REASON'] }}</div>
                </div>
            </div>
        @endif
        {{-- {{ $extdata }} --}}
        @if ($extdata == '01' && $data['ACTION'] == 'ADD')
            <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4">
                <legend class="fieldset-legend">Admin Form</legend>
                <div class="flex justify-center gap-2">
                    <label for="" class="label">Username <span class="text-red-500">*</span> : </label>
                    <input type="text" class="input rounded-lg bg-white w-50" id="username" placeholder="Username" />
                    <label for="" class="label">Initial Password : </label>
                    <input type="text" class="input rounded-lg bg-white w-50" id="password" placeholder="Password" />
                    <label for="" class="label">Start Date <span class="text-red-500">*</span> : </label>
                    <input type="date" class="input rounded-lg bg-white w-50" id="start-date" placeholder="Start Date" />
                    <input type="hidden" class="action_type" value="{{ $data['ACTION'] }}">
                </div>
            </fieldset>
        @endif
        @if ($mode == '02')
            <input type="hidden" class="extdata" value="{{ $extdata }}">
            <input type="text" class="hidden" id="username_del" value="{{ $data['USERNAME'] }}" />
            <input type="text" class="hidden" id="platform" value="{{ $data['PLATFORM'] }}" />
            <div class="flex justify-center mt-6 space-x-4">
                <button class="bg-green-600 text-white px-6 py-2 btn rounded-lg shadow hover:bg-green-700 transition btn-submit" data-action="approve" id="btn-confirm">
                    Approve
                </button>
                <button class="bg-red-600 text-white px-6 py-2 btn rounded-lg shadow hover:bg-red-700 transition btn-submit" data-action="reject">
                    Reject
                </button>
            </div>
        @endif


        <div class="flow">

        </div>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/specialAuthView.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
