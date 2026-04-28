@extends('layouts/webflowTemplate')




@section('contents')
    <div
        class="bg-base-200 min-h-screen p-4 md:p-8 flex justify-center text-[13px] leading-relaxed font-sans text-base-content">
        <div class="max-w-[850px] w-full bg-base-100 p-8 shadow-2xl rounded-2xl border border-base-200">

            <div class="text-center mb-8">
                <h1 class="text-xl font-bold text-primary">แบบฟอร์มขออนุมัติทำตราแสตมป์</h1>
                <h2 class="text-sm font-semibold uppercase opacity-50 tracking-wider mt-1">Requisition Form for Rubber Stamp
                </h2>
            </div>

            

            <div class="border border-base-300 flex flex-col mb-6 rounded-lg overflow-hidden shadow-sm">
                <div class="flex border-b border-base-300 bg-base-50/50">
                    <div class="w-1/2 border-r border-base-300 p-2 flex items-center gap-2">
                        <span class="whitespace-nowrap font-semibold opacity-80 text-xs">ชื่อ/NAME:</span>
                        <input type="text"
                            class="input input-sm input-ghost w-full rounded-none border-b border-base-300 focus:border-primary focus:bg-base-200/50 px-1 req"
                            id="empName">
                    </div>
                    <div class="w-1/2 p-2 flex items-center gap-2">
                        <span class="whitespace-nowrap font-semibold opacity-80 text-xs">รหัสพนักงาน/Emp.Code:</span>
                        <input type="text"
                            class="input input-sm input-ghost w-full rounded-none border-b border-base-300 focus:border-primary focus:bg-base-200/50 px-1 req"
                            id="empCode">
                    </div>
                </div>
                <div class="flex bg-base-50/50">
                    <div class="w-1/2 border-r border-base-300 p-2 flex items-center gap-2">
                        <span class="whitespace-nowrap font-semibold opacity-80 text-xs">Sect./Dept./Div.:</span>
                        <input type="text"
                            class="input input-sm input-ghost w-full rounded-none border-b border-base-300 focus:border-primary focus:bg-base-200/50 px-1 req"
                            id="empDept">
                    </div>
                    <div class="w-1/2 p-2 flex items-center gap-2">
                        <span class="whitespace-nowrap font-semibold opacity-80 text-xs">ตำแหน่ง/Position:</span>
                        <input type="text"
                            class="input input-sm input-ghost w-full rounded-none border-b border-base-300 focus:border-primary focus:bg-base-200/50 px-1 req"
                            id="empPos">
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
                </div>
            </div>

            <div class="font-bold text-primary mb-2 mt-8 text-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                โปรดทำเครื่องหมาย &check; เพื่อเลือกรูปแบบของตราแสตมป์ / Choose type of rubber stamp
            </div>
            <div class="overflow-x-auto rounded-lg border border-base-300 shadow-sm mb-2">
                <table class="w-full border-collapse text-left">
                    <thead class="bg-base-200 text-base-content/80 text-xs">
                        <tr>
                            <th class="border-b border-r border-base-300 p-3 w-12 text-center">ลำดับ<br>No.</th>
                            <th class="border-b border-r border-base-300 p-3">ตำแหน่ง / Position</th>
                            <th class="border-b border-r border-base-300 p-3 w-20 text-center">ขนาด<br>Size</th>
                            <th class="border-b border-r border-base-300 p-3 w-32 text-center">รูปแบบ<br>Format</th>
                            <th class="border-b border-base-300 p-3">หมายเหตุ / Remark</th>
                        </tr>
                    </thead>
                    <tbody class="text-xs">
                        <tr class="hover:bg-base-200/20 transition-colors">
                            <td class="border-b border-r border-base-300 text-center font-medium">1</td>
                            <td class="border-b border-r border-base-300 p-3">
                                <label class="flex items-center space-x-2 cursor-pointer w-fit"><input type="checkbox"
                                        class="checkbox checkbox-primary checkbox-sm rounded-md" id="chkP">
                                    <span>P</span></label>
                            </td>
                            <td class="border-b border-r border-base-300 text-center text-base-content/70">22 mm.</td>
                            <td class="border-b border-r border-base-300 text-center p-4" rowspan="4">
                                <div id="stampCircle1"
                                    class="w-[70px] h-[70px] rounded-full border-2 border-primary/50 text-primary flex flex-col justify-center items-center text-[9px] mx-auto overflow-hidden transition-all duration-300 ease-in-out bg-base-100 shadow-inner">
                                    <div class="w-full border-b border-primary/30 text-center pb-1 font-bold">AMEC</div>
                                    <div class="w-full border-b border-primary/30 text-center py-1 opacity-70">DDMMYYYY
                                    </div>
                                    <div class="w-full text-center pt-1 font-bold" id="name">NAME</div>
                                </div>
                            </td>
                            <td class="border-b border-base-300 p-3 align-top" rowspan="4">
                                <div class="text-base-content/70 mb-2">โปรดระบุชื่อของผู้ใช้งาน
                                    (ภาษาอังกฤษ)<br>ที่จะนำใส่ในตรายางให้ชัดเจน:<br><span class="italic">Identify name in
                                        English:</span></div>
                                <div class="flex items-end gap-2">
                                    <span class="whitespace-nowrap font-semibold">ชื่อ/Name:</span>
                                    <input type="text"
                                        class="input input-sm input-ghost w-full rounded-none border-b border-base-300 focus:border-primary px-1">
                                </div>
                            </td>
                        </tr>
                        <tr class="hover:bg-base-200/20 transition-colors">
                            <td class="border-b border-r border-base-300 text-center font-medium">2</td>
                            <td class="border-b border-r border-base-300 p-3">
                                <div class="flex flex-wrap gap-4">
                                    <label class="flex items-center space-x-2 cursor-pointer"><input type="checkbox"
                                            class="checkbox checkbox-primary checkbox-sm rounded-md" id="chkGM">
                                        <span>GM</span></label>
                                    <label class="flex items-center space-x-2 cursor-pointer"><input type="checkbox"
                                            class="checkbox checkbox-primary checkbox-sm rounded-md" id="chkDIM">
                                        <span>DIM</span></label>
                                    <label class="flex items-center space-x-2 cursor-pointer"><input type="checkbox"
                                            class="checkbox checkbox-primary checkbox-sm rounded-md" id="chkDDIM">
                                        <span>DDIM</span></label>
                                </div>
                            </td>
                            <td class="border-b border-r border-base-300 text-center text-base-content/70">21 mm.</td>
                        </tr>
                        <tr class="hover:bg-base-200/20 transition-colors">
                            <td class="border-b border-r border-base-300 text-center font-medium">3</td>
                            <td class="border-b border-r border-base-300 p-3">
                                <div class="flex flex-wrap gap-4 mb-2">
                                    <label class="flex items-center space-x-2 cursor-pointer"><input type="checkbox"
                                            class="checkbox checkbox-primary checkbox-sm rounded-md" id="chkDEM">
                                        <span>DEM</span></label>
                                    <label class="flex items-center space-x-2 cursor-pointer"><input type="checkbox"
                                            class="checkbox checkbox-primary checkbox-sm rounded-md" id="chkDDEM">
                                        <span>DDEM</span></label>
                                    <label class="flex items-center space-x-2 cursor-pointer"><input type="checkbox"
                                            class="checkbox checkbox-primary checkbox-sm rounded-md" id="chkADV">
                                        <span>ADV</span></label>
                                </div>
                                <label class="flex items-center space-x-2 cursor-pointer w-fit"><input type="checkbox"
                                        class="checkbox checkbox-primary checkbox-sm rounded-md" id="chkSSPE">
                                    <span>Senior Specialist</span></label>
                            </td>
                            <td class="border-b border-r border-base-300 text-center text-base-content/70">19 mm.</td>
                        </tr>
                        <tr class="hover:bg-base-200/20 transition-colors">
                            <td class="border-b border-r border-base-300 text-center font-medium">4</td>
                            <td class="border-b border-r border-base-300 p-3">
                                <div class="flex gap-6">
                                    <label class="flex items-center space-x-2 cursor-pointer"><input type="checkbox"
                                            class="checkbox checkbox-primary checkbox-sm rounded-md" id="chkSEM">
                                        <span>SEM</span></label>
                                    <label class="flex items-center space-x-2 cursor-pointer"><input type="checkbox"
                                            class="checkbox checkbox-primary checkbox-sm rounded-md" id="chkSPE">
                                        <span>Specialist</span></label>
                                </div>
                            </td>
                            <td class="border-b border-r border-base-300 text-center text-base-content/70">17 mm.</td>
                        </tr>

                        <tr class="bg-base-50/30 hover:bg-base-200/20 transition-colors">
                            <td class="border-r border-base-300 text-center font-medium">5</td>
                            <td class="border-r border-base-300 p-3">
                                <div class="grid grid-cols-2 gap-3">
                                    <label class="flex items-center space-x-2 cursor-pointer"><input type="checkbox"
                                            class="checkbox checkbox-primary checkbox-sm rounded-md" id="chkASM">
                                        <span>ASM</span></label>
                                    <label class="flex items-center space-x-2 cursor-pointer"><input type="checkbox"
                                            class="checkbox checkbox-primary checkbox-sm rounded-md" id="chkSUP">
                                        <span>Supervisor</span></label>
                                    <label class="flex items-center space-x-2 cursor-pointer"><input type="checkbox"
                                            class="checkbox checkbox-primary checkbox-sm rounded-md" id="chkFO">
                                        <span>Foreman</span></label>
                                    <label class="flex items-center space-x-2 cursor-pointer"><input type="checkbox"
                                            class="checkbox checkbox-primary checkbox-sm rounded-md" id="chkLEA">
                                        <span>Leader</span></label>
                                    <label class="flex items-center space-x-2 cursor-pointer"><input type="checkbox"
                                            class="checkbox checkbox-primary checkbox-sm rounded-md" id="chkENG">
                                        <span>Engineer</span></label>
                                    <label class="flex items-center space-x-2 cursor-pointer"><input type="checkbox"
                                            class="checkbox checkbox-primary checkbox-sm rounded-md" id="chkSTAFF">
                                        <span>Staff</span></label>
                                </div>
                            </td>
                            <td class="border-r border-base-300 text-center text-base-content/70">15 mm.</td>
                            <td class="border-r border-base-300 text-center p-4">
                                <div id="stampCircle2"
                                    class="w-[70px] h-[70px] rounded-full border-2 border-primary/50 text-primary flex flex-col justify-center items-center text-[9px] mx-auto overflow-hidden transition-all duration-300 ease-in-out bg-base-100 shadow-inner">
                                    <div class="w-full border-b border-primary/30 text-center pb-1 font-bold">___DIV</div>
                                    <div class="w-full border-b border-primary/30 text-center py-1 opacity-70">DDMMYYYY
                                    </div>
                                    <div class="w-full text-center pt-1 font-bold">NAME</div>
                                </div>
                            </td>
                            <td class="p-3 align-top">
                                <div class="text-error/80 font-medium mb-2">*โปรดระบุชื่อ และ ฝ่าย ของผู้ใช้งาน<br><span
                                        class="text-base-content/70 font-normal italic">Identify name and division in
                                        English:</span></div>
                                <div class="flex flex-col gap-2 mt-3">
                                    <div class="flex items-end gap-2">
                                        <span class="whitespace-nowrap font-semibold">ชื่อ/Name:</span>
                                        <input type="text"
                                            class="input input-sm input-ghost w-full rounded-none border-b border-base-300 focus:border-primary px-1">
                                    </div>
                                    <div class="flex items-end gap-2">
                                        <span class="whitespace-nowrap font-semibold">ฝ่าย/Div.:</span>
                                        <input type="text"
                                            class="input input-sm input-ghost w-full rounded-none border-b border-base-300 focus:border-primary px-1">
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

            <div class="border border-base-300 p-4 rounded-lg bg-base-200/30 min-h-[140px] relative">
                <div class="font-bold text-sm mb-4">6. รูปแบบตราแสตมป์อื่นๆ <span
                        class="opacity-60 font-normal text-xs ml-1">/ For other type please specify:</span></div>

                <div class="absolute right-6 top-4 space-y-3">
                    <div class="flex items-center justify-end gap-2">
                        <span class="text-xs font-semibold opacity-70">ขนาด/Size:</span>
                        <input type="text"
                            class="input input-sm input-ghost w-32 rounded-none border-b border-base-300 focus:border-primary px-1 text-center">
                    </div>
                    <div class="flex items-center justify-end gap-2">
                        <span class="text-xs font-semibold opacity-70">จำนวน/Qty:</span>
                        <input type="text"
                            class="input input-sm input-ghost w-32 rounded-none border-b border-base-300 focus:border-primary px-1 text-center">
                    </div>
                </div>

                <div class="absolute bottom-4 left-4 right-4 flex items-end gap-2">
                    <span class="text-xs font-semibold opacity-70 whitespace-nowrap">หมายเหตุ/Remark:</span>
                    <input type="text"
                        class="input input-sm input-ghost grow rounded-none border-b border-base-300 focus:border-primary px-1">
                </div>
            </div>

            <div id="sentRequest"></div>
        </div>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/gpRB.js?ver={{ $GLOBALS['version'] }}"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            // การตั้งค่า: จับคู่ ID ของ Checkbox กับขนาด (พิกเซล) และวงกลมเป้าหมาย
            const stampConfig = {
                // กลุ่มวงกลมบน (stampCircle1)
                'chkP': {
                    size: 88,
                    target: 'stampCircle1'
                }, // 22 mm
                'chkGM': {
                    size: 84,
                    target: 'stampCircle1'
                }, // 21 mm
                'chkDIM': {
                    size: 84,
                    target: 'stampCircle1'
                }, // 21 mm
                'chkDDIM': {
                    size: 84,
                    target: 'stampCircle1'
                }, // 21 mm
                'chkDEM': {
                    size: 76,
                    target: 'stampCircle1'
                }, // 19 mm
                'chkDDEM': {
                    size: 76,
                    target: 'stampCircle1'
                }, // 19 mm
                'chkADV': {
                    size: 76,
                    target: 'stampCircle1'
                }, // 19 mm
                'chkSSPE': {
                    size: 76,
                    target: 'stampCircle1'
                }, // 19 mm
                'chkSEM': {
                    size: 68,
                    target: 'stampCircle1'
                }, // 17 mm
                'chkSPE': {
                    size: 68,
                    target: 'stampCircle1'
                }, // 17 mm

                // กลุ่มวงกลมล่าง (stampCircle2)
                'chkASM': {
                    size: 60,
                    target: 'stampCircle2'
                }, // 15 mm
                'chkSUP': {
                    size: 60,
                    target: 'stampCircle2'
                }, // 15 mm
                'chkFO': {
                    size: 60,
                    target: 'stampCircle2'
                }, // 15 mm
                'chkLEA': {
                    size: 60,
                    target: 'stampCircle2'
                }, // 15 mm
                'chkENG': {
                    size: 60,
                    target: 'stampCircle2'
                }, // 15 mm
                'chkSTAFF': {
                    size: 60,
                    target: 'stampCircle2'
                } // 15 mm
            };

            // ค้นหา Checkbox ทั้งหมดที่มี id ขึ้นต้นด้วย 'chk'
            const formatCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="chk"]');

            formatCheckboxes.forEach(cb => {
                cb.addEventListener('change', function() {
                    if (this.checked) {
                        // 1. ยกเลิกการติ๊กถูกที่ช่องอื่นๆ (จำลองการทำงานคล้าย Radio button)
                        formatCheckboxes.forEach(otherCb => {
                            if (otherCb !== this) {
                                otherCb.checked = false;
                            }
                        });

                        // 2. ดึงการตั้งค่าของ Checkbox ที่ถูกติ๊ก
                        const settings = stampConfig[this.id];
                        if (settings) {
                            const targetCircle = document.getElementById(settings.target);
                            if (targetCircle) {
                                // อัปเดตความกว้างและความสูง
                                targetCircle.style.width = settings.size + 'px';
                                targetCircle.style.height = settings.size + 'px';
                            }
                        }
                    } else {
                        // (ตัวเลือกเสริม) หากไม่ได้ติ๊กอะไรเลย ให้กลับไปใช้ขนาดเริ่มต้น (w-17.5 / h-17.5)
                        const settings = stampConfig[this.id];
                        if (settings) {
                            const targetCircle = document.getElementById(settings.target);
                            if (targetCircle) {
                                targetCircle.style.width = '';
                                targetCircle.style.height = '';
                            }
                        }
                    }
                });
            });
        });
    </script>
@endsection
