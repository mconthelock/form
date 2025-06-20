@extends('layouts/webflowTemplate')

@section('contents')
    <div class="hidden form-info" NFRMNO="{{$NFRMNO}}" VORGNO="{{$VORGNO}}" CYEAR="{{$CYEAR}}" CYEAR2="{{ $CYEAR2 }}"  NRUNNO="{{ $NRUNNO }}" mode="{{ $mode }}"></div>
    @if ($mode != '1')
        <div class="apv-data hidden" apv="{{ $empno }}"  cextData="{{ $cextData }}" firstStep="{{$firstStep}}"></div>
    @endif
    <div class="flex flex-col w-full px-4 my-5 font-sans">
        <div class="card bg-white w-full place-self-center shadow-sm">
            <div class="load flex flex-col gap-5 h-screen w-full p-6">
                <div class="flex">
                    <div class="skeleton h-16 w-[40%]"></div>
                    <div class="skeleton h-16 w-[20%] ml-auto"></div>
                </div>
                {{-- form info --}}
                <div class="flex gap-5 h-[20%]">
                    <div class="skeleton  w-[25rem]"></div>
                    <div class="skeleton  w-full"></div>
                </div>
                <div class="skeleton h-[20%] w-full"></div>
                {{-- remark --}}
                <div class="skeleton  min-h-24 w-56"></div>
                {{-- button --}}
                <div class="flex gap-1">
                    <div class="skeleton h-10 w-24"></div>
                    <div class="skeleton h-10 w-24"></div>
                </div>
            </div>
            <div class="card-body hidden" id="form">
                <h2 class="card-title">
                    <u class="text-3xl text-primary font-bold mb-5" id="header">List for Job result confirmation</u>
                    <div class="ml-auto px-2 font-bold text-2xl text-error border-3 border-error">CONFIDENTAIL</div>
                </h2>
                <div class="flex gap-5 mb-5">
                    <div class="form-info"></div>
                    <div class="flex-1">
                        <table id="table" class="table !table-zebra"></table>
                    </div>
                </div>
                <table id="table1" class="table !table-zebra">
                    <thead>
                        <tr>
                            <th rowspan="2">No.</th>
                            <th rowspan="2">SECTION</th>
                            <th rowspan="2">DATE</th>
                            <th rowspan="2">PLAN</th>
                            <th rowspan="2">COMPLETED</th>
                            <th rowspan="2">JOB No.</th>
                            <th rowspan="2">JOB NAME</th>
                            <th rowspan="2">PLAN TIME</th>
                            <th colspan="2" class="text-center">ACTUAL</th>
                            <th rowspan="2">STANDARD TIME</th>
                            <th rowspan="2">STATUS</th>
                            <th rowspan="2">PIC</th>
                            <th rowspan="2">SKIP</th>
                            <th rowspan="2">RE-RUN</th>
                            <th rowspan="2">Checker</th>
                        </tr>
                        <tr>
                            <th class="row2">START TIME</th>
                            <th class="row2">END TIME</th>
                        </tr>
                    </thead>
                </table>
                
            </div>
            @if ($mode != 1)
                @include('component/webflow/formAction')
            @endif
        </div>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/resultConf.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
