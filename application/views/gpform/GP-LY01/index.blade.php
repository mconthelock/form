@extends('layouts/webflowTemplate')

@section('contents')
    <input type="text" class="hidden" id="NFRMNO" value="{{ $NFRMNO }}" />
    <input type="text" class="hidden" id="VORGNO" value="{{ $VORGNO }}" />
    <input type="text" class="hidden" id="CYEAR" value="{{ $CYEAR }}" />
    <input type="text" class="hidden" id="CYEAR2" value="{{ $CYEAR2 }}" />
    <input type="text" class="hidden" id="NRUNNO" value="{{ $NRUNNO }}" />
    <input type="text" class="hidden" id="EMPNO" value="{{ $EMPNO }}" />

    <main class="flex flex-col gap-4">
        <header class="flex grow">
            <div class="flex flex-row flex-1 gap-2 items-center">
                <h1 class="bg-black text-white w-12 h-12 flex items-center justify-center text-4xl font-mono font-bold">GP
                </h1>
                <div class="flex flex-col gap-0">
                    <h2 class="text-2xl">แบบแก้ไขสิทธิลดหย่อนภาษีประจำปี</h2>
                    <h3 class="text-sm text-gray-400">แบบแก้ไขสิทธิลดหย่อนภาษีประจำปี</h3>
                </div>
            </div> <!-- Close flex flex-col gap-2 -->
            <div class="flex flex-row gap-2 px-4 py-2 bg-[#f0fdf4] border border-[#86efac] text-[#15803d] ">
                <i class="fi fi-rr-comment-check text-3xl"></i>
                <div class="flex flex-col gap-0">
                    <h3 class="font-bold text-md uppercase">Approved</h3>
                    <h4 class="text-[10px]">อนุมัติแล้วสมบูรณ์</h4>
                </div>
            </div>
        </header>

        <section class="bg-gray-200 border border-gray-300">
            <div class="flex gap-8 text-sm p-4">
                <div class="flex gap-2 items-center">
                    <h1>Form No:</h1>
                    <span class="font-mono bg-white border border-gray-300 px-2 py-1">GP-LY0126-000006</span>
                    <a href="#"><i class="fi fi-rr-copy-alt text-md"></i></a>
                </div>
                <div class="flex gap-2 items-center">
                    <i class="fi fi-rr-calendar-day"></i>
                    <h1>Create Date:</h1>
                    <span class="font-mono px-2 py-1">2026-08-12 15:11:01</span>
                </div>
            </div>

            <div class="flex bg-white py-2 px-5">
                <div class="flex-1">
                    <h1 class="font-mono font-bold text-gray-600">REQUESTED BY</h1>
                    <div class="flex gap-3 items-center">
                        <div class="avatar">
                            <div class="w-14 rounded">
                                <img alt="Tailwind-CSS-Avatar-component"
                                    src="https://img.daisyui.com/images/profile/demo/batperson@192.webp" />
                            </div>
                        </div>
                        <div>
                            <div class="text-md text-text-muted">อุมาพร บุญชู/Chalormsak S.(12069)</div>
                            <div class="text-sm text-gray-500">INTERPRETER</div>
                            <div class="text-sm text-gray-500">QA DIV./No Department/No Section</div>
                            <div class="text-sm text-gray-500">umaporn@MitsubishiElevatorAsia.co.th</div>
                        </div>
                    </div>
                </div>
                <div class="flex-1">
                    <h1 class="font-mono font-bold text-gray-600">REQUESTED BY</h1>
                    <div class="flex gap-3 items-center">
                        <div class="avatar">
                            <div class="w-14 rounded">
                                <img alt="Tailwind-CSS-Avatar-component"
                                    src="https://img.daisyui.com/images/profile/demo/batperson@192.webp" />
                            </div>
                        </div>
                        <div>
                            <div class="text-md text-text-muted">อุมาพร บุญชู/Chalormsak S.(12069)</div>
                            <div class="text-sm text-gray-500">INTERPRETER</div>
                            <div class="text-sm text-gray-500">QA DIV./No Department/No Section</div>
                            <div class="text-sm text-gray-500">umaporn@MitsubishiElevatorAsia.co.th</div>
                        </div>
                    </div>
                </div>
                <div class="flex-1">
                    <h1 class="font-mono font-bold text-gray-600">PURPOSE & JUSTIFICATION / REMARK</h1>
                    <div class="flex gap-3 items-center">
                        <div class="avatar">
                            <div class="w-14 rounded">
                                <img alt="Tailwind-CSS-Avatar-component"
                                    src="https://img.daisyui.com/images/profile/demo/batperson@192.webp" />
                            </div>
                        </div>
                        <div>
                            <div class="text-md text-text-muted">อุมาพร บุญชู/Chalormsak S.(12069)</div>
                            <div class="text-sm text-gray-500">INTERPRETER</div>
                            <div class="text-sm text-gray-500">QA DIV./No Department/No Section</div>
                            <div class="text-sm text-gray-500">umaporn@MitsubishiElevatorAsia.co.th</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="border border-gray-300">
            <table class="table table-bordered tax-table w-full">
                <thead>
                    <tr class="bg-blue-900 text-white">
                        <th width="25%">รายการ</th>
                        <th width="35%">อัตราค่าลดหย่อน</th>
                        <th width="12%">ข้อมูลปัจจุบัน</th>
                        <th width="28%">รายละเอียด</th>
                    </tr>
                </thead>
                <tbody id="tax-form-tbody">
                    <tr>
                        <td colspan="4" class="text-center py-10 text-slate-400">
                            <span class="loading loading-spinner loading-md text-primary"></span>
                            <span class="ml-2 font-medium text-slate-600">กำลังโหลดรายการสิทธิลดหย่อน...</span>
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr class="bg-gray-300">
                        <th colspan="2" class="text-center total font-bold">รวมรายการลดหย่อน</th>
                        <th class="text-end total font-mono font-bold" id="table-tax-total">0.00</th>
                        <td class="text-strat total font-mono font-bold text-blue-700" id="input-tax-total">0.00</td>
                    </tr>
                </tfoot>
            </table>
        </section>
    </main>
@endsection


@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/gpLY01.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection
