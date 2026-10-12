@extends('layouts/webflowTemplate')

@section('styles')
    <style>
        /* Hallmark · compact workbench · existing DaisyUI theme and LINE Seed typography.
           Pre-emit critique: P4 H4 E4 S4 R5 V4 */
        .tph-page {
            --color-primary: #2864ad;
            --color-primary-content: #f8faf7;
            --color-secondary: #5b9dc4;
            --color-secondary-content: #183749;
            --color-base-100: #f8fafc;
            --tph-accent: #d6e7fc;
            --color-base-200: #eaf0f6;
            --color-base-300: #d0dbe6;
            --color-base-content: #20334b;
            --color-neutral: #526579;
            --tph-field: #f0f4f8;
            --tph-field-border: #a9bacb;
            --tph-header: #edf4fc;
            --tph-header-ink: var(--color-base-content);
            --tph-header-muted: var(--color-neutral);
            --tph-shadow: #20334b12;
            --tph-line: var(--color-base-300);
            --tph-soft: var(--tph-accent);
            width: 100%;
            max-width: 1040px;
            margin-inline: auto;
            color: var(--color-base-content);
            font-family: var(--font-sans);
            font-size: 14px;
            line-height: 1.6;
        }
        .tph-page #tphForm {
            min-width: 0; border: 1px solid var(--tph-line); border-radius: 18px;
            background: var(--color-base-100); box-shadow: 0 12px 36px var(--tph-shadow);
        }
        .tph-page .tph-toolbar {
            display: flex; align-items: center; justify-content: space-between; gap: 12px;
            padding: 12px 28px; border-bottom: 1px solid var(--tph-line);
            font-size: 12px; color: var(--color-neutral);
        }
        .tph-page .tph-toolbar strong { color: var(--color-primary); letter-spacing: .06em; }
        .tph-page .tph-header {
            display: flex; align-items: center; gap: 18px; padding: 28px;
            background: var(--tph-header); color: var(--tph-header-ink);
            border-bottom: 1px solid var(--tph-line);
        }
        .tph-page .tph-emblem {
            display: grid; place-items: center; flex: 0 0 52px; height: 52px;
            border-radius: 14px; background: var(--color-primary); color: var(--color-primary-content);
        }
        .tph-page h1 { font-size: clamp(20px, 3vw, 27px); font-weight: 700; line-height: 1.35; overflow-wrap: anywhere; }
        .tph-page .tph-subtitle { color: var(--tph-header-muted); font-size: 13px; margin-top: 6px; }
        .tph-page .section-box, .tph-page .tph-requester {
            background: var(--color-base-100);
            border: 0; border-bottom: 1px solid var(--tph-line);
            padding: 24px 28px; min-width: 0;
        }
        .tph-page .tph-requester { background: var(--color-base-200); }
        .tph-page .section-box:has(#table-area) { border-bottom: 0; border-radius: 0 0 18px 18px; }
        .tph-page .section-title {
            color: var(--color-base-content); font-size: 16px; line-height: 1.5;
        }
        .tph-page .section-title small { display: block; color: var(--color-neutral); font-size: 12px; font-weight: 400; margin-top: 3px; }
        .tph-page .tph-section-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .tph-page .input { height: 40px; font-size: 14px; border-radius: 8px; background: var(--tph-field); }
        .tph-page .input-sm { height: 34px; }
        .tph-page .textarea { font-size: 14px; border-radius: 10px; min-height: 90px; background: var(--tph-field); }
        .tph-page :is(.input, .textarea) { border: 1px solid var(--tph-field-border); color: var(--color-base-content); }
        .tph-page :is(.input, .textarea)::placeholder { color: var(--color-neutral); opacity: 1; }
        .tph-page :is(.input, .textarea):focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
        .tph-page .input[readonly], .tph-page .input:disabled { background: color-mix(in srgb, var(--color-neutral) 10%, var(--color-base-200)); }
        .tph-page .btn { white-space: nowrap; box-shadow: none; border-radius: 8px; }
        .tph-page .radio { width: 18px; height: 18px; flex-shrink: 0; }
        .tph-page .tph-options { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .tph-page .tph-choice { border: 1px solid var(--tph-line); border-radius: 10px; padding: 14px; background: var(--tph-field); }
        .tph-page .tph-choice:has(input:checked) { border-color: var(--color-primary); box-shadow: inset 0 0 0 1px var(--color-primary); background: var(--tph-soft); }
        .tph-page .tph-choice label, .tph-page label.tph-choice { cursor: pointer; }
        .tph-page .tph-choice:has(input:focus-visible) { outline: 2px solid var(--color-primary); outline-offset: 2px; }
        .tph-page .tph-choice:has(input:disabled) { cursor: not-allowed; }
        .tph-page .tph-permits { display: grid; grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); }
        .tph-page .tph-permits > .section-box:first-child { border-right: 1px solid var(--tph-line); }
        .tph-page .table { font-size: 13px; }
        .tph-page .table-header { background: var(--tph-soft); color: var(--color-base-content); }
        .tph-page .table tbody { background: var(--color-base-100); }
        .tph-page .table :is(th, td) { border: 0; border-bottom: 1px solid var(--tph-line); padding: 10px 8px; }
        .tph-page .table th { font-size: 13px; font-weight: 700; white-space: nowrap; }
        .tph-page .table tbody tr:hover { background: var(--tph-soft); }
        .tph-page #applicant-visitor-section table { min-width: 700px; }
        #modalTable_wrapper .dt-search { display: none; }
        #modalTable_wrapper .dt-length { color: var(--color-neutral); font-size: 13px; }
        #modalTable_wrapper .dt-length .dt-input {
            height: 34px; margin-inline: 6px; padding: 0 28px 0 10px; border: 1px solid var(--tph-field-border);
            border-radius: 8px; background-color: var(--tph-field); color: var(--color-base-content); font: inherit;
        }
        #modalTable_wrapper .dt-length .dt-input:focus-visible {
            outline: 2px solid var(--color-primary); outline-offset: 2px;
        }
        .tph-page .overflow-x-auto { border: 1px solid var(--tph-line); border-radius: 10px; }
        .tph-page .tph-hint { font-size: 12px; color: var(--color-neutral); margin-top: 6px; }
        .tph-page #area-empty-row td { padding: 28px 16px; background: var(--color-base-200); }
        .tph-page .tph-actions:empty { display: none; }
        .tph-page .tph-actions:not(:empty) { padding: 16px 28px; }
        .tph-page .modal-box { width: calc(100vw - 32px); max-width: 1000px; max-height: 88dvh; }
        .tph-page .modal-box > div { min-height: 0; }
        @media (min-width: 960px) {
            .tph-page .tph-requester { grid-template-columns: 1fr 1fr 1.4fr 1.4fr; }
        }
        @media (max-width: 640px) {
            .tph-page .tph-toolbar { padding-inline: 16px; }
            .tph-page .tph-options, .tph-page .tph-permits { grid-template-columns: minmax(0, 1fr); }
            .tph-page .section-box, .tph-page .tph-requester { padding: 14px; }
            .tph-page .tph-header { padding: 20px 16px; gap: 12px; align-items: flex-start; }
            .tph-page .tph-section-head { align-items: flex-start; flex-direction: column; }
            .tph-page .tph-permits > .section-box:first-child { border-right: 0; }
            .tph-page .modal-box .px-6 { padding-inline: 12px; }
        }
    </style>
@endsection

@section('contents')
    <div class="tph-page">
        <form id="tphForm" action="#" method="post"
            class="w-full">
            <div class="tph-toolbar">
                <span><strong>GP-TPH</strong> / Photo permission</span>
                <span>คำขออนุญาตถ่ายภาพ</span>
            </div>
            <header class="tph-header">
                <span class="tph-emblem" aria-hidden="true">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
                        <path d="M8 5 9.5 3h5L16 5h3a2 2 0 0 1 2 2v12H3V7a2 2 0 0 1 2-2h3Z" />
                        <circle cx="12" cy="12" r="4" />
                    </svg>
                </span>
                <div class="min-w-0">
                    <h1>แบบฟอร์มขออนุญาตถ่ายภาพภายในบริษัท</h1>
                    <p class="tph-subtitle">ระบุผู้ขอ ช่วงเวลา และพื้นที่ที่ต้องการถ่ายภาพ</p>
                </div>
            </header>

            <div class="tph-requester grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                    <label class="text-sm font-semibold text-slate-700">Input By:</label>
                    <input type="text" name="INPUTBY" id="INPUTBY" class="input input-bordered w-full" placeholder=""
                        readonly>
                </div>
                <div class="space-y-2">
                    <label class="text-sm font-semibold text-slate-700">Request By:</label>
                    <input type="text" name="REQBY" id="REQBY" class="input input-bordered w-full" placeholder="">
                </div>
                <div class="space-y-2">
                    <label class="text-sm font-semibold text-slate-700">Name:</label>
                    <input type="text" name="empName" id="empName" class="input input-bordered w-full"
                        placeholder="Name">
                </div>

                <div class="space-y-2">
                    <label class="text-sm font-semibold text-slate-700">Sect./Dept./Div.:</label>
                    <input type="text" name="empDiv" id = "empDiv" class="input input-bordered w-full" placeholder="">
                </div>
            </div>

            <div class="section-box p-5">
                <div class="mb-4">
                    <div class="section-title text-base font-bold">ประเภทผู้ยื่นคำขอ<small>Request type</small></div>
                </div>
                <div class="tph-options">
                    <div class="tph-choice">
                        <label class="employee-request-group inline-flex items-center gap-3">
                            <input type="radio" name="REQUEST_TYPE" id="REQUEST_TYPE" value="E"
                                class="radio radio-primary">
                            <span>Employee Request</span>
                        </label>
                        <div class="ml-8 mt-2 space-y-2">
                            <label class="employee-request-group flex flex-row items-center gap-2">
                                <input type="radio" name="REQUEST_SUB_TYPE" id="REQUEST_SUB_TYPE" value="I"
                                    class="radio radio-primary">
                                <span>Individual Request</span>
                            </label>
                            <label class="employee-request-group flex flex-row items-center gap-2">
                                <input type="radio" name="REQUEST_SUB_TYPE" id="REQUEST_SUB_TYPE" value="G"
                                    class="radio radio-primary">
                                <span>Group Request</span>
                            </label>
                        </div>
                    </div>
                    <label class="tph-choice host-request-group inline-flex items-center gap-3">
                        <input type="radio" name="REQUEST_TYPE" id="REQUEST_TYPE" value="H"
                            class="radio radio-primary">
                        <span>Host Request for External Personnel (พนักงานขอแทนบุคคลภายนอก)</span>
                    </label>
                </div>
            </div>
            <div id="applicant-visitor-section" class="section-box p-5">
                <!สำหรับพนักงาน>
                    <div class="tph-section-head mb-4">
                        <div class="section-title text-base font-bold">ข้อมูลผู้ขอถ่ายภาพ<small>Applicant / Visitor information</small></div>
                        <button type="button" id="add-visitor-row" class="btn btn-sm btn-primary btn-outline">+ เพิ่มผู้ขอ</button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="table w-full border border-slate-200">
                            <thead class="table-header">
                                <tr>
                                    <th class="p-3 text-center">No.</th>
                                    <th class="p-3 text-left">EMP Code</th>
                                    <th class="p-3 text-left">Name</th>
                                    <th class="p-3 text-left">Division</th>
                                    <th class="p-3 text-left">Department</th>
                                    <th class="p-3 text-left">SECTION</th>
                                    <th class="p-3 text-center" data-action-column>Action</th>
                                </tr>
                            </thead>
                            <tbody id="visitor-table-body">
                                <tr>
                                    <td class="border p-2 text-center visitor-row-number">1</td>
                                    <td class="border p-2"><input type="text" name="visitor_Empcode" id="visitor_empcode"
                                            class="input input-sm input-bordered w-full"></td>
                                    <td class="border p-2"><input type="text" name="APPLICANT_NAME" id= "APPLICANT_NAME"
                                            class="input input-sm input-bordered w-full"></td>
                                    <td class="border p-2"><input type="text" name="visitor_div" id="visitor_div"
                                            class="input input-sm input-bordered w-full"></td>
                                    <td class="border p-2"><input type="text" name="visitor_dept" id="visitor_dept"
                                            class="input input-sm input-bordered w-full"></td>
                                    <td class="border p-2"><input type="text" name="visitor_sec" id="visitor_sec"
                                            class="input input-sm input-bordered w-full"></td>
                                        <td class="border p-2 text-center" data-action-column>
                                        <button type="button" class="btn btn-sm btn-error remove-row">×</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
            </div>
            
            <template id="visitor-row-template">
                <tr>
                    <td class="border p-2 text-center visitor-row-number" name="SEQ_NO"></td>
                    <td class="border p-2"><input type="text" name="visitor_emp_code[]"
                            class="input input-sm input-bordered w-full"></td>
                    <td class="border p-2"><input type="text" name="APPLICANT_NAME"
                            class="input input-sm input-bordered w-full"></td>
                    <td class="border p-2"><input type="text" name="visitor_division[]"
                            class="input input-sm input-bordered w-full"></td>
                    <td class="border p-2"><input type="text" name="visitor_department[]"
                            class="input input-sm input-bordered w-full"></td>
                    <td class="border p-2"><input type="text" name="visitor_section[]"
                            class="input input-sm input-bordered w-full"></td>
                        <td class="border p-2 text-center" data-action-column><button type="button"
                            class="btn btn-sm btn-error remove-row">×</button></td>
                </tr>
            </template>

            <div id="host-external-section" class="section-box p-5 hidden">
                <!สำหรับบุคคลภายนอก>
                    <div class="section-title text-base font-bold mb-4">Applicant / External Visitor Information
                        (ข้อมูลผู้ขอ / บุคคลภายนอก)</div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="space-y-2">
                            <label class="text-sm font-semibold text-slate-700">Visitor Name (ชื่อบุคคลภายนอก)</label>
                            <input type="text" name="APPLICANT_NAME" id="APPLICANT_NAME"
                                class="input input-bordered w-full" placeholder="Visitor Name">
                            <label class="text-sm font-semibold text-slate-700">Host Name (ชื่อผู้รับผิดชอบ)</label>
                            <input type="tel" name="EMP_CODE" id="EMP_CODE" class="input input-bordered w-full"
                                placeholder="Host Name">
                        </div>
                        <div class="space-y-2">
                            <label class="text-sm font-semibold text-slate-700">Company Name (ชื่อบริษัท)</label>
                            <input type="text" name="COMPANY_NAME" id="COMPANY_NAME"
                                class="input input-bordered w-full" placeholder="Company Name">

                        </div>
                    </div>
                    <div class="mt-3 text-sm text-red-500">
                        *การขออนุญาตถ่ายภาพให้บุคคลภายนอก Requester ที่เป็นผู้ร้องขอจะต้องเป็นผู้รับผิดชอบในการดูแล
                        สติกเกอร์ หรือ บัตรถ่ายภาพนั้นๆ​
                    </div>
            </div>

            <div class="section-box p-5">
                <div class="section-title text-base font-bold mb-3">รายละเอียดการถ่ายภาพ<small>Recording details</small></div>
                <textarea name="PURPOSE" id="PURPOSE" rows="3" aria-label="วัตถุประสงค์ในการถ่ายภาพ" class="textarea textarea-bordered w-full"
                    placeholder="Purpose of Recording (วัตถุประสงค์)"></textarea>
            </div>

            <div class="tph-permits">
                <div class="section-box p-5">
                    <div class="section-title text-base font-bold mb-3">ช่วงเวลาที่ขออนุญาต<small>Permit date</small></div>
                    <label class="flex items-center gap-2">
                        <input type="radio" name="permit_option" class="radio radio-primary" value="long_term">
                        <span>Long-Term Use (ใช้ระยะยาว)</span>
                    </label>
                    <div class="mt-3">
                        <input type="number" name="LONGTERM_YEARS" id = "LONGTERM_YEARS" class="input input-bordered w-full"
                            placeholder="Year(s)" inputmode="numeric" pattern="[0-9]*" min="0" step="1">
                    </div>
                    <label class="inline-flex items-center gap-2 mt-4">
                        <input type="radio" name="permit_option" class="radio radio-primary" id='period' value="period">
                        <span>Use within period Date & Time (ใช้ในระยะเวลาที่กำหนด)</span>
                    </label>
                    <div class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm text-slate-600 mb-1">Start Date</label>
                            <input type="text" name="PERMIT_START_DATE" class="input fdate input-bordered w-full" id='PERMIT_START_DATE'>
                        </div>
                        <div>
                            <label class="block text-sm text-slate-600 mb-1">Valid Until (ใช้ได้จนถึง)</label>
                            <input type="text" name="PERMIT_END_DATE" class="input fdate input-bordered w-full" id="PERMIT_END_DATE">
                        </div>
                    </div>
                </div>

                <div class="section-box p-5">
                    <div class="section-title text-base font-bold mb-3">รูปแบบใบอนุญาต<small>Permit type</small></div>
                    <div class="space-y-3">
                        <label class="tph-choice flex flex-row items-center gap-2">
                            <input type="checkbox" name="HELMET_STICKER" id="HELMET_STICKER" value="Y"
                                class="checkbox checkbox-primary">
                            <span>Helmet Sticker (สติกเกอร์ติดหมวก)</span>
                        </label>
                        <label class="tph-choice flex flex-row items-center gap-2">
                            <input type="checkbox" name="PHOTO_PERMIT_BADGE" id="PHOTO_PERMIT_BADGE" value="Y"
                                class="checkbox checkbox-primary">
                            <span>Photo Permit Badge (บัตรอนุญาตถ่ายภาพ)</span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="section-box p-5">
                <div class="tph-section-head mb-4">
                    <div class="section-title text-base font-bold">พื้นที่ที่ต้องการถ่ายภาพ<small>Recording areas</small></div>
                    <button type="button" id="btnaddDatarow"
                        class="btn btn-primary btn-sm gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        เลือกพื้นที่
                    </button>
                </div>
                <p class="tph-hint mb-3">เลือกได้หลายพื้นที่ โดยเจ้าของพื้นที่ทุกคนต้องยืนยันคำขอ</p>
                <div class="overflow-x-auto">
                    <table class="table w-full border border-slate-200" id='table-area'>
                        <thead class="table-header">
                            <tr>
                                <th class="border p-2 text-left">No</th>
                                <th class="border p-2 text-left">Location</th>
                                <th class="border p-2 text-left">Area</th>
                                <th class="border p-2 text-left">Level</th>
                                <th class="border p-2 text-left">Area Owner</th>
                                <th class="border p-2 text-center" data-action-column>Action</th>
                            </tr>
                        </thead>
                        <tbody id="area-table-body">
                            <tr id="area-empty-row">
                                <td colspan="6" class="border p-4 text-center text-slate-500">
                                    กรุณากดปุ่ม + เพื่อเลือกพื้นที่
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {{-- <template id="area-row-template">
                    <tr>
                        <td class="border p-2 text-center"></td>
                        <td class="border p-2"><input type="text" name="area_location[]"
                                class="input input-sm input-bordered w-full"></td>
                        <td class="border p-2"><input type="text" name="area_name[]"
                                class="input input-sm input-bordered w-full"></td>
                        <td class="border p-2"><input type="text" name="area_level[]"
                                class="input input-sm input-bordered w-full"></td>
                        <td class="border p-2"><input type="text" name="area_owner[]"
                                class="input input-sm input-bordered w-full"></td>
                        <td class="border p-2 text-center"><button type="button"
                                class="btn btn-sm btn-error remove-area-row">×</button></td>
                    </tr>
                </template> --}}
            </div>
                <div id="sentRequest" class="tph-actions"></div>
                <div id="sentApprove" class="tph-actions"></div>
        </form>

    <input type="checkbox" id="modal-add" class="modal-toggle" />
    <div class="modal" role="dialog" aria-labelledby="modalHeader">
        <div class="modal-box flex w-[95vw] max-w-7xl max-h-[90vh] flex-col overflow-hidden p-0">
            <!-- Modal Header -->
            <div class="flex items-center justify-between border-b border-base-300 px-6 py-4">
                <h3 class="text-lg font-bold" id="modalHeader">เลือกพื้นที่ถ่ายภาพ</h3>

                <label for="modal-add" class="btn btn-sm btn-circle btn-ghost">
                    ✕
                </label>
            </div>

            <!-- Modal Content -->
            <div class="flex-1 overflow-y-auto px-6 py-5">
                <div class="w-full space-y-5">

                    <!-- Search Area -->
                    <div class="w-full rounded-xl border border-base-300 bg-base-200/60 p-4 shadow-sm">
                        <div class="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            <div class="form-control w-full min-w-0" id="hiddenLOCATION">
                                <label class="label py-1">
                                    <span class="label-text font-bold text-base-content/80">
                                        LOCATION
                                    </span>
                                </label>
                                <input type="text" id="LOCATION" name="LOCATION"
                                    class="input input-bordered input-sm w-full min-w-0 bg-base-100 focus:input-primary" />
                            </div>

                            <div class="form-control w-full min-w-0" id="hiddenAREANAME">
                                <label class="label py-1">
                                    <span class="label-text font-bold text-base-content/80">
                                        AREA NAME
                                    </span>
                                </label>

                                <input type="text" id="AREANAME" name="AREANAME"
                                    class="input input-bordered input-sm w-full min-w-0 bg-base-100 focus:input-primary" />
                            </div>

                            <div class="form-control w-full min-w-0" id ="hiddenAREALEVEL">
                                <label class="label py-1">
                                    <span class="label-text font-bold text-base-content/80">
                                        AREA LEVEL
                                    </span>
                                </label>
                                <input type="text" id="AREALEVEL" name="AREALEVEL"
                                    class="input input-bordered input-sm w-full min-w-0 bg-base-100 focus:input-primary" />
                            </div>
                        </div>

                        <!-- Search Buttons -->
                        <div class="mt-4 flex flex-wrap justify-end gap-2">
                            <button type="button" id="btnSearch" class="btn btn-primary btn-sm gap-2 shadow-md">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M21 21l-4.35-4.35m1.1-5.4a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
                                </svg>

                                Search
                            </button>

                            <button type="button" id="btnClear" class="btn btn-error btn-sm shadow-md stransition-all">
                                <svg class="w-4 h-4 text-gray-800 dark:text-white" aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                                    viewBox="0 0 24 24">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z" />
                                </svg>

                                Clear
                            </button>
                        </div>

                        <!-- Table Area -->
                        <div class="mt-4 w-full overflow-x-auto">
                            <div class="w-full px-4 py-3">
                                <table class="table table-zebra w-full text-sm" id="modalTable">
                                </table>
                            </div>
                        </div>

                        <!-- Modal Footer -->
                        <div class="flex flex-wrap justify-end gap-2 border-t border-base-300 bg-base-100 px-6 py-4">
                            <label class="btn btn-outline btn-success text-success" for="modal-add" id="addData">
                                <svg class="h-4 w-4 text-current" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                    width="24" height="24" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M12 7.757v8.486M7.757 12h8.486M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                <span class="text-current">Add</span>
                            </label>

                            <label class="btn btn-outline btn-error text-error" for="modal-add">
                                <svg class="h-4 w-4 text-current" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                    width="24" height="24" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="2" d="m15 9-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                <span class="text-current">Close</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </div>
@endsection

            @section('scripts')
                <script src="{{ $_ENV['APP_JS'] }}/gpTPH.js?ver={{ $GLOBALS['version'] }}"></script>
            @endsection
