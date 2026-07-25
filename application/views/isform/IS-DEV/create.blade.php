@extends('layouts/webflowTemplate')

@section('contents')
    <input type="text" class="hiddenx" id="NFRMNO" value="{{ $NFRMNO }}" />
    <input type="text" class="hiddenx" id="VORGNO" value="{{ $VORGNO }}" />
    <input type="text" class="hiddenx" id="CYEAR" value="{{ $CYEAR }}" />
    <input type="text" class="hiddenx" id="CYEAR2" value="{{ $CYEAR }}" />
    <input type="text" class="hiddenx" id="NRUNNO" value="{{ $NRUNNO }}" />
    <input type="text" class="hiddenx" id="EMPNO" value="{{ $EMPNO }}" />
    <section class="flex flex-col gap-3 mb-4 px-32 w-full xl:px-70">
        <h1 class="text-3xl font-bold text-primary"> Computer program Requisition Form </h1>
        {{-- Request User --}}
        <fieldset class="bg-primary/10 border border-primary rounded-xl p-5">
            <legend class="font-semibold text-lg px-1">Requester</legend>
            <div class="flex gap-8">
                <fieldset class="fieldset flex-1">
                    <legend class="fieldset-legend">Requrst By</legend>
                    <input type="text" class="input hidden" placeholder="Employee No." id="req-by-input" />
                    <div class="flex items-center gap-3" id="req-by-info">
                        <div class="avatar flex-none">
                            <div class="w-16 rounded-full" id="req-by-img">
                                <div class="skeleton h-16 w-16"></div>
                                <img src="#" class="hidden" />
                            </div>
                        </div>
                        <div class="flex-none min-w-56 flex flex-col gap-2">
                            <h1 class="font-bold text-md" id="req-by-name">
                                <div class="skeleton h-6 w-48"></div>
                            </h1>
                            <h2 id="req-by-id">
                                <div class="skeleton h-6 w-32"></div>
                            </h2>
                            <div class="text-xs text-gray-500" id="req-by-organization">
                                <div class="skeleton h-6 w-56"></div>
                            </div>
                        </div>
                        <div class="tooltip" data-tip="เปลี่ยนผู้ขอ Request">
                            <a href="#" class="btn btn-ghost btn-circle" id="change-req-employee"><i
                                    class="fi fi-rs-cross text-xl text-red-500"></i></a>
                        </div>

                    </div>
                </fieldset>
                <fieldset class="fieldset flex-1">
                    <legend class="fieldset-legend">Input By</legend>
                    <div class="flex items-center gap-3" id="input-by-info">
                        <div class="avatar flex-none">
                            <div class="w-16 rounded-full" id="input-by-img">
                                <div class="skeleton h-16 w-16"></div>
                                <img src="#" class="hidden" />
                            </div>
                        </div>
                        <div class="flex-1 flex flex-col gap-2">
                            <h1 class="font-bold text-md" id="input-by-name">
                                <div class="skeleton h-6 w-48"></div>
                            </h1>
                            <h2 id="input-by-id">
                                <div class="skeleton h-6 w-32"></div>
                            </h2>
                            <div class="text-xs text-gray-500" id="input-by-organization">
                                <div class="skeleton h-6 w-96"></div>
                            </div>
                        </div>
                    </div>
                </fieldset>
            </div>
        </fieldset>

        <fieldset class="bg-primary/10 border border-primary rounded-xl p-5">
            <legend class="font-semibold text-lg px-1">Request Detail</legend>
            <fieldset class="fieldset">
                <legend class="fieldset-legend">System Name</legend>
                <ul class="flex gap-5">
                    <li class="flex items-center gap-3"><input type="radio" name="system-name"
                            class="radio radio-primary" />AS400 Application</li>
                    <li class="flex items-center gap-3"><input type="radio" name="system-name"
                            class="radio radio-primary" />Windows Application</li>
                </ul>
            </fieldset>

            <fieldset class="fieldset">
                <legend class="fieldset-legend">Request Type</legend>
                <ul class="flex gap-5">
                    <li class="flex items-center gap-3"><input type="radio" name="request-type"
                            class="radio radio-primary request-type" value="1" />Additional Request</li>
                    <li class="flex items-center gap-3"><input type="radio" name="request-type"
                            class="radio radio-primary request-type" value="2" />Modify Program</li>
                    <li class="flex items-center gap-3"><input type="radio" name="request-type"
                            class="radio radio-primary request-type" value="3" />Fixed Error Program</li>
                    <li class="flex items-center gap-3"><input type="radio" name="request-type"
                            class="radio radio-primary request-type" value="4" />Data Change</li>
                    <li class="flex items-center gap-3"><input type="radio" name="request-type"
                            class="radio radio-primary request-type" value="5" />Search Data</li>
                </ul>

            </fieldset>

            <fieldset class="fieldset">
                <legend class="fieldset-legend">Title</legend>
                <input type="text" class="input w-full" placeholder="ตั้งชื่อ Request" />
            </fieldset>

            <fieldset class="fieldset">
                <legend class="fieldset-legend">Detail</legend>
                <textarea class="textarea w-full h-56 text-comment" maxlength="500"
                    placeholder="เขียนอธิบายภาพรวมของ Requirement นี้ หรือบอกถึงวัตถุประสงค์ของการ Project นี้"></textarea>
                <div class="label text-xs justify-start text-red-500 text-comment-err"></div>
                <div class="label text-xs justify-end text-count"><span class="text-count-no">0</span>/1000</div>
            </fieldset>

            <fieldset class="fieldset">
                <legend class="fieldset-legend">Additional Information</legend>
                <p class="label">แนบเอกสารที่เกี่ยวข้อง เช่น Flow การทำงาน, Screenshot เป็นต้น</p>
                <div class="flex gap-2 items-center ">
                    <input type="file" class="file-input file-input-sm flex-1" />
                    <button class="btn btn-primary btn-sm">+</button>
                </div>
            </fieldset>
        </fieldset>

        <fieldset class="bg-primary/10 border border-primary rounded-xl p-5 form-roi">
            <legend class="font-semibold text-lg px-1">Expected Outcome</legend>
            <div class="flex gap-3">
                <div class="flex-1">
                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">Objective</legend>
                        <div class="flex items-center gap-3">
                            <select class="select s2" id="req-objective"></select>
                            <input type="text" placeholder="Other Objective" class="input" />
                        </div>
                    </fieldset>
                </div>
                <div class="flex-1">
                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">ROI Payback Period</legend>
                        <div class="flex items-center gap-3">
                            <input type="text" placeholder="จำนวนปีที่คาดว่าจะคืนทุน" class="input" />
                            <span class="text-gray-500 text-xs"> Year(s)</span>
                        </div>
                    </fieldset>
                </div>
            </div>

            <fieldset class="fieldset">
                <legend class="fieldset-legend">Preferred Requirement Gathering Period</legend>
                <p class="label italic">กำหนดการที่พร้อมสำหรับการเก็บรวบรวมข้อกำหนดและ Developer เริ่มงานได้</p>
                <label class="input">
                    <input type="text" class="grow" placeholder="{{ Date('Y-M') }}" />
                    <i class="icofont-calendar"></i>
                </label>
            </fieldset>


            <fieldset class="fieldset">
                <legend class="fieldset-legend">Current Workflow</legend>
                <textarea class="textarea w-full h-56 text-comment"
                    placeholder="อธิบายวิธีการทำงานในปัจจุบัน เช่น พนักงานต้องกรอกแบบฟอร์มกระดาษแล้วจึงส่ง Approve เป็นต้น"></textarea>
                <div class="label text-xs justify-start text-red-500 text-comment-err"></div>
                <div class="label text-xs justify-end text-count"><span class="text-count-no">0</span>/1000</div>
            </fieldset>

            <fieldset class="fieldset">
                <legend class="fieldset-legend">Expected Workflow</legend>
                <textarea class="textarea w-full h-56 text-comment"
                    placeholder="อธิบายวิธีการทำงานที่คาดหวังหลังจากโครงการนี้สำเร็จ เช่น พนักงานกรอกแบบฟอร์มออนไลน์แล้วระบบส่ง Approve บนระบบ Webflow เป็นต้น"></textarea>
                <div class="label text-xs justify-start text-red-500 text-comment-err"></div>
                <div class="label text-xs justify-end text-count"><span class="text-count-no">0</span>/1000</div>
            </fieldset>


            <div class="table-wrap overflow-x-auto mt-3">
                @include('isform.FORM-1.table-benefit')
            </div>
            <p class="label mt-1 text-xs"></p>
        </fieldset>

        <fieldset class="bg-primary/10 border border-primary rounded-xl p-5 form-roi">
            <legend class="font-semibold text-lg px-1">Efficiency Gains</legend>
            <div class="table-wrap overflow-x-auto">
                @include('isform.FORM-1.table-labor')
            </div>
            <div class="flex mt-3 ">
                <button class="btn btn-outline btn-primary">+ More Row</button>
            </div>
        </fieldset>

        <fieldset class="bg-primary/10 border border-primary rounded-xl p-5 form-roi">
            <legend class="font-semibold text-lg px-1">Investment in equipment.</legend>
            <div class="table-wrap overflow-x-auto">
                @include('isform.FORM-1.table-investment')
            </div>
            <div class="flex mt-3 ">
                <button class="btn btn-outline btn-primary"><i class="fi fi-tr-multiple"></i>+ More Item</button>
            </div>
        </fieldset>

        <div class="flex gap-3 mt-3 ">
            <button class="btn btn-primary"><i class="fi fi-tr-multiple"></i>Confirm</button>
        </div>
    </section>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/isDev.js"></script>
@endsection

@section('styles')
    <style>
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
            min-height: 40px;
            padding: 10px;
            border: none;
            text-align: right;
            font-size: 1.25em
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
    </style>
@endsection
