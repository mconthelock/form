@extends('layouts/webflowTemplate')

@section('contents')
    <div
        class="bg-base-200 min-h-screen p-4 md:p-8 flex justify-center text-[13px] leading-relaxed font-sans text-base-content">
        <form class="max-w-[850px] w-full bg-base-100 p-8 shadow-2xl rounded-2xl border border-base-200" id="rbForm"
            enctype="multipart/form-data">

            <div class="text-center mb-8">
                <h1 class="text-xl font-bold text-primary">แบบฟอร์มขออนุมัติทำตราแสตมป์</h1>
                <h2 class="text-sm font-semibold uppercase opacity-50 tracking-wider mt-1">Requisition Form for Rubber Stamp
                </h2>
            </div>


            <div class="border border-base-300 flex flex-col mb-6 rounded-lg overflow-hidden shadow-sm">
                <div class="flex border-b border-base-300 bg-base-50/50">
                    <div class="w-full p-2 flex items-center gap-2">
                        <span class="whitespace-nowrap font-semibold opacity-80 text-xs">Input by:</span>
                        <input type="text"
                            class="input input-sm input-ghost w-full rounded-none border-b border-base-300 focus:border-primary focus:bg-base-200/50 px-1 "
                            id="INPUTBY" name="INPUTBY">
                    </div>
                </div>

                <div class="flex border-b border-base-300 bg-base-50/50">
                    <div class="w-1/2 p-2 flex items-center gap-2">
                        <span class="whitespace-nowrap font-semibold opacity-80 text-xs">Request by:</span>
                        <input type="text"
                            class="input input-sm input-ghost w-full rounded-none border-b border-base-300 focus:border-primary focus:bg-base-200/50 px-1 req"
                            id="REQBY" name="REQBY">
                    </div>
                    <div class="w-1/2 border-r border-base-300 p-2 flex items-center gap-2">
                        <span class="whitespace-nowrap font-semibold opacity-80 text-xs">ชื่อ/NAME:</span>
                        <input type="text"
                            class="input input-sm input-ghost w-full rounded-none border-b border-base-300 focus:border-primary focus:bg-base-200/50 px-1 req"
                            id="empName" name="empName">
                    </div>

                </div>

                <div class="flex bg-base-50/50">
                    <div class="w-1/2 border-r border-base-300 p-2 flex items-center gap-2">
                        <span class="whitespace-nowrap font-semibold opacity-80 text-xs">Sect./Dept./Div.:</span>
                        <input type="text"
                            class="input input-sm input-ghost w-full rounded-none border-b border-base-300 focus:border-primary focus:bg-base-200/50 px-1 req"
                            id="empDept" name="empDept">
                    </div>
                    <div class="w-1/2 p-2 flex items-center gap-2">
                        <span class="whitespace-nowrap font-semibold opacity-80 text-xs">ตำแหน่ง/Position:</span>
                        <input type="text"
                            class="input input-sm input-ghost w-full rounded-none border-b border-base-300 focus:border-primary focus:bg-base-200/50 px-1 req"
                            id="empPos" name="empPos">
                    </div>
                </div>
            </div>

            <div class="mb-6">
                <div class="font-bold text-primary mb-2 text-sm flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    วัตถุประสงค์ในการขอจัดทำตราแสตมป์ / Purpose to Request
                </div>

                <div class="border border-base-300 p-4 rounded-lg bg-base-200/30">
                    <div id="purposeList" class="flex flex-col gap-3">
                    </div>
                    <div id="otherPurpose"></div>
                </div>
            </div>

            <div class="font-bold text-primary mb-2 mt-8 text-sm flex items-center gap-2">
                <input type="radio" id="radioStandard" name="stampFormatGroup" value="standard"
                    class="radio radio-primary radio-sm" checked>
                <label for="radioStandard" class="cursor-pointer flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    รูปแบบของตราแสตมป์ที่จัดทำ (ตามตำแหน่ง) / Standard format
                </label>
            </div>

            <div class="hidden">
                <input type="checkbox" id="chkP" name="SPOSCODE" value="02">
                <input type="checkbox" id="chkGM" name="SPOSCODE" value="05">
                <input type="checkbox" id="chkDIM" name="SPOSCODE" value="10">
                <input type="checkbox" id="chkDDIM" name="SPOSCODE" value="11">
                <input type="checkbox" id="chkDEM" name="SPOSCODE" value="20">
                <input type="checkbox" id="chkDDEM" name="SPOSCODE" value="21">
                <input type="checkbox" id="chkADV" name="SPOSCODE" value="90">
                <input type="checkbox" id="chkSSPE" name="SPOSCODE" value="22">
                <input type="checkbox" id="chkSEM" name="SPOSCODE" value="30">
                <input type="checkbox" id="chkSPE" name="SPOSCODE" value="32">
                <input type="checkbox" id="chkASM" name="SPOSCODE" value="33">
                <input type="checkbox" id="chkSUP" name="SPOSCODE" value="49">
                <input type="checkbox" id="chkFO" name="SPOSCODE" value="50">
                <input type="checkbox" id="chkLEA" name="SPOSCODE" value="55">
                <input type="checkbox" id="chkENG" name="SPOSCODE" value="35">
                <input type="checkbox" id="chkSTAFF" name="SPOSCODE" value="40">
            </div>

            <div id="standardStampSection"
                class="overflow-x-auto rounded-lg border border-base-300 shadow-sm mb-2 transition-opacity duration-300">
                <table class="w-full border-collapse text-left">
                    <thead class="bg-base-200 text-base-content/80 text-xs">
                        <tr>
                            <th class="border-b border-r border-base-300 p-3 w-1/3 text-center">รูปแบบ<br>Format</th>
                            <th class="border-b border-base-300 p-3 w-2/3">หมายเหตุ / Remark</th>
                        </tr>
                    </thead>
                    <tbody class="text-xs">
                        <tr class="transition-opacity duration-300" id="rowStamp1">
                            <td class="border-b border-r border-base-300 text-center p-4">
                                <div id="stampCircle1"
                                    class="w-[70px] h-[70px] rounded-full border-2 border-primary/50 text-primary flex flex-col justify-center items-center text-[9px] mx-auto overflow-hidden transition-all duration-300 ease-in-out bg-base-100 shadow-inner">
                                    <div class="w-full border-b border-primary/30 text-center pb-[2px] font-bold">AMEC
                                    </div>
                                    <div
                                        class="w-full border-b border-primary/30 text-center py-[2px] opacity-70 text-[8px]">
                                        DDMMYYYY</div>
                                    <div class="w-full flex justify-center pt-[2px] font-bold overflow-visible">
                                        <span id="name"
                                            class="origin-center whitespace-nowrap inline-block transition-transform duration-300">NAME</span>
                                    </div>
                                </div>
                            </td>
                            <td class="border-b border-base-300 p-3 align-top">

                                <div class="text-error/80 font-medium mb-2">โปรดระบุชื่อของผู้ใช้งาน
                                    (ภาษาอังกฤษ)<br>ที่จะนำใส่ในตรายางให้ชัดเจน:<br>
                                    <span class="text-base-content/70 font-normal italic">Identify name in English:</span>
                                </div>
                                <div class="flex items-end gap-2 mt-4">
                                    <span class="whitespace-nowrap font-semibold">ชื่อ/Name:</span>
                                    <input type="text"
                                        class="input input-sm input-ghost w-full rounded-none border-b border-base-300 focus:border-primary px-1"
                                        id="nameInput1" name="NAME_STAMP">
                                </div>
                            </td>
                        </tr>

                        <tr class="bg-base-50/30 transition-opacity duration-300" id="rowStamp2">
                            <td class="border-r border-base-300 text-center p-4">
                                <div id="stampCircle2"
                                    class="w-[70px] h-[70px] rounded-full border-2 border-primary/50 text-primary flex flex-col justify-center items-center text-[9px] mx-auto overflow-hidden transition-all duration-300 ease-in-out bg-base-100 shadow-inner">
                                    <div class="w-full border-b border-primary/30 flex justify-center pb-[2px] font-bold overflow-visible"
                                        id="divisionDisplay">
                                        <span id="division"
                                            class="origin-center whitespace-nowrap inline-block transition-transform duration-300">DIVISION</span>

                                    </div>
                                    <div
                                        class="w-full border-b border-primary/30 text-center py-[2px] opacity-70 text-[8px]">
                                        DDMMYYYY</div>
                                    <div class="w-full flex justify-center pt-[2px] font-bold overflow-visible">
                                        <span id="name2"
                                            class="origin-center whitespace-nowrap inline-block transition-transform duration-300">NAME</span>
                                    </div>
                                </div>
                            </td>
                            <td class="p-3 align-top">
                                <div class="text-error/80 font-medium mb-2">*โปรดระบุชื่อ และ ฝ่าย ของผู้ใช้งาน<br>
                                    <span class="text-base-content/70 font-normal italic">Identify name and division in
                                        English:</span>
                                </div>
                                <div class="flex flex-col gap-2 mt-3">
                                    <div class="flex items-end gap-2">
                                        <span class="whitespace-nowrap font-semibold">ชื่อ/Name:</span>
                                        <input type="text"
                                            class="input input-sm input-ghost w-full rounded-none border-b border-base-300 focus:border-primary px-1"
                                            id="nameInput2" name="NAME_STAMP">
                                    </div>


                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="alert alert-warning text-xs py-2 rounded-lg shadow-sm border border-warning/20 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-4 w-4" fill="none"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>หมายเหตุ: พนักงานระดับ Staff, Engineer และ Leader
                    ต้องได้รับการอนุมัติจากต้นสังกัดและผู้จัดการฝ่ายบริหารทรัพยากรและการเงิน</span>
            </div>

            <div class="font-bold text-sm flex items-center gap-2 my-2">
                <input type="radio" id="radioOther" name="stampFormatGroup" value="other"
                    class="radio radio-primary radio-sm">
                <label for="radioOther" class="cursor-pointer">
                    6. รูปแบบตราแสตมป์อื่นๆ
                    <span class="opacity-60 font-normal text-xs md:ml-1 block md:inline mt-1 md:mt-0">/ For other type
                        please specify:</span>
                </label>
            </div>
            <div class="border border-base-300 p-4 rounded-lg bg-base-200/30 transition-opacity duration-300"
                id="otherStampSection">

                <div class="flex flex-col md:flex-row justify-between md:items-start gap-4">

                    <div class="flex flex-col sm:flex-row gap-3 sm:gap-6">
                        <div class="flex items-center justify-start gap-2">
                            <span class="text-xs font-semibold opacity-70 whitespace-nowrap">ขนาด/Size:</span>
                            <input type="number"
                                class="input input-sm input-ghost w-24 rounded-none border-b border-base-300 focus:border-primary px-1 text-center"
                                id="otherSize" name="CUST_SIZE">
                        </div>
                        <div class="flex items-center justify-start gap-2">
                            <span class="text-xs font-semibold opacity-70 whitespace-nowrap">จำนวน/Qty:</span>
                            <input type="number"
                                class="input input-sm input-ghost w-24 rounded-none border-b border-base-300 focus:border-primary px-1 text-center"
                                id="otherQty" name="QTY" value="1">
                        </div>
                    </div>
                </div>

                <div class="flex flex-col gap-4 mt-6">
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-semibold opacity-70 whitespace-nowrap">แนบไฟล์/Attach file:</span>
                        <input type="file" class="file-input file-input-bordered file-input-sm "
                            id="otherAttachment" name="otherAttachment">
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-semibold opacity-70 whitespace-nowrap">หมายเหตุ/Remark:</span>
                        <textarea type="text"
                            class="input input-sm input-ghost grow rounded-none border-b border-base-300 focus:border-primary px-1"
                            id="otherRemark" name="otherRemark"></textarea>
                    </div>
                </div>
            </div>

            <div id="sentRequest"></div>
        </form>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/gpRB.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
