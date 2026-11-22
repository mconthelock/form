@extends('layouts/webflowTemplate')

@section('contents')
    <input type="text" class="hidden" id="NFRMNO" value="{{ $NFRMNO }}" />
    <input type="text" class="hidden" id="VORGNO" value="{{ $VORGNO }}" />
    <input type="text" class="hidden" id="CYEAR" value="{{ $CYEAR }}" />
    <input type="text" class="hidden" id="CYEAR2" value="{{ $CYEAR2 }}" />
    <input type="text" class="hidden" id="NRUNNO" value="{{ $NRUNNO }}" />
    <input type="text" class="hidden" id="EMPNO" value="{{ $EMPNO }}" />
    <input type="text" class="hidden" id="MODE" value="{{ $mode ?? 2 }}" />

    <section class="flex flex-col gap-4 mb-6" id="form-data">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
                <h1 class="text-3xl font-bold text-primary">User Acceptance Testing (UAT) Form</h1>
                <p class="text-sm text-gray-500">ตรวจสอบรายละเอียด บันทึกผลการทดสอบจริง และยืนยันการอนุมัติ UAT</p>
            </div>
            <div id="uat-status-badge">
                <span class="badge badge-ghost badge-lg">Loading...</span>
            </div>
        </div>

        {{-- Section 1: General Info --}}
        <fieldset class="bg-primary/10 border border-primary rounded-xl p-5">
            <legend class="font-semibold text-lg px-1">UAT General Information (ข้อมูลทั่วไปของการทดสอบ)</legend>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <fieldset class="fieldset">
                    <legend class="fieldset-legend">Form No.</legend>
                    <div class="p-2.5 border border-gray-300 border-dotted rounded-xl bg-white font-semibold" id="view-formno">
                        <div class="skeleton h-6 w-48"></div>
                    </div>
                </fieldset>

                <fieldset class="fieldset">
                    <legend class="fieldset-legend">Reference Request No. (อ้างอิง IS-DEV)</legend>
                    <div class="p-2.5 border border-gray-300 border-dotted rounded-xl bg-white map-data"
                        data-key="REF_FORMNO" data-group="">
                        <div class="skeleton h-6 w-48"></div>
                    </div>
                </fieldset>

                <fieldset class="fieldset">
                    <legend class="fieldset-legend">Tester / User (ผู้ทดสอบระบบ)</legend>
                    <div class="p-2.5 border border-gray-300 border-dotted rounded-xl bg-white" id="view-tester">
                        <div class="skeleton h-6 w-64"></div>
                    </div>
                </fieldset>

                <fieldset class="fieldset">
                    <legend class="fieldset-legend">Prepared By / Developer (ผู้จัดทำ UAT)</legend>
                    <div class="p-2.5 border border-gray-300 border-dotted rounded-xl bg-white" id="view-inputby">
                        <div class="skeleton h-6 w-64"></div>
                    </div>
                </fieldset>

                <fieldset class="fieldset">
                    <legend class="fieldset-legend">System / Program Name</legend>
                    <div class="p-2.5 border border-gray-300 border-dotted rounded-xl bg-white map-data"
                        data-key="SYSTEMNAME" data-group="">
                        <div class="skeleton h-6 w-64"></div>
                    </div>
                </fieldset>

                <fieldset class="fieldset">
                    <legend class="fieldset-legend">Test Environment</legend>
                    <div class="p-2.5 border border-gray-300 border-dotted rounded-xl bg-white map-data"
                        data-key="ENVIRONMENT_TXT" data-group="">
                        <div class="skeleton h-6 w-40"></div>
                    </div>
                </fieldset>
            </div>

            <fieldset class="fieldset">
                <legend class="fieldset-legend">UAT Title</legend>
                <div class="p-2.5 border border-gray-300 border-dotted rounded-xl bg-white font-medium map-data"
                    data-key="TITLE" data-group="">
                    <div class="skeleton h-6 w-96"></div>
                </div>
            </fieldset>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <fieldset class="fieldset">
                    <legend class="fieldset-legend">Test URL / Access Link</legend>
                    <div class="p-2.5 border border-gray-300 border-dotted rounded-xl bg-white" id="view-test-url">
                        <div class="skeleton h-6 w-64"></div>
                    </div>
                </fieldset>

                <fieldset class="fieldset">
                    <legend class="fieldset-legend">UAT Period (ช่วงเวลาทดสอบ)</legend>
                    <div class="p-2.5 border border-gray-300 border-dotted rounded-xl bg-white map-data"
                        data-key="UAT_PERIOD" data-group="">
                        <div class="skeleton h-6 w-56"></div>
                    </div>
                </fieldset>
            </div>

            <fieldset class="fieldset">
                <legend class="fieldset-legend">Objective &amp; Test Scope</legend>
                <div class="p-2.5 border border-gray-300 border-dotted rounded-xl bg-white min-h-20 map-data"
                    data-key="OBJECTIVE" data-group="">
                    <div class="skeleton h-6 w-full"></div>
                </div>
            </fieldset>

            <fieldset class="fieldset">
                <legend class="fieldset-legend">Prerequisite / Test Account</legend>
                <div class="p-2.5 border border-gray-300 border-dotted rounded-xl bg-white min-h-12 map-data"
                    data-key="PREREQUISITE" data-group="">
                    <div class="skeleton h-6 w-full"></div>
                </div>
            </fieldset>

            <fieldset class="fieldset">
                <legend class="fieldset-legend">Attachments (เอกสารประกอบการทดสอบ)</legend>
                <div class="p-2.5 border border-gray-300 border-dotted rounded-xl bg-white">
                    <ul id="view-attachments" class="list-disc list-inside text-sm space-y-1">
                        <li class="text-gray-400 list-none">ไม่มีไฟล์แนบ</li>
                    </ul>
                </div>
            </fieldset>
        </fieldset>

        {{-- Section 2: Summary Progress --}}
        <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div class="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-xs">
                <div class="text-xs text-gray-500">Total Cases</div>
                <div class="text-2xl font-bold text-primary" id="stat-total">0</div>
            </div>
            <div class="bg-success/10 border border-success/40 rounded-xl p-4 text-center shadow-xs">
                <div class="text-xs text-success">Passed</div>
                <div class="text-2xl font-bold text-success" id="stat-pass">0</div>
            </div>
            <div class="bg-error/10 border border-error/40 rounded-xl p-4 text-center shadow-xs">
                <div class="text-xs text-error">Failed</div>
                <div class="text-2xl font-bold text-error" id="stat-fail">0</div>
            </div>
            <div class="bg-warning/10 border border-warning/40 rounded-xl p-4 text-center shadow-xs">
                <div class="text-xs text-warning">Pending</div>
                <div class="text-2xl font-bold text-warning" id="stat-pending">0</div>
            </div>
            <div class="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-center gap-1 col-span-2 md:col-span-1 shadow-xs">
                <div class="flex justify-between text-xs text-gray-600">
                    <span>Pass Rate</span>
                    <span class="font-bold" id="stat-rate">0%</span>
                </div>
                <progress class="progress progress-success w-full" id="stat-progress" value="0" max="100"></progress>
            </div>
        </div>

        {{-- Section 3: Test Execution Table --}}
        <fieldset class="bg-primary/10 border border-primary rounded-xl p-5">
            <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
                <legend class="font-semibold text-lg px-1">Test Cases Execution (บันทึกผลการทดสอบระบบ)</legend>
                <button type="button" class="btn btn-secondary btn-sm hidden" id="btn-save-test">
                    <i class="fi fi-rr-disk"></i> บันทึกผลการทดสอบชั่วคราว
                </button>
            </div>

            <div class="overflow-x-auto border border-slate-300 rounded-xl bg-white">
                <table class="table table-sm w-full" id="table-uat-execution">
                    <thead class="bg-primary/15 text-base-content">
                        <tr>
                            <th class="w-16 text-center">No.</th>
                            <th class="w-36">Module</th>
                            <th class="min-w-44">Test Case / Steps</th>
                            <th class="min-w-44">Expected Result</th>
                            <th class="min-w-48">Actual Result (ผลลัพธ์จริง)</th>
                            <th class="w-36 text-center">Status</th>
                            <th class="min-w-44">Evidence (หลักฐาน)</th>
                            <th class="min-w-40">Remark (หมายเหตุ)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colspan="8" class="text-center py-6 text-gray-400">กำลังโหลดรายการทดสอบ...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </fieldset>

        {{-- Section 4: Overall Conclusion & Webflow Approval --}}
        <fieldset class="bg-primary/10 border border-primary rounded-xl p-5 hidden" id="approval-section">
            <legend class="font-semibold text-lg px-1">Sign-off &amp; Approval (สรุปผลและอนุมัติ UAT)</legend>

            <fieldset class="fieldset">
                <legend class="fieldset-legend">Comment / Remark (ความคิดเห็นเพิ่มเติม / เหตุผลกรณีไม่อนุมัติ)</legend>
                <textarea class="textarea w-full h-24 bg-white" id="uat-remark"
                    placeholder="ระบุความคิดเห็นเพิ่มเติม หรือรายละเอียดปัญหาที่พบหากต้องการส่งกลับแก้ไข"></textarea>
            </fieldset>

            <div class="flex flex-wrap gap-3 mt-3">
                <button type="button" class="btn btn-success text-white btn-submit" data-action="approve">
                    <i class="fi fi-rr-check-circle"></i> Approve / Sign-off UAT
                </button>
                <button type="button" class="btn btn-error text-white btn-submit" data-action="reject">
                    <i class="fi fi-rr-cross-circle"></i> Reject / ส่งกลับแก้ไข
                </button>
            </div>
        </fieldset>

        {{-- Section 5: Approval Flow --}}
        <fieldset class="bg-white border border-slate-200 rounded-xl p-5">
            <legend class="font-semibold text-lg px-1">Approval Flow</legend>
            <div class="showflow"></div>
        </fieldset>
    </section>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/uatFormView.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection

@section('styles')
    <style>
        #table-uat-execution tbody tr td {
            vertical-align: top;
            padding: 0.6rem;
        }
        #table-uat-execution tbody tr:not(:last-child) td {
            border-bottom: 1px solid var(--color-gray-200);
        }
    </style>
@endsection
