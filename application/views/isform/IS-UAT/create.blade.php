@extends('layouts/webflowTemplate')

@section('contents')
    <form action="" id="form-is-uat">
        <input type="text" class="hidden" id="MODE" value="{{ $mode ?? 1 }}" />
        <input type="text" class="hidden" id="STATUS" value="1" data-map="STATUS" />
        <input type="text" class="hidden" id="NFRMNO" value="{{ $NFRMNO }}" data-map="NFRMNO" />
        <input type="text" class="hidden" id="VORGNO" value="{{ $VORGNO }}" data-map="VORGNO" />
        <input type="text" class="hidden" id="CYEAR" value="{{ $CYEAR }}" data-map="CYEAR" />
        <input type="text" class="hidden" id="CYEAR2" value="{{ $CYEAR2 ?? '' }}" />
        <input type="text" class="hidden" id="NRUNNO" value="{{ $NRUNNO ?? 0 }}" />
        <input type="text" class="hidden" id="EMPNO" value="{{ $EMPNO }}" name="input_by" data-map="INPUTBY" />

        <section class="flex flex-col gap-4 mb-6">
            <div class="flex flex-col gap-1">
                <h1 class="text-3xl font-bold text-primary">User Acceptance Testing (UAT) Form</h1>
                <p class="text-sm text-gray-500">แบบฟอร์มสร้างรายการทดสอบระบบเพื่อให้ผู้ใช้งาน (User) ตรวจสอบและยืนยันความถูกต้องก่อนนำขึ้นใช้งานจริง</p>
            </div>

            {{-- Section 1: Participants --}}
            <fieldset class="bg-primary/10 border border-primary rounded-xl p-5">
                <legend class="font-semibold text-lg px-1">ผู้เกี่ยวข้อง (Participants)</legend>
                <div class="flex flex-col md:flex-row gap-8">
                    {{-- Tester / User --}}
                    <fieldset class="fieldset flex-1">
                        <legend class="fieldset-legend">Tester / User (ผู้ทดสอบระบบ) <span class="text-red-500">*</span></legend>
                        <input type="text" class="input w-full hidden req-1" placeholder="ระบุรหัสพนักงานผู้ทดสอบ (Employee No.)"
                            id="tester-by-input" value="{{ $EMPNO }}" name="tester_by" data-map="TESTER" />
                        <div class="flex items-center gap-3" id="tester-by-info">
                            <div class="avatar flex-none">
                                <div class="w-16 rounded-full" id="tester-by-img">
                                    <div class="skeleton h-16 w-16"></div>
                                    <img src="#" class="hidden" />
                                </div>
                            </div>
                            <div class="flex-none min-w-56 flex flex-col gap-1">
                                <h1 class="font-bold text-md" id="tester-by-name">
                                    <div class="skeleton h-6 w-48"></div>
                                </h1>
                                <h2 id="tester-by-id">
                                    <div class="skeleton h-5 w-32"></div>
                                </h2>
                                <div class="text-xs text-gray-500" id="tester-by-organization">
                                    <div class="skeleton h-5 w-56"></div>
                                </div>
                            </div>
                            <div class="tooltip" data-tip="เปลี่ยนผู้ทดสอบระบบ">
                                <a href="#" class="btn btn-ghost btn-circle" id="change-tester-employee">
                                    <i class="fi fi-rs-cross text-xl text-red-500"></i>
                                </a>
                            </div>
                        </div>
                    </fieldset>

                    {{-- Created By / Developer --}}
                    <fieldset class="fieldset flex-1">
                        <legend class="fieldset-legend">Prepared By / Developer (ผู้จัดทำ UAT)</legend>
                        <div class="flex items-center gap-3" id="input-by-info">
                            <div class="avatar flex-none">
                                <div class="w-16 rounded-full" id="input-by-img">
                                    <div class="skeleton h-16 w-16"></div>
                                    <img src="#" class="hidden" />
                                </div>
                            </div>
                            <div class="flex-1 flex flex-col gap-1">
                                <h1 class="font-bold text-md" id="input-by-name">
                                    <div class="skeleton h-6 w-48"></div>
                                </h1>
                                <h2 id="input-by-id">
                                    <div class="skeleton h-5 w-32"></div>
                                </h2>
                                <div class="text-xs text-gray-500" id="input-by-organization">
                                    <div class="skeleton h-5 w-72"></div>
                                </div>
                            </div>
                        </div>
                    </fieldset>
                </div>
            </fieldset>

            {{-- Section 2: UAT General Information --}}
            <fieldset class="bg-primary/10 border border-primary rounded-xl p-5">
                <legend class="font-semibold text-lg px-1">UAT General Information (ข้อมูลทั่วไปของการทดสอบ)</legend>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">Reference Request No. (อ้างอิงเลขที่คำขอ IS-DEV)</legend>
                        <input type="text" class="input w-full" name="ref_formno" id="ref-formno"
                            placeholder="เช่น IS-DEV26-000001" data-map="REF_FORMNO" />
                    </fieldset>

                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">System / Program Name (ชื่อระบบ / โปรแกรม) <span class="text-red-500">*</span></legend>
                        <input type="text" class="input w-full req-1" name="system_name" id="system-name"
                            placeholder="ชื่อระบบหรือโปรแกรมที่ต้องการให้ทดสอบ เช่น Webflow, SCM, Procurement"
                            data-map="SYSTEMNAME" />
                    </fieldset>
                </div>

                <fieldset class="fieldset">
                    <legend class="fieldset-legend">UAT Title (หัวข้อการทดสอบ UAT) <span class="text-red-500">*</span></legend>
                    <input type="text" class="input w-full req-1" name="title" id="uat-title"
                        placeholder="ระบุหัวข้อหรือเวอร์ชันที่ต้องการให้ทดสอบ เช่น ทดสอบระบบอนุมัติคำขอพัฒนาโปรแกรม v1.2"
                        data-map="TITLE" />
                </fieldset>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">Test Environment (สภาพแวดล้อมที่ใช้ทดสอบ)</legend>
                        <ul class="flex flex-wrap gap-5 pt-2">
                            <li class="flex items-center gap-2">
                                <input type="radio" name="environment" class="radio radio-primary uat-env" value="UAT" checked />
                                <span>UAT / Staging</span>
                            </li>
                            <li class="flex items-center gap-2">
                                <input type="radio" name="environment" class="radio radio-primary uat-env" value="DEV" />
                                <span>Development</span>
                            </li>
                            <li class="flex items-center gap-2">
                                <input type="radio" name="environment" class="radio radio-primary uat-env" value="PROD_PILOT" />
                                <span>Production (Pilot)</span>
                            </li>
                        </ul>
                    </fieldset>

                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">Test URL / Access Link (ลิงก์สำหรับเข้าทดสอบ)</legend>
                        <input type="url" class="input w-full" name="test_url" id="test-url"
                            placeholder="https://uat.example.com/..." data-map="TEST_URL" />
                    </fieldset>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">UAT Start Date (วันที่เริ่มทดสอบ) <span class="text-red-500">*</span></legend>
                        <label class="input w-full">
                            <input type="text" class="grow fdate req-1" id="uat-start" name="uat_start"
                                placeholder="{{ date('Y-m-d') }}" data-map="UAT_START" />
                            <i class="fi fi-rr-calendar text-gray-500"></i>
                        </label>
                    </fieldset>

                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">UAT End Date (วันที่สิ้นสุดการทดสอบ) <span class="text-red-500">*</span></legend>
                        <label class="input w-full">
                            <input type="text" class="grow fdate req-1" id="uat-end" name="uat_end"
                                placeholder="{{ date('Y-m-d') }}" data-map="UAT_END" />
                            <i class="fi fi-rr-calendar text-gray-500"></i>
                        </label>
                    </fieldset>
                </div>

                <fieldset class="fieldset">
                    <legend class="fieldset-legend">Objective &amp; Test Scope (วัตถุประสงค์และขอบเขตการทดสอบ) <span class="text-red-500">*</span></legend>
                    <textarea class="textarea w-full h-36 text-comment req-1" name="objective" id="uat-objective" maxlength="1000"
                        placeholder="อธิบายวัตถุประสงค์ ขอบเขตของฟีเจอร์ที่มีการเปลี่ยนแปลง หรือสิ่งที่ต้องการให้ User ตรวจสอบ"
                        data-map="OBJECTIVE"></textarea>
                    <div class="label text-xs justify-start text-red-500 text-comment-err"></div>
                    <div class="label text-xs justify-end text-count">
                        <span class="text-count-no" id="objective-count">0</span>/1000
                    </div>
                </fieldset>

                <fieldset class="fieldset">
                    <legend class="fieldset-legend">Prerequisite / Test Account (เงื่อนไขก่อนทดสอบ / บัญชีสำหรับทดสอบ)</legend>
                    <textarea class="textarea w-full h-24" name="prerequisite" id="uat-prerequisite" maxlength="1000"
                        placeholder="ระบุ Test Account, สิทธิ์การใช้งาน หรือข้อมูลตั้งต้นที่ต้องเตรียมก่อนเริ่มทดสอบ (ถ้ามี)"
                        data-map="PREREQUISITE"></textarea>
                </fieldset>

                <fieldset class="fieldset">
                    <div class="flex items-center">
                        <legend class="flex-1 fieldset-legend">Attachments (เอกสารประกอบการทดสอบ / คู่มือการใช้งาน)</legend>
                        <button class="btn btn-primary btn-sm" id="add-file" type="button">+ เพิ่มไฟล์</button>
                    </div>
                    <p class="label text-xs">แนบเอกสารที่เกี่ยวข้อง เช่น User Manual, Test Data, Screenshot ตัวอย่าง เป็นต้น</p>
                    <div class="flex flex-col gap-2 file-input-wrap">
                        <div class="flex items-center gap-2 file-row">
                            <input type="file" class="file-input file-input-sm w-full attachments" name="attachments[]" />
                        </div>
                    </div>
                    <div id="existing-attachments" class="mt-2 hidden">
                        <p class="text-xs font-semibold text-gray-600 mb-1">ไฟล์แนบเดิม:</p>
                        <ul class="list-disc list-inside text-sm space-y-1" id="existing-attachments-list"></ul>
                    </div>
                </fieldset>
            </fieldset>

            {{-- Section 3: Test Cases / Scenarios --}}
            <fieldset class="bg-primary/10 border border-primary rounded-xl p-5">
                <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div class="flex items-center gap-2">
                        <legend class="font-semibold text-lg px-1">Test Cases / Scenarios (รายการทดสอบ)</legend>
                        <span class="badge badge-primary badge-outline" id="testcase-count-badge">0 รายการ</span>
                    </div>
                    <button type="button" class="btn btn-primary btn-sm" id="add-testcase-row">
                        <i class="fi fi-rr-plus"></i> เพิ่ม Test Case
                    </button>
                </div>

                <div class="overflow-x-auto border border-slate-300 rounded-xl bg-white">
                    <table class="table table-sm w-full" id="table-testcases">
                        <thead class="bg-primary/15 text-base-content">
                            <tr>
                                <th class="w-20 text-center">No.</th>
                                <th class="w-44">Module / Feature</th>
                                <th class="min-w-52">Test Case / Scenario <span class="text-red-500">*</span></th>
                                <th class="min-w-60">Test Steps (ขั้นตอนการทดสอบ)</th>
                                <th class="min-w-60">Expected Result (ผลลัพธ์ที่คาดหวัง) <span class="text-red-500">*</span></th>
                                <th class="w-16 text-center">ลบ</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
                <p class="text-xs text-gray-500 mt-2">* กรุณาระบุรายการ Test Case อย่างน้อย 1 รายการ เพื่อให้ผู้ทดสอบสามารถตรวจสอบตามขั้นตอนได้ครบถ้วน</p>
            </fieldset>

            {{-- Action Buttons --}}
            <div class="flex flex-wrap gap-3 mt-2">
                <button type="button" class="btn btn-primary btn-outline" id="save-draft-form">
                    <i class="fi fi-tr-circle-ellipsis-vertical"></i> Save Draft
                </button>
                <button type="button" class="btn btn-primary" id="confirm-form">
                    <i class="fi fi-tr-multiple"></i> Submit UAT
                </button>
            </div>
        </section>
    </form>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/uatForm.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection

@section('styles')
    <style>
        #table-testcases tbody tr td {
            vertical-align: top;
            padding: 0.5rem;
        }
        #table-testcases tbody tr:not(:last-child) td {
            border-bottom: 1px solid var(--color-gray-200);
        }
    </style>
@endsection
