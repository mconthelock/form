@extends('layouts/webflowTemplate')

@section('contents')
    <form action="" id="form-is-dev">
        <input type="text" class="hidden" id="MODE" value="{{ $mode ?? 1 }}" />
        <input type="text" class="hidden" value="{{ $CATEGORY }}" data-map="CATEGORY" />
        <input type="text" class="hidden" value="{{ $PLANYEAR }}" data-map="PLANYEAR" />
        <input type="text" class="hidden" id="STATUS" value="1" data-map="STATUS" />

        <main class="webform-theme flex flex-col gap-4 pb-8 text-base">
            @include('layouts/form-header')
            @include('layouts/form-header-info')

            {{-- Section 01: Request Detail --}}
            <section class="bg-gray-200 border border-gray-300">
                <header class="flex items-center gap-3 px-4 py-3 border-b border-gray-300">
                    <span class="bg-black text-white h-8 w-8 flex items-center justify-center text-base font-mono font-bold">01</span>
                    <div>
                        <h2 class="font-mono font-bold text-lg text-gray-700 uppercase">Request Detail</h2>
                        <div class="text-sm text-gray-500">รายละเอียดคำขอพัฒนาหรือปรับปรุงโปรแกรม</div>
                    </div>
                </header>
                <div class="bg-white p-5 flex flex-col gap-5">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend font-mono text-sm font-bold uppercase text-gray-700">System Name</legend>
                            <ul class="flex flex-wrap gap-5 pt-1">
                                <li class="flex items-center gap-2.5 text-base">
                                    <input type="radio" name="system_name" class="radio radio-primary" checked />
                                    <span>AS400 Application</span>
                                </li>
                                <li class="flex items-center gap-2.5 text-base">
                                    <input type="radio" name="system_name" class="radio radio-primary" />
                                    <span>Windows Application</span>
                                </li>
                            </ul>
                        </fieldset>

                        <fieldset class="fieldset">
                            <legend class="fieldset-legend font-mono text-sm font-bold uppercase text-gray-700">Request Type</legend>
                            <ul class="flex flex-wrap gap-4 pt-1">
                                <li class="flex items-center gap-2.5 text-base">
                                    <input type="radio" name="request_type" class="radio radio-primary request-type"
                                        value="1" checked />
                                    <span>New Program/Additional Request</span>
                                </li>
                                <li class="flex items-center gap-2.5 text-base">
                                    <input type="radio" name="request_type" class="radio radio-primary request-type"
                                        value="2" />
                                    <span>Modify Program</span>
                                </li>
                                <li class="flex items-center gap-2.5 text-base">
                                    <input type="radio" name="request_type" class="radio radio-primary request-type"
                                        value="3" />
                                    <span>Fixed Error Program</span>
                                </li>
                                <li class="flex items-center gap-2.5 text-base">
                                    <input type="radio" name="request_type" class="radio radio-primary request-type"
                                        value="4" />
                                    <span>Data Change</span>
                                </li>
                                <li class="flex items-center gap-2.5 text-base">
                                    <input type="radio" name="request_type" class="radio radio-primary request-type"
                                        value="5" />
                                    <span>Search Data</span>
                                </li>
                            </ul>
                        </fieldset>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend font-mono text-sm font-bold uppercase text-gray-700">Program Name</legend>
                            <input type="text" class="input w-full text-base req-1" name="program_name"
                                placeholder="ชื่อโปรแกรม เช่น Webflow, SCM, Cost Reduction หรือ Procurement เป็นต้น"
                                data-map="SYSTEMNAME" />
                        </fieldset>

                        <fieldset class="fieldset">
                            <legend class="fieldset-legend font-mono text-sm font-bold uppercase text-gray-700">Title</legend>
                            <input type="text" class="input w-full text-base req-1" name="title"
                                placeholder="ตั้งชื่อ Request / ชื่อโปรเจค" data-map="TITLE" />
                        </fieldset>
                    </div>

                    <fieldset class="fieldset">
                        <legend class="fieldset-legend font-mono text-sm font-bold uppercase text-gray-700">Detail</legend>
                        <textarea class="textarea w-full h-52 text-base text-comment req-1" name="detail" maxlength="500"
                            placeholder="เขียนอธิบายภาพรวมของ Requirement นี้ หรือบอกถึงวัตถุประสงค์ของการ Project นี้"
                            data-map="PURPOSE"></textarea>
                        <div class="flex items-center justify-between mt-1">
                            <div class="label text-sm justify-start text-red-500 text-comment-err p-0"></div>
                            <div class="label text-sm justify-end text-count p-0 text-gray-500 font-mono">
                                <span class="text-count-no" id="detail-count">0</span>/1000
                            </div>
                        </div>
                    </fieldset>

                    <fieldset class="fieldset">
                        <div class="flex items-center justify-between mb-1">
                            <legend class="fieldset-legend font-mono text-sm font-bold uppercase text-gray-700 p-0">
                                Additional Information
                            </legend>
                            <button class="btn btn-sm btn-outline btn-primary gap-1" id="add-file" type="button">
                                <i class="fi fi-rr-plus-small text-base"></i>
                                <span>Add File</span>
                            </button>
                        </div>
                        <p class="text-sm text-gray-500 mb-2">แนบเอกสารที่เกี่ยวข้อง เช่น Flow การทำงาน, Screenshot เป็นต้น</p>
                        <div class="flex flex-col gap-2 items-center file-input-wrap">
                            <input type="file" class="file-input w-full attachments border-gray-300 text-sm"
                                name="attachments[]" />
                        </div>
                    </fieldset>
                </div>
            </section>

            {{-- Section 02: Expected Outcome --}}
            <section class="bg-gray-200 border border-gray-300 form-roi">
                <header class="flex items-center gap-3 px-4 py-3 border-b border-gray-300">
                    <span class="bg-black text-white h-8 w-8 flex items-center justify-center text-base font-mono font-bold">02</span>
                    <div>
                        <h2 class="font-mono font-bold text-lg text-gray-700 uppercase">Expected Outcome</h2>
                        <div class="text-sm text-gray-500">เป้าหมาย ผลลัพธ์ที่คาดหวัง และขั้นตอนการทำงาน</div>
                    </div>
                </header>
                <div class="bg-white p-5 flex flex-col gap-5">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        <fieldset class="fieldset lg:col-span-2">
                            <legend class="fieldset-legend font-mono text-sm font-bold uppercase text-gray-700">Objective</legend>
                            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                                <div class="flex-1">
                                    <select class="select w-full text-base s2 req-2" id="req-objective" data-map="OBJECTIVE">
                                        <option value=""></option>
                                    </select>
                                </div>
                                <input type="text" placeholder="Other Objective" class="input text-base flex-1"
                                    id="req-objective-other" readonly data-map="OBJECTIVE_OTHER" />
                            </div>
                        </fieldset>

                        <fieldset class="fieldset">
                            <legend class="fieldset-legend font-mono text-sm font-bold uppercase text-gray-700">ROI Payback Period</legend>
                            <div class="flex items-center gap-2.5">
                                <input type="text" placeholder="จำนวนปีที่คาดว่าจะคืนทุน" class="input w-full text-base req-2"
                                    value="1" id="req-roi-years" data-map="ROI_RETURN" />
                                <span class="text-gray-600 text-sm whitespace-nowrap">Year(s)</span>
                            </div>
                        </fieldset>
                    </div>

                    <fieldset class="fieldset">
                        <legend class="fieldset-legend font-mono text-sm font-bold uppercase text-gray-700">
                            Preferred Requirement Gathering Period
                        </legend>
                        <p class="text-sm text-gray-500 italic mb-1.5">
                            กำหนดการที่พร้อมสำหรับการเก็บรวบรวมข้อกำหนดและ Developer เริ่มงานได้
                        </p>
                        <label class="input w-full sm:w-80 flex items-center gap-2 text-base">
                            <input type="text" class="grow text-base fdate req-2" placeholder="{{ Date('Y-M') }}"
                                data-map="SPEC_CONFIRM_PLAN" />
                            <i class="icofont-calendar text-gray-500 text-lg"></i>
                        </label>
                    </fieldset>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend font-mono text-sm font-bold uppercase text-gray-700">Current Workflow</legend>
                            <textarea class="textarea w-full h-52 text-base text-comment req-2"
                                placeholder="อธิบายวิธีการทำงานในปัจจุบัน เช่น พนักงานต้องกรอกแบบฟอร์มกระดาษแล้วจึงส่ง Approve เป็นต้น"
                                data-map="CURRENT_WORKFLOW"></textarea>
                            <div class="flex items-center justify-between mt-1">
                                <div class="label text-sm justify-start text-red-500 text-comment-err p-0"></div>
                                <div class="label text-sm justify-end text-count p-0 text-gray-500 font-mono">
                                    <span class="text-count-no" id="current-workflow-count">0</span>/1000
                                </div>
                            </div>
                        </fieldset>

                        <fieldset class="fieldset">
                            <legend class="fieldset-legend font-mono text-sm font-bold uppercase text-gray-700">Expected Workflow</legend>
                            <textarea class="textarea w-full h-52 text-base text-comment req-2" data-map="EXPECTED_WORKFLOW"
                                placeholder="อธิบายวิธีการทำงานที่คาดหวังหลังจากโครงการนี้สำเร็จ เช่น พนักงานกรอกแบบฟอร์มออนไลน์แล้วระบบส่ง Approve บนระบบ Webflow เป็นต้น"></textarea>
                            <div class="flex items-center justify-between mt-1">
                                <div class="label text-sm justify-start text-red-500 text-comment-err p-0"></div>
                                <div class="label text-sm justify-end text-count p-0 text-gray-500 font-mono">
                                    <span class="text-count-no" id="expected-workflow-count">0</span>/1000
                                </div>
                            </div>
                        </fieldset>
                    </div>

                    <div class="table-wrap overflow-x-auto mt-2 border border-gray-300">
                        @include('isform.FORM-1.table-benefit')
                    </div>
                </div>
            </section>

            {{-- Section 03: Efficiency Gains --}}
            <section class="bg-gray-200 border border-gray-300 form-roi">
                <header class="flex items-center gap-3 px-4 py-3 border-b border-gray-300">
                    <span class="bg-black text-white h-8 w-8 flex items-center justify-center text-base font-mono font-bold">03</span>
                    <div>
                        <h2 class="font-mono font-bold text-lg text-gray-700 uppercase">Efficiency Gains</h2>
                        <div class="text-sm text-gray-500">การลดเวลาและค่าใช้จ่ายด้านกำลังคน</div>
                    </div>
                </header>
                <div class="bg-white p-5">
                    <div class="table-wrap overflow-x-auto">
                        @include('isform.FORM-1.table-labor')
                    </div>
                </div>
            </section>

            {{-- Section 04: Investment in Equipment --}}
            <section class="bg-gray-200 border border-gray-300 form-roi">
                <header class="flex items-center gap-3 px-4 py-3 border-b border-gray-300">
                    <span class="bg-black text-white h-8 w-8 flex items-center justify-center text-base font-mono font-bold">04</span>
                    <div>
                        <h2 class="font-mono font-bold text-lg text-gray-700 uppercase">Investment in Equipment</h2>
                        <div class="text-sm text-gray-500">การลงทุนอุปกรณ์และฮาร์ดแวร์เพิ่มเติม</div>
                    </div>
                </header>
                <div class="bg-white p-5">
                    <div class="table-wrap overflow-x-auto">
                        @include('isform.FORM-1.table-investment')
                    </div>
                </div>
            </section>

            {{-- ROI Summary --}}
            <section class="form-roi bg-blue-50 border border-blue-300 p-4 flex flex-wrap items-center gap-2 text-base text-gray-700">
                <i class="fi fi-rr-chart-histogram text-primary text-xl me-1"></i>
                <span>This project will return on investment (ROI)</span>
                <span class="font-mono font-bold text-lg text-primary" id="roi-total-kb">0 KB</span>
                <span class="font-mono font-bold text-lg text-primary" id="roi-total-full">(0 Baht)</span>
                <span class="font-mono font-bold text-lg text-primary mx-1" id="roi-total-year"></span>
            </section>

            {{-- Form Action Bar --}}
            @include('layouts/form-action')
        </main>
    </form>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/devForm.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection

@section('styles')
    <style>
        #form-is-dev .select2-container--default .select2-selection--single {
            height: 2.5rem !important;
            font-size: 1rem !important;
        }

        #form-is-dev .select2-container--default .select2-selection--single .select2-selection__rendered {
            font-size: 1rem !important;
            line-height: 2.35rem !important;
        }

        .table-edit tbody tr th {
            font-weight: bold;
            font-size: 0.95rem;
        }

        .table-edit tbody tr td {
            padding: 0 !important;
        }

        .table-edit tbody tr td:not(:last-child),
        .table-edit tbody tr th {
            border-right: 1px solid var(--color-gray-300);
        }

        .table-edit tbody tr td,
        .table-edit tbody tr th {
            border-bottom: 1px solid var(--color-gray-300);
        }

        .table-edit tbody tr td input {
            width: 100%;
            height: 100%;
            min-height: 42px;
            padding: 10px;
            border: none;
            text-align: right;
            font-size: 1.25em;
            background: var(--color-white);
        }

        .table-edit tbody tr td input:hover:not(:read-only) {
            cursor: pointer;
        }

        .table-edit tbody tr td input:focus {
            outline: none;
            box-shadow: none;
        }

        .table-edit tbody tr td input:focus:not(:read-only) {
            background: var(--color-primary);
            color: var(--color-white);
        }

        .table-edit tbody tr td input[readonly] {
            background: var(--color-gray-200);
        }
    </style>
@endsection
