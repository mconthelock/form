@extends('layouts/webflowTemplate')

@section('contents')
    <div class="hidden form-info" NFRMNO="{{$NFRMNO}}" VORGNO="{{$VORGNO}}" CYEAR="{{$CYEAR}}" CYEAR2="{{$CYEAR2}}" NRUNNO="{{$NRUNNO}}"></div>
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
                <div class="skeleton  min-h-24 w-56"></div>
                {{-- button --}}
                <div class="flex gap-1">
                    <div class="skeleton h-10 w-24"></div>
                    <div class="skeleton h-10 w-24"></div>
                </div>

            </div>
            <form href="#" class="card-body hidden" id="form">
                <h2 class="card-title">
                    <u class="text-3xl text-primary font-bold mb-5">Production Environment ID temporary use request</u>
                    <div class="ml-auto px-2 font-bold text-2xl text-error border-3 border-error">CONFIDENTAIL</div>
                </h2>

                <div class="flex flex-col md:flex-row gap-5 ">
                    {{-- <fieldset  class="fieldset w-full md:w-fit bg-base-200 border border-base-300 p-4 rounded-box">
                        <legend class="fieldset-legend text-lg">Requester Information</legend> 
                        <fieldset class="fieldset w-full">  
                            <label class="fieldset-label">Requester</label>
                            {{$data->TID_REQUESTER}}
                        </fieldset>

                        <fieldset class="fieldset w-full">  
                            <label class="fieldset-label">Requester date</label>
                            {{$data->TID_REQ_DATE}}
                        </fieldset>

                        <fieldset class="fieldset w-full">   
                            <label class="fieldset-label">Usage period</label>
                                {{$data->TID_TIMESTART}} - {{$data->TID_TIMEEND}}
                        </fieldset>
                    </fieldset>
                    <fieldset  class="fieldset w-full md:w-fit bg-base-200 border border-base-300 p-4 rounded-box">
                        <legend class="fieldset-legend text-lg">Access Request Details</legend>
                        <fieldset class="fieldset w-full">
                        
                            <label class="fieldset-label">Webflow request No.
                                @if ($data->TID_CHANGEDATA == 1)
                                    <div class="text-error">(Change Data)</div>
                                @endif
                            </label>
                            @if (is_array($link))
                                @foreach ($link as $l)
                                    <a href="{{$l['url']}}" class="link link-primary" target="_blank"> {{$l['req']}}</a>
                                    
                                @endforeach
                                
                            @else 
                                <a href="{{$link}}" class="link link-primary" target="_blank"> {{$data->TID_REQNO}}</a>
                            @endif
                        </fieldset>

                        <fieldset class="fieldset w-full">
                            <label class="fieldset-label">Server name</label>
                            {{$data->TID_SERVERNAME}}
                        </fieldset>

                        <fieldset class="fieldset w-full">
                            <label class="fieldset-label">Production User ID</label>
                            {{$data->TID_USERLOGIN}}
                        </fieldset>

                        @if (!empty($data->TID_CONTROLLER))
                            <div class="divCon w-full">
                                <fieldset class="fieldset">
                                    <label class="fieldset-label">Controller</label>
                                    {{$data->TID_CONTROLLER}}
                                </fieldset>
                            </div>
                        @endif
                    </fieldset> --}}
                    <div class="form-info"></div>

                    <div  class="w-full md:w-fit bg-base-200 border border-base-300 p-4 rounded-box relative">
                        <div class="absolute text-lg top-[-13px] font-bold">Access Request Details</div>
                        
                        <table class="table">
                            <tbody>
                                <tr>
                                    <td class="text-primary">Requester date:</td>
                                    <td>{{$data->TID_REQ_DATE}}</td>
                                </tr>
                                <tr>
                                    <td class="text-primary">Usage period:</td>
                                    <td>{{$data->TID_TIMESTART}} - {{$data->TID_TIMEEND}}</td>
                                </tr>
                                <tr>
                                    <td class="text-primary">Webflow request No:
                                        @if ($data->TID_CHANGEDATA == 1)
                                            <div class="text-error">(Change Data)</div>
                                        @endif
                                    </td>
                                    <td>
                                        @if (is_array($link))
                                            @foreach ($link as $l)
                                                <a href="{{$l['url']}}" class="link link-primary" target="_blank"> {{$l['req']}}</a>
                                                <br>
                                            @endforeach
                                            
                                        @else 
                                            <a href="{{$link}}" class="link link-primary" target="_blank"> {{$data->TID_REQNO}}</a>
                                        @endif
                                    </td>
                                </tr>
                                <tr>
                                    <td class="text-primary">Server name:</td>
                                    <td>{{$data->TID_SERVERNAME}}</td>
                                </tr>
                                <tr>
                                    <td class="text-primary">Production User ID:</td>
                                    <td>{{$data->TID_USERLOGIN}}</td>
                                </tr>
                                @if (!empty($data->TID_CONTROLLER))
                                    <tr>
                                        <td class="text-primary">Controller:</td>
                                        <td>{{$data->TID_CONTROLLER}}</td>
                                    </tr>
                                @endif
                            </tbody>
                        </table>
                        
                    </div>
                </div>

                <div class="flex flex-col border border-black w-full mt-8">
                    <div class="border border-black font-bold bg-gray-300"><p class="ml-2 text-xl font-bold">Work content</p></div>
                    <div class="border border-black h-fit">
                        <div class="m-5">
                            <textarea class="w-full resize-none overflow-y-auto p-2" id="workcontent" readonly>{!! htmlspecialchars(e($data->TID_WORKCONTENT ?? '-')) !!}</textarea>
                            {{-- {!! nl2br(e($data->TID_WORKCONTENT ?? '-')) !!} --}}
                        </div>
                    </div>
                    <div class="border border-black font-bold bg-gray-300"><p class="ml-2 text-xl font-bold">Reason of Necessity</p></div>
                    <div class="border border-black h-fit">
                        <div class="m-5">
                            <textarea class="w-full resize-none overflow-y-auto p-2" id="reason" readonly>{!! htmlspecialchars(e($data->TID_REASON ?? '-')) !!}</textarea>
                            {{-- {!! nl2br(e($data->TID_REASON ?? '-')) !!} --}}
                        </div>
                    </div>
                </div>

                @if ($cextData == '03')
                    <div class="divider"></div>
                    <fieldset class="fieldset w-full md:w-fit bg-base-200 border border-base-300 p-4 rounded-box">
                        <legend class="fieldset-legend text-lg">Production Environment ID work completion report</legend>

                        <label class="fieldset-label">Completed date</label>
                        <input type="text" class="input fdate w-full validator req" name="compDate" id="compDate" placeholder="e.g. 03-04-2025" required />
                        <fieldset class="fieldset w-full">  
                            <label class="fieldset-label">Completed time</label>
                            <input type="text" class="input w-full validator req" name="compTime" id="compTime" placeholder="e.g. 08:00" required />
                        </fieldset>
                    </fieldset>
                @endif

                @if ($data->TID_COMP_DATE != null)
                    <div class="divider"></div>
                    <fieldset class="fieldset w-full md:w-fit bg-base-200 border border-base-300 p-4 rounded-box">
                        <legend class="fieldset-legend text-lg">Production Environment ID work completion report</legend>
                        <label class="fieldset-label">Completed date</label>
                        {{$data->TID_COMP_DATE}}
                        <fieldset class="fieldset w-full">  
                            <label class="fieldset-label">Completed time</label>
                            {{$data->TID_COMP_TIME}}
                        </fieldset>
                    </fieldset>
                @endif
                
                @if ($cextData == '05')
                    <div class="divider"></div>
                    <fieldset class="fieldset w-full md:w-fit bg-base-200 border border-base-300 p-4 rounded-box">
                        <legend class="fieldset-legend text-lg">Production Environment disable completion report</legend>
                        <p class="label">The requested ID has been disabled.</p>
                        <label class="input">
                            at
                            <input type="text" class="grow validator req" name="disTime" id="disTime" placeholder="e.g. 08:00" required />
                        </label>
                        <label class="input">
                            on
                            <input type="text" class="grow fdate w-full validator req" name="disDate" id="disDate" placeholder="e.g. 03-04-2025" required />
                        </label>
                    </fieldset>
                @endif
                
                @if ($data->TID_DISABLE_DATE != null)
                    <div class="divider"></div>
                    <fieldset class="fieldset w-full md:w-fit bg-base-200 border border-base-300 p-4 rounded-box">
                        <legend class="fieldset-legend text-lg">Production Environment disable completion report</legend>
                        <label class="fieldset-label">Disabled date</label>
                        {{$data->TID_DISABLE_DATE}}
                        <fieldset class="fieldset w-full">  
                            <label class="fieldset-label">Disabled time</label>
                            {{$data->TID_DISABLE_TIME}}
                        </fieldset>
                    </fieldset>
                @endif
            </form>
            {{-- <div class="card-actions flex-col gap-5 justify-start pl-6">
                <div class="my-5 hidden actions-Form ">
                    <fieldset class="fieldset">
                        <span class="fieldset-label">Remark</span>
                        <textarea class="textarea h-24 w-56" id="remark" ></textarea>
                    </fieldset>
                    <div class="flex gap-3  mt-2">
                        <button type="button" class="btn btn-primary" name="btnAction" value="approve">Approve</button>
                        <button type="button" class="btn btn-neutral mg-l-12" name="btnAction" value="reject">Reject</button>
                    </div>
                </div>
              
                <div id="flow" class="w-full">
                    <div class="flex justify-center">
                        <div class="skeleton h-32 w-[36rem]"></div>
                    </div>
                </div>
            </div> --}}
            @include('component.webflow.formAction')
        </div>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/userEnvView.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
