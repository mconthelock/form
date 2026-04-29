@extends('layouts.main')

@section('content')
<div class="min-h-screen bg-slate-100 p-4">

    <div class="rounded-2xl bg-white shadow-lg overflow-hidden">

        <!-- Header -->
        <div class="bg-gradient-to-r from-teal-800 to-teal-500 py-5">
            <h1 class="text-center text-3xl font-bold text-white">
                MFG E-Daily Report Form
            </h1>
        </div>

        <form id="formMfgEdr" enctype="multipart/form-data" class="p-5">

            <!-- Main Info -->
            <div class="overflow-hidden rounded-xl border border-slate-300">

                <div class="grid grid-cols-12 border-b border-slate-300">
                    <label class="col-span-2 bg-purple-100 p-3 font-semibold text-slate-700">
                        Create By
                    </label>
                    <div class="col-span-10 p-3 font-bold text-slate-800">
                        {{ session('empno') ?? '' }}_{{ session('empname') ?? '' }}
                    </div>
                </div>

                <div class="grid grid-cols-12 border-b border-slate-300">
                    <label class="col-span-2 bg-purple-100 p-3 font-semibold text-slate-700">
                        Request By <span class="text-red-500">*</span>
                    </label>
                    <div class="col-span-4 p-3">
                        <input 
                            type="text" 
                            id="request_by" 
                            name="request_by"
                            maxlength="5"
                            placeholder="Ex. 15199"
                            class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 focus:ring focus:ring-teal-200"
                        >
                        <div id="request_by_name" class="mt-1 text-sm font-semibold text-teal-700"></div>
                    </div>

                    <label class="col-span-2 bg-purple-100 p-3 font-semibold text-slate-700">
                        Repair by (ผู้แก้ไข) <span class="text-red-500">*</span>
                    </label>
                    <div class="col-span-4 p-3">
                        <input 
                            type="text" 
                            id="repair_by" 
                            name="repair_by"
                            maxlength="5"
                            placeholder="Ex. 15199"
                            class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 focus:ring focus:ring-teal-200"
                        >
                        <div id="repair_by_name" class="mt-1 text-sm font-semibold text-teal-700"></div>
                    </div>
                </div>

                <div class="grid grid-cols-12 border-b border-slate-300">
                    <label class="col-span-2 bg-purple-100 p-3 font-semibold text-slate-700">
                        ประเภทของงาน <span class="text-red-500">*</span>
                    </label>
                    <div class="col-span-4 p-3">
                        <select 
                            id="job_type" 
                            name="job_type"
                            class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 focus:ring focus:ring-teal-200"
                        >
                            <option value="">--- Please select ---</option>
                        </select>
                    </div>

                    <label class="col-span-2 bg-purple-100 p-3 font-semibold text-slate-700">
                        สาเหตุ(เบื้องต้น) <span class="text-red-500">*</span>
                    </label>
                    <div class="col-span-4 p-3">
                        <select 
                            id="cause" 
                            name="cause"
                            class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 focus:ring focus:ring-teal-200"
                        >
                            <option value="">--- Please select ---</option>
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-12 border-b border-slate-300">
                    <label class="col-span-2 bg-purple-100 p-3 font-semibold text-slate-700">
                        เอกสาร / รูปภาพ
                    </label>
                    <div class="col-span-10 p-3">
                        <input 
                            type="file" 
                            id="filUpload_ref" 
                            name="filUpload_ref[]" 
                            multiple
                            class="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-teal-600 file:px-4 file:py-2 file:text-white hover:file:bg-teal-700"
                        >
                        <p class="mt-2 text-xs font-semibold text-red-500">
                            **ชื่อไฟล์ห้ามมีช่องว่างหรืออักษรพิเศษ เช่น [ ' , " * ]
                        </p>
                    </div>
                </div>

                <div class="grid grid-cols-12">
                    <label class="col-span-2 bg-purple-100 p-3 font-semibold text-slate-700">
                        Remark
                    </label>
                    <div class="col-span-10 p-3">
                        <textarea 
                            id="remark" 
                            name="remark" 
                            rows="4"
                            placeholder="REMARK !!!"
                            class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 focus:ring focus:ring-teal-200"
                        ></textarea>
                    </div>
                </div>

            </div>

            <!-- Action Row -->
            <div class="mt-4 flex items-center justify-between">
                <button 
                    type="button" 
                    id="btnAddRow"
                    class="rounded-full bg-orange-500 px-6 py-3 font-bold text-white shadow hover:bg-orange-600"
                >
                    Add Row
                </button>

                <div class="rounded-full bg-yellow-300 px-8 py-3 font-bold text-yellow-800 shadow">
                    Total Row : <span id="totalRow">0</span>
                </div>
            </div>

            <!-- Detail Table -->
            <div class="mt-4 overflow-x-auto rounded-xl border border-slate-300">
                <table id="tblDetail" class="w-full min-w-[1200px] border-collapse">
                    <thead class="bg-teal-800 text-white">
                        <tr>
                            <th class="w-12 border border-slate-300 px-3 py-3 text-left"></th>
                            <th class="border border-slate-300 px-3 py-3 text-left">Order no <span class="text-red-300">*</span></th>
                            <th class="border border-slate-300 px-3 py-3 text-left">Drawing no <span class="text-red-300">*</span></th>
                            <th class="border border-slate-300 px-3 py-3 text-left">Project no</th>
                            <th class="border border-slate-300 px-3 py-3 text-left">Prod Jun</th>
                            <th class="border border-slate-300 px-3 py-3 text-left">Item <span class="text-red-300">*</span></th>
                            <th class="border border-slate-300 px-3 py-3 text-left">Model</th>
                            <th class="border border-slate-300 px-3 py-3 text-left">Qty <span class="text-red-300">*</span></th>
                            <th class="border border-slate-300 px-3 py-3 text-left">Detail of problem</th>
                            <th class="w-20 border border-slate-300 px-3 py-3 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody id="detailBody">
                        <!-- JS Add Row -->
                    </tbody>
                </table>
            </div>

            <!-- Submit -->
            <div class="mt-6 flex justify-center gap-4">
                <button 
                    type="button" 
                    id="btnSaveDraft"
                    class="rounded-full bg-yellow-400 px-7 py-3 font-bold text-slate-900 shadow hover:bg-yellow-500"
                >
                    Save Draft
                </button>

                <button 
                    type="button" 
                    id="btnSendForm"
                    class="rounded-full bg-violet-600 px-7 py-3 font-bold text-white shadow hover:bg-violet-700"
                >
                    Send Form
                </button>
            </div>

        </form>
    </div>
</div>

<script>
let rowIndex = 0;

function updateTotalRow() {
    $('#totalRow').text($('#detailBody tr').length);
}

function buildRow() {
    rowIndex++;

    return `
        <tr class="hover:bg-slate-50">
            <td class="border border-slate-300 px-3 py-2 text-center font-semibold">${rowIndex}</td>

            <td class="border border-slate-300 px-2 py-2">
                <input name="order_no[]" class="w-full rounded border border-slate-300 px-2 py-1">
            </td>

            <td class="border border-slate-300 px-2 py-2">
                <input name="drawing_no[]" class="w-full rounded border border-slate-300 px-2 py-1">
            </td>

            <td class="border border-slate-300 px-2 py-2">
                <input name="project_no[]" class="w-full rounded border border-slate-300 px-2 py-1">
            </td>

            <td class="border border-slate-300 px-2 py-2">
                <input name="prod_jun[]" class="w-full rounded border border-slate-300 px-2 py-1">
            </td>

            <td class="border border-slate-300 px-2 py-2">
                <input name="item[]" class="w-full rounded border border-slate-300 px-2 py-1">
            </td>

            <td class="border border-slate-300 px-2 py-2">
                <input name="model[]" class="w-full rounded border border-slate-300 px-2 py-1">
            </td>

            <td class="border border-slate-300 px-2 py-2">
                <input name="qty[]" type="number" min="1" class="w-full rounded border border-slate-300 px-2 py-1">
            </td>

            <td class="border border-slate-300 px-2 py-2">
                <input name="problem_detail[]" class="w-full rounded border border-slate-300 px-2 py-1">
            </td>

            <td class="border border-slate-300 px-2 py-2 text-center">
                <button type="button" class="btnDeleteRow rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white hover:bg-red-600">
                    Delete
                </button>
            </td>
        </tr>
    `;
}

$('#btnAddRow').on('click', function () {
    $('#detailBody').append(buildRow());
    updateTotalRow();
});

$(document).on('click', '.btnDeleteRow', function () {
    $(this).closest('tr').remove();

    $('#detailBody tr').each(function(index) {
        $(this).find('td:first').text(index + 1);
    });

    rowIndex = $('#detailBody tr').length;
    updateTotalRow();
});

// ตัวอย่างจุดผูก API ชื่อพนักงาน
$('#request_by, #repair_by').on('change blur', function () {
    const empno = $(this).val().trim();
    const target = this.id === 'request_by' ? '#request_by_name' : '#repair_by_name';

    if (!empno) {
        $(target).text('');
        return;
    }

    // TODO: เปลี่ยน URL ตาม API จริง
    /*
    $.get(`/api/employee/${empno}`, function(res) {
        $(target).text(res.empname || 'ไม่พบข้อมูล');
    });
    */
});
</script>
@endsection