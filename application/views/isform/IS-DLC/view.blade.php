@extends('layouts/webflowTemplate')


@section('styles')
    <style>
        div.dt-container thead>tr>th {
            text-align: center !important;
        }

        .dt-type-date,
        .dt-type-numeric {
            text-align: left !important;
        }
    </style>
@endsection
@section('contents')

    <div class="max-w-10xl w-full mx-auto px-5 py-10 bg-white space-y-8 text-gray-800">
        <h1 class="text-3xl font-bold text-blue-800 mb-4 text-center">Daily Log Checksheet</h1>
        <div class="form-data" data-nfrmno="{{ $NFRMNO }}" data-vorgno="{{ $VORGNO }}" data-cyear="{{ $CYEAR }}" data-cyear2="{{ $CYEAR2 }}" data-nrunno="{{ $NRUNNO }}" data-empno="{{ $EMPNO }}"></div>
        <div>
            <table id="logTable" class="stripe hover w-full text-sm text-gray-700 bg-white rounded-xl shadow">
                <thead class="bg-blue-100 text-blue-900 text-sm">
                    <tr>
                        <th class="text-center">No.</th>
                        <th class="text-center">Date</th>
                        <th class="text-center">Time</th>
                        <th class="text-center">Server</th>
                        <th class="text-center">Name</th>
                        <th class="text-center">IP</th>
                        <th class="text-center">Computer Name</th>
                        <th class="text-center">Remark</th>
                        <th class="text-center">ID Temp</th>
                        <th class="text-center">Req Date</th>
                        <th class="text-center">Request Time</th>
                    </tr>
                </thead>
                <tbody class="text-sm text-gray-700">
                    @foreach ($logdata as $i => $log)
                        @php
                            $logDateTime = strtotime("{$log->LOG_DATE} {$log->LOG_TIME}");
                            $reqDate     = $log->TID_DATA[0]->TID_REQ_DATE ?? null;
                            $timeStart   = $log->TID_DATA[0]->TID_TIMESTART ?? null;
                            $timeEnd     = $log->TID_DATA[0]->TID_TIMEEND ?? null;

                            $startDateTime = $reqDate && $timeStart ? strtotime("{$reqDate} {$timeStart}") : null;
                            $endDateTime   = $reqDate && $timeEnd ? strtotime("{$reqDate} {$timeEnd}") : null;

                            $isOutOfRange = $startDateTime && $endDateTime
                                ? ($logDateTime < $startDateTime || $logDateTime > $endDateTime)
                                : false;
                        @endphp
                        <tr @if((empty($log->TID_DATA) || $isOutOfRange) && $log->LOG_USER != "QSECOFR") style="background-color: #fca5a5;" @endif>
                            <td>{{ $i + 1 }}</td>
                            <td>{{ $log->LOG_DATE }}</td>
                            <td>{{ $log->LOG_TIME }}</td>
                            <td>{{ $log->LOG_SERVER }}</td>
                            <td>{{ $log->LOG_USER }}</td>
                            <td>{{ $log->LOG_IP }}</td>
                            <td class="text-center">-</td>
                            <td>{{ $log->LOG_MSG }}</td>
                            <td>{{ $log->TID_FORMNO }}</td>
                            <td>{{ $log->TID_DATA[0]->TID_REQ_DATE ?? '-' }}</td>
                            <td>{{ $log->TID_DATA[0]->TID_TIMESTART ?? '' }} - {{ $log->TID_DATA[0]->TID_TIMEEND ?? '' }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        @if ($mode == '02')
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
    <script src="{{ $_ENV['APP_JS'] }}/DailyLogView.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection