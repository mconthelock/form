@extends('layouts/webflowTemplate')

@section('contents')
    <div class="hidden form-info" NFRMNO="{{$NFRMNO}}" VORGNO="{{$VORGNO}}" CYEAR="{{$CYEAR}}" empno="{{$empno}}" mode="{{ $mode }}"></div>
    @if ($mode != '1')
        <div class="form-no hidden" CYEAR2="{{ $CYEAR2 }}"  NRUNNO="{{ $NRUNNO }}"></div>
        <div class="apv-data hidden" apv="{{ $empno }}"  cextData="{{ $cextData }}" firstStep="{{$firstStep}}"></div>
    @endif
    <div class="flex flex-col w-full px-4 my-5 font-sans">
        <div class="card bg-base-100 w-full lg:w-[70rem] place-self-center shadow-sm">
            <div class="load flex flex-col gap-5 h-screen w-full p-6">
                <div class="flex">
                    <div class="skeleton h-16 w-[70%]"></div>
                    <div class="skeleton h-16 w-[20%] ml-auto"></div>
                </div>
                <div class="flex flex-col md:flex-row gap-5 ">
                    <div class="skeleton h-72 w-full md:w-1/2"></div>
                </div>
                <div class="skeleton h-[80%] w-full"></div>
                <div class="skeleton h-20 w-24"></div>

            </div>
            <form href="#" class="card-body hidden" id="form">
                <h2 class="card-title">
                    <u class="text-3xl text-primary font-bold mb-5">Confirm sheet</u>
                    <div class="ml-auto px-2 font-bold text-2xl text-error border-3 border-error">CONFIDENTAIL</div>
                </h2>

                <div class="flex flex-col md:flex-row gap-5">
                    <fieldset class="fieldset w-full md:w-1/2 bg-base-200 border border-base-300 p-4 rounded-box">
                        <legend class="fieldset-legend text-sm">Requester Information</legend>

                        <fieldset class="fieldset w-full">
                            <label class="fieldset-label">System code</label>
                            <div class="join">
                                <select class="select validator req w-full" name="sysCode" id="sysCode" placeholder="Select System code">
                                    <option value=''></option>
                                    @foreach ($program as $p)
                                        <option value='{{$p->SYSCODE}}' data-name='{{$p->PROMNAME}}' data-id='{{$p->PROMID}}' data-type="{{$p->PROTID}}" data-code="{{$p->DIVCODE}}">{{$p->TITLE}}</option>
                                    @endforeach
                                </select>
                                <label for="newProgram" class="btn btn-neutral">+New</label>
                            </div>
                            </fieldset>
                        <fieldset class="fieldset w-full">  
                            <label class="fieldset-label">System / Program name</label>
                            <input type="text" class="input fdate w-full validator req" name="sysName" id="sysName" placeholder="e.g. SCM" required readonly />
                        </fieldset>

                        <fieldset class="fieldset w-full">  
                            <label class="fieldset-label">Webflow request No.</label>
                            <label class="input w-full">
                                <input type="text" class="ghost txt-upper validator w-full req" name="reqNo" id="reqNo" placeholder="e.g. IS-DEV25-000127" required pattern="[A-Za-z]+-[a-zA-Z0-9]+-[0-9]+$" autocomplete="off"/>
                                <span class="loading loading-spinner text-primary absolute top-1/2 right-16 -translate-y-1/2 hidden"></span>
                                <span class="badge badge-neutral badge-xs">Enter</span>
                            </label>
                        </fieldset>
                    </fieldset>
                </div>

                <div class="flex flex-col border border-black w-full">
                    <div class="border border-black font-bold bg-gray-300"><p class="ml-2 text-xl font-bold">Work content</p></div>
                    <div class="border border-black h-fit">
                        <textarea name="workCon" id="workCon" class="w-full h-96 textarea req" placeholder="e.g. Update buyer's manager to be user '12306M" required></textarea>
                    </div>
                    <div class="flex">
                        <div class="border border-black font-bold bg-gray-300 w-1/2 flex">
                            <p class="ml-2 text-xl font-bold">Before Screenshot</p>
                            <button class="btn btn-error btn-sm ml-auto drop-reset rounded-none" data-for="fileBefore[]">Reset</button>
                        </div>
                        <div class="border border-black font-bold bg-gray-300 w-1/2 flex">
                            <p class="ml-2 text-xl font-bold">Result Screenshot</p>
                            <button class="btn btn-error btn-sm ml-auto drop-reset rounded-none" data-for="fileResult[]">Reset</button>
                        </div>

                    </div>
                    <div class="flex h-72">
                        <div class="border border-black p-3 flex gap-3 w-1/2">
                            <label for="fileBefore[]" class="border border-primary border-dashed rounded-lg overflow-y-scroll w-full min-h-60 text-primary cursor-pointer dropZone">
                                <div class="drop-message flex flex-col justify-center items-center h-full">
                                    <span>Drag & Drop files here or click to select</span>
                                </div>
                                <ui class="drop-list w-full flex-col items-start text-gray-500 hidden p-1 gap"></ui>
                            </label>
                            <input type="file" class="file-input txt-upper validator req hidden" data-format="IPE" name="fileBefore[]" id="fileBefore[]" multiple/>
                        </div>
                        <div class="border border-black  p-3 flex gap-3 w-1/2">
                            <label for="fileResult[]" class="border border-primary border-dashed rounded-lg overflow-y-scroll w-full min-h-60 text-primary cursor-pointer dropZone">
                                <div class="drop-message flex flex-col justify-center items-center h-full">
                                    <span>Drag & Drop files here or click to select</span>
                                </div>
                                <ui class="drop-list w-full flex-col items-start text-gray-500 hidden p-1 gap"></ui>
                            </label>
                            <input type="file" class="file-input txt-upper validator req hidden" data-format="IPE" name="fileResult[]" id="fileResult[]" multiple/>
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
    <script src="{{ $_ENV['APP_JS'] }}/confirmSheet.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
