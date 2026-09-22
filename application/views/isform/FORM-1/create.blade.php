@extends('layouts/webflowTemplate')
@section('contents')
    <form action="" id="form-is-dev">
        <input type="text" class="hidden" id="NFRMNO" value="{{ $NFRMNO }}" />
        <input type="text" class="hidden" id="VORGNO" value="{{ $VORGNO }}" />
        <input type="text" class="hidden" id="CYEAR" value="{{ $CYEAR }}" />
        <input type="text" class="hidden" id="EMPNO" value="{{ $EMPNO }}" name="input_by" />

        <section class="flex flex-col gap-3 mb-4">
            <h1 class="text-3xl font-bold text-primary">Annual software development plan</h1>
            {{-- Request User --}}
            <fieldset class="bg-primary/10 border border-primary rounded-xl p-5">
                <legend class="font-semibold text-lg px-1">Requester</legend>
                <div class="flex gap-8">
                    <fieldset class="fieldset flex-1">
                        <legend class="fieldset-legend">Requrst By</legend>
                        <input type="text" class="input hidden req-1" placeholder="Employee No." id="req-by-input"
                            value="{{ $EMPNO }}" name="req_by" />
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

            {{-- Request Detail Section --}}
            <fieldset class="bg-primary/10 border border-primary rounded-xl p-5">
                <fieldset class="fieldset">
                    <legend class="fieldset-legend">Title</legend>
                    <input type="text" class="input w-full req-1" name="title"
                        placeholder="ตั้งชื่อ Request / ชื่อโปรเจค" />
                </fieldset>

                <fieldset class="fieldset">
                    <legend class="fieldset-legend">Detail</legend>
                    <textarea class="textarea w-full h-56 text-comment req-1" name="detail" maxlength="500"
                        placeholder="เขียนอธิบายภาพรวมของ Requirement นี้ หรือบอกถึงวัตถุประสงค์ของการ Project นี้"></textarea>
                    <div class="label text-xs justify-start text-red-500 text-comment-err"></div>
                    <div class="label text-xs justify-end text-count"><span class="text-count-no"
                            id="detail-count">0</span>/1000</div>
                </fieldset>

                <fieldset class="fieldset">
                    <div class="flex">
                        <legend class="flex-1 fieldset-legend">Additional Information</legend>
                        <button class="btn btn-primary btn-sm" id="add-file" type="button">+</button>
                    </div>
                    <p class="label">แนบเอกสารที่เกี่ยวข้อง เช่น Flow การทำงาน, Screenshot เป็นต้น</p>
                    <div class="flex flex-col gap-2 items-center file-input-wrap">
                        <input type="file" class="file-input file-input-sm w-full" name="attachments[]" />
                    </div>
                </fieldset>


                {{-- <legend class="font-semibold text-lg px-1">Request Detail</legend>
                <div class="flex gap-3 w-full justify-between">
                    <fieldset class="fieldset flex-1">
                        <legend class="fieldset-legend">Title</legend>
                        <input type="text" class="input w-full req" name="title" placeholder="Type here" />
                    </fieldset>
                    <fieldset class="fieldset flex-none">
                        <legend class="fieldset-legend">Objective</legend>
                        <select class="select w-full req" name="objective" id="objective">
                            <option disabled selected>Select Objective</option>
                        </select>
                    </fieldset>
                </div> --}}
                {{-- <fieldset class="fieldset">
                    <legend class="fieldset-legend">Purpose</legend>
                    <textarea class="textarea w-full req" name="purpose" placeholder=""></textarea>
                </fieldset> --}}
                {{-- <fieldset class="fieldset">
                    <legend class="fieldset-legend">Current Working Operation</legend>
                    <textarea class="textarea w-full req" name="current" placeholder="Bio"></textarea>
                </fieldset>
                <fieldset class="fieldset">
                    <legend class="fieldset-legend">Expected Outcome</legend>
                    <textarea class="textarea w-full req" name="expected" placeholder="Bio"></textarea>
                </fieldset>

                <fieldset class="fieldset">
                    <legend class="fieldset-legend">Additional Information</legend>
                    <div class="flex gap-2 items-center ">
                        <input type="file" class="file-input w-full flex-1" name="file[]"
                            accept="image/*,.pdf,.docx, .xlsx, .pptx" />
                        <button class="btn btn-primary btn-sm" type="button" id="add-file">+</button>
                    </div>
                </fieldset> --}}
            </fieldset>

            <fieldset class="bg-primary/10 border border-primary rounded-xl p-5 form-roi">
                <legend class="font-semibold text-lg px-1">Expected Outcome</legend>
                <div class="flex gap-3">
                    <div class="flex-1">
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend">Objective</legend>
                            <div class="flex items-center gap-3">
                                <select class="select s2 req-2" id="req-objective">
                                    <option value=""></option>
                                </select>
                                <input type="text" placeholder="Other Objective" class="input"
                                    id="req-objective-other" readonly />
                            </div>
                        </fieldset>
                    </div>
                    <div class="flex-1">
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend">ROI Payback Period</legend>
                            <div class="flex items-center gap-3">
                                <input type="text" placeholder="จำนวนปีที่คาดว่าจะคืนทุน" class="input req-2" />
                                <span class="text-gray-500 text-xs"> Year(s)</span>
                            </div>
                        </fieldset>
                    </div>
                </div>

                <fieldset class="fieldset">
                    <legend class="fieldset-legend">Preferred Requirement Gathering Period</legend>
                    <p class="label italic">กำหนดการที่พร้อมสำหรับการเก็บรวบรวมข้อกำหนดและ Developer เริ่มงานได้</p>
                    <label class="input">
                        <input type="text" class="grow fdate req-2" placeholder="{{ Date('Y-M') }}" />
                        <i class="icofont-calendar"></i>
                    </label>
                </fieldset>


                <fieldset class="fieldset">
                    <legend class="fieldset-legend">Current Workflow</legend>
                    <textarea class="textarea w-full h-56 text-comment req-2"
                        placeholder="อธิบายวิธีการทำงานในปัจจุบัน เช่น พนักงานต้องกรอกแบบฟอร์มกระดาษแล้วจึงส่ง Approve เป็นต้น"></textarea>
                    <div class="label text-xs justify-start text-red-500 text-comment-err"></div>
                    <div class="label text-xs justify-end text-count"><span class="text-count-no"
                            id="current-workflow-count">0</span>/1000</div>
                </fieldset>

                <fieldset class="fieldset">
                    <legend class="fieldset-legend">Expected Workflow</legend>
                    <textarea class="textarea w-full h-56 text-comment req-2"
                        placeholder="อธิบายวิธีการทำงานที่คาดหวังหลังจากโครงการนี้สำเร็จ เช่น พนักงานกรอกแบบฟอร์มออนไลน์แล้วระบบส่ง Approve บนระบบ Webflow เป็นต้น"></textarea>
                    <div class="label text-xs justify-start text-red-500 text-comment-err"></div>
                    <div class="label text-xs justify-end text-count"><span class="text-count-no"
                            id="expected-workflow-count">0</span>/1000</div>
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
            </fieldset>

            <fieldset class="bg-primary/10 border border-primary rounded-xl p-5 form-roi">
                <legend class="font-semibold text-lg px-1">Investment in equipment.</legend>
                <div class="table-wrap overflow-x-auto">
                    @include('isform.FORM-1.table-investment')
                </div>
            </fieldset>

            <div class="form-roi bg-accent/10 border border-accent rounded-xl p-5 mt-3">
                This project will return on investment (ROI) <span class="font-bold text-lg text-primary"
                    id="roi-total-kb">0</span>KB (<span class="font-bold text-lg text-primary"
                    id="roi-total-full">0</span>
                Baht)
            </div>


            <div class="flex gap-3 mt-3 ">
                <button class="btn btn-primary" id="confirm-form"><i class="fi fi-tr-multiple"></i>Confirm</button>
            </div>
        </section>
    </form>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/form-1.js"></script>
    <script src="{{ $_ENV['APP_JS'] }}/form-1-ui.js"></script>
@endsection

@section('styles')
    <style>
        .table-wrap {
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-radius: 0.5rem;
            overflow: hidden;
        }

        .table thead tr th {
            text-align: center;
            vertical-align: middle;
            font-weight: 700;
            background: var(--color-primary);
            color: white;
        }

        .table tbody tr td {
            padding: 0 .5rem;
        }

        .table tbody tr td input {
            height: 100%;
            width: 100%;
            box-sizing: border-box;
            border: none;
            border-radius: 0%;
            padding: 0.5rem;
            background: rgba(0, 0, 0, 0.15);
            text-align: right;
        }
    </style>
@endsection
