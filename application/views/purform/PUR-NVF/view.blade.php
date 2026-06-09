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

    .radio:disabled,
    .checkbox:disabled {
        opacity: 1;
    }

    .subject-text {
        width: 100% !important;
        white-space: pre-wrap;
        /* รักษา \r\n และ space */
        line-height: 2em;
        background-image: linear-gradient(to bottom,
                transparent 1.9em,
                #000 2em);
        background-size: 100% 2em;
    }
</style>
@endsection

@section('contents')
<div class="hidden form-info" nfrmno="{{$NFRMNO}}" vorgno="{{$VORGNO}}" cyear="{{$CYEAR}}" mode="{{$mode}}"
    cyear2="{{$mode !=1 ? $CYEAR2 : '' }}" nrunno="{{$mode !=1 ? $NRUNNO : '' }}"></div>
<div class="hidden apv-data" empno="{{$empno}}"></div>
<div class="flex flex-col w-full px-4 my-5 font-sans">
    <div class="card bg-white w-full lg:w-[70rem] place-self-center shadow-sm">
        <div class="card-body p-6 lg:p-10">
            <h2 class="card-title justify-center">
                <h1 class="text-3xl text-center text-primary font-bold mb-15">New Vendor Form</h1>
            </h2>
            <form id="form" class="flex flex-col gap-5">
                <section id="form-detail">
                </section>
                <div class="divider"></div>
                <section id="section-1">
                    <h2 class="font-bold text-xl mb-3 required">Request Details</h2>
                         <div class="mb-8 bg-gray-50 p-5 rounded-xl border border-gray-100">
                    <div class="flex flex-col md:flex-row gap-4 items-start md:items-center pb-2 w-full">
                    <span class="w-32 shrink-0 text-gray-950">Request Type</span>  
                    <div class="flex items-center gap-6 h-8">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="REQTYPE_SHOW" value="A" r-type="A" class="radio radio-xs req" disabled>
                            <span class="text-sm ">Add</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="REQTYPE_SHOW" value="U" r-type="U" class="radio radio-xs req" disabled>
                            <span class="text-sm ">Update</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="REQTYPE_SHOW" value="D" r-type="D" class="radio radio-xs req" disabled>
                            <span class="text-sm">Delete</span>
                        </label>
                    </div>
                </div> 
                <div id="row-typejob" class="flex flex-col md:flex-row gap-4 items-start md:items-center pb-2 w-full">
                    <span class="w-32 shrink-0 text-gray-950">Type of Job</span>  
                    <div class="flex items-center gap-6 h-8">
                        <div id="TYPEJOB" class="w-full"></div>
                    </div>
                </div> 
                <div id="row-service" class="flex flex-col md:flex-row gap-4 items-start md:items-center pb-2 w-full">
                    <span class="w-32 shrink-0  text-gray-950">Service</span>  
                    <div class="flex items-center gap-6 h-8">
                        <div id="SERVICE" class="w-full"></div>
                    </div>
                </div> 
                <div id="row-purpose" class="flex flex-col md:flex-row gap-4 items-start md:items-center pb-2 w-full">
                    <span class="w-32 shrink-0  text-gray-950">Purpose</span>  
                    <div class="flex items-center gap-6 h-8">
                        <div id="PURPOSE" class="w-full"></div>
                    </div>
                </div> 
                <div id="row-reason" class="flex flex-col md:flex-row gap-4 items-start md:items-center pb-2 w-full">
                    <span class="w-32 shrink-0  text-gray-950">Reason</span>  
                    <div class="flex items-center gap-6 h-8">
                        <div id="REASON" class="w-full"></div>
                    </div>
                </div>
                </div>
                </section>
                <div class="divider"></div>
                <section id="section-2">
                    <h2 class="font-bold text-xl mb-3 required">Vendor Information Detail</h2>
                    <div class="mb-8 bg-gray-50 p-5 rounded-xl border border-gray-100">
        <h3 class="text-primary font-bold   tracking-wider mb-4">Company Profile & Contact</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            <div>
                <span class="block text-xs font-medium text-gray-400 ">Company Name</span>
                <span id="COMPANY_NAME" class="text-base font-semibold text-gray-900"></span><span id="VENDOR_LOCATION_SHOW" class="badge badge-sm badge-success ml-2 text-xs"></span>
            </div>
            <div>
                <span class="block text-xs font-medium text-gray-400 ">Contact Name</span>
                <span id="CONTACT" class="text-base font-semibold text-gray-900"></span>
            </div>
            <div>
                <span class="block text-xs font-medium text-gray-400 ">Email</span>
                <span id="EMAIL" class="text-base text-gray-900"></span>
            </div>
            <div>
                <span class="block text-xs font-medium text-gray-400 ">Web site</span>
                <span id="WEBSITE" class="text-base text-gray-900"></span>
            </div>
            <div>
                <span class="block text-xs font-medium text-gray-400 ">Tel.no / Fax.no</span>
                <span id="PHONE_FAX" class="text-base text-gray-900"></span>
            </div>
        </div>
    </div>

    <div class="mb-8 bg-gray-50 p-5 rounded-xl border border-gray-100">
        <h3 class="text-primary font-bold   tracking-wider mb-4">Address Details</h3>
        <div>
            <span class="block text-xs font-medium text-gray-400  mb-1">Address (EN)</span>
            <p id="ADDRESS_EN" class="text-base text-gray-900 bg-white p-3 rounded-lg border border-gray-200 leading-relaxed">
                
            </p>
        </div>
            <div class="mb-4">
            <span class="block text-xs font-medium text-gray-400  mb-1">Address (TH)</span>
            <p id="ADDRESS_TH" class="text-base text-gray-900 bg-white p-3 rounded-lg border border-gray-200 leading-relaxed">
               
            </p>
        </div>
    </div>

    <div class="mb-8 bg-gray-50 p-5 rounded-xl border border-gray-100">
        <h3 class="text-primary font-bold   tracking-wider mb-4">Payment & Banking Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            <div>
                <span class="block text-xs font-medium text-gray-400 ">Bank Name</span>
                <span id="BANKNAME" class="text-base font-semibold text-gray-900"></span>
            </div>
            <div>
                <span class="block text-xs font-medium text-gray-400 ">Branch Name</span>
                <span id="BRANCH" class="text-base text-gray-900"></span>
            </div>
            <div>
                <span class="block text-xs font-medium text-gray-400 ">Account Number</span>
                <span id="ACCNUMBER" class="text-base font-mono font-bold text-gray-900 tracking-wider">739-2-XXXXX-X</span>
            </div>
            <div>
                <span class="block text-xs font-medium text-gray-400 ">Payment Term</span>
                <span id="PAYMENT_TERM" class="text-base font-semibold text-gray-900"></span>
            </div>
        </div>
    </div>
</section>
                <div class="divider"></div>
                <section>
                    <h2 class="font-bold text-xl mb-3 required">Attach files</h2>
                    <fieldset class="flex-col gap-2">
                        <label class="hidden attach-file" id="attach-cer">
                            <input type="checkbox" name="ATTACH_TYPE" value="Company Certification " class="checkbox checkbox-xs" a-type="cer" disabled>
                            Company Certification / Company Profile
                        </label>
                        <label class="hidden attach-file" id="attach-vat">
                            <input type="checkbox" name="ATTACH_TYPE" value="Vat Register" class="checkbox checkbox-xs" a-type="vat" disabled>
                            Vat Register
                        </label>
                        <label class="hidden attach-file" id="attach-book">
                            <input type="checkbox" name="ATTACH_TYPE" value="Book bank" class="checkbox checkbox-xs" a-type="book" disabled>
                            Book Bank
                        </label>
                                <label class="hidden attach-file flex items-center gap-2" id="attach-other">
                            <input type="checkbox" name="ATTACH_TYPE" value="Other" class="checkbox checkbox-xs" a-type="other" disabled>
                            Other
                             <div id="ATTACH_OTHER" class="subject-text"></div>
                        </label>
                    </fieldset>
                    <div id="attachFile"></div>
                </section>
                <div class="divider"></div>
                <div id="form-action-container"></div>
            </form>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script src="{{ $_ENV['APP_JS'] }}/purNvf.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection