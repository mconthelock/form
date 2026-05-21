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
<div class="flex flex-col w-full px-4 my-5 font-sans">
    <div class="card bg-white w-full lg:w-[70rem] place-self-center shadow-sm">
        <div class="card-body p-6 lg:p-10">
            <h2 class="card-title justify-center">
                <h1 class="text-3xl text-center text-primary font-bold mb-15">New Vendor Form</h1>
            </h2>
            <form id="form" class="flex flex-col gap-5">
                <section id="form-detail">
                </section>
                    <section id="section-0" class="flex flex-col gap-4"> <div class="flex items-center gap-4">
                        <span class="w-32 shrink-0 font-semibold">Input by</span>
                        <label>
                            <input type="text" name="INPUTBY" id="INPUTBY" class="input input-sm w-40" value="{{$empno}}" readonly>
                        </label>
                    </div>

                    <div class="flex items-center gap-4">
                        <span class="required w-32 shrink-0 font-semibold">Request by</span>
                        <label>
                            <input type="text" name="REQBY" id="REQBY" class="input input-sm w-40 req">
                        </label>
                    </div>

                </section>
                <div class="divider"></div>
                <section id="section-1">
                    <div class="flex items-start gap-4 mb-4">
                        <span class="required w-32 shrink-0 pt-2 font-semibold">Type of Job</span>
                        
                        <label class="flex-1">
                            <textarea name="TYPEJOB" id="TYPEJOB" maxlength="512" class="textarea w-full req" placeholder="1.IT System Integration(SI) 2. Infastructure & security solutions"></textarea>
                        </label>
                    </div>
                    <div class="flex items-start gap-4 mb-4">
                        <span class="required w-32 shrink-0 pt-2 font-semibold">Service</span>
                        
                        <label class="flex-1">
                            <textarea name="SERVICE" id="SERVICE" rows="6" maxlength="512" class="textarea w-full req" placeholder="1) IT System Integration & Network Infrastructure:Providing comprehensive design, installation, and maintenance of IT systems and network structures.&#10;2) Data Center Infrastructure Solutions: Design, installation, and managment of sercer rooms, including racking, cooling&#10;systems, and power backup (UPS).&#10;3) Integrated CCTV & Surveillance Systems: Provision of end-toend security monitoring solutions, encompassing camera&#10;deployment and network recording setup."></textarea>
                        </label>
                    </div>
                    <div class="flex items-start gap-4">
                        <span class="required w-32 shrink-0 pt-2 font-semibold">Purpose</span>
                        
                        <label class="flex-1">
                            <textarea name="PURPOSE" id="PURPOSE" rows="5" maxlength="1000" class="textarea w-full req" placeholder="To register the winning bidder for the Network Installation of Wireless Access Points project."></textarea>
                        </label>
                    </div>
                </section>
                <div class="divider"></div>
                <section id="section-2">
                  <h2 class="font-bold text-xl mb-3 required">Vendor Information Detail </h2>
                    <div class="flex flex-col md:flex-row gap-4 mb-4 items-start">
                        <!-- ฝั่งซ้าย: กล่องกรอก Company Name (กินพื้นที่ครึ่งหนึ่ง w-full md:w-1/2) -->
                        <div class="flex items-start gap-4 w-full md:w-1/2">
                            <span class="required w-32 shrink-0 pt-2 font-semibold">Company name</span>
                            <label class="flex-1">
                                <input type="text" name="COMPANY_NAME" id="COMPANY_NAME" class="input input-sm w-full req">
                            </label>
                        </div>
                        
                        <!-- ฝั่งขวา: ตัวเลือกประเภทพ (Local / Oversea) -->
                        <div class="flex items-center gap-6 h-8 pl-4 md:pl-0 pt-1 md:pt-2">
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="VENDOR_LOCATION" value="Local" v-type="local" class="radio radio-xs req" >
                                <span class="text-sm font-medium">Local</span>
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="VENDOR_LOCATION" value="Oversea" v-type="oversea"  class="radio radio-xs req">
                                <span class="text-sm font-medium">Oversea</span>
                            </label>
                        </div>
                    </div>
                     <div class="flex items-start gap-4 mb-4">
                        <span class="required w-32 shrink-0 pt-2 font-semibold">Address</span>
                        
                        <label class="flex-1">
                            <textarea name="COMPANY_ADDRESS" id="COMPANY_ADDRESS" rows="3" maxlength="1000" class="textarea w-full req" placeholder="43/86 The Gallery & Natury Trend Village, Moo 16"></textarea>
                        </label>
                    </div>
                    <div class="flex items-start gap-4 mb-4  w-1/2">
                        <span class="required w-32 shrink-0 pt-2 font-semibold">Contact name</span>
                        <label>
                            <input type="text" name="CONTACT_NAME" id="CONTACT_NAME" class="input input-sm w-full req">
                        </label>
                    </div>
                    <div class="flex flex-col md:flex-row gap-4 mb-4">
                        <!-- Email -->
                        <div class="flex items-start gap-4 w-full md:w-1/2">
                            <span class="required w-32 shrink-0 pt-2 font-semibold">Email</span>
                            <label class="flex-1">
                                <input type="text" name="EMAIL" id="EMAIL" class="input input-sm w-full req">
                            </label>
                        </div>
                        <!-- Web site -->
                        <div class="flex items-start gap-4 w-full md:w-1/2">
                            <span class="required w-32 shrink-0 pt-2 font-semibold">Web site</span>
                            <label class="flex-1">
                                <input type="text" name="WEBSITE" id="WEBSITE" class="input input-sm w-full req">
                            </label>
                        </div>
                    </div>
                    <div class="flex flex-col md:flex-row gap-4 mb-4">
                        <!-- Tel.no -->
                        <div class="flex items-start gap-4 w-full md:w-1/2">
                            <span class="required w-32 shrink-0 pt-2 font-semibold">Tel.no</span>
                            <label class="flex-1">
                                <input type="text" name="TELEPHONE" id="TELEPHONE" class="input input-sm w-full req">
                            </label>
                        </div>
                        <!-- Fax.no -->
                        <div class="flex items-start gap-4 w-full md:w-1/2">
                            <span class="w-32 shrink-0 pt-2 font-semibold">Fax.no</span>
                            <label class="flex-1">
                                <input type="text" name="FAX" id="FAX" class="input input-sm w-full">
                            </label>
                        </div>
                    </div>
                    <div class="flex flex-col md:flex-row gap-4 mb-4">
                        <!-- Bank name -->
                        <div class="flex items-start gap-4 w-full md:w-1/2">
                            <span class="required w-32 shrink-0 pt-2 font-semibold">Bank name</span>
                            <label class="flex-1">
                                <input type="text" name="BANK_NAME" id="BANK_NAME" class="input input-sm w-full req">
                            </label>
                        </div>
                        <!-- Branch name -->
                        <div class="flex items-start gap-4 w-full md:w-1/2">
                            <span class="required w-32 shrink-0 pt-2 font-semibold">Branch name</span>
                            <label class="flex-1">
                                <input type="text" name="BRANCH_NAME" id="BRANCH_NAME" class="input input-sm w-full req">
                            </label>
                        </div>
                    </div>
                    <div class="flex items-start gap-4 mb-4  w-1/2">
                        <span class="required w-32 shrink-0 pt-2 font-semibold">Account number</span>
                        <label>
                            <input type="text" name="ACCOUNT_NUMBER" id="ACCOUNT_NUMBER" class="input input-sm w-full req">
                        </label>
                    </div>
                    <div class="flex items-start gap-4 mb-4  w-1/2">
                        <span class="required w-32 shrink-0 pt-2 font-semibold">Payment Term</span>
                        <label>
                                 <select id="TERM_PAYMENT" class="select select-sm w-fit min-w-16 term-payment req">
                                     <option value="" disabled selected>Select Payment Term</option>
                                     <option value="Cash">Cash</option>
                                     <option value="Credit">Credit</option>
                                    </select>
                        </label>
                    </div>
                </section>
                <div class="divider"></div>
                <section id="section-3" >
                    
                    <h2 class="font-bold text-xl mb-3 required">Attach files</h2>
                    <fieldset class="flex-col gap-2">
                        <label class="hidden attach-file" id="attach-cer">
                            <input type="checkbox" name="ATTACH_TYPE" value="Company Certification " class="checkbox checkbox-xs" a-type="cer">
                            Company Certification / Company Profile
                        </label>
                        <label class="hidden attach-file" id="attach-vat">
                            <input type="checkbox" name="ATTACH_TYPE" value="Vat Register" class="checkbox checkbox-xs" a-type="vat">
                            Vat Register
                        </label>
                        <label class="hidden attach-file" id="attach-book">
                            <input type="checkbox" name="ATTACH_TYPE" value="Book bank" class="checkbox checkbox-xs" a-type="book">
                            Book Bank
                        </label>
                        <label class="hidden attach-file flex items-center gap-2" id="attach-other">
                            <input type="checkbox" name="ATTACH_TYPE" value="Other" class="checkbox checkbox-xs" a-type="other">
                            Other
                            <input type="text" name="ATTACH_OTHER" id="ATTACH_OTHER" class="input input-sm w-full" disabled>
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