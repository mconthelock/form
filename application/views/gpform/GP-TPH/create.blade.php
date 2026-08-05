@extends('layouts/webflowTemplate')

@section('styles')
    <style>
        .section-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 1rem;
        }

        .section-box .section-title {
            color: #0f172a;
        }

        .table-header {
            background-color: #1e40af;
            color: #ffffff;
        }

        .table-header th {
            border-color: rgba(255, 255, 255, 0.15);
        }

        #area-picker {
            display: none;
        }

        #area-picker.is-visible {
            display: block;
        }
    </style>
@endsection

@section('contents')
    <div  class="bg-base-200 min-h-screen p-4 md:p-8 flex justify-center text-[13px] leading-relaxed font-sans text-base-content">
        <form id="photo-permission-form" action="#" method="post" class="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 p-6 space-y-6">
            <div class="text-center">
                <H1 class="text-3xl font-bold text-primary">แบบฟอร์มขออนุญาตถ่ายภาพ</H1>
                <H2 lass="text-xl font-semibold uppercase opacity-50 tracking-wider mt-1">(Photo Permission Request Form)</H2>
      
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                    <label class="text-sm font-semibold text-slate-700">Input By:</label>
                    <input type="text" name="INPUTBY" id="INPUTBY" class="input input-bordered w-full" placeholder="" readonly disabled>
                </div>                
                <div class="space-y-2">
                    <label class="text-sm font-semibold text-slate-700">Request By:</label>
                    <input type="text" name="REQBY" id="REQBY" class="input input-bordered w-full" placeholder="">
                </div>
                <div class="space-y-2">
                    <label class="text-sm font-semibold text-slate-700">Name:</label>
                    <input type="text" name="empName" id="empName" class="input input-bordered w-full" placeholder="Name">
                </div>

                <div class="space-y-2">
                    <label class="text-sm font-semibold text-slate-700">Sect./Dept./Div.:</label>
                    <input type="text" name="empDiv" id = "empDiv" class="input input-bordered w-full" placeholder="">
                </div>
            </div>

            <div class="section-box p-5">
                <div class="mb-4">
                    <div class="section-title text-base font-bold">Request Type (ประเภทผู้ยื่นคำขอ)</div>
                </div>
                <div class="space-y-3">
                    <div>
                        <label class="employee-request-group inline-flex items-center gap-3">
                            <input type="radio" name="request_type[]" value="employee" class="radio radio-primary">
                            <span>Employee Request</span>
                        </label>
                        <div class="ml-8 mt-2 space-y-2">
                            <label class="employee-request-group flex flex-row items-center gap-2">
                                <input type="radio" name="request_sub_type" value="individual" class="radio radio-primary">
                                <span>Individual Request</span>
                            </label>
                            <label class="employee-request-group flex flex-row items-center gap-2">
                                <input type="radio" name="request_sub_type" value="group" class="radio radio-primary">
                                <span>Group Request</span>
                            </label>
                        </div>
                    </div>
                    <label class="host-request-group inline-flex items-center gap-3">
                        <input type="radio" name="request_type[]" value="host_external" class="radio radio-primary">
                        <span>Host Request for External Personnel (พนักงานขอแทนบุคคลภายนอก)</span>
                    </label>
                </div>
            </div>
    <div id="applicant-visitor-section" class="section-box p-5"> <!สำหรับพนักงาน>
                <div class="flex items-center justify-between mb-4">
                    <div class="section-title text-base font-bold">Applicant / Visitor Information (ข้อมูลผู้ขอ)</div>
                    <button type="button" id="add-visitor-row" class="btn btn-sm btn-primary">+</button>
                </div>
                <div class="overflow-x-auto">
                    <table class="table w-full border border-slate-200">
                        <thead class="table-header">
                            <tr>
                                <th class="p-3 text-left">EMP Code</th>
                                <th class="p-3 text-left">Name</th>
                                <th class="p-3 text-left">Division</th>
                                <th class="p-3 text-left">Department</th>
                                <th class="p-3 text-left">Section</th>
                                <th class="p-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody id="visitor-table-body">
                            <tr>
                                <td class="border p-2"><input type="text" name="visitor_emp_code[]" class="input input-sm input-bordered w-full"></td>
                                <td class="border p-2"><input type="text" name="visitor_name[]" class="input input-sm input-bordered w-full"></td>
                                <td class="border p-2"><input type="text" name="visitor_division[]" class="input input-sm input-bordered w-full"></td>
                                <td class="border p-2"><input type="text" name="visitor_department[]" class="input input-sm input-bordered w-full"></td>
                                <td class="border p-2"><input type="text" name="visitor_section[]" class="input input-sm input-bordered w-full"></td>
                                <td class="border p-2 text-center">
                                    <button type="button" class="btn btn-sm btn-error remove-row">×</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div id="host-external-section" class="section-box p-5 hidden"> <!สำหรับบุคคลภายนอก>
                <div class="section-title text-base font-bold mb-4">Applicant / External Visitor Information (ข้อมูลผู้ขอ / บุคคลภายนอก)</div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label class="text-sm font-semibold text-slate-700">Visitor Name (ชื่อบุคคลภายนอก)</label>
                        <input type="text" name="host_visitor_name" class="input input-bordered w-full" placeholder="Visitor Name">
                        <label class="text-sm font-semibold text-slate-700">Host Name (ชื่อผู้รับผิดชอบ)</label>
                        <input type="tel" name="host_name" class="input input-bordered w-full" placeholder="Host Name">
                    </div>
                    <div class="space-y-2">
                        <label class="text-sm font-semibold text-slate-700">Company Name (ชื่อบริษัท)</label>
                        <input type="text" name="host_company_name" class="input input-bordered w-full" placeholder="Company Name">
                       
                    </div>
                </div>
                <div class="mt-3 text-sm text-red-500">
                    *การขออนุญาตถ่ายภาพให้บุคคลภายนอก Requester ที่เป็นผู้ร้องขอจะต้องเป็นผู้รับผิดชอบในการดูแล สติกเกอร์ หรือ บัตรถ่ายภาพนั้นๆ​
                </div>
            </div>

            <div class="section-box p-5">
                <div class="section-title text-base font-bold mb-3">Recording Details (รายละเอียดการถ่ายภาพ)</div>
                <textarea name="recording_purpose" rows="4" class="textarea textarea-bordered w-full" placeholder="Purpose of Recording (วัตถุประสงค์)"></textarea>
            </div>

            <div class="grid grid-cols-1 gap-4">
                <div class="section-box p-5">
                    <div class="section-title text-base font-bold mb-3">Permit Date (วันที่ขออนุญาต)</div>
                    <label class="flex items-center gap-2">
                        <input type="radio" name="permit_option" class="radio radio-primary" value="long_term">
                        <span>Long-Term Use (ใช้ระยะยาว)</span>
                    </label>
                    <div class="mt-3">
                        <input type="number" name="permit_long_term_years" class="input input-bordered w-full" placeholder="Year(s)" inputmode="numeric" pattern="[0-9]*" min="0" step="1">
                    </div>
                    <label class="inline-flex items-center gap-2 mt-4">
                        <input type="radio" name="permit_option" class="radio radio-primary" value="period">
                        <span>Use within period Date & Time (ใช้ในระยะเวลาที่กำหนด)</span>
                    </label>
                    <div class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm text-slate-600 mb-1">Start Date</label>
                            <input type="date" name="permit_start_date" class="input input-bordered w-full">
                        </div>
                        <div>
                            <label class="block text-sm text-slate-600 mb-1">Valid Until (ใช้ได้จนถึง)</label>
                            <input type="date" name="permit_valid_until" class="input input-bordered w-full">
                        </div>
                    </div>
                </div>

                <div class="section-box p-5">
                    <div class="section-title text-base font-bold mb-3">Permit Type (ประเภทที่ต้องการอนุญาต)</div>
                       <div class="space-y-3">
                        <label class="flex flex-row items-center gap-2">
                            <input type="checkbox" name="permit_type[]" value="helmet_sticker" class="checkbox checkbox-primary">
                            <span>Helmet Sticker (สติกเกอร์ติดหมวก)</span>
                        </label>
                        <label class="flex flex-row items-center gap-2">
                            <input type="checkbox" name="permit_type[]" value="photo_permit_badge" class="checkbox checkbox-primary">
                            <span>Photo Permit Badge (บัตรอนุญาตถ่ายภาพ)</span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="section-box p-5">
                <div class="flex items-center justify-between mb-4">
                    <div class="section-title text-base font-bold">Area to Recorded (พื้นที่ที่ต้องการถ่ายภาพ)</div>
                    <button type="button" id="add-area-row" class="btn btn-sm btn-primary">+</button>
                </div>
                <div class="overflow-x-auto">
                    <table class="table w-full border border-slate-200">
                        <thead class="table-header">
                            <tr>
                                <th class="border p-2 text-left">No</th>
                                <th class="border p-2 text-left">Location</th>
                                <th class="border p-2 text-left">Area</th>
                                <th class="border p-2 text-left">Level</th>
                                <th class="border p-2 text-left">Area Owner</th>
                                <th class="border p-2 text-center">Action</th>
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

                <div id="area-picker" class="mt-4 border border-slate-200 p-4">
                    <div class="mb-3 font-semibold text-slate-700">Select photo permission area</div>
                    <div id="area-picker-list" class="space-y-2"></div>
                    <div id="area-picker-empty" class="hidden text-slate-500">ไม่พบข้อมูลพื้นที่ กรุณาเพิ่มข้อมูลที่หน้า Area ก่อน</div>
                    <button type="button" id="confirm-area-selection" class="btn btn-sm btn-primary mt-4">Add selected area</button>
                </div>
            </div>

            <div class="flex justify-start">
                <button type="submit" class="btn btn-primary px-12">Save</button>
            </div>

            <template id="visitor-row-template">
                <tr>
                    <td class="border p-2"><input type="text" name="visitor_emp_code[]" class="input input-sm input-bordered w-full"></td>
                    <td class="border p-2"><input type="text" name="visitor_name[]" class="input input-sm input-bordered w-full"></td>
                    <td class="border p-2"><input type="text" name="visitor_division[]" class="input input-sm input-bordered w-full"></td>
                    <td class="border p-2"><input type="text" name="visitor_department[]" class="input input-sm input-bordered w-full"></td>
                    <td class="border p-2"><input type="text" name="visitor_section[]" class="input input-sm input-bordered w-full"></td>
                    <td class="border p-2 text-center"><button type="button" class="btn btn-sm btn-error remove-row">×</button></td>
                </tr>
            </template>

            <template id="area-row-template">
                <tr>
                    <td class="border p-2 text-center"></td>
                    <td class="border p-2"><input type="text" name="area_location[]" class="input input-sm input-bordered w-full"></td>
                    <td class="border p-2"><input type="text" name="area_name[]" class="input input-sm input-bordered w-full"></td>
                    <td class="border p-2"><input type="text" name="area_level[]" class="input input-sm input-bordered w-full"></td>
                    <td class="border p-2"><input type="text" name="area_owner[]" class="input input-sm input-bordered w-full"></td>
                    <td class="border p-2 text-center"><button type="button" class="btn btn-sm btn-error remove-area-row">×</button></td>
                </tr>
            </template>
        </form>
    </div>
@endsection

@section('scripts')
    <script src="{{ $_ENV['APP_JS'] }}/gpTPH.js?ver={{ $GLOBALS['version'] }}"></script>
@endsection