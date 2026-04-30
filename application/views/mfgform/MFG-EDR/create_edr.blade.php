@extends('layouts/webflowTemplate')

@section('contents')
<style>
    .edr-card {
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
    }

    .edr-label {
        background: #ecfdf5;
        color: #064e3b;
        font-weight: 800;
    }

    .edr-input {
        width: 100%;
        border: 1px solid #cbd5e1;
        border-radius: 0.75rem;
        padding: 0.65rem 0.85rem;
        outline: none;
        background: #fff;
    }

    .edr-input:focus {
        border-color: #14b8a6;
        box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.18);
    }

    .required {
        color: #ef4444;
    }

    button,
    button *,
    .btnDeleteRow,
    #btnAddRow,
    #btnSaveDraft,
    #btnSendForm {
        cursor: pointer !important;
    }

    button:disabled {
        cursor: not-allowed !important;
    }
</style>

<div class="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-50 px-4 py-6">
    <div class="edr-card w-full max-w-[1600px] mx-auto overflow-hidden rounded-2xl bg-white">

        <div class="bg-gradient-to-r from-emerald-900 via-teal-700 to-cyan-600 px-6 py-6">
            <h1 class="text-center text-3xl font-extrabold tracking-wide text-white">
                MFG E-Daily Report Form
            </h1>
        </div>

        <form id="formMfgEdr" enctype="multipart/form-data" class="p-5">

            <div class="overflow-hidden rounded-2xl border border-slate-300 bg-white">

                <div class="grid grid-cols-12 border-b border-slate-300">
                    <div class="edr-label col-span-12 md:col-span-2 px-4 py-3">
                        Create By
                    </div>
                    <div class="col-span-12 md:col-span-10 px-4 py-3 font-bold text-slate-800">
                        {{ isset($empno) ? $empno : '' }} {{ isset($empname) ? $empname : '' }}
                    </div>
                </div>

                <div class="grid grid-cols-12 border-b border-slate-300">
                    <div class="edr-label col-span-12 md:col-span-2 px-4 py-3">
                        Request By <span class="required">*</span>
                    </div>
                    <div class="col-span-12 md:col-span-4 px-4 py-3">
                        <input type="text" id="request_by" name="request_by" maxlength="5"
                            placeholder="Ex.15199" class="edr-input max-w-[180px]">
                        <div id="request_by_name" class="mt-2 text-sm font-bold text-emerald-700"></div>
                    </div>

                    <div class="edr-label col-span-12 md:col-span-2 px-4 py-3">
                        Repair by (ผู้แก้ไข) <span class="required">*</span>
                    </div>
                    <div class="col-span-12 md:col-span-4 px-4 py-3">
                        <input type="text" id="repair_by" name="repair_by" maxlength="5"
                            placeholder="Ex.15199" class="edr-input max-w-[180px]">
                        <div id="repair_by_name" class="mt-2 text-sm font-bold text-emerald-700"></div>
                    </div>
                </div>

                <div class="grid grid-cols-12 border-b border-slate-300">
                    <div class="edr-label col-span-12 md:col-span-2 px-4 py-3">
                        ประเภทของงาน <span class="required">*</span>
                    </div>
                    <div class="col-span-12 md:col-span-4 px-4 py-3">
                        <select id="job_type" name="job_type" class="edr-input">
                            <option value="">--- Please select ---</option>
                        </select>
                    </div>

                    <div class="edr-label col-span-12 md:col-span-2 px-4 py-3">
                        สาเหตุ(เบื้องต้น) <span class="required">*</span>
                    </div>
                    <div class="col-span-12 md:col-span-4 px-4 py-3">
                        <select id="cause" name="cause" class="edr-input">
                            <option value="">--- Please select ---</option>
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-12 border-b border-slate-300">
                    <div class="edr-label col-span-12 md:col-span-2 px-4 py-3">
                        เอกสาร / รูปภาพ
                    </div>
                    <div class="col-span-12 md:col-span-10 px-4 py-3">
                        <input type="file" id="filUpload_ref" name="filUpload_ref[]" multiple
                            class="block w-full text-sm text-slate-700
                            file:mr-4 file:rounded-xl file:border-0
                            file:bg-teal-700 file:px-4 file:py-2
                            file:font-bold file:text-white
                            hover:file:bg-teal-800">

                        <p class="mt-2 text-xs font-bold text-red-500">
                            **ชื่อไฟล์ห้ามมีช่องว่างหรืออักษรพิเศษ เช่น [ ' , " * ]
                        </p>
                    </div>
                </div>

                <div class="grid grid-cols-12">
                    <div class="edr-label col-span-12 md:col-span-2 px-4 py-3">
                        Remark
                    </div>
                    <div class="col-span-12 md:col-span-10 px-4 py-3">
                        <textarea id="remark" name="remark" rows="4"
                            placeholder="REMARK !!!" class="edr-input resize-y"></textarea>
                    </div>
                </div>

            </div>

            <div class="mt-5 flex flex-wrap items-center justify-between gap-3">
                <button type="button" id="btnAddRow"
                    class="rounded-full bg-gradient-to-r from-orange-500 to-amber-400 px-7 py-3 font-extrabold text-white shadow-lg hover:scale-[1.02]">
                    Add Row
                </button>

                <div class="rounded-full border border-yellow-300 bg-yellow-100 px-8 py-3 font-extrabold text-yellow-800 shadow">
                    Total Row : <span id="totalRow">0</span>
                </div>
            </div>

            <div class="mt-5 overflow-x-auto rounded-2xl border border-slate-300">
                <table id="tblDetail" class="w-full min-w-[1350px] border-collapse text-sm">
                    <thead>
                        <tr class="bg-gradient-to-r from-emerald-900 to-teal-700 text-white">
                            <th class="border border-slate-300 px-3 py-3 text-center w-14">#</th>
                            <th class="border border-slate-300 px-3 py-3 text-left">Order no <span class="text-red-300">*</span></th>
                            <th class="border border-slate-300 px-3 py-3 text-left">Drawing no <span class="text-red-300">*</span></th>
                            <th class="border border-slate-300 px-3 py-3 text-left">Project no</th>
                            <th class="border border-slate-300 px-3 py-3 text-left">Prod Jun</th>
                            <th class="border border-slate-300 px-3 py-3 text-left">Item <span class="text-red-300">*</span></th>
                            <th class="border border-slate-300 px-3 py-3 text-left">Model</th>
                            <th class="border border-slate-300 px-3 py-3 text-left">Qty <span class="text-red-300">*</span></th>
                            <th class="border border-slate-300 px-3 py-3 text-left">Detail of problem</th>
                            <th class="border border-slate-300 px-3 py-3 text-center w-24">Action</th>
                        </tr>
                    </thead>
                    <tbody id="detailBody" class="bg-white"></tbody>
                </table>
            </div>

            <div class="mt-8 flex justify-center gap-4">
                <button type="button" id="btnSaveDraft"
                    class="rounded-full bg-yellow-400 px-8 py-3 font-extrabold text-slate-900 shadow-lg hover:bg-yellow-500">
                    Save Draft
                </button>

                <button type="button" id="btnSendForm"
                    class="rounded-full bg-gradient-to-r from-violet-700 to-indigo-500 px-8 py-3 font-extrabold text-white shadow-lg hover:scale-[1.02]">
                    Send Form
                </button>
            </div>

        </form>
    </div>
</div>

<script>
$(document).ready(function () {
    let rowIndex = 0;

    function updateTotalRow() {
        $('#totalRow').text($('#detailBody tr').length);
    }

    function reorderRowNo() {
        $('#detailBody tr').each(function(index) {
            $(this).find('.row-no').text(index + 1);
        });

        rowIndex = $('#detailBody tr').length;
    }

    function buildRow() {
        rowIndex++;

        return `
            <tr class="hover:bg-emerald-50">
                <td class="row-no border border-slate-300 px-2 py-2 text-center font-bold">${rowIndex}</td>

                <td class="border border-slate-300 px-2 py-2">
                    <input name="order_no[]" class="edr-input">
                </td>

                <td class="border border-slate-300 px-2 py-2">
                    <input name="drawing_no[]" class="edr-input">
                </td>

                <td class="border border-slate-300 px-2 py-2">
                    <input name="project_no[]" class="edr-input">
                </td>

                <td class="border border-slate-300 px-2 py-2">
                    <input name="prod_jun[]" class="edr-input">
                </td>

                <td class="border border-slate-300 px-2 py-2">
                    <input name="item[]" class="edr-input">
                </td>

                <td class="border border-slate-300 px-2 py-2">
                    <input name="model[]" class="edr-input">
                </td>

                <td class="border border-slate-300 px-2 py-2">
                    <input name="qty[]" type="number" min="1" class="edr-input">
                </td>

                <td class="border border-slate-300 px-2 py-2">
                    <input name="problem_detail[]" class="edr-input">
                </td>

                <td class="border border-slate-300 px-2 py-2 text-center">
                    <button type="button"
                        class="btnDeleteRow rounded-full bg-red-500 px-3 py-2 text-xs font-extrabold text-white shadow hover:bg-red-600"
                        title="Delete">
                        🗑
                    </button>
                </td>
            </tr>
        `;
    }

    $('#btnAddRow').on('click', function (e) {
        e.preventDefault();
        $('#detailBody').append(buildRow());
        updateTotalRow();
    });

    $(document).on('click', '.btnDeleteRow', function (e) {
        e.preventDefault();
        $(this).closest('tr').remove();
        reorderRowNo();
        updateTotalRow();
    });

    $('#btnAddRow').trigger('click');

    $('#request_by, #repair_by').on('blur change', function () {
        const empno = $(this).val().trim();
        const target = this.id === 'request_by' ? '#request_by_name' : '#repair_by_name';

        if (!empno) {
            $(target).text('');
            return;
        }

        // TODO: เปลี่ยนเป็น API จริง
        // $.get(base_url + 'mfgform/MFG-EDR/main_edr/get_emp/' + empno, function(res) {
        //     $(target).text(res.empname || 'ไม่พบข้อมูล');
        // }, 'json');
    });
});
</script>
@endsection