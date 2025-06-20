@extends('layouts/webflowTemplate')

@section('contents')
    <div class="hidden form-info" data-test="1" NFRMNO="{{$NFRMNO}}" VORGNO="{{$VORGNO}}" CYEAR="{{$CYEAR}}" empno="{{$empno}}" mode="{{ $mode }}"></div>
    @if ($mode != '1')
        <div class="form-no hidden" CYEAR2="{{ $CYEAR2 }}"  NRUNNO="{{ $NRUNNO }}"></div>
        <div class="apv-data hidden" cextData="{{ $cextData }}" return="{{ $return }}"></div>
    @endif
    <div class="flex justify-center">

        <div class="card bg-base-100 min-w-[70vw] w-fit drop-shadow-lg">
            <div class="card-header px-6 pt-6">
                <h2 class="text-3xl font-bold">E-Self Inspection and Authorize</h2>
                
            </div>
            <div class="card-body">
                <hr class="pb-6">
                <form id="qa-form">
                    {{-- <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4"> --}}
                    <div class="flex flex-col gap-3">
                        <label class="input">
                            <span class="label font-bold">Create by</span>
                            <input type="text" value="{{$empno}}" readonly />
                        </label>
                        <label class="input">
                            <span class="label font-bold">Request by</span>
                            <input type="text" placeholder="e.g. 24008"/>
                        </label>
                    </div>
                    <div class="divider"></div>
                    <div class="flex flex-col gap-5">

                        <div class="text-xl font-bold">Inspection Details</div>
                        <div class="grid grid-flow-rows grid-cols-[fit-content(100%)_1fr] gap-4">
                            <div class="flex items-center gap-3">Item<span class="ml-auto">:</span></div>
                            <div class="item"></div>
                            <div class=" flex items-center gap-3">ID Operator<span class="ml-auto">:</span></div>
                            <div class="flex flex-col">
                                <div class="flex gap-3">
                                    <div class="operator"></div>
                                    <div class="btn btn-primary tooltip gap-0" data-tip="Add Operator" id="addOperator">+<i class="icofont-user"></i></div>
                                </div>
                                <div class="operatorList"></div>
                            </div>
                            <div class="flex items-center gap-3">QC Section in-charge<span class="ml-auto">:</span></div>
                            <div class="incharge"></div>
                        </div>
                        <div class="text-xl font-bold">Attachments</div>
                        <div class="attach"></div>
                    </div>
                    {{-- <div class="flex gap-5">
                        <div class="detail w-1/2">
                            <div class="text-xl font-bold">Inspection Details</div>
                            <div class="grid grid-flow-rows grid-cols-[fit-content(100%)_1fr] gap-4">
                                <div class="flex items-center gap-3">Item<span class="ml-auto">:</span></div>
                                <input type="text" class="input" value="" />
                                <div class=" flex items-center gap-3">ID Operator<span class="ml-auto">:</span></div>
                                <input type="text" class="input" value="" />
                                <div class="flex items-center gap-3">QC Section in-charge<span class="ml-auto">:</span></div>
                                <input type="text" class="input" value="" />
                            </div>
                        </div>
                        <div class="attach w-1/2">
                            <div class="text-xl font-bold">Attachments</div>

                        </div>
                    </div> --}}


                    {{-- </fieldset> --}}
                </form>
            </div>
        </div>
    </div>

@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/eSelf.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
