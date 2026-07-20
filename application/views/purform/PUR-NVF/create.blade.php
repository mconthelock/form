@extends('layouts/webflowTemplate')

@section('styles')
<style>
    section {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    fieldset:not(:has(.fieldset-label)) {
        display: flex;
    }

    fieldset span {
        font-weight: bold;
        white-space: nowrap;
        width: fit-content;
    }

    label:not(:has(input[name="DELIVELY"])):not(:has(input[name="FORM_TYPE"])) {
        width: 100%;
    }

    span.required::after, h2.required::after {
        content: "**";
        color: red;
        font-weight: bold;
        padding-left: 0.25rem;
    }
    





</style>
@endsection

@section('contents')
<div class="hidden form-info" nfrmno="{{$NFRMNO}}" vorgno="{{$VORGNO}}" cyear="{{$CYEAR}}" mode="{{$mode}}"
    cyear2="{{$mode !=1 ? $CYEAR2 : '' }}" nrunno="{{$mode !=1 ? $NRUNNO : '' }}" return="{{$return ?? ''}}"></div>
<div class="hidden apv-data" empno="{{$empno}}"></div>
<!-- Form Container -->
<div class="flex flex-col w-full px-4 my-5 font-sans">
    <div class="card bg-white w-full lg:w-[70rem] place-self-center shadow-sm">
        <div class="card-body p-6 lg:p-10">
            <h1 class="text-3xl text-center text-primary font-bold mb-10">New Vendor Requisition</h1>
            
            <form id="form" class="flex flex-col gap-5">
                <!-- Section 0: Basic Info & Request Type -->
                <section id="section-0" class="flex flex-col gap-4">
                    <div class="flex items-center gap-4">
                        <span class="w-32 shrink-0 font-semibold">Input by</span>
                        <input type="text" name="INPUTBY" id="INPUTBY" class="input input-sm w-48" value="{{$empno}}" readonly>
                    </div>

                    <div class="flex items-center gap-4">
                        <span class="w-32 shrink-0 font-semibold">Request by</span>
                        <input type="text" name="REQBY" id="REQBY" class="input input-sm w-48 req" value="{{$empno}}">
                    </div>

                    <div class="flex items-center gap-4">
                        <span class="w-32 shrink-0 font-semibold">Request Type <span class="text-red-500">*</span></span>
                        <div class="flex gap-6">
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="REQTYPE_SHOW" value="A" class="radio radio-xs req"> Add
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="REQTYPE_SHOW" value="U" class="radio radio-xs req"> Update
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="REQTYPE_SHOW" value="D" class="radio radio-xs req"> Delete
                            </label>
                        </div>
                    </div>
                </section>

                <!-- Dynamic Sections (Hidden by Default, triggered by JS) -->
                <div id="U-section" class="hidden"><section id="section-4">
                    <span class="font-semibold">Vendor Code</span> <input type="text" name="VENDORCODE" class="input input-sm w-48">
                </section></div>

                <div id="A-section" class="hidden">
                    <div class="divider"></div>
                    <section id="section-1">
                        <div class="flex flex-col gap-2 mb-4">
                            <span class="font-semibold">Type of Job</span>
                            <textarea name="TYPEJOB" class="textarea w-full req" placeholder="1. IT System Integration..."></textarea>
                        </div>
                        <div class="flex flex-col gap-2 mb-4">
                            <span class="font-semibold">Service</span>
                            <textarea name="SERVICE" class="textarea w-full req"></textarea>
                        </div>
                        <div class="flex flex-col gap-2">
                            <span class="font-semibold">Purpose</span>
                            <textarea name="PURPOSE" class="textarea w-full req"></textarea>
                        </div>
                    </section>
                </div>

                <!-- Section: Vendor Detail (V-section) -->
                <div id="V-section" class="hidden">
                    <div class="divider"></div>
                    <section id="section-2">
                        <h2 class="font-bold text-xl mb-4">Vendor Information Detail</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="font-semibold">Company Name</label>
                                <input type="text" name="COMPANY_NAME" class="input input-sm w-full req">
                            </div>
                            <div class="flex items-center gap-4">
                                <label><input type="radio" name="VENDOR_LOCATION_SHOW" value="Local" class="radio radio-xs"> Local</label>
                                <label><input type="radio" name="VENDOR_LOCATION_SHOW" value="Oversea" class="radio radio-xs"> Oversea</label>
                                <select name="COUNTRY_SELECT" id="COUNTRY_SELECT" class="select select-bordered select-sm w-full" disabled>
                                    <option value="">-- Select Country --</option>
                                </select>
                            </div>
                        </div>
                        <!-- Add Address and Contact fields here... -->
                    </section>
                </div>

                <div id="form-action-container"></div>
            </form>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/purNvf.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection