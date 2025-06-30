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
                {{-- <hr class="pb-6"> --}}
                
                <form id="qa-form" class="flex flex-col gap-6">
                    {{-- <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4"> --}}
                    <div class="flex flex-col gap-3 ">
                        <label class="input">
                            <span class="label font-bold">Create by</span>
                            <input type="text" value="{{$empno}}" readonly />
                        </label>
                        <label class="input">
                            <span class="label font-bold">Request by</span>
                            <input type="text" class="req" id="requester" placeholder="e.g. 24008"/>
                        </label>
                    </div>
                    <hr class="">

                    {{-- <div class="divider"></div> --}}
                    {{-- 1. แบบ column  --}}
                    {{-- <div class="flex flex-col gap-5">

                        <div class="text-xl font-bold">Inspection Details</div>
                        <div class="grid grid-flow-rows grid-cols-[fit-content(100%)_1fr] gap-4">
                            <div class="flex items-center gap-3">Item<span class="ml-auto">:</span></div>
                            <div class="item">
                                <div class="skeleton w-40 h-10"></div>
                            </div>
                            <div class="flex items-center gap-3">QC Section in-charge<span class="ml-auto">:</span></div>
                            <div class="incharge flex gap-3">
                                <div class="skeleton w-40 h-10"></div>
                                <div class="skeleton w-xs h-10"></div>
                            </div>
                            <div class=" flex items-center gap-3">ID Operator<span class="ml-auto">:</span></div>
                            <div class="flex flex-col">
                                <div class="flex gap-3">
                                    <div class="operator">
                                        <div class="skeleton w-xs h-10"></div>
                                    </div>
                                    <div class="btn btn-primary tooltip gap-0" data-tip="Add Operator" id="addOperator">+<i class="icofont-user"></i></div>
                                </div>
                            </div>
                            <table class="table-organize self-start"></table>
                            <div class="operatorList flex flex-col w-fit list bg-base-100 rounded-box shadow-md"></div>
                            
                        </div>
                        <div class="text-xl font-bold">Attachments</div>
                        <div class="attach"></div>
                    </div> --}}

                    {{-- 2. แบบ row  --}}
                    {{-- <div class="flex gap-5">
                        <div class="detail w-1/2">
                            <div class="text-xl font-bold mb-5">Inspection Details</div>
                            <div class="grid grid-flow-rows grid-cols-[fit-content(100%)_1fr] gap-5">
                                <div class="flex items-center gap-3">Item<span class="ml-auto">:</span></div>
                                <div class="item">
                                    <div class="skeleton w-40 h-10"></div>
                                </div>
                                <div class="flex items-center gap-3 text-nowrap self-start">QC Section in-charge<span class="ml-auto">:</span></div>
                                <div class="incharge flex flex-col gap-3">
                                    <div class="skeleton w-40 h-10"></div>
                                    <div class="skeleton w-xs h-10"></div>
                                </div>
                                <div class=" flex items-center gap-3">ID Operator<span class="ml-auto">:</span></div>
                                <div class="flex flex-col">
                                    <div class="flex flex-col gap-3">
                                        <div class="organize flex gap-3">
                                            <div class="skeleton w-40  h-10"></div>
                                            <div class="skeleton w-40  h-10"></div>
                                            <div class="skeleton w-40  h-10"></div>
                                        </div>
                                        <div class="operator w-full">
                                            <div class="skeleton w-xs h-10"></div>
                                        </div>
                                        <div class="btn btn-primary tooltip gap-0" data-tip="Add Operator" id="addOperator">+<i class="icofont-user"></i></div>
                                    </div>
                                </div>
                            </div>
                            <table class="table table-organize my-5"></table>
                            <div class="operatorList flex flex-col w-full list bg-base-100 rounded-box shadow-md"></div>   
                        </div>
                        <div class="attachment w-1/2">
                            <div class="text-xl font-bold mb-5">Attachments</div>
                            <div class="attach"></div>
                        </div>
                    </div> --}}

                    {{-- 3. แยก operator --}}
                    <div class="flex gap-5">
                        <div class="left-detail w-1/2 flex flex-col gap-5">
                            <div class="detail">
                                <div class="text-xl font-bold mb-5">Inspection Details</div>
                                <div class="grid grid-flow-rows grid-cols-[fit-content(100%)_1fr] gap-5">
                                    <div class="flex items-center gap-3">Item<span class="ml-auto">:</span></div>
                                    <div class="item">
                                        <div class="skeleton w-40 h-10"></div>
                                    </div>
                                    <div class="flex items-center gap-3 text-nowrap self-start">QC Section in-charge<span class="ml-auto">:</span></div>
                                    <div class="incharge flex flex-col gap-3">
                                        <div class="skeleton w-40 h-10"></div>
                                        <div class="skeleton w-xs h-10"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="attachment">
                                <div class="text-xl font-bold mb-5 flex">
                                    Attachments
                                    <div class="btn btn-error rounded-full ml-auto tooltip" data-tip="Reset" >
                                        <i class="icofont-refresh"></i>
                                    </div>
                                </div>
                                <div class="attach"></div>
                            </div>
                        </div>
                        <div class="idoperator w-1/2">
                            <div class="text-xl font-bold mb-5">ID Operator</div>
                            <div class="flex flex-col mb-4">
                                <div class="flex gap-5">
                                    <div class="organize flex gap-3">
                                        <div class="skeleton w-40  h-10"></div>
                                        <div class="skeleton w-40  h-10"></div>
                                        <div class="skeleton w-40  h-10"></div>
                                    </div>
                                    <div class="btn btn-primary rounded-full tooltip" data-tip="Search" id="searchOperator"><i class="icofont-search-2 text-2xl"></i></div>
                                    {{-- <div class="operator w-full">
                                        <div class="skeleton w-xs h-10"></div>
                                    </div> --}}
                                </div>
                            </div>
                            <div id="tableLoading"></div>
                            <table class="table !table-zebra" id="tableOperator"></table>
                            {{-- <div class="operatorList flex flex-col w-full list bg-base-100 rounded-box shadow-md"></div>    --}}
                        </div>
                    </div>
                    <hr>
                    <div id="actionWebflow"></div>
                </form>
            </div>
        </div>
    </div>

@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/eSelf.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
