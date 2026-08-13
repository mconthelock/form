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
    </style>
@endsection

@section('contents')
    <div
        class="bg-base-200 min-h-screen p-4 md:p-8 flex justify-center text-[13px] leading-relaxed font-sans text-base-content">
        <form id="photo-permission-form" action="#" method="post"
            class="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 p-6 space-y-6">
            <div class="text-center">
                <H1 class="text-3xl font-bold text-primary">แบบฟอร์มขออนุญาตถ่ายภาพ</H1>
                <H2 lass="text-xl font-semibold uppercase opacity-50 tracking-wider mt-1">(Photo Permission Request Form)
                </H2>

            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                    <label class="text-sm font-semibold text-slate-700">Input By:</label>
                    <input type="text" name="INPUTBY" id="INPUTBY" class="input input-bordered w-full" placeholder=""
                        readonly disabled>
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
                    <div class="section-title text-base font-bold">Request Type (ประเภทผู้ยื่นคำขอ)</div>
                </div>
                <div class="space-y-3">
                    <div>
                        <label class="employee-request-group inline-flex items-center gap-3">
                            <input type="radio" name="reqtype" id="reqtype" value="employee"
                                class="radio radio-primary">
                            <span>Employee Request</span>
                        </label>
                        <div class="ml-8 mt-2 space-y-2">
                            <label class="employee-request-group flex flex-row items-center gap-2">
                                <input type="radio" name="req_subtype" id="req_subtype" value="individual"
                                    class="radio radio-primary">
                                <span>Individual Request</span>
                            </label>
                            <label class="employee-request-group flex flex-row items-center gap-2">
                                <input type="radio" name="req_subtype" id="req_subtype" value="group"
                                    class="radio radio-primary">
                                <span>Group Request</span>
                            </label>
                        </div>
                    </div>
                    <label class="host-request-group inline-flex items-center gap-3">
                        <input type="radio" name="reqtype" id="reqtype" value="host_external"
                            class="radio radio-primary">
                        <span>Host Request for External Personnel (พนักงานขอแทนบุคคลภายนอก)</span>
                    </label>
                </div>
            </div>
            <div id="applicant-visitor-section" class="section-box p-5">
                <!สำหรับพนักงาน>
                    <div class="flex items-center justify-between mb-4">
                        <div class="section-title text-base font-bold">Applicant / Visitor Information (ข้อมูลผู้ขอ)</div>
                        <button type="button" id="add-visitor-row" class="btn btn-sm btn-success">+</button>
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
                                    <td class="border p-2"><input type="text" name="visitor_Empcode" id="visitor_empcode"
                                            class="input input-sm input-bordered w-full"></td>
                                    <td class="border p-2"><input type="text" name="visitor_name" id= "visitor_name"
                                            class="input input-sm input-bordered w-full"></td>
                                    <td class="border p-2"><input type="text" name="visitor_div" id="visitor_div"
                                            class="input input-sm input-bordered w-full"></td>
                                    <td class="border p-2"><input type="text" name="visitor_dept" id="visitor_dept"
                                            class="input input-sm input-bordered w-full"></td>
                                    <td class="border p-2"><input type="text" name="visitor_sec" id="visitor_sec"
                                            class="input input-sm input-bordered w-full"></td>
                                    <td class="border p-2 text-center">
                                        <button type="button" class="btn btn-sm btn-error remove-row">×</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
            </div>

            <div id="host-external-section" class="section-box p-5 hidden">
                <!สำหรับบุคคลภายนอก>
                    <div class="section-title text-base font-bold mb-4">Applicant / External Visitor Information
                        (ข้อมูลผู้ขอ / บุคคลภายนอก)</div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="space-y-2">
                            <label class="text-sm font-semibold text-slate-700">Visitor Name (ชื่อบุคคลภายนอก)</label>
                            <input type="text" name="host_visitor_name" id="host_visitor_name"
                                class="input input-bordered w-full" placeholder="Visitor Name">
                            <label class="text-sm font-semibold text-slate-700">Host Name (ชื่อผู้รับผิดชอบ)</label>
                            <input type="tel" name="host_name" id="host_name" class="input input-bordered w-full"
                                placeholder="Host Name">
                        </div>
                        <div class="space-y-2">
                            <label class="text-sm font-semibold text-slate-700">Company Name (ชื่อบริษัท)</label>
                            <input type="text" name="host_company_name" id="host_company_name"
                                class="input input-bordered w-full" placeholder="Company Name">

                        </div>
                    </div>
                    <div class="mt-3 text-sm text-red-500">
                        *การขออนุญาตถ่ายภาพให้บุคคลภายนอก Requester ที่เป็นผู้ร้องขอจะต้องเป็นผู้รับผิดชอบในการดูแล
                        สติกเกอร์ หรือ บัตรถ่ายภาพนั้นๆ​
                    </div>
            </div>

            <div class="section-box p-5">
                <div class="section-title text-base font-bold mb-3">Recording Details (รายละเอียดการถ่ายภาพ)</div>
                <textarea name="recording_purpose" rows="4" class="textarea textarea-bordered w-full"
                    placeholder="Purpose of Recording (วัตถุประสงค์)"></textarea>
            </div>

            <div class="grid grid-cols-1 gap-4">
                <div class="section-box p-5">
                    <div class="section-title text-base font-bold mb-3">Permit Date (วันที่ขออนุญาต)</div>
                    <label class="flex items-center gap-2">
                        <input type="radio" name="permit_option" class="radio radio-primary" value="long_term">
                        <span>Long-Term Use (ใช้ระยะยาว)</span>
                    </label>
                    <div class="mt-3">
                        <input type="number" name="permit_long_term_years" class="input input-bordered w-full"
                            placeholder="Year(s)" inputmode="numeric" pattern="[0-9]*" min="0" step="1">
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
                            <input type="radio" name="permit_halmet" id="permit_halmet" value="helmet_sticker"
                                class="radio radio-primary">
                            <span>Helmet Sticker (สติกเกอร์ติดหมวก)</span>
                        </label>
                        <label class="flex flex-row items-center gap-2">
                            <input type="radio" name="permit_photo" id="permit_photo" value="photo_permit_badge"
                                class="radio radio-primary">
                            <span>Photo Permit Badge (บัตรอนุญาตถ่ายภาพ)</span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="section-box p-5">
                <div class="flex items-center justify-between mb-4">
                    <div class="section-title text-base font-bold">Area to Recorded (พื้นที่ที่ต้องการถ่ายภาพ)</div>
                    <label for="modal-add" id="btnaddDatarow"
                        class="btn btn-success btn-sm gap-2 shadow-md hover:scale-105 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Area
                    </label>
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


                <div class="flex justify-start">
                    <button type="submit" class="btn btn-primary px-12">Save</button>
                </div>

                <template id="visitor-row-template">
                    <tr>
                        <td class="border p-2"><input type="text" name="visitor_emp_code[]"
                                class="input input-sm input-bordered w-full"></td>
                        <td class="border p-2"><input type="text" name="visitor_name[]"
                                class="input input-sm input-bordered w-full"></td>
                        <td class="border p-2"><input type="text" name="visitor_division[]"
                                class="input input-sm input-bordered w-full"></td>
                        <td class="border p-2"><input type="text" name="visitor_department[]"
                                class="input input-sm input-bordered w-full"></td>
                        <td class="border p-2"><input type="text" name="visitor_section[]"
                                class="input input-sm input-bordered w-full"></td>
                        <td class="border p-2 text-center"><button type="button"
                                class="btn btn-sm btn-error remove-row">×</button></td>
                    </tr>
                </template>

                <template id="area-row-template">
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
                </template>
        </form>
    </div>

    <input type="checkbox" id="modal-add" class="modal-toggle" />
    <div class="modal" role="dialog">
        <div class="modal-box flex w-[95vw] max-w-7xl max-h-[90vh] flex-col overflow-hidden p-0">
            <!-- Modal Header -->
            <div class="flex items-center justify-between border-b border-base-300 px-6 py-4">
                <h3 class="text-lg font-bold" id="modalHeader"></h3>

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
                            <div class="form-control w-full min-w-0" id="hiddenPuritem">
                                <label class="label py-1">
                                    <span class="label-text font-bold text-base-content/80">
                                        AREA NAME
                                    </span>
                                </label>

                                <input type="text" id="AREANAME" name="AREANAME"
                                    class="input input-bordered input-sm w-full min-w-0 bg-base-100 focus:input-primary" />
                            </div>

                            <div class="form-control w-full min-w-0">
                                <label class="label py-1">
                                    <span class="label-text font-bold text-base-content/80">
                                        AREA LEVEL
                                    </span>
                                </label>
                                <input type="text" id="AREALEVEL" name="AREALEVEL"
                                    class="input input-bordered input-sm w-full min-w-0 bg-base-100 focus:input-primary" />
                            </div>

                            <div class="form-control w-full min-w-0" id="hiddenSch">
                                <label class="label py-1">
                                    <span class="label-text font-bold text-base-content/80">
                                        LOCATION
                                    </span>
                                </label>
                                <input type="text" id="LOCATION" name="LOCATION"
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
                        <div class="mt-4 w-full overflow-hidden">
                            <div class="w-full px-4 py-3">
                                <table class="table table-zebra w-full min-w-[1000px] text-sm" id="modalTable">
                                </table>
                            </div>
                        </div>

                        <!-- Modal Footer -->
                        <div class="flex flex-wrap justify-end gap-2 border-t border-base-300 bg-base-100 px-6 py-4">
                            <label class="btn btn-outline btn-success text-success" for="modal-add" id="addData">
                                <svg class="h-4 w-4 text-current" aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                                    viewBox="0 0 24 24">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M12 7.757v8.486M7.757 12h8.486M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                <span class="text-current">Add</span>
                            </label>

                            <label class="btn btn-outline btn-error text-error" for="modal-add">
                                <svg class="h-4 w-4 text-current" aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                                    viewBox="0 0 24 24">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="2" d="m15 9-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                <span class="text-current">Close</span>
                            </label>
                        </div>
                    </div>
                </div>
            @endsection

            @section('scripts')
                <script src="{{ $_ENV['APP_JS'] }}/gpTPH.js?ver={{ $GLOBALS['version'] }}"></script>
            @endsection
