@extends('layouts/webflowTemplate')

{{-- span ไม่สามารถส่งค่าออกไปได้ จึงใช้ input แทน โดยตั้งค่าเป็น readonly และใช้ class ให้เหมือนกับ span
เพื่อให้ดูเหมือนกัน แต่ยังสามารถส่งค่าออกไปได้*/ --}}
@section('contents')
    <div
        class="bg-base-200 min-h-screen p-4 md:p-8 flex justify-center text-[13px] leading-relaxed font-sans text-base-content">
        <div class="max-w-212 w-full bg-base-100 p-8 shadow-2xl rounded-2xl border border-base-200" id="rbForm">

            <div class="text-center mb-8">
                <h1 class="text-xl font-bold text-primary">แบบฟอร์มขออนุมัติทำตราแสตมป์</h1>
                <h2 class="text-sm font-semibold uppercase opacity-50 tracking-wider mt-1">Requisition Form for Rubber Stamp
                </h2>
            </div>


            <div class="border border-base-300 flex flex-col mb-6 rounded-lg overflow-hidden shadow-sm">
                <div class="flex border-b border-base-300 bg-base-50/50">
                    <div class="w-full p-2 flex items-center gap-2">
                        <span class="whitespace-nowrap font-semibold opacity-80 text-xs min-w-30">Form No:</span>
                        <div id="formNo"
                            class="w-full min-h-8 rounded-md border border-base-300 bg-base-100 px-3 py-1 flex items-center">
                        </div>
                        <input type="hidden" name="NFRMNO" value="{{ $NFRMNO }}">
                        <input type="hidden" name="VORGNO" value="{{ $VORGNO }}">
                        <input type="hidden" name="CYEAR" value="{{ $CYEAR }}">
                        <input type="hidden" name="CYEAR2" value="{{ $CYEAR2 }}">
                        <input type="hidden" name="NRUNNO" value="{{ $NRUNNO }}">
                    </div>
                </div>
                <div class="flex border-b border-base-300 bg-base-50/50">
                    <div class="w-full p-2 flex items-center gap-2">
                        <span class="whitespace-nowrap font-semibold opacity-80 text-xs min-w-30">Input by:</span>
                        <div id="INPUTBY"
                            class="w-full min-h-8 rounded-md border border-base-300 bg-base-100 px-3 py-1 flex items-center">
                        </div>
                    </div>
                </div>

                <div class="flex border-b border-base-300 bg-base-50/50">
                    <div class="w-1/2 p-2 flex items-center gap-2">
                        <span class="whitespace-nowrap font-semibold opacity-80 text-xs min-w-30">Request by:</span>
                        <div id="REQBY"
                            class="w-full min-h-8 rounded-md border border-base-300 bg-base-100 px-3 py-1 flex items-center">
                        </div>
                    </div>
                    <div class="w-1/2 border-r border-base-300 p-2 flex items-center gap-2">
                        <span class="whitespace-nowrap font-semibold opacity-80 text-xs min-w-25">ชื่อ/NAME:</span>
                        <div id="empName"
                            class="w-full min-h-8 rounded-md border border-base-300 bg-base-100 px-3 py-1 flex items-center">
                        </div>
                    </div>

                </div>

                <div class="flex bg-base-50/50">
                    <div class="w-1/2 border-r border-base-300 p-2 flex items-center gap-2">
                        <span class="whitespace-nowrap font-semibold opacity-80 text-xs min-w-30">Sect./Dept./Div.:</span>
                        <div
                            id="empDept"class="w-full min-h-[2rem] rounded-md border border-base-300 bg-base-100 px-3 py-1 flex items-center">
                        </div>
                    </div>
                    <div class="w-1/2 p-2 flex items-center gap-2">
                        <span class="whitespace-nowrap font-semibold opacity-80 text-xs min-w-25">ตำแหน่ง/Position:</span>
                        <div
                            id="empPos"class="w-full min-h-[2rem] rounded-md border border-base-300 bg-base-100 px-3 py-1 flex items-center">
                        </div>
                    </div>
                </div>
            </div>

            <div id="standardStampSection">
                <div class="font-bold text-primary mb-5 mt-8 text-sm flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <label for="radioStandard" class="cursor-pointer flex items-center gap-2">
                        รูปแบบของตราแสตมป์ตามตำแหน่ง / Standard format
                    </label>
                </div>

                <div class="mb-6">
                    <div class="border border-base-300 p-4 rounded-lg bg-base-200/30">
                        <div class="font-bold text-primary mb-6 text-sm flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                            วัตถุประสงค์ในการขอจัดทำตราแสตมป์ / Purpose to Request
                        </div>
                        <div id="purposeList" class="flex flex-col gap-3">
                        </div>
                    </div>
                </div>

                <div
                    class="overflow-x-auto rounded-lg border border-base-300 shadow-sm mb-2 transition-opacity duration-300">
                    <table class="w-full border-collapse text-left">
                        <thead class="bg-base-200 text-base-content/80 text-xs">
                            <tr>
                                <th class="border-b border-r border-base-300 p-3 w-[15%] text-center">ขนาด<br>Size</th>
                                <th class="border-b border-r border-base-300 p-3 w-1/3 text-center">รูปแบบ<br>Format</th>
                                <th class="border-b border-base-300 p-3 w-2/3">หมายเหตุ / Remark</th>
                            </tr>
                        </thead>
                        <tbody class="text-xs">
                            <tr class="transition-opacity duration-300" id="rowStamp1">
                                <td class="border-b border-r border-base-300 text-center p-3 align-middle">
                                    <div class="font-bold text-primary text-sm" id="stampSize">
                                        -
                                    </div>
                                </td>
                                <td class="border-b border-r border-base-300 text-center p-4">
                                    <div id="stampCircle"
                                        class="w-20 h-20 rounded-full border-2 border-primary/50 text-primary flex flex-col justify-center items-center text-[9px] mx-auto overflow-hidden transition-all duration-300 ease-in-out bg-base-100 shadow-inner">
                                        <div class="w-full border-b border-primary/30 text-center pb-1 font-bold"
                                            id="stampCircle-label">AMEC
                                        </div>
                                        <div
                                            class="w-full border-b border-primary/30 text-center py-1 opacity-70 text-[8px]">
                                            DDMMYYYY</div>
                                        <div class="w-full flex justify-center pt-1 font-bold overflow-visible">
                                            <span
                                                class="origin-center whitespace-nowrap inline-block transition-transform duration-300"
                                                id="stampCircle-name">NAME</span>
                                        </div>
                                    </div>
                                </td>
                                <td class="border-b border-base-300 p-3 align-top">
                                    <div class="flex items-end gap-2 mt-4">
                                        <span class="whitespace-nowrap font-semibold items-center">ชื่อ/Name:</span>
                                        <input type="text"
                                            class="input input-sm input-ghost w-full rounded-none border-b border-base-300 focus:border-primary px-1"
                                            id="nameInput" name="NAME_STAMP" readonly>
                                        <input type="hidden" name="REQ_QTY" value="1">
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
            </div>

            <div id="otherStampSection" class="hidden">
                <div class="font-bold text-primary mb-5 mt-8 text-sm flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <label for="radioStandard" class="cursor-pointer flex items-center gap-2">
                        รูปแบบตราแสตมป์อื่นๆ/ For other type
                    </label>
                </div>
                <div class="border border-base-300 p-4 rounded-lg bg-base-200/30 transition-opacity duration-300"
                    id="otherStampSection">
                    <fieldset class="fieldset">
                        <legend class="fieldset-legend text-sm">เหตุผลในการใช้งาน / The reason for using</legend>
                        <textarea class="textarea h-24 w-full" id="otherReason" name="PURPOSE_OTHER" placeholder="Reason" readonly></textarea>
                    </fieldset>
                    <div class="flex gap-4 mt-6">
                        <label for="otherQty" class="fieldset-legend whitespace-nowrap w-32">จำนวน/Qty:</label>
                        <input type="number"
                            class="input input-sm input-ghost w-24 rounded-none border-b border-base-300 focus:border-primary px-1 text-center"
                            id="otherQty" name="REQ_QTY" value="1" readonly>
                    </div>
                    <div class="flex gap-4 mt-6">
                        <label for="otherQty" class="fieldset-legend whitespace-nowrap w-32">แนบไฟล์/Attach file:</label>
                        <div id="otherFile" class="file-list"></div>
                    </div>
                </div>
            </div>
            <div id="sentApprove" class ="mt-5"></div>
        </div>
    @endsection

    @section('scripts')
        <script src="{{ $_ENV['APP_JS'] }}/gpRBview.js?ver={{ $GLOBALS['version'] }}"></script>
    @endsection
