@extends('layouts/webflowTemplate')

@section('styles')
    <style>
        .fieldset-legend {
            font-size: 11pt;
        }

        .floating-label>span {
            font-size: 16pt;
        }
    </style>
@endsection
@section('contents')
    <form action="" id="form-trouble" method="post" enctype="multipart/form-data">
        <div class="w-full bg-white">
            <div class="max-w-7xl w-full mx-auto px-4 py-4 rounded-xl space-y-4">
                <div class="form-info" NFRMNO="{{ $_GET['no'] }}" VORGNO="{{ $_GET['orgNo'] }}" CYEAR="{{ $_GET['y'] }}"></div>
                <div class="flex items-center justify-between mb-4">
                    <h1 class="text-3xl font-bold text-blue-900">IS Trouble Report</h1>
                </div>
                <fieldset class="border-2 bg-indigo-50 border-indigo-300 rounded-box p-4">
                    <legend class="font-semibold text-lg">ผู้แจ้ง / Requester</legend>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label class="floating-label">
                            <span>วันที่ / Date</span>
                            <input type="date" class="input border-2 bg-white rounded-lg w-full" name="request_date" id="request_date" placeholder="วันที่ / Date" />
                            <input type="hidden" id="req" value="{{ $_GET['empno'] }}">
                            <input type="hidden" id="key" value="{{ $_GET['empno'] }}">
                        </label>
                        <label class="floating-label">
                            <span>ชื่อ / Name</span>
                            <input type="text" class="input border-2 bg-white rounded-lg w-full" name="request_name" id="request_name" placeholder="ชื่อ / Name" />
                        </label>
                        <label class="floating-label">
                            <span>สถานที่ / location</span>
                            <input type="text" class="input border-2 bg-white rounded-lg w-full" name="request_location" id="request_location" placeholder="สถานที่ / Location" />
                        </label>
                        <label class="floating-label">
                            <span>เบอร์โทร / Tel</span>
                            <input type="text" class="input border-2 bg-white rounded-lg w-full" name="request_tel" id="request_tel" placeholder="เบอร์โทร / Tel" />
                        </label>
                        <label for="" class="floating-label">
                            <span>Email</span>
                            <input type="email" class="input border-2 bg-white rounded-lg w-full" name="request_email" id="request_email" placeholder="Email" />
                        </label>
                        <label for="" class="floating-label col-span-2">
                            <span>Notes</span>
                            <textarea class="textarea border-2 w-full rounded-lg bg-white " name="request_note" id="request_note" placeholder="Note"></textarea>
                        </label>
                    </div>
                </fieldset>
                <fieldset class="border-2 bg-indigo-50 border-indigo-300 rounded-box p-4">
                    <legend class="font-semibold text-lg ">ผู้ปฏิบัติงาน / Person in Charge</legend>
                    <div class="grid grid-cols-2 gap-3">
                        <fieldset class="border-2 bg-white border-base-300 rounded-box p-4">
                            <legend class="font-semibold  text-base text-gray-600">ชื่อ / Name</legend>
                            <div id="personList" class="space-y-3">
                                <div class="flex gap-3 items-center person-entry">
                                    <select name="employee[]" id="" class="select user_select">
                                        <option value="">Select a Employee</option>
                                    </select>
                                    <button type="button" id="addPerson" class="btn btn-primary rounded-xl">➕ เพิ่มชื่อ</button>
                                    <!-- <input type="text" name="name[]" placeholder="ชื่อ / Name" class="input input-bordered bg-white rounded-lg w-full max-w-xs" /> -->
                                    <!-- <button type="button" class="btn btn-error btn-sm rounded-xl remove-btn">ลบ</button> -->
                                </div>
                            </div>


                        </fieldset>
                        <fieldset class="border-2 bg-white border-base-300 rounded-box p-4">
                            <legend class="font-semibold text-base text-gray-600">ผลลัพธ์ / Result</legend>
                            <div class="space-y-2">
                                <label class="flex items-center gap-2">
                                    <input type="radio" name="result" id="complate" value="1" class="radio radio_result" />
                                    <span>✔️ เสร็จสิ้น / Complete</span>
                                </label>
                                <label class="flex items-center gap-2">
                                    <input type="radio" name="result" id="incomplete" value="2" class="radio radio_result" />
                                    <span>❌ ไม่เสร็จ / Incomplete</span>
                                </label>
                                <input type="text" class="input rounded-lg bg-white hidden" placeholder="ระบุ / Specify" name="result_detail" id="result_detail" />
                            </div>
                        </fieldset>
                    </div>

                    <fieldset class="border-2 bg-white border-base-300 rounded-box p-4 mt-2">
                        <legend class="font-semibold text-base text-gray-600">แจ้งผลกลับ? / Inform to Requester?</legend>
                        <div class="form-control">
                            <label class="label cursor-pointer">
                                <input type="radio" name="inform" id="inform-yes" value="1" class="radio radio-inform" />
                                <span class="label-text ml-2 text-gray-700">✔️ ใช่ / Yes, เวลา / When</span>
                            </label>
                            <input type="text" name="when" placeholder="เวลา / When" id="when" class="input bg-white input-bordered rounded-lg w-full mt-1" disabled />
                        </div>

                        <div class="form-control mt-2">
                            <label class="label cursor-pointer">
                                <input type="radio" name="inform" id="inform-no" value="2" class="radio radio-inform" />
                                <span class="label-text ml-2 text-gray-700">❌ ไม่ / No, เพราะ / Because</span>
                            </label>
                            <input type="text" name="because" placeholder="เหตุผล / Reason" id="reason" class="input bg-white input-bordered rounded-lg w-full mt-1" disabled />
                        </div>
                    </fieldset>
                </fieldset>

                <fieldset class="border-2 bg-indigo-50 border-indigo-300 rounded-box p-4">
                    <legend class="font-semibold text-lg">ลักษณะปัญหา / Trouble Type</legend>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- ซ้าย: Data Access -->
                        <!-- {{ print_r($category) }} -->
                        @foreach ($category as $cat)
                            <div class="p-4 border-2 bg-white rounded-box space-y-2">
                                <p class="font-semibold">{{ $cat['category_name'] }}</p>
                                @foreach ($cat['types'] as $type)
                                    <div class="form-control">
                                        <label class="label cursor-pointer">
                                            <input type="checkbox" name="trouble_type[]" value="{{ $type['type_id'] }}" class="checkbox" />
                                            <span class="label-text ml-2">{{ $type['type_name'] }}</span>
                                        </label>
                                    </div>
                                @endforeach
                            </div>
                        @endforeach
                    </div>
                </fieldset>

                <fieldset class="border-2 bg-indigo-50 border-indigo-300 rounded-box p-4 ">
                    <legend class="font-semibold text-lg">สาเหตุปัญหา / Cause Trouble</legend>
                    <textarea name="cause_detail" id="cause_detail" class="textarea border-2 bg-white textarea-bordered rounded-lg h-50 w-full" placeholder="..."></textarea>

                    <!-- แนบแผนภาพ -->
                    <div class="form-control">
                        <label class="label font-medium">แนบเอกสาร (ถ้ามี)</label>
                        <input type="file" accept="image/*" class="border-2 file-input rounded-lg file-input-bordered w-full" name="cause_image" />
                    </div>

                </fieldset>

                <fieldset class="border-2 bg-indigo-50 border-indigo-300 rounded-box p-4 ">
                    <legend class="font-semibold text-lg">วิธีการแก้ไขปัญหา / Countermeasure(s)</legend>
                    <textarea name="fix_detail" id="fix_detail" class="textarea border-2 bg-white textarea-bordered rounded-lg h-50 w-full" placeholder="..."></textarea>

                    <!-- แนบแผนภาพ -->
                    <div class="form-control">
                        <label class="label font-medium">แนบเอกสาร (ถ้ามี)</label>
                        <input type="file" accept="image/*" class="border-2 file-input rounded-lg file-input-bordered w-full" name="fix_image" />
                    </div>

                </fieldset>

                <fieldset class="border-2 bg-indigo-50 border-indigo-300 rounded-box p-4">
                    <legend class="font-semibold text-lg">คำแนะนำ แนวทางการป้องกัน / Suggestion Prevention</legend>
                    <textarea name="Prevention" id="Prevention" class="border-2 textarea bg-white textarea-bordered rounded-lg h-10 w-full" placeholder="..."></textarea>
                </fieldset>

                <div class="flex items-center">
                    <button class="btn btn-success" id="btn-submit">Submit</button>
                </div>



            </div>

        </div>
    </form>



@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/troubleReport.js?ver={{ $GLOBALS['version'] }}"></script>

@endsection