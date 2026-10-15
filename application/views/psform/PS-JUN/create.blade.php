@extends('layouts/webflowTemplate')

@section('contents')
    <form action="" id="form1">
        <input type="text" class="hidden" id="NFRMNO" value="{{ $NFRMNO }}" />
        <input type="text" class="hidden" id="VORGNO" value="{{ $VORGNO }}" />
        <input type="text" class="hidden" id="CYEAR" value="{{ $CYEAR }}" />
        {{-- <input type="text" class="hidden" id="CYEAR2" value="{{ $CYEAR }}" /> --}}
        {{-- <input type="text" class="hidden" id="NRUNNO" value="{{ $NRUNNO }}" /> --}}
        <input type="text" class="hidden" id="EMPNO" value="{{ $EMPNO }}" name="input_by" />
        <section class="flex flex-col gap-3 mb-4 xl:m-auto">
            <div class="flex items-center gap-2">
                <div class="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                <h1 class="uppercase font-black text-2xl text-slate-500">AMEC Manufacturing Master Schedule For Production
                </h1>
            </div>

            {{-- Request User --}}
            <fieldset class="bg-primary/10 border border-primary rounded-xl p-5">
                <legend class="font-semibold text-lg px-1">Requester</legend>
                <div class="flex gap-8">
                    <fieldset class="fieldset flex-1">
                        <legend class="fieldset-legend">Requrst By</legend>
                        <input type="text" class="input hidden req-1" placeholder="Employee No." id="req-by-input"
                            value="{{ $EMPNO }}" name="req_by" />
                        <div class="flex items-center gap-3" id="req-by-info">
                            <div class="avatar flex-none">
                                <div class="w-16 rounded-full" id="req-by-img">
                                    <div class="skeleton h-16 w-16"></div>
                                    <img src="#" class="hidden" />
                                </div>
                            </div>
                            <div class="flex-none min-w-56 flex flex-col gap-2">
                                <h1 class="font-bold text-md" id="req-by-name">
                                    <div class="skeleton h-6 w-48"></div>
                                </h1>
                                <h2 id="req-by-id">
                                    <div class="skeleton h-6 w-32"></div>
                                </h2>
                                <div class="text-xs text-gray-500" id="req-by-organization">
                                    <div class="skeleton h-6 w-56"></div>
                                </div>
                            </div>
                            <div class="tooltip" data-tip="เปลี่ยนผู้ขอ Request">
                                <a href="#" class="btn btn-ghost btn-circle" id="change-req-employee"><i
                                        class="fi fi-rs-cross text-xl text-red-500"></i></a>
                            </div>

                        </div>
                    </fieldset>
                    <fieldset class="fieldset flex-1">
                        <legend class="fieldset-legend">Input By</legend>
                        <div class="flex items-center gap-3" id="input-by-info">
                            <div class="avatar flex-none">
                                <div class="w-16 rounded-full" id="input-by-img">
                                    <div class="skeleton h-16 w-16"></div>
                                    <img src="#" class="hidden" />
                                </div>
                            </div>
                            <div class="flex-1 flex flex-col gap-2">
                                <h1 class="font-bold text-md" id="input-by-name">
                                    <div class="skeleton h-6 w-48"></div>
                                </h1>
                                <h2 id="input-by-id">
                                    <div class="skeleton h-6 w-32"></div>
                                </h2>
                                <div class="text-xs text-gray-500" id="input-by-organization">
                                    <div class="skeleton h-6 w-96"></div>
                                </div>
                            </div>
                        </div>
                    </fieldset>
                </div>
            </fieldset>

            <fieldset class="bg-primary/10 border border-primary rounded-xl p-5">
                <legend class="font-semibold text-lg px-1">Schedule</legend>
                <div class="overflow-hidden tableArea relative">


                    <!-- Simple Filter/Search Mockup -->
                    <div class="flex gap-2 items-center justify-end">
                        <button class="btn btn-primary" id="export-button" type="button">Export</button>
                    </div>


                    @include('layouts/datatable_load')
                    <table id="table" class="table text-xs">
                        <thead>
                            <tr>
                                <th rowspan="2" class="hidddenป"></th>
                                <th rowspan="2" class="border border-slate-200 text-center!">Prod.</th>
                                <th rowspan="2" class="border border-slate-200 text-center!">Work Days</th>
                                <th rowspan="2" class="border border-slate-200 text-center!">Setup Prod.</th>
                                <th rowspan="2" class="border border-slate-200 text-center!">P.</th>
                                <th rowspan="2" class="border border-slate-200 text-center!">BM Date</th>
                                <th rowspan="2" class="border border-slate-200 text-center!">NC Program</th>
                                <th colspan="2" class="border border-slate-200 text-center!">Feeder 1</th>
                                <th colspan="2" class="border border-slate-200 text-center!">Feeder 2</th>
                                <th colspan="2" class="border border-slate-200 text-center!">Sub Assy</th>
                                <th rowspan="2" class="border border-slate-200 text-center!">Paint</th>
                                <th rowspan="2" class="border border-slate-200 text-center!">Assy</th>
                                <th rowspan="2" class="border border-slate-200 text-center!">Inspection</th>
                                <th rowspan="2" class="border border-slate-200 text-center!">Packing</th>
                            </tr>
                            <tr>
                                @for ($i = 0; $i < 3; $i++)
                                    <th class="border border-slate-200 text-center!">Start</th>
                                    <th class="border border-slate-200 text-center!">Finish</th>
                                @endfor
                            </tr>
                        </thead>
                    </table>
                </div>
            </fieldset>
            <div class="flex gap-3 mt-3 ">
                <button class="btn btn-primary" id="confirm-form"><i class="fi fi-tr-multiple"></i>Confirm</button>
            </div>
        </section>
    </form>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/psMasterSchedule.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
