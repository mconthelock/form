@extends('layouts/webflowTemplate')

@section('contents')
<div class="hidden form-info" nfrmno="{{$NFRMNO}}" vorgno="{{$VORGNO}}" cyear="{{$CYEAR}}" mode="{{ $mode }}"></div>
<div class="apv-data hidden" apv="{{ $apv }}"></div>
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
                    <div class="flex w-full gap-5">
                        <fieldset class="w-1/2">
                            <label class="fieldset-label whitespace-nowrap">Input by</label>
                            <input type="text" class="input w-full txt-upper validator bg-base-200 cursor-not-allowed"
                                name="INPUTBY" id="INPUTBY" value="{{$apv}}" readonly />
                        </fieldset>
                        <fieldset class="w-1/2">
                            <label class="fieldset-label whitespace-nowrap">Requester</label>
                            <input type="text" class="input w-full txt-upper validator req" name="REQBY"
                                id="REQBY" placeholder="e.g. 12069" required pattern="[A-Z0-9]*"
                                autocomplete="off" />
                        </fieldset>
                    </div>
                    {{-- <p class="validator-hint">กรอกเฉพาะตัวอักษร A-Z และ 0-9 เท่านั้น </p> --}}
                    <fieldset class="fieldset w-full">
                        <label class="fieldset-label">Requester date</label>
                        <input type="text" class="input fdate w-full validator req" name="reqDate" id="reqDate"
                            placeholder="e.g. 03-04-2025" required autocomplete="off" />
                    </fieldset>
                    {{-- <p class="validator-hint">กรุณาเลือกวันที่</p> --}}

                    <div class="flex gap-5">
                        <fieldset class="fieldset w-full">
                            <label class="fieldset-label">Usage period</label>
                            <div class="flex gap-2">
                                <input type="text" class="input validator req" name="pStart" id="pStart"
                                    placeholder="e.g. 08:00" required autocomplete="off" />
                                <div class="self-end pb-3">-</div>
                                <input type="text" class="input validator req" name="pEnd" id="pEnd"
                                    placeholder="e.g. 10:00" required autocomplete="off" />
                            </div>
                        </fieldset>
                    </div>
                </fieldset>
                <fieldset class="fieldset w-full md:w-1/2 bg-base-200 border border-base-300 p-4 rounded-box">
                    <legend class="fieldset-legend text-sm">Access Request Details</legend>
                    <label class="fieldset-label">Form type</label>
                    <div class="join">
                        <input class="join-item btn" type="radio" name="formType" value="1"
                            aria-label="without controller" />
                        <input class="join-item btn" type="radio" name="formType" value="2"
                            aria-label="with controller" />
                    </div>
                    <fieldset class="fieldset w-full">
                        <label class="fieldset-label">Webflow request No.<i class="icofont-question-circle tooltip" data-html="
                            <div class='flex flex-col gap-2 p-2'>
                                <span class='font-bold'>
                                    Supported formats (รูปแบบที่รองรับ)
                                </span>
                                <ul class='list-disc list-inside'>
                                    <li>
                                        25-1 → IS-DEV25-000001
                                    </li>

                                    <li>
                                        25-000001 → IS-DEV25-000001
                                    </li>
                                    <li>
                                        IS-DEV25-000127
                                    </li>
                                </ul>
                            </div>
                            "></i></label>
                        <div class="flex gap-1">
                            <div class="flex flex-col flex-1 inputGroup gap-1 w-full">
                                <div class="relative w-full">
                                    <input type="text" class="input txt-upper w-full" name="reqNo"
                                        id="reqNo" data-check="0" placeholder="e.g. IS-DEV25-000127" required
                                        pattern="[A-Za-z]+-[a-zA-Z0-9]+-\d{6}$" autocomplete="off" />
                                    <span
                                        class="loading loading-spinner text-primary absolute top-1/2 right-16 -translate-y-1/2 hidden"></span>
                                    <span
                                        class="badge badge-neutral badge-xs absolute top-1/2 right-2 -translate-y-1/2">Enter</span>
                                </div>
                            </div>
                        </div>
                    </fieldset>
                    <fieldset id="reqNo-container" class="bg-base-300 p-4 rounded-lg">
                        <div class="flex flex-wrap gap-2" id="reqNo-list">
                            <span class="text-gray-500">Request number is not provided (ยังไม่มีเลขที่คำร้อง)</span>
                        </div>
                    </fieldset>

                    <fieldset class="fieldset hidden" id="late-container">
                        <label class="fieldset-label">
                            <input type="checkbox" class="checkbox checked:checkbox-primary" id="late" name="late" />
                            Late
                        </label>
                    </fieldset>

                    <fieldset class="fieldset hidden" id="changeData-container">
                        <label class="fieldset-label">
                            <input type="checkbox" class="checkbox checked:checkbox-primary" id="changeData"
                                name="changeData" />
                            Change Data
                        </label>
                    </fieldset>
                    <div class="flex gap-5 w-full">
                        <fieldset class="fieldset w-1/2">
                            <label class="fieldset-label">Server name</label>
                            <select class="select validator req" name="serverName" id="serverName"
                                placeholder="Select Server Name" disabled>
                            </select>
                        </fieldset>
                        <fieldset class="fieldset w-1/2">
                            <label class="fieldset-label">Production User ID</label>
                            <select class="select validator req" name="userID" id="userID" placeholder="Select User ID"
                                disabled>
                            </select>
                        </fieldset>
                    </div>
                    <div class="w-full hidden" id="controller-container">
                        <fieldset class="fieldset">
                            <label class="fieldset-label">Controller</label>
                            <select class="select validator w-full" name="controller" id="controller"
                                placeholder="Select Controller" style="width: 100%;" disabled>
                            </select>
                        </fieldset>
                    </div>
                </fieldset>
            </div>

            <div class="flex flex-col border border-black w-full">
                <div class="border border-black font-bold bg-gray-300">
                    <p class="ml-2 text-xl font-bold">Work content</p>
                </div>
                <div class="border border-black h-fit">
                    <textarea name="workCon" id="workCon" class="w-full h-96 textarea autosize req"
                        placeholder="e.g. Request to upload data of file J001KP/field J1NSCS(NEW STD. COST). We will send data to you by e-mail on Mar.31'25 before noon."
                        required></textarea>
                </div>
                <div class="border border-black font-bold bg-gray-300">
                    <p class="ml-2 text-xl font-bold">Reason of Necessity</p>
                </div>
                <div class="border border-black h-fit">
                    <textarea name="reason" id="reason" class="w-full h-60 textarea autosize"
                        placeholder="e.g. Remark"></textarea>
                </div>
            </div>


            <div class="form-action-container"></div>
            {{-- <div class="card-actions mt-3 justify-start">
                <button type="submit" class="btn btn-primary" id="submit" name="submit">
                    <span class="loading loading-spinner hidden"></span>
                    <span>Request</span>
                </button>
            </div> --}}
        </form>
    </div>
</div>
@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/userEnv.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection