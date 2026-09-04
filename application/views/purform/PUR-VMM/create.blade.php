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


        span.required::after,
        h2.required::after,
        label.required::after {
            content: "**";
            color: red;
            font-weight: bold;
            padding-left: 0.25rem;
        }

        /* การทำเงาและขอบที่นุ่มนวล */
        #searchModal {
            border: none;
            border-radius: 20px;
            /* มุมมนรับกับ UI สมัยใหม่ */
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            /* เงาเข้มเพื่อดึงให้ลอย */
            padding: 0;
            overflow: hidden;
            background: white;
        }

        /* ใส่ Gradient ให้หัวข้อ เพื่อให้ดูมี Layer */
        .modal-header-gradient {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            color: white;
            padding: 20px 24px;
        }

        /* เพิ่ม Effect ให้รายการตอน Hover */
        .select-item {
            transition: all 0.3s ease;
            border-left: 4px solid transparent;
        }

        .select-item:hover {
            background-color: #f1f5f9;
            border-left: 4px solid #3b82f6;
            /* มีเส้นแถบสีน้ำเงินขึ้นที่ขอบซ้าย */
        }

        #tableSearch tbody tr:hover {
            background-color: #eff6ff !important;
            /* คือสี blue-50 */
            cursor: pointer !important;
        }
    </style>
@endsection
@section('contents')
    <div class="hidden form-info" nfrmno="{{ $NFRMNO }}" vorgno="{{ $VORGNO }}" cyear="{{ $CYEAR }}"
        mode="{{ $mode }}" cyear2="{{ $mode != 1 ? $CYEAR2 : '' }}" nrunno="{{ $mode != 1 ? $NRUNNO : '' }}"
        return="{{ $return ?? '' }}"></div>
    <div class="hidden apv-data" empno="{{ $empno }}"></div>

    <form id="frmmain">
        <input type="hidden" name="ACTION">
        <div class="space-y-6">
            <h1 class="text-3xl text-center text-primary font-bold mb-10">Vendor Master Maintenance</h1>
            <!-- Top Section -->
            <div class="border border-gray-300 p-6 rounded-lg bg-white space-y-4">
                <div class="grid grid-cols-[170px_1fr] items-center gap-2">
                    <span class="font-semibold text-sm">Input By:</span>
                    <input type="text" name = "INPUTBY" maxlength="5"
                        class="input input-sm border border-gray-400 h-8 rounded w-48 px-2" value="{{ $empno }}"
                        readonly>
                </div>
                <div class="grid grid-cols-[170px_1fr] items-center gap-2 required">
                    <span class="font-semibold text-sm required ">Request By:</span>
                    <input type="text" name = "REQBY" maxlength="5"
                        class="input input-sm border border-gray-400 h-8 rounded w-48 px-2  req"
                        value="{{ $empno }}">
                </div>
                <div class="grid grid-cols-[170px_1fr] items-center gap-2 required">
                    <span class="font-semibold text-sm required ">Mode:</span>
                    <div class="flex flex-row items-center gap-6 h-8 overflow-x-auto whitespace-nowrap">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="REQTYPE" value="A" r-type="A" class="radio radio-xs req">
                            <span class="text-sm  font-semibold">Add</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="REQTYPE" value="U" r-type="U" class="radio radio-xs req">
                            <span class="text-sm font-semibold">Update</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="REQTYPE" value="D" r-type="D" class="radio radio-xs req">
                            <span class="text-sm font-semibold">Delete</span>
                        </label>
                    </div>
                </div>
                <div class="grid grid-cols-[170px_1fr] items-center gap-2 required">
                    <span class="font-semibold text-sm required ">Vendor Code:</span>
                    <input type="text" name = "VENDCODE" id = "VENDCODE" maxlength="5"
                        class="input input-sm border border-gray-400 h-8 rounded w-48 px-2 req" value="">
                </div>
            </div>


            <div class="border border-gray-300 p-6 rounded-lg bg-white">

                <!-- Header Section -->
                <div class="flex justify-between items-center mb-6">
                    <h3 class="font-bold text-lg">General Information</h3>
                </div>

                <!-- เนื้อหาภายใน -->
                <div class="space-y-6">
                    <div class="grid grid-cols-[170px_1fr] gap-4 items-start">
                        <span class="font-semibold text-sm pt-1 required">Vendor Group Type</span>

                        <!-- ปรับให้แสดงผลแบบ Flex เรียงชิดกัน พร้อมเว้นระยะห่างพอดีๆ -->
                        <div class="flex items-center gap-6 text-sm">
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="VENDGROUP" value="Direct"
                                    class="w-4 h-4 accent-blue-600 req radio-typec"> Direct
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="VENDGROUP" value="Indirect"
                                    class="w-4 h-4 accent-blue-600 req radio-typec"> Indirect
                            </label>
                        </div>
                    </div>
                    <div class="grid grid-cols-[170px_1fr] items-center gap-4 mt-4">
                        <span class="font-semibold text-sm required">Vendor Name</span>

                        <div class="grid grid-cols-12 gap-x-4 items-center w-full">

                            <input type="text" name="VENDNAME"
                                class="col-span-6 input input-sm border border-gray-400 h-8 rounded w-full px-2 req">
                        </div>
                    </div>

                    <!-- Address (EN) Section -->
                    <div class="grid grid-cols-[170px_1fr] gap-4 pt-4 border-t border-gray-200">
                        <span class="font-semibold text-sm pt-2 required">Address (EN) </span>
                        <div class="space-y-4">
                            <!-- Address Line 1 -->
                            <div>
                                <label class="block text-xs font-semibold text-gray-600 mb-1">Address (ที่อยู่)</label>
                                <input type="text" name="ADDRESS1_EN" id="ADDRESS1_EN"
                                    placeholder="e.g. 43/86 Moo 16, Bangna Road..."
                                    class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full req">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-600 mb-1">Address (ที่อยู่)</label>
                                <input type="text" name="ADDRESS2_EN" id="ADDRESS2_EN"
                                    placeholder="e.g. 43/86 Moo 16, Bangna Road..."
                                    class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full">
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-semibold text-gray-600 mb-1">City (เขต/อำเภอ)</label>
                                    <input type="text" name="CITY_EN" id="CITY_EN" maxlength="100"
                                        class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full"
                                        placeholder="City">
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-gray-600 mb-1">State
                                        (รัฐ/จังหวัด)</label>
                                    <input type="text" name="STATE_EN" id="STATE_EN" placeholder="State"
                                        class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full ">
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-semibold text-gray-600 mb-1">Postcode
                                        (รหัสไปรษณีย์)</label>
                                    <input type="text" name="POSTCODE_EN" id="POSTCODE_EN" placeholder="Postcode"
                                        class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full ">
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-gray-600 mb-1">Country (ประเทศ)</label>
                                    <input type="text" name="COUNTRY_EN" id="COUNTRY_EN" placeholder="Country"
                                        class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full ">
                                </div>
                            </div>

                        </div>
                    </div>

                    <!-- Address (TH) Section -->
                    <div class="grid grid-cols-[170px_1fr] gap-4 pt-4 border-t border-gray-200">
                        <label class="font-semibold text-sm pt-2">Address (TH)</label>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-xs font-semibold text-gray-600 mb-1">บ้านเลขที่, หมู่บ้าน, อาคาร,
                                    ซอย, ถนน, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์</label>
                                <input type="text" name="ADDRESS_TH" id="ADDRESS_TH"
                                    placeholder="เช่น 43/86 หมู่ 16 ซอยบางนา" maxlength="200"
                                    class="input input-bordered input-sm w-full  bg-gray-50 border-gray-300"
                                    placeholder="เช่น 43/86 หมู่ 16 ซอยบางนา...">
                            </div>

                        </div>
                    </div>
                    <!-- Contact Information -->
                    <div class="pt-4 border-t border-gray-200 space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div class="grid grid-cols-[170px_1fr] items-center gap-4">
                                <span class="font-semibold text-sm required">Vendor Category</span>
                                <input type="text" name="VENDCAT" id="VENDCAT" maxlength="100"
                                    class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full req">
                            </div>
                            <div class="grid grid-cols-[170px_1fr] items-center gap-4">
                                <span class="font-semibold text-sm required ">TAX. ID/Swift code</span>
                                <input type="text" name="TAXID" id="TAXID" maxlength="13"
                                    class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full">
                            </div>
                            <div class="grid grid-cols-[170px_1fr] items-center gap-4">
                                <span class="font-semibold text-sm">CA no.</span>
                                <input type="text" name="CANO" id="CANO" maxlength="20"
                                    class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full">
                            </div>
                            <div class="grid grid-cols-[170px_1fr] items-center gap-4">
                                <span class="font-semibold text-sm">BA no.</span>
                                <input type="text" name="BANO" id="BANO" maxlength="20"
                                    class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full">
                            </div>
                            {{-- <div class="grid grid-cols-[170px_1fr] items-center gap-4">
                                <span class="font-semibold text-sm">Company</span>
                                <input type="text" name="COMPANY" id="COMPANY" maxlength=""
                                    class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full">
                            </div>
                            <div class="grid grid-cols-[170px_1fr] items-center gap-4">
                                <span class="font-semibold text-sm">Corporate Vendor</span>
                                <input type="text" name="CORPORATE" id="CORPORATE" maxlength=""
                                    class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full">
                            </div> --}}
                            <div class="grid grid-cols-[170px_1fr] items-center gap-4">
                                <span class="font-semibold text-sm">Currency Code</span>
                                <input type="hidden" name="CURCODE" id="CURCODE" value="" />
                                <span id="constdcur" class="text-gray-700 text-sm"></span>
                            </div>
                            <div class="grid grid-cols-[170px_1fr] items-center gap-4">
                                <span class="font-semibold text-sm">Pay to Vendor</span>
                                <input type="text" name="VPAYTO" id="VPAYTO" maxlength=""
                                    class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full">
                            </div>
                            <div class="grid grid-cols-[170px_1fr] items-center gap-4">
                                <span class="font-semibold text-sm">Vendor Type</span>
                                <div id="select-wrapper" class="inline-block">
                                    <select id="VTYPE" name="VTYPE"
                                        class="input input-sm border border-gray-400 h-8 rounded px-2 w-48 vtype req">
                                        <option value="" disabled selected>...</option>
                                        <option value="SB11">SB11</option>
                                    </select>
                                </div>

                            </div>
                            <div class="grid grid-cols-[170px_1fr] items-center gap-4">
                                <span class="font-semibold text-sm">Payment Type</span>
                                <div id="select-wrapper" class="inline-block">
                                    <select id="VPAYTY" name="VPAYTY"
                                        class="input input-sm border border-gray-400 h-8 rounded px-2 w-48 vtype req">
                                        <option value="" disabled selected>...</option>
                                        <option value="C">Cash</option>
                                    </select>
                                </div>
                            </div>
                            {{--
                            <div class="grid grid-cols-[170px_1fr] items-center gap-4">
                                <span class="font-semibold text-sm">Days to Clear</span>
                                <input type="text" name="DAYSCLEAR" id="DAYSCLEAR" maxlength=""
                                    class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full">
                            </div> --}}
                            <div class="grid grid-cols-[170px_1fr] items-center gap-4">
                                <span class="font-semibold text-sm required">Terms Code</span>

                                <select id="TERM_PAYMENT" name ="TERMCODE"
                                    class="select select-sm w-48 min-w-max termcode req">
                                    <option value="" disabled selected>...</option>
                                </select>
                            </div>
                            <div class="grid grid-cols-[170px_1fr] items-center gap-4">
                                <span class="font-semibold text-sm">One time vendor</span>
                                <input type="text" name="V1TIME" id="V1TIME"
                                    class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full">
                            </div>
                            <div class="grid grid-cols-[170px_1fr] items-center gap-4">
                                <span class="font-semibold text-sm">Alpha search key</span>
                                <input type="text" name="VNALPH" id="VNALPH"
                                    class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full">
                            </div>


                            {{-- <div class="grid grid-cols-[170px_1fr] items-center gap-4">
                                <span class="font-semibold text-sm">G/L Account</span>
                                <input type="text" name="GLACC" id="GLACC" maxlength=""
                                    class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full">
                            </div> --}}


                            {{-- <div class="grid grid-cols-[170px_1fr] items-center gap-4">
                                <span class="font-semibold text-sm">Price include Tax</span>
                                <input type="text" name="PRICETAX" id="PRICETAX"
                                    class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full">
                            </div> --}}
                        </div>
                    </div>
                    <!-- Contact Information -->
                    <div class="pt-4 border-t border-gray-200 space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div class="grid grid-cols-[170px_1fr] items-center gap-4">
                                <span class="font-semibold text-sm required">Contact name</span>
                                <input type="text" name="CONTACT" id="CONTACT" maxlength="90"
                                    class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full req">
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="grid grid-cols-[170px_1fr] items-center gap-4">
                                <span class="font-semibold text-sm required">Email</span>
                                <input type="text" name="EMAIL" id="EMAIL" maxlength="90"
                                    class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full req">
                            </div>
                            <div class="grid grid-cols-[170px_1fr] items-center gap-4">
                                <span class="font-semibold text-sm ">Web site</span>
                                <input type="text" name="WEBSITE" id="WEBSITE" maxlength="200"
                                    class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full">
                            </div>
                            <div class="grid grid-cols-[170px_1fr] items-center gap-4">
                                <span class="font-semibold text-sm required">Tel.no</span>
                                <input type="text" name="TELNO" id="TELNO" maxlength="12"
                                    class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full req">
                            </div>
                            <div class="grid grid-cols-[170px_1fr] items-center gap-4">
                                <span class="font-semibold text-sm">Fax.no</span>
                                <input type="text" name="FAX" id="FAX" maxlength="30"
                                    class="input input-sm border border-gray-400 h-8 rounded  px-2 w-full">
                            </div>
                        </div>
                    </div>
                    <!-- ส่วนคั่นจาก Contact name -->
                    <div class="border-t border-gray-300 pt-6 mt-6">
                        <!-- Bank & Branch -->
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <div class="grid grid-cols-[170px_1fr] items-center gap-4">
                                <span class="font-semibold text-sm">Bank name</span>
                                <input type="text" name="BANKNAME" id="BANKNAME" maxlength="50"
                                    class="input input-sm border border-gray-400 h-8 rounded px-2 w-full">
                            </div>
                            <div class="grid grid-cols-[170px_1fr] items-center gap-4">
                                <span class="font-semibold text-sm ">Branch name</span>
                                <input type="text" name="BRANCH" id="BRANCH" maxlength="50"
                                    class="input input-sm border border-gray-400 h-8 rounded px-2 w-full ">
                            </div>
                        </div>

                        <!-- Additional Banking & Payment Fields -->
                        <div class="space-y-4">
                            <div class="grid grid-cols-2 gap-4">
                                <div class="grid grid-cols-[170px_1fr] items-center gap-4">
                                    <span class="font-semibold text-sm">Account number</span>
                                    <input type="text" name="ACCNUMBER" id="ACCNUMBER" maxlength="13"
                                        class="input input-sm border border-gray-400 h-8 rounded px-2 w-full">
                                </div>
                            </div>
                            <div class="grid grid-cols-[170px_1fr] items-start gap-4">
                                <label class="font-semibold text-sm pt-1">Bank Address</label>
                                <textarea name="BANKADDR" id="BANKADDR"
                                    class="textarea textarea-sm border border-gray-400 rounded px-2 w-full text-sm py-1" rows="2"></textarea>
                            </div>

                            {{-- <div class="grid grid-cols-2 gap-4">
                                <div class="grid grid-cols-[170px_1fr] items-center gap-4">
                                    <span class="font-semibold text-sm required">Payment Term</span>
                                    <input type="hidden" id="TERM_PAYMENT_HIDDEN" name="TERMCODE" value="">
                                    <select id="TERM_PAYMENT" name ="TERM_PAYMENT"
                                        class="select select-sm w-48 min-w-max termcode req">
                                        <option value="" disabled selected>...</option>
                                    </select>
                                </div>
                                <div class="grid grid-cols-[170px_1fr] items-center gap-4">
                                    <span class="font-semibold text-sm required">Currency Code</span>
                                    <div id="select-wrapper" class="inline-block">
                                        <select id="stdcur" name="CURCODE"
                                            class="input input-sm border border-gray-400 h-8 rounded px-2 w-48 currency req">
                                            <option value="" disabled selected>...</option>
                                        </select>
                                    </div>
                                    <span id="constdcur" class="text-gray-700 text-sm hidden"></span>
                                </div>
                            </div> --}}
                            <div class="grid grid-cols-[170px_1fr] items-start gap-4">
                                <span class="font-semibold text-sm required pt-2">Attach files</span>

                                <fieldset class="flex flex-col gap-3">

                                    <!-- 1. Company Certificate -->
                                    <div class="flex flex-col gap-2 border border-gray-200 rounded-md p-3 bg-gray-50">
                                        <div class="flex items-center gap-2">
                                            <span class="text-sm font-medium">Company Certificate /Vat Register/ Company
                                                Profile :</span>

                                            <!-- ปุ่ม Paperclip -->
                                            <label for="file-cer"
                                                class="cursor-pointer border border-gray-300 rounded px-2 py-1 shadow-sm bg-white hover:bg-gray-100 flex items-center justify-center transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
                                                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                                    class="text-gray-600">
                                                    <path
                                                        d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48">
                                                    </path>
                                                </svg>
                                            </label>
                                            <!-- ซ่อน Input File -->
                                            <input class="hidden" type="file" name="fileCer[]" id="file-cer"
                                                multiple />
                                            <!-- ซ่อน Checkbox -->
                                            <input type="checkbox" name="ATTACH_TYPE" value="Company Certification"
                                                class="hidden">
                                        </div>
                                        <!-- พื้นที่แสดงไฟล์ -->
                                        <div class="show-file pl-2 text-sm"></div>
                                        <div id="file-type-11" class="file-container"></div>
                                    </div>
                                    <!-- 5. Other -->
                                    <div class="flex flex-col gap-2 border border-gray-200 rounded-md p-3 bg-gray-50">
                                        <div class="flex items-center gap-2">
                                            <span class="text-sm font-medium">Other</span>
                                            <input type="text" name="ATTACH_OTHER" id="ATTACH_OTHER"
                                                class="input input-sm w-full max-w-[350px] border border-gray-400 rounded px-2 h-7">
                                            <span class="text-sm font-medium">:</span>

                                            <label for="file-other"
                                                class="cursor-pointer border border-gray-300 rounded px-2 py-1 shadow-sm bg-white hover:bg-gray-100 flex items-center justify-center transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
                                                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                                    class="text-gray-600">
                                                    <path
                                                        d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48">
                                                    </path>
                                                </svg>
                                            </label>
                                            <input class="hidden" type="file" name="fileOther[]" id="file-other"
                                                multiple />
                                            <input type="checkbox" name="ATTACH_TYPE" value="Other" class="hidden">
                                        </div>
                                        <div class="show-file pl-2 text-sm"></div>
                                        <div id="file-type-2" class="file-container"></div>
                                    </div>

                                </fieldset>
                            </div>



                            <!-- ย้าย Dropzone ออกมาข้างนอก เพื่อให้ใช้ความกว้างได้เต็ม 100% ของ Container หลัก -->
                            <!-- <div id="attachFile" class="mt-4">

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            </div> -->
                        </div>
                    </div>
                </div>
            </div>
            <div class="border border-gray-300 p-6 rounded-lg bg-white space-y-4">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="font-bold text-lg">E-SCM : (Enable) contact person and email address</h3>
                </div>
                <div class="flex justify-between items-end mb-2">
                    <button type="button" data-table="scm-table"
                        class="add-row-btn w-7 h-7 rounded border border-blue-500 text-blue-500 hover:bg-blue-50 flex items-center justify-center font-bold text-lg">+</button>
                </div>
                <table id="scm-table" class="w-full text-sm border-collapse border border-gray-400">

                    <thead>
                        <tr class="bg-gray-100">
                            <th class="border border-gray-400 p-2 text-left">Name</th>
                            <th class="border border-gray-400 p-2 w-1/4">Email</th>
                            <th class="border border-gray-400 p-2 w-1/4">Username</th>
                            <th class="border border-gray-400 p-2 w-10 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="row-template">
                            <td class="border border-gray-400 p-1"><input name="NAME[]" type="text"
                                    class="w-full px-1 scm-name "></td>
                            <td class="border border-gray-400 p-1"><input type="text" name="EMAIL[]"
                                    class="input-decimal w-full px-1 text-left scm-mail"></td>
                            <td class="border border-gray-400 p-1"><input type="text" name="USERNAME[]"
                                    class="input-decimal w-full px-1 text-left scm-usrname"></td>
                            <td class="border border-gray-400 p-1"></td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>

        </div>
        <div id="form-action-container"></div>
    </form>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/purVmm.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
