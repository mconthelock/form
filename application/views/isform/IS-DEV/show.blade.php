@extends('layouts/webflowTemplate')

@section('contents')
    <input type="text" class="hidden" id="NFRMNO" value="{{ $NFRMNO }}" />
    <input type="text" class="hidden" id="VORGNO" value="{{ $VORGNO }}" />
    <input type="text" class="hidden" id="CYEAR" value="{{ $CYEAR }}" />
    <input type="text" class="hidden" id="CYEAR2" value="{{ $CYEAR }}" />
    <input type="text" class="hidden" id="NRUNNO" value="{{ $NRUNNO }}" />
    <input type="text" class="hidden" id="EMPNO" value="{{ $EMPNO }}" />
    <section class="flex flex-col gap-3 mb-4">
        <h1 class="text-3xl font-bold text-primary"> Computer program Requisition Form </h1>
        {{-- Request User --}}
        <fieldset class="bg-primary/10 border border-primary rounded-xl p-5">
            <legend class="font-semibold text-lg px-1">Request Detail</legend>
            <div class="flex gap-8">
                <div class="flex-1 flex flex-col gap-3">
                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">Form No</legend>
                        <div class="p-2 border border-gray-300 border-dotted rounded-xl bg-white">
                            <div class="skeleton h-6 w-120"></div>
                        </div>
                    </fieldset>

                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">Requester</legend>
                        <div class="p-2 border border-gray-300 border-dotted rounded-xl bg-white">
                            <div class="skeleton h-6 w-120"></div>
                        </div>
                    </fieldset>

                    <fieldset class="fieldset flex">
                        <div>
                            <legend class="fieldset-legend">System Name</legend>
                            <div class="p-2 border border-gray-300 border-dotted rounded-xl bg-white">
                                <div class="skeleton h-6 w-32"></div>
                            </div>
                        </div>

                        <div>
                            <legend class="fieldset-legend">Request Type</legend>
                            <div class="p-2 border border-gray-300 border-dotted rounded-xl bg-white">
                                <div class="skeleton h-6 w-56"></div>
                            </div>
                        </div>

                        <div>
                            <legend class="fieldset-legend">Program Name</legend>
                            <div class="p-2 border border-gray-300 border-dotted rounded-xl bg-white">
                                <div class="skeleton h-6 w-72"></div>
                            </div>
                        </div>
                    </fieldset>

                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">Title</legend>
                        <div class="p-2 border border-gray-300 border-dotted rounded-xl bg-white">
                            <div class="skeleton h-6 w-120"></div>
                        </div>
                    </fieldset>

                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">Detail</legend>
                        <div class="p-2 border border-gray-300 border-dotted rounded-xl bg-white min-h-30">
                            <div class="skeleton h-6 w-160"></div>
                        </div>
                    </fieldset>

                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">Attachment</legend>
                        <div class="p-2 border border-gray-300 border-dotted rounded-xl bg-white">
                            <ul></ul>
                        </div>
                    </fieldset>
                </div>

                {{-- Assign person incharge --}}
                <div
                    class="flex-none min-w-80 bg-white/60 border border-gray-300 border-dotted rounded-xl px-5 py-5 hidden">
                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">Developer</legend>
                        <select class="select">
                            <option disabled selected>Pick a color</option>
                            <option>Crimson</option>
                            <option>Amber</option>
                            <option>Velvet</option>
                        </select>
                    </fieldset>

                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">Plan Start</legend>
                        <input type="text" placeholder="{{ date('Y-m-d') }}" class="input" />
                    </fieldset>

                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">Plan Finish</legend>
                        <input type="text" placeholder="{{ date('Y-m-d') }}" class="input" />
                    </fieldset>

                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">Work Hours</legend>
                        <div class="flex gap-3 items-center">
                            <input type="text" placeholder="80" class="input" />
                            <span>Hrs.</span>
                        </div>
                    </fieldset>
                </div>
            </div>

        </fieldset>

        <fieldset class="bg-primary/10 border border-primary rounded-xl p-5">
            <legend class="font-semibold text-lg px-1">Expected Outcome</legend>

            <fieldset class="fieldset flex">
                <div>
                    <legend class="fieldset-legend">Objective</legend>
                    <div class="p-2 border border-gray-300 border-dotted rounded-xl bg-white">
                        <div class="skeleton h-6 w-56"></div>
                    </div>
                </div>

                <div>
                    <legend class="fieldset-legend">ROI Payback Period</legend>
                    <div class="p-2 border border-gray-300 border-dotted rounded-xl bg-white">
                        <div class="skeleton h-6 w-32"></div>
                    </div>
                </div>

                <div>
                    <legend class="fieldset-legend">Preferred Requirement Gathering Period</legend>
                    <div class="p-2 border border-gray-300 border-dotted rounded-xl bg-white">
                        <div class="skeleton h-6 w-32"></div>
                    </div>
                    <p class="label italic">กำหนดการที่พร้อมสำหรับการเก็บรวบรวมข้อกำหนดและ Developer เริ่มงานได้</p>
                </div>
            </fieldset>

            <fieldset class="fieldset">
                <legend class="fieldset-legend">Current Workflow</legend>
                <div class="p-2 border border-gray-300 border-dashed rounded-xl bg-white/70 min-h-30 text-gray-700">
                    <div class="skeleton h-6 w-160"></div>
                </div>
            </fieldset>

            <fieldset class="fieldset">
                <legend class="fieldset-legend">Expected Workflow</legend>
                <div class="p-2 border border-gray-300 border-dotted rounded-xl bg-white min-h-30">
                    <div class="skeleton h-6 w-160"></div>
                </div>
            </fieldset>

            <div class="table-wrap overflow-x-auto mt-3 border border-slate-300 rounded-xl">
                @include('isform.FORM-1.table-benefit')
            </div>
        </fieldset>

        <fieldset class="bg-primary/10 border border-primary rounded-xl p-5 form-roi">
            <legend class="font-semibold text-lg px-1">Efficiency Gains</legend>
            <div class="table-wrap overflow-x-auto">
                @include('isform.FORM-1.table-labor', ['view' => true])
            </div>
        </fieldset>

        <fieldset class="bg-primary/10 border border-primary rounded-xl p-5 form-roi">
            <legend class="font-semibold text-lg px-1">Investment in equipment.</legend>
            <div class="table-wrap overflow-x-auto">
                @include('isform.FORM-1.table-investment', ['view' => true])
            </div>
        </fieldset>

        <div class="form-roi bg-accent/10 border border-accent rounded-xl p-5 mt-3">
            This project will return on investment (ROI)
            <span class="font-bold text-lg text-primary" id="roi-total-kb">0 KB</span>
            <span class="font-bold text-lg text-primary" id="roi-total-full">(0
                Baht)</span>
            <span class="font-bold text-lg text-primary mx-1" id="roi-total-year"></span>
        </div>
    </section>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/devFormView.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
