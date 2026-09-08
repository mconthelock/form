@extends('layouts/webflowTemplate')


@section('contents')
    <div class="hidden form-info" nfrmno="{{ $NFRMNO }}" vorgno="{{ $VORGNO }}" cyear="{{ $CYEAR }}"
        mode="{{ $mode }}" cyear2="{{ $mode != 1 ? $CYEAR2 : '' }}" nrunno="{{ $mode != 1 ? $NRUNNO : '' }}"></div>
    <div class="hidden apv-data" empno="{{ $empno }}"></div>
@endsection
<div>
    <h1></h1>
</div>
<form id="frmmain" style="visibility: hidden;">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <h1 class="text-3xl text-center text-primary font-bold mb-10 mt-6">Vendor Master Maintenance</h1>

        <!-- 1. ส่วน Form Information (มาจากระบบ) -->
        <div class="form-overlap-wrapper w-full">
            <!-- ใช้ bg-base-200 เพื่อให้ได้สีเดิมคืนมา และแก้หัวข้อเป็น !bg-transparent -->
            <section id="form-detail"
                class="w-full border border-gray-300 rounded-lg pt-8 px-5 pb-5 mt-8 bg-base-200 relative
        [&>div.text-xl]:absolute [&>div.text-xl]:-top-3.5 [&>div.text-xl]:left-5 [&>div.text-xl]:bg-transparent! [&>div.text-xl]:px-2.5 [&>div.text-xl]:!m-0 [&>div.text-xl]:text-lg [&>div.text-xl]:text-gray-900 [&>div.text-xl]:z-10
        [&>div.bg-base-200]:!bg-transparent [&>div.bg-base-200]:!border-none [&>div.bg-base-200]:!p-0 [&>div.bg-base-200]:!w-full [&>div.bg-base-200]:!shadow-none
        [&_table_td]:!pl-0 [&_table_td:first-child]:!w-[220px] [&_tr]:!border-b-0 [&_td]:!border-b-0">
            </section>
        </div>

        <!-- 2. ส่วน General Information -->
        <div class="border border-gray-300 shadow-sm rounded-lg pt-8 px-5 pb-5 mt-8 mb-5 bg-white relative">
            <!-- เปลี่ยนเป็น !bg-transparent ตามที่ต้องการ -->
            <div class="absolute -top-3.5 left-5 !bg-transparent px-2.5 text-lg font-bold text-gray-900 m-0 z-10">
                General Information</div>
            <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
                <div class="font-semibold text-sm">Mode : </div>
                <div id="REQTYPE" class="text-gray-700 text-sm"></div>
            </div>
            <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
                <div class="font-semibold text-sm">Vendor Group Type : </div>
                <div id="VENDGROUPTYPE" class="text-gray-700 text-sm"></div>
            </div>
            <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
                <div class="font-semibold text-sm">Vendor Code : </div>
                <div id="VENDCODE" class="text-gray-700 text-sm"></div>
            </div>
            <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
                <div class="font-semibold text-sm">Vendor Name: </div>
                <div id="VENDNAME" class="text-gray-700 text-sm"></div>
            </div>
            <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
                <div class="font-semibold text-sm">Address (EN) :</div>
                <div id="ADDREN" class="text-gray-700 text-sm">-</div>
            </div>

            <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
                <div class="font-semibold text-sm">Address (TH) :</div>
                <div id="ADDRTH" class="text-gray-700 text-sm">-</div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
                    <div class="font-semibold text-sm">Vendor Category :</div>
                    <div id="VENDCAT" class="text-gray-700 text-sm"></div>
                </div>
                <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
                    <div class="font-semibold text-sm">TAX.ID/Swift code :</div>
                    <div id="TAXID" class="text-gray-700 text-sm"></div>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
                    <div class="font-semibold text-sm">CA no. :</div>
                    <div id="CANO" class="text-gray-700 text-sm"></div>
                </div>
                <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
                    <div class="font-semibold text-sm">BA no. :</div>
                    <div id="BANO" class="text-gray-700 text-sm"></div>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
                    <div class="font-semibold text-sm">Currency Code :</div>
                    <div id="constdcur" class="text-gray-700 text-sm"></div>
                </div>
                <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
                    <div class="font-semibold text-sm">Pay to Vendor :</div>
                    <div id="VPAYTO" class="text-gray-700 text-sm"></div>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
                    <div class="font-semibold text-sm">Vendor Type :</div>
                    <div id="VTYPE" class="text-gray-700 text-sm"></div>
                </div>
                <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
                    <div class="font-semibold text-sm">Payment TYpe :</div>
                    <div id="VPAYTY" class="text-gray-700 text-sm"></div>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
                    <div class="font-semibold text-sm">Terms Code :</div>
                    <div id="TERMCODE" class="text-gray-700 text-sm"></div>
                </div>
                <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
                    <div class="font-semibold text-sm">One time vendor :</div>
                    <div id="V1TIME" class="text-gray-700 text-sm"></div>
                </div>
            </div>
            <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
                <div class="font-semibold text-sm">Alpha search key:</div>
                <div id="VNALPH" class="text-gray-700 text-sm">-</div>
            </div>
            <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
                <div class="font-semibold text-sm">Contact name:</div>
                <div id="CONTACT" class="text-gray-700 text-sm">-</div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
                    <div class="font-semibold text-sm">Email :</div>
                    <div id="EMAIL" class="text-gray-700 text-sm"></div>
                </div>
                <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
                    <div class="font-semibold text-sm">Web site :</div>
                    <div id="WEBSITE" class="text-gray-700 text-sm"></div>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
                    <div class="font-semibold text-sm">Tel.no :</div>
                    <div id="TELNO" class="text-gray-700 text-sm"></div>
                </div>
                <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
                    <div class="font-semibold text-sm">Fax.no :</div>
                    <div id="FAX" class="text-gray-700 text-sm"></div>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
                    <div class="font-semibold text-sm">Bank name :</div>
                    <div id="BANKNAME" class="text-gray-700 text-sm"></div>
                </div>
                <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
                    <div class="font-semibold text-sm">Branch name :</div>
                    <div id="BRANCH" class="text-gray-700 text-sm"></div>
                </div>
            </div>
            <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
                <div class="font-semibold text-sm">Account number :</div>
                <div id="ACCNUMBER" class="text-gray-700 text-sm">-</div>
            </div>
            <div class="grid grid-cols-[220px_1fr] gap-3 mb-3 items-baseline">
                <div class="font-semibold text-sm">Bank Address :</div>
                <div id="BANKADDR" class="text-gray-700 text-sm">-</div>
            </div>
        </div>

        <!-- 4. ส่วน Attach files -->
        <div class="border border-gray-300 shadow-sm rounded-lg pt-5 px-5 pb-5 mt-8 mb-5 bg-white relative">
            <!-- เปลี่ยนเป็น !bg-transparent ตามที่ต้องการ -->
            <div class="absolute -top-3.5 left-5 !bg-transparent px-2.5 text-lg font-bold text-gray-900 m-0 z-10">
                Attach files</div>
            <div class="">
                <!-- หัวข้อที่ 1: Company Certificate / Vat Register / Company Profile (FILE_TYPE = 11) -->
                <div class="mt-4">
                    <span class="text-sm font-medium block mb-2">Company Certificate / Vat Register / Company
                        Profile
                        :</span>
                    <div id="file-type-11" class="file-container"></div>
                </div>

                <!-- หัวข้อที่ 4: Other / ATTACH_OTHER (FILE_TYPE = 2) -->
                <div class="mt-4">
                    <span class="text-sm font-medium block mb-2">Other : <span id="ATTACH_OTHER_TEXT"
                            class="text-gray-600 font-normal"></span></span>
                    <div id="file-type-2" class="file-container"></div>
                </div>
            </div>
        </div>
        <!-- 5. SCMUSER-->
        <div class="border border-gray-300 shadow-sm rounded-lg pt-8 px-5 pb-5 mt-8 mb-5 bg-white relative scmuser">
            <!-- เปลี่ยนเป็น !bg-transparent ตามที่ต้องการ -->
            <div class="absolute -top-3.5 left-5 !bg-transparent px-2.5 text-lg font-bold text-gray-900 m-0 z-10">
                E-SCM : (Enable) contact person and email address</div>
            <!-- กรอบนอกสุด: ใส่ overflow-x-auto เพื่อให้เกิดแถบเลื่อน (Scrollbar) เมื่อหน้าจอเล็ก -->
            <div class="w-full overflow-x-auto pb-4">
                <div
                    class="min-w-[800px] border border-slate-200 rounded-lg overflow-hidden font-sans text-sm md:text-base">

                    <!-- หัวตาราง -->
                    <div class="grid grid-cols-12 bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                        <div class="col-span-1 p-3 border-r border-slate-200 text-center">ลำดับ</div>
                        <div class="col-span-3 p-3 border-r border-slate-200">ชื่อ</div>
                        <!-- ขยาย Email เป็น 6 ส่วน -->
                        <div class="col-span-6 p-3 border-r border-slate-200">Email</div>
                        <!-- ลด User เหลือ 2 ส่วน -->
                        <div class="col-span-2 p-3">User</div>
                    </div>

                    <div id="table-body"></div>

                </div>
            </div>

        </div>
        <div class="border border-gray-300 shadow-sm rounded-lg pt-5 px-5 pb-5 mt-8 mb-5 bg-white relative txtremark">
            <div>
                <label class="block font-bold text-sm mb-2 text-gray-800">Remark</label>
                <textarea name="txtRemark" class="w-full border border-gray-400 p-2 rounded text-sm focus:outline-none"
                    rows="4" placeholder="Additional comments (if any)..."></textarea>
            </div>
        </div>

    </div>

    <div id="form-action-container"></div>
</form>

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/purVmmView.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
