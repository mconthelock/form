@extends('layouts/webflowTemplate')

@section('contents')
    <div class="hidden form-info" NFRMNO="{{$NFRMNO}}" VORGNO="{{$VORGNO}}" CYEAR="{{$CYEAR}}" CYEAR2="{{ $CYEAR2 }}"  NRUNNO="{{ $NRUNNO }}" mode="{{ $mode }}"></div>
    @if ($mode != '1')
        <div class="apv-data hidden" apv="{{ $empno }}"  cextData="{{ $cextData }}" firstStep="{{$firstStep}}"></div>
    @endif
    <div class="flex flex-col w-full px-4 my-5 font-sans">
        <div class="card bg-base-100 w-full lg:min-w-[70rem] place-self-center shadow-sm">
            <div class="load flex flex-col gap-5 h-screen w-full p-6">
                <div class="flex">
                    <div class="skeleton h-16 w-[70%]"></div>
                    <div class="skeleton h-16 w-[20%] ml-auto"></div>
                </div>
                <div class="flex flex-col md:flex-row gap-5 ">
                    <div class="skeleton h-72 w-full md:w-1/2"></div>
                </div>
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
                    <u class="text-3xl text-primary font-bold mb-5">Confirm sheet</u>
                    <div class="ml-auto px-2 font-bold text-2xl text-error border-3 border-error">CONFIDENTAIL</div>
                </h2>

                <div class="flex flex-col md:flex-row gap-5">
                    
                    {{-- <fieldset class="fieldset w-full md:w-1/2 bg-base-200 border border-base-300 p-4 rounded-box">
                        <legend class="fieldset-legend">Requester Information</legend>

                        <fieldset class="fieldset w-full">
                            <label class="fieldset-label">System code</label>
                            {{$data->CFS_SYSCODE}}
                            </fieldset>
                        <fieldset class="fieldset w-full">  
                            <label class="fieldset-label">System / Program name</label>
                            {{$data->CFS_SYSNAME}}
                        </fieldset>

                        <fieldset class="fieldset w-full">  
                            <label class="fieldset-label">Webflow request No.</label>
                            <label class="w-full">
                                <a href="{{$data->link}}" class="link link-primary" target="_blank"> {{$data->CFS_REQNO}}</a>
                            </label>
                        </fieldset>
                    </fieldset> --}}
                    <div class="form-info"></div>
                    <div  class="w-full md:w-fit bg-base-200 border border-base-300 p-4 rounded-box relative">
                        <div class="absolute text-lg top-[-13px] font-bold">Requester Information</div>
                        
                        <table class="table">
                            <tbody>
                                <tr>
                                    <td class="text-primary">System code:</td>
                                    <td>{{$data->CFS_SYSCODE}}</td>
                                </tr>
                                <tr>
                                    <td class="text-primary">System / Program name:</td>
                                    <td>{{$data->CFS_SYSNAME}}</td>
                                </tr>
                                
                                <tr>
                                    <td class="text-primary">Webflow request No:</td>
                                    <td><a href="{{$data->link}}" class="link link-primary" target="_blank"> {{$data->CFS_REQNO}}</a></td>
                                </tr>
                              
                            </tbody>
                        </table>
                        
                    </div>
                </div>

                <div class="flex flex-col border border-black w-full">
                    <div class="border border-black font-bold bg-gray-300"><p class="ml-2 text-xl font-bold">Work content</p></div>
                    <div class="border border-black h-fit">
                        <div class="m-5">
                            <textarea class="w-full resize-none overflow-y-auto p-2" id="workcontent" readonly>{!! htmlspecialchars(e($data->CFS_WORKCONTENT ?? '-')) !!}</textarea>
                            {{-- {!! nl2br(e($data->CFS_WORKCONTENT ?? '-')) !!} --}}
                        </div>
                    </div>
                    <div class="flex">
                        <div class="border border-black font-bold bg-gray-300 w-1/2 flex">
                            <p class="ml-2 text-xl font-bold">Before Screenshot</p>
                        </div>
                        <div class="border border-black font-bold bg-gray-300 w-1/2 flex">
                            <p class="ml-2 text-xl font-bold">Result Screenshot</p>
                        </div>
                    </div>
                    <div class="flex">
                        <div class="border border-black p-3 flex flex-col gap-3 w-1/2">
                            <div class="f-carousel overflow-hidden flex-1" id="fileBefore">
                                @foreach ($fileBefore as $fileB)
                                    <div href="{{$fileB->base64}}" class="relative f-carousel__slide flex justify-center items-center" data-fancybox="fileBefore">
                                        <img src="{{$fileB->base64}}"  class="w-1/2">
                                    </div>
                                @endforeach
                            </div>
                            <div id="navBefore" class="f-carousel navFancy">
                                @foreach ($fileBefore as $fileB)
                                    <div class="relative f-carousel__slide flex justify-center items-center w-1/12" data-fancybox="navBefore">
                                        <img src="{{$fileB->base64}}">
                                    </div>
                                @endforeach
                            </div>
                        </div>
                        <div class="border border-black p-3 flex flex-col gap-3 w-1/2">

                            <div class="f-carousel overflow-hidden flex-1" id="fileResult">
                                @foreach ($fileResult as $fileR)
                                    <div href="{{$fileR->base64}}" class="relative f-carousel__slide flex justify-center items-center" data-fancybox="fileResult">
                                        <img src="{{$fileR->base64}}"  class="w-1/2"/>
                                    </div>
                                @endforeach
                            </div>
                            <div id="navResult" class="f-carousel navFancy">
                                @foreach ($fileResult as $fileR)
                                <div class="relative f-carousel__slide flex justify-center items-center" data-fancybox="navResult">
                                    <img src="{{$fileR->base64}}"/>
                                </div>
                                @endforeach
                            </div>
                        </div>

                    </div>
                </div>
              
                @if ($mode == 1)
                    <div class="card-actions mt-3 justify-start">
                        <button type="submit" class="btn btn-primary" id="submit" name="submit">
                            <span class="loading loading-spinner hidden"></span>
                            <span>Request</span>
                        </button>
                    </div>
                @endif
            </form>
            @if ($mode != 1)
                @include('component/webflow/formAction')
            @endif
        </div>
    </div>
    @include('isform/IS-CFS/modalNewProgram')
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/confirmSheetView.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
