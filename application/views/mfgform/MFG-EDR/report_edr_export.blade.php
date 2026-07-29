@extends('layouts/webflowTemplate')
@section('content')
<div id="edr-export-app" class="min-h-screen bg-slate-100 p-4">
    <div class="mx-auto w-full rounded-xl border border-slate-200 bg-white p-4 shadow-md">

        {{-- Header --}}
        <div class="mb-2 flex min-h-[68px] items-center justify-center bg-blue-200 px-4">
            <h1 class="text-2xl font-bold text-slate-950">
                E-Daily Report
            </h1>
        </div>

        {{-- Filter Form --}}
        <form id="form-edr-export" autocomplete="off">
            <div class="overflow-hidden border border-slate-200">
                <div class="grid grid-cols-1 xl:grid-cols-3">

                    {{-- Column 1 --}}
                    <div class="xl:border-r xl:border-slate-200">
                        <div class="grid grid-cols-[150px_1fr] border-b border-slate-200">
                            <label for="txt-request-by" class="flex items-center bg-blue-200 px-2 py-2 font-semibold text-slate-950">
                                Request By
                            </label>

                            <div class="p-1">
                                <input
                                    type="text"
                                    id="txt-request-by"
                                    name="request_by"
                                    placeholder="Ex.15199"
                                    maxlength="5"
                                    class="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                            </div>
                        </div>

                        <div class="grid grid-cols-[150px_1fr] border-b border-slate-200">
                            <label for="ddl-work-type" class="flex items-center bg-blue-200 px-2 py-2 font-semibold text-slate-950">
                                ประเภทของงาน
                            </label>

                            <div class="p-1">
                                <select
                                    id="ddl-work-type"
                                    name="work_type"
                                    class="w-full rounded border border-slate-300 bg-yellow-50 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                                    <option value="">--- Please select ---</option>
                                </select>
                            </div>
                        </div>

                        <div class="grid grid-cols-[150px_1fr] border-b border-slate-200">
                            <label for="txt-order-no" class="flex items-center bg-blue-200 px-2 py-2 font-semibold text-slate-950">
                                Order no
                            </label>

                            <div class="p-1">
                                <input
                                    type="text"
                                    id="txt-order-no"
                                    name="order_no"
                                    placeholder="Ex.EYEQ74052"
                                    class="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                            </div>
                        </div>
                    </div>

                    {{-- Column 2 --}}
                    <div class="xl:border-r xl:border-slate-200">
                        <div class="grid grid-cols-[150px_1fr] border-b border-slate-200">
                            <label for="txt-repair-by" class="flex items-center bg-blue-200 px-2 py-2 font-semibold text-slate-950">
                                Repair By
                            </label>

                            <div class="p-1">
                                <input
                                    type="text"
                                    id="txt-repair-by"
                                    name="repair_by"
                                    placeholder="Ex.15199"
                                    maxlength="5"
                                    class="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                            </div>
                        </div>

                        <div class="grid grid-cols-[150px_1fr] border-b border-slate-200">
                            <label for="ddl-initial-cause" class="flex items-center bg-blue-200 px-2 py-2 font-semibold text-slate-950">
                                สาเหตุ(เบื้องต้น)
                            </label>

                            <div class="p-1">
                                <select
                                    id="ddl-initial-cause"
                                    name="initial_cause"
                                    class="w-full rounded border border-slate-300 bg-yellow-50 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                                    <option value="">--- Please select ---</option>
                                </select>
                            </div>
                        </div>

                        <div class="grid grid-cols-[150px_1fr] border-b border-slate-200">
                            <label for="txt-drawing-no" class="flex items-center bg-blue-200 px-2 py-2 font-semibold text-slate-950">
                                Drawing no
                            </label>

                            <div class="p-1">
                                <input
                                    type="text"
                                    id="txt-drawing-no"
                                    name="drawing_no"
                                    placeholder="Ex.YA252C596-01"
                                    class="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                            </div>
                        </div>
                    </div>

                    {{-- Column 3 --}}
                    <div>
                        <div class="grid grid-cols-[150px_1fr] border-b border-slate-200">
                            <label for="txt-daily-report-no" class="flex items-center bg-blue-200 px-2 py-2 font-semibold text-slate-950">
                                Daily Report no
                            </label>

                            <div class="p-1">
                                <input
                                    type="text"
                                    id="txt-daily-report-no"
                                    name="daily_report_no"
                                    placeholder="Ex.EAS-AUG-24003"
                                    class="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                            </div>
                        </div>

                        <div class="grid grid-cols-[150px_1fr] border-b border-slate-200">
                            <label for="ddl-responsible-section" class="flex items-center bg-blue-200 px-2 py-2 font-semibold text-slate-950">
                                แผนกที่รับผิดชอบ
                            </label>

                            <div class="p-1">
                                <select
                                    id="ddl-responsible-section"
                                    name="responsible_section"
                                    class="w-full rounded border border-slate-300 bg-yellow-50 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                                    <option value="">--- Please select ---</option>
                                </select>
                            </div>
                        </div>

                        <div class="grid grid-cols-[150px_1fr] border-b border-slate-200">
                            <label for="txt-item-no" class="flex items-center bg-blue-200 px-2 py-2 font-semibold text-slate-950">
                                Item no
                            </label>

                            <div class="p-1">
                                <input
                                    type="text"
                                    id="txt-item-no"
                                    name="item_no"
                                    placeholder="Ex.375"
                                    class="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                            </div>
                        </div>
                    </div>
                </div>

                {{-- Bottom Filter Row --}}
                <div class="grid grid-cols-1 xl:grid-cols-[2fr_1fr]">
                    <div class="grid grid-cols-1 border-b border-slate-200 xl:grid-cols-[150px_1fr] xl:border-b-0 xl:border-r">
                        <label class="flex items-center bg-blue-200 px-2 py-2 font-semibold text-slate-950">
                            Request Date
                        </label>

                        <div class="grid grid-cols-1 gap-2 p-1 sm:grid-cols-[60px_1fr_40px_1fr] sm:items-center">
                            <label for="txt-request-date-from" class="px-2 font-semibold text-slate-900">
                                From
                            </label>

                            <input
                                type="date"
                                id="txt-request-date-from"
                                name="request_date_from"
                                class="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200">

                            <label for="txt-request-date-to" class="px-2 font-semibold text-slate-900">
                                To
                            </label>

                            <input
                                type="date"
                                id="txt-request-date-to"
                                name="request_date_to"
                                class="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                        </div>
                    </div>

                    <div class="grid grid-cols-[150px_1fr]">
                        <label for="ddl-form-status" class="flex items-center bg-blue-200 px-2 py-2 font-semibold text-slate-950">
                            Form Status
                        </label>

                        <div class="p-1">
                            <select
                                id="ddl-form-status"
                                name="form_status"
                                class="w-full rounded border border-slate-300 bg-yellow-50 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                                <option value="ALL">All</option>
                                <option value="WAITING">Waiting</option>
                                <option value="PROCESSING">Processing</option>
                                <option value="COMPLETE">Complete</option>
                                <option value="CANCEL">Cancel</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Action Buttons --}}
            <div class="flex flex-col items-center justify-center gap-3 py-6 sm:flex-row sm:gap-10">
                <button
                    type="submit"
                    id="btn-export-excel"
                    class="min-w-[140px] rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60">
                    Export Excel
                </button>

                <button
                    type="button"
                    id="btn-clear-filter"
                    class="min-w-[140px] rounded-full bg-amber-400 px-6 py-3 font-semibold text-slate-950 shadow-sm transition hover:bg-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-200">
                    Clear data
                </button>
            </div>
        </form>
    </div>
</div>
@endsection

