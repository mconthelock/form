@extends('layouts/webflowTemplate')

@section('contents')
    <div class="hidden form-info" NFRMNO="{{$NFRMNO}}" VORGNO="{{$VORGNO}}" CYEAR="{{$CYEAR}}"></div>
    <div class="flex flex-col w-full px-4 my-5 font-sans">
        <div class="card bg-base-100 w-full lg:w-[70rem] place-self-center shadow-sm">
            <div class="load flex flex-col gap-5 h-screen w-full p-6">
                <div class="flex">
                    <div class="skeleton h-16 w-[70%]"></div>
                    <div class="skeleton h-16 w-[20%] ml-auto"></div>
                </div>
                <div class="flex flex-col md:flex-row gap-5 ">
                    <div class="skeleton h-72 w-full md:w-1/2"></div>
                    <div class="skeleton h-72 w-full md:w-1/2"></div>
                </div>
                <div class="skeleton h-[80%] w-full"></div>
                <div class="skeleton h-20 w-24"></div>

            </div>
            <form href="#" class="card-body hidden" id="form">
                <h2 class="card-title">
                    <u class="text-3xl text-primary font-bold mb-5">Production Environment ID temporary use request</u>
                    <div class="ml-auto px-2 font-bold text-2xl text-error border-3 border-error">CONFIDENTAIL</div>
                </h2>

                <div class="flex flex-col md:flex-row gap-5">
                    <fieldset class="fieldset w-full md:w-1/2 bg-base-200 border border-base-300 p-4 rounded-box">
                        <legend class="fieldset-legend text-sm">Requester Information</legend>

                        <label class="fieldset-label">Requester</label>
                        <input type="text" class="input w-full txt-upper validator req" name="requester" id="requester" placeholder="e.g. 12069" required pattern="[A-Z0-9]*" autocomplete="off" />
                        {{-- <p class="validator-hint">กรอกเฉพาะตัวอักษร A-Z และ 0-9 เท่านั้น </p> --}}
                        <fieldset class="fieldset w-full">
                            <label class="fieldset-label">Requester date</label>
                            <input type="text" class="input fdate w-full validator req" name="reqDate" id="reqDate" placeholder="e.g. 03-04-2025" required autocomplete="off"/>
                        </fieldset>
                        {{-- <p class="validator-hint">กรุณาเลือกวันที่</p> --}}

                        <div class="flex gap-5">
                            <fieldset class="fieldset w-full">
                                <label class="fieldset-label">Usage period</label>
                                <div class="flex gap-2">
                                    <input type="text" class="input validator req" name="pStart" id="pStart" placeholder="e.g. 08:00" required autocomplete="off"/>
                                    <div class="self-end pb-3">-</div>
                                    <input type="text" class="input validator req" name="pEnd" id="pEnd" placeholder="e.g. 10:00" required autocomplete="off"/>
                                </div>
                            </fieldset>
                        </div>
                    </fieldset>
                    <fieldset class="fieldset w-full md:w-1/2 bg-base-200 border border-base-300 p-4 rounded-box">
                        <legend class="fieldset-legend text-sm">Access Request Details</legend>
                        <label class="fieldset-label">Form type</label>
                        <div class="join">
                            <input class="join-item btn" type="radio" name="formType" value="1" aria-label="without controller" />
                            <input class="join-item btn" type="radio" name="formType" value="2" aria-label="with controller" />
                        </div>
                        {{-- <label class="fieldset-label">Webflow request No.</label>
                        <label class="input">
                            <input type="text" class="input txt-upper validator w-full req" name="reqNo" id="reqNo" placeholder="e.g. IS-DEV25-000127" required pattern="[A-Za-z]+-[a-zA-Z0-9]+-[0-9]+$" />
                            <span class="badge badge-neutral badge-xs">Enter</span>
                        </label> --}}
                        <fieldset class="fieldset w-full">
                            <label class="fieldset-label">Webflow request No.</label>
                            <div class="flex gap-1">
                                <div class="flex flex-col flex-1 inputGroup gap-1 w-full">
                                    <div class="relative w-full">
                                        <input type="text" class="input txt-upper validator w-full req" name="reqNo[]" id="reqNo[]" data-check="0" placeholder="e.g. IS-DEV25-000127" required pattern="[A-Za-z]+-[a-zA-Z0-9]+-\d{6}$" autocomplete="off"/>
                                        <span class="loading loading-spinner text-primary absolute top-1/2 right-16 -translate-y-1/2 hidden"></span>
                                        <span class="badge badge-neutral badge-xs absolute top-1/2 right-2 -translate-y-1/2">Enter</span>
                                    </div>
                                </div>
                                <div class="flex flex-col justify-end">
                                    <i class="icofont-minus-square text-[2.5rem] hover:text-gray-400 hover:scale-105 remove-input hidden"></i>
                                    <i class="icofont-plus-square text-[2.5rem]  hover:text-gray-400 hover:scale-105 add-input"></i>
                                </div>
                            </div>
                        </fieldset>
                        {{-- <p class="validator-hint">กรอกเฉพาะตัวอักษร a-z, A-Z, 0-9 และ - </p> --}}

                        <fieldset class="fieldset changeData hidden">
                            <label class="fieldset-label">
                                <input type="checkbox" class="checkbox checked:checkbox-primary" id="changeData" name="changeData" />
                                Change Data
                            </label>
                        </fieldset>
                        <div class="flex gap-5 w-full">
                            <fieldset class="fieldset w-1/2">
                                <label class="fieldset-label">Server name</label>
                                <select class="select validator req" name="serverName" id="serverName" placeholder="Select Server Name" disabled>
                                    <option value=''></option>
                                    @foreach ($serverName as $s)
                                        <option value='{{$s->SERVER_NAME}}'>{{$s->SERVER_NAME}}</option>
                                    @endforeach
                                </select>
                                {{-- <input type="text" class="input validator" name="serverName" id="serverName" placeholder="e.g. SCMDB" required /> --}}
                            </fieldset>
                            <fieldset class="fieldset w-1/2">
                                <label class="fieldset-label">Production User ID</label>
                                <select class="select validator req" name="userID" id="userID" placeholder="Select User ID" disabled>
                                    <option value=''></option>
                                </select>
                                {{-- <input type="text" class="input validator req" name="userID" id="userID" placeholder="e.g. DEV06" required /> --}}
                            </fieldset>
                        </div>
                        <div class="divCon w-full hidden">
                            <fieldset class="fieldset">
                                <label class="fieldset-label">Controller</label>
                                <select class="select validator w-full" name="controller" id="controller" placeholder="Select Controller" style="width: 100%;" disabled>
                                    <option value=''></option>
                                </select>
                            </fieldset>
                        </div>
                        {{-- <input type="text" class="input w-full" name="controller" id="controller" placeholder="e.g. SYSDBA" /> --}}
                    </fieldset>
                </div>

                <div class="flex flex-col border border-black w-full">
                    <div class="border border-black font-bold bg-gray-300">
                        <p class="ml-2 text-xl font-bold">Work content</p>
                    </div>
                    <div class="border border-black h-fit">
                        <textarea name="workCon" id="workCon" class="w-full h-96 textarea req" placeholder="e.g. Request to upload data of file J001KP/field J1NSCS(NEW STD. COST). We will send data to you by e-mail on Mar.31'25 before noon." required></textarea>
                    </div>
                    <div class="border border-black font-bold bg-gray-300">
                        <p class="ml-2 text-xl font-bold">Reason of Necessity</p>
                    </div>
                    <div class="border border-black h-fit">
                        <textarea name="reason" id="reason" class="w-full h-60 textarea" placeholder="e.g. Remark"></textarea>
                    </div>
                </div>



                <div class="card-actions mt-3 justify-start">
                    <button type="submit" class="btn btn-primary" id="submit" name="submit">
                        <span class="loading loading-spinner hidden"></span>
                        <span>Request</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/userEnv.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection