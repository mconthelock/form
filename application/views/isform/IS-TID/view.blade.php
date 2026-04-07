@extends('layouts/webflowTemplate')

@section('contents')
@php
function convdate($date){
if($date != null){
return date('d-M-y', strtotime($date) + 7*3600);
}else{
return '-';
}
}
@endphp
<div class="hidden form-info" NFRMNO="{{$NFRMNO}}" VORGNO="{{$VORGNO}}" CYEAR="{{$CYEAR}}" CYEAR2="{{$CYEAR2}}"
    NRUNNO="{{$NRUNNO}}"></div>
<div class="apv-data hidden" apv="{{ $apv }}" mode="{{ $mode }}" cextData="{{ $cextData }}"></div>
<div class="flex flex-col w-full px-4 my-5 font-sans">
    <div class="card bg-base-100 w-full lg:min-w-[70rem] place-self-center shadow-sm">
        <div class="load flex flex-col gap-5 h-screen w-full p-6">
            <div class="flex">
                <div class="skeleton h-16 w-[70%]"></div>
                <div class="skeleton h-16 w-[20%] ml-auto"></div>
            </div>
            <div class="flex flex-col md:flex-row gap-5 w-full md:w-1/2">
                <div class="skeleton h-72 w-full md:w-1/2"></div>
                <div class="skeleton h-72 w-full md:w-1/2"></div>
            </div>
            {{-- form info --}}
            <div class="skeleton h-[20%] w-[25rem]"></div>
            <div class="skeleton h-[80%] w-full"></div>
            {{-- remark --}}
            <div class="w-full flex flex-col gap-3 items-center">
                <div class="skeleton  min-h-24 w-56"></div>
                {{-- button --}}
                <div class="flex gap-1">
                    <div class="skeleton h-10 w-24"></div>
                    <div class="skeleton h-10 w-24"></div>
                    <div class="skeleton h-10 w-24"></div>
                </div>
            </div>

        </div>
        <form href="#" class="card-body hidden" id="form">
            <h2 class="card-title">
                <u class="text-3xl text-primary font-bold mb-5">Production Environment ID temporary use request</u>
                <div class="ml-auto px-2 font-bold text-2xl text-error border-3 border-error">CONFIDENTAIL</div>
            </h2>

            <div class="flex flex-col md:flex-row gap-5 ">
                <div id="form-info"></div>

                <div class="w-full md:w-fit bg-base-200 border border-base-300 p-4 rounded-box relative">
                    <div class="absolute text-lg top-[-13px] font-bold">Access Request Details</div>

                    <table class="table">
                        <tbody>
                            <tr>
                                <td class="text-primary">Requester date:</td>
                                <td><span id="reqDate"></span></td>
                            </tr>
                            <tr>
                                <td class="text-primary">Usage period:</td>
                                <td><span id="pStart"></span> - <span id="pEnd"></span></td>
                            </tr>
                            <tr>
                                <td class="text-primary">Webflow request No:
                                    <div class="text-error hidden" id="changeData-container">(Change Data)</div>
                                    <div class="text-error hidden" id="late-container">(Late)</div>
                                </td>
                                <td id="reqNo-list"></td>
                            </tr>
                            <tr>
                                <td class="text-primary">Server name:</td>
                                <td><span id="serverName"></span></td>
                            </tr>
                            <tr>
                                <td class="text-primary">Production User ID:</td>
                                <td><span id="userID"></span></td>
                            </tr>
                            <tr id="controller-container" class="hidden">
                                <td class="text-primary">Controller:</td>
                                <td><span id="controller"></span></td>
                            </tr>
                        </tbody>
                    </table>

                </div>
            </div>

            <div class="flex flex-col border border-black w-full mt-8">
                <div class="border border-black font-bold bg-gray-300">
                    <p class="ml-2 text-xl font-bold">Work content</p>
                </div>
                <div class="border border-black h-fit">
                    <div class="m-5">
                        <textarea class="w-full resize-none overflow-y-auto p-2 autosize" id="workCon"
                            readonly></textarea>
                    </div>
                </div>
                <div class="border border-black font-bold bg-gray-300">
                    <p class="ml-2 text-xl font-bold">Reason of Necessity</p>
                </div>
                <div class="border border-black h-fit">
                    <div class="m-5">
                        <textarea class="w-full resize-none overflow-y-auto p-2 autosize" id="reason"
                            readonly></textarea>
                    </div>
                </div>
            </div>

            <div id="complete-container"></div>
            <div id="disable-container"></div>
        </form>
        <div class="form-action-container"></div>
    </div>
</div>
@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/userEnvView.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection