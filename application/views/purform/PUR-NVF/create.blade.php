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
                <h1 class="text-3xl text-center text-primary font-bold mb-15">New Vendor Requisition</h1>
            </h2>
            <form id="form" class="flex flex-col gap-5">
                <section id="section-0" class="flex flex-col gap-4"> 
                    <div class="flex items-center gap-4">
                                    <span class="w-32 shrink-0 font-semibold">Input by</span>
                                    <label>
                                        <input type="text" name="INPUTBY" id="INPUTBY" class="input input-sm w-48" value="{{$empno}}" readonly>
                                    </label>
                                </div>

                                <div class="flex items-center gap-4">
                                    <span class="required w-32 shrink-0 font-semibold">Request by</span>
                                    <label>
                                        <input type="text" name="REQBY" id="REQBY" class="input input-sm w-48 req" value="{{$empno}}" >
                                    </label>
                                </div>
                        <div class="flex flex-col md:flex-row gap-4 items-start md:items-center  pb-2">
                <span class="w-32 shrink-0 font-semibold text-gray-950">Request Type <span class="text-red-500">**</span></span>  
                <div class="flex flex-row items-center gap-6 h-8 overflow-x-auto whitespace-nowrap">
                        <input type="hidden" name="REQTYPE" id="REQTYPE"  />
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="REQTYPE_SHOW" value="A" r-type="A" class="radio radio-xs req" >
                            <span class="text-sm  font-semibold">Add</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="REQTYPE_SHOW" value="U" r-type="U" class="radio radio-xs req">
                            <span class="text-sm font-semibold">Update</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="REQTYPE_SHOW" value="D" r-type="D" class="radio radio-xs req">
                            <span class="text-sm font-semibold">Delete</span>
                        </label>
                    </div>
                    </div>
                    <div id="U-section" class="hidden">
                    <section id="section-4">
                        <div class="flex items-center gap-4">
                            <span class="w-32 shrink-0 font-semibold">Vendor Code</span>
                            <label>
                                <input type="text" name="VENDORCODE" id="VENDORCODE" class="input input-sm w-48" value="" >
                            </label>
                        </div>
                    </section>  
                </div>
            </section>
            <div id="A-section" class="hidden">
            <div class="divider"></div>
            <section id="section-1">
                    <div class="flex items-start gap-4 mb-4">
                        <span class="required w-32 shrink-0 pt-2 font-semibold">Type of Job</span>
                        
                        <label class="flex-1">
                            <textarea name="TYPEJOB" id="TYPEJOB" maxlength="1000" class="textarea w-full req" placeholder="1.IT System Integration(SI) 2. Infastructure & security solutions"></textarea>
                        </label>
                    </div>
                    <div class="flex items-start gap-4 mb-4">
                        <span class="required w-32 shrink-0 pt-2 font-semibold">Service</span>
                        
                        <label class="flex-1">
                            <textarea name="SERVICE" id="SERVICE" rows="6" maxlength="1000" class="textarea w-full req" placeholder="1) IT System Integration & Network Infrastructure:Providing comprehensive design, installation, and maintenance of IT systems and network structures.&#10;2) Data Center Infrastructure Solutions: Design, installation, and managment of sercer rooms, including racking, cooling&#10;systems, and power backup (UPS).&#10;3) Integrated CCTV & Surveillance Systems: Provision of end-toend security monitoring solutions, encompassing camera&#10;deployment and network recording setup."></textarea>
                        </label>
                    </div>
                    <div class="flex items-start gap-4">
                        <span class="required w-32 shrink-0 pt-2 font-semibold">Purpose</span>
                        
                        <label class="flex-1">
                            <textarea name="PURPOSE" id="PURPOSE" rows="5" maxlength="1000" class="textarea w-full req" placeholder="To register the winning bidder for the Network Installation of Wireless Access Points project."></textarea>
                        </label>
                    </div>
                </section>
            </div>
            <div id="D-section" class="hidden">
                  <div class="divider"></div>
                    <section id="section-5">
                     <div class="flex items-start gap-4 mb-4">
                        <span class="required w-32 shrink-0 pt-2 font-semibold">Reason</span>
                        
                        <label class="flex-1">
                            <textarea name="REASON" id="REASON" maxlength="1000" class="textarea w-full req" placeholder="Enter Reason of Delete"></textarea>
                        </label>
                    </div>
                    </section>  
            </div>
            <div id="V-section" class="hidden">
                <div class="divider"></div>
                
                <section id="section-2">
                    <h2 class="font-bold text-xl mb-3 required">Vendor Information Detail</h2>
                    <!-- Company Name & Location Type -->
                    <div class="flex flex-col md:flex-row gap-4 mb-4 items-start">
                        <!-- ฝั่งซ้าย: กล่องกรอก Company Name -->
                        <div class="flex items-start gap-4 w-full md:w-1/2">
                            <span class="required w-32 shrink-0 pt-2 font-semibold">Company name</span>
                            <label class="flex-1">
                                <input type="text" name="COMPANY_NAME" id="COMPANY_NAME" maxlength="90" class="input input-sm w-full req">
                            </label>
                        </div>
                        
                        <!-- ฝั่งขวา: ตัวเลือกประเภท (Local / Oversea) -->
                   <div class="flex items-center justify-between gap-4 h-8 pl-4 md:pl-0 pt-1 md:pt-2 w-full">
                    <div class="flex items-center gap-6 shrink-0">
                          <input type="hidden" name="VENDOR_LOCATION" id="VENDOR_LOCATION" value="">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="VENDOR_LOCATION_SHOW" value="Local" v-type="Local" class="radio radio-xs req" >
                            <span class="text-sm font-semibold">Local</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="VENDOR_LOCATION_SHOW" value="Oversea" v-type="Oversea" class="radio radio-xs req">
                            <span class="text-sm font-semibold">Oversea</span>
                        </label>
                    </div>
                    
                    <div id="wrapper_country_select" class="flex-1 min-w-[200px] ml-2">
                        <select name="COUNTRY_SELECT" id="COUNTRY_SELECT" class="select select-bordered select-sm bg-gray-50 border-gray-300 country  w-full" style="width: 100%;" disabled>
                            <option value="">-- Select Country --</option>
                        </select>
                    </div>

                </div>
                    </div>
                <div id="wrapper_address_en" class="flex flex-col md:flex-row gap-4 mb-6 items-start">
                    <div class="w-32 shrink-0 pt-2">
                        <span class="font-semibold text-gray-900 required">Address (EN)</span>
                    </div>
                    <div class="flex-1 flex flex-col gap-3 w-full">
                        <div>
                            <label class="block mb-1 text-xs font-bold text-gray-600">No., Village, Building, Alley, Road </label>
                            <input type="text" name="ADDRESS_EN" id="ADDRESS_EN" maxlength="200" class="input input-bordered input-sm w-full req bg-gray-50 border-gray-300" placeholder="e.g. 43/86 Moo 16, Bangna Road...">
                        </div>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block mb-1 text-xs font-bold text-gray-600">Province</label>
                                <input type="text" name="PROVINCE_EN" id="PROVINCE_EN" maxlength="100" class="input input-bordered input-sm w-full req bg-gray-50 border-gray-300 field-oversea" placeholder="Province">
                               <div id="PROVINCE_LOCAL_WRAPPER" class="field-local hidden">
                                <select id="PROVINCE_SELECT" class="province">
                                     <option value="">-- Select Province --</option>
                                </select>
                                </div>
                            </div>
                            <div>
                                <label class="block mb-1 text-xs font-bold text-gray-600">District</label>
                                <input type="text" name="DISTRICT_EN" id="DISTRICT_EN" maxlength="100" class="input input-bordered input-sm w-full req bg-gray-50 border-gray-300 field-oversea" placeholder="District">
                                <div id="DISTRICT_LOCAL_WRAPPER" class="field-local hidden">
                                <select id="DISTRICT_SELECT" class="district">
                                        <option value="">-- Select District --</option>
                                </select>
                            </div>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block mb-1 text-xs font-bold text-gray-600">Sub-district</label>
                                <input type="text" name="SUB_DISTRICT_EN" id="SUB_DISTRICT_EN" maxlength="100" class="input input-bordered input-sm w-full req bg-gray-50 border-gray-300 field-oversea" placeholder="Sub-district">
                               <div id="SUB_DISTRICT_LOCAL_WRAPPER" class="field-local hidden">
                                <select id="SUB_DISTRICT_SELECT" class="sub-district">
                                          <option value="">-- Select Sub-district --</option>
                                </select>
                            </div>
                            </div>
                      
                            <div>
                                <label class="block mb-1 text-xs font-bold text-gray-600">Postcode</label>
                                <input type="text" name="POSTCODE_EN" id="POSTCODE_EN" maxlength="50" class="input input-bordered input-sm w-full req bg-gray-50 border-gray-300" placeholder="Postcode">
                            </div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block mb-1 text-xs font-bold text-gray-600">Country</label>
                                <input type="text" name="COUNTRY_EN" id="COUNTRY_EN" maxlength="200" class="input input-bordered input-sm w-full req bg-gray-50 border-gray-300" placeholder="Country" readonly>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="wrapper_address_th" class="flex flex-col md:flex-row gap-4 mb-6 items-start">
                        <div class="w-32 shrink-0 pt-2">
                            <span class="font-semibold text-gray-900 ">Address (TH) </span>
                        </div>
                        
                        <div class="flex-1 flex flex-col gap-3 w-full">
                            <div>
                                <label class="block mb-1 text-xs font-bold text-gray-600">บ้านเลขที่, หมู่บ้าน, อาคาร, ซอย, ถนน</label>
                                <input type="text" name="ADDRESS_TH" id="ADDRESS_TH" maxlength="200" class="input input-bordered input-sm w-full  bg-gray-50 border-gray-300" placeholder="เช่น 43/86 หมู่ 16 ซอยบางนา...">
                            </div>
                            
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block mb-1 text-xs font-bold text-gray-600">จังหวัด</label>
                                    <input type="text" name="PROVINCE_TH" id="PROVINCE_TH" maxlength="100" class="input input-bordered input-sm w-full  bg-gray-50 border-gray-300" placeholder="จังหวัด">
                                </div>
                         
                                <div>
                                    <label class="block mb-1 text-xs font-bold text-gray-600">อำเภอ / เขต</label>
                                    <input type="text" name="DISTRICT_TH" id="DISTRICT_TH" maxlength="100" class="input input-bordered input-sm w-full  bg-gray-50 border-gray-300" placeholder="อำเภอ / เขต">
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                 <div>
                                    <label class="block mb-1 text-xs font-bold text-gray-600">ตำบล / แขวง</label>
                                    <input type="text" name="SUB_DISTRICT_TH" id="SUB_DISTRICT_TH" maxlength="100" class="input input-bordered input-sm w-full  bg-gray-50 border-gray-300" placeholder="ตำบล / แขวง">
                                </div>
                                <div>
                                    <label class="block mb-1 text-xs font-bold text-gray-600">รหัสไปรษณีย์ </label>
                                    <input type="text" name="POSTCODE_TH" id="POSTCODE_TH" maxlength="50" class="input input-bordered input-sm w-full  bg-gray-50 border-gray-300" placeholder="รหัสไปรษณีย์">
                                </div>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block mb-1 text-xs font-bold text-gray-600">ประเทศ</label>
                                    <input type="text" name="COUNTRY_TH" id="COUNTRY_TH" maxlength="200" class="input input-bordered input-sm w-full bg-gray-50 border-gray-300" placeholder="ประเทศ" readonly>
                                </div>
                            </div>
                        </div>
                </div>


                    
                    <!-- Contact Name -->
                    <div class="flex items-start gap-4 mb-4 w-full md:w-1/2">
                        <span class="required w-32 shrink-0 pt-2 font-semibold">Contact name</span>
                        <label class="flex-1">
                            <input type="text" name="CONTACT" id="CONTACT" maxlength="90" class="input input-sm w-full req">
                        </label>
                    </div>

                    <!-- Email & Website -->
                    <div class="flex flex-col md:flex-row gap-4 mb-4">
                        <div class="flex items-start gap-4 w-full md:w-1/2">
                            <span class="required w-32 shrink-0 pt-2 font-semibold">Email</span>
                            <label class="flex-1">
                                <input type="text" name="EMAIL" id="EMAIL" maxlength="90" class="input input-sm w-full req">
                            </label>
                        </div>
                        <div class="flex items-start gap-4 w-full md:w-1/2">
                            <span class="required w-32 shrink-0 pt-2 font-semibold">Web site</span>
                            <label class="flex-1">
                                <input type="text" name="WEBSITE" id="WEBSITE" maxlength="200" class="input input-sm w-full req">
                            </label>
                        </div>
                    </div>

                    <!-- Telephone & Fax -->
                    <div class="flex flex-col md:flex-row gap-4 mb-4">
                        <div class="flex items-start gap-4 w-full md:w-1/2">
                            <span class="required w-32 shrink-0 pt-2 font-semibold">Tel.no</span>
                            <label class="flex-1">
                                <input type="text" type="tel" name="TELNO" id="TELNO" maxlength="12" class="input input-sm w-full req">
                            </label>
                        </div>
                        <div class="flex items-start gap-4 w-full md:w-1/2">
                            <span class="w-32 shrink-0 pt-2 font-semibold">Fax.no</span>
                            <label class="flex-1">
                                <input type="text" name="FAX" id="FAX" maxlength="30" class="input input-sm w-full">
                            </label>
                        </div>
                    </div>

                    <!-- Bank Name & Branch Name -->
                    <div class="flex flex-col md:flex-row gap-4 mb-4">
                        <div class="flex items-start gap-4 w-full md:w-1/2">
                            <span class="required w-32 shrink-0 pt-2 font-semibold">Bank name</span>
                            <label class="flex-1">
                                <input type="text" name="BANKNAME" id="BANKNAME" maxlength="50" class="input input-sm w-full req">
                            </label>
                        </div>
                        <div class="flex items-start gap-4 w-full md:w-1/2">
                            <span class="required w-32 shrink-0 pt-2 font-semibold">Branch name</span>
                            <label class="flex-1">
                                <input type="text" name="BRANCH" id="BRANCH" maxlength="50" class="input input-sm w-full req">
                            </label>
                        </div>
                    </div>

                    <!-- Account Number -->
                    <div class="flex items-start gap-4 mb-4 w-full md:w-1/2">
                        <span class="required w-32 shrink-0 pt-2 font-semibold">Account number</span>
                        <label class="flex-1">
                            <input type="text" name="ACCNUMBER" id="ACCNUMBER" maxlength="13" class="input input-sm w-full req">
                        </label>
                    </div>

                    <!-- Payment Term -->
                    <div class="flex items-start gap-4 mb-4 w-full md:w-1/2">
                        <span class="required w-32 shrink-0 pt-2 font-semibold">Payment Term</span>
                        <label class="flex-1"><input type="hidden" id="TERM_PAYMENT_HIDDEN" name="TERMCODE" value="">
                            <select id="TERM_PAYMENT" name ="TERM_PAYMENT" class="select select-sm w-full md:w-fit min-w-max termcode req">
                                <option value="" disabled selected>...</option>
                            </select>
                        </label>
                    </div>
                </section>
            </div>
            <div id="F-section" class="hidden">
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
                        <label class="hidden attach-file" id="attach-letter">
                            <input type="checkbox" name="ATTACH_TYPE" value="Letter for Change Address" class="checkbox checkbox-xs" a-type="letter">
                            Letter for Change Address
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
            </div>
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